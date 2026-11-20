# Tech Stack
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [Environment setup](ENVIRONMENT_SETUP.md) · [ADR-0001](adr/ADR-0001-monorepo-nextjs-fastapi.md) · [ADR-0004](adr/ADR-0004-gemini-mvp-llmprovider-in-country-v1.md)

**Version rule.** Every version below was checked against the public registry (npm `registry.npmjs.org/<pkg>/latest`, PyPI `pypi.org/pypi/<pkg>/json`) on **2026-11-18**. Pin exact versions in lockfiles (`pnpm-lock.yaml`, `uv.lock`). "Why" follows the Karpathy test: the simplest thing that a small team can debug at 3 a.m.

## 1. Frontend (`apps/web`)

| Choice | Version (2026-11-18) | Why | Alternatives rejected | Licence |
|---|---|---|---|---|
| Next.js (App Router) | 16.4.6 | RSC keeps JS small on mid-range Android; one framework for person, staff and programme UIs; Vercel deploy in minutes | Remix (team less familiar), Vite SPA (worse first load) | MIT |
| React | 19.3.1 | Required by Next.js 16 (peer `^18.2 \|\| ^19`) | — | MIT |
| TypeScript | **5.9.3 (pinned)** | The brief says "TypeScript 5". npm `latest` is now 7.0.2 (native compiler); we stay on 5.9.x to avoid tool-chain surprises in a 36-hour build | TS 7.0.2 (move after the hackathon) | Apache-2.0 |
| Tailwind CSS | 4.3.5 | Utility CSS, logical properties (`ms-*`, `me-*`) for RTL | CSS modules | MIT |
| next-intl | 4.15.1 | App Router i18n, ICU messages, `ar`/`ur` RTL, locale routing | react-i18next | MIT |
| shadcn/ui (CLI) | 4.23.0 (`shadcn` CLI) | Copy-in accessible Radix components, no runtime lock-in | MUI (heavy) | MIT |
| Recharts | 3.11.0 | Programme dashboard charts; SVG, small API | Chart.js, ECharts (larger) | MIT |
| TanStack Query | 5.108.0 | Server-state cache, polling (episode status), retry | SWR | MIT |
| React Hook Form + @hookform/resolvers | 7.92.0 + 7.0.7 | Only for the few multi-field forms (settings, consent, contact attempt) | Formik | MIT |
| lucide-react | 1.75.0 | Icon subset, tree-shaken SVG | Icon fonts | ISC |
| Zod | 4.6.7 | Runtime validation of API responses and forms | Yup | MIT |
| openapi-typescript | 7.13.0 | Generates TS types from `packages/contracts/openapi.yaml` (single contract) | Hand-written types | MIT |
| Serwist (`@serwist/next`, `serwist`) | 9.5.15 | Service worker for the PWA: precache crisis page + lexicon, offline shell | next-pwa (unmaintained fork churn) | MIT |
| Browser SpeechSynthesis | platform API | Read-aloud (F-20), no dependency | Cloud TTS (data leaves device) | — |

## 2. Backend (`services/api`)

| Choice | Version | Why | Alternatives rejected | Licence |
|---|---|---|---|---|
| Python | 3.12 | Brief decision; all libs below support it (`google-genai` needs ≥ 3.11) | 3.13 (fine, but fewer prebuilt wheels on Render images) | PSF |
| FastAPI | 0.163.2 | Typed routes, OpenAPI out of the box, async | Django REST (heavier), Flask | MIT |
| Pydantic | 2.14.3 | Request/response models, rules-file validation | marshmallow | MIT |
| pydantic-settings | 2.16.3 | Typed env config | python-dotenv only | MIT |
| SQLAlchemy | 2.1.9 | ORM + Core; works on Postgres and SQLite | SQLModel (thin layer, less control) | MIT |
| Alembic | 1.20.1 | Migrations | — | MIT |
| psycopg (v3) | 3.3.9 | Postgres driver, `postgresql+psycopg://` | asyncpg (no SQLite parity) | LGPL-3.0 |
| uvicorn | 0.54.0 | ASGI server | hypercorn | BSD-3 |
| APScheduler | 3.11.3 (stable 3.x) | In-process SLA sweep, no Redis needed. 4.0 is still alpha (`4.0.0a6`) | Celery + Redis (extra infra), cron (no in-app state) | MIT |
| PyJWT | 2.15.1 | HS256 demo tokens (MVP); RS256/OIDC verification in v1 | python-jose (stale) | MIT |
| httpx | 0.28.1 | Outbound HTTP (FHIR test client, mocks) | requests (sync only) | BSD-3 |
| structlog | 26.1.0 | JSON logs with ID-only fields | std logging only | MIT / Apache-2.0 |
| slowapi | 0.1.10 | Per-IP / per-token rate limiting on FastAPI | custom middleware | MIT |
| fhir.resources | 8.3.0 | Optional validation of exported bundles. Note: 7.x+ defaults to **R5** models and ships an `R4B` subpackage; there is no pure R4 package. We validate against `fhir.resources.R4B` and keep R4 element names in our mapper. **Unverified fit**, owner Backend lead, check by H+6 | Hand-rolled dicts only (we keep this as the fallback) | BSD |

## 3. Data

| Choice | Version | Why | Alternatives rejected |
|---|---|---|---|
| PostgreSQL | 16 (`postgres:16-alpine` locally) | JSONB for rule factors and events, `pgcrypto` for column encryption, advisory locks for the scheduler | MongoDB (no transactions across projection + log in our skill set) |
| Neon (MVP) | managed | Free tier, branching for previews | Render Postgres (also fine; pick whichever the team has an account on) |
| SQLite | bundled | **Local development only** (brief §10): no append-only triggers, no `pgcrypto`. Demo fallback uses docker Postgres | — |
| Azure Database for PostgreSQL Flexible Server, UAE North (v1) | 16 | In-country residency (Federal Law 2/2019 Art. 13) | Self-managed VMs |

Cache and queue: **none in the MVP**. Postgres is the queue (`SELECT … FOR UPDATE SKIP LOCKED`). Add Redis or Azure Service Bus only if the SLA sweep or rate limits need it ([ARCHITECTURE §9](ARCHITECTURE.md#9-scalability-approach)).

## 4. AI

| Choice | Version | Why | Alternatives | Notes |
|---|---|---|---|---|
| Gemini API via `google-genai` | 3.5.0 (brief). **Released 2026-11-18**, the same day as this doc; the SDK ships near-daily (3.1.0 on 11-10 … 3.4.0 on 11-16) | JSON-schema output, strong Arabic, cheap Flash tier, team already has keys | OpenAI API (also outside UAE), Claude API (also outside UAE) | Model from env `GEMINI_MODEL` (default `gemini-3.6-flash`, pinned). If 3.5.0 misbehaves, fall back to 3.4.0 (the provider wrapper only uses `Client`, `models.generate_content`, `types.GenerateContentConfig`) |
| `LLMProvider` interface | in-house | Swap to `azure_openai` (UAE North) or `local` (Jais / Ollama) for v1 without touching callers | — | [ADR-0004](adr/ADR-0004-gemini-mvp-llmprovider-in-country-v1.md) |
| Templates (M-03) | in-house | The product must work with `LLM_PROVIDER=none` | — | Default fallback |

Deterministic engines (scoring, Crisis Gate, Step Matcher, RCI, SLA, fairness) are **not AI**. They are plain Python over JSON rules in `packages/rules` ([ADR-0003](adr/ADR-0003-deterministic-rules-engine-json.md)).

## 5. Quality tooling

| Tool | Version | Use |
|---|---|---|
| ruff | 0.17.5 | Python lint + format |
| mypy | 2.4.1 | Python types (strict on `app/engines`, `app/llm`) |
| pytest | 9.2.0 | Python tests |
| pytest-asyncio | 1.5.0 | Async route tests |
| hypothesis | 6.170.15 | Property tests on engines (scores always in range, gate monotonic) |
| ESLint | 10.15.0 + `eslint-config-next` 16.4.6 + `typescript-eslint` 8.73.0 | TS lint (flat config) |
| Prettier | 3.10.1 | TS/JSON/MD format |
| Vitest | 5.1.1 | Web unit tests |
| Playwright | 1.65.1 | E2E, mobile emulation, RTL screenshots |
| MSW | 3.0.7 | Mock API in component tests |
| Testing Library (React) | 16.3.3 | Component tests |
| @axe-core/playwright | 4.14.0 | Accessibility scans in E2E |
| pytest-cov | 7.1.0 | Coverage gates |
| freezegun | 1.5.5 | Time control in SLA tests (engines take `now` anyway) |
| testcontainers | 4.15.0 | Optional Postgres for local integration tests |
| @lhci/cli (Lighthouse CI) | 0.16.1 | TTI / performance budget in CI |
| Locust | 2.47.0 | Load test the Crisis Gate (p95 < 300 ms) |
| @redocly/cli | 2.79.0 | Lint `packages/contracts/openapi.yaml` in CI |

## 6. Infrastructure, CI, monitoring, auth

| Layer | MVP (hackathon) | v1 (production) |
|---|---|---|
| Web hosting | Vercel | Container in Azure UAE North (or Core42) |
| API hosting | Render web service (Docker, Frankfurt region; Render has no Middle East region) | Azure container platform in UAE North, product to confirm (Container Apps / AKS / App Service). **Unverified** regional availability, owner Tech lead, 2026-12-15 |
| DB | Neon Postgres 16 | Azure Database for PostgreSQL Flexible Server, UAE North, CMK |
| Secrets | Vercel / Render env vars, GitHub Actions secrets | Azure Key Vault + managed identity |
| CI/CD | GitHub Actions: lint → test → eval → build → deploy ([CICD](../05-ops/CICD.md)) | Same, plus environment approvals and image signing |
| Monitoring | Render logs, Vercel analytics (no PHI), uptime ping on `/healthz` | OpenTelemetry → Azure Monitor (in-country workspace) |
| Auth | Judge Mode demo JWT (HS256) ([ADR-0005](adr/ADR-0005-demo-auth-judge-mode-uae-pass-later.md)) | UAE PASS (citizens), facility SSO / Entra ID (staff) |
| Payments | None. Jisr has no payment flow | None (B2G contract) |
| Notifications | In-app + SMS mock (+ WhatsApp mock) | Licensed UAE SMS provider, WhatsApp Business Platform templates |

## 7. UAE rails used

| Rail | Use | MVP status |
|---|---|---|
| FHIR R4 resource shapes | IFHAS import (`QuestionnaireResponse`), referral (`ServiceRequest` + `Task`), `Consent`, `Flag`, `Provenance`, `Communication` | Real shapes, seeded data |
| LOINC | PHQ-9 panel 44249-1, GAD-7 panel 69737-5 (brief) | Used in import/export |
| Malaffi HL7 v2 REF (Circular 144/2026) | Referral messages | Design + message builder unit test only |
| Sahatna | Launch adapter | Deep-link stub |
| UAE PASS | Citizen auth | v1 |
| Crisis lines | 999, 800-SAKINA (800 725462), 800-HOPE (800 4673) | Displayed, `tel:` links |

## 8. Sponsor and co-creator technology

The challenge co-creators are Microsoft, Inception42 and MBZUAI ([brief §1](../00-overview/PROJECT_BRIEF.md)).
- **Microsoft:** v1 target is Azure UAE North with Azure OpenAI as one `LLMProvider` option.
- **Inception42 / MBZUAI:** Jais is listed as the self-hosted in-country `local` provider for v1 (brief §10 names "Jais 3"; exact model release, licence and hosting requirements are **unverified**, owner AI lead, 2026-12-15).
- The MVP uses Gemini because it was fastest to integrate; [ADR-0004](adr/ADR-0004-gemini-mvp-llmprovider-in-country-v1.md) records why that is acceptable only with synthetic data.

## 9. Runtime prerequisites

Node.js 22 LTS (Next.js 16.4.6 needs `>= 20.9.0`), pnpm via Corepack (npm latest 12.21.0; pin in `packageManager`), Python 3.12, `uv` (PyPI latest 0.13.9), Docker Desktop / Engine with Compose v2. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).
