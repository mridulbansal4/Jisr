"""API-16, 17, 21 + timeseries, geo, SLA, Programme Copilot, crisis evals. All on SIMULATED synthetic data."""

from __future__ import annotations

import json
import random
import statistics
import uuid
from datetime import timedelta
from typing import Any, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import Principal, Problem, require
from app.config import ROOT
from app.db import get_db, iso
from app.engines.fairness import K, suppress, wilson
from app.llm import features
from app.models import CohortRecord

router = APIRouter(prefix="/v1", tags=["programme"])
READ = ("programme", "judge", "clinician", "coordinator")
LABEL = "SIMULATED"
GROUP_LABELS = {
    "emirati": "Emirati", "south_asian": "South Asian", "arab_expat": "Arab expatriate", "western": "Western",
    "filipino": "Filipino", "other": "Other", "ar": "Arabic", "en": "English", "ur": "Urdu",
    "thiqa": "Thiqa", "basic": "Basic", "enhanced": "Enhanced", "female": "Female", "male": "Male",
    "abu_dhabi_city": "Abu Dhabi City", "al_ain": "Al Ain", "al_dhafra": "Al Dhafra",
}
BY_FIELD = {"sex": "sex", "age_band": "age_band", "nationality_group": "nationality_group", "language": "language",
            "insurance_plan": "insurance_plan", "area": "area"}


def _cohort(db: Session) -> list[CohortRecord]:
    return db.query(CohortRecord).order_by(CohortRecord.screened_at).all()


def _pct(a: int, b: int) -> float | None:
    return round(100 * a / b, 1) if b else None


def _median(vals: list[float]) -> float | None:
    return round(statistics.median(vals), 1) if vals else None


def _p(vals: list[float], q: float) -> float | None:
    if not vals:
        return None
    s = sorted(vals)
    return round(s[min(len(s) - 1, int(q * len(s)))], 1)


def compute_metrics(rows: list[CohortRecord]) -> dict[str, Any]:
    pos = [r for r in rows if r.positive]
    funnel = {"screened": len(rows), "positive": len(pos), "referred": sum(r.referred for r in pos),
              "accepted": sum(r.accepted for r in pos), "attended": sum(r.attended for r in pos)}
    reds = [r for r in pos if r.red]
    attended = [r for r in pos if r.attended]
    kpis = {
        "conversion_pct": _pct(funnel["attended"], funnel["positive"]),
        "median_days_to_care": _median([r.days_to_care for r in attended if r.days_to_care is not None]),
        "first_appt_within_14d_pct": _pct(sum(1 for r in attended if (r.days_to_care or 99) <= 14), len(attended)),
        "red_ack_within_15min_pct": _pct(sum(1 for r in reds if (r.red_ack_minutes or 99) <= 15), len(reds)),
        "red_ack_median_min": _median([r.red_ack_minutes for r in reds if r.red_ack_minutes is not None]),
        "recheck_on_time_pct": _pct(sum(r.rechecked_on_time for r in attended), len(attended)),
        "reliable_improvement_pct": _pct(sum(r.improved for r in attended), len(attended)),
        "referral_accept_median_h": _median([r.accept_hours for r in pos if r.accept_hours is not None]),
        "crisis_episodes": float(len(reds)),
    }
    drops: dict[str, int] = {}
    for r in pos:
        if r.drop_off_reason:
            drops[r.drop_off_reason] = drops.get(r.drop_off_reason, 0) + 1
    return {"funnel": funnel, "kpis": kpis,
            "drop_off_reasons": [{"reason": k, "n": v if v >= K else None} for k, v in
                                 sorted(drops.items(), key=lambda kv: -kv[1])]}


@router.get("/programme/metrics")
def metrics(p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = _cohort(db)
    m = compute_metrics(rows)
    return {"period": {"from": iso(rows[0].screened_at)[:10] if rows else None,
                       "to": iso(rows[-1].screened_at)[:10] if rows else None},
            **m, "suppressed_cells": sum(1 for d in m["drop_off_reasons"] if d["n"] is None),
            "data_label": LABEL, "baseline": {"conversion_pct": 58.0, "median_days_to_care": 24.0,
                                              "note": "Simulated pre-Jisr baseline (assumption)"}}


def fairness_table(rows: list[CohortRecord], metric: str, by: str) -> dict[str, Any]:
    field = BY_FIELD[by]
    pos = [r for r in rows if r.positive]
    groups: dict[str, list[CohortRecord]] = {}
    for r in pos:
        groups.setdefault(getattr(r, field), []).append(r)
    raw = []
    for g, rs in groups.items():
        if metric == "conversion":
            n, succ = len(rs), sum(r.attended for r in rs)
            value, ci = _pct(succ, n), wilson(succ, n)
        elif metric == "reliable_improvement":
            att = [r for r in rs if r.attended]
            n, succ = len(att), sum(r.improved for r in att)
            value, ci = _pct(succ, n), wilson(succ, n)
        else:
            vals = [r.days_to_care for r in rs if r.days_to_care is not None]
            n, value, ci = len(vals), _median(vals), None
        raw.append({"group": g, "n": n, "value": value, "ci95": list(ci) if ci else None})
    rows_s = suppress(raw)
    out_rows = []
    for r in sorted(rows_s, key=lambda x: -x["n"]):
        sup = r["suppression"] is not None
        out_rows.append({"group": r["group"], "group_label": GROUP_LABELS.get(r["group"], r["group"]),
                         "n": "<10" if r["suppression"] == "primary" else ("suppressed" if sup else str(r["n"])),
                         "suppression": r["suppression"], "value": None if sup else r["value"],
                         "ci95": None if sup else r["ci95"], "suppressed": sup})
    vals = [r["value"] for r in out_rows if r["value"] is not None]
    return {"metric": metric, "by": by, "k": K, "rows": out_rows, "total_n": str(len(pos)),
            "max_gap_pp": round(max(vals) - min(vals), 1) if len(vals) >= 2 else None,
            "note": "Cells with n<10 are suppressed; one extra cell is suppressed when needed so a suppressed "
                    "value cannot be derived from the total.", "data_label": LABEL}


@router.get("/programme/fairness")
def fairness(metric: Literal["conversion", "time_to_care", "reliable_improvement"] = "conversion",
             by: Literal["sex", "age_band", "nationality_group", "language", "insurance_plan", "area"] = "language",
             p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    return fairness_table(_cohort(db), metric, by)


def compute_timeseries(rows: list[CohortRecord]) -> dict[str, Any]:
    if not rows:
        return {"weeks": [], "series": {}, "data_label": LABEL}
    start = rows[0].screened_at
    buckets: list[list[CohortRecord]] = [[] for _ in range(12)]
    for r in rows:
        i = min(11, int((r.screened_at - start).days // 7))
        buckets[i].append(r)
    weeks = [iso(start + timedelta(weeks=i))[:10] for i in range(12)]  # type: ignore[index]
    s: dict[str, list[Any]] = {k: [] for k in ("screens", "positive", "referred", "attended", "conversion_pct",
                                                "median_days_to_care", "red_ack_p50_min", "red_ack_p90_min")}
    for b in buckets:
        pos = [r for r in b if r.positive]
        s["screens"].append(len(b))
        s["positive"].append(len(pos))
        s["referred"].append(sum(r.referred for r in pos))
        s["attended"].append(sum(r.attended for r in pos))
        s["conversion_pct"].append(_pct(sum(r.attended for r in pos), len(pos)))
        s["median_days_to_care"].append(_median([r.days_to_care for r in pos if r.days_to_care]))
        acks = [r.red_ack_minutes for r in pos if r.red_ack_minutes is not None]
        s["red_ack_p50_min"].append(_p(acks, 0.5))
        s["red_ack_p90_min"].append(_p(acks, 0.9))
    return {"weeks": weeks, "series": s, "data_label": LABEL}


@router.get("/programme/timeseries")
def timeseries(p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    return compute_timeseries(_cohort(db))


def compute_geo(rows: list[CohortRecord]) -> list[dict[str, Any]]:
    out = []
    for rid in ("abu_dhabi_city", "al_ain", "al_dhafra"):
        rs = [r for r in rows if r.area == rid]
        pos = [r for r in rs if r.positive]
        sup = len(pos) < K
        out.append({"id": rid, "name": GROUP_LABELS[rid], "screens": len(rs), "positive": len(pos),
                    "conversion_pct": None if sup else _pct(sum(r.attended for r in pos), len(pos)),
                    "median_days_to_care": None if sup else _median([r.days_to_care for r in pos if r.days_to_care]),
                    "suppressed": sup})
    return out


@router.get("/programme/geo")
def geo(p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    return {"regions": compute_geo(_cohort(db)), "data_label": LABEL}


def compute_sla(rows: list[CohortRecord]) -> list[dict[str, Any]]:
    pos = [r for r in rows if r.positive]
    acks = [r.red_ack_minutes for r in pos if r.red_ack_minutes is not None]
    acc = [r.accept_hours for r in pos if r.accept_hours is not None]
    dtc = [r.days_to_care for r in pos if r.days_to_care is not None]
    att = [r for r in pos if r.attended]

    def item(kind: str, target: str, vals: list[float], limit: float, unit: str) -> dict[str, Any]:
        met = sum(1 for v in vals if v <= limit)
        return {"kind": kind, "target": target, "met_pct": _pct(met, len(vals)), "breaches": len(vals) - met,
                "p50": f"{_p(vals, 0.5)} {unit}", "p90": f"{_p(vals, 0.9)} {unit}", "n": len(vals)}

    return [
        item("crisis_ack", "15 min", acks, 15, "min"),
        item("referral_accept", "48 h", acc, 48, "h"),
        item("first_appt", "14 days", dtc, 14, "days"),
        {"kind": "recheck", "target": "14 days", "met_pct": _pct(sum(r.rechecked_on_time for r in att), len(att)),
         "breaches": sum(1 for r in att if not r.rechecked_on_time), "p50": "n/a", "p90": "n/a", "n": len(att)},
    ]


@router.get("/programme/sla")
def sla(p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    return {"items": compute_sla(_cohort(db)), "data_label": LABEL}


class Scenario(BaseModel):
    baseline_conversion: float = Field(default=0.58, ge=0, le=1)
    capacity_multiplier: float = Field(default=1.0, ge=0.1, le=5)
    sla_hours: int = Field(default=48, ge=1, le=720)


class SimRequest(BaseModel):
    cohort_size: int = Field(default=1000, ge=100, le=50000)
    seed: int = 42
    scenario: Scenario = Field(default_factory=Scenario)


@router.post("/sim/run", tags=["simulation"])
def sim_run(body: SimRequest, p: Principal = Depends(require(*READ)), db: Session = Depends(get_db)) -> dict[str, Any]:
    """Transparent mechanism model (not an effect estimate). Assumptions are returned verbatim."""
    sc = body.scenario
    rng = random.Random(body.seed)
    cap = sc.capacity_multiplier
    # Baseline: no owned hand-off; drop-off grows with wait. Jisr: owned hand-off + SLA timers + rematch on decline.
    base_wait = 24 / cap ** 0.6
    jisr_wait = (10 + sc.sla_hours / 24 * 1.5) / cap ** 0.6
    base_conv = sc.baseline_conversion * min(1.0, 0.85 + 0.15 * cap)
    jisr_lift = 0.22 * (1 - sc.sla_hours / 720) * min(1.0, 0.7 + 0.3 * cap)
    jisr_conv = min(0.95, sc.baseline_conversion + jisr_lift) * min(1.0, 0.9 + 0.1 * cap)
    days = list(range(0, 85, 7))

    def curve(final: float, median_days: float) -> list[float]:
        out = []
        for d in days:
            frac = 1 - 0.5 ** (d / max(1.0, median_days))
            out.append(round(100 * final * frac * (1 + rng.uniform(-0.01, 0.01)), 1))
        return out

    n = body.cohort_size
    return {
        "run_id": str(uuid.uuid4()),
        "baseline": {"conversion_pct": round(100 * base_conv, 1), "median_days_to_care": round(base_wait, 1)},
        "jisr": {"conversion_pct": round(100 * jisr_conv, 1), "median_days_to_care": round(jisr_wait, 1)},
        "curve": {"days": days, "baseline_cum_pct": curve(base_conv, base_wait),
                  "jisr_cum_pct": curve(jisr_conv, jisr_wait)},
        "waiting_list": {"baseline": int(n * 0.27 * (1 - base_conv)), "jisr": int(n * 0.27 * (1 - jisr_conv))},
        "people_reached_extra": int(n * 0.27 * (jisr_conv - base_conv)),
        "assumptions": [
            "27% of screens are positive (synthetic cohort rate).",
            "Baseline: no owned hand-off; median wait 24 days at capacity 1.0.",
            f"Jisr: owned hand-off, provider decision SLA {sc.sla_hours} h, automatic re-match on decline.",
            "Capacity scales waits by capacity^-0.6 (queueing approximation).",
            "Mechanism demo on synthetic data, not an effect estimate.",
        ],
        "data_label": LABEL,
    }


class Ask(BaseModel):
    question: str = Field(min_length=2, max_length=500)


def _intent(q: str) -> tuple[str, str | None]:
    s = q.lower()
    by = None
    for key, field in (("nationalit", "nationality_group"), ("language", "language"), ("urdu", "language"),
                       ("arabic", "language"), ("gender", "sex"), ("women", "sex"), ("men", "sex"),
                       ("sex", "sex"), ("age", "age_band"), ("young", "age_band"), ("insur", "insurance_plan"),
                       ("thiqa", "insurance_plan"), ("plan", "insurance_plan")):
        if key in s:
            by = field
            break
    if any(k in s for k in ("region", "al ain", "dhafra", "where in", "geograph", "area", "city")):
        return "geo", None
    if any(k in s for k in ("sla", "crisis", "red ", "respond", "acknowledg", "15 min", "breach")):
        return "sla", None
    if by or any(k in s for k in ("fair", "equit", "group", "gap", "disparit", "lowest", "highest")):
        return "fairness", by or "nationality_group"
    if any(k in s for k in ("drop", "funnel", "lose", "lost", "leak", "why")):
        return "funnel", None
    if any(k in s for k in ("trend", "week", "over time", "improv", "chang", "time to care", "wait")):
        return "trend", None
    return "funnel", None


@router.post("/programme/ask")
def ask(body: Ask, p: Principal = Depends(require("programme", "judge")), db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = _cohort(db)
    intent, by = _intent(body.question)
    chart: dict[str, Any] | None = None
    data: dict[str, Any]
    suppressed_note = None
    if intent == "fairness":
        metric = "time_to_care" if any(k in body.question.lower() for k in ("wait", "time")) else "conversion"
        t = fairness_table(rows, metric, by or "nationality_group")
        vis = [r for r in t["rows"] if r["value"] is not None]
        data = {"metric": metric, "by": t["by"], "rows": [{"group": r["group_label"], "value": r["value"],
                                                           "n": r["n"]} for r in t["rows"]],
                "max_gap_pp": t["max_gap_pp"]}
        unit = "days" if metric == "time_to_care" else "%"
        chart = {"type": "bar", "title": f"{'Median days to care' if unit == 'days' else 'Conversion'} by "
                 f"{t['by'].replace('_', ' ')}", "x": [r["group_label"] for r in t["rows"]],
                 "series": [{"name": metric.replace("_", " "), "values": [r["value"] for r in t["rows"]]}],
                 "unit": unit}
        sup = [r["group_label"] for r in t["rows"] if r["suppressed"]]
        if sup:
            suppressed_note = f"Suppressed (n<10 or complementary): {', '.join(sup)}"
        if vis:
            lo = min(vis, key=lambda r: r["value"]) if unit == "%" else max(vis, key=lambda r: r["value"])
            hi = max(vis, key=lambda r: r["value"]) if unit == "%" else min(vis, key=lambda r: r["value"])
            template = (f"{lo['group_label']} has the {'lowest conversion' if unit == '%' else 'longest wait'} "
                        f"({lo['value']}{'%' if unit == '%' else ' days'}), versus {hi['group_label']} "
                        f"({hi['value']}{'%' if unit == '%' else ' days'}); the gap is {t['max_gap_pp']}"
                        f"{' points' if unit == '%' else ' days'}. Consider targeted outreach and language-matched "
                        "providers for that group. Simulated data.")
        else:
            template = "All groups are suppressed for this view. Simulated data."
    elif intent == "geo":
        g = compute_geo(rows)
        data = {"regions": [{"region": r["name"], "conversion_pct": r["conversion_pct"],
                             "median_days_to_care": r["median_days_to_care"], "positive": r["positive"]} for r in g]}
        chart = {"type": "bar", "title": "Conversion by region", "x": [r["name"] for r in g],
                 "series": [{"name": "conversion %", "values": [r["conversion_pct"] for r in g]}], "unit": "%"}
        vis = [r for r in g if r["conversion_pct"] is not None]
        lo = min(vis, key=lambda r: r["conversion_pct"])
        template = (f"{lo['name']} has the lowest conversion ({lo['conversion_pct']}%) and a median of "
                    f"{lo['median_days_to_care']} days to care. Adding tele-mental-health capacity for that region "
                    "is the quickest lever. Simulated data.")
    elif intent == "sla":
        items = compute_sla(rows)
        data = {"sla": items}
        chart = {"type": "bar", "title": "SLA met (%)", "x": [i["kind"].replace("_", " ") for i in items],
                 "series": [{"name": "met %", "values": [i["met_pct"] for i in items]}], "unit": "%"}
        c = items[0]
        template = (f"Crisis acknowledgement met the {c['target']} target in {c['met_pct']}% of RED episodes "
                    f"(median {c['p50']}, p90 {c['p90']}). Referral decisions met 48 h in {items[1]['met_pct']}%. "
                    "Simulated data.")
    elif intent == "trend":
        ts = compute_timeseries(rows)
        data = {"weeks": ts["weeks"], "conversion_pct": ts["series"]["conversion_pct"],
                "median_days_to_care": ts["series"]["median_days_to_care"]}
        chart = {"type": "line", "title": "Weekly conversion and days to care", "x": ts["weeks"],
                 "series": [{"name": "conversion %", "values": ts["series"]["conversion_pct"]},
                            {"name": "median days to care", "values": ts["series"]["median_days_to_care"]}],
                 "unit": ""}
        cp = ts["series"]["conversion_pct"]
        dt = ts["series"]["median_days_to_care"]
        template = (f"Conversion moved from {cp[0]}% in the first week to {cp[-1]}% in the latest week, and median "
                    f"days to care from {dt[0]} to {dt[-1]}, as owned hand-offs and SLA timers rolled out. "
                    "Simulated data.")
    else:
        m = compute_metrics(rows)
        f = m["funnel"]
        data = {"funnel": f, "drop_off_reasons": m["drop_off_reasons"]}
        chart = {"type": "bar", "title": "Care funnel", "x": list(f.keys()),
                 "series": [{"name": "people", "values": list(f.values())}], "unit": ""}
        top = m["drop_off_reasons"][0] if m["drop_off_reasons"] else None
        template = (f"Of {f['positive']} positive screens, {f['referred']} were referred and {f['attended']} "
                    f"attended care. The largest drop-off reason is "
                    f"{top['reason'].replace('_', ' ') if top else 'unknown'} ({top['n'] if top else 'n/a'}). "
                    "Simulated data.")
    out = features.narrate(body.question, data, template)
    return {**out, "intent": intent, "chart": chart, "suppressed_note": suppressed_note, "data": data,
            "data_label": LABEL}


# ---------------------------------------------------------------- Crisis benchmark

RESULTS = ROOT / "ai" / "evals" / "results" / "crisis_latest.json"
BENCH = ROOT / "data" / "synthetic" / "crisis_benchmark.v1.jsonl"


def _run() -> dict[str, Any]:
    try:
        from app.evals_crisis import run_benchmark  # built alongside ai/evals/run_evals.py
    except ImportError as exc:
        raise Problem(503, "UNAVAILABLE", "Benchmark runner not installed yet") from exc
    if not BENCH.exists():
        raise Problem(503, "UNAVAILABLE", "Benchmark dataset not found")
    return run_benchmark(BENCH)  # type: ignore[no-any-return]


@router.get("/evals/crisis", tags=["ai"])
def evals_latest(p: Principal = Depends(require("judge", "programme", "clinician", "coordinator"))) -> dict[str, Any]:
    if RESULTS.exists():
        data: dict[str, Any] = json.loads(RESULTS.read_text(encoding="utf-8"))
        return data
    return _run()


@router.post("/evals/crisis/run", tags=["ai"])
def evals_run(p: Principal = Depends(require("judge", "programme", "clinician", "coordinator"))) -> dict[str, Any]:
    return _run()
