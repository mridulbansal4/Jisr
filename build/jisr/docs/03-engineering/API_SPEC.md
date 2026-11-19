# API Specification
> Project: Jisr · Owner: Backend lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [Data model](DATA_MODEL.md) · [OpenAPI](../../api/openapi.yaml) · [Backend](BACKEND.md) · [ADR-0005](adr/ADR-0005-demo-auth-judge-mode-uae-pass-later.md)

The machine-readable contract is [`api/openapi.yaml`](../../api/openapi.yaml) (OpenAPI 3.1). This document explains it and gives examples. If they disagree, fix the YAML first, then this file.

## 1. Conventions

| Topic | Rule |
|---|---|
| Style | REST + JSON over HTTPS. Base path `/v1`. Resource IDs are UUID v7 strings |
| Versioning | URL major version (`/v1`). Additive changes (new optional fields, new endpoints) do not bump the version. Clients must ignore unknown fields |
| Content type | `application/json; charset=utf-8`. Errors: `application/problem+json` (RFC 9457) |
| Auth | `Authorization: Bearer <JWT>`. MVP: HS256 token from API-22. v1: UAE PASS (persons), facility OIDC (staff) |
| Idempotency | Every `POST` that creates or changes state accepts `Idempotency-Key: <uuid>`. The server stores `(key, route, actor)` with the response for 24 h and replays it. Required on API-03, API-07, API-08, API-09, API-10, API-12, API-13, API-24, API-25 |
| Concurrency | Episode mutations accept `If-Match: "<last_event_seq>"`. A stale value returns `409 CONFLICT_STALE` |
| Pagination | Cursor: `?limit=50&cursor=<opaque>`; response `{ "items": [...], "next_cursor": "..." \| null }`. Max `limit` 200 |
| Time | RFC 3339 UTC (`2026-11-19T06:30:00Z`). UI renders `Asia/Dubai` |
| Language | `Accept-Language: ar \| en \| ur` selects message and crisis-line text |
| Caching | All `/v1` responses send `Cache-Control: no-store` (PHI). Exception: API-15 `private, max-age=60` |
| Tracing | Every response carries `X-Request-Id`; errors repeat it as `trace_id` |
| Rate limits | slowapi per token (or per IP when anonymous). Defaults below; `429` with `Retry-After` |
| Audit | Every read or write of person-linked data writes an `audit_log` row (E-14) |

### 1.1 Error format

```json
{
  "type": "https://jisr.example/errors/conflict-state",
  "title": "Transition not allowed",
  "status": 409,
  "code": "CONFLICT_STATE",
  "detail": "Episode is in RED_CRISIS; only a clinician can change its step.",
  "instance": "/v1/episodes/0193f1c2-…/confirm-step",
  "trace_id": "req_01JD2…",
  "errors": []
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON, missing `Idempotency-Key` where required |
| 401 | `UNAUTHENTICATED` | Missing, expired or invalid token |
| 403 | `FORBIDDEN` | Role lacks scope, or row-level rule denies (not your episode / facility) |
| 403 | `CONSENT_REQUIRED` | The action needs a consent scope the person has not granted (body names the scope) |
| 404 | `NOT_FOUND` | Unknown ID, or an ID the caller may not know exists (we return 404, not 403, for other persons' resources) |
| 409 | `CONFLICT_STATE` | Illegal episode transition |
| 409 | `CONFLICT_STALE` | `If-Match` mismatch |
| 409 | `IDEMPOTENCY_MISMATCH` | Same key reused with a different body |
| 413 | `PAYLOAD_TOO_LARGE` | Batch or body over limit (API-29 > 50 events, API-19 > 5 MB) |
| 422 | `VALIDATION_FAILED` | Pydantic validation; `errors[]` lists `{loc, msg}` |
| 423 | `LOCKED_CRISIS` | LLM explanation requested on a RED episode |
| 429 | `RATE_LIMITED` | Rate limit hit |
| 503 | `UNAVAILABLE` | DB down / rules not loaded |

LLM failures are **never** errors to the client: the API returns template text with `"fallback_used": true`.

### 1.2 Roles and scopes

Tokens carry `role` and `scopes`. In Judge Mode the judge first receives an observer token (`role: judge`). When the judge picks a persona, API-22 issues that persona's token (`role: person|clinician|coordinator|programme`) with the extra claim `"judge": true` and `"demo": true`.

| Scope | person | clinician | coordinator | programme | judge (observer) |
|---|---|---|---|---|---|
| `screening:write` | own | – | – | – | – |
| `crisis:check` | ✔ | ✔ | ✔ | – | ✔ |
| `episode:read:self` | own | – | – | – | – |
| `episode:read:care` | – | assigned or referred to own provider | all open episodes | – | – |
| `red:ack` | – | ✔ | ✔ | – | – |
| `contact:log` | – | ✔ | ✔ | – | – |
| `referral:create` | own, needs consent `share_with_receiving_provider` | ✔ | ✔ | – | – |
| `referral:decide` | – | own provider's referrals | on behalf of a provider (reason required) | – | – |
| `appointment:write` | book own from offered slots | ✔ (book, record attendance) | ✔ (book) | – | – |
| `recheck:write` | own | ✔ | – | – | – |
| `queue:read` | – | ✔ (own facility) | ✔ (crisis + overdue + unassigned) | – | – |
| `step:confirm` | – | ✔ | – | – | – |
| `episode:close` | – | ✔ | – | – | – |
| `consent:self` | own | – | – | – | – |
| `provider:read` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `programme:read` | – | – | – | ✔ (aggregate only) | ✔ |
| `explain:request` | own | ✔ | – | – | – |
| `fhir:import` | – | – | ✔ | – | ✔ (seeded bundles only, `DEMO_MODE`) |
| `fhir:export` | own (right of access) | care, needs consent `share_with_receiving_provider` | ✔ | – | – |
| `sim:run` | – | – | – | ✔ | ✔ |
| `audit:read:self` | own | – | – | – | – |
| `preferences:self` | own | – | – | – | – |
| `notifications:self` | own | – | – | – | – |
| `demo:reset` | – | – | – | – | ✔ (`DEMO_MODE` only) |
| `events:write` | ✔ | ✔ | ✔ | ✔ | ✔ |

**Role rules from the brief (cross-cutting):** a coordinator can acknowledge a RED episode (API-24) and log contact attempts (API-25); **only a clinician** can confirm a step (API-12), leave `RED_CRISIS`, or close an episode (API-13). There is **no** employer, insurer or family role, and no programme endpoint returns row-level data. Insurers receive only what a normal claim for a booked appointment requires (outside Jisr); never screening answers, scores or notes.

**Consent scopes (F-13, brief §5):** `share_with_receiving_provider` (covers the receiving provider of a referral), `share_physical_context`, `ai_drafted_summaries` (de-identified structured facts to the LLM; off ⇒ template-only), `store_free_text` (F-22), `notify_sms`, `notify_whatsapp`. All revocable with immediate effect.

### 1.3 Rate limits (MVP defaults)

| Group | Limit |
|---|---|
| API-22 demo login | 20 / min / IP |
| API-04 crisis check | 60 / min / token (never limits the screening completion path) |
| API-18 explain | 20 / min / token |
| API-21 simulation | 6 / min / token |
| API-28 demo reset | 2 / min / token |
| API-29 events | 300 / min / token (batched, max 50 events per call) |
| All other | 120 / min / token |

### 1.4 Common objects

`CrisisLines` (returned whenever `crisis` is true, localised):

```json
[
  {"name": "Emergency", "number": "999", "tel": "tel:999"},
  {"name": "800-SAKINA (Abu Dhabi)", "number": "800 725462", "tel": "tel:800725462"},
  {"name": "800-HOPE (national)", "number": "800 4673", "tel": "tel:8004673"}
]
```

`Factor` (step matcher): `{"factor": "language", "value": "ar", "effect": "filter", "rule_id": "STEP-LANG-01"}`.

---

## 2. Endpoints

### API-01 `POST /v1/screenings` — start a screening session
Scope `screening:write`. F-01.

Request:
```json
{"language": "ar", "stage": "prescreen", "source": "jisr_app"}
```
Response `201`:
```json
{
  "id": "0193f1a0-7c1e-7b2a-9d1f-3c5e2a1b0001",
  "status": "in_progress",
  "stage": "prescreen",
  "language": "ar",
  "items": [
    {"link_id": "PHQ2_1", "instrument": "PHQ2", "text": "…", "options": [0, 1, 2, 3]},
    {"link_id": "PHQ2_2", "instrument": "PHQ2", "text": "…", "options": [0, 1, 2, 3]},
    {"link_id": "GAD2_1", "instrument": "GAD2", "text": "…", "options": [0, 1, 2, 3]},
    {"link_id": "GAD2_2", "instrument": "GAD2", "text": "…", "options": [0, 1, 2, 3]}
  ],
  "rule_set_version": "1.0.0"
}
```
Errors: 401, 403, 422.

### API-02 `POST /v1/screenings/{id}/answers` — submit answers
Scope `screening:write` (own session). Saves item by item (partial allowed). Runs the Crisis Gate on every call that contains PHQ-9 item 9, C-SSRS items (only when `FF_CSSRS_ITEMS=true`, R-05) or free text. `free_text` is the F-22 "Anything else you'd like to tell us?" box: the gate runs first; only the gate result and matched category are stored, and the raw text is kept (encrypted) only if consent `store_free_text` is granted. If the gate errors or times out, the input is treated as RED (fail-closed).

Request:
```json
{"answers": {"PHQ2_1": 2, "PHQ2_2": 1, "GAD2_1": 2, "GAD2_2": 2}, "free_text": null}
```
Response `200`:
```json
{
  "id": "0193f1a0-…0001",
  "stage": "full",
  "next_items": [{"link_id": "PHQ9_3", "instrument": "PHQ9", "text": "…", "options": [0,1,2,3]}],
  "crisis": false
}
```
If the gate fires here, the response is `{"crisis": true, "crisis_lines": [...], "episode_id": "…"}` and the session is completed server-side. Errors: 404, 409 (session already completed), 422 (unknown `link_id`, value out of range).

### API-03 `POST /v1/screenings/{id}/complete` — score, Crisis Gate, open episode
Scope `screening:write`. Header `Idempotency-Key` required. F-01, F-03, F-05, F-08. **Server-side p95 < 300 ms** ([PERFORMANCE](PERFORMANCE.md)).

Request: `{"request_support": false}` (`request_support: true` = self-referral; opens an episode at any score, typically L0/L1).

Episode-open rule (`packages/rules/episode_open.v1.json`, brief §6): PHQ-9 ≥ 10 **or** GAD-7 ≥ 10 **or** PHQ-9 item 9 > 0 **or** self-referral. The step uses the **more severe** of PHQ-9 and GAD-7. If PHQ-2 and GAD-2 are both < 3, the full instruments are skipped and no episode opens unless the person requests support.

Response `200` (no crisis, positive):
```json
{
  "session_id": "0193f1a0-…0001",
  "crisis": false,
  "positive": true,
  "scores": [
    {"instrument": "PHQ9", "total": 11, "band": "moderate", "item9": 0},
    {"instrument": "GAD7", "total": 13, "band": "moderate"}
  ],
  "episode": {"id": "0193f1b4-…00e1", "state": "STEP_RECOMMENDED", "proposed_step": "L2"},
  "explanation_available": true
}
```
Response `200` (crisis):
```json
{
  "session_id": "0193f1a0-…0001",
  "crisis": true,
  "crisis_lines": [{"name": "Emergency", "number": "999", "tel": "tel:999"}],
  "episode": {"id": "0193f1b4-…00e2", "state": "RED_CRISIS", "proposed_step": "RED"},
  "next_contact": "A care coordinator will contact you within 15 minutes.",
  "llm_locked": true
}
```
Item 9 = 1 adds `"urgency": "same_day_check"` (same-day human safety check, not an automatic emergency call; OQ-01). Below threshold: `{"crisis": false, "positive": false, "episode": null, "self_help": ["sleep_basics"], "can_request_support": true, "recheck_reminder_offer_days": 14}`. Errors: 404, 409 (missing required items), 422.

### API-04 `POST /v1/crisis/check` — Crisis Gate on free text
Scope `crisis:check`. F-03. Deterministic lexicon (AR / EN / Arabizi / UR). Never calls an LLM synchronously. Used by the "anything else?" box and the clinician note field.

Request:
```json
{"text": "ma 3ad abi a3eesh", "source": "free_text", "language_hint": "ar", "episode_id": "0193f1b4-…00e1"}
```
Response `200`:
```json
{
  "crisis": true,
  "matched_rule_ids": ["LEX-ARZ-014"],
  "crisis_lines": [{"name": "Emergency", "number": "999", "tel": "tel:999"}],
  "episode_state": "RED_CRISIS",
  "latency_ms": 7
}
```
`source` ∈ `free_text` (default) · `help_button` (S-06 "I need help now": always RED, `text` may be empty) · `clinician_note`. If `episode_id` is given and the gate fires, the episode moves to `RED_CRISIS` and a `crisis_events` row is written (matched rule IDs and category only). This endpoint never stores the raw text. Errors: 401, 422 (text > 2,000 chars), 429.

### API-05 `GET /v1/episodes/{id}` — episode with timeline
Scope `episode:read:self` (own) or `episode:read:care`. F-08, F-11, F-12.

Response `200`:
```json
{
  "id": "0193f1b4-…00e1",
  "state": "REFERRED",
  "current_step": "L2",
  "is_red": false,
  "owner": {"team": "primary_care", "staff_id": "0193…0c01"},
  "next_deadline": {"kind": "referral_accept", "due_at": "2026-11-21T08:00:00Z"},
  "scores": [{"instrument": "PHQ9", "total": 11, "band": "moderate", "scored_at": "2026-11-19T08:00:00Z"}],
  "physical_context": {"hba1c_pct": 6.1, "bmi": 27.4, "bp_systolic": 128, "bp_diastolic": 82, "observed_at": "2026-10-02T00:00:00Z"},
  "timeline": [
    {"seq": 1, "type": "EPISODE_OPENED", "to_state": "SCREENED_POSITIVE", "actor_type": "system", "occurred_at": "2026-11-19T08:00:00Z"},
    {"seq": 2, "type": "EXPLAINED", "to_state": "EXPLAINED", "actor_type": "system", "occurred_at": "2026-11-19T08:00:05Z"},
    {"seq": 3, "type": "STEP_RECOMMENDED", "to_state": "STEP_RECOMMENDED", "actor_type": "system", "occurred_at": "2026-11-19T08:00:05Z"},
    {"seq": 4, "type": "STEP_CONFIRMED", "to_state": "STEP_CONFIRMED", "actor_type": "staff", "occurred_at": "2026-11-19T08:20:00Z"},
    {"seq": 5, "type": "REFERRED", "to_state": "REFERRED", "actor_type": "person", "occurred_at": "2026-11-19T08:21:00Z"}
  ],
  "last_event_seq": 5
}
```
`physical_context` is present only if consent `share_physical_context` is granted and the caller is a clinician or the person. Errors: 401, 404.

### API-06 `GET /v1/episodes/{id}/recommendation` — step recommendation with factors
Scope `episode:read:self` / `episode:read:care`. F-05, F-06.

Response `200`:
```json
{
  "id": "0193f1b5-…0a01",
  "status": "proposed",
  "recommended_step": "L2",
  "source": "initial",
  "factors": [
    {"factor": "severity", "value": "PHQ9=11 moderate; GAD7=13 moderate; higher instrument wins", "effect": "L2", "rule_id": "STEP-SEV-02"},
    {"factor": "modality", "value": "video", "effect": "prefer tele-consult within L2", "rule_id": "STEP-MOD-01"},
    {"factor": "language", "value": "ar", "effect": "filter", "rule_id": "STEP-LANG-01"},
    {"factor": "clinician_gender", "value": "female", "effect": "filter", "rule_id": "STEP-GEN-01"},
    {"factor": "insurance_network", "value": "thiqa", "effect": "filter", "rule_id": "STEP-NET-01"},
    {"factor": "capacity", "value": "wait 3 d", "effect": "rank", "rule_id": "STEP-CAP-01"}
  ],
  "candidates": [
    {"provider_id": "0193…p001", "display_name": "Al Reem Family Health Centre, MH-trained family physician (synthetic)", "kind": "family_physician",
     "languages": ["ar", "en"], "clinician_gender": "female", "modalities": ["in_person", "video"],
     "networks": ["thiqa"], "current_wait_days": 3, "next_slot": "2026-11-20T14:00:00Z"}
  ],
  "rule_set_version": "1.0.0",
  "needs_clinician_confirmation": true
}
```
Errors: 401, 404, 409 (episode is RED; returns `recommended_step: RED` with no candidates instead of an error in the person view).

### API-07 `POST /v1/episodes/{id}/referrals` — create referral (warm hand-off)
Scope `referral:create`. `Idempotency-Key` required. F-07. Precondition: state `STEP_CONFIRMED`, `DECLINED_BY_PROVIDER` (after re-match), `ESCALATED`, `STEP_CHANGED` or `LOST_TO_FOLLOW_UP`.

Request:
```json
{
  "provider_id": "0193…p001",
  "priority": "routine",
  "requested_slot": "2026-11-20T14:00:00Z",
  "consent_scopes": ["share_with_receiving_provider", "share_physical_context"],
  "note_to_provider": null
}
```
Response `201`:
```json
{
  "id": "0193f1c0-…r001",
  "status": "requested",
  "episode_state": "REFERRED",
  "sla_due_at": "2026-11-21T08:21:00Z",
  "packet_preview": {
    "scores": [{"instrument": "PHQ9", "total": 11}, {"instrument": "GAD7", "total": 13}],
    "step": "L2", "language": "ar", "clinician_gender_pref": "female", "modality": "video",
    "crisis_flag": false, "physical_context_included": true
  },
  "fhir": {"service_request_id": "sr-0193f1c0", "task_id": "task-0193f1c0"}
}
```
`note_to_provider` goes through the Crisis Gate. Errors: 403 `CONSENT_REQUIRED`, 404, 409 `CONFLICT_STATE`, 422.

### API-08 `POST /v1/referrals/{id}/decision` — provider accepts or declines
Scope `referral:decide`. `Idempotency-Key` required. F-07.

Request:
```json
{"decision": "decline", "reason": "no_capacity", "comment": null, "on_behalf_of_provider": false}
```
Response `200`:
```json
{
  "id": "0193f1c0-…r001",
  "status": "declined",
  "episode_state": "STEP_RECOMMENDED",
  "rematch": {"recommendation_id": "0193f1c3-…0a02", "excluded_provider_ids": ["0193…p001"]}
}
```
Accept returns `{"status": "accepted", "episode_state": "ACCEPTED", "first_appointment_due_by": "2026-12-03T08:00:00Z"}`. A coordinator deciding on behalf must set `on_behalf_of_provider: true` and a `comment`. Errors: 403, 404, 409 (already decided or expired).

### API-09 `POST /v1/referrals/{id}/appointment` — book or record appointment
Scope `appointment:write`. `Idempotency-Key` required. F-07, F-08.

Request (book):
```json
{"action": "book", "start_at": "2026-11-20T14:00:00Z", "modality": "video"}
```
Request (record attendance, clinician only):
```json
{"action": "record", "appointment_id": "0193f1d0-…a001", "status": "attended"}
```
Response `200`:
```json
{"appointment_id": "0193f1d0-…a001", "status": "booked", "episode_state": "BOOKED",
 "notification": {"channel": "sms_mock", "text": "You have an update in your health app."}}
```
`status` on record: `attended` (→ `ATTENDED` then `MONITORING`), `no_show` (second no-show → `LOST_TO_FOLLOW_UP`), `cancelled`. Errors: 403 (person cannot record attendance), 404, 409, 422.

### API-10 `POST /v1/episodes/{id}/recheck` — re-check scores → RCI
Scope `recheck:write`. `Idempotency-Key` required. F-09, F-10. Crisis Gate runs first.

Request:
```json
{"answers": {"PHQ9_1": 1, "PHQ9_2": 1, "PHQ9_3": 2, "PHQ9_4": 1, "PHQ9_5": 1, "PHQ9_6": 1, "PHQ9_7": 1, "PHQ9_8": 0, "PHQ9_9": 0,
             "GAD7_1": 1, "GAD7_2": 1, "GAD7_3": 1, "GAD7_4": 1, "GAD7_5": 0, "GAD7_6": 1, "GAD7_7": 1},
 "free_text": null}
```
Response `200`:
```json
{
  "crisis": false,
  "scores": [{"instrument": "PHQ9", "total": 8, "band": "mild"}, {"instrument": "GAD7", "total": 6, "band": "mild"}],
  "rci": [
    {"instrument": "PHQ9", "baseline": 16, "current": 8, "delta": -8, "threshold": 6, "classification": "reliable_improvement"},
    {"instrument": "GAD7", "baseline": 13, "current": 6, "delta": -7, "threshold": 4, "classification": "reliable_improvement"}
  ],
  "suggestion": {"recommendation_id": "0193f1e0-…0a03", "from_step": "L3", "to_step": "L2", "status": "proposed"},
  "episode_state": "MONITORING"
}
```
Classifications: `reliable_improvement`, `no_reliable_change`, `reliable_deterioration`. Errors: 404, 409 (episode closed), 422.

### API-11 `GET /v1/staff/queue` — clinician / coordinator queue
Scope `queue:read`. F-11. Query: `?view=red|overdue|to_confirm|mine|all&limit=50&cursor=`.

Response `200`:
```json
{
  "items": [
    {"episode_id": "0193f1b4-…00e2", "person_label": "Synthetic person #A17", "state": "RED_CRISIS", "is_red": true,
     "step": "RED", "reason": "PHQ-9 item 9 = 2", "deadline": {"kind": "crisis_ack", "due_at": "2026-11-19T08:15:00Z", "overdue": false},
     "language": "ar"},
    {"episode_id": "0193f1b4-…00e1", "person_label": "Mariam (synthetic)", "state": "STEP_RECOMMENDED", "is_red": false,
     "step": "L2", "reason": "Step to confirm", "deadline": null, "language": "ar"}
  ],
  "counts": {"red": 1, "overdue": 0, "to_confirm": 1},
  "next_cursor": null
}
```
Sort: RED first by `due_at`, then overdue, then to-confirm, then oldest. Errors: 401, 403.

### API-12 `POST /v1/episodes/{id}/confirm-step` — clinician confirms or changes step
Scope `step:confirm` (clinician only). `Idempotency-Key` and `If-Match` required. F-05, F-10, F-11.

Request:
```json
{"recommendation_id": "0193f1b5-…0a01", "step": "L2", "reason": null, "resolve_crisis": false}
```
Override example: `{"recommendation_id": "…", "step": "L3", "reason": "Marked functional impairment at work; prefers psychologist", "resolve_crisis": false}`. Leaving `RED_CRISIS`: `resolve_crisis: true`, `crisis_resolution: "contacted_safe"`, and a `reason` are required.

Response `200`:
```json
{"episode_state": "STEP_CONFIRMED", "current_step": "L2", "recommendation_status": "confirmed", "last_event_seq": 4}
```
Errors: 403 (not a clinician), 409 `CONFLICT_STATE` / `CONFLICT_STALE`, 422 (reason missing on override or crisis resolution).

### API-13 `POST /v1/episodes/{id}/close` — close with evidence
Scope `episode:close`. `Idempotency-Key` required. F-08.

Request:
```json
{"basis": "evidence", "evidence": {"appointment_id": "0193f1d0-…a001", "recheck_score_ids": ["0193f1e0-…s010"]}, "reason": null}
```
or `{"basis": "clinician_decision", "reason": "Person moved out of Abu Dhabi; handed to new GP"}`.

Response `200`: `{"episode_state": "CLOSED", "closed_at": "2026-12-20T09:00:00Z", "close_reason": "evidence_attended_recheck"}`.
Errors: 409 (RED episode, or evidence missing: no attended appointment, or no re-check after it), 422.

### API-14 `GET /v1/consents` · `PUT /v1/consents` — read / update consents
Scope `consent:self`. F-13. `PUT` takes the full desired set; the server writes one `consent_records` row per change. Effect is immediate (packets and views re-filter on next read).

`GET` response `200`:
```json
{
  "notice_version": "2026-11-v1",
  "consents": [
    {"scope": "share_with_receiving_provider", "status": "granted", "version": 1, "recorded_at": "2026-11-19T08:21:00Z"},
    {"scope": "share_physical_context", "status": "granted", "version": 1, "recorded_at": "2026-11-19T08:21:00Z"},
    {"scope": "ai_drafted_summaries", "status": "granted", "version": 1, "recorded_at": "2026-11-19T08:00:00Z"},
    {"scope": "store_free_text", "status": "revoked", "version": 1, "recorded_at": "2026-11-19T08:00:00Z"},
    {"scope": "notify_sms", "status": "revoked", "version": 2, "recorded_at": "2026-11-19T09:00:00Z"},
    {"scope": "notify_whatsapp", "status": "revoked", "version": 1, "recorded_at": "2026-11-19T08:00:00Z"}
  ]
}
```
`PUT` request: `{"notice_version": "2026-11-v1", "consents": [{"scope": "share_physical_context", "status": "revoked"}]}` → `200` with the full updated list and `"effects": ["Dr Salma's summary no longer shows HbA1c, BMI or blood pressure."]`. Errors: 422 (unknown scope).

### API-15 `GET /v1/providers` — search directory
Scope `provider:read`. F-06. Query: `step`, `language`, `gender`, `modality`, `network`, `city`, `accepting`, `limit`, `cursor`.

Response `200`:
```json
{"items": [{"id": "0193…p001", "display_name": "Tele-wellbeing Service (synthetic)", "kind": "tele_mh",
  "steps_served": ["L3"], "languages": ["ar", "en"], "clinician_gender": "female", "modalities": ["video"],
  "networks": ["thiqa", "enhanced"], "city": "Abu Dhabi", "current_wait_days": 3, "accepting": true, "is_synthetic": true}],
 "next_cursor": null}
```

### API-16 `GET /v1/programme/metrics` — funnel and KPIs
Scope `programme:read`. F-15. Query: `from`, `to` (dates), `cohort=all|simulated|live`.

Response `200`:
```json
{
  "period": {"from": "2026-10-01", "to": "2026-11-18"},
  "funnel": {"screened": 4210, "positive": 702, "explained": 690, "step_confirmed": 655, "referred": 610, "accepted": 571, "booked": 540, "attended": 488},
  "kpis": {
    "conversion_positive_to_attended_pct": 69.5,
    "median_days_screen_to_first_appt": 6.0,
    "followup_within_sla_pct": 88.2,
    "reliable_improvement_pct": 41.0,
    "crisis_ack_within_15min_pct": 97.4,
    "crisis_events": 38,
    "adverse_events": 0
  },
  "drop_off_reasons": [{"reason": "declined_by_person", "n": 21}, {"reason": "no_show_twice", "n": 17}],
  "suppressed_cells": 0,
  "data_label": "SYNTHETIC — simulated cohort"
}
```

### API-17 `GET /v1/programme/fairness` — subgroup metrics (suppressed)
Scope `programme:read`. F-15. Query: `metric=conversion|time_to_care|reliable_improvement`, `by=sex|age_band|nationality_group|language|insurance_plan`.

Response `200`:
```json
{
  "metric": "conversion", "by": "language", "k": 10,
  "rows": [
    {"group": "ar", "n": "412", "value": 70.1, "ci95": [65.6, 74.3], "suppressed": false, "suppression": null},
    {"group": "en", "n": "<10", "value": null, "ci95": null, "suppressed": true, "suppression": "complementary"},
    {"group": "ur", "n": "<10", "value": null, "ci95": null, "suppressed": true, "suppression": "primary"}
  ],
  "total_n": "421",
  "max_gap_pp": null,
  "note": "Cells with n < 10 show \"<10\". At least one more cell is hidden (complementary suppression) so a suppressed value cannot be recomputed from the total."
}
```
`n` is a string so it can carry `"<10"`. Complementary suppression picks the next-smallest cell in the same row/column; `max_gap_pp` is computed over unsuppressed cells only and is null if fewer than two remain.

### API-18 `POST /v1/explain` — validated plain-language explanation
Scope `explain:request`. F-04, M-01, M-03. Never on a RED episode (`423 LOCKED_CRISIS`). Respects consent `ai_drafted_summaries`: if not granted, always templates (no LLM call).

Request:
```json
{"episode_id": "0193f1b4-…00e1", "kind": "result", "language": "ar"}
```
Response `200`:
```json
{
  "explanation_id": "0193f1b6-…x001",
  "language": "ar",
  "sections": {
    "what_this_means": "…",
    "what_it_does_not_mean": "…",
    "next_step": "…"
  },
  "content_type": "ai_drafted",
  "provider": "gemini",
  "validator": {"result": "pass", "findings": []},
  "fallback_used": false
}
```
On fallback: `"content_type": "template"`, `"provider": "none"`, `"fallback_used": true`. Errors: 404, 423.

### API-19 `POST /v1/fhir/import` — import FHIR bundle (IFHAS result)
Scope `fhir:import`. F-02, F-12. Body: FHIR R4 `Bundle` (`type: collection` or `transaction`) with `Patient`, `QuestionnaireResponse` (PHQ-9 / GAD-7), optional `Observation` (HbA1c, BMI, blood pressure). Content type `application/fhir+json` or `application/json`.

Response `202`:
```json
{
  "import_id": "0193f1f0-…i001",
  "person_id": "0193…0p01",
  "screening_session_id": "0193f1f0-…0002",
  "crisis": false,
  "episode": {"id": "0193f1f0-…00e3", "state": "STEP_RECOMMENDED"},
  "physical_context_id": "0193f1f0-…pc01",
  "warnings": ["Observation with unknown code 'X-SLEEP' ignored (wearable data is v2)"]
}
```
The Crisis Gate runs on imported item 9. Errors: 400 (not a Bundle), 422 (missing required items; `errors[]` lists FHIRPath locations), 403 (non-synthetic Patient in `DEMO_MODE`: bundle must carry `meta.tag` `jisr#synthetic`).

### API-20 `GET /v1/fhir/export/{episodeId}` — export episode as FHIR bundle
Scope `fhir:export`. F-19. A person may always export their own episode (right of access). A clinician needs `share_with_receiving_provider`; physical-context Observations are included only with `share_physical_context`. Response `200` `application/fhir+json`:
```json
{
  "resourceType": "Bundle", "type": "collection",
  "meta": {"tag": [{"system": "https://jisr.example/tags", "code": "synthetic"}]},
  "entry": [
    {"resource": {"resourceType": "EpisodeOfCare", "id": "0193f1b4-00e1", "status": "active"}},
    {"resource": {"resourceType": "ServiceRequest", "id": "sr-0193f1c0", "status": "active", "intent": "order", "priority": "routine"}},
    {"resource": {"resourceType": "Task", "id": "task-0193f1c0", "status": "accepted", "intent": "order",
                  "focus": {"reference": "ServiceRequest/sr-0193f1c0"},
                  "restriction": {"period": {"end": "2026-11-21T08:21:00Z"}}}},
    {"resource": {"resourceType": "Observation", "status": "final",
                  "code": {"coding": [{"system": "http://loinc.org", "code": "44249-1"}]}, "valueInteger": 11}}
  ]
}
```
Errors: 403 `CONSENT_REQUIRED`, 404.

### API-21 `POST /v1/sim/run` — baseline vs Jisr simulation
Scope `sim:run`. F-16. Deterministic given `seed`.

Request:
```json
{"cohort_size": 5000, "seed": 42, "scenario": {"baseline_conversion": 0.35, "capacity_multiplier": 1.0, "sla_hours": 48}}
```
Response `200`:
```json
{
  "run_id": "0193f200-…s001",
  "baseline": {"conversion_pct": 35.0, "median_days_to_care": 41},
  "jisr": {"conversion_pct": 68.7, "median_days_to_care": 7},
  "assumptions": ["Baseline conversion is an assumption (no published Abu Dhabi figure).", "All inputs synthetic."],
  "data_label": "SIMULATED"
}
```
The baseline value is an input, not a fact. Errors: 422 (`cohort_size` > 50,000), 429.

### API-22 `POST /v1/auth/demo-login` — Judge Mode login
Public. Exists only when `DEMO_MODE=true` (otherwise `404`). Gated by the shared `JUDGE_PASSCODE` from the submission form (constant-time compare). F-17.

Request:
```json
{"persona": "mariam", "passcode": "<JUDGE_PASSCODE>"}
```
`persona` ∈ `judge`, `mariam` (P-01, person), `imran` (P-02, person), `dr_salma` (P-03, clinician), `khalid` (P-04, coordinator), `programme_lead` (P-05, programme).

Response `200`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9…",
  "token_type": "Bearer",
  "expires_in": 7200,
  "role": "person",
  "persona": "mariam",
  "scopes": ["screening:write", "crisis:check", "episode:read:self", "referral:create", "appointment:write",
             "recheck:write", "consent:self", "provider:read", "explain:request", "fhir:export", "audit:read:self"],
  "judge": true
}
```
Errors: 401 (wrong passcode), 404 (demo disabled), 422 (unknown persona), 429.

### API-23 `GET /v1/audit/me` — person's own access log
Scope `audit:read:self`. F-13. Query: `limit`, `cursor`.

Response `200`:
```json
{
  "items": [
    {"occurred_at": "2026-11-19T08:25:00Z", "actor_label": "Dr Salma (family physician, synthetic)", "action": "read",
     "resource": "episode summary", "purpose": "care", "fields": ["scores", "physical_context"]},
    {"occurred_at": "2026-11-19T08:21:00Z", "actor_label": "You", "action": "consent_change", "resource": "share_physical_context", "purpose": "self"}
  ],
  "next_cursor": null
}
```

### API-24 `POST /v1/episodes/{id}/red/ack` — acknowledge a RED episode
Scope `red:ack` (coordinator or clinician). `Idempotency-Key` required. F-03, F-11. Stops the 15-minute acknowledgement SLA clock (`SLA_RED_MINUTES`). It does **not** leave `RED_CRISIS`; only a clinician can do that (API-12 / API-13).

Request:
```json
{"note_category": "calling_now"}
```
Response `200`:
```json
{
  "episode_id": "0193f1b4-…00e2",
  "state": "RED_CRISIS",
  "acknowledged_by": {"staff_id": "0193…0c02", "role": "coordinator"},
  "acknowledged_at": "2026-11-19T08:06:40Z",
  "ack_latency_seconds": 400,
  "within_sla": true,
  "event_seq": 2
}
```
Writes event `RED_ACKNOWLEDGED` and sets `crisis_events.acknowledged_*`. A second ack is a no-op that returns the first ack (`200`). Errors: 403, 404, 409 (episode not RED).

### API-25 `POST /v1/episodes/{id}/contact-attempts` — log a contact attempt
Scope `contact:log` (coordinator or clinician). `Idempotency-Key` required. F-07, F-11. Stored as an `EpisodeEvent` of type `CONTACT_ATTEMPT` (no separate table).

Request:
```json
{"channel": "phone", "outcome": "reached_safe", "note": null, "next_attempt_at": null}
```
- `channel`: `phone | video | sms | whatsapp | in_person | crisis_line_transfer`
- `outcome`: `reached_safe | reached_needs_emergency | no_answer | wrong_number | declined_contact | voicemail_neutral`
- `note`: optional, max 500 chars, crisis-gated, stored only as structured outcome unless the clinician note policy allows it (v1).

Response `201`:
```json
{"event_seq": 3, "type": "CONTACT_ATTEMPT", "attempt_number": 1, "episode_state": "RED_CRISIS",
 "escalation": null}
```
Three `no_answer` attempts on a RED episode within 60 minutes set `escalation: {"level": 2, "to": "on_call_clinician"}` (rule in `sla.v1.json`). Errors: 403, 404, 422.

### API-26 `GET /v1/me/preferences` · `PUT /v1/me/preferences` — my preferences
Scope `preferences:self`. F-05, F-14. Stored on `persons` (E-01). Feeds the Step Matcher (API-06); changing preferences on an open episode creates a new `proposed` recommendation (source `initial` is superseded), never a confirmed step.

`GET` response `200` (and `PUT` request body / response):
```json
{
  "language": "ar",
  "clinician_gender": "female",
  "modality": ["video", "in_person"],
  "area": "abu_dhabi_city",
  "insurance_plan": "thiqa",
  "discreet_mode": true,
  "read_aloud": false
}
```
`area` ∈ `abu_dhabi_city | al_ain | al_dhafra`. `language` ∈ `ar | en | ur` in the MVP (v1 adds `hi`, `ml`, `tl`). `PUT` response adds `"recommendation_refreshed": true|false`. Errors: 422.

### API-27 `GET /v1/me/notifications` — my in-app inbox
Scope `notifications:self`. F-14, F-21. Query: `unread_only`, `limit`, `cursor`. Text is discreet when `discreet_mode` is on.

Response `200`:
```json
{
  "items": [
    {"id": "0193f1d1-…n001", "created_at": "2026-11-19T08:22:00Z", "channel": "in_app",
     "text": "You have an update about your appointment request.", "read": false, "deep_link": "/ar/episode/0193f1b4-…00e1"}
  ],
  "unread_count": 1,
  "next_cursor": null
}
```
`POST /v1/me/notifications/{id}/read` (204) marks one read; it is part of API-27. Errors: 401.

### API-28 `POST /v1/demo/reset` — reset seeded demo data
Scope `demo:reset`. Exists only when `DEMO_MODE=true` (otherwise `404`). F-17. Truncates person-linked tables and re-runs `app.seed` with the given seed; rules and providers are reloaded.

Request: `{"seed": 42, "scenario": "judge_tour"}` (`scenario` ∈ `judge_tour | empty | busy_queue`).
Response `200`:
```json
{"reset_at": "2026-11-19T07:59:00Z", "personas": ["mariam", "imran", "dr_salma", "khalid", "programme_lead"],
 "episodes_seeded": 240, "simulated_cohort": 5000, "rules_version": "1.0.0"}
```
Errors: 404 (demo disabled), 409 (reset already running), 429.

### API-29 `POST /v1/events` — first-party analytics events
Scope `events:write` (any authenticated role; the anonymous landing page may send without a token, rate-limited per IP). F-15, METRICS. **No PII, no scores, no free text.** The server rejects any property not in the allow-list in `packages/rules/analytics_events.v1.json`.

Request:
```json
{"events": [
  {"name": "screen_viewed", "ts": "2026-11-19T08:00:01Z", "props": {"screen": "result", "locale": "ar", "role": "person"}},
  {"name": "quick_exit_tapped", "ts": "2026-11-19T08:03:12Z", "props": {"screen": "result"}}
]}
```
Response `202`: `{"accepted": 2, "rejected": 0}`. Rejected events list `{index, reason}` (e.g. `"property 'score' not allowed"`). Stored in `analytics_events` (operational table, no person ID; session is a random per-tab ID). Errors: 413 (> 50 events), 422.

---

## 3. Webhooks and callbacks

| MVP | v1 |
|---|---|
| None. Notifications are written to `notifications` and shown in-app; mocks log a line. | Inbound: SMS provider delivery receipts `POST /v1/hooks/sms-status` (HMAC-signed), Malaffi ACK for REF messages via the facility integration engine. Outbound: none to third parties; Sahatna receives deep links, not pushes. Designed in [INTEGRATIONS](INTEGRATIONS.md). |

## 4. Health endpoints (not in the API-xx list)

- `GET /healthz` → `{"status": "ok|degraded", "db": true, "rules_version": "1.0.0", "rules_sha256": "…", "last_sweep_at": "…", "llm_provider": "gemini"}`. Public, no PHI.
- `GET /readyz` → 200 only when DB is reachable and the rules hash matches the active E-17 row.
