# stats-identify-class — Root Cause Analysis

---

## Build #566 — REJECTED (early-review, twice)

**Date:** 2026-03-23
**Outcome:** Rejected at Step 1c (early-review) — never reached test generation

---

### Root Cause Summary

Three independent T1/T2 failures caused the early-review rejection. None are spec-level issues — all are gen rule / prompt gaps.

---

### Failure 1 (T1 ERROR): CSS Stylesheet Stripped — PART-028-CSS-STRIPPED

**Evidence:**
```
✗ ERROR [PART-028-CSS-STRIPPED]: CSS stylesheet block exists but contains only comments —
  entire stylesheet was stripped. This is always a bug in targeted fixes.
  WRONG: replacing <style> with /* CSS preserved */. RIGHT: leave <style>...</style> unchanged.
```

The HTML `<style>` block on line 19-21 contains only:
```html
<style>
/* [CSS stripped — 57 chars, not relevant to JS fix] */
</style>
```

**What happened:** During a targeted fix iteration (within a previous pipeline cycle or the gen itself), the LLM replaced the full CSS block with a placeholder comment. The game rendered with no styling — blank layout, no colors, no button styling.

**Impact:** P0 — game is visually broken. All layout tests would fail.

**Fix needed:** Gen prompt already has GEN-PART-028-CSS-STRIPPED rule (T1 ERROR fires). The T1 check IS catching it correctly. The issue is that the generator produced stripped CSS in iter=0 — the LLM stripped CSS when writing the initial HTML (not just in fix loop). The gen prompt needs to explicitly forbid CSS placeholder comments in initial generation, not just fix loop.

---

### Failure 2 (T1 ERROR): Missing `...signalPayload` Spread in postMessage

**Evidence:**
```
✗ MISSING: ...signalPayload spread in postMessage — signalCollector detected but endGame
  postMessage must use ...signalPayload (not manual signals:/metadata: props)
```

**What happened:** The LLM used a flat hand-coded postMessage payload:
```javascript
window.parent.postMessage({
    type: 'game_complete',
    gameId: gameState.gameId,
    score: gameState.score,
    stars: stars,
    firstAttemptAccuracy: Math.round(accuracy),
    roundsCompleted: gameState.currentRound,
    livesRemaining: gameState.lives,
    isVictory: outcome === 'victory',
    duration: Date.now() - gameState.startTime,
    attempts: gameState.attempts,
    events: gameState.events
}, '*');
```

The required pattern is:
```javascript
const signalPayload = signalCollector.getPayload();
window.parent.postMessage({
    type: 'game_complete',
    data: { metrics: {...}, attempts: gameState.attempts, ...signalPayload, completedAt: Date.now() }
}, '*');
```

**Impact:** P0 — contract tests check `data.metrics.stars`, `data.events`, etc. The flat payload fails contract validation entirely.

**Fix needed:** Gen rule needs to show the correct `...signalPayload` pattern explicitly. This is also caught by T2 contract validation (see Failure 3 below — they are related).

---

### Failure 3 (T2 CONTRACT): game_complete postMessage Flat Payload Structure

**Evidence:**
```
✗ CONTRACT: game_complete postMessage uses flat payload structure — contract tests check
  data.metrics.stars, data.events etc. Use:
  postMessage({ type: "game_complete", data: { metrics, attempts, ...signalPayload, completedAt } }, "*")
```

**What happened:** Same root cause as Failure 2 — the flat payload `{ type, gameId, score, stars, ... }` fails the contract test which expects the `data: { metrics: {...}, ...signalPayload }` nested structure.

**Impact:** Contract tests 0/N pass. Combined with Failure 2, this is the same postMessage bug from two different validators.

---

### Failure 4 (T1 WARNING): No 480px / max-width Constraint

**Evidence:**
```
✗ MISSING: No 480px or max-width constraint found (required for mobile-first responsive layout)
```

**What happened:** The CSS was stripped (Failure 1), so no max-width or 480px constraint exists in the stylesheet. This is a downstream consequence of the CSS strip. If CSS were intact, the max-width rule may have been present (the spec references PART-021 Screen Layout CSS which normally includes this). However, the gen also has a history of omitting this independently.

**Impact:** LOW — no hard test failure from this alone; it's a responsive layout warning. But the T1 check counts it as an error.

---

### Failure 5 (T1 WARNING): game_over Phase — No Star/Rating Display Element

**Evidence:**
```
WARNING: game_over phase set but no star/rating display element found — game-over screen must
show star ratings (e.g. ☆☆☆ for 0 stars). Review model rejects blank game-over screens.
```

**What happened:** The game_over TransitionScreen call at line 389-399 shows a "Game Over" overlay, but the template does not include a static star-rating display element visible during the game_over phase for the contract/UI check. This is a generator omission.

**Impact:** MED — reviewer model check for blank game-over screen. Not a hard T1 error, but a WARNING that caused early-review rejection criteria to trigger.

---

### Why It Was Rejected Twice — Pipeline Mechanics

**Step 1b** (static + contract validation) runs BEFORE early-review. The GCP HTML file at `/566/index.html` is the post-fix HTML (after the early-review-fix attempt). The pipeline flow was:

1. **Step 1b**: T1 static + contract validation on original generated HTML
2. If T1 passes / contract auto-fix attempted → continue
3. **Step 1c early-review-1**: LLM (Gemini) reviews HTML vs spec → **REJECTED** (flat postMessage payload, missing responsive layout, other spec violations visible without CSS context)
4. **early-review-fix**: Claude attempts repair → introduces CSS strip placeholder (rewrites `<style>` as `/* CSS stripped — 57 chars... */`)
5. **Step 1c early-review-2**: LLM re-reviews fixed HTML → **REJECTED** again (CSS now stripped, postMessage still broken)
6. `report.status = 'REJECTED'` set → build terminates before test generation

**Key insight — CSS strip root cause:** `buildEarlyReviewFixPrompt()` in `lib/prompts.js` calls `stripCssFromHtml(currentHtml)` (line 1734) before passing the HTML to the fix LLM. The stripped HTML has `/* [CSS stripped — 57 chars, not relevant to JS fix] */` in the `<style>` block. The fix LLM (Claude) writes back the "fixed" HTML preserving this comment — it has no way to know the CSS was stripped by the pipeline utility rather than by a previous LLM. The `GEN FIX-001 (PRESERVE CSS)` rule in the fix prompt does warn against this pattern, but the LLM receives the already-stripped HTML and treats the comment as the real content.

**Pipeline bug (CR candidate):** `buildEarlyReviewFixPrompt()` strips CSS before passing to Claude, but `injectHarnessToFile()` is called AFTER the fix (line 1013), not before. The stripped CSS placeholder ends up written to disk and the T1 check fires on it.

The postMessage flat-payload was already present in the original generation (the LLM did not follow GEN-PM-001's `data: { metrics, ...signalPayload }` example), and the early-review-fix did not correct it either — because the early-review fix prompt says "Fix ONLY the specific violations listed. Make the smallest possible change" and the reviewer may not have flagged the postMessage structure if the early-review prompt omitted it.

---

### Is This a Spec Issue or Gen Rule Gap?

**Not a spec issue.** The spec correctly specifies:
- PART-008 PostMessage Protocol (YES) — spec is correct
- PART-028 InputSchema Patterns (YES) — spec is correct
- PART-020/021 CSS Variables & Layout (YES) — spec is correct
- SignalCollector is referenced in the standard PART-007/PART-008 boilerplate

The spec does NOT contain the `...signalPayload` call pattern explicitly in Section 3 — this is expected to come from the gen prompt's PART-008 rule. The failure is that the gen prompt's PART-008 example either wasn't followed or the example itself uses the old flat payload pattern.

**Gen rule gaps identified:**
1. PART-008 postMessage example in `lib/prompts.js` may show the old flat payload — needs `data: { metrics, ...signalPayload, completedAt }` nested pattern
2. CSS strip prevention is only enforced for fix-loop, not initial generation
3. The `...signalPayload` T1 check is firing correctly — the gen prompt needs a stronger positive example

---

### Re-Queue Verdict

**NOT safe to re-queue immediately.** Must fix first.

**Required fixes before re-queue:**

1. **Verify PART-008 example in `lib/prompts.js`** — check `buildGenerationPrompt()` for the `game_complete` postMessage example. If it shows a flat payload (no `data: { metrics, ...signalPayload }`), update it. This is the highest-priority fix — it's the contract failure.

2. **Add CSS anti-strip guard to initial gen** — add a rule: "Never write `/* CSS preserved */` or placeholder comments in `<style>` blocks. Write full CSS. This applies to initial generation, not just fix loop."

3. **Verify the spec's Section 5 (PART-008 block)** explicitly shows `...signalPayload` spread pattern — if the spec has the old flat pattern, update it.

4. **Local verify** — after fixing `lib/prompts.js`, download the GCP HTML, run `node diagnostic.js`, confirm T1/T2 pass before re-queuing.

---

### Build Timeline

| Step | Result |
|------|--------|
| Build #566 queued | 2026-03-23 |
| iter=0 HTML gen | Completed — CSS stripped, flat postMessage |
| Early-review #1 | REJECTED — T1: CSS stripped + missing signalPayload; T2: flat payload |
| Early-review #2 | REJECTED — same issues (no fix deployed between attempts) |
| Final status | REJECTED |

---

### Next Action

1. Read `lib/prompts.js` — find `buildGenerationPrompt()` PART-008 section
2. Check the `game_complete` postMessage example: should be `data: { metrics: { stars, score, ... }, attempts, ...signalPayload, completedAt }`
3. If flat → update to nested pattern → deploy → re-queue
4. Also add CSS-strip prevention to the gen prompt (not just fix loop)
