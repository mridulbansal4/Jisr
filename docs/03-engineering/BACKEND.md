# Backend
> Project: Jisr · Owner: Backend lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Architecture](ARCHITECTURE.md) · [API spec](API_SPEC.md) · [Data model](DATA_MODEL.md) · [Coding standards](CODING_STANDARDS.md) · [Testing](TESTING.md) · [ADR-0002](adr/ADR-0002-postgres-event-sourced-episode-log.md) · [ADR-0003](adr/ADR-0003-deterministic-rules-engine-json.md) · [ADR-0006](adr/ADR-0006-crisis-gate-raise-only-llm.md)

`services/api` is one FastAPI 0.163 application (Python 3.12) with pure deterministic engines, a thin service layer that owns transactions and the event log, an LLM layer that can only explain or raise, and APScheduler jobs for SLA timers.

## 1. Service layout

```
services/api/
  pyproject.toml            # uv-managed; ruff + mypy config
  alembic/                  # migrations (DATA_MODEL §7)
  app/
    main.py                 # FastAPI app, middleware, router mount, startup checks
    config.py               # pydantic-settings: every env var in .env.example
    seed.py                 # python -m app.seed [--reset] [--seed 42] [--scenario judge_tour]
    core/
      db.py                 # SQLAlchemy 2.1 engine/session; Postgres (SQLite local dev only)
      security.py           # AuthProvider: DemoProvider (MVP), UaePassProvider / FacilityOidcProvider (v1)
      rbac.py               # role -> scopes map (API_SPEC §1.2), row-level filters
      idempotency.py        # Idempotency-Key middleware (idempotency_keys table, 24 h)
      errors.py             # RFC 9457 problem+json, error codes
      audit.py              # write audit_log rows (E-14)
      logging.py            # structlog JSON, ID-only, LOG_PEPPER hashing
      ratelimit.py          # slowapi limits (API_SPEC §1.3)
    models/                 # SQLAlchemy ORM, one module per entity group
    schemas/                # Pydantic request/response models (mirror packages/contracts/openapi.yaml)
    rules/
      loader.py             # load + JSON-Schema-validate packages/rules/*.v1.json, compute sha256, activate E-17
    engines/                # PURE functions; no I/O, no clock reads, no DB
      scoring.py
      crisis_gate.py
      step_matcher.py
      rci.py
      sla.py
      fairness.py
      episode_open.py
      transitions.py        # allowed transitions from transitions.v1.json
    services/               # transactions, event append, side effects
      episode_service.py    # apply(command) -> event + projection (single TX)
      screening_service.py
      referral_service.py   # packet builder with consent filter
      crisis_service.py     # RED open, ack (API-24), contact attempts (API-25)
      consent_service.py
      preference_service.py # API-26; re-proposes recommendation
      explanation_service.py
      notification_service.py
      programme_service.py  # metrics + fairness via engines/fairness
      simulation_service.py # F-16
      analytics_service.py  # API-29 allow-list
      demo_service.py       # API-28 reset
    llm/
      provider.py           # LLMProvider protocol + factory (LLM_PROVIDER)
      gemini.py             # google-genai 3.5.0
      azure_openai.py       # v1 stub
      local.py              # v1 stub (OpenAI-compatible base URL)
      none.py               # templates (M-03)
      facts.py              # de-identified fact builder (whitelist)
      validator.py          # claim validator (CLAUDE.md §Architecture 7)
      crisis_raise.py       # M-02 raise-only classifier
    integrations/
      fhir_mapper.py        # R4 import/export (API-19/20)
      malaffi_ref.py        # HL7 v2 REF^I12 builder (design, not sent)
      sahatna_launch.py     # launch-context stub
      channels/{in_app,sms_mock,whatsapp_mock}.py
    jobs/
      scheduler.py          # APScheduler setup, leader lock
      sla_sweep.py
      recheck_due.py
      ltfu.py
      integrity.py
      metrics_snapshot.py
    routers/                # one module per tag in openapi.yaml
    tools/rebuild_projections.py
  tests/                    # unit / integration / property / llm (TESTING.md)
```

**Layer rules** (checked by an import-linter test): `routers → services → engines`; `engines` import nothing from `services`, `models`, `llm` or `integrations`; only `services` open transactions; only `llm/` imports `google.genai`.

## 2. Engines (deterministic, pure)

All engines take frozen dataclasses and a `RuleSet` object (loaded once at startup) and return frozen dataclasses with `rule_ids`. Time is a parameter (`now: datetime`). Every engine has unit tests for every branch plus Hypothesis property tests ([TESTING](TESTING.md)).

### 2.1 `engines/scoring.py` (F-01)
- `score(instrument, answers, rules) -> Score(total, band, item9, missing)`.
- PHQ-9 0–27, GAD-7 0–21, PHQ-2/GAD-2 0–6; bands from `phq9.v1.json` / `gad7.v1.json` (brief §6).
- Missing items: PHQ-9/GAD-7 are not scored with more than 0 missing in the MVP (returns `missing=[…]`, API returns 409). Prorating is a v1 clinical decision.
- Prescreen rule: full instrument only if PHQ-2 ≥ 3 or GAD-2 ≥ 3 (`phq2.v1.json`, `gad2.v1.json`).
- Imported totals (API-19) are ignored; we always recompute.

### 2.2 `engines/crisis_gate.py` (F-03, F-22)
- `check(items: dict, free_texts: list[str], rules) -> GateResult(red: bool, urgency, source, matched_rule_ids, matched_category)`.
- Triggers (OR): PHQ-9 item 9 > 0 (item 9 = 1 → `urgency=same_day_check`, ≥ 2 → `emergency`, OQ-01); C-SSRS screener items when `FF_CSSRS_ITEMS=true`; lexicon hit on any free text.
- Lexicon matching: Unicode NFKC, Arabic normalisation (strip tashkeel and tatweel, unify alef/ya/ta-marbuta forms), Arabizi digit map (2→ء, 3→ع, 5→خ, 7→ح, 9→ق), lowercase, collapse repeats; then whole-phrase and windowed-token matching from `crisis_lexicon.v1.json`. Negation is **not** used to clear a hit (raise-only bias).
- Pure and fast: compiled patterns cached at startup; budget < 5 ms typical.
- **Fail-closed wrapper** (`crisis_service.run_gate`): runs the engine under a 250 ms deadline; any exception or timeout returns `GateResult(red=True, source="gate_error")` (`CRISIS_FAILSAFE=red`).
- Called from API-02, -03, -04, -07 (note), -10, -19 (item 9), -25 (note) **before** any LLM call.

### 2.3 `engines/episode_open.py`
- `should_open(scores, gate, self_referral) -> OpenDecision(open, reason)`: PHQ-9 ≥ 10 or GAD-7 ≥ 10 or item 9 > 0 or gate RED or self-referral (`episode_open.v1.json`).

### 2.4 `engines/step_matcher.py` (F-05, F-06)
- `recommend(scores, flags, preferences, providers, capacity, rules) -> Recommendation(step, factors[], candidates[])`.
- Step: band of **each** instrument mapped through `steps.v1.json`; **the higher step wins**. L4 via GAD-7 requires a complexity flag (functional difficulty "extremely difficult", prior specialist care, or clinician judgement). L2 also for mild + functional impairment or physical comorbidity (from E-16 if consented). RED overrides everything.
- Candidates: filter by `steps_served`, insurance network, language, clinician gender (if a preference), area; rank by modality match, then `current_wait_days`, then capacity, then stable ID (deterministic tie-break).
- Zero candidates → step still returned, `NO_CAPACITY` factor, coordinator queue item, waiting-well modules assigned.
- Also used for re-match after decline (excluded providers passed in) and after API-26 preference changes.

### 2.5 `engines/rci.py` (F-10)
- `classify(instrument, baseline, current, rules) -> RciResult(delta, threshold, classification)`.
- Thresholds in `rci.v1.json`: PHQ-9 reliable change ≥ 6 points, GAD-7 ≥ 4 points (values as used by NHS Talking Therapies [K]; the file also stores the Jacobson–Truax formula inputs `sd`, `reliability` so a clinician can recompute: `RCI = Δ / (√2 · SD · √(1 − r))`).
- `suggest_step_change(current_step, rci_results, weeks_in_step, rules)`: reliable deterioration → step-up suggestion; no reliable improvement after the review window (e.g. L2 at re-check) → step-up; reliable improvement + below threshold → step-down or monitoring. Always `status=proposed`; API-12 confirms.

### 2.6 `engines/sla.py` (F-07, F-08)
- `due_at(kind, start, rules) -> datetime` and `evaluate(item, now, rules) -> SlaAction | None`.
- Defaults in `sla.v1.json` (env overrides logged at startup): RED acknowledgement 15 min (`SLA_RED_MINUTES`) · step confirmation 48 h (`SLA_STEP_CONFIRM_HOURS`) · provider accept/decline 48 h (`SLA_REFERRAL_ACCEPT_HOURS`) · first appointment ≤ 14 d from positive screen (`SLA_FIRST_APPOINTMENT_DAYS`) · re-check every 14 d while monitoring (`RECHECK_DAYS`).
- Escalation ladder: L1 coordinator queue → L2 on-call clinician (RED) or programme flag (referrals). Contact rule: 3 × `no_answer` on RED within 60 min → L2.
- Clock is wall-clock 24/7 in the MVP; business-hours calendars are v1.

### 2.7 `engines/fairness.py` (F-15)
- `suppress(table, k=SMALL_CELL_K) -> table`: primary suppression for n < 10 (shown as `"<10"`), then **complementary suppression**: hide at least one more cell in the same row/column (the next-smallest) so a hidden value cannot be recomputed from totals; repeat until stable.
- Confidence intervals: Wilson score interval for proportions.
- `max_gap_pp` over unsuppressed cells only.

## 3. Episode service and event log

```python
def apply(session, episode_id, command, actor, now) -> EpisodeEvent:
    ep = session.get(Episode, episode_id, with_for_update=True)
    check_if_match(command, ep.last_event_seq)          # 409 CONFLICT_STALE
    to_state = transitions.next(ep.state, command.type)  # 409 CONFLICT_STATE
    authorise(actor, command, ep)                        # rbac + clinician-only rules
    event = EpisodeEvent(seq=ep.last_event_seq + 1, type=..., from_state=ep.state,
                         to_state=to_state, payload=command.payload_ids_only(),
                         prev_hash=ep.last_hash, ...)
    event.hash = sha256(event.prev_hash + canonical_json(event))
    project(ep, event)                                   # update projection fields
    session.add(event); audit.write(...)
    return event                                         # caller commits
```

Clinician-only commands: `CONFIRM_STEP`, `RESOLVE_CRISIS`, `CLOSE`. Coordinator or clinician: `RED_ACK`, `CONTACT_ATTEMPT`, re-route referral. System only: `REFERRAL_OVERDUE`, `ESCALATED`, `LTFU`. LLM only: `CRISIS_RAISED_BY_LLM` (target state always `RED_CRISIS`).

## 4. Background jobs (APScheduler 3.11)

`jobs/scheduler.py` starts a `BackgroundScheduler` (UTC) on app startup **only if** `JOBS_ENABLED=true`. Each run takes `pg_try_advisory_lock(4711)`; if not acquired, it skips. Job state is written to `scheduler_state` for `/healthz`.

| Job | Trigger | What it does | Idempotency |
|---|---|---|---|
| `sla_sweep` | every 60 s (`max_instances=1`, `coalesce=True`) | Selects open crisis events, referrals, step confirmations and first-appointment deadlines with `due_at <= now()` (`FOR UPDATE SKIP LOCKED`), calls `sla.evaluate`, appends `REFERRAL_OVERDUE`/`ESCALATED` events, queues notifications | `dedupe_key` unique index (`crisis:{id}:L1`, `ref:{id}:L2`…) |
| `recheck_due` | hourly | Creates re-check reminders (in-app, SMS mock if consented) for `MONITORING` episodes and waiting-well assignments past `recheck_due_at` | One reminder per (episode, due date) |
| `ltfu` | daily 02:00 GST | Marks `LOST_TO_FOLLOW_UP` after 2 no-shows or 28 days with no contact on BOOKED/ACCEPTED (rule in `sla.v1.json`) | Transition check |
| `integrity` | daily 03:00 GST | Verifies hash chains, rebuilds projections into a temp schema and diffs | Read-only; alerts on mismatch |
| `metrics_snapshot` | hourly (v1); on demand in MVP | Writes aggregate snapshots for API-16/17 | Upsert by hour |
| `m02_worker` | in-process queue, after response | Runs M-02 raise-only checks when enabled (never in Judge Mode) | Acts only if not already RED |

FastAPI `BackgroundTasks` is used for M-02 and notifications so they never block the response.

## 5. Authentication and authorisation (RBAC + row rules)

- **Authentication.** `AuthProvider.verify(token) -> Principal(sub, role, scopes, persona, facility_id, provider_id, judge)`. MVP: HS256 JWT from API-22 (`JWT_SECRET`, TTL `JWT_TTL_MINUTES`), gated by `JUDGE_PASSCODE`. v1: UAE PASS / facility OIDC with RS256 + JWKS ([ADR-0005](adr/ADR-0005-demo-auth-judge-mode-uae-pass-later.md)).
- **Scopes.** `Depends(require_scopes("step:confirm"))` per route; scopes per role from `core/rbac.py`, which is generated from and tested against the matrix in [API_SPEC §1.2](API_SPEC.md#12-roles-and-scopes).
- **Row-level rules (ABAC-lite).**

| Role | Can see episodes where |
|---|---|
| person | `episode.person_id == principal.sub` |
| clinician | `episode.owner_staff_id == sub` OR an open referral targets `principal.provider_id` OR clinician is on call and the episode is RED |
| coordinator | episode is open (coordination team scope, MVP: all facilities) |
| programme | never row-level; aggregate endpoints only |
| judge (observer) | never row-level; programme + simulation only |

- **Consent checks** in services, not routers: referral packets, physical context in API-05, clinician FHIR export, LLM narration (`ai_drafted_summaries`), free-text storage (`store_free_text`), SMS/WhatsApp (`notify_*`). Missing consent → `403 CONSENT_REQUIRED` or silent omission for view fields (documented per endpoint).
- **Not-yours = 404.** Accessing another person's episode returns 404 to avoid confirming it exists.
- Every allowed or denied access to person-linked data writes `audit_log` (purpose `care`, `coordination`, `self`, `programme_aggregate`, `demo`).

## 6. Validation and error handling

- Pydantic v2 models with `extra="forbid"` for requests; enums mirror `packages/contracts/openapi.yaml`. A CI test compares FastAPI's generated schema with `packages/contracts/openapi.yaml` for paths, methods and required fields.
- Rules files are validated against JSON Schemas at startup; failure → refuse to start (FM-05).
- Domain errors raise typed exceptions (`ConflictState`, `ConsentRequired`, `LockedCrisis`) mapped once in `core/errors.py` to problem+json.
- Unhandled exceptions → 500 problem+json with `trace_id`, no stack trace in the body. Inside the Crisis Gate path, exceptions become RED (fail-closed) instead of 500.
- LLM failures never surface as errors: templates are returned with `fallback_used: true`.

## 7. Idempotency and concurrency

- `Idempotency-Key` middleware stores `(key, route, actor_id, request_hash, response)` for 24 h. Same key + same body → replay; same key + different body → `409 IDEMPOTENCY_MISMATCH`.
- Episode writes lock the episode row (`SELECT … FOR UPDATE`) and check `If-Match` when given.
- Scheduler writes use dedupe keys; duplicate scheduler instances are harmless.
- Demo reset (API-28) takes an exclusive advisory lock; concurrent calls get `409`.

## 8. Caching

- No HTTP caching of PHI (`Cache-Control: no-store`).
- In-process caches: compiled rules and lexicon (until restart), provider directory (60 s), explanation cache keyed by `(facts_hash, language, prompt_version, model_id)` (MVP: in DB via `explanation_records.facts_hash`).
- No Redis in the MVP ([TECH_STACK §3](TECH_STACK.md#3-data)).

## 9. Startup checks (`main.py`)

1. Load and validate rules; compute SHA-256; activate matching `rule_set_versions` row.
2. Refuse to start if `APP_ENV=production` and (`DEMO_MODE=true` or `LLM_PROVIDER=gemini`).
3. Refuse to start if `CRISIS_FAILSAFE` ≠ `red`.
4. Log effective SLA values and any env overrides of `sla.v1.json`.
5. Check DB connectivity and migrations at head.
6. Start the scheduler if `JOBS_ENABLED=true`.

## 10. MVP vs v1

| Area | MVP (hackathon) | v1 (production) |
|---|---|---|
| Process model | One container: API + scheduler | API replicas + one jobs worker (same image) |
| Auth | Demo JWT + `JUDGE_PASSCODE` | UAE PASS, facility OIDC |
| Encryption | Free text via pgcrypto when consented | App-level AES-GCM with Key Vault keys for DI/free-text columns |
| LLM | Gemini (synthetic only) | In-country provider |
| Integrations | Mocks and stubs | Malaffi REF via facility engine, licensed SMS, Sahatna |
| SLA calendar | 24/7 wall clock | Facility business-hours calendars + public holidays |
