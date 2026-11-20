# Jisr — Project Brief (Single Source of Truth)
> Project: Jisr (جسر, "bridge") · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [PRD](../01-product/PRD.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [Hackathon plan](HACKATHON_PLAN.md) · [Source idea](../research/ideas.md)

**Every other document must stay consistent with this file.** If something here is wrong, change it here first.

## 1. Identity
| Item | Decision |
|---|---|
| Name | **Jisr** (Arabic جسر, "bridge") |
| One-liner | Jisr turns every positive mental-health screen into a completed, measured hand-off to the right level of care, with a deterministic crisis gate that no AI can override. |
| Challenge | Future Health Digital Innovation Challenge 2026 — **C10 Earlier, Safer Mental Wellbeing Support** (DoH Abu Dhabi; co-creators Microsoft, Inception42, MBZUAI) |
| Idea type | Doesn't exist in the public field: 0–1 public C10 repos at 18 Nov 2026 (one possible, unbranded: Flan-Backend; `docs/research/research/E-competition.md`) |
| Statement text | Verbatim C10 text: `../research/research/00-source/statement-C10.md` |
| Submission | 20 Nov 2026. Exact cut-off hour/time zone not published on the page → **internal deadline 20 Nov 10:00 GST** |
| Currency | AED (USD in parentheses where useful) |
| Region | Abu Dhabi, UAE |

## 2. Problem (with data)
- Abu Dhabi is expanding early identification: IFHAS added anxiety and mental-health screening [1]. But the challenge statement itself names a **"continuing conversion gap between a positive screen and timely specialist follow-up"** [2].
- 16.3% of a stratified Abu Dhabi adult sample screened moderate-to-severe on PHQ-9 [3]. Stress is highest at ages 15–29 and worse among women and non-Emiratis [4].
- Barriers named in the statement: stigma, uncertainty about where to go, fragmented pathways, uneven capacity. Digital harms named: covert monitoring, weak crisis handling, unvalidated advice, disclosure of sensitive data [2].
- Rails exist:
  - DoH Standard of Care for Depression & Anxiety, effective Sep 2025: PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care [5].
  - 1,930 family physicians trained in common mental health conditions [6].
  - Crisis lines: 800-HOPE (national) and 800-SAKINA (Abu Dhabi) [7].

## 3. Target users (personas)
| ID | Persona | One line |
|---|---|---|
| P-01 | **Mariam**, 27, Emirati, Thiqa, government employee, Arabic-first | Screened positive (GAD-7 13, PHQ-9 11) at IFHAS; doesn't know where to go; fears her employer finding out |
| P-02 | **Imran**, 34, Pakistani driver, employer Basic plan, Urdu, low literacy, Android | Stressed and sleeping badly; can't read long forms; worries about cost and his job |
| P-03 | **Dr Salma**, family physician at a PHC centre | Receives hand-offs; must confirm step changes; has 6 minutes per patient |
| P-04 | **Khalid**, care coordinator / on-call clinician | Owns the crisis queue and overdue referrals |
| P-05 | **Programme lead**, ADPHC mental-health screening | Needs conversion, time-to-care and fairness numbers for the programme |

## 4. The secret
Every competitor builds the **front** of the funnel (a chatbot, a quiz). All the statement's KPIs sit at the **back**: successful hand-off, follow-up within timeframe, waiting time, symptom change, crisis-response completion, adverse events and fairness [2]. Jisr is a **measurement-based stepped-care ledger**:
- every positive screen (and every self-referral) becomes an **episode** with a step, an owner, a deadline and a closure;
- **deterministic rules decide**, a **clinician confirms**, and **AI only explains**;
- the **crisis gate runs first**, and an LLM can only *raise* risk, never lower it.

## 5. Feature list (MoSCoW · MVP = hackathon build)
| ID | Feature | MoSCoW | MVP? |
|---|---|---|---|
| F-01 | Screening flow: PHQ-2/GAD-2 → PHQ-9/GAD-7. **MVP languages: Arabic, English, Urdu** (v1 adds Hindi, Malayalam, Tagalog) | Must | Yes |
| F-02 | Import of IFHAS screening results (FHIR `QuestionnaireResponse` bundle) | Should | Yes (seeded import) |
| F-03 | **Crisis Gate**: deterministic. Triggers: PHQ-9 item 9 > 0, and an AR/EN/Arabizi/UR phrase lexicon on any free text. C-SSRS screener items sit behind a feature flag until licence terms are confirmed (R-05). Runs before any LLM. On fire: emergency guidance shown at once + RED episode; **on-call clinician must acknowledge within 15 minutes** (`SLA_RED_MINUTES=15`). A RED for item 9 = 1 ("several days") means a same-day human safety check, not an automatic emergency call (clinical advisors to confirm: OQ-01) | Must | Yes |
| F-04 | Result explanation: "what this means / what it doesn't". Templates + LLM narration behind a claim validator | Must | Yes |
| F-05 | **Step Matcher**: stepped-care levels 0–4 with transparent factors (severity, preference, language, clinician gender, modality, insurance network, capacity) | Must | Yes |
| F-06 | Provider directory: synthetic, tagged by network / language / gender / modality / capacity / wait | Must | Yes |
| F-07 | **Warm hand-off**: referral packet, booking request, provider acceptance, SLA timer, escalation on overdue or decline | Must | Yes |
| F-08 | **Episode Ledger**: state machine + append-only event log + SLA timers | Must | Yes |
| F-09 | Waiting-well bridge: low-intensity self-help modules + scheduled re-check | Should | Yes (3 modules) |
| F-10 | Measurement-based care: reliable change index (RCI) drives step-up/step-down *suggestions*; a clinician confirms | Must | Yes |
| F-11 | Clinician console: queue, red episodes, confirm step, one-screen summary | Must | Yes |
| F-12 | Coordinated care summary: IFHAS physical findings (e.g. HbA1c, BMI, blood pressure) + mental-health episode, with consent. Wearable sleep data is v2, opt-in only | Should | Yes |
| F-13 | Consent centre: granular, revocable, effect visible immediately | Must | Yes |
| F-14 | Discreet mode: neutral notification text, quick-exit button, no app icon badges | Should | Yes |
| F-15 | Programme dashboard: conversion funnel, time-to-care, follow-up, RCI improvement, crisis response, drop-off reasons, fairness with small-cell suppression (k < 10) | Must | Yes |
| F-16 | Simulation engine: baseline vs Jisr conversion on the synthetic cohort | Should | Yes |
| F-17 | **Judge Mode**: role switcher, seeded personas, guided 3-minute tour | Must | Yes |
| F-18 | Eval harness, published in `EVAL.md`: **150-utterance crisis benchmark** (AR/EN/Arabizi/UR, incl. indirect phrasing and false-positive traps), **60 step-matcher cases** (incl. missing/contradictory inputs), **200 LLM explanation cases** for the validator. Targets: crisis recall 100%, step agreement ≥ 95%, unsupported claims 0% | Must | Yes |
| F-19 | Sahatna launch adapter (deep link + SMART-style launch stub) and FHIR export | Could | Stub |
| F-20 | Read-aloud (browser TTS) for low literacy | Could | If time |
| F-21 | Notification channel abstraction (in-app, SMS mock, WhatsApp mock) | Should | In-app + SMS mock |
| F-22 | "Anything else you'd like to tell us?" optional free-text box after the screen. Crisis-gated before anything else; only the gate result + matched category are stored, never the raw text, unless the person consents | Must | Yes |

**Cross-cutting safety rules (apply to every feature):**
- **Fail-closed:** if the Crisis Gate errors or times out, the system treats the input as RED: it shows emergency guidance and opens a RED episode for human review.
- **Roles:** person · clinician · coordinator · programme · judge · **provider staff** (receiving clinician, linked by `staff_users.provider_id`; accepts/declines referrals via API-08, or a coordinator decides on the provider's behalf). A coordinator (Khalid, P-04) can acknowledge a RED episode and log contact attempts; only a clinician can confirm a step or close a RED episode.
- **Consent scopes (F-13):** share-with-receiving-provider · share-physical-context · AI-drafted summaries (sends de-identified structured facts to the LLM; off ⇒ template-only) · store free text · SMS/WhatsApp channel. Every scope is revocable, with immediate visible effect.
- **Insurer wording:** insurers receive only what a normal claim for a booked appointment requires; never screening answers, scores or notes. Don't write "never shared with your insurer".
- **Small-cell suppression:** cells with n < 10 show "<10"; complementary suppression hides at least one more cell in the row/column so a suppressed value can't be recomputed from totals.
- **Pitch wording:** never say "3 screens"; the product has ~28 screens across four role views.
- **Eval artefacts:** `docs/04-ai/AI_EVALS.md` describes method; `EVAL.md` at the repo root is generated by `ai/evals/run_evals.py` and holds the latest numbers.

**Won't (non-goals):** AI therapy or chat counselling; diagnosis; passive or covert monitoring (social media, keystrokes); employer or insurer access to individual data; autonomous step changes without a clinician; wearable inference (v2, opt-in only).

## 6. Stepped-care levels (used everywhere)
| Level | Name | PHQ-9 (0–27) | GAD-7 (0–21) | Also |
|---|---|---|---|---|
|---|---|---|---|---|
| L0 | Self-guided wellbeing | 0–4 | 0–4 | Self-referral only |
| L1 | Guided self-help + community support | 5–9 | 5–9 | Self-referral or person's choice |
| L2 | Family physician (primary care) | 10–14 | 10–14 | Or mild with functional impairment / physical comorbidity |
| L3 | Tele-mental-health / psychologist | 15–19 | ≥ 15 | Or L2 with no reliable improvement at re-check |
| L4 | Specialist psychiatry | ≥ 20 | ≥ 15 **and** a complexity flag (functional impairment "extremely difficult", prior specialist care, or clinician judgement) | Or L3 not improving |
| RED | Crisis pathway | item 9 > 0 | — | Or a crisis-lexicon hit on free text; overrides everything |

**Prescreen:** PHQ-2 < 3 and GAD-2 < 3 → no full instruments, no episode (explanation + optional reminder), unless the person asks for support or answers the free-text box with a crisis-lexicon hit.

**Reliable change (RCI):** reliable improvement/deterioration = change ≥ 6 points on PHQ-9 or ≥ 4 on GAD-7 (NHS Talking Therapies convention; to be re-verified, OQ-04).

**Step-up timing:** a "not improving" step-up (L2→L3, L3→L4) is suggested only after ≥ 2 re-checks (≈ 4 weeks) at the current level without reliable improvement, unless there is reliable deterioration or a RED trigger (then immediately). Perinatal, psychosis and substance-use flags never auto-escalate; they show as clinician-review factors. Mild-with-impairment → L2 applies to self-referrals.

**SLAs (proposals):** defaults live in `packages/rules/sla.v1.json`; `.env` values override them and are logged at startup. step confirmation by clinician 48 h · RED acknowledgement 15 min · provider accept/decline 48 h · first appointment ≤ 14 days from positive screen · re-check every 14 days while monitoring.

**When does an episode open?** An episode opens (the "positive screen") when **PHQ-9 ≥ 10 or GAD-7 ≥ 10**, or **PHQ-9 item 9 > 0**, or the person asks for support at any score (self-referral; typically L0/L1). Below threshold with no request, the person gets an explanation and an optional re-check reminder; no episode opens.

**Higher of the two instruments wins.** The step uses the more severe of PHQ-9 and GAD-7. Modality (in-person / tele) is a preference *within* a level: e.g. Mariam (PHQ-9 11, GAD-7 13 → moderate → **L2**) gets a family physician trained in mental health, by tele-consult.

Thresholds use the standard PHQ-9/GAD-7 severity bands [8][9]. The rule file is versioned and cites the DoH standard [5] and NICE CG123 [10]. A clinician confirms every step.

## 7. Core entities
E-01 Person · E-02 ConsentRecord · E-03 ScreeningSession · E-04 InstrumentScore · E-05 CrisisEvent · E-06 Episode · E-07 EpisodeEvent (append-only) · E-08 StepRecommendation · E-09 Provider · E-10 Referral (`ServiceRequest` + `Task`, with SLA) · E-11 Appointment · E-12 Notification · E-13 StaffUser (clinician/coordinator/programme) · E-14 AuditLog · E-15 SelfHelpAssignment · E-16 PhysicalContext · E-17 RuleSetVersion · E-18 ExplanationRecord (LLM output + validator result) · E-19 AnalyticsEvent · E-20 IdempotencyKey · E-21 SchedulerState

**Episode states (E-06):**
`SCREENED_POSITIVE → EXPLAINED → STEP_RECOMMENDED → STEP_CONFIRMED → REFERRED → ACCEPTED → BOOKED → ATTENDED → MONITORING → (STEP_CHANGED ↺) → CLOSED`
- Side states: `RED_CRISIS`, `ESCALATED`, `DECLINED_BY_PROVIDER`, `DECLINED_BY_PERSON`, `LOST_TO_FOLLOW_UP`.
- Closure requires either documented evidence (an attended appointment + a re-check) or an authorised clinician decision with a reason.

## 8. API surface (names; detail in API_SPEC)
| ID | Method + path | Purpose |
|---|---|---|
| API-01 | `POST /v1/screenings` | Start a screening session |
| API-02 | `POST /v1/screenings/{id}/answers` | Submit answers |
| API-03 | `POST /v1/screenings/{id}/complete` | Score + Crisis Gate + open episode |
| API-04 | `POST /v1/crisis/check` | Run the Crisis Gate on free text |
| API-05 | `GET /v1/episodes/{id}` | Episode with timeline |
| API-06 | `GET /v1/episodes/{id}/recommendation` | Step recommendation with factors |
| API-07 | `POST /v1/episodes/{id}/referrals` | Create referral (warm hand-off) |
| API-08 | `POST /v1/referrals/{id}/decision` | Provider accepts / declines |
| API-09 | `POST /v1/referrals/{id}/appointment` | Book / record appointment |
| API-10 | `POST /v1/episodes/{id}/recheck` | Re-check scores → RCI |
| API-11 | `GET /v1/staff/queue` | Clinician / coordinator queue |
| API-12 | `POST /v1/episodes/{id}/confirm-step` | Clinician confirms or changes step |
| API-13 | `POST /v1/episodes/{id}/close` | Close with evidence |
| API-14 | `GET/PUT /v1/consents` | Read / update consents |
| API-15 | `GET /v1/providers` | Search directory |
| API-16 | `GET /v1/programme/metrics` | Funnel and KPIs |
| API-17 | `GET /v1/programme/fairness` | Subgroup metrics (suppressed) |
| API-18 | `POST /v1/explain` | Validated plain-language explanation |
| API-19 | `POST /v1/fhir/import` | Import FHIR bundle (IFHAS result) |
| API-20 | `GET /v1/fhir/export/{episodeId}` | Export episode as FHIR bundle |
| API-21 | `POST /v1/sim/run` | Run baseline-vs-Jisr simulation |
| API-22 | `POST /v1/auth/demo-login` | Judge Mode login as a persona/role |
| API-23 | `GET /v1/audit/me` | Person's own access log |
| API-24 | `POST /v1/episodes/{id}/red/ack` | Coordinator/clinician acknowledges a RED episode (stops the SLA clock) |
| API-25 | `POST /v1/episodes/{id}/contact-attempts` | Log a contact attempt (channel, outcome) |
| API-26 | `GET/PUT /v1/me/preferences` | Language, clinician gender, modality, area, insurance plan (feeds API-06) |
| API-27 | `GET /v1/me/notifications` | Person's in-app inbox (discreet text) |
| API-28 | `POST /v1/demo/reset` | Judge Mode: reset seeded data (only when `DEMO_MODE=true`) |
| API-29 | `POST /v1/events` | First-party analytics events (no PII, no scores) |

## 9. AI models
| ID | Task | Model | Notes |
|---|---|---|---|
| M-01 | Plain-language explanation and message drafting (AR / EN / UR) from structured facts | **Google Gemini Flash via the Gemini API** (`google-genai` Python SDK 3.5.0). Model id set by env `GEMINI_MODEL`, default **`gemini-3.6-flash`** (pinned; listed on the official pricing page 2026-11-18 at USD 0.75 in / 3.75 out per 1M tokens until 31 Dec 2026, doubling from 1 Jan 2027). Use a paid-tier key: free-tier prompts may be used to improve Google products | JSON-schema output; claim validator; template fallback. **Synthetic data only**, because the Gemini API has no guaranteed UAE processing location [11] |
| M-02 | Secondary crisis signal on free text ("raise-only") | Same Gemini model, classification prompt | Runs **asynchronously after** the deterministic gate has already answered (the < 1 s gate never waits for it). May **add** a RED flag; can **never** clear one. **Off by default** (`LLM_CRISIS_SECOND_OPINION=false`), and always off in Judge Mode, because judges type free text that must not leave the system |
| M-03 | Fallback | No-LLM templates | Used when M-01 fails validation, times out or is disabled (`LLM_PROVIDER=none`) |

**Deterministic engines (not AI):** Scoring, Crisis Gate, Step Matcher, RCI, SLA/escalation, fairness suppression. These live in `packages/rules` (JSON) and `services/api/app/engines`.

## 10. Tech stack (versions verified 2026-11-18)
| Layer | Choice |
|---|---|
| Frontend | Next.js 16.4.x (App Router) + TypeScript 5 + Tailwind CSS 4.3 + next-intl 4.15 (RTL Arabic) + shadcn/ui + Recharts; PWA (mobile-first) |
| Backend | Python 3.12 + FastAPI 0.163 + Pydantic 2.14 + SQLAlchemy 2.1 + Alembic; APScheduler for SLA timers |
| DB | PostgreSQL 16 (Neon/Render managed for the demo); SQLite fallback for local dev |
| AI | Gemini API via `google-genai` 3.5.0, behind an `LLMProvider` interface (`gemini` / `azure_openai` / `local` / `none`) |
| Standards | FHIR R4 resource shapes (`QuestionnaireResponse`, `Consent`, `ServiceRequest`, `Task`, `Communication`, `Flag`, `Provenance`); LOINC panels 44249-1 (PHQ-9) and 69737-5 (GAD-7); store total scores under 44261-6 (PHQ-9 total) and 70274-6 (GAD-7 total) |
| Testing | pytest, Vitest, Playwright |
| CI | GitHub Actions (lint → test → eval → build → deploy) |
| Hosting (MVP) | Web on Vercel; API on Render (Docker, Frankfurt region; no Middle East region); managed Postgres (Neon / Render). Synthetic data only. SQLite is allowed for local dev only, because append-only triggers on event/audit tables need Postgres |
| Hosting (v1 production) | In-country: Azure UAE North or Core42; LLM switched to an in-country endpoint (Azure OpenAI UAE North or self-hosted Jais 3), per Federal Law 2/2019 Art. 13 [12] |
| Auth | MVP: Judge Mode demo login (signed JWT) gated by a shared `JUDGE_PASSCODE` given in the submission form. v1: UAE PASS (citizen) + facility SSO (staff) |
| Scope | Adults 18+ (IFHAS covers 18–75). Under-18s are out of scope for the MVP |

Monorepo layout: `apps/web`, `services/api`, `packages/rules`, `ai/prompts`, `ai/evals`, `data/synthetic`, `infra`, `packages/contracts/openapi.yaml`.

## 10b. Regulatory frame (detail in COMPLIANCE.md)
UAE Federal Law 2/2019 (ICT in health fields; Art. 13 data localisation) · UAE PDPL (Federal Decree-Law 45/2021, health carve-out) · Federal Law 10/2023 on Mental Health · DoH Patient Healthcare Data Privacy Standard + Circular 147/2022 (no third-party sharing without DoH approval) · ADHICS (Abu Dhabi Healthcare Information & Cyber Security Standard) · DoH Responsible AI Standard (2025) · DoH AI Clinician Framework (Oct 2026) · DoH Standard of Care for Depression & Anxiety (2025) · Emirates Drug Establishment medical-device rules (Federal Decree-Law 38/2024). The MVP intended use is non-diagnostic navigation and care coordination (see MEDICAL_DEVICE.md).

## 11. Integrations
| System | MVP | v1 |
|---|---|---|
| IFHAS results | Seeded FHIR bundle import (API-19) | Feed via Malaffi / IFHAS portal under DoH approval |
| Sahatna | Deep-link and launch stub (F-19) | Sahatna module (all facilities on Sahatna by 30 Nov 2026 [13]) |
| Malaffi | Export FHIR bundle; HL7 v2 REF adapter design only | HL7 v2 REF for referrals (Circular 144/2026 [14]) |
| UAE PASS | — | Citizen auth |
| SMS / WhatsApp | Mock channel | Licensed UAE provider |
| Crisis lines | Display + `tel:` links: 999, 800-SAKINA (800 725462), 800-HOPE (800 4673) [7] | Warm transfer protocol with line operators |
| Provider directory | Synthetic JSON | DoH facility registry / IHE mCSD |

## 12. Top risks
| ID | Risk |
|---|---|
| R-01 | Missed crisis signal (false negative) |
| R-02 | LLM states an unsupported clinical claim |
| R-03 | Data residency: Gemini API outside the UAE |
| R-04 | Arabic/Urdu wording not native-reviewed |
| R-05 | Instrument licensing and validity (PHQ/GAD free; C-SSRS terms to verify) |
| R-06 | Scope overrun in the 36-hour build |
| R-07 | Unseen strong C10 competitors |
| R-08 | Live demo failure |
| R-09 | Stigma or privacy leak (employer / family) |
| R-10 | Over-claiming clinical effect / SaMD status |
| R-11 | Fairness artefacts from synthetic data |
| R-12 | Unrealistic provider capacity assumptions |

## 13. Hackathon constraints
- Team: 2–4 people, JS + Python. Build window ≈36 hours (18–20 Nov 2026). Submission due 20 Nov 2026.
- Deliverables: working prototype (live link + credentials), technical docs, assumptions/dependencies/limitations, demo video.
- Judging criteria: health impact & clinical relevance · technical depth & architecture · working solution & demo quality · responsible AI, safety & data governance · scalability & deployment readiness · commercial viability & path to pilot.
- Data: organisers provide none; synthetic only; declare all sources.

## 14. Demo north star (what judges must see in 3 minutes)
1. Mariam's positive screen (L2) → explanation → "Arabic-speaking female family physician trained in mental health, Thiqa network, tele-consult Thursday; nothing shared with your employer" → three taps.
2. The judge types an indirect Arabic crisis phrase → the gate fires in < 1 s → LLM panel locked → emergency numbers shown → a RED episode lands in Khalid's queue with a 15-minute SLA clock.
3. Dr Salma's one-screen summary (mental + physical context) → confirms the step.
4. Programme dashboard: simulated conversion and time-to-care vs baseline, plus a fairness table with suppressed cells.
5. `EVAL.md`: crisis recall on the 150-utterance adversarial benchmark (**target** 100%) and unsupported-claim rate in validated LLM outputs (**target** 0%). Show only numbers the eval run actually produced.

## Sources
1. ADPHC IFHAS expansion — https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/
2. Challenge statement C10 — https://hack2skill.com/event/futurehealthchallenge/
3. Depression and anxiety among adults in Abu Dhabi — https://www.populationmedicine.eu/Depression-and-Anxiety-among-Adults-in-Abu-Dhabi-A-population-based-study,229332,0,2.html
4. Mental health disparities, Abu Dhabi QoL survey — https://researchportal.bath.ac.uk/en/publications/mental-health-disparities-across-demographic-and-social-groups-in/
5. DoH Standard of Care for Depression & Anxiety (2025) — https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx
6. Abu Dhabi advances proactive mental healthcare — https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143
7. UAE mental health helplines 2026 — https://www.emirates247.com/uae-guide/uae-mental-health-helplines-2026-numbers-to-call-in-dubai-abu-dhabi-and-across-the-emirates/6178
8. Kroenke et al. (2001) PHQ-9 — https://doi.org/10.1046/j.1525-1497.2001.016009606.x
9. Spitzer et al. (2006) GAD-7 — https://doi.org/10.1001/archinte.166.10.1092
10. NICE CG123 stepped care — https://www.nice.org.uk/guidance/cg123
11. Google Cloud does not list a UAE region; Vertex AI data residency guarantees processing location only for listed regions (Middle East: Dammam, Saudi Arabia). The Gemini API (AI Studio) offers no UAE processing commitment — https://cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency · https://cloud.google.com/about/locations
12. UAE Federal Law 2/2019 — https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1
13. DoH Circular 170/2026 (Sahatna) — https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx
14. DoH Circular 144/2026 (Malaffi referrals) — https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx
