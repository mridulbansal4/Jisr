# Accessibility
> Project: Jisr · Owner: Design lead (with Frontend lead) · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](../01-product/PRD.md) · [Design system](DESIGN_SYSTEM.md) · [UI spec](UI_SPEC.md) · [Localization](LOCALIZATION.md) · [Testing](../03-engineering/TESTING.md) · [Compliance](../06-security-compliance/COMPLIANCE.md)

**Target:** WCAG 2.2 Level AA across all person-facing screens (S-01 … S-15) and staff screens (S-21 … S-32), in Arabic (RTL), English and Urdu (RTL). Person-facing screens go beyond AA where it helps our personas: 48 px targets, one question per screen, read-aloud.

Why it matters here: the people most likely to be lost between screen and care (brief §2 — younger people, women, non-Emiratis, low-literacy workers like P-02 Imran) are also the most likely to hit access barriers. A person in distress has reduced working memory and fine-motor control; an accessible crisis path is a safety feature, not polish.

---

## 1. Legal and policy alignment (UAE)

| Instrument | What it says (as relevant to us) | Status of our reading | How Jisr aligns |
|---|---|---|---|
| **UAE Federal Law No. 29 of 2006** concerning the rights of people with special needs ("people of determination"), amended by **Federal Law No. 14 of 2009** | Guarantees people of determination equal rights and non-discrimination, including access to services. Official text: https://elaws.moj.gov.ae/UAE-MOJ_LC-En/00_SOCIAL%20WELFARE/UAE-LC-En_2006-08-13_00029_Kait.html ; government summary: https://u.ae/en/information-and-services/justice-safety-and-the-law/anti-discrimination-laws-and-policies/federal-law-no-29-of-2006 | Law and amendment confirmed to exist (sources above). We have **not** verified a specific article that mandates digital accessibility for private health apps — **unverified**; owner: Compliance lead, by 19 Nov 2026 12:00 | Equal access to the screening and hand-off flow for people of determination; no feature only usable by sight, hearing, or fine pointer |
| **UAE National Digital Accessibility Policy** (TDRA) | Federal entities are guided to meet WCAG 2.1 AA; supported by the UAE Design System 2.0. Report: https://www.wam.ae/en/article/b30lt44-tdra-supports-implementation-national-digital | Confirmed via WAM (2024). An update aligned to WCAG 2.2 is reported by a secondary source only — **unverified** | We target **WCAG 2.2 AA**, which includes all 2.1 AA criteria, so we meet the policy baseline and the likely update |
| **UAE Design System 2.0** (TDRA) | Government web design system with accessibility built in; Emirates Health Services states platforms built on it target WCAG 2.2 AA (https://ehs.gov.ae/en/digital-participation/digital-accessibility-statement) | Exists (per WAM and EHS). We have not reviewed its component specs — **v1 action** | v1: if Jisr ships inside Sahatna or a government channel, map our tokens to the host design system |
| **WCAG 2.2** (W3C Recommendation) | https://www.w3.org/TR/WCAG22/ | Verified standard | Checklist §3 |
| DoH Abu Dhabi | No DoH-specific digital-accessibility standard was found during research — **unverified**; owner: Compliance lead, by 19 Nov 2026 12:00 | — | Will adopt if one exists |

Jisr is not itself a federal entity, so the TDRA policy applies to us only if a federal or government channel deploys it; we adopt it voluntarily from day one. We publish an accessibility statement (v1) modelled on UAE government statements.

---

## 2. Personas and access needs

| Persona | Likely needs | Design responses |
|---|---|---|
| P-01 Mariam | Arabic screen reader possible; anxiety → reduced concentration; uses phone in public | One question per screen, save-and-resume, discreet mode, clear progress, no time limits |
| P-02 Imran | **Low literacy** in Urdu and English; older Android phone; may share phone | Read-aloud (F-20), icons + words, 48 px targets, short sentences, answers as frequency dots + words, no typing required (free text optional), tolerant of slow networks |
| P-03 Dr Salma | 6 minutes per patient; keyboard + mouse; may use zoom | One-screen summary, keyboard shortcuts in console, high-density tables that still reflow |
| P-04 Khalid | Must notice RED fast, possibly while doing other work | Non-colour RED cues (icon + text + position), persistent banner, screen-reader announcements at thresholds |
| P-05 Programme lead | Reads charts | Every chart has a data table; patterns + direct labels, not colour only |
| People of determination (any persona) | Blind/low vision, Deaf/hard of hearing, motor, cognitive | Screen readers (VoiceOver, TalkBack, NVDA, JAWS), captions/transcripts for any audio/video, switch/keyboard access, plain language |

---

## 3. WCAG 2.2 AA checklist

Status key for MVP: **Build** = built in the hackathon; **Test** = automated or manual check in CI/demo prep; **v1** = deferred with reason.

### 3.1 Perceivable

| SC | Requirement | Jisr implementation | MVP |
|---|---|---|---|
| 1.1.1 Non-text content (A) | Text alternatives | All icons decorative (`aria-hidden`) because every icon has a visible label. Charts have "View as table". Bridge illustration `alt=""` | Build |
| 1.2.1–1.2.5 Time-based media (A/AA) | Captions, transcripts, audio description | Module audio (S-10) always has the same text on screen (text is primary). No video in MVP. Demo video (submission) gets captions in EN + AR | Build (text-first) |
| 1.3.1 Info and relationships (A) | Semantics | Landmarks (`header/main/nav`), headings in order, `fieldset/legend` for each question, real `<table>` with `<th scope>` in queue and fairness tables | Build |
| 1.3.2 Meaningful sequence (A) | DOM order = reading order | RTL achieved with `dir`, not CSS reordering; HelpNow button after main content in DOM but reachable via skip link | Build |
| 1.3.3 Sensory characteristics (A) | No "tap the red button" instructions | Copy refers to labels ("Choose this") | Build |
| 1.3.4 Orientation (AA) | Portrait and landscape | No orientation lock in PWA manifest (`"orientation": "any"`) | Build |
| 1.3.5 Identify input purpose (AA) | `autocomplete` | Phone `autocomplete="tel"`, name `autocomplete="name"` (staff/person profile only) | Build |
| 1.4.1 Use of colour (A) | Not colour alone | Content types: colour + icon + label + border style (dashed for AI). RED: icon ▲ + "RED" + sort position. SLA: icon + text. Suppressed cells: hatch + "<10" | Build |
| 1.4.3 Contrast (AA) | 4.5:1 text | All token pairs ≥ 5.4:1 (DESIGN_SYSTEM §2 — calculated) | Build + Test |
| 1.4.4 Resize text (AA) | 200 % without loss | `rem` units; text-size setting up to 135 % plus browser zoom; no fixed-height text containers | Test |
| 1.4.5 Images of text (AA) | None | Phone numbers, scores are live text | Build |
| 1.4.10 Reflow (AA) | 320 CSS px, no 2-D scroll | Person app single column; staff tables become stacked cards < 768 px; fairness table scrolls horizontally inside its own region only (data tables are an allowed exception) | Test |
| 1.4.11 Non-text contrast (AA) | 3:1 UI | Control borders `--border-strong` 3.66:1 / 3.48:1; focus ring ≥ 5.7:1 against background (2 px offset) | Build |
| 1.4.12 Text spacing (AA) | Survives user spacing | Tested with the text-spacing bookmarklet in all three locales; Nastaliq lines need generous default line-height (DESIGN_SYSTEM §3.2) so overrides do not clip | Test |
| 1.4.13 Content on hover/focus (AA) | Dismissable, hoverable, persistent | Tooltips (suppressed cell, "Why AI?") open on focus and hover, dismiss on Esc, also available as tap-to-open popovers on touch | Build |

### 3.2 Operable

| SC | Requirement | Jisr implementation | MVP |
|---|---|---|---|
| 2.1.1 Keyboard (A) | All functions | Every control is a native button/link/input or Radix primitive. Questionnaire radios: arrows + Space/Enter. Tour: Next/Back/Esc | Build + Test |
| 2.1.2 No keyboard trap (A) | — | Dialogs trap focus *within* while open and release on close; coachmarks are non-modal | Build |
| 2.1.4 Character key shortcuts (A) | Single-key shortcuts can be turned off | Quick exit "Esc ×3" is not a printable character key; staff shortcuts use modifiers (`Alt+Q` queue, `Alt+R` next RED) | Build |
| 2.2.1 Timing adjustable (A) | No time limits | Screening has no time limit; sessions persist server-side. Staff session timeout (v1) warns 2 min before with extend | Build |
| 2.2.2 Pause, stop, hide (A) | Auto-updating content | Queue auto-refresh can be paused ("Pause live updates"). SLA countdown is essential real-time information; reduced-motion mode switches it to minute updates | Build |
| 2.3.1 Three flashes (A) | — | No flashing; RED arrival is a single 200 ms highlight | Build |
| 2.4.1 Bypass blocks (A) | Skip link | "Skip to content" first focusable element (before Judge bar) | Build |
| 2.4.2 Page titled (A) | — | Per-screen titles; discreet mode uses "Jisr" only (still unique per screen: "Jisr · 3/9" for questions) | Build |
| 2.4.3 Focus order (A) | Logical | Follows visual order in both directions; HelpNow is reachable second (skip link → HelpNow → content) via a visually-hidden "Help now" link at the top that targets the button | Build |
| 2.4.4 Link purpose (A) | — | No "click here"; "Read more about how answers are used" | Build |
| 2.4.6 Headings and labels (AA) | — | One H1 per screen | Build |
| 2.4.7 Focus visible (AA) | — | 2 px `--focus` ring + 2 px offset on every interactive element; never `outline: none` without replacement | Build |
| **2.4.11 Focus not obscured (minimum) (AA)** — new in 2.2 | Focused item not fully hidden by sticky UI | 88 px bottom padding on person screens + `scroll-padding-bottom: 96px` so focused fields never sit under the fixed HelpNow button; `scroll-padding-top` for the Judge bar and top bar | Build + Test |
| 2.5.1 Pointer gestures (A) | No path gestures | None used | Build |
| 2.5.2 Pointer cancellation (A) | Activate on up-event | Native buttons. Question options select on click (up), auto-advance after 300 ms with a visible Back | Build |
| 2.5.3 Label in name (A) | Visible label in accessible name | `aria-label` only where no visible text; HelpNow's name is exactly its label | Build |
| 2.5.4 Motion actuation (A) | — | No shake-to-exit | Build |
| **2.5.7 Dragging movements (AA)** — new | Alternative to drag | No drag interactions; simulation sliders (S-32) also have number inputs and +/- buttons | Build |
| **2.5.8 Target size (minimum) (AA)** — new | ≥ 24 × 24 px | Person UI 48 × 48 px minimum; staff UI 40 × 40; inline text links have ≥ 24 px line boxes | Build + Test |

### 3.3 Understandable

| SC | Requirement | Jisr implementation | MVP |
|---|---|---|---|
| 3.1.1 Language of page (A) | `lang` on `<html>` | `lang="ar" dir="rtl"`, `lang="en" dir="ltr"`, `lang="ur" dir="rtl"` set by next-intl layout | Build |
| 3.1.2 Language of parts (AA) | `lang` on mixed-language parts | Language switcher options carry their own `lang`; English brand/clinical terms inside Arabic copy (e.g. "PHQ-9") wrapped in `<span lang="en">`; crisis line names "800-SAKINA" in `<bdi lang="en">` | Build |
| 3.2.1 / 3.2.2 On focus / on input (A) | No surprise context changes | Question auto-advance is the one exception, announced in the instructions ("Choosing an answer moves to the next question") and can be turned off in Settings | Build |
| 3.2.3 Consistent navigation (AA) | — | Same TopBar order on every screen | Build |
| 3.2.4 Consistent identification (AA) | — | Same icons/labels for the same functions everywhere | Build |
| **3.2.6 Consistent help (A)** — new | Help mechanism in same relative order | **`HelpNowButton` is in the same position (bottom-end), with the same label, on every person screen.** Crisis numbers also appear in the same order (999, 800-SAKINA, 800-HOPE) wherever shown | Build + Test |
| 3.3.1 Error identification (A) | — | Inline text errors, `aria-describedby`, `aria-invalid` | Build |
| 3.3.2 Labels or instructions (A) | — | Visible labels on all inputs; optional fields say "(optional)" | Build |
| 3.3.3 Error suggestion (AA) | — | "Choose an answer to continue" etc. | Build |
| 3.3.4 Error prevention (legal, financial, data) (AA) | Reversible / confirm | Consent changes are reversible and confirmed when they affect an active booking; booking request has a review step (S-08); staff step change and close need confirmation + reason | Build |
| **3.3.7 Redundant entry (A)** — new | Don't ask twice | Preferences (language, gender, modality) asked once and reused; IFHAS-imported answers are not re-asked | Build |
| **3.3.8 Accessible authentication (minimum) (AA)** — new | No cognitive test to log in | MVP: Judge Mode one-tap login. v1: UAE PASS (no password memorisation in Jisr); staff SSO must allow password managers/paste | Build / v1 |

### 3.4 Robust

| SC | Requirement | Jisr implementation | MVP |
|---|---|---|---|
| 4.1.2 Name, role, value (A) | — | Radix primitives; consent switches `role="switch" aria-checked`; SLA timers have `aria-label="13 minutes 52 seconds left"` (not the raw "13:52") | Build |
| 4.1.3 Status messages (AA) | Announce without focus | Toasts `role="status"`; autosave "Saved"; queue updates via polite live region; SLA thresholds (10/5/1 min, breach) announced politely; the crisis screen moves focus to its H1 instead of using an assertive live region | Build |

---

## 4. Low-literacy and voice-first patterns (P-02)

| Pattern | Detail | MVP |
|---|---|---|
| One question per screen | Never a long form. Max ~15 words of instruction per screen | Build |
| Answers as words **and** frequency dots | "Not at all ○", "Several days •", "More than half the days ••", "Nearly every day •••"; dots are reinforcement, not replacement | Build |
| Read-aloud (F-20) | 🔈 button per block using the Web Speech API (`speechSynthesis`), voice chosen by `lang`. Hidden if the device has no voice for the locale. **Urdu voice availability on typical Android devices is unverified** — owner: Frontend lead, test on 2 devices by 19 Nov 2026 14:00 | If time |
| Pre-recorded audio | Native-speaker recordings of instrument items and the crisis screen in AR and UR | v1 |
| No typing required | Free text (S-04) is optional; everything else is taps | Build |
| Icons always labelled | No icon-only actions on person screens | Build |
| Plain numbers | Scores shown as "11 of 27" plus words; never decimals or percentages to persons | Build |
| Confirmation by summary | S-08 shows who/when/what is shared before sending | Build |
| Shared phones | Discreet mode, Quick exit, no badges, neutral notification text (F-14) | Build |
| Voice input | Not in MVP (accuracy for Urdu/Arabizi unverified; and free text triggers the crisis gate) | v1 research |

---

## 5. Screen readers

| Platform | Reader | Locales tested | MVP check |
|---|---|---|---|
| Android (Chrome) | TalkBack | ar, ur, en | Demo flows S-01→S-09 and S-06 on one device |
| iOS (Safari) | VoiceOver | ar, en | Same flows |
| Windows (Chrome/Edge) | NVDA (free) | en, ar | Staff S-21, S-24 |
| Windows | JAWS | en | v1 |

Specific requirements
- **Bidi numbers:** phone numbers and scores in RTL are wrapped in `<bdi dir="ltr">`; screen readers then read "800 725462" in order.
- **Crisis line names:** "800-SAKINA" read as letters can confuse; provide `aria-label` "800 SAKINA, 800 725462" (EN) and the Arabic equivalent.
- **SLA timers:** `aria-label` in words; the visual timer is `aria-hidden` to avoid announcing every second.
- **Content-type badges:** the badge text is part of the block's accessible name: e.g. region "AI-drafted: In your words".
- **Gate badges:** rendered as text, so they are read in sequence ("Crisis check: clear").
- **Charts:** Recharts SVG gets `role="img"` + `aria-label` summary ("Hand-off completion: Jisr 78 %, baseline 31 %, simulated"), plus the data-table toggle.

---

## 6. Contrast, colour and font scaling

- All token pairs and their ratios: DESIGN_SYSTEM §2 (light and dark). Lowest text pair: 5.45:1 (status red on red bg, light). Lowest UI-boundary pair: 3.48:1 (dark control border).
- **Forced colours / Windows High Contrast:** use `@media (forced-colors: active)` to keep borders on content-type blocks and the hatch on suppressed cells (`forced-color-adjust: none` only on the hatch SVG, with text kept system-coloured).
- **Font scaling:** root `rem`; Settings text size (100/118/135 %); browser zoom to 200 % tested at 320 px width. Nastaliq at 135 % + 200 % zoom must not clip — Playwright screenshot check for S-03 and S-06 in `ur`.
- **Dark mode:** follows OS; tested separately for contrast.

---

## 7. Mental-health-specific accessibility

| Need | Response |
|---|---|
| Distress lowers working memory | Crisis screen has 3 actions max, large; no reading required to call (numbers + phone icons) |
| Fear of being seen | Quick exit everywhere (button + Esc ×3), discreet mode, neutral titles |
| Overwhelm from long results | Progressive disclosure: "Why this step" collapsed by default; result shows means/doesn't mean in ≤ 4 bullets |
| Trust in AI text | AI block clearly labelled, dashed border, "Why AI?" explanation, validator badge |
| Cognitive disability | Plain language, consistent layout, no time limits, save and resume |

---

## 8. Testing plan

| Layer | Tool | Where | Gate |
|---|---|---|---|
| Lint | `eslint-plugin-jsx-a11y` | `apps/web` | CI fails on error |
| Unit / component | `vitest` + `@testing-library/react` + `vitest-axe` | component tests | CI fails on any axe violation |
| E2E | Playwright + `@axe-core/playwright` | S-01…S-09, S-06, S-12, S-21, S-24, S-30, S-31 in `ar`, `en`, `ur` | CI fails on serious/critical violations |
| E2E specific | Playwright assertions | (1) `HelpNowButton` visible with same accessible name on every person route; (2) Quick exit present; (3) focused element not covered by fixed elements (bounding-box check); (4) `lang`/`dir` correct per locale | CI |
| Lighthouse | Lighthouse CI accessibility score ≥ 95 | person routes | Warn in MVP, fail in v1 |
| Manual | Keyboard-only run, TalkBack (ur/ar), VoiceOver (ar), NVDA (en), 200 % zoom, 320 px reflow, text-spacing bookmarklet | Demo prep, 20 Nov 2026 morning | Checklist signed by Design lead |
| Users | 3–5 sessions incl. one Urdu low-literacy participant and one screen-reader user | v1 (pilot) | Findings logged in backlog |

Automated tools catch roughly a third of issues; manual checks above are mandatory before the demo.

---

## 9. MVP (hackathon) vs v1 (production)

| Area | MVP (hackathon) | v1 (production) |
|---|---|---|
| Conformance | WCAG 2.2 AA design intent; automated + manual checks on demo flows | Independent audit (incl. Arabic/Urdu screen-reader testing); published accessibility statement; VPAT-style report |
| Read-aloud | Browser TTS where available (F-20 "if time") | Recorded native audio for instruments and crisis screen |
| Sign language | None | Explore Emirati Sign Language video for the crisis screen and onboarding (research partner needed) |
| High-contrast theme | Forced-colours support only | Dedicated ≥ 7:1 theme |
| User testing | Team + 1–2 informal testers | Pilot cohort with people of determination via a community partner |
| Legal | Voluntary alignment with TDRA policy | Confirm applicable obligations under Federal Law 29/2006 (as amended) and any DoH requirement before pilot |

## 10. Open questions

| # | Question | Owner | Due |
|---|---|---|---|
| AQ-1 | Does any article of Federal Law 29/2006 (as amended by 14/2009) or a later federal decree explicitly cover digital services? | Compliance lead | 19 Nov 2026 12:00 |
| AQ-2 | Is the TDRA policy update to WCAG 2.2 published? | Compliance lead | 19 Nov 2026 12:00 |
| AQ-3 | Urdu TTS voice availability on Android Chrome (2 devices) | Frontend lead | 19 Nov 2026 14:00 |
