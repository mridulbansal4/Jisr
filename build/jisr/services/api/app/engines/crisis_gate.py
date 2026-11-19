"""Crisis Gate (step_rules.v1.json stage_1, crisis_lexicon.v1.json). Deterministic, raise-only, fail-closed.

Nothing in this module can clear RED. Any exception while evaluating returns RED (CG-00).
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any

from app import rules
from app.engines.normalise import fold_script, normalise

CRISIS_LINES = [
    {"name": "Emergency", "number": "999", "tel": "tel:999"},
    {"name": "800-SAKINA (Abu Dhabi)", "number": "800 725462", "tel": "tel:800725462"},
    {"name": "800-HOPE (national)", "number": "800 4673", "tel": "tel:8004673"},
]

_SEVERITY_RANK = {"review": 1, "same_day_check": 2, "high": 3, "imminent": 4}


@dataclass
class LexiconHit:
    entry_id: str
    category: str
    severity: str
    span: tuple[int, int]


@dataclass
class GateResult:
    red: bool
    severity: str | None = None  # imminent | high | same_day_check | review
    fired_rules: list[str] = field(default_factory=list)
    reason_codes: list[str] = field(default_factory=list)
    hits: list[LexiconHit] = field(default_factory=list)
    latency_ms: int = 0

    def raise_to(self, rule_id: str, severity: str, reason: str) -> None:
        self.red = True
        self.fired_rules.append(rule_id)
        self.reason_codes.append(reason)
        if self.severity is None or _SEVERITY_RANK[severity] > _SEVERITY_RANK[self.severity]:
            self.severity = severity


@dataclass(frozen=True)
class _Compiled:
    entries: list[tuple[dict[str, Any], re.Pattern[str]]]
    guards: list[re.Pattern[str]]


@lru_cache(maxsize=1)
def _compiled() -> _Compiled:
    lex = rules.lexicon()
    entries = [(e, re.compile(fold_script(e["pattern"]))) for e in lex["entries"]]
    guards = [re.compile(fold_script(g["pattern"])) for g in lex["false_positive_guards"]]
    return _Compiled(entries, guards)


def scan_text(text: str) -> list[LexiconHit]:
    """Return every lexicon hit after guard suppression. Raises on internal failure (caller fails closed)."""
    if not text or not text.strip():
        return []
    norm = normalise(text)
    comp = _compiled()
    guard_spans = [m.span() for g in comp.guards for m in g.finditer(norm)]
    hits: list[LexiconHit] = []
    for entry, pattern in comp.entries:
        for m in pattern.finditer(norm):
            s, e = m.span()
            if s == e:
                continue
            guardable = bool(entry.get("guardable")) and entry["severity"] != "imminent"
            if guardable and any(gs <= s and e <= ge for gs, ge in guard_spans):
                continue
            hits.append(LexiconHit(entry["id"], entry["category"], entry["severity"], (s, e)))
    return hits


def evaluate(
    *,
    phq9_started: bool = False,
    phq9_item9: int | None = None,
    free_text: str | None = None,
    cssrs: dict[str, bool | None] | None = None,
    cssrs_enabled: bool = False,
    help_button: bool = False,
    _force_error: bool = False,
) -> GateResult:
    """Run stage 1. Fail-closed: any exception -> RED with CG-00."""
    t0 = time.perf_counter()
    result = GateResult(red=False)
    try:
        if _force_error:
            raise RuntimeError("forced gate error (test hook)")
        if help_button:
            result.raise_to("CG-HB", "high", "HELP_BUTTON")
        if phq9_item9 is not None:
            if phq9_item9 >= 2:
                result.raise_to("CG-01", "high", "PHQ9_ITEM9_POSITIVE")
            elif phq9_item9 == 1:
                result.raise_to("CG-02", "same_day_check", "PHQ9_ITEM9_SEVERAL_DAYS")
        elif phq9_started:
            result.raise_to("CG-03", "review", "PHQ9_ITEM9_UNKNOWN")
        if cssrs_enabled and cssrs:
            if cssrs.get("q4") or cssrs.get("q5") or cssrs.get("q6_recent_3m"):
                result.raise_to("CG-04", "imminent", "CSSRS_HIGH")
            elif cssrs.get("q1") or cssrs.get("q2") or cssrs.get("q3"):
                result.raise_to("CG-05", "high", "CSSRS_POSITIVE")
        if free_text:
            hits = scan_text(free_text)
            result.hits = hits
            if any(h.severity == "imminent" for h in hits):
                result.raise_to("CG-06", "imminent", "LEXICON_IMMINENT")
            elif hits:
                result.raise_to("CG-07", "high", "LEXICON_HIT")
    except Exception:  # noqa: BLE001, fail closed by design
        result.raise_to("CG-00", "review", "GATE_FAIL_CLOSED")
    result.latency_ms = int((time.perf_counter() - t0) * 1000)
    return result


def crisis_lines_for(severity: str | None) -> list[dict[str, str]]:
    """999 first only when severity is imminent; otherwise the helplines first, 999 last."""
    if severity == "imminent":
        return list(CRISIS_LINES)
    return [CRISIS_LINES[1], CRISIS_LINES[2], CRISIS_LINES[0]]
