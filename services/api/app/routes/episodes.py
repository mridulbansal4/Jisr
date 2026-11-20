"""API-05..13, 24, 25, trajectory, hand-off summary, FHIR export."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Literal

from fastapi import APIRouter, Depends, Header, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import Principal, Problem, current, require, staff_user
from app.care import build_recommendation, get_episode, open_red, recommendation_dict, referral_packet
from app.config import settings
from app.db import get_db, iso, now
from app.engines import crisis_gate, rci, scoring
from app.engines.step_matcher import StepInput, match
from app.ledger import append, consents_map, episode_dict, latest_recommendation, next_deadline, notify
from app.llm import features
from app.models import Appointment, Episode, EpisodeEvent, Person, Provider, Recommendation, Referral

router = APIRouter(prefix="/v1", tags=["episodes"])

STEP_LABEL = {
    "L0": "L0 self-help",
    "L1": "L1 guided self-help / community",
    "L2": "L2 family physician (MH) or tele-MH",
    "L3": "L3 psychologist",
    "L4": "L4 specialist service",
    "RED": "RED urgent human contact",
}


class ReferralCreate(BaseModel):
    provider_id: str
    priority: Literal["routine", "urgent", "asap", "stat"] = "routine"
    requested_slot: str | None = None
    consent_scopes: list[str] = Field(default_factory=list)
    note_to_provider: str | None = Field(default=None, max_length=1000)


class ReferralDecision(BaseModel):
    decision: Literal["accept", "decline"]
    reason: str | None = None
    comment: str | None = None
    on_behalf_of_provider: bool = False


class AppointmentAction(BaseModel):
    action: Literal["book", "record"]
    start_at: str | None = None
    modality: Literal["in_person", "video", "phone"] | None = None
    appointment_id: str | None = None
    status: Literal["attended", "no_show", "cancelled"] | None = None


class Recheck(BaseModel):
    answers: dict[str, int | bool] = Field(default_factory=dict)
    free_text: str | None = None


class ConfirmStep(BaseModel):
    recommendation_id: str | None = None
    step: Literal["L0", "L1", "L2", "L3", "L4", "RED"]
    reason: str | None = None
    resolve_crisis: bool = False
    crisis_resolution: str | None = None


class CloseEpisode(BaseModel):
    basis: Literal["evidence", "clinician_decision"] = "clinician_decision"
    evidence: dict[str, Any] | None = None
    reason: str | None = None


class RedAck(BaseModel):
    note_category: str | None = None


class ContactAttempt(BaseModel):
    channel: str = "phone"
    outcome: str = "reached_safe"
    note: str | None = None
    next_attempt_at: str | None = None


def _staff_actor(db: Session, p: Principal) -> str | None:
    s = staff_user(db, p)
    return s.id if s else None


@router.get("/episodes/{eid}")
def get_ep(
    eid: str, response: Response, p: Principal = Depends(current), db: Session = Depends(get_db)
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    d = episode_dict(db, ep, include_physical=p.role != "person" or True)
    db.commit()
    response.headers["ETag"] = f'"{ep.last_event_seq}"'
    return d


@router.get("/episodes/{eid}/recommendation")
def get_recommendation(
    eid: str, p: Principal = Depends(current), db: Session = Depends(get_db)
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    rec = latest_recommendation(db, ep)
    if rec is None:
        rec = build_recommendation(db, ep)
        db.commit()
    return recommendation_dict(db, ep, rec)


@router.post("/episodes/{eid}/referrals", status_code=201)
def create_referral(
    eid: str,
    body: ReferralCreate,
    p: Principal = Depends(require("person", "coordinator", "judge")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    if ep.is_red and ep.red_acked_at is None:
        raise Problem(423, "LOCKED_CRISIS", "A RED episode must be handled by a human first")
    prov = db.get(Provider, body.provider_id)
    if prov is None:
        raise Problem(404, "NOT_FOUND", "Provider not found")
    consents = consents_map(db, ep.person_id)
    if (
        "share_with_receiving_provider" not in body.consent_scopes
        and consents.get("share_with_receiving_provider") != "granted"
    ):
        raise Problem(
            403,
            "CONSENT_REQUIRED",
            "Consent needed to share with the receiving provider",
            required_consent="share_with_receiving_provider",
        )
    from app.models import Consent

    for scope in body.consent_scopes:
        if consents.get(scope) != "granted":
            db.add(Consent(person_id=ep.person_id, scope=scope, status="granted"))
    for r in db.query(Referral).filter(Referral.episode_id == ep.id, Referral.status == "requested"):
        r.status = "cancelled"
    ref = Referral(
        episode_id=ep.id,
        provider_id=prov.id,
        priority=body.priority,
        consent_scopes=body.consent_scopes,
        note=body.note_to_provider,
        sla_due_at=now() + timedelta(hours=settings.sla_referral_hours),
    )
    db.add(ref)
    db.flush()
    append(
        db,
        ep,
        "REFERRAL_CREATED",
        to_state="REFERRED",
        actor_type="person" if p.role == "person" else "staff",
        data={
            "referral_id": ref.id,
            "provider": prov.display_name,
            "pending_clinician_confirmation": ep.current_step is None,
        },
    )
    notify(
        db,
        ep.person_id,
        f"Your request was sent to {prov.display_name}. They usually reply within 48 hours.",
        "/me/plan",
    )
    db.commit()
    return {
        "id": ref.id,
        "status": ref.status,
        "episode_state": ep.state,
        "sla_due_at": iso(ref.sla_due_at),
        "packet_preview": referral_packet(db, ep, ref),
        "fhir": {"service_request_id": f"ServiceRequest/{ref.id}", "task_id": f"Task/{ref.id}"},
    }


@router.post("/referrals/{rid}/decision")
def decide_referral(
    rid: str,
    body: ReferralDecision,
    p: Principal = Depends(require("clinician", "coordinator", "judge")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ref = db.get(Referral, rid)
    if ref is None:
        raise Problem(404, "NOT_FOUND", "Referral not found")
    if ref.status != "requested":
        raise Problem(409, "CONFLICT_STATE", f"Referral is already {ref.status}")
    ep = db.get(Episode, ref.episode_id)
    assert ep is not None
    prov = db.get(Provider, ref.provider_id)
    ref.decided_at = now()
    actor = _staff_actor(db, p)
    if body.decision == "accept":
        ref.status = "accepted"
        append(
            db,
            ep,
            "REFERRAL_ACCEPTED",
            to_state="ACCEPTED",
            actor_type="staff",
            actor_id=actor,
            data={"referral_id": ref.id, "on_behalf": body.on_behalf_of_provider},
        )
        notify(
            db,
            ep.person_id,
            f"{prov.display_name if prov else 'The clinic'} accepted your referral. Booking is next.",
            "/me/plan",
        )
        db.commit()
        return {
            "id": ref.id,
            "status": "accepted",
            "episode_state": ep.state,
            "first_appointment_due_by": iso(ep.opened_at + timedelta(days=settings.sla_first_appt_days)),
        }
    ref.status = "declined"
    append(
        db,
        ep,
        "REFERRAL_DECLINED",
        to_state="DECLINED_BY_PROVIDER",
        actor_type="staff",
        actor_id=actor,
        data={"referral_id": ref.id, "reason": body.reason},
    )
    excluded = {r.provider_id for r in db.query(Referral).filter_by(episode_id=ep.id, status="declined")}
    rec = build_recommendation(db, ep, source="decline_rematch", exclude=excluded)
    append(db, ep, "STEP_RECOMMENDED", to_state="STEP_RECOMMENDED", data={"step": rec.step, "rematch": True})
    notify(
        db,
        ep.person_id,
        "That clinic could not take your referral. We found other options for you.",
        "/me/step",
    )
    db.commit()
    return {
        "id": ref.id,
        "status": "declined",
        "episode_state": ep.state,
        "rematch": {"recommendation_id": rec.id, "excluded_provider_ids": sorted(excluded)},
    }


@router.post("/referrals/{rid}/appointment")
def appointment(
    rid: str,
    body: AppointmentAction,
    p: Principal = Depends(require("clinician", "coordinator", "judge", "person")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ref = db.get(Referral, rid)
    if ref is None:
        raise Problem(404, "NOT_FOUND", "Referral not found")
    ep = db.get(Episode, ref.episode_id)
    assert ep is not None
    if p.role == "person" and ep.person_id != p.subject_id:
        raise Problem(404, "NOT_FOUND", "Referral not found")
    prov = db.get(Provider, ref.provider_id)
    appt: Appointment | None = None
    if body.action == "book":
        start = (
            datetime.fromisoformat(body.start_at.rstrip("Z"))
            if body.start_at
            else (now() + timedelta(days=prov.current_wait_days if prov else 3)).replace(
                hour=10, minute=0, second=0
            )
        )
        modality = body.modality or (prov.modalities[0] if prov else "video")
        appt = Appointment(referral_id=ref.id, start_at=start, modality=modality)
        db.add(appt)
        db.flush()
        append(
            db,
            ep,
            "APPOINTMENT_BOOKED",
            to_state="BOOKED",
            actor_type="staff",
            data={"appointment_id": appt.id, "start_at": iso(start), "modality": modality},
        )
        text = f"Your appointment is booked for {start.strftime('%A %d %b, %H:%M')} ({modality.replace('_', ' ')})."
        notify(db, ep.person_id, text, "/me/plan")
        db.commit()
        return {
            "appointment_id": appt.id,
            "status": "booked",
            "episode_state": ep.state,
            "start_at": iso(start),
            "notification": {"channel": "in_app", "text": text},
        }
    appt = (
        db.get(Appointment, body.appointment_id)
        if body.appointment_id
        else db.query(Appointment).filter_by(referral_id=ref.id).order_by(Appointment.start_at.desc()).first()
    )
    if appt is None:
        raise Problem(404, "NOT_FOUND", "Appointment not found")
    appt.status = body.status or "attended"
    if appt.status == "attended":
        ref.status = "completed"
        append(
            db,
            ep,
            "APPOINTMENT_ATTENDED",
            to_state="ATTENDED",
            actor_type="staff",
            data={"appointment_id": appt.id},
        )
        append(
            db,
            ep,
            "MONITORING_STARTED",
            to_state="MONITORING",
            data={"recheck_due_in_days": settings.sla_recheck_days},
        )
    else:
        append(
            db, ep, "APPOINTMENT_" + appt.status.upper(), actor_type="staff", data={"appointment_id": appt.id}
        )
    db.commit()
    return {"appointment_id": appt.id, "status": appt.status, "episode_state": ep.state}


@router.post("/episodes/{eid}/recheck")
def recheck(
    eid: str,
    body: Recheck,
    p: Principal = Depends(require("person", "clinician")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    person = db.get(Person, ep.person_id)
    assert person is not None
    try:
        a = scoring.validate_answers(dict(body.answers))
    except scoring.InvalidAnswer as exc:
        raise Problem(422, "VALIDATION_FAILED", "Invalid answer", str(exc)) from exc
    phq9, gad7 = scoring.score_phq9(a), scoring.score_gad7(a)
    gate = crisis_gate.evaluate(phq9_started=True, phq9_item9=a.get("PHQ9_9"), free_text=body.free_text)
    t = iso(now())
    scores: list[dict[str, Any]] = []
    if phq9.total is not None:
        scores.append(
            {"instrument": "PHQ9", "total": phq9.total, "band": phq9.band, "item9": phq9.item9, "at": t}
        )
    if gad7.total is not None:
        scores.append({"instrument": "GAD7", "total": gad7.total, "band": gad7.band, "at": t})
    baseline: dict[str, int] = {}
    for s in ep.score_history:
        baseline.setdefault(s["instrument"], s["total"])
    ep.score_history = [*ep.score_history, *scores]
    rcis: list[dict[str, Any]] = []
    per: dict[str, str] = {}
    for s in scores:
        if s["instrument"] in baseline:
            cls = rci.classify(s["instrument"], baseline[s["instrument"]], s["total"])
            per[s["instrument"]] = cls
            rcis.append(
                {
                    "instrument": s["instrument"],
                    "baseline": baseline[s["instrument"]],
                    "current": s["total"],
                    "delta": baseline[s["instrument"]] - s["total"],
                    "threshold": rci.thresholds()[s["instrument"]],
                    "classification": cls,
                }
            )
    suggestion = None
    if gate.red:
        open_red(db, person, gate, "Crisis Gate at re-check", episode=ep, actor_type="person")
    else:
        append(
            db,
            ep,
            "RECHECK_COMPLETED",
            to_state="MONITORING",
            actor_type="person",
            data={x["instrument"].lower(): x["total"] for x in scores},
        )
        status = rci.overall(per)
        res = match(
            StepInput(
                phq9_total=phq9.total,
                gad7_total=gad7.total,
                phq9_difficulty=phq9.difficulty,
                previous_step=ep.current_step,
                rci_status=status,
                self_referral=True,
            )
        )
        if res.level and ep.current_step and res.level != ep.current_step and status != "improved":
            ep.proposed_step = res.level
            ep.factors = res.factors
            rec = build_recommendation(db, ep, source="rci")
            append(db, ep, "STEP_CHANGE_SUGGESTED", data={"from": ep.current_step, "to": res.level})
            suggestion = {
                "recommendation_id": rec.id,
                "from_step": ep.current_step,
                "to_step": res.level,
                "status": "proposed",
            }
    db.commit()
    return {
        "crisis": gate.red,
        "crisis_lines": crisis_gate.crisis_lines_for(gate.severity) if gate.red else [],
        "scores": scores,
        "rci": rcis,
        "suggestion": suggestion,
        "episode_state": ep.state,
    }


@router.get("/staff/queue")
def queue(
    view: str = "all",
    p: Principal = Depends(require("clinician", "coordinator", "judge")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    eps = db.query(Episode).filter(Episode.state.notin_(["CLOSED", "LOST_TO_FOLLOW_UP"])).all()
    items: list[dict[str, Any]] = []
    counts = {"red": 0, "overdue": 0, "to_confirm": 0}
    for ep in eps:
        person = db.get(Person, ep.person_id)
        dl = next_deadline(db, ep)
        red_open = ep.is_red and ep.red_acked_at is None
        to_confirm = (
            ep.state in ("STEP_RECOMMENDED", "REFERRED")
            and ep.current_step is None
            or (
                ep.proposed_step and ep.current_step and ep.proposed_step != ep.current_step and not ep.is_red
            )
        )
        counts["red"] += int(red_open)
        counts["overdue"] += int(bool(dl and dl["overdue"]))
        counts["to_confirm"] += int(bool(to_confirm))
        item = {
            "episode_id": ep.id,
            "person_label": person.label if person else "?",
            "state": ep.state,
            "is_red": ep.is_red,
            "red_open": red_open,
            "red_severity": ep.red_severity,
            "step": ep.current_step or ep.proposed_step,
            "reason": ep.reason,
            "deadline": dl,
            "language": person.language if person else "en",
            "opened_at": iso(ep.opened_at),
            "to_confirm": bool(to_confirm),
        }
        if view == "red" and not ep.is_red:
            continue
        if view == "overdue" and not (dl and dl["overdue"]):
            continue
        if view == "to_confirm" and not to_confirm:
            continue
        items.append(item)
    items.sort(
        key=lambda i: (
            not i["red_open"],
            not i["is_red"],
            i["deadline"]["due_at"] if i["deadline"] else "9999",
            i["opened_at"],
        )
    )
    return {"items": items, "counts": counts, "next_cursor": None}


@router.post("/episodes/{eid}/confirm-step")
def confirm_step(
    eid: str,
    body: ConfirmStep,
    if_match: str | None = Header(default=None),
    p: Principal = Depends(require("clinician")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    if if_match and if_match.strip('"W/ ') not in (str(ep.last_event_seq), "*"):
        raise Problem(409, "CONFLICT_STALE", "Episode changed since you loaded it, refresh")
    actor = _staff_actor(db, p)
    rec = (
        db.get(Recommendation, body.recommendation_id)
        if body.recommendation_id
        else latest_recommendation(db, ep)
    )
    status = "confirmed"
    if ep.is_red and body.step != "RED":
        if not body.resolve_crisis:
            raise Problem(
                423, "LOCKED_CRISIS", "Resolve the crisis (resolve_crisis=true) before changing the step"
            )
        ep.is_red = False
        append(
            db,
            ep,
            "CRISIS_RESOLVED",
            actor_type="staff",
            actor_id=actor,
            data={"resolution": body.crisis_resolution or "contacted_safe"},
        )
    if rec:
        status = "confirmed" if rec.step == body.step else "overridden"
        rec.status = status
    previous = ep.current_step
    ep.current_step = body.step
    ep.proposed_step = body.step
    append(
        db,
        ep,
        "STEP_CONFIRMED" if previous in (None, "RED") else "STEP_CHANGED",
        to_state="STEP_CONFIRMED"
        if ep.state in ("STEP_RECOMMENDED", "SCREENED_POSITIVE", "RED_CRISIS", "DECLINED_BY_PROVIDER")
        else None,
        actor_type="staff",
        actor_id=actor,
        data={"step": body.step, "status": status, "reason": body.reason},
    )
    notify(db, ep.person_id, "A clinician has reviewed and confirmed your next step.", "/me/plan")
    db.commit()
    return {
        "episode_state": ep.state,
        "current_step": ep.current_step,
        "recommendation_status": status,
        "last_event_seq": ep.last_event_seq,
    }


@router.post("/episodes/{eid}/close")
def close(
    eid: str, body: CloseEpisode, p: Principal = Depends(require("clinician")), db: Session = Depends(get_db)
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    if ep.is_red and ep.red_acked_at is None:
        raise Problem(423, "LOCKED_CRISIS", "Acknowledge and resolve the RED episode first")
    ep.closed_at = now()
    ep.close_reason = "evidence_attended_recheck" if body.basis == "evidence" else "clinician_decision"
    append(
        db,
        ep,
        "EPISODE_CLOSED",
        to_state="CLOSED",
        actor_type="staff",
        actor_id=_staff_actor(db, p),
        data={"basis": body.basis, "reason": body.reason},
    )
    db.commit()
    return {"episode_state": ep.state, "closed_at": iso(ep.closed_at), "close_reason": ep.close_reason}


@router.post("/episodes/{eid}/red/ack")
def red_ack(
    eid: str,
    body: RedAck | None = None,
    p: Principal = Depends(require("clinician", "coordinator")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    if not ep.is_red:
        raise Problem(409, "CONFLICT_STATE", "Episode is not RED")
    s = staff_user(db, p)
    if ep.red_acked_at is None:
        ep.red_acked_at = now()
        latency = int((ep.red_acked_at - (ep.red_opened_at or ep.red_acked_at)).total_seconds())
        within = latency <= settings.sla_red_minutes * 60
        append(
            db,
            ep,
            "RED_ACKNOWLEDGED",
            actor_type="staff",
            actor_id=s.id if s else None,
            data={
                "ack_latency_seconds": latency,
                "within_sla": within,
                "note_category": body.note_category if body else None,
            },
        )
        ep.owner_staff_id = s.id if s else None
        db.commit()
    latency = int((ep.red_acked_at - (ep.red_opened_at or ep.red_acked_at)).total_seconds())
    return {
        "episode_id": ep.id,
        "state": ep.state,
        "acknowledged_by": {"staff_id": s.id if s else None, "role": p.role},
        "acknowledged_at": iso(ep.red_acked_at),
        "ack_latency_seconds": latency,
        "within_sla": latency <= settings.sla_red_minutes * 60,
        "event_seq": ep.last_event_seq,
    }


@router.post("/episodes/{eid}/contact-attempts", status_code=201)
def contact_attempt(
    eid: str,
    body: ContactAttempt,
    p: Principal = Depends(require("clinician", "coordinator")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    n = db.query(EpisodeEvent).filter_by(episode_id=ep.id, type="CONTACT_ATTEMPT").count() + 1
    s = staff_user(db, p)
    if ep.is_red and ep.red_acked_at is None:
        ep.red_acked_at = now()
    escalation = None
    if body.outcome == "reached_needs_emergency":
        escalation = {"level": 2, "to": "emergency_services_999"}
    elif n >= 3 and body.outcome in ("no_answer", "wrong_number", "voicemail_neutral"):
        escalation = {"level": 1, "to": "clinician_on_call_backup"}
    append(
        db,
        ep,
        "CONTACT_ATTEMPT",
        actor_type="staff",
        actor_id=s.id if s else None,
        data={
            "channel": body.channel,
            "outcome": body.outcome,
            "attempt_number": n,
            "escalation": escalation,
        },
    )
    db.commit()
    return {
        "event_seq": ep.last_event_seq,
        "type": "CONTACT_ATTEMPT",
        "attempt_number": n,
        "episode_state": ep.state,
        "escalation": escalation,
    }


@router.get("/episodes/{eid}/trajectory")
def trajectory(eid: str, p: Principal = Depends(current), db: Session = Depends(get_db)) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    points: dict[str, dict[str, Any]] = {}
    for s in ep.score_history:
        key = str(s["at"])[:10]
        pt = points.setdefault(key, {"at": s["at"]})
        pt[s["instrument"].lower()] = s["total"]
    pts = list(points.values())
    for i, pt in enumerate(pts):
        pt["label"] = "Baseline" if i == 0 else f"Re-check {i}"
    cls = {}
    if len(pts) >= 2:
        for inst in ("PHQ9", "GAD7"):
            k = inst.lower()
            vals = [x[k] for x in pts if k in x]
            if len(vals) >= 2:
                cls[inst] = rci.classify(inst, vals[0], vals[-1])
    db.commit()
    return {
        "points": pts,
        "rci_thresholds": rci.thresholds(),
        "caseness": {"PHQ9": 10, "GAD7": 8},
        "classification": cls,
    }


def _handoff_facts(db: Session, ep: Episode) -> list[dict[str, str]]:
    person = db.get(Person, ep.person_id)
    assert person is not None
    consents = consents_map(db, person.id)
    facts: list[dict[str, str]] = []

    def add(label: str, value: str, kind: str = "observed") -> None:
        facts.append({"id": f"F{len(facts) + 1}", "label": label, "value": value, "kind": kind})

    add("Person", f"{person.label}, {person.age}, {person.sex}, prefers {person.language.upper()}")
    latest: dict[str, dict[str, Any]] = {}
    for s in ep.score_history:
        latest[s["instrument"]] = s
    if "PHQ9" in latest:
        s = latest["PHQ9"]
        add(
            "PHQ-9 total",
            f"{s['total']} ({str(s.get('band', '')).replace('_', ' ')}), item 9 = {s.get('item9', 0)}",
            "calculated",
        )
    if "GAD7" in latest:
        s = latest["GAD7"]
        add("GAD-7 total", f"{s['total']} ({s.get('band', '')})", "calculated")
    add(
        "Crisis Gate",
        ("RED fired (" + ", ".join(r for r in ep.fired_rules if r.startswith("CG")) + ")")
        if ep.is_red
        else "no crisis rule fired",
        "calculated",
    )
    step = ep.current_step or ep.proposed_step
    if step:
        rules = ", ".join(r for r in ep.fired_rules if not r.startswith("CG")) or "SEV-MAX"
        add("Suggested step", f"{STEP_LABEL.get(step, step)} (rules {rules})", "calculated")
    if consents.get("share_physical_context") == "granted" and person.physical_context:
        pc = person.physical_context
        cond = "; ".join(person.conditions)
        add(
            "Physical context",
            f"{cond}; HbA1c {pc.get('hba1c_pct')}%, BMI {pc.get('bmi')}, BP "
            f"{pc.get('bp_systolic')}/{pc.get('bp_diastolic')} ({pc.get('source', 'screening')})",
        )
    add(
        "Preferences",
        f"{person.clinician_gender if person.clinician_gender != 'none' else 'any'} clinician, "
        f"{', '.join(m.replace('_', ' ') for m in person.modality) or 'any modality'}, "
        f"{person.insurance_plan} plan",
    )
    add("Request", "confirm the suggested step and offer a first appointment within 14 days")
    return facts


@router.post("/episodes/{eid}/handoff-summary")
def handoff_summary(
    eid: str,
    p: Principal = Depends(require("clinician", "coordinator", "judge")),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    ep = get_episode(db, eid, p)
    facts = _handoff_facts(db, ep)
    out = features.handoff(facts)
    db.commit()
    return {"facts": facts, **out, "generated_at": iso(now())}


@router.get("/fhir/export/{eid}")
def fhir_export(eid: str, p: Principal = Depends(current), db: Session = Depends(get_db)) -> dict[str, Any]:
    ep = get_episode(db, eid, p, purpose="care")
    loinc = {"PHQ9": ("44261-6", "PHQ-9 total score"), "GAD7": ("70274-6", "GAD-7 total score")}
    entries: list[dict[str, Any]] = []
    for i, s in enumerate(ep.score_history):
        code, disp = loinc.get(s["instrument"], ("", s["instrument"]))
        entries.append(
            {
                "fullUrl": f"urn:uuid:obs-{i}",
                "resource": {
                    "resourceType": "Observation",
                    "status": "final",
                    "code": {"coding": [{"system": "http://loinc.org", "code": code, "display": disp}]},
                    "valueInteger": s["total"],
                    "effectiveDateTime": s["at"],
                },
            }
        )
    for r in db.query(Referral).filter_by(episode_id=ep.id):
        entries.append(
            {
                "fullUrl": f"urn:uuid:{r.id}",
                "resource": {
                    "resourceType": "ServiceRequest",
                    "id": r.id,
                    "status": "active" if r.status == "requested" else "completed",
                    "intent": "order",
                    "priority": r.priority,
                    "authoredOn": iso(r.created_at),
                },
            }
        )
    db.commit()
    return {
        "resourceType": "Bundle",
        "type": "collection",
        "meta": {"tag": [{"code": "SYNTHETIC"}]},
        "entry": entries,
    }
