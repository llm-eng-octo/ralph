# UI/UX Audit — stats-median (Middle Ground)

**Date:** 2026-03-23
**Game:** stats-median — Middle Ground
**Build:** spec-only (no build in DB)
**Auditor:** UI/UX Slot

---

## Findings Table

| Priority | ID | Issue | Classification | Status |
|----------|----|-------|----------------|--------|
| PASS | F0a | GEN-WINDOW-EXPOSE: window.endGame + window.restartGame assigned in DOMContentLoaded | (a) gen rule | PASS — lines 892-895 assign both + window.loadQuestion for jumpToRound() |
| PASS | F0b | GEN-GAMEID: gameState.gameId as FIRST field in object literal | (a) gen rule | PASS — line 85, with CRITICAL comment on line 84 |
| PASS | F0c | GEN-PHASE-001: data-phase/syncDOMState 4-phase state machine | (a) gen rule | PASS — full 4-phase machine (start/playing/results/game_over); syncDOMState() called on all transitions including life-lost path |
| PASS | F0d | ARIA-001: feedback divs have aria-live="polite" + role="status" | (a) gen rule | PASS — #answer-feedback has both attributes in HTML structure (Section 5, lines 491-497) and anti-pattern checklist item 6 |
| PASS | F0e | GEN-MOBILE-RESULTS: results-screen position:fixed z-index≥100 | (a) gen rule | PASS — Section 10 CSS: position:fixed; top:0; left:0; width:100%; height:100%; z-index:100 with explicit MANDATORY comment |
| PASS | F0f | GEN-TOUCH-TARGET: interactive buttons min-height:44px min-width:44px | (a) gen rule | PASS — .option-btn: min-height:52px, min-width:44px in Section 10 CSS |
| PASS | F0g | GEN-UX-003 ProgressBar slotId | (a) gen rule | PASS — Section 13: new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 9, totalLives: 3 }) with MANDATORY annotation |
| LOW | F1 | GEN-UX-005 SignalCollector: not instantiated anywhere in spec | (a) gen rule | FAIL — SignalCollector is absent from the entire spec (no import, no instantiation, no config). 8th confirmed instance of this omission. GEN-UX-005 is already shipped; spec does not reinforce it. Low risk: gen prompt rule is already active. |
| PASS | F0h | No FeedbackManager.init(): PART-017=NO and init() absent | (a) gen rule | PASS — PART-017=NO, DO NOT CALL warning in header and Section 15 anti-pattern checklist item 1 |
| PASS | F0i | game_complete on BOTH paths: victory AND game_over | (a) gen rule | PASS — endGame(isVictory) sends type:'game_complete' on both paths; Section 11 documents the contract; Section 15 anti-pattern item 11 |
| PASS | F0j | timer.destroy() + recreate in restartGame() | (a) gen rule | PASS — restartGame() pseudocode (Section 7.7) explicitly calls timer.destroy(); timer=null; timer=new TimerComponent(...) before startGame(). Anti-pattern checklist item 7. |
| PASS | F0k | GEN-112: progressBar.update() args | (a) gen rule | PASS — spec uses progressBar.setRound(roundNumber) throughout (correct CDN API per GEN-112). progressBar.loseLife() used for life decrements. No .update() calls present. |
| LOW | F2 | Sentry three-script v10 pattern absent | (d) low severity | FAIL — PART-030=YES but no initSentry() pseudocode, no three-script v10 pattern, no Sentry script tags in Section 5 HTML structure. 10th confirmed instance of warehouse gap. Low severity — same gap exists in all prior specs; pipeline handles Sentry separately. |
| LOW | F3 | window.gameState double-assignment (module scope + DOMContentLoaded comment) | (d) low severity | NOTE — window.gameState = gameState appears at module scope (line 114, correct) and again referenced in the DOMContentLoaded comment block (line 895: "window.gameState = gameState // also set at module scope above"). Anti-pattern #2 says NOT inside DOMContentLoaded. The line 895 assignment is inside DOMContentLoaded — contradicts anti-pattern #2. Same low-risk ambiguity as stats-mean-direct. Spec clarification would eliminate the ambiguity for the LLM. |

---

## Summary

**Total findings: 3 actionable (1a, 0b, 0c, 2d-low)**

| Category | Count | Description |
|----------|-------|-------------|
| (a) gen rule — shipped rules missing from spec | 1 | F1: SignalCollector not specified (GEN-UX-005 already shipped) |
| (b) spec addition | 0 | — |
| (c) CDN constraint | 0 | — |
| (d) low severity | 2 | F2: Sentry three-script absent (warehouse gap, 10th instance); F3: window.gameState double-assignment ambiguity |

**No P0 flow blockers.** All critical gen rules are pre-applied:
- FeedbackManager.init() absent (PASS)
- gameState.gameId first field (PASS)
- syncDOMState() full 4-phase machine (PASS)
- window.endGame + window.restartGame assigned in DOMContentLoaded (PASS)
- ARIA-001 on answer-feedback div (PASS)
- ProgressBar slotId 'mathai-progress-slot' (PASS)
- game_complete on both victory and game_over paths (PASS)
- results-screen position:fixed z-index:100 (PASS)
- option-btn min-height:52px min-width:44px (PASS)
- timer destroy+recreate in restartGame() (PASS)
- restartGame() full pseudocode present (PASS)

**This is the cleanest spec audited to date** — matches or exceeds the stats-mean-direct audit (2 findings). All major gen rules are correctly pre-applied. Ready for first build without pre-build fixes.

**Pre-build checklist (all PASS):**
- [x] FeedbackManager.init() absent
- [x] gameState.gameId first field
- [x] syncDOMState() on all 4 phase transitions
- [x] window.endGame/restartGame assigned in DOMContentLoaded
- [x] ARIA aria-live="polite" + role="status" on feedback div
- [x] ProgressBar slotId 'mathai-progress-slot'
- [x] game_complete type on both paths (exact string, not 'game_end')
- [x] results-screen position:fixed z-index:100
- [x] option-btn min-height:52px
- [x] timer destroy + recreate in restartGame()
- [x] isProcessing guard on handleOptionSelect
