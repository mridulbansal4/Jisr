"""API-01..04, me/episodes, API-18 explain."""

from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import rules
from app.auth import Principal, Problem, current, require
from app.care import build_recommendation, get_episode, open_red
from app.config import settings
from app.db import get_db, iso, now
from app.engines import crisis_gate, scoring
from app.engines.step_matcher import StepInput, match
from app.ledger import append, consents_map
from app.llm import features
from app.models import Episode, Person, Screening

router = APIRouter(prefix="/v1", tags=["screening"])

PRESCREEN = ["PHQ9_1", "PHQ9_2", "GAD7_1", "GAD7_2"]
FULL = [*scoring.PHQ9_LINKS, scoring.PHQ9_DIFFICULTY, *scoring.GAD7_LINKS]
INSTRUMENT_NAMES = {"PHQ9": "PHQ-9", "GAD7": "GAD-7", "PHQ2": "PHQ-2", "GAD2": "GAD-2"}


class ScreeningCreate(BaseModel):
    language: Literal["ar", "en", "ur"] = "en"
    stage: Literal["prescreen", "full"] = "prescreen"
    source: str = "jisr_app"


class AnswersSubmit(BaseModel):
    answers: dict[str, int | bool] = Field(default_factory=dict)
    free_text: str | None = Field(default=None, max_length=2000)


class CompleteBody(BaseModel):
    request_support: bool = False


class CrisisCheck(BaseModel):
    text: str = Field(default="", max_length=2000)
    source: Literal["free_text", "help_button", "clinician_note"] = "free_text"
    language_hint: str | None = None
    episode_id: str | None = None


class ExplainRequest(BaseModel):
    episode_id: str
    kind: str = "result"
    language: Literal["ar", "en", "ur"] = "en"


def _items(links: list[str], stage: str) -> list[dict[str, Any]]:
    items = scoring.items_for(links)
    if stage == "prescreen":
        for it in items:
            it["instrument"] = "PHQ2" if it["instrument"] == "PHQ9" else "GAD2"
    return items


def _session_dict(s: Screening) -> dict[str, Any]:
    links = PRESCREEN if s.stage == "prescreen" else FULL
    return {"id": s.id, "status": s.status, "stage": s.stage, "language": s.language,
            "items": _items(links, s.stage), "rule_set_version": rules.rule_set_version()}


def _person(db: Session, p: Principal) -> Person:
    if p.role != "person":
        raise Problem(403, "FORBIDDEN", "Only a person can screen")
    person = db.get(Person, p.subject_id)
    if person is None:
        raise Problem(404, "NOT_FOUND", "Person not found, reset the demo")
    return person


def _get_screening(db: Session, sid: str, person: Person) -> Screening:
    s = db.get(Screening, sid)
    if s is None or s.person_id != person.id:
        raise Problem(404, "NOT_FOUND", "Screening not found")
    return s


@router.post("/screenings", status_code=201)
def create_screening(body: ScreeningCreate, p: Principal = Depends(current),
                     db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    s = Screening(person_id=person.id, stage=body.stage, language=body.language)
    db.add(s)
    db.commit()
    return _session_dict(s)


@router.post("/screenings/{sid}/answers")
def submit_answers(sid: str, body: AnswersSubmit, p: Principal = Depends(current),
                   db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    s = _get_screening(db, sid, person)
    try:
        incoming = scoring.validate_answers(dict(body.answers))
    except scoring.InvalidAnswer as exc:
        raise Problem(422, "VALIDATION_FAILED", "Invalid answer", str(exc)) from exc
    merged = dict(s.answers)
    for k, v in incoming.items():
        merged[k] = max(v, merged.get(k, v))  # conflicting answer → keep higher (raise-only)
    s.answers = merged
    next_items: list[dict[str, Any]] = []
    if s.stage == "prescreen" and all(k in merged for k in PRESCREEN):
        phq2, gad2 = scoring.score_prescreen(merged)
        if scoring.prescreen_positive(phq2, gad2):
            s.stage = "full"
            next_items = _items([lk for lk in FULL if lk not in merged], "full")
    gate = crisis_gate.evaluate(phq9_item9=merged.get("PHQ9_9"), free_text=body.free_text)
    episode_id = None
    if gate.red:
        s.crisis = True
        ep = open_red(db, person, gate, "Crisis Gate during screening", actor_type="person")
        episode_id = ep.id
        s.episode_id = ep.id
    db.commit()
    return {"id": s.id, "stage": s.stage, "next_items": next_items, "crisis": gate.red,
            "crisis_lines": crisis_gate.crisis_lines_for(gate.severity) if gate.red else [],
            "episode_id": episode_id, "urgency": _urgency(gate)}


def _urgency(gate: crisis_gate.GateResult) -> str | None:
    if not gate.red:
        return None
    return "same_day_check" if gate.severity == "same_day_check" else "emergency"


@router.post("/screenings/{sid}/complete")
def complete_screening(sid: str, body: CompleteBody | None = None, p: Principal = Depends(current),
                       db: Session = Depends(get_db)) -> dict[str, Any]:
    person = _person(db, p)
    s = _get_screening(db, sid, person)
    body = body or CompleteBody()
    if s.status == "completed" and not body.request_support:
        return _complete_result(db, s, person, cached=True)
    a = s.answers
    phq9 = scoring.score_phq9(a)
    gad7 = scoring.score_gad7(a)
    phq2, gad2 = scoring.score_prescreen(a)
    phq9_started = s.stage == "full" or any(k in a for k in scoring.PHQ9_LINKS[2:])
    gate = crisis_gate.evaluate(phq9_started=phq9_started, phq9_item9=a.get("PHQ9_9"),
                                cssrs_enabled=settings.cssrs_enabled)
    t = now()
    scores: list[dict[str, Any]] = []
    for sc in (phq9, gad7):
        if sc.total is not None:
            d: dict[str, Any] = {"instrument": sc.instrument, "total": sc.total, "band": sc.band, "at": iso(t)}
            if sc.instrument == "PHQ9":
                d["item9"] = sc.item9
            scores.append(d)
    if not scores:
        for sc in (phq2, gad2):
            if sc.total is not None:
                scores.append({"instrument": sc.instrument, "total": sc.total, "band": sc.band, "at": iso(t)})
    s.scores = scores
    s.status = "completed"
    s.completed_at = t

    inp = StepInput(phq9_total=phq9.total, phq9_item9=phq9.item9, phq9_difficulty=phq9.difficulty,
                    gad7_total=gad7.total, self_referral=body.request_support, crisis=gate.red,
                    comorbidity_flag=bool(person.conditions)
                    and consents_map(db, person.id).get("share_physical_context") == "granted")
    result = match(inp)
    if gate.red:
        ep = open_red(db, person, gate, "Crisis Gate: PHQ-9 item 9" if a.get("PHQ9_9") else "Crisis Gate",
                      episode=db.get(Episode, s.episode_id) if s.episode_id else None, actor_type="person")
        ep.score_history = [*ep.score_history, *[x for x in scores if x["instrument"] in ("PHQ9", "GAD7")]]
        s.episode_id = ep.id
        s.crisis = True
    elif result.state == "SUGGESTED":
        ep = db.get(Episode, s.episode_id) if s.episode_id else None
        if ep is None:
            ep = Episode(person_id=person.id, state="SCREENED_POSITIVE",
                         reason=("Self-referral" if body.request_support and not (phq9.total or 0) >= 10
                                 and not (gad7.total or 0) >= 10 else
                                 f"Positive screen (PHQ-9 {phq9.total}, GAD-7 {gad7.total})"))
            db.add(ep)
            db.flush()
        ep.score_history = [*ep.score_history, *[x for x in scores if x["instrument"] in ("PHQ9", "GAD7")]]
        ep.proposed_step = result.level
        ep.fired_rules = result.fired_rules
        ep.factors = result.factors
        append(db, ep, "SCREENING_COMPLETED", to_state="SCREENED_POSITIVE", actor_type="person",
               data={"scores": {x["instrument"]: x["total"] for x in scores}})
        append(db, ep, "STEP_RECOMMENDED", to_state="STEP_RECOMMENDED",
               data={"step": result.level, "rules": result.fired_rules})
        build_recommendation(db, ep)
        s.episode_id = ep.id
    db.commit()
    return _complete_result(db, s, person, gate=gate)


def _complete_result(db: Session, s: Screening, person: Person, cached: bool = False,
                     gate: crisis_gate.GateResult | None = None) -> dict[str, Any]:
    ep = db.get(Episode, s.episode_id) if s.episode_id else None
    crisis = bool(ep and ep.is_red) or s.crisis
    severity = ep.red_severity if ep and ep.is_red else None
    positive = ep is not None
    return {
        "session_id": s.id,
        "crisis": crisis,
        "positive": positive,
        "scores": [{"instrument": x["instrument"], "total": x["total"], "band": x["band"],
                    "item9": x.get("item9"), "scored_at": x["at"]} for x in s.scores],
        "episode": {"id": ep.id, "state": ep.state, "proposed_step": ep.proposed_step} if ep else None,
        "crisis_lines": crisis_gate.crisis_lines_for(severity) if crisis else [],
        "next_contact": "A clinician will contact you within 15 minutes." if crisis else
        ("A clinician will review your suggested step within 48 hours." if positive else ""),
        "llm_locked": crisis,
        "urgency": ("same_day_check" if severity == "same_day_check" else "emergency") if crisis else None,
        "can_request_support": not positive,
        "recheck_reminder_offer_days": settings.sla_recheck_days,
        "explanation_available": positive or bool(s.scores),
        "self_help": [] if positive else ["Sleep routine (5 min read)", "Breathing exercise (3 min)",
                                         "When to ask for help"],
    }


@router.post("/crisis/check")
def crisis_check(body: CrisisCheck, p: Principal = Depends(current), db: Session = Depends(get_db)) -> dict[str, Any]:
    gate = crisis_gate.evaluate(free_text=body.text, help_button=body.source == "help_button")
    episode_id = None
    state = None
    if gate.red and p.role == "person":
        person = db.get(Person, p.subject_id)
        if person:
            ep = db.get(Episode, body.episode_id) if body.episode_id else None
            if ep is not None and ep.person_id != person.id:
                ep = None
            reason = "Asked for help now" if body.source == "help_button" else "Crisis Gate: free-text phrase"
            ep = open_red(db, person, gate, reason, episode=ep, actor_type="person")
            episode_id, state = ep.id, ep.state
            db.commit()
    return {
        "crisis": gate.red,
        "matched_rule_ids": gate.fired_rules + [h.entry_id for h in gate.hits],
        "categories": sorted({h.category for h in gate.hits}),
        "severity": gate.severity,
        "urgency": _urgency(gate),
        "crisis_lines": crisis_gate.crisis_lines_for(gate.severity) if gate.red else [],
        "episode_state": state,
        "episode_id": episode_id,
        "latency_ms": gate.latency_ms,
    }


@router.get("/me/episodes")
def my_episodes(p: Principal = Depends(require("person")), db: Session = Depends(get_db)) -> dict[str, Any]:
    eps = db.query(Episode).filter_by(person_id=p.subject_id).order_by(Episode.opened_at.desc()).all()
    return {"items": [{"id": e.id, "state": e.state, "current_step": e.current_step or e.proposed_step,
                       "is_red": e.is_red, "opened_at": iso(e.opened_at)} for e in eps]}


@router.post("/explain")
def explain(body: ExplainRequest, p: Principal = Depends(current), db: Session = Depends(get_db)) -> dict[str, Any]:
    ep = get_episode(db, body.episode_id, p)
    person = db.get(Person, ep.person_id)
    assert person is not None
    latest: dict[str, dict[str, Any]] = {}
    for s in ep.score_history:
        latest[s["instrument"]] = s
    facts = {
        "language": body.language,
        "crisis": ep.is_red,
        "scores": [{"instrument_name": INSTRUMENT_NAMES[k], "total": v["total"],
                    "band": str(v.get("band", "")).replace("_", " ")} for k, v in latest.items()],
        "step": ep.current_step or ep.proposed_step,
        "step_name": features.STEP_NAMES.get(ep.current_step or ep.proposed_step or "", ""),
        "privacy": "Nothing is shared with your employer.",
        "clinician_confirms": True,
    }
    out = features.explain(facts)
    import uuid

    return {"explanation_id": str(uuid.uuid4()), "language": body.language, **out,
            "facts_used": facts}
