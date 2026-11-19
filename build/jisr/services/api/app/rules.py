"""Loads the versioned clinical rule files from packages/rules (the only place thresholds live)."""

from __future__ import annotations

import json
import os
from functools import cache
from pathlib import Path
from typing import Any


def rules_dir() -> Path:
    env = os.getenv("RULES_DIR")
    if env:
        return Path(env)
    # services/api/app/rules.py -> repo root is parents[3]
    return Path(__file__).resolve().parents[3] / "packages" / "rules"


@cache
def load(name: str) -> dict[str, Any]:
    path = rules_dir() / f"{name}.v1.json"
    with path.open(encoding="utf-8") as fh:
        data: dict[str, Any] = json.load(fh)
    return data


def instruments() -> dict[str, Any]:
    return load("instruments")


def lexicon() -> dict[str, Any]:
    return load("crisis_lexicon")


def step_rules() -> dict[str, Any]:
    return load("step_rules")


def sla_rules() -> dict[str, Any]:
    return load("sla")


def rule_set_version() -> str:
    return (
        f"instruments@{instruments()['version']}+crisis_lexicon@{lexicon()['version']}"
        f"+step_rules@{step_rules()['version']}"
    )
