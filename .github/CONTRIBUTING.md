# Contributing to Jisr

## Setup
Follow [ENVIRONMENT_SETUP](../docs/03-engineering/ENVIRONMENT_SETUP.md). Copy `.env.example` to `.env`.

## Branches
GitHub flow on `main`. Branch names: `feat/F-07-warm-handoff`, `fix/crisis-gate-arabizi`, `docs/pitch`, `chore/ci`. Details: [GIT_WORKFLOW](../docs/03-engineering/GIT_WORKFLOW.md).

## Commits
[Conventional Commits](https://www.conventionalcommits.org/): `feat(crisis-gate): add Urdu indirect phrases (F-03)`. Reference the feature ID.

## Pull request template
```
## What / why (feature F-xx, ticket JIS-xxx)
## Screenshots (UI) or sample output (engines)
## Tests added
## Safety checklist
- [ ] No real data, no secrets
- [ ] Crisis Gate untouched, or benchmark re-run (recall = 100%)
- [ ] No LLM decides a score/step/crisis clearance
- [ ] All new copy in en/ar/ur message files
```

## Review checklist
Correct IDs from PROJECT_BRIEF · tests for every branch · rules changed only in `packages/rules` with a version bump · no PII in logs · accessibility (labels, contrast, RTL).

## Definition of done
Merged to `main`, CI green (lint, types, tests, evals), deployed preview checked, docs updated if behaviour changed.
