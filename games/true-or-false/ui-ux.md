# True or False — UI/UX Audit
**Build:** #474
**Date:** 2026-03-23
**Method:** Full browser playthrough — Playwright MCP, 375×812px (mobile)

## Summary
| Severity | Count |
|----------|-------|
| P0 | 0 |
| HIGH | 0 |
| MEDIUM | 2 |
| LOW | 2 |
| CDN | 1 |

No re-queue required.

---

## MEDIUM Issues

### MEDIUM-1: `data-testid="btn-start"` missing on start transition button
**Where:** TransitionScreenComponent "Let's go!" button (start screen and restart)
**Detail:** The start action button is rendered by the CDN `TransitionScreenComponent`. It carries class `mathai-transition-btn primary` but **no** `data-testid="btn-start"`. Tests that `waitForSelector('[data-testid="btn-start"]')` will time out. This is the same pattern seen on every game using TransitionScreenComponent — the CDN does not emit testids on its internal buttons.
**Classification:** (d) test gap — Test Engineering must use `page.getByRole('button', { name: "Let's go!" })` or rely on `data-phase="start"` + `#mathai-transition-slot button` selector pattern.
**Instance count:** Known recurring pattern (15th+ instance across audited games).

### MEDIUM-2: `data-testid="results-screen"` missing
**Where:** `<div id="results-screen">` in the game template
**Detail:** The results screen div has `id="results-screen"` but no `data-testid="results-screen"`. Tests that assert `[data-testid="results-screen"]` visible on the results phase will fail, falling back to phase-based checks only.
**Classification:** (a) gen rule — strengthen GEN-GAMEID-TESTID or add a dedicated rule requiring `data-testid="results-screen"` on the results wrapper div.

---

## LOW Issues

### LOW-1: No `aria-live` regions
**Where:** Entire game HTML
**Detail:** No `aria-live` attributes present anywhere. Per GEN-120, round feedback ("Correct!", "Not quite!") and statement changes should be announced via `aria-live="polite"`. 0 aria-live elements found in the DOM.
**Classification:** (a) gen rule — ARIA-001 (20th+ instance; rule already exists, needs enforcement).

### LOW-2: Results screen `position: static`
**Where:** `#results-screen` computed style
**Detail:** Results card uses `position: static` within the normal page flow. The audit checklist flags results screens that are not `position: fixed` covering the full viewport. In this game the card-based layout is intentional — the card is fully visible with no off-screen content — but it deviates from the fixed-overlay pattern used by other games.
**Classification:** (a) gen rule — GEN-UX-001 (22nd+ instance; existing rule; this game's card design is acceptable, not a blocker).

---

## CDN Issues

### CDN-1: `[FeedbackManager] Subtitle component not loaded, skipping`
**Where:** Browser console, 9 warnings across full playthrough
**Detail:** FeedbackManager warns that SubtitleComponent is not loaded each time `playDynamicFeedback()` is called. SubtitleComponent IS loaded by the CDN bundle (confirmed in package load log), so this is an internal registration timing issue within the CDN — not caused by game code. Subtitles are simply omitted; audio feedback plays normally.
**Classification:** (c) CDN constraint — document only, no action required from game code.

---

## Passing Checks
| Check | Result |
|-------|--------|
| CDN packages load (ScreenLayout, ProgressBar, TransitionScreen, Timer, FeedbackManager, SignalCollector, VisibilityTracker) | PASS — 0 errors, all loaded |
| `window.gameState.gameId === 'game_true_or_false'` | PASS |
| `window.endGame` exposed | PASS |
| `window.restartGame` exposed | PASS |
| `window.nextRound` exposed (aliased to `roundComplete`) | PASS |
| `data-phase` transitions: `start` → `playing` → `transition` → `playing` → `results` | PASS |
| TRUE button `data-testid="option-0"` | PASS |
| FALSE button `data-testid="option-1"` | PASS |
| `data-testid="statement-display"` on statement element | PASS |
| `data-testid="btn-restart"` on Play Again button | PASS |
| Progress bar updates on correct answer and wrong answer | PASS |
| Lives deduct on wrong answer (❤️❤️❤️ → ❤️❤️🤍) | PASS |
| Wrong answer: selected button red, correct button green highlight | PASS |
| Level transition screens (Level 1 / Level 2 / Level 3) at rounds 0, 3, 6 | PASS |
| `data-phase="results"` on results screen | PASS |
| Results data displayed: time, avg time/round, rounds completed, wrong attempts, accuracy, stars | PASS |
| Stars: 1 star earned (avg 9.9s/round > 4s threshold) | PASS |
| `game_complete` postMessage fires on victory with full metrics | PASS |
| Play Again: full state reset (round=0, lives=3, score=0, attempts=[], roundTimes=[]) | PASS |
| Zero console errors across full playthrough | PASS |
| Zero network 404s | PASS |
| `syncDOMState()` targets `#app` (not `document.body`) | PASS |
| `data-round`, `data-score`, `data-lives` set on `#app` throughout | PASS |

---

## Flow Observations

**Start screen:** TransitionScreenComponent overlay shows "True or False / Judge the math statement!" with ✅❌ icon and "Let's go!" button. Progress bar (0/9) and 3 hearts visible behind it. Clean and legible at 375px.

**Level 1 transition (round 0 → 1):** After clicking "Let's go!", a second transition screen shows "Level 1 — Warm up — Simple facts" with another "Let's go!" button. Timer pauses during transition. This double-transition on game start is a minor UX friction point but is by spec design.

**Gameplay (rounds 1–9):** Statement displayed in a gray card at 28px bold. TRUE (green border) and FALSE (red border) buttons side-by-side, each 64px height, well-sized for touch. Instruction text above explains the task. Timer counts up (blue) in top center.

**Correct answer (round 1):** TRUE button flashes solid green. Score increments. Audio plays. Next round loads after 1s delay.

**Wrong answer (round 4):** FALSE button flashes solid red. TRUE button highlights light green (correct answer revealed). Life count drops. Audio "Not quite!" plays. Next round loads after 1.5s delay.

**Level transitions at rounds 3 and 6:** TransitionScreenComponent correctly pauses timer and shows level name + subtitle. "Next Level" button resumes timer and loads next round.

**Results screen:** Appears after round 9 completes. Shows 1 star (avg 9.9s > 4s threshold), "Great Job!" heading, all 5 metrics accurate (Time 2:11, Avg 9.9s, Rounds 9/9, Wrong 1, Accuracy 89%). "Play Again" button present and functional.

**Restart:** Clicking "Play Again" fully resets state (all arrays cleared, lives=3, round=0), destroys and recreates timer/progressBar/visibilityTracker, shows start TransitionScreen again. Clean restart with no leaked state.

---

## Routing Summary
| Issue | Route | Action |
|-------|-------|--------|
| MEDIUM-2: `data-testid="results-screen"` missing | Gen Quality | Add/strengthen gen rule requiring `data-testid="results-screen"` on results wrapper div |
| MEDIUM-1: `btn-start` testid missing (CDN button) | Test Engineering | Use `#mathai-transition-slot button` or `getByRole('button', { name: "Let's go!" })` selector pattern for start; do NOT add `data-testid="btn-start"` expectation to tests |
| LOW-1: No `aria-live` regions | Gen Quality | ARIA-001 already exists; reinforce or add T1 static check |
| LOW-2: Results screen `position: static` | Gen Quality | GEN-UX-001 already exists; this instance is acceptable (card fully visible) |
| CDN-1: FeedbackManager subtitle warning | None | CDN-internal; document only |

---

**Verdict:** No P0 — game is fully playable end-to-end. All 9 rounds complete, all 3 level transitions fire, wrong-answer feedback correct, results data accurate, restart clean. Two medium gen-rule gaps (missing `data-testid="results-screen"`, missing start button testid pattern) and two low-severity known recurring issues (no aria-live, results not position:fixed). No re-queue required.
