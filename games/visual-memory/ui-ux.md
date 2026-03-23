# Visual Memory — UI/UX Audit

**Build:** #528
**Date:** 2026-03-23
**Method:** Full browser playthrough — Playwright MCP, 375×812px (mobile), GCP HTML download

---

## Summary

| Severity | Count |
|----------|-------|
| P0       | 1     |
| HIGH     | 2     |
| MEDIUM   | 4     |
| LOW      | 3     |
| CDN      | 1     |
| **Total findings** | **11** |

**Verdict: RE-QUEUE REQUIRED.** P0-1 (endGame guard blocks results screen on perfect playthrough) makes the all-correct path uncompletable. All 5 rounds were played through live; the results screen is unreachable without manually patching `gameState.isActive`.

---

## P0 Findings

### P0-1 — endGame() guard blocks results screen on all-correct playthrough

**Category:** (a) gen rule
**Description:** When a player completes all 5 rounds correctly (no lives lost), the results screen never appears. The game freezes on the final recall view — Submit button is disabled, feedback shows "Perfect recall!", and no further interaction is possible. The game is permanently stuck.

**Root cause:** `endGame()` at line 773 has a guard:
```javascript
if (!gameState.isActive && gameState.lives > 0) return;
```
In the correct-answer path, `handleSubmit()` sets `gameState.isActive = false` at line 523. It is never reset to `true` before the `setTimeout(() => nextRound(), 1500)` fires. When `nextRound()` increments `currentRound` to 5 (matching `totalRounds=5`) and calls `endGame()`, the guard condition is met (`isActive=false`, `lives=3 > 0`), and `endGame()` returns silently. `gameEnded` stays `false`. The results screen is never shown and no `game_complete` postMessage fires.

**Evidence:** Live Playwright playthrough — all 5 rounds answered correctly, waited 12+ seconds, final state:
- `gameState.phase = "playing"`, `subPhase = "recall"`
- `gameState.currentRound = 5`, `totalRounds = 5`, `score = 5`
- `gameState.gameEnded = false`
- `document.querySelector('[data-testid="results-screen"]') = null` (results div absent from DOM)
- `window.__postMessageLog = []` (no game_complete fired)

**Fix:** Remove the `!isActive` guard from `endGame()`, OR reset `gameState.isActive = true` in the correct-answer path of `handleSubmit()` before the `setTimeout(() => nextRound())` call.

**Verified fix:** When `gameState.isActive` is manually reset to `true` and `endGame()` is called, the results screen renders correctly with 3 stars, 5/5 score, 100% accuracy, "Play Again" button visible.

---

## HIGH Findings

### HIGH-1: GEN-INTERACTIVE-DIV-ROLE — Grid cells missing role/tabindex/aria-label

**Category:** (a) gen rule — GEN-INTERACTIVE-DIV-ROLE
**Description:** All 9–16 clickable grid cells (`div.grid-cell`) have no `role`, no `tabindex`, and no `aria-label`. They carry `data-testid="option-N"` and respond to click events, but are completely invisible to the accessibility tree. Playwright snapshot during the recall phase shows only "Clear" and "Submit" buttons — no cells appear as interactive elements.

**Evidence:**
```json
{ "tag": "DIV", "role": null, "tabindex": null, "ariaLabel": null, "dataIdx": "1", "classes": "grid-cell" }
```

**Action:** Gen Quality slot — GEN-INTERACTIVE-DIV-ROLE rule must be applied. Add `role="button"`, `tabindex="0"`, and `aria-label="Cell N"` (or positional label) to each `.grid-cell`.
**Routing:** Gen Quality.

---

### HIGH-2: ARIA-001 — No aria-live regions

**Category:** (a) gen rule — ARIA-001
**Instance count:** Known recurring pattern (20+ games).
**Description:** 0 `aria-live` regions found anywhere on the page. Dynamic feedback ("Perfect recall!", "Not quite the right pattern!"), phase changes, and round transitions are all invisible to screen readers.

**Evidence:** `ariaLiveCount: 0` from live DOM inspection.

**Action:** Gen Quality slot — ARIA-001 rule must be enforced. `#feedback-area` or `#feedback-text` must have `aria-live="polite"`. Also add a T1 check in validate-static.js to fail builds with 0 aria-live regions.
**Routing:** Gen Quality → Test Engineering (T1 check).

---

## MEDIUM Findings

### MED-1: results-screen missing data-testid="results-screen"

**Category:** (a) gen rule
**Description:** The results element is `<div id="results-screen" class="game-block">` — it has `id="results-screen"` but no `data-testid="results-screen"` attribute. Tests that target `[data-testid="results-screen"]` will not find it.

**Evidence:** `resultsScreenTestid: null` from live DOM check after manually triggering `endGame()`.
**Instance count:** Same pattern as keep-track #571 audit (MED-1), true-or-false #474 audit.
**Action:** Gen Quality slot — results container must have both `id="results-screen"` and `data-testid="results-screen"`.

---

### MED-2: results-screen position:static (not position:fixed)

**Category:** (a) gen rule — GEN-UX-001
**Description:** The results screen uses `position:static` (default flow). It is not a full-viewport overlay and could be obscured by other content in a parent frame context. The spec requires `position:fixed` results screens to ensure they overlay the game content.

**Evidence:** `resultsScreenPosition: "static"` from live computed style check.
**Instance count:** Known recurring pattern (10+ games).
**Action:** Gen Quality slot — results screen must use `position:fixed; top:0; left:0; width:100%; height:100%; z-index:100`.

---

### MED-3: syncDOMState() only writes data-phase (not data-round/score/lives)

**Category:** (a) gen rule
**Description:** The game's own `syncDOMState()` function (line 362–364) only sets `data-phase` on `#app`. It does not write `data-round`, `data-score`, or `data-lives`. These attributes are present on `#app` only because the test harness injects an interval that reads `gameState`. In a non-harness context, round/score/lives would never be reflected in the DOM.

After `restartGame()`, `#app[data-round]` and `#app[data-score]` show stale values (5 and 5) until the harness interval fires again (~300ms).

**Evidence:** `data-round="5"`, `data-score="5"` immediately after `restartGame()` while `gameState.currentRound=0`, `gameState.score=0`.

**Action:** Gen Quality slot — `syncDOMState()` must write all four attributes: `data-phase`, `data-round` (= `currentRound`), `data-score`, `data-lives`.

---

### MED-4: Transition screen buttons missing data-testid

**Category:** (a) gen rule
**Description:** The "I'm ready!" button (initial start screen) and "Continue" buttons (inter-round transitions) have no `data-testid`. Tests that need to click these by testid will fail.

**Evidence:**
```json
[
  { "text": "I'm ready!", "testid": null, "visible": true },
  { "text": "Continue", "testid": null, "visible": true }
]
```

**Action:** Gen Quality slot — TransitionScreen buttons that drive game flow should have `data-testid` values (e.g., `data-testid="btn-start"`, `data-testid="btn-continue"`). This is a recurring test-authoring pain point.

---

## LOW Findings

### LOW-1: waitForPackages timeout 10000ms (should be 180000ms)

**Category:** (a) gen rule
**Description:** `waitForPackages()` uses `elapsed >= 10000` (10 seconds) as the timeout. The pipeline gen rule requires 180000ms (3 minutes) to handle slow CDN loads in test environments.

**Evidence:** Line 916: `if (elapsed >= 10000) { throw new Error('Packages failed to load within 10s'); }`

**Action:** Gen Quality slot — reinforce existing rule: `waitForPackages` timeout must be 180000ms.

---

### LOW-2: gameState.gameId not set

**Category:** (a) gen rule — GEN-GAMEID
**Description:** `window.gameState.gameId` is `undefined`. The initial `gameState` object (line 326+) does not include a `gameId` field. The SignalCollector uses `gameState.gameId || null` as `templateId`, so it gets `null`.

**Evidence:** `gameId: undefined` from live `window.gameState` inspection.
**Instance count:** Recurring pattern (5+ games).
**Action:** Gen Quality slot — gameState must be initialized with `gameId: 'visual-memory'`.

---

### LOW-3: Progress bar shows N-1/5 rounds completed during recall phase

**Category:** (a) gen rule — UX observation
**Description:** After completing a round and viewing the transition screen, the progress bar shows the previous count (e.g., "0/5 rounds completed" after round 1 correct, "4/5 rounds completed" after round 5 correct). It only updates to the correct count when the "Continue" button is clicked. During the recall phase, the count trails by 1.

This is because `progressBar.update()` is called inside `setupRound()` (called via Continue), not immediately after a correct submission.

**Evidence:** Screenshot after round 5 correct submission shows progress bar at "4/5 rounds completed".

**Action:** Gen Quality — call `progressBar.update(gameState.currentRound + 1, gameState.lives)` immediately after correct answer confirmation, not deferred to the next setupRound call.

---

## CDN Findings

### CDN-1: FeedbackManager subtitle not rendered

**Category:** (c) CDN constraint
**Description:** All `FeedbackManager.playDynamicFeedback()` calls pass a `subtitle` parameter, but the console warns `[FeedbackManager] Subtitle component not loaded, skipping` on every call. Subtitles never appear visually. This is a CDN initialization order issue — SubtitleComponent must be initialized before FeedbackManager for subtitle rendering.

**Evidence:** 5 warnings of `[FeedbackManager] Subtitle component not loaded, skipping` during full playthrough.
**Action:** Document only. Known CDN constraint across all games.

---

## Passing Checks

| Check | Result |
|-------|--------|
| CDN packages load (0 non-favicon errors) | PASS — all packages loaded, 0 errors |
| window.endGame / restartGame / nextRound exposed | PASS — all three present |
| window.syncDOMState exposed | PASS |
| GEN-TS-ONEARG: TransitionScreen.show() single object arg | PASS — all 3 calls use single object |
| data-phase on #app transitions (start → playing → transition) | PASS |
| data-round / data-lives / data-score on #app updating (via harness) | PASS |
| syncDOMState targets #app (not document.body) | PASS |
| btn-restart data-testid present | PASS — `data-testid="btn-restart"` |
| btn-restart height ≥44px | PASS — 44px |
| btn-check / btn-reset data-testid present | PASS — `data-testid="btn-check"` / `data-testid="btn-reset"` |
| option-N data-testid on grid cells | PASS — `data-testid="option-0"` through `option-15` |
| FeedbackManager audio (playDynamicFeedback) | PASS — cache HIT, audio plays on every round |
| Rounds 1–5 all playable (select cells + submit) | PASS — all 5 rounds completable |
| Round transition (TransitionScreen between rounds) | PASS — "Round N / Get ready to memorize!" shown |
| Play Again button state reset | PASS — score/lives/round/phase all reset; start screen re-appears |
| Console PAGEERROR during gameplay (5 rounds) | PASS — 0 JS errors |
| Console errors (non-favicon) | PASS — 0 |
| Network 404s (non-favicon) | PASS — 0 |
| results-screen visible after endGame (when endGame runs) | PASS — display:flex, stars, score, time, Play Again |
| results-screen data-testid="results-screen" | FAIL — see MED-1 |
| results-screen position:fixed | FAIL — see MED-2 |
| game_complete postMessage fires (when endGame runs) | PASS — `window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts, ... } })` |

---

## Flow Observations

1. **Page load:** All CDN packages loaded successfully (ScreenLayout, ProgressBar, TransitionScreen, LottiePlayer, PopupComponent, TimerComponent, StoriesComponent, SubtitleComponent). 0 console errors. `#app[data-phase="start"]`, `data-lives="3"`, `data-round="0"`, `data-score="0"` all present.

2. **Start screen (TransitionScreen):** "I'm ready!" button rendered on first frame via `TransitionScreen.show()` with single-object API — GEN-TS-ONEARG confirmed passing. Game title "Visual Memory", tagline "Remember the pattern and recreate it!", eye emoji icon.

3. **After "I'm ready!" click:** Transition screen hides. Game screen appears in recall (not reveal) phase — the 3-second reveal timer auto-completes before the user can see it. Timer shows "00:00". Instruction: "Tap the cells you remember!". 3×3 grid with blank cells.

4. **Round 1 recall + submit:** Selected cells 1, 4, 7 (middle column). "3/3 cells selected" counter updates. Submit clicked → "Perfect recall!" feedback. Clear + Submit disabled during feedback audio.

5. **Inter-round transition:** "Round 2 / Get ready to memorize!" TransitionScreen with "Continue" button. Progress bar updates to "1/5 rounds completed" only after Continue is clicked (not immediately after round completion — LOW-3).

6. **Rounds 2–4:** Same pattern. Pattern sizes increase (4 cells → 5 cells → 6 cells → 7 cells). 3×3 grid transitions to 4×4 grid for rounds 3–5. Feedback audio plays each round with FeedbackManager cache HITs.

7. **Round 5 correct submission:** "Perfect recall!" shown, 1500ms timeout fires `nextRound()` which calls `endGame()`. Guard `(!isActive && lives>0)` fires → `endGame()` returns. Game frozen. `gameState = { phase:"playing", currentRound:5, gameEnded:false }`. Results screen never shown. Waited 12+ seconds — no change.

8. **Manual endGame() trigger (forced):** Reset `gameState.isActive = true`, called `endGame()`. Results screen appeared: 3 stars, "Game Complete!", Score 5/5, Time 0:00, Rounds Completed 5, Lives Remaining 3, Accuracy 100%. All display elements correct.

9. **Play Again:** Full state reset — `currentRound=0`, `score=0`, `lives=3`, `gameEnded=false`, `isActive=true`. Start screen re-renders correctly.

---

## Routing Summary

| Issue | Category | Route | Action |
|-------|----------|-------|--------|
| P0-1: endGame guard blocks results on all-correct path | (a) gen rule | Gen Quality | Fix guard: reset `isActive=true` before setTimeout in correct path |
| HIGH-1: grid cells missing role/tabindex/aria-label | (a) gen rule | Gen Quality | Enforce GEN-INTERACTIVE-DIV-ROLE |
| HIGH-2: no aria-live regions | (a) gen rule | Gen Quality + Test Engineering | Enforce ARIA-001 + T1 check |
| MED-1: results-screen missing data-testid | (a) gen rule | Gen Quality | Add data-testid="results-screen" |
| MED-2: results-screen position:static | (a) gen rule | Gen Quality | Enforce GEN-UX-001 (position:fixed) |
| MED-3: syncDOMState only writes data-phase | (a) gen rule | Gen Quality | Expand syncDOMState to write round/score/lives |
| MED-4: transition buttons missing data-testid | (a) gen rule | Gen Quality | Add data-testid to I'm ready!/Continue buttons |
| LOW-1: waitForPackages 10s timeout | (a) gen rule | Gen Quality | Existing rule not applied — reinforce 180000ms |
| LOW-2: gameState.gameId not set | (a) gen rule | Gen Quality | Enforce GEN-GAMEID |
| LOW-3: progress bar lags by 1 round | (a) gen rule | Gen Quality | Update progressBar on correct submission, not deferred |
| CDN-1: FeedbackManager subtitle not rendered | (c) CDN constraint | Document | No action |

**Verdict: RE-QUEUE REQUIRED.** P0-1 prevents the results screen from appearing after a perfect game. The fix is a single-line change: reset `gameState.isActive = true` before the `setTimeout(() => nextRound())` call in `handleSubmit()`'s correct-answer path (after `isProcessing = true` is set, before the setTimeout fires). Once fixed and verified locally, re-queue.
