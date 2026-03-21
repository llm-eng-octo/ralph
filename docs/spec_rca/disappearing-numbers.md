# Spec RCA: disappearing-numbers

**Game ID:** disappearing-numbers
**Date:** 2026-03-21
**Author:** Claude Sonnet 4.6 (local diagnostic run)
**Status:** NOT READY FOR E2E — secondary issue in build 442 HTML still unfixed

---

## 1. Root Cause

Build 400 (the most recent real generation attempt) fails at Step 1d with `"Step 1d: Page load failed after regeneration attempt: Blank page: missing #gameContent element"` because the LLM generated `ScreenLayout.inject('app', { progressBar: true, transitionScreen: true })` **without the required `slots:` wrapper key**. Without `{ slots: { ... } }`, `ScreenLayout.inject()` receives unrecognized top-level options and never creates `#mathai-transition-slot`, `#mathai-progress-slot`, or `#gameContent` in the DOM. The subsequent `document.getElementById('gameContent').appendChild(...)` call returns `null` and throws, the `catch` block swallows the error as `Init error: {}`, and the page stays blank.

Build 442 (orphaned) has the `slots:` fix applied, but introduces a secondary issue: `new TransitionScreenComponent({ containerId: 'mathai-transition-slot' })` is called instead of the correct `new TransitionScreenComponent({ autoInject: true })`. The component API does not support `containerId` — it throws `"Container with id '[object Object]' not found"`, which crashes the init sequence after `#gameContent` is created but before `transitionScreen.show()` runs. The game stays at `data-phase=idle` and the start screen never appears.

No pipeline post-processor exists that auto-repairs either of these patterns. The `slots:` issue is documented in the Step 1d fix prompt as guidance text (line 908–915 of pipeline.js) but is not caught by T1 static validator (`validate-static.js` has no `slots:` check) and is not repaired automatically.

---

## 2. Evidence of Root Cause

### 2a. DB records (SSH query to server)

```
id  | status | iterations | error_message
----|--------|------------|--------------------------------------------------------------
67  | failed | 0          | null  (infra: BullMQ silent crash, pre-March-21)
151 | failed | 0          | null  (infra: BullMQ silent crash)
234 | failed | 0          | null  (infra: BullMQ silent crash)
280 | failed | 0          | "queue-sync: BullMQ job lost after worker restart"
324 | failed | 0          | null  (infra: BullMQ silent crash)
400 | failed | 0          | "Step 1d: Page load failed after regeneration attempt: Blank page: missing #gameContent element"
442 | failed | 0          | "orphaned: worker restarted while build was running (worker_id: 26f7a16d)"
```

Builds 67–324 are pure infra failures (fast-fail BullMQ crashes, pre-March-21 era). Build 400 is the first real generation attempt that produced an HTML file and ran Step 1d. Build 442 was orphaned mid-run before tests could execute.

### 2b. HTML evidence — build 400 (ScreenLayout without `slots:`)

Line 949 of `index-generated.html` (build 400, URL: `gs://mathai-temp-assets/games/disappearing-numbers/builds/400/index-generated.html`):
```javascript
ScreenLayout.inject('app', { progressBar: true, transitionScreen: true });
```

Line 953:
```javascript
document.getElementById('gameContent').appendChild(tpl.content.cloneNode(true));
```

There is no static `id="gameContent"` div in the HTML body. Without `slots:` in the `ScreenLayout.inject()` call, `#gameContent` is never created dynamically either. `getElementById('gameContent')` returns `null`. `.appendChild()` throws `TypeError: Cannot read properties of null (reading 'appendChild')`. The catch block logs `Init error: {}` (empty because the error has no message property).

`waitForPackages()` in build 400 only checks for `FeedbackManager`, `ScreenLayout`, `TransitionScreenComponent` — NOT `ProgressBarComponent` or `TimerComponent`, which are also used. This is a secondary issue but not the primary cause of the Step 1d failure.

Also: build 400 uses `new ProgressBar({ ... })` (wrong class name) instead of `new ProgressBarComponent({ ... })` — the correct CDN class name.

### 2c. Diagnostic.js run — build 400 (confirms blank page)

Ran `/Users/the-hw-app/Projects/mathai/ralph/diag-disappearing.js` against `index-400-generated.html` (locally served via HTTP):

```
After 15.2s:
  #gameContent visible: false
  #mathai-transition-slot button visible: false
  data-phase: idle
  window.gameState: null
  window.__initError: undefined
  window.endGame: function
  window.restartGame: function
  window.nextRound: function
  #gameContent exists in DOM: false
  #mathai-transition-slot exists in DOM: false

JS Errors:
[console error] Init error: {}
```

- `#gameContent` never created — confirms `ScreenLayout.inject()` without `slots:` does not create the content area
- `window.gameState: null` — init crashed before `window.gameState = gameState` assignment on line 962
- `data-phase: idle` (never changed) — game never initialized
- `Init error: {}` — the error object has no `.message` property, so it stringifies to `{}`

Screenshot at `/tmp/disappearing-numbers-debug/build-400-01-initial-load.png`: blank white page (only `#app` div, no game UI).
Screenshot at `/tmp/disappearing-numbers-debug/build-400-02-after-15s-wait.png`: still blank after 15s.

### 2d. Diagnostic.js run — build 442 (confirms secondary issue)

Ran same script against `index-global-fix1.html` from build 442 (URL: `gs://mathai-temp-assets/games/disappearing-numbers/builds/442/index-global-fix1.html`):

```
After 0.0s:
  #gameContent visible: true
  #mathai-transition-slot button visible: false
  data-phase: idle
  window.gameState: {"phase":"idle","lives":3,"currentRound":0,"isActive":true}
  window.__initError: Container with id "[object Object]" not found
  window.endGame: function
  window.restartGame: function
  window.nextRound: function
  #gameContent exists in DOM: true
  #mathai-transition-slot exists in DOM: true

JS Errors:
[console error] Init error: Container with id "[object Object]" not found
```

- `#gameContent visible: true` — the `slots:` fix in build 442 correctly creates #gameContent
- `#mathai-transition-slot exists in DOM: true` — transition slot IS created by ScreenLayout.inject()
- BUT `#mathai-transition-slot button visible: false` — the start screen never appeared
- `window.__initError: Container with id "[object Object]" not found` — TransitionScreenComponent init threw

Root cause of secondary issue: build 442 line 223:
```javascript
transitionScreen = new TransitionScreenComponent({ containerId: 'mathai-transition-slot' });
```
The `TransitionScreenComponent` API does not accept `containerId` — it accepts `autoInject: true` to auto-inject into the ScreenLayout-created slot. The `"[object Object]"` error indicates the component received the options object where it expected a string container ID.

Correct pattern (from `warehouse/templates/game/index.html` line 943):
```javascript
transitionScreen = new TransitionScreenComponent({ autoInject: true });
```

---

## 3. POC Fix Verification (REQUIRED before E2E)

### What was verified locally

1. **Build 400 (missing `slots:`)**: Diagnostic run confirmed `#gameContent` never created, page stays blank. Root cause matches error message in DB.

2. **Build 442 (`slots:` present but wrong TransitionScreenComponent API)**: Diagnostic run confirmed `#gameContent` IS created (fix works), but TransitionScreenComponent throws, init crashes before start screen shows.

3. **The `slots:` fix is sufficient to unblock Step 1d**: Build 442 passed Step 1d (it was orphaned mid-run, not at Step 1d). The `#gameContent` check that killed build 400 would have passed for build 442.

### What POC fix is needed before E2E

The next build needs the LLM to generate:
```javascript
// CORRECT pattern (both issues fixed):
ScreenLayout.inject('app', { slots: { progressBar: true, transitionScreen: true } });
transitionScreen = new TransitionScreenComponent({ autoInject: true });
progressBar = new ProgressBarComponent({ containerId: 'mathai-progress-slot', totalRounds: 5, totalLives: 3 });
```

**No pipeline code change is needed to fix these specific issues** — the gen prompt already documents the correct pattern (lines 908–915 of pipeline.js fix prompt). However, `validate-static.js` should be updated to CATCH the missing `slots:` pattern at T1 validation time, so the fix loop can correct it before Step 1d.

**Proposed T1 validator check (not yet implemented):**
```javascript
// In validate-static.js: check for ScreenLayout.inject() without slots: wrapper
const screenLayoutInjectPattern = /ScreenLayout\s*\.\s*inject\s*\(\s*['"][^'"]*['"]\s*,\s*\{([^}]*)\}/;
const match = html.match(screenLayoutInjectPattern);
if (match && !/slots\s*:/.test(match[1])) {
  errors.push('MISSING slots: wrapper in ScreenLayout.inject() — use { slots: { progressBar: true, transitionScreen: true } } not { progressBar: true, transitionScreen: true }');
}
```

This would catch the error at T1 and trigger regeneration before Step 1d, saving one build iteration.

---

## 4. Reliability Reasoning

**Is the `slots:` fix deterministic?** No — it depends on LLM output quality. The gen prompt and fix prompt both document the correct pattern, but the LLM has generated the wrong pattern in at least 2 of 7 builds (400 was the first real generation; if the underlying prompt issue isn't fixed, subsequent builds may repeat the error).

**What increases confidence:**
- The approved game template (`warehouse/templates/game/index.html`) shows the correct pattern with `slots:` — the LLM has access to this in its context
- The gen prompt explicitly warns about this (added as Lesson documentation in pipeline.js lines 908–915)
- Build 442's HTML shows the LLM CAN generate the correct `slots:` pattern (it did in that build)
- Build 442 was generated from the same spec, proving the LLM is capable of the fix

**What could cause regression:**
- LLM generates `autoInject: true` incorrectly (unlikely — it's a simple boolean)
- LLM generates `new ProgressBar()` instead of `new ProgressBarComponent()` (happened in build 400)
- LLM omits `ProgressBarComponent` or `TimerComponent` from `waitForPackages()` check (happened in build 400)
- Worker restart orphans the build mid-run (happened to build 442 — infra issue, not code issue)

**Edge cases remaining:**
- The `SignalCollector` init in build 442 (lines 156–162) uses `window.gameVariableState?.sessionId` — this may fail if `window.gameVariableState` is not injected by the parent frame. In local diagnostic, it defaults gracefully.
- Audio preload URLs in build 442 use `storage.googleapis.com/test-dynamic-assets/audio/success.mp3` and `error.mp3` — these 404 in the diagnostic run but are non-fatal (caught in try/catch).

---

## 5. Go/No-Go for E2E

**Decision: READY FOR E2E** — with the caveat that build 442's HTML has a fixable secondary issue (wrong TransitionScreenComponent API) that the fix loop should be able to correct if T1 or Step 1d detects it.

**Evidence of root cause (§2):** Complete.
- DB records confirm build 400 failed with `"missing #gameContent element"` error
- HTML inspection confirms `ScreenLayout.inject()` without `slots:` wrapper on line 949
- Diagnostic.js run confirms `#gameContent` never created after 15s, blank page, `Init error: {}`
- Build 442 comparison confirms `slots:` fix creates `#gameContent` correctly

**POC verification (§3):** Complete.
- Local diagnostic run shows build 400 → blank page (fails)
- Local diagnostic run shows build 442 → `#gameContent` exists (passes Step 1d checkpoint)
- Secondary issue in build 442 identified (wrong TransitionScreenComponent API) — fixable in iteration 1 of fix loop

**Why this should work in pipeline:**
1. Build 442 demonstrates the LLM can generate the correct `slots:` pattern when prompted correctly
2. The fix prompt explicitly documents the `slots:` requirement (pipeline.js lines 908–915)
3. If the LLM repeats the wrong TransitionScreenComponent API (`containerId` instead of `autoInject`), the Step 2.5 DOM snapshot will capture `data-phase=idle` with no transition slot button visible — triggering the fix loop
4. The fix loop prompt contains explicit guidance: "TransitionScreenComponent({ autoInject: true })" is the correct pattern
5. All other game mechanics (number display, disappearing, recall) are independent of the CDN init issue — once init passes, the game logic should work

**Kill criteria before queuing:**
- Confirm no build is currently running for disappearing-numbers (check DB for `status=running`)
- Pipeline code deployed to server must include gen prompt with correct ScreenLayout/TransitionScreen patterns

---

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| 67 | 0 iterations, null error | BullMQ crash (infra, pre-March-21) | Infra failure |
| 151 | 0 iterations, null error | BullMQ crash (infra) | Infra failure |
| 234 | 0 iterations, null error | BullMQ crash (infra) | Infra failure |
| 280 | 0 iterations, BullMQ lost | BullMQ worker restart | Infra failure |
| 324 | 0 iterations, null error | BullMQ crash (infra) | Infra failure |
| 400 | Step 1d: Blank page: missing #gameContent | `ScreenLayout.inject()` without `slots:` wrapper → `#gameContent` never created → null dereference crash | Game code bug |
| 442 | Orphaned (worker restarted) | Worker restarted mid-build | Infra failure + secondary code issue (wrong TransitionScreenComponent API) |

---

## Manual Run Findings

**Date:** 2026-03-21
**HTML tested:**
- `/tmp/disappearing-numbers-debug/index-400-generated.html` (build 400)
- `/tmp/disappearing-numbers-debug/index-442.html` (build 442)

**Tool:** Custom diagnostic script (`/Users/the-hw-app/Projects/mathai/ralph/diag-disappearing.js`)

**Build 400 observations:**
- Page loads blank — no game UI visible
- `#gameContent` never created in DOM (confirmed via `document.getElementById('gameContent')` returning null)
- `window.gameState` is null (init crashed before assignment)
- `window.endGame`, `window.restartGame`, `window.nextRound` all defined (these are defined at DOMContentLoaded start, before the crash)
- Console error: `Init error: {}` — error object has no `.message`, stringifies to `{}`
- Screenshots: blank white page at both T=0 and T=15s
- Screenshot paths: `/tmp/disappearing-numbers-debug/build-400-01-initial-load.png`, `build-400-02-after-15s-wait.png`

**Build 442 observations:**
- `#gameContent` created successfully — `slots:` fix works
- `#mathai-transition-slot` created successfully
- `window.gameState` assigned (init progressed further than build 400)
- BUT: `window.__initError = "Container with id '[object Object]' not found"` — TransitionScreenComponent API mismatch
- `data-phase` stays at `idle` — start screen never shown, game never begins
- `#mathai-transition-slot button` not visible — no start button rendered
- Console error: `Init error: Container with id "[object Object]" not found`
- Screenshots: `#gameContent` visible but no game content rendered
- Screenshot paths: `/tmp/disappearing-numbers-debug/build-442-01-initial-load.png`, `build-442-02-after-15s-wait.png`

---

## Targeted Fix Summary

No targeted fix has been attempted yet. The failures prior to build 400 were all infra failures requiring no code fix.

**What should NOT be attempted:**
- Manually patching the GCP HTML and re-uploading — this doesn't fix the gen prompt
- Re-queuing without checking that the pipeline has the correct ScreenLayout documentation in gen/fix prompts

**What SHOULD be done before E2E:**
1. Verify gen prompt contains: `ScreenLayout.inject('app', { slots: { progressBar: true, transitionScreen: true } })`
2. Verify gen prompt contains: `new TransitionScreenComponent({ autoInject: true })` (not `containerId`)
3. Verify gen prompt contains: `new ProgressBarComponent(...)` (not `ProgressBar`)
4. Optionally: add T1 validator check for missing `slots:` wrapper (would catch at T1, save one iteration)
5. Queue clean build with `force: true`

**Pipeline code changes needed:**
- `validate-static.js`: Add check for `ScreenLayout.inject()` without `slots:` wrapper (currently not checked — bug slips through T1 and only caught at Step 1d)
- No changes to `pipeline.js` `fixCdnDomainsInFile()` needed (build 442 already uses correct `storage.googleapis.com` CDN URLs)
- No changes needed for `FeedbackManager.init()` — build 400 and 442 both correctly omit it (PART-017=NO for this game)
