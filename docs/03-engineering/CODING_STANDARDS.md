# Coding Standards
> Project: Jisr · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [CLAUDE.md](../../CLAUDE.md) · [Contributing](../../.github/CONTRIBUTING.md) · [Backend](BACKEND.md) · [Frontend](FRONTEND.md) · [Testing](TESTING.md) · [Git workflow](GIT_WORKFLOW.md)

Short version: **typed, linted, formatted, tested; thresholds only in `packages/rules`; prompts only in `ai/prompts`; no PII or free text in logs.**

## 1. Python (`services/api`, `ai/evals`)

- Python 3.12, managed with `uv` (lockfile `uv.lock` committed).
- **ruff 0.17.5** for lint and format (replaces black/isort/flake8). **mypy 2.4.1**: strict on `app/engines`, `app/llm`, `app/core`; standard elsewhere.
- Pydantic v2 models for every request, response and rules file; `extra="forbid"` on requests.
- Engines: pure functions, frozen dataclasses, no I/O, `now` passed in. No numeric clinical thresholds in code (a test greps `app/engines` for comparisons against numeric literals other than 0/1).

`services/api/pyproject.toml` (excerpt):

```toml
[project]
requires-python = ">=3.12,<3.13"

[tool.ruff]
line-length = 100
target-version = "py312"
src = ["app", "tests"]

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "UP", "S", "C4", "SIM", "RUF", "PL", "PT", "DTZ", "T20", "ANN", "ASYNC"]
ignore = ["PLR0913", "ANN401"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101", "ANN", "PLR2004"]

[tool.ruff.format]
quote-style = "double"

[tool.mypy]
python_version = "3.12"
plugins = ["pydantic.mypy"]
warn_unused_ignores = true
disallow_untyped_defs = true

[[tool.mypy.overrides]]
module = ["app.engines.*", "app.llm.*", "app.core.*"]
strict = true

[tool.pytest.ini_options]
addopts = "-q --strict-markers"
markers = ["engines", "integration", "llm_live", "slow"]
```

Notes: `DTZ` forbids naive datetimes; `T20` forbids `print`; `S` (bandit rules) catches unsafe calls.

## 2. TypeScript (`apps/web`)

- TypeScript **5.9.3** (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`).
- **ESLint 10.15.0** flat config with `eslint-config-next` 16.4.6 and `typescript-eslint` 8.73.0; **Prettier 3.10.1** for formatting (ESLint does not format).
- Server components by default; `'use client'` only at leaves.
- Types from `lib/api/schema.d.ts` (generated); never hand-copy API types.

`apps/web/eslint.config.mjs` (excerpt):

```js
import next from "eslint-config-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...next,
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }], // copy lives in messages/*.json
      "no-restricted-syntax": ["error",
        { selector: "Literal[value=/\\b(ml|mr|pl|pr|left|right)-/]", message: "Use logical Tailwind classes (ms-/me-/ps-/pe-/start-/end-) for RTL." }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
);
```

`.prettierrc`:

```json
{ "printWidth": 100, "singleQuote": false, "trailingComma": "all", "plugins": ["prettier-plugin-tailwindcss"] }
```

(`prettier-plugin-tailwindcss` version to pin on build day; not verified in this doc.)

## 3. JSON rules (`packages/rules`)

- Files named `<name>.v<major>.json`; each has `version` (semver), `sources` (citations with URL), and validates against `schema/<name>.schema.json`.
- Every rule has a stable `id` (e.g. `STEP-SEV-02`, `LEX-ARZ-014`) that appears in API factors and logs.
- Formatting: Prettier, 2-space indent, keys in a stable order. Changing a file requires a version bump in the file and in `manifest.json` (CI check).

## 4. Naming

| Thing | Convention | Example |
|---|---|---|
| Python modules / functions | `snake_case` | `crisis_gate.check()` |
| Python classes | `PascalCase` | `StepRecommendation` |
| TS components | `PascalCase.tsx` | `CrisisLines.tsx` |
| TS hooks / utils | `camelCase` | `useEpisodePolling` |
| DB tables / columns | `snake_case`, plural tables | `episode_events.dedupe_key` |
| API paths | kebab-case nouns, `/v1` prefix | `/v1/episodes/{id}/contact-attempts` |
| JSON fields | `snake_case` | `next_deadline_at` |
| Event types | `UPPER_SNAKE` past tense | `RED_ACKNOWLEDGED` |
| IDs from the brief | keep exactly | `F-03`, `API-24`, `E-07`, `R-01` |
| Env vars | `UPPER_SNAKE`; feature flags `FF_*` | `FF_CSSRS_ITEMS` |

## 5. Error handling

- Python: raise typed domain exceptions; map them once to problem+json (`core/errors.py`). Never `except Exception: pass`. In the Crisis Gate path, catch-all ⇒ RED (fail-closed), log `CRISIS_GATE_ERROR`.
- LLM errors ⇒ template fallback, never a 5xx.
- TS: every API call handles `crisis: true` and `423` by showing S-06; network errors during crisis-relevant calls show S-06 too.
- No silent catches in TS; use `reportError()` which logs a redacted error and shows a localised message.

## 6. Logging rules

- structlog JSON; fields: `ts`, `level`, `event`, `request_id`, `route`, `status`, `latency_ms`, `role`, `actor_hash`, `episode_id`, `rule_ids`, `llm_provider`, `fallback_used`.
- **Never log:** names, phone numbers, free text (F-22), answers, scores, LLM prompts or outputs, tokens, passcodes. IDs only; person IDs hashed with `LOG_PEPPER`.
- A unit test feeds a synthetic record with sentinel strings through every log call path and asserts the sentinel never appears in captured logs.
- Levels: `info` for state changes, `warning` for fallbacks and SLA escalations, `error` for 5xx and gate errors.
- Browser: no `console.log` in production builds; no third-party analytics SDKs (first-party API-29 only).

## 7. Comments and docs

- Comment **why**, not what. Every engine function has a docstring naming the rule file and IDs it implements and citing the brief section.
- Safety-relevant code carries `# SAFETY:` comments explaining the fail-closed or raise-only choice.
- Public functions in `services/` document their transaction boundary.
- Copy for users lives in `messages/*.json` and `ai/prompts/` only; avoid diagnostic language ("you have depression") everywhere, including comments used as copy.

## 8. Review checklist

- [ ] IDs match the brief (F-xx, API-xx, E-xx, R-xx).
- [ ] Engines pure; thresholds only in `packages/rules`; version bumped if rules changed.
- [ ] Crisis Gate untouched, or crisis benchmark re-run and recall = 100% (`EVAL.md` regenerated).
- [ ] No LLM decides a score, step or crisis clearance; M-02 can only raise.
- [ ] Consent checked where data leaves its owner (packets, physical context, LLM, free text, SMS).
- [ ] Coordinator cannot confirm a step or leave RED.
- [ ] No PII/free text in logs or analytics; no secrets in code.
- [ ] New copy in `ar`, `en`, `ur`; RTL checked; logical CSS only.
- [ ] Tests for every new branch; OpenAPI and generated types updated.
- [ ] Accessible names, focus order, touch targets ≥ 44 px.

## 9. Pre-commit (optional, recommended)

`pre-commit` with: `ruff check --fix`, `ruff format`, `prettier --check`, `eslint --max-warnings 0` (changed files), `gitleaks` (secret scan). Pin hook versions on build day.
