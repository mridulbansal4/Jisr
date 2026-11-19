# Privacy
> Project: Jisr · Owner: Product lead (acting DPO for the hackathon) · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Compliance](COMPLIANCE.md) · [Security architecture](SECURITY_ARCHITECTURE.md) · [Threat model](THREAT_MODEL.md) · [Data model](../03-engineering/DATA_MODEL.md) · [Localization](../02-design/LOCALIZATION.md) · [Observability](../05-ops/OBSERVABILITY.md)

Tags: **[V]** primary source checked · **[S]** secondary · **[U]** unverified. This is an engineering privacy design, not legal advice; v1 needs UAE counsel and the facility's DPO.

## 1. Legal frame (summary; detail in [COMPLIANCE](COMPLIANCE.md))
- **Health data** in Abu Dhabi is governed by sector law: **Federal Law 2/2019 (ICT in Health Fields)**, incl. Art. 13 data localisation [S], and **DoH's Patient Healthcare Data Privacy Standard** (2020) plus **Circular 147/2022** (no sharing of identified or de-identified health data with third parties without DoH authorisation) [S].
- **PDPL (Federal Decree-Law 45/2021)** excludes health data where sector legislation regulates it [S]; PDPL principles still guide non-health personal data (e.g. staff accounts, contact preferences) **[U]: status of executive regulations conflicting**.
- **Role:** in v1 the licensed DoH facility (or ADPHC programme) is the controller; Jisr is a processor/vendor under a data processing agreement. In the MVP, Jisr processes **synthetic data only**.

## 2. Personal data inventory
Classification: **S3** = special category (mental health, suicidality), **S2** = health/identifying, **S1** = operational, **S0** = non-personal.

| Data (entity) | Fields | Class | Purpose | Legal basis (v1) | Retention (v1) | Who sees it |
|---|---|---|---|---|---|---|
| Person (E-01) | pseudonymous id, UAE PASS sub (v1), preferred language, gender, age band, nationality group, insurance network, contact channel + number | S2 | Identify, route to network/language/gender-matched care, contact | Provision of healthcare under the facility's licence + consent for contact channel | Life of record per DoH medical-record retention **[U]** | Person, care team, coordinator |
| ConsentRecord (E-02) | scope, granted/revoked timestamps, version of notice | S1 | Prove and enforce consent | Legal obligation | As long as the related data + 5 yrs **[E]** | Person, auditor |
| ScreeningSession / InstrumentScore (E-03/04) | item answers PHQ-2/9, GAD-2/7, C-SSRS screener, totals, timestamps | **S3** | Score, stepped-care matching, RCI | Healthcare provision + explicit consent to screening | Medical record | Person, care team |
| Free text (F-22) | optional "Anything else you'd like to tell us?" text | **S3** | Crisis Gate first, always (in memory). **Without the *store free text* consent only the gate result + matched category are stored, never the raw text**; with it, the text is kept and shown to the care team | Explicit consent (store free text scope) | v1 with consent: 90 days unless incorporated into the record by a clinician **[E]**; without consent: raw text never persisted | Crisis Gate; care team only with consent |
| CrisisEvent (E-05) | trigger type, rule id, time, ack time, responder | **S3** | Safety response, SLA audit | Vital interests / healthcare | Medical record | Care team, coordinator |
| Episode / EpisodeEvent (E-06/07) | state, step, owner, deadlines, transitions | S3 | The ledger | Healthcare provision | Medical record | Person, care team, coordinator |
| StepRecommendation (E-08) | factors, ruleset version, clinician decision | S3 | Explainability, accountability | Healthcare provision | Medical record | Care team |
| Referral / Appointment (E-10/11) | provider, dates, status, minimum referral packet | S3 | Warm hand-off | Healthcare provision + consent to share with the chosen provider | Medical record | Person, sending and receiving clinicians |
| Notification (E-12) | channel, neutral template id, status | S1 | Reminders | Consent | 1 year | System |
| PhysicalContext (E-16) | HbA1c, BMI, sleep from IFHAS | S2 | Coordinated summary (F-12) | **Separate opt-in consent** | Medical record | Care team |
| ExplanationRecord (E-18) | validated LLM output (or template id), validator result, model id | S2 | Show explanation, audit AI | Healthcare provision + *AI-drafted summaries* consent for LLM use | 1 year **[E]** | Person, care team, AI auditor |
| AuditLog (E-14) | actor, action, resource, purpose, time | S1 | Accountability | Legal obligation (ADHICS / DoH audit) | ≥ medical record retention **[U]** | Person (own), auditor |
| StaffUser (E-13) | name, licence no., facility, role | S1 | Access control | Contract | Employment + 1 yr | Admin |
| Programme aggregates | counts, rates; cells with n < 10 shown as "<10" plus complementary suppression | S0 (if suppression holds) | Programme KPIs, fairness | Public-health interest, DoH authorisation for any external sharing | Indefinite | Programme lead |

**Not collected, by design:** Emirates ID number (UAE PASS sub suffices), employer name, exact address, location tracking, contacts, social-media data, keystroke/passive sensing, device advertising IDs, third-party analytics/session replay.

## 3. Consent design (F-13)
Granular, plain language, revocable, effect visible immediately, logged with notice version.

| Consent | Default | Effect if off |
|---|---|---|
| Screening and results explanation (prerequisite, not a scope) | Required to use Jisr | No screening (crisis numbers still shown) |
| **S1 Share with family physician** (and the provider chosen at hand-off) | Asked at hand-off | Self-guided steps only (L0–L1); crisis pathway still applies |
| **S2 Share physical context** (IFHAS results, e.g. HbA1c, BMI, blood pressure; F-12) | Off | Coordinated summary excludes physical context |
| **S3 AI-drafted summaries** — sends **de-identified structured facts** (scores, step, provider attributes; no name, ID, free text or contact details) to the LLM | Asked with a plain explanation; MVP personas: Mariam on, Imran off | **Template-only** explanations and messages (M-03); no LLM call is made for this person |
| **S4 Store free text** (F-22) | Off | Free text is crisis-gated in memory and discarded; only the gate result + matched category are stored |
| **S5 SMS / WhatsApp channel** | Off (in-app only) | In-app only |
| Crisis override (not a consent toggle, explained up front) | — | If a crisis signal appears, Jisr shows emergency help and alerts the on-call team regardless of S1. If the gate itself fails, Jisr treats the input as a crisis (fail-closed). This is stated before screening |

Every scope is revocable in the consent centre with immediate, visible effect (brief §5). Inclusion of de-identified data in suppressed programme aggregates is **not** a brief scope; it is an open question for DoH (opt-out vs opt-in) and is listed in §5.

### 3.1 Consent notice — English (draft, plain language, reading age ~ 12)
> **Before you start**
> Jisr helps you understand your answers and find the right support. It is **not** a diagnosis and does not replace a doctor.
> - **What we ask:** short questions about your mood, worry and sleep, and anything you choose to write.
> - **Who sees it:** you, and the care team you agree to share with. **Never your employer, your sponsor or your family** unless you decide to tell them. If you book an appointment, your insurer receives only what a normal claim for that appointment needs, never your answers, scores or notes.
> - **If you might be in danger:** if your answers suggest you may be at risk of harming yourself, we will show you emergency help right away and a clinician will contact you. We do this even if you have not shared with a care team, because your safety comes first.
> - **AI (your choice):** if you allow it, some explanations are drafted by a computer program from your results only (no name or ID) and checked against them. If you say no, you get the same information in standard wording. A person makes every care decision.
> - **What you write in the free-text box:** we check it for signs you may need urgent help. We keep the words only if you allow it.
> - **Where your data is kept:** in the United Arab Emirates. *(Demo: this prototype uses made-up data only. Please do not enter real personal information.)*
> - **Your choices:** you can see who opened your record, change what you share, or stop at any time in *My privacy*.
> [ I agree and want to start ]  [ Show me emergency numbers only ]

### 3.2 إشعار الموافقة — العربية (مسودة؛ تحتاج مراجعة لغوية وسريرية من متحدث أصلي، R-04)
> **قبل أن تبدأ**
> يساعدك «جسر» على فهم إجاباتك والوصول إلى الدعم المناسب. هو **ليس** تشخيصاً ولا يحلّ محلّ الطبيب.
> - **ماذا نسأل:** أسئلة قصيرة عن مزاجك وقلقك ونومك، وأي شيء تختار أن تكتبه.
> - **من يطّلع على بياناتك:** أنت، وفريق الرعاية الذي توافق على مشاركته. **لا يطّلع عليها صاحب العمل أو الكفيل أو عائلتك** إلا إذا قررت أنت إخبارهم. وإذا حجزت موعداً، تتلقى شركة التأمين فقط ما تتطلبه المطالبة المعتادة لذلك الموعد، ولا تتلقى أبداً إجاباتك أو درجاتك أو الملاحظات.
> - **إذا كنت في خطر:** إذا أشارت إجاباتك إلى احتمال أن تؤذي نفسك، سنعرض لك أرقام المساعدة الطارئة فوراً وسيتواصل معك أحد المختصين، حتى لو لم تشارك بياناتك مع فريق رعاية، لأن سلامتك تأتي أولاً.
> - **الذكاء الاصطناعي (باختيارك):** إذا سمحت بذلك، يكتب برنامج حاسوبي بعض الشروحات انطلاقاً من نتائجك فقط (دون اسمك أو رقم هويتك) ثم تُراجَع آلياً مقابلها. وإذا رفضت، تحصل على المعلومات نفسها بصياغة قياسية. أما قرارات الرعاية فيتخذها إنسان دائماً.
> - **ما تكتبه في خانة النص الحر:** نفحصه بحثاً عن علامات تدل على حاجتك إلى مساعدة عاجلة، ولا نحتفظ بكلماتك إلا إذا سمحت بذلك.
> - **أين تُحفظ بياناتك:** داخل دولة الإمارات العربية المتحدة. *(نسخة العرض: يستخدم هذا النموذج بيانات وهمية فقط، فلا تُدخل معلومات شخصية حقيقية.)*
> - **خياراتك:** يمكنك معرفة من فتح سجلك، وتغيير ما تشاركه، أو التوقف في أي وقت من صفحة «خصوصيتي».
> [ أوافق وأريد البدء ]  [ اعرض أرقام الطوارئ فقط ]

Urdu version: produced from the English master by a native translator; not machine-only (R-04). Owner: localisation lead, before any user testing.

## 4. Rights (v1; MVP demonstrates them on synthetic data)
| Right | How in Jisr | SLA (target) |
|---|---|---|
| Be informed | Notice above, layered; "why am I seeing this?" on every recommendation | At collection |
| Access | *My privacy* → download my episode (FHIR bundle, API-20) + my access log (API-23) | Immediate (self-service) |
| Correction | Request correction of contact/preferences in-app; clinical record corrections via the facility (append-only correction events) | 30 days **[E]** |
| Withdraw consent | Toggle in consent centre (API-14), effective on next request | Immediate |
| Erasure | Non-clinical data (contact, preferences, free text not in the record) erased on request; clinical records follow DoH medical-record retention rules and cannot simply be deleted **[U]** | 30 days **[E]** |
| Object / restrict | Turn off any scope S1–S5 (e.g. S3 → template-only, S4 → raw text deleted and no longer stored); restrict sharing per provider; programme-statistics opt-out if DoH chooses that model | Immediate |
| Complaint | In-app contact to facility DPO; escalation to DoH | Acknowledge 5 working days **[E]** |
| Know who accessed | Access log (API-23) | Immediate |

**Children and adolescents:** MVP and v1 pilot are **18+ only** (IFHAS is an adult programme, 18–75 [S]). Age gate at start; under-18s are shown crisis numbers and directed to a school/paediatric pathway. Any future youth version needs guardian-consent rules, adolescent confidentiality policy and a separate DPIA.

## 5. DPIA (summary)
| Step | Finding |
|---|---|
| Nature | Processing of special-category mental-health data, including suicidality, plus automated recommendation (rules) and AI-drafted text |
| Scale (v1) | Up to ~1M episodes/year emirate-wide at full scale ([COST](../05-ops/COST.md)) |
| Necessity & proportionality | Each field maps to a purpose in §2; no passive monitoring; minimum referral packet; aggregates suppressed |
| Key risks | (1) disclosure to employer/family, or over-sharing with insurers (A-01/A-01b); (2) missed crisis (R-01); (3) cross-border transfer via LLM (R-03); (4) re-identification (A-05); (5) automated decisions without human review; (6) misleading AI text (R-02) |
| Measures | Discreet mode, no employer/family roles, consent centre, access log; deterministic Crisis Gate + human SLA; in-country hosting and LLM in v1, synthetic-only MVP; k < 10 + complementary suppression; clinician confirms every step; claim validator + templates |
| Residual risk | Medium (coercive family access; self-report limits). Acceptable for a supervised pilot with clinical governance; re-assess after 3 months |
| Open questions for DoH | Programme statistics: opt-out vs opt-in; retention of F-22 text when S4 is on; whether de-identified facts sent to an in-country LLM still need explicit consent (S3) in v1 |
| Consultation | v1: facility DPO, DoH (data privacy and AI teams), ADPHC programme, patient advisory group incl. Arabic- and Urdu-speaking users and women |
| Sign-off | v1: controller's DPO + clinical safety officer before go-live |

## 6. Cross-border transfer
| Flow | MVP | v1 |
|---|---|---|
| Hosting (Vercel, Render, Neon) | Outside the UAE (EU regions), **synthetic data only** | Azure UAE North / Core42 only; Azure Policy blocks other regions |
| LLM (Gemini Developer API) | Google does not commit a processing location for the Gemini Developer API; the brief's source [11] covers **Vertex AI**, a different product [S]. Only de-identified structured synthetic facts go to M-01, and only with scope S3 on (off ⇒ template-only); M-02 free text only if enabled. Paid tier (prompts not used for product improvement) [V]; logging disabled | Azure OpenAI UAE North regional deployment or self-hosted Jais; no PHI leaves the UAE (Federal Law 2/2019 Art. 13) |
| Judge free text | **Leak path:** a judge could type real personal text. Controls: warning on the input, synthetic banner, Crisis Gate runs locally first, M-02 off by default in the demo (`LLM_CRISIS_SECOND_OPINION=false`), no free text in M-01, raw text not stored without scope S4 (F-22) | n/a |
| Telemetry | Grafana Cloud (optional), PII-free | In-region only |
| Any de-identified data sharing (research, MBZUAI, sponsors) | None | Only with DoH authorisation (Circular 147/2022) and a data-sharing agreement |

## 7. Privacy by design checklist
- [x] Data minimisation: no Emirates ID, no employer, no location
- [x] Purpose limitation: each field has a purpose (§2)
- [x] Default private: SMS/WhatsApp off, physical context off, free-text storage off, AI-drafted summaries asked with explanation, share-with-receiving-provider asked at the moment it is needed
- [x] Transparency: access log, AI labels, "why this step?"
- [x] Security: see [SECURITY_ARCHITECTURE](SECURITY_ARCHITECTURE.md)
- [x] PII-free logs (allow-list) and telemetry
- [x] Aggregates suppressed: n < 10 shown as "<10" + complementary suppression
- [ ] v1: DPA with each facility, DoH approvals, DPIA sign-off, native-speaker review of notices
