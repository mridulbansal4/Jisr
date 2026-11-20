# Personas
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](PRD.md) · [User journeys](USER_JOURNEYS.md) · [User stories](USER_STORIES.md)

Personas P-01 – P-05 are defined in the brief (§3). They are **composites built from published data**, not real people. We have not interviewed users for this hackathon. Quotes are therefore of two kinds and always labelled:
- **[Sourced]**: words from a published document or an organiser session, with the source.
- **[Illustrative]**: written by the team to express a pain the data supports. Not research evidence.

Facts marked **unverified** have no source in our research files and must not be used in the pitch as fact.

## Grounding data used across personas
| Fact | Source |
|---|---|
| 16.3% of Abu Dhabi adults (n = 2,019, Emirati and expat, stratified) screened moderate-to-severe on PHQ-9 | https://www.populationmedicine.eu/Depression-and-Anxiety-among-Adults-in-Abu-Dhabi-A-population-based-study,229332,0,2.html |
| Highest stress at ages 15–29; women and non-Emiratis worse (Abu Dhabi QoL Survey 2023–24, n = 65,203) | https://researchportal.bath.ac.uk/en/publications/mental-health-disparities-across-demographic-and-social-groups-in/ |
| IFHAS: free for Thiqa holders aged 18–75 at 150+ facilities; mental-health and anxiety screening added | https://wam.ae/en/article/b1ryawb-more-than-150-healthcare-facilities-across-abu · https://www.mediaoffice.abudhabi/en/health/abu-dhabi-public-health-centre-expands-comprehensive-screening-programme-ifhas-to-advance-community-health-and-preventive-care/ |
| Thiqa: government programme for UAE nationals; expats on employer Basic / Enhanced plans | https://u.ae/en/information-and-services/health-and-fitness/healthcare-access-and-insurance/getting-a-health-insurance |
| Sahatna (patient app) sign-in via UAE PASS; 300k+ downloads; all facilities integrated by 30 Nov 2026 | https://www.wam.ae/en/article/b5p217f-department-health-abu-dhabi-launches-sahatna · https://www.doh.gov.ae/-/media/73037D74C0A441AA8C69CF8E233FFE3E.ashx |
| DoH Standard of Care for Depression & Anxiety (Sep 2025) puts PHQ-2/GAD-2 → PHQ-9/GAD-7 in primary care | https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Standard-of-Care-Depression--Anxiety.ashx |
| 1,930 family physicians trained in common mental-health conditions; 180+ PHC centres | https://gulfnews.com/uae/health/abu-dhabi-advances-proactive-mental-healthcare-across-emirate-1.500629143 · https://www.doh.gov.ae/en/news/doh-primary-healthcare-model-elevates-the-patient-experience-enhances-quality-of-healthcare-services |
| C10 names barriers: stigma, uncertainty about where to go, fragmented pathways, uneven capacity | https://hack2skill.com/event/futurehealthchallenge/ |

---

## P-01 Mariam — the person who screened positive and froze
| Field | Detail |
|---|---|
| Demographics | 27, Emirati, female, single, junior government employee, Abu Dhabi city |
| Insurance | Thiqa (eligible for free IFHAS) |
| Device / network | Recent iPhone, home fibre + 5G; uses Sahatna and UAE PASS (Sahatna usage is plausible given UAE PASS sign-in; her device is an assumption) |
| Language | Arabic-first (Emirati dialect), good English; types Arabizi in chats (assumption) |
| Trigger | IFHAS check: GAD-7 = 13, PHQ-9 = 11 (both moderate) |

**Day in the life.** Office 7:30–15:00, family lunch, evenings with cousins. Sleep has slipped for months. She received a printed "please see a specialist" note at the IFHAS visit and put it in her bag.

**Pains.**
- Does not know whether "moderate" is serious, or what kind of clinician to see.
- Fears that her employer or family will find out (the C10 statement names stigma and sensitive-data disclosure as harms).
- Prefers a female, Arabic-speaking clinician; does not know who in her Thiqa network offers that.
- Booking means phone calls in working hours.

**Goals.** Understand the result in plain Arabic; one private, quick booking with the right person; nothing on her phone that a relative could notice.

**Current workarounds.** Googles symptoms; asks one trusted friend; postpones. (Illustrative, consistent with the statement's barriers.)

**Quotes.**
- [Sourced] The challenge describes "a continuing conversion gap between a positive screen and timely specialist follow-up" — C10 statement, hack2skill.
- [Illustrative] "Is a 13 bad? And if I go, does it go on some record my work can see?"

**What would make her stop using Jisr.** Any message preview that says "mental health"; being pushed to a psychiatrist when she wanted to talk to someone first; a chatbot trying to counsel her; being asked the same questions twice.

**Jisr features for her:** F-02, F-04, F-05, F-07, F-13, F-14.

---

## P-02 Imran — the expat worker the system loses
| Field | Detail |
|---|---|
| Demographics | 34, Pakistani, male, company driver, lives in shared accommodation, Mussafah (assumption); family in Pakistan |
| Insurance | Employer **Basic** plan (not eligible for IFHAS, which is for Thiqa holders) |
| Device / network | Mid-range Android, prepaid data, shared Wi-Fi; uses WhatsApp heavily (assumption; UAE device-ownership data **unverified**) |
| Language | Urdu (spoken); limited reading in Urdu and English; low literacy |
| Entry point | Not IFHAS. Reaches Jisr through an in-app screen (F-01), for example from a PHC visit, a Sahatna link or a clinic QR poster (v1 channel, assumption) |

**Day in the life.** 12-hour shifts, early starts, long waits between trips. Sends money home. Sleeps badly; constant worry about family and debt.

**Pains.**
- Cannot read long forms; answers randomly when rushed.
- Worries about cost (co-pays on a Basic plan) and that his employer will learn of a "mental" problem and cancel his visa (fear; legal basis not assessed).
- Does not know which clinics accept his plan or speak Urdu.
- Time off is hard; tele-consults outside shift hours would help.

**Goals.** Short, spoken questions; a clinician who speaks Urdu; known cost; nothing sent to his employer.

**Current workarounds.** Talks to roommates; ignores symptoms; visits a pharmacy for sleep aids (illustrative).

**Quotes.**
- [Sourced] Non-Emiratis report worse stress outcomes — Abu Dhabi QoL Survey analysis (Bath research portal, above).
- [Illustrative] "Tell me in Urdu, tell me how much it costs, and tell me my company won't know."

**What would make him stop.** Long text; English-only screens; any form asking for his employer; a cost surprise; SMS text that roommates could read.

**Jisr features for him:** F-01 (Urdu), F-20 (read-aloud), F-05/F-06 (Basic network, Urdu, tele), F-09, F-14, F-21 (SMS mock).

---

## P-03 Dr Salma — the family physician receiving hand-offs
| Field | Detail |
|---|---|
| Demographics | Family physician at a PHC centre, Abu Dhabi; one of the physicians trained in common mental-health conditions |
| Device | Clinic desktop with the facility EMR; personal phone |
| Language | Arabic and English |
| Time | 6 minutes per patient (brief §3) |

**Day in the life.** A full list of chronic-disease and acute visits; IFHAS follow-ups; paperwork; referrals now go to Malaffi as HL7 v2 REF (Circular 144/2026: https://www.doh.gov.ae/-/media/C01533BB56EE4A7D9B75107C89656941.ashx).

**Pains.**
- Mental-health results arrive without context: no trend, no physical findings next to them.
- No time to read long histories or re-administer instruments.
- Unsure about psychology/psychiatry capacity and wait in the patient's network.
- Fears liability if a risk sign is buried.

**Goals.** One screen: scores, trend, risk flags, physical context (HbA1c, BMI, sleep), recommended step with reasons; confirm in two clicks; know who owns the next step.

**Current workarounds.** Free-text referral letters; telling patients to "call the hospital".

**Quotes.**
- [Sourced] Inception's speaker asked for deterministic scoring kept separate from LLM narration, and for clinician-in-the-loop approval (`docs/research/research/01-facts.md`, organiser sessions).
- [Illustrative] "Give me the score, the trend and the risk on one page. I'll decide the step."

**What would make her stop.** AI text that sounds like a diagnosis; extra logins outside her EMR (v1 must launch from facility systems); alerts without owners.

**Jisr features for her:** F-10, F-11, F-12, F-19 (v1 launch path).

---

## P-04 Khalid — care coordinator / on-call clinician
| Field | Detail |
|---|---|
| Role | Care coordinator with an on-call clinician rota (e.g. a mental-health nurse or psychologist) |
| Device | Desktop + phone for alerts |
| Language | Arabic, English |

**Pains.** Crisis signals and overdue referrals live in different systems; no SLA clock; declined referrals disappear; cannot prove a crisis was handled.

**Goals.** One queue ordered RED → overdue → declined → unassigned; a visible 15-minute clock for RED; one place to document contact and disposition; automatic re-match when a provider declines.

**Quotes.**
- [Sourced] C05 owners asked for overdue / rejected / unassigned referrals to be visible and for ownership at every transition (`docs/research/research/A-organisers-judges.md`, Head of Screening row). Jisr applies the same discipline to C10.
- [Illustrative] "If someone tells the app they want to disappear, I need to know in minutes, not tomorrow."

**What would make him stop.** False alarms with no context; alerts he cannot act on; no way to record that he called the person.

**Jisr features for him:** F-03, F-07, F-08, F-11, F-21.

---

## P-05 Programme lead — ADPHC mental-health screening
| Field | Detail |
|---|---|
| Role | Programme lead for mental-health screening at ADPHC (persona; not a named official) |
| Device | Laptop; monthly reporting |

**Pains.** Screening volume is visible; outcomes are not. Cannot show conversion, time-to-care, symptom change or equity. Cannot see where people drop off or why.

**Goals.** Funnel from screen to attended care; waiting time by level; reliable improvement; crisis-response completion; adverse events; fairness by age, gender, nationality, language and geography with small cells suppressed; a simulation to argue for capacity.

**Quotes.**
- [Sourced] C10 asks for outcomes including adverse events and fairness across nationality and language (C10 statement).
- [Sourced, C04 session] ADPHC expert on the insurance-card-blocking lever: "Is this what we want going forward? The answer is no" (`docs/research/research/01-facts.md`). It shows the programme wants participant-driven engagement, not coercion.
- [Illustrative] "Tell me how many positive screens reached care within two weeks, and for whom it didn't work."

**What would make them stop.** Numbers that could identify individuals; dashboards without definitions; simulated numbers presented as real.

**Jisr features for them:** F-15, F-16, F-18.

---

## Anti-personas (who Jisr is not for)
- **Employers and insurers** wanting individual results: no such role exists in the data model (brief non-goals).
- **People seeking an AI therapist:** Jisr does not counsel; it routes to humans.
- **Children under 18:** out of scope for MVP (IFHAS is 18–75); v1 needs a guardian-consent design (owner: Product lead, decide before pilot proposal, 2026-12-05).
