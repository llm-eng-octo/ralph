# associations — UI/UX Audit

**Build audited:** #472
**Audit date:** 2026-03-23
**Auditor:** UI/UX Slot (full browser playthrough)
**HTML URL:** https://storage.googleapis.com/mathai-temp-assets/games/associations/builds/472/index.html
**Previous audit:** #513 static HTML analysis (2026-03-23) — 5 findings (4a, 0b, 0c, 1d)

---

## Summary

1 P0 (restartGame() state not reset), 0 HIGH, 4 MEDIUM, 2 LOW findings confirmed via full browser playthrough. All 3 rounds completable end-to-end. Restart shows start screen but game state is NOT reset (P0). Timer error fires throughout gameplay. Total: **7 findings — 5(a), 0(b), 0(c), 2(d)**.

**Issue count:** 7 total — 5a gen rule, 0b spec, 0c CDN constraint, 2d test gap

---

## Checklist Results (Browser Playthrough)

| Check | Result | Notes |
|-------|--------|-------|
| CDN packages load | PASS | All packages load, ScreenLayout injected correctly |
| `waitForPackages()` timeout | FAIL — UI-ASC-007 | 10000ms (10s) — should be 120000ms per GEN-CDN-TIMEOUT |
| Start screen renders | PASS | TransitionScreen shows with object API: icons, title, subtitle, button |
| `data-phase` on `body` | FAIL — UI-ASC-001 | `body` has no `data-phase`. Only `#app` has `data-phase`. Confirmed LP-4 pattern. |
| `data-phase` on `#app` | PASS | Set correctly at all phase transitions (start, learn, recall, transition, results) |
| `syncDOMState()` sets `data-lives` | FAIL — UI-ASC-001 | syncDOMState() only sets `data-phase` on `#app`, nothing else |
| `transitionScreen.show()` API | PASS | Object API used throughout — `{icons, title, subtitle, buttons}` |
| All 3 rounds reachable | PASS | Round 1 → Round 2 → Round 3 all functional |
| Learn phase (emoji + name display) | PASS | Pair 1 of N shown correctly with timer counting up |
| Recall phase (MCQ buttons) | PASS | 4 choice buttons, emoji shown, "Who is this?" prompt |
| Wrong answer visual feedback | PARTIAL | Border color change visible on `.wrong` class, but no text feedback, no aria-live |
| Progress bar updates | PASS | "0/3" → "1/3" → "2/3" → "3/3" correctly at each round completion |
| Results screen reaches | PASS | "Game Complete!" with score, accuracy, time, Play Again |
| Results screen `position:fixed` | FAIL — UI-ASC-004 | `position: static`, `top: 64px` — does NOT cover viewport |
| Play Again button | PASS | 47.5px height — passes 44px minimum |
| `choice-btn` height | PASS | 51px measured — passes 44px via padding (14px top+bottom) |
| `restartGame()` resets state | FAIL — P0 UI-ASC-P0-001 | `currentRound=3`, `score=5` retained after Play Again. NOT reset. |
| `restartGame()` shows start screen | PASS | TransitionScreen start screen shown correctly via object API |
| `aria-live` region present | FAIL — UI-ASC-003 | No `aria-live` in inline script or DOM. Zero text feedback on answers. |
| `gameState.gameId` field | FAIL — UI-ASC-005 | `gameState` has no `gameId` field; templateId always resolves to null |
| ProgressBar `slotId` key | FAIL — UI-ASC-002 | `new ProgressBarComponent({ totalRounds: 3, totalLives: 0 })` — no slotId |
| `progressBar.update()` 2nd arg | PASS | `progressBar.update(currentRound, 0)` — second arg is 0 (lives); correct for unlimited-lives |
| Console errors (non-audio) | FAIL — UI-ASC-006 | `timer.getTime is not a function` fires on every answer click (~20+ times per game) |
| Sentry SDK v10.23.0 | PASS | v10.23.0 three-script pattern present |
| SignalCollector constructor args | PASS | sessionId, studentId, templateId all passed |
| FeedbackManager.init() absent | PASS | Not called anywhere |
| alert()/confirm()/prompt() absent | PASS | None present |
| window.endGame assigned | PASS | `window.endGame = endGame;` present |

---

## Findings

### [P0] UI-ASC-P0-001 — restartGame() does not reset gameState (same pattern as find-triangle-side)

- **Observed:** After completing all 3 rounds and clicking "Play Again", the start screen is shown via TransitionScreen (correct). However `window.gameState.currentRound = 3` and `window.gameState.score = 5` are retained. The `data-round` attribute on `#app` still shows `"3"`. The DOM `data-round` never changes from the final round value.
- **Code evidence:** `restartGame()` hides the results screen, re-initializes SignalCollector, then calls `transitionScreen.show(...)` to show the start screen. It contains no `gameState.currentRound = 0`, `gameState.score = 0`, or `gameState.correctCount = 0` assignments.
- **Impact:** If the player starts a second game, `currentRound` starts at 3, which immediately triggers `endGame()` after the first answer (since `currentRound >= totalRounds` evaluates true). Game is broken on replay.
- **Classification:** (a) gen prompt rule — restartGame() must reset all mutable gameState fields
- **Action:** This is the **3rd confirmed instance** of this pattern (find-triangle-side #549 was 2nd). A gen rule already exists in ROADMAP. Verify GEN-RESTART-RESET is in the prompt and covers all mutable fields: `currentRound`, `score`, `correctCount`, `attempts`, `events`, `startTime`, `gameEnded`, `isActive`, `isProcessing`.

---

### [MEDIUM] UI-ASC-001 — syncDOMState() only sets data-phase on #app, not body; no data-lives/data-round

- **Observed:** `document.body.getAttribute('data-phase')` returns `null` at all phases. `#app` correctly has `data-phase` set. `syncDOMState()` implementation: `app.setAttribute('data-phase', window.gameState.phase)` — one line only, no `data-lives`, `data-round`, or `data-score`.
- **Classification:** (a) gen prompt rule + (d) test gap — confirmed LP-4 pattern (2nd after count-and-tap, real-world-problem)
- **Action:** Any Playwright test asserting `body[data-phase]` will always fail. Test Engineering must target `#app[data-phase]` not `body[data-phase]`. No new gen rule needed (already in ROADMAP from count-and-tap audit). Route to Test Engineering: update test selectors for associations-specific tests.

---

### [MEDIUM] UI-ASC-002 — ProgressBarComponent missing slotId key

- **Observed:** `new ProgressBarComponent({ totalRounds: 3, totalLives: 0 })` — no `slotId: 'mathai-progress-slot'` key.
- **Classification:** (a) gen prompt rule
- **Action:** No new rule needed — GEN-UX-003 already addresses this. This is the **8th confirmed instance**. Increment instance count. Next build should fix if GEN-UX-003 is active.

---

### [MEDIUM] UI-ASC-003 — No aria-live region; wrong/correct feedback is CSS-only

- **Observed:** No `aria-live` element in the DOM or inline scripts. When a choice button is clicked, only CSS classes (`.correct`, `.wrong`) are applied — no text is announced. Wrong answer shows a blue border highlight only. Correct answer shows a green border only. Screen reader users get zero feedback.
- **Classification:** (a) gen prompt rule
- **Action:** No new rule needed — ARIA-001 already shipped. This is the **13th confirmed instance**. The game specifically needs a `<div id="feedback-msg" aria-live="polite" role="status"></div>` element populated with "Correct!" or "That was [name]!" on each answer.

---

### [MEDIUM] UI-ASC-004 — Results screen not position:fixed overlay

- **Observed:** `#results-screen` has `position: static`, `top: 64px` from viewport top. `display: flex` is set by `style.display = 'flex'` in JavaScript (not CSS data-phase rule). The results card is visible but does NOT cover the full viewport — scroll required on small screens.
- **Classification:** (a) gen prompt rule
- **Action:** No new rule needed — GEN-UX-001 already ships. This is the **10th confirmed instance** in live builds.

---

### [LOW] UI-ASC-005 — gameState.gameId absent; templateId always null

- **Observed:** `window.gameState` has no `gameId` field. Both SignalCollector instantiations use `templateId: window.gameState.gameId || null` which always resolves to `null`. Confirmed at runtime: `gameState.gameId` is `undefined`.
- **Classification:** (a) gen prompt rule
- **Action:** No new rule needed — GEN-GAMEID already shipped. This is the **4th confirmed instance** in a live build (build #472). Analytics data for this game is entirely unattributable.

---

### [LOW] UI-ASC-006 — timer.getTime is not a function — repeating error throughout gameplay

- **Observed:** `{"error":"Signal Error","details":"timer.getTime is not a function"}` fires on every answer click and at regular intervals — ~20+ times in a single game session. The error is caught and logged but does not crash the game. The `timer` object exposed to the CDN's audio kit apparently lacks a `getTime()` method.
- **Classification:** (d) test gap — should be caught by a Playwright assertion checking for non-audio console errors
- **Action:** Route to Test Engineering: add a Playwright assertion that no console errors besides `[FeedbackManager]` audio 404s appear after each answer click. This recurring error is masking real issues.

---

### [LOW] UI-ASC-007 — waitForPackages timeout is 10000ms (10s), not 120000ms

- **Observed:** `const timeout = 10000;` in the `waitForPackages()` loop. If CDN packages take more than 10s to load (network congestion, cold start), the game throws "Packages failed to load" and shows a blank screen.
- **Classification:** (a) gen prompt rule
- **Action:** GEN-CDN-TIMEOUT rule requires 120000ms. This is the **Nth confirmed instance** of the 10s timeout. Verify the rule is shipping correctly.

---

## Positive Observations

- CDN packages all load successfully (all 9 components present)
- TransitionScreen used with object API throughout — no string mode (PASS)
- All 3 rounds functional and completable end-to-end
- Progress bar text updates correctly: 0/3 → 1/3 → 2/3 → 3/3
- Round transition screen uses TransitionScreen CDN (not custom HTML) — correct
- FeedbackManager audio plays on every answer, guarded correctly (no crash on 404)
- Timer pause/resume on audio playback working correctly
- Play Again button 47.5px — passes 44px minimum
- choice-btn 51px rendered height — passes 44px (via 14px top+bottom padding)
- Sentry SDK v10.23.0 three-script pattern present
- SignalCollector constructor args all passed (sessionId, studentId, templateId)
- FeedbackManager.init() correctly absent
- No alert()/confirm()/prompt() calls
- window.endGame properly assigned

---

## Routing

| Finding | Severity | Slot | Action |
|---------|----------|------|--------|
| UI-ASC-P0-001 — restartGame() no state reset | P0 | Gen Quality | 3rd confirmed instance — verify GEN-RESTART-RESET rule covers all mutable fields; consider re-queue |
| UI-ASC-001 — syncDOMState only #app not body | MEDIUM | Test Engineering | Update test selectors from `body[data-phase]` to `#app[data-phase]` for associations tests |
| UI-ASC-002 — ProgressBar missing slotId | MEDIUM | Gen Quality | 8th instance — GEN-UX-003 already ships; confirm in next build |
| UI-ASC-003 — No aria-live feedback | MEDIUM | Gen Quality | 13th ARIA-001 instance — rule shipped; confirm in next build |
| UI-ASC-004 — Results screen position:static | MEDIUM | Gen Quality | 10th GEN-UX-001 instance — rule shipped; confirm in next build |
| UI-ASC-005 — gameState.gameId absent | LOW | Gen Quality | 4th confirmed live-build instance — GEN-GAMEID shipped; confirm coverage |
| UI-ASC-006 — timer.getTime repeating error | LOW | Test Engineering | Add Playwright assertion: no non-audio console errors after answer click |
| UI-ASC-007 — waitForPackages 10s timeout | LOW | Gen Quality | GEN-CDN-TIMEOUT rule requires 120s; verify rule is active and shipping |
