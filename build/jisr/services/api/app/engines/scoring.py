"""Deterministic PHQ-2/9 and GAD-2/7 scoring (instruments.v1.json). No AI touches scoring."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app import rules

# API link ids (openapi ScreeningItem.link_id) <-> rule-file item ids
PHQ9_LINKS = [f"PHQ9_{i}" for i in range(1, 10)]
PHQ9_DIFFICULTY = "PHQ9_10"
GAD7_LINKS = [f"GAD7_{i}" for i in range(1, 8)]
ALL_LINKS = [*PHQ9_LINKS, PHQ9_DIFFICULTY, *GAD7_LINKS]


class InvalidAnswer(ValueError):
    """Raised for out-of-range or unknown answers (HTTP 422, never coerced)."""


def link_to_item_id(link_id: str) -> str:
    inst, _, num = link_id.partition("_")
    if inst == "PHQ9":
        return f"phq_{num}"
    if inst == "GAD7":
        return f"gad_{num}"
    raise InvalidAnswer(f"unknown item {link_id}")


def validate_answers(answers: dict[str, Any]) -> dict[str, int]:
    out: dict[str, int] = {}
    for link, value in answers.items():
        if link not in ALL_LINKS:
            raise InvalidAnswer(f"unknown item {link}")
        if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value <= 3:
            raise InvalidAnswer(f"{link} must be an integer 0-3")
        out[link] = value
    return out


@dataclass
class Score:
    instrument: str  # PHQ2 | PHQ9 | GAD2 | GAD7
    total: int | None
    band: str | None
    status: str  # COMPLETE | PRORATED | INCOMPLETE | CRISIS_ITEM_UNKNOWN | NOT_STARTED
    item9: int | None = None
    difficulty: int | None = None
    flags: list[str] = field(default_factory=list)


def _band(instrument_id: str, total: int) -> str:
    for inst in rules.instruments()["instruments"]:
        if inst["id"] == instrument_id:
            for b in inst["bands"]:
                if b["min"] <= total <= b["max"]:
                    return str(b["band"])
    raise InvalidAnswer(f"total {total} out of range for {instrument_id}")


def _sum_prorated(values: list[int | None], n_items: int) -> tuple[int | None, str, list[str]]:
    answered = [v for v in values if v is not None]
    missing = n_items - len(answered)
    if missing == 0:
        return sum(answered), "COMPLETE", []
    if missing == 1:
        return round(sum(answered) * n_items / (n_items - 1)), "PRORATED", ["prorated"]
    if not answered:
        return None, "NOT_STARTED", []
    return None, "INCOMPLETE", ["too_many_missing"]


def score_phq9(answers: dict[str, int]) -> Score:
    vals: list[int | None] = [answers.get(link) for link in PHQ9_LINKS]
    item9 = vals[8]
    difficulty = answers.get(PHQ9_DIFFICULTY)
    if all(v is None for v in vals):
        return Score("PHQ9", None, None, "NOT_STARTED", difficulty=difficulty)
    if item9 is None:
        # Missing item 9 is never treated as 0 (CG-03).
        return Score("PHQ9", None, None, "CRISIS_ITEM_UNKNOWN", None, difficulty, ["crisis_item_unknown"])
    total, status, flags = _sum_prorated(vals[:8], 8)
    if total is None:
        return Score("PHQ9", None, None, "INCOMPLETE", item9, difficulty, flags)
    total += item9
    return Score("PHQ9", total, _band("PHQ-9", total), status, item9, difficulty, flags)


def score_gad7(answers: dict[str, int]) -> Score:
    vals: list[int | None] = [answers.get(link) for link in GAD7_LINKS]
    total, status, flags = _sum_prorated(vals, 7)
    if total is None:
        return Score("GAD7", None, None, status, flags=flags)
    return Score("GAD7", total, _band("GAD-7", total), status, flags=flags)


def score_prescreen(answers: dict[str, int]) -> tuple[Score, Score]:
    p1, p2 = answers.get("PHQ9_1"), answers.get("PHQ9_2")
    g1, g2 = answers.get("GAD7_1"), answers.get("GAD7_2")
    phq2 = (
        Score("PHQ2", p1 + p2, _band("PHQ-2", p1 + p2), "COMPLETE")
        if p1 is not None and p2 is not None
        else Score("PHQ2", None, None, "INCOMPLETE")
    )
    gad2 = (
        Score("GAD2", g1 + g2, _band("GAD-2", g1 + g2), "COMPLETE")
        if g1 is not None and g2 is not None
        else Score("GAD2", None, None, "INCOMPLETE")
    )
    return phq2, gad2


def prescreen_positive(phq2: Score, gad2: Score) -> bool:
    return (phq2.total or 0) >= 3 or (gad2.total or 0) >= 3


def items_for(links: list[str]) -> list[dict[str, Any]]:
    """Screening items (English text from the free-to-use screeners) for the given link ids."""
    data = rules.instruments()
    by_id: dict[str, dict[str, Any]] = {}
    phq9 = next(i for i in data["instruments"] if i["id"] == "PHQ-9")
    gad7 = next(i for i in data["instruments"] if i["id"] == "GAD-7")
    for it in phq9["items"]:
        by_id[it["id"]] = {**it, "_inst": "PHQ9", "_scale": "frequency_2w"}
    by_id["phq_10"] = {**phq9["difficulty_item"], "_inst": "PHQ9", "_scale": "difficulty"}
    for it in gad7["items"]:
        by_id[it["id"]] = {**it, "_inst": "GAD7", "_scale": "frequency_2w"}
    out = []
    for link in links:
        it = by_id[link_to_item_id(link)]
        scale = data["response_scales"][it["_scale"]]["options"]
        out.append(
            {
                "link_id": link,
                "instrument": it["_inst"],
                "text": it["en"],
                "options": [o["value"] for o in scale],
                "option_labels": [o["en"] for o in scale],
                "stem": (phq9 if it["_inst"] == "PHQ9" else gad7)["stem"]["en"],
                "crisis_item": bool(it.get("crisis_item", False)),
            }
        )
    return out
