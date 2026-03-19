# Ralph Pipeline — Lessons Learned

Accumulated insights from build failures, bug fixes, and proofs. Update immediately after every notable build or bug fix.

## Build Proofs

| Build | Game | Result | Score | Notes |
|-------|------|--------|-------|-------|
| 204 | doubles | APPROVED | 6/7 | game-flow: 2/3, mechanics: 2/2, level-progression: 1/1, contract: 1/1. Review APPROVED first pass. |
| 208 | doubles | APPROVED | 10/10 | 0 fix iterations — all passing on iteration 1 |
| 211 | right-triangle-area | APPROVED | 7/11 (64%) | Sequential batch ordering issue; game-flow: 0/3, mechanics: 4/4, level-progression: 1/1, edge-cases: 2/3, contract: 0/2 |
| 212 | doubles | APPROVED | 10/10 | Zero review rejections; game-flow: 3/3, mechanics: 3/3, level-progression: 2/2, contract: 2/2 |

## Pipeline Fix Lessons

1. **extractHtml** returns entire LLM output when `<!DOCTYPE` appears anywhere. Fixed to slice from first DOCTYPE position (LLMs sometimes add analysis text before the HTML).
2. **Re-clicking `.correct` cells** times out in Playwright — CSS `pointer-events: none`. Use `{ force: true }` for re-click tests. Fix prompt includes rule; post-gen fixup patches it automatically.
3. **0/0 test results** = page broken by last fix. Restored best HTML immediately, skip triage.
4. **`game_over` phase** — game sets `gameState.phase = 'game_over'` (underscore) but tests expect `'gameover'`. Harness normalizes automatically.
5. **Local `endGame` function** — CDN games define `endGame` inside DOMContentLoaded, not on `window`. Fix prompt now requires `window.endGame = endGame` exposure.
6. **Triage `window.__ralph undefined`** — `TypeError: Cannot read properties of undefined (reading 'setLives')` means `window.__ralph` itself is undefined → page has JS error → `fix_html`, NOT `skip_test`. Added KNOWN HTML BUGS section to triage prompt.
7. **Stale BullMQ job replay** — after SIGKILL, active jobs replay on worker restart. Always fail stale DB builds and obliterate queue before requeuing.
8. **gameState.phase** — must be set at every state transition: `'playing'`, `'transition'`, `'gameover'`, `'results'`. Added as gen prompt rule 15 and fix prompt CDN constraint.
9. **Early review** — now checks full spec verification checklist (not just 5 items). Catches endGame guard, signalPayload, 100dvh, etc. before test generation.
10. **MAX_REVIEW_FIX_ATTEMPTS = 3** — increased from 2. Review fix prompt: "Fix ALL issues in ONE pass. Do NOT change anything not mentioned."
11. **PROOF: doubles game APPROVED** — build 204 (2026-03-19). game-flow: 2/3, mechanics: 2/2, level-progression: 1/1, contract: 1/1. Review APPROVED first pass.
12. **Playwright cwd fix** — Playwright must be run with `cwd: gameDir` and relative spec paths (not absolute). Absolute paths fail silently: 0/0 results + "test.beforeEach() not expected here" error because Playwright can't match absolute paths to testDir-scanned files.
13. **Warehouse HTML must have 100dvh + correct gameover phase** — when pipeline overwrites warehouse with approved build, any manual fixes (100dvh CSS, `setPhase('gameover')` in handleGameOver) are lost. Re-apply after each warehouse update.
14. **gemini-3.1-pro-preview** — correct proxy model name for review step (not `gemini-2.5-pro-preview`). Check `curl -H "Authorization: Bearer $PROXY_KEY" http://localhost:8317/v1/models` for valid names.
15. **PROOF: doubles APPROVED with 0 fix iterations** — build 208 (2026-03-19). game-flow: 3/3, mechanics: 2/2, level-progression: 1/1, edge-cases: 2/4 (2 skipped), contract: 2/2. All passing on iteration 1.
16. **Review model catches async/signalPayload/sound patterns** — build 212 (doubles warehouse): rejected for (a) missing `async` on `handleGameOver`/`endGame`, (b) manual `signals:`/`metadata:` props instead of `...signalPayload` spread (omits `events`), (c) `sound.play().catch()` instead of `await sound.play()`. One review-fix pass → APPROVED. These are recurring issues in warehouse HTML.
17. **Contract `metrics.stars` unfixable by fix loop** — build 212: 3 iterations, still wrong formula. Pipeline APPROVED anyway (8/9). Root cause: triage says "use livesRemaining directly" but LLM keeps guessing. Spec's star formula must be quoted verbatim in triage context to work.
18. **Sequential batch processing wastes fix iterations** — build 211 (right-triangle-area): game-flow maxed at 0/3 because init fix hadn't happened yet. Mechanics fix (iter 2) fixed the init issue that would have fixed game-flow too, but game-flow was already done. Contract also 0/2. Final score: 7/11 (64%) → APPROVED. A "final re-test" step after all batches would give a more accurate score.
19. **Step 3b extended to re-test ALL batches (not just zero-score)** — Previously Step 3b only re-tested batches with 0 passes. This missed cross-batch regressions where a later fix degraded an earlier batch from 1-2 passes down to 0. Now Step 3b re-tests every batch with any recorded result and diffs prevPassed/prevFailed against new results to update totalPassed/totalFailed correctly. This gives an accurate final score and catches both improvements (zero-score batches fixed) and regressions (previously-passing batches broken by later fixes).
20. **PROOF: right-triangle-area APPROVED** — build 211 (2026-03-19). Fresh e2e, no warehouse HTML. game-flow: 0/3 (batch ordering issue), mechanics: 4/4 ✅, level-progression: 1/1 ✅, edge-cases: 2/3 ✅, contract: 0/2 (postMessage timing). 7/11 = 64% → Review APPROVED.
21. **signalPayload T1 check fires immediately** — build 211+212 both caught ...signalPayload non-spread at Step 1b static validation. Static-fix (claude-sonnet-4-6) fixed it before tests even ran. This is the correct defense-in-depth approach.
22. **Spec scoring context in fix prompt fixed stars on first try** — build 212 (doubles): contract "Star Rating Logic" fixed by fix-contract-1 on iter 1. The spec scoring section in the fix prompt gave the LLM the exact formula. Previously this failed all 3 iterations (build 209 lesson 17).
23. **PROOF: doubles APPROVED 10/10** — build 212 (2026-03-20). game-flow: 3/3, mechanics: 3/3, level-progression: 2/2, contract: 2/2. APPROVED first review pass. Zero review rejections.
24. **BUG (fixed): early-review-2 was reviewing stale pre-fix HTML** — `earlyReviewPrompt` captured `fs.readFileSync(htmlFile)` once at construction time. When `early-review-2` reran after `early-review-fix`, it sent the ORIGINAL broken HTML to Gemini, not the fixed one. This caused every early-review-fix to fail the second review regardless of whether the fix was correct. Fixed by reconstructing the prompt fresh for early-review-2. Build 213 was REJECTED due to this bug; build 214 confirmed the fix.
25. **Warehouse prebuilt HTML causes generation bypass** — If `warehouse/templates/<gameId>/game/index.html` exists, worker.js copies it to every new build dir, and pipeline.js skips HTML generation entirely (`index.html exists`). For games that have never been approved, a stale/broken warehouse HTML causes every build to reuse the broken file. Delete the warehouse HTML before queuing fresh e2e builds for unproven games.
26. **Fix LLM CDN URL hallucination causes 0/2 regressions** — When the fix LLM rewrites HTML, it often "corrects" CDN script URLs from `cdn.homeworkapp.ai` (correct) to `cdn.mathai.ai` (wrong — 404s). This makes ALL CDN scripts fail to load, producing a blank page and all tests failing `toBeVisible`. Also: when fixing restart, it removes `gameState.isActive=true; syncDOMState()` from DOMContentLoaded as collateral damage. Both patterns added to CRITICAL CDN CONSTRAINTS in fix prompt.

---

**INSTRUCTIONS FOR MAINTAINING LESSONS:** Always update this file after every notable build outcome or pipeline bug fix. Add lesson immediately when: a new pipeline bug is found and fixed, a build proves or disproves a hypothesis, a new failure pattern is discovered, or any hard-won insight that would help avoid repeating a mistake. Never let insights live only in conversation memory.
