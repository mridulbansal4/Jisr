# Jisr — جسر

> **We help people in Abu Dhabi who screen positive for anxiety or depression get to the right level of care, using their screening answers, their preferences and their insurance network. Every hand-off is owned, timed and measured, and a deterministic crisis gate puts a human on any risk within minutes.**

Built for the **Future Health Digital Innovation Challenge 2026** (Department of Health – Abu Dhabi), statement **C10 Earlier, Safer Mental Wellbeing Support**.

> 🎬 Demo GIF: record a 20-second clip of the Judge Mode tour and save it as `docs/assets/demo.gif` (placeholder).

## The problem
Abu Dhabi screens more people for anxiety and depression every year. But the challenge statement names a *"continuing conversion gap between a positive screen and timely specialist follow-up"*. People who screen positive often don't know where to go, whether their insurance covers it, or whether their employer will find out. Generic chatbots make this worse: weak crisis handling, unvalidated advice, privacy risk.

## What Jisr does
- **Screens** with validated instruments (PHQ-2/9, GAD-2/7) in Arabic, English and Urdu, or imports an IFHAS result.
- **Runs the Crisis Gate first:** deterministic rules, with no AI deciding. Emergency guidance appears instantly (999 · 800-SAKINA · 800-HOPE), and a human clinician gets a RED episode with a 15-minute SLA.
- **Explains** the result in plain language ("what this means and what it doesn't"). The AI only drafts, and a validator blocks any unsupported claim.
- **Matches the least intensive safe step** (L0 self-help → L4 specialist), showing every factor: severity, language, clinician gender, modality, insurance network, capacity.
- **Hands off warmly:** referral packet, provider acceptance, booking, SLA timers and escalation.
- **Measures:** re-checks at 2 weeks, uses the reliable change index to suggest a step up or down, and has a clinician confirm.
- **Shows the programme** conversion, time-to-care, follow-up, improvement, crisis response and fairness, with small cells suppressed.
- **Protects privacy:** granular revocable consent, discreet mode, no employer role at all, synthetic data only in this prototype.

## Quick start
```bash
git clone https://github.com/mridulbansal4/Jisr.git && cd Jisr
cp .env.example .env            # add GEMINI_API_KEY (optional: LLM_PROVIDER=none works fully offline)
docker compose up -d db         # Postgres 16
cd services/api && uv sync && uv run uvicorn app.main:app --reload --port 8000   # SQLite by default; seeds synthetic data on first start (reseed: uv run python -m app.seed)
cd ../../apps/web && pnpm install && pnpm dev   # http://localhost:3000  → "Judge Mode"
```
Full setup: [ENVIRONMENT_SETUP](docs/03-engineering/ENVIRONMENT_SETUP.md). Evals: `cd ai/evals && uv run python run_evals.py` → writes `EVAL.md`.

## Tech stack
Next.js 16 · TypeScript · Tailwind 4 · next-intl (RTL) · FastAPI · Pydantic 2 · SQLAlchemy 2 · PostgreSQL 16 · Gemini API (explain-only, behind a provider switch) · FHIR R4 resource shapes · GitHub Actions · Vercel + Render (MVP) → in-country UAE hosting (v1).

## Project structure
`apps/web` (person app, clinician console, programme dashboard) · `services/api` (engines + API) · `packages/rules` (versioned JSON rules: instruments, crisis lexicon, step rules) · `ai/` (prompts, evals) · `data/synthetic` · `packages/contracts/openapi.yaml` · `docs/` (including `docs/research/` hackathon background, not part of the build). See **[MAP.md](docs/MAP.md)**.

## Docs index
Start with [MAP](docs/MAP.md) → [PROJECT_BRIEF](docs/00-overview/PROJECT_BRIEF.md) → [PRD](docs/01-product/PRD.md) → [ARCHITECTURE](docs/03-engineering/ARCHITECTURE.md) → [HACKATHON_PLAN](docs/00-overview/HACKATHON_PLAN.md). Pitch: [PITCH](docs/00-overview/PITCH.md). Safety: [RESPONSIBLE_AI](docs/04-ai/RESPONSIBLE_AI.md), [AI_EVALS](docs/04-ai/AI_EVALS.md), [MEDICAL_DEVICE](docs/06-security-compliance/MEDICAL_DEVICE.md).

## Assumptions & limitations (summary)
- **Not a diagnostic device and not therapy.** Jisr supports screening navigation and care coordination; clinicians make every clinical decision.
- **All data is synthetic.** No real patient data was used. Instrument validity in local populations, provider capacity and conversion gains are **simulated**, not proven.
- The Arabic and Urdu wording and the crisis lexicon need native-speaker clinical review before any pilot.
- MVP uses the Gemini API, which has no guaranteed UAE processing location. That is why only synthetic data is used. v1 switches to an in-country endpoint (Federal Law 2/2019).

## Team
See [TEAM](docs/08-project/TEAM.md).

## Licence
Code: MIT (proposed). Instruments: PHQ-9/GAD-7 are free to use. Third-party data and licences: see [DATA_PIPELINE](docs/04-ai/DATA_PIPELINE.md).
