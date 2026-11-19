"""Judge Mode demo auth (HS256 JWT) + RFC 9457 problems + role dependencies."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Any

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db, now
from app.models import Person, StaffUser

PERSONAS: dict[str, str] = {
    "judge": "judge",
    "mariam": "person",
    "imran": "person",
    "dr_salma": "clinician",
    "khalid": "coordinator",
    "programme_lead": "programme",
}

SCOPES: dict[str, list[str]] = {
    "person": ["screening:write", "episode:read:own", "consent:write", "me:read", "companion:chat"],
    "clinician": ["queue:read", "episode:read", "step:confirm", "episode:close", "referral:decide", "red:ack"],
    "coordinator": ["queue:read", "episode:read", "referral:decide", "red:ack", "fhir:import"],
    "programme": ["programme:read", "evals:read"],
    "judge": ["programme:read", "evals:read", "demo:reset", "episode:read", "queue:read", "fhir:import"],
}


class Problem(HTTPException):
    def __init__(self, status: int, code: str, title: str, detail: str | None = None, **extra: Any) -> None:
        super().__init__(status_code=status, detail=detail)
        self.code = code
        self.title = title
        self.extra = extra


@dataclass
class Principal:
    role: str
    persona: str
    subject_id: str  # person id or staff id ("judge" for judge)
    label: str

    @property
    def is_staff(self) -> bool:
        return self.role in ("clinician", "coordinator")


def issue_token(persona: str, subject_id: str, role: str, label: str) -> dict[str, Any]:
    exp = now() + timedelta(minutes=settings.jwt_ttl_minutes)
    token = jwt.encode(
        {"sub": subject_id, "role": role, "persona": persona, "label": label, "exp": exp},
        settings.jwt_secret,
        algorithm="HS256",
    )
    return {
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": settings.jwt_ttl_minutes * 60,
        "role": role,
        "persona": persona,
        "scopes": SCOPES[role],
        "judge": persona == "judge",
    }


def resolve_login(db: Session, persona: str) -> tuple[str, str, str]:
    role = PERSONAS.get(persona)
    if role is None:
        raise Problem(404, "NOT_FOUND", "Unknown persona")
    if role == "judge":
        return "judge", role, "Judge (observer)"
    if role == "person":
        p = db.query(Person).filter_by(persona=persona).one_or_none()
        if p is None:
            raise Problem(404, "NOT_FOUND", "Persona not seeded, run demo reset")
        return p.id, role, p.label
    s = db.query(StaffUser).filter_by(persona=persona).one_or_none()
    if s is None:
        raise Problem(404, "NOT_FOUND", "Persona not seeded, run demo reset")
    return s.id, role, s.name


def current(authorization: str | None = Header(default=None)) -> Principal:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise Problem(401, "UNAUTHENTICATED", "Missing bearer token")
    try:
        claims = jwt.decode(authorization[7:], settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise Problem(401, "UNAUTHENTICATED", "Invalid or expired token") from exc
    return Principal(claims["role"], claims["persona"], claims["sub"], claims.get("label", ""))


def require(*roles: str):  # type: ignore[no-untyped-def]
    def dep(p: Principal = Depends(current)) -> Principal:
        if p.role not in roles:
            raise Problem(403, "FORBIDDEN", f"Role '{p.role}' cannot do this")
        return p

    return dep


def staff_user(db: Session, p: Principal) -> StaffUser | None:
    return db.get(StaffUser, p.subject_id) if p.is_staff else None


__all__ = ["Principal", "Problem", "current", "require", "issue_token", "resolve_login", "get_db"]
