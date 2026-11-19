# MVP API addendum (build contract, 2026-11-19)
> Extends `api/openapi.yaml`. Where this file and openapi.yaml disagree, **this file wins for the MVP build**.
> Base URL `http://localhost:8000`. Auth: `Authorization: Bearer <token>` from `POST /v1/auth/demo-login`.
> Errors: RFC 9457 problem+json. CORS exposes `ETag`. `Idempotency-Key` is accepted on every POST but never required.
> All AI endpoints work with no API key (`LLM_PROVIDER=none` or missing key → deterministic template, `content_type: "template"`, `provider: "none"`).

## Personas (demo-login `persona`)
| persona | role | notes |
|---|---|---|
| judge | judge | read programme + evals, reset demo, may call every GET |
| mariam | person | Emirati woman, 34, Thiqa, Arabic, prefers female clinician, video. Has NO episode until she screens |
| imran | person | Pakistani man, 41, basic plan, Urdu/English. Seeded episode at MONITORING with 3 re-checks (trajectory demo) |
| dr_salma | clinician | Family physician (Arabic/English), provider "Al Noor Family Health — Dr Salma" |
| khalid | coordinator | Care coordinator; sees RED queue |
| programme_lead | programme | dashboard |
Passcode = env `JUDGE_PASSCODE` (default `jisr-demo`).

## Fixes to existing endpoints
- **Episode (API-05)** adds: `person_label`, `opened_at`, `language`, `active_referral_id` (uuid|null), `referrals: [{id, status, provider_id, provider_name, sla_due_at}]`, `recommendation_id` (uuid|null, latest proposed/confirmed), `fired_rules: [string]`, `red_severity` (imminent|high|same_day_check|review|null), `score_history: [{instrument, total, at}]`, `consents: {scope: granted|revoked}`. Response header `ETag: "<last_event_seq>"`.
- **CrisisCheckResult (API-04)** adds: `severity`, `urgency` (`emergency` | `same_day_check` | null), `categories: [string]`, `episode_id` (uuid|null).
- **ScreeningItem** adds `option_labels: [string]` (English), `stem`, `crisis_item: bool`. Link ids: `PHQ9_1..PHQ9_9`, `PHQ9_10` (difficulty, not scored), `GAD7_1..GAD7_7`. Pre-screen items reuse `PHQ9_1, PHQ9_2, GAD7_1, GAD7_2`.
- Free text: send it to **API-04 with `episode_id`** after API-03 (API-02 `free_text` is also scanned if sent).
- API-03 called again with `request_support: true` on a completed session opens a self-referral episode (no 409).

## New endpoints
### `GET /v1/me/episodes` (person)
`{ items: [{ id, state, current_step, is_red, opened_at }] }` newest first.

### `GET /v1/episodes/{id}/trajectory` (person owner, clinician, coordinator, judge)
```json
{ "points": [{ "at": "2026-10-01T09:00:00Z", "phq9": 17, "gad7": 14, "label": "Baseline" }],
  "rci_thresholds": { "PHQ9": 6, "GAD7": 4 }, "caseness": { "PHQ9": 10, "GAD7": 8 },
  "classification": { "PHQ9": "reliable_improvement", "GAD7": "no_reliable_change" } }
```

### `POST /v1/companion/chat` (person; judge allowed) — "Jisr Companion"
Request `{ "messages": [{"role":"user"|"assistant","content":"..."}], "language": "en"|"ar"|"ur", "episode_id": uuid|null }`.
The Crisis Gate runs on the **latest user message before any LLM call**.
```json
{ "reply": "string", "content_type": "ai_drafted"|"template", "provider": "gemini"|"none",
  "gate": { "crisis": false, "severity": null, "matched_rule_ids": [], "categories": [], "latency_ms": 2 },
  "validator": { "result": "pass"|"fail"|"skipped", "findings": [] },
  "suggestions": ["Take the 2-minute check-in", "See support options"],
  "crisis_lines": [], "episode_id": null, "llm_locked": false }
```
On crisis: `llm_locked: true`, template reply, `crisis_lines` filled, a RED episode is opened (or the given one flips to RED), `episode_id` returned.

### `POST /v1/episodes/{id}/handoff-summary` (clinician, coordinator, judge) — AI hand-off with provenance
```json
{ "facts": [{ "id": "F1", "label": "PHQ-9 total", "value": "11 (moderate)", "kind": "observed"|"calculated" }],
  "sentences": [{ "text": "PHQ-9 is 11, in the moderate band.", "sources": ["F1"], "status": "verified"|"removed" }],
  "removed_count": 0, "validator": { "result": "pass", "findings": [] },
  "content_type": "ai_drafted"|"template", "provider": "gemini"|"none", "generated_at": "..." }
```
Every sentence must cite ≥1 fact id; any sentence with a number/date/name not in its facts is marked `removed`.

### `POST /v1/programme/ask` (programme, judge) — Programme Copilot
Request `{ "question": "Which nationality group has the lowest conversion?" }`.
```json
{ "answer": "string", "content_type": "ai_drafted"|"template", "provider": "gemini"|"none",
  "intent": "fairness"|"trend"|"funnel"|"sla"|"geo"|"unknown",
  "chart": { "type": "bar"|"line", "title": "string", "x": ["..."], "series": [{ "name": "string", "values": [number|null] }], "unit": "%" } | null,
  "suppressed_note": "string|null", "data_label": "SIMULATED" }
```
The AI only narrates numbers computed by the engine (validator enforces); `null` values are suppressed cells (n<10).

### `GET /v1/programme/timeseries` (programme, judge)
`{ "weeks": ["2026-08-24", ...], "series": { "screens": [], "positive": [], "referred": [], "attended": [], "conversion_pct": [], "median_days_to_care": [], "red_ack_p50_min": [], "red_ack_p90_min": [] }, "data_label": "SIMULATED" }` (12 weeks).

### `GET /v1/programme/geo` (programme, judge)
`{ "regions": [{ "id": "abu_dhabi_city"|"al_ain"|"al_dhafra", "name": "Abu Dhabi City", "screens": 0, "positive": 0, "conversion_pct": 0, "median_days_to_care": 0, "suppressed": false }], "data_label": "SIMULATED" }`

### `GET /v1/programme/sla` (programme, judge)
`{ "items": [{ "kind": "crisis_ack"|"referral_accept"|"first_appt"|"recheck", "target": "15 min", "met_pct": 0, "breaches": 0, "p50": "6 min", "p90": "13 min" }] }`

### `POST /v1/sim/run` (extended)
Request adds `scenario.capacity_multiplier`, `scenario.sla_hours`, `scenario.baseline_conversion`. Response adds
`"curve": { "days": [0,7,...,84], "baseline_cum_pct": [], "jisr_cum_pct": [] }` and `"waiting_list": { "baseline": int, "jisr": int }`.

### `GET /v1/evals/crisis` and `POST /v1/evals/crisis/run` (judge, programme, any staff)
```json
{ "ran_at": "...", "n": 150, "positives": 110, "negatives": 40, "recall": 1.0, "precision": 0.93, "false_negatives": [],
  "false_positives": [{ "id": "B-123", "lang": "en", "text": "..." }], "latency_p95_ms": 3,
  "by_language": [{ "lang": "ar", "n": 40, "recall": 1.0, "precision": 0.9 }], "rules_version": "..." }
```
`run` executes the benchmark live against the deterministic gate (no LLM) and returns the same shape.
