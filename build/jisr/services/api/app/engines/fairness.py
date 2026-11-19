"""Small-cell suppression (k=10) with complementary suppression."""

from __future__ import annotations

import math
from typing import Any

K = 10


def wilson(successes: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return (0.0, 0.0)
    p = successes / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
    return (round(max(0.0, centre - half) * 100, 1), round(min(1.0, centre + half) * 100, 1))


def suppress(rows: list[dict[str, Any]], k: int = K) -> list[dict[str, Any]]:
    """rows: {group, n, successes|value}. Primary: n<k. Complementary: if exactly one primary-suppressed
    row exists, also suppress the next-smallest row so it cannot be derived from the total."""
    out = [dict(r) for r in rows]
    primary = [r for r in out if r["n"] < k]
    for r in primary:
        r["suppression"] = "primary"
    if len(primary) == 1:
        rest = sorted((r for r in out if r["n"] >= k), key=lambda r: r["n"])
        if rest:
            rest[0]["suppression"] = "complementary"
    for r in out:
        r.setdefault("suppression", None)
    return out
