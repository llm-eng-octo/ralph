# associations — UI/UX Audit

**Build audited:** #513 (latest approved)
**Audit date:** 2026-03-23
**Auditor:** UI/UX Slot (full browser playthrough)
**HTML URL:** https://storage.googleapis.com/mathai-temp-assets/games/associations/builds/513/index.html
**Previous audit:** #472 full browser playthrough (2026-03-23) — 1 P0 (state not reset on restart) + 4 MEDIUM + 2 LOW

---

## Summary

**1 P0 (white screen on restart — TypeError in transitionScreen.show()), 0 HIGH, 4 MEDIUM, 2 LOW.**

Build #513 completes all 3 rounds end-to-end without issue. However clicking "Play Again" crashes with `Cannot set properties of null (setting 'innerHTML')` and leaves the page completely blank — the game is not restartable. This is a regression from #472, which at least showed the start screen on restart (though state was not reset).

Total: **7 findings — 5(a), 0(b), 0(c), 2(d)**

---

## Checklist Results (Browser Playthrough — 375×812px Playwright MCP)

| Check | Result | Notes |
|-------|--------|-------|
| CDN packages load | PASS | All 9 packages load; ScreenLayout injected; 0 CDN load errors |
| Zero network 404s | PASS | All audio and asset requests return 200 |
| `window.gameState.gameId` set | FAIL — UI-ASC-005 | `gameState` has no `gameId` field; always `undefined` |
| `window.endGame` exposed | PASS | Assigned at bottom of script |
| `window.restartGame` exposed | PASS | Assigned at bottom of script |
| `window.nextRound` exposed | PASS | Assigned at bottom of script |
| `window.syncDOMState` exposed | PASS | Present; correctly targets `#app` (not `body`) |
| `syncDOMState()` targets `#app` | PASS | Sets `#app[data-phase]` — no LP-4 violation |
| `data-phase` transitions | PASS | `start` → `learn` → `recall` → `transition` → `results` all correct |
| `data-round` updates | PASS | Increments 0→1→2→3 at round transitions |
| `data-score` updates | PASS | Increments correctly throughout |
| `data-testid="option-N"` on choice buttons | PASS | `option-0` through `option-3` present during recall |
| `data-testid="btn-restart"` | PASS | Present on Play Again button |
| `data-testid="results-screen"` | FAIL — UI-ASC-004 | No `data-testid="results-screen"` on results wrapper; uses class `.game-block` only |
| `data-testid="stars-display"` | PASS | Present and populated with star text |
| `data-testid="score-display"` | PASS | Present and shows `12/12` |
| `aria-live` region present | FAIL — UI-ASC-003 | Zero `aria-live` regions anywhere in DOM |
| Results screen `position:fixed` | FAIL — UI-ASC-002 | `position: static` on results wrapper (GEN-UX-001 violation) |
| Touch targets ≥44px (choice buttons) | PASS | 145×51px — passes minimum |
| Touch targets ≥44px (btn-restart) | BORDERLINE | 143×43px — 1px below 44px minimum |
| All 3 rounds completable | PASS | Round 1 (3 pairs), Round 2 (4 pairs), Round 3 (5 pairs) all completed |
| Results screen reachable | PASS | "Game Complete!" with 3-star rating, score 12/12, 100% accuracy |
| Restart / Play Again | FAIL — P0 UI-ASC-P0-001 | TypeError crash → white screen on restart |
| Console errors (non-audio) | FAIL — UI-ASC-006 | `timer.getTime is not a function` fires 20+ times throughout gameplay |

---

## Issues

### [P0] UI-ASC-P0-001 — White screen crash on Play Again (regression from #472)

- **Observed:** Clicking "Play Again" on the results screen triggers an uncaught `TypeError: Cannot set properties of null (setting 'innerHTML')` in `transition-screen/index.js:297`. Page goes completely white. `#app` shows `data-phase="start_screen"` in DOM but content div has `display: none`. Game is entirely broken after first play.
- **Code evidence:** `restartGame()` calls `await transitionScreen.show(...)`. By the time `endGame()` runs, the CDN destroys ProgressBar and VisibilityTracker (`[ProgressBar] Destroyed`, `VisibilityTracker: Destroyed` in console). The transition slot element appears to be null at that point, so `transitionScreen.show()` crashes setting innerHTML.
- **Regression vs #472:** Build #472 had restartGame() show the start screen but not reset state. Build #513 now crashes entirely on the `transitionScreen.show()` call.
- **Impact:** First play completes, but Play Again is fully broken — the game cannot be replayed. P0.
- **Classification:** (a) gen prompt rule — restartGame() must re-initialize destroyed CDN components before calling transitionScreen.show(), or avoid calling transitionScreen for restart (go directly to the start screen)
- **Action:** REQUIRES RE-QUEUE. Re-queue build for associations to fix restartGame().

---

### [MEDIUM] UI-ASC-002 — Results screen position:static; no data-testid="results-screen"

- **Observed:** The results wrapper div has class `game-block` and `position: static`. No `data-testid="results-screen"` attribute. Results card is not a fixed overlay — it scrolls with content.
- **Classification:** (a) gen prompt rule
- **Action:** GEN-UX-001 requires `position: fixed; top: 0; left: 0; width: 100%; height: 100%`. This is the 11th confirmed instance. Also missing `data-testid="results-screen"` — any test targeting this testid will fail with element not found.

---

### [MEDIUM] UI-ASC-003 — No aria-live region; answer feedback is CSS-only

- **Observed:** Zero `aria-live` elements in DOM at any phase. When a choice button is clicked, only CSS classes (`.correct`/`.wrong`) change — no text announcement. Screen reader users get no feedback.
- **Classification:** (a) gen prompt rule
- **Action:** ARIA-001 already shipped. This is the 14th confirmed instance. Route to Gen Quality to verify rule coverage.

---

### [MEDIUM] UI-ASC-005 — gameState.gameId not set; templateId always null

- **Observed:** `window.gameState` has no `gameId` key. Both `SignalCollector` instantiations use `templateId: window.gameState.gameId || null` — always `null`. Confirmed: `window.gameState.gameId === undefined` at runtime.
- **Classification:** (a) gen prompt rule
- **Action:** GEN-GAMEID already shipped. This is the 5th confirmed live-build instance. Route to Gen Quality.

---

### [MEDIUM] UI-ASC-006 — btn-restart height is 43px (1px below 44px minimum)

- **Observed:** `data-testid="btn-restart"` (Play Again button) measures 143×43px at 375px viewport width. One pixel below the WCAG 44px touch target minimum.
- **Classification:** (a) gen prompt rule
- **Action:** Gen rule should ensure `min-height: 48px` on `.game-btn.btn-primary`. Minor but measurable violation.

---

### [LOW] UI-ASC-007 — timer.getTime is not a function (repeating error)

- **Observed:** `{"error":"Signal Error","details":"timer.getTime is not a function"}` fires 20+ times during gameplay — once per answer click and at intervals. Caught and logged; does not crash the game but pollutes console and masks real errors.
- **Classification:** (d) test gap — should be caught by a Playwright assertion checking for non-audio console errors
- **Action:** Route to Test Engineering: add assertion that no non-audio console errors appear after each answer click in the standard test template.

---

### [LOW] UI-ASC-008 — FeedbackManager subtitle component missing warning

- **Observed:** `[WARNING] [FeedbackManager] Subtitle component not found` on every audio play event (11+ warnings per game session). FeedbackManager is initialised without a subtitle component reference.
- **Classification:** (c) CDN constraint — FeedbackManager requires SubtitleComponent to be registered before audio playback
- **Action:** Document only. CDN requires SubtitleComponent instantiation before FeedbackManager plays audio. Gen prompt should include `new SubtitleComponent(...)` call. Verify whether GEN-FEEDBACK-SUBTITLE rule exists.

---

## Passing Checks

- CDN packages (9 components) all load — 0 CDN errors
- Zero network 404s — all audio and asset requests return 200
- All 3 rounds (3-pair, 4-pair, 5-pair) complete correctly end-to-end
- Progress bar updates correctly: 0/3 → 1/3 → 2/3 → 3/3
- TransitionScreen used with correct object API `{icons, title, subtitle, buttons}` throughout
- `data-phase` transitions correctly: `start` → `learn` → `recall` → `transition` → `results`
- `syncDOMState()` correctly targets `#app` (not `body`)
- Choice buttons use `data-testid="option-0"` through `option-3`
- `data-testid="btn-restart"`, `stars-display`, `score-display` all present on results screen
- FeedbackManager audio (correct/incorrect/amazing feedback) plays on every answer
- Timer pause/resume on audio playback working correctly
- `window.endGame`, `window.restartGame`, `window.nextRound` all exposed correctly
- Sentry SDK v10.23.0 three-script pattern present
- No `alert()`, `confirm()`, or `prompt()` calls
- `FeedbackManager.init()` correctly absent

---

## Flow Observations

- Start screen: TransitionScreen with brain emoji, "Associations" title, "Remember the faces!" subtitle, "Let's go!" button. Clean layout.
- Learn phase: Face emoji + name + "Pair N of M" counter. Timer counts up. Pairs auto-advance after `exposureDuration` ms (3000/2500/2000ms decreasing across rounds — good difficulty progression).
- Recall phase: Face emoji shown, "Who is this?", 4 MCQ choice buttons (2×2 grid). Timer continues counting. Includes 1 distractor per round. Answer advances immediately on click.
- Transition screen: Between rounds, TransitionScreen CDN shows "Round N" heading + "Start Round" button. Clean.
- Results screen: "Game Complete!" with star rating, score/time/correct/total/accuracy grid, "Play Again" button. The stats table is clear and informative. However white-screen crash on Play Again.

---

## Routing Summary

| Finding | Severity | Slot | Action |
|---------|----------|------|--------|
| UI-ASC-P0-001 — White screen crash on restart | P0 | Gen Quality + Build Queue | Re-queue associations; restartGame() must not call transitionScreen.show() after CDN teardown |
| UI-ASC-002 — results-screen position:static; no testid | MEDIUM | Gen Quality | 11th GEN-UX-001 instance; also missing data-testid="results-screen" |
| UI-ASC-003 — No aria-live | MEDIUM | Gen Quality | 14th ARIA-001 instance |
| UI-ASC-005 — gameState.gameId absent | MEDIUM | Gen Quality | 5th instance; GEN-GAMEID shipped |
| UI-ASC-006 — btn-restart 43px (1px below min) | MEDIUM | Gen Quality | Add min-height: 48px rule for .game-btn.btn-primary |
| UI-ASC-007 — timer.getTime repeating error | LOW | Test Engineering | Add console error assertion to test template |
| UI-ASC-008 — FeedbackManager subtitle warning | LOW | Gen Quality | Verify GEN-FEEDBACK-SUBTITLE rule exists; CDN constraint |

**Verdict:** P0 — re-queue required. Game completes successfully but is not restartable (white screen crash). All other findings are non-blocking known issues with active gen rules.
