"""Claim validator (M-03): blocks numbers, phone numbers and banned claims not supported by input facts."""

from __future__ import annotations

import re
from typing import Any

_NUM = re.compile(r"(?<![\w.])\d+(?:\.\d+)?")
BANNED = [
    (re.compile(r"\bdiagnos(e|ed|is|ing)\b", re.I), "diagnosis claim"),
    (
        re.compile(r"\byou (have|are suffering from) (depression|anxiety|a disorder)\b", re.I),
        "diagnosis claim",
    ),
    (re.compile(r"\b(cure|cured|guarantee[ds]?)\b", re.I), "outcome guarantee"),
    (re.compile(r"\b(medication|dose|prescri\w+)\b", re.I), "medication advice"),
    (re.compile(r"\bemployer (will|can) (see|know)\b", re.I), "employer disclosure claim"),
    (re.compile(r"\byou (are|are not|aren't) (safe|at risk)\b", re.I), "risk clearance"),
]


_DISCLAIMER = re.compile(
    r"\b(is|are|does|do|was)?\s*(not|n't|never)\s+(be\s+|mean\s+|give\s+|make\s+|provide\s+)?(an?\s+|any\s+)?"
    r"(medical\s+|clinical\s+)?diagnos(is|e|es)\b|\bno\s+diagnosis\b|\bnot\s+diagnos(e|ing)\b",
    re.I,
)


def numbers_in(text: str) -> set[str]:
    out = set()
    for m in _NUM.findall(text):
        out.add(m.lstrip("0") or "0")
    return out


def facts_text(facts: Any) -> str:
    if isinstance(facts, dict):
        return " ".join(f"{k} {facts_text(v)}" for k, v in facts.items())
    if isinstance(facts, list):
        return " ".join(facts_text(v) for v in facts)
    return str(facts)


def check(text: str, facts: Any, allow_numbers: set[str] | None = None) -> list[str]:
    """Return findings (empty = pass)."""
    findings: list[str] = []
    allowed = numbers_in(facts_text(facts)) | (allow_numbers or set())
    for n in numbers_in(text):
        if n not in allowed:
            findings.append(f"unsupported number '{n}'")
    scrubbed = _DISCLAIMER.sub(" ", text)  # "this is not a diagnosis" is the required disclaimer, not a claim
    for pat, label in BANNED:
        if pat.search(scrubbed):
            findings.append(f"banned claim: {label}")
    return findings
