# F — Connecting the Dots (Patrick Jane [Blue] vs. Sherlock Holmes [Red])

Inputs: 01-facts, A-organisers-judges, B-context-and-data, E-competition, the 4 session transcripts.

## 1. The real underlying truth
This is not a generic "health AI hackathon". It is **DoH Abu Dhabi shopping for pilot-ready modules** that plug into rails it has already paid for:
- **Sahatna** (citizen app) — every facility must integrate by **30 Nov 2026** (Circular 170/2026).
- **Malaffi** (HIE) — must receive **all referrals as HL7 v2 REF messages** since **31 Aug 2026** (Circular 144/2026).
- **IFHAS** (adult screening) and the Well-Child Visit standard.
- **Population Health Intelligence** platform (DoH × Microsoft, GITEX 2025).

Al Mannaei, after the earlier MIT Solve challenge: "the priority now is to test and scale solutions in real-world settings". The prize is secondary; the **GITEX headline is a pilot/LOI**. (Jane: motive. Holmes: four circulars and a GITEX MoU history are the forensic trail.)

## 2. Hidden fears vs desired headlines
| They fear | They want to announce |
|---|---|
| Screening volumes rise but outcomes don't (CRC: only 30.5% of FIT-positives reach colonoscopy) | "AI closes the loop on every abnormal result in Sahatna" |
| Being seen as coercive (insurance-card blocking) | "Abu Dhabi raises screening uptake through family-centred, consent-first engagement" |
| PHI / genetic data leaks; cloud or out-of-country processing (Federal Law 2/2019 Art. 13; Circular 147/2022) | "Sovereign, privacy-by-design AI built on Abu Dhabi rails" |
| LLM hallucination in clinical paths; untested AI | "Benchmarked, clinician-governed AI aligned with the DoH Responsible AI Standard" |
| Worker-surveillance optics in heat programs (HRW critiques) | "Worker-first heat protection beyond the midday ban" |

## 3. Hidden evaluation criteria (what actually separates the top 3)
1. **Plugs into named Abu Dhabi rails** (Sahatna module, Malaffi HL7 v2/FHIR adapter, IFHAS/WCV rules, Thiqa network-awareness) — not just "integrable".
2. **Deterministic core + LLM narrator**, with the three content types visibly separated (observed / calculated / AI-drafted) — Dr Nance's explicit taste.
3. **A benchmark table** for the safety-critical step (e.g. 100% red-flag escalation on N adversarial cases) plus a failure-case log — Nabeel's explicit taste.
4. **Statement-specific metrics actually computed in the demo** (each statement lists its KPIs; the evaluators will tick them off).
5. **Small-cell suppression, subgroup fairness, calibration** — written into C04, C06 and C08 and almost universally skipped.
6. **Hands-on live demo with a guided judge mode** + backup video ("never demo a video").
7. **Path-to-pilot slide**: named cohort, site type, 12-week KPI, what DoH must provide.
8. **Licence and data-provenance table** (Synthea Apache-2.0, MIMIC demo ODbL, Open-Meteo CC BY, Arabic instrument licences; MoCA needs a licence → use A-RUDAS).

## 4. Landmines
- Claiming diagnosis; a "fertility score"; a "cognitive score" without a baseline; "AI replaces counsellor/clinician".
- Sending PHI to a non-UAE LLM in the architecture diagram without a residency note.
- Coercive nudges, employer access to individual worker or wellbeing data, measuring success by cancelled marriages (C03 explicitly forbids it).
- Digitising MoCA without a licence (licence infringement in front of the very people who use MoCA).
- Starting the pitch with "we'll scale to all UAE"; multiple personas; feature lists.
- Printing session speakers' names (unverified spellings) — refer to roles.
- Claiming a Malaffi FHIR API exists (none public) — say "HL7 v2 REF/ORU adapter + internal FHIR R4".

## 5. Dots nobody else will connect (each passed Jane's motive test + Holmes's evidence test)
1. **The insurance-block confession is a brief within the brief.** The C04 owner said on record that today's lever is blocking the insurance card after 3 SMS and "we're staying tuned to see what you bring". A solution that explicitly **replaces the stick** — and measures itself against it — answers the owner's personal pain. Nobody else will name it. (Evidence: transcript 57:29–58:10.)
2. **Circular 144/2026 turns C05 from a "tracker app" into an event-driven system.** Referral events already land in Malaffi as HL7 v2 REF. A loop-closer that consumes REF/ORU events and opens a FHIR Task per actionable result is *deployable*, not hypothetical. Competitors build CRUD trackers fed by forms.
3. **Sahatna's 30 Nov integration deadline lands ten days after submission.** "Ships as a Sahatna mini-module (deep link / SMART-on-FHIR-style launch)" matches exactly the moment DoH is pushing every facility onto Sahatna.
4. **Abu Dhabi heat policy uses TWL, not WBGT**, and the midday ban is **clock-based, not risk-based**. A C07 system that computes TWL/WBGT from forecasts and shows risk *outside* 12:30–15:00 and outside 15 Jun–15 Sep targets the real gap (HRW critique) using the regulator's own metric. Competitor HeatSignal uses WBGT only.
5. **Acclimatisation is the forgotten variable.** Newly arrived workers (first 7–14 days) carry most heat-illness risk; NIOSH RAL vs REL differ by acclimatisation. Crew rosters already know arrival dates. No competitor models it.
6. **C04 + C05 are one pipeline in the owners' heads.** The same ADPHC team presented them back to back and kept saying "closed loop". Submit to one statement, but show the hand-off (care gap → booked → result → loop closed) as the ecosystem story.
7. **MoCA licence trap → A-RUDAS opportunity.** MoCA digitisation and translations need Nasreddine approval; A-RUDAS is licence-free, validated in Arabic and less education-biased. This is precisely Dr Reem's "language, education, culture" worry. A C08 team using RUDAS plus confounder gating looks clinically literate.
8. **"Reversible first" is unclaimed in C08.** The statement says "investigate reversible causes"; Inception's reference demo focused on change detection. A deterministic reversible-cause gap finder (B12, TSH, depression, sleep apnoea risk, hearing/vision, anticholinergic burden) is cheap to build and clinically obvious to the ADPHC family physician presenting it.
9. **Inception's C08 session is a blueprint everyone will copy** → C08 becomes a "who copied Dr Nance best" contest judged by Dr Nance. Avoid it unless you have a real differentiator.
10. **Expatriate languages are a moat for C07/C06.** Abu Dhabi's outdoor workforce is largely South Asian. Safety-in-Heat materials already run in 6+ languages. A team fluent in Hindi/Urdu/Malayalam/Bengali/Nepali voice UX has specific knowledge most teams lack.

## 6. The 80% trap
- C05: a React dashboard listing patients with statuses + an LLM that writes reminder SMS (4+ public repos already).
- C08: a 12-agent copy of the Inception demo with a MoCA-like quiz.
- C10: an LLM wellbeing chatbot with a crisis keyword list.
- C09: a habit tracker with streaks and badges (streak reset is exactly what C09 forbids).
- C01: an anonymous symptom questionnaire + referral list.
- C07: a WBGT dashboard with red/amber/green and a wearable mock.
- Generic: "GPT summarises the patient", no benchmark, no subgroup metrics, no rails.

The council rejects all of these as primary builds.
