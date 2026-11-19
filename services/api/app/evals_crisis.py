"""Crisis-benchmark runner (Dataset A, deterministic gate only, no LLM).

Used by ``ai/evals/run_evals.py`` and importable by the API (``GET/POST /v1/evals/crisis``).
The benchmark is synthetic and team-written; numbers are NOT clinical validation.
"""

from __future__ import annotations

import hashlib
import json
import math
import time
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app import rules
from app.engines import crisis_gate

REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_BENCHMARK = REPO_ROOT / "data" / "synthetic" / "crisis_benchmark.v1.jsonl"
CAVEAT = (
    "Synthetic, team-written benchmark (dev split authored alongside the lexicon). Not clinically validated; "
    "native-speaker clinical review of cases and lexicon is pending. Do not cite as clinical performance."
)
_SEV_RANK = {"moderate": 1, "high": 2, "imminent": 3}
LANG_ORDER = ["en", "ar", "ar-latn", "ur", "ur-latn"]


def load_cases(path: str | Path) -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            if not line.strip():
                continue
            case = json.loads(line)
            if case.get("deprecated"):
                continue
            for key in ("id", "lang", "text", "expected", "category"):
                if key not in case:
                    raise ValueError(f"{path}:{lineno}: missing '{key}'")
            if case["expected"] not in ("RED", "NOT_RED"):
                raise ValueError(f"{path}:{lineno}: expected must be RED or NOT_RED")
            cases.append(case)
    return cases


def _ratio(num: int, den: int) -> float | None:
    return round(num / den, 4) if den else None


def _p95(values: list[float]) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = max(0, math.ceil(0.95 * len(s)) - 1)  # nearest-rank
    return round(s[k], 3)


def _wilson_lower(successes: int, n: int, z: float = 1.96) -> float | None:
    if n == 0:
        return None
    p = successes / n
    denom = 1 + z * z / n
    centre = p + z * z / (2 * n)
    margin = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return round((centre - margin) / denom, 4)


def _max_lexicon_severity(hits: list[crisis_gate.LexiconHit]) -> str | None:
    sev = [h.severity for h in hits if h.severity in _SEV_RANK]
    return max(sev, key=_SEV_RANK.__getitem__) if sev else None


def run_benchmark(path: str | Path | None = None) -> dict[str, Any]:
    """Run each case through ``crisis_gate.evaluate(free_text=...)``; return the API-shaped result dict."""
    bench_path = Path(path) if path else DEFAULT_BENCHMARK
    cases = load_cases(bench_path)
    lex = rules.lexicon()

    tp = fp = fn = tn = 0
    sev_match = sev_total = 0
    latencies: list[float] = []
    false_negatives: list[dict[str, Any]] = []
    false_positives: list[dict[str, Any]] = []
    per_lang: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    per_cat: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for case in cases:
        t0 = time.perf_counter()
        result = crisis_gate.evaluate(free_text=case["text"])
        latencies.append((time.perf_counter() - t0) * 1000)
        predicted_red = result.red
        expected_red = case["expected"] == "RED"
        lang_stats, cat_stats = per_lang[case["lang"]], per_cat[case["category"]]
        lang_stats["n"] += 1
        cat_stats["n"] += 1
        entry_ids = sorted({h.entry_id for h in result.hits})
        if expected_red:
            lang_stats["positives"] += 1
            if predicted_red:
                tp += 1
                lang_stats["tp"] += 1
                cat_stats["correct"] += 1
                if case.get("severity_expected"):
                    sev_total += 1
                    if _max_lexicon_severity(result.hits) == case["severity_expected"]:
                        sev_match += 1
            else:
                fn += 1
                lang_stats["fn"] += 1
                false_negatives.append(
                    {
                        "id": case["id"], "lang": case["lang"], "category": case["category"],
                        "text": case["text"],
                    }
                )
        else:
            lang_stats["negatives"] += 1
            if predicted_red:
                fp += 1
                lang_stats["fp"] += 1
                false_positives.append(
                    {
                        "id": case["id"], "lang": case["lang"], "category": case["category"],
                        "text": case["text"], "fired_rules": result.fired_rules, "entry_ids": entry_ids,
                    }
                )
            else:
                tn += 1
                cat_stats["correct"] += 1

    langs = [lg for lg in LANG_ORDER if lg in per_lang] + sorted(set(per_lang) - set(LANG_ORDER))
    by_language = [
        {
            "lang": lg,
            "n": per_lang[lg]["n"],
            "positives": per_lang[lg]["positives"],
            "negatives": per_lang[lg]["negatives"],
            "recall": _ratio(per_lang[lg]["tp"], per_lang[lg]["tp"] + per_lang[lg]["fn"]),
            "precision": _ratio(per_lang[lg]["tp"], per_lang[lg]["tp"] + per_lang[lg]["fp"]),
            "false_negatives": per_lang[lg]["fn"],
            "false_positives": per_lang[lg]["fp"],
        }
        for lg in langs
    ]
    by_category = [
        {"category": c, "n": per_cat[c]["n"], "correct": per_cat[c]["correct"]} for c in sorted(per_cat)
    ]

    return {
        "ran_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "n": len(cases),
        "positives": tp + fn,
        "negatives": fp + tn,
        "recall": _ratio(tp, tp + fn),
        "recall_wilson95_lower": _wilson_lower(tp, tp + fn),
        "precision": _ratio(tp, tp + fp),
        "confusion": {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
        "false_negatives": false_negatives,
        "false_positives": false_positives,
        "latency_p95_ms": _p95(latencies),
        "latency_max_ms": round(max(latencies), 3) if latencies else 0.0,
        "latency_budget_ms": lex.get("matching_policy", {}).get("latency_budget_ms"),
        "by_language": by_language,
        "by_category": by_category,
        "severity_agreement": {"matched": sev_match, "of": sev_total, "rate": _ratio(sev_match, sev_total)},
        "rules_version": f"{lex.get('id', 'crisis_lexicon')}@{lex['version']}",
        "rules_status": lex.get("status", ""),
        "suite": "crisis",  # read by the independent CI check in .github/workflows/evals.yml
        "mode": "deterministic (lexicon + normaliser only, no LLM)",
        "dataset": {
            "path": bench_path.relative_to(REPO_ROOT).as_posix() if bench_path.is_relative_to(REPO_ROOT)
            else str(bench_path),
            "sha256": hashlib.sha256(bench_path.read_bytes()).hexdigest(),
        },
        "caveat": CAVEAT,
    }


def _pct(v: float | None) -> str:
    return "n/a" if v is None else f"{v * 100:.1f}%"


def render_markdown(res: dict[str, Any]) -> str:
    """Render EVAL.md. Lists case ids only (free text never goes into reports or logs)."""
    c = res["confusion"]
    passed = res["recall"] == 1.0
    lines = [
        "# EVAL, Jisr Crisis Gate benchmark",
        "",
        f"> **Caveat:** {res['caveat']}",
        "",
        f"- **Run at (UTC):** {res['ran_at']}",
        f"- **Rules version:** `{res['rules_version']}`, status: {res['rules_status'].split('.')[0].replace(' ' + chr(0x2014) + ' ', ', ').replace(chr(0x2014), ', ').replace(chr(0x2013), ', ')}",
        f"- **Mode:** {res['mode']}",
        f"- **Dataset:** `{res['dataset']['path']}` (sha256 `{res['dataset']['sha256'][:12]}…`)",
        f"- **Gate (recall = 100%):** {'PASS' if passed else 'FAIL'}",
        "",
        "## Headline",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| Cases | {res['n']} ({res['positives']} expected RED, {res['negatives']} expected NOT_RED) |",
        f"| Recall | {_pct(res['recall'])} ({c['tp']}/{res['positives']}) |",
        f"| Recall, Wilson 95% lower bound | {_pct(res['recall_wilson95_lower'])} |",
        f"| Precision | {_pct(res['precision'])} ({c['tp']}/{c['tp'] + c['fp']}) |",
        f"| TP / FP / FN / TN | {c['tp']} / {c['fp']} / {c['fn']} / {c['tn']} |",
        f"| Latency p95 (in-process, per utterance) | {res['latency_p95_ms']} ms "
        f"(max {res['latency_max_ms']} ms; budget {res['latency_budget_ms']} ms) |",
        f"| Lexicon severity agreement on caught positives (informational) | "
        f"{res['severity_agreement']['matched']}/{res['severity_agreement']['of']} |",
        "",
        "## By language",
        "",
        "| Language | n | Expected RED | Expected NOT_RED | Recall | Precision | FN | FP |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in res["by_language"]:
        lines.append(
            f"| {r['lang']} | {r['n']} | {r['positives']} | {r['negatives']} | {_pct(r['recall'])} | "
            f"{_pct(r['precision'])} | {r['false_negatives']} | {r['false_positives']} |"
        )
    lines += ["", "## By category", "", "| Category | n | Correct |", "|---|---|---|"]
    for r in res["by_category"]:
        lines.append(f"| {r['category']} | {r['n']} | {r['correct']} |")
    lines += ["", "## False negatives (missed expected-RED)", ""]
    if res["false_negatives"]:
        lines += ["| Case | Lang | Category |", "|---|---|---|"]
        lines += [f"| {f['id']} | {f['lang']} | {f['category']} |" for f in res["false_negatives"]]
    else:
        lines.append("None.")
    lines += ["", "## False positives (expected NOT_RED, gate fired)", ""]
    if res["false_positives"]:
        lines += ["| Case | Lang | Category | Entries |", "|---|---|---|---|"]
        lines += [
            f"| {f['id']} | {f['lang']} | {f['category']} | {', '.join(f['entry_ids'])} |"
            for f in res["false_positives"]
        ]
    else:
        lines.append("None.")
    lines += [
        "",
        "## Limitations",
        "",
        "- Every utterance is synthetic and was written by the team; Arabic, Arabizi and Urdu items await "
        "native-speaker clinical review (R-04). Labels mean \"a clinician would want crisis information "
        "shown\", not a diagnosis.",
        "- This is the dev split, written alongside lexicon v1.1.0, so recall/precision here are optimistic. "
        "A held-out set written by someone who has not seen the lexicon is still needed.",
        "- Policy choices that inflate RED on purpose: negations, third-person reports and "
        "quoted/lyrics-style lines with self-reference are expected RED (recall first).",
        f"- n = {res['positives']} positives: 100% observed recall still has a 95% lower bound of "
        f"{_pct(res['recall_wilson95_lower'])}.",
        "- Only the deterministic gate is measured. PHQ-9 item 9 / fail-closed paths are covered by unit "
        "tests (`services/api/tests/test_crisis_gate.py`); M-02 and the other suites are not in this report.",
        "",
        "Regenerate: `cd ai/evals && uv run --project ../../services/api python run_evals.py`",
        "",
    ]
    return "\n".join(lines)
