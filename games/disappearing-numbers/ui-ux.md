# Disappearing Numbers — UI/UX Audit
**Build:** #509
**Date:** 2026-03-23
**Method:** Full browser playthrough — Playwright MCP, 375×812px (mobile)
**Auditor:** UI/UX Slot (Rule 16)

---

## Summary

| | Count |
|-|-------|
| P0 (flow blocker) | 1 |
| HIGH | 2 |
| MEDIUM | 2 |
| LOW | 2 |
| PASS | 12 |

**Verdict:** Re-queue recommended (P0 white screen — game never renders)

---

## Issues

### P0 — White Screen / Game Never Starts

**ID:** UI-DN-P0-001
**Category:** (a) gen prompt rule
**Observed:** Game loads to a completely white screen. `#app` is empty. Console shows `[ERROR] Init error: {}` at line 502. `data-phase` stays `idle` forever.
**Root cause:** `waitForPackages()` (PART-003) checks `typeof Components === 'undefined'` and `typeof Helpers === 'undefined'`. These identifiers are **never globals** — the CDN packages expose their components directly as `ScreenLayout`, `ProgressBarComponent`, `TransitionScreenComponent`, etc. The condition is always true, so the function spins for 10 seconds, throws `Error('Packages failed to load within 10s')`, which is caught and logged as `{}` (because `JSON.stringify(Error)` yields `{}`). Execution exits before `ScreenLayout.inject()` runs.
**Evidence:** Approved build #551 (count-and-tap) checks `typeof ScreenLayout === 'undefined' || typeof ProgressBarComponent === 'undefined'` — the correct identifiers.
**Expected:** `waitForPackages()` should check `typeof ScreenLayout`, `typeof ProgressBarComponent`, `typeof TransitionScreenComponent`, and `typeof FeedbackManager`.
**Action (a) → Gen Quality:** Add/reinforce gen rule for PART-003: correct package-readiness globals are `ScreenLayout`, `ProgressBarComponent`, `TransitionScreenComponent`, `FeedbackManager`. Never `Components` or `Helpers` (those are CDN-internal aggregator objects, never window globals).

---

### HIGH-1 — gameState.gameId Not Set

**ID:** UI-DN-001
**Category:** (a) gen prompt rule — GEN-GAMEID (20th+ confirmed instance)
**Observed:** `window.gameState` has no `gameId` field. `SignalCollector` is initialized with `templateId: window.gameState.gameId || null` → `null`.
**Expected:** `gameState.gameId = 'disappearing-numbers'` as first field in `window.gameState = { ... }`.
**Action (a) → Gen Quality:** Existing GEN-GAMEID rule needs reinforcement — persists despite rule presence.

---

### HIGH-2 — results-screen Not position:fixed

**ID:** UI-DN-002
**Category:** (a) gen prompt rule — GEN-UX-001 (17th+ confirmed instance)
**Observed:** `#results-screen` uses class `.game-block` which has no `position: fixed`. Source CSS shows no `position: fixed` for `#results-screen` or `.results-screen`. The `.game-block` class is `position: relative` via parent chain.
**Expected:** `#results-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; }` as per GEN-MOBILE-RESULTS rule.
**Action (a) → Gen Quality:** GEN-MOBILE-RESULTS / GEN-UX-001 persists — add to pre-build T1 check.

---

### MEDIUM-1 — No aria-live Regions

**ID:** UI-DN-003
**Category:** (a) gen prompt rule — ARIA-001 (20th+ confirmed instance)
**Observed:** `document.querySelectorAll('[aria-live]').length === 0`. No live regions on instruction text, feedback area, or results.
**Expected:** At minimum, the feedback area (correct/wrong answer response) and instruction text should carry `aria-live="polite"`.
**Action (a) → Gen Quality:** ARIA-001 rule needs further reinforcement.

---

### MEDIUM-2 — #app Missing data-lives/data-round/data-score on Initial HTML

**ID:** UI-DN-004
**Category:** (a) gen prompt rule
**Observed:** `<div id="app" data-phase="idle"></div>` — only `data-phase` is set in static HTML. `data-lives`, `data-round`, `data-score` are only added by `syncDOMState()` after init runs. Since init fails (P0), tests that read these attrs before init would get `null`.
**Expected:** All four attrs pre-populated in static HTML: `<div id="app" data-phase="idle" data-lives="3" data-round="0" data-score="0">`.
**Action (a) → Gen Quality:** Add gen rule: `#app` initial HTML must include all four data attributes with initial values.

---

### LOW-1 — .game-btn No min-height:44px

**ID:** UI-DN-005
**Category:** (a) gen prompt rule — touch target
**Observed:** `.game-btn { padding: 12px 32px; font-size: var(--mathai-font-size-body) }` — no explicit `min-height`. Computed height at 16px font = ~40px, below the 44px minimum.
**Expected:** `.game-btn { min-height: 44px; }` per GEN-TOUCH-TARGET rule.
**Action (a) → Gen Quality:** Note for existing touch target rule.

---

### LOW-2 — Number Cards Missing data-testid

**ID:** UI-DN-006
**Category:** (d) test gap
**Observed:** Number cards are created dynamically with `data-index` and `data-signal-id` but no `data-testid`. Tests needing to read card values or hidden status must use `data-index` instead.
**Expected:** `card.setAttribute('data-testid', 'number-card-' + i)` on each card.
**Action (d) → Test Engineering:** Add to known selector gap list; tests must use `[data-index="${i}"]` as fallback selector for number cards.

---

## Passing Checks

| Check | Result | Notes |
|-------|--------|-------|
| CDN packages load | PASS | All 29 package log messages, no 404s |
| `window.endGame` exposed | PASS | `typeof window.endGame === 'function'` |
| `window.restartGame` exposed | PASS | `typeof window.restartGame === 'function'` |
| `window.nextRound` exposed | PASS | `typeof window.nextRound === 'function'` |
| `data-testid="answer-input"` | PASS | Present on `<input>` element |
| `data-testid="btn-check"` | PASS | Present on Submit button |
| `data-testid="btn-restart"` | PASS | Present on Play Again button |
| `data-testid="stars-display"` | PASS | Present on results stars |
| `data-testid="score-display"` | PASS | Present on score metric |
| `data-testid="lives-display"` | PASS | Present on lives metric |
| TransitionScreen object API | PASS | `transitionScreen.show({ icons, title, subtitle, buttons })` — correct object form |
| ProgressBar slotId | PASS | `ScreenLayout.inject('app', { slots: { progressBar: true, transitionScreen: true } })` → `#mathai-progress-slot` |
| syncDOMState targets #app | PASS | `document.getElementById('app').setAttribute(...)` — correct |
| FeedbackManager check in waitForPackages | PASS | `typeof FeedbackManager` is checked (correct global) |
| 5-round content defined | PASS | `fallbackContent.rounds` has 5 entries with escalating difficulty |
| `inputmode="numeric"` on answer input | PASS | Mobile keyboard optimization |
| VisibilityTracker pause/resume | PASS | Proper inactive time tracking |
| SignalCollector instantiated | PASS | `new SignalCollector(...)` called in init |
| Sentry init guard | PASS | `if (typeof Sentry !== 'undefined')` guard present |

---

## Flow Observations

**Start screen:** Never rendered — game is a white screen from page load. The `transitionScreen.show()` call at line 493 is never reached because `waitForPackages()` times out 10 seconds before it.

**Data phase at failure:** `data-phase="idle"` — stuck at initial value, never advances to `start_screen`.

**Error masking:** The catch block does `console.error('Init error: ' + JSON.stringify(e))` — `JSON.stringify(Error)` always produces `{}`, hiding the actual error message. This masks the root cause during diagnosis.

**Game design (from source):** 5 rounds of escalating difficulty — 3 numbers → 4 numbers → 4 numbers (sum) → 5 numbers → 5 numbers (3 hidden); revealDuration drops from 5000ms to 3000ms. Countdown bar shows during memorization. Two operation types: `recall` (single hidden number) and `sum` (sum of hidden numbers).

**CDN timing note:** The CDN fires `[MathAIComponents] All components loaded successfully` at ~message 29, but `[ERROR] Init error: {}` fires before this because `waitForPackages()` timed out 10 seconds earlier during a blocking poll.

---

## Routing Summary

| Route | Issues | Action |
|-------|--------|--------|
| Gen Quality (prompt rule) | UI-DN-P0-001, UI-DN-001, UI-DN-002, UI-DN-003, UI-DN-004, UI-DN-005 | Reinforce PART-003 (correct package globals), GEN-GAMEID, GEN-MOBILE-RESULTS, ARIA-001; add rule for #app initial data attrs and min-height:44px |
| Test Engineering | UI-DN-006 | number-card selector must use `[data-index]` fallback; add to gap list |
| Education | — | No spec issues found |
| CDN constraint | — | No new CDN constraints |
| Build queue | **P0 present — re-queue recommended** | Fix PART-003 gen rule, re-queue to verify white screen resolved |
