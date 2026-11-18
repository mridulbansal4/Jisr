# B — Abu Dhabi context, open data, standards, pain numbers

Researched 2026-11-18 using web search and fetch. Tags: **[V]** means confirmed in a primary or official source this session. **[S]** means secondary (press, law firm, vendor). **[U]** means unverified or conflicting. **[K]** means well-known reference, cited by canonical URL but not re-fetched today.

---

## 1. Abu Dhabi rails (what to plug into)

### Malaffi (HIE)
- Launched 2019. Operated by Abu Dhabi Health Data Services (ADHDS), a DoH/Injazat PPP that now sits under M42. Connects 3,000+ facilities, and SNOMED International named it a SNOMED CT global reference site [S] https://m42.ae/media-resources/news/m42-s-abu-dhabi-health-data-services-named-global-reference-site-by-snomed-international/
- DoH enforces a **Minimum Data Set and the "2026 Data Standards"** for data flowing from EMRs and labs into Malaffi, coded per DoH clinical data standards (e.g. Std 8 allergies, Std 9 problem list, Std 10 lab results) [S] https://www.doh.gov.ae/en/resources/HIE
- **Circular 144/2026 (28 Jul 2026): every facility must send ALL referral transactions to Malaffi as HL7 v2 REF messages, with priority and SNOMED-coded specialty. Full compliance was due 31 Aug 2026** [S, from search extract of the DoH PDF] https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx. The circular ties this to the Abu Dhabi Primary Care Model. This is a direct hook for C05: referral events already exist in Malaffi.
- Circular 10/2026 (19 Jan 2026): minimum-dataset onboarding, with data flowing within 6 months. Non-compliance can block licence renewal [S].
- **FHIR:** I found no public Malaffi FHIR API spec. Live traffic is mostly HL7 v2.5.1, with FHIR R4 adoption on newer integrations, per vendor guides that mainly describe Dubai's NABIDH [U] https://sigosoft.com/blog/nabidh-malaffi-integration-telehealth/. Safe framing for the pitch: "FHIR R4 internally, with an HL7 v2 REF/ORU adapter for Malaffi."

### Sahatna (patient app)
- DoH launched it at GITEX 2024 with ADHDS. Sign-in is via UAE PASS. Features include appointments, teleconsult, Malaffi records, dependents, an AI symptom checker, genomic reports, and **IFHAS screening** [S] https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna ; FAQ https://sahatna-app.doh.gov.ae/en/faqs/ ; App Store https://apps.apple.com/app/id6472413092
- Reported adoption is 300k+ downloads and more than 60% of facilities connected [S]. "Sahatna Space" is now on TAMM (Oct 2025) https://www.doh.gov.ae/en/news/abu-dhabi-advances-smart-and-intelligent-health-system-with-launch-of-sahatna-space-on-tamm
- **Circular 170/2026 (1 Sep 2026): Sahatna integration (incl. in-person booking) mandatory for ALL facilities by 30 Nov 2026** [S] https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx. Pitch line: "ships as a Sahatna module the week every facility goes live on Sahatna."

### IFHAS (adult comprehensive screening)
- IFHAS is **not new**. It was running by 2022 at the latest. WAM (Feb 2024) reports it is offered free to **Thiqa cardholders aged 18–75 at 150+ facilities**, every ~3 years or sooner on clinical need [S] https://wam.ae/en/article/b1ryawb-more-than-150-healthcare-facilities-across-abu ; DoH page https://www.doh.gov.ae/en/news/abu-dhabi-public-health-centre-calls-on-thiqa-cardholders-to-benefit-from-the-ifhas-programme
- **The "launched Sept" in the challenge brief most likely means the 2026 EXPANSION.** ADPHC added a Reproductive Health Screening, **Memory Testing**, mental health screening, non-invasive colorectal tests, and ophthalmologist plus retinal imaging [S] https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/. The exact date was not confirmed [U]. Portal: www.ifhas.gov.ae
- Claims rules: "Addendum 06 to DOH Claims Adjudication Rules – IFHAS 3.0 Update" (IFHAS v3.0 packages) [S] https://www.doh.gov.ae/-/media/Feature/shafifya/Prices/Adjudication-Rules/Addendum-06-to-DOH-Claims-Adjudication-Rules-v20251IFHAS-30-Update.ashx
- The "50+ tests" figure is from the brief and was not verified [U].

### Well-Child Visit (WCV)
- DoH **Standard for Well-Child Visits, DOH/WCV/SD/10/2025 V10** (revised Dec 2025, effective date "TBD" in the doc). It covers ages 1 month to 6 years at licensed facilities, with EMR documentation required. Contact: WCV.Support@adphc.gov.ae [S] https://www.doh.gov.ae/-/media/E3D10B966E2B431982AC28A0A6EC3A1B.ashx
- The visit count (14) comes from the brief and was not found in any source [U]. Check the standard's appendix tables. Uninsured children are covered at SEHA via Government Mandated Funds [S].

### Genomics
- **Emirati Genome Programme:** about 802k genomes sequenced by Apr 2025 [S] https://www.thenationalnews.com/news/uae/2025/04/17/more-than-800000-emiratis-contribute-to-uae-genome-programme-to-boost-health-of-the-nation. One report puts it at ~900k in 2026 [U]. The **National Genomics Masterplan 2026–2031** targets 100% of citizens and personalised reports for 900k [S] https://gulfnews.com/amp/story/uae%2Fhealth%2Fkhaled-bin-mohamed-approves-uae-genomics-masterplan-to-provide-900000-personalised-health-reports-1.500742890. Genomic reports already show in Sahatna.
- **Premarital genetic testing has been mandatory for all Emiratis nationwide since Jan 2025. It covers 570 genes and 840+ disorders.** Abu Dhabi DoH started it earlier, from 1 Oct 2024 [V-ish, multiple official/wire] https://www.wam.ae/en/article/b6vbsqm-mohap-announces-mandatory-genetic-testing-part ; https://www.thenationalnews.com/news/uae/2024/12/25/uae-to-introduce-mandated-premarital-genetic-testing-for-emiratis-from-january. Before this, the premarital exam was mandatory but the genetic test was optional.
- Uptake: 5,506 couples tested (EHS) by May 2026, of whom **3.9% (212) were "incompatible"** [U, secondary]. DoH Precision Medicine Policy annex: informed consent is required and re-identification is prohibited https://www.doh.gov.ae/-/media/Feature/Resources/Policies/PoliciesAnnexure/Precision%20Medicine%20Policy-%20Data%20Ethics%20and%20Public%20Engagment_%20Annex2

### Thiqa and primary care
- Thiqa is Abu Dhabi's government programme for UAE nationals (and similar status), administered by Daman since 2008. Nationals resident in Abu Dhabi get full public and private network cover with no annual limit [S] https://u.ae/en/information-and-services/health-and-fitness/healthcare-access-and-insurance/getting-a-health-insurance. The 100% public / 80% private split is [U]. Expats are on employer plans (Basic/Enhanced), so referral routing must be **network-aware**.
- Family physicians: 818+ across 237 facilities (undated DoH page) https://www.doh.gov.ae/en/programs-initiatives/Primary-Care. I found no source confirming "every resident assigned" [U].

### DoH AI and data regulation
- **DoH Responsible AI Standard, DoH/ST/DDGO/RAI/V1/2025, effective Oct 2025.** It applies to DoH and all licensed entities, and turns the 2018 AI Policy (the region's first) into directives on transparency, privacy, and technical requirements [S] https://www.doh.gov.ae/-/media/B84FF5DD027846699C51F36C439A580F.ashx (fetch failed, so detailed clauses are [U]) ; https://www.ibanet.org/ai-healthcare-regulation-uae
- **DoH AI Clinician Framework (Oct 2026):** a pathway for how AI clinician systems may eventually be authorised to do licensed clinical activities [S] https://www.wam.ae/en/article/17hh7ki-doh-publishes-clinician-framework-guide. Very current, so cite it in the pitch.
- DoH **Patient Healthcare Data Privacy Standard** (effective 16 Sep 2020). **Circular 147/2022:** no sharing of identified OR de-identified health data with third parties without DoH authorisation, and a reported ban on cloud services (scope debated) [S] https://www.tamimi.com/news/abu-dhabi-uae-issues-standard-on-healthcare-data-privacy ; https://www.globalcompliancenews.com/2022/10/07/https-insightplus-bakermckenzie-com-bm-data-technology-uae-abu-dhabi-department-of-health-requires-licensed-entities-to-comply-with-strict-data-localization-requirements_09222022/
- The Abu Dhabi Healthcare Information and Cyber Security Standard (ADHICS) is audited by DoH [K] https://www.tamimi.com/news/the-doh-audit-program-regarding-abu-dhabi-healthcare-information-and-cyber-security-standards
- **Federal Law 2/2019 (ICT in Health Fields), Art. 13:** health data relating to UAE services must not be stored, processed, or transferred outside the UAE unless an exception applies. Implementing reg is Cabinet Res. 32/2020, and a later ministerial resolution lists exceptions [S] https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_Health/UAE-LC-En_2019-02-06_00002_Kait.html?val=EL1 ; https://tamimi.com/news/health-data-transfers-outside-the-uae. Penalty amounts conflict across sources [U].
- **PDPL (Federal Decree-Law 45/2021):** excludes health data where sector law exists, which means the ICT Health Law governs. Status of the executive regulations is conflicting [U] https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/united-arab-emirates
- **Design implication:** UAE-region hosting (Azure UAE North / G42 Core42), no PHI to non-UAE LLM endpoints, synthetic data only in the demo, and a DoH-authorisation step documented for any de-identified sharing.

### Heat (C07)
- **Midday break 2026: 15 Jun – 15 Sep, 12:30–15:00.** No outdoor work in direct sun. Fines are AED 5k per worker up to AED 50k. MoHRE reports >99% compliance [S] https://gulfnews.com/uae/government/midday-outdoor-work-ban-returns-across-uae-for-22nd-year-1.500567381
- **Abu Dhabi uses Thermal Work Limit (TWL)**, not WBGT alone. It sits in the EHSMS/OSHAD-SF heat Code of Practice and the "Safety in the Heat" guideline (2013) [S] https://en.wikipedia.org/wiki/Thermal_work_limit. TWL zones: **≥220 W/m² unrestricted · 140–220 acclimatisation · 115–140 buffer · <115 withdrawal** (minor boundary differences between sources) [S] https://occup-med.biomedcentral.com/articles/10.1186/1745-6673-3-21/tables/4. The exact OSHAD-SF CoP text was not retrieved [U]. Manuals: adphc.gov.ae OSHAD-SF section.
- Evidence of benefit: an Abu Dhabi company heat programme cut cases from **15.3 to 1.16 per 1,000 workers** (2008 to 2009) [S] https://pmc.ncbi.nlm.nih.gov/articles/PMC3036673 . In 2010 Abu Dhabi recorded **3,017 ED visits for heat illness** across all occupations [S] (same/related sources). A UAE construction site study found WBGT above TLV (WBGT/HSI/TWL) https://pubmed.ncbi.nlm.nih.gov/31308288/

### Healthy longevity / "Health Age"
- **ADPHC × Ultrahuman MoU (Oct 2026): build and clinically validate a "Biological Health Age" model** from clinical biomarkers plus wearables [S] https://www.wam.ae/en/article/c2q0nsf-abu-dhabi-public-health-centre-ultrahuman. Also: a Healthy Longevity Medicine Centre licensing framework (2024), a Declaration on Longevity & Precision Medicine (2025), and WEF Global Pathfinder (Jan 2026) https://www.mediaoffice.abudhabi/en/health/department-of-health-abu-dhabi-implements-framework-to-establish-healthy-longevity-medicine-centres-in-the-emirate/

### Mental health (C10)
- Population study of 2,019 Abu Dhabi adults (Emirati and expat, stratified): **16.3% moderate-to-severe depression on PHQ-9** [S] https://www.populationmedicine.eu/Depression-and-Anxiety-among-Adults-in-Abu-Dhabi-A-population-based-study,229332,0,2.html
- Abu Dhabi Quality of Life Survey 2023–24 (n=65,203 analysed): highest stress in ages 15–29, with females and non-Emiratis worse [S] https://researchportal.bath.ac.uk/en/publications/mental-health-disparities-across-demographic-and-social-groups-in/ . DoH community mental health shift https://www.doh.gov.ae/en/news/from-specialised-care-to-community-centered-support-ad-redefines-access-to-mh-services

---

## 2. Open datasets (legal to use in the demo)

| Dataset | Use | Licence / access | Source |
|---|---|---|---|
| **Synthea** | Synthetic FHIR R4 patients (bulk NDJSON), with generic JSON modules (diabetes, CVD, cancers, dementia, wellness encounters, immunisations). Add custom modules for IFHAS/WCV | Apache-2.0, needs Java 11+. Demographics default to US, so swap in an Abu Dhabi demographic file | https://github.com/synthetichealth/synthea [K/S] |
| **MIMIC-IV Demo on FHIR v2.1.0** | 100 real de-identified ICU/hospital patients as FHIR NDJSON (49.5 MB) | **ODbL 1.0, open, no credentialing** | https://physionet.org/content/mimic-iv-fhir-demo/ [V] |
| MIMIC-IV Clinical Demo v2.2 / ED demo / OMOP demo | Same 100 patients as CSV | ODbL, open | https://physionet.org/content/mimic-iv-demo/ [V] |
| **NHANES** | US population labs and exams for calibrating risk models (HbA1c, lipids, BP, PHQ-9, CERAD cognitive in 2011–14) | Public domain | https://wwwn.cdc.gov/nchs/nhanes/ [K] |
| UK Biobank | Not usable in 36 h (application plus fee) | Restricted | https://www.ukbiobank.ac.uk/ [K] |
| **ClinVar** | Variant pathogenicity for carrier panels | Public domain | https://www.ncbi.nlm.nih.gov/clinvar/ [K] |
| **gnomAD v4** | Allele frequencies incl. **Middle Eastern ("mid") group**, which is small (158 genomes in v3.1, larger in v4, enough to be added to FAF in v4.1) | Open (CC0 data) | https://gnomad.broadinstitute.org/news/2023-11-genetic-ancestry [S] |
| **CTGA (CAGS, Dubai)** | Manually curated Arab genetic disorders. 665 conditions described in Emiratis (2023), 621 Mendelian | Open web search. No bulk licence found, so cite and don't scrape [U] | https://cags.org.ae/ctga ; https://pmc.ncbi.nlm.nih.gov/articles/PMC10194840/ [S] |
| **Open-Meteo Historical (ERA5 0.25° from 1940, ERA5-Land 0.1°, IFS 9 km from 2017)** | Abu Dhabi hourly temperature, RH, wind, **shortwave_radiation** for WBGT (Liljegren) and TWL back-tests | **Data CC BY 4.0**. Free API for non-commercial use (<10k calls/day) | https://open-meteo.com/en/docs/historical-weather-api ; https://open-meteo.com/en/licence [S]. A wet-bulb variable on Open-Meteo is [U], so compute it yourself (Stull) |
| ERA5 (Copernicus CDS) | Raw reanalysis | Copernicus licence, free | https://cds.climate.copernicus.eu [K] |
| **OpenAQ** | PM2.5/PM10/O3 for UAE stations (second signal type for C06) | Open API, key needed. Licence varies per source (mostly CC BY) | https://openaq.org [K] |
| IHME GBD | UAE DALYs and causes for the burden slide | Free, non-commercial, attribution | https://vizhub.healthdata.org/gbd-results/ [K] |
| IDF Diabetes Atlas | UAE diabetes figures | Free | https://diabetesatlas.org/data-by-location/country/united-arab-emirates/ [S] |
| WHO GHO | NCD risk factors, UAE | CC BY-NC-SA 3.0 IGO | https://www.who.int/data/gho [K] |

### Screening rules to encode (deterministic layer)
- **USPSTF A/B recommendations** (free, public): e.g. diabetes/prediabetes 35–70 with overweight; CRC 45–75; breast mammography 40–74 biennial (2024); cervical 21–65; statin 40–75 with risk factors. https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics [K]
- Abu Dhabi CRC programme (HAAD 2013): nationals 40–75, target uptake 45%, preferred 65% [S] https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8343888/

### Validated instruments (Arabic)
- **A-RUDAS (Lebanon, n=232, ≥65 yrs): cutoff ≤22, sensitivity 83%, specificity 85%, AUC 0.84.** Low education bias, free to use [S] https://pubmed.ncbi.nlm.nih.gov/25984584
- **Arabic MoCA-B (Egypt, Saleh 2019): MCI cutoff 21/22 (sens 92.5%, spec 98.2%), dementia 16/17 (90.7/97.4)** [S] https://informahealthcare.com/doi/abs/10.1080/13607863.2018.1428936. MoCA itself needs a licence/training (mocacognition.com), so a licence-free baseline instrument is a selling point. I found no standard Arabic MoCA cutoff paper [U].
- **PHQ-9 / GAD-7 Arabic:** Lebanese psychiatric outpatient validation (Psychiatry Res 2016) found both reliable, PHQ-9 sensitive but not specific, GAD-7 weaker [S] https://read.qxmd.com/read/27031595/ . Oman doctors: PHQ-9 ≥10 gave sens 80.6% / spec 94.0% [U, secondary]. Saudi full-PHQ validation (n=731) [S]. Both instruments are free (Pfizer, no permission needed) [K].

### Heat standards
- **NIOSH 2016-106 Criteria for a Recommended Standard.** RAL (unacclimatised) = 59.9 − 14.1·log10(M) °C-WBGT; REL (acclimatised) = 56.7 − 11.5·log10(M), with M = metabolic rate in W [K equations; doc S] https://www.cdc.gov/niosh/publications/numbered/2016-106.html
- **ISO 7243:2017** WBGT reference values (with clothing adjustment); equivalent to ACGIH TLV / NIOSH [S]. The standard is paywalled, so cite it but don't reproduce it.

---

## 3. Standards judges will recognise
- **HL7 FHIR R4** https://hl7.org/fhir/R4/. Closed loop = `ServiceRequest` (order or referral) → `Task` (owner, status, businessStatus, `restriction.period` = SLA, `executionPeriod`) → `Communication` / `CommunicationRequest` (notify, acknowledge) → `Appointment` → `Encounter` / `DiagnosticReport` → closure via `Task.status=completed` plus `Provenance` (who closed, on what evidence). `Flag` and `DetectedIssue` for overdue items, `Consent` for granular revocable consent, `RiskAssessment` for explainable risk (with `basis` and `prediction.probability`), `Questionnaire`/`QuestionnaireResponse` for PHQ-9 and RUDAS. [K]
- **HL7 BSeR IG (STU1, R4):** a FHIR closed-loop bidirectional referral pattern (ServiceRequest + Task, messaging or notify-and-pull) built exactly for this. https://hl7.org/fhir/us/bser/ [S]
- **IHE 360X Closed Loop Referral** (PCC supplement; C-CDA/Direct based) https://wiki.ihe.net/index.php/360_Exchange_Closed_Loop_Referral [S]. **IHE PDQm/PIXm, mCSD** (care-services directory, for network-aware routing), **IHE MHD** [K].
- **SMART on FHIR / SMART App Launch 2.x** (EHR launch inside Malaffi/Sahatna; OAuth2 scopes) https://hl7.org/fhir/smart-app-launch/ [K]. **CDS Hooks** (surface flags in clinician EMR) https://cds-hooks.org [K]. **FHIR Bulk Data** for the population view [K].
- **Terminologies:** SNOMED CT (mandated in Malaffi), LOINC (PHQ-9 = 44249-1, GAD-7 = 69737-5), ICD-10-CM [K].
- **AI reporting and evaluation:** **DECIDE-AI** (early-stage clinical evaluation of AI decision support; Nat Med 2022) https://www.nature.com/articles/s41591-022-01772-9 ; **TRIPOD+AI** (BMJ 2024, prediction models) https://www.bmj.com/content/385/bmj-2023-078378 ; **CONSORT-AI / SPIRIT-AI** (2020, trials) https://www.nature.com/articles/s41591-020-1034-x ; **WHO Ethics & Governance of AI for Health** (2021) https://www.who.int/publications/i/item/9789240029200 and **WHO guidance on large multimodal models** (2024/2025) https://www.who.int/publications/i/item/9789240084759 [K]. Also the FDA/MHRA/Health Canada GMLP principles and the NIST AI RMF [K].

---

## 4. Numbers that "poke the pain"
- **Diabetes: 20.7% of UAE adults (age-standardised, IDF Atlas 11th ed., 2024), ~1.27M people; 64% undiagnosed**; projected 1.3M → 1.9M by 2050 [S] https://diabetesatlas.org/data-by-location/country/united-arab-emirates/ . The crude 20–79 figure of 16.5% is [U].
- **Screening uptake:** CRC FIT uptake among eligible Emiratis at SEHA clinics was **23.5%** (target 45%), and **only 30.5% of FIT-positives got a colonoscopy**. That is a perfect C05 statistic [S] https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8343888/ . A national UAE CRC screening study found 9.1% [S]. The experts' own admission: insurance-card blocking after 3 months of SMS is today's lever (01-facts). I found no published IFHAS uptake figure [U].
- **Consanguinity:** 50.5% of UAE marriages consanguineous, 26.2% first-cousin (Al-Gazali 1997, n=2,033), and 54% in Al Ain [S] https://pubmed.ncbi.nlm.nih.gov/8854141 . A newer Sharjah sample found 23.4%, suggesting decline [S]. Present it as a 25–50% range. 665 genetic conditions have been described in Emiratis (CTGA). Premarital: **3.9% of tested couples "incompatible"** [U].
- **Dementia:** the GBD 2019→2050 forecast puts the **UAE at +1,795% (2nd highest in the world; Qatar +1,926%)**, with MENA rising from 3M to 14M (+367%). The UAE could exceed 220k cases by 2050 [S] https://khaleejtimes.com/health/uae-to-see-second-highest-percentage-increase-in-dementia-cases-globally (GBD 2019 Dementia Forecasting Collaborators, Lancet Public Health 2022 [K]).
- **Heat:** 3,017 heat-illness ED visits in Abu Dhabi in 2010. A company programme cut cases 92% (15.3 to 1.16 per 1,000). The midday ban is in its 22nd year, but it is clock-based, not risk-based. Heat outside 12:30–15:00 and outside the June–Sept window is unaddressed (HRW 2023/2024 critiques) https://www.hrw.org/news/2024/08/08/gulf-states-inadequate-heat-protection-putting-workers-peril [S].
- **Mental health:** 16.3% moderate-to-severe depression (PHQ-9) in an Abu Dhabi population sample [S]. Youth aged 15–29 report the most stress [S].
- **Cardiometabolic:** CVD is the leading cause of death in the UAE (GBD/WHO) [K, number not fetched; pull from GBD Results tool].

---

## Open checks (not resolved)
1. Exact IFHAS 2026 expansion date and "50+ tests" count (ifhas.gov.ae).
2. WCV visit schedule (14 visits?), from the DoH standard appendix.
3. RAI Standard clause numbers (DoH PDF fetch failed twice; retry manually).
4. Whether Malaffi exposes any FHIR endpoints publicly.
5. OSHAD-SF heat CoP current text and any WBGT thresholds.
