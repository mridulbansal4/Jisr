# ai/evals — how to run the Jisr evaluations

Plan, datasets and thresholds: [docs/04-ai/AI_EVALS.md](../../docs/04-ai/AI_EVALS.md). Results are written to `results/<run_id>.json` and rendered into the repo-root `EVAL.md`.

## Implemented now: crisis benchmark (Dataset A, deterministic gate)
| What | Where |
|---|---|
| Dataset (157 synthetic utterances: 117 expected RED / 40 expected NOT_RED; en, ar, ar-latn, ur, ur-latn) | `data/synthetic/crisis_benchmark.v1.jsonl` (synthetic data lives only in `data/synthetic/`) |
| Reusable logic (`run_benchmark(path) -> dict`, `render_markdown`) | `services/api/app/evals_crisis.py` (the API imports this for `GET/POST /v1/evals/crisis`) |
| CLI runner | `ai/evals/run_evals.py` |
| Outputs | repo-root `EVAL.md` and `ai/evals/results/crisis_latest.json` (shape of `GET /v1/evals/crisis`, incl. `rules_version`) |
| Gate unit tests (CG-01..03, CG-00 fail-closed, guards, normaliser, benchmark recall == 1.0) | `services/api/tests/test_crisis_gate.py` |

```bash
# run the benchmark (writes EVAL.md + results/crisis_latest.json); exit 1 if recall < 100%, 2 on config error
cd ai/evals
uv run --project ../../services/api python run_evals.py
# without uv (run_evals.py adds services/api to sys.path itself)
py -3.12 run_evals.py
# options
uv run --project ../../services/api python run_evals.py --no-write            # print summary only
uv run --project ../../services/api python run_evals.py --dataset path/to/other.jsonl --report /tmp/EVAL.md

# gate unit tests
cd services/api && uv run pytest tests/test_crisis_gate.py
```
Console output and `EVAL.md` list case ids only; the JSON result includes the synthetic text of misses (API shape).
Every case is marked `"native_review": "pending ..."`: native-speaker clinical review of the Arabic, Arabizi and Urdu items is still required.
Baseline for reference: lexicon v1.0.0 scored recall 53% (62/117) and precision 95% on this set; v1.1.0 closes the gaps (see the lexicon `review_log`).

The layout below is the full plan; only the crisis suite above exists so far.

## Layout
```
ai/evals/
  run_evals.py                 # entry point (all suites)
  suites/
    crisis.py                  # Dataset A + item-level cases (deterministic and +M-02 modes)
    steps.py                   # Dataset B (60 step-matcher cases)
    explain.py                 # Dataset C (M-01 generation + validator), mutations, templates
    redteam.py
  datasets/
    crisis_benchmark.v1.jsonl  # dev split (plain) ; held-out split is sealed: crisis_heldout.v1.jsonl.enc
    crisis_items.v1.jsonl
    crisis_codebook.v1.md
    step_cases.v1.jsonl
    explain_facts.v1.jsonl
    validator_mutations.v1.jsonl
    redteam.v1.jsonl
  cassettes/                   # recorded Gemini responses for offline CI
  results/                     # run outputs (gitignored except the submission run)
```
The engines under test are imported from `services/api/app/engines` and the rules from `packages/rules/*.v1.json` — the evals never re-implement logic.

## Prerequisites
- Python 3.12, [uv](https://docs.astral.sh/uv/)
- From repo root: `cd services/api && uv sync` (evals reuse the API environment)
- Optional for live LLM suites: `GEMINI_API_KEY` (paid tier — see MODELS §2), `GEMINI_MODEL=gemini-3.6-flash` (optional `GEMINI_MODEL_CLASSIFIER` override for M-02 experiments)
- Optional for the held-out crisis split: `EVAL_HELDOUT_KEY` (CI secret; locally ask the AI lead)

## Commands
```bash
cd ai/evals

# Default: all offline suites (no network, no key). This is what PR CI runs.
uv run python run_evals.py

# One suite
uv run python run_evals.py --suite crisis
uv run python run_evals.py --suite steps
uv run python run_evals.py --suite explain --offline      # uses cassettes

# Live LLM suites (costs ~AED 3 per full run)
uv run python run_evals.py --suite crisis --with-m02 --live
uv run python run_evals.py --suite explain --live --record   # re-record cassettes after a prompt change

# Write EVAL.md at repo root from the latest run
uv run python run_evals.py --report ../../EVAL.md
```

## Exit codes and gates
| Code | Meaning |
|---|---|
| 0 | All gates passed |
| 1 | A gate failed (crisis recall < 100%, precision < 80%, step agreement < 95% or protected-subset miss, validator mutation accepted, template FAIL, displayed unsupported claim, raise-only violation) |
| 2 | Configuration error (missing dataset, cassette miss → "re-record required", missing key for `--live`) |

## Adding cases
1. Add a line to the right `datasets/*.jsonl` (never edit an existing case to make it pass; deprecate it with `"deprecated": "<reason>"`).
2. Crisis or lexicon change → add at least one positive case and, if you add a guard, one negative case. Clinical lead approves (CODEOWNERS).
3. Run `uv run python run_evals.py` locally before pushing.

## Data rules
Synthetic only. No scraped posts, no real patient text, no real song lyrics. Free text in datasets is never printed in CI logs — reports show case ids only.
