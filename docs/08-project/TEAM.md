# Team
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Hackathon plan](../00-overview/HACKATHON_PLAN.md) · [Backlog](BACKLOG.md) · [Features](../01-product/FEATURES.md) · [CONTRIBUTING](../../.github/CONTRIBUTING.md)

Team size: 2–4 people, JavaScript/TypeScript + Python, ~36-hour build (18–20 Nov 2026), submission 20 Nov 2026 (brief §13). Names are filled in by the team at kick-off; roles are fixed now so every doc can refer to them.

## 1. Roles
| Code | Role | Owns | Skills |
|---|---|---|---|
| **PL** | Product lead (also demo & pitch lead) | Brief, PRD, scope cuts, clinical content (explanation templates, self-help modules, rule citations), Judge Mode script, pitch, video, submission | Product, health domain reading, writing, Arabic preferred |
| **BE** | Backend & rules engineer — **tech lead** | `services/api`, `packages/rules`, engines (scoring, crisis gate, step matcher, RCI, SLA, fairness), DB schema, ledger, FHIR import/export, deployment of API, CI | Python, FastAPI, SQL |
| **FE** | Frontend engineer | `apps/web`: person app (AR/EN/UR, RTL), clinician console, coordinator queue, programme dashboard, Judge Mode UI, PWA, Vercel deploy | TypeScript, Next.js, Tailwind |
| **AI** | AI & evals engineer (also QA) | `ai/prompts`, `ai/evals`, LLMProvider + validator, crisis lexicon and benchmark, step-matcher cases, simulation engine, `EVAL.md`, Playwright smoke tests, synthetic data | Python, LLM APIs, testing |

### Mapping by team size
| Team size | Person 1 | Person 2 | Person 3 | Person 4 |
|---|---|---|---|---|
| 4 | PL | BE | FE | AI |
| 3 | PL + AI (content, lexicon, benchmark, evals) | BE (+ LLMProvider, validator) | FE | — |
| 2 | PL + FE | BE + AI | — | — |

With 2 people, apply the cut list in [BACKLOG.md](BACKLOG.md) §4 at the start, not when behind.

## 2. Responsibilities per role (hackathon)
- **PL:** guards scope against the brief; answers clinical-content questions within 30 minutes; writes all user-facing copy into `messages/{en,ar,ur}.json`; runs the H12, H24 and H32 demo checks; owns the open questions in the PRD.
- **BE:** merges to `main`; keeps the API contract (`packages/contracts/openapi.yaml`) in sync; no clinical threshold outside `packages/rules`; owns live API uptime during judging.
- **FE:** builds against the OpenAPI contract with mocks until endpoints land; owns RTL, accessibility basics and the "I need help now" button on every screen.
- **AI:** keeps CI eval gate green (crisis recall 100%); adds a benchmark case for every lexicon change; never lets an LLM decide a score, step or crisis clearance.

## 3. RACI per workstream
R = Responsible (does it) · A = Accountable (one person, signs off) · C = Consulted · I = Informed. 4-person mapping; collapse per §1 for smaller teams.

| Workstream | PL | BE | FE | AI |
|---|---|---|---|---|
| Scope, PRD, cut decisions | A/R | C | C | C |
| Rules file (thresholds, citations, SLAs) | A | R | I | C |
| Scoring + Crisis Gate engine (F-01, F-03) | C | A/R | I | C |
| Crisis lexicon + benchmark (F-03, F-18) | C | C | I | A/R |
| Step Matcher + directory (F-05, F-06) | C | A/R | I | C |
| Episode ledger, SLA, hand-off API (F-07, F-08) | I | A/R | C | I |
| RCI + measurement (F-10) | C | A/R | I | C |
| LLM explanation + validator (F-04, M-01–M-03) | C | C | I | A/R |
| Person app UI (F-01, F-04, F-07, F-09, F-13, F-14) | C | I | A/R | I |
| Clinician / coordinator console (F-11, F-12) | C | C | A/R | I |
| Programme dashboard + fairness (F-15) | C | R (API) | A/R (UI) | C |
| Simulation (F-16) | C | C | R (UI) | A/R |
| Judge Mode + tour (F-17) | A | C | R | I |
| FHIR import/export, Sahatna stub (F-02, F-19) | I | A/R | C | I |
| Notifications (F-21) | C | A/R | C | I |
| CI/CD + deployment | I | A/R | R (web) | R (eval job) |
| Docs (`docs/`, README, EVAL.md) | A | R (eng docs) | R (design docs) | R (AI docs) |
| Pitch, demo video, submission | A/R | C | C | C |
| Privacy & responsible-AI statements | A | C | I | R |

## 4. Communication cadence (build window)
| When | What | Length |
|---|---|---|
| H0 | Kick-off: read brief together, confirm roles, freeze API names (brief §8), agree cut list | 30 min |
| Every 4 hours (H4, H8, …, H32) | Stand-up: done / next / blocked; update GitHub Issues board | 10 min |
| H12, H24, H32 | Demo check: run the five north-star moments (brief §14) on the deployed build | 20 min |
| H30 | Feature freeze: only bug fixes, docs, video after this | — |
| Continuous | One chat channel; `@here` only for blockers; decisions written in the channel and copied to `docs/03-engineering/adr/` if architectural | — |

Sleep: each person takes at least one 4-hour block; blocks are staggered so BE or FE is always awake from H8 to H28 (exact rota in [HACKATHON_PLAN.md](../00-overview/HACKATHON_PLAN.md)).

## 5. Decision process
1. **The brief decides.** If a question is answered by `PROJECT_BRIEF.md`, follow it. To change it, PL edits the brief first, then everyone updates their docs.
2. **Owner decides within their area** (RACI "A") after consulting the "C" roles for ≤ 15 minutes.
3. **Disagreement across areas:** PL decides scope/product; BE decides architecture; time-box 10 minutes; record the decision.
4. **Safety overrides speed.** Anything touching the Crisis Gate, the LLM boundary, consent or data residency needs BE + AI agreement and a green eval run. No one may disable the eval gate to ship.
5. **Cut rule:** at any demo check, if a Must feature is not working end-to-end, the next Could/Should item on the cut list is dropped immediately.

## 6. Definition of done (per ticket)
Code merged to `main` · tests for each engine branch · strings in all three locales · works on the deployed preview · no PII or free text in logs · acceptance criteria in the ticket checked · docs touched if behaviour changed (see [CONTRIBUTING](../../.github/CONTRIBUTING.md)).
