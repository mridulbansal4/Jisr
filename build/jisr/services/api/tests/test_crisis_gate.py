"""Unit tests for the deterministic Crisis Gate (step_rules stage 1 + crisis_lexicon)."""

from __future__ import annotations

import re

import pytest

from app import rules
from app.engines import crisis_gate
from app.engines.crisis_gate import evaluate, scan_text
from app.engines.normalise import fold_script, normalise
from app.evals_crisis import DEFAULT_BENCHMARK, run_benchmark


def _ids(text: str) -> set[str]:
    return {h.entry_id for h in scan_text(text)}


# ---------------------------------------------------------------- PHQ-9 item 9 (CG-01..03)
@pytest.mark.parametrize("item9", [2, 3])
def test_cg01_item9_two_or_more_is_red_high(item9: int) -> None:
    r = evaluate(phq9_started=True, phq9_item9=item9)
    assert r.red and r.severity == "high" and "CG-01" in r.fired_rules
    assert "PHQ9_ITEM9_POSITIVE" in r.reason_codes


def test_cg02_item9_one_is_red_same_day_check() -> None:
    r = evaluate(phq9_started=True, phq9_item9=1)
    assert r.red and r.severity == "same_day_check" and r.fired_rules == ["CG-02"]


def test_item9_zero_is_not_red() -> None:
    r = evaluate(phq9_started=True, phq9_item9=0)
    assert not r.red and r.severity is None and r.fired_rules == []


def test_cg03_item9_missing_after_phq9_started_is_red_review() -> None:
    r = evaluate(phq9_started=True, phq9_item9=None)
    assert r.red and r.severity == "review" and r.fired_rules == ["CG-03"]


def test_nothing_started_is_not_red() -> None:
    assert not evaluate().red


def test_free_text_raises_above_item9_severity() -> None:
    r = evaluate(phq9_started=True, phq9_item9=1, free_text="I've been saving up my pills")
    assert r.red and r.severity == "imminent"
    assert {"CG-02", "CG-06"} <= set(r.fired_rules)


# ---------------------------------------------------------------- fail closed
def test_fail_closed_forced_error() -> None:
    r = evaluate(_force_error=True)
    assert r.red and "CG-00" in r.fired_rules and "GATE_FAIL_CLOSED" in r.reason_codes


def test_fail_closed_when_scanner_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    def boom(_: str) -> list[crisis_gate.LexiconHit]:
        raise RuntimeError("lexicon unavailable")

    monkeypatch.setattr(crisis_gate, "scan_text", boom)
    r = evaluate(free_text="just a normal day")
    assert r.red and "CG-00" in r.fired_rules


# ---------------------------------------------------------------- lexicon hits
def test_imminent_text_is_cg06() -> None:
    r = evaluate(free_text="I wrote a goodbye note")
    assert r.red and r.severity == "imminent" and "CG-06" in r.fired_rules


def test_high_text_is_cg07() -> None:
    r = evaluate(free_text="I want to kill myself")
    assert r.red and r.severity == "high" and "CG-07" in r.fired_rules


def test_benign_text_not_red() -> None:
    r = evaluate(free_text="We played cards to kill time at the airport")
    assert not r.red and r.hits == []


def test_empty_text_not_red() -> None:
    assert not evaluate(free_text="   ").red
    assert scan_text("") == []


@pytest.mark.parametrize("text", ["I would never kill myself", "I'm not going to end it all"])
def test_negation_does_not_suppress(text: str) -> None:
    assert evaluate(free_text=text).red


# ---------------------------------------------------------------- guards
def test_guard_suppresses_guardable_entry() -> None:
    # EN-002 is guardable; GRD-EN-03 covers "want to die laughing".
    assert "EN-002" in _ids("I want to die")
    assert "EN-002" not in _ids("this clip is so funny I want to die laughing")
    # AR-002 is guardable; GRD-AR-01 covers the whole "ابي اموت من الضحك" span.
    assert "AR-002" in _ids("ابي اموت")
    assert _ids("ابي اموت من الضحك") == set()
    # AR-008 guarded by GRD-AR-02 (studying hyperbole).
    assert _ids("بقتل نفسي من الدراسة") == set()
    assert "AR-008" in _ids("بقتل نفسي")


def test_guard_never_suppresses_imminent_entry(monkeypatch: pytest.MonkeyPatch) -> None:
    lex = rules.lexicon()
    imminent = [e for e in lex["entries"] if e["severity"] == "imminent"]
    assert imminent and all(not e["guardable"] for e in imminent)
    # Even if an imminent entry were wrongly marked guardable and a guard covered it, scan_text keeps the hit.
    entry = {**next(e for e in lex["entries"] if e["id"] == "EN-007"), "guardable": True}
    patched = crisis_gate._Compiled(
        entries=[(entry, re.compile(entry["pattern"]))], guards=[re.compile(r"saving\s+up\s+pills.*")]
    )
    monkeypatch.setattr(crisis_gate, "_compiled", lambda: patched)
    assert [h.entry_id for h in scan_text("saving up pills for later")] == ["EN-007"]
    # Control: the same setup with a non-imminent severity IS suppressed.
    entry_high = {**entry, "severity": "high"}
    patched_high = crisis_gate._Compiled(entries=[(entry_high, re.compile(entry["pattern"]))],
                                         guards=patched.guards)
    monkeypatch.setattr(crisis_gate, "_compiled", lambda: patched_high)
    assert scan_text("saving up pills for later") == []


def test_guard_must_cover_span() -> None:
    # Guard text present elsewhere does not suppress an unrelated hit.
    assert "EN-013" in _ids("I feel suicidal after the suicide prevention day talk")


# ---------------------------------------------------------------- normalisation
def test_arabic_letter_folding() -> None:
    assert normalise("أ إ آ ٱ") == "ا ا ا ا"
    assert normalise("رسالة") == "رساله"
    assert normalise("على") == "علي"
    assert normalise("مسؤول") == "مسوول"
    assert normalise("فائدة") == "فايده"


def test_urdu_folding() -> None:
    assert normalise("خودکشی") == "خودكشي"
    assert normalise("چاہتا") == normalise("چاھتا") == "چاهتا"
    assert normalise("۱۲٣") == "123"


def test_diacritics_and_tatweel_stripped() -> None:
    assert normalise("أَمُوتُ") == "اموت"
    assert normalise("انـــتحار") == "انتحار"
    assert evaluate(free_text="أُرِيدُ أَنْ أَمُوتَ").red


def test_repeated_letters_collapsed_to_two() -> None:
    assert normalise("diiiiie") == "diie"
    assert normalise("ابيييي") == "ابيي"
    assert evaluate(free_text="i want to diiiie").red
    assert evaluate(free_text="أبييييي أمووووت").red
    assert evaluate(free_text="abiiiii amoooooot").red


def test_zero_width_characters_stripped() -> None:
    assert normalise("su​icidal") == "suicidal"
    assert evaluate(free_text="خود‌کشی").red


def test_punctuation_case_whitespace() -> None:
    assert normalise("  I  WANT…to   DIE!! ") == "i want to die"
    assert normalise("don’t") == "don't"


def test_fold_script_is_idempotent_on_patterns() -> None:
    for e in rules.lexicon()["entries"]:
        assert fold_script(fold_script(e["pattern"])) == fold_script(e["pattern"])


def test_mixed_script() -> None:
    assert "AR-001" in _ids("ana abi انتحر")


# ---------------------------------------------------------------- lexicon hygiene
def test_lexicon_ids_unique_and_compile() -> None:
    lex = rules.lexicon()
    ids = [e["id"] for e in lex["entries"]] + [g["id"] for g in lex["false_positive_guards"]]
    assert len(ids) == len(set(ids))
    for e in lex["entries"]:
        re.compile(fold_script(e["pattern"]))
        assert e["severity"] in {"imminent", "high", "moderate"}
    assert "DRAFT" in lex["status"]


# ---------------------------------------------------------------- benchmark
def test_benchmark_recall_is_100_percent() -> None:
    res = run_benchmark(DEFAULT_BENCHMARK)
    assert res["n"] >= 150
    assert res["false_negatives"] == [], [f["id"] for f in res["false_negatives"]]
    assert res["recall"] == 1.0
    assert res["rules_version"].endswith(rules.lexicon()["version"])
    assert res["latency_p95_ms"] < rules.lexicon()["matching_policy"]["latency_budget_ms"]
