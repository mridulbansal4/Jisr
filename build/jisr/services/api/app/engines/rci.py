"""Reliable Change Index (step_rules.v1.json stage_6). Suggestions only."""

from __future__ import annotations

from app import rules


def thresholds() -> dict[str, int]:
    t = rules.step_rules()["stage_6_rci"]["thresholds"]
    return {"PHQ9": int(t["PHQ-9"]), "GAD7": int(t["GAD-7"])}


def classify(instrument: str, baseline: int, current: int) -> str:
    th = thresholds()[instrument]
    if current - baseline >= th:
        return "reliable_deterioration"
    if baseline - current >= th:
        return "reliable_improvement"
    return "no_reliable_change"


def overall(per_instrument: dict[str, str]) -> str | None:
    """improved | no_reliable_change | deteriorated (raise-only: any deterioration wins)."""
    if not per_instrument:
        return None
    vals = set(per_instrument.values())
    if "reliable_deterioration" in vals:
        return "deteriorated"
    if "reliable_improvement" in vals:
        return "improved"
    return "no_reliable_change"
