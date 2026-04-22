# ProgressBar Options

Quick reference for ProgressBar component configuration.

---

## Constructor Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `autoInject` | Boolean | No | `true` | Auto-inject into `#mathai-progress-slot` |
| `totalRounds` | Number | Yes | - | Total rounds/levels in game |
| `totalLives` | Number | Yes | - | Total hearts/lives to display |
| `slotId` | String | No | `'mathai-progress-slot'` | Custom slot ID |

---

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `update(roundsCompleted, lives)` | `Number, Number` | Update progress display. **First arg is ROUNDS COMPLETED (0-indexed), NOT the current round number.** |
| `destroy()` | None | Cleanup when game ends |

---

## CRITICAL: First Arg Is "Rounds Completed", Not "Current Round"

The first parameter of `update()` is how many rounds the player has **finished**. At game start, zero rounds are finished, so it MUST be `0` — otherwise the bar renders as if Round 1 is already done on first paint.

```javascript
// ❌ WRONG — passing 1 on render makes the bar show "1/N" immediately (1 round done already)
progressBar.update(1, 3);   // on initial render

// ✅ CORRECT — pass 0 at game start
progressBar.update(0, 3);   // 0 rounds completed, 3 lives
// ...after the player finishes Round 1:
progressBar.update(1, 3);
// ...after the player finishes Round 2:
progressBar.update(2, 3);
```

**Rule of thumb:** the value you pass == `gameState.currentRound - 1` (if `currentRound` is 1-indexed) OR `gameState.currentRound` (if 0-indexed and incremented AFTER round ends). When in doubt, call `progressBar.update(0, totalLives)` at init and ONLY increment after a round is fully completed.

---

## MANDATORY Init Call

Immediately after `new ProgressBarComponent(...)`, you MUST call `update(0, totalLives)` so the first paint shows "0/N" with a full lives strip. The component's internal default can render 1/N in some browsers — the explicit 0 call is the only reliable way to start at zero.

```javascript
progressBar = new ProgressBarComponent({
  autoInject: true,
  totalRounds: gameState.totalRounds,
  totalLives: gameState.totalLives
});
progressBar.update(0, gameState.totalLives); // REQUIRED — forces 0/N on first render
```

The same `update(0, totalLives)` call is required on `restartGame()` and whenever a new round-set starts via `handlePostMessage`.

---

## Usage Examples

**Basic (5 rounds, 3 lives):**
```javascript
const progressBar = new ProgressBarComponent({
  autoInject: true,
  totalRounds: 5,
  totalLives: 3
});

// MANDATORY — initial paint shows "0/5" with 3 full hearts
progressBar.update(0, 3);

// Update during gameplay — first arg is ROUNDS COMPLETED
progressBar.update(1, 3);  // 1 round done, 3 lives remaining
progressBar.update(2, 2);  // 2 rounds done, 2 lives remaining

// Cleanup on game end
progressBar.destroy();
```

**Custom slot ID:**
```javascript
const progressBar = new ProgressBarComponent({
  autoInject: true,
  slotId: 'custom-progress-slot',
  totalRounds: 10,
  totalLives: 5
});
```

---

## Display Behavior

- **Text:** `"X/Y rounds completed"` (e.g., "3/5 rounds completed")
- **Lives:** ❤️❤️🤍 (filled = remaining, empty = lost)
- **Progress bar:** 0-100% width, blue (#2563eb), smooth animation (0.5s)
- **Initial paint MUST be 0%** — `update(0, totalLives)` is required right after construction

## Verification

- [ ] `progressBar.update(0, totalLives)` is called immediately after `new ProgressBarComponent(...)`
- [ ] First paint of the progress bar shows "0/N" and 0% filled — no phantom "Round 1 done" state
- [ ] Every `progressBar.update(X, lives)` passes X = rounds COMPLETED, not the current round number
- [ ] `update(0, totalLives)` is called again on `restartGame()` and on `handlePostMessage` when round-set resets

---
