# Mobile
> Project: Jisr · Owner: Frontend lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Frontend](FRONTEND.md) · [Performance](PERFORMANCE.md) · [Architecture](ARCHITECTURE.md) · [Accessibility](../02-design/ACCESSIBILITY.md) · [Integrations](INTEGRATIONS.md)

**Decision:** the MVP ships as a **mobile-first Progressive Web App** from `apps/web`. No native iOS/Android app in the hackathon. In v1, Jisr's person-facing journey is meant to live **inside Sahatna** (DoH's citizen app, UAE PASS sign-in), so Jisr may never need its own native app.

## 1. Why a PWA for the MVP

| Driver | PWA | Native (React Native / Flutter / Swift+Kotlin) |
|---|---|---|
| 36-hour build, 2–4 people | One codebase with the staff and programme views | A second codebase; store accounts, signing, review |
| Judges open a link on their own phones | Works instantly from a URL | Needs TestFlight / APK sideload; many judges won't install |
| Arabic/Urdu RTL, fonts, read-aloud | Mature on the web (next-intl, `dir="rtl"`, Noto fonts, SpeechSynthesis) | Also good, but re-implemented |
| Stigma and discretion (F-14) | No app icon unless the person installs; quick exit replaces history; neutral tab title | An icon on the home screen is visible to family/employer |
| Offline crisis numbers | Service-worker precache | Bundled |
| Push notifications | Android: yes. iOS: Web Push only for home-screen-installed web apps (iOS/iPadOS 16.4+) [K] | Full push |
| Distribution path in Abu Dhabi | Deep link from Sahatna/SMS; later a Sahatna module | Separate app competes with Sahatna for attention |

The trade-off we accept: **no reliable push on iOS unless installed.** Jisr's reminders are therefore in-app (API-27) plus SMS mock (F-21); v1 uses a licensed SMS/WhatsApp provider with neutral templates, which reaches every phone without an app.

## 2. PWA implementation (MVP)

- **Manifest** (`app/manifest.ts`): `name`/`short_name` neutral ("Health check-in"), `display: standalone`, `start_url: /ar/home`, `dir: auto`, theme colours from the design system, maskable icons. In discreet mode the in-app "install" prompt is hidden.
- **Service worker** (Serwist 9.5.15): precache app shell, fonts, `messages/*`, `/[locale]/help`, crisis numbers, compiled crisis lexicon. Never cache `/v1/*`.
- **Offline behaviour:** crisis page and numbers always available; screening answers queue in IndexedDB and replay with idempotency keys; other screens show an offline state with the crisis numbers visible.
- **Install prompt:** shown only after the person books an appointment (value moment), never on first visit; dismiss is remembered.
- **Device features used:** `tel:` links for crisis lines, SpeechSynthesis (F-20), `navigator.onLine`. Not used: camera, location, contacts, Badging API (F-14 forbids badges), background sync of PHI.
- **Mobile UX:** single-column layouts, 44 × 44 px targets, one question per screen with large answer buttons (P-02 low literacy), sticky quick-exit, safe-area insets, `inputmode` hints, no hover-only affordances.

## 3. Device and browser support

| Platform | Support level (MVP) |
|---|---|
| Android 10+ Chrome / Samsung Internet | Primary; tested in Playwright mobile emulation and on at least one real mid-range Android before submission |
| iOS 16.4+ Safari | Supported (install for push not required); manual test on one iPhone |
| Desktop Chrome/Edge/Safari | Staff and programme views; person views responsive |
| WebView inside other apps (e.g. Sahatna in v1) | v1 test target |

Performance targets for the reference mid-range Android are in [PERFORMANCE §3](PERFORMANCE.md#3-low-end-device-and-network-targets).

## 4. v1 path

1. **Sahatna module / launch** (preferred): Jisr person screens embedded or launched from Sahatna with UAE PASS identity and IFHAS context (Circular 170/2026 makes Sahatna integration mandatory for facilities by 30 Nov 2026 [S]). Requires DoH/ADHDS onboarding (unverified process, owner Product lead).
2. **Trusted Web Activity** (Android) wrapping the same PWA if a stand-alone store listing is ever needed; no code fork.
3. **Native only if** a requirement appears that the web cannot meet (e.g. guaranteed iOS push for crisis follow-up). Even then, crisis follow-up should be human (phone call) within the 15-minute SLA, not app push.

## 5. Risks

| Risk | Mitigation |
|---|---|
| iOS users miss reminders | SMS/WhatsApp neutral reminders (v1), in-app inbox, coordinator follow-up for overdue items |
| Installed icon reveals use (R-09) | Neutral name and icon; install prompt hidden in discreet mode |
| Service worker serves stale crisis numbers | Numbers versioned in `crisis_lines.v1.json`; SW update on every deploy; numbers verified before demo |
| Shared family phone | Quick exit, session in memory/sessionStorage only, short token TTL, no PHI in cache |
