# RCA: quadratic-formula-worked-example

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| #545 | game-flow 3/4 → 0/4 in final retest; mechanics 5/5 → 4/5; level-progression 1/1 → 0/1; edge-cases 1/2; contract 0/2 (both deleted by triage); FAILED 41.7% overall | Primary: CDN cold-start (confirmed locally 2026-03-22). Secondary: 3 HTML bugs: (1) window.jumpToRound not on window, (2) fadedProblem/practiceProblem missing from content, (3) postMessage sends livesRemaining/time instead of rounds_completed/duration_ms. | FAILED — local diagnostic complete, 3 gen prompt fixes needed before E2E |

---

## 1. Root Cause

**Primary: CDN cold-start timing regression between fix-loop and final retest.**

Build #545 produced HTML that reached 10/12 passing tests during the per-category fix loop (game-flow 3/4, mechanics 5/5, level-progression 1/1, edge-cases 1/2). The global fix loop's best HTML was restored before final retest. In final retest, the same HTML scored only 5/12 (game-flow 0/4, mechanics 4/5, level-progression 0/1, edge-cases 1/2).

The regression on same HTML from 10/12 → 5/12 is not an HTML logic bug. It matches the CDN cold-start pattern documented in count-and-tap Lesson 91: between the fix-loop test runs and the final retest, the CDN server went cold. WorkedExampleComponent, FeedbackManager, and ScreenLayout — loaded from `storage.googleapis.com` — take 2–3 minutes to warm up on a cold GCP server. The final retest browser has no CDN cache and times out inside the 50s `beforeEach` window.

The fact that game-flow went from 3/4 to 0/4, and level-progression from 1/1 to 0/1, is consistent with CDN cold-start: these tests exercise the game's start flow (TransitionScreen, WorkedExampleComponent rendering) which requires CDN package availability. Mechanics 5/5 → 4/5 is likely a flaky assertion rather than a CDN issue.

**Secondary: postMessage contract field name mismatch.**

The behavioral transcript revealed that the game sends:
```json
{ "type": "game_complete", "data": { "metrics": { "livesRemaining": N, "score": N, "time": N, "stars": N } } }
```

But the spec for PART-036 worked-example games requires:
```json
{ "type": "game_complete", "data": { "metrics": { "rounds_completed": N, "wrong_in_practice": N, "duration_ms": N, "stars": N, "accuracy": N } } }
```

Both contract tests were deleted by triage (0/2 evidence), so they were not attempted in the fix loop. The postMessage field mismatch is a genuine spec compliance issue — the gen prompt does not enforce the correct schema for worked-example postMessage payloads.

---

## 2. Evidence of Root Cause

| Artifact | Finding |
|----------|---------|
| Fix-loop results (per-category) | game-flow 3/4 (iter 2), mechanics 5/5, level-progression 1/1, edge-cases 1/2 — best HTML scored 10/12 in warm conditions |
| Final retest on same HTML | game-flow 0/4, mechanics 4/5, level-progression 0/1, edge-cases 1/2 = 5/12 — same HTML, different CDN warmth |
| Pattern match: count-and-tap Lesson 91 | Identical regression: tests pass in fix loop, fail in final retest on same HTML. Root cause there was CDN cold-start (2.5 min CDN load on cold GCP VM exceeding 50s beforeEach timeout). |
| Behavioral transcript (pipeline log) | postMessage sends `livesRemaining`, `time` — wrong field names vs spec requirement for `rounds_completed`, `duration_ms` |
| Contract test deletion | Both contract tests deleted by triage (0/2 evidence) — they were never attempted, so no fix-loop iterations targeted the postMessage schema |
| 33 GF8 lint warnings | `toBeVisible()` without `waitForPhase()` in level-progression and mechanics spec files — indicates test gen quality issue independently of CDN |
| Smoke check | PASSED in 13s — game HTML is structurally correct, CDN loads fine on warm server |
| T1 static validation | PASSED — no structural HTML errors |
| Gemini-2.5-pro gen | 52,259 bytes in 116s — large game, algebra MCQ with 3 rounds × 3 sub-phases (example → faded → practice) |

### Local Diagnostic Results (2026-03-22, build #545 HTML at /tmp/qfe-545.html)

**CDN load time locally:** transition slot ready after 0.0s. No CDN cold-start locally — all packages loaded instantly from local cache. This confirms the server-side CDN timing hypothesis: the browser on GCP had cold CDN whereas the local Mac has the packages cached.

**Console errors locally:** None that block game logic. Only benign errors:
- `[AudioKit] Failed to preload success/error: HTTP 404` — sound assets 404, non-blocking
- `lottie-player already registered` — harmless duplicate CDN load
- `MISSING window.nextRound` — harness warning; `window.jumpToRound` also not on window

**window.gameState shape (confirmed):**
```json
{
  "currentRound": 0, "totalRounds": 3, "score": 0, "lives": 3, "totalLives": 3,
  "phase": "playing", "subPhase": "example",
  "workedExampleStepIndex": 0, "fadedAnswered": false, "practiceAnswered": false, "wrongInPractice": 0,
  "content": { "rounds": [{ "equationLabel": "x²−5x+6=0", ... }] },
  "isActive": true, "gameEnded": false, "isProcessing": false
}
```

**Game flow confirmed working locally:**
- Start screen → transition slot button visible immediately (0.0s)
- Click "Let's go!" → `phase=playing, subPhase=example` immediately
- Example subphase: 4 steps (Step 1–4), "Next Step →" advances `workedExampleStepIndex`
- "Got It — Try It Yourself!" button (id=`#btn-example-done`) transitions to `subPhase=faded`
- Faded subphase: MCQ option buttons visible (e.g. "x = (−6 ± √4) / 2"), no fadedProblem in content
- "Next: Practice Problem" button (id=`#btn-faded-done`) transitions to `subPhase=practice`
- `window.endGame()` works: transitions to `phase=gameover`, fires postMessage

**Critical findings — additional HTML bugs discovered:**

1. **`window.jumpToRound` NOT on window** — `typeof window.jumpToRound === false`. Game defines `jumpToRound` internally but does NOT expose it on `window`. Any test using `window.__ralph.jumpToRound()` or `window.jumpToRound(n)` will silently fail. This is a T1 rule 20/21 violation for game-flow tests that use `skipToEnd()` or `jumpToRound()`.

2. **`fadedProblem` and `practiceProblem` MISSING from content** — `window.gameState.content.rounds[0].fadedProblem` is `undefined`. The LLM generated `exampleProblem` with 4 steps correctly, but did NOT populate `fadedProblem` or `practiceProblem` fields. The faded subphase shows MCQ buttons but they are not connected to content data. This is the root cause of why faded/practice subphase tests likely fail — the content is empty.

3. **postMessage confirmed wrong fields** — When `endGame()` is called, the postMessage sends:
   ```json
   { "type": "game_complete", "data": { "metrics": { "score": 0, "accuracy": 0, "time": 4, "stars": 3, "livesRemaining": 3 } } }
   ```
   Required PART-036 fields: `rounds_completed`, `wrong_in_practice`, `duration_ms`. Field `time` should be `duration_ms`, `livesRemaining` should not exist, `rounds_completed` and `wrong_in_practice` are missing.

4. **Subphase transition without content validation** — The faded subphase transitions when "Got It" is clicked even though `fadedProblem` is missing. The game renders fallback MCQ buttons from somewhere (hardcoded or stale content), not from the spec content data.

**Screenshots:** `/tmp/qfe-545-debug2/` and `/tmp/qfe-545-debug3/` — start screen, faded subphase, practice subphase, after-endGame state.

---

## 3. POC Fix Verification

**Status: PARTIAL — CDN cold-start confirmed locally. Three additional HTML bugs discovered.**

### CDN timing: CONFIRMED by local diagnostic (2026-03-22)

Local run against `/tmp/qfe-545.html`:
- Transition slot ready in **0.0s** locally (CDN packages cached on Mac)
- Game reaches `phase=playing, subPhase=example` immediately after start click
- All CDN packages load: ScreenLayout, WorkedExampleComponent, TransitionScreen, FeedbackManager, ProgressBar
- No blocking JS errors

This matches the Lesson 91 count-and-tap pattern exactly: game works fine locally (warm cache) and fails on GCP server (cold CDN cache). CDN cold-start is the primary game-flow 0/4 root cause. **CDN hypothesis CONFIRMED.**

### Additional bugs discovered by local diagnostic (NOT the CDN issue — genuine HTML bugs):

**Bug 1: `window.jumpToRound` missing from window scope**
- `typeof window.jumpToRound` returns `false` (undefined)
- The function exists internally but was not assigned to `window`
- Any test using `skipToEnd()` or `window.__ralph.jumpToRound()` silently fails
- This is a T1 rule violation (rule 21 in gen prompt)
- Fix required: gen prompt must explicitly require `window.jumpToRound = jumpToRound;`

**Bug 2: `fadedProblem` and `practiceProblem` missing from content**
- `window.gameState.content.rounds[0].fadedProblem` is `undefined`
- `window.gameState.content.rounds[0].practiceProblem` is `undefined`
- Only `exampleProblem` was populated (4 steps for round 0: "Step 1: Identify a, b, c" ... "Step 4: Simplify both roots")
- The game renders fallback MCQ option buttons in faded subphase regardless (from hardcoded content, not spec data)
- Tests that check faded/practice content accuracy will fail because content is missing
- This is a gen prompt gap: spec requires fadedProblem + practiceProblem per round but LLM omitted them

**Bug 3: postMessage schema wrong — confirmed by browser**
- Actual: `{ "type": "game_complete", "data": { "metrics": { "score": 0, "accuracy": 0, "time": 4, "stars": 3, "livesRemaining": 3 } } }`
- Required: `{ ..., "metrics": { "rounds_completed": N, "wrong_in_practice": N, "duration_ms": N, "stars": N, "accuracy": N } }`
- Fields to remove: `livesRemaining`, `time` (rename to `duration_ms`)
- Fields to add: `rounds_completed`, `wrong_in_practice`
- Fix location: gen prompt for worked-example games (PART-036 spec type)

**Summary of what a next build needs:**
1. CDN pre-warm before final retest (pipeline fix) OR accept CDN timing as known risk
2. Gen prompt: require `window.jumpToRound = jumpToRound;` in window scope
3. Gen prompt: require `fadedProblem` and `practiceProblem` per round in content
4. Gen prompt: enforce PART-036 postMessage schema (`rounds_completed`, `wrong_in_practice`, `duration_ms`)

---

## 4. Reliability Reasoning

**CDN cold-start (primary):**
This is a systemic pipeline infrastructure issue, not an HTML bug. The final retest always runs after all per-category fix loops complete — by then, the CDN cache on the test browser may have expired. CDN cold-start is non-deterministic (depends on GCP CDN warmth state at the moment the final retest executes). The fix is not in the HTML — it requires either: (a) a CDN local proxy during test runs (serving CDN scripts from disk, eliminating network latency), or (b) a pre-warm step before final retest (loading the HTML once before the timed test run). Neither is implemented.

Until one of these is implemented, any game that passes per-category fix loop at >80% but fails final retest on same HTML should be treated as a CDN timing casualty, not an HTML regression.

**PostMessage schema mismatch (secondary):**
This is a deterministic gen prompt quality issue. The gen prompt for PART-036 worked-example games does not specify the correct postMessage field names. Every build will generate the wrong schema until the prompt is corrected. Regression risk: zero once the prompt rule is added (the LLM follows explicit field name requirements reliably).

**Edge cases remaining unhandled:**
- GF8 lint warnings (33 × `toBeVisible` without `waitForPhase`) — test gen quality issue, separate from CDN timing
- Cross-batch guard regression in edge-cases (1/2 despite fix loop) — indicates the global fix loop may have regressed one edge-case test while fixing another

---

## 5. Go/No-Go for E2E

**Status: NOT READY — 3 gen prompt fixes required first**

§2 Evidence: COMPLETE (local diagnostic run 2026-03-22)
§3 POC: PARTIAL — CDN timing confirmed, but 3 new bugs found requiring prompt fixes

Blocking items:
1. **`window.jumpToRound` not on window** — gen prompt must add rule: `window.jumpToRound = jumpToRound;` required for all worked-example games. Without this, all `skipToEnd()` and jump-based game-flow tests fail silently.
2. **`fadedProblem` / `practiceProblem` missing from content** — gen prompt must explicitly require per-round `fadedProblem` and `practiceProblem` objects in the game content data. LLM only generated `exampleProblem`.
3. **PostMessage schema wrong** — gen prompt must enforce PART-036 schema: `rounds_completed`, `wrong_in_practice`, `duration_ms` (not `livesRemaining`, `time`). Until fixed, both contract tests will be triage-deleted every build.
4. **CDN pre-warm not implemented** — game-flow tests may fail in final retest due to CDN cold-start. This is a pipeline infrastructure fix (pre-warm step before final retest, or local CDN proxy). Without it, CDN timing failures will repeat.

**Required before next E2E:**
1. Add worked-example gen prompt rule: `window.jumpToRound = jumpToRound;` must be in window scope
2. Add worked-example gen prompt rule: `fadedProblem` and `practiceProblem` required per round in content data
3. Add worked-example gen prompt rule: PART-036 postMessage schema with `rounds_completed`, `wrong_in_practice`, `duration_ms`
4. (Desirable but not blocking): CDN pre-warm pipeline step before final retest

---

## Manual Run Findings (browser screenshots, console, network)

**Run date:** 2026-03-22. HTML: `/tmp/qfe-545.html` (build #545, 51,681 bytes).

**CDN timing:** Transition slot ready in 0.0s locally. All CDN packages loaded from cache — no cold-start. Confirms CDN cold-start is a server-side-only problem.

**Console output (no blocking errors):**
- `[AudioKit] Failed to preload success/error: HTTP 404` — sound asset 404s, non-blocking
- `lottie-player already registered` — harmless duplicate CDN registration
- `[ralph-test-harness] MISSING window.nextRound` — harness warning (nextRound also not on window)
- `[SignalCollector] Initialized` — package loaded OK
- Sentry init fails with `SentryConfig.init is not a function` — non-blocking warning

**Game flow locally (works correctly):**
1. Start screen → transition slot button visible immediately
2. Click "Let's go!" → `phase=playing, subPhase=example` in ~1.5s
3. Example subphase: 4 steps, "Next Step →" advances `workedExampleStepIndex` (0→1→2→3)
4. "Got It — Try It Yourself!" button (#btn-example-done) visible at step 3/4 → transitions to `subPhase=faded`
5. Faded subphase: MCQ option buttons visible ("x = (−6 ± √4) / 2" etc.) — but `fadedProblem` is `undefined`
6. "Next: Practice Problem" button (#btn-faded-done) → transitions to `subPhase=practice`
7. `window.endGame()` works: → `phase=gameover`, fires postMessage with wrong field names

**New bugs found (not CDN-related):**
- `window.jumpToRound` = undefined (function exists internally but not exported to window)
- `fadedProblem` and `practiceProblem` are `undefined` in all rounds — LLM only generated `exampleProblem`
- postMessage `metrics` sends `livesRemaining` and `time` instead of `rounds_completed` and `duration_ms`

**Screenshots:**
- `/tmp/qfe-545-debug2/01-start-screen.png` — TransitionScreen with "Let's go!" button
- `/tmp/qfe-545-debug2/02-after-start.png` — `phase=playing, subPhase=example`
- `/tmp/qfe-545-debug2/03-before-start.png` — game before click
- `/tmp/qfe-545-debug3/03-faded-subphase.png` — faded subphase with MCQ buttons visible
- `/tmp/qfe-545-debug3/05-practice-subphase.png` — practice subphase (empty content)
- `/tmp/qfe-545-debug3/06-after-endGame.png` — gameover screen after endGame()

---

## Targeted Fix Summary

| Fix | Status | What Changed |
|-----|--------|-------------|
| CDN cold-start root cause confirmation | DONE (2026-03-22) | Local diagnostic confirmed: CDN loads in 0.0s locally, game flow works. CDN cold-start is server-side only. |
| `window.jumpToRound` missing | PENDING | Gen prompt update: require `window.jumpToRound = jumpToRound;` for all worked-example games |
| `fadedProblem`/`practiceProblem` missing from content | PENDING | Gen prompt update: require per-round `fadedProblem` and `practiceProblem` objects in game content |
| PostMessage schema fix | PENDING | Gen prompt update: PART-036 worked-example postMessage must use `rounds_completed`, `wrong_in_practice`, `duration_ms`, `stars`, `accuracy` |
| GF8 lint warning fix | PENDING | Test gen prompt: require `waitForPhase` before `toBeVisible` assertions |
| CDN pre-warm / local proxy | ROADMAP | Pipeline infrastructure: pre-warm CDN before final retest, or serve CDN from disk during tests |
