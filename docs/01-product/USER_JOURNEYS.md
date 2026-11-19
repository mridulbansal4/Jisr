# User Journeys
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Personas](PERSONAS.md) · [PRD](PRD.md) · [User stories](USER_STORIES.md) · [UI spec](../02-design/UI_SPEC.md)

Current-state journeys are **inferred** from the C10 statement's named barriers (stigma, not knowing where to go, fragmented pathways, uneven capacity) and published data (see [PERSONAS.md](PERSONAS.md)). They are not observed. Scores in Mermaid `journey` charts are emotion scores (1 = very bad, 5 = very good).

---

## 1. P-01 Mariam

### Current state
```mermaid
journey
  title Mariam today: IFHAS positive screen to (no) care
  section IFHAS visit
    Completes PHQ-9 / GAD-7 at IFHAS: 3: Mariam
    Gets printed "see a specialist" note: 2: Mariam
  section Weeks 1-6
    Searches online what "moderate" means: 2: Mariam
    Unsure who is in Thiqa network and female: 1: Mariam
    Worries employer or family will find out: 1: Mariam
    Postpones, symptoms persist: 1: Mariam
  section Outcome
    No appointment after six weeks: 1: Mariam
```

### Future state with Jisr
```mermaid
journey
  title Mariam with Jisr
  section Result arrives
    IFHAS result imported (F-02), Crisis Gate clear: 3: Mariam, Jisr
    Reads "what this means / what it doesn't" in Arabic (F-04): 4: Mariam
  section Choose care
    Sees L2/L3 option with reasons: female, Arabic, Thiqa, tele (F-05): 4: Mariam
    Checks consent: nothing goes to employer (F-13): 5: Mariam
    Three taps to request booking (F-07): 5: Mariam
  section While waiting
    Provider accepts within SLA, Thursday tele-session: 5: Mariam, Provider
    Worry-time module + 14-day re-check (F-09, F-10): 4: Mariam
  section Outcome
    Attends; re-check shows reliable improvement: 5: Mariam, Dr Salma
```

### Flow
```mermaid
flowchart TD
  A[IFHAS FHIR bundle imported<br/>API-19] --> B{Crisis Gate<br/>F-03}
  B -- RED --> R[Crisis pathway<br/>see section 3]
  B -- clear --> C[Score bands<br/>PHQ-9 11 / GAD-7 13 = moderate]
  C --> D[Episode SCREENED_POSITIVE]
  D --> E[Explanation shown<br/>EXPLAINED]
  E --> F[Step Matcher<br/>STEP_RECOMMENDED]
  F --> G[Clinician confirms<br/>STEP_CONFIRMED API-12]
  G --> H[Referral + SLA timer<br/>REFERRED API-07]
  H --> I{Provider decision<br/>API-08}
  I -- accept --> J[ACCEPTED -> BOOKED API-09]
  I -- decline / overdue --> K[ESCALATED -> re-match]
  K --> H
  J --> L[ATTENDED -> MONITORING]
  L --> M[Re-check API-10 -> RCI]
  M --> N{Clinician decision}
  N -- step change --> F
  N -- evidence complete --> O[CLOSED API-13]
```

**Moments of truth.** (1) The first sentence of the explanation: it must reduce fear without false reassurance. (2) Seeing "nothing is shared with your employer" before tapping. (3) Provider acceptance arriving quickly.

**Note.** Mariam's demo route (tele-session with a female Arabic-speaking clinician) depends on open question OQ-03 in the [PRD](PRD.md): moderate scores map to L2 (family physician) by the brief's table; a tele-session may be an L2 teleconsult rather than L3.

---

## 2. P-02 Imran

### Current state
```mermaid
journey
  title Imran today
  section Symptoms
    Bad sleep, constant worry: 2: Imran
    Pharmacy sleep aid, talks to roommates: 2: Imran
  section Trying to get help
    Long English form at a clinic: 1: Imran
    Unsure if Basic plan covers it, fears cost: 1: Imran
    Fears employer will learn: 1: Imran
  section Outcome
    Gives up: 1: Imran
```

### Future state with Jisr
```mermaid
journey
  title Imran with Jisr
  section Screen
    Opens link, chooses Urdu (F-01): 4: Imran
    Questions read aloud, one per screen (F-20): 4: Imran
  section Result
    Short Urdu explanation, icons (F-04): 4: Imran
    Option: Urdu-speaking clinician, Basic network, tele after shift (F-05, F-06): 4: Imran
  section Hand-off
    Booking request, discreet SMS (F-07, F-14, F-21): 5: Imran
    Waiting-well sleep module (F-09): 4: Imran
  section Outcome
    Attends tele-session; re-check: 4: Imran, Provider
```

**Moments of truth.** Language choice on the first screen; cost/network shown before booking; SMS text that roommates cannot interpret.

**Edge cases.** No Urdu-speaking provider with capacity in his network → Step Matcher shows the trade-off (wait longer vs Arabic/English clinician with interpreter, v1) and flags a capacity gap to P-05. Shared phone → discreet mode on by default for SMS. Browser lacks an Urdu TTS voice → read-aloud hides gracefully.

---

## 3. Crisis path (any person → P-04 Khalid)

```mermaid
sequenceDiagram
  autonumber
  actor P as Person
  participant W as Web app
  participant API as API (FastAPI)
  participant G as Crisis Gate (deterministic)
  participant L as LLM (M-02, raise-only)
  participant Q as Coordinator queue
  actor K as Khalid (on-call)
  P->>W: Types indirect Arabic phrase in free text
  W->>API: POST /v1/crisis/check (API-04)
  API->>G: lexicon + item 9 + C-SSRS rules
  G-->>API: RED (matched rule ids)
  Note over API,L: M-02 only consulted if gate is clear and flag on;<br/>it can add RED, never remove it
  API->>API: CrisisEvent E-05, Episode -> RED_CRISIS, LLM locked
  API-->>W: RED response (< 1 s)
  W-->>P: Crisis screen: 999, 800-SAKINA, 800-HOPE (tel:)
  API->>Q: RED item, SLA 15 min
  Q-->>K: Alert with clock
  K->>API: Acknowledge, document contact + disposition
  API->>API: EpisodeEvent appended; crisis response complete
```

```mermaid
journey
  title Crisis moment: person and Khalid
  section Person
    Types a hopeless phrase: 1: Person
    Sees calm crisis screen with numbers in own language: 3: Person
    Gets a call from a clinician: 4: Person, Khalid
  section Khalid
    RED alert with 15-min clock: 3: Khalid
    Sees triggering rule, not raw chat history: 4: Khalid
    Documents contact and disposition: 4: Khalid
```

**Moments of truth.** The crisis screen appears in under a second and never shows AI text; the person sees human options first; Khalid's alert shows *why* it fired.

**Edge cases.** Gate service error → fail closed (RED). Person closes the app before seeing numbers → RED episode still created; Khalid's queue uses contact details only if consent and contact exist (MVP: synthetic). False positive (for example a quoted song lyric) → Khalid closes RED with reason "false positive", which feeds the benchmark review; the episode is never auto-cleared. Out of hours → v1 needs an on-call rota agreement; MVP shows the rota as synthetic.

---

## 4. P-03 Dr Salma

```mermaid
journey
  title Dr Salma: today vs Jisr
  section Today
    Receives referral letter with a single score: 2: Dr Salma
    No trend, no physical context: 2: Dr Salma
    Unsure of capacity downstream: 1: Dr Salma
  section With Jisr
    Opens queue item awaiting confirmation (F-11): 4: Dr Salma
    One-screen summary: scores, trend, RCI, HbA1c, sleep (F-12): 5: Dr Salma
    Confirms step in two clicks with reason codes (API-12): 5: Dr Salma
```

**Moments of truth.** The summary fits on one screen; the step recommendation shows its factors; confirming is faster than writing a letter.

**Edge cases.** Physical-context consent revoked → section shows "not shared by the person" (F-13). Disagreement with the rule → she changes the step with a reason; the change is logged and counted in metrics (override rate).

---

## 5. P-05 Programme lead

```mermaid
flowchart LR
  A[Episode events<br/>E-07] --> B[Aggregate metrics<br/>API-16]
  A --> C[Subgroup metrics<br/>API-17]
  C --> D{n < 10?}
  D -- yes --> E[Suppressed cell + complementary suppression]
  D -- no --> F[Shown]
  B --> G[Dashboard F-15]
  E --> G
  F --> G
  H[Simulation API-21<br/>labelled simulated] --> G
```

**Moments of truth.** Seeing drop-off reasons, not just counts; fairness gaps highlighted; simulated numbers visibly labelled.

**Edge cases.** All subgroups suppressed in a small pilot → dashboard explains why and shows the emirate-level total only.

---

## 6. Cross-journey edge cases
| Case | Expected behaviour | Feature |
|---|---|---|
| Person declines all options | `DECLINED_BY_PERSON`; L0 content offered; re-check reminder only with consent | F-08, F-09 |
| Lost to follow-up (no response after reminders) | `LOST_TO_FOLLOW_UP` after the configured window; appears in drop-off reasons | F-08, F-15 |
| Score improves before appointment | RCI shows improvement; clinician may step down; appointment kept unless the person cancels | F-10 |
| Score worsens while waiting | Step-up suggestion to clinician; item 9 > 0 → RED | F-10, F-03 |
| Network says provider at capacity | Matcher ranks next provider; wait shown | F-05, F-06 |
| LLM down or validator rejects | Template explanation, no visible error | F-04, M-03 |
| Language switched mid-flow | Answers preserved | F-01 |
| Quick exit pressed | Neutral page, history state replaced | F-14 |
