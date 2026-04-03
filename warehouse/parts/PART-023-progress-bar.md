# PART-023: ProgressBar Component (v2)

**Category:** MANDATORY | **Condition:** Game has multiple rounds with visible progress | **Dependencies:** PART-002, PART-025

---

> ⚠️ **v2 Update:** ProgressBar now requires ScreenLayout v2 `sections` API (not the deprecated `slots` API). Use a `createProgressBar()` helper for init and restart.

## Code

```javascript
// Helper — creates/recreates ProgressBarComponent (call at init and restart)
function createProgressBar() {
  if (progressBar) progressBar.destroy();
  progressBar = new ProgressBarComponent({
    slotId: 'mathai-progress-slot',
    totalRounds: gameState.totalRounds,
    totalLives: gameState.totalLives
  });
}

// At init — start at 0 rounds completed
createProgressBar();
progressBar.update(0, gameState.lives);

// After each round completes
gameState.currentRound++;
progressBar.update(gameState.currentRound, gameState.lives);

// On restart
createProgressBar();
progressBar.update(0, gameState.lives);
```

## Constructor Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `autoInject` | boolean | No | `true` | Auto-inject into progress slot |
| `totalRounds` | number | Yes | — | Total rounds in game |
| `totalLives` | number | Yes | — | Total hearts to display |
| `slotId` | string | No | `'mathai-progress-slot'` | Container element ID |
| `labelFormat` | string | No | `'Round {current}/{total}'` | Label template |
| `showLives` | boolean | No | `true` | Show hearts |
| `showTrack` | boolean | No | `true` | Show progress bar track |
| `showLabel` | boolean | No | `true` | Show round label |

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `update(roundsCompleted, lives)` | number, number | Update progress display |
| `destroy()` | — | Cleanup when game ends or restarts |

## CRITICAL: update() Parameter Is Rounds COMPLETED

```javascript
// WRONG — passing currentRound (1) on a totalRounds=1 game shows "1/1" = 100% complete
progressBar.update(1, lives);  // Shows full bar immediately!

// CORRECT — pass 0 at game start (0 rounds completed yet)
progressBar.update(0, lives);  // Shows "Round 0/1"

// After round 1 is done:
progressBar.update(1, lives);  // Now shows "Round 1/1"
```

## createProgressBar() Helper — Required Pattern

Always use a helper function because ProgressBar needs to be recreated:
- At init (totalRounds/totalLives from content)
- On `handlePostMessage` (new content may have different totalRounds)
- On `restartGame()` (reset progress)

```javascript
function createProgressBar() {
  if (progressBar) progressBar.destroy();
  progressBar = new ProgressBarComponent({
    slotId: 'mathai-progress-slot',
    totalRounds: gameState.totalRounds,
    totalLives: gameState.totalLives
  });
}
```

## Display Specs

- **Label format:** "Round X/Y" (X = roundsCompleted param)
- **Lives format:** filled hearts (❤️) for remaining, empty (🤍) for lost
- **Progress bar:** Blue (#2563eb) fill, smooth 0.5s transition
- **Bar height:** 12px, border-radius 1rem

## Requires ScreenLayout v2

ProgressBar requires ScreenLayout v2 with `progressBar: true`:

```javascript
ScreenLayout.inject('app', {
  sections: { questionText: true, progressBar: true, playArea: true, transitionScreen: true }
});
```

## Deprecated: v1 ScreenLayout Slots

```javascript
// ⛔ DEPRECATED — do not use
ScreenLayout.inject('app', {
  slots: { progressBar: true, transitionScreen: false }
});
```

## Verification

- [ ] `createProgressBar()` helper exists (called at init and restart)
- [ ] `ProgressBarComponent` instantiated with `totalRounds` and `totalLives`
- [ ] `progressBar.update(0, lives)` called at init (NOT 1)
- [ ] `update()` called after each round with correct completed count
- [ ] `destroy()` called before recreation in `createProgressBar()`
- [ ] ScreenLayout v2 has `sections.progressBar: true`
- [ ] ProgressBar recreated on `handlePostMessage` and `restartGame()`

## Source Code

Full ProgressBarComponent implementation: `warehouse/packages/components/progress-bar/index.js`
