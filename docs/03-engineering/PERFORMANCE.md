# Performance
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Architecture](ARCHITECTURE.md) · [Frontend](FRONTEND.md) · [Backend](BACKEND.md) · [Testing](TESTING.md) · [Observability](../05-ops/OBSERVABILITY.md) · [Cost](../05-ops/COST.md)

Two numbers matter most: **the Crisis Gate answers fast** (server p95 < 300 ms; person sees the crisis screen in < 1 s), and **the person app is usable on a mid-range Android phone on mobile data**.

## 1. SLOs and SLIs

| ID | SLI (how measured) | MVP target (hackathon) | v1 target | Source of measurement |
|---|---|---|---|---|
| SLO-01 | **Crisis Gate server latency**, API-03 and API-04, request-in to response-out (incl. DB write) | **p95 < 300 ms**, p50 < 80 ms | same | `Server-Timing: gate;dur=…, total;dur=…` header + structlog `latency_ms`; Locust run |
| SLO-02 | Crisis Gate engine only (`crisis_gate.check`) | p99 < 20 ms | same | pytest-benchmark-style timing test in CI (fails > 50 ms on CI runner) |
| SLO-03 | Person sees crisis screen after tapping "See my result" (mid-range Android, 4G) | < 1 s | < 1 s | Playwright trace on emulated Moto G-class device; local lexicon makes this near-instant for free text |
| SLO-04 | Other API reads (API-05, -06, -11, -15) | p95 < 400 ms | p95 < 300 ms | Logs |
| SLO-05 | API-18 explanation (incl. LLM) | p95 < 6 s (timeout = template) | p95 < 3 s (cache) | `explanation_records.latency_ms` |
| SLO-06 | Programme metrics (API-16/17) on 5k synthetic episodes | p95 < 1.5 s | < 800 ms from snapshots | Logs |
| SLO-07 | SLA sweep lag (now − oldest unprocessed due item) | < 2 min | < 1 min | `scheduler_state`, `/healthz` |
| SLO-08 | Availability of `/v1` during judging window (18–20 Nov 2026 and judging days) | 99% (best effort; single instance) | 99.9% monthly | Uptime check on `/healthz` every 1 min |
| SLO-09 | Person-route TTI, Lighthouse mobile preset | **< 3.5 s** | < 3.0 s | Lighthouse CI |

**Error budget (v1):** 99.9% monthly availability ≈ 43 min of downtime. If more than half is spent, freeze feature releases and work only on reliability until the next month. The MVP has no formal budget; R-08 mitigations apply instead.

## 2. Crisis Gate budget (p95 < 300 ms server-side)

| Step | Budget | Notes |
|---|---|---|
| Auth + JWT verify + rate limit | 5 ms | HS256, in-process |
| Pydantic validation | 5 ms | |
| Crisis Gate engine | 20 ms | Pre-compiled lexicon patterns; normalisation done once per text |
| Scoring + episode-open + step matcher (API-03 only) | 20 ms | Pure Python over in-memory rules and a ≤ 200-row provider list |
| DB transaction (session, scores, episode, events, crisis event, audit) | 120 ms | Neon from Render Frankfurt; one round-trip batch where possible |
| Serialisation + network inside the platform | 30 ms | |
| **Headroom** | 100 ms | |

Rules that keep it there:
- **No LLM on the path.** M-02 runs after the response via `BackgroundTasks` (and is always off in Judge Mode).
- **No outbound HTTP on the path.** Notifications are queued, not sent inline.
- **Fail-closed deadline** of 250 ms around the gate engine itself: over budget ⇒ RED (see [ADR-0006](adr/ADR-0006-crisis-gate-raise-only-llm.md)).
- Keep DB and API in the same region (Render Frankfurt + Neon `eu-central-1`, or both on Render). Cross-region DB adds ~100 ms per round-trip.

## 3. Low-end device and network targets

**Reference device:** a mid-range Android phone (4–6 GB RAM, Cortex-A55/A76-class octa-core; e.g. Samsung Galaxy A1x/A2x or Moto G-series), Chrome stable. Emulated in CI with **Lighthouse mobile preset** (4× CPU slowdown, simulated slow 4G: 150 ms RTT, ~1.6 Mbps down) and in Playwright with the `Pixel 5`-class viewport. Low-literacy persona P-02 (Imran) uses such a phone.

| Metric | Person routes (S-01..S-15) | Crisis route S-06 | Staff / programme routes |
|---|---|---|---|
| TTI (Lighthouse mobile) | < 3.5 s | < 2.0 s | < 5 s (desktop/tablet primary) |
| LCP | < 2.5 s | < 1.5 s | < 3 s |
| INP | < 200 ms | < 200 ms | < 200 ms |
| CLS | < 0.1 | < 0.05 | < 0.1 |
| Initial JS (gzip) | ≤ 170 KB | ≤ 50 KB | ≤ 300 KB (charts lazy-loaded) |
| Total transfer first visit | ≤ 500 KB | ≤ 120 KB | — |
| Repeat visit (SW cache) | < 1.5 s TTI | instant offline | — |

3G (≈ 400 ms RTT, 400 kbps): person routes should still be usable within 6 s; S-06 works offline from precache. No 2G target (UAE mobile coverage is overwhelmingly 4G/5G [K]).

## 4. Load test plan (Locust 2.47)

| Test | Profile | Pass criteria | When |
|---|---|---|---|
| LT-01 Crisis Gate | 50 virtual users, ramp 10/s, 5 min, mix 70% API-04 / 30% API-03 with crisis and non-crisis payloads | SLO-01 met; 0 errors; 0 missed REDs (assert on every response) | H+24 of the build and before submission, against the Render demo deploy |
| LT-02 Judge storm | 20 judges × full tour script (demo-login, screen, result, staff queue, programme) concurrently | p95 < 800 ms on every call; no 5xx | Before submission |
| LT-03 SLA sweep | Seed 10k due items, run sweep | Sweep processes all within 60 s; no duplicate escalations | Nightly in CI (Postgres service container) |
| LT-04 Programme metrics | 50k synthetic episodes | API-16 p95 < 1.5 s | Before submission |

`tests/load/locustfile.py`; results stored as CI artefacts. The MVP load is tiny (a few judges), so LT-01 is about latency distribution, not throughput.

## 5. Caching

- **Client:** service-worker precache for shell, fonts, messages, crisis bundle. No PHI cached.
- **Server:** rules and lexicon compiled once at startup; provider directory cached 60 s; explanation cache by facts hash (banded facts repeat often, so hit rates should be high in v1).
- **HTTP:** `/v1/*` is `no-store`, except API-15 (`private, max-age=60`).
- **DB:** indexes in [DATA_MODEL](DATA_MODEL.md) cover queue (`state, next_deadline_at`), RED partial index, and per-episode score lookups.

## 6. Cost–performance trade-offs

| Choice | Performance effect | Cost effect | Decision |
|---|---|---|---|
| Render paid instance vs free | Avoids 30–60 s cold starts | Small monthly fee | Paid (or keep warm) during the judging window (R-08) |
| LLM per request vs cached | Cache cuts p95 from seconds to ms | Fewer tokens | Cache in v1; MVP volume too low to matter |
| M-02 on | +0 ms on the critical path (async) | Extra tokens per free-text submission | Off by default; never in Judge Mode |
| Metrics snapshots | Faster dashboard | Extra job + table | v1 only |
| Server components | Smaller JS on cheap phones | None | Default |

## 7. How we measure during the hackathon

1. `make perf` (or `uv run locust -f tests/load/locustfile.py --headless -u 50 -r 10 -t 5m --host $API`) after each deploy to the demo environment.
2. `pnpm lhci autorun` in CI on four routes (see [FRONTEND §7](FRONTEND.md#7-performance-budget)); budget file `apps/web/lighthouse-budget.json`.
3. `Server-Timing` headers visible in the browser devtools during the demo rehearsal.
4. Numbers that the team actually measured go into `docs/05-ops/OBSERVABILITY.md` and the pitch; no unmeasured claims.
