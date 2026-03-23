# stats-mode — UI/UX Audit

**Audit type:** Spec-only static analysis (no build in DB)
**Date:** 2026-03-23
**Auditor:** UI/UX Slot
**Spec:** `games/stats-mode/spec.md`
**Session:** Statistics Session 2 — Game 4 of 4

---

## Findings Table

| # | Rule | Section | Status | Classification | Severity | Action |
|---|------|---------|--------|----------------|----------|--------|
| F1 | Sentry three-script absent | Sec 5 HTML shell | FAIL | (a) gen prompt rule | low | 11th warehouse-gap instance — PART-030=YES but no Sentry `<script>` tags in HTML shell; gen prompt handles via CDN_CONSTRAINTS_BLOCK but warehouse template does not include the snippet |
| F2 | window.gameState double-assignment | Sec 3 + Sec 9 | FAIL | (d) low risk anti-pattern | low | Module-scope assignment (Sec 3) is correct; Sec 9 also lists `window.gameState = gameState` inside DOMContentLoaded comment block. Anti-pattern checklist item #2 bans the DOMContentLoaded assignment but Sec 9 code example re-adds it. Same ambiguity as stats-mean-direct / stats-median. Low risk (idempotent). |
| F3 | SignalCollector not instantiated | Spec-wide | FAIL | (d) low | low | GEN-UX-005 already shipped — gen prompt handles instantiation with correct args. Spec does not mention SignalCollector at all. No spec addition needed — gen rule covers it. Same pattern as stats-median F1. |

---

## Checklist (PASS/FAIL per gen rule)

| Gen Rule | Check | Result |
|----------|-------|--------|
| GEN-WINDOW-EXPOSE | `window.endGame = endGame; window.restartGame = restartGame` in DOMContentLoaded | PASS — Sec 9, explicit with comment "MANDATORY window assignments" |
| GEN-GAMEID | `gameId` is FIRST field in `gameState` object literal | PASS — Sec 3: comment "MANDATORY FIRST FIELD" + `gameId: 'stats-mode'` at line 1 of object |
| GEN-PHASE-001 | 4-phase state machine + syncDOMState() at all transitions | PASS — Sec 6 flow diagram covers all 4 phases; syncDOMState() defined in Sec 6 and called at every transition; all paths in endGame()/startGame() covered |
| ARIA-001 | `#answer-feedback` has `aria-live="polite"` + `role="status"` | PASS — Sec 5 HTML element has both attributes; Sec 15 anti-pattern #6 enforces them |
| GEN-MOBILE-RESULTS | `#results-screen` has `position: fixed; z-index >= 100` | PASS — Sec 10 CSS: `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` with explicit comment "MANDATORY" |
| GEN-TOUCH-TARGET | `.option-btn` min-height: 44px min-width: 44px | PASS — Sec 10 CSS: `min-height: 52px; min-width: 44px` (exceeds minimum) |
| GEN-UX-003 (ProgressBar slotId) | `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 9, totalLives: 3 })` | PASS — Sec 13: exact config shown with slotId, totalRounds, totalLives |
| PART-017=NO / No FeedbackManager.init() | FeedbackManager.init() absent | PASS — PART-017=NO in Sec 2; anti-pattern #1 bans init(); .sound() and .playDynamicFeedback() used only |
| game_complete on BOTH paths | victory AND game_over both send `type: 'game_complete'` | PASS — Sec 9 endGame() sends postMessage inside shared block before the if/else; Sec 11 repeats the contract; Sec 15 anti-pattern #11 bans 'game_end' |
| timer.destroy() + recreate in restartGame() | Timer destroyed and recreated before startGame() | PASS — Sec 7.6 shows full pattern: `timer.destroy(); timer = null; timer = new TimerComponent(...)` |
| GEN-112 progressBar.update() | `progressBar.setRound(roundNumber)` NOT totalRounds as second arg | PASS — Sec 7.2 uses `progressBar.setRound(roundNumber)`; Sec 13 explicitly warns against totalRounds as second arg |
| Sentry three-script pattern | v10 three-script vs v7 single bundle | FAIL (F1) — see above |
| window.gameState double-assign | Assigned at module scope ONLY, not again in DOMContentLoaded | FAIL (F2) — see above |
| SignalCollector instantiation | GEN-UX-005 — instantiated with correct args | FAIL (F3) — not in spec; gen prompt rule covers it |
| Dual display mode | loadQuestion() toggles #dataset-display vs #frequency-table-container | PASS — Sec 5 HTML has both containers; Sec 7.2 loadQuestion() has explicit if/else on round.dataType; TC-016 (grouped) + TC-017 (ungrouped) test both; anti-pattern #16 enforces toggle |

---

## Pre-Build Checklist

All items below must pass before first build is queued.

- [x] FeedbackManager.init() absent (PART-017=NO)
- [x] gameState.gameId is FIRST field
- [x] window.endGame = endGame + window.restartGame = restartGame in DOMContentLoaded
- [x] window.loadQuestion exposed for __ralph.jumpToRound()
- [x] syncDOMState() called at ALL phase transitions (start/playing/results/game_over)
- [x] #answer-feedback has aria-live="polite" + role="status"
- [x] ProgressBarComponent slotId: 'mathai-progress-slot'
- [x] game_complete on both victory AND game_over paths (type lowercase)
- [x] timer.destroy() then timer = new TimerComponent() in restartGame()
- [x] progressBar.setRound(roundNumber) — NOT totalRounds — in loadQuestion()
- [x] #results-screen position:fixed z-index:100
- [x] .option-btn min-height:52px min-width:44px
- [x] #dataset-display vs #frequency-table-container toggle in loadQuestion()
- [x] Bimodal correctAnswer compared as string, not numeric
- [x] Frequency table rendered as proper HTML `<table>` (not plain text)
- [ ] Sentry v10 three-script (F1 — low, handled by gen prompt)
- [ ] window.gameState NOT re-assigned in DOMContentLoaded (F2 — low risk)

---

## Summary

**3 findings (0 P0, 0 high, 0 medium, 3 low). No pre-build blockers.**

This is among the cleanest specs audited to date — tied with stats-median and stats-mean-direct. All 12 critical gen rules are correctly pre-applied. The dual display mode (ungrouped number list vs grouped frequency table) is correctly handled with explicit loadQuestion() toggle logic and dedicated test cases (TC-016, TC-017). Three low-severity findings, all pre-existing patterns:

- **F1** — Sentry three-script absent (11th warehouse-gap instance, low, gen prompt handles it)
- **F2** — window.gameState assigned in both module scope and DOMContentLoaded comment block (same ambiguity as stats-mean-direct + stats-median, low risk, idempotent)
- **F3** — SignalCollector not mentioned in spec (GEN-UX-005 shipped, gen prompt handles it, no spec action needed)

Ready for first build without any pre-build fixes.
