# Backlog
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Features](../01-product/FEATURES.md) · [User stories](../01-product/USER_STORIES.md) · [Team](TEAM.md) · [Hackathon plan](../00-overview/HACKATHON_PLAN.md) · [API spec](../03-engineering/API_SPEC.md)

36-hour build, 18–20 Nov 2026. Tickets **JIS-xxx** map to features **F-xx**, stories **US-xx**, endpoints **API-xx** and entities **E-xx** from the brief. Owners use the role codes in [TEAM.md](TEAM.md) (PL, BE, FE, AI). Estimates are focused build hours. The hour blocks are the plan of record for tickets; if [HACKATHON_PLAN.md](../00-overview/HACKATHON_PLAN.md) gives different clock times, HACKATHON_PLAN wins for clock times and this file is updated (owner: PL).

**Hour blocks:** B1 H0–4 · B2 H4–8 · B3 H8–12 · B4 H12–16 · B5 H16–20 · B6 H20–24 · B7 H24–28 · B8 H28–32 · B9 H32–36. Feature freeze at H30.

**Labels** (create once in GitHub): `epic:<name>`, `F-xx`, `owner:<role>`, `block:B1`…`block:B9`, `prio:must|should|could`, `mvp`, `safety` (needs BE + AI review and a green eval run).

## 1. Epics
| Epic | Tickets | Features |
|---|---|---|
| E0 Foundation | JIS-001 – JIS-007 | all |
| E1 Rules & engines | JIS-010 – JIS-018 | F-01, F-03, F-05, F-10 |
| E2 Episode ledger & hand-off | JIS-020 – JIS-028 | F-07, F-08 |
| E3 AI explanation & safety | JIS-030 – JIS-036 | F-03, F-04 |
| E4 Person app | JIS-040 – JIS-049 | F-01, F-03, F-04, F-05, F-07, F-09, F-13, F-14, F-20 |
| E5 Staff console | JIS-050 – JIS-054 | F-07, F-11, F-12 |
| E6 Programme | JIS-060 – JIS-064 | F-15, F-16 |
| E7 Integration & privacy | JIS-070 – JIS-075 | F-02, F-13, F-19, F-21 |
| E8 Judge Mode & evals | JIS-080 – JIS-086 | F-17, F-18 |
| E9 Ship | JIS-090 – JIS-095 | deliverables |

## 2. Summary table
| ID | Title | F-xx | Owner | Est (h) | Block | Prio |
|---|---|---|---|---|---|---|
| JIS-001 | Monorepo scaffold | — | BE | 1.5 | B1 | must |
| JIS-002 | CI skeleton (lint → test → eval → build) | F-18 | BE | 1.5 | B1 | must |
| JIS-003 | DB schema + migrations E-01–E-18 | F-08 | BE | 3 | B1 | must |
| JIS-004 | Synthetic cohort + providers + IFHAS bundle seed | F-06, F-02, F-12 | AI | 3 | B1–B2 | must |
| JIS-005 | Next.js shell, next-intl AR/EN/UR, RTL, PWA | F-01 | FE | 3 | B1 | must |
| JIS-006 | OpenAPI contract for API-01–API-23 + web mocks | — | BE | 2 | B1 | must |
| JIS-007 | Deploy pipeline (Vercel + Render + Postgres) | — | BE | 2 | B2 | must |
| JIS-010 | Instrument rule files (PHQ-2/9, GAD-2/7) with citations | F-01 | BE | 1 | B1 | must |
| JIS-011 | Scoring engine | F-01 | BE | 1.5 | B2 | must |
| JIS-012 | Crisis Gate engine (item 9, C-SSRS flag, lexicon, fail-closed) | F-03 | BE | 3 | B2 | must |
| JIS-013 | Crisis lexicon AR / EN / Arabizi / UR v1 | F-03 | AI | 3 | B1–B2 | must |
| JIS-014 | Step Matcher engine + rule file | F-05 | BE | 3 | B3 | must |
| JIS-015 | RCI engine | F-10 | BE | 1.5 | B4 | must |
| JIS-016 | SLA scheduler + escalation (APScheduler) | F-08, F-07 | BE | 2 | B4 | must |
| JIS-017 | RuleSetVersion (E-17) stamping | F-05 | BE | 1 | B3 | must |
| JIS-018 | Fairness aggregation + suppression engine | F-15 | BE | 2 | B5 | must |
| JIS-020 | Episode state machine + append-only events | F-08 | BE | 3 | B2 | must |
| JIS-021 | Screening APIs API-01/02/03 | F-01, F-03 | BE | 2 | B2 | must |
| JIS-022 | Crisis check API-04 | F-03 | BE | 1 | B2 | must |
| JIS-023 | Episode + recommendation APIs API-05/06 | F-08, F-05 | BE | 1.5 | B3 | must |
| JIS-024 | Referral APIs API-07/08/09 + re-match | F-07 | BE | 3 | B3–B4 | must |
| JIS-025 | Re-check API-10 | F-10 | BE | 1 | B4 | must |
| JIS-026 | Staff queue API-11 + confirm-step API-12 | F-11 | BE | 2 | B4 | must |
| JIS-027 | Close episode API-13 with evidence rule | F-08 | BE | 1 | B5 | must |
| JIS-028 | Provider search API-15 | F-06 | BE | 1 | B3 | must |
| JIS-030 | LLMProvider interface (gemini / azure_openai / local / none) | F-04 | AI | 2 | B2 | must |
| JIS-031 | Explanation prompt + JSON schema (AR/EN/UR) | F-04 | AI | 2 | B3 | must |
| JIS-032 | Claim validator | F-04 | AI | 3 | B3 | must |
| JIS-033 | Template fallback (M-03) AR/EN/UR | F-04 | PL | 2 | B2 | must |
| JIS-034 | Explain API-18 + ExplanationRecord (E-18) | F-04 | AI | 1.5 | B4 | must |
| JIS-035 | M-02 raise-only crisis classifier | F-03 | AI | 2 | B5 | should |
| JIS-036 | LLM lock for RED sessions (spy test) | F-03 | AI | 1 | B4 | must |
| JIS-040 | Screening UI (one item per screen, resume) | F-01 | FE | 4 | B2–B3 | must |
| JIS-041 | Crisis screen + "I need help now" on every screen (offline) | F-03 | FE | 2 | B2 | must |
| JIS-042 | Result explanation screen (observed / calculated / AI-drafted) | F-04 | FE | 2 | B4 | must |
| JIS-043 | Recommendation + preferences + provider choice | F-05, F-06 | FE | 3 | B4 | must |
| JIS-044 | Three-tap booking request + status | F-07 | FE | 2 | B5 | must |
| JIS-045 | Waiting-well modules (3) + re-check form | F-09, F-10 | FE | 3 | B6 | should |
| JIS-046 | Consent centre UI | F-13 | FE | 2 | B5 | must |
| JIS-047 | Discreet mode + quick exit | F-14 | FE | 1.5 | B6 | should |
| JIS-048 | Read-aloud (Web Speech API) | F-20 | FE | 1.5 | B8 | could |
| JIS-049 | Self-help module content AR/EN/UR | F-09 | PL | 2 | B4 | should |
| JIS-050 | Staff queue UI with RED SLA clock | F-11 | FE | 3 | B5 | must |
| JIS-051 | One-screen summary + physical context | F-11, F-12 | FE | 3 | B6 | must |
| JIS-052 | Confirm / change step UI with reason codes | F-11 | FE | 1.5 | B6 | must |
| JIS-053 | Provider accept / decline view (Judge Mode) | F-07 | FE | 1.5 | B6 | must |
| JIS-054 | Crisis response documentation form | F-03, F-11 | FE | 1.5 | B6 | must |
| JIS-060 | Metrics API-16 (funnel, K1–K6) | F-15 | BE | 3 | B5–B6 | must |
| JIS-061 | Fairness API-17 (suppressed) | F-15 | BE | 1.5 | B6 | must |
| JIS-062 | Programme dashboard UI | F-15 | FE | 4 | B7 | must |
| JIS-063 | Simulation engine + API-21 | F-16 | AI | 3 | B6 | should |
| JIS-064 | Simulation panel UI | F-16 | FE | 1.5 | B7 | should |
| JIS-070 | FHIR import API-19 | F-02 | BE | 2.5 | B5 | should |
| JIS-071 | FHIR export API-20 | F-19 | BE | 2 | B7 | could |
| JIS-072 | Sahatna launch stub route | F-19 | FE | 1 | B8 | could |
| JIS-073 | Notification abstraction + SMS mock inbox | F-21, F-14 | BE | 2 | B5 | should |
| JIS-074 | Consent API-14 + enforcement on reads | F-13 | BE | 2.5 | B4 | must |
| JIS-075 | AuditLog + API-23 | F-13 | BE | 1.5 | B6 | should |
| JIS-080 | Demo login API-22 + role switcher | F-17 | BE | 1.5 | B3 | must |
| JIS-081 | Guided 3-minute tour | F-17 | FE | 2 | B8 | must |
| JIS-082 | Crisis benchmark dataset | F-18 | AI | 3 | B3–B4 | must |
| JIS-083 | Step-matcher test cases | F-18 | AI | 2 | B5 | must |
| JIS-084 | Validator test suite | F-18 | AI | 1.5 | B5 | must |
| JIS-085 | Eval runner + EVAL.md generation | F-18 | AI | 2 | B6 | must |
| JIS-086 | Eval gate in CI | F-18 | AI | 1 | B6 | must |
| JIS-090 | Production demo deploy + seed reset script | — | BE | 2 | B8 | must |
| JIS-091 | Playwright smoke test of the 5 demo moments | F-17 | AI | 2 | B8 | must |
| JIS-092 | README, assumptions/dependencies/limitations | — | PL | 3 | B8–B9 | must |
| JIS-093 | Demo video (backup) | — | PL | 2 | B9 | must |
| JIS-094 | Rehearsal + fallback plan | — | PL | 1.5 | B9 | must |
| JIS-095 | Submission | — | PL | 1 | B9 | must |

**Totals:** PL 11.5 h · BE 59 h · FE 43 h · AI 32 h · **145.5 h**. A 4-person team has ~120–130 focused hours in 36 h after sleep and breaks, so **expect to cut ~15–25 h**: see §4. **BE is the bottleneck (59 h for one person is not feasible; ~28–30 focused hours each is realistic).** Rebalance at kick-off: AI takes JIS-018, JIS-060, JIS-061, JIS-070, JIS-073, JIS-075 (−12.5 h BE → AI ≈ 44.5 h); FE takes the web half of JIS-007. Even then, BE + AI carry ~90 h against ~60 focused hours for two people, so plan on cuts 1–8 in §4 (≈ 20 h, mostly BE/AI work) from the start and protect the "never cut" list. PL has slack (11.5 h): PL co-authors the crisis lexicon (JIS-013) and benchmark (JIS-082) and writes provider seed records (part of JIS-004). Re-check load at the H12 stand-up.

## 3. Tickets (paste-ready)
Each block below is one GitHub Issue: the heading is the title, the rest is the body.

### E0 Foundation

#### JIS-001 Monorepo scaffold
`labels: epic:foundation, owner:BE, block:B1, prio:must, mvp` · Est 1.5 h
Create `apps/web`, `services/api`, `packages/rules`, `ai/prompts`, `ai/evals`, `data/synthetic`, `infra`, `packages/contracts/openapi.yaml` (brief §10). Docker compose for Postgres 16.
- [ ] `docker compose up -d db` works; `uv sync` and `pnpm install` succeed
- [ ] Commands in CLAUDE.md run without error

#### JIS-002 CI skeleton
`labels: epic:foundation, F-18, owner:BE, block:B1, prio:must, mvp` · Est 1.5 h
GitHub Actions: lint → test → eval → build (deploy added in JIS-007).
- [ ] Workflow runs on every PR; ruff, mypy, pytest, pnpm lint/typecheck/test jobs present
- [ ] Eval job placeholder exists (made blocking in JIS-086)

#### JIS-003 DB schema + migrations E-01–E-18
`labels: epic:foundation, F-08, owner:BE, block:B1, prio:must, mvp` · Est 3 h
SQLAlchemy 2.1 models + Alembic migration for all entities in brief §7. `episode_event` and `audit_log` are insert-only (DB privileges or trigger).
- [ ] UPDATE/DELETE on `episode_event` fails (test)
- [ ] Every table has `synthetic` flag where personal data is stored

#### JIS-004 Synthetic cohort, providers, IFHAS bundle
`labels: epic:foundation, F-06, F-02, F-12, owner:AI, block:B1, prio:must, mvp` · Est 3 h
2,000 synthetic persons (age, gender, nationality group, language, region, plan) with scripted PHQ/GAD trajectories; ≥ 40 providers across L1–L4, Thiqa/Basic/Enhanced, AR/EN/UR, both genders, three regions; seeded IFHAS FHIR bundle for P-01 with physical context (HbA1c, BMI, sleep). Seeded personas P-01–P-05. Document generation method and that demographics are not calibrated to Abu Dhabi (R-11).
- [ ] `uv run python -m app.seed` is deterministic for a fixed seed
- [ ] Every record has `synthetic: true`

#### JIS-005 Web shell with i18n and RTL
`labels: epic:foundation, F-01, owner:FE, block:B1, prio:must, mvp` · Est 3 h
Next.js 16 App Router, Tailwind 4, next-intl with `ar` (default per `.env.example`), `en`, `ur`; `dir="rtl"` for ar/ur; Arabic and Urdu-capable fonts; PWA manifest + service worker; persistent footer "synthetic data — not a medical device".
- [ ] Locale switch flips direction without losing state
- [ ] Lighthouse PWA installable

#### JIS-006 OpenAPI contract + mocks
`labels: epic:foundation, owner:BE, block:B1, prio:must, mvp` · Est 2 h
`packages/contracts/openapi.yaml` with API-01–API-23 exactly as named in brief §8; generate TS client; mock server for FE.
- [ ] FE can call every endpoint against mocks

#### JIS-007 Deploy pipeline
`labels: epic:foundation, owner:BE, block:B2, prio:must, mvp` · Est 2 h
Web on Vercel, API on Render (Docker), managed Postgres; preview deploys per PR.
- [ ] `main` auto-deploys; health endpoint green

### E1 Rules & engines

#### JIS-010 Instrument rule files
`labels: epic:rules, F-01, owner:BE, block:B1, prio:must, mvp` · Est 1 h
`packages/rules/instruments.v1.json`: PHQ-2/9, GAD-2/7 items (ids only; text in i18n), scoring, bands (Kroenke 2001, Spitzer 2006), LOINC codes, citations.
- [ ] Each threshold has a `source` field

#### JIS-011 Scoring engine
`labels: epic:rules, F-01, owner:BE, block:B2, prio:must, mvp, safety` · Est 1.5 h
Pure function: answers → scores + bands; missing items → explicit error, never imputed.
- [ ] 100% branch coverage; boundary tests at 4/5, 9/10, 14/15, 19/20

#### JIS-012 Crisis Gate engine
`labels: epic:rules, F-03, owner:BE, block:B2, prio:must, mvp, safety` · Est 3 h
Triggers: PHQ-9 item 9 > 0; C-SSRS screener items behind `FF_CSSRS_ITEMS`; lexicon match on normalised text (Arabic letter normalisation, diacritics removal, Arabizi digit mapping, Urdu normalisation). Exceptions/timeouts → RED. Returns matched rule ids.
- [ ] US-06 and US-07 scenarios pass
- [ ] p95 < 1 s on 1,000 random inputs locally

#### JIS-013 Crisis lexicon v1
`labels: epic:rules, F-03, owner:AI, block:B1, prio:must, mvp, safety` · Est 3 h
`packages/rules/crisis_lexicon.v1.json`: direct and indirect phrases in Arabic (MSA + Gulf colloquial), Arabizi, English, Urdu (script + Roman Urdu). Mark every entry `native_reviewed: false` (R-04).
- [ ] ≥ 1 benchmark case per entry (JIS-082)

#### JIS-014 Step Matcher engine
`labels: epic:rules, F-05, owner:BE, block:B3, prio:must, mvp, safety` · Est 3 h
Severity band (higher of PHQ-9/GAD-7, pending OQ-02) → level L0–L4 per brief §6; RED overrides. Preferences, language, gender, modality, network and capacity rank providers but do not lower the level. Output factor list with plain-language reasons.
- [ ] US-14 – US-17 pass; Mariam (11/13) → L2 with factors

#### JIS-015 RCI engine
`labels: epic:rules, F-10, owner:BE, block:B4, prio:must, mvp` · Est 1.5 h
Jacobson–Truax RCI (METRICS.md §2.1) with SD and reliability from rule file; classify improved / no change / deteriorated; suggestion only.
- [ ] US-27, US-28 pass; deterioration with item 9 > 0 routes to Crisis Gate

#### JIS-016 SLA scheduler + escalation
`labels: epic:rules, F-08, F-07, owner:BE, block:B4, prio:must, mvp` · Est 2 h
APScheduler every minute: RED ack (`SLA_RED_MINUTES`), referral acceptance (`SLA_REFERRAL_ACCEPT_HOURS`), first appointment, re-check due. Appends `ESCALATED` events; idempotent.
- [ ] US-10 breach and US-20 pass with a frozen clock

#### JIS-017 RuleSetVersion stamping
`labels: epic:rules, F-05, owner:BE, block:B3, prio:must, mvp` · Est 1 h
Hash + version of loaded rule files stored in E-17 and referenced by every StepRecommendation, CrisisEvent and EpisodeEvent.
- [ ] Changing a rule file changes the version id

#### JIS-018 Fairness aggregation + suppression
`labels: epic:rules, F-15, owner:BE, block:B5, prio:must, mvp` · Est 2 h
Group-by engine for METRICS.md §2.3 dimensions with primary (n < `SMALL_CELL_K`) and complementary suppression; disparity ratio.
- [ ] US-36 passes; property test: no suppressed value derivable from totals

### E2 Episode ledger & hand-off

#### JIS-020 Episode state machine
`labels: epic:ledger, F-08, owner:BE, block:B2, prio:must, mvp` · Est 3 h
States and side states exactly as brief §7; transition table; state derived from events.
- [ ] Illegal transitions → 409 (US-23)

#### JIS-021 Screening APIs (API-01/02/03)
`labels: epic:ledger, F-01, F-03, owner:BE, block:B2, prio:must, mvp, safety` · Est 2 h
API-03 order: score → Crisis Gate → open episode, single transaction.
- [ ] US-01, US-02, US-06 pass

#### JIS-022 Crisis check API-04
`labels: epic:ledger, F-03, owner:BE, block:B2, prio:must, mvp, safety` · Est 1 h
- [ ] Free text never logged; response < 1 s p95

#### JIS-023 Episode + recommendation APIs (API-05/06)
`labels: epic:ledger, F-08, F-05, owner:BE, block:B3, prio:must, mvp` · Est 1.5 h
- [ ] Timeline returns events in order with actor roles

#### JIS-024 Referral APIs (API-07/08/09) + re-match
`labels: epic:ledger, F-07, owner:BE, block:B3, prio:must, mvp` · Est 3 h
Referral modelled as `ServiceRequest` + `Task` with SLA; packet includes only consented fields; decline → next-ranked provider proposal.
- [ ] US-18 – US-21 pass

#### JIS-025 Re-check API-10
`labels: epic:ledger, F-10, owner:BE, block:B4, prio:must, mvp, safety` · Est 1 h
Runs Crisis Gate, then RCI.
- [ ] Item 9 > 0 at re-check → RED

#### JIS-026 Queue API-11 + confirm-step API-12
`labels: epic:ledger, F-11, owner:BE, block:B4, prio:must, mvp` · Est 2 h
Order: RED → overdue → awaiting confirmation → others. Step change requires reason code.
- [ ] US-29, US-31 pass

#### JIS-027 Close API-13
`labels: epic:ledger, F-08, owner:BE, block:B5, prio:must, mvp` · Est 1 h
- [ ] US-24 passes; RED exit only by documented clinician decision (US-11)

#### JIS-028 Provider search API-15
`labels: epic:ledger, F-06, owner:BE, block:B3, prio:must, mvp` · Est 1 h
- [ ] Filter by network, language, gender, modality, level; returns wait and capacity

### E3 AI explanation & safety

#### JIS-030 LLMProvider interface
`labels: epic:ai, F-04, owner:AI, block:B2, prio:must, mvp` · Est 2 h
`gemini` (google-genai), `azure_openai`, `local`, `none`; timeout `LLM_TIMEOUT_SECONDS`; token counts recorded.
- [ ] `LLM_PROVIDER=none` works offline

#### JIS-031 Explanation prompt + schema
`labels: epic:ai, F-04, owner:AI, block:B3, prio:must, mvp, safety` · Est 2 h
Versioned prompt in `ai/prompts/`; input = structured facts only (scores, bands, level, locale); output JSON `{means[], does_not_mean[], next_step}`.
- [ ] No free text from the person is ever in the prompt

#### JIS-032 Claim validator
`labels: epic:ai, F-04, owner:AI, block:B3, prio:must, mvp, safety` · Est 3 h
Reject any number, date, instrument, provider, phone not in input facts; reject banned claims (diagnosis, prognosis, medication, "you have…"); require "screen, not diagnosis" sentence.
- [ ] US-13 passes

#### JIS-033 Template fallback (M-03)
`labels: epic:ai, F-04, owner:PL, block:B2, prio:must, mvp` · Est 2 h
Templates per band × level × locale in `messages/*.json`.
- [ ] Every band/level/locale combination has text

#### JIS-034 Explain API-18 + ExplanationRecord
`labels: epic:ai, F-04, owner:AI, block:B4, prio:must, mvp` · Est 1.5 h
- [ ] Stores provider, prompt version, validator result and reason

#### JIS-035 M-02 raise-only classifier
`labels: epic:ai, F-03, owner:AI, block:B5, prio:should, mvp, safety` · Est 2 h
Behind `LLM_CRISIS_SECOND_OPINION`; only consulted when deterministic gate is clear; skipped if > 2 s.
- [ ] US-08 passes (three scenarios)

#### JIS-036 LLM lock for RED sessions
`labels: epic:ai, F-03, owner:AI, block:B4, prio:must, mvp, safety` · Est 1 h
- [ ] Spy test: zero LLMProvider calls for a RED session after the gate fires

### E4 Person app

#### JIS-040 Screening UI
`labels: epic:person, F-01, owner:FE, block:B2, prio:must, mvp` · Est 4 h
One item per screen, large tap targets, progress, resume (US-05), 360 px layout.
- [ ] US-01 – US-03 (text part) pass in Playwright for ar/en/ur

#### JIS-041 Crisis screen + help button
`labels: epic:person, F-03, owner:FE, block:B2, prio:must, mvp, safety` · Est 2 h
Numbers from `CRISIS_LINES` with `tel:` links; no AI text; cached offline.
- [ ] US-09 passes offline

#### JIS-042 Explanation screen
`labels: epic:person, F-04, owner:FE, block:B4, prio:must, mvp` · Est 2 h
Visual labels Observed / Calculated / AI-drafted.
- [ ] US-12 passes

#### JIS-043 Recommendation, preferences, provider choice
`labels: epic:person, F-05, F-06, owner:FE, block:B4, prio:must, mvp` · Est 3 h
- [ ] US-14 – US-17 pass

#### JIS-044 Three-tap booking request
`labels: epic:person, F-07, owner:FE, block:B5, prio:must, mvp` · Est 2 h
Shows "nothing is shared with your employer" and the consented packet fields before sending.
- [ ] US-18 passes in ≤ 3 taps

#### JIS-045 Waiting-well modules + re-check form
`labels: epic:person, F-09, F-10, owner:FE, block:B6, prio:should, mvp` · Est 3 h
- [ ] US-25, US-26 pass

#### JIS-046 Consent centre UI
`labels: epic:person, F-13, owner:FE, block:B5, prio:must, mvp` · Est 2 h
- [ ] US-32 passes; no employer/insurer option

#### JIS-047 Discreet mode + quick exit
`labels: epic:person, F-14, owner:FE, block:B6, prio:should, mvp` · Est 1.5 h
- [ ] US-33 passes

#### JIS-048 Read-aloud
`labels: epic:person, F-20, owner:FE, block:B8, prio:could` · Est 1.5 h
Behind `FF_READ_ALOUD`.
- [ ] US-03 audio scenarios pass

#### JIS-049 Self-help module content
`labels: epic:person, F-09, owner:PL, block:B4, prio:should, mvp` · Est 2 h
Three modules (sleep routine, worry time, behavioural activation basics) in AR/EN/UR, plain language, NICE CG123 low-intensity principles, marked "not native-reviewed".
- [ ] Each module ≤ 5 screens

### E5 Staff console

#### JIS-050 Staff queue with RED clock
`labels: epic:staff, F-11, owner:FE, block:B5, prio:must, mvp, safety` · Est 3 h
- [ ] US-10 and US-29 pass; clock counts down live

#### JIS-051 One-screen summary
`labels: epic:staff, F-11, F-12, owner:FE, block:B6, prio:must, mvp` · Est 3 h
Scores, trend, RCI, risk flags, recommendation + factors, physical context with source/date when consented.
- [ ] US-30 passes; fits a 1366×768 screen without scroll

#### JIS-052 Confirm / change step UI
`labels: epic:staff, F-11, owner:FE, block:B6, prio:must, mvp` · Est 1.5 h
- [ ] US-31 passes in ≤ 2 clicks

#### JIS-053 Provider accept / decline view
`labels: epic:staff, F-07, owner:FE, block:B6, prio:must, mvp` · Est 1.5 h
- [ ] US-19 passes

#### JIS-054 Crisis response form
`labels: epic:staff, F-03, F-11, owner:FE, block:B6, prio:must, mvp, safety` · Est 1.5 h
- [ ] US-11 passes

### E6 Programme

#### JIS-060 Metrics API-16
`labels: epic:programme, F-15, owner:BE, block:B5, prio:must, mvp` · Est 3 h
NSM and K1–K6 per METRICS.md, from the event log.
- [ ] US-35 passes; numbers reproducible by script

#### JIS-061 Fairness API-17
`labels: epic:programme, F-15, owner:BE, block:B6, prio:must, mvp` · Est 1.5 h
- [ ] Uses JIS-018; programme role only

#### JIS-062 Programme dashboard UI
`labels: epic:programme, F-15, owner:FE, block:B7, prio:must, mvp` · Est 4 h
Recharts funnel, waiting-time by level, RCI outcomes, drop-off reasons, crisis response, fairness table with "suppressed" cells and synthetic caveat.
- [ ] US-35, US-36 pass

#### JIS-063 Simulation engine + API-21
`labels: epic:programme, F-16, owner:AI, block:B6, prio:should, mvp` · Est 3 h
Seeded discrete simulation of baseline vs Jisr pathway; parameter sheet with each assumption labelled; sensitivity range.
- [ ] US-37 passes

#### JIS-064 Simulation panel UI
`labels: epic:programme, F-16, owner:FE, block:B7, prio:should, mvp` · Est 1.5 h
- [ ] Every chart labelled "simulated"

### E7 Integration & privacy

#### JIS-070 FHIR import API-19
`labels: epic:integration, F-02, owner:BE, block:B5, prio:should, mvp, safety` · Est 2.5 h
- [ ] US-04 passes (three scenarios)

#### JIS-071 FHIR export API-20
`labels: epic:integration, F-19, owner:BE, block:B7, prio:could` · Est 2 h
- [ ] US-40 passes

#### JIS-072 Sahatna launch stub
`labels: epic:integration, F-19, owner:FE, block:B8, prio:could` · Est 1 h
Route accepting `launch` + `iss` parameters (SMART-style), behind `FF_SAHATNA_LAUNCH`; opens the person's episode in demo.
- [ ] Documented as a stub on screen

#### JIS-073 Notifications + SMS mock inbox
`labels: epic:integration, F-21, F-14, owner:BE, block:B5, prio:should, mvp` · Est 2 h
Neutral templates; banned-word lint across AR/EN/UR.
- [ ] US-22 passes

#### JIS-074 Consent API-14 + enforcement
`labels: epic:integration, F-13, owner:BE, block:B4, prio:must, mvp, safety` · Est 2.5 h
Consent checked on every staff read and referral packet build; no caching.
- [ ] US-32 passes

#### JIS-075 AuditLog + API-23
`labels: epic:integration, F-13, owner:BE, block:B6, prio:should, mvp` · Est 1.5 h
- [ ] US-34 passes

### E8 Judge Mode & evals

#### JIS-080 Demo login API-22 + role switcher
`labels: epic:judge, F-17, owner:BE, block:B3, prio:must, mvp` · Est 1.5 h
Signed JWT; only when `DEMO_MODE=true`.
- [ ] US-38 passes

#### JIS-081 Guided tour
`labels: epic:judge, F-17, owner:FE, block:B8, prio:must, mvp` · Est 2 h
Five steps = brief §14 demo moments.
- [ ] A new user completes it in ≤ 3 minutes

#### JIS-082 Crisis benchmark dataset
`labels: epic:eval, F-18, owner:AI, block:B3, prio:must, mvp, safety` · Est 3 h
Adversarial utterances (direct, indirect, negated, quoted, misspelt, Arabizi, Roman Urdu, mixed script) plus clear negatives; target ≥ 150 cases (size from `misc/ideas.md`); labelled by the team, not clinicians (disclosed).
- [ ] Each case: id, text, language, expected, category

#### JIS-083 Step-matcher test cases
`labels: epic:eval, F-18, owner:AI, block:B5, prio:must, mvp` · Est 2 h
Target ≥ 60 cases (size from `misc/ideas.md`) covering every band, RED override, preference/network edge cases.
- [ ] 100% agreement required

#### JIS-084 Validator test suite
`labels: epic:eval, F-18, owner:AI, block:B5, prio:must, mvp, safety` · Est 1.5 h
Planted unsupported claims in AR/EN/UR must be rejected.
- [ ] 0 false accepts

#### JIS-085 Eval runner + EVAL.md
`labels: epic:eval, F-18, owner:AI, block:B6, prio:must, mvp` · Est 2 h
Recall, FPR with Wilson 95% CI, latency, validator results, failure log.
- [ ] `uv run python run_evals.py` writes EVAL.md

#### JIS-086 Eval gate in CI
`labels: epic:eval, F-18, owner:AI, block:B6, prio:must, mvp, safety` · Est 1 h
- [ ] US-39 passes (CI fails on recall < 100%)

### E9 Ship

#### JIS-090 Production demo deploy + seed reset
`labels: epic:ship, owner:BE, block:B8, prio:must, mvp` · Est 2 h
Script to reset demo data between judges; credentials for judges.
- [ ] Reset completes in < 1 minute

#### JIS-091 Playwright smoke test
`labels: epic:ship, F-17, owner:AI, block:B8, prio:must, mvp` · Est 2 h
Five north-star moments against the deployed URL.
- [ ] Runs green twice in a row

#### JIS-092 README + assumptions/dependencies/limitations
`labels: epic:ship, owner:PL, block:B8, prio:must, mvp` · Est 3 h
Required deliverable (brief §13); data-source and licence table; synthetic-data declaration.
- [ ] Every source declared

#### JIS-093 Demo video
`labels: epic:ship, owner:PL, block:B9, prio:must, mvp` · Est 2 h
- [ ] ≤ 3 minutes; uploaded; link in README

#### JIS-094 Rehearsal + fallback
`labels: epic:ship, owner:PL, block:B9, prio:must, mvp` · Est 1.5 h
- [ ] Two full runs; fallback = video + `LLM_PROVIDER=none`

#### JIS-095 Submission
`labels: epic:ship, owner:PL, block:B9, prio:must, mvp` · Est 1 h
Live link + credentials, docs, assumptions page, video submitted on hack2skill before the 20 Nov 2026 deadline.
- [ ] Confirmation screenshot saved

## 4. Cut list (drop in this order if behind)
| Order | Cut | Saves | Fallback |
|---|---|---|---|
| 1 | JIS-048 read-aloud (F-20) | 1.5 h | Mention as v1 |
| 2 | JIS-071 / JIS-072 FHIR export + Sahatna stub (F-19) | 3 h | Architecture slide only |
| 3 | JIS-035 M-02 classifier | 2 h | Deterministic gate only (stronger safety story anyway) |
| 4 | JIS-064 + JIS-063 simulation (F-16) | 4.5 h | Static simulated chart from a notebook, labelled |
| 5 | JIS-075 audit view | 1.5 h | Audit rows exist; no person view |
| 6 | JIS-045 / JIS-049 waiting-well (F-09) to 1 module | 3 h | One module + re-check form |
| 7 | JIS-070 FHIR import (F-02) | 2.5 h | Seed Mariam's scores directly |
| 8 | JIS-073 SMS mock | 2 h | In-app notifications only |
| — | **Never cut:** JIS-012, JIS-013, JIS-020, JIS-021, JIS-022, JIS-041, JIS-050, JIS-082, JIS-086 | | |

## 5. Creating the issues
With the GitHub CLI, after creating the labels:
```bash
gh issue create --title "JIS-012 Crisis Gate engine" \
  --label "epic:rules,F-03,owner:BE,block:B2,prio:must,mvp,safety" \
  --body-file issue-bodies/JIS-012.md
```
Copy each ticket block from §3 into its body file, or paste directly into the GitHub web form.

## Addendum tickets (2026-11-18, brief update)
| ID | Title | Acceptance | Est. | Owner | Block |
|---|---|---|---|---|---|
| JIS-096 | F-22 free-text box (S-04) wired to API-04 | Gate fires < 1 s on lexicon hit; no raw text stored without consent | S | FE | B3 |
| JIS-097 | API-24 RED acknowledge + API-25 contact attempts | SLA clock stops on ack; attempts appear as EpisodeEvents | S | BE | B4 |
| JIS-098 | API-26 preferences + API-27 notifications inbox | Preferences feed API-06; inbox shows discreet text | S | BE | B5 |
| JIS-099 | API-28 demo reset (DEMO_MODE only, judge token, 1/min) | 404 when DEMO_MODE=false | S | BE | B8 |
| JIS-100 | Fail-closed Crisis Gate test (error + timeout → RED) | Two tests green in CI | S | BE | B3 |
| JIS-101 | `packages/rules/sla.v1.json` loader with env overrides logged at startup | Values match brief §6 | S | BE | B4 |
