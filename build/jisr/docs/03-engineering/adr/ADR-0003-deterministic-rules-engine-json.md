# ADR-0003: Deterministic rules engine over versioned JSON; LLM explains only
> Project: Jisr · Owner: Clinical safety lead (with Backend lead) · Status: Accepted · Last updated: 2026-11-18
> Related: [Backend](../BACKEND.md) · [Architecture](../ARCHITECTURE.md) · [AI evals](../../04-ai/AI_EVALS.md) · [ADR-0006](ADR-0006-crisis-gate-raise-only-llm.md)

- **Deciders:** Tech lead, Backend lead, clinical advisor
- **Date:** 2026-11-18
- **Technical story:** F-03, F-05, F-10, F-15, F-18; R-01, R-02, R-10

## Context and problem statement
Scores, crisis triggers, step levels, reliable change, SLA deadlines and fairness suppression are clinical or governance decisions. The challenge statement names "unvalidated advice" and "weak crisis handling" as harms, and the DoH Responsible AI Standard (2025) stresses transparency [S]. Where does decision logic live, and what is the LLM allowed to do?

## Decision drivers
- Every decision must be reproducible and explainable factor by factor
- Clinicians must be able to review rule changes as diffs, with citations
- The eval harness (F-18: 150 crisis utterances, 60 step cases, 200 explanation cases) must run in seconds, offline
- A non-deterministic model must never decide a score, a step or a crisis clearance

## Considered options
1. **Versioned JSON rules in `packages/rules` + pure Python engines in `services/api/app/engines`; LLM explain-only**
2. LLM decides the step with a rubric prompt; humans review
3. A rules DSL / BRMS (e.g. Drools, json-logic everywhere)
4. Thresholds hard-coded in Python

## Decision outcome
Chosen option 1.
- Rules files (flat, `*.v1.json`): `phq2`, `gad2`, `phq9`, `gad7`, `cssrs_screen` (behind feature flag `FF_CSSRS_ITEMS`, off until licence terms are confirmed, R-05), `crisis_triggers`, `crisis_lexicon`, `crisis_lines`, `episode_open`, `steps`, `rci`, `sla`, `fairness`, `transitions`, `banned_claims`, plus `manifest.json` (versions, SHA-256, citations: DoH Standard of Care 2025, NICE CG123, Kroenke 2001, Spitzer 2006). Each has a JSON Schema in `packages/rules/schema/`.
- `steps.v1.json` encodes the brief §6 table: separate PHQ-9 and GAD-7 bands, **the higher instrument wins**, L4 for GAD-7 needs a complexity flag, modality is a preference *within* a level.
- `episode_open.v1.json`: open when PHQ-9 ≥ 10 or GAD-7 ≥ 10 or item 9 > 0, or on self-referral.
- Engines are pure functions (no I/O, clock passed in). Every output carries `rule_id`s, which the UI shows as factors.
- At boot the API hashes the bundle and records or activates the matching `rule_set_versions` row (E-17). Every score and recommendation stores the rule-set version.
- The LLM (M-01) only turns already-decided facts into plain language, behind the claim validator, with templates (M-03) as fallback. M-02 may only raise crisis risk ([ADR-0006](ADR-0006-crisis-gate-raise-only-llm.md)).
- A clinician confirms every step (API-12).

### Consequences
- Good: the safety case is short and testable; judges can read the rules.
- Good: the CLAUDE.md rule "thresholds live only in `packages/rules`" is enforceable by a test that scans engines for numeric literals in comparisons.
- Bad: ranking with tie-breaks still needs Python; JSON stays declarative and the algorithm stays in tested code.
- Bad: SLA values are also exposed as env vars (`SLA_*` in `.env.example`). Resolution: `sla.v1.json` holds the defaults; env vars are demo-time overrides, and every override is logged at startup and reported on `/healthz`.

### Confirmation
- `pytest -m engines` with Hypothesis property tests (scores in range; adding a crisis signal can never lower the step; the step equals the more severe instrument's band).
- CI fails if a rules file changes without a version bump in `manifest.json`.
- `ai/evals/run_evals.py` writes `EVAL.md` at the repo root; step agreement must be ≥ 95% and crisis recall 100%.

## Pros and cons of the options
### LLM decides
- Good: handles nuance.
- Bad: non-reproducible, hard to validate, contradicts "AI only explains" and R-02.
### Rules DSL / BRMS
- Good: expressive.
- Bad: learning curve; JVM; not easier for clinicians to read than JSON.
### Hard-coded
- Good: fastest to type.
- Bad: no versioning, no citations, no shared reading by the PWA.

## MVP vs v1
- **MVP:** rules v1.0.0 drafted by the team from the cited standards; reviewed by any available clinical advisor; labelled "not clinically validated".
- **v1:** a clinical governance board signs off each rule version; change log published; alignment with the DoH AI Clinician Framework and RAI Standard reviewed [S].

## More information
Thresholds: PHQ-9/GAD-7 bands (brief §6, refs [8][9]); stepped care NICE CG123 [10]; DoH Standard of Care [5].
