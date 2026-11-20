.PHONY: db api web test lint types evals seed

db:
	docker compose -f deploy/compose.dev.yml up -d db

api:
	cd services/api && uv run uvicorn app.main:app --reload --port 8000

web:
	cd apps/web && pnpm dev

seed:
	cd services/api && uv run python -m app.seed

test:
	cd services/api && uv run pytest
	cd apps/web && pnpm test

lint:
	cd services/api && uv run ruff check .
	cd apps/web && pnpm lint

types:
	cd services/api && uv run mypy app
	cd apps/web && pnpm typecheck

evals:
	cd ai/evals && uv run --project ../../services/api python run_evals.py
