# UI/UX Audit — which-ratio

**Build:** #560
**Date:** 2026-03-23
**URL:** https://storage.googleapis.com/mathai-temp-assets/games/which-ratio/builds/560/index.html
**Method:** Code-level audit (HTML + JS analysis; CSS was stripped — see Issue 1)

---

## Issue 1 — CRITICAL: Entire CSS stylesheet was stripped (a) Gen prompt rule

**Observation:** The `<style>` block contains only a placeholder comment:
```html
<style>
/* [CSS stripped — 100 chars, not relevant to JS fix] */
</style>
```
All game-specific styles (layout, colours, button sizing, feedback states, worked-example card, SVG container) were removed. No inline `style=` attributes exist. No external CSS `<link>` is present.

**Impact:** The game renders with zero custom styling. `#triangle-diagram`, `#question-panel`, `#option-buttons`, `.option-btn`, `.correct`, `.incorrect`, `.visible` toggle on `#correct-feedback` and `#worked-example-panel` — all rely on CSS classes that have no definitions. The game is visually broken: buttons have no sizing, layout has no structure, the worked-example panel has no appearance or visibility state.

**Root cause:** A previous pipeline fix (Lesson 91/92 smoke-regen dead code) stripped the CSS as part of a surgical JS-only re-generation. The CSS was labelled "not relevant to JS fix" and removed, but it was never restored.

**Classification:** (a) Gen prompt rule — the LLM must never strip the `<style>` block during a targeted fix. Also (c) CDN constraint / T1 check — validate-static.js should flag a `<style>` block containing only a comment with no actual rules.

**Proposed gen prompt rule:**
```
NEVER remove or replace the <style> block during a targeted fix. If the fix is JS-only, preserve the entire CSS verbatim. A <style> block containing only comments (no actual rules) is always a bug — do not generate or accept one.
```

**Proposed T1 check addition (validate-static.js):**
Detect `<style>` blocks whose text content (after stripping comments) is empty or fewer than 20 characters of actual CSS rules. Emit a `CRITICAL` static validation error.

---

## Issue 2 — No min-height/min-width on option buttons (a) Gen prompt rule

**Observation:** Option buttons are created dynamically as `<button class="option-btn">`. Since the CSS is stripped we cannot verify the computed size, but even reviewing the game template, there is no explicit `min-height: 44px` or `padding` value visible in the source. The only sizing comes from whatever CSS was stripped.

**Impact:** On mobile (480px), tap targets below 44px violate iOS/Android HIG minimums and cause miss-taps.

**Classification:** (a) Gen prompt rule — even if CSS is present, buttons should have explicit minimum touch target sizing.

**Proposed gen prompt rule:**
```
All interactive buttons (option-btn, we-btn, any clickable element) MUST have min-height: 44px and min-width: 44px. Tap target sizing must be explicit in the CSS, not inherited or implicit.
```

---

## Issue 3 — No ARIA live regions for feedback announcements (a) Gen prompt rule

**Observation:** The `#correct-feedback` div and `#skip-note` div are shown/hidden via classList toggling `visible`. Neither has `aria-live="polite"` or `role="alert"`. Screen readers will not announce "Correct! sin θ is the right ratio." or the skip feedback text.

**Impact:** The game is inaccessible to screen reader users. Correct/incorrect state changes are invisible to assistive technology.

**Classification:** (a) Gen prompt rule.

**Proposed gen prompt rule:**
```
Feedback elements that appear dynamically (correct/incorrect messages, skip notes, score updates) MUST have aria-live="polite" (or role="alert" for immediate errors). Example: <div id="correct-feedback" aria-live="polite" ...>. This applies to any element whose content changes or visibility toggles after user interaction.
```

---

## Issue 4 — SVG triangle labels use SVG font-size="5" (unitless, tiny) (a) Gen prompt rule

**Observation:** All SVG text labels (A, O, H, θ) use `font-size="5"` as a raw SVG attribute in a 100×60 viewBox. While SVG units scale with the viewBox, a font-size of 5 in a 100-unit-wide canvas renders the labels very small — approximately 5% of the viewBox width. On a 300px rendered canvas that is 15px, but the labels sit at the edge of the triangle and may be clipped or hard to read on small screens.

**Additional concern:** The SVG has no explicit `width`/`height` attributes — it relies purely on the container to size it. Without CSS to define the container dimensions (Issue 1), the SVG may collapse to zero or render at intrinsic size.

**Classification:** (a) Gen prompt rule — SVG diagrams should have explicit `width` and `height` attributes as a fallback, and labels should use relative font-size values.

**Proposed gen prompt rule:**
```
SVG elements used as diagrams MUST have explicit width and height attributes (e.g., width="100%" height="auto" or fixed pixel values) as a fallback for when CSS is unavailable. SVG text labels should use font-size values that are at least 8% of the viewBox height to remain legible at small canvas sizes.
```

---

## Issue 5 — Correct feedback auto-dismisses in 1200ms with no visual persistence option (b) Spec addition

**Observation:** On correct answer, the feedback `"Correct! sin θ is the right ratio."` is shown for exactly 1200ms then removed, and the next round begins automatically. There is no way for the learner to linger on the correct answer.

**Impact:** For slower readers or learners who want to confirm their understanding, 1200ms may be insufficient. This is a pedagogical concern — "correct" should feel rewarding, not rushed.

**Classification:** (b) Spec addition — the game spec should specify minimum feedback display duration and whether the learner can control progression.

**Spec addition proposed:** Add to the which-ratio spec: "Correct feedback must display for a minimum of 1500ms. Consider whether auto-advance vs. learner-controlled advance is appropriate for this game type."

---

## Issue 6 — Skip note uses two different timers (1500ms vs 2000ms) depending on code path (b) Spec addition

**Observation:** When the worked-example "Skip" button is clicked, the skip note auto-dismisses after 1500ms (`handleWorkedExampleSkip`). When a second incorrect attempt is made directly (no worked example shown), the skip note auto-dismisses after 2000ms (`handleOptionClick` else-branch). These are inconsistent for the same user experience (round skipped → skip note shown).

**Impact:** Minor inconsistency but creates a jarring experience if a learner notices the different "feel" between the two paths.

**Classification:** (b) Spec addition — spec should define a single canonical skip-feedback duration.

**Spec addition proposed:** Add to the which-ratio spec: "Skip feedback duration must be consistent across all skip paths (worked-example skip and second-attempt skip). Use a single constant, minimum 1500ms."

---

## Issue 7 — No score or stars shown during gameplay (c) CDN constraint

**Observation:** The `gameState.score` and `gameState.totalFirstAttemptCorrect` (stars) are tracked in state but never displayed in the game UI during play. The CDN `ProgressBarComponent` is configured with `totalLives: 0` and does not expose score. Stars are only revealed on the `TransitionScreenComponent` victory screen at the end.

**Impact:** Learners have no mid-game feedback on their performance. This reduces motivation and makes it hard to know if you are doing well.

**Classification:** (c) CDN constraint — the CDN ProgressBarComponent does not currently support live score display during play. This is a limitation of the component API, not something fixable via gen prompt.

**Note for future CDN update:** If ProgressBarComponent ever exposes a `score` prop, add a gen prompt rule to always pass the live score.

---

## Issue 8 — No visual distinction between muted and highlighted triangle sides' stroke colors (a) Gen prompt rule

**Observation:** The SVG uses `#94a3b8` (slate-400) for muted sides and `#f97316` (orange-500) for highlighted sides. The right-angle symbol and angle arc are hardcoded `stroke="black"` and do not participate in the highlighting system. The SVG lines themselves use `stroke-width="1"` for sides and `stroke-width="0.5"` for decorative elements — these are SVG units, not pixels.

**Impact:** On a small rendered canvas (e.g., 200px wide), a 1-unit stroke in a 100-unit viewBox = 2px. This is borderline legible. The highlighted sides at orange are visually clear, but muted sides at `#94a3b8` on a white background have a contrast ratio of approximately 2.7:1, below the WCAG AA minimum of 3:1 for non-text graphical elements.

**Classification:** (a) Gen prompt rule — SVG decorative/structural lines in diagrams should use sufficient contrast for muted states.

**Proposed gen prompt rule:**
```
SVG diagram lines used to convey information (triangle sides, graph axes, bar outlines) must use a muted stroke color with contrast ratio ≥ 3:1 against the background. #94a3b8 on white fails this threshold. Use #64748b (slate-500) or darker for muted diagram elements.
```

---

## Summary

| # | Issue | Severity | Classification |
|---|-------|----------|---------------|
| 1 | Entire CSS stylesheet stripped — game visually broken | CRITICAL | (a) Gen prompt rule + T1 check |
| 2 | Option buttons have no explicit min touch target (44px) | High | (a) Gen prompt rule |
| 3 | No ARIA live regions on feedback elements | High | (a) Gen prompt rule |
| 4 | SVG has no fallback width/height attributes; labels may be tiny | Medium | (a) Gen prompt rule |
| 5 | Correct feedback auto-dismisses in 1200ms — no learner control | Medium | (b) Spec addition |
| 6 | Skip note duration inconsistent across two code paths | Low | (b) Spec addition |
| 7 | No live score/stars display during gameplay | Low | (c) CDN constraint |
| 8 | Muted SVG lines use #94a3b8 — contrast ratio ~2.7:1, below WCAG AA | Medium | (a) Gen prompt rule |

**Total: 8 issues** — 4 gen prompt rules, 2 spec additions, 2 CDN constraints/T1 checks

---

## Gen Prompt Rules Proposed via this Audit

These are proposed additions to CDN_CONSTRAINTS_BLOCK in lib/prompts.js — not yet applied, pending review:

### Rule A: Never strip the CSS stylesheet
```
NEVER remove or replace the <style> block during a targeted fix. If the fix is JS-only, preserve the entire CSS verbatim. A <style> block containing only comments (no actual rules) is always a bug — do not generate or accept one.
```

### Rule B: Explicit touch target sizing on all buttons
```
All interactive buttons (option-btn, we-btn, any clickable element) MUST have min-height: 44px and min-width: 44px. Tap target sizing must be explicit in the CSS, not inherited or implicit.
```

### Rule C: ARIA live regions on dynamic feedback elements
```
Feedback elements that appear dynamically (correct/incorrect messages, skip notes, score updates) MUST have aria-live="polite" (or role="alert" for immediate errors). Example: <div id="correct-feedback" aria-live="polite" ...>. This applies to any element whose content changes or visibility toggles after user interaction.
```

### Rule D: SVG diagram contrast and fallback dimensions
```
SVG elements used as diagrams MUST have explicit width and height attributes as a fallback. SVG text labels should use font-size values that are at least 8% of the viewBox height. Muted diagram lines must use #64748b or darker (contrast ≥ 3:1 against white) — do NOT use #94a3b8 for muted diagram strokes.
```
