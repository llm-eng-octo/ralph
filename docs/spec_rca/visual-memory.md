# Visual Memory — Per-Spec RCA

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| 422 | Step 1d: "Initialization error: {error: TimerComponent is not defined}" | LLM used TimerComponent but waitForPackages() only checked ScreenLayout; smoke-regen dead code (specMeta.isCdnGame never set) triggered full regen which reproduced error with different phrasing caught by /initialization\s+error/i | Failed |
| 439 | Step 1d: "Blank page: missing #gameContent element" (after regen attempt) | Same waitForPackages race condition; same smoke-regen dead code bug; second full regen produced blank page in pipeline CDN environment | Failed |
| 456 | Queued (not yet run) | Surgical smoke-regen fix (c4d24f2) now deployed; underlying gen prompt contradiction not yet fixed | Queued |

---

## 1. Root Cause

**Primary cause: Async race condition between `waitForPackages()` and `TimerComponent` registration.**

The CDN bundle `packages/components/index.js` registers components one-by-one, asynchronously. `ScreenLayout` is registered at +152ms, but `TimerComponent` is registered at +706ms — 554ms later. The game's `waitForPackages()` polls only for `typeof ScreenLayout !== 'undefined'`, so it resolves at ~152ms. The DOMContentLoaded init sequence then runs, reaches `new TimerComponent(...)` at +186ms, and crashes with `ReferenceError: TimerComponent is not defined`. The `transitionScreen` and the rest of the init chain never execute. The transition slot stays empty; tests cannot proceed.

**Contributing cause: Gen prompt contradiction about TimerComponent.**

Rule at line 85 of `prompts.js` states: "TimerComponent IS available in the CDN bundle, BUT it loads AFTER ScreenLayout. If you use it, you MUST add `|| typeof TimerComponent === 'undefined'` to the waitForPackages() while-loop condition." Rule at line 185 states: "NEVER use TimerComponent — it is not in the CDN bundle." The spec for visual-memory has `PART-006 | TimerComponent | YES`, so the LLM correctly uses `TimerComponent` but follows the contradicting guidance inconsistently — using it without adding the required typeof check to `waitForPackages()`.

**Compounding cause: Smoke-regen dead code (fixed by c4d24f2 on 2026-03-21).**

Before commit c4d24f2, `specMeta.isCdnGame` was never set by `extractSpecMetadata()`, so `if (specMeta.isCdnGame)` always evaluated false. Every smoke-regen used the full-regen path (38.5% repeat failure rate) rather than the surgical `buildSmokeRegenFixPrompt()`. This meant both builds 422 and 439 got a new full generation that reproduced the same underlying bug. This dead code is now fixed.

---

## 2. Evidence of Root Cause

**Console timeline from diagnostic (local machine, build 439 HTML):**
```
+152ms [log] [MathAI] ScreenLayoutComponent loaded
+152ms [log] [MathAIComponents] Loaded: ScreenLayout
+183ms [log] [ScreenLayout] Injected layout with slots: {progressSlot: ..., gameContent: gameContent}
+186ms [error] Init error: TimerComponent is not defined       ← crash HERE
+197ms [log] [MathAIComponents] Loaded: TransitionScreen
...
+706ms [log] [MathAIComponents] Loaded: TimerComponent        ← would have been ready 520ms later
+707ms [log] [MathAIComponents] All components loaded successfully
```

**DOM state at t=0ms (post-goto) for build 439 HTML:**
```json
{
  "gameContentExists": true,
  "gameContentChildren": 2,
  "initError": "TimerComponent is not defined",
  "screenLayoutDefined": true,
  "timerComponentDefined": true,
  "slotExists": true,
  "slotChildren": 0
}
```

- `#gameContent` has 2 children (template was cloned before crash at line 428-430) — game struct visible
- `#mathai-transition-slot` has 0 children — TransitionScreen never initialized (came after TimerComponent in init order)
- `window.__initError` = "TimerComponent is not defined" — confirmed catch block fired
- By t=0ms (`page.goto` completion), TimerComponent IS eventually defined (CDN finished) — but the game already crashed 520ms before it was ready

**DB error chain:**
- Build 422: `Step 1d: Page load failed after regeneration attempt: Initialization error: {"error": "TimerComponent is not defined", ...}` — the full regen LLM changed `console.error` text from "Init error: ..." to "Initialization error: ..." which was caught by `/initialization\s+error/i` smoke pattern on the second check
- Build 439: `Step 1d: Page load failed after regeneration attempt: Blank page: missing #gameContent element` — second full regen produced HTML that failed differently (blank page)

**Smoke pattern gap confirmed by unit test:**
```js
classifySmokeErrors(['Init error: TimerComponent is not defined'])
// -> [] (empty — NOT classified as fatal)
// Pattern /initialization\s+error/i does NOT match "Init error:"
```

**Screenshots saved:**
- `/tmp/visual-memory-debug/01-t0-loaded.png` — shows game template rendered, no start button visible (transition slot empty)
- `/tmp/visual-memory-debug/04-t20s-final.png` — same state at t=20s, confirming no recovery

---

## 3. POC Fix Verification

**Verification 1 — Race condition confirmed via inline timing test:**

```bash
node -e "
const { chromium } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
(async () => {
  const html = fs.readFileSync('/tmp/visual-memory-debug/index.html', 'utf-8');
  const server = http.createServer((req, res) => { res.writeHead(200, {'Content-Type': 'text/html'}); res.end(html); });
  server.listen(7780, async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await (await browser.newContext()).newPage();
    const t0 = Date.now();
    const timeline = [];
    page.on('console', m => timeline.push({ t: Date.now() - t0, type: m.type(), text: m.text() }));
    await page.goto('http://localhost:7780');
    const state = await page.evaluate(() => ({
      timerDefined: typeof TimerComponent !== 'undefined',
      initError: window.__initError
    }));
    console.log(state);
    timeline.forEach(e => console.log('+' + e.t + 'ms [' + e.type + '] ' + e.text));
    await browser.close(); server.close();
  });
})();
"
# Output proves: ScreenLayout defined at +152ms, TimerComponent crash at +186ms, TimerComponent ready at +706ms
```

**Verification 2 — Smoke pattern gap:**
```js
const { classifySmokeErrors } = require('./lib/pipeline-utils');
console.log(classifySmokeErrors(['Init error: TimerComponent is not defined']));
// -> [] — this error does NOT trigger smoke-regen
// The game passes smoke check even though init completely failed
```

**Required fix — gen prompt rule:**
The gen prompt at `lib/prompts.js` line 85 already has the right instruction:
> "If you use it [TimerComponent], you MUST add `|| typeof TimerComponent === 'undefined'` to the waitForPackages() while-loop condition"

The problem is line 185 directly contradicts this: "NEVER use TimerComponent — it is not in the CDN bundle."

The contradiction must be resolved. Both builds 422 and 439 generated HTML that used TimerComponent (as required by `PART-006=YES`) but did not add the typeof check.

**The correct waitForPackages for visual-memory:**
```js
async function waitForPackages() {
  const timeout = 10000; const interval = 50; let elapsed = 0;
  // PART-017=NO: check ScreenLayout. PART-006=YES: also check TimerComponent (loads after ScreenLayout)
  while (typeof ScreenLayout === 'undefined' || typeof TimerComponent === 'undefined') {
    if (elapsed >= timeout) { throw new Error('Packages failed to load within 10s'); }
    await new Promise(resolve => setTimeout(resolve, interval));
    elapsed += interval;
  }
}
```

This waits until BOTH ScreenLayout AND TimerComponent are registered, eliminating the race condition.

---

## 4. Reliability Reasoning

**Is the fix deterministic?** Yes. The race condition is consistent: ScreenLayout always registers at ~152ms, TimerComponent at ~706ms, and the init sequence crashes at ~186ms. Adding TimerComponent to the waitForPackages condition eliminates the race deterministically.

**What could cause regression?**
1. LLM ignores the updated gen prompt rule and generates waitForPackages checking only ScreenLayout again (probabilistic — depends on LLM attention to rule 85 vs rule 185)
2. CDN bundle changes that move TimerComponent earlier in the registration order (rare — external dependency)
3. If the game uses other late-loading components (e.g., StoriesComponent at +707ms) that are similarly missed

**What edge cases remain?**
- The smoke check does NOT detect `Init error: TimerComponent is not defined` as fatal. Even after fixing gen prompt, if a future build again has this bug, it will pass smoke and fail tests (no early-abort). This is a smoke pattern gap that should be addressed separately.
- The surgical smoke-regen prompt (`buildSmokeRegenFixPrompt`) at line 1182 only instructs the LLM to check ScreenLayout in waitForPackages, not TimerComponent. If smoke-regen fires for a visual-memory HTML, it will produce waitForPackages without the TimerComponent check.

**Gen prompt contradiction must be resolved before E2E:**
- Line 85: "TimerComponent IS available in CDN bundle" (correct per spec PART-006=YES)
- Line 185: "NEVER use TimerComponent — it is not in the CDN bundle" (incorrect for PART-006=YES games)
Line 185 must be updated to: "NEVER use TimerComponent unless spec explicitly sets PART-006=YES — it loads late in the CDN bundle and requires adding `|| typeof TimerComponent === 'undefined'` to waitForPackages()."

---

## 5. Go/No-Go for E2E

**Decision: NOT READY**

**What's blocking:**

1. **Gen prompt contradiction unresolved** — Line 185 of `prompts.js` says "NEVER use TimerComponent — it is not in the CDN bundle" which directly contradicts line 85. Until this contradiction is removed, the LLM will continue generating `waitForPackages()` that does not wait for TimerComponent. Build 456 is already queued; it will likely reproduce the same bug.

2. **Smoke-regen prompt gap** — `buildSmokeRegenFixPrompt()` at line 1182 only instructs checking ScreenLayout in waitForPackages, regardless of whether the HTML uses TimerComponent. If smoke-regen fires for visual-memory after a gen with the wrong waitForPackages, the surgical fix will not solve the TimerComponent race.

3. **Smoke pattern gap** — `Init error: TimerComponent is not defined` does not match `SMOKE_FATAL_PATTERNS`. If the gen produces HTML with this bug, it passes smoke, goes to tests, and wastes a full pipeline iteration. The pattern `/init\s+error/i` or `/timercomponent.*not\s+defined/i` should be added.

**What needs to happen before E2E:**
- [ ] Remove/reconcile the contradiction in `prompts.js` line 185: specify PART-006=YES games MUST use TimerComponent AND MUST add typeof check to waitForPackages
- [ ] Update `buildSmokeRegenFixPrompt()` to detect TimerComponent usage in failing HTML and include it in the waitForPackages typeof check instruction
- [ ] Add `Init error:` to `SMOKE_FATAL_PATTERNS` (or use `/init.*error/i`) so TimerComponent crash is caught early
- [ ] Run POC verification: edit build 456 HTML locally with the correct waitForPackages, confirm game reaches start screen via diagnostic

**Evidence completion:**
- Section 2 (Evidence): Complete — console timeline, DOM state, DB error chain, screenshot artifacts
- Section 3 (POC): Partially complete — race condition verified; fix in prompts.js not yet applied and verified end-to-end

---

## Manual Run Findings

Diagnostic run on: 2026-03-21, build 439 HTML (`/opt/ralph/data/games/visual-memory/builds/439/index.html`)

**What pipeline logs couldn't show:**
1. The exact millisecond timing: ScreenLayout ready at +152ms, crash at +186ms, TimerComponent ready at +706ms — pipeline only logged "Init error: TimerComponent is not defined" with no timing context
2. The contradiction: `#gameContent` has 2 children (template cloned successfully) BUT transition slot is empty — this means the game structure is in DOM but functionally dead. Pipeline only saw "blank page" or "Init error" with no nuance about which parts succeeded.
3. The smoke pattern gap: "Init error: TimerComponent is not defined" does NOT trigger smoke-regen in the current pipeline. Without local testing, this blind spot would not be visible from logs alone.
4. The gen prompt contradiction between line 85 and line 185 of `prompts.js` — the direct cause of why LLM generates TimerComponent usage without the required waitForPackages guard.

---

## Targeted Fix Summary

| Build | Fix Attempted | Result |
|-------|---------------|--------|
| 422 | Smoke-regen (dead code path — full regen ran instead of surgical) | Reproduced error with different phrasing; second smoke caught "Initialization error:" |
| 439 | Smoke-regen again (same dead code bug) | Produced HTML with blank page in pipeline CDN environment |
| c4d24f2 | Fixed smoke-regen dead code (specMeta.isCdnGame detection) | Deployed; surgical path now fires for CDN games |
| Pending | Fix gen prompt contradiction (line 85 vs 185); update smoke-regen prompt for TimerComponent; add Init error to SMOKE_FATAL_PATTERNS | Not yet implemented |
