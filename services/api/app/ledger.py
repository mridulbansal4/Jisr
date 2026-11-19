"""Episode ledger: append-only events, state projection, serialisers."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.db import iso, now
from app.models import (
    AuditLog,
    Consent,
    Episode,
    EpisodeEvent,
    Notification,
    Person,
    Provider,
    Recommendation,
    Referral,
)

CONSENT_SCOPES = [
    "share_with_receiving_provider",
    "share_physical_context",
    "ai_drafted_summaries",
    "store_free_text",
    "notify_sms",
    "notify_whatsapp",
]


def append(
    db: Session,
    ep: Episode,
    type_: str,
    *,
    to_state: str | None = None,
    actor_type: str = "system",
    actor_id: str | None = None,
    data: dict[str, Any] | None = None,
    at: Any = None,
) -> EpisodeEvent:
    ep.last_event_seq += 1
    from_state = ep.state
    if to_state:
        ep.state = to_state
    ev = EpisodeEvent(
        episode_id=ep.id,
        seq=ep.last_event_seq,
        type=type_,
        from_state=from_state if to_state else None,
        to_state=to_state,
        actor_type=actor_type,
        actor_id=actor_id,
        data=data or {},
        occurred_at=at or now(),
    )
    db.add(ev)
    return ev


def audit(db: Session, person_id: str | None, actor: str, action: str, resource: str, purpose: str) -> None:
    db.add(AuditLog(person_id=person_id, actor_label=actor, action=action, resource=resource, purpose=purpose))


def notify(db: Session, person_id: str, text: str, deep_link: str | None = None, channel: str = "in_app") -> None:
    db.add(Notification(person_id=person_id, text=text, deep_link=deep_link, channel=channel))


def consents_map(db: Session, person_id: str) -> dict[str, str]:
    rows = db.query(Consent).filter_by(person_id=person_id).order_by(Consent.recorded_at).all()
    out = {s: "revoked" for s in CONSENT_SCOPES}
    for r in rows:
        out[r.scope] = r.status
    return out


def score_dicts(ep: Episode) -> list[dict[str, Any]]:
    """Latest score per instrument."""
    latest: dict[str, dict[str, Any]] = {}
    for s in ep.score_history:
        latest[s["instrument"]] = s
    return [
        {"instrument": s["instrument"], "total": s["total"], "band": s.get("band", ""),
         "item9": s.get("item9"), "scored_at": s.get("at")}
        for s in latest.values()
    ]


def provider_dict(p: Provider, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    nxt = now() + timedelta(days=p.current_wait_days)
    d = {
        "id": p.id, "display_name": p.display_name, "kind": p.kind, "steps_served": p.steps_served,
        "languages": p.languages, "clinician_gender": p.clinician_gender, "modalities": p.modalities,
        "networks": p.networks, "city": p.city, "area": p.area, "current_wait_days": p.current_wait_days,
        "next_slot": iso(nxt.replace(hour=10, minute=0, second=0)), "accepting": p.accepting,
        "is_synthetic": True,
    }
    if extra:
        d.update(extra)
    return d


def active_referral(db: Session, ep: Episode) -> Referral | None:
    return (
        db.query(Referral)
        .filter(Referral.episode_id == ep.id, Referral.status.in_(["requested", "accepted", "completed"]))
        .order_by(Referral.created_at.desc())
        .first()
    )


def latest_recommendation(db: Session, ep: Episode) -> Recommendation | None:
    return (
        db.query(Recommendation)
        .filter(Recommendation.episode_id == ep.id, Recommendation.status != "superseded")
        .order_by(Recommendation.created_at.desc())
        .first()
    )


def next_deadline(db: Session, ep: Episode) -> dict[str, Any] | None:
    t = now()
    due = None
    kind = None
    if ep.is_red and ep.red_acked_at is None and ep.red_opened_at:
        kind, due = "crisis_ack", ep.red_opened_at + timedelta(minutes=settings.sla_red_minutes)
    elif ep.state == "REFERRED":
        ref = active_referral(db, ep)
        if ref:
            kind, due = "referral_accept", ref.sla_due_at
    elif ep.state == "ACCEPTED":
        kind, due = "first_appt", ep.opened_at + timedelta(days=settings.sla_first_appt_days)
    elif ep.state in ("BOOKED", "ATTENDED", "MONITORING", "STEP_CHANGED"):
        last = ep.score_history[-1]["at"] if ep.score_history else iso(ep.opened_at)
        from datetime import datetime

        last_dt = datetime.fromisoformat(str(last).rstrip("Z"))
        kind, due = "recheck", last_dt + timedelta(days=settings.sla_recheck_days)
    if not due:
        return None
    return {"kind": kind, "due_at": iso(due), "overdue": due < t}


def episode_dict(db: Session, ep: Episode, *, include_physical: bool) -> dict[str, Any]:
    person = db.get(Person, ep.person_id)
    assert person is not None
    events = db.query(EpisodeEvent).filter_by(episode_id=ep.id).order_by(EpisodeEvent.seq).all()
    refs = db.query(Referral).filter_by(episode_id=ep.id).order_by(Referral.created_at).all()
    rec = latest_recommendation(db, ep)
    act = active_referral(db, ep)
    consents = consents_map(db, person.id)
    phys = None
    if include_physical and person.physical_context and consents.get("share_physical_context") == "granted":
        phys = person.physical_context
    timeline = []
    for e in events:
        item: dict[str, Any] = {
            "seq": e.seq, "type": e.type, "actor_type": e.actor_type, "occurred_at": iso(e.occurred_at),
            "data": e.data,
        }
        if e.from_state:
            item["from_state"] = e.from_state
        if e.to_state:
            item["to_state"] = e.to_state
        timeline.append(item)
    return {
        "id": ep.id,
        "state": ep.state,
        "current_step": ep.current_step,
        "proposed_step": ep.proposed_step,
        "is_red": ep.is_red,
        "red_severity": ep.red_severity,
        "person_label": person.label,
        "person": {"sex": person.sex, "age": person.age, "nationality_group": person.nationality_group,
                   "language": person.language, "area": person.area, "insurance_plan": person.insurance_plan,
                   "conditions": person.conditions if consents.get("share_physical_context") == "granted"
                   else []},
        "language": person.language,
        "opened_at": iso(ep.opened_at),
        "reason": ep.reason,
        "owner": {"team": "Jisr care coordination", "staff_id": ep.owner_staff_id},
        "next_deadline": next_deadline(db, ep),
        "scores": score_dicts(ep),
        "score_history": ep.score_history,
        "physical_context": phys,
        "fired_rules": ep.fired_rules,
        "factors": ep.factors,
        "recommendation_id": rec.id if rec else None,
        "active_referral_id": act.id if act else None,
        "referrals": [
            {"id": r.id, "status": r.status, "provider_id": r.provider_id,
             "provider_name": (db.get(Provider, r.provider_id).display_name  # type: ignore[union-attr]
                               if db.get(Provider, r.provider_id) else ""),
             "sla_due_at": iso(r.sla_due_at)}
            for r in refs
        ],
        "consents": consents,
        "timeline": timeline,
        "last_event_seq": ep.last_event_seq,
    }
