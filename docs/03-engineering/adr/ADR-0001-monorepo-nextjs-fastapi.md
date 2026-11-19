# ADR-0001: Monorepo with a Next.js web app and a FastAPI service
> Project: Jisr · Owner: Tech lead · Status: Accepted · Last updated: 2026-11-18
> Related: [Architecture](../ARCHITECTURE.md) · [Tech stack](../TECH_STACK.md) · [Project brief](../../00-overview/PROJECT_BRIEF.md)

- **Deciders:** Tech lead, Frontend lead, Backend lead
- **Date:** 2026-11-18
- **Technical story:** whole build; R-06 (scope overrun), R-08 (demo failure)

## Context and problem statement
A team of 2–4 people who know JavaScript and Python has about 36 hours to ship a person app (Arabic/English/Urdu, RTL, mobile-first), a clinician console, a coordinator queue and a programme dashboard (~28 screens across four role views), all backed by deterministic clinical engines with tests. How do we lay out code and services so that the team moves fast and the crisis path stays simple?

## Decision drivers
- 36-hour window; no time for cross-repo version drift
- Clinical logic in one language with one test suite (the eval harness, F-18, calls the engines directly)
- One contract between web and API (`api/openapi.yaml`)
- Mobile-first web with strong i18n/RTL support
- Simple deploy: Vercel for web, one Docker service on Render

## Considered options
1. **Monorepo: Next.js (`apps/web`) + FastAPI (`services/api`) + shared `packages/rules`**
2. Next.js full-stack only (route handlers + TypeScript engines)
3. Separate repos for web and API
4. Django + HTMX server-rendered app

## Decision outcome
Chosen option 1. Layout (from the brief): `apps/web`, `services/api`, `packages/rules`, `ai/prompts`, `ai/evals`, `data/synthetic`, `infra`, `api/openapi.yaml`. Python owns the engines and the LLM layer (`google-genai` is the brief's Python SDK); TypeScript owns the UI. Rules are JSON, so both sides can read them (the PWA reads the crisis lexicon for its offline safety screen).

### Consequences
- Good: one PR can change rules, engine, API and UI together; one CI pipeline; TS types generated from OpenAPI (`openapi-typescript`).
- Good: the Python developers can unit-test clinical rules without a browser.
- Bad: two toolchains (pnpm + uv). Mitigated by [ENVIRONMENT_SETUP](../ENVIRONMENT_SETUP.md) and docker compose.
- Bad: an extra network hop from web to API. Acceptable: the crisis p95 budget (300 ms) is server-side.
- Follow-up: no workspace build tool (Turborepo/Nx) in the MVP; plain scripts are enough.

### Confirmation
CI runs `ruff`, `mypy`, `pytest` on `services/api` and `eslint`, `tsc`, `vitest`, `playwright` on `apps/web` in one workflow; `redocly lint api/openapi.yaml` gates both.

## Pros and cons of the options
### Next.js only
- Good: one language, one deploy.
- Bad: the brief fixes Python for the backend and the Gemini SDK; TS engines would duplicate the eval-harness logic.
### Separate repos
- Good: independent release cycles.
- Bad: contract drift; double setup cost in a 36-hour build.
### Django + HTMX
- Good: fast CRUD.
- Bad: weaker offline/PWA and RTL component ecosystem; the team's front-end skills are React.

## MVP vs v1
- **MVP:** single API container, single web app.
- **v1:** same repo; API scaled horizontally; jobs worker split into its own process from the same image (`JOBS_ENABLED=true` on one instance only).

## More information
Versions: Next.js 16.4.6, FastAPI 0.163.2 (registry lookups 2026-11-18, see [TECH_STACK](../TECH_STACK.md)).
