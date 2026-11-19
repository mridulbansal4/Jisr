# Competitive Analysis
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](PRD.md) · [Business model](../07-business/BUSINESS_MODEL.md) · [GTM](../07-business/GTM.md) · [Pitch](../00-overview/PITCH.md) · Source scan: `misc/research/E-competition.md` (C:\Projects\FutureHealth\research)

Two fields matter: (1) **the hackathon field** (other C10 entries, judged 20–30 Nov 2026) and (2) **the market** (what DoH / ADPHC could buy or already has). Funding and pricing were **not researched** for this document; any figure below is marked unverified, and the pitch must not quote it without checking.

## 1. Hackathon field (C10)
Method (from `misc/research/E-competition.md`): ~75 GitHub repository searches for repos created on or after 14 Oct 2026, plus README reads for 85 candidates and web searches, on 18 Nov 2026.

| Finding | Detail |
|---|---|
| Public C10 repos | **0 confirmed**; 1 possible: `Washzen-Vibe/Flan-Backend` ("backend logic for Flan chatbot used in FHDIC", no README) https://github.com/Washzen-Vibe/Flan-Backend |
| Estimated real C10 share | ~6–10% of an estimated 300–700 submissions (behavioural estimate, not organiser data) |
| Predicted default C10 build | "an LLM chatbot 'companion' + a PHQ-9/GAD-7 form + a crisis-keyword banner with a hotline number + a list of counsellors" |
| Table stakes by 20 Nov | Synthetic data, "not a medical device" banner, rules + LLM narrator, Gemini or Azure, Judge Mode, live demo. "Rules decide, AI explains" is **no longer a differentiator** |

**Adjacent public entries that set the bar** (could pivot or share judges' attention):
| Repo | Statement | Relevant strength | Gap vs Jisr |
|---|---|---|---|
| KareShafaa https://github.com/priyamsinghjhs/kareshafaa | C05 | Owner + SLA + escalation, insurance-aware, live on Render | Not mental health; no crisis gate or RCI |
| Loop Closer https://github.com/DesignMaster-Solutions/loop-closer | C05 | 9-state pathway, rejected/overdue/unassigned queue, HL7 v2 + FHIR in | Not mental health |
| Wasl https://github.com/Mizore66/wasl-futurehealth | C05 | Arabic↔Latin record linkage, bound on false closures | Not mental health |
| BrainBaseline https://github.com/bhawuk-arora/brainbaseline-cdss | C08 | EN/AR RTL, RCI + CUSUM, 5-gate safety pipeline, IFHAS pilot plan | Cognitive, not mental health |
| Nafas https://github.com/rahulrao85/nafas | C09 | 160 labelled test cases (110 hard) — the benchmark bar | Different statement |
| Alarzah https://github.com/ashfaque-rifaye/alarzah | C01 | Red-flag interrupt, deterministic rules, Wilson-interval test suite | Different statement |

**Gaps our scan found nobody filling** (from `E-competition.md` §4, items relevant to C10): fairness by nationality and language (required in C10, none public); coordinated physical + mental care (none public); insurance-network routing (~5 repos, none C10); Sahatna embed path (none credible); a published safety benchmark (only ~5 repos); drop-off reasons as a measure (rare); small-cell suppression outside C04/C06 (rare); honest Arabic (most machine-translated).

## 2. Market competitors and substitutes
| Product | Type | Region | What it does | Funding / price | Weakness vs C10 need |
|---|---|---|---|---|---|
| **Generic wellbeing chatbots** (e.g. Wysa, Youper) | AI chat + CBT exercises | Global | Conversational self-help; some include PHQ/GAD check-ins. Wysa reportedly received FDA Breakthrough Device designation (2022, **unverified here**) | Not researched | Front-of-funnel; no owned hand-off to Abu Dhabi providers; no insurance-network routing; LLM/chat in crisis turns is the harm C10 names ("weak crisis handling") |
| **Woebot** | AI chat | US | Rules-based CBT chatbot; reportedly closed its consumer app in 2025 (**unverified here**) | Not researched | Shows how hard sustained consumer engagement is; no care-pathway ledger |
| **Tele-mental-health marketplaces** (e.g. BetterHelp, Talkspace) | Therapist marketplace | US / global | Subscription therapy by video/chat | Not researched | Cash-pay, not network-aware for Thiqa/Basic; no stepped care; no link to IFHAS or family physician |
| **Regional online therapy** (e.g. Takalam — UAE; Shezlong — Egypt) | Arabic-language therapist booking | UAE / MENA | Book Arabic-speaking therapists online (details **unverified**) | Not researched | Marketplace, not a measured pathway from a positive screen; no crisis gate; no programme fairness reporting |
| **NHS Talking Therapies digital front doors** (e.g. Limbic Access) | AI-assisted referral and triage | UK | Self-referral chatbot into stepped-care services; Limbic Access reportedly UKCA Class IIa (**unverified here**) | Not researched | UK-specific pathways; not localised for Abu Dhabi networks, languages or rails; proves the stepped-care model has demand |
| **SEHA SAKINA platform + 800-SAKINA** | Public screening platform + helpline | Abu Dhabi | Screens depression, anxiety, perinatal depression, autism, dementia (per `misc/research/A-organisers-judges.md`); 800-SAKINA helpline | Public | No public evidence of a cross-provider conversion ledger (hunch, verify). **Jisr should integrate with it, not compete** |
| **Sahatna** | Patient super-app | Abu Dhabi | Appointments, teleconsult, Malaffi records, IFHAS, AI symptom checker; UAE PASS | Public | General app; no mental-health stepped-care loop visible. **Jisr is designed as a Sahatna module** |
| **Facility EMR referral + Malaffi REF** | Status quo | Abu Dhabi | Referrals sent as HL7 v2 REF (Circular 144/2026) | Existing | Records the referral, not whether the person reached care, improved, or was safe while waiting |
| **Printed "see a specialist" note** | Status quo | Abu Dhabi | What Mariam gets today (persona composite) | — | No owner, no deadline, no measurement |

## 3. Positioning map
X axis: **where the product acts in the funnel** (front = engagement/screening; back = completed, measured care). Y axis: **fit to Abu Dhabi rails** (generic global → Abu Dhabi-native: Thiqa/Basic networks, Sahatna, Malaffi, IFHAS, AR/UR). Placements are the team's judgement from public descriptions, not measurements.

```mermaid
quadrantChart
  title Positioning: funnel stage vs Abu Dhabi fit
  x-axis Front of funnel --> Back of funnel (completed care)
  y-axis Generic global --> Abu Dhabi native
  quadrant-1 Measured local care loop
  quadrant-2 Local front door
  quadrant-3 Global engagement apps
  quadrant-4 Global care pathways
  Jisr: [0.85, 0.85]
  SAKINA platform: [0.35, 0.8]
  Sahatna symptom checker: [0.2, 0.75]
  Default C10 chatbot entry: [0.15, 0.45]
  Wysa / Youper: [0.15, 0.15]
  BetterHelp / Talkspace: [0.5, 0.1]
  Takalam / Shezlong: [0.45, 0.5]
  Limbic Access: [0.6, 0.15]
  EMR referral + Malaffi REF: [0.6, 0.7]
```

## 4. Our moat (Thiel lens: what is true that others miss)
**The secret:** every C10 KPI is at the back of the funnel; competitors build the front. Owning the episode — step, owner, deadline, closure — is the defensible position.

| Moat layer | Why it compounds | MVP evidence |
|---|---|---|
| **Episode ledger data** | Every closed episode adds evidence on which step works for whom (language, gender, network) and real capacity/wait — the basis for better step matching and ADPHC capacity planning | Event log + metrics on synthetic cohort |
| **Safety evidence** | A published, growing crisis benchmark in AR / Arabizi / EN / UR, with recall 100% as a CI gate, is hard to reproduce quickly and is what judges and regulators ask for | `EVAL.md` (F-18) |
| **Rail integration** | Sahatna module + Malaffi REF + IFHAS feed + insurer networks: each integration needs DoH approval and time, and the first approved module becomes the default | Stubs + designs (F-19, API-19/20) |
| **Clinical governance** | Versioned rule file citing DoH standard and NICE CG123, owned by a clinical group, with clinician confirmation on every step: trust that a chatbot cannot claim | `packages/rules` with citations |
| **Language and culture** | Emirati-dialect and Arabizi crisis phrases, Urdu for the expat workforce, discreet mode for stigma: specific knowledge most teams lack | Lexicon + discreet mode (MVP machine-assisted; native review in v1) |

**Network effect (v1):** providers that accept quickly get more referrals; programme leads see capacity gaps by language/network and commission accordingly; more providers make the matcher better for persons.

## 5. Why others can't copy fast
| Competitor type | Why it is slow for them |
|---|---|
| Chatbot apps | Their product and metrics are built around conversation and engagement; removing the LLM from crisis turns and measuring hand-off completion means rebuilding the core and changing what they sell |
| Tele-MH marketplaces | Business model is cash-pay sessions on their own supply; neutral routing to the *least intensive safe* level (often a family physician or self-help) reduces their revenue |
| C05 loop-closer teams | They have the ledger pattern but not the mental-health safety layer (crisis gate, lexicon, raise-only LLM, RCI, discreet mode); in a 36-hour field that layer is the hard part |
| Public platforms (SAKINA, Sahatna) | Natural owners, but would build or buy; Jisr positions itself as the module they can adopt, not a rival |

## 6. Risks to this analysis
- The C10 field is likely **undercounted** on GitHub (private repos, no-code builds) (R-07). Assume several strong private entries exist.
- Market facts about named companies are unverified; verify before external use (owner: PL, by 2026-12-05 if finalist).
- SAKINA's capabilities are only partially public; if it already tracks conversion, reposition Jisr as its stepped-care and measurement layer.
