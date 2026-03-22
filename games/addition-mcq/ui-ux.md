# addition-mcq UI/UX Audit
**Build:** spec-only (no approved build exists)
**Date:** 2026-03-23
**Viewport:** 480×800px (mobile-first)
**Method:** Spec-only static analysis

---

## Summary

Spec-only audit. No approved build exists for addition-mcq. The spec is well-structured for an MCQ lives+timer game. Core game logic (advanceGame, endGame, showGameOver, restartGame) is explicitly defined — better than prior MCQ specs audited. Key gaps: (1) ProgressBarComponent missing `slotId` key — 6th confirmed instance of this pattern; (2) no data-phase state machine / syncDOMState() — 3rd confirmed MCQ spec instance; (3) no ARIA live region on feedback (option buttons provide no spoken feedback after answer selection); (4) data-lives not synced to a DOM attribute — test harness cannot read it; (5) window.endGame not assigned as global; (6) gameState.gameId field absent. No P0 blockers: no FeedbackManager.init(), no alert(), restartGame() is defined, endGame() is called on both win and game-over paths, results screen is PART-019 (separate component). **Pre-build spec additions recommended before first queue.**

---

## Findings

### F1: ProgressBarComponent missing `slotId` key in options — P1
**Classification:** (a) gen prompt rule

Spec Section 13:
```javascript
const progressBar = new ProgressBarComponent({
  autoInject: true,
  totalRounds: gameState.totalRounds,
  totalLives: 3
});
```

No `slotId` key. The ProgressBarComponent requires `slotId: 'mathai-progress-slot'` to inject into the correct DOM slot created by ScreenLayout. Without it, the component either fails silently or injects into the wrong location.

**This is the 6th confirmed instance** (after find-triangle-side #549, quadratic-formula #546, right-triangle-area #543, real-world-problem #564, addition-mcq-lives spec). Rule GEN-UX-003/004/005 covers this — verify it is enforced in CDN_CONSTRAINTS_BLOCK and check if addition-mcq-lives spec was addressed.

**Action:** Add to spec: `slotId: 'mathai-progress-slot'` in the ProgressBarComponent options block.

---

### F2: No data-phase state machine or syncDOMState() — P1
**Classification:** (a) gen prompt rule

The spec defines `showScreen()` for transitions (game-screen shown/hidden) but never specifies a `data-phase` attribute on `#app` or any root element, and never references `syncDOMState()`. All phase transitions happen via direct `style.display` toggling in `showScreen()`.

Without `data-phase`, Playwright test assertions using `[data-phase="game"]` or `[data-phase="results"]` will fail. The T1 W4 check (syncDOMState within 200 chars of gameState.phase assignment) will fire warnings if the LLM implements a phase field without syncDOMState.

**This is the 3rd confirmed MCQ spec instance** (after addition-mcq-blitz spec and addition-mcq-lives spec). Already tracked in ROADMAP line 237 (T1 W4 deployed 2026-03-20).

**Action (spec addition):** Add to Section 7a/7b/7f: after each phase transition, call `syncDOMState()` and define `data-phase` lifecycle: `'start' → 'game' → 'results'` (or `'game-over'`).

---

### F3: No ARIA live region on MCQ feedback — P1
**Classification:** (a) gen prompt rule

The spec shows option buttons get `.correct`/`.incorrect` CSS classes after answer selection (Section 7c), but specifies no `aria-live` region for spoken feedback. Screen reader users get no announcement when they tap an answer and the result is revealed.

ARIA-001 rule was shipped (dc03155) and should catch this on first build — but the spec should pre-empt this by specifying an `aria-live="polite"` feedback div.

**This is the 10th confirmed instance** (9 HTML builds + addition-mcq-lives spec, now also addition-mcq spec).

**Action (spec addition):** Add to Section 5 HTML Structure: `<div id="feedback-message" aria-live="polite" style="position:absolute;left:-9999px;"></div>`. Add to Section 7c: after option select, set `document.getElementById('feedback-message').textContent = isCorrect ? 'Correct!' : 'Wrong. The correct answer is ' + q.correctAnswer`.

---

### F4: window.endGame not assigned as global — P1
**Classification:** (a) gen prompt rule

Section 9 defines `endGame()` as a local function. The CDN contract requires `window.endGame` to be assigned so the harness can call it externally (e.g., to force-complete a game in tests). Spec does not include `window.endGame = endGame;`.

**Action (spec addition):** Add to Section 9 or Section 4 (Init Block): `window.endGame = endGame;`.

---

### F5: data-lives not synced to a DOM attribute — P1
**Classification:** (d) test gap

The lives system is tracked in `gameState.lives` but the spec never specifies a DOM element with `data-lives` attribute. The test harness `getLives()` helper reads a DOM attribute; without it, live-count assertions will be reading a hardcoded value or failing.

This pattern was identified in addition-mcq-lives spec (UI-ACQ-007) — same gap exists here.

**Action (spec addition):** Specify a lives display element in Section 5, e.g., a hearts container `<div id="lives-display" data-lives="3"></div>` that syncDOMState() updates on each life loss. Alternatively, rely on ProgressBarComponent's lives display and note that `data-lives` is maintained there.

---

### F6: gameState.gameId field missing — P2
**Classification:** (a) gen prompt rule

The standard gameState shape requires `gameId: 'addition-mcq'` field for SignalCollector and postMessage identification. Section 3 (Game State) does not include it. Without this, `signalCollector.send()` events will lack game identification context.

**Action (spec addition):** Add `gameId: 'addition-mcq'` to the gameState object in Section 3.

---

### F7: SignalCollector constructor args not specified — P1
**Classification:** (a) gen prompt rule

Section 2 lists PART-010 (Event Tracking & SignalCollector) but Section 9 shows:
```javascript
signalCollector.send('game_end', metrics);
```
…without any spec section defining how `signalCollector` is instantiated. The gen prompt pattern from previous audits shows SignalCollector instantiated without constructor args — rule GEN-UX-005 addresses this. The spec should explicitly include the constructor call.

**This is the 3rd confirmed instance** (find-triangle-side #549, real-world-problem #564, addition-mcq spec).

**Action (spec addition):** Add to Section 4 Init Block: `const signalCollector = new SignalCollector({ gameId: 'addition-mcq', sessionId: window.__sessionId });`.

---

### F8: timer.reset() called before timer.start() — P2 (potential race)
**Classification:** (b) spec addition

In Section 7b (loadQuestion), the spec calls:
```javascript
timer.reset();
timer.start();
```

On the very first question, `timer` was just constructed with `autoStart: false` — calling `reset()` before `start()` should be safe. However, on subsequent questions (restartGame → startGame → loadQuestion(0)), the spec calls `startGame()` which does NOT call `timer.reset()` before `loadQuestion(0)` is called. Since `timer.destroy()` is only called in `endGame()` (not in the game-over path), and `restartGame()` calls `startGame()` which calls `loadQuestion(0)`, there is a potential stale timer state on restart.

Section 7g shows `restartGame()` calls `startGame()` directly — but `startGame()` does NOT reinitialize the timer (it was destroyed in `endGame()` only). For the game-over path: `showGameOver()` → user clicks "Try Again" → `restartGame()` → `startGame()`. The timer was NOT destroyed in `showGameOver()`. On `loadQuestion()`, `timer.reset()` + `timer.start()` are called on the existing timer — this should work, but it's worth noting that `timer.destroy()` in `endGame()` means a new timer must be created on restart. The spec doesn't show re-instantiation.

**Action (spec addition):** Clarify timer lifecycle: either (1) add `timer = new TimerComponent(...)` in `startGame()` to re-create on restart; or (2) note that the game-over path does NOT call `timer.destroy()` (only `endGame()` does), so the timer survives for reuse.

---

### F9: No initSentry() call specified — P2
**Classification:** (a) gen prompt rule

Section 2 lists PART-030 (Sentry Error Tracking) but the spec has no section showing `initSentry()` being called after `waitForPackages()`. Previous audits confirmed initSentry() must be called immediately after waitForPackages resolves, before any other init code.

**Action:** Minor — the gen prompt CDN INIT ORDER rule should enforce this, but the spec should include an explicit note.

---

## Routing

| Finding | Severity | Routes to | Action |
|---------|----------|-----------|--------|
| F1: ProgressBar missing slotId | P1 | (a) Gen Quality | 6th instance — confirm GEN-UX-003 covers `slotId` key in options; add ROADMAP note |
| F2: No data-phase / syncDOMState | P1 | (a) Gen Quality + (b) Spec | 3rd MCQ spec instance — add to spec before first build |
| F3: No ARIA live region | P1 | (a) Gen Quality | 10th instance — ARIA-001 shipped; add feedback-message div to spec |
| F4: window.endGame unassigned | P1 | (a) Gen Quality | Add to spec Section 9; confirm gen prompt covers `window.endGame = endGame` |
| F5: data-lives not on DOM | P1 | (d) Test Engineering | 2nd MCQ spec instance (after addition-mcq-lives); Test Engineering backlog |
| F6: gameState.gameId missing | P2 | (a) Gen Quality | Add to spec Section 3; confirm gen prompt covers gameId field |
| F7: SignalCollector no constructor args | P1 | (a) Gen Quality | 3rd instance — GEN-UX-005 shipped; add instantiation to spec Section 4 |
| F8: Timer destroy/recreate ambiguity | P2 | (b) Spec | Add timer lifecycle clarification to spec Section 7g |
| F9: initSentry() absent from spec | P2 | (a) Gen Quality | Gen prompt INIT ORDER rule covers it; minor spec note |

---

## Pre-Build Checklist

Before queuing addition-mcq for first build, apply these spec additions:

- [ ] Add `slotId: 'mathai-progress-slot'` to ProgressBarComponent options (F1)
- [ ] Add `data-phase` lifecycle + `syncDOMState()` calls at each phase transition (F2)
- [ ] Add `aria-live="polite"` feedback div to HTML structure and populate on answer (F3)
- [ ] Add `window.endGame = endGame;` to init block (F4)
- [ ] Add `data-lives` DOM attribute synced via syncDOMState (F5)
- [ ] Add `gameId: 'addition-mcq'` to gameState (F6)
- [ ] Add SignalCollector constructor call with gameId + sessionId (F7)
- [ ] Clarify timer re-creation on restartGame() (F8)
