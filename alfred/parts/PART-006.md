### PART-006: TimerComponent
**Purpose:** Countdown or count-up timer with pause/resume support.
**Condition:** Game has time pressure.
**API:** `new TimerComponent('timer-container', { timerType, format, startTime, endTime, autoStart, onEnd })`
**Key rules:**
- `timerType`: `'decrease'` (countdown) or `'increase'` (count-up)
- `format`: `'min'` (MM:SS) or `'sec'` (SS)
- Methods: `.start()`, `.pause({ fromVisibilityTracker })`, `.resume({ fromVisibilityTracker })`, `.getTimeTaken()`, `.reset()`
- Create BEFORE VisibilityTracker so tracker can reference `timer`
- `autoStart: false` — start manually after game begins

**Mount + layout (MANDATORY — same in every game, required because PreviewScreen does NOT mirror `timerInstance` into the header):**

- HTML: append `<div id="timer-container"></div>` as a direct child of `#mathai-preview-slot` (positioned ancestor). NOT inside `.mathai-preview-header` / `.mathai-preview-header-center`.
- CSS: set `#mathai-preview-slot { position: relative; }` and absolute-center the timer top-center:
  ```css
  #timer-container {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    pointer-events: none;
  }
  #timer-container > * { pointer-events: auto; }
  ```
- Override TimerComponent's hard-coded 320×41 / 24px / `#000FFF` `.timer-display` styles so it fits the header:
  ```css
  #timer-container .timer-wrapper { padding: 0 !important; margin: 0 !important; }
  #timer-container .timer-display {
    width: auto !important; height: auto !important; padding: 0 !important;
    font-size: 16px !important; font-weight: 700 !important;
    color: var(--mathai-primary) !important;
    font-family: var(--mathai-font-family) !important;
  }
  #previewTimerText { display: none !important; }
  ```

This matches the canonical React `TimerComponent`'s `showInActionBar: true` layout (`src/modules/home/view/activity/Components/Blocks/AllInOne/ComponentV2/components/timer/index.tsx`).

**Per-round reset vs. cumulative timer (MANDATORY):**

Decide once per spec whether the timer is **per-round** (resets every round) or **cumulative** (runs continuously across rounds/levels), then follow the matching rule:

- **Per-round reset:** Call `timer.reset()` (and `timer.start()` if needed) **before** `transitionScreen.show(...)` for the round-complete transition. The transition screen must already display the fresh `00:00` so the player never sees the previous round's final value flash through the transition. Resetting after the transition closes causes a visible jump.
- **Cumulative across rounds/levels:** Do **NOT** reset between rounds. The timer keeps ticking through the round-complete transition (or is paused via `timer.pause()` if you want the transition to freeze it, then resumed on the next round). It only resets on Play Again / Try Again, per the end-of-game rules below.

**Pause across every awaited-feedback window (MANDATORY):**

Whenever a handler opens an awaited-feedback window — submit handler, retry handler, API-failure recovery, terminal game-over — the timer MUST be paused at the same site where `gameState.isProcessing = true` is set, BEFORE any `await`. Resume in the corresponding re-enable site (`renderRound()` for advance paths; the retry / API-failure handler itself for exception paths).

Rationale: the clock represents *gameplay time*, not *audio playback time*. Letting it tick through 1.5 s SFX + multi-second TTS penalises the player for the system's feedback duration. The pipeline used to describe this as suggestive ("paused via `timer.pause()` if you want the transition to freeze it"); it is now mandatory — every awaited-feedback site pauses, every re-enable site resumes. See [state-and-guards.md § Lifecycle matrix](../skills/interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix) for the per-event sites.

```js
async function handleSubmit() {
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;
  if (boardEl) boardEl.classList.add('dnd-disabled');   // P6
  if (voiceInput) voiceInput.disable();                  // P17
  if (timer) timer.pause();                              // ← mandatory pause before any await

  // ... evaluate, await feedback ...
  // renderRound() / retry handler resumes
}
```

Picking the wrong mode is a spec bug, not a timing bug — confirm the intent in `spec.md` before wiring round-complete handlers.

**End-of-game cleanup (MANDATORY):**

The timer must stop ticking the moment the player can no longer interact with the game — i.e. the moment a Victory or Game Over screen appears, or any screen where the core gameplay is complete. The "core game" is over once one of these screens is shown; continuing to tick after `game_complete` is misleading because the player isn't playing any more. Post-game screens (Stars Collected, AnswerComponent carousel, end-of-game transition stack) inherit the same paused state — they are review states, not gameplay.

Apply at every terminal handler (typical names: `showVictory`, `showGameOver`, `endGame`):

```js
try { if (timer && timer.pause) timer.pause(); } catch (e) {}
```

Rules:

- Stop the timer **before** calling `transitionScreen.show(...)` for Victory / Game Over.
- It is NOT enough to put the stop call inside a function literally named `endGame()` if your terminal phase transitions (`showVictory()` / `showGameOver()`) don't route through it. Stop on **every** path that posts `game_complete` or sets `gameState.phase` to `'results'` / `'game_over'`.
- On **Play Again / Try Again / Replay**, the restart path (`restartGame()` or equivalent) MUST treat the timer like a fresh page load: re-mount or `reset()` + `start()` so the stopwatch begins at 0 again. The whole game restarts — that includes the timer.
- Pause is also the right method when the visibility tracker fires (background tab); this rule is specifically about end-of-gameplay, not the visibility case.

**Verification:**

- [ ] Timer value visibly stops on the Victory screen (screenshot, wait 3 s, screenshot — value unchanged).
- [ ] Timer value visibly stops on the Game Over screen (same check).
- [ ] After Play Again / Try Again, timer resets to `00:00` and resumes ticking on the first round.
- [ ] Every code path that posts `game_complete` (or sets `gameState.phase` to `'results'` / `'game_over'`) invokes `timer.pause()` first — confirmed by reading the source, not just by checking that a function named `endGame()` contains the call.
- [ ] Every awaited-feedback handler (submit, retry, API-failure, terminal game-over) invokes `timer.pause()` at the same source line as `gameState.isProcessing = true`. Resume sites: `renderRound()` for advance, retry / api-failure handler for in-handler re-enable. Confirmed by grep, not just by spot-check.

## `onEnd` lifecycle contract (MANDATORY)

`onEnd` is the timer's player-facing terminal handler. When per-round time expires or a global countdown runs out, the callback fires — and from the player's perspective, it is **a submit-equivalent**: it triggers a forced answer evaluation with awaited feedback (the "time's up" SFX + TTS), exactly like a normal submit. It MUST follow the same interaction lifecycle contract as a submit handler.

**Before any `await` inside `onEnd`:**

```js
function onTimerEnd() {
  if (gameState.isProcessing || gameState.gameEnded) return;

  // Same first three lines as a submit handler
  gameState.isProcessing = true;
  if (boardEl) boardEl.classList.add('dnd-disabled');     // P6 — load-bearing on @dnd-kit/dom
  if (voiceInput) voiceInput.disable();                    // P17
  // (no timer.pause() — the timer just fired; it's already stopped)

  // Hide / disable FloatingButton (existing rule, validator GEN-FLOATING-BUTTON-TIMEOUT-HIDE):
  floatingBtn.setMode(null);   // or set a timeExpired flag consumed by isSubmittable()

  // Awaited "time's up" feedback — same shape as submit-wrong-with-lives (CASE 7 in feedback/SKILL.md)
  await playTimeUpFeedback();   // SFX 1.5s floor + TTS awaited

  // Decide next state
  if (livesShape) {
    gameState.lives--;
    if (gameState.lives <= 0) {
      endGame('time_up');        // terminal; endGame() removes .dnd-disabled before teardown
      return;
    }
  }
  // Continue to next round — renderRound clears isProcessing + .dnd-disabled
  gameState.currentRound++;
  renderRound(gameState.currentRound);
}
```

**Global-countdown exception.** When the spec declares a global-countdown timer shape (`spec.timerShape: 'global'`, or equivalent — a single timer governs the whole session and expiry is terminal), `onEnd` MUST route to `endGame('time_up')` — there is no next round. `.dnd-disabled` stays on the board through end-game UI to prevent post-expiry input; `endGame()` teardown destroys the listeners.

**Why the validator doesn't catch this today.** `GEN-FLOATING-BUTTON-TIMEOUT-HIDE` verifies that `onEnd` hides the FloatingButton — it does NOT verify that drag, voice, or other input modalities are also locked. A multi-round timed P6 game can therefore drag-mutate the placement during "time's up" feedback. A future validator rule (`GEN-TIMER-ONEND-DND-LOCK` or similar) would catch this; for now the rule lives in skill docs only.

See [state-and-guards.md § Lifecycle matrix](../skills/interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix) rows `per-round-timer-expiry` and `global-timer-expiry` for the per-shape × per-event timing.
