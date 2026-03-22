# UI/UX Audit — adjustment-strategy

**Date:** 2026-03-23
**Build:** #385 (approved)
**Resolution tested:** 480×800px
**Auditor:** UI/UX slot (browser playthrough via Playwright + static analysis)

---

## Summary

7 findings (5a, 0b, 0c, 2d). No P0 flow bugs. All phases reachable end-to-end.

---

## Phases Verified

| Phase | Reachable | Screenshot | Notes |
|-------|-----------|-----------|-------|
| start_screen | YES | adj-strat-start.png | TransitionScreen shows correctly with progress bar + lives |
| Level 1 transition | YES | — | Level 1 / "Easy — Small numbers" transition fires on Let's go! |
| playing | YES | adj-strat-playing.png | 47+33 round loads; adjuster buttons render; timer starts |
| results (victory) | YES | adj-strat-results.png | endGame('victory') → Great Job! + stars + metrics |
| data-phase sync | PASS | — | start → playing → results correctly reflected on #app[data-phase] |
| data-lives sync | PASS | — | syncDOMState() sets data-lives; lives-display div also updated |

---

## Issues Found

### F1 — Adjuster buttons (adj-btn) are 36px, below 44px touch target minimum [CATEGORY: a]

The `.adj-btn` class sets `height: 36px` explicitly. The four adjuster buttons (`btn-a-minus`, `btn-a-plus`, `btn-b-minus`, `btn-b-plus`) render at 36×80px on the 480px viewport — 8px short of the 44px minimum. GEN-UX-002 (GEN-TOUCH-TARGET) was shipped globally but the custom adjuster widget bypasses `.game-btn` which carries `min-height: 44px`. The `.adj-btn` rule does not include a `min-height`.

**Route:** Gen Quality — add to CDN_CONSTRAINTS_BLOCK: adjuster-style custom buttons must include `min-height: 44px` even when a fixed pixel height is set. Rule must specifically call out that `height: 36px` on `.adj-btn` is insufficient.

**Instance count:** 8th confirmed instance of GEN-UX-002 gap (secondary/custom buttons exempt themselves from the `min-height` rule already shipped for `.game-btn`).

---

### F2 — No aria-live / role="status" on any dynamic feedback element [CATEGORY: a]

The game uses `FeedbackManager.playDynamicFeedback()` for correct/wrong audio+subtitle feedback, but zero elements in the DOM carry `aria-live="polite"` or `role="status"`. Screen reader users receive no indication of correct/wrong answer. This is a clean instance of ARIA-001 — already a shipped gen rule — but this game predates the rule and the approved build (#385) was not regenerated to include it.

**Route:** Gen Quality — confirm ARIA-001 is enforced in current gen prompt (it is, via c826ec1). No action needed beyond logging this as the 11th confirmed instance. On next rebuild, ARIA-001 should appear automatically.

**Instance count:** 11th confirmed instance.

---

### F3 — Results screen is position:static, not a fixed-position overlay [CATEGORY: a]

`#results-screen` has `position: static` (computed). The game hides the game-screen and shows results-screen via `display: none` / `display: flex` — which works correctly on the 480px test viewport because the results card is within normal document flow. However, on very tall content builds or when keyboard is open, the results screen could be partially off-screen. GEN-UX-001 (GEN-MOBILE-RESULTS) was shipped — next build should generate `position: fixed` results overlay automatically.

**Route:** Gen Quality — confirmed 8th instance of GEN-UX-001 violation (in a build predating the shipped rule). No action needed; rule already shipped.

**Instance count:** 8th confirmed instance.

---

### F4 — gameState.gameId absent from gameState object [CATEGORY: a]

`window.gameState.gameId` is `undefined`. The spec's Section 3 Game State does not include a `gameId` field. Pipeline contract tests that validate `gameState.gameId` will find undefined. This is the 2nd confirmed instance (also found in addition-mcq spec audit 2026-03-23).

**Route:** Gen Quality — add to gen prompt: `gameState` must include `gameId: 'game_adjustment_strategy'` (matching the Game Identity game ID from the spec). Add to CDN_CONSTRAINTS_BLOCK. Also: spec addition — Section 3 should declare `gameId` as a mandatory field.

**Instance count:** 2nd confirmed instance.

---

### F5 — No Enter key handler on answer-input [CATEGORY: a]

`#answer-input` (type="number") accepts typed answers but has no `keydown` listener for Enter. The user must click the `btn-check` button to submit. On mobile numeric keyboards, pressing the "Done" key does not trigger submission. This is the 2nd confirmed instance — first was real-world-problem #564.

**Route:** Gen Quality — GEN rule pending in ROADMAP (line 430): "whenever a typed numeric or text input is rendered, bind `input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAnswerSubmit(); })`". This audit is the 2nd confirmed instance — ship the rule now.

**Instance count:** 2nd confirmed instance.

---

### F6 — window.nextRound not exposed on window [CATEGORY: d]

The test harness at load warns: `[ralph-test-harness] MISSING window.nextRound`. The game uses `loadRound()` internally for advancing rounds, but does not expose `window.nextRound`. Harness helpers that call `window.nextRound()` will silently fail. The harness fallback chain (`loadRound → jumpToRound → loadQuestion → goToRound`) should cover `loadRound` since it is exposed as `window.loadRound`, but the `nextRound` alias is never assigned.

**Route:** Test Engineering — confirm harness `jumpToRound()` correctly falls back to `window.loadRound()` for this game; if not, add `window.nextRound = loadRound;` to spec and gen prompt rule for games that use `loadRound()` as their round-advance function.

---

### F7 — Reset button (reset-btn) touch target is 30.5px [CATEGORY: a]

`#btn-reset` renders at 30.5px height (CSS: `padding: 6px 14px`, no min-height, font-size 14px). This is below the 44px minimum. GEN-UX-002 covers primary `.game-btn` buttons but the secondary `.reset-btn` style has no `min-height` rule.

**Route:** Gen Quality — extend GEN-UX-002 to cover ALL interactive buttons including secondary/utility buttons (reset, skip, hint). The rule should read: "every clickable button must have `min-height: 44px` — no exceptions for secondary or utility buttons."

**Instance count:** Overlaps with F1 — secondary button exemption gap. Both F1 and F7 are the same root cause.

---

## Items Verified as PASS

| Checklist Item | Result |
|---------------|--------|
| ProgressBar slotId: `{ slotId: 'mathai-progress-slot' }` | PASS — confirmed in both init and restartGame() |
| FeedbackManager.init() absent (banned per spec) | PASS — not present anywhere in game script |
| alert() / confirm() / prompt() absent | PASS — none found |
| SignalCollector constructor args | N/A — SignalCollector not used (PART-016 = NO) |
| window.endGame assigned | PASS — `window.endGame = endGame` at line 962 |
| data-phase transitions via syncDOMState() | PASS — start_screen → playing → results/gameover all synced |
| data-lives on DOM element | PASS — `#app[data-lives]` and `#test-lives-display` both updated |
| CSS intact (not stripped) | PASS — full stylesheet present, 353 lines |
| TransitionScreen icons — emoji only (no local paths) | PASS — `['🧮']` used throughout |
| FeedbackManager.sound.preload() used correctly | PASS — preloads correct_tap + wrong_tap before game start |
| postMessage game_complete payload | PASS — fires with metrics, attempts, events |
| restartGame() exposed on window | PASS — `window.restartGame = restartGame` |
| startGame() exposed on window | PASS — `window.startGame = startGame` |

---

## Routing Summary

| Finding | Category | Routes to | Priority |
|---------|----------|-----------|----------|
| F1 — adj-btn 36px | (a) gen prompt | Gen Quality — extend GEN-UX-002 to custom widget buttons | Medium |
| F2 — No aria-live | (a) gen prompt | Gen Quality — ARIA-001 already shipped; log as instance 11 | Low (already shipped) |
| F3 — results static | (a) gen prompt | Gen Quality — GEN-UX-001 already shipped; log as instance 8 | Low (already shipped) |
| F4 — gameState.gameId absent | (a) gen prompt | Gen Quality — add mandatory gameId field to gen prompt + spec | Medium |
| F5 — no Enter key | (a) gen prompt | Gen Quality — 2nd instance; ship rule now | Medium |
| F6 — window.nextRound missing | (d) test gap | Test Engineering — verify harness fallback; add alias if needed | Low |
| F7 — reset-btn 30.5px | (a) gen prompt | Gen Quality — extend GEN-UX-002 to secondary buttons | Medium |
