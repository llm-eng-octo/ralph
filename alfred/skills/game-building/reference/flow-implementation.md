# Flow Implementation

## Purpose

This file tells you how to implement the flow from `pre-generation/game-flow.md` inline in the HTML using the three CDN components. Read this alongside `pre-generation/game-flow.md` and `alfred/skills/game-planning/reference/default-flow.md`.

## Screen → component mapping

| Screen | Component | Key call |
|---|---|---|
| Preview | PreviewScreenComponent | `previewScreen.show({ instruction, audio, onComplete })` |
| Welcome | TransitionScreenComponent | `ts.show({ title, buttons:[{text:"I'm ready"}], onMounted: () => FeedbackManager.sound.play(vo, {sticker}) })` |
| Round N intro | TransitionScreenComponent | `ts.show({ title:"Round N", onMounted: () => sound.play(round_n) })` — await sound, then `ts.hide()` |
| Ready to improve your score? | TransitionScreenComponent | tap-dismiss, onMounted fires motivation VO |
| Yay stars collected! | TransitionScreenComponent | auto-dismiss, onMounted fires stars sound + animation, await → hide |
| Victory / Game Over | TransitionScreenComponent | with `stars` + `buttons` |
| Gameplay | bare DOM | inject into `.game-stack` |

## Component invariants

- TransitionScreen has no `duration` / `persist` flags — always call `hide()` explicitly.
- TransitionScreen does not own sound or sticker — always fire `FeedbackManager.sound.play(id, {sticker})` from the `onMounted` callback.
- For auto-dismiss (round intro, yay stars), `await FeedbackManager.sound.play(...)` then `ts.hide()`.
- For tap-dismiss (welcome, ready-to-improve, victory, game over), the button click drives `ts.hide()`.

## Progress bar lifecycle

**Visibility rule:** The progress bar is visible on every screen of the flow **except Preview** (Preview owns its own layout). For the standalone shape (`totalRounds: 1`) the bar is hidden for the entire session via `progressBar.hide()`.

**State (runtime-driven updates):** The counter is "rounds completed", incremented on correct feedback. Round intros do not increment — they reflect the state already set by the previous round's correct feedback.

| Moment | Runtime call |
|---|---|
| Runtime start, `totalRounds >= 2` | `progressBar.show()` + `update(0, totalLives)` |
| Runtime start, `totalRounds === 1` | `progressBar.hide()` (standalone) |
| After Preview → Welcome mount | `update(0, totalLives)` (already satisfied by start call) |
| Entering Round-i intro / body | `update(roundsCompleted, livesLeft)` (typically equals i-1 but driven by runtime state, not computed from i — idempotent no-op after a correct feedback update) |
| Feedback wrong, lives remaining > 0 | `update(roundsCompleted, livesLeft)` — hearts decrement only; `roundsCompleted` unchanged |
| Feedback correct | `update(roundsCompleted+1, livesLeft)` — bar animates up during feedback window, BEFORE next round intro. `roundsCompleted` is bumped in state first, so the call reads the new value |
| Victory entry | `update(totalRounds, livesLeft)` |
| Game Over entry | **no call** — state preserved (bar shows prior value + 0 hearts) |
| `onRestart` branch entry (before first new Round-1 intro) | `update(0, totalLives)` — reset |

### Shape-specific progress-bar behavior

| Shape | Template | Scope |
|---|---|---|
| **Standalone** (`totalRounds: 1`) | — (component hidden via `hide()`) | Not rendered. Lives UI placement deferred. |
| **Multi-round** (`N ≥ 2`, no sections) | `"Round {current}/{total}"` | Track fills from 0 → N across the whole game. |
| **Sectioned** | `"{sectionLabel} · {inSection}/{sectionTotal}"` | Track resets at each section boundary (scoped fill). Optional sticky badge for overall `{current}/{total}`. |

## Round loop pattern

```js
async function startGame() {
  await previewScreen.show({ instruction, audio });
  await showWelcome();  // transition, tap "I'm ready"
  progressBar.show(); progressBar.update(0, totalLives);
  for (let i = 1; i <= totalRounds; i++) {
    state.round = i;
    await showRoundIntro(i);                // transition, auto-advance on sound end
    progressBar.update(state.roundsCompleted, state.livesLeft);
    const verdict = await renderRoundAndWaitForSubmit(i);
    await runFeedbackWindow(verdict);       // 2000ms, sound + sticker
    if (verdict.correct) {
      state.roundsCompleted++;
      progressBar.update(state.roundsCompleted, state.livesLeft);
    } else {
      state.livesLeft--;
      if (state.livesLeft === 0) return showGameOver();
      progressBar.update(state.roundsCompleted, state.livesLeft);
      i--;  // retry same round
    }
  }
  await showVictory();
}
```

## Star computation

| starModel | Input | Formula |
|---|---|---|
| `lives` | `livesLeft`, `totalLives` | 3 if `livesLeft === totalLives`; 2 if `livesLeft ≥ ceil(totalLives/2)`; 1 if `livesLeft ≥ 1`; else 0 |
| `firstAttempt` | `firstAttemptCorrect / totalRounds` | 3 if ≥ 0.9; 2 if ≥ 0.6; 1 if ≥ 0.3; else 0 |
| `accuracy` | `correct / attempts` | 3 if ≥ 0.9; 2 if ≥ 0.6; 1 if > 0; else 0 |
| `speed` | `elapsedMs`, spec thresholds | 3 if under fast threshold; 2 if under medium; 1 if finished; else 0 |
| `custom` | per spec | Follow spec's explicit rule (e.g., section completion count) |
