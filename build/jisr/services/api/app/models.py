"""ORM models (subset of DATA_MODEL.md E-01..E-21 needed for the MVP)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, new_id, now


class Person(Base):
    __tablename__ = "persons"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    persona: Mapped[str | None] = mapped_column(String(32), unique=True)
    label: Mapped[str] = mapped_column(String(80))
    sex: Mapped[str] = mapped_column(String(10))
    age: Mapped[int] = mapped_column(Integer)
    nationality_group: Mapped[str] = mapped_column(String(32))
    language: Mapped[str] = mapped_column(String(4), default="en")
    area: Mapped[str] = mapped_column(String(32), default="abu_dhabi_city")
    insurance_plan: Mapped[str] = mapped_column(String(16), default="basic")
    clinician_gender: Mapped[str] = mapped_column(String(8), default="none")
    modality: Mapped[list[str]] = mapped_column(JSON, default=list)
    discreet_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    read_aloud: Mapped[bool] = mapped_column(Boolean, default=False)
    physical_context: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    conditions: Mapped[list[str]] = mapped_column(JSON, default=list)


class StaffUser(Base):
    __tablename__ = "staff_users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    persona: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    role: Mapped[str] = mapped_column(String(16))
    provider_id: Mapped[str | None] = mapped_column(String(36), nullable=True)


class Provider(Base):
    __tablename__ = "providers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    display_name: Mapped[str] = mapped_column(String(120))
    kind: Mapped[str] = mapped_column(String(24))
    steps_served: Mapped[list[str]] = mapped_column(JSON)
    languages: Mapped[list[str]] = mapped_column(JSON)
    clinician_gender: Mapped[str] = mapped_column(String(8))
    modalities: Mapped[list[str]] = mapped_column(JSON)
    networks: Mapped[list[str]] = mapped_column(JSON)
    city: Mapped[str] = mapped_column(String(40))
    area: Mapped[str] = mapped_column(String(32))
    current_wait_days: Mapped[int] = mapped_column(Integer)
    accepting: Mapped[bool] = mapped_column(Boolean, default=True)


class Screening(Base):
    __tablename__ = "screenings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    stage: Mapped[str] = mapped_column(String(12))
    language: Mapped[str] = mapped_column(String(4))
    status: Mapped[str] = mapped_column(String(12), default="in_progress")
    answers: Mapped[dict[str, int]] = mapped_column(JSON, default=dict)
    scores: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    episode_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    crisis: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Episode(Base):
    __tablename__ = "episodes"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    state: Mapped[str] = mapped_column(String(24))
    current_step: Mapped[str | None] = mapped_column(String(4), nullable=True)
    proposed_step: Mapped[str | None] = mapped_column(String(4), nullable=True)
    is_red: Mapped[bool] = mapped_column(Boolean, default=False)
    red_severity: Mapped[str | None] = mapped_column(String(16), nullable=True)
    red_opened_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    red_acked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reason: Mapped[str] = mapped_column(String(160), default="")
    fired_rules: Mapped[list[str]] = mapped_column(JSON, default=list)
    factors: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)
    score_history: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    owner_staff_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    close_reason: Mapped[str | None] = mapped_column(String(32), nullable=True)
    last_event_seq: Mapped[int] = mapped_column(Integer, default=0)
    escalated: Mapped[bool] = mapped_column(Boolean, default=False)


class EpisodeEvent(Base):
    """Append-only ledger. Never updated or deleted."""

    __tablename__ = "episode_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    episode_id: Mapped[str] = mapped_column(ForeignKey("episodes.id"), index=True)
    seq: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(40))
    from_state: Mapped[str | None] = mapped_column(String(24), nullable=True)
    to_state: Mapped[str | None] = mapped_column(String(24), nullable=True)
    actor_type: Mapped[str] = mapped_column(String(8))
    actor_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    episode_id: Mapped[str] = mapped_column(ForeignKey("episodes.id"), index=True)
    status: Mapped[str] = mapped_column(String(12), default="proposed")
    step: Mapped[str] = mapped_column(String(4))
    source: Mapped[str] = mapped_column(String(16), default="initial")
    factors: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)
    excluded_provider_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Referral(Base):
    __tablename__ = "referrals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    episode_id: Mapped[str] = mapped_column(ForeignKey("episodes.id"), index=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"))
    status: Mapped[str] = mapped_column(String(12), default="requested")
    priority: Mapped[str] = mapped_column(String(8), default="routine")
    consent_scopes: Mapped[list[str]] = mapped_column(JSON, default=list)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    sla_due_at: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Appointment(Base):
    __tablename__ = "appointments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    referral_id: Mapped[str] = mapped_column(ForeignKey("referrals.id"))
    start_at: Mapped[datetime] = mapped_column(DateTime)
    modality: Mapped[str] = mapped_column(String(12))
    status: Mapped[str] = mapped_column(String(12), default="booked")


class Consent(Base):
    __tablename__ = "consents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    scope: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(8))
    version: Mapped[int] = mapped_column(Integer, default=1)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    channel: Mapped[str] = mapped_column(String(16), default="in_app")
    text: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    deep_link: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    person_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    actor_label: Mapped[str] = mapped_column(String(80))
    action: Mapped[str] = mapped_column(String(16))
    resource: Mapped[str] = mapped_column(String(80))
    purpose: Mapped[str] = mapped_column(String(24))
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class CohortRecord(Base):
    """Simulated programme cohort (synthetic) used for dashboard metrics. One row per simulated screen."""

    __tablename__ = "cohort"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    screened_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    sex: Mapped[str] = mapped_column(String(8))
    age_band: Mapped[str] = mapped_column(String(8))
    nationality_group: Mapped[str] = mapped_column(String(24))
    language: Mapped[str] = mapped_column(String(4))
    insurance_plan: Mapped[str] = mapped_column(String(12))
    area: Mapped[str] = mapped_column(String(20))
    positive: Mapped[bool] = mapped_column(Boolean)
    red: Mapped[bool] = mapped_column(Boolean, default=False)
    red_ack_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    referred: Mapped[bool] = mapped_column(Boolean, default=False)
    accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    accept_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    attended: Mapped[bool] = mapped_column(Boolean, default=False)
    days_to_care: Mapped[float | None] = mapped_column(Float, nullable=True)
    rechecked_on_time: Mapped[bool] = mapped_column(Boolean, default=False)
    improved: Mapped[bool] = mapped_column(Boolean, default=False)
    drop_off_reason: Mapped[str | None] = mapped_column(String(32), nullable=True)
    step: Mapped[str | None] = mapped_column(String(4), nullable=True)
