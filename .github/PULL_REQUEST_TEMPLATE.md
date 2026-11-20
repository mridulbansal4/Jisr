## What and why
<!-- Reference feature ID (F-xx) or ticket (JIS-xxx) from docs/00-overview/PROJECT_BRIEF.md -->

## Screenshots or sample output
<!-- UI screenshots (desktop/mobile, AR/EN/UR) or engine/API output -->

## Tests added
<!-- Unit, integration, or eval cases added or updated -->

## Safety and quality checklist
- [ ] Tests pass (`cd services/api && uv run pytest` and `cd apps/web && pnpm test`)
- [ ] Lint passes (`cd services/api && uv run ruff check .` and `cd apps/web && pnpm lint`)
- [ ] Type checks pass (`cd services/api && uv run mypy app` and `cd apps/web && pnpm typecheck`)
- [ ] Crisis benchmark re-run (`cd ai/evals && uv run --project ../../services/api python run_evals.py`, recall = 100%)
- [ ] No real patient data, no PII in logs, and no secrets committed
- [ ] No LLM decides a score, stepped-care level, or crisis clearance
- [ ] All new user-facing copy is in `apps/web/messages/{en,ar,ur}.json`
