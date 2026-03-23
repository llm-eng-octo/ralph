# UI/UX Audit — addition-mcq

**Audit date:** 2026-03-23
**Auditor:** UI/UX Slot (mandatory active slot — CLAUDE.md Rule 16)
**Audit type:** Spec-only — no approved build exists (0 builds in DB)
**Spec:** games/addition-mcq/spec.md (161 lines, v1)

---

## Summary

Spec-only audit. No HTML available for browser playthrough — static spec analysis only.

Game profile: MCQ addition, 3 lives, 30s countdown timer per question, 4-option buttons (`.option-btn`). Uses PART-019 results screen (custom div, not TransitionScreen) for victory, TransitionScreen for game-over. Also uses TimerComponent (PART-006), ProgressBarComponent (PART-023), SignalCollector (PART-010), VisibilityTracker (PART-005), Sentry (PART-030). Core logic functions (advanceGame, endGame, showGameOver, restartGame) are all named in spec — better coverage than prior MCQ specs.

**No P0 blockers.** FeedbackManager.init() absent (PASS). No alert()/confirm()/prompt() (PASS).

**10 actionable findings (7a, 2b, 1d).** Key gaps: gameState.gameId absent, window.endGame unassigned, data-phase/syncDOMState absent, ARIA live region absent, ProgressBar slotId unspecified, SignalCollector no constructor args, game_complete postMessage type wrong (spec says `game_end`, contract requires `game_complete`), results screen position:fixed unspecified (PART-019 custom div), timer destroy/recreate on restartGame() ambiguous, .option-btn min-height absent.

---

## Mandatory Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | CSS stylesheet intact | N/A | Spec-only — no HTML build |
| 2 | FeedbackManager.init() ABSENT | PASS | Not mentioned anywhere in spec |
| 3 | alert()/confirm()/prompt() absent | PASS | Not mentioned in spec |
| 4 | window.endGame assigned at DOMContentLoaded end | FAIL | Section 9 defines endGame() as local function; no `window.endGame = endGame` assignment anywhere |
| 5 | data-phase transitions + syncDOMState() at EVERY phase change | FAIL | Screen Flow (Section 6) defines start/game/results/game-over states — no data-phase, no syncDOMState(), no gameState.phase field |
| 6 | Enter key handler (text input games only) | N/A | MCQ tap game — no text input |
| 7 | ProgressBar: options object with slotId: 'mathai-progress-slot' | FAIL | Section 13 shows ProgressBarComponent with autoInject + totalRounds + totalLives — missing `slotId: 'mathai-progress-slot'` key |
| 8 | aria-live="polite" role="status" on ALL dynamic feedback elements | FAIL | Section 5 HTML shows .option-btn elements; no feedback div with aria-live/role="status" specified |
| 9 | SignalCollector constructor args: sessionId, studentId, templateId | FAIL | PART-010 listed; Section 9 calls signalCollector.send() but no instantiation with required args shown |
| 10 | gameState.gameId field as FIRST field | FAIL | Section 3 gameState declaration has isGameActive as first field — gameId absent entirely |
| 11 | Results screen position:fixed with z-index≥100 | FAIL | Victory path uses PART-019 custom `#results-screen` div (Section 5 HTML: `style="display:none;"`). No position:fixed or z-index specified — 7th confirmed GEN-UX-001 instance |
| 12 | ALL interactive buttons min-height:44px (incl. .option-btn) | FAIL | Section 5 HTML shows 4× `.option-btn` buttons; Section 10 CSS guidance has no min-height:44px for .option-btn |
| 13 | Sentry SDK v10.23.0 three-script pattern | FAIL (low) | PART-030 listed; no version pinning, no initSentry() call, no three-script pattern shown in spec |
| 14 | game_complete postMessage on BOTH victory AND game-over paths | FAIL | Section 11 specifies outgoing type as `game_end` — contract requires `game_complete`. Neither path shows `window.parent.postMessage({type:'game_complete',...})` |
| 15 | restartGame() resets ALL gameState fields; timer games destroy+recreate TimerComponent | FAIL | Section 7g: restartGame() calls `transitionScreen.hide()` then `startGame()`. startGame() does NOT re-create TimerComponent (timer was destroyed in endGame()). Game-over path: showGameOver() → restartGame() → startGame() — timer not recreated |
| 16 | waitForPackages() only awaits packages the game actually instantiates | PASS | Game uses TimerComponent (PART-006) + VisibilityTracker (PART-005) — both legitimately awaited |

---

## Findings

### F1 — window.endGame not assigned to window [type-a] [HIGH]

**Pattern:** window.endGame not assigned in DOMContentLoaded
**Instance count:** 7th confirmed (math-mcq-quiz, math-cross-grid, word-pairs, associations, adjustment-strategy, mcq-addition-blitz, addition-mcq)
**Description:** Section 9 defines `endGame()` as a local function. The CDN harness calls `window.endGame()` to force end-of-game in contract tests. Without `window.endGame = endGame`, the harness call silently fails — contract tests time out.
**Action:** GEN-WINDOW-EXPOSE (rule 36) already shipped — T1 W3 check already active. No new rule needed. Add `window.endGame = endGame;` to spec Section 9 or DOMContentLoaded summary before first build.

---

### F2 — No data-phase / syncDOMState() state machine [type-a] [HIGH]

**Pattern:** data-phase + syncDOMState() absent from MCQ spec
**Instance count:** 6th confirmed MCQ spec instance
**Description:** Section 6 (Screen Flow) defines four distinct states — start screen, question screen, results screen, game-over screen — but specifies no `gameState.phase` field, no `data-phase` attribute on `#app`, and no `syncDOMState()` calls at any transition. Without explicit phase transitions, the LLM omits syncDOMState() calls, causing game-flow test timeouts.
**Required phase mapping:**
- `showStartScreen()` / game_init handler → `gameState.phase = 'start_screen'` → `syncDOMState()`
- `startGame()` → `gameState.phase = 'playing'` → `syncDOMState()`
- `endGame()` victory path → `gameState.phase = 'results'` → `syncDOMState()`
- `showGameOver()` → `gameState.phase = 'game_over'` → `syncDOMState()`
**Action:** Already tracked in ROADMAP. Add phase mapping to spec Section 6 before first build.

---

### F3 — No ARIA live region on option feedback [type-a] [HIGH]

**Pattern:** Dynamic feedback elements missing aria-live="polite" role="status"
**Instance count:** 16th confirmed
**Description:** Section 5 shows the play area HTML with `.option-btn` elements. No feedback div with `aria-live="polite"` and `role="status"` is specified. After option selection (correct/incorrect/timeout), visual CSS class feedback is applied but screen reader users receive no announcement.
**Action:** ARIA-001 gen rule already shipped. No new rule needed. Add explicit feedback div to Section 5 HTML: `<div id="answer-feedback" aria-live="polite" role="status"></div>`. Add population to Section 7c.

---

### F4 — gameState.gameId absent from initial declaration [type-a] [HIGH]

**Pattern:** gameState missing gameId field as FIRST field
**Instance count:** 7th confirmed
**Description:** Section 3 gameState declaration starts with `isGameActive: false` — `gameId` field is completely absent. GEN-GAMEID rule (shipped) requires `gameId: 'addition-mcq'` as the FIRST field. Without it, `window.gameState.gameId` is undefined — postMessage payload and signal events lack game identification.
**Action:** GEN-GAMEID rule already shipped. Add `gameId: 'addition-mcq'` as FIRST field in Section 3 gameState before first build.

---

### F5 — ProgressBar slotId not specified [type-a] [HIGH]

**Pattern:** ProgressBarComponent instantiation missing slotId options key
**Instance count:** 10th confirmed
**Description:** Section 13 shows ProgressBarComponent instantiated as:
```javascript
const progressBar = new ProgressBarComponent({
  autoInject: true,
  totalRounds: gameState.totalRounds,
  totalLives: 3
});
```
No `slotId: 'mathai-progress-slot'` key. Without it, the component either fails silently or injects into the wrong location. GEN-UX-003 rule (shipped) requires the slotId key.
**Action:** GEN-UX-003 already shipped. Add `slotId: 'mathai-progress-slot'` to the options object in Section 13 before first build.

---

### F6 — SignalCollector instantiated without constructor args [type-a] [MEDIUM]

**Pattern:** SignalCollector no constructor args
**Instance count:** 6th confirmed
**Description:** Section 2 lists PART-010 (Event Tracking & SignalCollector). Section 9 calls `signalCollector.send('game_end', metrics)` but no instantiation snippet is shown anywhere in the spec. GEN-UX-005 rule (shipped) requires `new SignalCollector({ sessionId, studentId, templateId })`. Without the spec showing correct usage, the LLM may generate `new SignalCollector()` with no args.
**Action:** GEN-UX-005 already shipped. Add correct instantiation to spec (Section 4 Init Block or new section) before first build.

---

### F7 — results-screen div lacks position:fixed z-index≥100 [type-a] [HIGH]

**Pattern:** Custom results div not specified as overlay
**Instance count:** 7th confirmed GEN-UX-001 instance
**Description:** Section 5 HTML shows `<div id="results-screen" class="screen" style="display:none;"></div>`. The victory path calls `showResultsScreen(metrics)` (PART-019 custom div) rather than TransitionScreen CDN component. No CSS specification for `position:fixed`, `z-index≥100`, or `top:0; left:0; width:100%; height:100%` is given. Without this, the results screen may render behind other elements or fail to fill the viewport.
**Action:** GEN-UX-001 already shipped. Spec Section 10 (CSS) must add: `#results-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; }` before first build.

---

### F8 — game_complete postMessage type incorrect [type-b] [HIGH]

**Pattern:** Outgoing postMessage type is `game_end` instead of `game_complete`
**Instance count:** New finding — specific type-name mismatch
**Description:** Section 11 specifies the outgoing postMessage as `{ "type": "game_end", ... }`. The CDN contract requires `{ "type": "game_complete", ... }`. Additionally, neither the victory path (endGame → showResultsScreen) nor the game-over path (showGameOver) shows an explicit `window.parent.postMessage({ type: 'game_complete', ... })` call. Risk: harness contract tests will timeout waiting for `game_complete` while the game fires `game_end` instead.
**Action:** Spec addition needed. Correct Section 11: rename `game_end` → `game_complete`. Add explicit postMessage call to Section 9 endGame() and Section 7f showGameOver() before first build.

---

### F9 — restartGame() timer not re-created after endGame() destroys it [type-b] [HIGH]

**Pattern:** Timer game restartGame() must destroy+recreate TimerComponent
**Instance count:** 4th confirmed timer game
**Description:** Section 9 endGame() calls `timer.destroy()`. Section 7g restartGame() calls `transitionScreen.hide(); startGame()`. Section 7a startGame() calls `loadQuestion(0)`. Section 7b loadQuestion() calls `timer.reset(); timer.start()`. But after `timer.destroy()`, the timer instance is destroyed — calling `timer.reset()` on a destroyed instance will throw or fail silently. The game-over path (showGameOver → restartGame) is the most common replay scenario. No re-instantiation of TimerComponent is shown anywhere in restartGame() or startGame().
**Action:** Spec addition needed. Add to Section 7g restartGame(): destroy existing timer if not already destroyed, then re-create: `timer = new TimerComponent('timer-container', { timerType: 'decrease', format: 'sec', startTime: 30, endTime: 0, autoStart: false, onEnd: handleTimeout });` before calling startGame(). Also reset all gameState fields in restartGame() rather than relying on startGame() alone.

---

### F10 — .option-btn buttons missing explicit min-height:44px [type-a] [MEDIUM]

**Pattern:** Interactive buttons missing 44px touch targets
**Instance count:** 11th confirmed
**Description:** Section 5 HTML shows four `.option-btn` elements (data-index 0–3). Section 10 CSS guidance describes visual styling (border, hover, correct/incorrect colors) but specifies no `min-height: 44px`. On mobile, undersized option buttons cause mis-taps on a 480×800 viewport. GEN-UX-002 / GEN-TOUCH-TARGET rule (shipped) must cover `.option-btn` — confirm selector in prompts.js includes this class.
**Action:** GEN-UX-002 already shipped. Verify `.option-btn` is covered by the rule's CSS selector. Add explicit `min-height: 44px;` to `.option-btn` in Section 10 CSS before first build.

---

## Routing Table

| Finding | Classification | Destination | Action |
|---------|---------------|-------------|--------|
| F1 — window.endGame unassigned | (a) gen prompt rule | Gen Quality | Already shipped (GEN-WINDOW-EXPOSE). Add to spec before build. |
| F2 — data-phase/syncDOMState absent | (a) gen prompt rule | Gen Quality | Already tracked (ROADMAP). Add to spec before build. |
| F3 — ARIA live region absent | (a) gen prompt rule | Gen Quality | Already shipped (ARIA-001). Add feedback div to spec before build. |
| F4 — gameState.gameId absent | (a) gen prompt rule | Gen Quality | Already shipped (GEN-GAMEID). Add to spec Section 3 before build. |
| F5 — ProgressBar slotId missing | (a) gen prompt rule | Gen Quality | Already shipped (GEN-UX-003). Add to spec Section 13 before build. |
| F6 — SignalCollector no args | (a) gen prompt rule | Gen Quality | Already shipped (GEN-UX-005). Add instantiation to spec before build. |
| F7 — results-screen not position:fixed | (a) gen prompt rule | Gen Quality | Already shipped (GEN-UX-001). Add CSS rule to spec Section 10 before build. |
| F8 — game_complete type wrong (game_end) | (b) spec addition | Education | New type-name mismatch finding. Correct Section 11 + add explicit postMessage calls on both paths before first build. |
| F9 — restartGame() timer not recreated | (b) spec addition | Education | 4th timer game instance. Add timer re-instantiation to spec Section 7g before first build. |
| F10 — .option-btn min-height absent | (a) gen prompt rule | Gen Quality + Test Engineering | Already shipped (GEN-UX-002). Verify .option-btn is in selector; add test assertion for computed min-height on .option-btn. |

---

## Positive Observations

- FeedbackManager.init() correctly absent — no audio popup risk.
- No alert()/confirm()/prompt() in any interaction path.
- Core logic functions all explicitly named and defined: advanceGame(), endGame(), showGameOver(), restartGame(), loadQuestion(), handleOptionSelect(), handleTimeout() — more complete than prior MCQ specs.
- isAnswered flag correctly specified as lock-after-selection-or-timeout — prevents double-scoring on timer expiry.
- timer.pause() called in handleOptionSelect() to stop the countdown on answer — correct.
- Both answer and timeout paths call recordAttempt() — attempt tracking is complete.
- PART-026 Anti-Patterns listed — LLM will check against banned patterns.
- timer.destroy() + progressBar.destroy() both called in endGame() — correct cleanup.
- waitForPackages() is justified: TimerComponent (PART-006) + VisibilityTracker (PART-005) both actually instantiated.
- InputSchema (Section 4) is well-formed with 5 sample questions, all 4 options, correct answers.
- VisibilityTracker (PART-005) listed — timer pause/resume on tab-away is specified.

---

## Pre-Build Checklist (before queuing first build)

Before queuing addition-mcq for the first time, apply these spec additions:

- [ ] Section 3: Add `gameId: 'addition-mcq'` as FIRST field in gameState (F4)
- [ ] Section 5: Add `<div id="answer-feedback" aria-live="polite" role="status"></div>` to play area HTML (F3)
- [ ] Section 6: Add data-phase state machine (start_screen → playing → results / game_over) with syncDOMState() at each transition (F2)
- [ ] Section 7f: Add `window.parent.postMessage({ type: 'game_complete', gameId: 'addition-mcq', score: gameState.score, stars: 0, totalRounds: gameState.totalRounds }, '*')` to showGameOver() (F8)
- [ ] Section 7g: Add timer destroy+recreate and full gameState reset to restartGame() before calling startGame() (F9)
- [ ] Section 9: Add `window.endGame = endGame;` after endGame() definition (F1)
- [ ] Section 9: Correct outgoing postMessage type from `game_end` to `game_complete`; add explicit postMessage call on victory path (F8)
- [ ] Section 10: Add `#results-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; }` (F7)
- [ ] Section 10: Add `min-height: 44px;` to `.option-btn` CSS (F10)
- [ ] Section 13: Add `slotId: 'mathai-progress-slot'` to ProgressBarComponent options object (F5)
- [ ] New section (Init Block): Add SignalCollector instantiation with required args (F6)
