"""Step Matcher (step_rules.v1.json stages 3-5 and 7). Output is always a SUGGESTION for a clinician."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app import rules

LEVELS = ["L0", "L1", "L2", "L3", "L4"]


def _max_level(a: str, b: str) -> str:
    return a if LEVELS.index(a) >= LEVELS.index(b) else b


@dataclass
class StepInput:
    phq9_total: int | None = None
    phq9_item9: int | None = None
    phq9_difficulty: int | None = None
    gad7_total: int | None = None
    self_referral: bool = False
    comorbidity_flag: bool = False
    complexity_flags: list[str] = field(default_factory=list)
    clinician_review_flags: list[str] = field(default_factory=list)
    previous_step: str | None = None
    rci_status: str | None = None
    wants_human_support: bool = False
    crisis: bool = False


@dataclass
class StepResult:
    state: str  # RED | NO_EPISODE | SUGGESTED
    level: str | None
    fired_rules: list[str] = field(default_factory=list)
    factors: list[dict[str, str]] = field(default_factory=list)
    requires_clinician_confirmation: bool = True


def _level_from(table: list[dict[str, Any]], total: int) -> tuple[str, str]:
    for row in table:
        if row["min"] <= total <= row["max"]:
            return str(row["level"]), str(row["band"])
    raise ValueError(f"total {total} out of range")


def should_open_episode(inp: StepInput) -> tuple[bool, str]:
    if inp.crisis:
        return True, "EO-01"
    if (inp.phq9_total or 0) >= 10 or (inp.gad7_total or 0) >= 10 or (inp.phq9_item9 or 0) > 0:
        return True, "EO-02"
    if inp.self_referral:
        return True, "EO-03"
    return False, "EO-04"


def match(inp: StepInput) -> StepResult:
    sr = rules.step_rules()
    if inp.crisis:
        return StepResult(
            "RED",
            "RED",
            ["EO-01"],
            [
                {
                    "factor": "crisis",
                    "value": "Crisis Gate fired",
                    "effect": "RED: human contact within 15 min",
                    "rule_id": "EO-01",
                }
            ],
        )
    opened, eo_rule = should_open_episode(inp)
    if not opened:
        return StepResult("NO_EPISODE", None, [eo_rule], [])

    fired = [eo_rule]
    factors: list[dict[str, str]] = []
    sev = sr["stage_4_severity"]
    level = "L0"
    if inp.phq9_total is not None:
        lvl, band = _level_from(sev["phq9_to_level"], inp.phq9_total)
        factors.append(
            {
                "factor": "severity",
                "value": f"PHQ-9 {inp.phq9_total} ({band.replace('_', ' ')})",
                "effect": f"suggests {lvl}",
                "rule_id": "SEV-PHQ9",
            }
        )
        level = _max_level(level, lvl)
    if inp.gad7_total is not None:
        lvl, band = _level_from(sev["gad7_to_level"], inp.gad7_total)
        factors.append(
            {
                "factor": "severity",
                "value": f"GAD-7 {inp.gad7_total} ({band})",
                "effect": f"suggests {lvl}",
                "rule_id": "SEV-GAD7",
            }
        )
        level = _max_level(level, lvl)
    fired.append("SEV-MAX")

    # Stage 5 modifiers (raise-only)
    if level == "L1" and (inp.phq9_difficulty or 0) >= 2:
        level = "L2"
        fired.append("SM-01")
        factors.append(
            {
                "factor": "functional_impairment",
                "value": "daily life very difficult",
                "effect": "L1 → L2",
                "rule_id": "SM-01",
            }
        )
    if level == "L1" and inp.comorbidity_flag:
        level = "L2"
        fired.append("SM-02")
        factors.append(
            {
                "factor": "comorbidity",
                "value": "physical health condition (consented)",
                "effect": "L1 → L2",
                "rule_id": "SM-02",
            }
        )
    complexity = list(inp.complexity_flags)
    if inp.phq9_difficulty == 3:
        complexity.append("functional_impairment_extreme")
    if (inp.gad7_total or 0) >= 15 and complexity:
        level = "L4"
        fired.append("SM-03")
        factors.append(
            {
                "factor": "severity",
                "value": "severe anxiety with complexity",
                "effect": "→ L4",
                "rule_id": "SM-03",
            }
        )
    if inp.previous_step == "L2" and inp.rci_status in ("no_reliable_change", "deteriorated"):
        level = _max_level(level, "L3")
        fired.append("SM-04")
        factors.append(
            {
                "factor": "rci",
                "value": inp.rci_status.replace("_", " "),
                "effect": "step up to L3 suggested",
                "rule_id": "SM-04",
            }
        )
    if inp.previous_step == "L3" and inp.rci_status in ("no_reliable_change", "deteriorated"):
        level = "L4"
        fired.append("SM-05")
        factors.append(
            {
                "factor": "rci",
                "value": inp.rci_status.replace("_", " "),
                "effect": "step up to L4 suggested",
                "rule_id": "SM-05",
            }
        )
    if level == "L0" and inp.wants_human_support:
        level = "L1"
        fired.append("SM-06")
        factors.append(
            {"factor": "preference", "value": "wants human support", "effect": "L0 → L1", "rule_id": "SM-06"}
        )
    for flag in inp.clinician_review_flags:
        fired.append("SM-07")
        factors.append(
            {
                "factor": "preference",
                "value": flag.replace("_", " "),
                "effect": "clinician review recommended",
                "rule_id": "SM-07",
            }
        )
    return StepResult("SUGGESTED", level, fired, factors)


@dataclass
class Prefs:
    language: str = "en"
    clinician_gender: str = "none"
    modality: list[str] = field(default_factory=list)
    area: str | None = None
    insurance_plan: str | None = None


def rank_providers(
    level: str, prefs: Prefs, providers: list[dict[str, Any]], exclude: set[str] | None = None
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Hard filters then weighted score (stage_7). Returns (ranked providers with score, factor list)."""
    sr = rules.step_rules()["stage_7_preference_matching"]
    w = sr["score_weights"]
    exclude = exclude or set()
    eligible = [
        p for p in providers if level in p["steps_served"] and p["accepting"] and p["id"] not in exclude
    ]
    in_net = [p for p in eligible if not prefs.insurance_plan or prefs.insurance_plan in p["networks"]]
    pool = in_net or eligible
    ranked = []
    for p in pool:
        lang = 1.0 if prefs.language in p["languages"] else 0.0
        gender = (
            1.0
            if prefs.clinician_gender in ("none", None) or p["clinician_gender"] == prefs.clinician_gender
            else 0.0
        )
        modality = 1.0 if not prefs.modality or set(prefs.modality) & set(p["modalities"]) else 0.0
        wait = max(0.0, 1 - p["current_wait_days"] / 14)
        area = 1.0 if not prefs.area or p.get("area") == prefs.area else 0.0
        score = (
            w["language_match"] * lang
            + w["clinician_gender_match"] * gender
            + w["modality_match"] * modality
            + w["wait_days"] * wait
            + w["area_match"] * area
        )
        ranked.append({**p, "match_score": round(score, 3), "out_of_network": p not in in_net})
    ranked.sort(key=lambda p: (-p["match_score"], p["current_wait_days"], p["id"]))
    factors = []
    if prefs.language:
        factors.append(
            {"factor": "language", "value": prefs.language, "effect": "weight 0.30", "rule_id": "PM-LANG"}
        )
    if prefs.clinician_gender and prefs.clinician_gender != "none":
        factors.append(
            {
                "factor": "clinician_gender",
                "value": prefs.clinician_gender,
                "effect": "weight 0.20",
                "rule_id": "PM-GENDER",
            }
        )
    if prefs.modality:
        factors.append(
            {
                "factor": "modality",
                "value": ", ".join(prefs.modality),
                "effect": "weight 0.20",
                "rule_id": "PM-MODALITY",
            }
        )
    if prefs.insurance_plan:
        factors.append(
            {
                "factor": "insurance_network",
                "value": prefs.insurance_plan,
                "effect": "hard filter" if in_net else "no in-network match: warning shown",
                "rule_id": "PM-NETWORK",
            }
        )
    factors.append(
        {
            "factor": "capacity",
            "value": f"{len(pool)} providers accepting at {level}",
            "effect": "wait time weight 0.20",
            "rule_id": "PM-CAPACITY",
        }
    )
    return ranked, factors
