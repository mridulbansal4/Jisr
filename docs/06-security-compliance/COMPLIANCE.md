# Compliance
> Project: Jisr · Owner: Product lead (regulatory) + Clinical lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Privacy](PRIVACY.md) · [Medical device](MEDICAL_DEVICE.md) · [Security architecture](SECURITY_ARCHITECTURE.md) · [Risk register](RISK_REGISTER.md) · [Responsible AI](../04-ai/RESPONSIBLE_AI.md) · [Infrastructure](../05-ops/INFRASTRUCTURE.md) · [Runbook](../05-ops/RUNBOOK.md)

Tags: **[V]** primary source checked · **[S]** secondary (law firm, press) · **[U]** unverified or conflicting · **[K]** well-known reference. Laws change; every row is "where to look", confirmed only as far as the tag says. Not legal advice.

Context: MVP = hackathon prototype, synthetic data, no patients, no clinical use. v1 = supervised pilot inside DoH-licensed facilities.

## 1. UAE federal and Abu Dhabi requirements

| # | Instrument | Applies? | Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|---|---|---|
| L-01 | **Federal Law 2/2019 on ICT in Health Fields**, Art. 13 (+ Cabinet Res. 32/2020; ministerial resolution listing exceptions) [S] | Yes (v1) | Health data relating to health services in the UAE must not be stored, processed, generated or transferred outside the UAE except in cases set by resolution; confidentiality, retention, accuracy duties | Synthetic data only; hosting outside the UAE declared in submission | All storage, processing, backups, logs and LLM inference in the UAE (Azure UAE North / Core42); Azure Policy location lock; evidence pack per release | Tech lead |
| L-02 | **DoH Patient Healthcare Data Privacy Standard** (effective 2020) [S] | Yes (v1, incl. vendors processing Abu Dhabi PHI) | Privacy controls, consent, access, breach reporting to DoH (24 h per law-firm summary [S]), quarterly compliance reporting by the facility (Circular 116/2020) [S] | Designed in ([PRIVACY](PRIVACY.md)) | Control mapping, DPA with facility, breach procedure ([RUNBOOK](../05-ops/RUNBOOK.md) §5) | DPO |
| L-03 | **DoH Circular 147/2022** (data sharing / localisation) [S] | Yes (v1) | No sharing of identified **or de-identified** health data with third parties without DoH authorisation; cloud restrictions reported (scope debated) [U] | No sharing; programme dashboard on synthetic data | DoH authorisation for cloud hosting and for any de-identified sharing (research, MBZUAI, sponsors). Ask DoH early which cloud is acceptable (Azure UAE North vs Core42) | Product lead |
| L-04 | **ADHICS** (Abu Dhabi Healthcare Information and Cyber Security Standard, 2019; v2.0 referenced by vendors) + DoH audit programme [K][S] | Yes (v1) for the facility and its vendors | Governance, asset management, access control, ops security, incident management, third-party security, audits | Security design aligned ([SECURITY_ARCHITECTURE](SECURITY_ARCHITECTURE.md)) | ADHICS control mapping, vendor security assessment, incident reporting to DoH; confirm v2.0 timings **[U]** | Tech lead |
| L-05 | **DoH Responsible AI Standard** DoH/ST/DDGO/RAI/V1/2025 (effective Oct 2025) [S]; clause text not retrieved **[U]** | Yes (v1; applies to DoH-licensed entities using AI) | Transparency, privacy, technical requirements for AI in healthcare | LLM explain-only, labelled; evals published; model card in [MODELS](../04-ai/MODELS.md) | Clause-by-clause conformity table once the PDF is obtained; AI register entry at the facility | AI lead |
| L-06 | **DoH AI Clinician Framework** (Oct 2026) [S] | Not for MVP/v1 (Jisr does not perform licensed clinical activity) | Pathway for AI systems that may perform licensed clinical activities | Position: Jisr is decision support + navigation, clinician confirms every step | Re-assess if any autonomous step change is ever proposed (it is a brief non-goal) | Clinical lead |
| L-07 | **Federal Decree-Law 38/2024 on Medical Products** (in force 2 Jan 2025 [S]); regulator **Emirates Drug Establishment (EDE)**, services transferred from MOHAP [S] | MVP: no (non-diagnostic navigation, see [MEDICAL_DEVICE](MEDICAL_DEVICE.md)). v1: **qualification assessment required** | Software with a medical purpose may be a medical device needing classification and registration | Intended-use statement; no diagnosis/treatment claims | Formal qualification opinion from EDE / regulatory consultant before pilot; QMS (ISO 13485) if SaMD | Regulatory owner |
| L-08 | **Federal Law 10/2023 on Mental Health** (in force 30 May 2024; replaced Law 28/1981) [S] | Yes (v1, as context for facilities) | Patient rights incl. privacy and confidentiality of records, consent to treatment, complaints to emirate patients'-rights committee | Not a treating facility; design respects consent and confidentiality | Crisis pathway and any involuntary-care questions stay with the licensed facility under this law; Jisr only routes and records | Clinical lead |
| L-09 | **DoH Standard of Care for Depression & Anxiety** (effective Sep 2025) [S, brief ref 5] | Yes (clinical content) | PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care, stepped pathways | Rule file cites it; step thresholds versioned | Clinical governance sign-off on rules each version | Clinical lead |
| L-10 | **DoH Circular 144/2026** — referral transactions to Malaffi as HL7 v2 REF [S] | v1 | All referrals must flow to Malaffi | Adapter design only | HL7 v2 REF adapter via the facility EMR or direct, after Malaffi onboarding | Tech lead |
| L-11 | **DoH Circular 170/2026** — Sahatna integration for all facilities by 30 Nov 2026 [S] | v1 (opportunity) | Facility booking via Sahatna | Deep-link stub (F-19) | Sahatna module / launch under DoH/ADHDS onboarding | Product lead |
| L-12 | **PDPL** Federal Decree-Law 45/2021 [S] | Partly: excludes health data governed by sector law; may apply to non-health personal data (staff, contact preferences). Executive-regulation status conflicting **[U]** | Lawful basis, transparency, security, breach notice to UAE Data Office, rights | Principles applied | Counsel confirms scope | DPO |
| L-13 | **DoH telehealth / telemedicine standard** **[U] exact current title** | Only if Jisr hosts tele-sessions (it does not; L3 providers do) | Licensing of tele-providers, consent, platform security | Jisr only books; providers' own platforms run sessions | Verify providers' telehealth licences in the directory | Clinical lead |
| L-14 | **Federal Decree-Law 34/2021 on Combatting Rumours and Cybercrimes** [K] | Yes (general) | Unauthorised access/disclosure of health data is an offence | Access control, audit | Same, plus staff training | Tech lead |
| L-15 | **TDRA** rules for SMS/A2P messaging (sender-ID registration, promotional vs transactional) [K, detail U] | v1 | Registered sender ID via licensed UAE provider; transactional category | Mock channel | Contract licensed provider; neutral templates | Tech lead |
| L-16 | **Accessibility:** Federal Law 29/2006 (rights of People of Determination) [K]; WCAG 2.2 AA; UAE government digital accessibility guidance [U] | Yes | Accessible digital services | WCAG 2.2 AA target, RTL, read-aloud (F-20) | Audit before pilot ([ACCESSIBILITY](../02-design/ACCESSIBILITY.md)) | Design lead |
| L-17 | **UAE Cyber Security Council** national Cyber Incident Response Framework / Plan [S] | v1 | National incident reporting/coordination via sector regulator | n/a | Incident plan references DoH and CSC/aeCERT channels **[U] timings** | Tech lead |
| L-18 | **Instrument licensing:** PHQ-9 / GAD-7 free to use, no permission needed [K]; C-SSRS screener: free for clinical/non-profit use after registration with the Columbia Lighthouse Project; commercial terms differ **[U]** (R-05) | Yes | Licence terms, approved translations | PHQ/GAD + item 9 + lexicon always on; C-SSRS screener items behind `FF_CSSRS_ITEMS=false` until terms are confirmed | Register / licence C-SSRS; use validated Arabic/Urdu translations | Clinical lead |

## 1a. Brief §5 cross-cutting safety rules → where they satisfy compliance duties
| Rule (brief §5) | Supports | Enforced in |
|---|---|---|
| Fail-closed Crisis Gate (error/timeout ⇒ RED + human review) | L-05 RAI safety, L-07 risk control, L-08 patient safety | `crisis_gate` wrapper, web client, [RUNBOOK](../05-ops/RUNBOOK.md) §4.1 |
| Coordinator acknowledges RED / logs contact (API-24/25); only a clinician confirms a step or closes RED (API-12/13) | L-06 (no AI or non-clinician performing licensed clinical decisions), L-08 | RBAC, [SECURITY_ARCHITECTURE](SECURITY_ARCHITECTURE.md) §3 |
| Consent scopes incl. *AI-drafted summaries* (de-identified structured facts only; off ⇒ template-only) and *store free text* (F-22) | L-01/L-02 minimisation and consent, L-05 transparency, L-12 | Consent centre (API-14), [PRIVACY](PRIVACY.md) §3 |
| Insurer wording: only what a normal claim for a booked appointment needs; never answers, scores or notes | L-02, L-08 confidentiality, L-14 | No insurer interface; copy review |
| Complementary small-cell suppression (n < 10 ⇒ "<10" + one more hidden cell) | L-03 (de-identified data still restricted), re-identification risk | API query layer |
| API-28 demo reset only when `DEMO_MODE=true` | L-04 change control / integrity | Route registration guard |

## 2. Global standards and frameworks (credibility and future markets)
| Standard | Relevance | MVP | v1 / later |
|---|---|---|---|
| OWASP Top 10 / OWASP LLM Top 10 | Secure build | Mapped ([SECURITY_ARCHITECTURE](SECURITY_ARCHITECTURE.md)) | ASVS L2 |
| HL7 FHIR R4, LOINC, SNOMED CT | Interoperability (SNOMED mandated in Malaffi [S]) | FHIR shapes, LOINC 44249-1 / 69737-5 | Conformance testing with Malaffi |
| WHO Ethics & Governance of AI for Health (2021); WHO LMM guidance (2024) [K] | Responsible AI | Principles in [RESPONSIBLE_AI](../04-ai/RESPONSIBLE_AI.md) | — |
| DECIDE-AI (early clinical evaluation of decision support) [K] | Pilot evaluation design | — | Pilot protocol follows DECIDE-AI |
| NICE CG123 stepped care [K] | Clinical model | Cited in rules | — |
| ISO/IEC 27001 | Information security | Not certified | Target within 12–18 months of pilot; ADHICS mapping first |
| ISO/IEC 42001 | AI management system | Not certified | After 27001 |
| ISO 13485 / IEC 62304 / ISO 14971 / IEC 82304-1 | Medical device QMS, software lifecycle, risk management, health software | Hazard log started (crisis benchmark = first safety evidence) | Required only if Jisr qualifies as SaMD ([MEDICAL_DEVICE](MEDICAL_DEVICE.md)) |
| EU GDPR / AI Act, US HIPAA | Not applicable (UAE only). Reference only for future markets | — | — |

## 3. Licences and partners
| Need | Who holds it |
|---|---|
| Delivering care, crisis response, prescribing | DoH-licensed facilities and clinicians (never Jisr) |
| Health data hosting approval | Facility / programme owner with DoH authorisation; Jisr as vendor |
| Malaffi / Sahatna onboarding | ADHDS (M42) via DoH |
| Medical-device registration (if needed) | Jisr as manufacturer, or via a UAE authorised representative / local distributor per EDE rules **[U]** |
| SMS sender ID | Licensed UAE A2P provider |
| UAE PASS integration | TDRA / UAE PASS onboarding |

## 4. Hackathon declarations (submission)
- Synthetic data only; all sources declared (brief §13).
- Hosting and LLM outside the UAE for the demo only; v1 in-country plan in [INFRASTRUCTURE](../05-ops/INFRASTRUCTURE.md).
- Not a medical device in its MVP intended use; not for clinical use; no diagnostic claims ([MEDICAL_DEVICE](MEDICAL_DEVICE.md)).
- Evals published in `EVAL.md`; limitations listed.

## 5. Open items (with owner and date)
| Item | Owner | Due |
|---|---|---|
| Obtain DoH RAI Standard PDF and map clauses (fetch failed) | AI lead | 2026-11-19 |
| Confirm C-SSRS screener terms or drop it from MVP | Clinical lead | 2026-11-19 |
| Confirm ADHICS v2.0 incident-reporting timings | Tech lead | Pre-pilot |
| EDE qualification opinion for v1 intended use | Regulatory owner | Pre-pilot |
| DoH position on cloud hosting under Circular 147/2022 | Product lead | Pre-pilot |

## Sources
- Federal Law 2/2019 — https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1 ; Al Tamimi — https://tamimi.com/news/health-data-transfers-outside-the-uae
- DoH Patient Healthcare Data Privacy Standard — https://www.tamimi.com/news/abu-dhabi-uae-issues-standard-on-healthcare-data-privacy ; DoH Circular 116/2020 — https://www.doh.gov.ae/-/media/Feature/Resources/Circulars/116--20201.ashx
- Circular 147/2022 — https://www.globalcompliancenews.com/2022/10/07/https-insightplus-bakermckenzie-com-bm-data-technology-uae-abu-dhabi-department-of-health-requires-licensed-entities-to-comply-with-strict-data-localization-requirements_09222022/
- ADHICS — https://www.doh.gov.ae/-/media/032019_ADHICS.ashx ; DoH audit programme — https://www.tamimi.com/news/the-doh-audit-program-regarding-abu-dhabi-healthcare-information-and-cyber-security-standards
- DoH RAI Standard — https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx ; IBA overview — https://www.ibanet.org/ai-healthcare-regulation-uae
- DoH AI Clinician Framework — https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide
- Federal Decree-Law 38/2024 — https://uaelegislation.gov.ae/en/legislations/2751/download ; Al Tamimi — https://tamimi.com/news/the-new-era-of-pharmaceutical-regulation-in-the-uae-key-changes-under-federal-law-no-38-of-2024 ; MOHAP→EDE transfer — https://www.regdesk.co/blog/uae-medical-device-regulatory-update-transfer-of-services-from-mohap-to-ede
- Federal Law 10/2023 (Mental Health) — https://uaelegislation.gov.ae/en/legislations/2166/download ; DLA Piper — https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2024/the-UAEs-new-Mental-Health-Law-comes-into-effect-
- PDPL — https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/united-arab-emirates
- UAE Cyber Incident Response Framework — https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/Cypersecurity/Cyber-Incident-Response-Framework
