# Future Health Digital Innovation Challenge 2026 — Top Ideas by Domain
> **How to read this.** We scored 5 ideas per focus area (15 in total) through the War Room: Blue vs Red debate, a dark-hat red-team, and a Supreme Pantheon judgement. **They were then re-scored after a scan of 74 public competitor repos.** Software-only. **Deadline: 20 Nov 2026, about 36–48 hours from the time of writing (18 Nov).** Each idea is scoped to what a team can build in that window.
>
> **The one-paragraph answer:** build **Jisr (C10)**. It is a stepped-care bridge that turns a positive mental-health screen into a completed, measured hand-off to the right level of care. Its crisis gate is deterministic and benchmarked, and the LLM never sees a crisis turn. C10 has **no public competitors** and a stated pain (the gap between "screen positive" and timely follow-up) [S1]. It also carries the closed-loop discipline that the ADPHC screening owners asked for in every session [S2]. **Dark horse: Mizan (C02)**, a reproductive-potential *trajectory* with evidence labels and no "fertility score", also in an empty field [S6].

# Part 0 — Where to Play

## Domain Winnability ranking
Weights: competition density (inverse) 25% · prior-work saturation (inverse) 20% · demo excitement 20% · jury/organiser alignment 20% · 36-h feasibility 15%.

| Rank | Focus area | Density⁻¹ | Saturation⁻¹ | Demo | Alignment | Feasibility | **Index** |
|---|---|---|---|---|---|---|---|
| 1 | **Wellbeing (C09, C10)** | 8.0 | 8.0 | 7.5 | 7.5 | 8.5 | **7.88** |
| 2 | **Fertility (C01–C03)**, carried by C02 | 7.0 | 7.0 | 7.5 | 8.5 | 7.0 | **7.40** |
| 3 | **Population Health (C04–C08)** | 3.0 | 3.5 | 8.5 | 9.5 | 8.5 | **6.33** |

**Statement-level density** (public repos found [S6]; real entries are likely 4–10× higher): C05 ≈23 · C07 12–14 · C06 ≈9 · C04 8 · C01 6 · C03 6 · C08 4 · C09 1–2 · **C02 0 · C10 0**.

**Rationale.**
- **Wellbeing:** the public field is nearly empty. The statements explicitly name a conversion gap and a lapse-recovery gap that chatbots and habit apps do not solve. Ready-made pilot cohorts exist: the IFHAS anxiety screen [S9] and the ADPHC × IHLAD 24-week programme [S18].
- **Fertility:** a flagship DoH priority (Reproductive Health Programme to 2030 [S16]). C02 is empty, but C01 and C03 already have strong public entries (Alarzah, Silsila, Silah) [S6]. The area is culturally high-stakes.
- **Population Health:** the most engaged owners (5 ADPHC experts [S2]), but the most crowded. C05 and C07 are a lottery against 75–200 entries each. CareTrail already ships the "family screening passport" for C04 [S43]. **C08 is the exception, with only 4 entries.**

## The council's #1 pick and dark horse
**#1 — Jisr ("bridge") · C10 Earlier, Safer Mental Wellbeing Support · Score 8.85**
1. **Empty field.** No public C10 repo, and the expected entries are LLM chatbots with a hotline banner [S6].
2. **The statement's own pain is a loop-closure pain.** "Continuing conversion gap between a positive screen and timely specialist follow-up" [S1]. ADPHC's screening owners asked for exactly this discipline in C05 [S2].
3. **Real rails exist.** DoH Standard of Care for Depression & Anxiety, PHQ-2 → PHQ-9 pathway, effective Sep 2025 [S10]. IFHAS added anxiety screening [S9]. 1,930 family physicians are trained in common mental health conditions [S13]. 800-SAKINA (Abu Dhabi) and 800-HOPE (national) lines exist [S14].
4. **Safety becomes the differentiator.** A deterministic crisis gate with a published Arabic/English adversarial benchmark directly answers what the Inception speakers asked for: 100% emergency detection, gated workflows, and an LLM that never scores [S3][S4].
5. **Buildable in 36 h.** Validated instruments, rules, a stepped-care matcher, a hand-off ledger, and a clinician console. No model training needed.

*Supreme Pantheon seal:* **Krishna** says fight where the field is open and the dharma is clear: protect the person in their weakest moment. **Chanakya** says *Sama* — praise the DoH standard; *Dana* — give ADPHC a measurable conversion metric; *Bheda* — expose chatbots as unsafe; *Danda* — the benchmark table.

**Dark horse — Mizan ("balance") · C02 Reproductive Potential · Score 8.60.** Zero public entries. Its differentiator is that it makes evidence honesty the product: AMH predicts ovarian *response*, not natural conception (Steiner, JAMA 2017 [S15]). That meets the statement's ban on a "fertility score" and its calibration and false-reassurance requirement head-on [S1].

**Safe alternative — Comeback (C09) · Score 8.55.** One adjacent public entry (Nafas, CPAP) [S44]. It plugs straight into the ADPHC × IHLAD 24-week programme launched 9 Nov 2026 [S18].

## All ideas at a glance
| Domain | Rank | Idea | Statement | Type | Score | One-liner |
|---|---|---|---|---|---|---|
| Wellbeing | 1 | **Jisr** | C10 | Doesn't exist (in public field) | **8.85** | Positive screen → right level of care, measured to completion, crisis-safe |
| Wellbeing | 2 | **Comeback** | C09 | Exists but weak | **8.55** | Lapse-recovery engine for the IHLAD 24-week programme; progress is never reset |
| Wellbeing | 3 | Coach Copilot | C09 | Exists but weak | 8.00 | Coach console: who's slipping, which behaviour-change technique next, with its evidence label |
| Wellbeing | 4 | Sakina Loop | C10 | Doesn't exist | 7.90 | Standalone conversion tracker for positive mental-health screens |
| Wellbeing | 5 | Firewall Wellbeing | C09/C10 | Exists but weak | 7.20 | Workplace wellbeing with aggregate-only employer views |
| Fertility | 1 | **Mizan** | C02 | Doesn't exist | **8.60** | Reproductive-potential trajectory with evidence labels, no score |
| Fertility | 2 | Wiratha Cascade | C03 | Exists but weak | 7.70 | Consent-gated relative notification + counsellor copilot |
| Fertility | 3 | Counsellor Multiplier | C03 | Exists abroad | 7.60 | Pre-counselling education + question capture to stretch scarce counsellor hours |
| Fertility | 4 | Rajul Front Door | C01 | Exists but weak | 7.50 | Anonymous-until-booking men's intake with deterministic red flags |
| Fertility | 5 | Couple Planner | C01+C02 | Doesn't exist | 7.40 | Two private vaults, one shared plan with mutual consent |
| Pop. Health | 1 | **Reversible-First** | C08 | Doesn't exist | **8.05** | Licence-free A-RUDAS baseline + practice-corrected change + reversible-cause finder |
| Pop. Health | 2 | Usra Passport (no-stick) | C04 | Exists but weak | 7.85 | Family due-list built as the measurable replacement for insurance-card blocking |
| Pop. Health | 3 | ThermaCrew | C07 | Exists but weak | 7.55 | Crew heat risk + South Asian-language voice alerts beyond the clock-based ban |
| Pop. Health | 4 | LoopLedger | C05 | Exists but weak | 7.40 | Event-driven loop closure on Malaffi REF/ORU → FHIR Task, evidence-gated closure |
| Pop. Health | 5 | Heat × Health Sentinel | C06 | Exists but weak | 7.20 | Heat + air quality + service-use anomaly detection with back-test |

## The universal winning layer (apply to whichever idea you build)
These are the hidden criteria from the sessions [S2–S5] and the gaps competitors leave open [S6]. Each takes a few hours at most and is worth more than another feature.
1. **First line of the README** — the "We help [who] complete [task] using [input from X]" sentence from the Inception benchmarking session [S3], plus the one-sentence test from the Microsoft pitching session [S5].
2. **`EVAL.md`** — a benchmark table for the safety-critical step (N cases, expected vs actual, error source), easy and adversarial cases (missing, wrong and contradictory inputs), and a failure log [S3].
3. **Three visibly separated content types in the UI:** *Observed* (what the person or record said) · *Calculated* (deterministic engine) · *AI-drafted* (LLM text, editable by a clinician). The Inception brain-health speaker's explicit taste [S4].
4. **Rails slide and adapter stubs:** Sahatna module (deep link / SMART-on-FHIR-style launch) [S8][S41], an HL7 v2 REF/ORU adapter for Malaffi (no public Malaffi FHIR API exists, so do not claim one) [S7], FHIR R4 internally [S34], and insurance-network-aware routing (Thiqa vs expat Basic/Enhanced) [S2].
5. **Governance page:** DoH Responsible AI Standard [S25], Federal Law 2/2019 Art. 13 in-country processing [S24], synthetic data only, a data-provenance and licence table (Synthea Apache-2.0 [S32], MIMIC-IV FHIR demo ODbL [S33], instrument licences), DECIDE-AI [S35] / TRIPOD+AI [S36] mapping, and an intended-use and SaMD-class assumption.
6. **Fairness & small-cell suppression** on every population view (k<10 hidden), with subgroup metrics by nationality, language, age and gender [S1].
7. **Live hands-on demo + "Judge Mode"** — a role switcher (person / clinician / programme lead), seeded personas, a guided 3-minute tour, credentials in the submission, and a backup video ("never demo a video" — but submit one) [S5].
8. **Path-to-pilot slide** — named cohort, site type, 12-week KPIs, and what DoH must provide. Lead with value, not features; one persona, one moment; "poke the pain, then sprinkle the magic" [S5].
9. **Refer to session speakers by role only** (name spellings come from auto-transcripts and are unverified).

# Wellbeing

## Domain snapshot
- **Pain:** 16.3% of a stratified Abu Dhabi adult sample screened moderate-to-severe on PHQ-9 [S11]. Stress is highest at ages 15–29 and worse for women and non-Emiratis [S12]. Screening is growing, but conversion to timely follow-up lags (statement) [S1].
- **Rails:** DoH Depression & Anxiety Standard (PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care; effective Sep 2025) [S10]; IFHAS anxiety screening [S9]; 1,930 trained family physicians [S13]; 800-SAKINA / 800-HOPE [S14]; ADPHC × IHLAD 24-week lifestyle programme for Emiratis aged 25–50 with BMI 30–35, using wearables and coaches [S18]; ADPHC × Ultrahuman Biological Health Age work [S50].
- **Prior art:** C10 has no public repos [S6]; C09 has Nafas (CPAP lapse loop, banked nights never reset, 160 labelled cases) [S44].
- **Evidence base:** NICE stepped-care model (CG123) [S54]; Jacobson–Truax reliable change index [S55]; BCT Taxonomy v1 [S56]; JITAI framework [S57]; Arabic PHQ-9/GAD-7 validations [S49]; Columbia C-SSRS screener [S58].

## Metacognitive & Sacred Wisdom audit summary
- **80% traps rejected:** the LLM "companion" chatbot (unsafe crisis handling, no validated measures); the streak habit tracker (C09 explicitly forbids resetting to zero); "sentiment analysis of social media" (covert monitoring is named as a harm) [S1].
- **Dark-hat exploits patched:** prompt injection in free text → free text is never used to change state; disclosure to an employer → no employer role exists in the data model; a family member opening the app → discreet notifications plus a quick-exit button; gaming the PHQ to jump a waitlist → clinician confirmation before a step-up beyond tele-MH.
- **Breakthrough (Blue vs Red):** Thiel and Holmes found that C10's real enemy is the *hand-off*, not the screen. Taleb and Karpathy agreed that safety comes from a deterministic gate in front of any model.

## Idea 1 — Jisr: from "you screened positive" to "you're in care", measured and crisis-safe
**Type:** Doesn't exist (in the public field)  **Score:** 8.85/10  **Statement:** C10

**The pain (Mike Ross ↔ Bryan Stevenson).** Persona: Mariam, 27, Emirati, a junior government employee. Her IFHAS check flags GAD-7 = 13 and PHQ-9 = 11. She gets a printed "please see a specialist" note. She doesn't know if it's serious, who to call, whether her insurance covers it, or whether her employer will find out. Six weeks later she still hasn't booked. Stevenson's check: the expat on a Basic plan, the Urdu-speaking driver, and the young woman who needs a female clinician are the people who get lost. The burden is concentrated in younger and non-Emirati groups [S12].

**Why now.** The DoH standard took effect Sep 2025 [S10]; IFHAS anxiety screening was added [S9]; 800-SAKINA was announced Mar 2026 [S14]; the DoH AI Clinician Framework was published Oct 2026 [S26]. Screening volume is rising, but conversion lags [S1].

**The gap others miss (Thiel + Jane ↔ Andreessen + Holmes).** Everyone builds the *front* of the funnel (a chat, a quiz). The statement's KPIs are all at the *back*: successful hand-off, follow-up within timeframe, waiting time, symptom change, crisis-response completion, adverse events, fairness [S1]. Jisr is a **measurement-based stepped-care ledger**: every positive screen becomes a tracked episode with a step, an owner, a deadline and a closure. Andreessen's platform angle: the same episode engine works for perinatal depression and for the IFHAS memory-screen loop, so it can become ADPHC's mental-health loop layer inside Sahatna.

**What exists and why it falls short.**
| Product / repo / paper | What it does | Gap |
|---|---|---|
| Generic wellbeing chatbots (expected C10 default) [S6] | Chat + PHQ form + hotline banner | No hand-off measurement, unsafe crisis turns, no fairness metrics |
| NICE stepped-care / IAPT-style services [S54] | Proven model of care | Not localised to Abu Dhabi networks, languages or insurance; no digital loop |
| SEHA SAKINA platform / 800-SAKINA [S14] | Screening and helpline | No cross-provider conversion ledger visible publicly (HUNCH; verify) |
| Nafas (C09 repo) [S44] | CPAP lapse loop | Different statement; shows the "labelled test cases" bar we must meet |

**How it works.**
1. **Screen:** PHQ-2/GAD-2 → PHQ-9/GAD-7 (Arabic/English; free instruments) inside a Sahatna-style flow, or ingested as an IFHAS result (FHIR `QuestionnaireResponse`, LOINC 44249-1 / 69737-5) [S10][S49].
2. **Crisis gate (deterministic, first):** PHQ-9 item 9 > 0, or a C-SSRS screener item [S58], or a curated Arabic/English/Arabizi phrase lexicon → immediately show emergency guidance (999; 800-SAKINA; 800-HOPE) [S14], create a **red episode** assigned to the on-call clinician with a 15-minute SLA, and lock the LLM out of the conversation.
3. **Step matcher (rules, transparent):** severity band + preference (language, clinician gender, tele vs in-person) + insurance network + capacity → recommended step: guided self-help, community, family physician, tele-MH, or specialist [S54]. Every factor is shown with "why this step".
4. **Warm hand-off:** a one-tap booking request, a referral packet (FHIR `ServiceRequest` + `Task`, owner, SLA), and an acknowledgement from the receiving provider. An unaccepted or overdue task escalates.
5. **Waiting well:** while waiting, low-intensity validated self-help with a scheduled PHQ/GAD re-check at 2 weeks. A reliable change index [S55] drives the step-up or step-down suggestion. A clinician confirms.
6. **Coordinated care:** with consent, the family physician sees a one-screen summary that combines the mental-health episode with relevant IFHAS physical findings (e.g. HbA1c, sleep), so mental and physical health are not managed separately [S1].
7. **Programme console:** hand-off rate, days to first appointment, follow-up completion, reliable improvement, crisis-response time, drop-off reasons, and fairness by nationality, language, gender and age with small cells suppressed.

**The demo moment & PR/FAQ hook (Jobs ↔ Bezos).**
- **First 45 seconds:** Mariam's positive screen → three taps → "Arabic-speaking female clinician, in your Thiqa network, tele-session Thursday; nothing is shared with your employer."
- Then the judge types an indirect Arabic crisis phrase. The gate fires in under a second: the LLM panel greys out, emergency numbers appear, and a red episode lands on the on-call clinician's queue with a running SLA clock.
- Last, the console: conversion rose from a simulated baseline.
- **PR headline:** "Abu Dhabi closes the gap between a positive mental-health screen and care: 9 in 10 positive screens reach the right level of support within 14 days (simulated)."

**30-second pitch (Karp ↔ Jensen).** Screening without a bridge is a promise broken at the worst moment. Jisr turns every positive screen into an owned, timed, measured journey to the *least intensive safe* care. The rules decide, a clinician confirms, and AI only explains. Flywheel: every episode improves the step-matching evidence and the capacity forecast for ADPHC's planning.

**Blue Team vs Red Team verdicts.**
| Dimension | Blue | Red | Synthesis |
|---|---|---|---|
| Market & platform | **Thiel:** owning the hand-off is the secret | **Andreessen:** ride Sahatna distribution | Ship as a Sahatna-launchable module + clinician web console |
| Money | **Buffett:** buyer is ADPHC / DoH programme budget; payers gain from fewer crises | **Dalio:** government cycles are slow | Free 12-week pilot → per-enrolled-episode SaaS |
| Legal | **Harvey/Sharma:** Federal Law 2/2019 residency [S24], DoH RAI [S25], consent | **Saul:** employer snooping, family snooping | No employer role in the data model; discreet mode; revocable FHIR `Consent` |
| Rights | **Jaishankar:** fits the national wellbeing agenda | **Tharoor:** no covert monitoring | Only opt-in signals; the "what this result means and doesn't" copy is mandatory |
| AI & architecture | **Karpathy:** rules + validated instruments | **LeCun:** prove the LLM can't hurt | LLM is post-gate, explain-only, schema-bound; validator blocks clinical claims |
| Human & justice | **Ross:** Mariam's six lost weeks | **Stevenson:** expats, low literacy | 6 languages (AR, EN, UR, HI, ML, TL), audio prompts, network-aware routing |
| Risk | **Munger:** pre-mortem — a missed suicide signal | **Taleb:** fat tail | Benchmark crisis recall = 100% on 150 adversarial utterances; fail-closed |
| Scale | **Musk:** zero marginal cost per episode | **Altman:** add tele-MH capacity forecasting | Scale path: IFHAS → all PHC → perinatal |
| GTM | **Godin:** smallest tribe = IFHAS positive screens at 2–3 PHC centres | **Hoffman:** referral network effect among providers | Pilot at SEHA PHC centres (HUNCH) |
| Ops & UX | **Ive:** 3 screens | **Norman:** error-proof crisis affordance | A persistent "I need help now" button on every screen |

**Supreme Pantheon verdict.** *Gita:* act without attachment to engagement metrics; measure care received, not messages sent. *Ramayana (maryada):* the crisis boundary is never crossed by a machine. *Chakravyuha:* the entry is easy (screening) and the exit is the bridge, so we build the exit. **Seal granted: #1 overall.**

**Tech stack.**
- **Frontend:** Next.js / React PWA (mobile-first, RTL Arabic) + clinician/programme console.
- **Backend:** FastAPI or Node with a deterministic rules engine (JSON rule files versioned with citations).
- **Data:** FHIR R4 resources (Questionnaire/Response, `Consent`, `ServiceRequest`, `Task`, `Communication`, `Flag`) on HAPI FHIR or a FHIR-shaped Postgres schema [S34].
- **AI:** any LLM for plain-language explanation and message drafting behind a JSON schema + claim validator. Note the in-country residency requirement (Azure UAE North / Core42) in the deployment page [S24]. Optional Arabic model (Jais 3) only if actually used.
- **Synthetic data:** a 2,000-person synthetic cohort (Synthea-generated demographics [S32] + scripted PHQ/GAD trajectories); every source is declared.

**Implementation sketch (≈36 h).**
| Block | Hours | Real vs mocked |
|---|---|---|
| Instruments + scoring + reliable change + crisis gate + lexicon (AR/EN/Arabizi) | 6 | Real |
| Step matcher rules + provider directory (synthetic, network-tagged) | 5 | Real rules, synthetic providers |
| Episode ledger (state machine, SLA timers, escalation) | 6 | Real |
| Person app (3 screens) + discreet mode + consent toggles | 6 | Real |
| Clinician queue + programme dashboard (fairness, small-cell suppression) | 6 | Real on synthetic cohort |
| `EVAL.md`: 150-utterance crisis benchmark + 60 step-matching cases + simulation of conversion vs baseline | 4 | Real eval on synthetic data |
| README, governance, rails slide, Judge Mode, video | 3 | — |

**Score breakdown:** pain 9.5 · novelty 9 · alignment 8.5 · demo 9 · feasibility 9 · local fit 9 · business 8 · legal 9 · moonshot 8.

## Idea 2 — Comeback: the lapse-recovery engine for Abu Dhabi's 24-week lifestyle programme
**Type:** Exists but weak  **Score:** 8.55  **Statement:** C09

**The pain.** Ahmed, 38, BMI 32, is enrolled in the ADPHC × IHLAD programme [S18]. Week 6: Ramadan shifts his sleep, his step count falls 40%, he skips two coach check-ins, and he feels he has "failed", so he stops opening the app. Generic programmes measure downloads, not sustained change [S1].

**Why now.** The ADPHC × IHLAD 24-week programme launched 9 Nov 2026 with wearables, individual plans and coaches [S18]. Wearables are already in the programme (sleep, HR, VO2max, SpO2, RR, steps) [S2].

**The gap others miss.** C09's KPIs are *persistence and recovery after lapse* [S1], not adherence. Comeback detects a lapse early from wearable drift plus engagement decay, classifies the likely barrier (COM-B: capability / opportunity / motivation), shrinks the plan to a "minimum viable habit" and keeps a **banked-progress** model that never resets [S56][S57]. It also plans for cultural calendar disruptions (Ramadan, summer heat, travel) in advance.

**What exists.** Nafas (CPAP, banked nights) [S44]; commercial coaching apps (not localised, engagement-metric driven); Recova (multi-track) [S6].

**How it works.**
1. Goals → small actions.
2. A daily signal fusion of wearable and check-in data gives a lapse-risk flag with its reasons.
3. A one-tap barrier picker suggests the next BCT, with its rationale and evidence label shown.
4. The plan downshifts, with no streak reset.
5. The coach console prioritises who to call today.
6. Programme metrics: persistence at weeks 12/24, recovery-after-lapse rate, weight/HbA1c delta, and equity.

**Demo moment.** A timeline scrub through Ahmed's Ramadan week: the lapse is detected on day 3, not day 14. The plan shrinks to a "10-minute walk after iftar". His banked progress stays visible. The coach queue reorders.

**Blue/Red highlights.** **Munger:** manipulation risk → no dark patterns, and notification controls belong to the user [S1]. **Saul:** an employer or insurer abusing the data → no punitive-use roles. **Karpathy:** use transparent rules plus a simple Bayesian lapse model; don't claim a trained model.

**Pantheon:** a safe, aligned, low-competition path, with a pilot cohort that already exists. **Seal: runner-up.**

**Stack / sketch.** Same stack as Jisr. Synthetic wearable time series for 300 members. Evaluation: lapse-detection lead time on 120 labelled synthetic trajectories, and a recovery simulation. **Score:** pain 8.5 · novelty 8 · alignment 9 · demo 8.5 · feasibility 9 · local 9 · biz 8 · legal 9 · moon 7.

## Idea 3 — Coach Copilot (C09) · 7.95
The coach-side console for the same programme: who is lapsing, the recommended BCT with its evidence label, and a drafted message for the coach to edit. Weaker alone, because the demo has less human drama. **Fold it into Comeback.**

## Idea 4 — Sakina Loop (C10) · 7.90
A conversion tracker only (Jisr without the person app). Faster to build, but loses the person-centred story and the crisis demo. **Fallback if the team is very short on time.**

## Idea 5 — Firewall Wellbeing (C09/C10) · 7.20
Workplace programmes where employers see only k-anonymous aggregates. The governance idea is strong, but the employer channel makes the judges nervous about surveillance [S1]. **Not recommended as the primary build.**

# Fertility

## Domain snapshot
- **Pain and priority:** the Abu Dhabi Reproductive Health Programme to 2030 targets IVF success 59% → 80% and frames reproductive health as a shared male/female responsibility [S16]. Premarital genetic testing is mandatory: 11,748 couples tested, 565 incompatible [S17]. IFHAS reproductive screening for ages 20–35 was added Aug 2025 [S9].
- **Prior art:** C01 has 6 public repos (Alarzah [S52], Rafiq…); C03 has 6 (Silsila [S47], Silah, Samvid); **C02 has 0** [S6].
- **Evidence trap and opportunity:** AMH/FSH did not predict natural fecundability in women aged 30–44 (Steiner, JAMA 2017) [S15], so any "fertility score" built on AMH is clinically wrong. The statement forbids a deterministic score [S1].

## Metacognitive audit summary
- **80% traps rejected:** a "fertility score"; a Punnett-square carrier calculator; anonymous symptom checkers.
- **Dark-hat:** a relative or in-law accesses carrier data → per-person vault, explicit time-limited shares; reproductive data used by an employer or insurer → no such roles, and a user-visible audit log.
- **Breakthrough:** Holmes's evidence check turned the AMH literature into Mizan's moat.

## Idea 1 — Mizan: see the direction, not a verdict
**Type:** Doesn't exist  **Score:** 8.60  **Statement:** C02

**The pain.** Noura, 33, has an AMH result from an IFHAS check, a "low" flag, and a Google search that tells her she is "infertile". She panics. Her colleague Hessa, 36, with "normal" AMH, assumes she has years and delays. Both are misled by a single number [S15][S1].

**Why now.** Reproductive Health Programme to 2030 [S16]; IFHAS reproductive screening [S9]; 2026 framed as the Year of the Family [S16].

**The gap others miss.** Mizan shows *trajectory and evidence strength per input*. Age-related decline is the dominant non-modifiable factor. AMH is labelled "predicts response to stimulation / egg-freezing yield, **not** chance of natural conception". Cycle regularity, PCOS/endometriosis history, BMI, HbA1c, smoking and partner factors are labelled modifiable or non-modifiable, each with an evidence grade. Missing data widens the uncertainty band instead of being guessed [S1].

**How it works.**
1. Granular consent per data type, revocable, with live effect visible.
2. Inputs are shared voluntarily (age, history, lab trends, cycle app export).
3. A deterministic evidence engine produces factor cards (direction, modifiable?, evidence grade, source).
4. A trajectory view shows the direction of change over repeat results, never a single label.
5. An options ladder: optimise health → test → preconception counselling → fertility-preservation discussion → specialist referral (network-aware).
6. Clinician one-pager.
7. Population view: who may benefit from earlier advice, with small-cell suppression. Non-discrimination guarantees are shown in the UI.

**Demo moment.** Noura's "low AMH" card flips to the evidence label and the panic message disappears. The options ladder offers a preconception counselling booking. Then the judge toggles "share AMH" off and the view recalculates in front of them.

**Blue/Red highlights.**
- **Graham:** clinical risk is the tarpit → never predict a probability of pregnancy; show factors, direction and evidence only; require a clinician advisor sign-off.
- **Stevenson:** single women and stigma → language is neutral about marital status; no assumptions about family choices [S1].
- **Harvey:** sensitive data → in-country hosting [S24]; no employment or insurance use [S1].

**Pantheon:** **Athena's metis** — wisdom beats force in a field where every competitor will fake precision. **Seal: dark horse.**

**Stack / sketch.** Same core stack. A factor-evidence table (citations in JSON). Synthetic longitudinal labs for 500 women (scripted). Evaluation: false-reassurance cases (normal AMH at 38 → still flagged for age), consistency tests, and a comprehension check (teach-back quiz). **Score:** pain 8.5 · novelty 9.5 · alignment 9 · demo 8.5 · feasibility 7.5 · local 8.5 · biz 7.5 · legal 8.5 · moon 8.

## Idea 2 — Wiratha Cascade (C03) · 7.70
Explains couple risk with deterministic Mendelian maths (ClinVar-cited) [S1]. A carrier chooses whether to notify relatives, with granular shares. The counsellor queue is ordered by severity. Success is measured by comprehension and counselling uptake — never cancelled marriages (forbidden) [S1]. **Downgraded** because Silsila and Silah already ship consent-led family cascades [S47][S6].

## Idea 3 — Counsellor Multiplier (C03) · 7.60
Pre-counselling education plus structured question capture, so the scarce counselling hour is spent on decisions. Abu Dhabi counselling is by trained physicians (100+ trained) [S17]. Good for capacity, but a weak demo.

## Idea 4 — Rajul Front Door (C01) · 7.50
Anonymous until booking; deterministic red flags (testicular mass, acute pain → urgent); navigation to a home semen-analysis kit where clinically appropriate; network-aware referral. **Crowded:** Alarzah and Rafiq are strong public entries [S52][S6].

## Idea 5 — Couple Planner (C01+C02) · 7.40
Two private vaults and a shared preconception plan built only with mutual consent. Novel, but it spans two statements and dilutes the persona [S5].

# Population Health

## Domain snapshot
- **Owners:** five ADPHC experts presented C04–C08 [S2]. They are the most engaged, but the field is the most contested [S6].
- **Rails:** Malaffi referral events (Circular 144/2026) [S7]; Sahatna integration mandated by 30 Nov 2026 [S8]; IFHAS memory testing from age 50 [S9]; Population Health Intelligence platform [S31].
- **Pain numbers:** UAE diabetes 20.7%, with 64% undiagnosed [S20]; CRC screening uptake 23.5%, and only 30.5% of FIT-positives reach colonoscopy [S19]; UAE dementia +1,795% by 2050 (2nd highest globally) [S21]; the midday ban is clock-based, while TWL is Abu Dhabi's metric [S37][S38][S39].

## Metacognitive audit summary
- **80% traps:** C05 case trackers (≈23 public), C07 WBGT dashboards (12–14), C04 family passports (CareTrail, LifeCourse-360, Wiqaya) [S6][S43].
- **Breakthrough:** C08 is the thin pocket. Its winning angle combines two things everyone else misses: a **licence-free** instrument (MoCA digitisation needs a licence [S23]) and **reversible causes** (named in the statement [S1]).

## Idea 1 — Reversible-First: catch the fixable causes before calling it decline
**Type:** Doesn't exist  **Score:** 8.05  **Statement:** C08

**The pain.** Fatima's father, 68, scores lower on his IFHAS memory test [S9]. He is anxious, hard of hearing, has been on an anticholinergic bladder drug for a year, and his B12 has never been checked. A one-off score labels him "possible MCI". The clinician presenting C08 listed exactly these confounders: language, education, hearing, vision, mood [S2].

**Gap others miss.**
- A **licence-free Arabic instrument** (A-RUDAS: cutoff ≤22, sensitivity 83%, specificity 85%, less education-biased [S22]) instead of an unlicensed MoCA clone [S23].
- **Sensory and mood gating** before scoring (hearing, vision and PHQ first).
- A **practice-effect-corrected reliable change index** against a personal baseline [S55].
- A deterministic **reversible-cause gap finder**: missing B12/TSH, depression, sleep-apnoea risk (STOP-BANG), hearing loss, and anticholinergic burden from the medication list.
- Change, combined with an open reversible cause, routes to "fix and re-test in 3 months" before a neurology referral. That reduces false-referral burden, a named KPI [S1].

**Competition:** 4 public entries, with BrainBaseline/NeuroBaseline as the bar-raisers [S6]. The Inception reference build focused on change detection [S4], so Reversible-First complements it rather than copying it.

**Demo.** The father's re-test drops 3 points. The engine shows the score is *within* reliable-change limits (not significant) and flags three reversible gaps. The clinician one-pager orders B12/TSH, reviews the medication and refers to audiology. The neurology referral is deferred, with a scheduled re-test.

**Risks.** The panel includes the person who built the reference C08 prototype (a high bar); no local validation is possible in 36 h (declare it as a limitation and plan a pilot validation study).

## Idea 2 — Usra Passport, rebuilt as the "no-stick" alternative (C04) · 7.85
The only way to beat CareTrail [S43] and Basira [S48] is to answer the owner's personal pain: today's lever is **blocking the insurance card after three SMS**, and the C04 presenter said on record "Is this what we want going forward? The answer is no" [S2]. Build:
- one family message → one tap → slots for several members at one network clinic;
- routed through the **assigned family physician**;
- a programme console comparing simulated uptake under "card-block" vs "family-nudge" arms (a randomised encouragement design with a holdout).

Only 2 public repos even mention card blocking [S6].

## Idea 3 — ThermaCrew (C07) · 7.55
Crew TWL/WBGT + workload + acclimatisation day → graded **voice** alerts in Hindi/Urdu/Malayalam/Bengali/Nepali, an SMS/IVR fallback, and a forecast shift planner that targets risk **outside the 12:30–15:00 ban window** [S37][S38][S39]. **Pick it only if the team has native South Asian language voice UX.** TWL (SeaGuard) and acclimatisation (HeatMitra) already appear in public entries [S45][S51].

## Idea 4 — LoopLedger (C05) · 7.40
Consumes Malaffi HL7 v2 REF/ORU events (Circular 144/2026 [S7]) → a FHIR `Task` per actionable result, SLA clocks, insurance-network routing, orphan-result reconciliation, and closure only with `Provenance` evidence. Opening statistic: only 30.5% of FIT-positives reach colonoscopy [S19]. **Lottery odds against ≈23+ public entries** (kareshafaa, Wasl…) [S46].

## Idea 5 — Heat × Health Sentinel (C06) · 7.20
Fuses Open-Meteo ERA5 heat [S40] + OpenAQ air quality + synthetic ED/absence signals with CUSUM/EARS detection and a back-test (lead time, PPV, false alarms). Simulated clinical signals weaken credibility, and the field holds ≈9 entries.

# Sources
- [S1] Future Health Digital Innovation Challenge page (statements, FAQ, judging) — https://hack2skill.com/event/futurehealthchallenge/
- [S2] Session transcript: Population Health challenge explainer (ADPHC experts) — local file `population health challenge explainer.txt`
- [S3] Session transcript: Building and benchmarking in healthcare AI (Inception applied scientist) — local file
- [S4] Session transcript: Agentic AI lab for Protecting Brain Health Earlier (Inception senior applied scientist) — local file
- [S5] Session transcript: Designing, building and pitching a winning AI agent use case (Microsoft Innovation Hub) — local file
- [S6] Competitor scan, 74 public GitHub repos — `research/E-competition.md` (GitHub search API, 18 Nov 2026)
- [S7] DoH Circular 144/2026 (referrals to Malaffi as HL7 v2 REF) — https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx
- [S8] DoH Circular 170/2026 (Sahatna integration by 30 Nov 2026) — https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx
- [S9] ADPHC expands IFHAS (memory, reproductive, mental health screening) — https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/
- [S10] DoH Standard of Care for Depression & Anxiety (2025) — https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx
- [S11] Depression and anxiety among adults in Abu Dhabi (population study) — https://www.populationmedicine.eu/Depression-and-Anxiety-among-Adults-in-Abu-Dhabi-A-population-based-study,229332,0,2.html
- [S12] Mental health disparities, Abu Dhabi Quality of Life Survey — https://researchportal.bath.ac.uk/en/publications/mental-health-disparities-across-demographic-and-social-groups-in/
- [S13] Abu Dhabi advances proactive mental healthcare (1,930 trained family physicians) — https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143
- [S14] UAE mental health helplines 2026 (800-HOPE, 800-SAKINA) — https://www.emirates247.com/uae-guide/uae-mental-health-helplines-2026-numbers-to-call-in-dubai-abu-dhabi-and-across-the-emirates/6178
- [S15] NICHD: ovarian reserve tests fail to predict fertility (Steiner et al., JAMA 2017) — https://www.nichd.nih.gov/newsroom/releases/101017-ovarian-reserve
- [S16] Abu Dhabi Reproductive Health Programme through 2030 — https://gulfnews.com/uae/health/abu-dhabi-unveils-major-reproductive-health-programme-through-2030-1.500679110
- [S17] Abu Dhabi genetic screening flags 565 incompatible couples — https://gulfnews.com/uae/health/abu-dhabi-genetic-screening-flags-565-incompatible-cases-among-couples-1.500697261
- [S18] ADPHC × IHLAD 24-week lifestyle programme — https://gulfnews.com/uae/abu-dhabi/abu-dhabi-launches-new-programme-to-help-uae-nationals-reduce-risk-of-chronic-diseases-1.500741344
- [S19] CRC screening uptake and FIT-positive follow-up, Abu Dhabi — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8343888/
- [S20] IDF Diabetes Atlas, UAE — https://diabetesatlas.org/data-by-location/country/united-arab-emirates/
- [S21] UAE dementia forecast (+1,795% by 2050) — https://khaleejtimes.com/health/uae-to-see-second-highest-percentage-increase-in-dementia-cases-globally
- [S22] A-RUDAS Arabic validation — https://pubmed.ncbi.nlm.nih.gov/25984584
- [S23] MoCA language validation and licensing — https://mocacognition.com/type-references/language-validation
- [S24] UAE Federal Law 2/2019 (ICT in Health Fields) — https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1
- [S25] DoH Responsible AI Standard (2025) — https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx
- [S26] DoH AI Clinician Framework (Oct 2026) — https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide
- [S31] DoH Population Health Intelligence platform, GITEX 2025 — https://www.mediaoffice.abudhabi/en/health/department-of-health-abu-dhabi-unveils-worlds-1st-ai-powered-population-health-intelligence-platform-at-gitex-global-2025/
- [S32] Synthea — https://github.com/synthetichealth/synthea
- [S33] MIMIC-IV Demo on FHIR — https://physionet.org/content/mimic-iv-fhir-demo/
- [S34] HL7 FHIR R4 — https://hl7.org/fhir/R4/
- [S35] DECIDE-AI (Nat Med 2022) — https://www.nature.com/articles/s41591-022-01772-9
- [S36] TRIPOD+AI (BMJ 2024) — https://www.bmj.com/content/385/bmj-2023-078378
- [S37] UAE midday work ban 2026 — https://gulfnews.com/uae/government/midday-outdoor-work-ban-returns-across-uae-for-22nd-year-1.500567381
- [S38] Thermal Work Limit zones — https://occup-med.biomedcentral.com/articles/10.1186/1745-6673-3-21/tables/4
- [S39] HRW: Gulf heat protection critique — https://www.hrw.org/news/2024/08/08/gulf-states-inadequate-heat-protection-putting-workers-peril
- [S40] Open-Meteo historical weather API — https://open-meteo.com/en/docs/historical-weather-api
- [S41] Sahatna launch (WAM) — https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna
- [S43] CareTrail (C04 competitor) — https://github.com/bbahat/caretrail
- [S44] Nafas (C09 competitor) — https://github.com/rahulrao85/nafas
- [S45] SeaGuard HeatWatch (C07 competitor) — https://github.com/victorchengwei/seaguard-heatwatch
- [S46] KareShafaa (C05 competitor) — https://github.com/priyamsinghjhs/kareshafaa
- [S47] Silsila (C03 competitor) — https://github.com/DivineTechie/silsila
- [S48] Basira (C04 competitor) — https://github.com/s28066226-max/basira
- [S49] Arabic PHQ-9 / GAD-7 validation — https://read.qxmd.com/read/27031595/
- [S50] ADPHC × Ultrahuman Biological Health Age — https://www.wam.ae/en/article/c2q0nsf-abu-dhabi-public-health-centre-ultrahuman
- [S51] HeatMitra (C07 competitor) — https://github.com/anshurajbisoyi98-ctrl/heatmitra
- [S52] Alarzah (C01 competitor) — https://github.com/ashfaque-rifaye/alarzah
- [S54] NICE CG123 Common mental health problems: stepped care — https://www.nice.org.uk/guidance/cg123
- [S55] Jacobson & Truax (1991) reliable change index — https://doi.org/10.1037/0022-006X.59.1.12
- [S56] Michie et al. (2013) BCT Taxonomy v1 — https://doi.org/10.1007/s12160-013-9486-6
- [S57] Nahum-Shani et al. (2018) JITAI — https://doi.org/10.1007/s12160-016-9830-8
- [S58] Columbia Suicide Severity Rating Scale — https://cssrs.columbia.edu
