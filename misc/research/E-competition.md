# E — Competition scan: public competitor repos, density, default builds, exploitable gaps

Prepared 18 Nov 2026 (submissions close 20 Nov). Method: about 75 unauthenticated GitHub repository-search queries (`api.github.com/search/repositories`) using the challenge name and its variants (`future health challenge`, `futurehealth`, `fhdic`, `hack2skill future health`, `future health digital`), Abu Dhabi terms (`Abu Dhabi`, `DoH abu dhabi`, `Sahatna`, `Malaffi`, `ADPHC`, `IFHAS`, `Thiqa`, `emirati`, `GITEX health`, `health uae`), and each topic (screening loop, careloop, screening to care, loop closure, heat stress/heat safety/heat illness worker, brain health/cognitive baseline/dementia/MoCA, consanguinity/carrier/inherited disease/genetic counselling/premarital, male fertility/andrology/reproductive, early warning surveillance/workforce health, precision prevention/well-child/family health passport, mental wellbeing/PHQ-9/stepped care, behaviour change/lapse/habit). Results were limited to repos created on or after 14 Oct 2026 (the challenge launched 15 Oct). READMEs were then fetched from raw.githubusercontent.com or the API for 85 candidates. Code search was not used, since it needs authentication. Web searches (devpost, LinkedIn, YouTube, press) found **no** public competitor posts: the results were press releases for the launch and pages about the separate, earlier MIT Solve "Future Health Challenge". The YouTube demo links below come from the repo READMEs.

**Confidence labels:** **C** = confirmed (the README or description names the Future Health challenge, hack2skill, or a statement number/title). **P** = probable (the wording closely matches a statement, or it targets Abu Dhabi, but the challenge is not named). Repos that the search returned but that belong to other events (ITU AI for Good UAE, GenAI Works, PromptWars, "CareLoop Clinics No-Show Guard" course capstones, NASA Space Apps) are excluded.

---

## 1. Every competitor repo found

| # | Repo | Ch. | Conf. | Created | One-line approach |
|---|---|---|---|---|---|
| 1 | https://github.com/zayed-alshuaiby/rafiq | C01 | C | 2026-11-10 | "Rafiq / رفيق" male reproductive health navigator (no README) |
| 2 | https://github.com/SanchitKRai/future-health-male-triage | C01 | C | 2026-10-23 | "LOC": rules-first anonymous men's-health triage (Streamlit, later React) with an XGBoost + TreeSHAP "second opinion" trained on simulated data; every question can be skipped |
| 3 | https://github.com/hitanshuac/masar-amanah-health | C01 | C | 2026-10-29 | "Masar Amanah": Bayesian differential-diagnosis graph plus a 5-gate self-triage, a Gemini rephraser, a FHIR bundle and "pseudonymized Malaffi timelines" |
| 4 | https://github.com/Barath-kanth/futurehealth | C01 | C | 2026-11-12 | "SeedShield": EN/AR triage ladder from self-care to urgent, wearables, a consent vault, 7 Gemini agents on GCP, a synthetic fairness layer |
| 5 | https://github.com/ashfaque-rifaye/alarzah | C01 | C | 2026-11-15 | "Alarzah": PWA with a red-flag interrupt, deterministic rules R1–R7, a clinician console, a published test suite with Wilson intervals, fairness, AR/EN |
| 6 | https://github.com/sanyog2005/FutureHealthPrototype | C01 | P | 2026-11-14 | Private front door for men: user/doctor/admin panels, AI guide, doctor chat, Google Meet scheduling |
| 7 | https://github.com/Marc-Dvci/Silah | C03 | C | 2026-10-19 | "Silah": couple check → counselling → birth → family; Gemma 4 offline, sentence-checked plain language, AR, DoH Responsible-AI clause map, film and live demo |
| 8 | https://github.com/YaduvanshiHimanshunfsu/Future-Health-Digital-Innovation-Challenge | C03 | C | 2026-10-30 | "Samvid": "numbers from code, words from AI"; risk engine, family sharing with consent, counsellor and programme screens (Next.js + FastAPI) |
| 9 | https://github.com/PraveenAShukla/clara | C03 | C | 2026-11-15 | "Clara: private help for inherited risk" (no README) |
| 10 | https://github.com/DivineTechie/silsila | C03 | C | 2026-11-17 | "Silsila": consent-led cascade testing of relatives, an exact Bayesian engine, no AI-written text to families, counsellor check, "Silsila-Bench" for LLM trust (Next.js + FastAPI) |
| 11 | https://github.com/Kunal-Dafuq/Wadih | C03 | C | 2026-10-27 | "Wadih": genetic-screening education, consent management, navigation to counselling |
| 12 | https://github.com/Workwithclare/GeneClarity | C03 | C | 2026-11-09 | "GeneClarity": mobile-first carrier-result explainer for couples, with a route to counselling (Vite/React) |
| 13 | https://github.com/BoxCoding/wiqaya-future-health | C04 | C | 2026-10-24 | "Wiqaya": finds care gaps across 41.7k synthetic people in 12k households and fills each centre's weekly slots by benefit; Gemini multi-agent copilot; fairness gate; Cloud Run |
| 14 | https://github.com/s28066226-max/basira | C04 | C | 2026-11-02 | "Basira": ranks by the value of early detection, not raw risk; same appointment budget as age/sex rules; equity floor; minimum data to Gemini (Next.js) |
| 15 | https://github.com/Tehzeb/velotech-lifecourse-360 | C04 | C | 2026-11-14 | "LifeCourse-360": consent-gated life-course engine for Well-Child Visits and adult screening, calibrated risk, one family visit, AR/EN/UR outreach, runs locally at $0 |
| 16 | https://github.com/bbahat/caretrail | C04 | C | 2026-11-15 | "CareTrail": family screening passport (IFHAS + Well-Child), consent changes the reasons live, programme view with small-cell suppression, Merkle data-use log, AR/EN |
| 17 | https://github.com/ayeritedw/ebiegberi-mesh | C04 | C | 2026-11-05 | "Ebiegberi Mesh": precision prevention with "$0 hardware" (thin README) |
| 18 | https://github.com/MSAbhishek22/opd-triage-lens | C04/C05 | C | 2026-11-11 | Deterministic 4-colour symptom triage for Indian OPDs (34 rules); off-target for Abu Dhabi |
| 19 | https://github.com/kirkjaa/nodal-screen | C04 (+C06) | C | 2026-11-13 | NODAL M1 3D-camera gait screen → Well-Child pathway; workplace "Strain Watch" variant (hardware) |
| 20 | https://github.com/burakomics/Burak-Abu-Dhabi-Screening- | C04/C05 | P | 2026-11-04 | "POC for Abu Dhabi screening" (empty README) |
| 21 | https://github.com/BKDKUBO/loopcloser | C05 | C | 2026-10-17 | "LoopCloser": CSV import, rules route each case, a pass/hold gate before contact (consent, phone, owner, red flag), Day 2–14 escalation ladder, Gemini call guide (draft only), Google Cloud |
| 22 | https://github.com/ravinperera/careloop | C05 | C | 2026-10-20 | Synthetic-data screening-to-care workflow (no README) |
| 23 | https://github.com/priyamsinghjhs/kareshafaa | C05 | C | 2026-10-22 | "KareShafaa": FIT/HPV/mammogram/HbA1c cases with one owner, SLA and escalation; a "Needs you now" queue, no-show risk, best channel and time, coordinator copilot; insurance and card-blocking aware; live on Render |
| 24 | https://github.com/Mizore66/wasl-futurehealth | C05 | C | 2026-10-23 | "Wasl": cross-provider Arabic↔Latin record linkage (name encoder + HNSW), dual-reader closure (DoH rules + local Gemma), Learn-then-Test bound on false closures, 7 loop types (Go/NATS/Python) |
| 25 | https://github.com/DevDaring/Future_Health_Digital | C05 | C | 2026-10-24 | "WASL": bring-your-own results, chat writes back to the case, uplift (T-learner) call ranking, back-translation check, PII firewall, SimPy policy twin, 7 languages, FHIR |
| 26 | https://github.com/Agnuxo1/loopshield | C05 | C | 2026-10-29 | "LoopShield": owner, deadline and closure per result, plus on-premises PHI masking before any LLM (PHI reaching the model cut from 100% to 12.9%); pre-registered experiments |
| 27 | https://github.com/DesignMaster-Solutions/loop-closer | C05 | C | 2026-10-30 | "Loop Closer": a 9-state pathway, a coordinator queue (escalated → rejected → overdue → unassigned), HL7 v2 ORU and FHIR in, SMS reply moves the case, Cloudflare Workers, YouTube demo |
| 28 | https://github.com/11716807/itmam | C05 | C | 2026-11-03 | "Itmam": closes IFHAS/EAS results (told → owned → booked → seen → verified) with a rules-first import harness (Ingest…Explain) plus loop-assist agents; Cloud Run |
| 29 | https://github.com/ossolola/careloop | C05 | C | 2026-11-03 | CareLoop using HIE results plus the patient's insurance network to route referrals; follows up until attendance |
| 30 | https://github.com/solidfdn/careloop | C05 | C | 2026-11-03 | SOLIFAN (Japan): source-linked decisions; re-review only the confirmations affected when a report is corrected; Gemini Q&A; Cloud Run; YouTube demo |
| 31 | https://github.com/Nandish3010/screening-closure | C05 | C | 2026-10-18 | Named owner, clock, audit trail and clinician-signed closure; FIT simulation anchored to the 30.5% Abu Dhabi audit; CI on every PR |
| 32 | https://github.com/suhail39ahmed/rabt-care-loop | C05 | C | 2026-11-11 | "Rabt": abnormal FIT → cashless in-network option → one-tap booking → coordinator board; human-in-the-loop gates, golden-case benchmark; Azure (APIM + Foundry), Next.js + FastAPI |
| 33 | https://github.com/MrT-coder/screening-loop | C05 | C | 2026-11-13 | Positive FIT → FHIR `Task` with owner, due date, audit, closure; staff dashboard and patient chat |
| 34 | https://github.com/candicewu0515/loop-screening-to-care | C05 | C | 2026-11-13 | "Loop": synthetic FIT screening-to-care prototype (no README) |
| 35 | https://github.com/Haleem5150/careloop | C05 | C | 2026-11-14 | CareLoop: 4 patient profiles, named owners, due dates, closure only with evidence or a clinician decision; GitHub Pages |
| 36 | https://github.com/Rajpatel7878/Carebridge-ai | C05 | C | 2026-11-14 | "CareBridge AI": report review, explainable prioritisation, referrals (React + FastAPI; mostly planned) |
| 37 | https://github.com/seyifagoroye/LoopGuard | C05 | P | 2026-11-18 | "LoopGuard": escalation layer above Abu Dhabi infrastructure with a "Verified Care Handoff" for patients who ignore alerts |
| 38 | https://github.com/srj7042/CareLoop | C05 | P | 2026-10-24 | 10-step loop tracking with role portals (patient, coordinator, clinician, specialist, admin) |
| 39 | https://github.com/aymaw/careloop | C05 | P | 2026-10-29 | Referral state machine: agent proposes provider, reviewer approves, closure needs a completion receipt |
| 40 | https://github.com/mithrahamsika/TRACE-Care | C05 | P | 2026-11-07 | Barrier-aware coordination (transport, cost, language) for screening follow-up |
| 41 | https://github.com/Maureen13-d/CareLoop | C05 | P | 2026-11-14 | Patient navigation for smartphone and basic phone; Kenya framing (may be another event) |
| 42 | https://github.com/ayisha-codes/CARECONNECT-AI | C05 | P | 2026-11-14 | Multilingual follow-up and screening-result tracking (thin README) |
| 43 | https://github.com/wijaywi/careloop | C05 | P | 2026-11-18 | Offline E1–E9 event ledger, A/B simulator; each result is an "open obligation" |
| 44 | https://github.com/abdulahmed1127-cyber/Sauti-Tri-Sense | C06 | C | 2026-11-05 | Nigeria: Hausa voice reports + Whisper + Isolation Forest, a phone-camera water-strip reader, worker module; Lovable demo |
| 45 | https://github.com/satiricalguru/Canary | C06 | C | 2026-11-06 | "Canary": environmental watch + aggregate clinic/workplace confirmation, alert explanation, owner + human review, small-cell suppression (Next.js), narrated MP4 |
| 46 | https://github.com/minasami/meds-signals | C06 | C | 2026-10-18 | Egypt: aggregate pharmacy signals → medicine-shortage and unusual-demand early warning |
| 47 | https://github.com/haldejoan16609/Health-Signal-Nexus | C06 | C | 2026-11-17 | "Nexus EarlyWatch": multi-signal health, environmental and workplace early warning |
| 48 | https://github.com/ananthchellooss-cloud/SentinelPulse | C06 | P | 2026-11-15 | Population and workforce early-warning platform; Abu Dhabi monitoring areas; Open-Meteo ingestion |
| 49 | https://github.com/DrAhmed7887/hack-future-health | C06 (heat) | C | 2026-11-08 | "Heat Shift Planner": labelled C06 but a heat product; rule tested on real heat hospitalisations, crew plan, "cool first" red card; regulator sees zones only |
| 50 | https://github.com/ArhamAzad2004/health-early-warning | C06 | P | 2026-10-27 | Statement-worded: multi-signal detection, back-tested alerts, role views (Dubai demo) |
| 51 | https://github.com/FANGxPC/munzir-early-warning-system | C06 | P | 2026-11-03 | "Munzir": environmental telemetry + syndromic data fusion; mentions Malaffi and DECIDE-AI |
| 52 | https://github.com/DimuthuYapa/BioVane | C06/C07 | P | 2026-11-10 | Micro-climate and shift-fatigue anomaly grid for outdoor and industrial workforces |
| 53 | https://github.com/ThatoNthodi/Zanti-heat-demo | C07 | C | 2026-10-24 | "Zanti Heat": single HTML file; WBGT vs crew limit, 5-tier alert, isiZulu/Sesotho/Setswana, offline gateway, sensor-fail margin |
| 54 | https://github.com/ThatoNthodi/hews-v2 | C07 | P | 2026-11-05 | Same team: multi-agent heat early warning on Azure AI Foundry, tamper-evident audit |
| 55 | https://github.com/mk-tdev/heatline | C07 | C | 2026-11-05 | "Heatline": 3D playable rehearsal site, 186-day real-weather back-test near Saadiyat, telemetry API (ISO 7243), 7-language fixed alerts, "Noor" AI trend watcher |
| 56 | https://github.com/victorchengwei/seaguard-heatwatch | C07 | C | 2026-11-05 | "SeaGuard": ADOSH Thermal Work Limit + watch HR; fail-safe rules; 12 languages; 52-case benchmark; Cloud Run + Azure mirror |
| 57 | https://github.com/Mariyah52/heatguard | C07 | C | 2026-11-06 | "HeatGuard": live weather per site, WhatsApp alerts, "feeling unwell" escalation, feed-cut fallback, 2025 back-test, language fairness (FastAPI) |
| 58 | https://github.com/anshurajbisoyi98-ctrl/heatmitra | C07 | C | 2026-11-07 | "HeatMitra": forecast + task + clothing + acclimatisation → hourly work/rest instruction; 2025 Abu Dhabi back-test (Node) |
| 59 | https://github.com/NipunDilshanSenevirathne/Bardan | C07 | C | 2026-11-08 | "Bardan": every heat rule becomes an evidenced task; anonymous "this didn't happen"; 72-h Liljegren WBGT + CP-SAT plan; kidney-care vault; 577 tests; EN/AR |
| 60 | https://github.com/sidharthunni/thermalpulse-uae | C07 | C | 2026-11-09 | "ThermalPulse": ISO 7933 PHS + PSI, offline-first PWA, supervisor heatmap, OSHAD compliance hub |
| 61 | https://github.com/Youssef123ya/Future-Health-Digital-Innovation-Challenge | C07 | C | 2026-11-10 | "Zill": weather + task + clothing + optional wearable + symptom check-ins → 4 levels with a concrete action; guided 2-min demo |
| 62 | https://github.com/Rameen07304/heatsignal | C07 | C | 2026-11-14 | "HeatSignal": WBGT + AQI + UV compound index for 101 cities, 7-day forecast, AI-written alerts (city-level, not worker-level) |
| 63 | https://github.com/m-bloomcodes/Resilia | C07 | P | 2026-11-05 | Solar-assisted smart-helmet heat monitor for UAE construction (simulated hardware) |
| 64 | https://github.com/ragul-123-bit/HeatShield | C07 | P | 2026-10-27 | "AI-powered heat-stress early warning prototype for outdoor workers" (one-line README) |
| 65 | https://github.com/teamcerebrospark/MemBrain | C08 | C | 2026-11-14 | Team Cerebrospark entry (no README) |
| 66 | https://github.com/jackhu24-ship-it/phantom-grid-abudhabi-future-health | C08 | C | 2026-10-31 | "PHANToM GRID": EEG theta/beta + P300 "sub-microsecond" MCI kernel (buzzword-heavy, realigned from another project) |
| 67 | https://github.com/dnqduy0611-source/neurobaseline | C08 | C | 2026-11-11 | "NeuroBaseline": 4 phone tasks, personal baseline, RCI status light, habits check-in, clinician view; no build step; 88 unit tests |
| 68 | https://github.com/bhawuk-arora/brainbaseline-cdss | C08 | C | 2026-11-17 | "BrainBaseline": EN/AR RTL, Empirical-Bayes baseline + RCI + CUSUM drift, 5-gate safety pipeline, IFHAS pilot plan (Next.js + FastAPI) |
| 69 | https://github.com/rahulrao85/nafas | C09 | C | 2026-11-03 | "Nafas": CPAP adherence loop; detects lapse and leak, names the barrier, one BCT-tagged step, banked nights never reset; 160 labelled test cases |
| 70 | https://github.com/RecovaIT/Recova-H2S | multi (C05/C07/C08/C09-ish) | C | 2026-11-12 | "Recova": one six-agent engine, four tracks (relapse prevention, IFHAS loop, cognitive baseline, WorkSafe heat with k-anonymity); FastAPI; DECIDE-AI |
| 71 | https://github.com/victrvondoom/Future-Health-Digital-Innovation-Challenge | ? | C | 2026-11-02 | Empty repo |
| 72 | https://github.com/bustedbars/FHDIC-ARIDAQ-ENGINE | ? | C | 2026-11-11 | Title-only README |
| 73 | https://github.com/Washzen-Vibe/Flan-Backend | ? (C10?) | C | 2026-11-16 | "Backend logic for Flan chatbot used in FHDIC" (no README) |
| 74 | https://github.com/uniquedev200/Prodrome | ? | P | 2026-11-11 | "Agent made for the future health hackathon" (no README) |

Adjacent but **excluded**: https://github.com/Shashwat-srivastav/ResultRelay-UAE (ITU hackathon, critical lab-result relay; closest analogue to C05), https://github.com/fatenasaad/riaya (GenAI Works hackathon), https://github.com/Growinggiant576/Sovereignguard and https://github.com/SumitU1/miqyas-itu-hackathon (ITU UAE). The ~60 "CareLoop Clinics No-Show Guard" repos are an IIT Roorkee/Masai course capstone, not competitors. The searches independently re-found all 11 repos listed in the brief (rows 1, 5, 10, 19, 27, 33, 35, 44, 62, 65, 69).

---

## 2. Count per challenge and density estimate

| Ch. | Confirmed | + Probable | Public total | Est. share of all submissions* | Crowding verdict |
|---|---|---|---|---|---|
| C01 Male reproductive | 5 | 1 | 6 | ~9% | Medium |
| C02 Reproductive potential | 0 | 0 | **0** | ~2–4% | **Very low** |
| C03 Inherited disease risk | 6 | 0 | 6 | ~8% | Medium |
| C04 Precision prevention | 7 | 1 | 8 | ~11% | Medium–high |
| C05 Screening-to-care loop | 16 | 7 | **23** | **~25–30%** | **Most crowded, by far** |
| C06 Early warning | 5 | 3 (+1 heat-labelled) | 9 | ~10% | Medium (half of it is really heat) |
| C07 Climate worker heat | 9 | 3 (+DrAhmed, BioVane) | 12–14 | **~15–18%** | **Second most crowded** |
| C08 Brain health | 3 | +Recova track | 4 | ~6% | Low–medium |
| C09 Healthy behaviours | 1 | +Recova track | 1–2 | ~4–6% | **Low publicly** |
| C10 Mental wellbeing | 0 | Flan? | 0–1 | ~6–10% | **Underrepresented on GitHub, not in reality** (see below) |
| Unknown | 3 | 1 | 4 | | |
| **Total** | **~55** | **~17** | **~74** | | |

\*Shares come from the public sample with corrections for behaviour (below), not from organiser data.

**How many submissions in total?** Public GitHub repos are a small fraction of a hack2skill field. Many teams keep repos private (the T&Cs say IP stays with the team and code "may be requested"), build in Lovable/Replit/Bolt without GitHub, or submit only decks. hack2skill events of this profile (global, USD 105k prize, three-and-a-half-week window) typically draw a few thousand registrations and roughly 150–500 real prototype submissions. If ~74 repos are public, a 10–25% public rate implies **about 300–700 submissions**, and **C05 alone probably has 75–200 entries**. Several repos have "review round" notes ("Review round (November 2026)", "after the review feedback of 17 Nov", "Prevent mode (added 18 Nov, reviewer feedback)"). This suggests hack2skill ran a mentor or preliminary review, and the most serious teams are iterating hard in the last 72 hours.

**Why C05 and C07 are crowded (behavioural reasoning):**
- **C05** is a pure workflow problem. It needs no ML data, maps onto a familiar CRUD + state machine + dashboard pattern, and the statement reads like a spec (owners, SLAs, closure). The sessions also leaned into it: closed loop with insurance networks, assigned family physician, Malaffi. LLM coding agents produce a convincing case tracker in a day. That makes it the default pick for strong solo engineers and for agencies. Repo naming collides constantly (CareLoop ×6, LoopCloser/Loop Closer ×2, WASL/Wasl ×2).
- **C07**: free weather APIs (Open-Meteo) + the WBGT formula + multilingual alerts give a visible, demo-friendly product, and back-tests on real weather are easy. The ADPHC OSH speaker invited "quick, hands-on" employer tools. Even C06 entries drift into heat (DrAhmed7887 labels a heat planner as C06).
- **C04** draws teams that took the session's "family passport / Sahatna" signal literally (CareTrail, LifeCourse-360, Wiqaya).
- **C03 and C01** draw Gulf-culture-aware teams. C03 entries are unusually high quality (Silah, Silsila, Samvid each have heavy evidence packs).
- **C10** is the classic hackathon default (a mental-health chatbot). We found none publicly. That is more likely a search artefact (generic names like "MindCare", entries without FH branding, no-code builds) than real absence. Expect a mid-sized but **low-quality** field: chatbots without validated instruments, stepped navigation or human crisis escalation.
- **C02** (longitudinal reproductive potential, not a score) and **C09** are conceptually harder and lack an obvious demo hook. These are the genuinely thin fields. C08 is thin and polarised: one serious RCI-based entry (bhawuk-arora) and one buzzword entry.

---

## 3. The predicted "80% default build" per challenge

What four out of five entries in each statement will look like, judging from the READMEs.

- **C01:** an anonymous symptom/risk questionnaire wizard with red-flag rules → a 5–6-rung triage ladder (self-care → GP → andrology/urology → fertility → urgent). EN/AR toggle, a "screening ≠ diagnosis" banner, an LLM rephraser, an optional XGBoost/SHAP "second opinion" on simulated data, sometimes a clinician console. Stack: React/Vite or Streamlit, Gemini.
- **C02:** (inferred, no public sample) a "fertility score" dashboard from age/AMH/lifestyle inputs. That is exactly what the statement forbids.
- **C03:** carrier/couple-risk calculator (Mendelian 25% maths) + an LLM plain-language explainer with a checker + consent toggles for sharing with relatives + a "book genetic counsellor" button. Next.js + FastAPI, Arabic via machine translation.
- **C04:** logistic-regression or GBM risk on a synthetic population → a ranked outreach list + per-person "why flagged" factors + a family/household view + LLM-drafted invitations in AR/EN/UR, sometimes a fairness gate. Claim: "same slots as age/sex rules, more findings."
- **C05:** FIT-positive (sometimes + mammogram/HbA1c/HPV) → case object with owner, SLA clock and status pipeline → coordinator queue sorted by overdue/escalated → mock SMS/WhatsApp patient message with reply buttons → closure only with evidence + hash-chained audit. LLM drafts messages ("AI drafts, humans decide"). FHIR Task/DiagnosticReport in. Next.js/React + FastAPI, Gemini or Azure.
- **C06:** two or three synthetic signal streams (clinic visits, absenteeism, weather/pharmacy) → rolling z-score / Isolation Forest / CUSUM anomaly → map dashboard with an alert card, an owner and a "human review" button; small-cell suppression asserted.
- **C07:** Open-Meteo forecast → WBGT (Stull/Liljegren) adjusted for workload, PPE and acclimatisation → 4–5-tier alert + work/rest minutes → multilingual worker message (often WhatsApp) + supervisor crew board + "I feel unwell" escalation + offline fallback + a back-test of the 2025 summer.
- **C08:** 3–4 phone cognitive tasks (reaction time, symbol matching, recall) → personal baseline → RCI / z-score traffic light → clinician view and a risk-factor checklist; EN/AR.
- **C09:** habit plan + streaks + lapse detection + LLM coach messages tagged with a BCT; "no reset after lapse" claimed.
- **C10:** an LLM chatbot "companion" + a PHQ-9/GAD-7 form + a crisis-keyword banner with a hotline number + a list of counsellors.

Common to all of them: **synthetic data, a "not a medical device" banner, deterministic rules with an LLM only narrating, Gemini or Azure OpenAI, a judge-mode guided tour, a live demo on Cloud Run/Render/GitHub Pages/Vercel.** By 20 Nov, "rules decide, AI explains, people decide" is table stakes and no longer a differentiator.

---

## 4. Requirements competitors' READMEs consistently ignore (exploitable gaps)

These counts come from a keyword scan of 60+ substantial READMEs. Some repos may cover a point in docs/ rather than the README, but judges read the README and demo first.

1. **Sahatna as the delivery channel.** Only 5 READMEs even mention Sahatna (Recova, CareTrail, Masar Amanah, Rabt, ossolola). None shows a credible embed path (mini-app / SMART-on-FHIR launch / deep link spec) for the patient app the ADPHC experts named as the adoption target.
2. **Assigned family physician as the loop owner.** Only 3 mention a family physician (kareshafaa, LoopShield, screening-closure). Routing the flagged case to the patient's assigned family physician was an explicit session ask.
3. **Insurance-network-aware routing (Thiqa vs expat schemes).** Only about 5 address it (kareshafaa, Rabt "cashless in-network", ossolola, CareTrail, BrainBaseline). Most C05/C01/C04 referral steps ignore which providers the patient can actually use.
4. **Replacing the insurance-card-blocking lever with participant-driven motivation.** Only 2 READMEs mention card blocking (kareshafaa, Silsila). Nobody frames their product as the measurable alternative the experts said they want ("Is this what we want going forward? No").
5. **P2C and C2C consultation inside the loop (C05).** Only 4 mention patient-to-clinician or clinician-to-clinician consults (Wasl, Loop Closer, Rabt, kareshafaa, wijaywi). Most loops stop at "book appointment".
6. **Drop-off reasons and rejected/unassigned referrals as first-class measures.** Many entries have an overdue queue. Few report drop-off-reason taxonomies or "rejected referral" handling (Loop Closer is the exception).
7. **Fairness and subgroup reporting outside C04/C06.** Of the 10+ C05 repos, only kareshafaa, Wasl and WASL report gaps by language or nationality. In C07, only HeatGuard does a language-fairness check. C10 requires fairness across nationality and language, and nobody public addresses it.
8. **Granular, revocable consent that visibly changes behaviour.** Only ~10 READMEs mention revocation. CareTrail is the standout ("switching consent off updates the reasons at once"). It is mandatory in C02, C03, C10 and C01.
9. **A published safety benchmark with hard cases (emergency detection, missing/wrong inputs).** Inception and Microsoft asked for "100% emergency detection" plus documented edge cases. Only Nafas (160 cases, 110 hard), SeaGuard (52 cases), Alarzah (live test suite with Wilson CIs), Itmam (n=12) and Rabt (golden cases) publish one. Everyone else asserts "deterministic" without showing numbers.
10. **Calibration and false-reassurance metrics.** C02 requires them, C04 and C08 ask for calibration/sensitivity/specificity, and C08 asks for false-referral burden and test-retest. Outside Basira, LifeCourse-360 and BrainBaseline, almost nobody reports calibration curves or the false-reassurance rate.
11. **Small-cell suppression outside C06.** Only C04/C06 entries mention it (Canary, CareTrail, Wiqaya, LifeCourse-360, meds-signals). C05 programme dashboards and C07 supervisor views mostly ignore it.
12. **DECIDE-AI reporting.** Only 4 READMEs cite it (LoopCloser, Silsila, Munzir, Recova), even though the Inception speaker named it.
13. **Wearables the programme already collects** (sleep, HR, VO2max, SpO2, RR, steps). Only 9 READMEs use them. None of the C05/C09/C10 entries use passive wearable signals for lapse or risk detection.
14. **Coordinated physical + mental care (C10) and a family journey across members (C04).** Only CareTrail, LifeCourse-360 and Wiqaya do households. Nobody public links mental-health screening into the physical-care loop.
15. **Honest Arabic.** Many claim Arabic. Most admit machine translation "awaiting native review" (Silsila, Samvid, Zanti). A native-reviewed Arabic UI plus Emirati-dialect input handling would stand out.
16. **The whole of C02 and C10, and most of C09.** These fields are effectively empty in public. C02's "longitudinal change, not a score" plus non-discrimination is a framing nobody has demonstrated.

**Bar-raisers to beat where we compete** (the strongest public entries): Wasl (Mizore66) and kareshafaa for C05; Bardan, Heatline and SeaGuard for C07; Silah and Silsila for C03; CareTrail and Basira for C04; Alarzah for C01; BrainBaseline and NeuroBaseline for C08; Nafas for C09; Canary for C06.

**Implication.** Entering C05 or C07 means competing against 75–200 entries, several with live Azure/GCP deployments, back-tests, video and 500+ tests. The best odds per unit of effort are in **C02, C09, C10 and C08**, or in C04 framed around Sahatna + family physician + insurance + participant-driven motivation. Whatever we choose, items 1–4 and 9 of the gap list should be explicit, visible features in the demo and README.
