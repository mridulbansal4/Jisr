# Observability
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Architecture](../03-engineering/ARCHITECTURE.md) · [Runbook](RUNBOOK.md) · [Performance](../03-engineering/PERFORMANCE.md) · [AI evals](../04-ai/AI_EVALS.md) · [Privacy](../06-security-compliance/PRIVACY.md) · [Compliance](../06-security-compliance/COMPLIANCE.md)

Principle: **observe the pathway, not the person.** Telemetry carries IDs, states, durations and counts. It never carries free text, answers, names, phone numbers, Emirates ID or scores tied to a person.

## 1. Logging

### 1.1 Format
Structured JSON to stdout via `structlog` (API) and a tiny `logger.ts` wrapper (web server components / route handlers). One event per line.

```json
{"ts":"2026-11-19T10:42:07.512Z","level":"info","service":"api","env":"production","commit":"a1b2c3d",
 "event":"crisis_gate.fired","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"00f067aa0ba902b7",
 "episode_id":"ep_01JD…","trigger_types":["lexicon","phq9_item9"],"lang":"ar","latency_ms":38,
 "ruleset":"crisis-lexicon.v1","route":"POST /v1/crisis/check","status":200}
```

### 1.2 Redaction (enforced in code, tested in CI)
| Rule | How |
|---|---|
| Allow-list, not deny-list | A structlog processor drops every key not in `LOG_FIELDS_ALLOWED` (ids, enums, durations, counts, status codes, versions) |
| Free text never logged | Request/response bodies are not logged. Crisis lexicon matches log the **trigger type and rule id**, never the matched phrase. F-22 free text is not even stored in the DB unless the person gave the *store free text* consent; only the gate result + matched category are kept |
| Person IDs pseudonymous | `person_id` logged only as `HMAC-SHA256(person_id, LOG_PEPPER)[:16]`; episode IDs are random ULIDs with no meaning |
| Scrubber as a backstop | Regex scrubber for Emirates ID (`784-\d{4}-\d{7}-\d`), UAE mobiles (`(\+971|0)5\d{8}`), emails, JWTs; replaced with `[REDACTED:<type>]` and a `redaction_hits` counter metric (should be 0; any hit is a bug) |
| LLM payloads | Prompts and completions are never logged. The `ExplanationRecord` (E-18) in the DB stores the validated output + validator result under the same access control as clinical data |
| Errors | Exceptions logged with type + stack, with local variables disabled (no `capture_locals`) |
| Web | No third-party analytics or session replay in the person app (brief: covert monitoring is a named harm). Product analytics events are first-party, aggregated, no free text |

Test: `tests/test_log_redaction.py` feeds a request containing Arabic crisis text, an Emirates ID and a phone number and asserts none appear in captured logs.

### 1.3 Audit log ≠ app log
`AuditLog` (E-14) is a database table: who (staff id, role), what (resource, action), when, why (purpose of use), from where. Append-only (trigger blocks UPDATE/DELETE). Persons see their own via API-23. App logs are for operations; the audit log is for accountability and DoH audit.

### 1.4 Retention
| Data | MVP | v1 |
|---|---|---|
| App logs | Render log stream default retention (plan-dependent **[U]**) | Log Analytics UAE North, 90 days hot + archive per ADHICS / DoH requirement **[U]: confirm ADHICS log-retention clause**; no log export outside the UAE |
| Traces / metrics | Grafana Cloud free tier default (≈14 days traces) **[U]** | App Insights UAE North, 90 days |
| AuditLog | DB, life of the demo | ≥ the medical-record retention period that DoH sets for the facility **[U]**; never shorter than app logs |

(The India-specific CERT-In 180-day rule in the doc template does not apply; UAE / DoH equivalents are in [COMPLIANCE](../06-security-compliance/COMPLIANCE.md).)

## 2. Tracing (OpenTelemetry)
- API: `opentelemetry-instrumentation-fastapi`, `-sqlalchemy`, `-httpx`; exporter OTLP/HTTP to `OTEL_EXPORTER_OTLP_ENDPOINT` (Grafana Cloud free tier in MVP; Azure Monitor OpenTelemetry distro in v1). Empty endpoint → console exporter off, no-op.
- Web: `@vercel/otel` in `instrumentation.ts`; propagate `traceparent` to the API.
- Custom spans: `crisis_gate.evaluate`, `scoring.compute`, `step_matcher.match`, `llm.generate`, `llm.validate`, `sla.tick`, `referral.escalate`.
- Span attributes follow the same allow-list as logs. GenAI semantic-convention attributes used: `gen_ai.system`, `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`; **no** `gen_ai.prompt` / `gen_ai.completion` content.
- Sampling: 100% in the demo; v1 parent-based 20% plus 100% for errors and any span on a RED episode.

## 3. Metrics

### 3.1 RED (rate, errors, duration) per route
`http_server_requests_total{route,status}`, `http_server_duration_seconds{route}` (histogram).

### 3.2 Safety and pathway metrics (the ones that matter)
| Metric | Type | Labels | Why |
|---|---|---|---|
| `crisis_gate_evaluations_total` | counter | `source` (screening, free_text), `lang` | Volume |
| `crisis_gate_fired_total` | counter | `trigger_type`, `lang` | Safety signal |
| `crisis_gate_latency_ms` | histogram | `source` | Demo promise < 1 s (brief §14) |
| `crisis_gate_fail_closed_total` | counter | `cause` (error, timeout, rules_unavailable, client_unreachable) | Fail-closed rule (brief §5): input treated as RED; should be ~0 |
| `crisis_gate_llm_raise_total` | counter | `lang` | M-02 raised a case the rules did not (review each one: candidate lexicon gap) |
| `red_episode_ack_seconds` | histogram | `ack_role` (coordinator, clinician) | Time from RED to acknowledgement via API-24 (coordinator or clinician); SLA 15 min (`SLA_RED_MINUTES`) |
| `red_episodes_open_unclosed` | gauge | — | Acknowledged but not yet closed by a clinician (only clinicians can close RED) |
| `red_episodes_unacked` | gauge | — | Open RED episodes past SLA |
| `referral_sla_breaches_total` | counter | `stage` (accept, book, attend) | Hand-off reliability |
| `episodes_by_state` | gauge | `state` | Funnel health |
| `sla_scheduler_last_tick_timestamp` | gauge | — | Detect a dead scheduler |
| `redaction_hits_total` | counter | `type` | Should be 0 |

### 3.3 LLM metrics (M-01, M-02)
| Metric | Labels | Notes |
|---|---|---|
| `llm_requests_total` | `task` (explain, draft, crisis_raise), `model`, `outcome` (ok, timeout, error, disabled, no_consent) | `no_consent` = person's *AI-drafted summaries* scope off ⇒ template served, no LLM call |
| `llm_latency_ms` | `task`, `model` | p95 target 3 s explain, 2 s crisis_raise |
| `llm_tokens_total` | `task`, `model`, `kind` (input, output, thinking) | Feeds cost |
| `llm_cost_usd_total` | `task`, `model` | tokens × price table in config (update when Google changes pricing; [COST](COST.md) §4) |
| `llm_validator_failures_total` | `task`, `reason` (unsupported_number, unsupported_provider, banned_claim, schema_invalid, lang_mismatch) | Every failure falls back to a template |
| `llm_fallback_total` | `task`, `reason` | Share of explanations served by M-03 |
| `llm_schema_parse_errors_total` | `task` | JSON-schema output broke |

Quality is measured offline by `evals.yml` (unsupported claims = 0), not by sampling production text.

## 4. Dashboards
1. **Safety** (on the wall on demo day): crisis gate fired / latency, RED episodes open, ack time vs 15-min SLA, M-02 raises, validator failures.
2. **Pathway**: episodes by state, referral SLA breaches by stage, time-to-first-appointment (this is the operational twin of the programme dashboard F-15, which is product, not ops).
3. **Platform**: RED metrics per route, DB pool, scheduler heartbeat, LLM latency/tokens/cost.

## 5. Alerts

| Alert | Condition | Severity | Route |
|---|---|---|---|
| **RED episode SLA breach** | any RED episode unacknowledged > `SLA_RED_MINUTES` (15) | SEV-1 | v1: page on-call clinician + coordinator (Khalid) and escalate to the duty manager at +5 min. MVP: in-app banner + team Slack/WhatsApp webhook |
| Crisis gate error / fail-closed | any 5xx on `/v1/crisis/check` or `/complete`, any gate exception, or `crisis_gate_fail_closed_total` increases | SEV-1 | page tech on-call; users are already safe (input treated as RED), but the RED queue will flood |
| Crisis gate slow | p95 `crisis_gate_latency_ms` > 1000 for 5 min | SEV-2 | tech |
| SLA scheduler dead | `now - sla_scheduler_last_tick_timestamp` > 180 s | SEV-1 (timers are a safety control) | tech |
| Referral SLA breaches spike | > 5 in 1 h | SEV-3 | coordinator |
| LLM validator failure rate | > 10% of `explain` over 15 min | SEV-3 | AI owner; auto-switch to templates if > 30% |
| LLM timeouts | > 20% over 5 min | SEV-3 | auto-disable M-02, keep M-01 with template fallback |
| LLM spend | daily cost > USD 5 (demo) | SEV-3 | tech lead |
| Redaction hit | `redaction_hits_total` increases | SEV-2 | tech; treat as a potential privacy incident ([RUNBOOK](RUNBOOK.md) §5) |
| Demo-login brute force | > 100 failures / hour | SEV-2 | tech; rotate passcode |
| API down | `/healthz` failing 2 min (external uptime check, e.g. Better Stack / UptimeRobot free) | SEV-1 on demo day | tech |

## 6. MVP vs v1
| | MVP | v1 |
|---|---|---|
| Logs | stdout → Render | Log Analytics (UAE North), private link |
| Traces/metrics | Grafana Cloud free (optional, synthetic only) | Azure Monitor / App Insights UAE North; no telemetry leaves the UAE |
| Alerting | webhook to team chat | Azure Monitor action groups → on-call rota (PagerDuty-equivalent hosted in-region or SMS via licensed UAE provider) |
| Review | daily stand-up glance | weekly safety review of M-02 raises, validator failures, SLA breaches (clinical safety officer) |
