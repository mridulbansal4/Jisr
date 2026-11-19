"""Shared care-flow operations (used by several routers)."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.auth import Principal, Problem
from app.db import iso, now
from app.engines import crisis_gate
from app.engines.step_matcher import Prefs, rank_providers
from app.ledger import append, audit, consents_map, notify, provider_dict
from app.models import Episode, Person, Provider, Recommendation, Referral

OPEN_STATES_EXCLUDED = {"CLOSED", "LOST_TO_FOLLOW_UP", "DECLINED_BY_PERSON"}


def get_episode(db: Session, episode_id: str, p: Principal, purpose: str = "care") -> Episode:
    ep = db.get(Episode, episode_id)
    if ep is None:
        raise Problem(404, "NOT_FOUND", "Episode not found")
    if p.role == "person" and ep.person_id != p.subject_id:
        raise Problem(404, "NOT_FOUND", "Episode not found")
    if p.role == "programme":
        raise Problem(403, "FORBIDDEN", "Programme role sees aggregates only")
    if p.role != "person":
        audit(db, ep.person_id, p.label, "read", f"episode:{ep.id}",
              "demo" if p.role == "judge" else purpose)
    return ep


def open_red(
    db: Session,
    person: Person,
    gate: crisis_gate.GateResult,
    reason: str,
    episode: Episode | None = None,
    actor_type: str = "system",
) -> Episode:
    """Open a RED episode or flip an existing one. Raise-only: never lowers anything."""
    if episode is None:
        episode = (
            db.query(Episode)
            .filter(Episode.person_id == person.id, Episode.state.notin_(list(OPEN_STATES_EXCLUDED)))
            .order_by(Episode.opened_at.desc())
            .first()
        )
    if episode is None:
        episode = Episode(person_id=person.id, state="SCREENED_POSITIVE", reason=reason)
        db.add(episode)
        db.flush()
    already_red = episode.is_red and episode.red_acked_at is None
    episode.is_red = True
    episode.current_step = "RED"
    episode.proposed_step = "RED"
    if not already_red:
        episode.red_opened_at = now()
        episode.red_acked_at = None
    rank = {"review": 1, "same_day_check": 2, "high": 3, "imminent": 4}
    if episode.red_severity is None or rank.get(gate.severity or "review", 1) > rank.get(episode.red_severity, 0):
        episode.red_severity = gate.severity
    episode.reason = reason
    episode.fired_rules = list(dict.fromkeys([*episode.fired_rules, *gate.fired_rules, "EO-01"]))
    append(db, episode, "CRISIS_GATE_FIRED", to_state="RED_CRISIS", actor_type=actor_type,
           data={"rules": gate.fired_rules, "severity": gate.severity,
                 "categories": sorted({h.category for h in gate.hits}), "latency_ms": gate.latency_ms})
    notify(db, person.id, "A member of the care team will contact you shortly. If you are in danger, call 999.",
           "/help")
    return episode


def person_prefs(person: Person) -> Prefs:
    return Prefs(language=person.language, clinician_gender=person.clinician_gender, modality=person.modality,
                 area=person.area, insurance_plan=person.insurance_plan)


def build_recommendation(db: Session, ep: Episode, source: str = "initial",
                         exclude: set[str] | None = None) -> Recommendation:
    step = ep.proposed_step or ep.current_step or "L1"
    for old in db.query(Recommendation).filter(Recommendation.episode_id == ep.id,
                                              Recommendation.status == "proposed"):
        old.status = "superseded"
    rec = Recommendation(episode_id=ep.id, step=step, source=source, factors=list(ep.factors),
                         excluded_provider_ids=sorted(exclude or []))
    db.add(rec)
    db.flush()
    return rec


def recommendation_dict(db: Session, ep: Episode, rec: Recommendation) -> dict[str, Any]:
    person = db.get(Person, ep.person_id)
    assert person is not None
    providers = [provider_dict(p) for p in db.query(Provider).all()]
    if rec.step == "RED":
        ranked, pm_factors = [], []
    else:
        ranked, pm_factors = rank_providers(rec.step, person_prefs(person), providers,
                                            set(rec.excluded_provider_ids))
    return {
        "id": rec.id,
        "status": rec.status,
        "recommended_step": rec.step,
        "source": rec.source,
        "factors": [*rec.factors, *pm_factors],
        "candidates": ranked[:4],
        "rule_set_version": __import__("app.rules", fromlist=["rule_set_version"]).rule_set_version(),
        "needs_clinician_confirmation": True,
        "preferences": {"language": person.language, "clinician_gender": person.clinician_gender,
                        "modality": person.modality, "insurance_plan": person.insurance_plan, "area": person.area},
        "privacy_note": "Nothing is shared with your employer. Your insurer sees claims data only.",
    }


def referral_packet(db: Session, ep: Episode, ref: Referral) -> dict[str, Any]:
    person = db.get(Person, ep.person_id)
    assert person is not None
    consents = consents_map(db, person.id)
    packet: dict[str, Any] = {
        "person": person.label,
        "language": person.language,
        "scores": [{"instrument": s["instrument"], "total": s["total"], "band": s.get("band")}
                   for s in ep.score_history[-2:]],
        "suggested_step": ep.current_step or ep.proposed_step,
        "priority": ref.priority,
    }
    if consents.get("share_physical_context") == "granted" and person.physical_context:
        packet["physical_context"] = person.physical_context
    packet["not_shared"] = ["employer", "free-text answers"] + (
        [] if consents.get("share_physical_context") == "granted" else ["physical health context"])
    return packet


def iso_or_none(dt: Any) -> str | None:
    return iso(dt) if dt else None
