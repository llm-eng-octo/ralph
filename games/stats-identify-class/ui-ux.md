# Stats: Identify the Right Measure — UI/UX Audit
**Build:** #573
**Date:** 2026-03-23
**Method:** Full browser playthrough — Playwright MCP, 375×812px (mobile)
**URL:** https://storage.googleapis.com/mathai-temp-assets/games/stats-identify-class/builds/573/index.html

> Prior entry was spec-only (pre-build). This replaces it with a full browser playthrough audit.

---

## Summary

| Severity | Count |
|----------|-------|
| P0       | 1     |
| HIGH     | 3     |
| MEDIUM   | 4     |
| LOW      | 2     |
| CDN      | 0     |
| **Total findings** | **10** |

**Verdict:** P0 confirmed — RE-QUEUE REQUIRED. The playing layout is broken on mobile: three-column `flex-direction:row` in 375px viewport. Option buttons are 22px tall (half the 44px minimum). No `#results-screen` element; no `data-testid="btn-restart"` on Play Again; no FeedbackManager audio. Game is technically completable end-to-end but visually broken throughout all 10 rounds, and tests will fail on results-screen and btn-restart assertions.

---

## P0 Findings

### P0-1: Three-column `flex-direction:row` layout — game is visually broken on 375px mobile
**Category:** (a) gen rule
**Description:** The `#game-container` element uses `display:flex; flex-direction:row` with three side-by-side children forced into 375px viewport width:

| Column | Element | Width | Height |
|--------|---------|-------|--------|
| Left | `#context-card` (context text + dataset) | 164px | 280px |
| Center | `#question-panel` (question + option buttons) | 121px | 280px |
| Right | `#explanation-panel` (explanation + Got it / Skip) | 50px | 280px |

This causes cascading failures across every single round:

1. **Option buttons only 22px tall** — Mean/Median/Mode buttons are squeezed into 121px column. `option-0` h=22px, `option-1` h=22px, `option-2` h=22px. WCAG 2.5.5 / Apple HIG minimum is 44px.
2. **"Got it — try again" and "Skip this round" visible from round 1** — the explanation column (50px) is always rendered, making these action buttons permanently visible before any wrong answer is given.
3. **After wrong answer, explanation panel expands to 646px tall** — pushing "Got it — try again" to y=747 (near bottom of 812px viewport). The "Got it" button becomes 22px tall in its expanded state.
4. **Context text and question text collide visually** — 164px + 121px + 50px = 335px out of 355px available, leaving near-zero padding.

**Evidence (live DOM measurements):**
```
#game-container: display:flex; flex-direction:row; rect: x=20, y=145, w=335, h=280
option-0 (Mean):   w=49px, h=22px  ← FAIL 44px min
option-1 (Median): w=60px, h=22px  ← FAIL 44px min
option-2 (Mode):   w=49px, h=22px  ← FAIL 44px min
explanation-panel after wrong answer: w=126px, h=646px
got-it-btn after wrong answer: y=747px, h=22px
```
**Impact:** Game is visually broken on every round. Option buttons fail WCAG touch target. "Got it" and "Skip" visible at start causes confusion. This is a mobile layout generation failure — the generator produced a side-by-side desktop layout.
**Action:** Re-queue. Gen rule required: primary game layout must use `flex-direction:column` (stacked sections). Option buttons must have `min-height:44px`. Explanation panel must be `display:none` until a wrong answer is given.
**Routing:** Gen Quality — new/strengthened mobile-first layout rule.

---

## HIGH Findings

### HIGH-1: No `#results-screen` element — end state uses TransitionScreen only
**Category:** (a) gen rule
**Description:** When all 10 rounds complete, `endGame('victory')` hides `#gameContent` and calls `TransitionScreen.show({ title: 'Well Done!', subtitle: 'You completed all rounds', buttons: [{ label: 'Play Again' }] })`. There is no `#results-screen` element in the DOM at any point. Tests that wait for `[data-testid="results-screen"]` will immediately fail (element not present). The end state also shows no score, no accuracy %, no lives remaining — only the generic "Well Done!" message.

**Evidence:**
```js
resultsScreenExists: false
resultsTestidPresent: false
transitionTitle: "Well Done!"
transitionSubtitle: "You completed all rounds"
// actual game data never injected: score=190, accuracy=90%, lives=3
```
**Action:** Gen rule: game must render a dedicated `#results-screen` with `data-testid="results-screen"` containing score, accuracy, rounds completed, and lives remaining. TransitionScreen may still be used as the visual overlay, but the content element must exist.
**Routing:** Gen Quality slot.

### HIGH-2: Play Again button missing `data-testid="btn-restart"`
**Category:** (a) gen rule
**Description:** The Play Again button rendered by TransitionScreen at end of game has no `data-testid`. Tests using `[data-testid="btn-restart"]` to click Play Again will fail with element not found.

**Evidence:**
```html
<button class="mathai-transition-btn primary" data-index="0">Play Again</button>
```
`document.querySelector('[data-testid="btn-restart"]')` returns null. This is a consistent failure pattern across multiple games.
**Action:** Gen rule: the Play Again / restart button must always carry `data-testid="btn-restart"`. If TransitionScreen generates the button, the game code must apply the testid after TransitionScreen renders.
**Routing:** Gen Quality slot.

### HIGH-3: FeedbackManager receives no `audio_content` — fires warning on every answer
**Category:** (a) gen rule
**Description:** Every answer (correct or wrong) triggers `[WARNING] [FeedbackManager] No audio_content provided`. This fires for all 11 answer events in the playthrough. FeedbackManager was called but not passed the audio payload. The spec includes `feedbackOnSkip` text for all 10 rounds — this should be the audio content payload.

**Evidence:**
```
[WARNING] [FeedbackManager] No audio_content provided × 11 (every round, correct + wrong)
```
**Action:** Gen rule: when calling `FeedbackManager.sound()` or `.playDynamicFeedback()`, always pass the `feedbackOnSkip` field from the current round as the `audio_content` parameter.
**Routing:** Gen Quality slot — FeedbackManager usage rule.

---

## MEDIUM Findings

### MED-1: `data-round` off-by-one — start screen shows "1/10 rounds completed"
**Category:** (a) gen rule
**Description:** `syncDOMState()` sets `app.dataset.round = String(gameState.currentRound + 1)`. On the start screen `currentRound=0`, so `data-round="1"` and the progress bar shows "1/10 rounds completed" instead of "0/10 rounds completed". Tests that assert `data-round="0"` on the initial state will fail.

After game ends at round index 9, `data-round` correctly shows "9" (not "10"). This makes the convention inconsistent — start is `currentRound+1` but end reflects the pre-increment state.

**Action:** Gen rule: `syncDOMState()` should store the 0-based `currentRound` directly in `data-round`, or consistently always `+1` including at game-end. Document the convention explicitly so test authors know to expect it.
**Routing:** Gen Quality slot.

### MED-2: `restartGame()` uses `await` inside a non-`async` function
**Category:** (a) gen rule
**Description:** `restartGame()` contains `try { await transitionScreen.hide(); } catch(e) { console.error(e); }` but is declared as a plain `function`, not `async function`. The `await` keyword has no effect — `transitionScreen.hide()` runs fire-and-forget. If `hide()` is a promise that must complete before re-initialization, a race condition can occur where `loadRound(0)` is called while the transition animation is still running.

**Evidence (HTML source):**
```js
function restartGame() {
    try { await transitionScreen.hide(); } catch(e) { console.error(e); }
    gameState.currentRound = 0;
    ...
```
**Impact:** Low in practice (Play Again worked in testing), but is a code correctness issue. May cause rare flicker/overlap on slow devices.
**Action:** Gen rule: if `restartGame()` uses async operations, declare it `async function restartGame()`. Otherwise remove `await` and accept synchronous execution.
**Routing:** Gen Quality + Code Review slot.

### MED-3: Results show no score or accuracy breakdown
**Category:** (a) gen rule
**Description:** End-game TransitionScreen shows only "Well Done! / You completed all rounds". No score (190 points), no first-attempt accuracy (90%), no lives remaining (3), no rounds completed (10/10). All this data is available in `gameState` at the time `endGame()` is called but is not injected into the TransitionScreen subtitle or body.

Compare to keep-track #571 which showed full score breakdown in the results screen.
**Action:** Gen rule: the end-game TransitionScreen call must dynamically populate the subtitle with score + accuracy. Example: `subtitle: \`Score: ${score} | Accuracy: ${accuracy}% | Lives: ${lives}\``.
**Routing:** Gen Quality slot.

### MED-4: `aria-live` regions exist but content population is inconsistent
**Category:** (a) gen rule — ARIA-001 partial compliance
**Description:** Two `aria-live="polite" role="status"` regions exist (`#feedback-correct`, `#feedback-text`). After correct answers, the accessibility snapshot shows "Correct! Mean/Median/Mode is the right measure here." populated into the region — this is correct. However, after wrong answers, neither region text was populated (the explanation panel fills visually but the aria-live regions remain empty). Screen readers would announce the correct answer confirmation but NOT the worked-example explanation.
**Action:** Gen rule: on wrong answer, populate `#feedback-text` with the key explanation line (e.g., "Incorrect. The answer is Median. [Why] explanation text.") so screen readers announce the feedback.
**Routing:** Gen Quality slot.

---

## LOW Findings

### LOW-1: `#option-buttons` container missing `role="group"`
**Category:** (a) gen rule
**Description:** The three option buttons (Mean/Median/Mode) are wrapped in `<div id="option-buttons" data-testid="option-buttons">` with no semantic grouping role. While individual buttons are `<button>` elements (correct), the container should have `role="group"` with an `aria-label` such as "Choose a measure" for screen-reader grouping.
**Action:** Gen rule: option button containers must have `role="group"` with a descriptive `aria-label`.
**Routing:** Gen Quality slot.

### LOW-2: `data-round` at results phase shows "9" not "10"
**Category:** (a) gen rule (same root as MED-1)
**Description:** After completing all 10 rounds and entering results phase, `data-round="9"` (the last round index, 0-based). Combined with the start screen showing `data-round="1"`, the convention is inconsistent. Tests using `data-round="10"` to confirm all rounds completed will fail.
**Action:** Covered by MED-1 — fix the syncDOMState convention.
**Routing:** Gen Quality slot.

---

## Passing Checks

| Check | Result |
|-------|--------|
| CDN packages load (0 errors) | PASS — all 12 packages 200, 0 network 404s |
| window.gameState.gameId | PASS — `'stats-identify-class'` |
| window.endGame / restartGame / nextRound exposed | PASS — all 3 present |
| data-phase: start → playing → results | PASS — transitions correctly on all events |
| data-lives on #app updates | PASS — `data-lives="3"` (lives deduction fires on 2nd wrong attempt, by design) |
| data-score on #app updates | PASS — 0 → 20 → 30 → ... → 190 as rounds completed |
| aria-live regions present | PASS — 2 regions: `#feedback-correct` (polite/status), `#feedback-text` (polite/status) |
| aria-live correct-answer text populated | PASS — "Correct! [Measure] is the right measure here." announced after correct answers |
| Play Again button ≥44px touch target | PASS — 47px × 151px |
| Play Again restarts game correctly | PASS — phase resets to start_screen, score/round/lives reset to 0/0/3 |
| game_complete postMessage code present | PASS — `window.parent.postMessage({ type: 'game_complete', ... })` confirmed in source |
| gameState.gameEnded = true after all rounds | PASS |
| TransitionScreen.show() single-object arg | PASS — GEN-TS-ONEARG compliant (confirmed in source) |
| Worked example HTML rendered after wrong answer | PASS — `explanationHtml` rendered in `#explanation-content` |
| All 10 rounds navigable | PASS — game played end-to-end |
| 0 console errors | PASS — 0 errors, 11 warnings (all FeedbackManager audio — see HIGH-3) |
| syncDOMState targets #app (not document.body) | PASS — `document.getElementById('app')` used |
| Progress bar fill advances | PASS — fill progresses each completed round |
| lives deduction logic present | PASS — `gameState.lives--` fires on 2nd wrong attempt per round |
| data-phase="results" set correctly at game end | PASS |
| totalRounds = 10, roundsInContent = 10 | PASS — 10 rounds in gameState.content.rounds |

---

## Flow Observations

1. **Page load:** All 12 CDN packages loaded (0 network errors). ScreenLayout, ProgressBar, TransitionScreen all injected. Start screen rendered immediately. Progress bar shows "1/10 rounds completed" (off-by-one — MED-1). Lives show ❤️❤️❤️.

2. **Start screen:** Clean TransitionScreen overlay: "📊 Which Measure Fits Best? / Mean, Median, or Mode? — 10 rounds, 3 lives / Play" button at 47px height. gameState.gameId = `'stats-identify-class'`. data-phase="start".

3. **After Play click:** TransitionScreen hidden. `#gameContent` shown (display:block). data-phase="playing". IMMEDIATELY BROKEN: three-column `flex-direction:row` layout visible. Context card takes left 164px, question takes center 121px, explanation panel takes right 50px. Option buttons (Mean/Median/Mode) rendered at 22px height — cannot be tapped reliably on mobile.

4. **Round 1 (correct answer — Mean):** Clicked Mean button (22px, requires precise tap). Correct feedback announced ("Correct! Mean is the right measure here."). data-round advanced. FeedbackManager warning fires (HIGH-3). Score updated to 20.

5. **Round 2 (wrong answer — Mean instead of Median):** Explanation panel expanded from 50px to 646px tall. Explanation content rendered: "Answer: Median / Median = the 4th (middle) value when sorted: ₹9,200 / Why Median?..." — full HTML worked example displayed. "Got it — try again" pushed to y=747. Lives remain at 3 (first wrong attempt per round — no life deduction, by design). aria-live region NOT populated with explanation text (MED-4).

6. **After "Got it — try again":** Buttons re-enabled. Explanation persists. Clicked Median (correct). Score updated. Round advanced.

7. **Rounds 3–10:** All completable. No inter-category transition screens between rounds. Game flows as a single sequence of 10 MCQ rounds. All 10 rounds answered correctly on subsequent passes.

8. **End game (after round 10):** `endGame('victory')` fires. `#gameContent` hidden. TransitionScreen shows "🎉⭐ Well Done! / You completed all rounds / Play Again". data-phase="results". No `#results-screen` element. No score/accuracy displayed (HIGH-1, MED-3). Play Again button at 47px × 151px — passes touch target.

9. **After Play Again:** `restartGame()` resets state. gameState.currentRound=0, lives=3, score=0, gameEnded=false. Returns to start TransitionScreen. Progress bar shows "1/10" again (MED-1 off-by-one). ✓ Game is restartable.

---

## Routing Summary

| Issue | Category | Route | Action |
|-------|----------|-------|--------|
| P0-1: Three-column flex row, option buttons 22px | Gen rule | Gen Quality | CRITICAL: enforce mobile-first column layout, min-height:44px option buttons, explanation panel hidden until wrong answer |
| HIGH-1: No #results-screen in DOM | Gen rule | Gen Quality | Add dedicated results element with data-testid |
| HIGH-2: Play Again missing data-testid="btn-restart" | Gen rule | Gen Quality | Tag restart button consistently across all games |
| HIGH-3: FeedbackManager no audio_content (×11) | Gen rule | Gen Quality | Pass feedbackOnSkip as audio payload |
| MED-1: data-round off-by-one (1 on start, 9 at end) | Gen rule | Gen Quality | Clarify/fix syncDOMState round convention |
| MED-2: await in non-async restartGame() | Gen rule | Gen Quality + Code Review | Declare async or remove await |
| MED-3: Results show no score/accuracy breakdown | Gen rule | Gen Quality | Inject score data into end TransitionScreen |
| MED-4: aria-live regions not populated on wrong answer | Gen rule | Gen Quality | Populate #feedback-text on wrong answer too |
| LOW-1: option-buttons container no role="group" | Gen rule | Gen Quality | Add role="group" + aria-label |
| LOW-2: data-round="9" not "10" at results | Gen rule | Gen Quality | Covered by MED-1 |

**RE-QUEUE REQUIRED.** Primary cause: three-column `flex-direction:row` layout — entire playing screen is broken. Secondary: no `#results-screen`, no `btn-restart` testid, no audio. Must fix gen rules before re-queuing.

---

## Prior Audit Reference

Spec-only audit (2026-03-23, pre-build): identified 6 spec/gen findings including postMessage type casing conflict (GAME_COMPLETE vs game_complete) and missing restartGame() body. The postMessage casing was fixed per that audit recommendation. The browser playthrough confirms restartGame() was generated adequately (resets all fields correctly) but with the non-async await bug (MED-2).
