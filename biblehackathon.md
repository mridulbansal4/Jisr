# Future Health Digital Innovation Challenge 2026 — The Hackathon Bible
> **Verdict.** This is the Department of Health Abu Dhabi shopping for **pilot-ready modules that plug into rails it has already built**: Sahatna, Malaffi, IFHAS, Well-Child Visits and the Population Health Intelligence platform [S7][S8][S31]. The prize ($105k) matters less than the GITEX story: "Abu Dhabi pilots a winning solution". To win, pick a thin field and solve the *stated* KPI, not the obvious front-end. Build a deterministic, benchmarked core with AI that only explains, wire it visibly to Abu Dhabi rails, and end with a concrete pilot ask. The public field already holds 74+ repos, with C05 and C07 the most crowded. **C10 and C02 are empty** [S6].

# Part 1 — The Facts & Official Documentation Audit

## At a glance
| Item | Detail |
|---|---|
| Organiser | Future Health — a global initiative by Abu Dhabi, led by DoH Abu Dhabi; run on Hack2skill [S1][S27] |
| Co-creators | Microsoft, Inception (Inception42, a G42 company), MBZUAI [S1][S29] |
| Format | Online build; 10 challenge statements across 3 focus areas; technology-neutral [S1] |
| Team | 1–5 people, any countries; one team per person; lead aged 18+ [S1] |
| Dates | Registration 15 Oct – 10 Nov (closed) · **Submission 20 Nov 2026** · Evaluation 20–30 Nov · GITEX Dubai 7–11 Dec [S1] |
| Prizes | $50k / $35k / $20k + readiness assessment + pathway to incubation/pilot/scale [S1][S29] |
| Submission | Working prototype + technical docs + assumptions, dependencies, limitations. Software: a hands-on demo link (with credentials) + demo video. Hardware: video [S1][S2][S4] |
| Data | **Organisers provide no data, not even synthetic.** Declare every source; minimise personal data; synthetic/fictional cases are acceptable [S1][S3] |
| IP | Stays with the team; code may be requested for evaluation [S1] |
| Existing products | Allowed; state current maturity and what you built during the challenge [S1] |
| Contact | support+fhdic@hack2skill.com [S1] |

## Evaluation criteria
Stated (unweighted) [S1]: Health impact & clinical relevance · Technical depth & architecture · Working solution & demonstration quality · Responsible AI, safety & data governance · Scalability & deployment readiness · Commercial viability & path to pilot.

**Our read of the hidden weights (HUNCH, grounded in session evidence):**
| Criterion | Hidden weight | Why |
|---|---|---|
| Health impact (does it hit the statement's *named* KPIs?) | 25% | Each statement lists its success measures; owners will tick them off [S1] |
| Responsible AI & governance | 20% | Stressed in every session; called "not a side note" [S2] |
| Working demo, hands-on | 20% | "We will ask for a demo platform to test hands-on"; "never demo a video" [S2][S5] |
| Technical depth | 15% | Deterministic core, gated agents, benchmarks [S3][S4] |
| Deployment readiness (rails) | 10% | Sahatna/Malaffi fit; "easy to integrate in any health platform" [S2] |
| Commercial / path to pilot | 10% | Cohort, site and KPIs; an LOI helps [S5] |

## Themes & problem statements
| ID | Focus | Title | One-line summary [S1] |
|---|---|---|---|
| C01 | Fertility | Male Reproductive Health | Private, stigma-free front door; explainable risk; safe triage to care |
| C02 | Fertility | Reproductive Potential | Longitudinal view of change, **not a fertility score**; options; non-discrimination |
| C03 | Fertility | Understanding & Reducing Inherited Disease Risk | Consanguinity; carrier/couple risk explanation; counselling; family privacy |
| C04 | Pop. Health | Precision Prevention & Screening | Risk-based Well-Child Visit / IFHAS outreach; transparency; small-cell suppression |
| C05 | Pop. Health | Closing the Screening-to-Care Loop | Every actionable result → owner → referral → documented closure |
| C06 | Pop. Health | Population & Workforce Health Early Warning | ≥2 signal types; explainable anomaly detection; back-test |
| C07 | Pop. Health | Climate-Resilient Worker Health | Dynamic heat risk; multilingual graded alerts; worker-first governance |
| C08 | Pop. Health | Protecting Brain Health Earlier | Culturally valid assessment; baseline + change; risk ≠ diagnosis |
| C09 | Wellbeing | Sustaining Healthy Behaviours | Adaptive plans; lapse recovery without reset; sustained outcomes |
| C10 | Wellbeing | Earlier, Safer Mental Wellbeing Support | Validated screen; stepped navigation; human crisis escalation; fairness |

## Official documentation & tech-stack constraints
- **Malaffi (HIE):** referrals must flow as **HL7 v2 REF** with SNOMED-coded specialty since 31 Aug 2026 (Circular 144/2026) [S7]. No public FHIR API was found, so describe a "FHIR R4 internally + HL7 v2 adapter" design.
- **Sahatna (citizen app):** UAE PASS sign-in; IFHAS, genomics and dependents are inside; **all facilities must integrate by 30 Nov 2026** (Circular 170/2026) [S8][S41].
- **IFHAS:** free for Thiqa holders aged 18–75 at 150+ facilities; expanded Aug 2025 with memory testing from age 50, reproductive screening for ages 20–35, and mental health screening [S9].
- **Governance:** DoH Responsible AI Standard (Oct 2025) [S25]; DoH AI Clinician Framework (Oct 2026) [S26]; Federal Law 2/2019 Art. 13 (health data stays in the UAE) [S24]; DoH Circular 147/2022 (no third-party sharing without approval).
- **Standards that judges recognise:** FHIR R4 (`ServiceRequest`/`Task`/`Consent`/`RiskAssessment`) [S34]; DECIDE-AI [S35]; TRIPOD+AI [S36].
- **Open data:** Synthea (Apache-2.0) [S32]; MIMIC-IV FHIR demo (ODbL, open) [S33]; Open-Meteo ERA5 (CC BY 4.0) [S40].

## Timeline & deliverables checklist (from 18 Nov)
- [ ] Lock the statement and persona (hour 0)
- [ ] Deterministic core + safety gate (hours 0–12)
- [ ] Person UI + clinician/programme console (hours 8–24)
- [ ] `EVAL.md` benchmark + fairness tables (hours 20–28)
- [ ] README (who/task/input line), architecture, governance, licences, assumptions & limitations, path-to-pilot (hours 26–32)
- [ ] Deploy a live link + Judge Mode + credentials; record the backup video (hours 30–36)
- [ ] Submit before 20 Nov (check the time zone on the platform; aim for 12 h early)

# Part 2 — The People

## Organisers & committee
| Who | Mandate / motive | Evidence |
|---|---|---|
| DoH Abu Dhabi: Chairman Mansoor Al Mansoori; Undersecretary Dr Noura Al Ghaithi | Turn ADGHW into a year-round platform; "To Sense is to Predict"; reactive → anticipatory care | [S27][S28] |
| Dr Asma Al Mannaei (DoH Health & Life Sciences) | "Test and scale solutions in real-world settings" (after the MIT Solve round) | [S30] |
| ADPHC Screening & Surveillance (director, senior epidemiologist, head of screening, screening physician) | Owners of C04, C05, C08; proud of IFHAS; want to replace coercive levers; closed loop | [S2] |
| ADPHC Occupational Safety & Health division director | Owner of C06/C07; simple, employer-implementable, no long forms; OSHAD-SF | [S2] |
| DoH team member (Q&A on judging) | Ease of integration; synthetic data fine; async teleconsult encouraged | [S3] |

## Co-creators
| Co-creator | What they push | How to align (without overclaiming) |
|---|---|---|
| **Microsoft** | DoH × Microsoft Population Health Intelligence platform [S31]; Azure UAE North residency; Innovation Hub "BXT" design thinking [S5] | Show deployability in a UAE region and a PHI export; pitch with persona → pain → value → pilot |
| **Inception42 (G42)** | Agentic AI; Jais 3 Arabic models + Jais Speech; the session speakers' own agent prototypes [S3][S4] | A visible agent/gate graph, deterministic scoring, a benchmark table, Arabic output; use Jais only if you really do |
| **MBZUAI** | BiMediX2 bilingual medical model; "prototype to patient" rigour | Reference standards, calibration, subgroup metrics, licence awareness, reproducible eval scripts |

## Judges & jury
The panel is "standardised": DoH, co-creators, nominated providers and clinicians across clinical, commercial, regulatory, AI, academic and scale-up expertise [S2]. **Refer to session speakers by role; name spellings in the transcripts are unverified.**

## Judge heat-map
| Evaluator (role) | Wants | Hates | Our angle |
|---|---|---|---|
| ADPHC screening physician (C04) | A family journey; participation driven by people themselves; a mobile module adoptable in Sahatna | **Insurance-card blocking** ("Is this what we want? No"); age/gender-only rules | Non-coercive design, family unit, Sahatna-launchable |
| ADPHC head of screening (C05) | Owner, SLA, documented outcome, network-aware referral | Results with no referral ("worthless") | Loop ledger discipline, reused in Jisr for mental health |
| ADPHC senior epidemiologist (C08) | Change over time; confounders; risk ≠ diagnosis | "One score is not the full signal" | Personal baseline, sensory/mood gating, reversible causes |
| ADPHC OSH director (C06/C07) | Quick, hands-on, employer-implementable | Long forms | Zero-form, voice-first, multilingual |
| Inception applied scientist | "We help who / task / input"; competitor comparison; benchmark on the safety-critical agent | Untested edge cases; opaque synthetic data | `EVAL.md`, competitor matrix |
| Inception senior applied scientist | Gates; deterministic scoring; per-agent reports; validation dashboard; DECIDE-AI | "Leaving the judge to the LLM"; ignoring model licences | Observed / Calculated / AI-drafted separation; licence table |
| Microsoft Innovation Hub AI lead | One persona, one moment; "poke the pain, sprinkle the magic"; path to pilot | Solution-first pitches; feature lists; starting with scale; only a video | Story told twice; pilot slide; live demo |

# Part 3 — Why This Hackathon, Why Now

## The real reason it exists
Abu Dhabi has spent five years building the data and citizen rails (Malaffi, Sahatna, the Emirati Genome Programme, IFHAS) and the AI layer (PHI with Microsoft). Now it needs *applications* that convert data into action and outcomes, with visible governance, to showcase at GITEX and to feed the "Future Health" year-round narrative [S27][S28][S31].

## Policy & scheme drivers
- Future Health 2026 theme: "To Sense is to Predict" [S28].
- Circular 144/2026 (Malaffi referrals) [S7] and Circular 170/2026 (Sahatna by 30 Nov) [S8].
- IFHAS expansion, Aug 2025 [S9]; DoH Depression & Anxiety Standard, Sep 2025 [S10].
- Reproductive Health Programme to 2030 [S16]; mandatory premarital genetic testing [S17].
- ADPHC × IHLAD 24-week lifestyle programme, Nov 2026 [S18].
- Midday ban, 22nd year [S37]; DoH Responsible AI Standard [S25] and AI Clinician Framework [S26].

## Incidents & history behind the problem statements
| PS | Trigger → evidence → real worry → a winning answer must prove |
|---|---|
| C05 / C10 | Screening grows but conversion lags → only 30.5% of FIT-positives reached colonoscopy [S19]; mental-health positive screens lack timely follow-up [S1] → money spent on screening without outcomes → **prove** measured, owned conversion |
| C04 | Low uptake; insurance-card blocking used as the lever [S2] → coercion optics → **prove** participation without the stick |
| C08 | UAE dementia +1,795% by 2050 [S21]; memory testing added [S9] → false referrals and false reassurance → **prove** meaningful change and reversible causes |
| C02 / C01 / C03 | IVF targets, Year of the Family, 565 incompatible couples [S16][S17] → stigma, privacy, false certainty → **prove** informed choice with granular consent |
| C07 / C06 | Clock-based ban; HRW critique [S37][S39] → heat illness outside the ban window → **prove** risk-based, worker-first warnings |
| C09 | Campaigns fade → measure sustained change, not downloads [S1] |

## Geopolitical & constitutional lens (Jaishankar [Blue] vs Tharoor [Red])
- **Jaishankar:** the UAE wants sovereign AI (G42, MBZUAI, Jais) and global leadership in longevity. Solutions that keep data in-country and use Arabic natively align with that [S24].
- **Tharoor:** expatriates are the majority of residents and workers. Fairness across nationality and language is written into C06, C07 and C10 [S1]. A solution that serves only Emiratis or only Arabic speakers fails the statement.

## What the organisers want to announce afterwards
HUNCH (from the DoH's GITEX habits — the 2024 MoU and the 2025 PHI launch): "Winning solution to be piloted through Sahatna / ADPHC programmes", plus a pilot MoU or LOI [S31][S30].

# Part 4 — Connecting the Dots (Patrick Jane [Blue] vs Sherlock Holmes [Red])

## Dots nobody else will connect
1. **The insurance-block confession is a brief within the brief.** The C04 owner wants the stick replaced. Only 2 public repos mention it [S2][S6].
2. **C10's conversion gap is C05's loop problem in an empty field.** Carry the ADPHC screening owners' closed-loop language into mental health [S1][S6].
3. **Circular 144/2026 makes loop-closure event-driven.** Referral events already exist in Malaffi [S7].
4. **Sahatna's integration deadline (30 Nov) falls 10 days after submission.** Present as a Sahatna module [S8].
5. **AMH does not predict natural conception** [S15]. That is the clinically literate core of a C02 entry, where everyone else will fake a score.
6. **MoCA is licensed; A-RUDAS is free and validated in Arabic** [S22][S23]. C08 teams cloning MoCA are walking into an IP problem in front of MoCA users.
7. **Abu Dhabi's heat metric is TWL; the ban is clock-based** [S37][S38]. Risk outside 12:30–15:00 is the real C07 gap. Public entries already use TWL, though, so this edge is shared.
8. **The IHLAD 24-week programme is a ready C09 pilot cohort,** launched 11 days before the deadline [S18].
9. **1,930 trained family physicians form a stepped-care backbone** for C10 [S13].
10. **Inception's C08 session was a blueprint,** so copies will be judged by its author [S4].

## Hidden evaluation criteria
Statement KPIs computed in the demo; three content types separated; a safety benchmark; fairness and small-cell suppression; Sahatna/Malaffi adapters; a licence and provenance table; Judge Mode; a pilot slide (see `ideas.md` → universal winning layer).

## Landmines — what will annoy this jury
Diagnosis claims; a "fertility score"; an LLM doing the scoring; PHI sent to non-UAE endpoints; coercive nudges; employer access to individual data; cancelled marriages as a success metric (forbidden in C03 [S1]); an unlicensed MoCA; starting the pitch with scale; multiple personas; only a video; claiming integrations that don't exist (Malaffi FHIR, an Inception health product).

## The 80% trap — what most teams will build
C05 case trackers (≈23 public) · C07 WBGT dashboards with multilingual alerts (12–14) · C04 family passports (CareTrail et al.) · C08 copies of the Inception demo · C10 chatbots with a hotline banner · C09 streak trackers [S6].

# Part 5 — The Battlefield

## Competition forecast
74 public repos were found; about 55 are confirmed entries. If 10–25% of teams publish, the total is ~300–700 submissions. Estimated density: C05 ~25% · C07 ~15–18% · C06 ~10% · C04 ~11% · C01/C03 ~7% each · C10 ~6–10% (likely undercounted, low quality) · C08 ~5% · C09 ~4–6% · C02 ~2–4% [S6].

## Prior work by domain
| Domain | Public competitor repos | Strongest entries | Academic / standards base |
|---|---|---|---|
| Wellbeing | C09: 1–2; C10: 0 | Nafas [S44] | NICE CG123 stepped care, reliable change index, BCT Taxonomy, JITAI, Arabic PHQ/GAD validations |
| Fertility | C01: 6; C02: 0; C03: 6 | Alarzah [S52], Silsila [S47], Silah | Steiner JAMA 2017 [S15]; ClinVar; CTGA |
| Population Health | C04: 8; C05: ≈23; C06: ≈9; C07: 12–14; C08: 4 | CareTrail [S43], Basira [S48], KareShafaa [S46], SeaGuard [S45], Bardan, Heatline, BrainBaseline | FHIR BSeR closed-loop referral; NIOSH/TWL; A-RUDAS [S22] |

## Domain Winnability ranking
| Rank | Domain | Index | Recommendation |
|---|---|---|---|
| 1 | Wellbeing | **7.88** | **#1 pick: Jisr (C10).** Safe alternative: Comeback (C09) |
| 2 | Fertility | **7.40** | **Dark horse: Mizan (C02)** |
| 3 | Population Health | **6.33** | Only C08 Reversible-First, or C04 rebuilt as the "no-stick" alternative |

# Part 6 — The Council (Blue Team vs Red Team, Dynamic Seats & Supreme Pantheon)

## Standing Blue vs Red Council & Supreme Pantheon
| Seat | Blue | Red | Jurisdiction | Mode |
|---|---|---|---|---|
| 1 | Peter Thiel | Marc Andreessen | Market secret vs platform | Lead |
| 2 | Alex Karp | Jensen Huang | Pitch ontology vs compute flywheel | Lead |
| 3 | Patrick Jane | Sherlock Holmes | Motive vs forensic evidence | Chairs (recon) |
| 4 | Warren Buffett | Ray Dalio | Unit economics vs macro | Lead |
| 5 | Harvey Specter | Saul Goodman | Law vs loopholes / bad actors | Lead (veto) |
| 6 | Mike Ross | Bryan Stevenson | Human pain vs exclusion | Lead |
| 7 | Steve Jobs | Jeff Bezos | Simplicity vs Working Backwards | Lead (polish) |
| 8 | Elon Musk | Sam Altman | First principles vs scaling | Support |
| 9 | Andrej Karpathy | Yann LeCun | Baselines vs anti-hallucination rigour | Lead (veto) |
| 10 | S. Jaishankar | Shashi Tharoor | Sovereignty vs civil liberties | Support |
| 11 | R.S. Sharma | Amitabh Kant | Rails/compliance vs scale execution | Lead |
| 12 | Charlie Munger | Nassim Taleb | Inversion vs tail risk | Lead (veto) |
| 13 | Seth Godin | Philip Kotler | Tribe vs STP | Support |
| 14 | Gary Vaynerchuk | Reid Hoffman | Attention vs network effects | Support |
| 15 | Tim Cook | W. Edwards Deming | Ops vs statistical quality | Support |
| 16 | Jony Ive | Don Norman | Craft vs error-proof UX | Lead (polish) |
| 17 | Paul Graham | Naval Ravikant | Tarpit test vs leverage | Chairs (scoring) |
| Bench | HealthTech, Climate, Cybersecurity, Social-inclusion pairs | | Domain reality | Lead in their domain |
| Pantheon | Krishna (Chair), Brahma, Vishnu, Shiva, Indra, Chanakya, Alexander, Athena, Thoth, Odin, Quetzalcoatl | | Final judgement | Round 6 |

## Dynamic hackathon / domain / company specialists
19 researched seats are documented with sources in `war-room/roster-additions.md`. They include an organiser insider (ADPHC screening), the OSH regulator, Inception's evaluators, an MBZUAI methods academic, open-source maintainers (HAPI FHIR / Synthea), a family physician, a site HSE manager, a migrant-worker advocate, an incumbent HIE vendor, and a clinical-safety red-teamer.

*Process note:* the user-approval step for the roster was skipped because of the 48-hour deadline. Edit `war-room/roster-additions.md` to change seats.

# Sources
- [S1] Challenge page — https://hack2skill.com/event/futurehealthchallenge/
- [S2] Session transcript: Population Health challenge explainer (ADPHC) — local file
- [S3] Session transcript: Building and benchmarking in healthcare AI (Inception) — local file
- [S4] Session transcript: Agentic AI lab for Protecting Brain Health Earlier (Inception) — local file
- [S5] Session transcript: Designing, building and pitching a winning AI agent use case (Microsoft) — local file
- [S6] Competitor scan — `research/E-competition.md`
- [S7] DoH Circular 144/2026 — https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx
- [S8] DoH Circular 170/2026 — https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx
- [S9] IFHAS expansion — https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/
- [S10] DoH Standard of Care for Depression & Anxiety — https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx
- [S13] Abu Dhabi proactive mental healthcare — https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143
- [S15] NICHD / Steiner JAMA 2017 — https://www.nichd.nih.gov/newsroom/releases/101017-ovarian-reserve
- [S16] Reproductive Health Programme 2030 — https://gulfnews.com/uae/health/abu-dhabi-unveils-major-reproductive-health-programme-through-2030-1.500679110
- [S17] Premarital genetic screening, 565 incompatible — https://gulfnews.com/uae/health/abu-dhabi-genetic-screening-flags-565-incompatible-cases-among-couples-1.500697261
- [S18] ADPHC × IHLAD 24-week programme — https://gulfnews.com/uae/abu-dhabi/abu-dhabi-launches-new-programme-to-help-uae-nationals-reduce-risk-of-chronic-diseases-1.500741344
- [S19] CRC FIT follow-up study — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8343888/
- [S21] UAE dementia forecast — https://khaleejtimes.com/health/uae-to-see-second-highest-percentage-increase-in-dementia-cases-globally
- [S22] A-RUDAS validation — https://pubmed.ncbi.nlm.nih.gov/25984584
- [S23] MoCA licensing — https://mocacognition.com/type-references/language-validation
- [S24] Federal Law 2/2019 — https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1
- [S25] DoH Responsible AI Standard — https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx
- [S26] DoH AI Clinician Framework — https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide
- [S27] Future Health launch — https://www.mediaoffice.abudhabi/en/health/under-the-directives-of-khaled-bin-mohamed-bin-zayed-department-of-health-launches-future-health-a-global-initiative-by-abu-dhabi-to-transform-abu-dhabi-global-health-week-into-a-year-round-global-platform/
- [S28] 2026 theme "To Sense is to Predict" — https://www.mediaoffice.abudhabi/en/health/future-health-a-global-initiative-by-abu-dhabi-reveals-2026-theme-as-to-sense-is-to-predict/
- [S29] Challenge press release — https://www.zawya.com/en/press-release/companies-news/future-health-launches-global-challenge-to-move-health-innovation-towards-real-world-application-1680763
- [S30] MIT Solve Future Health Challenge winners — https://www.mediaoffice.abudhabi/en/health/future-health-a-global-initiative-by-abu-dhabi-reveals-winners-of-future-health-challenge/
- [S31] Population Health Intelligence platform — https://www.mediaoffice.abudhabi/en/health/department-of-health-abu-dhabi-unveils-worlds-1st-ai-powered-population-health-intelligence-platform-at-gitex-global-2025/
- [S32] Synthea — https://github.com/synthetichealth/synthea
- [S33] MIMIC-IV FHIR demo — https://physionet.org/content/mimic-iv-fhir-demo/
- [S34] FHIR R4 — https://hl7.org/fhir/R4/
- [S35] DECIDE-AI — https://www.nature.com/articles/s41591-022-01772-9
- [S36] TRIPOD+AI — https://www.bmj.com/content/385/bmj-2023-078378
- [S37] Midday ban 2026 — https://gulfnews.com/uae/government/midday-outdoor-work-ban-returns-across-uae-for-22nd-year-1.500567381
- [S38] TWL zones — https://occup-med.biomedcentral.com/articles/10.1186/1745-6673-3-21/tables/4
- [S39] HRW heat critique — https://www.hrw.org/news/2024/08/08/gulf-states-inadequate-heat-protection-putting-workers-peril
- [S40] Open-Meteo historical API — https://open-meteo.com/en/docs/historical-weather-api
- [S41] Sahatna launch — https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna
- [S43] CareTrail — https://github.com/bbahat/caretrail
- [S44] Nafas — https://github.com/rahulrao85/nafas
- [S45] SeaGuard — https://github.com/victorchengwei/seaguard-heatwatch
- [S46] KareShafaa — https://github.com/priyamsinghjhs/kareshafaa
- [S47] Silsila — https://github.com/DivineTechie/silsila
- [S48] Basira — https://github.com/s28066226-max/basira
- [S52] Alarzah — https://github.com/ashfaque-rifaye/alarzah
