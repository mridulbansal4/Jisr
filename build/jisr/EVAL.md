# EVAL, Jisr Crisis Gate benchmark

> **Caveat:** Synthetic, team-written benchmark (dev split authored alongside the lexicon). Not clinically validated; native-speaker clinical review of cases and lexicon is pending. Do not cite as clinical performance.

- **Run at (UTC):** 2026-11-19T11:42:48+00:00
- **Rules version:** `crisis_lexicon@1.1.0`, status: DRAFT, NOT CLINICALLY REVIEWED
- **Mode:** deterministic (lexicon + normaliser only, no LLM)
- **Dataset:** `data/synthetic/crisis_benchmark.v1.jsonl` (sha256 `9d585a35c32b…`)
- **Gate (recall = 100%):** PASS

## Headline

| Metric | Value |
|---|---|
| Cases | 157 (117 expected RED, 40 expected NOT_RED) |
| Recall | 100.0% (117/117) |
| Recall, Wilson 95% lower bound | 96.8% |
| Precision | 100.0% (117/117) |
| TP / FP / FN / TN | 117 / 0 / 0 / 40 |
| Latency p95 (in-process, per utterance) | 0.088 ms (max 7.172 ms; budget 50 ms) |
| Lexicon severity agreement on caught positives (informational) | 117/117 |

## By language

| Language | n | Expected RED | Expected NOT_RED | Recall | Precision | FN | FP |
|---|---|---|---|---|---|---|---|
| en | 41 | 31 | 10 | 100.0% | 100.0% | 0 | 0 |
| ar | 46 | 36 | 10 | 100.0% | 100.0% | 0 | 0 |
| ar-latn | 25 | 17 | 8 | 100.0% | 100.0% | 0 | 0 |
| ur | 22 | 16 | 6 | 100.0% | 100.0% | 0 | 0 |
| ur-latn | 23 | 17 | 6 | 100.0% | 100.0% | 0 | 0 |

## By category

| Category | n | Correct |
|---|---|---|
| BURDEN_HOPELESS | 16 | 16 |
| FAREWELL | 5 | 5 |
| HARM_OTHERS | 2 | 2 |
| NEGATED | 8 | 8 |
| NEGATIVE_IDIOM | 26 | 26 |
| NEGATIVE_NEUTRAL | 14 | 14 |
| PLAN_MEANS | 10 | 10 |
| QUOTE | 4 | 4 |
| SAFETY_ABUSE | 6 | 6 |
| SELF_HARM | 7 | 7 |
| SI_EXPLICIT | 35 | 35 |
| SI_PASSIVE | 17 | 17 |
| THIRD_PERSON | 7 | 7 |

## False negatives (missed expected-RED)

None.

## False positives (expected NOT_RED, gate fired)

None.

## Limitations

- Every utterance is synthetic and was written by the team; Arabic, Arabizi and Urdu items await native-speaker clinical review (R-04). Labels mean "a clinician would want crisis information shown", not a diagnosis.
- This is the dev split, written alongside lexicon v1.1.0, so recall/precision here are optimistic. A held-out set written by someone who has not seen the lexicon is still needed.
- Policy choices that inflate RED on purpose: negations, third-person reports and quoted/lyrics-style lines with self-reference are expected RED (recall first).
- n = 117 positives: 100% observed recall still has a 95% lower bound of 96.8%.
- Only the deterministic gate is measured. PHQ-9 item 9 / fail-closed paths are covered by unit tests (`services/api/tests/test_crisis_gate.py`); M-02 and the other suites are not in this report.

Regenerate: `cd ai/evals && uv run --project ../../services/api python run_evals.py`
