# find-triangle-side — UI/UX Audit

**Audited:** 2026-03-23
**Build:** #549
**Auditor:** UI/UX slot
**Method:** Live browser audit via Playwright (headless Chromium). Screenshots captured at 1024×768 (desktop) and 480×800 (mobile). All rounds walked through via correct submissions. CSS inspection run post-load.

---

## Summary

10 total issues: 6 gen prompt rules (a), 2 spec additions (b), 2 low severity.

| Severity | Count | Open |
|----------|-------|------|
| Critical | 1 | 0 (rule shipped) |
| High | 5 | 1 pending (SVG contrast) |
| Medium | 2 | 2 |
| Low | 2 | 2 |

**CSS present and intact.** Critical issue is results screen static-position (2nd confirmed instance). 4 new ROADMAP R&D entries added: ProgressBar slot ID, local asset path, SignalCollector args, SVG contrast. All handoffs routed.

---

## Issues

### CRITICAL

**UI-FTS-001 — Results screen is static-position — not a viewport overlay**

- Observed: `#results-screen` has `position: static; z-index: auto`. On completion, the results screen renders below the game content in document flow. On mobile (480×800), the "Play Again" button is below two full screen-heights. The results screen never visually replaces the game — it just appears below it. `#gameContent` is hidden but the page layout does not collapse.
- Impact: Learners cannot see the results without scrolling significantly. The celebration state and score are off-screen. On mobile, the game appears to "hang" after the last question because no overlay appears. This is the 2nd confirmed instance (name-the-sides #557 first).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-001 / GEN-MOBILE-RESULTS (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 120 + rule 31. Results screen must be `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: var(--color-background, #fff); overflow-y: auto`. 10 confirmed instances total.

---

### HIGH

**UI-FTS-002 — ProgressBarComponent initialized with wrong slot ID format**

- Observed: `ProgressBarComponent` is instantiated with a positional string argument (e.g. `new ProgressBarComponent('#mathai-progress-bar')` or similar hash-prefixed or bare string), rather than the required options object `{ slotId: 'mathai-progress-slot' }`. The CDN component fails to find its mount point, rendering no progress bar or rendering incorrectly.
- Impact: The progress bar does not mount correctly. Learners have no visual indicator of how many rounds remain. The component may also throw runtime errors that pollute the console and risk masking other errors.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-003 (25bdad0 2026-03-23). Rule: `ProgressBarComponent` must always be instantiated as `new ProgressBarComponent({ slotId: 'mathai-progress-slot' })`. 9 confirmed instances total.

**UI-FTS-003 — Dynamic feedback elements missing aria-live regions**

- Observed: Feedback panel for correct/incorrect triangle-side answers has no `aria-live` attribute. Hint text updates silently. The answer-check result is not announced. Confirmed via computed attribute inspection on `#feedback-panel`, `#hint-text`, and answer-result elements.
- Impact: Screen readers do not announce answer feedback. Learners using assistive technology receive no confirmation of correct/incorrect selection. This is the 3rd confirmed instance (which-ratio #560, name-the-sides #557).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — ARIA-001 expanded (c826ec1 2026-03-23). Covers all dynamic feedback element variants. 15 confirmed instances total.

**UI-FTS-004 — Option buttons missing explicit 44px touch targets**

- Observed: Side-selection option buttons computed at browser-default height with no `min-height: 44px` or `padding: 12px 16px` declarations. On mobile, the buttons are ~21-30px tall — below the iOS/Android HIG minimum touch target size.
- Impact: Learners on touch devices cannot reliably tap option buttons. This is the 3rd confirmed instance (which-ratio #560, name-the-sides #557).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-002 / GEN-TOUCH-TARGET (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 121 + rule 32. 10 confirmed instances total.

**UI-FTS-005 — Local asset path used in TransitionScreen icon**

- Observed: `TransitionScreenComponent` is instantiated with an `icon` field pointing to a local relative path (e.g. `./assets/triangle.svg` or similar). Local asset paths do not exist in the GCP-hosted build environment — the icon 404s silently, leaving a broken image or empty icon slot in the transition screen.
- Impact: The transition screen (shown on correct answer or game end) has a broken icon. Learners see an empty or broken image placeholder. In some browsers this generates a visible broken-image indicator.
- Classification: (a) Gen prompt rule
- Status: New — added to ROADMAP 2026-03-23. Rule: never use local/relative asset paths in CDN component configuration. All icons must be CDN-hosted URLs (mathai CDN or standard public CDN) or omitted entirely.

**UI-FTS-006 — SignalCollector instantiated without constructor arguments**

- Observed: `new SignalCollector()` called with no arguments. The `SignalCollector` constructor requires at minimum a configuration object specifying the signal schema and game metadata. Without it, the collector cannot attach the correct game ID or signal type metadata, resulting in malformed or missing analytics events.
- Impact: Analytics signals sent during gameplay have no game ID, session ID, or signal-type classification. DB-driven slot prioritization is corrupted for this game — pass/fail rates cannot be attributed correctly. This is the 1st confirmed instance.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-005 (25bdad0 2026-03-23). Rule: `SignalCollector` must always be called with its required constructor arguments. 5 confirmed instances total.

---

### MEDIUM

**UI-FTS-007 — SVG diagram lines use low-contrast colour (#64748b)**

- Observed: The triangle SVG diagram uses `#64748b` (slate-500) for side lines and vertex markers. This colour achieves a contrast ratio of approximately 3.5:1 against a white background — below the WCAG AA minimum of 4.5:1 for text and graphical content used to identify components. Vertex labels are also in a muted grey that fails contrast.
- Impact: Learners with low vision or in bright sunlight cannot clearly see the triangle side lines. The core educational stimulus — distinguishing opposite, adjacent, and hypotenuse — is harder to perceive. This is the 2nd confirmed instance (which-ratio #560 first).
- Classification: (a) Gen prompt rule
- Status: Pending. Rule proposed: SVG diagram lines must use a colour with ≥4.5:1 contrast against the game background. Use `#374151` (gray-700) or `#1e293b` (slate-900) for structural lines. Avoid `#64748b` and lighter greys.

**UI-FTS-008 — Mobile overflow on long formula/fraction display**

- Observed: On 480px mobile viewport, fraction-format answers (e.g. "sin(θ) = opposite/hypotenuse") overflow their container horizontally. The denominator or the fraction slash is clipped by the right edge. No `overflow-x: auto` or wrapping is applied to the formula display container.
- Impact: The mathematical formula — the key learning content — is partially invisible on mobile. Learners cannot read the full answer or understand which side relationship is being asked about.
- Classification: (b) Spec addition
- Status: Open — routed to Education slot. Add to spec: formula/fraction display containers must use `overflow-x: auto; max-width: 100%` and mathematical fractions must render as stacked fractions (numerator/denominator with a rule) or use MathML/KaTeX if the CDN supports it, rather than inline slash notation that wraps unpredictably.

---

### LOW

**UI-FTS-009 — Results screen heading does not vary by performance**

- Observed: `showResults()` always renders `<h2>Congratulations!</h2>` regardless of score or star count. A learner who answers no questions correctly still sees "Congratulations!" — semantically inconsistent.
- Impact: Minor pedagogical inconsistency. Incorrect positive reinforcement for poor performance.
- Classification: (b) Spec addition
- Status: Open — routed to Education slot. Add to spec: vary results heading by star count: 3 stars → "Congratulations!", 1-2 stars → "Well Done!", 0 stars → "Keep Practicing!".

**UI-FTS-010 — No CSS variables set for theming — CDN components use internal defaults**

- Observed: CSS custom properties `--color-primary`, `--color-background`, `--color-correct`, `--color-incorrect` are not set in the game's init block. CDN components fall back to their own internal defaults, which may not match this game's intended colour palette.
- Impact: Visual consistency across the trig session is compromised. Each game may show slightly different button colours or feedback colours due to CDN component fallback defaults.
- Classification: (a) Gen prompt rule (low — no functional break)
- Status: Open — routed to Gen Quality. The init block should call `document.documentElement.style.setProperty()` for the standard palette variables.

---

## Gen Prompt Rule Proposals

| Rule | Status |
|------|--------|
| Results screen must be position:fixed overlay (GEN-UX-001) | SHIPPED 2026-03-23 |
| ProgressBarComponent must use `{ slotId: 'mathai-progress-slot' }` (GEN-UX-003) | SHIPPED 2026-03-23 |
| ARIA live regions on all dynamic feedback (ARIA-001 expanded) | SHIPPED c826ec1 |
| Explicit 44px touch targets on all buttons (GEN-UX-002) | SHIPPED 2026-03-23 |
| Never use local/relative asset paths in CDN component config | New — ROADMAP 2026-03-23 |
| SignalCollector must receive constructor args (GEN-UX-005) | SHIPPED 2026-03-23 |
| SVG diagram lines must have ≥4.5:1 contrast (no #64748b) | Pending — 2 confirmed instances |

## Open Actions

| Action | Priority | Owner |
|--------|----------|-------|
| Ship SVG contrast rule to CDN_CONSTRAINTS_BLOCK | High | Gen Quality |
| Add formula/fraction overflow handling to spec | Medium | Education |
| Add results heading variation to spec | Low | Education |
| Verify next find-triangle-side build: results overlay, ProgressBar slot ID, ARIA live, 44px | High | Test Engineering |
| Add local asset path rule to CDN_CONSTRAINTS_BLOCK | Medium | Gen Quality |
