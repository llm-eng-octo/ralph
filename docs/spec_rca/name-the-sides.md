# name-the-sides — Per-Spec RCA

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| #550 | mechanics 0/6 × 3 iterations; game-flow tests triage-deleted (bad data-testid selectors) | `window.loadRound` not exposed → `__ralph.jumpToRound()` silent no-op → `waitForPhase('playing')` timeout after any prior `endGame()` call | FAILED — killed after iter 3 |

---

## 1. Root Cause

`window.loadRound` is not exposed on `window`. The test harness `__ralph.jumpToRound(n)` implementation checks for `window.loadRound`, `window.jumpToRound`, `window.loadQuestion`, and `window.goToRound` — all four are absent in the generated HTML. When none of those exist, `jumpToRound()` falls back to setting `gameState.currentRound = n` directly but never calls `nextRound()` or `renderRound()`, so the UI and phase remain unchanged. Any mechanics test that calls `jumpToRound()` after a prior test has driven the game to `phase = 'results'` will find the phase still stuck at `'results'`, causing `waitForPhase(page, 'playing')` to time out every time.

Additionally, `window.startGame` is not exposed, so tests cannot programmatically call `startGame()` to reinitialize the game state after a polluted phase.

The gen prompt lists `window.endGame`, `window.restartGame`, and `window.nextRound` as required window exposures but does NOT include `window.loadRound`. This omission is the sole reason every mechanics test in build #550 failed across all three iterations.

---

## 2. Evidence of Root Cause

**HTML analysis of build #550 — `/tmp/name-the-sides-550/index.html`:**

- Line 95: `phase: 'start'` at initialization — correct initial state.
- Lines 591–593: `window.endGame`, `window.restartGame`, `window.nextRound` exposed — correct.
- `window.loadRound`, `window.startGame`, `window.renderRound` — **NOT present** anywhere in the file.
- `endGame()` at line 478 sets `phase = outcome === 'victory' ? 'results' : 'gameover'` — game phase transitions correctly through play, but after `endGame()` fires there is no way for the harness to re-enter `'playing'` phase.
- Guard at line 470: `if (gameState.gameEnded) return;` — prevents double-endGame but also means a stale `gameEnded=true` will silently swallow any `nextRound()` call.
- Fallback content is solid: 9 rounds with full `triangleConfig` and `correctLabels` arrays (lines 111–123) — the content data is fine; only the window exposure is missing.

**Test harness `__ralph.jumpToRound(n)` logic (from pipeline.js harness injection):**

```js
jumpToRound: function(n) {
  if (window.loadRound) return window.loadRound(n);
  if (window.jumpToRound) return window.jumpToRound(n);
  if (window.loadQuestion) return window.loadQuestion(n);
  if (window.goToRound) return window.goToRound(n);
  // silent fallback — sets round but does NOT call nextRound()
  if (window.gameState) window.gameState.currentRound = n;
}
```

All four checked symbols absent → fallback executes → `nextRound()` never called → phase stays at `'results'` → every subsequent `waitForPhase(page, 'playing')` times out.

**Build #550 test output pattern (mechanics category, all 3 iterations):**

```
mechanics > round 1 plays correctly
  Error: waitForPhase('playing') timed out after 10000ms
  Current data-phase: results
```

Zero mechanics passes across all three iterations — consistent with a phase-stuck silent no-op, not a flaky timing issue.

---

## 3. POC Fix Verification (REQUIRED before E2E)

**Fix is a one-line window assignment added after the existing window exposures (after line 593):**

```js
window.loadRound = function(n) {
  gameState.currentRound = n - 1;
  gameState.gameEnded = false;
  nextRound();
};
```

`gameState.currentRound = n - 1` because `nextRound()` increments before rendering. `gameState.gameEnded = false` clears the guard at line 470 so `nextRound()` is not swallowed.

**Local verification approach (to be run before E2E):**

```bash
# Patch the HTML
node -e "
  const fs = require('fs');
  let html = fs.readFileSync('/tmp/name-the-sides-550/index.html', 'utf8');
  html = html.replace(
    'window.nextRound = nextRound;',
    'window.nextRound = nextRound;\nwindow.loadRound = function(n) { gameState.currentRound = n - 1; gameState.gameEnded = false; nextRound(); };'
  );
  fs.writeFileSync('/tmp/name-the-sides-550/patched.html', html);
  console.log('patched');
"
node diagnostic.js /tmp/name-the-sides-550/patched.html
```

Expected result: `__ralph.jumpToRound(3)` navigates to round 3, `data-phase` reads `playing`, mechanics tests pass.

**Gen prompt fix — GEN-114 rule:**

Add to `CDN_CONSTRAINTS_BLOCK` in `prompts.js`:

```
RULE GEN-114: For any round-based game (game has totalRounds / currentRound), you MUST expose:
  window.loadRound = function(n) { gameState.currentRound = n - 1; gameState.gameEnded = false; nextRound(); };
This is required by __ralph.jumpToRound(). Without it, all mechanics tests that use jumpToRound() will time out.
```

**T1 static validator fix — PART-021-LOADROUND:**

In `validate-static.js`, add a warning when the HTML contains `totalRounds` or `currentRound` in gameState but does NOT expose `window.loadRound`:

```js
// PART-021-LOADROUND: round-based game missing window.loadRound
if (/currentRound|totalRounds/.test(html) && !/window\.loadRound/.test(html)) {
  warnings.push('PART-021-LOADROUND: round-based game missing window.loadRound — __ralph.jumpToRound() will be a silent no-op');
}
```

---

## 4. Reliability Reasoning

**Is the fix deterministic?** Yes. `window.loadRound = function(n) { ... nextRound(); }` is a pure function assignment. Once deployed in the gen prompt and T1 check, every future CDN game with `currentRound`/`totalRounds` will either expose it (gen prompt compliance) or be caught and patched by T1 static-fix.

**What could cause it to regress?**
- LLM ignores GEN-114 rule (same failure class as GEN-112 in build #549 find-triangle-side). Mitigation: T1 PART-021-LOADROUND warning triggers static-fix which adds the exposure.
- Game uses a different internal function name (e.g., `renderRound` instead of `nextRound`). The LLM must know to use whichever function advances the round. The rule must be worded to match the game's own internal function, not hardcode `nextRound`.
- `gameState.gameEnded` guard varies by game — some games use different flag names. The fix must clear the guard that `nextRound()` checks. Lesson: gen prompt must clarify "clear any game-ended guard before calling the round function."

**Edge cases:**
- Game with only 1 round: `loadRound(1)` → `currentRound = 0` → `nextRound()` → works.
- Game that reuses `nextRound` for both advancing AND ending: calling `loadRound(n)` at the last round might immediately trigger `endGame()`. This is acceptable test behavior — the test must handle it.

---

## 5. Go/No-Go for E2E

**Decision: NOT READY for E2E.**

**Blocking items:**
1. POC fix not yet verified locally with `diagnostic.js` + patched HTML (§3 prescribed but not executed).
2. GEN-114 gen prompt rule not yet committed to `prompts.js`.
3. T1 PART-021-LOADROUND check not yet added to `validate-static.js`.

**Ready when:**
- `diagnostic.js` run on patched HTML confirms `__ralph.jumpToRound()` navigates correctly and `data-phase` reads `playing`
- GEN-114 committed + deployed to server
- T1 PART-021-LOADROUND check committed + deployed
- Build #551 queued to verify the full pipeline

**Evidence completeness:**
- §2 (Evidence): complete from HTML analysis — window exposure confirmed absent, harness fallback path confirmed, phase-stuck mechanism confirmed
- §3 (POC): fix designed and scripted but not yet executed — must run `diagnostic.js` on patched HTML before E2E

---

## Manual Run Findings

Not yet run. Local test session against `/tmp/name-the-sides-550/index.html` is the next required step before E2E.

---

## Targeted Fix Summary

| Attempt | What was tried | Result |
|---------|----------------|--------|
| Build #550 iter 1–3 | Pipeline ran 3 fix iterations on mechanics 0/6 failures | No progress — root cause is missing `window.loadRound`, which the fix loop cannot add because T1 does not flag it as an error (only a warning after PART-021-LOADROUND is added) |
| — | GEN-114 gen prompt rule (pending) | Not yet deployed |
| — | T1 PART-021-LOADROUND warning (pending) | Not yet deployed |
| Build #551 | Re-queue after GEN-114 + T1 fix deployed | Pending |
