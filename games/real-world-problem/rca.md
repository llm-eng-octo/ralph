# real-world-problem — Per-Spec RCA

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| #563 | level-progression 0/1, edge-cases 0/2 | HTML bug: step-panel state not reset between rounds; answer input prematurely visible | Failed — superseded by #564 |
| #564 | mechanics 5/6, level-progression 0/1 (iter=1) | Fixed mechanics + level-progression in iter=2; level-progression panel bug fixed | **APPROVED** (iter=2, 2026-03-22) |
| #565 | level-progression 0/1 (3 iters + 2 global iters), edge-cases 2/3, cross-batch regressions from per-batch fixes | Same step-panel reset bug. Global fix 2 achieved 11→12/14 passing. level-progression 0/1 persists (panel not hidden between rounds). Review approved 12/14. | **APPROVED** (global-fix-2, 2026-03-22) |

---

## 1. Root Cause (Build #564 — APPROVED)

**Two separate bugs in same HTML:**

1. **Level-progression bug:** Game failed to hide step 3 panel from previous round when starting a new round. `gameState.phase` not reset to `step1` at round start → `syncDOMState()` left step3 panel visible.

2. **Mechanics bug (iter=1):** Mechanics tests passed 5/6 at iter=1 — one test checking step-panel visibility on answer submission.

**Fix:** iter=2 fix addressed both. Build approved.

---

## 2. Evidence of Root Cause (Build #565)

**Cross-batch regression pattern (new):**

Both edge-cases and contract per-batch fixes regressed mechanics from 6/6 → 5/6. Pipeline cross-batch guard correctly detected and rolled back both. Pattern:

- edge-cases fix: modified panel visibility logic → mechanics "step 3 not shown until answer submitted" test broke (5/6)
- contract fix: same regression (different fix, same conflict)

**Root cause of regression:** The level-progression bug (step 3 panel not hiding between rounds) and the mechanics test (step 3 only shows after answer submit) are checking the SAME panel element. Per-batch fixes that address edge-cases or contract logic touch the panel reset path and inadvertently break the mechanics timing invariant.

**Lesson logged:** Global fix loop is the correct tool when per-batch fixes produce cross-batch regressions — it sees all failing tests simultaneously and avoids the tunnel vision of per-batch repair.

---

## 3. POC Fix Verification (Build #565)

Global fix loop (Step 3c, iter 1/2) started at 23:27 UTC 2026-03-22. Seeing all failing tests: level-progression (0/1), edge-cases (1/3 before rollback). Will attempt holistic fix.

---

## 4. Reliability Reasoning

real-world-problem is the most complex trig game (L4 Bloom, step-based multi-part interaction). The step-panel state machine has 3 phases (step1 → step2 → step3 → results) plus round reset. The intersection of:
- round reset (level-progression)
- step advancement timing (mechanics)
- edge case handling (edge-cases)
- postMessage on both end paths (contract)

...means fixes to any one dimension can conflict with others. This game requires holistic HTML fixes rather than per-batch repair.

---

## 5. Go/No-Go

**#564: APPROVED** — first L4 Bloom game approved. Session Planner L4 cap lifted.

**#565: APPROVED** — 12/14 passing (global-fix-2). level-progression panel reset bug persists (step 3 panel not hidden between rounds). Review model approved because game-flow/mechanics/contract all PASS. Worker restarted → new gen rules (GEN-PM-001, GEN-RESTART-001, GEN-PHASE-001, GEN-GAMEID, GEN-WINDOW-EXPOSE) now active for next queued build. GEN-STEP-001 identified as next Gen Quality rule to prevent the level-progression panel reset pattern.

---

## Manual Run Findings

No local diagnostic run for #565 (build still running). #564 was diagnosed via GCP HTML download + diagnostic.js: step3 panel visible at round start due to missing phase reset in `startRound()`.

## Targeted Fix Summary

**#564 iter=2:** Gemini fix added `gameState.phase = 'step1'; syncDOMState();` at `startRound()` entry. Fixed both level-progression (round state reset) and mechanics (panel visibility timing). Approved.

**#565 cross-batch:** Per-batch fixes regressed mechanics → pipeline rolled back → global fix loop now active.
