# PART-023: ProgressBar Component

**Category:** MANDATORY | **Condition:** Game has multiple rounds with visible progress | **Dependencies:** PART-002, PART-025

---

> ⚠️ **v2 Update:** ProgressBar now requires ScreenLayout v2 `sections` API (not the deprecated `slots` API). Use a `createProgressBar()` helper for init and restart.

## Code

### Lives game (totalLives > 0)

```javascript
// Helper — creates/recreates ProgressBarComponent (call at init and restart)
function createProgressBar() {
  if (progressBar) progressBar.destroy();
  progressBar = new ProgressBarComponent({
    slotId: 'mathai-progress-slot',
    totalRounds: gameState.totalRounds,
    totalLives: gameState.totalLives,
    showLives: true                // hearts visible (default)
  });
}

createProgressBar();
progressBar.update(0, gameState.lives);

// Bump fires when the student moves PAST the current round — to the next round
// OR to Victory. NOT on Game Over (the game ended on this unfinished round —
// the student never passed it; bar should preserve the prior progress).
// NOT before a same-round retry (floatingBtn.setMode('retry')).
// Default policy: each round-passed bumps progress by 1 (rounds completed).
// score (correct count) is a separate counter that feeds getStars() at
// end-of-game and does NOT update the ActionBar header mid-round.
if (verdict.correct) gameState.score++; else gameState.lives--;
await runFeedbackWindow(verdict);          // ~2000ms — bar still on previous progress

// Did the student move PAST this round?
//   - Correct → advance to next round / Victory → bump
//   - Wrong, retries-exhausted, lives remaining → advance to next round → bump
//   - Wrong, last life (lives === 0) → Game Over → NO BUMP (round not passed)
//   - Wrong, retries available, lives remaining → same round → NO BUMP
const movedPast = verdict.correct
  || (!verdict.correct && gameState.lives > 0 && retriesExhausted(verdict));
if (movedPast) {
  gameState.progress++;
  progressBar.update(gameState.progress, Math.max(0, gameState.lives));
  // then: nextRound() / endGame('victory')
} else if (gameState.lives === 0) {
  // Last-life wrong — Game Over. State preserved on Game Over (prior progress + 0 hearts).
  progressBar.update(gameState.progress, 0);  // 0 hearts, progress NOT bumped
  // then: endGame('game_over')
} else {
  // Wrong with retry available — re-render same round, no progress bump.
  // floatingBtn.setMode('retry') etc.
}
```

### No-lives game (gameState.totalLives === 0 or archetype has no lives mechanic)

```javascript
// Helper — creates/recreates ProgressBarComponent for a no-lives game
function createProgressBar() {
  if (progressBar) progressBar.destroy();
  progressBar = new ProgressBarComponent({
    slotId: 'mathai-progress-slot',
    totalRounds: gameState.totalRounds,
    totalLives: 0,                 // MUST be 0, not a placeholder like totalRounds
    showLives: false               // MANDATORY for no-lives games — hides the hearts strip
  });
}

createProgressBar();
progressBar.update(0, 0);          // second arg is lives — pass 0 for no-lives games
```

### Forbidden — using `totalRounds` as a placeholder for `totalLives`

```javascript
// ❌ Forbidden — renders 3 hearts that never decrement
progressBar = new ProgressBarComponent({
  totalRounds: gameState.totalRounds,
  totalLives: gameState.totalRounds  // wrong shape; the hearts strip becomes meaningless
});

// ❌ Forbidden — passing a non-zero totalLives without showLives:false hides nothing
progressBar = new ProgressBarComponent({
  totalRounds: 3,
  totalLives: 3   // showLives defaults to true → hearts render even though no lives mechanic
});
```

**Rule of thumb.** `showLives` is *not* optional. Pick exactly one of:
- Lives game: `totalLives: <N>` AND `showLives: true` (or omit — default).
- No-lives game: `totalLives: 0` AND `showLives: false`.

Validator rule `PROGRESSBAR-NO-LIVES-MUST-HIDE` fails the build if a game's `gameState.totalLives === 0` (or the archetype has no lives mechanic) and the ProgressBar is instantiated with `showLives !== false`.

## Constructor Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `autoInject` | boolean | No | `true` | Auto-inject into progress slot |
| `totalRounds` | number | Yes | — | Total rounds in game |
| `totalLives` | number | Yes | — | Total hearts to display. Pass `0` for no-lives games. |
| `slotId` | string | No | `'mathai-progress-slot'` | Container element ID |
| `labelFormat` | string | No | `'Round {current}/{total}'` | Label template |
| `showLives` | boolean | **Conditional** | `true` | Show hearts. **MUST be `false` if `totalLives === 0` or the archetype has no lives mechanic.** Default `true` only applies when `totalLives > 0`. |
| `showTrack` | boolean | No | `true` | Show progress bar track |
| `showLabel` | boolean | No | `true` | Show round label |

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `update(progress, lives)` | number, number | Update progress display. `progress` is a progression counter that bumps **once per round, when the student moves PAST the current round** — i.e., advances to the next round OR to Victory. **Game Over does NOT bump** (the game ended on the unfinished round; the student never passed it). A wrong answer that triggers a retry (`floatingBtn.setMode('retry')`) does NOT bump (still on the same round). Default policy treats each round-passed as `+1` (rounds completed). |
| `destroy()` | — | Cleanup when game ends or restarts |

## CRITICAL: update() Parameter Is the Progression Counter — MUST Start at 0

**First arg is `gameState.progress`, NOT the 1-indexed `gameState.currentRound`.** They are different counters: `currentRound` is the loop position (0-indexed in state, 1-indexed in `recordAttempt.round_number`); `progress` is the bar's progression counter that defaults to "rounds attempted" and increments on EVERY round (correct OR wrong) AFTER feedback resolves.

**Symptom of the start-at-1 bug:** on first render the bar shows "1/N" (or the first segment already filled), making it feel like the player has already completed one round before they even started. This is always caused by passing `1` (or `currentRound` when `currentRound` is 1-indexed) to `update()` at init instead of `0`.

```javascript
// WRONG — passing currentRound (1) on a totalRounds=1 game shows "1/1" = 100% complete
progressBar.update(1, lives);  // Shows full bar immediately!

// WRONG — skipping the init update() call; component may paint 1/N by default on first render
progressBar = new ProgressBarComponent({ totalRounds: 5, totalLives: 3 });
// (no update() call here — BAD)

// WRONG — using currentRound directly; couples bar to loop index instead of policy
gameState.currentRound++;
progressBar.update(gameState.currentRound, lives);  // brittle: skips the bump-after-feedback rule

// CORRECT — initialize gameState.progress = 0; pass 0 at game start
gameState.progress = 0;
progressBar = new ProgressBarComponent({ totalRounds: 5, totalLives: 3 });
progressBar.update(0, lives);  // MANDATORY — forces "Round 0/5" on first paint

// After feedback resolves on round 1, BEFORE the next round's UI fires:
gameState.progress++;          // bump (every round under default policy)
progressBar.update(gameState.progress, lives);  // Now shows "Round 1/5"
```

**Rule:** the very next line after `new ProgressBarComponent(...)` MUST be `progressBar.update(0, gameState.totalLives)`. Same after `createProgressBar()` is re-called on restart / postMessage.

## Bump timing — AFTER feedback, BEFORE round-change UI, ONLY when the student moves PAST the round

The progress-bar bump is tied to the **round-change boundary in the forward direction** — i.e., the student moves past the current round, to the next round or to Victory. A round can have multiple submits (retry flows), but it bumps the bar at most once — when the student finally moves past it.

**Conceptual rule (the "why").** Progress reflects "rounds the student has passed." A round counts as passed only when the student advances out of it. The three "moved past" cases:
1. **Correct** — round ended successfully, advance to next round (or Victory if last round)
2. **Retries exhausted, lives remaining** (spec-defined retry flow with per-round retry cap): round ends without correct, but the student moves on to the next round → bump
3. **Last round correct** — moves past last round into Victory → bump (final bar paint = `N/N`)

The two "did NOT move past" cases:
- **Wrong with retries remaining** (`lives > 0`, retries available): student is still on the same round → no bump
- **Last-life wrong** (`lives === 0` after decrement): Game Over fires; the game ENDED on this unfinished round — the student never passed it → **no bump**. Game Over preserves the prior progress + 0 hearts so the bar reads honestly: "completed N-1, lost on N."

**Operational rule (the "where").** Place the `gameState.progress++` + `progressBar.update(...)` call **immediately before `nextRound()` / `loadRound()` (advancing to a new round) or `endGame('victory')`**. Do NOT place it before `endGame('game_over')` — the prior progress is what the bar should display on Game Over. Do NOT place it before `floatingBtn.setMode('retry')` or any same-round re-render.

**Sequence per round:**

1. Student submits → state mutations (`gameState.score++` if correct, `gameState.lives--` if wrong) — internal counters only, no ActionBar header refresh
2. `await` feedback SFX/sticker (~2000 ms) — bar still on previous progress
3. **Branch on outcome:**
   - **Moved past** (correct, OR retries-exhausted with lives remaining): `gameState.progress++` → `progressBar.update(progress, livesLeft)` → `nextRound()` / `endGame('victory')`
   - **Last-life wrong** (`lives === 0`): `progressBar.update(progress, 0)` (0 hearts, progress NOT bumped) → `endGame('game_over')`. Bar preserves prior progress.
   - **Wrong with retry available**: no progress bump, no `update()` change; trigger same-round retry path (`floatingBtn.setMode('retry')`, re-render input)

**The bump MUST precede the round-change UI** (when bumping at all) — that's what guarantees Victory paints `N/N`. **The bump MUST follow the feedback await** — bumping at submit feels premature. **The bump MUST NOT fire on Game Over or a non-resolving wrong answer** — Game Over preserves prior progress (round wasn't passed); retry stays on the same round.

**Game Over heart update.** When `lives === 0` resolves to Game Over, still call `progressBar.update(gameState.progress, 0)` — the progress arg is the prior value (not bumped), but the lives arg becomes 0 so the hearts visibly empty before Game Over renders.

**Default policy: counts rounds PASSED.** A 10-round game where the student gets 2 wrong (no retries, default no-retry flow) without losing all lives ends at Victory with the bar at `10/10` (passed all 10). Same game, last-life wrong on round 7 → Game Over fires with the bar at `6/10` + 0 hearts (passed 6, lost on 7). Score (correct count) is a separate counter on `gameState.score` that feeds `getStars()` at end-of-game.

**Default no-retry flow** (most existing games): wrong answer either advances (passes the round) or hits Game Over (didn't pass). Under this flow there's no retry branch — the rule is just "bump on advance, don't bump on Game Over." The retry-aware framing is forward-compatible — current games work unchanged.

Alternative policies (rounds-correct, points-earned, section-progress, tiles-cleared) are allowed only with explicit spec opt-in in the spec's `## Flow` section — never invent.

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

## CRITICAL: ProgressBar Owns the Lives Display — No Custom Hearts DOM

When `totalLives >= 1`, `ProgressBarComponent` already renders a hearts strip inside `#mathai-progress-slot` and updates it on every `progressBar.update(round, lives)` call. The game code MUST NOT render its own hearts anywhere.

**Forbidden in game HTML / JS:**
- `<div class="lives-row">` / `<div id="lives-row">` / `<span class="heart">` — any element with `class` or `id` matching `lives-*`, `hearts-*`, `lives-strip`, `hearts-strip`, `lives-container`, `hearts-container`, `lives-display`, `livesRow`, `heartsRow`, `heart` as a single-class element.
- Functions named `renderLivesRow`, `renderLives`, `renderHearts`, `updateLivesDisplay`, `updateLivesRow`, `updateHearts`, `buildLives`, `injectLives`, etc.
- Heart glyph characters (❤️ `\u2764\uFE0F`, 🤍 `\u{1F90D}`, 🩷 `\u{1FA77}`, ♡ `\u2661`, ♥ `\u2665`) emitted inside an innerHTML assignment or DOM-build string targeting any element other than the CDN ProgressBar's own markup.

**Why:** two hearts rows visible on-screen is the bug. Validator rule `5e0-LIVES-DUP-FORBIDDEN` blocks this at build time. See PART-026 Anti-Pattern 33 for the full WRONG/RIGHT example.

**If your spec needs a heart-break animation:** target the CDN-rendered heart element (inspect `warehouse/packages/components/progress-bar/index.js` for the exact class) with a one-shot CSS class — do NOT build a parallel hearts DOM.

## Requires ScreenLayout v2

ProgressBar requires ScreenLayout v2 with `progressBar: true`:

```javascript
ScreenLayout.inject('app', {
  sections: { questionText: true, progressBar: true, playArea: true, transitionScreen: true }
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
- [ ] No custom lives / hearts DOM or custom heart renderer in game HTML — `ProgressBarComponent` owns the lives strip (validator rule `5e0-LIVES-DUP-FORBIDDEN`; PART-026 Anti-Pattern 33)

## Source Code

Full ProgressBarComponent implementation: `warehouse/packages/components/progress-bar/index.js`
