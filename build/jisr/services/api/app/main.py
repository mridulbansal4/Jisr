"""Jisr API entry point. Run: uv run uvicorn app.main:app --reload --port 8000"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import timedelta
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import rules
from app.auth import Problem
from app.config import settings
from app.db import Base, SessionLocal, engine, now
from app.ledger import append
from app.llm.provider import provider_name
from app.models import Episode, Person, Referral
from app.routes import episodes, people, programme, screening

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("jisr")


def sla_sweep() -> None:
    """Escalate overdue RED acknowledgements and provider decisions (append-only events, once each)."""
    db = SessionLocal()
    try:
        t = now()
        for ep in db.query(Episode).filter(Episode.is_red.is_(True), Episode.red_acked_at.is_(None),
                                           Episode.escalated.is_(False)):
            if ep.red_opened_at and t - ep.red_opened_at > timedelta(minutes=settings.sla_red_minutes):
                ep.escalated = True
                append(db, ep, "SLA_BREACHED", actor_type="system",
                       data={"kind": "crisis_ack", "escalate_to": "clinician_on_call_backup"})
        for ref in db.query(Referral).filter(Referral.status == "requested", Referral.sla_due_at < t):
            ep = db.get(Episode, ref.episode_id)
            if ep and not ep.escalated:
                ep.escalated = True
                append(db, ep, "SLA_BREACHED", data={"kind": "referral_accept", "escalate_to": "coordinator"})
        db.commit()
    except Exception:  # noqa: BLE001
        log.exception("sla_sweep_failed")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(engine)
    rules.rule_set_version()  # fail fast if rule files are missing
    db = SessionLocal()
    try:
        if db.query(Person).count() == 0 and settings.demo_mode:
            from app.seed import reset

            log.info("empty database: seeding synthetic demo data")
            reset(db)
    finally:
        db.close()
    sched = None
    if settings.jobs_enabled:
        from apscheduler.schedulers.background import BackgroundScheduler

        sched = BackgroundScheduler(daemon=True)
        sched.add_job(sla_sweep, "interval", seconds=60, id="sla_sweep")
        sched.start()
    log.info("jisr api ready rules=%s llm=%s model=%s", rules.rule_set_version(), provider_name(),
             settings.gemini_model)
    yield
    if sched:
        sched.shutdown(wait=False)


app = FastAPI(title="Jisr API", version="0.2.0", lifespan=lifespan,
              description="Synthetic data only. Deterministic engines decide; clinicians confirm; AI only drafts.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["ETag"],
)


def _problem(status: int, code: str, title: str, detail: str | None = None, **extra: Any) -> JSONResponse:
    body = {"type": f"https://jisr.example/problems/{code.lower()}", "title": title, "status": status,
            "code": code, **({"detail": detail} if detail else {}), **extra}
    return JSONResponse(body, status_code=status, media_type="application/problem+json")


@app.exception_handler(Problem)
async def problem_handler(_: Request, exc: Problem) -> JSONResponse:
    return _problem(exc.status_code, exc.code, exc.title, exc.detail, **exc.extra)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errs = [{"loc": list(e.get("loc", [])), "msg": e.get("msg", "")} for e in exc.errors()]
    return _problem(422, "VALIDATION_FAILED", "Request validation failed", errors=errs)


@app.exception_handler(StarletteHTTPException)
async def http_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = {401: "UNAUTHENTICATED", 403: "FORBIDDEN", 404: "NOT_FOUND", 405: "BAD_REQUEST"}.get(
        exc.status_code, "BAD_REQUEST")
    return _problem(exc.status_code, code, str(exc.detail))


@app.get("/healthz", tags=["ops"])
def healthz() -> dict[str, Any]:
    return {"status": "ok", "rules_version": rules.rule_set_version(), "llm_provider": provider_name(),
            "demo_mode": settings.demo_mode, "data": "synthetic"}


for r in (screening.router, episodes.router, people.router, programme.router):
    app.include_router(r)
