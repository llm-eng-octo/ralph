# UI/UX Audit — stats-mean-direct

**Audit date:** 2026-03-23
**Auditor:** UI/UX Slot (mandatory active slot — CLAUDE.md Rule 16)
**Audit type:** Spec-only — no approved build exists (0 builds in DB)
**Spec:** games/stats-mean-direct/spec.md (1128 lines, v1)

---

## Summary

Spec-only audit. No HTML available for browser playthrough — static spec analysis only.

Game profile: MCQ mean-computation, 3 lives, 45s countdown timer per round, 4-option buttons (`.option-btn`) dynamically generated in `loadQuestion()`. Uses PART-019 results screen (custom `#results-screen` div, not TransitionScreen) for victory — game-over handled via `transitionScreen.show('game_over')`. Also uses TimerComponent (PART-006), ProgressBarComponent (PART-023), VisibilityTracker (PART-005), Sentry (PART-030). All major gen rules were pre-applied to this spec at write time.

**No P0 blockers.** FeedbackManager.init() absent (PASS). No alert()/confirm()/prompt() (PASS).

**2 findings (1d, 1 low).** Exceptionally clean spec — all major gen rules pre-applied. No failures on: gameState.gameId first field, syncDOMState/data-phase full machine, window.endGame/restartGame assignments, ARIA live region, ProgressBar slotId, game_complete on both paths, results-screen position:fixed, option-btn min-height, timer destroy+recreate on restart.

---

## Mandatory Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | CSS stylesheet intact | N/A | Spec-only — no HTML build |
| 2 | FeedbackManager.init() ABSENT | PASS | Explicitly forbidden in CRITICAL notes and Anti-Pattern #1. Uses `.sound()` and `.playDynamicFeedback()` only. |
| 3 | alert()/confirm()/prompt() absent | PASS | Not mentioned anywhere in spec |
| 4 | window.endGame assigned at DOMContentLoaded end | PASS | Section 9 explicitly: `window.endGame = endGame; window.restartGame = restartGame` at bottom of DOMContentLoaded. `window.loadQuestion` also assigned for test harness `__ralph.jumpToRound()`. |
| 5 | data-phase transitions + syncDOMState() at EVERY phase change | PASS | Section 6 full state machine with syncDOMState() defined (4 data attributes: phase, lives, score, round). All 5 transitions explicit: page load, startGame(), endGame(true), endGame(false), life-lost. |
| 6 | Enter key handler (text input games only) | N/A | MCQ tap game — no text input |
| 7 | ProgressBar: options object with slotId: 'mathai-progress-slot' | PASS | Section 13: `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 9, totalLives: 3 })` — exact required key present |
| 8 | aria-live="polite" role="status" on ALL dynamic feedback elements | PASS | Section 5 HTML: `<div id="answer-feedback" class="answer-feedback hidden" aria-live="polite" role="status" data-testid="answer-feedback">`. Section 5 key rules reinforce this. |
| 9 | SignalCollector constructor args: sessionId, studentId, templateId | N/A | This game does not use SignalCollector. PART-010 is "Event Tracking" — events pushed to `gameState.events[]` array. No SignalCollector instantiation anywhere. |
| 10 | gameState.gameId field as FIRST field | PASS | Section 3 first line: `gameId: 'stats-mean-direct'` with comment "MANDATORY FIRST FIELD" |
| 11 | Results screen position:fixed with z-index≥100 | PASS | Section 10 CSS explicitly: `#results-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; ... }`. Also noted in Section 5 HTML comment and Anti-Pattern #12. |
| 12 | ALL interactive buttons min-height:44px (incl. .option-btn) | PASS | Section 10 CSS: `.option-btn { min-height: 52px; ... }` — exceeds 44px minimum |
| 13 | Sentry SDK v10.23.0 three-script pattern | FAIL (low) | PART-030 listed in Parts table but no version pinning, no `initSentry()` call, no three-script pattern shown in spec |
| 14 | game_complete postMessage on BOTH victory AND game-over paths | PASS | Section 9 endGame() sends `{ type: 'game_complete', ... }` on both paths (single `window.parent.postMessage` call before branching to show victory/game_over screen). Section 11 confirms `type: 'game_complete'` required and lists all payload fields. |
| 15 | restartGame() resets ALL gameState fields; timer games destroy+recreate TimerComponent | PASS | Section 7.7 restartGame(): `timer.destroy(); timer = null; timer = new TimerComponent(...)` then `startGame()`. startGame() resets all gameState fields (lives, score, currentRound, correctAnswers, incorrectAnswers, attempts, events, gameEnded, isProcessing). Section 7.8 notes: "Timer is created once in DOMContentLoaded, then destroyed + recreated in restartGame()." |
| 16 | waitForPackages() only awaits packages the game actually instantiates | PASS | PART-003 requires: ScreenLayout, TransitionScreenComponent, ProgressBarComponent, TimerComponent, FeedbackManager — all five are instantiated or called in the game |

---

## Findings

### F1 — window.gameState double-assignment: module scope AND DOMContentLoaded end [type-d] [LOW]

**Pattern:** window.gameState assigned at both module scope and inside DOMContentLoaded
**Description:** Section 3 (module scope) correctly sets `window.gameState = gameState` immediately after the gameState declaration — per Anti-Pattern #2 ("Do NOT assign window.gameState inside DOMContentLoaded"). However, Section 9 DOMContentLoaded bottom also includes `window.gameState = gameState` in the window assignments block. The double-assignment is harmless (both point to the same object reference) but contradicts Anti-Pattern #2 and may confuse the LLM into generating both assignments. If the LLM drops the module-scope assignment but keeps the DOMContentLoaded one, `window.gameState` will be undefined until DOMContentLoaded fires — causing `waitForPhase()` timeouts in tests that check `window.gameState` before DOM is ready.
**Severity:** LOW — double-assignment is safe; single-path risk only if LLM drops the module-scope one
**Action:** Spec clarification. Annotate Section 9 window assignments: `// window.gameState already set at module scope above — this line is redundant but harmless`. Alternatively, remove it from the DOMContentLoaded block entirely and add a comment explaining why.

---

### F2 — Sentry SDK v10.23.0 three-script pattern absent from spec [type-d] [LOW]

**Pattern:** Sentry version + three-script initialization not specified
**Instance count:** 9th confirmed across all audited games
**Description:** PART-030 (Sentry Error Tracking) is listed in the Parts table as YES, but the spec contains no version pin, no three-script CDN pattern, and no `initSentry()` call. The LLM generating HTML may omit Sentry entirely, or use an outdated version.
**Severity:** LOW — does not affect gameplay or test pass rates; monitoring gap only
**Action:** Warehouse template gap — no spec addition required here. The pipeline warehouse template should include the Sentry block. No new gen rule needed (existing low-priority ROADMAP item). Note: same finding on 8 prior games — consistently low priority.

---

## Routing Table

| Finding | Classification | Destination | Action |
|---------|---------------|-------------|--------|
| F1 — window.gameState double-assignment | (d) spec clarification | Education | Annotate Section 9 to clarify redundancy; prevent LLM confusion |
| F2 — Sentry three-script pattern absent | (d) warehouse gap | Gen Quality | Existing low-priority ROADMAP item — no new action |

---

## Positive Observations

- FeedbackManager.init() explicitly forbidden with detailed rationale — no audio popup risk.
- No alert()/confirm()/prompt() in any interaction path.
- gameState.gameId is FIRST field with explicit comment — pipeline contract check will pass.
- Full syncDOMState() defined with all 4 attributes (phase, lives, score, round). Called at every phase transition — spec diagram shows all 5 callsites.
- window.endGame, window.restartGame, window.loadQuestion all assigned at DOMContentLoaded end. window.loadQuestion enables `__ralph.jumpToRound()` for targeted test scenarios.
- ProgressBar slotId: 'mathai-progress-slot' explicitly set — CDN slot injection will work.
- ARIA live region on answer-feedback div with both `aria-live="polite"` AND `role="status"` AND `data-testid="answer-feedback"` — ARIA-001 + test harness both satisfied.
- Results screen position:fixed with z-index:100 explicitly in CSS — GEN-UX-001 pre-applied.
- option-btn min-height:52px — exceeds 44px minimum; GEN-UX-002 pre-applied.
- timer.destroy() + recreate in restartGame() correctly specified with rationale — timer restart bug pre-empted.
- game_complete on BOTH victory AND game-over paths via single endGame() call — no dual-path divergence risk.
- postMessage type is 'game_complete' (not 'game_end') — confirmed in both Section 9 and Section 11.
- isProcessing guard specified with correct reset in setTimeout callback before advanceGame() — double-submit prevention pre-applied.
- 15 Anti-Pattern items in PART-026 checklist — comprehensive self-review guide for LLM.
- 15 test scenarios in Section 14 covering all game-flow, mechanics, state-sync, and contract categories.
- Fallback content: 9 well-formed rounds with distinct difficulty tiers, all schema fields present, all misconception tags valid.
- NCERT research sources cited inline — pedagogical design is grounded.

---

## Pre-Build Checklist (before queuing first build)

- [ ] Section 9 / Section 3: Clarify window.gameState double-assignment (F1) — annotate or remove from DOMContentLoaded block

No other pre-build spec fixes required. This spec is the cleanest audited to date — all major gen rule requirements pre-applied.
