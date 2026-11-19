"""API-14, 15, 22, 23, 26, 27, 28, 29 + Jisr Companion chat."""

from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import rules
from app.auth import Principal, Problem, current, issue_token, require, resolve_login
from app.care import open_red
from app.config import settings
from app.db import get_db, iso
from app.engines import crisis_gate
from app.ledger import CONSENT_SCOPES, audit, consents_map, provider_dict
from app.llm import features
from app.models import AuditLog, Consent, Episode, Notification, Person, Provider

router = APIRouter(prefix="/v1")

NOTICE_VERSION = "2026-11-18"
EFFECTS = {
    "share_with_receiving_provider": "Your scores and suggested step go to the clinic you choose, nobody else.",
    "share_physical_context": "Your clinician can see relevant physical-health results (e.g. HbA1c, blood pressure).",
    "ai_drafted_summaries": "AI may draft plain-language text; a validator checks every claim.",
    "store_free_text": "Your typed words are kept; otherwise only the safety-check result is stored.",
    "notify_sms": "Discreet SMS reminders (no health words).",
    "notify_whatsapp": "Discreet WhatsApp reminders (no health words).",
}


class DemoLogin(BaseModel):
    persona: Literal["judge", "mariam", "imran", "dr_salma", "khalid", "programme_lead"]
    passcode: str = Field(min_length=1)


class ConsentItem(BaseModel):
    scope: str
    status: Literal["granted", "revoked"]


class ConsentUpdate(BaseModel):
    notice_version: str = NOTICE_VERSION
    consents: list[ConsentItem]


class Preferences(BaseModel):
    language: Literal["ar", "en", "ur"] | None = None
    clinician_gender: Literal["female", "male", "none"] | None = None
    modality: list[Literal["in_person", "video", "phone"]] | None = None
    area: Literal["abu_dhabi_city", "al_ain", "al_dhafra"] | None = None
    insurance_plan: Literal["thiqa", "basic", "enhanced", "other", "none"] | None = None
    discreet_mode: bool | None = None
    read_aloud: bool | None = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=2000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list, max_length=40)
    language: Literal["ar", "en", "ur"] = "en"
    episode_id: str | None = None


class DemoReset(BaseModel):
    seed: int = 42
    scenario: Literal["judge_tour", "empty", "busy_queue"] = "judge_tour"


def _person(db: Session, p: Principal) -> Person:
    if p.role != "person":
        raise Problem(403, "FORBIDDEN", "Person only")
    person = db.get(Person, p.subject_id)
    if person is None:
        raise Problem(404, "NOT_FOUND", "Person not found")
    return person


@router.post("/auth/demo-login", tags=["auth"])
def demo_login(body: DemoLogin, db: Session = Depends(get_db)) -> dict[str, Any]:
    if not settings.demo_mode:
        raise Problem(404, "NOT_FOUND", "Demo mode is off")
    if body.passcode != settings.judge_passcode:
        raise Problem(401, "UNAUTHENTICATED", "Wrong passcode")
    sub, role, label = resolve_login(db, body.persona)
    audit(db, sub if role == "person" else None, label, "login", "session", "demo")
    db.commit()
    return issue_token(body.persona, sub, role, label)


@router.get("/consents", tags=["consents"])
def get_consents(p: Principal = Depends(require("person")), db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    return _consent_set(db, person.id)


def _consent_set(db: Session, person_id: str) -> dict[str, Any]:
    m = consents_map(db, person_id)
    rows = {r.scope: r for r in db.query(Consent).filter_by(person_id=person_id).order_by(Consent.recorded_at)}
    return {"notice_version": NOTICE_VERSION,
            "consents": [{"scope": s, "status": m[s], "version": 1,
                          "recorded_at": iso(rows[s].recorded_at) if s in rows else None,
                          "effect": EFFECTS[s]} for s in CONSENT_SCOPES],
            "effects": [EFFECTS[s] for s in CONSENT_SCOPES if m[s] == "granted"]}


@router.put("/consents", tags=["consents"])
def put_consents(body: ConsentUpdate, p: Principal = Depends(require("person")),
                 db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    for c in body.consents:
        if c.scope not in CONSENT_SCOPES:
            raise Problem(422, "VALIDATION_FAILED", f"Unknown scope {c.scope}")
        db.add(Consent(person_id=person.id, scope=c.scope, status=c.status))
        audit(db, person.id, person.label, "consent_change", f"consent:{c.scope}", "self")
    db.commit()
    return _consent_set(db, person.id)


@router.get("/providers", tags=["providers"])
def providers(step: str | None = None, language: str | None = None, gender: str | None = None,
              modality: str | None = None, network: str | None = None, city: str | None = None,
              accepting: bool | None = None, p: Principal = Depends(current),
              db: Session = Depends(get_db)) -> dict[str, Any]:
    out = []
    for pr in db.query(Provider).all():
        if step and step not in pr.steps_served:
            continue
        if language and language not in pr.languages:
            continue
        if gender and pr.clinician_gender != gender:
            continue
        if modality and modality not in pr.modalities:
            continue
        if network and network not in pr.networks:
            continue
        if city and pr.city.lower() != city.lower():
            continue
        if accepting is not None and pr.accepting != accepting:
            continue
        out.append(provider_dict(pr))
    return {"items": out, "next_cursor": None}


@router.get("/audit/me", tags=["audit"])
def audit_me(p: Principal = Depends(require("person")), db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(AuditLog).filter_by(person_id=p.subject_id).order_by(AuditLog.occurred_at.desc()).limit(50)
    return {"items": [{"occurred_at": iso(r.occurred_at), "actor_label": r.actor_label, "action": r.action,
                       "resource": r.resource.split(":")[0], "purpose": r.purpose} for r in rows],
            "next_cursor": None}


def _prefs(person: Person) -> dict[str, Any]:
    return {"language": person.language, "clinician_gender": person.clinician_gender, "modality": person.modality,
            "area": person.area, "insurance_plan": person.insurance_plan, "discreet_mode": person.discreet_mode,
            "read_aloud": person.read_aloud}


@router.get("/me/preferences", tags=["me"])
def get_prefs(p: Principal = Depends(require("person")), db: Session = Depends(get_db)) -> dict[str, Any]:
    return _prefs(_person(db, p))


@router.put("/me/preferences", tags=["me"])
def put_prefs(body: Preferences, p: Principal = Depends(require("person")),
              db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(person, k, v)
    db.commit()
    return _prefs(person)


@router.get("/me/notifications", tags=["me"])
def notifications(unread_only: bool = False, p: Principal = Depends(require("person")),
                  db: Session = Depends(get_db)) -> dict[str, Any]:
    q = db.query(Notification).filter_by(person_id=p.subject_id)
    rows = q.order_by(Notification.created_at.desc()).all()
    items = [{"id": n.id, "created_at": iso(n.created_at), "channel": n.channel, "text": n.text, "read": n.read,
              "deep_link": n.deep_link} for n in rows if not (unread_only and n.read)]
    return {"items": items, "unread_count": sum(1 for n in rows if not n.read), "next_cursor": None}


@router.post("/me/notifications/{nid}/read", status_code=204, tags=["me"])
def mark_read(nid: str, p: Principal = Depends(require("person")), db: Session = Depends(get_db)) -> Response:
    n = db.get(Notification, nid)
    if n and n.person_id == p.subject_id:
        n.read = True
        db.commit()
    return Response(status_code=204)


@router.post("/demo/reset", tags=["demo"])
def demo_reset(body: DemoReset | None = None, p: Principal = Depends(require("judge")),
               db: Session = Depends(get_db)) -> dict[str, Any]:
    if not settings.demo_mode:
        raise Problem(404, "NOT_FOUND", "Demo mode is off")
    from app.seed import reset

    body = body or DemoReset()
    db.close()
    from app.db import SessionLocal

    fresh = SessionLocal()
    try:
        out = reset(fresh, body.scenario, body.seed)
    finally:
        fresh.close()
    return {**out, "rules_version": rules.rule_set_version()}


@router.post("/events", status_code=202, tags=["analytics"])
def events(body: dict[str, Any]) -> dict[str, Any]:
    evs = body.get("events", []) if isinstance(body, dict) else []
    return {"accepted": len(evs) if isinstance(evs, list) else 0, "rejected": 0}


@router.post("/companion/chat", tags=["ai"])
def companion_chat(body: ChatRequest, p: Principal = Depends(require("person", "judge")),
                   db: Session = Depends(get_db)) -> dict[str, Any]:
    msgs = [m.model_dump() for m in body.messages]
    last_user = next((m["content"] for m in reversed(msgs) if m["role"] == "user"), "")
    gate = crisis_gate.evaluate(free_text=last_user)  # BEFORE any LLM call
    gate_out = {"crisis": gate.red, "severity": gate.severity,
                "matched_rule_ids": gate.fired_rules + [h.entry_id for h in gate.hits],
                "categories": sorted({h.category for h in gate.hits}), "latency_ms": gate.latency_ms}
    if gate.red:
        episode_id = None
        if p.role == "person":
            person = db.get(Person, p.subject_id)
            if person:
                ep = db.get(Episode, body.episode_id) if body.episode_id else None
                if ep is not None and ep.person_id != person.id:
                    ep = None
                ep = open_red(db, person, gate, "Crisis Gate: Companion message", episode=ep, actor_type="person")
                episode_id = ep.id
                db.commit()
        return {"reply": features.CRISIS_REPLY.get(body.language, features.CRISIS_REPLY["en"]),
                "content_type": "template", "provider": "none", "gate": gate_out,
                "validator": {"result": "skipped", "findings": ["crisis: AI locked"]},
                "suggestions": [], "crisis_lines": crisis_gate.crisis_lines_for(gate.severity),
                "episode_id": episode_id, "llm_locked": True}
    out = features.companion(msgs, body.language)
    return {**out, "gate": gate_out, "crisis_lines": [], "episode_id": body.episode_id, "llm_locked": False}
