# Metrics
> Project: Jisr · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](PRD.md) · [Data model](../03-engineering/DATA_MODEL.md) · [API spec](../03-engineering/API_SPEC.md) · [AI evals](../04-ai/AI_EVALS.md) · [Responsible AI](../04-ai/RESPONSIBLE_AI.md) · [Observability](../05-ops/OBSERVABILITY.md)

**Principle:** measure care received, not messages sent or minutes in the app. No engagement metric (sessions, streaks, time-in-app) is a success metric for Jisr.

**MVP vs v1.** In the hackathon every number comes from the **synthetic cohort** and is labelled "synthetic" or "simulated" on screen. In v1 the same definitions run on pilot data. Targets marked "set at pilot" are agreed with ADPHC against a baseline measured at the pilot sites (owner: Product lead, at pilot kick-off).

All metrics are computed from the append-only EpisodeEvent log (E-07) plus E-03/E-04/E-05/E-10/E-11, through API-16 (aggregate) and API-17 (subgroups). Thresholds come from `.env.example` (`SLA_RED_MINUTES=15`, `SLA_REFERRAL_ACCEPT_HOURS=48`, `SLA_FIRST_APPOINTMENT_DAYS=14`, `RECHECK_DAYS=14`, `SMALL_CELL_K=10`) and `packages/rules`.

---

## 1. North star
**Completed hand-off within timeframe** = share of positive-screen episodes (L1–L4, excluding RED-only episodes) where the person **attended** the clinician-confirmed level of care within that level's target time.

```
NSM = count(episodes with ATTENDED at confirmed level AND (attended_at − screened_at) ≤ target_days(level))
      ÷ count(episodes entering SCREENED_POSITIVE, level L1–L4, in the cohort window)
```
- Target days: L1 = first self-help module started ≤ 7 days (proposed); L2–L3 = `SLA_FIRST_APPOINTMENT_DAYS` (14); L4 = 28 days (proposed override, A-05 in the PRD).
- MVP: shown as **simulated** baseline vs Jisr (F-16). v1 target: set at pilot.
- Why: it is the C10 "conversion gap" expressed as one number, and it cannot be gamed by engagement.

## 2. C10 KPIs (statement outcomes)
Source of the KPI list: C10 statement, https://hack2skill.com/event/futurehealthchallenge/

| # | KPI | Definition / formula | Data | MVP target | v1 target |
|---|---|---|---|---|---|
| K1 | **Successful hand-off** | Referrals with provider `accepted` within `SLA_REFERRAL_ACCEPT_HOURS` ÷ referrals created (API-07). Secondary: % confirmed steps (L2–L4) that produce a referral within 24 h | E-10, E-07 | Shown on synthetic cohort | Set at pilot |
| K2 | **Follow-up within timeframe** | (a) Episodes with first appointment ATTENDED ≤ target days ÷ referred episodes; (b) re-checks completed within `RECHECK_DAYS` ± 3 days ÷ re-checks due | E-11, E-04 | Shown | Set at pilot |
| K3 | **Waiting time** | Median and 90th percentile days: SCREENED_POSITIVE → BOOKED, and SCREENED_POSITIVE → ATTENDED, by level | E-07 | Shown (simulated vs baseline) | Set at pilot; report P90, not just median |
| K4 | **Symptom / functioning improvement (RCI)** | % episodes with ≥ 1 re-check showing **reliable improvement**; % **reliable recovery** (reliable improvement AND post score below caseness); % **reliable deterioration** (method §2.1). Functioning: v1 adds a validated functioning measure (candidate WSAS — to be chosen with the clinical group, owner PL, by 2027-01-31) | E-04 | Computed on synthetic trajectories | Set at pilot |
| K5 | **Crisis-response completion** | RED episodes with clinician acknowledgement ≤ `SLA_RED_MINUTES` AND documented contact outcome + disposition (US-11) ÷ all RED episodes. Report median minutes to acknowledgement | E-05, E-07 | 100% in the scripted demo | ≥ 95%; every breach reviewed within 72 h |
| K6 | **Adverse events** | Count and rate per 1,000 episodes, by category (§2.2) | E-07, incident log | 0 in demo; taxonomy implemented | Every event reviewed; rate reported monthly |
| K7 | **Fairness** | Each of K1–K5 and the NSM split by **age band, gender, nationality group, language, geography** (and insurance plan); disparity ratio vs best-performing group; cells n < `SMALL_CELL_K` suppressed (§2.3) | E-01 + all | Table with suppressed cells on synthetic data | Disparity ratio ≥ 0.8 for every subgroup (heuristic, see §2.3) or a written remediation plan |

### 2.1 Reliable change index (RCI) method
Jacobson & Truax (1991), https://doi.org/10.1037/0022-006X.59.1.12:
```
S_E    = SD_baseline × sqrt(1 − r_xx)
S_diff = sqrt(2 × S_E²)
RCI    = (score_recheck − score_baseline) ÷ S_diff
reliable change if |RCI| > 1.96 ; improvement if negative (lower score = better)
```
- `SD_baseline` and `r_xx` (reliability) per instrument are stored in the versioned rule file with their citation; the engine never hard-codes them (CLAUDE.md folder rules).
- Practical threshold check: NHS Talking Therapies commonly uses a reliable-change threshold of ≥ 6 points for PHQ-9 and ≥ 4 for GAD-7 — **not verified against the source in our research files**; use only as a sanity check on the computed values (owner: AI, verify by 2026-11-19 H12).
- Caseness: PHQ-9 ≥ 10 and GAD-7 ≥ 10 (consistent with the brief's L2 band). NHS Talking Therapies uses GAD-7 ≥ 8 (unverified); alternative documented in the rule file.

### 2.2 Adverse-event taxonomy
| Code | Event | Detected by |
|---|---|---|
| AE-01 | Missed crisis: a later RED (or clinician report) where an earlier input in the same episode should have triggered the gate | Benchmark review + clinician report |
| AE-02 | RED SLA breach (no acknowledgement within 15 min) | SLA job |
| AE-03 | Self-harm or emergency presentation reported during an open episode | Clinician report (v1) |
| AE-04 | Reliable deterioration after a step-down | RCI engine |
| AE-05 | Unsupported clinical claim shown to a user (validator miss) | Human review sample + user report |
| AE-06 | Privacy incident (data shown to a person or role without consent; notification revealing topic) | Audit review, user report |
| AE-07 | Lost to follow-up after RED | Ledger |
| AE-08 | Episode closed without evidence (should be impossible; detect regressions) | Nightly check |

### 2.3 Fairness dimensions and rules
| Dimension | Groups (v1; MVP uses the same on synthetic data) |
|---|---|
| Age band | 18–29 (highest stress group per QoL survey), 30–44, 45–59, 60+ |
| Gender | Female, male (as recorded) |
| Nationality group | Emirati; other Arab; South Asian; other Asian; Western; other |
| Language | Arabic, English, Urdu (MVP); more in v2 |
| Geography | Abu Dhabi region, Al Ain region, Al Dhafra region |
| Insurance | Thiqa, Basic, Enhanced |

Rules:
- **Suppression:** any cell with n < `SMALL_CELL_K` (10) shows "suppressed"; **complementary suppression** hides the next-smallest cell in the same row/column so the suppressed value cannot be derived from totals.
- **Disparity ratio** = rate(group) ÷ rate(best group). Flag < 0.8. The 0.8 cut-off borrows the "four-fifths" heuristic from employment testing; it is a screening flag, not a legal or clinical standard.
- **Synthetic caveat (R-11):** gaps in MVP reflect how the synthetic cohort was generated, not real inequity. The dashboard says so.
- No subgroup analysis is shown to any role below Programme (P-05), and none at individual level.

## 3. Input metrics (levers the team controls)
| Metric | Definition | MVP target |
|---|---|---|
| Screen completion rate | Screenings completed ÷ started (API-01 → API-03) | Shown |
| Explanation success | Explanations served by LLM that passed validation ÷ LLM attempts; template fallback rate | Shown; 0 unsupported claims shown |
| Step confirmation latency | Median hours STEP_RECOMMENDED → STEP_CONFIRMED | Shown |
| Clinician override rate | Confirm-step calls that change the level ÷ all confirmations; by direction | Shown (it tests the rules) |
| Provider decline rate | Declines ÷ decisions, by reason | Shown |
| Re-match success | Declined referrals re-accepted elsewhere within SLA | Shown |
| Consent revocations | Revocations by consent type per 100 persons | Shown |
| Crisis Gate latency | p50 / p95 server ms for API-04 | p95 < 1 s |
| Crisis Gate recall / FPR | On the adversarial benchmark (F-18) | Recall 100%; FPR reported |

## 4. AARRR funnel (adapted to a care pathway)
| Stage | Jisr meaning | Event(s) |
|---|---|---|
| Acquisition | Person starts a screen or an IFHAS result arrives | `screening_started`, `fhir_import_completed` |
| Activation | Screen completed and, if positive, explanation viewed | `screening_completed`, `explanation_viewed` |
| Retention | Person stays in the pathway: booking, attendance, re-check | `referral_created`, `appointment_attended`, `recheck_completed` |
| Referral | Warm hand-off accepted by provider (not "invite a friend") | `referral_decision` (accepted) |
| Revenue (v1) | Billable enrolled episode under a B2G contract | `episode_closed` (v1 billing report) |

## 5. Drop-off reasons (first-class measure)
Recorded on exits to `DECLINED_BY_PERSON`, `LOST_TO_FOLLOW_UP`, `DECLINED_BY_PROVIDER`:
`cost_concern` · `no_preferred_language` · `no_preferred_gender` · `wait_too_long` · `prefers_self_help` · `stigma_privacy_concern` · `time_off_work` · `already_in_care` · `no_response` · `provider_no_capacity` · `provider_out_of_network` · `other_free_text_blocked` (free text is never stored in analytics).

## 6. Analytics event taxonomy
Rules:
- **Server-side first.** Most events are derived from EpisodeEvents written by the API; the web app emits only UI events that have no server equivalent.
- **No PII and no free text** in any event. IDs are internal UUIDs; demographics are joined server-side for fairness views only, never attached to client events.
- **No third-party analytics SDKs** (no Google Analytics, no ad pixels). MVP stores events in Postgres table `analytics_event`; v1 keeps them in-country.
- Naming: `snake_case`, `object_action`, past tense. Common properties on every event: `event_id`, `occurred_at` (UTC), `actor_role` (`person` | `clinician` | `coordinator` | `provider` | `programme` | `system`), `episode_id` (nullable), `locale` (`ar` | `en` | `ur`), `rule_set_version` (when a rule was applied), `demo` (bool), `synthetic` (bool).

| Event | Extra properties | Trigger | Source |
|---|---|---|---|
| `screening_started` | `screening_id`, `entry_point` (`app` \| `sahatna_link` \| `qr` \| `judge`) | API-01 succeeds | API |
| `screening_item_answered` | `screening_id`, `instrument`, `item_no` | API-02 per item (values not logged) | API |
| `screening_expanded` | `screening_id`, `phq2`, `gad2` | Short screen positive → full instruments | API |
| `screening_completed` | `screening_id`, `phq9_band`, `gad7_band`, `positive` | API-03 succeeds | API |
| `fhir_import_completed` | `bundle_id_hash`, `resources_count` | API-19 succeeds | API |
| `fhir_import_failed` | `error_code` | API-19 422 | API |
| `crisis_gate_evaluated` | `source` (`item9` \| `cssrs` \| `lexicon` \| `m02`), `result` (`red` \| `clear`), `latency_ms`, `rule_ids` | Every gate run (API-03, API-04, API-19, API-10) | API |
| `crisis_gate_failed_closed` | `error_code` | Gate exception or timeout | API |
| `crisis_screen_viewed` | `trigger` (`gate` \| `help_button`), `offline` | Crisis screen rendered | Web |
| `crisis_line_tapped` | `line` (`999` \| `sakina` \| `hope`) | `tel:` link tapped | Web |
| `red_episode_acknowledged` | `minutes_to_ack` | Coordinator acknowledges | API |
| `crisis_response_completed` | `contact_outcome`, `disposition`, `minutes_to_complete` | US-11 | API |
| `explanation_requested` | `provider` (`gemini` \| `azure_openai` \| `local` \| `none`) | API-18 | API |
| `explanation_validated` | `result` (`passed` \| `rejected` \| `timeout`), `reason_code`, `latency_ms`, `tokens_in`, `tokens_out` | Validator finishes | API |
| `explanation_viewed` | `content_type` (`ai_drafted` \| `template`) | Explanation rendered | Web |
| `step_recommended` | `level`, `factors` (codes only) | API-06 | API |
| `preference_set` | `pref_type` (`gender` \| `language` \| `modality`) | Person changes a preference | Web → API |
| `step_confirmed` | `level`, `changed` (bool), `reason_code` | API-12 | API |
| `provider_search_performed` | `results_count`, `network` | API-15 | API |
| `referral_created` | `referral_id`, `level`, `sla_due_at` | API-07 | API |
| `referral_decision` | `referral_id`, `decision` (`accepted` \| `declined`), `reason_code`, `hours_to_decision` | API-08 | API |
| `referral_escalated` | `referral_id`, `cause` (`overdue` \| `declined`) | SLA job / decline | API |
| `referral_rematched` | `referral_id`, `new_referral_id` | Re-match | API |
| `appointment_booked` | `appointment_id`, `modality`, `days_from_screen` | API-09 (booked) | API |
| `appointment_attended` | `appointment_id`, `days_from_screen` | API-09 (attended) | API |
| `self_help_module_started` / `self_help_module_completed` | `module_code` | Module open / finish | Web → API |
| `recheck_due` | `days_since_last` | Scheduler | API |
| `recheck_completed` | `phq9_delta`, `gad7_delta`, `rci_class` (`improved` \| `no_change` \| `deteriorated`) | API-10 | API |
| `step_change_suggested` | `direction` (`up` \| `down`), `basis` (`rci`) | RCI engine | API |
| `episode_state_changed` | `from_state`, `to_state` | Every ledger transition | API |
| `episode_closed` | `closure_basis` (`evidence` \| `clinician_decision`), `reason_code` | API-13 | API |
| `episode_dropped` | `state` (`DECLINED_BY_PERSON` \| `LOST_TO_FOLLOW_UP`), `reason_code` (§5) | Ledger | API |
| `consent_changed` | `consent_type`, `granted` (bool) | API-14 PUT | API |
| `audit_log_viewed` | — | API-23 | API |
| `quick_exit_used` | — | Quick-exit tap | Web |
| `notification_sent` | `channel` (`inapp` \| `sms_mock` \| `whatsapp_mock`), `template_code` | F-21 send | API |
| `staff_queue_viewed` | `role`, `items_red`, `items_overdue` | API-11 | API |
| `summary_viewed` | `physical_context_shown` (bool) | One-screen summary opened | API |
| `programme_dashboard_viewed` | `view` (`funnel` \| `fairness` \| `simulation`) | API-16/17 views | API |
| `simulation_run` | `seed`, `params_hash` | API-21 | API |
| `judge_role_switched` | `to_role`, `persona` | API-22 | API |
| `judge_tour_step` | `step_no` | Tour advance | Web |

## 7. Dashboards
| Dashboard | Audience | Panels | MVP |
|---|---|---|---|
| Programme (F-15) | P-05 | NSM; funnel by state; K1–K5; waiting time by level (median, P90); RCI outcomes; drop-off reasons; adverse events; fairness table with suppression; simulation (F-16) labelled "simulated" | Yes |
| Coordinator ops (F-11) | P-04 | RED count and oldest RED age; overdue referrals; declined awaiting re-match; SLA breach log | Yes (queue view) |
| Safety & AI (internal) | Team / clinical group | Gate latency p95; recall/FPR from last eval run; validator reject rate and reasons; LLM token cost; template fallback rate | `EVAL.md` + CI in MVP; live panel in v1 |
| Engineering health | Team | API error rate, p95 latency, scheduler lag, uptime | See [OBSERVABILITY.md](../05-ops/OBSERVABILITY.md) |

## 8. Metric governance
- Metric definitions are versioned in this file; a change requires PL approval and a CHANGELOG entry.
- Simulated numbers are never mixed with measured numbers on one chart without a label.
- A metric that drives a pilot claim must be reproducible from the event log by a script in `services/api` (owner: BE, by 2026-11-20 H30 for MVP metrics).
