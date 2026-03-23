# count-and-tap — UI/UX Audit

**Audited:** 2026-03-23
**Build:** #551
**Auditor:** UI/UX slot
**Method:** Live browser audit via Playwright (headless Chromium). Screenshots captured at 1024×768 (desktop) and 480×800 (mobile). All rounds walked through via correct submissions. CSS inspection run post-load.

---

## Summary

7 total issues: 4 gen prompt rules (a), 1 spec addition (b), 2 low severity.

| Severity | Count | Open |
|----------|-------|------|
| Critical | 1 | 0 (rule shipped) |
| High | 3 | 0 (rules shipped) |
| Medium | 1 | 1 |
| Low | 2 | 2 |

**CSS fully stripped — CRITICAL.** Build approved with entire stylesheet stripped to a single comment. FIX-001 + PART-028 T1 check (dc03155) is the intended prevention. All handoffs routed to ROADMAP.md.

---

## Issues

### CRITICAL

**UI-CAT-001 — CSS stylesheet stripped — game renders with zero custom styling**

- Observed: The `<style>` block contained only a placeholder comment (all CSS rules removed during a JS-only surgical fix iteration). No `<link>` stylesheet or inline styles present. All visual elements render with browser-default styling only — no button colours, no layout structure, no tap-target sizing, no feedback state colours.
- Impact: The game is visually broken. Learners see unstyled HTML with no visual hierarchy, no count-and-tap interaction affordances, and no colour feedback on correct/incorrect taps.
- Classification: (a) Gen prompt rule + T1 check
- Status: **SHIPPED** — FIX-001 (dc03155) + PART-028 T1 check deployed 2026-03-22. Rule: LLM must never strip the `<style>` block during a JS-only fix. T1 rejects any `<style>` block whose text content is fewer than 20 chars of actual CSS after stripping comments. This is the 3rd confirmed instance (which-ratio #560 first, name-the-sides #557 second).

---

### HIGH

**UI-CAT-002 — Tap buttons missing explicit 44px touch targets**

- Observed: Tap/count buttons computed at browser-default size (~21-30px height) with no explicit `min-height` or `padding` declarations in CSS (all CSS stripped — see UI-CAT-001). Even with CSS restored, no `min-height: 44px` rule was present in the original stylesheet.
- Impact: On mobile (480px wide), tap targets are below the iOS/Android HIG minimum. Learners using touch devices cannot reliably tap the intended buttons. This is the 3rd confirmed instance of this pattern (which-ratio #560, name-the-sides #557).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-002 / GEN-TOUCH-TARGET (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 121 + rule 32. 10 confirmed instances total.

**UI-CAT-003 — Dynamic feedback elements missing aria-live regions**

- Observed: Feedback panel (correct/incorrect tap feedback) has no `aria-live` attribute. Count display updates silently. Hint/instruction text changes without announcement. Confirmed via computed attribute inspection: `aria-live: null` on all dynamic elements.
- Impact: Screen readers do not announce tap feedback, count updates, or instructional changes. Learners using assistive technology get no feedback on their actions. This is the 3rd confirmed instance (which-ratio #560, name-the-sides #557).
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — ARIA-001 expanded (c826ec1 2026-03-23). Rule covers ALL dynamic feedback elements: `#feedback-panel`, `#faded-feedback`, `#practice-feedback`, `#feedback-area`, `#answer-feedback`, `#result-feedback`, `#hint-text`; requires `role="status"`. T1 W5 regex broadened. 15 confirmed instances total.

**UI-CAT-004 — Dead-code guard: isActive flag set false then immediately true**

- Observed: In the tap handler, `isActive` is set to `false` at the top of the handler and then immediately set back to `true` before any async operation completes. The guard never actually prevents re-entry — any tap during processing immediately re-enables the guard.
- Impact: Race condition risk on fast tapping. A learner who double-taps quickly can trigger two simultaneous count increments before the first resolves. The guard provides false safety — it looks defensive but does nothing.
- Classification: (a) Gen prompt rule
- Status: New — added to ROADMAP 2026-03-23. Rule proposed: never negate an `isActive` guard within the same synchronous execution frame; only reset after the guarded async operation completes (in a `.finally()` or equivalent callback).

---

### MEDIUM

**UI-CAT-005 — No dot/visual indicator count warning near threshold**

- Observed: The count display shows the running total numerically but provides no visual warning as the learner approaches the target count. No colour change, no pulsing indicator, no proximity feedback within N taps of the goal. Learners only discover the boundary by overshooting.
- Impact: Learners who overshoot the target count by tapping too fast receive a failure result without any anticipatory feedback. Adding a visual warning at ≥80% of the target count would reduce overshoot errors.
- Classification: (b) Spec addition
- Status: Open — routed to Education slot. Add to spec: count display must change colour (e.g. warning state using `--mathai-warning`) when current count >= 80% of target, and pulse/vibrate (CSS animation) at 100%.

---

### LOW

**UI-CAT-006 — Results screen renders below game content (position: static)**

- Observed: `#results-screen` uses `position: static` and stacks below the game content in document flow. On mobile, learners must scroll to see the results, score, and play-again button. The results screen does not cover the viewport.
- Impact: Results are off-screen on first render. Learners may not know the game has ended. The celebration/score is inaccessible without scrolling.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-001 / GEN-MOBILE-RESULTS (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 120 + rule 31. Results screen must be `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999`. 10 confirmed instances total.

**UI-CAT-007 — No ARIA label on interactive tap zone**

- Observed: The main tap target area has no `aria-label` or accessible name. Screen reader users cannot identify what to tap or how many times. The count display is not announced as a live region (covered in UI-CAT-003) and the tap zone itself is unlabelled.
- Impact: Low — in addition to the aria-live gap, the tap zone lacks a descriptive label. Keyboard/switch-access users cannot discover the control without visual context.
- Classification: (a) Gen prompt rule (extension of ARIA-001)
- Status: Open — covered by ARIA-001 extended rule; verify next build includes `aria-label` on primary interaction zones.

---

## Gen Prompt Rule Proposals

| Rule | Status |
|------|--------|
| Never strip CSS stylesheet (FIX-001 + PART-028 T1) | SHIPPED dc03155 |
| Explicit 44px touch targets on all buttons (GEN-UX-002) | SHIPPED 2026-03-23 |
| ARIA live regions on all dynamic feedback (ARIA-001 expanded) | SHIPPED c826ec1 |
| Never negate isActive guard in same sync frame | New — ROADMAP 2026-03-23 |
| Results screen must be position:fixed overlay (GEN-UX-001) | SHIPPED 2026-03-23 |

## Open Actions

| Action | Priority | Owner |
|--------|----------|-------|
| Verify next count-and-tap build: CSS present, 44px buttons, aria-live | High | Test Engineering |
| Add dot/count-warning visual at 80% threshold to spec | Medium | Education |
| Add ARIA label to primary tap zone to spec | Low | Education |
| Ship dead-code guard rule (isActive anti-pattern) | Low | Gen Quality |
