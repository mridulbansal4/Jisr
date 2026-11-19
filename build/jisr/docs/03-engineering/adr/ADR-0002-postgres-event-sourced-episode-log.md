# ADR-0002: PostgreSQL with an event-sourced episode log
> Project: Jisr · Owner: Backend lead · Status: Accepted · Last updated: 2026-11-18
> Related: [Data model](../DATA_MODEL.md) · [Architecture](../ARCHITECTURE.md) · [Backend](../BACKEND.md)

- **Deciders:** Backend lead, Tech lead
- **Date:** 2026-11-18
- **Technical story:** F-08 Episode Ledger, F-15 dashboard, R-01, R-10

## Context and problem statement
The challenge KPIs (successful hand-off, follow-up within timeframe, waiting time, crisis-response completion) are all **time between events**. Clinically we also need to show who did what, when, on what evidence, and that no one edited history. How do we store episodes so that state is fast to query, history is trustworthy, and metrics fall out naturally?

## Decision drivers
- Auditability: closure needs evidence or an authorised clinician decision (brief §7)
- KPIs are computed from event timestamps (e.g. RED acknowledged within 15 min)
- Small team: one database, no new infrastructure
- FHIR `Provenance` export needs per-change records

## Considered options
1. **Postgres: append-only `episode_events` (E-07) + `episodes` projection (E-06) updated in the same transaction**
2. Mutable `episodes` table + separate audit table
3. Dedicated event store (EventStoreDB / Kafka) + read models
4. Document DB (MongoDB) with embedded history arrays

## Decision outcome
Chosen option 1. Every command goes through `episode_service.apply()`, which locks the episode row, validates the transition against `packages/rules/transitions.v1.json`, inserts the event with the next `seq`, updates the projection and commits. Events carry `prev_hash`/`hash` (SHA-256 chain). The app's DB role has no `UPDATE`/`DELETE` on `episode_events` and `audit_log`, and a trigger blocks them too. Some facts exist **only** as events, with no table of their own: `RED_ACKNOWLEDGED` (API-24) and `CONTACT_ATTEMPT` (API-25).

### Consequences
- Good: metrics such as "screen → first appointment" or "RED → acknowledgement" are SQL over events; the timeline (API-05) is a straight read.
- Good: tamper-evidence; nightly hash-chain check; a projection rebuild script proves consistency.
- Good: SQLite fallback still works for a laptop demo (no triggers there; tests run on Postgres).
- Bad: two writes per change; developers must never update `episodes` directly (code review + a test that diffs a rebuild against the live table).
- Neutral: no snapshotting needed at our volume (ARCHITECTURE §9).

### Confirmation
`tests/integration/test_event_log.py`: (a) UPDATE on `episode_events` raises; (b) rebuild equals projection after the full demo script; (c) hash chain verifies.

## Pros and cons of the options
### Mutable table + audit
- Good: simplest.
- Bad: audit and state can diverge; KPIs need extra bookkeeping.
### Dedicated event store
- Good: replay tooling.
- Bad: new infrastructure and skills; no transactional link to the rest of the data.
### MongoDB
- Good: flexible documents.
- Bad: weaker relational queries for the dashboard; team less fluent.

## MVP vs v1
- **MVP:** Neon Postgres 16; SQLite fallback.
- **v1:** Azure Database for PostgreSQL Flexible Server in UAE North, zone-redundant HA, customer-managed keys; `episode_events` partitioned by month when large; hash-chain head anchored daily in a write-once store.

## More information
Pattern references: Martin Fowler, "Event Sourcing" [K]; HL7 FHIR `Provenance` [K].
