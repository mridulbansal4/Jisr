# Medical Device (SaMD) Position
> Project: Jisr · Owner: Clinical lead + Regulatory owner · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Compliance](COMPLIANCE.md) · [Risk register](RISK_REGISTER.md) (R-10) · [Responsible AI](../04-ai/RESPONSIBLE_AI.md) · [AI evals](../04-ai/AI_EVALS.md) · [PRD](../01-product/PRD.md) · [Pitch](../00-overview/PITCH.md)

Tags: **[V]** primary source checked · **[S]** secondary · **[U]** unverified · **[K]** well-known reference. **No official EDE guidance on software / SaMD qualification was found on 2026-11-18**; everything about UAE classification below is from secondary sources and needs confirmation with the regulator or a UAE regulatory consultant before any pilot.

## 1. Summary
- **MVP (hackathon):** a prototype on synthetic data, not placed on the market, not used on patients. Its intended use is written (§3) as **non-diagnostic care navigation and administrative pathway tracking, with clinician decision support whose basis the clinician can review**. On that intended use we assess it as **unlikely to qualify as a medical device**, with one honest caveat: the **Crisis Gate** (§4.2).
- **v1 (pilot and beyond):** once used with real patients to drive triage and step recommendations, Jisr **probably qualifies as SaMD** under a risk-based regime like the UAE's. Plan for a qualification opinion from the Emirates Drug Establishment (EDE), a QMS, and registration in a moderate class, rather than argue it away (§6).

## 2. UAE regulatory frame
| Item | Finding | Tag |
|---|---|---|
| Law | Federal Decree-Law No. 38 of 2024 on Medical Products, Pharmacy Profession and Pharmaceutical Establishments; in force 2 Jan 2025; executive regulations still awaited per some commentators | [S] |
| Regulator | **Emirates Drug Establishment (EDE)**. Medical-device services (classification of a medical product, marketing authorisation, manufacturer registration, vigilance, advertising licences) transferred from MOHAP; transfer described as complete by late 2025 | [S] |
| Software in scope | Commentators say "medical devices" are defined to include software, with classification-based registration | [S] |
| Classes | Risk-based; one guide says four classes (I–IV), with "clinical decision support applications" given as an SaMD example and "AI-driven critical care decision support" as Class IV; another describes a three-class FDA-like scheme. **Conflicting** | [U] |
| Exempt (per guides) | Wellness apps, administrative software, general patient-education tools without diagnostic capability "typically" do not need approval | [S] |
| Alignment | Guides say UAE rules track EU MDR / FDA approaches, so EU MDR Rule 11 and IMDRF SaMD categories are used below as **reasoning aids**, not as UAE law | [S] |
| Abu Dhabi overlay | DoH Responsible AI Standard (2025) and DoH AI Clinician Framework (Oct 2026) govern **use** of AI by DoH-licensed entities; they do not replace EDE device rules | [S] |

## 3. Intended-use statement (MVP)
> **Jisr (MVP prototype) is a care-navigation and pathway-tracking software for adults (18+) in Abu Dhabi who have completed a standard, validated mental-health screening questionnaire (PHQ-2/PHQ-9, GAD-2/GAD-7).**
>
> It (a) scores the questionnaires using the published scoring rules; (b) explains, in plain language, what a score band means and does not mean; (c) proposes a stepped-care service level (L0–L4) using a transparent, versioned rule table whose inputs and reasons are displayed in full to a licensed clinician, **who decides and confirms every step**; (d) helps the person and care team book, track and close a referral, with deadlines and reminders; and (e) **always displays emergency contact information and notifies a human** when a person's answer or text contains a possible crisis indicator, **or when the crisis check itself cannot complete** (fail-closed). A care coordinator may acknowledge such an alert and record contact attempts; only a licensed clinician may close it.
>
> Jisr **does not** diagnose any condition, does not determine whether a person is or is not at risk of suicide, does not recommend or adjust medication, does not deliver therapy, and does not replace clinical assessment. Its outputs are not intended to be relied on as the sole basis for any clinical decision. In the hackathon it uses synthetic data only and is not for clinical use.

**Claims we will not make** (copy, pitch, README, store listing): "diagnoses depression/anxiety", "detects suicide risk", "predicts", "clinically validated", "reduces suicide", "AI therapist", "safe to wait". Allowed: "helps people reach the right level of care", "tracks every hand-off", "the crisis gate always shows help and alerts a human", "crisis recall 100% on our synthetic benchmark" (with the word *synthetic*).

## 4. Function-by-function qualification analysis
Reasoning aid: IMDRF SaMD risk framework (significance of information: *treat/diagnose*, *drive clinical management*, *inform clinical management* × state of condition: *critical*, *serious*, *non-serious*) [K], and EU MDR Rule 11 [K].

| Function | Medical purpose? | MVP reading | v1 reading |
|---|---|---|---|
| F-01 questionnaire administration + standard scoring | Arguably no: an electronic form of a public-domain instrument with fixed arithmetic | Not a device on its own (comparable to an e-form) | Same, but combined with F-05 it feeds decisions |
| F-04 plain-language explanation (templates + validated LLM) | Education, no individual diagnosis | Patient education; validator blocks diagnostic claims | Same; keep claims tight |
| F-05 Step Matcher (L0–L4 recommendation) | Yes: proposes a level of care for an individual | **Inform** clinical management, clinician confirms, full basis shown (like non-device CDS criteria where the professional can independently review the basis) | **Drive** clinical management if facilities use it as the default triage → device, IMDRF category II (serious, drive) [K] |
| F-03 **Crisis Gate** | It flags possible suicide risk: a **critical** condition | Positioned as **signposting + escalation to a human**: it can only add help, never clears risk, never states "not at risk", and fails closed (an error becomes RED + human review). C-SSRS items are behind `FF_CSSRS_ITEMS` (off). Still, this is the feature most likely to be read as triage | If relied upon as the facility's suicide-risk screening step → **drive** clinical management in a **critical** situation → IMDRF category III; EU MDR Rule 11 would put decision-informing software at **IIa or higher**, IIb/III if a wrong output could cause serious deterioration or death [K] |
| F-07/F-08 referral, ledger, SLA timers | Workflow/administrative | Not a device (administrative) | Not a device, but safety-relevant (missed escalation) → in hazard log |
| F-10 RCI step-up/down suggestions | Yes (monitoring of a condition) | Inform, clinician confirms | Drive/inform → part of the device scope |
| F-15/F-16 programme dashboard, simulation | Population statistics, not individual care | Not a device | Not a device |
| F-09 self-help modules | Wellness/education unless they claim to treat | Wellness content, no treatment claims | Keep as wellness; if marketed as treatment (digital therapeutic) → device |

**Conclusion (MVP):** with the intended use in §3, a prototype that is not marketed and not used on patients does not need EDE registration. We still behave *as if* the safety functions were device functions (hazard log, versioned rules, 100% crisis-recall gate in CI, change control), so the path to v1 is short.

## 5. Design controls already in the MVP (evidence we can reuse)
- Deterministic, versioned rules (`packages/rules`) with cited sources; LLM cannot change scores, steps or crisis status.
- Clinician confirmation required for every step (API-12) and for closing a RED episode (API-13); coordinators can only acknowledge (API-24) and log contact (API-25); full factor display.
- Fail-closed Crisis Gate: errors and timeouts are treated as RED.
- LLM use gated by the person's *AI-drafted summaries* consent; only de-identified structured facts are sent; off ⇒ templates.
- Crisis Gate evaluated in CI; recall must be 100% on the adversarial benchmark (`evals.yml`).
- Claim validator + template fallback; 0 unsupported claims in validated output.
- Append-only event log + audit log (traceability).
- Risk register R-01…R-12 = seed of an ISO 14971 hazard log.

## 6. What changes for v1
| Area | v1 action | Standard / reference |
|---|---|---|
| Qualification & classification | Request EDE classification ("classification of a medical product" service) or a written opinion via a UAE regulatory consultant; document the rationale | Decree-Law 38/2024; EDE services [S] |
| Intended use | Rewrite for the pilot: target users (adults, DoH facilities), users (clinicians, coordinators), environment, contraindications (under 18, acute presentations already in ED) | IEC 82304-1 [K] |
| Option A: keep out of scope | Strip "drive" behaviour: Crisis Gate becomes pure signposting (show numbers + notify human, no prioritisation logic beyond "human now"); Step Matcher stays clinician-facing with full basis | — |
| Option B (recommended): register as SaMD | QMS (ISO 13485), software lifecycle (IEC 62304, likely safety class B/C for the crisis path), risk management (ISO 14971), usability (IEC 62366-1), clinical evaluation (Arabic/Urdu PHQ/GAD validity literature + pilot data following DECIDE-AI), cybersecurity file (ADHICS + IEC 81001-5-1), PMS and vigilance reporting to EDE | [K] |
| Local presence | Manufacturer registration with EDE; UAE authorised representative if the manufacturer is foreign **[U]** | [S] |
| AI governance | DoH RAI Standard conformity; LLM stays explain-only; any change of model is a controlled change with re-run evals; consider whether an LLM-raised crisis flag (M-02) is a device function (it only adds escalations) | DoH RAI Standard [S] |
| Change control | Rule-file, lexicon or prompt change = design change: impact analysis, evals, clinical safety officer sign-off, version bump | IEC 62304 [K] |
| Post-market | Monitor M-02 raises, overrides of recommendations, SLA breaches, adverse events; report serious incidents to EDE per its vigilance rules **[U]** and to DoH per facility obligations | [S] |
| Claims & advertising | EDE advertising licence may be needed for medical-product advertising **[U]**; until then, no clinical-performance claims | [S] |

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-11-18 | MVP intended use fixed as in §3; claims list in §3 adopted for pitch and copy | Clinical lead + Product lead |
| Pre-pilot | Choose Option A or B after EDE/consultant opinion | Regulatory owner |

## Sources
- Federal Decree-Law 38/2024 (official text) — https://uaelegislation.gov.ae/en/legislations/2751/download
- Al Tamimi, key changes under Law 38/2024 — https://tamimi.com/news/the-new-era-of-pharmaceutical-regulation-in-the-uae-key-changes-under-federal-law-no-38-of-2024
- Baker McKenzie, new medical products law — https://insightplus.bakermckenzie.com/bm/healthcare-life-sciences/united-arab-emirates-enacts-new-pharma-law-to-boost-pharmaceutical-innovation
- RegDesk, MOHAP → EDE service transfer (Jan 2026) — https://www.regdesk.co/blog/uae-medical-device-regulatory-update-transfer-of-services-from-mohap-to-ede
- Muhami, SaMD regulation in the UAE (classes, exemptions; secondary) — https://muhami.ae/articles/samd-regulation-in-the-uae-a-quick-guide/
- IBA, AI in healthcare regulation in the UAE — https://www.ibanet.org/ai-healthcare-regulation-uae
- DoH AI Clinician Framework — https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide
- IMDRF SaMD risk categorisation (N12) — https://www.imdrf.org/documents/software-medical-device-possible-framework-risk-categorization-and-corresponding-considerations [K]
- EU MDR Annex VIII Rule 11 and MDCG 2019-11 (reasoning aid) — https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf [K]
