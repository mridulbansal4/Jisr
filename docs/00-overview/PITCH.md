# Pitch
> Project: Jisr (جسر, "bridge") · Owner: Pitch lead (Product lead) · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](PROJECT_BRIEF.md) · [Vision](VISION.md) · [Hackathon plan](HACKATHON_PLAN.md) · [PRD](../01-product/PRD.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [AI evals](../04-ai/AI_EVALS.md) · [Responsible AI](../04-ai/RESPONSIBLE_AI.md) · [GTM](../07-business/GTM.md) · [Impact](../07-business/IMPACT.md)

**Rules for everyone who presents:**
- One persona: Mariam. Her story is told twice: first the pain, then the magic.
- Show, don't tell. About 75 seconds of the 3 minutes is the live product.
- Lead with value, not features. Don't open with scale.
- Never quote a number we haven't produced. Anything marked `[[…]]` is filled from `EVAL.md` or the simulation run on the day. If the run didn't produce it, say nothing.
- Say "simulated on synthetic data" every time a simulated result is on screen.
- Refer to session speakers **by role only**. Names in the transcripts are unverified.
- Never claim diagnosis, therapy, a Malaffi FHIR API, an Inception health product, or use of Jais unless we really use it.

---

## 1. The 3-minute script
Structure: villain → hero → live demo → "one more thing" → ask. Method: "poke the pain, then sprinkle the magic" (Microsoft Innovation Hub session). Speaker A presents and narrates. Speaker B drives the laptop.

| Time | Slide / screen | Spoken (target ~420 words in total) |
|---|---|---|
| **0:00–0:25** | S2: Mariam | "This is Mariam. She's 27, Emirati, and works for the government. At her IFHAS check her anxiety score comes back 13 and her depression score 11. She gets a note that says *please see a specialist*. She doesn't know if it's serious. She doesn't know who to call, or whether Thiqa covers it. And her biggest fear: will her employer find out? Six weeks later she still hasn't booked." *(Pause. Let it land.)* |
| **0:25–0:45** | S3: The silent drop-off | "That's the villain: **the silent drop-off after a positive screen**. Abu Dhabi has done the hard part. There's the DoH standard of care, IFHAS screening, 1,930 trained family physicians and the crisis lines. Yet the C10 statement itself names a *continuing conversion gap between a positive screen and timely specialist follow-up*. Every KPI in this challenge (hand-off, waiting time, symptom change, crisis response, fairness) sits **after** the screen. That's where people disappear." |
| **0:45–1:00** | S4: Jisr | "Jisr means *bridge*. It turns every positive screen into an episode with a step, an owner, a deadline and a closure. **The rules decide, a clinician confirms, and AI only explains.** And a crisis gate runs first, which no AI can override. Let me show you Mariam again." |
| **1:00–1:25** | LIVE: Mariam's app | "Same Mariam, same scores. Jisr explains what her result means, and what it *doesn't*. Then it matches her: an **Arabic-speaking female clinician in her Thiqa network, a tele-session on Thursday. Nothing is shared with her employer.** Three taps and she's booked. The referral has an owner and an SLA clock." |
| **1:25–1:55** | LIVE: Crisis gate | "Now the moment that matters most. Please type what someone might really say." *(Judge, or B, types an indirect Arabic phrase.)* "Under a second. The gate is **deterministic**. The AI panel is locked out, emergency numbers are on screen, and a RED episode has landed in Khalid's on-call queue with a 15-minute clock running. An LLM in Jisr can *raise* risk. It can never lower it." |
| **1:55–2:10** | LIVE: Dr Salma | "Dr Salma has six minutes per patient. She sees one screen: Mariam's scores, her preferences and her IFHAS physical findings, each labelled as observed, calculated or AI-drafted. She confirms the step. She stays in charge of every clinical decision." |
| **2:10–2:25** | LIVE: Programme dashboard + EVAL | "For ADPHC: conversion and time-to-care against baseline, **simulated on synthetic data**, `[[X% vs Y%]]`. A fairness table by nationality and language, with small cells hidden. And our published benchmark: crisis recall `[[100%]]` on `[[N]]` adversarial Arabic, English, Arabizi and Urdu cases. `[[0]]` unsupported claims in validated AI text." |
| **2:25–2:40** | S8: One more thing | "One more thing. The episode engine doesn't know it's doing anxiety. Change the rule file and the same ledger runs **perinatal depression** follow-up and the **IFHAS memory-screen loop**. It's the loop layer for every screen Abu Dhabi runs." |
| **2:40–3:00** | S9: Path to pilot | "Our ask: a 12-week pilot with IFHAS positive screens at two or three primary-care centres, hosted in-country, launched from Sahatna, with referrals out through Malaffi. We'll measure hand-off within timeframe, time to first appointment, reliable improvement, crisis-response completion and fairness. Give us the sites and a clinical lead, and Mariam's six lost weeks become days." |

**Delivery notes.**
- *Poke:* hold the pause after "six weeks later". Don't rush to the magic.
- *Magic:* the same scores, said word for word, are what make the "twice" land.
- If the live demo is slow, B narrates the next beat and A keeps talking. Never apologise for more than four words.
- Clinical precision: Mariam's scores (PHQ-9 11, GAD-7 13) are **moderate**, so the step is **L2, family physician**, delivered as a tele-session because she prefers tele. Say "clinician", not "psychiatrist". See the brief inconsistency note in the [PRD](../01-product/PRD.md) OQ-03.

### One-sentence test
"We help **people who screen positive for anxiety or depression in Abu Dhabi** complete **a measured hand-off to the right level of care** using **their IFHAS or PHQ/GAD screening result, their preferences and their insurance network**, with a deterministic crisis gate in front of everything."

---

## 2. 30-second explainer
> Abu Dhabi now screens adults for anxiety and depression, but a positive screen too often ends with a printed note and silence. Jisr is the bridge. Every positive screen becomes an episode with a step, an owner, a deadline and a closure. The stepped-care rules pick the least intensive safe care, in your language and your insurance network. A clinician confirms. AI only explains, behind a validator. And a deterministic crisis gate runs first and gets a human on the line in minutes. ADPHC finally sees the numbers the challenge asks for: hand-off, time-to-care, improvement, crisis response and fairness.

---

## 3. Slide-by-slide outline (10 slides)
| # | Title | Content | Visual |
|---|---|---|---|
| S1 | **Jisr: from "you screened positive" to "you're in care"** | One-liner from the brief §1. Team names. C10 badge | Bridge wordmark (جسر), dark background |
| S2 | **Mariam** | 27 · Emirati · Thiqa · government employee · Arabic-first. GAD-7 13, PHQ-9 11. "Who do I call? Is it covered? Will work find out?" Six weeks, no booking. (Illustrative persona; scores fictional) | One portrait, one printed note. No charts |
| S3 | **The silent drop-off** | The statement quote on the conversion gap [2]. The funnel: screen → *gap* → care. The statement's KPIs, all to the right of the gap. 16.3% moderate-to-severe on PHQ-9 in an Abu Dhabi adult sample [3] | Funnel with the gap in red |
| S4 | **Rules decide · Clinician confirms · AI explains** | Crisis Gate (first, deterministic) → Step Matcher L0–L4 → Warm hand-off + SLA → Measurement (RCI) → Closure with evidence. The LLM sits beside it, explain-only, raise-only | Pipeline with gate badges (Mermaid in [ARCHITECTURE](../03-engineering/ARCHITECTURE.md)) |
| S5 | **LIVE DEMO** | Switch to the browser. The slide only shows the URL and "Judge Mode" | Full-bleed URL + QR code |
| S6 | **Proof, not promises** | `EVAL.md` table: crisis recall `[[…]]`, false-positive rate `[[…]]`, step-matcher agreement `[[…]]` on `[[N]]` cases, validator `[[0]]` unsupported claims. The three content types. Governance: DoH Responsible AI Standard, Federal Law 2/2019 Art. 13, synthetic data only, licence table | Benchmark table screenshot |
| S7 | **Built on Abu Dhabi's rails** | IFHAS result (FHIR `QuestionnaireResponse`) → Jisr → Sahatna launch (stub) · Malaffi HL7 v2 REF (adapter design, Circular 144/2026) · Azure UAE North / Core42 + in-country LLM for v1. "No Malaffi FHIR API is claimed" | Rails diagram |
| S8 | **One more thing** | The same episode engine with a new rule file: perinatal depression (EPDS-based screen, rule file to be written) · IFHAS memory-screen loop (memory testing from age 50 [1]) · any "screen → loop" pathway | Three lanes on one ledger |
| S9 | **Path to pilot: our ask** | See §6 | Cohort / sites / 12 weeks / KPIs / what DoH provides |
| S10 | **Thank you** | Live link · credentials in the submission · repo · `EVAL.md` · contact | QR codes |

---

## 4. Demo script (exact clicks)
**Setup (T−10 min):**
1. Laptop on mains power. Notifications off. Browser zoom 110%. Two tabs: tab 1 = live link `/judge`, tab 2 = local fallback `http://localhost:3000/judge` (already running, see §4.3).
2. Phone hotspot on and paired as the second network.
3. Backup video open in a paused player on the second desktop.
4. Hit the warm-up endpoints so the API container isn't cold: `GET /v1/providers`, then `POST /v1/auth/demo-login`. The Render free tier sleeps.
5. Judge Mode → **Reset demo data** (re-seeds the personas; RED queue empty).

The UI labels below are the spec. The frontend must use these exact strings so the script and the build match (see [UI_SPEC](../02-design/UI_SPEC.md)).

### 4.1 The main path (≈75 s)
| Beat | Click / action | What judges see | Fallback if it fails |
|---|---|---|---|
| D1 Mariam's result | `/judge` → **Start guided tour** → persona card **Mariam** → **Continue as Mariam** | Imported IFHAS result (badge *Observed*: "IFHAS result, imported"). Scores GAD-7 13, PHQ-9 11 (*Calculated*). Card **"What this means / What it doesn't"** (*AI-drafted*, or *Template* if the LLM is off) | If the explanation spinner passes 3 s, the template appears automatically (M-03). Say "this is the no-AI template; same facts" |
| D2 Match | **See my options** | Recommended step **L2 Family physician** with factor chips: Moderate symptoms · Arabic · Female clinician · Thiqa network · Tele · Wait 2 days. Top match card: "Arabic-speaking female clinician · Thiqa · Tele-session Thursday" | Directory is seeded locally in the API, so this never needs an external call |
| D3 Book | Tap 1 **Choose this clinician** → tap 2 **Share my summary with this clinician only** (consent sheet; the employer line reads "Your employer: never. There is no employer access in Jisr") → tap 3 **Request booking** | Confirmation: "Request sent. A care coordinator owns this. You'll hear back within 2 working days." Timeline shows `STEP_RECOMMENDED → REFERRED` with an SLA timer | If booking errors, open **Timeline** to show the referral created. The API is idempotent, so a retry is safe |
| D4 Crisis gate | Tap **I need help now / Type how you feel** (free-text box). Hand the keyboard to the judge, or type: `تعبت من كل شي وما ابي اصحى بكره` ("I'm tired of everything and don't want to wake up tomorrow"). Arabizi alternative: `ta3abt mn kl shy w mabi as7a bukra`. **Send** | In < 1 s: red full-screen card **"You're not alone. Talk to someone now"** with buttons **999**, **800-SAKINA (800 725462)**, **800-HOPE (800 4673)**. The AI panel greys out with the label **"AI locked: crisis pathway"**. Latency badge, e.g. "Gate: 38 ms" | The gate is local and deterministic, so it works with no LLM and no Wi-Fi to Gemini. If the judge's phrase doesn't fire, say: "That's exactly why we publish a failure log." Show the `EVAL.md` failure section, then type the scripted phrase. **Never** pretend it fired |
| D5 Khalid's queue | Role switcher (top right) → **Khalid · On-call** | RED episode at the top. A **15:00** countdown running. **Acknowledge** button | Pre-seeded RED episode exists in case D4 was skipped |
| D6 Dr Salma | Role switcher → **Dr Salma · Family physician** → Mariam's row → **Summary** | One screen: scores + trend (*Calculated*), preferences (*Observed*), IFHAS physical context, e.g. HbA1c, BMI (*Observed*, shown only with consent), AI-drafted summary (*AI-drafted*, editable). **Confirm step L2** | If the summary LLM fails, the template is shown. Confirm still works (deterministic) |
| D7 Programme | Role switcher → **Programme lead** → **Dashboard** | Funnel, time-to-care, follow-up, RCI improvement, crisis response; banner **"Simulated on synthetic data"**; **Baseline vs Jisr** toggle; fairness table with cells shown as "<10" | Simulation results are precomputed and cached (`data/synthetic/sim_results.json`), so the dashboard never waits on a live run |
| D8 Evidence | Tab: repo `EVAL.md` (or `/judge/eval`) | Benchmark table + failure log | Screenshot on S6 |

### 4.2 If time is short (90-second cut)
D1 → D2 → D3 → D4 → D7. Skip D5, D6 and D8, and mention them in one line.

### 4.3 Fallback plan
| Failure | Detection | Action (who) | What we say |
|---|---|---|---|
| Gemini down, slow or quota exceeded | Explanation spinner > 3 s, or validator rejects | Automatic template fallback (M-03). Pre-emptively, Judge Mode → **Settings → AI narration: Off** sets `LLM_PROVIDER=none` for this session (B) | "Jisr is designed to run with no AI at all. The rules and templates carry the clinical content; AI only rephrases." Turn this into a strength |
| Venue Wi-Fi down | Page won't load | Switch to the hotspot (B, 15 s). If that fails, switch to tab 2: the **local stack** (`docker compose up` with SQLite + `LLM_PROVIDER=none`), started before the session | "We're running the same build locally; no patient data ever leaves this laptop anyway." |
| Render API cold or dead | `/v1/providers` > 5 s | Local stack (tab 2) | — |
| Laptop dies | — | Second laptop with the local stack; else the **backup video** (≤3 min, the same beats) | "Here's the recorded run of the exact build at the URL in our submission." Then offer the live link for hands-on later |
| Judge wants hands-on | — | Give them the device. Judge Mode credentials are on S10 and in the submission | — |

**Template-only mode** must be rehearsed at least once (see [HACKATHON_PLAN §8](HACKATHON_PLAN.md#8-rehearsal-schedule)). The whole demo must pass with `LLM_PROVIDER=none`.

---

## 5. Judge Q&A bank
Answers are short on purpose: say the first sentence, then stop. Numbers in `[[…]]` come from `EVAL.md` or the simulation. Never improvise a number.

### 5.1 ADPHC screening / head of screening (owners of IFHAS and the closed loop)
| # | Question | Answer |
|---|---|---|
| 1 | Who owns the episode after a positive screen? | A named care coordinator from the moment it opens. Every state transition has an owner and an SLA, and an overdue or unowned episode escalates automatically. |
| 2 | What does "closed" mean in Jisr? | Either an attended appointment plus a re-check, or an authorised clinician decision with a recorded reason. Nothing closes silently. |
| 3 | How do you handle insurance networks? | The Step Matcher filters providers by the person's plan (Thiqa vs expatriate Basic/Enhanced) before ranking. The person sees "in your network" as a visible factor. |
| 4 | How does this connect to IFHAS? | MVP: a seeded FHIR `QuestionnaireResponse` import (LOINC 44249-1 PHQ-9, 69737-5 GAD-7). v1: a feed via the IFHAS portal or Malaffi under DoH approval. |
| 5 | Will it live in Sahatna? | That's the target. MVP has a deep-link and launch stub; v1 is a Sahatna module. Sahatna's facility deadline is 30 Nov 2026 (Circular 170/2026). |
| 6 | How do referrals reach the receiving provider? | Internally as FHIR `ServiceRequest` + `Task`. Externally, the v1 design is HL7 v2 REF through Malaffi per Circular 144/2026. We don't claim a Malaffi FHIR API. |
| 7 | What happens if a provider declines? | `DECLINED_BY_PROVIDER` triggers re-matching to the next provider and alerts the coordinator. The SLA restarts visibly; it doesn't reset silently. |
| 8 | What if the person stops responding? | Reminders follow the consented channel. After the defined window, the episode moves to `LOST_TO_FOLLOW_UP`, the coordinator gets a task, and it counts in drop-off reasons. |
| 9 | Isn't this just C05 for mental health? | It uses the same closed-loop discipline, plus a crisis gate, stepped care and measurement-based step changes. Mental health also needs discretion and consent that C05 doesn't. |
| 10 | Does it add work for family physicians? | It's designed to remove work: one-screen summary, pre-filled referral, step suggestion. Minutes per hand-off is a pilot KPI. We'll measure it, not assume it. |
| 11 | How do you avoid coercion, like insurance-card blocking? | There are no sticks. Participation is voluntary, and the levers are clarity, network-matched choice and discretion. Opting out is a recorded, respected state. |
| 12 | Which instruments, and are they valid in Arabic? | PHQ-2/9 and GAD-2/7, as the DoH Standard of Care uses. Published Arabic validations exist; our Arabic and Urdu wording still needs native clinical review (R-04). |
| 13 | What's the re-check schedule? | Default 2 weeks after hand-off (configurable in the rule file), then at each step decision. The RCI decides whether change is real. |
| 14 | Can it show the programme how many positives were missed? | Yes. The funnel shows every state, including not-yet-contacted, declined and lost, with drop-off reasons. |
| 15 | How do you count "timely"? | Per-level target times in the rule file, agreed with ADPHC at kickoff. Our demo values are design assumptions. |
| 16 | Can the same thing serve expatriates? | Yes, and it must: Urdu UI, Arabic and English, low-literacy design, and expat insurance plans. Fairness is reported by nationality and language. |
| 17 | What about people screened outside IFHAS? | Any PHQ/GAD entry point can open an episode: the family physician, the self-screen in the app, or a referral. IFHAS is the pilot beachhead. |
| 18 | How do you stop gaming, e.g. inflating scores to jump the queue? | Steps above tele-mental-health need clinician confirmation. Scores are one input; the clinician sees the trend and context. |
| 19 | What do you need from ADPHC for a pilot? | Two or three PHC sites, a clinical lead, an on-call coordinator, approval for an IFHAS result feed, and in-country hosting approval. Details on the pilot slide. |
| 20 | How fast could you start? | Engineering is ready for a sandbox. The real lead time is approvals and native clinical review. We'd plan the 12 weeks to start after those, not before. |
| 21 | What does the programme dashboard show that we don't have today? | Conversion by state, time-to-care, follow-up completion, reliable improvement, crisis-response completion and subgroup fairness: the statement's KPIs, live. |
| 22 | Does it link mental and physical findings? | With consent, Dr Salma sees IFHAS physical context (e.g. HbA1c, BMI) next to the mental-health episode, so care is coordinated, not siloed. |

### 5.2 Inception applied scientists (agents, benchmarks, gates)
| # | Question | Answer |
|---|---|---|
| 1 | Who do you help, with what task, using what input? | People with a positive PHQ/GAD screen in Abu Dhabi; a completed hand-off to the right care level; using their screening result, their preferences and their insurance network. |
| 2 | Where exactly is the AI? | Two places only. M-01 writes plain-language text from structured facts. M-02 is an optional raise-only crisis signal. Scoring, gating, matching, RCI and SLAs are deterministic code. |
| 3 | Why not let the LLM triage? | Because a missed crisis is the fat-tail risk. A deterministic gate is testable to 100% on a known set; an LLM's behaviour on the next input is not. |
| 4 | Show me the benchmark. | `EVAL.md`: `[[N]]` crisis cases (direct, indirect, Arabizi, Urdu, negations, typos, adversarial), expected vs actual, error source, recall `[[…]]`, false-positive rate `[[…]]`, plus `[[M]]` step-matcher cases and validator tests. |
| 5 | How was the benchmark built? | Hand-written by the team, *before* tuning the lexicon where possible, with easy, tough, missing-input and contradictory cases. It's synthetic and stated as such; native-speaker review is pending. |
| 6 | Isn't 100% recall just overfitting to your own lexicon? | It can be, so we report it as recall *on this benchmark*, keep a held-out split, publish the failure log and treat every new miss as a new case. Recall on real language is a pilot question. |
| 7 | What's the false-positive cost? | A false RED shows emergency numbers and puts the episode in the on-call queue. That's a coordinator's minutes, which is acceptable versus a miss. FPR is reported, not hidden. |
| 8 | What does the claim validator check? | Every number, date, instrument name, provider and phone number in the LLM output must exist in the input facts. Banned claims (diagnosis, prognosis, medication) are rejected. Failure → template. |
| 9 | What if the LLM tries to say "you're fine"? | It can't change state, and a de-escalating claim is a banned pattern. Crisis turns never reach the LLM at all. |
| 10 | Prompt injection through free text? | Free text never changes state. It only feeds the deterministic gate and, after the gate, the raise-only classifier, which can add a RED flag but not remove one. |
| 11 | Missing inputs? | The engines ask back rather than guess: an incomplete PHQ-9 isn't scored, and item 9 missing is treated as "ask now". Irrelevant missing fields (e.g. a phone number) never block the flow. |
| 12 | Contradictory inputs, e.g. low score but a crisis phrase? | The crisis signal wins. RED overrides every step. |
| 13 | Per-agent reports? | Each engine writes an `EpisodeEvent` with inputs, rule version and output, so you can replay any decision. |
| 14 | Latency? | The gate is in-process string matching plus rules, in milliseconds. M-02 is switched off automatically if it exceeds 2 s. |
| 15 | Which model and why? | Gemini Flash via the Gemini API, for the hackathon, on synthetic data only, behind an `LLMProvider` interface. v1 switches to an in-country endpoint (Azure OpenAI UAE North or a self-hosted Arabic model) per Federal Law 2/2019. |
| 16 | Did you use Jais? | No, and we won't claim it. The provider interface makes an in-country Arabic model a configuration change; evaluating Jais 3 for Arabic narration is on the v1 list. |
| 17 | How do you compare with existing solutions? | Chatbots with a hotline banner don't measure hand-off; IAPT-style stepped care isn't localised to Abu Dhabi networks or languages. Competitor matrix in [COMPETITIVE_ANALYSIS](../01-product/COMPETITIVE_ANALYSIS.md). |
| 18 | Arabic dialect coverage? | The lexicon covers MSA, Gulf colloquial and Arabizi forms plus Urdu, all written by the team. Native clinical review is our first pilot task. |
| 19 | How do you test the UI flow? | Playwright end-to-end runs the five demo moments in CI; engines have unit tests for every branch. |
| 20 | Token cost? | Explanations are short and template-anchored. The cost per episode is in [COST](../05-ops/COST.md); the LLM can be switched off entirely. |
| 21 | What's the confidence when evidence is missing? | We don't show a confidence number. We show the factors and which ones are missing, and the clinician decides. |
| 22 | How do you version rules? | `packages/rules/*.vN.json` carries citations. Every decision stores the rule version (E-17) for audit and replay. |

### 5.3 MBZUAI academic (rigour, validity, reproducibility)
| # | Question | Answer |
|---|---|---|
| 1 | What's your reference standard? | For the gate: team-labelled crisis vs non-crisis utterances. For steps: the rule file's expected step per case, from PHQ-9/GAD-7 bands [8][9] and NICE CG123 [10]. Neither is clinical ground truth, and we say so. |
| 2 | Is the benchmark reproducible? | Yes. `cd ai/evals && uv run python run_evals.py` regenerates `EVAL.md` from versioned data, and CI fails if crisis recall < 100%. |
| 3 | Confidence intervals? | We report counts and Wilson intervals where the eval script computes them `[[…]]`. With N in the low hundreds, the interval is wide, and we say that. |
| 4 | Why RCI and not just thresholds? | Thresholds say where someone is; the Jacobson–Truax reliable change index says whether the change exceeds measurement error. Step changes need both. |
| 5 | Which reliability values feed the RCI? | Published test–retest/internal-consistency values for PHQ-9 and GAD-7, cited in the rule file. Arabic-specific values should replace them once confirmed. |
| 6 | Are your simulated conversion gains meaningful? | No. They show the mechanism, not the effect. They're **simulated on synthetic data** with stated assumptions. The effect is what the pilot measures. |
| 7 | How was the synthetic cohort generated? | Scripted demographics and PHQ/GAD trajectories, with every parameter and seed declared in `data/synthetic/README`. No real patient data. |
| 8 | Doesn't synthetic data make your fairness table meaningless? | For effect sizes, yes; for the machinery, no. It proves suppression and subgroup reporting work. Synthetic fairness artefacts are risk R-11. |
| 9 | Small-cell suppression rule? | Any cell with k < 10 is hidden, and complementary suppression stops back-calculation from totals. |
| 10 | Measurement invariance across languages? | Not established by us. Published Arabic validations exist; Urdu and cross-language invariance are open questions for the pilot's analysis plan. |
| 11 | What reporting framework? | DECIDE-AI for the early-stage clinical evaluation; TRIPOD+AI items where relevant. The mapping is in [RESPONSIBLE_AI](../04-ai/RESPONSIBLE_AI.md). |
| 12 | Model licence awareness? | The licence table covers the instruments (PHQ/GAD free; C-SSRS terms to verify, R-05), the datasets and the models. No non-commercial model sits in the product path. |
| 13 | Pilot design? | A pragmatic before/after with site baseline, or a stepped-wedge across 2–3 sites if ADPHC agrees. The analysis plan is pre-registered with ADPHC before go-live. |
| 14 | Primary outcome? | Completed hand-off within timeframe. Secondary outcomes: time to first appointment, reliable improvement, crisis-response completion, adverse events, and subgroup gaps. |
| 15 | Confounders? | Site, baseline severity, nationality, language, plan type and capacity are recorded and adjusted for. Seasonality (e.g. Ramadan, summer) is noted. |
| 16 | How do you handle item 9 = 1 ("several days")? | MVP routes any item 9 > 0 to RED, as a conservative choice we disclose. Whether item 9 = 1 should go to a same-day risk review is an open clinical question (PRD OQ-01). |
| 17 | Why not train a model on the episode data later? | Maybe in v2, for capacity forecasting, never for crisis clearance. Any model would need its own validation and reporting. |
| 18 | How is the LLM evaluated? | Validator pass rate, unsupported-claim count, readability, and a human review sample per language. We report rejections, not just passes. |
| 19 | Data provenance? | The provenance and licence table in [COMPLIANCE](../06-security-compliance/COMPLIANCE.md) lists every source. |
| 20 | What would falsify your thesis? | No improvement in hand-off within timeframe versus baseline, or a widening subgroup gap. Either result gets published. |
| 21 | Generalisability beyond Abu Dhabi? | The engine generalises; the rule file, lexicon, directory and insurance logic are local by design. |

### 5.4 Microsoft Innovation Hub (envisioning, persona, value, pilot)
| # | Question | Answer |
|---|---|---|
| 1 | What's the "how might we"? | How might we help someone who screens positive reach the right care quickly, despite stigma, confusion about where to go and fragmented pathways? |
| 2 | Why Mariam and not five personas? | She carries the biggest pain we can poke and the most magic we can show. Imran, our Urdu-speaking driver, is in the fairness story, not the pitch. |
| 3 | What's the value, in one line? | Mariam books the right care in three taps within days, and ADPHC can finally measure whether positive screens become care. |
| 4 | What's the business value beyond the pilot? | For programmes: measured conversion. For providers: fewer no-shows and wrong-level referrals. For payers: the least intensive safe care. See [BUSINESS_MODEL](../07-business/BUSINESS_MODEL.md). |
| 5 | Can it run on Azure? | Yes. It's a containerised FastAPI + Next.js stack on Postgres, so Azure UAE North is a deployment target, not a rewrite. The LLM interface already has an `azure_openai` provider. |
| 6 | Could it feed the Population Health Intelligence platform? | It produces aggregate, suppressed programme metrics and FHIR exports. A PHI feed is a v1 integration we'd scope with DoH; we don't claim it today. |
| 7 | Why should it be live and not a video? | It is live. The link and credentials are in the submission; the video is only a backup. |
| 8 | What's your path to pilot? | 12 weeks, IFHAS positive screens, 2–3 PHC centres, in-country hosting, Sahatna launch, KPIs agreed up front. See the ask slide. |
| 9 | Do you have an LOI? | Not yet, and we won't pretend. Our next step is the Future Health readiness assessment and a site conversation through the pathway. |
| 10 | What's the cost of doing nothing? | Screening spend that doesn't become care, people with moderate symptoms who wait and worsen, and crisis signals that reach nobody. We don't put a dirham figure on it without data. |
| 11 | How did you handle PII? | Synthetic data only; no real PII anywhere. The design minimises data, has no employer role, and keeps v1 hosting in-country. |
| 12 | Why will clinicians adopt it? | It saves them steps and keeps them in charge: one screen, pre-filled referral, and they confirm. We'll measure minutes per hand-off. |
| 13 | What did you build in this challenge vs before? | All of it was built for this challenge; no prior product. |
| 14 | What's the riskiest assumption? | That receiving providers will accept and act on referrals within SLA. The pilot tests acceptance rates and capacity first. |
| 15 | What if there isn't enough capacity? | The dashboard shows waiting-time pressure by level, and Jisr steers to the least intensive safe step. That's the planning data programme leads lack. |
| 16 | What does success look like at GITEX? | A pilot conversation with ADPHC and a site, not just a prize. |
| 17 | What's the user's emotional journey? | Uncertain and anxious, then understood ("what this means and doesn't"), then choosing (my language, my network, my privacy), then cared for (a named owner, a date). |
| 18 | How do you reach low-literacy users? | Short screens, icons, Urdu, read-aloud if time allows, and coordinator outreach by phone as a channel. |
| 19 | What's next after the pilot? | Scale across PHC, then the same engine for perinatal and memory-screen loops. |
| 20 | Why you? | We went where the field was empty and built the hard back half of the funnel, with a published safety benchmark. |
| 21 | Single biggest feature to cut if you had to? | Everything except the crisis gate, the step match, the hand-off ledger and the dashboard. That's the product. |

### 5.5 DoH regulator (AI governance, privacy, SaMD, residency)
| # | Question | Answer |
|---|---|---|
| 1 | Is this a medical device? | Intended use: care navigation and workflow support that applies published scoring rules, with a clinician confirming every step. It may still count as clinical decision support software, so we'd ask for a regulator determination during the readiness assessment rather than assume an exemption. Details in [MEDICAL_DEVICE](../06-security-compliance/MEDICAL_DEVICE.md). |
| 2 | Where is data processed? | Hackathon: synthetic data only, on Vercel/Render and the Gemini API, which has no guaranteed UAE processing. v1: in-country (Azure UAE North or Core42) with an in-country LLM or templates only, per Federal Law 2/2019 Art. 13. |
| 3 | Does any real health data touch Gemini? | No. Synthetic only. With real data, Gemini is switched off by configuration (`LLM_PROVIDER` ≠ `gemini`). |
| 4 | How do you align with the DoH Responsible AI Standard? | Human oversight (clinician confirms), transparency (labelled AI text), safety (deterministic gate, validator), fairness reporting, accountability (audit log, rule versions). The clause mapping is in [RESPONSIBLE_AI](../04-ai/RESPONSIBLE_AI.md); the clause numbers are still unverified. |
| 5 | Consent model? | Granular and revocable, stored as FHIR `Consent`, with the effect visible immediately, e.g. revoking physical-data sharing removes it from the clinician summary. |
| 6 | Can an employer or insurer see anything? | No individual data, ever. There is no such role in the data model. Programme views are aggregate with k < 10 suppression. |
| 7 | Third-party sharing? | None without DoH approval and the person's consent, in line with the DoH data-sharing circulars. |
| 8 | Audit? | Every read of an episode is logged (E-14), and the person can see their own access log (API-23). |
| 9 | Crisis handling responsibility? | The gate shows 999, 800-SAKINA and 800-HOPE immediately and creates a RED episode for a human on call with a 15-minute SLA. v1 needs a warm-transfer protocol agreed with the line operators. |
| 10 | What if Jisr is down during a crisis? | The crisis numbers are also static content in the client, so they display offline. Operationally, the pilot keeps existing pathways in parallel; Jisr adds to them, never replaces them. |
| 11 | Adverse-event reporting? | Adverse events are a first-class KPI and an incident process with named owners. See [RUNBOOK](../05-ops/RUNBOOK.md). |
| 12 | Who's clinically accountable? | The confirming clinician for step decisions and the on-call clinician for RED episodes, under site governance. Jisr records who decided what and when. |
| 13 | Ethics approval for the pilot? | Yes: we'd seek research ethics approval through DoH's process before any real data, as part of the pilot plan. |
| 14 | Cybersecurity? | Role-based access, encryption in transit and (v1) at rest, no PII in logs, threat model and secure SDLC. See [THREAT_MODEL](../06-security-compliance/THREAT_MODEL.md). |
| 15 | Data retention? | Minimal and time-limited by policy, set with DoH for the pilot; synthetic data is purged on demand. |
| 16 | How do you prevent the LLM giving medical advice? | It only rephrases structured facts. The validator rejects diagnosis, prognosis and medication claims, and anything not in the facts. |
| 17 | Are the instruments licensed? | PHQ and GAD are free to use. C-SSRS terms must be verified before deployment (R-05); the PHQ-9 item 9 trigger does not depend on it. |
| 18 | Discreet mode: isn't hiding the app a safety issue? | It's opt-in: neutral notification text and a quick-exit button, for people at risk from family or employer exposure. Crisis access stays one tap away. |
| 19 | How do you handle minors? | Out of scope for the pilot: IFHAS is 18–75. Minors would need their own consent and safeguarding design. |
| 20 | Over-claiming? | We label every simulated result, make no efficacy claims, and publish failure logs. |
| 21 | Change control for rules? | A rule change bumps the version, cites its source, re-runs the benchmark in CI, and requires clinical sign-off before deployment in v1. |
| 22 | AI Clinician Framework alignment? | Clinicians stay the decision-makers; AI output is labelled, editable and never final. We'd map to the framework's specifics during readiness. |

### 5.6 Commercial judge (buyer, pricing, scale)
| # | Question | Answer |
|---|---|---|
| 1 | Who pays? | The economic buyer is the public programme: ADPHC/DoH mental-health and screening budgets. Next come provider networks (SEHA/PureHealth, M42, private groups) and payers (Daman, which administers Thiqa). |
| 2 | Pricing model? | A free 12-week pilot, then a per-enrolled-episode SaaS fee plus a platform fee per site. The exact AED figures are hypotheses to validate, labelled as such in [FINANCIALS](../07-business/FINANCIALS.md). |
| 3 | Why per episode? | It aligns price with the thing buyers care about (people moved into care), not seats or messages. |
| 4 | Do providers pay you per referral? | No. Pay-per-referral would bias matching. Matching stays need- and capacity-based and auditable. |
| 5 | What about employers? | Only as sponsors of access for staff, with aggregate uptake reports suppressed at k < 10. No individual data, ever. It's not our beachhead. |
| 6 | Market size? | We won't give a TAM we can't source. The serviceable market starts with IFHAS positive screens in Abu Dhabi; ADPHC holds the volumes. |
| 7 | What's your moat? | Localised, benchmarked safety assets (lexicon, rules, eval), integration into Abu Dhabi rails, and an outcome ledger that improves matching. The code is copyable; validated localisation and trust aren't. |
| 8 | Competition? | Chatbots and wellbeing apps at the front of the funnel; existing helplines and screening platforms. We sit behind them and make their screens convert. |
| 9 | Isn't government sales slow? | Yes. That's why we use the Future Health pathway: readiness assessment, incubation, pilot. We'd also apply to DoH and Abu Dhabi innovation programmes (HealthX, Hub71; to verify). |
| 10 | What does the pilot cost DoH? | Our build effort is free during the pilot; DoH provides sites, a clinical lead and in-country hosting approval. Hosting costs are in [COST](../05-ops/COST.md). |
| 11 | Gross margin? | Software with low marginal cost per episode; the LLM can be off. Real margin depends on in-country hosting and support costs. See the assumptions in FINANCIALS. |
| 12 | Team and funding? | 2–4 people today. We'd seek incubation support through the Future Health pathway; funding needs are in FINANCIALS. |
| 13 | How do you scale beyond Abu Dhabi? | A rule file, directory, language pack and insurance logic per jurisdiction, hosted in-country each time. |
| 14 | What could make a payer buy? | Evidence that the least intensive safe step and earlier care reduce avoidable escalation. That's unproven, and the pilot must measure it first. |
| 15 | Customer acquisition cost? | For B2G it's sales time and pilot effort, not ads. We model it as months of team effort per contract (assumption). |
| 16 | Biggest commercial risk? | A single buyer and long cycles. Mitigation: a platform engine that serves several screening programmes under the same buyer. |
| 17 | What about the IP? | It stays with the team per the challenge rules. Rules cite public guidelines; the benchmark and lexicon are our own work. |
| 18 | Would you open-source? | Possibly the crisis benchmark, as shared safety infrastructure. The integration and operations layer stays commercial. |
| 19 | Revenue from tele-MH providers? | Integration and capacity-listing subscriptions at most, never ranking boosts. |
| 20 | What's year-one revenue? | Pilot year: zero by design. We give no revenue figure before a pilot result. |
| 21 | Why will the buyer renew? | Because the dashboard shows conversion, time-to-care and fairness every week, so they can see what they're paying for. |

---

## 6. Path-to-pilot ask (slide S9)
| Item | Proposal |
|---|---|
| **Cohort** | Adults (18–75, Thiqa, per IFHAS eligibility) with a positive anxiety or depression screen at IFHAS, who consent to Jisr |
| **Sites** | 2–3 ADPHC-nominated primary-care centres (e.g. SEHA/AHS PHC centres; HUNCH, to confirm with ADPHC) |
| **Duration** | 12 weeks live, after approvals and native clinical review of Arabic and Urdu content |
| **Size** | All consenting positive screens at the sites over 12 weeks. N to be estimated with ADPHC from site screening volumes (no public per-centre figures) |
| **Primary KPI** | Completed hand-off within timeframe (north star; definition in METRICS) vs site baseline |
| **Secondary KPIs** | Median days to first appointment · follow-up re-check completion · reliable improvement (RCI) · RED episodes acknowledged within 15 min · adverse events · drop-off reasons · subgroup gaps (nationality, language, gender, age; k ≥ 10) · clinician minutes per hand-off · user trust (short survey) |
| **Safety stop rules** | Any missed crisis escalation → pause and review. Any privacy incident → pause |
| **What DoH/ADPHC provides** | Site access + a named clinical lead + an on-call coordinator rota · approval for an IFHAS result feed (or a manual export) · in-country hosting approval (Azure UAE North / Core42) · DoH research ethics route · a Sahatna deep-link slot · provider directory, network and capacity data · native Arabic/Urdu clinical reviewers · a crisis-line coordination contact (800-SAKINA) |
| **What we provide** | The platform, configuration, training (1 hour per role), weekly KPI reports, a pre-registered analysis plan and a final report |
| **Decision at week 12** | Scale across PHC · iterate · stop, on pre-agreed thresholds |

---

## 7. Co-creator angle (there are no separate sponsor prizes)
| Co-creator | What resonates | What we can honestly say |
|---|---|---|
| Microsoft | Deployable in a UAE region; feeds the population layer; BXT-style persona → pain → value → pilot | "Container-ready for Azure UAE North; `azure_openai` provider built into the interface." Don't claim a PHI integration |
| Inception42 | Gated pipeline, deterministic scoring, benchmark, Arabic output | "Gates first, LLM last, benchmark published." No Jais claim unless used |
| MBZUAI | Rigour, reproducibility, licences | "One command regenerates `EVAL.md`; licence table; DECIDE-AI mapping" |

## Sources
Numbered sources follow [PROJECT_BRIEF.md § Sources](PROJECT_BRIEF.md#sources). Session-method phrases ("poke the pain, sprinkle the magic", "one persona", "never demo a video", path to pilot, the one-sentence test, the who/task/input line, benchmarks for the safety-critical agent, deterministic scoring separate from LLM narration, observed/calculated/AI-generated separation, model licences) come from the four organiser-session transcripts summarised in `docs/research/research/A-organisers-judges.md`. Speakers are referred to by role only.
