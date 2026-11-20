# Glossary
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](../01-product/PRD.md) · [Metrics](../01-product/METRICS.md) · [Data model](../03-engineering/DATA_MODEL.md) · [Compliance](../06-security-compliance/COMPLIANCE.md)

Definitions are short working definitions for the team. Where a fact matters, the source is linked; "unverified" means we have not confirmed it from a primary source.

## 1. Jisr terms
| Term | Meaning |
|---|---|
| **Jisr** | Arabic جسر, "bridge". The product name |
| **Episode** (E-06) | One person's journey from a positive screen to closure, with a step, an owner, a deadline and a closure. States in brief §7 |
| **EpisodeEvent** (E-07) | Append-only record of each episode transition (actor, time, from/to state, rule-set version). Never edited or deleted |
| **Episode Ledger** (F-08) | The state machine + event log + SLA timers that make every episode measurable |
| **Crisis Gate** (F-03) | Deterministic check that runs before any LLM: PHQ-9 item 9 > 0, C-SSRS screener items, phrase lexicon. Fails closed |
| **RED** | The crisis pathway level; overrides every other level. Shows emergency numbers and creates a 15-minute SLA item for the on-call clinician |
| **L0–L4** | Jisr's stepped-care levels: L0 self-guided wellbeing · L1 guided self-help + community · L2 family physician · L3 tele-mental-health / psychologist · L4 specialist psychiatry (brief §6) |
| **Step Matcher** (F-05) | Rules that map severity and preferences to a level and rank providers; shows every factor |
| **Warm hand-off** (F-07) | A referral that is accepted by a named provider within an SLA, with escalation if not — as opposed to "please see a specialist" |
| **Waiting well** (F-09) | Low-intensity self-help plus a scheduled re-check while a person waits for care |
| **Raise-only** | Rule for M-02: an LLM may add a RED flag but can never remove one |
| **Claim validator** | Code that rejects LLM text containing any number, date, instrument, provider, phone or clinical claim not present in the input facts; triggers template fallback (M-03) |
| **Discreet mode** (F-14) | Neutral notification wording, quick-exit button, no app badges |
| **Judge Mode** (F-17) | Demo login with role switcher, seeded personas and a guided tour |
| **Rule set / RuleSetVersion** (E-17) | Versioned JSON rule files in `packages/rules`, each threshold with a citation; every decision records the version used |
| **Observed / Calculated / AI-drafted** | The three content types the UI keeps visually separate (from organiser guidance) |
| **Small-cell suppression** | Hiding any subgroup count below k (here `SMALL_CELL_K=10`) so individuals can't be identified; **complementary suppression** hides another cell so the hidden value can't be derived from totals |
| **Disparity ratio** | Rate for a subgroup ÷ rate for the best-performing subgroup; Jisr flags < 0.8 (heuristic) |
| **Synthetic data** | Generated, fictional records. The only data used in the MVP |

## 2. Abu Dhabi and UAE health system
| Term | Meaning | Source |
|---|---|---|
| **DoH** | Department of Health – Abu Dhabi; health regulator for the emirate and challenge organiser | https://www.doh.gov.ae |
| **ADPHC** | Abu Dhabi Public Health Centre; runs population screening programmes including IFHAS | https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/ |
| **IFHAS** | Integrated Family Health Assessment Screening (expansion of the acronym **unverified**); ADPHC's adult screening programme, free for Thiqa holders aged 18–75 at 150+ facilities; mental-health and anxiety screening added in the 2025 expansion | https://wam.ae/en/article/b1ryawb-more-than-150-healthcare-facilities-across-abu |
| **Thiqa** | Abu Dhabi government health programme for UAE nationals, administered by Daman | https://u.ae/en/information-and-services/health-and-fitness/healthcare-access-and-insurance/getting-a-health-insurance |
| **Basic plan** | Entry-level employer-provided health insurance for lower-income expatriates in Abu Dhabi (exact benefits **unverified**) | same as above |
| **Enhanced plan** | Employer-provided expat insurance above Basic, with wider networks (details **unverified**) | same as above |
| **Daman** | National Health Insurance Company; administers Thiqa | u.ae link above |
| **SEHA** | Abu Dhabi Health Services Company; public provider operating hospitals and PHC centres; runs the SAKINA platform | `docs/research/research/A-organisers-judges.md` |
| **SAKINA / 800-SAKINA** | SEHA mental-health platform (screens depression, anxiety, perinatal depression, autism, dementia) and the Abu Dhabi helpline 800 725462 | https://www.emirates247.com/uae-guide/uae-mental-health-helplines-2026-numbers-to-call-in-dubai-abu-dhabi-and-across-the-emirates/6178 |
| **800-HOPE** | National mental-health support line, 800 4673 | same |
| **999** | UAE emergency (police/ambulance) | same |
| **Sahatna** | DoH patient app (UAE PASS sign-in; appointments, teleconsult, Malaffi records, IFHAS). Circular 170/2026: all facilities integrated by 30 Nov 2026 | https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna · https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx |
| **Malaffi** | Abu Dhabi Health Information Exchange. Circular 144/2026: all referrals sent as HL7 v2 REF messages (due 31 Aug 2026). No public FHIR API found | https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx |
| **UAE PASS** | National digital identity used to sign in to government services, including Sahatna. Jisr v1 citizen auth | `docs/research/research/B-context-and-data.md` |
| **TAMM** | Abu Dhabi government services platform; hosts "Sahatna Space" | https://www.doh.gov.ae/en/news/abu-dhabi-advances-smart-and-intelligent-health-system-with-launch-of-sahatna-space-on-tamm |
| **PHC** | Primary health care centre; DoH positions the family physician as its focal point (180+ centres) | https://www.doh.gov.ae/en/news/doh-primary-healthcare-model-elevates-the-patient-experience-enhances-quality-of-healthcare-services |
| **Family physician** | Primary-care doctor; Abu Dhabi aims for every resident to have an assigned one. 1,930 trained in common mental-health conditions | https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143 |
| **DoH Standard of Care for Depression & Anxiety** | DoH standard effective Sep 2025: PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care | https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx |
| **Population Health Intelligence (PHI)** | DoH × Microsoft AI population-health platform unveiled at GITEX 2025 | https://www.mediaoffice.abudhabi/en/health/department-of-health-abu-dhabi-unveils-worlds-1st-ai-powered-population-health-intelligence-platform-at-gitex-global-2025/ |
| **Abu Dhabi regions** | Abu Dhabi (city) region, Al Ain region, Al Dhafra region; used as Jisr's geography dimension | General knowledge |

## 3. Law, regulation and governance (UAE)
| Term | Meaning | Source |
|---|---|---|
| **Federal Law 2/2019** | UAE law on the use of ICT in health fields; Art. 13 requires health data to be stored and processed inside the UAE unless an exception applies | https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1 |
| **UAE PDPL** | Federal Decree-Law 45/2021 on personal data protection; excludes health data where sector law exists, so Federal Law 2/2019 governs health data. Executive-regulation status **unverified** | https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/united-arab-emirates |
| **DoH Responsible AI Standard** | DoH/ST/DDGO/RAI/V1/2025, effective Oct 2025; applies to DoH and licensed entities (transparency, privacy, technical requirements). Clause detail **unverified** (fetch failed) | https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx |
| **DoH AI Clinician Framework** | DoH guide for clinicians using AI, published Oct 2026 | https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide |
| **ADHICS** | Abu Dhabi Healthcare Information and Cyber Security Standard; audited by DoH | https://www.tamimi.com/news/the-doh-audit-program-regarding-abu-dhabi-healthcare-information-and-cyber-security-standards |
| **DoH Circular 147/2022** | Referenced in our research as prohibiting third-party sharing of health data without approval (**text unverified**) | `docs/research/biblehackathon.md` |
| **SaMD** | Software as a Medical Device. Whether Jisr qualifies under UAE rules, and which authority classifies it, is an open question (R-10) | — |
| **DECIDE-AI** | Reporting guideline for early-stage clinical evaluation of AI decision support | https://www.nature.com/articles/s41591-022-01772-9 |
| **TRIPOD+AI** | Reporting guideline for prediction models using AI | https://www.bmj.com/content/385/bmj-2023-078378 |

## 4. Clinical terms and instruments
| Term | Meaning | Source |
|---|---|---|
| **PHQ-9** | Patient Health Questionnaire, 9 items, 0–27; depression severity bands 5 / 10 / 15 / 20 (mild, moderate, moderately severe, severe). LOINC 44249-1 | https://doi.org/10.1046/j.1525-1497.2001.016009606.x |
| **PHQ-2** | First two PHQ-9 items, 0–6; ≥ 3 usually prompts the full PHQ-9 | DoH standard (above) |
| **PHQ-9 item 9** | "Thoughts that you would be better off dead, or of hurting yourself"; any answer > 0 fires Jisr's Crisis Gate | Kroenke 2001 |
| **GAD-7** | Generalized Anxiety Disorder scale, 7 items, 0–21; bands 5 / 10 / 15 (mild, moderate, severe). LOINC 69737-5 | https://doi.org/10.1001/archinte.166.10.1092 |
| **GAD-2** | First two GAD-7 items, 0–6; ≥ 3 prompts the full GAD-7 | DoH standard |
| **Arabic PHQ-9 / GAD-7** | Arabic versions validated in a Lebanese psychiatric outpatient sample (PHQ-9 sensitive but less specific; GAD-7 weaker) | https://read.qxmd.com/read/27031595/ |
| **C-SSRS** | Columbia Suicide Severity Rating Scale; Jisr uses screener items only if licence terms allow (R-05, A-03) | https://cssrs.columbia.edu |
| **RCI** | Reliable Change Index (Jacobson & Truax 1991): change divided by the standard error of the difference; \|RCI\| > 1.96 = reliable change | https://doi.org/10.1037/0022-006X.59.1.12 |
| **Reliable improvement / deterioration** | Score change exceeding the RCI threshold in the better / worse direction |  |
| **Reliable recovery** | Reliable improvement AND moving from above to below the caseness threshold |  |
| **Caseness** | Score at or above the clinical threshold (Jisr: PHQ-9 ≥ 10, GAD-7 ≥ 10) |  |
| **Stepped care** | Model where people start at the least intensive effective treatment and step up if not improving; from NICE CG123 | https://www.nice.org.uk/guidance/cg123 |
| **Low-intensity intervention** | Guided self-help, psychoeducation, behavioural activation basics (NICE step 2) | NICE CG123 |
| **Measurement-based care** | Routine repeated scoring that drives treatment decisions |  |
| **Behavioural activation** | Structured scheduling of rewarding activities to reduce depression |  |
| **Safety plan** | A written, person-specific plan of warning signs, coping steps and contacts for crisis (v1, clinician-led) |  |
| **Adverse event** | Harm or near-miss during care; Jisr's taxonomy is in [METRICS.md](../01-product/METRICS.md) §2.2 |  |
| **Lost to follow-up** | Person stops responding before care is complete; an episode side state |  |

## 5. Standards and technical terms
| Term | Meaning | Source |
|---|---|---|
| **FHIR R4** | HL7 Fast Healthcare Interoperability Resources, release 4. Jisr uses its resource shapes | https://hl7.org/fhir/R4/ |
| **QuestionnaireResponse** | FHIR resource for completed questionnaires (PHQ-9, GAD-7) | FHIR R4 |
| **ServiceRequest** | FHIR resource for a referral or order | FHIR R4 |
| **Task** | FHIR resource for a unit of work with owner, status and deadline (`restriction.period` used for SLA) | FHIR R4 |
| **Consent** | FHIR resource for a person's permissions | FHIR R4 |
| **Communication** | FHIR resource for a sent message | FHIR R4 |
| **Flag** | FHIR resource for an alert (e.g. RED) | FHIR R4 |
| **Provenance** | FHIR resource recording who did what, on what evidence | FHIR R4 |
| **HL7 v2 REF** | HL7 version 2 referral message type; what Malaffi receives (Circular 144/2026) | Circular 144/2026 |
| **SMART on FHIR / SMART App Launch** | OAuth2-based standard for launching apps from an EHR or portal context; basis for the F-19 stub | https://hl7.org/fhir/smart-app-launch/ |
| **IHE mCSD** | Mobile Care Services Discovery: IHE profile for provider/facility directories (v1 directory option) | IHE |
| **LOINC** | Coding system for observations and instruments | — |
| **SNOMED CT** | Clinical terminology; mandated in Malaffi for coded data | `docs/research/research/B-context-and-data.md` |
| **SLA** | Service-level agreement: here, a deadline for a transition (e.g. RED acknowledgement 15 min) | `.env.example` |
| **LLM** | Large language model (here Gemini via `google-genai` in MVP) | brief §9 |
| **M-01 / M-02 / M-03** | Jisr model slots: explanation, raise-only crisis signal, no-LLM templates | brief §9 |
| **Jais** | Arabic-centric LLM family from the UAE (Inception / G42 ecosystem); v1 in-country option | brief §10 |
| **Azure UAE North / Core42** | In-country cloud options for v1 hosting | brief §10 |
| **Arabizi** | Arabic written in Latin letters and digits (e.g. "3" for ع, "7" for ح); covered by the crisis lexicon | — |
| **Roman Urdu** | Urdu written in Latin letters; common in messaging | — |
| **RTL** | Right-to-left layout for Arabic and Urdu | — |
| **PWA** | Progressive Web App: installable web app with offline caching | — |
| **Wilson interval** | Confidence interval for a proportion; used for recall/FPR in `EVAL.md` | — |
| **k-anonymity / k** | Minimum group size before a count is shown | — |
