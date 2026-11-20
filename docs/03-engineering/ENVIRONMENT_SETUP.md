# Environment Setup
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [README](../../README.md) · [CLAUDE.md](../../CLAUDE.md) · [Tech stack](TECH_STACK.md) · [Testing](TESTING.md) · [Deployment](../05-ops/DEPLOYMENT.md)

Goal: from a clean machine to the Judge Mode tour running locally in **under 20 minutes**. All data is synthetic.

## 1. Prerequisites

| Tool | Version | Check | Install |
|---|---|---|---|
| Git | 2.40+ | `git --version` | git-scm.com |
| Docker Desktop (Windows/macOS) or Docker Engine + Compose v2 (Linux) | Compose v2 | `docker compose version` | docker.com |
| Node.js | 22 LTS (Next.js 16.4.6 needs ≥ 20.9.0) | `node -v` | nodejs.org, or `nvm` / `fnm` |
| pnpm | via Corepack (version pinned in `apps/web/package.json` `packageManager`; npm latest is 12.21.0 on 2026-11-18) | `pnpm -v` | `corepack enable` |
| Python | 3.12 | `python --version` | python.org, or `uv python install 3.12` |
| uv | latest (0.13.9 on PyPI, 2026-11-18) | `uv --version` | docs.astral.sh/uv |
| Optional: Java 11+ | — | — | Only if you regenerate the cohort with Synthea |

Windows: use **PowerShell** or **Git Bash**; enable WSL 2 for Docker Desktop. Keep the repo on a path without spaces (e.g. `C:\dev\jisr`).

## 2. Quick start (all platforms)

```bash
git clone <repo-url> jisr && cd jisr
cp .env.example .env               # Windows PowerShell: Copy-Item .env.example .env
# Edit .env: set JWT_SECRET (>= 32 random bytes), JUDGE_PASSCODE, and optionally GEMINI_API_KEY.
# No key? set LLM_PROVIDER=none (templates only; everything else works).

docker compose -f deploy/compose.dev.yml up -d db  # Postgres 16 on localhost:5432 (user/pass/db = jisr)

# API
cd services/api
uv sync                            # creates .venv from uv.lock
uv run python -m app.seed   # creates tables + synthetic data (also automatic on first API start)
uv run python -m app.seed --reset --seed 42 --scenario judge_tour
uv run uvicorn app.main:app --reload --port 8000
# -> http://localhost:8000/healthz and http://localhost:8000/docs

# Web (new terminal)
cd apps/web
pnpm install
pnpm gen:api                       # TS types from ../../packages/contracts/openapi.yaml
pnpm dev                           # http://localhost:3000/ar  -> Judge Mode at /ar/judge
```

Generate a JWT secret:
- macOS/Linux: `openssl rand -base64 48`
- Windows PowerShell: `[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))`

## 3. Platform notes

### Windows 11
- Docker Desktop with WSL 2 backend. If port 5432 is taken by a local Postgres, change the compose port mapping to `"5433:5432"` and update `DATABASE_URL`.
- `uv` install: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (official installer), or `winget install astral-sh.uv`.
- Line endings: `git config core.autocrlf input` to avoid CRLF in shell scripts and JSON rules (hash checks are on canonical JSON, but scripts in `scripts/` need LF).
- Long paths: `git config --system core.longpaths true` if `node_modules` paths fail.

### macOS (Apple Silicon or Intel)
- `brew install git uv node@22` then `corepack enable`.
- Docker Desktop or OrbStack both work with `docker compose`.

### Linux (Ubuntu 22.04/24.04)
- Docker Engine + `docker-compose-plugin`; add your user to the `docker` group.
- `curl -LsSf https://astral.sh/uv/install.sh | sh`; Node via `fnm install 22`.

## 4. Seed synthetic data

`python -m app.seed` (from `services/api`) loads, in order:

1. Rules from `packages/rules/*.v1.json` → activates the `rule_set_versions` row (prints version and SHA-256).
2. Providers from `data/synthetic/providers.json` (~40 synthetic providers).
3. Staff personas: Dr Salma (clinician), Khalid (coordinator, on call), Programme lead.
4. Person personas: Mariam (ar, Thiqa), Imran (ur, Basic plan).
5. IFHAS bundles from `data/synthetic/ifhas/*.json` via the same code path as API-19.
6. Simulated cohort (default 5,000) for the programme dashboard and F-16, generated with the fixed seed.
7. Scenario extras: `judge_tour` (one RED in Khalid's queue, Mariam ready to screen), `busy_queue`, `empty`.

Options: `--reset` (truncate person-linked tables first), `--seed 42`, `--scenario judge_tour|busy_queue|empty`, `--cohort 5000`. In a running demo, API-28 (`POST /v1/demo/reset`) does the same.

## 5. Running tests and evals

```bash
# API
cd services/api
uv run ruff check . && uv run ruff format --check . && uv run mypy app
uv run pytest                       # needs the docker Postgres for integration tests
uv run pytest -m engines            # fast, no DB

# Web
cd apps/web
pnpm lint && pnpm typecheck && pnpm test
pnpm exec playwright install --with-deps chromium   # first time only
pnpm exec playwright test

# Evals (writes EVAL.md at the repo root; fails if crisis recall < 100%)
cd ai/evals && uv run python run_evals.py
```

## 6. Configuration reference

All variables are in [`.env.example`](../../.env.example) with comments. The ones you will touch:

| Var | Local default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://jisr:jisr@localhost:5432/jisr` | SQLite (`sqlite:///./jisr.db`) works for quick UI work only: no append-only triggers, integration tests skip |
| `DEMO_MODE` / `JUDGE_PASSCODE` | `true` / set your own | Enables API-22 and API-28 |
| `LLM_PROVIDER` | `gemini` or `none` | `none` = templates only |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | empty / `gemini-3.6-flash` | Paid-tier key; synthetic data only |
| `LLM_CRISIS_SECOND_OPINION` | `false` | M-02; always off in Judge Mode |
| `FF_CSSRS_ITEMS` | `false` | Off until C-SSRS terms confirmed (R-05) |
| `SLA_*`, `RECHECK_DAYS` | 15 min / 48 h / 14 d / 14 d | Overrides of `packages/rules/sla.v1.json`, logged at startup |
| `JOBS_ENABLED` | `true` | Runs APScheduler in this process (set `false` on extra replicas). *Not yet in `.env.example`; add it* |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | |
| `NEXT_PUBLIC_OFFLINE_DEMO` | `false` | Demo-day fallback to bundled seed data |

## 7. Full stack in Docker (optional)

For a laptop demo fallback without local toolchains, `infra/docker-compose.full.yml` (to be added by the tech lead by H+20) builds `services/api` and `apps/web` images and runs them with `db`:

```bash
docker compose -f deploy/compose.dev.yml -f infra/docker-compose.full.yml up --build
```

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `connection refused` on 5432 | `docker compose ps`; start `db`; check port clash (see Windows note) |
| API refuses to start: "rules hash mismatch" / "schema invalid" | A rules file changed without a version bump or has invalid JSON; run `uv run python -m app.rules.loader --check` |
| API refuses to start: "DEMO_MODE in production" | `APP_ENV` must be `development` locally |
| `/healthz` shows `last_sweep_at` stale | `JOBS_ENABLED=false` or scheduler crashed; check logs for `sla_sweep` |
| Explanations always "template" | `LLM_PROVIDER=none`, missing `GEMINI_API_KEY`, consent `ai_drafted_summaries` off, or validator rejected output (see `explanation_records.validator_findings`) |
| Arabic shows boxes / wrong shaping | Fonts not loaded; clear `.next` cache, check `next/font` config |
| CORS error in browser | Add your web origin to `CORS_ORIGINS` |
| `pnpm` not found | `corepack enable` (Node ≥ 22) |
| Playwright browsers missing | `pnpm exec playwright install --with-deps chromium` |
| `uv sync` fails on Windows with long paths | Enable long paths; move repo closer to drive root |
