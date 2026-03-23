# UI/UX Audit — which-ratio

**Build:** #561 (latest approved)
**Date:** 2026-03-23
**URL:** https://storage.googleapis.com/mathai-temp-assets/games/which-ratio/builds/561/index.html
**Method:** Full HTML + CSS + JS static analysis (CSS present in #561 — prior stripped-CSS issue resolved)
**Prior audit:** Build #560 (2026-03-23) — 8 issues including CRITICAL CSS stripping. All #560 issues re-checked below.

---

## Status vs Build #560

| #560 Issue | #561 Status |
|------------|-------------|
| CRITICAL: CSS stylesheet stripped | **FIXED** — full `<style>` block present (291 lines) |
| Option buttons no explicit 44px touch target | **Still present** — `padding: 12px 20px`, no `min-height` |
| No ARIA live regions on feedback elements | **Still present** — no `aria-live` on `#correct-feedback` / `#skip-note` |
| SVG no fallback width/height + tiny labels | **Partially fixed** — CSS sets `#triangle-diagram svg { width: 100%; height: auto }` via container; labels still `font-size="5"` |
| Correct feedback 1200ms auto-dismiss | **Still present** |
| Skip note duration inconsistent (1500ms/2000ms) | **Still present** |
| No live score display | **Still present** (CDN constraint — not fixable) |
| Muted SVG lines #94a3b8 below WCAG AA | **Still present** — `const mutedColor = '#94a3b8'` hardcoded in JS |

---

## Issue 1 — Option buttons lack explicit min-height: 44px (a) Gen prompt rule

**Observation:** `.option-btn` CSS defines `padding: 12px 20px` and `font-size: 1rem`. There is no `min-height` or `min-width` declaration. At 1rem ≈ 16px, line-height ≈ 1.5, plus 24px padding = ~48px total — borderline on desktop. However: on small screens or when font-size is scaled down by browser, the computed height can drop below 44px. More critically, the `we-btn` class (Got it / Skip buttons) defines only `padding: 10px 20px` at `font-size: 1rem` — total height ≈ 44px, with zero margin. Any browser font-size reduction pushes these below minimum.

**Impact:** Tap targets below 44px violate iOS HIG and Android Material Design minimums. Miss-taps on mobile cause accidental option selections.

**Classification:** (a) Gen prompt rule

**Proposed rule (already in ROADMAP.md R&D backlog — confirm not yet implemented):**
```
All interactive buttons (option-btn, we-btn, any clickable element) MUST have min-height: 44px and min-width: 44px. Tap target sizing must be explicit in the CSS, not inherited or implicit.
```

---

## Issue 2 — No ARIA live regions on dynamic feedback elements (a) Gen prompt rule

**Observation:** `#correct-feedback` and `#skip-note` are toggled via `classList.add('visible')` / `classList.remove('visible')`. Neither element has `aria-live="polite"` or `role="alert"`. Screen readers will not announce "Correct! sin θ is the right ratio." when it appears.

**HTML (line 321–323):**
```html
<div id="correct-feedback" data-testid="correct-feedback">Correct!</div>
<div id="skip-note" data-testid="game-skip-note">Skipping round.</div>
```

**Impact:** Inaccessible to screen reader users. Correct/incorrect state changes are invisible to assistive technology.

**Classification:** (a) Gen prompt rule

**Proposed rule (already in ROADMAP.md R&D backlog — confirm not yet implemented):**
```
Feedback elements that appear dynamically (correct/incorrect messages, skip notes, score updates) MUST have aria-live="polite" (or role="alert" for immediate errors). Example: <div id="correct-feedback" aria-live="polite" ...>
```

---

## Issue 3 — SVG text labels use font-size="5" (unitless raw SVG) (a) Gen prompt rule

**Observation:** All four SVG labels (A, O, H, θ) use `font-size="5"` as a raw attribute in a `viewBox="0 0 100 60"`. This renders at 5/100 = 5% of viewBox width. On a 300px canvas, labels are 15px — readable. On a 200px canvas (common on 320px screens with margin), labels are 10px — below legibility threshold.

**Additional concern:** The SVG element itself has no `width`/`height` attributes — it relies entirely on `#triangle-diagram svg { width: 100%; height: auto }` in CSS. The CSS is now present, so this is not a critical failure, but is fragile: any future CSS-stripping incident would collapse the SVG.

**Classification:** (a) Gen prompt rule

**Proposed rule (already in ROADMAP.md R&D backlog as SVG constraint):**
```
SVG elements used as diagrams MUST have explicit width and height attributes (e.g., width="100%" height="auto") as a fallback. SVG text labels should use font-size values that are at least 8% of the viewBox height.
```

---

## Issue 4 — Muted SVG lines use #94a3b8 — contrast ratio ~2.7:1 (a) Gen prompt rule

**Observation:** `renderTriangle()` hardcodes `const mutedColor = '#94a3b8'` (slate-400). Against white background (`--page-bg: #f8fafc`, effectively white), contrast ratio is approximately 2.7:1 — below the WCAG AA minimum of 3:1 for non-text graphical elements.

**Classification:** (a) Gen prompt rule

**Proposed rule (already in ROADMAP.md R&D backlog):**
```
SVG diagram lines that convey information (triangle sides, graph axes, bar outlines) must use a muted stroke color with contrast ratio >= 3:1 against the background. #94a3b8 on white fails this. Use #64748b (slate-500) or darker.
```

---

## Issue 5 — Correct feedback auto-dismisses in 1200ms — no learner control (b) Spec addition

**Observation:** `setTimeout(() => { feedbackEl.classList.remove('visible'); nextRound(); }, 1200)` — 1200ms is below the recommended minimum of 1500ms for feedback a learner may wish to read.

**Classification:** (b) Spec addition

**Proposed spec addition:** "Correct feedback must display for at least 1500ms. The game should not auto-advance in under 1500ms."

---

## Issue 6 — Skip note duration inconsistent across two code paths (b) Spec addition

**Observation:**
- `handleWorkedExampleSkip()` → `setTimeout(..., 1500)` (line 707)
- `handleOptionClick()` second-incorrect branch → `setTimeout(..., 2000)` (line 680)

Both paths display the skip note and advance to the next round. The durations differ by 500ms — perceptible inconsistency.

**Classification:** (b) Spec addition

**Proposed spec addition:** "Skip feedback duration must be consistent across all skip paths. Use a single constant; minimum 1500ms."

---

## Issue 7 — No live score display during gameplay (c) CDN constraint

**Observation:** `ProgressBarComponent` is configured with `totalLives: 0`. Score is tracked in `gameState.score` but never displayed mid-game. Score and stars are only revealed at the end via `TransitionScreenComponent`.

**Classification:** (c) CDN constraint — ProgressBarComponent API does not expose a live score prop. Not fixable via gen prompt.

---

## NOT an issue — Results screen (CDN TransitionScreenComponent is fixed overlay)

**Observation from prior audit template:** The results screen concern from name-the-sides (position:static) does NOT apply here. `which-ratio` uses `TransitionScreenComponent` with `autoInject: true`, which renders as a full-screen fixed overlay via CDN implementation. This is the correct pattern. No issue.

---

## NOT an issue — progressBar.update() arguments

**Observation:** `progressBar.update(gameState.currentRound, gameState.totalRounds)` — `currentRound` starts at 1 (after `nextRound()` increments it) and maxes at `totalRounds`. No negative values possible in the normal flow path.

---

## NOT an issue — Mobile layout at 480px

**Observation:** `@media (max-width: 600px)` switches `#option-buttons` to `grid-template-columns: 1fr` (single column) and reduces `#triangle-diagram max-width` to 250px. At 480px this breakpoint is active. Layout stacks vertically without horizontal scroll. The `overflow: hidden` on `html, body` prevents scroll. No issue.

---

## NOT an issue — CSS stylesheet present

**Build #561 has full CSS** (291 lines of real rules). The CRITICAL issue from build #560 is resolved. T1 check PART-028 (detect comment-only `<style>` blocks) would correctly pass this build.

---

## Summary

| # | Issue | Severity | Classification |
|---|-------|----------|---------------|
| 1 | Option buttons lack explicit min-height: 44px | High | (a) Gen prompt rule |
| 2 | No ARIA live regions on dynamic feedback elements | High | (a) Gen prompt rule |
| 3 | SVG labels use font-size="5" — may be too small at 200px canvas | Medium | (a) Gen prompt rule |
| 4 | Muted SVG lines #94a3b8 — contrast ratio ~2.7:1, below WCAG AA 3:1 | Medium | (a) Gen prompt rule |
| 5 | Correct feedback auto-dismisses in 1200ms — below 1500ms minimum | Low | (b) Spec addition |
| 6 | Skip note duration inconsistent: 1500ms vs 2000ms across two paths | Low | (b) Spec addition |
| 7 | No live score/stars display during gameplay | Low | (c) CDN constraint |

**Total: 7 issues** — 4 gen prompt rules (Issues 1–4), 2 spec additions (Issues 5–6), 1 CDN constraint (Issue 7)

**Issues resolved from #560:** 1 (CRITICAL CSS stripping fixed)

**All 4 gen prompt rules are already in ROADMAP.md R&D backlog** — added during which-ratio #560 and name-the-sides #557 audits. Status: pending implementation in lib/prompts.js.

---

## Cross-Slot Handoffs (Static Analysis)

### → R&D (gen prompt rules — pending in ROADMAP.md)
- Issue 1: min-height 44px on all buttons — ROADMAP entry exists, pending
- Issue 2: ARIA live regions on feedback elements — ROADMAP entry exists, pending
- Issue 3: SVG fallback dimensions + label font-size — ROADMAP entry exists, pending
- Issue 4: SVG muted line contrast (#94a3b8 → #64748b) — ROADMAP entry exists, pending

### → Education (spec additions)
- Issue 5: Correct feedback minimum duration (1500ms) — add to which-ratio spec
- Issue 6: Skip note duration consistency — add to which-ratio spec

### → Build queue (static analysis only)
No visual bugs requiring re-queue. Build #561 is structurally sound. Gen prompt rules above are the correct fix path for the remaining issues.

---

## Browser Playthrough Audit

**Date:** 2026-03-23
**Build:** #561
**Auditor:** UI/UX Slot (automated Playwright, viewport 480×800)
**Method:** Full end-to-end browser playthrough — start → 5 rounds (3 correct first-attempt, 1 wrong+retry+correct, 1 skip) → results screen → restart check

---

### Console Log Summary

| Type | Count | Details |
|------|-------|---------|
| Errors | 5 | All `RangeError: Invalid count value: -5` from ProgressBar.update() on every round transition |
| Warnings | 6 | All `[FeedbackManager] No audio_content provided` — expected in headless |
| PAGEERRORs | 0 | None |

**Critical error detail:** `progressBar.update(currentRound, totalRounds)` — with `totalLives: 0` in the ProgressBar config, the CDN component internally computes a negative repeat count (`0 - 5 = -5`) and throws `RangeError: Invalid count value: -5` at `progress-bar/index.js:187`. The error is uncaught (in promise) on every round. The progress bar text still updates ("2/5 rounds completed") but the internal fill animation fails. This is a recurring CDN API misuse.

**Victory screen log:**
```
[TransitionScreen] Showing screen: {title: undefined, stars: undefined, buttons: undefined, persist: undefined}
```
Confirms P0: `transitionScreen.show('victory', {...})` passes all undefined fields — the `'victory'` string mode is not supported by this CDN version.

---

### Critical Checklist

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Start screen renders (data-phase='start') | PASS | TransitionScreen overlay renders; progress bar shows 0/5 |
| Start screen SVG icon renders visually | **FAIL** | SVG markup passed as `icons: ['<svg...>']` string is HTML-escaped and displayed as raw text — the CDN component does not accept SVG strings in the `icons` array |
| Game starts — phase transitions to playing | PASS | gameState.phase='playing', gameContent visible |
| MCQ options render with 3 choices | PASS | 3 options rendered (sin θ / cos θ / tan θ or O/H / A/H / O/A); note: spec says MCQ, game has 3 not 4 options |
| Correct answer feedback | PASS | "Correct! sin θ is the right ratio." appears and auto-dismisses |
| Wrong answer feedback + worked example | PASS | Worked example panel slides up with SOH-CAH-TOA reference; "Got it — try again" re-enables options |
| Timer counts down | N/A | No timer in this game |
| Skip button | PASS | Skip note displays (2000ms path), advances to next round |
| ProgressBar updates text | PASS | Text updates correctly (1/5 → 2/5 → etc.) |
| ProgressBar internal animation | FAIL | `RangeError: Invalid count value: -5` every round — internal animation broken |
| Results screen renders | **P0 FAIL** | Completely blank white screen — no title, no score, no Play Again button |
| Results screen covers full viewport | FAIL | N/A — screen is blank |
| Play Again reachable | **P0 FAIL** | No buttons present. User is stranded on blank screen |
| restartGame() full state reset | NOT REACHED | Blocked by blank results screen |
| Zero PAGEERRORs | PASS | No page-level errors |
| aria-live on feedback areas | FAIL | `Array.from(document.querySelectorAll('[aria-live]'))` returns `[]` — confirmed from browser |
| ProgressBarComponent slotId | PASS | `#mathai-progress-slot` innerHTML length = 572 — slot populated |
| option-btn height ≥ 44px | PASS | Measured 44.5px in browser |
| we-btn (Got it / Skip) height ≥ 44px | FAIL | Measured **40.5px** — below 44px minimum |

---

### New Findings from Browser Playthrough (not in static analysis)

#### BROWSER-P0-001 — Victory screen blank (results unreachable, no Play Again)

**Root cause:** `transitionScreen.show('victory', { score, stars, onRestart })` — the `'victory'` string mode is NOT supported by the CDN `TransitionScreenComponent` in use. The CDN component logs `{title: undefined, stars: undefined, buttons: undefined}` and renders a blank active `.mathai-transition-screen` with no content. The user sees a white screen after completing all 5 rounds.

**Evidence:** Console log `[TransitionScreen] Showing screen: {title: undefined, stars: undefined, buttons: undefined, persist: undefined}`. Screenshot: blank white viewport after round 5.

**Correct API:** `transitionScreen.show({ icons: [...], title: '...', subtitle: '...', buttons: [{...}] })` — the object-based form used by the start screen and restart screen. The `'victory'` string shorthand must have been removed or never existed in this CDN version.

**Classification:** (a) Gen prompt rule — CRITICAL. Must prohibit `transitionScreen.show('victory', ...)` pattern. Correct pattern: `transitionScreen.show({ icons: ['🎉'], title: 'Well done!', subtitle: '...', buttons: [{ text: 'Play Again', type: 'primary', action: restartGame }] })`.

**Impact:** P0 — game flow is dead-ended. User cannot play again.

#### BROWSER-P0-002 — Start screen SVG icon renders as escaped text

**Root cause:** `icons: ['<svg xmlns="http://www.w3.org/2000/svg"...>']` — SVG markup string is HTML-entity-escaped by the CDN TransitionScreenComponent when inserting into `<span class="mathai-transition-icon">`. The raw SVG string appears as visible text, filling the entire screen with `<svg ...><path d="M12.38,..."/>`.

**Evidence:** Browser screenshot shows full-viewport SVG markup text. DOM inspection: `transitionSlot` contains `&lt;svg ... &gt;` as textContent.

**Classification:** (a) Gen prompt rule. The `icons` array should use emoji characters only (e.g. `['🔺']`), not SVG markup strings. The CDN component does not `innerHTML`-inject icon values.

**Impact:** P0 visual — the start screen is unreadable with SVG code covering the screen. However, the "Which Ratio?" heading and "Let's go!" button are still visible below it, so the game is still launchable.

#### BROWSER-NEW-001 — ProgressBar.update() throws RangeError on every round

**Root cause:** `progressBar = new ProgressBarComponent({ totalLives: 0, ... })` — passing `totalLives: 0` causes the CDN to compute a negative lives-indicator repeat count when `update(currentRound, totalRounds)` is called. Error: `RangeError: Invalid count value: -5` (0 - 5 rounds = -5).

**Classification:** (a) Gen prompt rule. When a game has no lives system, use `totalLives` omitted or set to a positive value; or do not call `progressBar.update()` with round counts when `totalLives: 0`.

**Impact:** Medium — error is caught in promise (game continues), text updates correctly, but fill animation is broken and error pollutes the console 5 times per game session.

---

### Static Analysis Findings — Browser Confirmation Status

| Static Issue | Browser Status | Notes |
|-------------|----------------|-------|
| Issue 1: we-btn < 44px | **CONFIRMED** | Measured 40.5px in browser. option-btn = 44.5px (borderline pass) |
| Issue 2: No aria-live on feedback | **CONFIRMED** | `querySelectorAll('[aria-live]')` returns empty array |
| Issue 3: SVG font-size="5" labels | Not measured | SVG renders in browser but label size not critical-path tested |
| Issue 4: SVG muted lines #94a3b8 | Not tested (color) | Contrast concern unchanged |
| Issue 5: Correct feedback 1200ms | **CONFIRMED** | Auto-dismissed before 1.5s wait completed |
| Issue 6: Skip note inconsistency | Noted | 2000ms path used in test (Skip button) |
| Issue 7: No live score | **CONFIRMED** | Score only in results — which are now blank (see P0) |
| Static note: Results = CDN overlay (not P0) | **RETRACTED** | Results ARE CDN overlay but content is blank — P0 confirmed |

---

### Updated Summary

| # | Issue | Severity | Classification | Browser Status |
|---|-------|----------|---------------|---------------|
| P0-A | Victory screen blank — `show('victory')` not supported | **P0** | (a) Gen prompt rule | NEW (browser-only) |
| P0-B | Start screen SVG icon renders as escaped text | **P0** | (a) Gen prompt rule | NEW (browser-only) |
| NEW-1 | ProgressBar `totalLives: 0` throws RangeError ×5 | Medium | (a) Gen prompt rule | NEW (browser-only) |
| 1 | we-btn (Got it/Skip) 40.5px < 44px minimum | High | (a) Gen prompt rule | CONFIRMED |
| 2 | No aria-live on feedback elements | High | (a) Gen prompt rule | CONFIRMED |
| 3 | SVG labels font-size="5" | Medium | (a) Gen prompt rule | Unretracted |
| 4 | SVG muted lines #94a3b8 < WCAG 3:1 | Medium | (a) Gen prompt rule | Unretracted |
| 5 | Correct feedback 1200ms auto-dismiss | Low | (b) Spec addition | CONFIRMED |
| 6 | Skip note duration inconsistent | Low | (b) Spec addition | Noted |
| 7 | No live score display | Low | (c) CDN constraint | CONFIRMED (moot — results broken) |

**Total: 10 issues** — 2 new P0s (browser-only), 1 new medium, 7 carried from static analysis

**Build queue recommendation:** Re-queue after fixing P0-A (`show('victory')` → object-based call) and P0-B (SVG → emoji in icons array). Both are gen prompt rule fixes — not spec changes.

---

### Cross-Slot Handoffs (Browser Playthrough — NEW)

#### → Gen Quality (urgent gen prompt rules)
- **GEN-TS-001 (NEW P0):** Prohibit `transitionScreen.show('victory', ...)` — must always use object-based form `show({ icons, title, subtitle, buttons })`
- **GEN-TS-002 (NEW P0):** Prohibit SVG strings in `icons` array — use emoji only (e.g. `['🎉']`, `['🔺']`)
- **GEN-PB-001 (NEW medium):** Do not set `totalLives: 0` when no lives system — omit or use positive value; else ProgressBar.update() throws RangeError

#### → Build queue
**Re-queue required.** 2 P0 visual/flow bugs found:
1. Victory screen blank (no score, no Play Again) — user dead-ends
2. Start screen SVG icon renders as code text (visually broken)
Both require gen prompt rule changes, then re-queue to verify.
