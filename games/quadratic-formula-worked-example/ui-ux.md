# UI/UX Audit — Quadratic Formula: Worked Example

**Build:** #546  **Date:** 2026-03-23  **Auditor:** UI/UX slot
**Audit type:** Full browser playthrough (Playwright MCP) — completed 2026-03-23
**Previous entry:** Static analysis only (2026-03-23)

---

## Playthrough Summary

Full end-to-end browser playthrough completed. All 3 rounds traversed (Round 1: x²−5x+6=0, Round 2: 2x²+3x−2=0, Round 3: x²−4x+4=0 double-root). Each round completed all three sub-phases: Worked Example (4 steps), Fill the Gap (faded MCQ), and Your Turn (practice MCQ). Wrong answers tested in both faded and practice phases. Results screen reached. Play Again tested.

**CDN packages:** All loaded successfully. 1 console error (favicon 404 — benign). 1 console warning (Sentry init failed — expected in local playthrough).

---

## Issues Found

### P0 — Results Screen Broken (Browser-Confirmed)

**UI-QF-001 — Results screen renders off-screen as flex sibling to #app (P0 — browser-only finding)**

In browser, ScreenLayout CDN component sets `body { display: flex; flex-direction: row }`. Because `#results-screen` is a direct child of `<body>` (not a child of `#app` or the `.page-center` wrapper), it becomes a horizontal flex item alongside `#app`. At viewport width 480px, `#app` occupies the full 480px, and `#results-screen` overflows off to the right at ~209px computed width — it is entirely outside the visible viewport.

Static analysis: CSS defined `#results-screen { min-height: 100dvh; display: flex; ... }` — looks reasonable. Browser confirms this is insufficient without `position: fixed`.

- **Computed position:** `static` (should be `fixed`)
- **Computed z-index:** `auto` (should be `≥100`)
- **Computed width:** `208.797px` (should be `100vw`)
- **Parent flex-direction:** `row` (body — ScreenLayout injection)
- **Play Again button:** technically `inViewport: true` but entire card is off-screen to the right
- **Classification:** **(a) gen prompt rule** — UI-QF-001/GEN-UX-001 — 4th+ confirmed instance. Rule already in ROADMAP. Must add `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` to `#results-screen` CSS.
- **T1 check opportunity:** Validate `#results-screen` has `position: fixed` in CSS static analysis.

### High Priority

**UI-QF-002 — Feedback areas missing aria-live (WCAG SC 4.1.3) — BROWSER CONFIRMED**

Browser confirms: at game start, `document.querySelectorAll('[aria-live]')` returns empty array. When `#faded-feedback` becomes visible after a wrong answer, `ariaLive: null`. When `#practice-feedback` becomes visible after a correct answer, `ariaLive: null`. Screen readers receive no announcement of feedback text. Classification: **(a) gen prompt rule** — ARIA-001 gap, 4th+ confirmed instance.

**UI-QF-003 — ProgressBarComponent uses wrong slot ID string (confirmed pattern)**

HTML source at line 600: `new ProgressBarComponent('mathai-progress-bar-slot', {...})` — positional string with `-bar-` infix, not `{ slotId: 'mathai-progress-slot' }`. The actual slot ID injected in DOM is `mathai-progress-slot`. The progress bar visually renders (CDN component likely falls back) but the slot ID mismatch is a contract violation. Classification: **(a) gen prompt rule** — GEN-UX-003 — 3rd confirmed instance.

**UI-QF-004 — MCQ buttons lack explicit minimum height (HIG: 44pt touch target) — BROWSER CONFIRMED**

Browser confirms: `.btn-option` renders at `height: 45px`, `minHeight: "auto"`. The 45px is achieved by `padding: 14px 24px` + font-size at default settings — not guaranteed across user font size settings. No `min-height: 44px` in CSS. Classification: **(a) gen prompt rule** — GEN-UX-002 — 4th confirmed instance.

### Medium Priority — New Browser Findings

**UI-QF-NEW-001 — restartGame() does not reset lives, round, or score in gameState (P1)**

After clicking "Play Again", `data-lives="2"` (should be "3"), `data-round="3"` (should be "0"), `gameState.lives=2`, `gameState.currentRound=3`. The `restartGame()` function only sets `gameState.gameEnded=false`, `gameState.isActive=false`, `gameState.phase='start'` — it does not reset `lives`, `currentRound`, `wrongInPractice`, `score`, `startTime`, `attempts`, or `events`. The visual display (TransitionScreen re-render) masks this, but the underlying state is stale. A second game session would start with wrong lives count. Classification: **(a) gen prompt rule** — `restartGame()` must reset all game state fields to initial values.

**UI-QF-NEW-002 — #results-screen persists in DOM after Play Again**

After `restartGame()`, `document.getElementById('results-screen')` still exists in `<body>` with `style.display=""` (not hidden via inline style — hidden via `.hidden` class). The results-screen never leaves the DOM. On the second game session, if the results screen positioning issue (UI-QF-001) were fixed with `position: fixed`, there could be z-index stacking conflicts. Classification: low priority observation — results from standard hide/show pattern; no active bug when `position: fixed` is present.

**UI-QF-005 — Step cards rendered via innerHTML without sanitization (medium)**

`renderStepCard()` uses `innerHTML` to inject `stepData.label`, `stepData.text`, and `stepData.formula` from `fallbackContent` (hardcoded in JS) and from `game_init` postMessage. If an attacker can supply game_init data, XSS is possible. Classification: low risk in test pipeline context.

### Medium Priority — Confirmed from Static Analysis

**UI-QF-006 — Phase distinction relies on background tint alone (WCAG SC 1.4.1)**
Three sub-phases use colour tints: blue `#eff6ff` (example), green `#f0fdf4` (faded), yellow `#fefce8` (practice). Browser confirms phase badge text ("Step 1 of 3: Worked Example") provides accessible text equivalent — partially compliant. Classification: **low priority / observation**.

**UI-QF-007 — .page-center class defined in CSS but never applied — dead code**
Browser confirms: `#app` children use the ScreenLayout injected wrapper, not `.page-center`. The rule is dead. Classification: **low priority / observation**.

**UI-QF-008 — Max-width 480px via ScreenLayout CDN wrapper (CDN constraint)**
Browser confirms: `max-width: 480px` constraint is enforced by ScreenLayout injection. Classification: **(c) CDN constraint** — no action needed.

**UI-QF-009 — handlePostMessage checks flat event.data.content not nested event.data.data.content**
Unverifiable in browser playthrough (no server postMessage in local test). Classification: **(a) gen prompt rule candidate** — requires integration test to confirm.

### Low Priority / Observations (Confirmed from Static)

- `.btn-option` left-aligns formula options — appropriate for math formulas. Renders cleanly in browser at all tested widths.
- Color contrast: `--mathai-primary: #4f46e5` on white (~6.6:1, AA), `--mathai-text-muted: #64748b` on white (~4.6:1, AA), `#166534` on `#f0fdf4` (~8.6:1, AAA).
- FeedbackManager audio: 9 `[FeedbackManager] No audio_content provided` warnings — expected for test builds without audio data.

---

## Full Playthrough Checklist (2026-03-23)

- [x] Start screen renders correctly (title, instructions, "Let's go!" button)
- [x] Start button triggers game (`data-phase` → `'playing'`)
- [x] Round 1 content loads (worked example visible, 4 steps)
- [x] MCQ options render (45px computed height — at boundary, no explicit min-height)
- [x] Correct answer → feedback displayed (UI-QF-002: no aria-live, feedback text shown visually)
- [x] Wrong answer → feedback displayed, life deducted in `data-lives` (practice phase only)
- [x] Faded phase allows retry after wrong answer (lives not deducted in faded phase)
- [x] Round advances correctly (`data-round` increments from 0→1→2)
- [x] Progress bar updates ("0/5 rounds" → "1/5" → "2/5" → "3/5")
- [x] All 3 rounds completable (double-root case in Round 3 works correctly)
- [FAIL] Results screen covers full viewport — **P0: renders off-screen at ~209px to the right (position:static, not fixed)**
- [x] "Play Again" button reachable — technically in-viewport but card is partially off-screen
- [x] Zero console PAGE ERRORs throughout (favicon 404 is resource error, not PAGEERROR)
- [x] `window.gameState` shape: correct — `{ currentRound, totalRounds, score, attempts, events, startTime, isActive, phase, gameEnded, content, lives, totalLives, subPhase, ... }`
- [PARTIAL] `SignalCollector.seal()` — `window.SignalCollector` not globally exposed; CDN component manages internally

---

## Critical Gen Rules Checklist (Build #546)

| Rule | Check | Result | Notes |
|------|-------|--------|-------|
| GEN-UX-001 | `#results-screen` position:fixed | **FAIL** | `position:static`, renders off-screen |
| ARIA-001 | `aria-live="polite"` on feedback areas | **FAIL** | Both feedback divs: `ariaLive: null` |
| GEN-UX-003 | ProgressBar `{ slotId: 'mathai-progress-slot' }` | **FAIL** | Positional string `'mathai-progress-bar-slot'` used |
| GEN-UX-002 | Button `min-height: 44px` | **FAIL** | `minHeight: "auto"`, computed 45px only at default font |
| GEN-PHASE-001 | `data-phase` transitions correctly | PASS | start → playing → results observed |
| GEN-LIVES | `data-lives` deducted on wrong answer | PASS | 3→2 on wrong practice answer |
| GEN-ROUND | `data-round` increments | PASS | 0→1→2 after each round |
| GEN-FLOW | All phases reachable | PASS | example→faded→practice→results all reached |
| GEN-RESTART | restartGame() resets state | **FAIL** | lives=2, round=3 after restart (not reset) |
| GEN-FEEDBACK | Wrong answer shows explanation | PASS | detailed misconception feedback shown |
| GEN-CDN | CDN packages load | PASS | All 7 packages loaded successfully |
| GEN-CONSOLE | Zero PAGE ERRORs | PASS | Only favicon 404 (benign resource error) |

**4 FAIL / 8 PASS**

---

## Routing

- **Gen Quality tasks:**
  - UI-QF-001 + GEN-UX-001: Add `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` to `#results-screen` CSS — **P0, ship now** (4th+ confirmed instance; browser confirms static position breaks layout entirely)
  - UI-QF-002 + ARIA-001: Both `#faded-feedback` and `#practice-feedback` must have `aria-live="polite" role="status"` — confirmed in browser
  - UI-QF-003 + GEN-UX-003: ProgressBarComponent must use options object `{ slotId: 'mathai-progress-slot' }` — confirmed in source at line 600
  - UI-QF-004 + GEN-UX-002: All `.btn-option` must have `min-height: 44px` — confirmed in browser (computed: auto)
  - UI-QF-NEW-001: `restartGame()` must reset `lives`, `currentRound`, `wrongInPractice`, `score`, `startTime`, `attempts`, `events` to initial values — new rule, add to gen prompt

- **Test Engineering tasks:**
  - UI-QF-001 test gap: Add Playwright assertion `#results-screen` has `position: fixed` and `getBoundingClientRect()` covers full viewport at `data-phase='results'`
  - UI-QF-002 test gap: Add Playwright assertion `#faded-feedback` and `#practice-feedback` have `aria-live` before they become visible
  - UI-QF-NEW-001 test gap: Add Playwright assertion that after `restartGame()`, `data-lives` equals initial lives count and `data-round` equals "0"

- **Education tasks:** none

- **CDN-blocked (no action):** UI-QF-008 (layout constraint from ScreenLayout)
