# Deployment
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [CI/CD](CICD.md) · [Infrastructure](INFRASTRUCTURE.md) · [Runbook](RUNBOOK.md) · [Environment setup](../03-engineering/ENVIRONMENT_SETUP.md) · [Hackathon plan](../00-overview/HACKATHON_PLAN.md) · [Privacy](../06-security-compliance/PRIVACY.md)

Target: the live link and credentials the brief's deliverables require (§13), working by **hour 30** of the build so the last 6 hours are rehearsal, not firefighting.

## 1. One-time MVP setup (≈ 45 min, do it in hour 2, not hour 30)

### 1.1 Database (pick one)
**Option A — Neon (recommended: branching for previews)**
1. neon.tech → New project `jisr` → Postgres 16 → region AWS Frankfurt (`eu-central-1`) to sit next to Render Frankfurt.
2. Copy the pooled connection string. Convert the scheme for SQLAlchemy + psycopg 3: `postgresql+psycopg://USER:PASS@HOST/jisr?sslmode=require`.
3. Create a `staging` branch for previews.

**Option B — Render Postgres**
1. Render → New → PostgreSQL → name `jisr-db`, version 16, region Frankfurt, smallest paid plan (free DBs expire **[U]** check current policy).
2. Use the **Internal** connection URL from the API service (same region, no public hop).

### 1.2 API on Render
1. Render → New → Web Service → connect the GitHub repo → **Runtime: Docker**, Dockerfile path `services/api/Dockerfile`, Docker context `.` (repo root, so `packages/rules` is copied in).
2. Region **Frankfurt**. Instance **Starter** (always on; free instances sleep and cold-start ~30–60 s, fatal on stage).
3. Health check path `/healthz`. Pre-deploy command `uv run alembic upgrade head`.
4. **Auto-Deploy: Off** (CI deploys via hook). Settings → Deploy Hook → copy URL → GitHub secret `RENDER_DEPLOY_HOOK_URL`.
5. Environment (Render dashboard, never in the repo):

| Var | Value |
|---|---|
| `APP_ENV` | `production` |
| `DEMO_MODE` | `true` (synthetic demo) |
| `DATABASE_URL` | from 1.1 |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `JWT_TTL_MINUTES` | `120` |
| `JUDGE_PASSCODE` | 4 random words, see §5 |
| `CRISIS_FAILSAFE` | `red` (only accepted value) |
| `LOG_PEPPER` | `openssl rand -base64 32` |
| `CORS_ORIGINS` | `https://<web>.vercel.app` (exact origin, no wildcard) |
| `RULES_DIR` | `/app/packages/rules` |
| `LLM_PROVIDER` | `gemini` (switch to `none` in an emergency) |
| `GEMINI_API_KEY` | paid-tier key from a billing-enabled project, logging **disabled** (§6) |
| `GEMINI_MODEL` | a pinned, dated model id (not `gemini-flash-latest`) |
| `LLM_TIMEOUT_SECONDS` | `6` |
| `LLM_CRISIS_SECOND_OPINION` | `false` unless p95 < 2 s in rehearsal (brief M-02) |
| `SLA_RED_MINUTES` etc. | as in `.env.example` |
| `LOG_LEVEL` | `INFO` |

6. First deploy manually ("Manual Deploy → latest commit"), then run the seed once: Render Shell → `uv run python -m app.seed --reset`.

### 1.3 Web on Vercel
1. Vercel → Add New Project → import repo → **Root Directory `apps/web`**, framework Next.js, install `pnpm install --frozen-lockfile`.
2. Env (Production + Preview): `NEXT_PUBLIC_API_BASE_URL=https://<api>.onrender.com`, `NEXT_PUBLIC_DEFAULT_LOCALE=ar`, `NEXT_PUBLIC_DEMO_MODE=true`. Nothing secret is `NEXT_PUBLIC_*`.
3. Add `apps/web/vercel.json` with `{"git":{"deploymentEnabled":{"main":false}}}` so only `deploy.yml` ships production; PR previews stay on.
4. Functions region: nearest available to the UAE (`fra1`, or `dxb1` if offered **[U]**).
5. `vercel link` locally once; copy `orgId`/`projectId` from `.vercel/project.json` into GitHub secrets `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`; create a scoped token → `VERCEL_TOKEN`.

### 1.4 GitHub
1. Create environment `production` (restrict to `main`). Add the secrets and the variables `API_BASE_URL`, `WEB_URL` ([CICD](CICD.md) §4).
2. Add repo variable `GEMINI_MODEL` and secret `GEMINI_API_KEY` for the nightly live validator.
3. Turn on branch protection ([CICD](CICD.md) §7), secret scanning, push protection, Dependabot alerts.

## 2. Every release (automatic)
Merge to `main` → `deploy.yml`: CI + crisis evals → Render hook → wait for `/healthz` to report the new commit → Vercel prebuilt deploy → smoke (web 200, health, crisis gate returns RED). Total ≈ 8–12 min. Watch it in the Actions tab; if smoke fails, roll back ([CICD](CICD.md) §6).

## 3. Database migrations
- Alembic, one revision per PR, **expand-only** during the hackathon (add tables/columns, never drop/rename). Contract migrations wait until after judging.
- `EpisodeEvent` and `AuditLog` are append-only: the migration also creates a trigger that rejects `UPDATE`/`DELETE` on them (see [DATA_MODEL](../03-engineering/DATA_MODEL.md)).
- Seeds are idempotent (`app.seed --reset` drops and recreates synthetic rows only when `DEMO_MODE=true`; it refuses to run when `DEMO_MODE=false`). The same guard protects API-28 `POST /v1/demo/reset`: when `DEMO_MODE=false` the route is not registered (404), not merely forbidden.

## 4. Feature flags (env-driven, read at startup)
| Flag | Default (demo) | Effect |
|---|---|---|
| `DEMO_MODE` | `true` | Judge Mode login, seeded personas, "SYNTHETIC DATA" banner |
| `LLM_PROVIDER` | `gemini` | `none` → templates only (M-03), fully offline-capable |
| `LLM_CRISIS_SECOND_OPINION` | `false` | M-02 raise-only classifier |
| `NOTIFY_CHANNELS` | `inapp,sms_mock` | Mock SMS shows in a demo "phone" panel |
| `FF_CSSRS_ITEMS` | `false` | C-SSRS screener items in the Crisis Gate; stays off until licence terms are confirmed (R-05). PHQ-9 item 9 + lexicon run regardless |
| `FF_READ_ALOUD` | `true` | F-20 browser TTS |
| `FF_PHYSICAL_CONTEXT` | `true` | F-12 coordinated summary (still needs the person's share-physical-context consent) |
| `FF_SIMULATION` | `true` | F-16 simulation |
| `FF_SAHATNA_LAUNCH` | `false` | F-19 launch stub |
| `NEXT_PUBLIC_OFFLINE_DEMO` | `false` | Web serves the seeded offline bundle when the API is unreachable ([RUNBOOK](RUNBOOK.md) §7) |
| `CRISIS_FAILSAFE` | `red` | Fail-closed policy for gate errors/timeouts. `red` is the only accepted value; the API refuses to start otherwise (it is a declared policy, not a switch) |

Flags never weaken safety: no flag disables the Crisis Gate, its fail-closed behaviour, or clinician confirmation. Consent scopes (brief §5) are per-person runtime settings, not flags; e.g. with the person's *AI-drafted summaries* scope off, explanations are template-only whatever `LLM_PROVIDER` says.

Zero-downtime: Render keeps the old instance serving until the new one passes `/healthz`; Vercel swaps atomically. Expand-only migrations keep old code compatible with the new schema during the switch.

## 5. Judge Mode credentials handling
The brief requires "live link + credentials" (§13). Approach:
1. **One shared passcode** (`JUDGE_PASSCODE`, 4 random words from a password manager's passphrase generator, or `python -c "import secrets;print(secrets.token_urlsafe(12))"`). It unlocks API-22 `POST /v1/auth/demo-login`, which then lets the judge switch roles (Mariam, Imran, Dr Salma, Khalid, Programme lead) without further passwords.
2. Passcode lives only in Render env + the hackathon submission form field. **Not** in the README, the repo, the video or slides. The demo login page states "synthetic data only, do not enter real personal information".
3. Demo JWTs: HS256, 120-minute TTL, role claim, `demo=true` claim; the API refuses `demo=true` tokens when `DEMO_MODE=false`.
4. Rate limit demo-login to 10 attempts / IP / 10 min; lock the passcode after 100 failures in total (alert, [OBSERVABILITY](OBSERVABILITY.md) §5).
5. Seeded data resets nightly (cron job `app.seed --reset` at 03:00 GST) so one judge's actions don't break the next judge's tour, plus a "Reset demo" button visible only in Judge Mode, which calls API-28 `POST /v1/demo/reset` (available only when `DEMO_MODE=true`, judge-role token required, rate-limited to 1/min).
6. After judging closes: rotate `JUDGE_PASSCODE`, `JWT_SECRET`, `GEMINI_API_KEY`; keep the site up read-only or take it down ([RUNBOOK](RUNBOOK.md) §8).

`JUDGE_PASSCODE`, `CRISIS_FAILSAFE=red`, `NEXT_PUBLIC_OFFLINE_DEMO` and `LOG_PEPPER` are in `.env.example` (Demo / safety group).

## 6. Gemini key hygiene (demo)
- Use a **billing-enabled** (paid) Google AI Studio project: free-tier prompts may be used to improve Google products; paid-tier prompts are not [V] (https://aistudio.google.com/docs/pricing, fetched 2026-11-18).
- Gemini API logging: logs are only available for billing-enabled projects and, when logs are shared, may be reviewed [S] (https://ai.google.dev/gemini-api/docs/logs-policy). One secondary report says logging is **on by default for some new projects from 26 Oct 2026 [U]**: check AI Studio → Logs and turn it off for the Jisr project.
- Set a monthly spend cap in AI Studio billing (e.g. USD 20).
- Only **de-identified structured facts** go to M-01, and only for personas whose *AI-drafted summaries* consent scope is on (off ⇒ template-only). Free text goes to M-02 only when `LLM_CRISIS_SECOND_OPINION=true`, only after the deterministic gate has run, and is not stored unless the person consented (F-22).

## 7. v1 production deployment (Azure UAE North)
1. Terraform (`infra/azure`) applies network → Key Vault → Postgres → Container Apps → OpenAI → monitoring, with Azure Policy allowed locations = UAE North / UAE Central.
2. GitHub Actions authenticates with OIDC federated credentials (no stored cloud secret); images pushed to Azure Container Registry (UAE North); Trivy scan + SBOM before push.
3. Release train: staging deploy on merge → automated e2e (Playwright) + crisis eval against staging → **manual approval by clinical safety officer** (for rule/prompt changes) and tech lead → blue/green revision switch in Container Apps (traffic split 10% → 100%).
4. Migrations run as a Container Apps job before the traffic switch; expand/contract enforced by review.
5. `DEMO_MODE=false`, Judge Mode code path compiled out (build flag), UAE PASS + facility SSO only.
6. Data-residency evidence pack generated per release: resource inventory (all `uaenorth`/`uaecentral`), LLM endpoint region, log workspace region.
