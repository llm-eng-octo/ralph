# count-and-tap — UI/UX Audit

**Audited:** 2026-03-23
**Build:** #551
**Auditor:** UI/UX slot
**Method:** Full browser playthrough via MCP Playwright (headless Chromium). Screenshots captured. All rounds completed via correct submissions. Wrong-answer path tested. Out-of-lives path tested. restartGame() state reset verified. Source inspection via browser_evaluate. CSS and DOM attribute inspection.

---

## Summary

10 total issues: 6 gen prompt rules (a), 1 spec addition (b), 1 CDN constraint / known infra (c), 2 test gaps (d).
1 prior finding retracted (UI-CAT-006 — TransitionScreen correctly used for results).

| Severity | Count | Open |
|----------|-------|------|
| Critical | 1 | 0 (rule shipped) |
| High | 4 | 1 open (syncDOMState target) |
| Medium | 2 | 1 open (ProgressBar off-by-one) |
| Low | 3 | 3 open |

**Full browser playthrough complete 2026-03-23.** 5 rounds played correct. Wrong-answer path tested (life deduction confirmed). Out-of-lives TransitionScreen confirmed. restartGame() verified: all state correctly reset (currentRound:0, lives:3, score:0, phase:'start_screen'). Game flow is fully functional end-to-end. No P0 flow bugs found (prior P0 retracted — see UI-CAT-006).

---

## Issues

### CRITICAL

**UI-CAT-001 — CSS stylesheet stripped — game renders with zero custom styling**

- Observed (browser-confirmed): First `<style>` block content: `/* [CSS stripped — 59 chars, not relevant to JS fix] */` — 57 chars total. No CSS rules present in game's own stylesheet. `showFeedback()` function applies `.flash-correct`, `.flash-wrong`, `.correct`, `.wrong` classes to elements — but these classes have no CSS rules defined, so correct/wrong visual feedback is invisible.
- Impact: All CSS class-based feedback is non-functional. Button styling relies on browser defaults. No `min-height` declaration exists anywhere (no CSS to set it). Option buttons render at 21.5px height.
- Classification: (a) Gen prompt rule + T1 check
- Status: **SHIPPED** — FIX-001 (dc03155) + PART-028 T1 check deployed 2026-03-22. Rule: LLM must never strip the `<style>` block during a JS-only fix. T1 rejects any `<style>` block whose text content is fewer than 20 chars of actual CSS after stripping comments. This is the 3rd confirmed instance (which-ratio #560 first, name-the-sides #557 second).

---

### HIGH

**UI-CAT-002 — Tap buttons missing explicit 44px touch targets**

- Observed (browser-confirmed): `.option-btn` buttons measured at 21.5px height, `minHeight: 0px`, `padding: 1px 6px`. No `min-height` rule found anywhere in the script or style blocks. This is a consequence of CSS stripping (UI-CAT-001) — original CSS may have had sizing, but was removed.
- Impact: On mobile (480px wide), tap targets are critically below the iOS/Android HIG minimum (44px). Learners using touch devices cannot reliably tap the intended buttons.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — GEN-UX-002 / GEN-TOUCH-TARGET (2026-03-23) — CDN_CONSTRAINTS_BLOCK line 121 + rule 32. 10 confirmed instances total.

**UI-CAT-003 — Dynamic feedback elements missing aria-live regions**

- Observed (browser-confirmed): `feedbackEls: []` — no elements with `aria-live` attribute found anywhere in the DOM. `showFeedback()` function updates button CSS classes and the `#dot-stage` class, but no live region announces correct/incorrect feedback. Timer countdown is also not announced.
- Impact: Screen readers do not announce tap feedback, count updates, or instructional changes. Learners using assistive technology get no feedback on their actions.
- Classification: (a) Gen prompt rule
- Status: **SHIPPED** — ARIA-001 expanded (c826ec1 2026-03-23). Rule covers ALL dynamic feedback elements with `role="status"`. 15 confirmed instances total.

**UI-CAT-004 — Dead-code guard: isActive flag set false then immediately true**

- Observed (browser-confirmed): Source confirms `gameState.isActive = false; gameState.isActive = true;` in the same synchronous frame at the top of `handleAnswer()`. The guard never prevents re-entry — any tap during processing immediately re-enables it before any async work completes.
- Impact: Race condition on fast tapping. A learner who double-taps quickly can trigger two simultaneous count increments before the first resolves.
- Classification: (a) Gen prompt rule
- Status: New — added to ROADMAP 2026-03-23. Rule proposed: never negate an `isActive` guard within the same synchronous execution frame; only reset in `.finally()` or after guarded async op completes.

**UI-CAT-008 — syncDOMState targets #app not body (HIGH test gap)**

- Observed (browser-confirmed): `syncDOMState()` function sets `data-phase`, `data-round`, `data-lives`, `data-score` on `document.getElementById('app')` — NOT on `document.body`. Verified: `app[data-phase="playing"]`, `app[data-lives="3"]`, `app[data-round="0"]` during gameplay; `body[data-phase]=null`, `body[data-lives]=null`, `body[data-round]=null`. This is the exact same pattern confirmed in real-world-problem #564 (2026-03-23).
- Impact: All Playwright test assertions using `body[data-phase]`, `body[data-lives]`, `body[data-round]` selectors will fail silently. Pipeline cannot observe game state transitions via standard test harness. Category pass rates for state-transition tests will be 0%.
- Classification: (d) Test gap + (a) gen rule
- Status: Open — HIGH priority. Second confirmed instance (real-world-problem was first). Gen rule needed: `syncDOMState()` must always call `document.body.setAttribute(...)` not `getElementById('app').setAttribute(...)`. Test Engineering handoff.

---

### MEDIUM

**UI-CAT-005 — No dot/visual indicator count warning near threshold**

- Observed: The count display shows the running total numerically but provides no visual warning as the learner approaches the target count. No colour change, no pulsing indicator, no proximity feedback within N taps of the goal. Learners only discover the boundary by overshooting.
- Impact: Learners who overshoot the target count by tapping too fast receive a failure result without any anticipatory feedback. Adding a visual warning at ≥80% of the target count would reduce overshoot errors.
- Classification: (b) Spec addition
- Status: Open — routed to Education slot. Add to spec: count display must change colour (e.g. warning state using `--mathai-warning`) when current count >= 80% of target, and pulse/vibrate (CSS animation) at 100%.

**UI-CAT-009 — ProgressBar off-by-one on final round (shows 4/5 not 5/5 at victory)**

- Observed (browser-confirmed): On completing all 5 rounds correctly, the ProgressBar header reads "4/5 rounds completed" on the victory TransitionScreen. Root cause: `renderRound(index)` calls `progressBar.update(index, lives)` using the 0-based index (0–4). For the last round, `index=4` → ProgressBar shows "4/5". After the final answer, `endGame()` is called directly without a final `progressBar.update(5, lives)` call.
- Impact: Learner sees "4/5 rounds completed" at game end even after completing all 5 rounds — confusing and inaccurate.
- Classification: (a) Gen prompt rule
- Status: Open. Rule: after correct answer on final round, call `progressBar.update(gameState.totalRounds, gameState.lives)` before calling `endGame()`, OR call it at the top of `endGame()`.

---

### LOW

**UI-CAT-006 — Results via CDN TransitionScreen (position:fixed confirmed correct)**

- Observed (browser-confirmed): Game uses `TransitionScreenComponent` CDN overlay for all end states (victory "Amazing! 🎉", game-over "Out of lives!", stars-claimed). No custom `#results-screen` element. `fixedElements: []` in DOM — CDN TransitionScreen handles its own overlay positioning internally (it is injected into `#mathai-transition-slot`).
- Impact: None. CDN TransitionScreen is the correct pattern. Prior static finding UI-CAT-006 ("position: static") is **RETRACTED** — there is no custom results screen that needs fixing.
- Classification: N/A
- Status: **RETRACTED** — GEN-UX-001 rule still valid for games that use custom `#results-screen`, but does not apply here. Browser playthrough confirms victory screen covers viewport correctly.

**UI-CAT-007 — No ARIA label on interactive option buttons**

- Observed (browser-confirmed): All `.option-btn` elements have `ariaLabel: null`. The buttons show only the numeric answer (e.g. "4") with no semantic label describing context ("tap 4 dots").
- Impact: Screen reader users cannot determine the purpose of each button beyond the number. Combined with missing aria-live (UI-CAT-003), accessibility is severely degraded.
- Classification: (a) Gen prompt rule (extension of ARIA-001)
- Status: Open — covered by ARIA-001 extended rule; verify next build includes `aria-label` on primary interaction zones.

**UI-CAT-010 — No wrong-answer text feedback (CSS-dependent feedback invisible due to strip)**

- Observed (browser-confirmed): `showFeedback(isCorrect, chosen, correctVal, btnElement)` applies CSS classes `.flash-correct`/`.flash-wrong` to `#dot-stage` and `.correct`/`.wrong` to buttons. However, these classes have no CSS rules (stylesheet stripped — UI-CAT-001). Wrong-answer path: life deducts correctly, next round loads after 1s, but learner sees zero visual indication of what the correct answer was. The correct answer button gets class `.correct` but no color change occurs.
- Impact: Learners get no visual feedback on wrong answers. The "correct answer revealed" pattern (highlighting the right option) is implemented but invisible due to CSS strip.
- Classification: (a) Gen prompt rule (consequence of CSS strip — UI-CAT-001's secondary effect)
- Status: Open — will be resolved when CSS strip rule (FIX-001 + PART-028) takes effect on next build.

---

## Browser Playthrough Verification

| Check | Result |
|-------|--------|
| CDN packages load | PASS — all CDN packages load correctly |
| Start screen visible | PASS — "Count & Tap" + "Let's Go!" renders |
| Correct answer → round advance | PASS — round increments correctly |
| Wrong answer → life deduction | PASS — ❤️❤️🤍 after 1 wrong |
| Out of lives → TransitionScreen | PASS — "Out of lives!" with "Try Again" |
| Victory → TransitionScreen | PASS — "Amazing! 🎉" with 3 stars + "Claim Stars" |
| restartGame() state reset | PASS — currentRound:0, lives:3, score:0, phase:'start_screen' |
| ProgressBar slotId | PASS — 'mathai-progress-slot' (correct) |
| ProgressBar totalLives | PASS — totalLives:3 (correct) |
| TransitionScreen API (object, not string) | PASS — `new TransitionScreenComponent({autoInject:true})` |
| game_complete postMessage | PASS — type:'game_complete' |
| data-phase on body | FAIL — set on #app, not body |
| data-lives on body | FAIL — set on #app, not body |
| Option buttons 44px min-height | FAIL — 21.5px (no CSS) |
| aria-live on feedback | FAIL — no aria-live anywhere |
| JS runtime errors | PASS — zero runtime errors |
| Audio 404s | KNOWN — CDN infra issue, non-blocking |

---

## Gen Prompt Rule Proposals

| Rule | Status |
|------|--------|
| Never strip CSS stylesheet (FIX-001 + PART-028 T1) | SHIPPED dc03155 |
| Explicit 44px touch targets on all buttons (GEN-UX-002) | SHIPPED 2026-03-23 |
| ARIA live regions on all dynamic feedback (ARIA-001 expanded) | SHIPPED c826ec1 |
| Never negate isActive guard in same sync frame | New — ROADMAP 2026-03-23 |
| syncDOMState must target body not #app | New — 2nd instance confirmed, ROADMAP |
| ProgressBar.update final round before endGame() | New — ROADMAP |
| Results screen position:fixed (GEN-UX-001) | SHIPPED — N/A for this game (CDN TransitionScreen used) |

## Open Actions

| Action | Priority | Owner |
|--------|----------|-------|
| Ship gen rule: syncDOMState must target body not #app | HIGH | Gen Quality |
| Add test assertion for #app[data-phase] as fallback | HIGH | Test Engineering |
| Add dot/count-warning visual at 80% threshold to spec | Medium | Education |
| Ship gen rule: progressBar.update final round before endGame() | Medium | Gen Quality |
| Ship dead-code guard rule (isActive anti-pattern) | Low | Gen Quality |
| Add ARIA label to primary tap zone to spec | Low | Education |
