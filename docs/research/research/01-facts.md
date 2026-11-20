# 01 — Facts: Future Health Digital Innovation Challenge (FHDIC) 2026

Source [S1] https://hack2skill.com/event/futurehealthchallenge/ (fetched 2026-11-18, full statement text captured by opening each tab in a browser).
Organiser sessions [S2–S5]: transcripts in C:\Users\mridu\Downloads\ (Population Health explainer; Building & benchmarking healthcare AI — Nabeel, Inception; Agentic AI lab for Brain Health — Dr. Nancy, Inception; Designing/Pitching a winning AI agent use case — Stephen, Microsoft Innovation Hub Dubai).

## At a glance
| Item | Fact |
|---|---|
| Organiser | Future Health (global initiative by Abu Dhabi), led by Department of Health Abu Dhabi (DoH); run on Hack2skill |
| Co-creators | Microsoft, Inception (G42), MBZUAI |
| Prize | USD 105k: 50k / 35k / 20k + readiness assessment + "pathway beyond the challenge" |
| Registration | 15 Oct – 10 Nov 2026 (CLOSED). Build starts the day you register |
| **Submission** | **Working prototype + technical documentation + assumptions, dependencies, limitations — due 20 Nov 2026** (today is 18 Nov: ~48 h left) |
| Evaluation | 20–30 Nov by a standardised expert panel (DoH, Inception, MBZUAI, clinicians, regulatory, commercial, AI, academic) |
| Finals | Top 3 present at GITEX 2026, Dubai, 7–11 Dec |
| Team | 1–5, any country; one team per person |
| Data | **Organisers provide NO data, not even synthetic.** Use only data you have the right to use, declare every source, minimise personal data. Synthetic/fictional cases are acceptable for testing (confirmed in sessions) |
| IP | Stays with the team; may be asked to share code for evaluation |
| Existing products | Allowed. Must state current maturity and what was built during the challenge |
| Tech | Neutral. Azure not required; AI not required; agentic not required |
| Judging (unweighted) | Health impact & clinical relevance · Technical depth & architecture · Working solution & demo quality · Responsible AI, safety & data governance · Scalability & deployment readiness · Commercial viability & path to pilot |
| Evaluation access | Software: a demo link or platform they can test hands-on (+ credentials) + demo video. Hardware: video |

## The 10 challenge statements (verbatim titles; requirement bullets condensed)
**Fertility**
- **C01 Male Reproductive Health** — trusted low-friction private front door for men; explainable risk (screening ≠ diagnosis); culturally trusted; private intake/tele/at-home; triage to self-care / primary care / andrology / fertility / urgent; privacy by design; report completed assessments, time to evaluation, referral completion, trust, fairness.
- **C02 Reproductive Potential** — longitudinal view of change in reproductive potential (NOT a deterministic "fertility score"); modifiable vs non-modifiable; options (optimisation, testing, preconception counselling, fertility-preservation discussion, referral); clinician + population view; granular revocable consent; non-discrimination (employment/insurance); calibration + false-reassurance reporting.
- **C03 Understanding & Reducing Inherited Disease Risk** — consanguinity; explain carrier / couple risk non-stigmatisingly; values-sensitive, non-coercive; escalate to accredited genetic counsellors; privacy-preserving family workflows (no exposure of one relative's data to another without permission); traceable path to counselling/services; measure comprehension & access — NOT cancelled marriages.

**Population Health**
- **C04 Precision Prevention & Screening** — move beyond age/gender rules to risk-based outreach for Well-Child Visit (1 month–6 yr, 14 visits) and adult comprehensive screening (IFHAS, 18–75, 50+ tests, launched Sept); transparent flags with factors; personalised pathway; population prioritisation vs individual decision kept distinct; cultural engagement; small-cell suppression, FP/FN by segment; outcomes = completed visits, calibration.
- **C05 Closing the Screening-to-Care Loop** — every actionable result → notification, acknowledgement, confirmation, referral, appointment, treatment, documented closure; owner at every transition; SLAs; overdue/rejected/unassigned visible; patient reassurance; P2C and C2C consultation; human-governed escalation; closure only with evidence/authorised human decision; measures (time to notification…, unresolved results, drop-off reasons).
- **C06 Population & Workforce Health Early Warning** — ≥2 materially different signal types; explainable anomaly detection; proportionate action + responsible role; aggregated, small-cell suppression, no disciplinary use; back-test: lead time, sensitivity, PPV, false alarms, latency, missing-input behaviour.
- **C07 Climate-Resilient Worker Health** — dynamic heat risk (environment + workload + shift + optional consented signals); graded multilingual alerts; worker-first governance; field-ready (connectivity/battery/dust/PPE, safe fallback); supervisor crew/site views; report lead time, false alarms, adherence, incidents, lost time.
- **C08 Protecting Brain Health Earlier** — ages 50–75; culturally valid brief assessment (MoCA used today at 50 + hearing + vision); personal baseline + meaningful change vs variation (RCI/z-score); integrate risk factors; plain-language prevention + referral; risk ≠ diagnosis; validation (test-retest, sens/spec, false-referral burden, subgroup performance).

**Wellbeing**
- **C09 Sustaining Healthy Behaviours** — adaptive plans; detect lapse and recover without resetting; evidence-based BCTs with rationale visible; autonomy, no manipulative/punitive employer/insurer use; measure persistence, recovery after lapse, biomarker change.
- **C10 Earlier, Safer Mental Wellbeing Support** — validated self-assessment; stepped local navigation; human-led crisis escalation; privacy; coordinated physical+mental care; outcomes incl. adverse events and fairness across nationality/language.

## Organiser signals from the sessions (verbatim-adjacent)
- ADPHC experts: Abu Dhabi already has **Malaffi** (HIE) and **Sahatna** (patient app). "We are not starting from zero… ambition is to build on this foundation with AI." Want a **mobile app** that can be "reflected and adopted within our current Sahatna platform"; "easy to replicate and integrate with any health platform."
- Participation in screening is low; current lever is **insurance-card blocking after 3 months of SMS** — experts explicitly said "Is this what we want going forward? The answer is no." Want participation "driven by participants themselves".
- "One family journey / family passport": what am I and my children due for (vaccines, screenings, milestones); personalisation must be cultural, not just age/gender. Examples: autistic child, Type 1 diabetic child.
- Wearables already in program: sleep, HR, VO2max, SpO2, RR, steps.
- Closed loop must account for **insurance network** (Thiqa for nationals, other schemes for expats) when routing referrals. Link flagged cases to the **assigned family physician** (Abu Dhabi push for every resident to have one).
- OSH (ADPHC): wants quick, hands-on, no long forms, implementable by employer; refers to Abu Dhabi OSH System (OSHAD-SF) manuals on adphc.gov.ae.
- Inception/Microsoft speakers: benchmark the safety-critical agent (e.g. 100% emergency detection); test cases incl. missing/wrong inputs; document every test; transparent about synthetic data; gated workflows; deterministic scoring separated from LLM narration; clinician-in-loop; DECIDE-AI; compare against existing solutions; "Poke the pain, sprinkle the magic"; one persona, one moment; clear path-to-pilot ask (cohort, site); lead with value not features; never only a video — live demo + video backup.
- Accepted: simulated sensor data, fictional cases, live link with credentials, non-AI solutions, non-UAE pilots.

## Constraints from the user
- Software only (no hardware). Goal: maximise probability of top-3 / next round.
