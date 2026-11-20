# Business Model
> Project: Jisr (جسر, "bridge") · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Vision](../00-overview/VISION.md) · [GTM](GTM.md) · [Financials](FINANCIALS.md) · [Impact](IMPACT.md) · [Pitch](../00-overview/PITCH.md) · [Cost](../05-ops/COST.md)

**Honesty rule.** No market sizes or prices below come from market data. Every AED figure is a **hypothesis** to validate in pilot conversations, and every one is labelled `ASSUMPTION`. Facts carry a source.

## 1. Lean canvas
| Block | Content |
|---|---|
| **Problem** | 1. Positive mental-health screens don't reliably become care; the C10 statement names the "continuing conversion gap" [2]. 2. People don't know where to go, whether their plan covers it, or who will see their data; stigma and fear of employer exposure stop them [2]. 3. Programme owners can't see hand-off, time-to-care, improvement, crisis response or fairness, the very KPIs the statement asks for [2]. |
| **Existing alternatives** | A printed "see a specialist" note; helplines (800-SAKINA, 800-HOPE) [7]; wellbeing apps and chatbots (front of funnel); SEHA's SAKINA screening platform (screens; no public cross-provider conversion ledger found, HUNCH); manual coordinator spreadsheets |
| **Customer segments** | **Economic buyer:** ADPHC / DoH mental-health and screening programmes. **Users:** people who screen positive (Mariam, Imran), family physicians (Dr Salma), coordinators and on-call clinicians (Khalid), programme leads. **Later buyers:** provider networks, payers, tele-MH providers, employers (aggregate-only sponsorship) |
| **Early adopters** | IFHAS positive screens at 2–3 ADPHC-nominated PHC centres; their family physicians and coordinators |
| **Unique value proposition** | *"Every positive screen becomes a completed, measured hand-off to the right level of care, with a crisis gate no AI can override."* For programmes: the statement's KPIs, live, with fairness. For people: the right care, in my language and network, in three taps, with nothing shared with my employer |
| **Solution** | Deterministic crisis gate → stepped-care matcher (L0–L4) → warm hand-off with owner + SLA → measurement-based step changes (RCI) confirmed by a clinician → programme dashboard with small-cell suppression. AI only explains, behind a validator |
| **Channels** | Future Health pathway (readiness assessment → incubation → pilot) [S29 in `docs/research/biblehackathon.md`]; GITEX 2026 (finalists); Sahatna module (citizen distribution); ADPHC programme channels; DoH innovation programmes (HealthX with startAD; to verify) |
| **Revenue streams** | B2G per-enrolled-episode SaaS + site platform fee after a free pilot; later B2B provider-network licences; payer outcome-linked contracts (only after evidence) |
| **Cost structure** | In-country hosting (Azure UAE North / Core42), LLM inference (optional; can be zero), clinical governance (advisor, native-language clinical review), security and compliance, integration engineering (Sahatna, Malaffi HL7 v2), support |
| **Key metrics** | North star: completed hand-off within timeframe. Plus time to first appointment, reliable improvement, RED acknowledged within SLA, adverse events, subgroup gaps (k ≥ 10), clinician minutes per hand-off ([METRICS](../01-product/METRICS.md)) |
| **Unfair advantage** | Localised, benchmarked safety assets (Gulf Arabic / Arabizi / Urdu crisis lexicon + published benchmark); rule files wired to the DoH Standard of Care; designed for Abu Dhabi rails (IFHAS, Sahatna, Malaffi HL7 v2 REF); an outcome ledger that gets better with every episode. Honest caveat: none of this is proven until the pilot |

## 2. Customer segments
| Segment | Who | Job to be done | Pays? | Priority |
|---|---|---|---|---|
| Public programme | ADPHC screening and mental-health programmes; DoH | Turn screening spend into measured care; report statement KPIs and fairness | **Yes: primary buyer** | Beachhead |
| Provider networks | SEHA (PureHealth group), M42 facilities, private groups (Mediclinic, Burjeel, etc.) | Fill the right appointments; fewer wrong-level referrals and no-shows; meet Sahatna/Malaffi obligations | Yes (v1+) | 2 |
| Payers | Daman (administers Thiqa; verify current arrangements), other insurers | Least intensive safe care; earlier care; fewer avoidable escalations | Later, evidence-gated | 3 |
| Tele-MH providers | Licensed UAE tele-mental-health services | Receive well-matched, consented referrals with context | Integration subscription only, never per referral | 3 |
| Employers | Large employers' wellbeing programmes | Offer staff confidential access to care | Sponsorship of access; **aggregate-only** uptake (k ≥ 10); **no individual data, no employer role** | 4 (careful) |
| Individuals | Mariam, Imran | Know what my result means; get the right care; stay private | **Never** (free at point of use) | Users, not buyers |

### The employer channel (read before selling)
The C10 statement names disclosure of sensitive data as a harm [2], and employer access is a landmine for this jury (`docs/research/biblehackathon.md`). If we ever sell to employers:
- they sponsor access only;
- they never get a role in the data model;
- they see k-suppressed aggregate uptake at most, never symptom scores, never per-team numbers below k = 10;
- the person is told in plain words that their employer sees nothing about them.

If any of that can't be guaranteed contractually, don't sell.

## 3. Value proposition by stakeholder
| Stakeholder | Gain | Pain relieved | Proof we'll collect |
|---|---|---|---|
| Person | The right step in days, in my language, in my network | Confusion, stigma, cost worry, fear of exposure | Hand-off rate, time to appointment, trust survey |
| Family physician | One-screen summary; pre-filled referral; step suggestion | 6-minute consults; unclear next steps | Minutes per hand-off; confirm-vs-override rate |
| Coordinator / on-call | A queue sorted by risk and SLA; RED episodes first | Lost referrals; untracked crises | RED acknowledged within 15 min; overdue count |
| Programme lead | The statement's KPIs live, with fairness | No visibility after the screen | Weekly KPI report |
| Payer (later) | Least intensive safe care | Wrong-level, late care | Step distribution; escalations (pilot data) |

## 4. Revenue streams and pricing hypotheses (AED)
| Stream | Model | Hypothesis | Status |
|---|---|---|---|
| Pilot | Free, 12 weeks | AED 0. DoH provides sites, clinical lead and hosting approval | Proposed in the pitch |
| B2G per-episode | Fee per *enrolled* episode (one per positive screen that consents), all states included | `ASSUMPTION` P_ep = AED 50–150 per episode. Validate against the programme's cost per screen | Hypothesis |
| B2G site platform fee | Per PHC site per year (support, configuration, dashboards) | `ASSUMPTION` P_site = AED 20,000–60,000 per site per year | Hypothesis |
| Provider-network licence | Clinician console + integration for a network's facilities | `ASSUMPTION` per-facility annual licence; priced after the pilot | Later |
| Payer outcome-linked | Bonus on agreed outcomes (e.g. hand-off within timeframe) | Only after pilot evidence; no figure | Later |
| New pathways | Same engine, new rule file (perinatal, memory-screen loop) | Priced like the per-episode stream | Later |

Pricing principles:
1. Charge for **episodes moved into care**, not for messages or seats.
2. **No pay-per-referral** from providers and no paid ranking. Matching must stay need- and capacity-based and auditable.
3. Never charge the person.
4. Outcome-based pricing only after the pilot shows a measured effect.

See [FINANCIALS](FINANCIALS.md) for the unit-economics formulas and scenarios.

## 5. Moat (Buffett + Thiel)
| Lens | Assessment |
|---|---|
| **Thiel: the secret** | Everyone builds the front of the funnel. All the statement's KPIs sit at the back [2]. Owning the hand-off ledger is the non-obvious position |
| **Thiel: monopoly in a small market first** | Beachhead = IFHAS positive screens in Abu Dhabi. Dominate the loop layer there before any expansion |
| **Buffett: durable advantage** | (a) *Switching costs*: once a programme's referrals, SLAs and KPIs run through the episode ledger and its Sahatna/Malaffi adapters, replacing it is costly. (b) *Intangibles*: a benchmarked Arabic/Arabizi/Urdu crisis lexicon and validated rule files, clinically reviewed. (c) *Data*: the outcome ledger (which step works for whom) improves matching and capacity planning |
| **Weaknesses (be honest)** | The code is copyable. Rules cite public guidelines. A single dominant buyer means concentration risk. The incumbents (SEHA SAKINA, Sahatna) could build this themselves. Our defence is speed, trust, published evidence and being easiest to integrate |

## 6. "Fintech hooks" (adapted)
Jisr moves no money and stores no payment data. The relevant hooks are payer workflow, not fintech:
- insurance-network eligibility as a matching factor (MVP: synthetic plan tags; v1: payer eligibility lookup under DoH approval);
- a FHIR export that a payer's pre-authorisation process could consume (v1, to scope);
- outcome-linked contracts (later, evidence-gated).

## 7. What would kill the model
| Risk | Signal | Response |
|---|---|---|
| Buyer won't pay per episode | Pilot debrief | Switch to an annual programme licence |
| Providers won't accept referrals within SLA | Pilot acceptance rate | Capacity-aware matching; escalate to the programme; renegotiate SLAs |
| An incumbent builds it | Sahatna roadmap | Offer Jisr as the engine inside it (white-label module) |
| Regulation classifies it as SaMD | Readiness assessment | Budget for the conformity route ([MEDICAL_DEVICE](../06-security-compliance/MEDICAL_DEVICE.md)) |

## Sources
Numbered sources follow [PROJECT_BRIEF.md § Sources](../00-overview/PROJECT_BRIEF.md#sources). The challenge pathway (readiness assessment → incubation/pilot/scale) comes from the challenge page and press release (`docs/research/biblehackathon.md` [S1][S29]). HealthX (startAD × DoH, regulatory sandbox and pilot proposals; details from secondary sources, **unverified for 2026**): https://www.mediaoffice.abudhabi/en/health/startad-and-department-of-health-abu-dhabi-launch-healthx-to-advance-abu-dhabi-as-global-biotech-and-life-sciences-hub/
