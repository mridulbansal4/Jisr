"""LLM provider switch. Only drafts text; never decides scores, steps or crisis clearance.

gemini: Google Gemini API via google-genai (synthetic data only, no UAE processing guarantee).
none:   deterministic templates (fully offline).
Any error, timeout or invalid JSON returns None → caller uses its template.
"""

from __future__ import annotations

import concurrent.futures
import json
import logging
from functools import cache, lru_cache
from pathlib import Path
from typing import Any

from app.config import ROOT, settings

log = logging.getLogger("jisr.llm")
_POOL = concurrent.futures.ThreadPoolExecutor(max_workers=4)


def provider_name() -> str:
    return "gemini" if settings.llm_active else "none"


@cache
def prompt(name: str) -> str:
    return (Path(ROOT) / "ai" / "prompts" / f"{name}.md").read_text(encoding="utf-8")


@lru_cache(maxsize=1)
def _client() -> Any:
    from google import genai
    from google.genai import types

    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(timeout=max(15000, int(settings.llm_timeout_seconds * 1000))),
    )


def _call(system: str, user: str, temperature: float) -> str:
    from google.genai import types

    resp = _client().models.generate_content(
        model=settings.gemini_model,
        contents=user,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=temperature,
            response_mime_type="application/json",
            max_output_tokens=4096,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        ),
    )
    return resp.text or ""


def generate_json(prompt_name: str, payload: dict[str, Any], temperature: float = 0.3) -> dict[str, Any] | None:
    """Return parsed JSON from the model, or None on any failure (caller falls back to template)."""
    if not settings.llm_active:
        return None
    import time

    deadline = time.monotonic() + settings.llm_timeout_seconds + 1
    system = prompt(prompt_name)
    for attempt in (1, 2):
        remaining = deadline - time.monotonic()
        if remaining < 1.5:
            break
        try:
            fut = _POOL.submit(_call, system, json.dumps(payload, ensure_ascii=False), temperature)
            data = _parse(fut.result(timeout=remaining))
            if isinstance(data, dict):
                return data
            raise ValueError("not a JSON object")
        except Exception as exc:  # noqa: BLE001, any LLM failure → retry once, then template
            log.warning("llm_failed prompt=%s attempt=%d error=%s", prompt_name, attempt, type(exc).__name__)
            if isinstance(exc, concurrent.futures.TimeoutError):
                break
    return None


def _parse(text: str) -> Any:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`").removeprefix("json").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise
