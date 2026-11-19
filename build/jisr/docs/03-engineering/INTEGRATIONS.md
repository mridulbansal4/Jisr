# Integrations
> Project: Jisr · Owner: Backend lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [API spec](API_SPEC.md) · [Data model](DATA_MODEL.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [ADR-0004](adr/ADR-0004-gemini-mvp-llmprovider-in-country-v1.md) · [ADR-0005](adr/ADR-0005-demo-auth-judge-mode-uae-pass-later.md)

Source tags: **[V]** confirmed in a primary source · **[S]** secondary (press, vendor, law firm) · **[K]** well-known reference · **[U]** unverified. Most UAE facts come from `research/B-context-and-data.md` (researched 2026-11-18).

## Summary

| System | Purpose | MVP (hackathon) | v1 (production) | Code |
|---|---|---|---|---|
| IFHAS results | Bring the positive screen and physical findings in | Seeded FHIR R4 bundle → API-19 | Feed via Malaffi / IFHAS portal under DoH approval | `app/integrations/fhir_mapper.py` |
| Sahatna | Where citizens already are | Deep link + SMART-style launch stub (F-19) | Sahatna module | `app/integrations/sahatna_launch.py`, `apps/web/app/[locale]/launch` |
| Malaffi | Referral visibility across facilities | FHIR export (API-20); HL7 v2 REF builder designed and unit-tested, not sent | REF messages via facility integration engine (Circular 144/2026) | `app/integrations/malaffi_ref.py` |
| UAE PASS | Citizen identity | Not used (Judge Mode JWT) | OIDC sign-in | `app/core/security.py` (v1 provider) |
| SMS / WhatsApp | Neutral reminders | Mock channels write to `notifications` | Licensed UAE provider; WhatsApp Business templates | `app/integrations/channels/` |
| Crisis lines | Human help now | Display + `tel:` links | Warm-transfer protocol with line operators | `packages/rules/crisis_lines.v1.json` |
| Gemini API | Narration (M-01), raise-only crisis signal (M-02) | `google-genai` 3.5.0, synthetic data only | Replaced by in-country provider | `app/llm/gemini.py` |
| In-country LLM | Residency-compliant narration | Interface stub | Azure OpenAI (UAE North) or self-hosted Jais | `app/llm/azure_openai.py`, `app/llm/local.py` |
| Provider directory | Network/language/gender-aware routing | Synthetic JSON (`data/synthetic/providers.json`) | DoH facility registry / IHE mCSD | `app/seed.py` |

---

## 1. IFHAS results (FHIR R4 import)

- **Context.** IFHAS is ADPHC's adult screening programme, free for Thiqa cardholders aged 18–75 at 150+ facilities [S] (WAM, Feb 2024). The 2026 expansion added mental-health screening [S] ([media office](https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/)). No public IFHAS API exists [U].
- **MVP.** `data/synthetic/ifhas/*.json` holds FHIR R4 `Bundle`s that we wrote. Each has a `Patient`, a `QuestionnaireResponse` per instrument (PHQ-9 LOINC 44249-1, GAD-7 69737-5), and optional `Observation`s (HbA1c 4548-4, BMI 39156-5, blood pressure 85354-9; wearable sleep data is v2). Judge Mode posts one to API-19.
- **Mapping.** `QuestionnaireResponse.item[].linkId` → `screening_sessions.answers`; total recomputed by our scorer (we never trust an imported total); `Observation` → `physical_contexts`. Bundles must carry `meta.tag = jisr#synthetic` while `DEMO_MODE=true`.
- **Validation.** Shape check with Pydantic; optional `fhir.resources.R4B` validation (see [TECH_STACK](TECH_STACK.md) note on R4 vs R4B).
- **Failure handling.** Missing items → 422 with FHIRPath locations; item 9 present and > 0 → Crisis Gate fires and the episode opens as `RED_CRISIS`; unknown codes → stored as warnings, not dropped silently.
- **Sandbox access.** None public. v1 path: DoH data-sharing approval (Circular 147/2022 requires DoH authorisation for sharing identified or de-identified health data [S]); owner Product lead.
- **Cost.** MVP none.

## 2. Sahatna (launch stub)

- **Context.** DoH's patient app (launched GITEX 2024) signs in with UAE PASS and already shows IFHAS screening [S] ([WAM](https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna)). Circular 170/2026 makes Sahatna integration mandatory for all facilities by **30 Nov 2026** [S] ([DoH PDF](https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx)).
- **MVP.** `GET /[locale]/launch?iss=<sahatna-stub>&launch=<opaque>&screening=<bundle-ref>` in the web app. The stub resolves `launch` against a local table of seeded contexts (persona + IFHAS bundle), calls API-19, then routes to the result screen. This mirrors the SMART App Launch 2.x EHR-launch shape ([spec](https://hl7.org/fhir/smart-app-launch/) [K]) without a real authorisation server.
- **v1.** A Sahatna module or SMART launch, depending on what DoH/ADHDS exposes. No public developer programme was found [U]; owner Product lead to ask DoH through the challenge co-creators by 2026-12-15.
- **Data exchanged.** Launch context only (patient reference, screening reference). No PHI in the URL: `launch` is an opaque one-time token.
- **Failure handling.** Unknown or expired `launch` → normal Jisr landing page with a "start screening" option.

## 3. Malaffi (HL7 v2 REF design)

- **Context.** Malaffi is Abu Dhabi's HIE (3,000+ facilities) [S]. **Circular 144/2026** (28 Jul 2026) requires every facility to send all referral transactions to Malaffi as **HL7 v2 REF messages**, with priority and SNOMED-coded specialty; compliance was due 31 Aug 2026 [S, from search extract of the [DoH PDF](https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx)]. No public Malaffi FHIR API was found [U].
- **MVP: design only.** `malaffi_ref.build_ref_i12(referral)` returns an HL7 v2.5.1 `REF^I12` (patient referral) string. A unit test checks segments and escaping. Nothing is sent.

Draft message (synthetic):

```
MSH|^~\&|JISR|JISR-DEMO|MALAFFI|ADHDS|20261119082100+0400||REF^I12^REF_I12|0193f1c0r001|T|2.5.1
RF1|P^Pending|R^Routine|MH^Mental health|||0193f1c0r001|20261119082100+0400|20261121082100+0400
PRD|RP|Synthetic^Clinician^^^Dr|...
PRD|RT|Tele-wellbeing Service (synthetic)|...
PID|1||SYN-000123^^^JISR^MR||Synthetic^Mariam||1999|F
PV1|1|O
DG1|1||<SNOMED CT reason code — chosen by clinical informatics lead in pilot set-up>^^SCT
OBX|1|NM|44261-6^PHQ-9 total score^LN||11|{score}|||||F
OBX|2|NM|70274-6^GAD-7 total score^LN||13|{score}|||||F
```

  - Segment set and field usage follow the base HL7 v2.5.1 Chapter 11 `REF^I12` structure [K]. **The Malaffi REF profile (required segments, SNOMED specialty value set, priority codes) is not public and is unverified.** Owner Backend lead; request the DoH/ADHDS implementation guide in the pilot phase.
  - Priority mapping: Jisr `routine/urgent/asap/stat` → RF1-2 codes per the Malaffi profile once known.
  - Consent filter applies: `OBX` for physical context only if `share_physical_context` is granted.
- **v1.** The facility that owns the referral sends the REF through its existing integration engine; Jisr hands it the message (or a FHIR `ServiceRequest` + `Task`) rather than connecting to Malaffi directly. ACKs (`ACK^I12`) update `referrals.hl7_ref_control_id` status.
- **Failure handling (v1).** NACK or timeout → retry with backoff ×3, then coordinator queue item "Malaffi send failed"; the clinical hand-off continues in Jisr regardless.

## 4. UAE PASS (v1)

- **Purpose.** Citizen and resident sign-in, as Sahatna already does [S].
- **Protocol.** OAuth 2.0 / OpenID Connect authorization-code flow. Developer docs: [docs.uaepass.ae](https://docs.uaepass.ae/) (reachable 2026-11-18). Staging and production environments exist; onboarding requires registration as a service provider through the UAE PASS / TDRA process [K, details unverified]. Owner Tech lead; start onboarding when a pilot sponsor is confirmed.
- **Data exchanged.** Subject identifier (stored as `persons.uae_pass_sub`), and, only if needed, profile claims (name, Emirates ID number → stored as an HMAC, never raw). Assurance level: require the verified account level for any record linking [U, check UAE PASS docs].
- **MVP.** Not used. Judge Mode issues HS256 JWTs ([ADR-0005](adr/ADR-0005-demo-auth-judge-mode-uae-pass-later.md)). The `AuthProvider` interface in `app/core/security.py` already separates "who is this" from "what may they do", so UAE PASS plugs in as a second provider.
- **Failure handling.** UAE PASS down → no new sign-ins; existing sessions continue to expiry; crisis page and numbers stay public and require no login.

## 5. SMS and WhatsApp (mock in MVP)

- **MVP.** `channels/sms_mock.py` and `channels/whatsapp_mock.py` implement `NotificationChannel.send(recipient, template_key, vars) -> provider_message_id`. They render the neutral template, write `notifications.status='sent'`, and print one log line with IDs only. The Judge Mode UI shows a phone-frame "inbox" that reads these rows.
- **Discreet mode (F-14).** All external texts use neutral templates ("You have a new message in your health app"). No words like "mental", "psychiatry", "crisis" in SMS/WhatsApp, ever. In-app text can be specific.
- **v1.** A licensed UAE SMS aggregator with a registered sender ID (TDRA sender-ID rules) [K, provider choice and pricing unverified]; WhatsApp Business Platform with pre-approved templates [K]. Inbound delivery receipts via HMAC-signed webhook (`/v1/hooks/sms-status`). Owner Product lead; get quotes by 2026-12-15.
- **Failure handling.** Send failure → retry ×2, then in-app only, and the coordinator sees "unreachable by SMS" on the episode. Crisis contact is never SMS-only: RED episodes need a human acknowledgement inside the 15-minute SLA.
- **Cost.** MVP AED 0.

## 6. Crisis lines

| Line | Number | `tel:` | Source |
|---|---|---|---|
| Emergency (police / ambulance) | 999 | `tel:999` | [7] in brief |
| 800-SAKINA (Abu Dhabi) | 800 725462 | `tel:800725462` | [7] in brief, [S] (Emirates 24/7, 2026) |
| 800-HOPE (national) | 800 4673 | `tel:8004673` | [7] in brief, [S] |

- Numbers live in `packages/rules/crisis_lines.v1.json` (and the `CRISIS_LINES` env var for display overrides); they are precached by the service worker so they work offline.
- **Verify before the demo:** call-check or confirm each number from an official DoH/NCEMA page (owner Product lead, by 2026-11-19 18:00). Secondary sources only so far.
- **v1:** agree a warm-transfer protocol with line operators (who calls whom, what data is passed with consent).

## 7. Gemini API (M-01, M-02)

- **SDK.** `google-genai` 3.5.0 (PyPI, released 2026-11-18). Model from env `GEMINI_MODEL`, default `gemini-3.6-flash` (pinned) (see the [models page](https://ai.google.dev/gemini-api/docs/models)).
- **Auth.** API key in `GEMINI_API_KEY` (Google AI Studio). Server-side only; never shipped to the browser.
- **Call shape.**

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.gemini_api_key)
resp = client.models.generate_content(
    model=settings.gemini_model,
    contents=[prompt_text, facts_json],
    config=types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json",
        response_schema=ExplanationOut,   # Pydantic model
        max_output_tokens=600,
    ),
)
```

- **Data sent.** Structured facts only (instrument, total, band, step, language, allowed phrases). No names, IDs or free text for M-01. M-01 is called only when the person has granted `ai_drafted_summaries`. M-02 receives free text, so it is allowed **only** on synthetic data, is off by default (`LLM_CRISIS_SECOND_OPINION=false`) and is always off in Judge Mode.
- **Residency.** The Gemini API gives no guaranteed UAE processing location (brief [11]). This is why the MVP is synthetic-only (R-03). Use a paid-tier key: Google's terms state paid-tier prompts are not used to improve products, while free-tier data may be [K, check the current Gemini API terms before submission].
- **Failure handling.** Timeout `LLM_TIMEOUT_SECONDS` (6 s), one retry on 429/503 with jitter, then templates (M-03). Circuit breaker opens after 5 consecutive failures for 60 s.
- **Cost.** Flash-tier pricing per million tokens is on Google's pricing page; an explanation is about 600 input + 300 output tokens. Exact AED cost is in [COST.md](../05-ops/COST.md) [U until re-checked].

## 8. In-country LLM (v1)

- **Options.** (a) Azure OpenAI in UAE North: model availability per region must be checked on Microsoft's model-availability table [U]. (b) Self-hosted Jais (Inception / MBZUAI) on in-country GPUs (Core42) [U on the exact model version named "Jais 3" in the brief].
- **Swap.** `LLM_PROVIDER=azure_openai` (env `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`) or `LLM_PROVIDER=local` (`LOCAL_LLM_BASE_URL`, OpenAI-compatible). The same prompts, validator and eval suite run against each provider; a provider is enabled only if it meets the same AI_EVALS thresholds ([ADR-0004](adr/ADR-0004-gemini-mvp-llmprovider-in-country-v1.md)).
- **Legal basis.** UAE Federal Law 2/2019 Art. 13 (no storage/processing of health data outside the UAE except where permitted) [S]; DoH Circular 147/2022 [S].

## 9. Provider directory

- **MVP.** `data/synthetic/providers.json`, ~40 synthetic providers across Abu Dhabi, Al Ain and Al Dhafra, tagged by step, language (ar/en/ur/hi/ml/tl), clinician gender, modality, network (thiqa/basic/enhanced), capacity and wait. All names are obviously synthetic.
- **v1.** DoH facility registry or an IHE mCSD endpoint [K] for real facilities and practitioners; capacity from booking systems (via Sahatna booking, Circular 170/2026). Owner Product lead.

## 10. Integration test matrix

| Integration | Test | Where |
|---|---|---|
| IFHAS import | Golden bundles: positive, negative, item-9 crisis, missing items, non-synthetic tag | `services/api/tests/integration/test_fhir_import.py` |
| FHIR export | Round-trip export → import yields the same scores | `tests/integration/test_fhir_roundtrip.py` |
| Malaffi REF | Segment/field snapshot test; escaping of `^~\&` in names | `tests/unit/test_malaffi_ref.py` |
| Sahatna stub | Playwright: launch URL → result screen in Arabic | `tests/e2e/launch.spec.ts` |
| Gemini | Recorded responses (no network in CI); a nightly live smoke test with a synthetic fact set | `tests/llm/test_gemini_provider.py` |
| Channels | Discreet templates contain no banned words | `tests/unit/test_templates_discreet.py` |
