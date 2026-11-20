# Design System
> Project: Jisr · Owner: Design lead · Status: Draft v0.1 · Last updated: 2026-11-18
> Related: [Project brief](../00-overview/PROJECT_BRIEF.md) · [PRD](../01-product/PRD.md) · [UI spec](UI_SPEC.md) · [Accessibility](ACCESSIBILITY.md) · [Localization](LOCALIZATION.md) · [Architecture](../03-engineering/ARCHITECTURE.md)

Jisr has two kinds of user and therefore two "moods" built on one token set:

- **Person-facing** (P-01 Mariam, P-02 Imran): calm, quiet, stigma-free. Nothing looks like a hospital alarm. A persistent **"I need help now"** button and a **Quick exit** live on every screen.
- **Staff-facing** (P-03 Dr Salma, P-04 Khalid, P-05 Programme lead): dense, scannable, status-coloured. RED means RED here.

The north-star moments these tokens must serve are listed in the brief §14 (Mariam's three taps, the crisis gate, Dr Salma's one-screen summary, the dashboard with suppressed cells).

---

## 1. Design principles

| # | Principle | What it means in Jisr | How we check it |
|---|---|---|---|
| 1 | **Calm, not clinical** | Sand neutrals and a sea-teal primary. No red/amber/green traffic lights on a person's own scores. No exclamation marks. | Person screens contain no `status.red/amber/green` tokens (lint rule on `apps/web/app/[locale]/(person)`) |
| 2 | **Help is one tap away, always in the same place** | `HelpNowButton` fixed at the bottom-end of every person screen (WCAG 2.2 SC 3.2.6 Consistent Help). | Playwright test asserts the button on every person route |
| 3 | **Show the source of every sentence** | Three visibly separated content types: **Observed**, **Calculated**, **AI-drafted**. They never share a container. | Every content block renders a `ContentTypeBadge`; story test |
| 4 | **Show the gates** | `GateBadge` shows Crisis Gate, Validator, Clinician and Consent states wherever they apply. Judges can see the safety design without reading the code. | Gate badges appear on S-05, S-07, S-24, S-22 (see UI_SPEC) |
| 5 | **Say less, mean it** | One question per screen. One primary action per screen. Plain language (target reading age ≈ 9–11 in English; short MSA in Arabic). | Copy review checklist §9.6 |
| 6 | **Privacy you can see** | When a consent toggle changes, the preview of what is shared changes in the same frame. Discreet mode removes all wording that reveals what the app is for. | S-12 test: toggle off → preview updates < 100 ms |
| 7 | **Arabic-first, not Arabic-also** | Layouts are designed RTL first and mirrored to LTR, using CSS logical properties only. | Visual regression in `ar`, `en`, `ur` |
| 8 | **Honest about the demo** | Synthetic data is labelled in Judge Mode. Nothing implies a real clinician is on call in the MVP. | Judge Mode bar always visible in MVP |

---

## 2. Colour tokens

Tokens are CSS custom properties defined in `apps/web/app/globals.css` and mapped into Tailwind CSS 4.3 with `@theme`. Components use **semantic** tokens only, never raw hex.

Contrast ratios were calculated with the WCAG 2.x relative-luminance formula (script in the design scratch folder; re-run if any value changes). Minimums: 4.5:1 body text, 3:1 large text and UI component boundaries (SC 1.4.3, 1.4.11).

### 2.1 Core palette — light

| Token | Hex | Use | Contrast (pair) |
|---|---|---|---|
| `--bg` | `#FAF7F2` | Page background ("sand") | — |
| `--surface` | `#FFFFFF` | Cards, sheets | — |
| `--surface-muted` | `#F2EDE4` | Secondary panels, input fills | — |
| `--text` | `#1F2A2E` | Body text ("ink") | 13.75:1 on `--bg` |
| `--text-muted` | `#4F5B60` | Secondary text, captions | 6.56:1 on `--bg`; 6.01:1 on `--surface-muted` |
| `--border` | `#D9D2C5` | Decorative dividers only | n/a (decorative) |
| `--border-strong` | `#8C8577` | Input and control outlines | 3.66:1 on `--surface` |
| `--primary` | `#0F6E6E` | Primary actions, links ("sea teal") | 5.65:1 on `--bg` |
| `--on-primary` | `#FFFFFF` | Text on primary | 6.04:1 |
| `--primary-soft` | `#DCEFEC` | Selected option fill, step card header | — |
| `--help` | `#9E3B26` | "I need help now" button, crisis screen accents ("warm clay") | white on it 6.76:1; as text on `--bg` 6.32:1 |
| `--on-help` | `#FFFFFF` | Text on help | 6.76:1 |
| `--focus` | `#1A56DB` | Focus ring (2 px, 2 px offset so it sits on `--bg`/`--surface`) | 5.78:1 on `--bg` |

### 2.2 Core palette — dark

| Token | Hex | Contrast (pair) |
|---|---|---|
| `--bg` | `#12181A` | — |
| `--surface` | `#1A2225` | — |
| `--surface-muted` | `#222C30` | — |
| `--text` | `#ECE7DF` | 14.57:1 on `--bg` |
| `--text-muted` | `#A9B4B8` | 8.46:1 on `--bg`; 7.62:1 on `--surface` |
| `--border` | `#2C3638` | decorative |
| `--border-strong` | `#6B7775` | 3.48:1 on `--surface` |
| `--primary` | `#5CC2B8` | 8.42:1 on `--bg` |
| `--on-primary` | `#0B1F1E` | 8.03:1 |
| `--primary-soft` | `#173634` | — |
| `--help` | `#F08A6E` | 7.31:1 on `--bg` |
| `--on-help` | `#2A0E06` | 7.36:1 |
| `--focus` | `#8AB4F8` | 8.51:1 on `--bg` |

> Note: the focus ring has ~1:1 contrast against the primary button fill itself in both themes. That is why the ring always uses a 2 px offset: the ring is then adjacent to the page background, which is what SC 1.4.11 / 2.4.11 assess.

### 2.3 Content-type tokens (the three content types)

Judges (Inception reviewer, `docs/research/research/A-organisers-judges.md`) explicitly penalise "mixing recorded observations, calculated findings and AI text". Each type has a colour **and** an icon **and** a text label, so colour is never the only cue (SC 1.4.1).

| Type | Meaning | Icon (lucide) | Light fg / bg | Ratio | Dark fg / bg | Ratio | Border |
|---|---|---|---|---|---|---|---|
| **Observed** | What the person answered, or what was imported (IFHAS results, HbA1c). Source: E-03, E-04, E-16 | `clipboard-list` | `#275D8C` / `#E5EEF7` | 5.91:1 | `#8DB8E6` / `#1B2836` | 7.22:1 | solid 1 px |
| **Calculated** | Output of a deterministic engine: score, severity band, step, RCI, SLA. Always shows the rule version (E-17) | `calculator` | `#4B5563` / `#EEF0F2` | 6.62:1 | `#B6BEC8` / `#232A30` | 7.74:1 | solid 1 px, tabular numerals |
| **AI-drafted** | Text drafted by M-01 and checked by the claim validator (E-18). Never contains a number that is not also shown in a Calculated block | `sparkles` | `#6D3FB3` / `#F1EBFA` | 5.98:1 | `#C3A3F2` / `#2A2238` | 7.11:1 | **dashed** 1 px |

Template text from M-03 (no-LLM fallback) is rendered as **Calculated** with the label "Standard explanation", because it is fixed, reviewed copy, not AI output.

### 2.4 Status tokens (staff surfaces only)

| Token | Light fg / bg | Ratio | Dark fg / bg | Ratio | Used for |
|---|---|---|---|---|---|
| `--status-red` | `#B42318` / `#FEE4E2` | 5.45:1 | `#FDA29B` / `#3A1512` | 8.35:1 | RED episodes, SLA breached |
| `--status-amber` | `#7A4F00` / `#FEF3C7` | 6.40:1 | `#FDB022` / `#33260A` | 8.02:1 | SLA < 25 % remaining, ESCALATED |
| `--status-green` | `#1E6B3A` / `#DCFCE7` | 5.94:1 | `#6CE9A6` / `#0F2A1B` | 10.12:1 | ACCEPTED, BOOKED, ATTENDED |
| `--status-neutral` | `--text-muted` / `--surface-muted` | 6.01:1 | as dark | 7.62:1 | CLOSED, informational |

**Rule:** `--status-*` tokens are not used on person-facing routes. A person's severity is shown with a neutral band chart and words (§6.5), never red/amber/green.

### 2.5 Data-visualisation tokens (programme dashboard)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-baseline` | `#8C8577` | `#7E8A88` | Simulated baseline series (dashed line) |
| `--chart-jisr` | `#0F6E6E` | `#5CC2B8` | Jisr series (solid line) |
| `--chart-cat-1..4` | `#0F6E6E` `#275D8C` `#9E3B26` `#6B5B00` | `#5CC2B8` `#8DB8E6` `#F08A6E` `#E3C55B` | Funnel stages / subgroups |
| `--suppressed-fg` | `#4F5B60` | `#A9B4B8` | "<10" text |
| `--suppressed-bg` | 45° hatch, `#F2EDE4` + `#D9D2C5` lines | `#222C30` + `#2C3638` | Suppressed cell background |

Series differ by line style (solid vs dashed) and direct labels as well as colour.

### 2.6 Implementation (Tailwind 4.3)

```css
/* apps/web/app/globals.css */
@import "tailwindcss";

:root {
  --bg:#FAF7F2; --surface:#FFFFFF; --surface-muted:#F2EDE4;
  --text:#1F2A2E; --text-muted:#4F5B60; --border:#D9D2C5; --border-strong:#8C8577;
  --primary:#0F6E6E; --on-primary:#FFFFFF; --primary-soft:#DCEFEC;
  --help:#9E3B26; --on-help:#FFFFFF; --focus:#1A56DB;
  --observed-fg:#275D8C; --observed-bg:#E5EEF7;
  --calc-fg:#4B5563; --calc-bg:#EEF0F2;
  --ai-fg:#6D3FB3; --ai-bg:#F1EBFA;
  --status-red-fg:#B42318; --status-red-bg:#FEE4E2;
  --status-amber-fg:#7A4F00; --status-amber-bg:#FEF3C7;
  --status-green-fg:#1E6B3A; --status-green-bg:#DCFCE7;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:#12181A; --surface:#1A2225; --surface-muted:#222C30;
    --text:#ECE7DF; --text-muted:#A9B4B8; --border:#2C3638; --border-strong:#6B7775;
    --primary:#5CC2B8; --on-primary:#0B1F1E; --primary-soft:#173634;
    --help:#F08A6E; --on-help:#2A0E06; --focus:#8AB4F8;
    --observed-fg:#8DB8E6; --observed-bg:#1B2836;
    --calc-fg:#B6BEC8; --calc-bg:#232A30;
    --ai-fg:#C3A3F2; --ai-bg:#2A2238;
    --status-red-fg:#FDA29B; --status-red-bg:#3A1512;
    --status-amber-fg:#FDB022; --status-amber-bg:#33260A;
    --status-green-fg:#6CE9A6; --status-green-bg:#0F2A1B;
  }
}
:root[data-theme="dark"] { /* same values as the media block above */ }

@theme inline {
  --color-bg: var(--bg); --color-surface: var(--surface); --color-surface-muted: var(--surface-muted);
  --color-ink: var(--text); --color-ink-muted: var(--text-muted);
  --color-primary: var(--primary); --color-on-primary: var(--on-primary);
  --color-help: var(--help); --color-on-help: var(--on-help);
  --color-observed: var(--observed-fg); --color-observed-bg: var(--observed-bg);
  --color-calc: var(--calc-fg); --color-calc-bg: var(--calc-bg);
  --color-ai: var(--ai-fg); --color-ai-bg: var(--ai-bg);
}
body { background: var(--bg); color: var(--text); }
```

The theme follows the OS by default; Settings (S-13) offers Light / Dark / System and stores it in `localStorage` (wrapped in try/catch).

---

## 3. Typography

### 3.1 Families

| Script / use | Family | Source | Why |
|---|---|---|---|
| Arabic (UI + body) | **IBM Plex Sans Arabic** (400, 500, 600) | Google Fonts, OFL | Modern, open, has matching Latin glyphs; reads calmly at small sizes |
| Arabic (long reading, optional) | **Noto Naskh Arabic** (400, 600) | Google Fonts, OFL | Traditional Naskh for questionnaire items if user testing prefers it |
| Urdu | **Noto Nastaliq Urdu** (400, 600) | Google Fonts, OFL | Nastaliq is the script style Urdu readers expect; Naskh Urdu feels "Arabic" and lowers trust (assumption to validate with P-02 users — owner: Design lead, by 19 Nov 2026 12:00) |
| Urdu (dense fallback) | **Noto Naskh Arabic** | Google Fonts | Used only in staff tables if Urdu ever appears there (not in MVP) and in the fallback stack |
| Latin (English) | **IBM Plex Sans** (400, 500, 600) | Google Fonts, OFL | Pairs with Plex Arabic so EN↔AR switches do not jump |
| Numbers in staff UI | IBM Plex Sans with `font-variant-numeric: tabular-nums` | — | SLA timers and tables do not jitter |
| Code / rule IDs | **IBM Plex Mono** | Google Fonts | Rule version labels, event IDs |

Loaded with `next/font/google` (self-hosted at build time, no runtime call to Google), `display: "swap"`, subsets `arabic` and `latin`. The font family is chosen by the `lang` attribute:

```css
:lang(ar) { font-family: "IBM Plex Sans Arabic", "Noto Naskh Arabic", system-ui, sans-serif; }
:lang(ur) { font-family: "Noto Nastaliq Urdu", "Noto Naskh Arabic", system-ui, sans-serif; }
:lang(en) { font-family: "IBM Plex Sans", system-ui, sans-serif; }
```

### 3.2 Type scale

Person-facing text is larger than staff text because P-02 has low literacy and many users are on small Android phones. Arabic and Urdu need more line height; Nastaliq needs much more (its stacked ligatures are tall, and tight leading clips descenders).

| Token | EN size / line-height | AR size / line-height | UR (Nastaliq) size / line-height | Weight | Use |
|---|---|---|---|---|---|
| `display` | 32 / 40 | 32 / 52 | 30 / 66 | 600 | Crisis screen headline only |
| `h1` | 26 / 34 | 26 / 42 | 24 / 54 | 600 | Screen title |
| `h2` | 21 / 28 | 21 / 34 | 20 / 44 | 600 | Section title |
| `body-lg` | 19 / 30 | 20 / 34 | 20 / 44 | 400 | Questionnaire item, explanation text |
| `body` | 17 / 26 | 18 / 30 | 18 / 40 | 400 | Default person text |
| `label` | 15 / 22 | 16 / 26 | 16 / 34 | 500 | Buttons, chips, badges |
| `staff-body` | 15 / 22 | 16 / 26 | — | 400 | Staff console default |
| `staff-small` | 13 / 18 | 14 / 22 | — | 400 | Table meta (never below 13 px) |
| `mono` | 13 / 18 | — | — | 400 | Rule versions, IDs |

All sizes are in `rem` (base 16 px) so browser text size and zoom scale them (SC 1.4.4). Settings offers "Text size: Standard / Large / Largest" (100 / 118 / 135 %) by changing the root font size.

**Rules**
- Never use `font-style: italic` for Arabic or Urdu (no italic in these scripts; browsers fake-slant it). Use weight for emphasis.
- Never apply `letter-spacing` to Arabic or Urdu: it breaks joining.
- Never use `text-transform: uppercase` for meaning (no case in Arabic/Urdu).
- Never clip text containers with fixed heights (`overflow:hidden` + fixed `h-*`) in person UI: Nastaliq overflows vertically.
- Truncation (`text-overflow: ellipsis`) only in staff tables, with the full text in a tooltip and accessible name.

---

## 4. Spacing, layout and shape

| Token | Value | Notes |
|---|---|---|
| Spacing unit | 4 px | Tailwind default scale; use `p-4` (16), `gap-3` (12) etc. |
| Page gutter (mobile) | 16 px | Matches the 16 px phone gutter rule |
| Page gutter (≥ 768 px) | 24 px | |
| Person content max width | 560 px | Single column, centred; reading comfort |
| Staff content max width | 1440 px | Queue + detail split |
| Radius `sm / md / lg / pill` | 8 / 12 / 16 / 999 px | Cards `lg`, inputs `md`, chips `pill` |
| Elevation | `shadow-sm` for cards; `shadow-lg` only for the HelpNow button and dialogs | Calm: little depth |
| Touch target | **min 48 × 48 px** on person UI; 40 × 40 px on staff UI | WCAG 2.2 SC 2.5.8 needs 24 px; we go well beyond for P-02 |
| Bottom safe area | 88 px reserved at the bottom of person screens | Keeps content (and focus) from hiding behind `HelpNowButton` (SC 2.4.11) |
| Breakpoints | `sm` 640, `md` 768, `lg` 1024, `xl` 1280 | Person app is mobile-first; staff console is desktop-first but usable at 1024 |

**Directionality:** only logical utilities are allowed: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s`, `rounded-s-*`. An ESLint rule (`no-restricted-syntax` on class strings matching `\b(ml|mr|pl|pr|left|right|text-left|text-right)-`) blocks physical ones. See LOCALIZATION.md §6.

---

## 5. Iconography

- Library: **lucide-react** (ISC licence), 1.75 px stroke, 20 px (staff) / 24 px (person).
- Icons always pair with a text label on person screens (low literacy needs both; icon-only buttons are hard to learn).
- **Mirroring in RTL:** directional icons mirror (`arrow-left/right`, `chevron-*`, `undo`, `log-out`, progress). Non-directional icons do **not** mirror: `phone`, `check`, `clock`, `search`, `sparkles`, `calculator`, media play (play triangles stay pointing right by convention — verify with AR/UR reviewers). Apply `rtl:-scale-x-100` only to the mirrored set via the `<Icon mirror>` prop.
- No brain, pill, head-in-hands, rain-cloud or "broken" imagery anywhere. These signal illness and stigma. Illustrations, if any, are abstract shapes (horizon line, bridge arc).
- App icon and PWA manifest: a plain bridge arc; app name "Jisr" (meaning "bridge" — gives no hint of mental health on a home screen).

---

## 6. Components

Built on **shadcn/ui** primitives (Radix under the hood) with Jisr tokens. File paths are `apps/web/components/<group>/<Name>.tsx`.

### 6.1 Global (person app)

| Component | Purpose | Key props / behaviour | Accessibility notes |
|---|---|---|---|
| `AppShell` | Wraps every person screen | Renders `TopBar`, content, `HelpNowButton`, optional `JudgeModeBar` | Landmarks: `header`, `main`, `nav` |
| `TopBar` | Back, title, language, Quick exit | Title hidden in discreet mode ("Jisr" only) | Back is a real link, not history hack |
| **`HelpNowButton`** | Persistent "I need help now" | Fixed bottom-end, 56 px tall, pill, `--help` fill, phone-heart icon + label. Opens S-06 crisis screen directly (no confirm dialog). Fires `help_now_tapped`. Never hidden, never covered by sheets (z-index above sheets, below dialogs; dialogs include their own copy) | Same position and label on every screen (SC 3.2.6). Accessible name "I need help now". Keyboard shortcut: none (avoid conflicts); it is first in the tab order after "Skip to content" |
| **`QuickExit`** | Leave fast to a neutral page | Top-end button "Exit" (discreet: icon `x` + "Exit"). Also: pressing **Esc three times within 2 s** triggers it. Action: clears in-memory state, calls `window.location.replace(NEUTRAL_URL)` | Announced as "Exit to a neutral page". Visible on every person screen including crisis |
| `DiscreetModeToggle` | Settings + onboarding | When on: neutral tab title, neutral notification text, no badges, no words "mental", "depression", "anxiety", "crisis" in persistent chrome | See §9.5 for the neutral word list |
| `LanguageSwitcher` | AR / EN / UR | Shows each language in its own script ("العربية", "English", "اردو"). Sets `lang` + `dir` on `<html>` | Each option has `lang` attribute so screen readers pronounce it correctly |
| `ReadAloudButton` (F-20) | Browser TTS of the current block | Uses Web Speech API; hidden if no voice for the locale | Never auto-plays |
| `OfflineBanner` | Connectivity lost | "You're offline. Your answers are saved on this phone." Crisis numbers stay usable (static, no network needed) | `role="status"` |
| `Toast` | Non-blocking confirmations | 6 s, pausable on hover/focus | `role="status"`; never used for errors that need action |

### 6.2 Screening

| Component | Purpose | Notes |
|---|---|---|
| `QuestionCard` | One instrument item per screen | Official item text (never paraphrased, never LLM); four answer options as large radio cards with text + small frequency dots (0–3 dots). No numeric scores shown to the person while answering |
| `ProgressSteps` | "Question 3 of 9" | Text plus a thin bar; no "% complete" pressure |
| `FreeTextBox` | "Anything else you'd like us to know?" (S-04) | 500-char limit; optional; sent to API-04 Crisis Gate before anything else |
| `PauseResume` | Save and continue later | Answers stored server-side against the session; no time limit (SC 2.2.1) |

### 6.3 Content provenance and gates (judge-visible safety)

| Component | Purpose | Visual |
|---|---|---|
| **`ContentTypeBadge`** | Labels a block Observed / Calculated / AI-drafted | Pill with icon + label at block top-start; block container uses that type's bg and border (§2.3) |
| **`ProvenanceBlock`** | Container that enforces one content type | `type` prop is required; TypeScript makes mixing impossible (children typed per block) |
| **`GateBadge`** | Shows a safety gate state | Variants: `crisis-clear` ("Crisis check: clear"), `crisis-fired` ("Crisis check: help shown"), `validator-passed` ("Checked: no unsupported claims"), `validator-blocked` ("AI text blocked — standard explanation shown"), `clinician-pending` ("Waiting for clinician"), `clinician-confirmed` ("Confirmed by Dr Salma, 10:42"), `consent-shared` / `consent-not-shared`, `llm-locked` ("AI off for this conversation"). Icon + text, never colour alone |
| `ExplanationPanel` | Holds the AI-drafted explanation | States: loading (skeleton, max 3 s then template), passed, blocked (template shown, AI text discarded), **locked** (crisis fired: panel greyed, lock icon, "AI explanations are switched off while we make sure you're safe") |
| `RuleVersionTag` | Shows which rules produced a Calculated value | Mono text "rules v1.0.0 · DoH SoC 2025" linking to the rule file view |

### 6.4 Care pathway

| Component | Purpose | Notes |
|---|---|---|
| `StepCard` | Recommended step L0–L4 (or RED) | Calm title ("Talk to a psychologist by video"), not "Level 3". Level code shown small for staff |
| `FactorList` ("Why this step") | Transparent Step Matcher factors (F-05) | Each factor: icon, label, value, whether it changed the result ("Your preference: female clinician ✓ matched"). Calculated type |
| `ProviderCard` | One provider option (F-06) | Name, language chips, gender, modality, network badge, next slot, wait, cost line in AED |
| `SlotPicker` | Choose a time | Max 3 suggested slots + "See more"; large targets |
| `HandoffTracker` | Episode progress for the person (F-07/F-08) | Plain steps: Sent → Accepted → Booked → Seen → Check-in. Each with timestamp; current step highlighted |
| `ModuleCard` / `ModulePlayer` | Waiting-well modules (F-09) | 5–8 min, text + optional audio, offline-capable |
| `RecheckPrompt` | Scheduled re-check (F-10) | "It's been 2 weeks. 2 minutes to check in?" |

### 6.5 Results (person)

| Component | Notes |
|---|---|
| `ScoreBand` | Horizontal band with five neutral-tone segments (sand → teal shades) labelled "None–minimal … Severe", a marker for the person's score, number shown (e.g. "11 of 27"). Calculated block. No red |
| `MeansDoesntMean` | Two-column (stacked on mobile) block: "What this means" / "What it doesn't mean". Template-backed (Calculated) with optional AI-drafted narration below it |

### 6.6 Consent (F-13)

| Component | Notes |
|---|---|
| `ConsentToggleRow` | Switch + plain label + "who sees it" + last changed time. Switch is a real `role="switch"` with `aria-checked` |
| `SharePreview` | Live preview of exactly what the recipient sees, rendered from the same data the API would send (API-14 response). Fields not shared are struck out with "Not shared" text (not only greyed). Updates optimistically < 100 ms, reconciled with API-14 PUT result |
| `AccessLogList` | Rows from API-23: who viewed what, when, why |

### 6.7 Staff console

| Component | Notes |
|---|---|
| `QueueTable` | Sorted RED first, then SLA remaining ascending. Columns: status, person (initials + age band), reason, step, owner, SLA, last event |
| **`SlaCountdown`** | `mm:ss` under 1 h, `h:mm` under 24 h, then days. Colour + icon thresholds: neutral > 25 %, amber ≤ 25 %, red at breach ("Overdue 02:14"). Tabular numerals. Screen-reader announcements only at 10, 5, 1 min and breach |
| `RedBanner` | Top of console when any unacknowledged RED exists: "1 RED episode unacknowledged — 13:52 left". Not dismissable until acknowledged |
| `OneScreenSummary` | F-11 + F-12: scores (Observed + Calculated), trajectory sparkline, step + factors, physical context (HbA1c, BMI, sleep — Observed with source/date), consent state, timeline excerpt, AI-drafted summary (dashed) |
| `ConfirmStepDialog` | Confirm / change step (API-12). Changing requires a reason (select + free text). Shows rule suggestion vs clinician choice side by side |
| `EpisodeTimeline` | Append-only E-07 events; each row has actor, time, event, provenance badge |
| `CloseEpisodeDialog` | API-13; evidence checklist; disabled until evidence or reason given |

### 6.8 Programme dashboard

| Component | Notes |
|---|---|
| `KpiTile` | Value, label, period, delta vs baseline, "simulated" tag when from F-16 |
| `FunnelChart` | Recharts horizontal bar funnel: Screened positive → Explained → Step confirmed → Referred → Accepted → Booked → Attended → Re-checked. Baseline vs Jisr pairs |
| `TimeToCareChart` | Median days to first appointment, line chart, baseline dashed |
| **`FairnessTable`** | Subgroups (nationality group, language, gender, age band) × metrics. Cells with n < 10 render `SuppressedCell` |
| **`SuppressedCell`** | Shows "<10" (wrapped in `<bdi dir="ltr">`) on hatched bg; tooltip and accessible name "Fewer than 10 people — hidden to protect privacy". Never shows the metric value |
| `DataTableToggle` | Every chart has "View as table" (SC 1.1.1 / 1.3.1) |

### 6.9 Judge Mode (F-17)

| Component | Notes |
|---|---|
| **`JudgeModeBar`** | Thin bar at the very top on all routes in MVP: "Judge Mode · synthetic data · Role: [Mariam ▾]" + "Tour" + "Reset demo". 40 px tall, `--surface-muted`, does not cover content (it pushes layout down) |
| `RoleSwitcher` | Menu of seeded roles (P-01 … P-05). Switching calls API-22 and routes to that role's home |
| `TourCoachmark` | Step-by-step overlay for the 3-minute tour (UI_SPEC §S-41). Keyboard: Next / Back / Esc. Never covers the HelpNow button or the element it explains |
| `EventInspector` | Collapsible drawer listing analytics + episode events as they fire (shows judges the ledger working) |

### 6.10 Crisis

| Component | Notes |
|---|---|
| **`CrisisPanel`** | The S-06 layout: headline, three `CrisisCallButton`s, "someone has been alerted" status, safety lines, "Back to where I was" |
| `CrisisCallButton` | Full-width, 64 px, number shown in large tabular digits, `tel:` link. Order: 999, 800-SAKINA, 800-HOPE. On desktop (no tel handler) the number is still large and a "Copy number" button appears |

---

## 7. Motion

Motion is minimal: it explains change, it never decorates.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-fast` | 120 ms | `cubic-bezier(0.2, 0, 0, 1)` | Toggle, press feedback, SharePreview field change |
| `motion-base` | 200 ms | same | Screen-to-screen fade/slide (8 px, direction follows `dir`) |
| `motion-slow` | 320 ms | `cubic-bezier(0.3, 0, 0, 1)` | Sheets, dialogs |

**Rules**
- **Crisis screen: no motion at all.** It appears instantly (no transition), so the < 1 s promise is visible.
- No infinite animations on person screens (no pulsing help button, no breathing loaders). The HelpNow button is noticed because it is always there, not because it moves.
- Staff RED arrival: a single 200 ms background highlight on the new row plus the persistent `RedBanner`. No looping pulse; no auto-playing sound in MVP (optional chime in v1, user-controlled).
- Nothing flashes more than 3 times per second (SC 2.3.1).
- `@media (prefers-reduced-motion: reduce)`: all transitions become 0 ms opacity changes; the SLA countdown switches to minute-level updates.
- Slide direction is logical: "forward" moves toward the inline-end, so it mirrors automatically in RTL.

---

## 8. States (shared patterns)

| State | Person pattern | Staff pattern |
|---|---|---|
| Loading | Skeleton of the final layout; after 3 s add "Still loading…"; never block the HelpNow button | Skeleton rows |
| Empty | One sentence + one next action, neutral illustration-free | "No episodes in this view" + filter reset |
| Error | Plain words, what to do, retry; crisis numbers still visible | Error code + retry + "Report" (copies request id) |
| Offline | `OfflineBanner`; screening answers queue locally (IndexedDB, try/catch); crisis screen fully static | Read-only banner; actions disabled with reason |
| Success | Short confirmation, what happens next, when | Toast + timeline event |
| LLM unavailable | Template explanation, `validator-blocked` or "Standard explanation" badge | Same |

---

## 9. Voice and tone

### 9.1 Personality
Jisr sounds like **a calm, knowledgeable friend who works in healthcare**: warm, direct, never chirpy, never alarmed. It respects the person's intelligence and privacy. It does not pretend to be a person and does not do therapy.

### 9.2 Tone by moment

| Moment | Tone | Example (EN) | Example (AR — draft, pending native review) |
|---|---|---|---|
| Welcome | Warm, brief, private | "Let's find the right support for you. It takes about 5 minutes. Your answers are private." | «لنجد الدعم المناسب لك. يستغرق ذلك نحو 5 دقائق. إجاباتك خاصة.» |
| Screening | Neutral, unhurried | "Take your time. There are no right or wrong answers." | «خذ وقتك. لا توجد إجابات صحيحة أو خاطئة.» |
| Result | Honest, steady, hopeful without promising | "Your answers suggest moderate anxiety. This is common, and it responds well to support." | «تشير إجاباتك إلى قلق متوسط. هذا أمر شائع، ويتحسّن عادةً مع الدعم.» |
| Step | Concrete, choice-giving | "We suggest talking to a psychologist by video. You can choose someone else." | «نقترح التحدث مع أخصائية نفسية عبر الفيديو. يمكنك اختيار شخص آخر.» |
| Crisis | Short, direct, caring, no hedging | "You're not alone. Help is available right now." | «لست وحدك. المساعدة متاحة الآن.» |
| Waiting | Encouraging, practical | "While you wait, here's something that can help with sleep." | «أثناء الانتظار، إليك ما قد يساعد على النوم.» |
| Staff | Precise, terse | "RED · item 9 = 2 · 13:52 left · unacknowledged" | «أحمر · البند 9 = 2 · متبقٍ 13:52 · لم يُستلم» |

### 9.3 Mental-health language guidance (mandatory)

Based on WHO's resource for media professionals on preventing suicide (2023 update, https://www.who.int/publications/i/item/9789240076846 — link to verify) and Samaritans media guidelines (https://www.samaritans.org/about-samaritans/media-guidelines/ — principles apply to product copy; verify link), adapted for a screening product.

| Do | Don't | Why |
|---|---|---|
| "Your answers suggest…" | "You have depression" / "You are depressed" | A screen is not a diagnosis (non-goal: diagnosis) |
| "screen", "check-in", "questions" | "test", "exam", "diagnosis", "assessment result: positive" in person copy | "Positive" sounds like a disease test; staff UI may say "screened positive" |
| "a person living with anxiety" (person-first) | "an anxious patient", "a depressive", "sufferer" | Identity ≠ condition |
| "died by suicide", "thoughts of ending your life", "thoughts of self-harm" | "committed suicide", "successful/failed attempt" | "Committed" implies crime/sin; heavy stigma in a religious context |
| Describe levels in words: "none–minimal, mild, moderate, moderately severe, severe" | "normal / abnormal", "high-risk person", traffic-light colours on the person's own result | Stigma and alarm |
| "support", "care", "talk to someone" | "treatment" as the first word, "mental patient", "psychiatric case" | Lower the threshold to accept help |
| Say what happens next and when | Vague reassurance: "Don't worry", "Stay strong", "Everything will be fine" | Empty reassurance reads as dismissal |
| Offer choice: "You can choose…", "If you prefer…" | Commands: "You must see a doctor" (except crisis guidance) | Autonomy improves uptake |
| State privacy facts precisely: "Your employer cannot see this. Your family physician sees it only if you turn on sharing." | "100% confidential", "completely anonymous" | Over-promising breaks trust (R-09) |
| Crisis copy: concrete numbers and actions | Any mention of methods, means, or "how" detail | Method information increases risk (WHO guidance) |
| Neutral, faith-respectful language; let the person bring faith in if they want | System copy that invokes religion ("pray more"), or implies weakness of faith | Respect without assumption; avoids implying blame |
| "AI-drafted, checked by rules" | "Our AI understands you", "your AI therapist" | Non-goal: AI therapy; honesty about AI role |

**Banned words list** (`apps/web/scripts/copy-lint.ts` fails the build if found in person-facing message keys, any locale): EN `crazy, insane, psycho, mental case, committed suicide, suffer, victim, normal, abnormal, attempt failed, successful suicide`; AR equivalents maintained by the AR reviewer (e.g. «مجنون»، «انتحر» used as a verb of agency in person copy — prefer «توفي انتحاراً» in rare staff contexts, «مختل»); UR equivalents maintained by the UR reviewer (e.g. «پاگل»). The lists live in `packages/rules/copy/banned-terms.{en,ar,ur}.json`.

### 9.4 Arabic and Urdu address forms
Arabic and Urdu verbs and adjectives are gendered in second-person address. Default copy uses **gender-neutral constructions** (verbal nouns, passive, or forms identical in unvocalised script, e.g. «لست وحدك»). Where that is not possible, an optional profile setting "How should we address you?" (masculine / feminine / neutral) drives ICU `select`. See LOCALIZATION.md §5.3.

### 9.5 Discreet-mode vocabulary
When discreet mode is on, these surfaces use only neutral words:

| Surface | Normal | Discreet (EN) | Discreet (AR) | Discreet (UR) |
|---|---|---|---|---|
| Browser tab title | "Jisr — your support plan" | "Jisr" | «جسر» | «جسر» |
| Push / SMS | "Your appointment with the psychologist is confirmed" | "You have a new update" | «لديك تحديث جديد» | «آپ کے لیے ایک نئی اپ ڈیٹ ہے» |
| Re-check reminder | "Time for your 2-week wellbeing check-in" | "You have a reminder" | «لديك تذكير» | «آپ کے لیے ایک یاد دہانی ہے» |
| Home header | "Your support plan" | "Home" | «الرئيسية» | «ہوم» |
| App badge | count shown | none (F-14: no icon badges) | — | — |

The HelpNow button keeps its label in discreet mode: a hidden help button is worse than a visible one. In discreet mode its label is still "I need help now", but there is no "crisis" wording on the button. (Decision recorded; revisit after user testing.)

### 9.6 Copy checklist (every string)
1. Could Mariam read this aloud on a bus without embarrassment? (discreet test)
2. Could Imran understand it if it were read to him? (≤ 15 words per sentence; common words)
3. Does it avoid every "Don't" in §9.3?
4. Is every number in it also present in a Calculated block? (AI text rule)
5. Is it in all three locales with review status recorded? (LOCALIZATION.md §4)

---

## 10. MVP (hackathon) vs v1 (production)

| Area | MVP (hackathon) | v1 (production) |
|---|---|---|
| Tokens | Light + dark, as above | Add high-contrast theme (≥ 7:1 everywhere) |
| Fonts | Plex Sans, Plex Sans Arabic, Noto Nastaliq Urdu via `next/font` | Add Naskh toggle for Urdu after user testing; font subsetting for size |
| Components | All listed in §6; shadcn/ui base | Storybook with visual regression (Chromatic or Playwright snapshots) in CI |
| Judge Mode bar | Always on | Removed; replaced by real auth (UAE PASS / facility SSO) |
| Crisis | Static screen + `tel:` links + RED episode | Warm transfer with line operators (brief §11) |
| Discreet mode | Neutral copy, Quick exit, no badges | Disguised launcher icon option (research needed; may confuse users) |
| Sound | None | Optional staff chime for RED, user-controlled |
| Copy | EN reviewed by team; AR/UR drafts flagged until native review (R-04) | All AR/UR strings native- and clinically-reviewed before launch |

## 11. Open questions

| # | Question | Owner | Due |
|---|---|---|---|
| Q-1 | Nastaliq vs Naskh for Urdu in the screening items — validate with 3 Urdu-speaking users | Design lead | 19 Nov 2026 12:00 |
| Q-2 | Should media "play" icons mirror in RTL for AR/UR users? | AR/UR reviewers | 19 Nov 2026 12:00 |
| Q-3 | Quick-exit destination: National Center of Meteorology weather page (https://www.ncm.gov.ae) — confirm it loads fast on mobile and is neutral | Frontend lead | 19 Nov 2026 10:00 |
