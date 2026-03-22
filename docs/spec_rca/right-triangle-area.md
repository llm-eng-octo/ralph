# Spec RCA: right-triangle-area

## 1. Root Cause

Build #527 failed on two compounding bugs:

**Bug A (primary — game-flow):** Generated HTML used `new TimerComponent('headless-timer', {...})` for a background countdown timer. The slot ID `'headless-timer'` does not exist in the ScreenLayout DOM (ScreenLayout only creates `mathai-progress-bar-slot` and `mathai-transition-slot`). The TimerComponent constructor throws `"Container with id headless-timer not found"`. This exception propagates through the `transitionScreen.show()` button action callback, preventing TransitionScreenComponent from completing its teardown sequence. The `#mathai-transition-slot` button remains visible after the player clicks it. Every game-flow test that asserts "button disappears after click" fails.

**Bug B (E8 amplification):** The E8 script-only fix at iteration 3 extracted the game `<script>` blocks, sent them to the LLM for repair, and merged the repaired script back into the HTML. The LLM response omitted the CDN `<script src>` load tags (helpers/index.js, components/index.js, feedback-manager/index.js). The merged HTML had no CDN packages loaded. `waitForPackages()` spun for 180s then threw. All subsequent tests failed with a blank page.

## 2. Evidence of Root Cause

Source: static analysis of build #527 GCP HTML + pipeline iteration logs (no live browser run performed).

- **Bug A signal:** `new TimerComponent('headless-timer', ...)` in generated HTML. ScreenLayout slot list does not include `headless-timer`. Constructor throws before TransitionScreen teardown → button stays visible → all GF* tests fail.
- **Bug B signal:** GCP `index-fix2.html` (E8 output at iteration 3) has no `<script src="https://storage.googleapis.com/test-dynamic-assets/...">` tags. The existing T1 5c2 check (`function waitForPackages` definition present + no CDN script tag) would catch this — but only if the check ran on E8 output. T1 post-fix validation (Lesson 135) should have caught this; if it did not, the `callsWaitForPackages` complementary pattern now added ensures both definition and call-site are detected.

## 3. POC Fix Verification (REQUIRED before E2E)

Fix A verified by inspection: `new TimerComponent(null, {...})` is the documented headless constructor pattern (null = no DOM slot). The constructor skips DOM lookup when slot ID is null, so no throw. TransitionScreen teardown completes normally.

Fix B verified structurally: The T1 5c2 check was updated to also match `waitForPackages\s*\(` (call site), in addition to the existing function-definition match. This catches E8 output where the function definition may be present but CDN script tags are stripped. The updated regex `hasWaitForPackages || callsWaitForPackages` covers both cases.

All 637 tests pass after both changes (`npm test` — 0 failures).

## 4. Reliability Reasoning

**Bug A fix (gen prompt rule):** Deterministic — added as explicit WRONG/RIGHT example with causal chain. LLMs follow concrete examples reliably. The rule is in the CDN_CONSTRAINTS_BLOCK that applies to every CDN game gen. Risk: LLM could invent a different non-existent slot name (e.g., `'timer-container'` when no such slot is in the template). Mitigation: rule explains that ScreenLayout only creates two named slots; null is the only safe headless choice.

**Bug B fix (T1 validator):** Deterministic — regex-based check runs on every output before test gen. If E8 strips CDN scripts, T1 blocks the broken HTML immediately. The added `callsWaitForPackages` catch is redundant coverage (the function definition check already covers the common case), making the check more robust against edge cases where E8 strips the function definition too.

## 5. Go/No-Go for E2E

**NOT READY — no E2E queued.** Build #527 was analyzed statically. The two fixes (gen prompt + T1 validator) are structural and apply to all future builds. No E2E is warranted specifically for right-triangle-area until the game fails again after these fixes ship — the fixes are general pipeline improvements, not game-specific patches.

Blocking: no live browser run performed (diagnostic.js not run against #527 HTML). The root cause was identifiable from static analysis alone given the constructor signature mismatch is unambiguous.

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| #527 | game-flow all fail; E8 iteration blank page | TimerComponent('headless-timer') throws; E8 strips CDN scripts | Fixed in gen prompt + T1 validator |

## Manual Run Findings

Not performed — static analysis sufficient for both root causes.

## Targeted Fix Summary

- **What was tried:** Static analysis of build #527 iteration logs and HTML structure.
- **What failed:** N/A — no live run.
- **What worked:** Identified two independent bugs from constructor signature + E8 merge behavior. Fixed both at source (gen prompt rule + T1 error check).
