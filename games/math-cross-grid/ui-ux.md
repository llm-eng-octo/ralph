# UI/UX Audit — math-cross-grid

**Build/spec audited:** Spec-only (no approved build exists — 0 builds in DB as of 2026-03-23)
**Audit date:** 2026-03-23
**Method:** Static spec analysis — games/math-cross-grid/spec.md
**Auditor:** UI/UX Slot (Rule 16)

---

## Summary

**8 actionable issues: 5a (gen prompt rule), 1b (spec addition), 0c, 2d (test gap)**

No P0 flow blockers. Both end conditions (lives exhausted, all rounds complete) route through the single `endGame()` function which sends `game_complete`. Play-Again uses `location.reload()` (no restartGame() function). Drag-and-drop interaction is well-specified. Core structural issues: FeedbackManager.init() banned API used, results screen missing position:fixed overlay, ARIA live region absent, data-phase/syncDOMState absent, window.endGame not assigned.

---

## Mandatory Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | CSS stylesheet intact (not stripped) | PASS | Spec Section 8 is complete — full stylesheet defined |
| 2 | FeedbackManager.init() absent | **FAIL** | Section 7 + 9.3: `await FeedbackManager.init()` called explicitly in DOMContentLoaded |
| 3 | alert()/confirm()/prompt() absent | PASS | None found in spec |
| 4 | window.endGame assigned | **FAIL** | `endGame()` is a local function; never assigned to `window.endGame` |
| 5 | data-phase transitions with syncDOMState() | **FAIL** | No `data-phase` attribute on any element; no `syncDOMState()` function defined anywhere |
| 6 | Enter key handler (text input games) | N/A | Drag-and-drop game — no text input fields |
| 7 | ProgressBar slotId: 'mathai-progress-slot' (options object) | PASS | Section 9.3: `new ProgressBarComponent({ autoInject: true, totalRounds: ..., totalLives: ..., slotId: 'mathai-progress-slot' })` — correct form |
| 8 | aria-live="polite" role="status" on dynamic feedback | **FAIL** | No aria-live element in Section 6 HTML; feedback is conveyed only via cell CSS class changes (`.correct`/`.incorrect`) — no text announced to screen reader |
| 9 | SignalCollector constructor args (sessionId, studentId, templateId) | PASS | Section 9.3: full constructor with all three args |
| 10 | gameState.gameId field present | **FAIL** | Section 5 gameState object has no `gameId` field; set only conditionally via `handlePostMessage` if `gameId` sent in `game_init` event — not guaranteed |
| 11 | Results screen position:fixed overlay | **FAIL** | Section 6 HTML: `#results-screen` uses `display:none` toggle; Section 8 CSS has no `position:fixed` on `#results-screen` or `.results-container`; results render in document flow |
| 12 | Touch targets min-height 44px | PASS | `.game-btn` has `padding: 14px 32px` (renders ~48px); `.tile` is `64px x 64px`; drop zones are `58px x 58px` |
| 13 | Sentry SDK v10.23.0 three-script pattern | PARTIAL | Two `<script src>` tags present (helper wrapper + CDN v10.23.0 bundle); init is inline in main `<script>` block — not a separate third `<script>` tag; version is correct |
| 14 | game_complete postMessage on BOTH victory AND game-over paths | PASS | Both end conditions route through single `endGame()` function (Sections 9.12, 9.11); `endGame()` sends `type: 'game_complete'` unconditionally |
| 15 | restartGame() resets ALL gameState fields | **FAIL** | No `restartGame()` function exists; "Play Again" button calls `location.reload()` — full page reload instead of in-place reset |
| 16 | data-lives on DOM for lives game | **FAIL** | This is a lives=2 game; no `data-lives` attribute on any DOM element; syncDOMState() absent means lives count is never reflected in DOM |
| 17 | waitForPackages waits only for used packages | FAIL (Low) | Section 9.1: waits for `TimerComponent` but spec Section 1 says Timer: None — unnecessary wait that could time out if TimerComponent CDN is unavailable |

---

## Findings

### F1 — FeedbackManager.init() called (banned API)
**Classification:** (a) gen prompt rule — GEN rule violation
**Severity:** High
**Description:** Section 7 flow diagram and Section 9.3 DOMContentLoaded both call `await FeedbackManager.init()`. This is a banned pattern per pipeline rules (CDN_CONSTRAINTS_BLOCK). FeedbackManager must NOT be initialized by the game — the parent application handles it. Calling it risks double-initialization errors and audio state corruption.
**Action:** Add to pre-build checklist before first queue. Already covered by GEN rule — T1 check should catch this. Verify T1 catches it before queuing.

### F2 — Results screen missing position:fixed overlay
**Classification:** (a) gen prompt rule — GEN-UX-001 violation (10th confirmed instance)
**Severity:** High
**Description:** Section 8 CSS `.results-container` has `display:flex; flex-direction:column` in document flow. `#results-screen` has no `position:fixed; top:0; left:0; right:0; bottom:0; z-index:100` overlay. On mobile, if the grid overflows, the results screen will appear mid-scroll rather than as a full-screen overlay. GEN-UX-001 / GEN-MOBILE-RESULTS was shipped 2026-03-23 — this spec predates the rule but the spec itself should be updated before first build.
**Action:** Update spec Section 8 CSS for `#results-screen` to add `position:fixed; top:0; left:0; width:100%; height:100%; z-index:100; overflow-y:auto; background:#fff;`. Spec addition.

### F3 — ARIA live region absent
**Classification:** (a) gen prompt rule — ARIA-001 violation (13th confirmed instance)
**Severity:** High
**Description:** Drag-and-drop feedback is conveyed entirely through CSS class changes on `.grid-cell` elements (`.correct`, `.incorrect` with shake animation). No `aria-live="polite" role="status"` element exists in the HTML. Screen reader users receive no feedback when they submit an answer — correct or incorrect. ARIA-001 was shipped 2026-03-23 — T1 will catch this on first build. Spec should still define the element explicitly.
**Action:** Add `<div id="feedback-message" aria-live="polite" role="status" class="sr-only"></div>` to Section 6 HTML; update `handleNext()` to write text into it ("Correct! Moving to next puzzle." or "Incorrect. Try again. X lives remaining."). Spec addition (b).

### F4 — data-phase / syncDOMState absent
**Classification:** (a) gen prompt rule — 4th instance (first non-MCQ game to exhibit this)
**Severity:** Medium
**Description:** No `data-phase` attribute defined on any container element. No `syncDOMState()` function exists in the spec. The game has two clear phases (gameplay and results) but the DOM has no machine-readable phase signal. Playwright tests that assert `[data-phase="results"]` will fail. The harness relies on `data-phase` to know which screen is active. This confirms the pattern extends beyond MCQ games to drag-and-drop games.
**Action:** Add `data-phase="gameplay"` to `#game-screen` (or a wrapping `#gameContent` div), update `showResults()` to call `syncDOMState('results')`, define `syncDOMState(phase)` helper. Extend gen prompt GEN-MCQ-PHASE rule to cover all game types.

### F5 — window.endGame not assigned
**Classification:** (a) gen prompt rule — 4th confirmed instance
**Severity:** Medium
**Description:** `endGame()` is defined as a local function but never assigned to `window.endGame`. The test harness calls `window.endGame()` to force game termination in Playwright tests. If `window.endGame` is undefined, any test that needs to trigger end-game programmatically will fail with `TypeError: window.endGame is not a function`.
**Action:** Add `window.endGame = endGame;` in the JS after `endGame` function definition. Single line fix — add to spec Section 9.16. Check T1 rule 21 covers this.

### F6 — gameState.gameId absent from initial declaration
**Classification:** (a) gen prompt rule — 4th confirmed instance (adjustment-strategy, addition-mcq spec, associations #513, math-cross-grid spec)
**Severity:** Medium
**Description:** Section 5 gameState object declaration has no `gameId` field. It is set conditionally in `handlePostMessage` (`if (gameId) gameState.gameId = gameId`) but only when a `game_init` postMessage is received. When the game runs standalone with fallback content, `window.gameState.gameId` is `undefined`. SignalCollector's `templateId` is hardcoded to `'math-cross-grid'` but gameId is still absent from gameState. Now at 4 confirmed instances — ship rule immediately.
**Action:** Add `gameId: 'math-cross-grid'` to the `window.gameState` declaration in Section 5. Also update `setupGame()` to set `gameState.gameId = gameState.gameId || 'math-cross-grid'` on reset. Add to CDN_CONSTRAINTS_BLOCK.

### F7 — data-lives not reflected in DOM (lives game)
**Classification:** (d) test gap — 3rd confirmed instance
**Severity:** Medium
**Description:** This is a lives=2 game. No `data-lives` attribute exists on any DOM element. The test harness helper `getLives()` reads from `data-lives` on `document.body` or a wrapper element. Without `data-lives`, any test that asserts live count will silently read `null` or fail. Pattern confirmed in addition-mcq-lives and addition-mcq specs. Now confirmed in a non-MCQ drag-and-drop game — pattern is game-type-agnostic.
**Action:** Add `data-lives="2"` to `#game-screen` or `#app` wrapper. `syncDOMState()` (once added per F4) should update `data-lives` on each lives change. Add to test-gen prompt: assert `page.locator('[data-lives]').getAttribute('data-lives')` matches expected value after each incorrect submission.

### F8 — waitForPackages awaits TimerComponent unnecessarily
**Classification:** (a) gen prompt rule — Low
**Severity:** Low
**Description:** Section 9.1 `waitForPackages()` polls for `TimerComponent` (lines 693-696) but Section 1 explicitly states Timer: None. If TimerComponent CDN is unavailable (or load order changes), the game will time out waiting for a component it never uses, showing the error screen. Dead dependency in the package wait loop.
**Action:** Remove `TimerComponent` wait block from `waitForPackages()`. Only await packages actually used by the game. Add gen prompt rule: waitForPackages() must only include CDN components the game actually instantiates.

---

## Pre-Build Checklist

Before queuing math-cross-grid for its first build, verify in the generated HTML:

- [ ] **FeedbackManager.init() absent** — T1 check should catch; verify T1 passes
- [ ] **window.endGame assigned** — check `window.endGame = endGame` is present
- [ ] **data-phase on game container** — check `data-phase="gameplay"` on a wrapper
- [ ] **ARIA live region present** — T1 W5 check covers this (ARIA-001 shipped)
- [ ] **gameState.gameId declared** — check initial gameState object
- [ ] **results-screen position:fixed** — T1 should catch (GEN-UX-001 shipped)
- [ ] **data-lives attribute** — check `data-lives="2"` on wrapper
- [ ] **TimerComponent wait removed** — check waitForPackages

---

## Routing Table

| Finding | Classification | Route to | Priority |
|---------|---------------|----------|----------|
| F1 — FeedbackManager.init() | (a) gen prompt rule | Verify T1 catches; pre-build check | High |
| F2 — Results not fixed overlay | (a) gen prompt rule | ROADMAP R&D (GEN-UX-001 — 10th instance) | High |
| F3 — ARIA live region absent | (a) gen prompt rule | ROADMAP R&D (ARIA-001 — 13th instance) | High |
| F4 — data-phase / syncDOMState absent | (a) gen prompt rule | ROADMAP R&D (extend to all game types) | Medium |
| F5 — window.endGame not assigned | (a) gen prompt rule | ROADMAP R&D (4th instance — ship rule) | Medium |
| F6 — gameState.gameId absent | (a) gen prompt rule | ROADMAP R&D (4th instance — ship now) | Medium |
| F7 — data-lives not on DOM | (d) test gap | ROADMAP Test Engineering (3rd instance) | Medium |
| F8 — TimerComponent wait unnecessary | (a) gen prompt rule | ROADMAP R&D (low priority) | Low |

---

## Notes

- **No P0 flow bugs** — both end conditions are properly specified; game_complete is sent on both paths
- **Touch targets** — well specified (64px tiles, 58px cells, 48px+ buttons)
- **Drag-and-drop** — PART-033 drag/swap/return-to-bank logic is clearly specified; no ambiguity
- **SignalCollector** — correctly initialized with all three constructor args
- **ProgressBar** — correct slotId and options object form
- **Sentry** — v10.23.0 bundle correct; two-script load (not three-tag pattern) is acceptable per current standard
