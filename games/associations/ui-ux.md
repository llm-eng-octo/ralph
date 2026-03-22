# UI/UX Audit — associations

**Build audited:** #513 (approved, 2 iterations)
**Audit date:** 2026-03-23
**Audit method:** Static HTML analysis — full checklist against downloaded GCP build HTML
**HTML URL:** https://storage.googleapis.com/mathai-temp-assets/games/associations/builds/513/index.html
**CSS status:** INTACT — stylesheet fully present, no stripping

---

## Summary

No P0 flow bugs. CSS is intact. All mandatory structure checks pass. 5 actionable findings: 4 gen prompt rules (a), 1 test gap (d). No P0 blockers.

**Issue count:** 5 total — 4(a), 0(b), 0(c), 1(d)

---

## Mandatory Checklist

| Check | Result | Notes |
|-------|--------|-------|
| CSS stylesheet intact | PASS | Full stylesheet present, not stripped |
| FeedbackManager.init() absent | PASS | Not present anywhere in HTML |
| alert()/confirm()/prompt() absent | PASS | Not present |
| window.endGame assigned | PASS | Line 1110: `window.endGame = endGame;` |
| data-phase transitions with syncDOMState() | PASS | syncDOMState() called at all phase transitions; data-phase set on #app |
| Enter key handler (text inputs) | N/A | MCQ/button game — no text input fields |
| ProgressBar slotId: 'mathai-progress-slot' | FAIL — F1 | `new ProgressBarComponent({ totalRounds: 3, totalLives: 0 })` — no slotId key |
| aria-live="polite" on dynamic feedback | FAIL — F2 | No feedback text element at all; correct/wrong feedback is CSS class only |
| SignalCollector constructor args | PASS | sessionId, studentId, templateId all passed |
| gameState.gameId field present | FAIL — F3 | gameState object has no gameId field; templateId falls back to null |
| Results screen position:fixed | FAIL — F4 | results-screen shown via data-phase CSS override (display:flex), no position:fixed; static in normal flow |
| Touch targets min-height 44px | FAIL — F5 | choice-btn: padding only (14px 8px), no min-height; game-btn (Play Again): padding only (12px 32px), no min-height |
| Sentry SDK v10.23.0 | PASS | v10.23.0 three-script pattern present |
| initSentry() called | PASS | Called inside waitForPackages() on line ~442 |

---

## Findings

### F1 — ProgressBarComponent missing slotId key (gen prompt rule)

**Classification:** (a) gen prompt rule
**Severity:** Medium — progress bar may not render in correct CDN slot

`new ProgressBarComponent({ totalRounds: 3, totalLives: 0 })` — the `slotId: 'mathai-progress-slot'` key is absent. GEN-UX-003 was shipped (25bdad0 2026-03-23) but this build predates it. This is the **7th confirmed instance** of this pattern.

**Action:** No new rule needed — GEN-UX-003 already addresses this. Increment instance count in audit-log.md. Confirm next build fixes it.

---

### F2 — No aria-live region for correct/wrong feedback (gen prompt rule)

**Classification:** (a) gen prompt rule
**Severity:** High — screen reader users get zero feedback on answer selection

The game's feedback mechanism is purely visual: when a choice button is clicked, buttons get `.correct` or `.wrong` CSS classes applied. There is no text element with `aria-live="polite"` announcing the result. The `#learn-name` and `#learn-emoji` divs that update dynamically during the learn phase also lack `aria-live`. FeedbackManager plays audio (with guard), but that is not a substitute for DOM accessibility.

This is the **12th confirmed instance** of ARIA-001. The rule was shipped (c826ec1 2026-03-23) — this build predates it.

**Action:** No new rule needed — ARIA-001 already shipped. Increment instance count in audit-log.md. For this specific game: a feedback message div should be added to the recall area (e.g. `<div id="feedback-msg" aria-live="polite" role="status"></div>`) and populated with "Correct!" or "That was [name]!" text on each answer.

---

### F3 — gameState.gameId absent (gen prompt rule)

**Classification:** (a) gen prompt rule
**Severity:** Medium — SignalCollector templateId always null; analytics data unattributable

The `window.gameState` object has no `gameId` field. Both SignalCollector instantiations use `templateId: window.gameState.gameId || null` which always resolves to `null`. The spec Section 1 lists Game ID as `game_associations` but that value was never put into gameState.

This is the **3rd confirmed instance** (adjustment-strategy #385 was 2nd, addition-mcq spec was 2nd — now confirmed in a live build).

**Action:** Add to ROADMAP.md Gen Quality backlog (already has 2-instance entry — escalate to 3). Ship the gen prompt rule now: `gameState` must always include `gameId: '<game_id_from_spec>'`.

---

### F4 — Results screen not position:fixed overlay (gen prompt rule)

**Classification:** (a) gen prompt rule
**Severity:** High — on mobile, results screen may not cover viewport

The `#results-screen` div is inside the game template as a normal `game-block` element. It is shown by the CSS rule `#app[data-phase="results"] #results-screen { display: flex !important; }` but has no `position: fixed; inset: 0` styling. The `.results-card` is centered with `max-width: 340px` but the results-screen container itself is in normal flow.

GEN-UX-001 was shipped (d402b3b 2026-03-23) — this build (#513) predates it. This is the **9th confirmed instance**.

**Action:** No new rule needed — GEN-UX-001 already ships. Increment instance count in audit-log.md.

---

### F5 — choice-btn and game-btn missing min-height 44px (gen prompt rule + test gap)

**Classification:** (a) gen prompt rule + (d) test gap
**Severity:** Medium — choice buttons use only `padding: 14px 8px` which may not meet 44px on smaller fonts; game-btn uses `padding: 12px 32px`

Neither `.choice-btn` nor `.game-btn` declares `min-height: 44px`. GEN-UX-002 (GEN-TOUCH-TARGET) was shipped (d402b3b 2026-03-23) — this build predates it. This is the **9th confirmed touch-target instance**.

**Test gap:** No test assertion checks that `.choice-btn` computed height >= 44px. The choice buttons are dynamically generated so static HTML analysis cannot catch this — needs a Playwright assertion.

**Action:** No new rule needed — GEN-UX-002 already ships for `.game-btn`. Note: `.choice-btn` is a game-specific class not covered by GEN-UX-002 which targets `.game-btn`. The rule should be extended to cover all interactive answer-selection buttons regardless of class name. Route to Test Engineering: add Playwright assertion that `await expect(page.locator('.choice-btn').first()).toHaveCSS('min-height', '44px')`.

---

## Positive Observations

- CSS fully intact — no stripping
- FeedbackManager.init() correctly absent
- All alert()/confirm()/prompt() absent
- window.endGame properly assigned
- data-phase transitions on every game state change via syncDOMState()
- SignalCollector instantiated with full constructor args
- Sentry SDK v10.23.0 correctly configured
- initSentry() called correctly
- FeedbackManager audio playback guarded with `typeof FeedbackManager !== 'undefined'`
- Fallback content is well-structured with realistic names and emoji
- Timer (increase type) properly destroyed and recreated in restartGame()

---

## Routing

| Finding | Slot | Action |
|---------|------|--------|
| F1 — ProgressBarComponent slotId | Gen Quality | Already in ROADMAP; 7th instance — confirm fix in next build |
| F2 — ARIA-001 no aria-live | Gen Quality | Already shipped; 12th instance — confirm coverage via T1 |
| F3 — gameState.gameId absent | Gen Quality | ROADMAP entry already present — escalate to 3 instances, ship rule now |
| F4 — Results screen not fixed | Gen Quality | Already shipped; 9th instance |
| F5 (a) — choice-btn min-height | Gen Quality | Extend GEN-UX-002 to cover all answer-selection buttons (not just .game-btn) |
| F5 (d) — no test assertion for choice-btn height | Test Engineering | Add Playwright assertion: choice-btn computed min-height >= 44px |
