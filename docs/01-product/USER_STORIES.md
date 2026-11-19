# User Stories
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](PRD.md) · [Personas](PERSONAS.md) · [Features](FEATURES.md) · [Backlog](../08-project/BACKLOG.md) · [Testing](../03-engineering/TESTING.md)

Format: **US-xx** · persona · feature · priority (MoSCoW from the brief) · estimate (S ≤ 2 h, M 2–4 h, L 4–8 h of build time). Release: MVP (hackathon) unless marked v1. Gherkin scenarios are the acceptance tests; Playwright and pytest cases should reuse the scenario names.

## Epic index
| Epic | Stories | Features |
|---|---|---|
| A. Screening | US-01 – US-05 | F-01, F-02, F-20 |
| B. Crisis safety | US-06 – US-11 | F-03 |
| C. Explanation | US-12 – US-13 | F-04 |
| D. Step and directory | US-14 – US-17 | F-05, F-06 |
| E. Warm hand-off | US-18 – US-22 | F-07, F-21 |
| F. Episode ledger | US-23 – US-24 | F-08 |
| G. Waiting well and measurement | US-25 – US-28 | F-09, F-10 |
| H. Clinician console | US-29 – US-31 | F-11, F-12 |
| I. Privacy and control | US-32 – US-34 | F-13, F-14 |
| J. Programme | US-35 – US-37 | F-15, F-16 |
| K. Judge, eval, interoperability | US-38 – US-40 | F-17, F-18, F-19 |

---

## Epic A — Screening

### US-01 Short screen in my language
**As** Mariam (P-01), **I want** to answer a short screen in Arabic, **so that** I understand every question. · F-01 · Must · M
```gherkin
Feature: Short screening
  Scenario: Arabic PHQ-2 and GAD-2
    Given I open a new screening with locale "ar"
    When the screening starts (API-01)
    Then I see PHQ-2 and GAD-2 items in Arabic, one per screen
    And the layout direction is right-to-left
  Scenario: Below threshold
    Given PHQ-2 = 1 and GAD-2 = 2
    When I complete the screening (API-03)
    Then no episode is opened
    And I see L0 self-guided wellbeing content
```

### US-02 Expand to the full instruments when needed
**As** a person, **I want** the full PHQ-9 and GAD-7 only when my short screen is positive, **so that** I am not asked more than needed. · F-01 · Must · S
```gherkin
  Scenario: Expansion
    Given PHQ-2 = 3
    When I submit the short screen (API-02)
    Then the full PHQ-9 is presented, including item 9
  Scenario: Correct scoring
    Given PHQ-9 answers summing to 11 and GAD-7 answers summing to 13
    When I complete the screening
    Then InstrumentScore PHQ-9 = 11 band "moderate" and GAD-7 = 13 band "moderate"
    And an Episode is opened in state SCREENED_POSITIVE
```

### US-03 Urdu with read-aloud
**As** Imran (P-02), **I want** questions in Urdu that can be read aloud, **so that** I can answer without reading long text. · F-01, F-20 · Must (Urdu) / Could (audio) · M
```gherkin
  Scenario: Urdu read-aloud
    Given locale "ur" and a browser with an Urdu voice
    When I tap the play button on a question
    Then the question text is spoken
  Scenario: No voice available
    Given locale "ur" and no Urdu voice in the browser
    Then the play button is hidden and no error is shown
```

### US-04 Import my IFHAS result
**As** Mariam, **I want** my IFHAS screening result to arrive in Jisr, **so that** I don't repeat the questionnaire. · F-02 · Should · M
```gherkin
  Scenario: Seeded FHIR bundle
    Given a FHIR QuestionnaireResponse bundle with LOINC 44249-1 and 69737-5
    When it is posted to /v1/fhir/import (API-19)
    Then a ScreeningSession and InstrumentScores are created
    And the Crisis Gate is run on item 9 before an episode opens
  Scenario: Idempotent import
    Given the same bundle id is imported twice
    Then only one ScreeningSession exists
  Scenario: Malformed bundle
    Given a bundle missing the PHQ-9 item answers
    Then the response is 422 with the failing path
```

### US-05 Resume a screening
**As** a person, **I want** to continue where I stopped, **so that** an interruption doesn't lose my answers. · F-01 · Should · S
```gherkin
  Scenario: Resume
    Given I answered 4 of 9 PHQ-9 items and closed the app
    When I reopen the screening within 24 hours
    Then I continue at item 5 with earlier answers kept
```

## Epic B — Crisis safety

### US-06 Item 9 always triggers the crisis pathway
**As** Khalid (P-04), **I want** any PHQ-9 item 9 answer above 0 to trigger RED, **so that** no self-harm signal is missed. · F-03 · Must · M
```gherkin
Feature: Crisis Gate
  Scenario Outline: Item 9 positive
    Given PHQ-9 item 9 = <answer> and total score <total>
    When the screening is completed
    Then a CrisisEvent is created
    And the Episode state is RED_CRISIS
    And the person sees 999, 800-SAKINA and 800-HOPE with tel: links
    Examples:
      | answer | total |
      | 1      | 4     |
      | 3      | 22    |
```

### US-07 Indirect phrases in free text
**As** a person who types something indirect, **I want** the system to recognise risk in Arabic, Arabizi, English or Urdu, **so that** I am offered human help immediately. · F-03 · Must · L
```gherkin
  Scenario: Indirect Arabic phrase
    Given a free-text input containing an indirect Arabic phrase from the crisis lexicon
    When it is sent to /v1/crisis/check (API-04)
    Then the response is RED within 1 second
    And the response lists the matched rule ids
    And no LLM call is made for that text
  Scenario: Gate failure
    Given the lexicon service raises an error
    Then the result is RED (fail closed)
```

### US-08 LLM can only raise risk
**As** the product lead, **I want** M-02 to be able to add a RED flag but never remove one, **so that** AI can never clear a crisis. · F-03, M-02 · Must · M
```gherkin
  Scenario: Raise-only
    Given the deterministic gate returns RED
    When M-02 returns "no risk"
    Then the final result is RED
  Scenario: LLM adds RED
    Given the deterministic gate is clear and LLM_CRISIS_SECOND_OPINION=true
    When M-02 returns "risk"
    Then the final result is RED and the source is "M-02"
  Scenario: Slow LLM
    Given M-02 latency exceeds 2 seconds
    Then M-02 is skipped and the deterministic result stands
```

### US-09 Help button everywhere
**As** any person, **I want** an "I need help now" button on every screen, **so that** I can reach crisis numbers at once. · F-03 · Must · S
```gherkin
  Scenario: Offline help
    Given the PWA has been loaded once and the device is offline
    When I tap "I need help now"
    Then the crisis screen with phone numbers is shown
```

### US-10 RED lands in the on-call queue with a clock
**As** Khalid, **I want** RED episodes at the top of my queue with a 15-minute clock, **so that** I respond in time. · F-03, F-11 · Must · M
```gherkin
  Scenario: SLA clock
    Given a RED episode created at 10:00
    When I open the queue (API-11) at 10:05
    Then the item is first and shows 10 minutes remaining
  Scenario: Breach
    Given no acknowledgement by 10:15
    Then an ESCALATED event is appended and the item is marked "SLA breached"
```

### US-11 Document crisis response
**As** Khalid, **I want** to record contact and disposition, **so that** crisis-response completion is measurable. · F-03, F-08 · Must · S
```gherkin
  Scenario: Complete response
    Given a RED episode I have acknowledged
    When I record contact outcome "reached" and disposition "same-day assessment booked"
    Then an EpisodeEvent "crisis_response_completed" is appended with my staff id
    And the crisis-response completion metric counts this episode
  Scenario: False positive
    When I record disposition "false positive" with a reason
    Then the RED state can be exited only by this documented clinician decision
```

## Epic C — Explanation

### US-12 What this means and what it doesn't
**As** Mariam, **I want** a plain explanation of my scores, **so that** I know how serious it is without being diagnosed. · F-04 · Must · M
```gherkin
  Scenario: Validated explanation
    Given scores PHQ-9 = 11 and GAD-7 = 13 and locale "ar"
    When I request an explanation (API-18)
    Then I see "what this means" and "what it doesn't mean" sections
    And the text includes that this is a screen, not a diagnosis
    And AI-drafted text is labelled "AI-drafted"
```

### US-13 Unsupported claims are blocked
**As** the product lead, **I want** any LLM output with an unsupported claim replaced by a template, **so that** users never see invented clinical facts. · F-04, M-01, M-03 · Must · M
```gherkin
  Scenario: Validator rejects
    Given the LLM returns a sentence containing a number not in the input facts
    When the claim validator runs
    Then the output is rejected and the template text is shown
    And an ExplanationRecord stores validator_result = "rejected" with the reason
  Scenario: LLM disabled
    Given LLM_PROVIDER=none
    Then the template text is shown with no delay
```

## Epic D — Step and directory

### US-14 Recommended level with reasons
**As** Mariam, **I want** to see the recommended level of care and why, **so that** I trust the suggestion. · F-05 · Must · M
```gherkin
  Scenario: Transparent factors
    Given moderate scores and no RED trigger
    When I open the recommendation (API-06)
    Then I see the level (L2) and each factor: severity, preference, language, clinician gender, modality, insurance network, capacity
    And the RuleSetVersion id is stored with the StepRecommendation
```

### US-15 State my preferences
**As** Mariam, **I want** to choose clinician gender, language and tele vs in-person, **so that** I get care I will attend. · F-05 · Must · S
```gherkin
  Scenario: Preference changes ranking, not level
    Given I select female clinician, Arabic, tele
    When the recommendation refreshes
    Then providers matching all preferences rank first
    And the recommended level is unchanged
```

### US-16 Only providers I can use
**As** Imran, **I want** only providers in my Basic plan network, **so that** I don't face a cost surprise. · F-05, F-06 · Must · S
```gherkin
  Scenario: Network filter
    Given my plan is "Basic"
    When I search providers (API-15)
    Then every result lists "Basic" in its networks
```

### US-17 See waits honestly
**As** a person, **I want** to see the current wait for each option, **so that** I can trade speed against preference. · F-05, F-06 · Must · S
```gherkin
  Scenario: Wait and capacity
    Given a provider at capacity
    Then it shows "no capacity" and ranks below providers with capacity
```

## Epic E — Warm hand-off

### US-18 Request booking in three taps
**As** Mariam, **I want** to send a booking request in three taps, **so that** I don't have to phone during work. · F-07 · Must · M
```gherkin
  Scenario: Three taps
    Given a confirmed step (STEP_CONFIRMED)
    When I tap provider, tap time preference, tap "send request"
    Then a Referral is created (API-07) with an SLA deadline
    And the Episode moves to REFERRED
```

### US-19 Provider accepts or declines
**As** a receiving provider, **I want** to accept or decline a referral with a reason, **so that** the person is not left waiting. · F-07 · Must · S
```gherkin
  Scenario: Accept
    When the provider accepts (API-08)
    Then the Episode moves to ACCEPTED and the person is notified discreetly
  Scenario: Decline
    When the provider declines with reason "no capacity"
    Then the Episode moves to DECLINED_BY_PROVIDER and re-matching starts
```

### US-20 Overdue referrals escalate
**As** Khalid, **I want** referrals not accepted within the SLA to escalate to me, **so that** none goes silent. · F-07, F-08 · Must · S
```gherkin
  Scenario: Overdue
    Given a referral sent with SLA_REFERRAL_ACCEPT_HOURS = 48
    When 48 hours pass without a decision
    Then an ESCALATED event is appended and the item appears in my overdue list
```

### US-21 Automatic re-match on decline
**As** Mariam, **I want** another suitable provider offered if one declines, **so that** I don't start over. · F-07 · Should · M
```gherkin
  Scenario: Re-match
    Given my referral was declined
    Then the next-ranked provider that matches network and level is proposed
    And I confirm with one tap
```

### US-22 Discreet notifications
**As** Imran, **I want** messages that don't reveal their topic, **so that** roommates can't tell. · F-21, F-14 · Should · S
```gherkin
  Scenario: Neutral SMS
    Given I consented to SMS reminders
    When a reminder is sent via the SMS mock
    Then the text contains none of the banned topic words in any language
```

## Epic F — Episode ledger

### US-23 Every change is recorded
**As** the programme lead, **I want** every episode transition in an append-only log, **so that** metrics and audits are trustworthy. · F-08 · Must · M
```gherkin
  Scenario: Append-only
    Given an EpisodeEvent exists
    When any process tries to update or delete it
    Then the operation fails
  Scenario: Illegal transition
    Given an Episode in SCREENED_POSITIVE
    When a client requests BOOKED
    Then the API returns 409
```

### US-24 Closure needs evidence
**As** Dr Salma, **I want** closure to require attendance plus re-check, or my documented decision, **so that** "closed" means cared for. · F-08 · Must · S
```gherkin
  Scenario: Close without evidence
    Given an Episode with no ATTENDED event
    When a coordinator calls /close (API-13) without a clinician reason
    Then the API returns 422
```

## Epic G — Waiting well and measurement

### US-25 Self-help while waiting
**As** Mariam, **I want** short self-help modules while I wait, **so that** waiting feels like progress. · F-09 · Should · M
```gherkin
  Scenario: Module assigned
    Given my Episode is REFERRED
    Then I see 3 modules in my language and completion is recorded as SelfHelpAssignment
```

### US-26 Re-check reminder
**As** a person, **I want** a reminder to re-check after 14 days, **so that** my clinician sees change. · F-09, F-10 · Should · S
```gherkin
  Scenario: Reminder
    Given RECHECK_DAYS = 14 and reminder consent
    When 14 days pass since the last score
    Then a discreet reminder is sent
```

### US-27 Step-up suggestion on deterioration
**As** Dr Salma, **I want** a step-up suggestion when scores reliably worsen, **so that** I act early. · F-10 · Must · M
```gherkin
  Scenario: Reliable deterioration
    Given baseline PHQ-9 = 11 and re-check PHQ-9 = 18
    When the re-check is submitted (API-10)
    Then RCI indicates reliable deterioration
    And a step-up suggestion appears in my queue
    And the step does not change until I confirm (API-12)
```

### US-28 Step-down suggestion on improvement
**As** Dr Salma, **I want** a step-down suggestion when scores reliably improve below caseness, **so that** capacity goes to those who need it. · F-10 · Must · S
```gherkin
  Scenario: Reliable improvement
    Given baseline GAD-7 = 13 and re-check GAD-7 = 5
    Then RCI indicates reliable improvement and a step-down suggestion is shown
```

## Epic H — Clinician console

### US-29 My queue in priority order
**As** Dr Salma, **I want** episodes awaiting my confirmation ordered by urgency, **so that** I see the most important first. · F-11 · Must · M
```gherkin
  Scenario: Ordering
    Given RED, overdue, awaiting-confirmation and monitoring items
    When I open the queue (API-11)
    Then they appear in that order
```

### US-30 One-screen summary
**As** Dr Salma, **I want** scores, trend, risk, physical context and the recommendation on one screen, **so that** I decide within my 6-minute visit. · F-11, F-12 · Must/Should · M
```gherkin
  Scenario: Physical context with consent
    Given the person consented to share physical context
    Then I see HbA1c, BMI and sleep with source and date
  Scenario: Consent revoked
    Given the person revoked that consent
    Then the section shows "not shared by the person"
```

### US-31 Confirm or change the step
**As** Dr Salma, **I want** to confirm or change the recommended step with a reason, **so that** a clinician decides every step. · F-11 · Must · S
```gherkin
  Scenario: Change with reason
    When I change L2 to L3 with reason code "clinical judgement: complexity"
    Then the Episode moves to STEP_CONFIRMED with level L3
    And the override is recorded in the event log
```

## Epic I — Privacy and control

### US-32 Granular, revocable consent
**As** Mariam, **I want** to switch each sharing permission on or off, **so that** I control who sees what. · F-13 · Must · M
```gherkin
  Scenario: Immediate effect
    Given consent "share physical context with family physician" is on
    When I turn it off (API-14 PUT)
    Then the next request by Dr Salma does not return physical context
    And an AuditLog entry records the change
  Scenario: No employer option
    Then no consent option mentions employer or insurer
```

### US-33 Quick exit and discreet mode
**As** a person on a shared phone, **I want** a quick exit, **so that** nobody nearby sees the app. · F-14 · Should · S
```gherkin
  Scenario: Quick exit
    When I tap quick exit
    Then a neutral page replaces the app and back navigation does not return to Jisr content
```

### US-34 See who accessed my data
**As** Mariam, **I want** to see who viewed my episode, **so that** I trust the system. · F-13 · Should · S
```gherkin
  Scenario: Access log
    Given Dr Salma opened my summary
    When I call /v1/audit/me (API-23)
    Then I see her role, facility and time
```

## Epic J — Programme

### US-35 Conversion funnel and KPIs
**As** the programme lead (P-05), **I want** the funnel from screen to attended care, **so that** I can report conversion and waiting time. · F-15 · Must · M
```gherkin
  Scenario: Funnel
    When I open the dashboard (API-16)
    Then I see counts and rates for each state from SCREENED_POSITIVE to CLOSED
    And median days to first attended appointment by level
```

### US-36 Fairness with suppression
**As** the programme lead, **I want** KPIs by age, gender, nationality, language and geography with small cells hidden, **so that** I see inequity without identifying anyone. · F-15 · Must · M
```gherkin
  Scenario: Suppression
    Given a subgroup cell with n = 7
    When I open fairness (API-17)
    Then the cell shows "suppressed"
    And its value cannot be derived from the row total
```

### US-37 Simulate baseline vs Jisr
**As** the programme lead, **I want** a simulation of conversion with and without Jisr, **so that** I can argue for a pilot. · F-16 · Should · M
```gherkin
  Scenario: Reproducible
    Given seed 42 and default parameters
    When I run the simulation twice (API-21)
    Then both results are identical and labelled "simulated"
```

## Epic K — Judge, eval, interoperability

### US-38 Judge Mode tour
**As** a judge, **I want** to switch roles and follow a guided tour, **so that** I see the whole loop in 3 minutes. · F-17 · Must · M
```gherkin
  Scenario: Role switch
    Given I log in with Judge Mode (API-22)
    When I switch from Mariam to Khalid
    Then I see Khalid's queue without logging in again
```

### US-39 Evals gate the build
**As** the tech lead, **I want** CI to fail when crisis recall drops below 100%, **so that** safety regressions never ship. · F-18 · Must · M
```gherkin
  Scenario: Recall regression
    Given a lexicon change that misses one benchmark utterance
    When CI runs the eval job
    Then the job fails and EVAL.md is not updated
```

### US-40 Export the episode as FHIR
**As** an integration partner, **I want** an episode exported as a FHIR bundle, **so that** it can move to Sahatna or Malaffi adapters in v1. · F-19 · Could · M
```gherkin
  Scenario: Export
    When I call /v1/fhir/export/{episodeId} (API-20)
    Then I receive a Bundle with QuestionnaireResponse, ServiceRequest, Task, Consent and Provenance resources
```

---

## v1 stories (not in the hackathon build)
| ID | Story | Feature |
|---|---|---|
| US-41 | As Mariam, I sign in with UAE PASS so that I don't create another account | Auth (v1) |
| US-42 | As Dr Salma, I launch Jisr from my facility EMR / Sahatna context so that I don't log in twice | F-19 |
| US-43 | As Khalid, referrals are sent to Malaffi as HL7 v2 REF so that the facility meets Circular 144/2026 | Integrations (v1) |
| US-44 | As Khalid, I warm-transfer a RED case to 800-SAKINA operators under an agreed protocol | F-03 (v1) |
