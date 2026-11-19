# Vision
> Project: Jisr (جسر, "bridge") · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](PROJECT_BRIEF.md) · [Pitch](PITCH.md) · [Hackathon plan](HACKATHON_PLAN.md) · [PRD](../01-product/PRD.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [Impact](../07-business/IMPACT.md) · [Business model](../07-business/BUSINESS_MODEL.md)

This doc follows [PROJECT_BRIEF.md](PROJECT_BRIEF.md). If the two disagree, the brief wins.

## 1. Vision
**In Abu Dhabi, a positive mental-health screen is a promise. It should be kept every time.**

A screen that says "you may need help" and then leaves the person alone does harm. It takes away the hope that nothing is wrong, and it doesn't give care in return. Jisr's vision is that every positive screen ends in one of two documented outcomes:
- the person is in the right level of care and getting better, **or**
- a clinician has recorded why the episode closed.

## 2. Mission
Turn every positive mental-health screen into a completed, measured hand-off to the least intensive safe level of care. Do it in the person's language, inside their insurance network and away from their employer's view. A deterministic crisis gate runs first, and no AI can override it.

Three rules sit under the mission ([brief §4](PROJECT_BRIEF.md#4-the-secret)):
1. **Rules decide.** Validated instruments and versioned stepped-care rules produce every score and every recommendation.
2. **A clinician confirms.** No step change and no closure happens without an authorised human.
3. **AI only explains.** The LLM writes plain-language text from structured facts. A claim validator checks it. The LLM never sees a crisis turn and can only *raise* risk.

## 3. North-star metric
> **Completed hand-off within timeframe:** the share of positive screens that reach the confirmed level of care and **attend** (`ATTENDED`) within that level's target time.

This is the same definition as the [PRD](../01-product/PRD.md). The formula and the per-level target times are in [METRICS.md](../01-product/METRICS.md). The target times are design choices, not DoH targets. We will agree the real windows with ADPHC at pilot kickoff (see [GTM](../07-business/GTM.md)).

**Guardrail metrics.** These are never traded against the north star:
| Guardrail | Definition | Design target |
|---|---|---|
| Crisis escalation completion | RED episodes acknowledged by the on-call clinician within the 15-minute SLA | 100% (every miss is reviewed as an incident) |
| Crisis-gate recall | Crisis cases flagged on the adversarial benchmark (`EVAL.md`) | 100%. The gate fails closed |
| Unsupported clinical claims | Validated LLM outputs that contain a claim not in the source facts | 0 |
| Fairness gap | Largest subgroup gap in the north star (nationality, language, gender, age), shown only where cells have k ≥ 10 | To be set with ADPHC; reported every week |
| Adverse events | Self-harm events, complaints and privacy incidents during open episodes | Reported in full. No target, because a target invites under-reporting |

Why this metric: the C10 statement lists its success measures at the **back** of the funnel: hand-off, follow-up within timeframe, waiting time, symptom change, crisis-response completion, adverse events and fairness [2]. "Screens completed" and "messages sent" are vanity metrics. We don't optimise for them.

## 4. The picture over time
Hackathon results are **simulated on synthetic data**. Everything below the 1-year line is ambition, not a forecast.

| Horizon | Picture |
|---|---|
| **20 Nov 2026 (hackathon)** | A working, hands-on prototype. Judge Mode runs Mariam's journey, the crisis gate, Dr Salma's console and the programme dashboard on synthetic data. The `EVAL.md` benchmark is published. |
| **1 year (end 2027)** | One 12-week ADPHC-sanctioned pilot with IFHAS positive screens at 2–3 primary-care centres. Hosting is in-country (Azure UAE North or Core42) with an in-country LLM endpoint or templates only. Jisr launches from Sahatna. Referrals go out as HL7 v2 REF through Malaffi. Arabic and Urdu wording has native clinical review. Pilot results are published with the method stated in advance. |
| **5 years (2031)** | Jisr is the **episode layer** for mental health across Abu Dhabi's primary care. Every positive screen, from any entry point (IFHAS, family physician, 800-SAKINA follow-up, perinatal screening), opens an owned episode with an SLA. Programme leads plan tele-mental-health and psychologist capacity from live waiting-time data. The same engine runs other "screen → loop" pathways, such as perinatal depression and the IFHAS memory-screen follow-up. |
| **10 years (2036)** | Measurement-based stepped care is the default way of working in the region, not a project. Each emirate or country brings its own rule file, provider directory, languages and insurance logic. Each runs in its own country under its own regulator. The open benchmark of Gulf-Arabic, Arabizi and South Asian crisis language becomes shared safety infrastructure. |

First-principles check: an episode costs almost nothing to track. The scarce resource is clinician time and capacity. Jisr is worth having only if it sends each person to the *least intensive safe* step, so specialist capacity goes to the people who need it.

## 5. Principles
1. **Safety before everything.** The crisis gate runs first, is deterministic and fails closed. A persistent "I need help now" button is on every screen.
2. **Measure care received, not messages sent.** Every metric sits on an episode state that a clinician or a record can verify.
3. **The person owns their story.** Consent is granular and revocable, and its effect shows at once. There is no employer or insurer role in the data model. Discreet mode is on by default for notifications.
4. **Observed, Calculated, AI-drafted.** The UI always labels which is which. LLM text is editable by clinicians and never decides.
5. **Least intensive safe care.** Stepped care (NICE CG123 [10]) on the DoH Standard of Care [5]. Step up when the reliable change index says the person isn't improving, and step down when they are.
6. **Built for the people who get lost.** Arabic, English and Urdu. Low-literacy affordances. Insurance-network-aware routing for Thiqa and expatriate plans. Fairness reported with small cells suppressed.
7. **Plug into the rails; don't rebuild them.** IFHAS in, Sahatna launch, Malaffi HL7 v2 REF out, FHIR R4 inside. We never claim an integration that doesn't exist.
8. **Honest by default.** Simulated results are labelled "simulated on synthetic data". We make no diagnosis claims and no therapy claims, and we never call Jisr a medical device without a regulator's view.

## 6. Why now
| Trigger | Date | Source |
|---|---|---|
| DoH Standard of Care for Depression & Anxiety: PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care | Effective Sep 2025 | [5] |
| IFHAS (free for Thiqa holders aged 18–75) added anxiety and mental-health screening | Aug 2025 | [1] |
| 1,930 family physicians trained in common mental health conditions: a ready stepped-care backbone | 2025–26 | [6] |
| 800-SAKINA (Abu Dhabi) crisis line alongside the national 800-HOPE | 2026 | [7] |
| DoH Circular 144/2026: Malaffi referrals move as HL7 v2 REF, so referral events already exist | Since 31 Aug 2026 | [14] |
| DoH Circular 170/2026: all facilities on Sahatna by 30 Nov 2026, ten days after submission | 30 Nov 2026 | [13] |
| DoH Responsible AI Standard; DoH AI Clinician Framework | Oct 2025; Oct 2026 | `biblehackathon.md` [S25][S26] |
| The C10 statement names the "continuing conversion gap between a positive screen and timely specialist follow-up" | Oct 2026 | [2] |

Screening volume is rising, and the rails to act on it now exist. What's missing is the **bridge** between them.

## 7. Impact thesis
If every positive screen becomes an owned, timed episode:
- matched to the least intensive safe step,
- in the person's language and network,
- with a deterministic crisis gate and clinician confirmation,

then more people will reach care sooner and more of them will improve measurably. The groups that are lost today (young people, women, non-Emiratis, low-literacy and non-Arabic speakers [4]) will close the gap. Crisis signals will reach a human within minutes.

That is the theory. The pilot exists to test it. See [IMPACT.md](../07-business/IMPACT.md) for the theory of change, SDG 3.4 mapping and measurement plan.

## Sources
Numbered sources follow [PROJECT_BRIEF.md § Sources](PROJECT_BRIEF.md#sources): [1] IFHAS expansion · [2] C10 challenge statement · [4] Abu Dhabi QoL mental-health disparities · [5] DoH Standard of Care · [6] Gulf News on family-physician training · [7] UAE helplines 2026 · [10] NICE CG123 · [13] Circular 170/2026 · [14] Circular 144/2026.
