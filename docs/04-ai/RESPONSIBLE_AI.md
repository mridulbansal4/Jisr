# Responsible AI
> Project: Jisr · Owner: AI lead + Clinical lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Brief](../00-overview/PROJECT_BRIEF.md) · [MODELS](MODELS.md) · [PROMPTS](PROMPTS.md) · [AI_EVALS](AI_EVALS.md) · [DATA_PIPELINE](DATA_PIPELINE.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [Privacy](../06-security-compliance/PRIVACY.md) · [Threat model](../06-security-compliance/THREAT_MODEL.md)

## 1. Position in one paragraph
Jisr is **care-navigation decision support**, not a diagnostic or therapeutic AI. Deterministic, versioned rules score questionnaires, run the crisis gate and suggest a stepped-care level; **a clinician confirms every step**; a large language model only rewrites already-decided facts into plain Arabic, English or Urdu, and its output is shown only if a closed-world claim validator passes. The LLM can raise crisis risk but can never lower it, and the Crisis Gate fails closed (an error or timeout counts as RED). The LLM is used only when the person has switched on the "AI-drafted summaries" consent scope, and then receives only de-identified structured facts. In the MVP all data is synthetic.

## 2. Fairness
### 2.1 Dimensions (UAE-specific)
| Dimension | Groups reported | Why it matters here |
|---|---|---|
| Age | 18–29 · 30–44 · 45–59 · 60–75 | Stress highest at 15–29 (brief ref 4) |
| Sex | Female · Male | Women report worse outcomes (ref 4); clinician-gender preference affects access |
| Nationality group | Emirati · South Asian · Filipino · Other Arab · Western/other | Non-Emiratis report worse outcomes (ref 4); network and cost barriers differ |
| Language (preferred vs served) | AR · EN · UR · "preferred other, served EN" | Lexicon and LLM quality differ by language; Hindi/Malayalam/Tagalog not served in MVP |
| Region | Abu Dhabi · Al Ain · Al Dhafra | Provider density and in-person specialist access differ (Al Dhafra) |
| Insurance network | Thiqa · Enhanced · Basic · self-pay | Network determines where a person can be referred |
| Literacy / reading level | plain · very_plain | Low-literacy users (P-02) are most likely to drop off |

### 2.2 Metrics per group (programme dashboard, API-17)
| Metric | Definition | Flag rule |
|---|---|---|
| Crisis recall (benchmark) | per language/script on dataset A | Any language < 100% = release blocker |
| Crisis false-positive rate | per language on dataset A negatives | > 1.5× the best language → lexicon review |
| Conversion | positive screen → attended first appointment | Group rate / best group rate < 0.8 (four-fifths rule) |
| Time-to-care | median days screen → first contact | > 1.25× overall median |
| Follow-up within SLA | re-check done on time | < 0.8 ratio |
| Out-of-network match rate | referrals with network warning | > 2× overall |
| Reliable improvement (RCI) | among attended | < 0.8 ratio (interpret with caution — synthetic) |
| Drop-off reason mix | declined / lost / no capacity | Descriptive |

**Small-cell suppression:** any cell with n < 10 is shown as "<10" and excluded from ratios (F-15); complementary suppression prevents back-calculation from totals. Groups are never combined in ways that create a cell identifying fewer than 10 people.

### 2.3 Known fairness risks and mitigations
| Risk | Mitigation |
|---|---|
| Lexicon covers Gulf Arabic and Urdu better than other Arabic dialects (Egyptian, Levantine, Sudanese) and not at all Hindi/Malayalam/Tagalog | Report recall per dialect tag; M-02 multilingual raise-only backstop; PHQ-9 item 9 is language-independent; v1 roadmap adds dialects with native reviewers |
| LLM explanation quality lower in Urdu | Native rubric per language; validator same strictness for all; template fallback is clinically reviewed text |
| Basic-plan workers have fewer in-network providers | Show the network constraint transparently; coordinator task when no in-network capacity; programme dashboard exposes it as a system gap, not a person's failure |
| PHQ-9/GAD-7 cut-offs validated mainly in Western samples; Arabic validations show PHQ-9 sensitive but less specific | Cut-offs are rules with citations, editable by DoH; positive screens go to a clinician, never straight to a label |
| Synthetic data creates fairness artefacts (R-11) | Dashboard label "synthetic — tests the pipeline, not real equity"; subgroup effects are configuration assumptions listed in DATA_PIPELINE §4.2 |
| PHQ-9 item 9 > 0 triggers RED for passive ideation, which is common; heavy load could fall unevenly | Accepted for recall. Item 9 = 1 ("several days") means a same-day human safety check, not an automatic emergency call (brief F-03, OQ-01 with clinical advisors); measure RED volume per group |

## 3. Explainability
- **Three content types, visually separated** in every screen: *Observed* (what the person answered), *Calculated* (scores, bands, step, rules fired — with rule ids and citations), *AI-drafted* (M-01 text, labelled "drafted by AI from the calculated facts, checked automatically").
- **Step recommendation shows its factors** (severity, functional impairment, comorbidity with consent, preference matches, network, wait) with their effect and the rule id from [`step_rules.v1.json`](../../packages/rules/step_rules.v1.json).
- **Crisis events show the reason code** (e.g. `PHQ9_ITEM9_POSITIVE`, `LEXICON_HIT:AR-006`, `LLM_RAISE`) to staff; the person sees supportive copy, not codes.
- **Per-agent report** (judges' request): each engine (Scoring, Crisis Gate, Step Matcher, RCI, SLA, Explainer, Validator) writes a short structured record to the episode timeline: inputs hash, output, rule-set version, duration.
- Every rule file and prompt is versioned and the version is stored with every decision (E-17, E-18).

## 4. Human-in-the-loop points
| # | Point | Human | System behaviour without the human |
|---|---|---|---|
| H1 | Step confirmation (API-12) | Family physician / clinician (P-03) | Episode stays `STEP_RECOMMENDED`; SLA escalation to coordinator after 48 h. No referral is sent on a suggested step except for RED |
| H2 | RED acknowledgement and contact (API-24, API-25) | Coordinator (P-04) or on-call clinician, within `SLA_RED_MINUTES=15` | Person already sees 999 / 800-SAKINA / 800-HOPE; escalation chain on SLA breach |
| H3 | Closing a RED episode | Clinician only, with reason (a coordinator can acknowledge but not close) | Never cleared automatically, never by an LLM |
| H4 | Step-up / step-down after RCI | Clinician | Suggestion only |
| H5 | Episode closure | Clinician with evidence or documented reason | Cannot close |
| H6 | Rule / lexicon / prompt change | Clinical lead (CODEOWNERS) + AI lead | CI blocks merge without eval pass and approval |
| H7 | Consent scopes: share-with-receiving-provider · share-physical-context · AI-drafted summaries · store free text · SMS/WhatsApp | The person | Effect immediate (F-13). AI-drafted summaries off ⇒ template-only; store free text off ⇒ F-22 keeps only gate result + category |
| H8 | Native-language review of AR/UR content | Native clinical reviewers | Content marked "review pending" in UI and docs |

Automation-bias guard: the clinician console shows the factors and requires the clinician to choose (confirm / change with reason); there is no "confirm all" bulk action.

## 5. Autonomy levels
Scale used (adapted from SAE-style levels for clinical decision support): **A0** human only · **A1** system informs · **A2** system suggests, human decides · **A3** system acts, human can veto · **A4** system acts, human informed · **A5** fully autonomous.

| Function | Level | Note |
|---|---|---|
| Scoring | A4 | Deterministic arithmetic, shown to the clinician |
| Crisis Gate — showing crisis numbers to the person and queuing RED | **A4** | Deliberate: safety action must not wait for a human. Fail-closed on error/timeout |
| C-SSRS screener items | Off | Behind `FF_CSSRS_ITEMS=false` until licence confirmed (R-05) |
| Crisis Gate — clearing | A0 | Human only |
| Step Matcher | **A2** | Clinician confirms every step |
| Provider ranking | A2 | Person chooses among ranked options; coordinator can override |
| SLA escalation | A4 | Notifies humans; does not change care |
| M-01 explanation | A3 for display (validator gates it; staff can flag); A0 for any clinical content (it has none) | |
| M-02 raise | A4 (raise only) | Cannot reduce risk; off by default (`LLM_CRISIS_SECOND_OPINION=false`), always off in Judge Mode |

This keeps Jisr outside the DoH AI Clinician Framework's notion of an AI system performing licensed clinical activity: no autonomous diagnosis, prescribing or care decisions.

## 6. Misuse and harm scenarios
| # | Scenario | Harm | Control |
|---|---|---|---|
| MU-1 | Employer asks for workers' screening results (P-01, P-02 fear this) | Job loss, stigma, coercion | No employer/insurer/family-admin role exists (brief non-goal); aggregated programme data with k ≥ 10; discreet notifications; consent centre; audit log visible to the person (API-23) |
| MU-2 | Family member reads notifications on a shared phone | Stigma, family conflict, safety risk | Discreet mode (neutral text, no badges, quick-exit), notification validator bans clinical words (PROMPTS §3.6) |
| MU-3 | Insurer uses data for underwriting | Discrimination | No insurer role or access to individual data; insurers receive only what a normal claim for a booked appointment requires — never screening answers, scores or notes; network used only to route; DoH authorisation required for any other sharing (Circular 147/2022) |
| MU-4 | Screen used to gate eligibility or coerce participation (e.g. card blocking) | Coercion, false answers | Product rule: Jisr never blocks services; participation and answers are voluntary; decline is a valid episode state |
| MU-5 | Person under-reports to avoid RED / referral | Missed risk | Supportive copy explaining what happens; RED does not mean police or employer contact; free-text check continues |
| MU-6 | Clinician over-trusts suggestions (automation bias) | Wrong level | Factors visible, forced choice, audit of override rates |
| MU-7 | LLM text taken as clinical advice | Harm from unsupported claims | Closed-world validator, banned phrases, fixed disclaimer, no medication content |
| MU-8 | Prompt injection / jailbreak | Lowered risk, harmful text | Structural defences (PROMPTS §5), raise-only |
| MU-9 | Demo data mistaken for real performance | Over-claiming (R-10) | "Synthetic" labels everywhere; EVAL.md limitations; no clinical-effect claims |
| MU-10 | Use with minors | Unvalidated pathway, consent | Adults 18+ only in MVP (SM-05 OUT_OF_SCOPE) |
| MU-11 | Covert monitoring (social media, keystrokes, wearables) | Privacy violation named in challenge statement | Non-goal; no passive data collection; wearables v2 opt-in only |
| MU-12 | Real PHI sent to Gemini (outside UAE) | Law 2/2019 breach | Synthetic only; "AI-drafted summaries" consent required; only de-identified structured facts; M-02 off in Judge Mode; PII scrubber; v1 switches to in-country endpoint |
| MU-13 | Free text in the F-22 box retained and later exposed | Privacy, stigma | Raw text not stored unless "store free text" consent; only gate result + category kept; never logged |

## 7. Governance alignment
### 7.1 DoH Responsible AI Standard (DoH/ST/DDGO/RAI/V1/2025, effective Oct 2025)
The standard PDF could not be fetched in research (B-context §1); clause numbers are therefore **not cited**. The table maps to the standard's published themes (transparency, privacy, technical requirements, accountability). Owner: product lead to add clause numbers after a manual download, by 2026-11-19 18:00 GST.

| Theme | Jisr implementation | Evidence |
|---|---|---|
| Transparency to users | AI-drafted text labelled; three content types; factors shown; synthetic-data badges | UI spec, PROMPTS §3 |
| Explainability to clinicians | Rule ids + citations; per-agent reports; reason codes | step_rules.v1.json, §3 |
| Human oversight | H1–H8; autonomy table | §4, §5 |
| Safety and risk management | Deterministic, fail-closed crisis gate first; raise-only LLM; 100% recall gate in CI; risk register R-01…R-12 | AI_EVALS, brief §12 |
| Fairness and non-discrimination | Subgroup metrics with suppression; four-fifths flags; per-language recall | §2 |
| Privacy and data protection | Synthetic MVP; consent scope gates any LLM call; no identifiers to LLM; F-22 raw text not stored without consent; in-country v1 | PRIVACY, MODELS §6 |
| Technical robustness | Validator, timeouts, fallbacks, circuit breaker, pinned model ids | MODELS §3 |
| Accountability and audit | Append-only EpisodeEvent, AuditLog, ExplanationRecord, versioned rules/prompts | DATA_MODEL |
| Lifecycle monitoring | Nightly evals, drift review, change control for models/prompts | AI_EVALS §8–9 |

### 7.2 Other frameworks
| Framework | How Jisr aligns |
|---|---|
| **DoH AI Clinician Framework (Oct 2026)** | Jisr does not claim AI-clinician status; all licensed clinical decisions (step, closure, crisis clearance) stay with licensed staff. If a future version sought more autonomy, the framework's pathway would apply |
| **WHO Ethics & Governance of AI for Health (2021)** — 6 principles | Autonomy (clinician decides, person consents), well-being & safety (crisis gate), transparency (§3), responsibility & accountability (audit), inclusiveness & equity (§2, 3 languages), responsive & sustainable (monitoring, in-country v1). WHO LMM guidance (2024): no LLM for clinical decisions without validation — LLM confined to narration |
| **DECIDE-AI** | §8 |
| **TRIPOD+AI** | Rules are not a fitted prediction model; we use its transparency items (data source, missing data, subgroup results) in EVAL.md |
| **EU AI Act (global reference)** | If Jisr became a medical device under EU MDR (Rule 11 software informing decisions is typically class IIa or higher), it would be **high-risk** (Art. 6(1), Annex I). The LLM text falls under transparency duties (Art. 50: tell users content is AI-generated). Prohibited practices (manipulation, social scoring) are designed out (MU-4, MU-11). Reference only; not UAE law |
| **UAE Federal Law 2/2019 Art. 13** | In-country storage/processing for real data; MVP synthetic only |
| **SaMD status (R-10)** | MVP intended use is non-diagnostic navigation and care coordination (brief §10b, MEDICAL_DEVICE.md). For v1, a classification assessment under the Emirates Drug Establishment medical-device rules (Federal Decree-Law 38/2024) and with DoH is required before handling real patients |
| **Federal Law 10/2023 on Mental Health** | Crisis pathway and consent design to be reviewed against it by the clinical/legal lead before v1 (see COMPLIANCE.md) |

## 8. DECIDE-AI checklist mapping
Item titles are paraphrased from Vasey et al., *Nat Med* 2022 (https://www.nature.com/articles/s41591-022-01772-9); verify numbering against the published checklist before submission (owner: AI lead).

| DECIDE-AI area | Where Jisr answers it |
|---|---|
| Intended use, clinical problem, target population | Brief §2–3; this doc §1 |
| Intended users and their training | Personas P-03/P-04; clinician console onboarding (UI spec) |
| AI system description, version, inputs/outputs | MODELS §3; rules JSON versions |
| Development data and how they relate to the target population | DATA_PIPELINE (synthetic; limitations stated) |
| Implementation: where in the workflow, human-AI interaction | §4–5; architecture sequence diagrams |
| Safety: errors, adverse events, how identified and handled | AI_EVALS (crisis recall gate, failure-case log); RUNBOOK |
| Human factors and usability | Demo usability test plan in TESTING; readability metrics |
| Learning curve / user variation | v1 pilot: override rates per clinician |
| Outcomes reported (process + safety) | Programme metrics F-15; EVAL.md |
| Subgroup performance | §2 + per-language recall |
| Ethics, consent, data protection | §6–7; PRIVACY |
| Limitations and generalisability | EVAL.md limitations; DATA_PIPELINE §9 |
| Plan for next stage (comparative evaluation) | ROADMAP: 12-week pilot at 2 PHC centres, primary outcome conversion and time-to-care |

## 9. Open items
| Item | Owner | Due |
|---|---|---|
| Native clinical review of lexicon, prompts, banned phrases, instrument translations (R-04) | Clinical lead | 2026-11-19 18:00 GST |
| DoH RAI Standard clause numbers | Product lead | 2026-11-19 18:00 GST |
| C-SSRS digital-use licence (R-05) | Product lead | 2026-11-19 |
| Clinician advisor sign-off of step_rules.v1.json | Clinical lead | Before demo recording |
