# ADR-0005: Demo auth and Judge Mode now; UAE PASS and facility SSO later
> Project: Jisr · Owner: Tech lead · Status: Accepted · Last updated: 2026-11-18
> Related: [API spec](../API_SPEC.md) · [Integrations](../INTEGRATIONS.md) · [Security architecture](../../06-security-compliance/SECURITY_ARCHITECTURE.md)

- **Deciders:** Tech lead, Product lead
- **Date:** 2026-11-18
- **Technical story:** F-17, API-22, API-28; R-08

## Context and problem statement
Judges must reach every role (person, clinician, coordinator, programme) in a 3-minute demo, from their own phones, with "live link + credentials" as a deliverable. Real citizen auth in Abu Dhabi is UAE PASS, which needs service-provider onboarding we cannot finish in 36 hours. How do we authenticate now without building something we will throw away?

## Decision drivers
- Zero-friction role switching for judges
- Real RBAC enforced server-side (not just hidden buttons)
- A clean path to UAE PASS (citizens) and facility SSO (staff)
- No passwords to manage or leak

## Considered options
1. **Judge Mode: `POST /v1/auth/demo-login {persona, passcode}` issues a signed HS256 JWT with role + scopes; only when `DEMO_MODE=true`, gated by a shared `JUDGE_PASSCODE`**
2. Username/password accounts per persona
3. Third-party auth (Auth0/Clerk) with seeded users
4. UAE PASS staging now

## Decision outcome
Chosen option 1. Personas: `judge` (observer), `mariam`, `imran` (person), `dr_salma` (clinician), `khalid` (coordinator), `programme_lead` (programme). Token TTL `JWT_TTL_MINUTES` (120). Claims: `sub`, `role`, `scopes`, `persona`, `facility_id` (staff), `judge`, `demo`, `exp`, `jti`. Every route checks scopes and row-level rules exactly as it will in v1; only the token issuer changes.
- A shared `JUDGE_PASSCODE` (given to judges in the submission form, brief §10) gates API-22; it is compared in constant time and rate-limited (20/min/IP). It is the only "credential" in the submission and is a demo-access code for synthetic data, not a user password.
- `DEMO_MODE` defaults to false in code; API-22 and API-28 (`/v1/demo/reset`) return 404 when off; startup refuses `DEMO_MODE=true` with `APP_ENV=production`.
- The UI shows a permanent "Demo — synthetic data" ribbon in Judge Mode.

### Consequences
- Good: judges switch roles in one tap; RBAC is real and testable.
- Good: no personal credentials exist; the submission "credentials" are the link plus the shared passcode.
- Bad: anyone with the link and passcode can use the demo. Accepted: data is synthetic, rate limits apply, API-28 resets the seed, and the passcode can be rotated by changing one env var.
- Follow-up: `AuthProvider` with `DemoProvider` now; `UaePassProvider` and `FacilityOidcProvider` in v1.

### Confirmation
Tests: demo-login and demo-reset return 404 when `DEMO_MODE=false`; each persona token is denied every scope it does not hold (matrix test generated from API_SPEC §1.2).

## Pros and cons of the options
### Passwords
- Bad: credential handling; nothing reusable.
### Auth0/Clerk
- Good: polished.
- Bad: another external processor of identity data; not the v1 path in the UAE.
### UAE PASS staging now
- Good: authentic.
- Bad: onboarding time unknown [U]; judges may lack test accounts.

## MVP vs v1
- **MVP:** HS256 demo JWT, `JWT_SECRET` from env.
- **v1:** UAE PASS OIDC for persons (subject stored as `uae_pass_sub`); facility SSO (OIDC, e.g. Entra ID) for staff with role from the facility directory; RS256 verification via JWKS; short-lived access + refresh tokens; step-up for exports.

## More information
UAE PASS developer docs: https://docs.uaepass.ae/ [K].
