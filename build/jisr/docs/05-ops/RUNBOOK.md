# Runbook
> Project: Jisr · Owner: Tech lead (ops) + Clinical lead (safety) · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Observability](OBSERVABILITY.md) · [Deployment](DEPLOYMENT.md) · [CI/CD](CICD.md) · [Pitch & demo script](../00-overview/PITCH.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [Privacy](../06-security-compliance/PRIVACY.md) · [Risk register](../06-security-compliance/RISK_REGISTER.md)

Tags: **[V]** verified primary source · **[S]** secondary · **[U]** unverified.

## 1. On-call basics
| | MVP (hackathon, 18–20 Nov 2026 + judging) | v1 (pilot) |
|---|---|---|
| Tech on-call | Whoever owns the backend (named in [TEAM](../08-project/TEAM.md)); phone on loud during judging | 24/7 rota, 2 engineers, 15-min response for SEV-1 |
| Clinical on-call | Not applicable: no real patients; RED queue is synthetic | Facility's on-call clinician owns RED episodes; Jisr never replaces the facility's crisis protocol |
| Tools | Render + Vercel dashboards, GitHub Actions, team chat webhook | Azure Monitor, incident channel, status page |

**Golden rule: the Crisis Gate fails closed** (brief §5, cross-cutting safety rules). If the gate errors or times out, the system treats the input as RED: it shows emergency guidance (999, 800-SAKINA 800 725462, 800-HOPE 800 4673) at once and opens a RED episode for human review. This is automatic in code (`CRISIS_FAILSAFE=red`, the only accepted value), not an operator action. Over-triggering is acceptable; missing is not. Fail safe, never silent.

## 2. Severity levels
| Sev | Definition | Examples | Response |
|---|---|---|---|
| SEV-1 | Safety control failed or could fail, or data breach | Crisis gate false negative or error; SLA scheduler dead; RED alerting broken; PHI exposed | Immediate; all hands; consider kill switch (§4.1) |
| SEV-2 | Core flow down, no safety impact | API down; DB down; deploy broken; redaction hit | 30 min |
| SEV-3 | Degraded | LLM slow/failing (templates take over); dashboard slow | Same day |
| SEV-4 | Cosmetic | Copy, layout | Backlog |

## 3. Incident flow
Detect (alert / user report) → declare in channel with severity → assign incident lead → mitigate first (rollback, flag off, kill switch) → communicate → fix → blameless post-incident review within 5 working days (v1) with action items in [BACKLOG](../08-project/BACKLOG.md). Any Crisis Gate miss also gets a new case in the crisis benchmark before the fix merges.

## 4. Playbooks (top 10 failures)

### 4.1 Crisis Gate error or suspected false negative (SEV-1)
1. **Gate errors / timeouts** are already handled by fail-closed: every affected input became a RED episode (`reason_code=GATE_FAIL_CLOSED`, metric `crisis_gate_fail_closed_total`). Expect a burst of RED episodes in the queue; coordinators acknowledge them (API-24), clinicians review and close them. Do **not** bulk-close them by script.
2. Find the cause (exception in logs by trace id, rules file failed to load, timeout). Fix forward or roll back ([CICD](CICD.md) §6). A rules file that fails to load must stop the API from starting, never start with an empty lexicon.
3. **Suspected false negative** (the gate ran and returned not-RED on a crisis input): reproduce from the reporter's description (raw free text is not stored without consent (F-22) and never logged, by design). Add the case to `ai/evals/datasets` as a failing case.
4. Fix lexicon / rule, bump the `crisis-lexicon` version, `evals.yml` must pass at 100%, deploy.
4. v1: notify the clinical safety officer; review all episodes since the last good ruleset version for missed triggers; consider adverse-event reporting (§5, and [MEDICAL_DEVICE](../06-security-compliance/MEDICAL_DEVICE.md) §6).

### 4.2 RED episode unacknowledged past 15 min (SEV-1)
Alert fires → escalation chain (on-call clinician + coordinator → duty manager at +5 min). **Roles (brief §5):** a coordinator (Khalid, P-04) *or* a clinician can acknowledge the RED episode (API-24, stops the SLA clock) and log contact attempts (API-25); **only a clinician can close a RED episode** (API-13) or confirm a step (API-12). Check the notification path works (`notifications_failed_total`). MVP: shows as a red banner in Khalid's console; in the demo this is the intended "SLA clock" visual.

### 4.3 SLA scheduler not ticking (SEV-1)
Check `sla_scheduler_last_tick_timestamp`. Restart the API (the scheduler is in-process in MVP). If two instances are running, scale to one (double ticks double-escalate). v1: separate worker with a Postgres advisory lock.

### 4.4 API down / 5xx
Render → Events/Logs. Last deploy bad → Rollback ([CICD](CICD.md) §6). DB connection errors → §4.5. Out of memory → raise the instance size. Demo day → switch the web to offline mode (§7.3) while fixing. While the API is unreachable the web client itself fails closed: any screening completion or free-text submit it cannot get a gate result for shows emergency guidance and queues the input for a RED episode once the API is back.

### 4.5 Database unavailable or slow
Neon/Render status page. Neon compute suspended → first query wakes it (cold start a few seconds); keep warm with the uptime check every 5 min. Connection exhaustion → use the pooled URL, pool size 5. Corruption or bad seed → `uv run python -m app.seed --reset` (synthetic only).

### 4.6 LLM failing, slow or over budget (SEV-3)
Validator and timeouts already fall back to templates. If failure rate > 30% or the Gemini API is down: set `LLM_PROVIDER=none` and restart. The demo still works; the "AI-drafted" panel shows "template" instead. Quota (429) → same. Spend alert → same, then investigate token usage per task.

### 4.7 Bad deploy (smoke failed)
Vercel Instant Rollback + Render Rollback. Re-run `deploy.yml` after the fix. Never hot-patch production by hand.

### 4.8 Redaction hit / PII in logs (SEV-2, potential privacy incident)
Identify the field and code path; hotfix the allow-list; purge affected log lines where the platform allows; in v1 follow §5.

### 4.9 Suspected credential leak (JWT secret, Gemini key, passcode, deploy hook)
Rotate immediately (Render env, GitHub secrets, AI Studio key, Render deploy hook "regenerate"). Rotating `JWT_SECRET` logs everyone out (acceptable). Check GitHub secret-scanning alerts and AI Studio usage for misuse.

### 4.10 Abuse of the public demo (spam, prompt injection attempts, scraping)
Rate limits on demo-login and API-04/API-18. Prompt-injection attempts are harmless by design (LLM cannot change scores/steps; validator blocks unsupported claims), but review `llm_validator_failures_total{reason="banned_claim"}`. Reset demo data (API-28 `POST /v1/demo/reset`, only available when `DEMO_MODE=true`; or `app.seed --reset` from the Render shell).

## 5. Breach and incident reporting (UAE / Abu Dhabi)
**MVP:** synthetic data only, so no reportable personal-data breach is expected. Still record any security incident in the incident log. If a judge or tester types **real** personal information and it leaks, treat it as a personal-data incident (v1 steps, best effort).

**v1 (Jisr as a DoH-licensed entity's processor / vendor).** Verify every row with DoH and counsel before the pilot.

| Obligation | Trigger | Deadline | To whom | Status |
|---|---|---|---|---|
| DoH Patient Healthcare Data Privacy Standard (2020): report deviations/breaches of healthcare data | Breach involving PHI of Abu Dhabi patients; covers vendors and service providers processing PHI | **Within 24 h of first knowledge** per Al Tamimi's summary; the DoH circular itself gives no deadline | DoH (via the licensed facility) | [S] 24 h; [V-ish] duty to report: DoH Circular 116/2020 |
| ADHICS incident management domain | Information security incidents at DoH-licensed entities | Containment/notification timings in ADHICS v2.0 not confirmed; one consultancy cites a 4-h containment window for high-risk incidents | DoH (ADHICS team, adhics@doh.gov.ae per DoH circular) | **[U]** read ADHICS v2.0 incident-management controls |
| UAE Cyber Security Council national Cyber Incident Response Framework / Plan (CIRF / CIRP, plan updated Jul 2026) | Significant cyber incidents; reporting through the National Cybersecurity Operations Centre | Not confirmed for healthcare | Cyber Security Council / aeCERT (TDRA), via sector regulator | [S] framework exists; timelines **[U]** |
| PDPL (Federal Decree-Law 45/2021) breach notice | Personal-data breach affecting privacy, for data **not** governed by sector health law (e.g. a staff user's contact details) | "Without delay" style wording; executive regulations status conflicting | UAE Data Office + affected persons | **[U]** |
| Medical-device vigilance | If Jisr is ever registered as SaMD (v1+), serious incidents / field safety actions | Per EDE vigilance rules | Emirates Drug Establishment | **[U]**, see [MEDICAL_DEVICE](../06-security-compliance/MEDICAL_DEVICE.md) |

**Procedure (v1):** T+0 detect → T+1 h incident lead + DPO + clinical safety officer convened, containment → T+4 h facts sheet (what data, how many persons, which facilities, still ongoing?) → **T+24 h notify the controlling facility(ies) and DoH** through the agreed channel (controller notifies; Jisr as processor notifies the controller first, contractually within 12 h) → notify affected persons when risk to them is high, using discreet-mode wording (no sensitive detail in SMS) → regulator follow-up reports → post-incident review.

Sources: Al Tamimi on the DoH privacy standard https://www.tamimi.com/news/abu-dhabi-uae-issues-standard-on-healthcare-data-privacy ; DoH Circular 116/2020 https://www.doh.gov.ae/-/media/Feature/Resources/Circulars/116--20201.ashx ; ADHICS https://www.doh.gov.ae/-/media/032019_ADHICS.ashx (fetch failed 2026-11-18) ; UAE CIRF https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/Cypersecurity/Cyber-Incident-Response-Framework ; CIRP https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/Cypersecurity/Cyber-Incident-Response-Plan

## 6. Backup and restore
| | MVP | v1 |
|---|---|---|
| What | Postgres (synthetic) + the seed script and `data/synthetic/` in git | Postgres (PHI), Key Vault keys, config |
| How | Neon PITR / Render snapshots; **the seed is the real backup** (`app.seed --reset` < 1 min) | Azure PG automated backups 35 days, geo-redundant to UAE Central; monthly restore drill |
| Test | Before demo day: drop DB → migrate → seed → full Judge Mode tour | Quarterly restore test, documented |

## 7. Demo-day emergency plan
Owner: presenter + tech lead. Rehearse every fallback at least once (hour 33–35 in [HACKATHON_PLAN](../00-overview/HACKATHON_PLAN.md)).

### 7.1 T-60 min checklist
- [ ] Reset seeded data (Judge Mode "Reset demo" → API-28, `DEMO_MODE=true`); run the full 3-minute tour once on the live link.
- [ ] Flags as rehearsed: `FF_CSSRS_ITEMS=false` unless C-SSRS terms confirmed (R-05), `FF_PHYSICAL_CONTEXT=true`, `FF_SIMULATION=true`.
- [ ] Mariam's persona has the *AI-drafted summaries* consent scope **on** (so the LLM panel shows); Imran's **off** (shows the template-only path, a good responsible-AI talking point).
- [ ] `/healthz` shows the expected commit; uptime check green; Render instance warm (no sleep).
- [ ] Crisis smoke: type the Arabic demo phrase → RED in < 1 s; Khalid's queue shows the 15-min clock.
- [ ] Gemini: one explain call succeeds; else set `LLM_PROVIDER=none` now, not on stage.
- [ ] Laptop: charger, phone hotspot tested, browser zoom 125%, Arabic keyboard enabled, notifications off, a second browser profile logged in as Khalid.
- [ ] Offline bundle (§7.3) loaded once in the browser so it is cached.
- [ ] Backup video on the laptop desktop **and** on a USB stick **and** unlisted online.

### 7.2 Decision ladder on stage (decide in ≤ 10 s, no debugging live)
| Symptom | Action |
|---|---|
| LLM slow or errors | Keep going: template text appears automatically. Say: "and if the model fails, Jisr falls back to safe templates — that is by design." |
| API slow (> 5 s) or down | Switch the toggle **Offline demo** (top-right in Judge Mode) → web serves the seeded offline bundle. |
| Venue Wi-Fi down | Phone hotspot. If that fails → localhost (§7.4). |
| Laptop / everything down | Play the backup video (3:00) and narrate over it. |

### 7.3 Offline seeded mode
`NEXT_PUBLIC_OFFLINE_DEMO=true` (or the Judge Mode toggle) makes the web app use a bundled, read-only snapshot (`apps/web/public/demo-snapshot.json`) of the seeded personas, episodes, dashboard numbers and a **client-side copy of the deterministic Crisis Gate lexicon** (the same `packages/rules` JSON), so the crisis demo still fires locally. The PWA service worker pre-caches the routes in the tour. LLM panels show template text. A visible "Offline demo — seeded data" badge stays on screen (honesty with judges).

### 7.4 Local fallback
`docker compose up -d db && cd services/api && uv run alembic upgrade head && uv run python -m app.seed --reset && uv run uvicorn app.main:app --port 8000` + `cd apps/web && pnpm build && pnpm start`, with `LLM_PROVIDER=none`. Pre-built and tested on the presenter's laptop the night before.

### 7.5 Backup video
3:00 max, 1080p, Arabic + English captions, recorded at hour 32 from the live link following the [PITCH](../00-overview/PITCH.md) demo script; the same file is the submission demo video.

## 8. After the hackathon (shutdown / handover)
Rotate all secrets (§4.9); set `DEMO_MODE` read-only or scale to zero; delete preview DB branches; keep the repo and `EVAL.md`; export the incident log. If a pilot follows, nothing from the MVP environment migrates: v1 starts clean in UAE North.

## 9. Disaster recovery (v1)
| Tier | RPO | RTO | Mechanism |
|---|---|---|---|
| Clinical data (Postgres) | 5 min | 1 h | Zone-redundant HA in UAE North; geo-restore to UAE Central |
| Crisis Gate + SLA worker | n/a (stateless) | 15 min | Redeploy images; the crisis panel and emergency numbers also work client-side if the API is unreachable |
| Notifications | 15 min | 1 h | Service Bus with retry; failover SMS provider |
DR drill twice a year; results reported to the facility's ADHICS officer.
