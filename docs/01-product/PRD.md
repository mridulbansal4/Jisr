# Product Requirements Document (PRD)
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Personas](PERSONAS.md) · [User stories](USER_STORIES.md) · [Features](FEATURES.md) · [Metrics](METRICS.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [API spec](../03-engineering/API_SPEC.md) · [Backlog](../08-project/BACKLOG.md)

IDs (F-xx, P-xx, E-xx, API-xx, M-xx, R-xx, levels L0–L4 and RED) come from [PROJECT_BRIEF.md](../00-overview/PROJECT_BRIEF.md). If this PRD and the brief disagree, the brief wins and this file is corrected.

---

## 1. Background and problem

**Challenge.** Future Health Digital Innovation Challenge 2026, statement **C10 "Earlier, Safer Mental Wellbeing Support"** (DoH Abu Dhabi; co-creators Microsoft, Inception, MBZUAI). The statement asks for validated self-assessment, stepped local navigation, human-led crisis escalation, privacy, coordinated physical and mental care, and outcome reporting that includes adverse events and fairness across nationality and language. Source: https://hack2skill.com/event/futurehealthchallenge/

**The gap, with data.**
| Fact | Source |
|---|---|
| The C10 statement itself names a "continuing conversion gap between a positive screen and timely specialist follow-up". | https://hack2skill.com/event/futurehealthchallenge/ |
| IFHAS (free adult screening for Thiqa holders aged 18–75 at 150+ facilities) added anxiety and mental-health screening in its 2025 expansion. | https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/ · https://wam.ae/en/article/b1ryawb-more-than-150-healthcare-facilities-across-abu |
| 16.3% of a stratified sample of 2,019 Abu Dhabi adults screened moderate-to-severe on PHQ-9. | https://www.populationmedicine.eu/Depression-and-Anxiety-among-Adults-in-Abu-Dhabi-A-population-based-study,229332,0,2.html |
| Abu Dhabi Quality of Life Survey 2023–24 (n = 65,203): stress is highest at ages 15–29 and worse among women and non-Emiratis. | https://researchportal.bath.ac.uk/en/publications/mental-health-disparities-across-demographic-and-social-groups-in/ |
| DoH Standard of Care for Depression & Anxiety (effective Sep 2025): PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care. | https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx |
| 1,930 family physicians trained in common mental-health conditions. | https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143 |
| Crisis lines: 999, 800-SAKINA (800 725462, Abu Dhabi), 800-HOPE (800 4673, national). | https://www.emirates247.com/uae-guide/uae-mental-health-helplines-2026-numbers-to-call-in-dubai-abu-dhabi-and-across-the-emirates/6178 |
| Named barriers: stigma, not knowing where to go, fragmented pathways, uneven capacity. Named digital harms: covert monitoring, weak crisis handling, unvalidated advice, sensitive-data disclosure. | C10 statement (above) |

**No public number exists** for the share of positive mental-health screens in Abu Dhabi that reach follow-up (searched 18 Nov 2026; `docs/research/research/A-organisers-judges.md` notes that growth figures were not found). The nearest local analogue is colorectal screening, where only 30.5% of FIT-positive people reached colonoscopy (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8343888/). We use that only as an illustration, never as a mental-health baseline.

**Why Jisr.** Competitors build the front of the funnel (a chatbot, a quiz). Every C10 KPI sits at the back: hand-off, follow-up within timeframe, waiting time, symptom change, crisis-response completion, adverse events, fairness. Jisr is a **measurement-based stepped-care ledger**: deterministic rules decide, a clinician confirms, AI only explains, and the crisis gate runs first.

## 2. Goals and non-goals

### Goals
| # | Goal | Measured by (see [METRICS.md](METRICS.md)) |
|---|---|---|
| G1 | Every positive screen becomes an owned episode with a step, an owner, a deadline and a closure | % positive screens with an open episode within 60 s = 100% |
| G2 | No crisis signal is missed by the system | Crisis Gate recall = 100% on the adversarial benchmark (F-18) |
| G3 | People reach the least intensive safe level of care faster | Successful hand-off rate; median days to first attended appointment (simulated in MVP) |
| G4 | Care is measured, not assumed | % episodes with a re-check; reliable improvement (RCI) |
| G5 | Equity is visible | Every KPI split by age, gender, nationality, language, geography with small-cell suppression (k < 10) |
| G6 | AI cannot cause clinical harm | 0 unsupported clinical claims shown to users (validator) |

### Non-goals (from the brief, "Won't")
AI therapy or chat counselling · diagnosis · passive or covert monitoring (social media, keystrokes) · employer or insurer access to individual data · autonomous step changes without a clinician · wearable inference (v2, opt-in only).

## 3. Success metrics (summary)
North star: **% of positive screens that reach the confirmed level of care and attend within the level's target time** ("completed hand-off within timeframe"). Full definitions, formulas, targets and the analytics event taxonomy are in [METRICS.md](METRICS.md).

| Metric | MVP (hackathon) target | v1 (production pilot) target |
|---|---|---|
| Crisis Gate recall on benchmark | 100% | 100% on benchmark + every missed case reviewed |
| Crisis Gate latency (server, p95) | < 1 s | < 500 ms |
| Unsupported claims in shown LLM output | 0 | 0 |
| RED episodes with documented clinician contact ≤ 15 min | 100% in demo | ≥ 95%, every breach reviewed |
| Hand-off rate and time-to-care | Shown as **simulated** vs baseline (F-16) | Measured; target set with ADPHC at pilot start (owner: Product lead, by pilot kick-off) |

## 4. Personas (summary)
| ID | Persona | Core need |
|---|---|---|
| P-01 | Mariam, 27, Emirati, Thiqa, Arabic-first | Know what her result means and get to a suitable clinician privately |
| P-02 | Imran, 34, Pakistani driver, Basic plan, Urdu, low literacy | Short, spoken, low-cost path that does not threaten his job |
| P-03 | Dr Salma, family physician | One-screen summary and a 1-click step confirmation within a 6-minute visit |
| P-04 | Khalid, care coordinator / on-call clinician | A queue that shows crises and overdue referrals first, with timers |
| P-05 | Programme lead, ADPHC | Conversion, time-to-care, outcome and fairness numbers |

Details: [PERSONAS.md](PERSONAS.md).

## 5. Scope

| Release | Scope |
|---|---|
| **MVP (hackathon, 18–20 Nov 2026)** | All F-xx marked MVP = Yes in the brief, on synthetic data, Judge Mode login, Gemini API (synthetic data only) with template fallback, Vercel + Render hosting, in-app + SMS mock notifications, F-19 as a stub, F-20 if time |
| **v1 (production pilot)** | In-country hosting (Azure UAE North or Core42), in-country LLM endpoint or `LLM_PROVIDER=none`, UAE PASS for citizens and facility SSO for staff, real provider directory from the DoH facility registry, IFHAS feed via Malaffi / IFHAS portal under DoH approval, Malaffi HL7 v2 REF referrals (Circular 144/2026), Sahatna module (Circular 170/2026), licensed SMS/WhatsApp provider, native-reviewed Arabic and Urdu, warm-transfer protocol with crisis-line operators |
| **v2** | Perinatal depression pathway, opt-in wearable signals (sleep) as re-check prompts only, more languages (Hindi, Malayalam, Tagalog were considered in `docs/research/ideas.md`), capacity forecasting for planners |

## 6. Functional requirements

Priority = MoSCoW from the brief. Stories: [USER_STORIES.md](USER_STORIES.md). "AC" = acceptance criteria (testable).

### F-01 Screening flow (Must · MVP)
- **Description:** PHQ-2 and GAD-2 first; if PHQ-2 ≥ 3 or GAD-2 ≥ 3, expand to the full PHQ-9 and GAD-7. Arabic (RTL), English, Urdu (RTL). Item 9 of the PHQ-9 is always asked when the PHQ-9 is administered. API-01, API-02, API-03.
- **Stories:** US-01, US-02, US-03, US-05.
- **AC:**
  1. Scores match the published scoring of PHQ-9 (0–27) and GAD-7 (0–21) on 100% of unit-test cases.
  2. Language switch keeps answers and flips layout direction for AR/UR.
  3. Each question fits one mobile screen at 360 px width without horizontal scroll.
  4. Completing the screen (API-03) runs scoring, then the Crisis Gate (F-03), then opens an episode (E-06) if positive — in that order, in one transaction.
  5. Positive = PHQ-9 ≥ 10 or GAD-7 ≥ 10, or any RED trigger. Scores 5–9 open an L1 offer; < 5 shows L0 content (rule file `packages/rules`).
- **Priority:** Must.

### F-02 IFHAS import (Should · MVP as seeded import)
- **Description:** Import a FHIR R4 `QuestionnaireResponse` bundle (LOINC 44249-1 PHQ-9, 69737-5 GAD-7) through API-19. Imported item 9 goes through the Crisis Gate exactly like in-app answers.
- **Stories:** US-04.
- **AC:** the seeded bundle for P-01 creates a ScreeningSession (E-03) + InstrumentScores (E-04) + Episode (E-06) identical to in-app entry; malformed bundles return 422 with the failing path; import is idempotent on `QuestionnaireResponse.id`.
- **Priority:** Should.

### F-03 Crisis Gate (Must · MVP)
- **Description:** Deterministic, runs before any LLM call. Triggers: PHQ-9 item 9 > 0; C-SSRS screener items (subject to licence check, R-05); phrase lexicon in Arabic, English, Arabizi and Urdu on any free text (API-04). On trigger: show 999, 800-SAKINA, 800-HOPE with `tel:` links; create a CrisisEvent (E-05); set the episode to `RED_CRISIS`; assign to the on-call queue (P-04) with a 15-minute SLA; lock the LLM out of that session. M-02 may only add a RED flag, never remove one.
- **Stories:** US-06 – US-11.
- **AC:**
  1. Recall = 100% on the adversarial crisis benchmark in `ai/evals` (F-18); false-positive rate reported, not hidden.
  2. Server latency p95 < 1 s for API-04 with M-02 off; M-02 is disabled automatically if its latency > 2 s.
  3. If the gate errors or times out, it **fails closed** (treated as RED).
  4. No request containing a RED-session's free text reaches the LLM provider (verified by a test spying on `LLMProvider`).
  5. An "I need help now" button is visible on every person-facing screen and opens the crisis screen in one tap, offline included (numbers cached by the PWA).
- **Priority:** Must.

### F-04 Result explanation (Must · MVP)
- **Description:** "What this means / what it doesn't" in AR/EN/UR. Templates are the default; M-01 narrates from structured facts only (scores, bands, step) into a JSON schema; a claim validator rejects any sentence that adds a clinical claim not in the facts; on reject or timeout, M-03 templates are used. Each output is stored as E-18 ExplanationRecord. API-18.
- **Stories:** US-12, US-13.
- **AC:** never says "diagnosis", never predicts outcomes, always includes "this is a screen, not a diagnosis"; validator test suite passes; template fallback renders within 300 ms of the LLM timeout or reject; UI labels content as observed / calculated / AI-drafted.
- **Priority:** Must.

### F-05 Step Matcher (Must · MVP)
- **Description:** Deterministic rules map severity + preferences + insurance + capacity to L0–L4 (or RED). Factors shown: severity band, preference (modality), language, clinician gender, insurance network, capacity / wait. Output stored as E-08 StepRecommendation with the RuleSetVersion (E-17). API-06.
- **Stories:** US-14 – US-17.
- **AC:** 100% agreement with the step-matcher test cases (F-18); every recommendation lists each factor and its effect in plain language; a clinician must confirm before referral of L2–L4 (API-12). Severity uses the higher band of PHQ-9 and GAD-7 (see open question OQ-02).
- **Priority:** Must.

### F-06 Provider directory (Must · MVP, synthetic)
- **Description:** Synthetic providers (E-09) tagged by insurance network (Thiqa / Basic / Enhanced), languages, clinician gender, modality (in-person / tele), level (L1–L4), capacity and current wait. API-15.
- **AC:** ≥ 40 synthetic providers covering all levels, the three plan types, AR/EN/UR, both genders, Abu Dhabi / Al Ain / Al Dhafra regions; every record is flagged `synthetic: true`.
- **Priority:** Must.

### F-07 Warm hand-off (Must · MVP)
- **Description:** Referral packet (E-10, modelled on FHIR `ServiceRequest` + `Task`), booking request, provider acceptance or decline (API-08), appointment (API-09), SLA timer, escalation to P-04 on overdue or decline, automatic re-match to the next suitable provider on decline. API-07 – API-09.
- **Stories:** US-18 – US-22.
- **AC:** person completes the hand-off in ≤ 3 taps from the recommendation screen; the packet contains only consented fields (F-13); overdue acceptance creates an `ESCALATED` event and appears at the top of P-04's queue.
- **Priority:** Must.

### F-08 Episode Ledger (Must · MVP)
- **Description:** State machine (brief §7) with append-only EpisodeEvents (E-07) and SLA timers (APScheduler). Closure (API-13) requires an attended appointment + a re-check, or an authorised clinician decision with a reason.
- **Stories:** US-23, US-24.
- **AC:** illegal transitions return 409; events cannot be updated or deleted (DB-level revoke + test); every event records actor, time, previous state, new state, RuleSetVersion.
- **Priority:** Must.

### F-09 Waiting-well bridge (Should · MVP with 3 modules)
- **Description:** Low-intensity self-help while waiting (3 modules for MVP: sleep routine, worry time, behavioural activation basics — content written from NICE CG123 low-intensity principles, https://www.nice.org.uk/guidance/cg123; native clinical review pending, R-04) and a scheduled re-check (default 14 days).
- **Stories:** US-25, US-26.
- **AC:** modules available in AR/EN/UR; re-check reminder uses discreet text (F-14); completion events logged.
- **Priority:** Should.

### F-10 Measurement-based care (Must · MVP)
- **Description:** Re-check (API-10) computes the Jacobson–Truax reliable change index (https://doi.org/10.1037/0022-006X.59.1.12). Reliable deterioration or no reliable improvement after the review window → step-up **suggestion**; reliable improvement + below caseness → step-down suggestion. A clinician confirms (API-12).
- **Stories:** US-27, US-28.
- **AC:** RCI computed from configured reliability and SD values in the rule file (values cited there); suggestions never change the step without API-12; reliable deterioration with item 9 > 0 goes to RED (F-03).
- **Priority:** Must.

### F-11 Clinician console (Must · MVP)
- **Description:** Queue (API-11) sorted RED → overdue → awaiting confirmation → others; RED episodes with live SLA clock; confirm or change step with a reason (API-12); one-screen summary.
- **Stories:** US-29 – US-31, US-10, US-11.
- **AC:** the P-03 confirm flow takes ≤ 2 clicks from opening the summary; changing a step requires a reason code; RED SLA clock is visible and counts down.
- **Priority:** Must.

### F-12 Coordinated care summary (Should · MVP)
- **Description:** With consent, one screen combining the mental-health episode with IFHAS physical context (E-16: HbA1c, BMI, self-reported sleep).
- **Stories:** US-30.
- **AC:** physical context is hidden immediately when the person revokes that consent (F-13); every field shows its source and date.
- **Priority:** Should.

### F-13 Consent centre (Must · MVP)
- **Description:** Granular, revocable consents (E-02) modelled on FHIR `Consent`: share with the receiving provider; share physical context with the family physician; SMS reminders; de-identified programme analytics; LLM explanation on synthetic/real data. API-14. Effects visible immediately.
- **Stories:** US-32.
- **AC:** revoking any consent changes what staff screens show on the next request (no cache); every consent change is audited (E-14); there is **no** employer or insurer consent option because those roles do not exist.
- **Priority:** Must.

### F-14 Discreet mode (Should · MVP)
- **Description:** Neutral notification text ("You have a new message from your health app"), quick-exit button (replaces page with a neutral page and clears history state), no app-icon badges.
- **Stories:** US-33.
- **AC:** no notification body contains "mental", "depression", "anxiety", "crisis" or their AR/UR equivalents (lint test on templates); quick exit works in ≤ 1 tap.
- **Priority:** Should.

### F-15 Programme dashboard (Must · MVP)
- **Description:** Conversion funnel, time-to-care, follow-up, RCI improvement, crisis response, drop-off reasons, fairness by age / gender / nationality / language / geography with small-cell suppression (k < 10). API-16, API-17.
- **Stories:** US-35, US-36.
- **AC:** any cell with n < 10 shows "suppressed" and cannot be derived from row/column totals (complementary suppression); only aggregate data reaches this role.
- **Priority:** Must.

### F-16 Simulation engine (Should · MVP)
- **Description:** Baseline vs Jisr conversion on the synthetic cohort (API-21). All parameters are explicit and labelled as assumptions; outputs are labelled "simulated".
- **Stories:** US-37.
- **AC:** same seed gives the same result; parameter sheet shows each assumption and its source or "assumption"; sensitivity range shown.
- **Priority:** Should.

### F-17 Judge Mode (Must · MVP)
- **Description:** Role switcher (person / family physician / coordinator / programme), seeded personas P-01 – P-05, guided 3-minute tour matching the demo north star. API-22.
- **Stories:** US-38.
- **AC:** a judge reaches each of the five demo moments in brief §14 within 3 minutes without help.
- **Priority:** Must.

### F-18 Eval harness (Must · MVP)
- **Description:** Crisis benchmark, step-matcher cases, LLM validator tests; results published in `EVAL.md` and run in CI.
- **Stories:** US-39.
- **AC:** CI fails if crisis recall < 100% or if any validated LLM output contains an unsupported claim.
- **Priority:** Must.

### F-19 Sahatna launch adapter and FHIR export (Could · stub)
- **Description:** Deep link + SMART-style launch stub; episode export as a FHIR bundle (API-20).
- **Stories:** US-40.
- **AC:** export validates against FHIR R4 resource shapes (structure check); launch stub accepts a `launch` parameter and opens the person's episode.
- **Priority:** Could.

### F-20 Read-aloud (Could · if time)
- **Description:** Browser TTS (Web Speech API) for questions and explanations.
- **Stories:** US-03.
- **AC:** play button on each question; falls back silently when the browser has no voice for the language.
- **Priority:** Could.

### F-21 Notification channel abstraction (Should · in-app + SMS mock)
- **Description:** E-12 Notification with channels in-app, SMS (mock), WhatsApp (mock). Discreet templates (F-14).
- **Stories:** US-22.
- **AC:** each send is logged; the mock SMS inbox is visible in Judge Mode; SMS requires the reminder consent.
- **Priority:** Should.

## 7. Non-functional requirements

| Area | MVP (hackathon) | v1 (production) |
|---|---|---|
| Performance | Crisis Gate p95 < 1 s (server); API p95 < 800 ms excluding LLM; LLM explanation timeout `LLM_TIMEOUT_SECONDS` (default 6 s) then template | Crisis Gate p95 < 500 ms; API p95 < 400 ms |
| Availability | Live during judging (20–30 Nov 2026); backup video; seeded reset script | 99.9% monthly; RED queue alerting has its own on-call path |
| Offline | PWA caches crisis screen, emergency numbers and the "I need help now" button; screening needs connectivity | Offline answer queueing with sync |
| Languages | Arabic (RTL), English, Urdu (RTL); machine-assisted, **not native-reviewed** (R-04, disclosed) | Native clinical review of every string; validated Arabic instrument wording (Arabic PHQ-9/GAD-7 validation: https://read.qxmd.com/read/27031595/); Urdu wording validated |
| Accessibility | WCAG 2.2 AA targets; 16 px min text; read-aloud if time (F-20); icons + text | Audited WCAG 2.2 AA; voice-first option |
| Security | Signed JWT demo login; TLS; no secrets in repo; RBAC per role | UAE PASS + facility SSO; ADHICS controls; encryption at rest with managed keys; pen test |
| Privacy | Synthetic data only; no real personal data anywhere | Federal Law 2/2019 (health data stays in the UAE, Art. 13: https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1); DoH Circular 147/2022 (no third-party sharing without approval, per `docs/research/biblehackathon.md`, unverified text); UAE PDPL (Federal Decree-Law 45/2021) largely defers to sector law for health data (https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/united-arab-emirates, status of executive regulations unverified) |
| Responsible AI | Deterministic engines decide; LLM explains only; validator; raise-only M-02; EVAL.md | Alignment with DoH Responsible AI Standard (DoH/ST/DDGO/RAI/V1/2025; clauses unverified — fetch failed: https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx) and DoH AI Clinician Framework (https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide); DECIDE-AI reporting (https://www.nature.com/articles/s41591-022-01772-9) |
| Auditability | Append-only EpisodeEvent and AuditLog; person sees own access log (API-23) | Same + retention per DoH policy (owner: Compliance lead, confirm by pilot contract) |

## 8. Assumptions
| # | Assumption | Risk if wrong | Owner |
|---|---|---|---|
| A-01 | Synthetic data is acceptable for evaluation (confirmed in organiser sessions per `docs/research/research/01-facts.md`) | — | Product lead |
| A-02 | PHQ-9 and GAD-7 are free to use and translate (Pfizer; `docs/research/research/B-context-and-data.md`, [K] knowledge-level) | Licence issue (R-05) | AI/Eval engineer |
| A-03 | C-SSRS screener use in a prototype is permitted under Columbia's terms (https://cssrs.columbia.edu) — **unverified** | Remove C-SSRS items; keep item 9 + lexicon | AI/Eval engineer, check by 2026-11-19 H6 |
| A-04 | Stepped-care thresholds follow standard PHQ-9/GAD-7 bands and NICE CG123; DoH standard [5] is compatible | Re-map rule file | Product lead |
| A-05 | SLA defaults from `.env.example` (`SLA_RED_MINUTES=15`, `SLA_REFERRAL_ACCEPT_HOURS=48`, `SLA_FIRST_APPOINTMENT_DAYS=14`, `RECHECK_DAYS=14`; a per-level override of 28 days for L4 is proposed) are **proposals**, not DoH-mandated | Change config only | Product lead, verify against DoH standard by 2026-11-19 |
| A-06 | Thiqa covers nationals across public and private networks; expats are on Basic / Enhanced employer plans (https://u.ae/en/information-and-services/health-and-fitness/healthcare-access-and-insurance/getting-a-health-insurance) | Directory tags wrong | Backend engineer |
| A-07 | Gemini API is used with synthetic data only, since processing location is not guaranteed in the UAE (R-03) | Residency breach | Tech lead |

## 9. Dependencies
| Dependency | MVP | v1 |
|---|---|---|
| Gemini API (`google-genai`) | Required for M-01/M-02; template fallback if down | Replaced by in-country endpoint (Azure OpenAI UAE North or self-hosted Jais) |
| Vercel, Render, managed Postgres | Hosting | Replaced by Azure UAE North / Core42 |
| Sahatna | Stub only | DoH integration approval (Circular 170/2026) |
| Malaffi | FHIR export only | HL7 v2 REF adapter (Circular 144/2026) |
| IFHAS data | Seeded bundle | DoH/ADPHC data-sharing approval |
| UAE PASS | — | Onboarding as a relying party |
| Crisis-line operators | Display + `tel:` | Warm-transfer agreement |

## 10. Open questions
| # | Question | Owner | Due |
|---|---|---|---|
| OQ-01 | Is PHQ-9 item 9 > 0 → RED (emergency screen + 15-min SLA) clinically proportionate, or should item 9 = 1 route to a same-day risk review? Brief says RED; keep for MVP, disclose as a conservative choice | Product lead (with any clinician advisor available) | 2026-11-19 |
| OQ-02 | When PHQ-9 and GAD-7 bands disagree, use the higher band? (GAD-7 has no "moderately severe" band: severe is 15–21) | Backend engineer | 2026-11-18 H4 |
| OQ-03 | Mariam's demo (PHQ-9 11, GAD-7 13 = moderate) shows a tele-session: is that an L2 family-physician teleconsult or an L3 psychologist? | Product lead | 2026-11-18 H4 |
| OQ-04 | C-SSRS terms for digital use (A-03) | AI/Eval engineer | 2026-11-19 H6 |
| OQ-05 | Which DoH-published wait-time targets, if any, apply to mental-health referrals? | Product lead | Before pilot proposal, 2026-12-05 |

## 11. Release criteria (MVP submission, 20 Nov 2026)
- [ ] All Must features (F-01, F-03 – F-08, F-10, F-11, F-13, F-15, F-17, F-18) pass their AC on the deployed build.
- [ ] `EVAL.md` shows crisis recall 100% on the benchmark and 0 unsupported claims; CI green.
- [ ] The five demo moments (brief §14) run end-to-end on the live link with Judge Mode credentials.
- [ ] Every screen shows "synthetic data — not a medical device — not for clinical use".
- [ ] Assumptions, dependencies and limitations page published (deliverable).
- [ ] Demo video recorded as a backup.
- [ ] No real personal data in repo, logs or LLM calls (grep + log review).

## Addendum (2026-11-18, brief v0.1 update)
### F-22 — Optional free-text box ("Anything else you'd like to tell us?") · Must · MVP
- **Description:** an optional free-text box after the screen. The Crisis Gate (F-03) runs on it first. Only the gate result and the matched category are stored; raw text is stored only with the `store free text` consent scope.
- **Stories:** US-45 (below).
- **Acceptance criteria:**
  - *Given* a person types an indirect crisis phrase in any MVP language, *when* they submit, *then* the crisis screen appears in < 1 s and a RED episode is created.
  - *Given* the gate errors or times out, *then* the input is treated as RED (fail-closed).
  - *Given* the `store free text` consent is off, *then* the database holds no raw text.

**US-45:** As Mariam, I want to add something in my own words, so that the service understands what the questionnaire missed. Priority Must · Estimate S · F-22.

### New endpoints (see API_SPEC)
API-24 RED acknowledge · API-25 contact attempts · API-26 preferences · API-27 notifications · API-28 demo reset (DEMO_MODE only) · API-29 first-party analytics.

### Rule clarifications now in the brief
Episode opening (PHQ-9 ≥ 10 / GAD-7 ≥ 10 / item 9 > 0 / self-referral); prescreen-negative path; separate PHQ-9 and GAD-7 bands; RCI thresholds (PHQ-9 ≥ 6, GAD-7 ≥ 4); step-up after ≥ 2 re-checks; SLAs incl. step confirmation 48 h; fail-closed gate; coordinator vs clinician permissions; provider-staff role. These resolve OQ-02, OQ-03 and parts of OQ-01.
