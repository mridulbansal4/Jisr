# ADR-0004: Gemini for the MVP behind an LLMProvider interface; in-country swap for v1
> Project: Jisr · Owner: AI lead · Status: Accepted · Last updated: 2026-11-18
> Related: [Integrations](../INTEGRATIONS.md) · [Tech stack](../TECH_STACK.md) · [Models](../../04-ai/MODELS.md) · [Compliance](../../06-security-compliance/COMPLIANCE.md)

- **Deciders:** AI lead, Tech lead, Product lead
- **Date:** 2026-11-18
- **Technical story:** F-04, M-01, M-02, M-03; R-02, R-03

## Context and problem statement
We need Arabic, English and Urdu plain-language narration of structured results within 36 hours. UAE Federal Law 2/2019 Art. 13 restricts storing or processing health data outside the UAE [S], and DoH Circular 147/2022 restricts sharing [S]. The Gemini API does not guarantee UAE processing (brief [11]). Which model do we use now, and how do we stay compliant later?

## Decision drivers
- Speed of integration and JSON-schema output
- Arabic quality
- Residency law for any real data
- The product must work with no LLM at all, and per person when they turn off the "AI-drafted summaries" consent

## Considered options
1. **Gemini API (`google-genai` 3.5.0, `GEMINI_MODEL` default `gemini-3.6-flash`, pinned) behind `LLMProvider`; synthetic data only; v1 swaps to Azure OpenAI UAE North or self-hosted Jais**
2. Azure OpenAI UAE North from day one
3. Self-hosted open model (Jais or other) from day one
4. No LLM; templates only

## Decision outcome
Chosen option 1.

```python
class LLMProvider(Protocol):
    name: str
    def generate_json(self, *, prompt_id: str, facts: dict, schema: type[BaseModel],
                      language: str, timeout_s: float) -> LLMResult: ...
```

Implementations: `GeminiProvider` (MVP), `AzureOpenAIProvider` and `LocalProvider` (OpenAI-compatible base URL) as stubs with the same tests, `NoneProvider` (templates). Selection by `LLM_PROVIDER`. The fact builder sends **de-identified structured facts only** to M-01 (no names, IDs, dates of birth or free text), and only if the person's `ai_drafted_summaries` consent is granted. M-02 (free text) is off by default (`LLM_CRISIS_SECOND_OPINION=false`) and allowed on synthetic data only.

### Consequences
- Good: fastest path to a working, validated explanation; the provider switch is one env var.
- Good: `LLM_PROVIDER=none` is a first-class mode for the demo fallback and for residency-strict pilots.
- Bad: the MVP cannot touch real data (accepted: the hackathon provides none).
- Bad: `google-genai` 3.5.0 was published on 2026-11-18 and the SDK releases almost daily (3.1.0 on 11-10 to 3.5.0 on 11-18); pin it in `uv.lock`, keep 3.4.0 as a known fallback.
- Follow-up: the brief pins `gemini-3.6-flash`; never ship the moving `gemini-flash-latest` alias. Re-run the eval suite after any model change. Paid price doubles from 1 Jan 2027 (see [MODELS](../../04-ai/MODELS.md), [COST](../../05-ops/COST.md)).

### Confirmation
- Startup check: if `APP_ENV=production` and `LLM_PROVIDER=gemini`, the API refuses to start.
- DB check: `persons.is_synthetic` is constrained to true in the MVP schema.
- The same AI eval suite (unsupported claims 0%) must pass for any provider before it is enabled; results land in the root `EVAL.md`.

## Pros and cons of the options
### Azure OpenAI UAE North now
- Good: residency story from day one.
- Bad: subscription and quota setup time; regional model availability unverified [U].
### Self-hosted model now
- Good: full control.
- Bad: GPU hosting and Arabic eval effort impossible in 36 h.
### No LLM
- Good: zero AI risk.
- Bad: weaker multilingual wording; less to show on responsible AI.

## MVP vs v1
- **MVP:** Gemini, synthetic only, validator + templates.
- **v1:** in-country provider (Azure OpenAI UAE North or Jais on Core42); DPIA; prompts and evals unchanged; explanation cache keyed by facts hash.

## More information
Gemini models: https://ai.google.dev/gemini-api/docs/models · Vertex AI data residency (brief [11]) · Federal Law 2/2019 (brief [12]).
