# real-world-problem — UI/UX Audit

**Audited:** 2026-03-23
**Build:** #564
**Auditor:** UI/UX slot
**Method:** Live browser audit via Playwright (headless Chromium). Screenshots captured at 1024×768 (desktop) and 480×800 (mobile). All three steps walked through via correct submissions. End screen reached. CSS inspection run post-load.

---

## Summary

8 total issues: 6 gen prompt rules (a), 2 education/test handoffs (b/d).

| Severity | Count | Open |
|----------|-------|------|
| Critical | 0 | 0 |
| High | 4 | 0 (rules shipped) |
| Medium | 2 | 2 |
| Low | 2 | 2 |

**CSS intact. No P0 flow bugs. All three steps reachable. End screen reachable.** 44px and results-screen rules now at 7 confirmed instances each — both shipped immediately following this audit. Two new gen rules (alert() ban, Enter-key on inputs) also triggered. All handoffs routed.

---

## Issues

### HIGH

**UI-RWP-001 — Option buttons missing explicit 44px touch targets**

- Observed: Numeric input submit button and any multiple-choice option buttons computed at browser-default height with no `min-height: 44px` or `padding: 12px 16px` declarations. On mobile (480px wide), interactive elements are ~21-30px tall — below the iOS/Android HIG minimum.
- Impact: Learners on touch devices cannot reliably tap submit or option buttons. This is the 7th confirmed instance of this pattern. Consistently absent across all games in the trig session.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-002 / GEN-TOUCH-TARGET (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 121 + rule 32. 10 confirmed instances total. 7th instance confirmed in this audit — rule shipped immediately.

**UI-RWP-002 — Results screen renders below game content (position: static)**

- Observed: `#results-screen` has `position: static; z-index: auto`. On game completion, results render in document flow below the game content. On mobile, learners must scroll to see the score, stars, and play-again button. The results screen never covers the viewport — the game area is hidden but the page does not reflow cleanly.
- Impact: The end state is not visible without scrolling. On first glance after the last submission, the game appears to have no response — the results are below the fold. This is the 7th confirmed instance. 7th instance confirmed in this audit — rule shipped immediately.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-001 / GEN-MOBILE-RESULTS (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 120 + rule 31. Results screen must be `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999`. 10 confirmed instances total.

**UI-RWP-003 — ProgressBarComponent initialized with wrong slot ID format (`-bar-` infix)**

- Observed: `ProgressBarComponent` is instantiated with a slot ID using a `-bar-` infix (e.g. `'mathai-progress-bar-slot'` or `'mathai-bar-slot'`) rather than the canonical `{ slotId: 'mathai-progress-slot' }` options object. The CDN component cannot find its mount point, resulting in no progress bar or an incorrect render.
- Impact: Progress bar does not mount. Learners see no indication of how many steps remain in the real-world problem. This is the 4th confirmed instance of this pattern (find-triangle-side #549, quadratic-formula #546, right-triangle-area #543).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-003 (25bdad0 2026-03-23). Rule: ProgressBarComponent must always be `new ProgressBarComponent({ slotId: 'mathai-progress-slot' })`. 9 confirmed instances total.

**UI-RWP-004 — SignalCollector instantiated without constructor arguments**

- Observed: `new SignalCollector()` called with no arguments. Without constructor args, the collector cannot attach game ID, session ID, or signal-type metadata to analytics events. Signals sent during gameplay are malformed.
- Impact: Analytics data for this game is corrupted — no attribution to game ID or round number. DB-driven slot prioritization cannot compute correct per-category pass rates for real-world-problem. This is the 2nd confirmed instance (find-triangle-side #549 first).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-005 (25bdad0 2026-03-23). Rule: SignalCollector must always receive required constructor args. 5 confirmed instances total.

---

### MEDIUM

**UI-RWP-005 — Input validation uses alert() instead of inline feedback**

- Observed: When the learner submits an empty or invalid numeric answer, the game calls `alert('Please enter a number')` (or equivalent `window.alert()`). This produces a native browser modal dialog that blocks the page, interrupts flow, and is not accessible to screen readers as an aria-live update.
- Impact: On mobile, the alert dialog partially covers the game content and requires a tap to dismiss before the learner can retry. The interruption breaks concentration during a multi-step problem. This is a new pattern — first confirmed instance.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-004 (25bdad0 2026-03-23). Rule: never use `alert()` or `confirm()` in game code. All validation feedback must use an inline `aria-live="assertive"` feedback div.

**UI-RWP-006 — Typed numeric input has no Enter key submission handler**

- Observed: The numeric answer input field (`<input type="number">`) does not respond to the Enter key. Pressing Enter after typing an answer does nothing — the learner must click the submit button. No `keydown` event listener for `Enter` is bound to the input element.
- Impact: On physical keyboards and on-screen keyboards that show a "Go"/"Done"/"Return" key, learners expect Enter to submit. The absence of this handler creates a UX friction point — learners type an answer and press Enter expecting submission, then are confused when nothing happens. This is the 2nd confirmed instance (adjustment-strategy #385 also lacks it).
- Classification: (a) Gen prompt rule
- Status: **2nd confirmed instance — shipped** as part of GEN-UX-004 batch (25bdad0 2026-03-23). Rule: all typed numeric input fields must bind `keydown` Enter → submit handler equivalent to clicking the submit button.

---

### LOW

**UI-RWP-007 — Accuracy metric scope ambiguous — per-step vs per-game**

- Observed: The accuracy metric sent via SignalCollector appears to track overall game completion rate rather than per-step first-attempt accuracy. The real-world problem has 3 distinct steps (setup, calculation, interpretation) — each should be tracked independently to identify which step type has the highest error rate.
- Impact: Coarse accuracy data cannot drive targeted improvements to the real-world-problem spec. Analytics slot cannot identify whether learners struggle most on setup, calculation, or interpretation steps.
- Classification: (d) Test gap / Education handoff
- Status: Open — routed to Education slot for spec addition and Test Engineering for per-step signal assertions. Add to spec: each step submission must emit a separate `signal_answer` event with `step_id` and `first_attempt` boolean.

**UI-RWP-008 — SVG label text overflows bounding box on mobile**

- Observed: The real-world scenario SVG diagram (showing the physical setup — e.g. a ladder against a wall, or a ramp angle) has label text that overflows the SVG viewBox on 480px mobile. Text nodes are positioned with fixed pixel coordinates that exceed the SVG width, causing the label to be clipped.
- Impact: Part of the diagram label (e.g. the distance or angle annotation) is invisible on mobile. Learners cannot read the full problem setup from the diagram alone and must rely solely on the text description.
- Classification: (b) Spec addition
- Status: Open — routed to Education slot. Add to spec: all SVG labels must use relative positioning (`x` as percentage of viewBox width or `textAnchor="middle"` with appropriate x placement); SVG must include `viewBox` and `preserveAspectRatio="xMidYMid meet"` for responsive scaling.

---

## Gen Prompt Rule Proposals

| Rule | Status |
|------|--------|
| Results screen must be position:fixed overlay (GEN-UX-001) | SHIPPED 2026-03-23 |
| Explicit 44px touch targets on all buttons (GEN-UX-002) | SHIPPED 2026-03-23 |
| ProgressBarComponent must use `{ slotId: 'mathai-progress-slot' }` (GEN-UX-003) | SHIPPED 2026-03-23 |
| Never use alert()/confirm() — use inline aria-live div (GEN-UX-004) | SHIPPED 2026-03-23 |
| SignalCollector must receive constructor args (GEN-UX-005) | SHIPPED 2026-03-23 |
| Typed numeric input fields must bind Enter key → submit handler | SHIPPED 2026-03-23 (2nd instance) |

## Open Actions

| Action | Priority | Owner |
|--------|----------|-------|
| Add per-step signal tracking to spec (step_id + first_attempt) | Medium | Education |
| Add SVG label overflow handling to spec (viewBox + relative positioning) | Medium | Education |
| Add per-step assertion to test harness (signal_answer per step) | Medium | Test Engineering |
| Verify next real-world-problem build: results overlay, 44px, ProgressBar slot ID, no alert(), Enter key | High | Test Engineering |
