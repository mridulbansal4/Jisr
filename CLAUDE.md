# CLAUDE.md — instructions for AI coding agents working on Jisr

## Project summary
Jisr turns a positive mental-health screen (PHQ-9 / GAD-7) into a measured hand-off to the right stepped-care level (L0–L4, RED). Deterministic engines decide, a clinician confirms, and the LLM (Gemini) only drafts plain-language text behind a claim validator. It is a hackathon MVP for DoH Abu Dhabi's Future Health challenge (C10). **The source of truth is `docs/00-overview/PROJECT_BRIEF.md`.**

## Commands
| Task | Command |
|---|---|
| DB | `docker compose up -d db` |
| API install | `cd services/api && uv sync` |
| API dev | `uv run uvicorn app.main:app --reload --port 8000` |
| Seed / reseed | `uv run python -m app.seed` (tables are created and seeded automatically on first start; SQLite by default, set `DATABASE_URL` for Postgres) |
| API test / lint / types | `uv run pytest` · `uv run ruff check .` · `uv run mypy app` |
| Web install / dev | `cd apps/web && pnpm install && pnpm dev` |
| Web test / lint / build | `pnpm test` · `pnpm lint && pnpm typecheck` · `pnpm build` |
| E2E | `pnpm exec playwright test` (from `apps/web`) |
| Evals | `cd ai/evals && uv run python run_evals.py` (fails if crisis recall < 100%) |

## Architecture in 10 lines
1. `apps/web` — Next.js App Router PWA: person app, clinician console, coordinator queue, programme dashboard, Judge Mode.
2. `services/api` — FastAPI; `app/engines/{scoring,crisis_gate,step_matcher,rci,sla,fairness}.py` are pure, deterministic functions.
3. `packages/rules/*.v1.json` — versioned rules (instruments, crisis lexicon, step rules). Engines load them; never hard-code thresholds.
4. Episodes are a state machine. Every transition appends an `EpisodeEvent` (append-only). State is derived, never edited in place.
5. The Crisis Gate runs **before** any LLM call on every screening completion and every free-text input.
6. `app/llm/provider.py` — `LLMProvider` interface: `gemini` | `azure_openai` | `local` | `none`.
7. `app/llm/validator.py` — rejects LLM output containing any number/date/instrument/provider/phone not present in the input facts, or a banned claim → template fallback.
8. APScheduler jobs check SLA deadlines every minute and escalate.
9. Fairness views suppress any cell with n < 10.
10. FHIR R4 shapes for import/export (`QuestionnaireResponse`, `ServiceRequest`, `Task`, `Consent`, `Provenance`).

## Code conventions
Python: ruff + mypy strict on `app/engines`; Pydantic models for every IO. TypeScript strict; server components by default; all strings via next-intl (`messages/{en,ar,ur}.json`), never inline copy. Conventional Commits. See [CODING_STANDARDS](docs/03-engineering/CODING_STANDARDS.md).

## Folder rules
- Clinical thresholds live only in `packages/rules`. A rule change = bump the version + cite the source in the JSON. SLA defaults live in `packages/rules/sla.v1.json`; `.env` may override them (logged at startup).
- Prompts live only in `ai/prompts/` (versioned files), loaded by name.
- Synthetic data lives only in `data/synthetic/`. **Never add real patient data anywhere.**

## Do
- Write a unit test for every engine branch, including missing/contradictory inputs.
- Add a crisis-benchmark case whenever you touch the Crisis Gate or lexicon.
- Keep the three content types separate in the UI: Observed · Calculated · AI-drafted.

## Don't
- Don't let an LLM decide a score, a step or a crisis clearance. LLMs may only *raise* crisis risk (M-02).
- Don't add an employer, insurer or family-admin role.
- Don't log free text or PII. Logs carry IDs only (see [OBSERVABILITY](docs/05-ops/OBSERVABILITY.md)).
- Don't claim diagnosis, therapy or validated clinical performance in copy.
- Don't commit secrets; use `.env` (see `.env.example`).

## Security / PII
Synthetic data only. Treat every field as if real: encrypt at rest in v1, role-based access, audit every read of an episode (`AuditLog`). See [SECURITY_ARCHITECTURE](docs/06-security-compliance/SECURITY_ARCHITECTURE.md) and [PRIVACY](docs/06-security-compliance/PRIVACY.md).

## Key docs
[PROJECT_BRIEF](docs/00-overview/PROJECT_BRIEF.md) · [ARCHITECTURE](docs/03-engineering/ARCHITECTURE.md) · [API_SPEC](docs/03-engineering/API_SPEC.md) · [DATA_MODEL](docs/03-engineering/DATA_MODEL.md) · [PROMPTS](docs/04-ai/PROMPTS.md) · [AI_EVALS](docs/04-ai/AI_EVALS.md) · [HACKATHON_PLAN](docs/00-overview/HACKATHON_PLAN.md) · [MAP](docs/MAP.md)
