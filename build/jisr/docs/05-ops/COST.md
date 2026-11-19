# Cost
> Project: Jisr · Owner: Tech lead + Business lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Infrastructure](INFRASTRUCTURE.md) · [Models](../04-ai/MODELS.md) · [Business model](../07-business/BUSINESS_MODEL.md) · [Financials](../07-business/FINANCIALS.md) · [Observability](OBSERVABILITY.md)

All figures in **AED** (USD in parentheses), FX **1 USD = 3.6725 AED** (the dirham peg). Tags: **[V]** fetched from the vendor's pricing page today · **[E]** team estimate · **[U]** unverified list price, check before quoting.

## 1. Unit: the episode
Costs scale with **episodes** (one positive screen through to closure, brief §4), not with users. Per-episode assumptions [E]:

| Driver | Per episode |
|---|---|
| M-01 calls (result explanation, step explanation, referral message draft, re-check reminder draft) | 4 calls × ~1,200 input + ~350 output tokens (thinking budget set to minimum; output price includes thinking tokens [V]) |
| M-02 raise-only crisis check (if enabled) | ~1.5 free-text inputs × ~600 input + ~30 output tokens |
| Retries / validator rejections | +10% |
| **Total tokens** | **≈ 6,300 input + 1,600 output** |
| API requests | ~60 |
| Stored data | ~50 KB (events, audit, explanation records) |
| Notifications | 4 (MVP: in-app + mock SMS, AED 0; v1: SMS only when the person chose it) |

## 2. LLM cost per episode (Gemini Flash, Gemini Developer API, paid tier)

| Price period | Input / 1M tokens | Output / 1M tokens | Per episode | Per 1,000 episodes |
|---|---|---|---|---|
| Gemini 3.6 / 3.8 Flash, **through 31 Dec 2026** [V] | USD 0.75 | USD 3.75 | USD 0.0107 ≈ **AED 0.039** | AED 39 |
| Gemini 3.6 / 3.8 Flash, **from 1 Jan 2027** [V] | USD 1.50 | USD 7.50 | USD 0.0215 ≈ **AED 0.079** | AED 79 |
| Gemini 3.5 Flash-Lite (cheaper fallback) [V] | USD 0.30 | USD 2.50 | USD 0.0059 ≈ AED 0.022 | AED 22 |
| No-LLM templates (M-03) | — | — | AED 0 | AED 0 |

Source: https://ai.google.dev/gemini-api/docs/pricing → redirects to https://aistudio.google.com/docs/pricing, fetched 2026-11-18.

## 3. Monthly / annual cost at three scales

| | **100 episodes** (hackathon demo + judging, 1 month) | **10k episodes / year** (pilot: a few PHC centres) | **1M episodes / year** (emirate scale, ~83k / month) |
|---|---|---|---|
| Hosting stack | MVP: Vercel + Render + Neon | v1: Azure UAE North | v1: Azure UAE North, HA |
| Web + API compute | Vercel Hobby AED 0 (or Pro AED 73 / USD 20 per member) + Render Starter AED 26 (USD 7) [U] | Container Apps 2–3 small replicas ≈ AED 370 (USD 100) [U] | Container Apps autoscale 6–20 replicas ≈ AED 2,200 (USD 600) [U] |
| Database | Neon free AED 0 (or Render basic ≈ AED 26–70) [U] | PostgreSQL Flexible, General Purpose 2 vCore, zone-redundant HA ≈ AED 1,100 (USD 300) [U] | 8 vCore HA + read replica ≈ AED 5,500 (USD 1,500) [U] |
| WAF / ingress | — | App Gateway WAF v2 ≈ AED 1,200 (USD 330) [U] | ≈ AED 1,800 (USD 500) [U] |
| Logs, monitoring, Key Vault, backups | AED 0 (free tiers) | ≈ AED 400 (USD 110) [U] | ≈ AED 3,000 (USD 800) [U] |
| LLM tokens | Gemini, 100 × AED 0.079 ≈ **AED 8** | In-country LLM (Azure OpenAI UAE North regional deployment): assume ≈ AED 0.11 / episode [E/U] → ≈ **AED 92 / month** | ≈ AED 9,200 / month (before caching; ≈ AED 2,800 with the 70% cache in §5) |
| SMS | AED 0 (mock) | Licensed UAE provider, assume AED 0.20 / SMS [U] × 2 SMS/episode → ≈ AED 330 / month | ≈ AED 33,000 / month at 2 SMS/episode (biggest line; see §5) |
| **Monthly total** | **≈ AED 35–110** | **≈ AED 3,500 / month** (≈ AED 42k / year) | **≈ AED 55,000 / month** (≈ AED 660k / year); ≈ AED 24k / month after caching + SMS levers in §5 |
| **Per episode** | ~AED 0.35–1.10 (fixed-cost dominated) | **≈ AED 4.2** | **≈ AED 0.66** (≈ AED 0.29 after levers) |

Reading it: at pilot scale the cost is almost all fixed in-country infrastructure; at emirate scale it is SMS and LLM tokens. Both are small next to the value of one avoided crisis presentation or one completed referral (see [BUSINESS_MODEL](../07-business/BUSINESS_MODEL.md)). People costs (clinicians, coordinators, support, the Jisr team) are excluded here and live in [FINANCIALS](../07-business/FINANCIALS.md).

## 4. Gemini pricing and model-id note (act before submission)
- Google's pricing page (fetched 2026-11-18) shows **Gemini 3.6 Flash and 3.8 Flash at introductory prices through 31 Dec 2026, doubling on 1 Jan 2027** (input USD 0.75 → 1.50, output USD 3.75 → 7.50; context caching USD 0.075 → 0.15 per 1M) [V].
- **Effective 1 Dec 2026, requests to `gemini-2.5-flash` route to Gemini 3.5 Flash-Lite and are billed at its rates** [V]. So the date that matters on 1 Dec 2026 is a model re-routing, not a Flash price change. Some secondary sites report the date differently; trust the official page and re-check it on build day.
- The brief pins `GEMINI_MODEL=gemini-3.6-flash` (do not use the moving `gemini-flash-latest` alias). Keep it pinned in Render env and the `evals` repo variable, and re-run `evals.yml` after any change.
- The price table used by `llm_cost_usd_total` ([OBSERVABILITY](OBSERVABILITY.md) §3.3) is config, so a price change is a config edit, not a code change.
- Free tier is not used: free-tier data may be used to improve Google products; paid tier data is not [V].

## 5. Optimisation levers
| Lever | Saving | Trade-off |
|---|---|---|
| Cache explanations by facts hash (score band × instrument × language × step) | 60–80% of M-01 calls [E] | None for safety; facts are identical |
| Use templates for the two message drafts (only explanations use the LLM) | −50% tokens | Less natural wording |
| Gemini Batch / Flash-Lite for non-interactive drafts (re-check reminders) | ~50–70% on those calls [U] | Latency (fine for reminders) |
| Prefer in-app / Sahatna push over SMS; SMS only for opted-in reminders | SMS from 2 → 0.5 per episode: −75% of the biggest line | Depends on Sahatna integration (v1) |
| Reserved capacity / savings plans on Azure (1-year) | ~30–40% on compute + DB [U] | Commitment |
| Self-hosted Jais on shared GPU (only at very high volume) | Token cost → fixed GPU cost | Ops burden; evaluate at > 500k episodes/year |
| Sponsor credits: Microsoft for Startups / Azure credits via the challenge co-creator | Pilot infra ≈ free for year 1 [U] | Apply early |

## 6. MVP budget guardrails
AI Studio spend cap USD 20 for the hackathon month; alert at USD 5/day; Render and Vercel on the smallest always-on plans; total hackathon cash outlay target **< AED 150**.
