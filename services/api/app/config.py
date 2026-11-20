"""Settings from environment (repo-root .env is loaded if present)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(
    ROOT / ".env", override=os.getenv("JISR_DOTENV_OVERRIDE", "1") == "1"
)  # project .env wins (tests opt out)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def _bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    return default if v is None else v.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{(Path(__file__).resolve().parents[1] / 'jisr.db').as_posix()}"
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-only-secret-change-me-32-bytes!!")
    jwt_ttl_minutes: int = int(os.getenv("JWT_TTL_MINUTES", "240"))
    cors_origins: tuple[str, ...] = tuple(
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if o.strip()
    )
    demo_mode: bool = _bool("DEMO_MODE", True)
    judge_passcode: str = os.getenv("JUDGE_PASSCODE", "jisr-demo")
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    llm_timeout_seconds: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "8"))
    sla_red_minutes: int = int(os.getenv("SLA_RED_MINUTES", "15"))
    sla_referral_hours: int = int(os.getenv("SLA_REFERRAL_ACCEPT_HOURS", "48"))
    sla_first_appt_days: int = int(os.getenv("SLA_FIRST_APPOINTMENT_DAYS", "14"))
    sla_recheck_days: int = int(os.getenv("RECHECK_DAYS", "14"))
    jobs_enabled: bool = _bool("JOBS_ENABLED", True)
    cssrs_enabled: bool = _bool("FF_CSSRS_ITEMS", False)

    @property
    def llm_active(self) -> bool:
        return self.llm_provider == "gemini" and bool(self.gemini_api_key)


settings = Settings()
