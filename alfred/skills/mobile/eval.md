# Eval: Mobile Device Constraints

Tests for `skills/mobile/SKILL.md` -- the skill that defines every constraint a game must satisfy to render correctly on budget Android phones.

## Version

v1 -- 2026-04-04 -- initial eval with priority tags, checklist format, judge types

## Setup

Context files that must be loaded before running:

- `skills/mobile/SKILL.md` (viewport, touch targets, typography, safe areas, keyboard, orientation, gestures, performance, cross-browser, CSS variables)
- `skills/game-archetypes.md` (archetype profiles reference mobile skill)

## Success Criteria

A mobile constraint check passes when ALL of the following are true:

1. **Viewport configured correctly.** Meta tag present, max-width constrained, dvh used, no horizontal scroll.
2. **Touch targets meet minimums.** 44x44px minimum, 8px spacing, interactive elements in lower 60%.
3. **Typography uses CSS variables.** No hardcoded fonts/sizes/colors. Inputs at 16px+ to prevent Safari zoom.
4. **Cross-browser safe.** No banned CSS (flexbox gap, :has(), aspect-ratio) or JS (optional chaining, nullish coalescing) features.
5. **Performance within budget.** HTML under 500KB, DOM under 500 elements, no continuous animations.
6. **Gestures suppressed.** overscroll-behavior: none, touch-action: manipulation, user-select: none on game wrapper.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Fully compliant MCQ Quiz HTML

**Priority:** P0
**Type:** happy-path
**Judge:** auto

**Input:**

```html
<!-- Well-formed MCQ game using all --mathai-* variables,
     correct viewport meta, dvh heights, 44px buttons,
     touch-action: manipulation, overscroll-behavior: none,
     no flexbox gap, no optional chaining, portrait lock,
     safe area insets, 16px input fonts -->
```

**Expect:**

- [ ] Viewport meta tag matches exact required format (width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no)
- [ ] .game-wrapper has max-width: var(--mathai-game-max-width)
- [ ] Uses 100dvh with @supports fallback for 100vh
- [ ] overflow-x: hidden on html, body, and .game-stack
- [ ] All buttons/options have min-height: 44px and min-width: 44px
- [ ] Adjacent touch targets have at least 8px spacing (margin, not gap)
- [ ] Font family uses var(--mathai-font-family), no bare custom fonts
- [ ] All colors use --mathai-* variables, no hardcoded hex
- [ ] overscroll-behavior: none on html and body
- [ ] touch-action: manipulation on all interactive elements
- [ ] Landscape media query present with rotation message

**Why:** Happy path -- confirms all 10 constraint sections validate on well-formed input.

---

### Case 2: Common violations in generated HTML

**Priority:** P0
**Type:** error-handling
**Judge:** auto

**Input:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Missing: maximum-scale=1.0, user-scalable=no -->

<style>
  .page-center { min-height: 100vh; }  /* Should be 100dvh */
  .options-list { display: flex; gap: 8px; }  /* Banned: flexbox gap */
  .option-btn { min-height: 36px; }  /* Below 44px minimum */
  .question-text { font-size: 12px; color: #aaaaaa; }  /* Hardcoded, too small */
  input { font-size: 14px; }  /* Below 16px -- Safari auto-zoom */
</style>

<script>
  var score = gameState?.score?.total;  /* Banned: optional chaining */
  var items = Array.from(list).at(0);   /* Banned: Array.at() */
</script>
```

**Expect:**

- [ ] FAIL: viewport meta missing maximum-scale and user-scalable
- [ ] FAIL: 100vh used instead of 100dvh
- [ ] FAIL: flexbox gap used (must use margin)
- [ ] FAIL: touch target below 44px minimum (36px)
- [ ] FAIL: font-size 12px below 14px minimum
- [ ] FAIL: hardcoded color #aaaaaa instead of --mathai-* variable
- [ ] FAIL: input font-size 14px causes Safari auto-zoom (must be 16px+)
- [ ] FAIL: optional chaining (?.) used -- banned JS feature
- [ ] FAIL: Array.at() used -- banned JS feature
- [ ] Each violation lists the specific section and rule from the skill

**Why:** Tests detection of the 9 most common mobile violations from real pipeline builds. Every one of these has caused a production failure.

---

### Case 3: Number input with keyboard handling

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```html
<input type="text" inputmode="numeric" pattern="[0-9]*"
       id="answer-input" placeholder="Type your answer"
       autocomplete="off" style="font-size: 16px;
       -webkit-appearance: none; appearance: none;">

<script>
  document.getElementById('answer-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() {
      var input = document.activeElement;
      if (input && input.tagName === 'INPUT') {
        document.querySelector('.question-text').scrollIntoView({
          behavior: 'smooth', block: 'start'
        });
      }
    });
  }
</script>
```

**Expect:**

- [ ] type="text" with inputmode="numeric" (not type="number")
- [ ] pattern="[0-9]*" present for iOS numeric keypad
- [ ] autocomplete="off" prevents autofill overlays
- [ ] font-size: 16px prevents Safari auto-zoom
- [ ] -webkit-appearance: none AND appearance: none present
- [ ] Enter key handler calls preventDefault and handleSubmit
- [ ] visualViewport resize listener scrolls question into view
- [ ] [LLM] After answer processed, input should be blurred (keyboard dismissal)

**Why:** Tests the complete keyboard handling pattern -- the most complex mobile constraint for games with number input.

---

### Case 4: Performance budget -- oversized game

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
HTML file: 620KB
DOM elements at peak: 780
Contains: 3 continuous CSS animations during gameplay
Contains: undebounced window resize handler
Renders all 9 rounds in DOM simultaneously
```

**Expect:**

- [ ] FAIL: file size 620KB exceeds 500KB limit
- [ ] FAIL: 780 DOM elements exceeds 500 element budget
- [ ] FAIL: continuous animations during gameplay (only momentary feedback animations allowed)
- [ ] FAIL: undebounced resize handler (must debounce at 150ms)
- [ ] FAIL: all rounds rendered simultaneously (must render only current round)
- [ ] [LLM] Recommendations: lazy-render rounds, remove background animations, compress/minify, reduce inline SVG
- [ ] [LLM] Performance impact described in terms of target device (Snapdragon 400, 2GB RAM, 3G connection)

**Why:** Tests the performance constraint section against a game that would work fine on a developer's MacBook but fail on the target budget Android phone.

---

### Case 5: Cross-skill -- mobile layout compatible with feedback timing

**Priority:** P1
**Type:** cross-skill
**Judge:** llm

**Input:**

```
Game: Lives Challenge with number input
Bloom: L3 Apply
Mobile device: 375x667

Student types answer in input field.
Keyboard opens (covers ~40% of screen).
Student submits wrong answer.
Feedback plays (2000ms).
Keyboard should dismiss.
Next round renders with new question.
```

**Expect:**

- [ ] Question text remains visible while keyboard is open (visualViewport handler)
- [ ] After wrong answer: input.blur() dismisses keyboard before feedback plays
- [ ] Feedback overlay (FeedbackManager) is visible in remaining screen space
- [ ] .correct-reveal element is not hidden behind keyboard
- [ ] Auto-advance after 2000ms does NOT auto-focus the next round's input (no keyboard flicker)
- [ ] [LLM] Sequence: submit -> blur input -> record attempt -> play feedback -> 2000ms -> fade out -> render next round -> student taps input when ready
- [ ] [LLM] Touch target for submit button is 44px+ and in lower 60% of screen

**Why:** Tests that mobile layout constraints and feedback timing work together during the most complex interaction: number input on a small screen with keyboard management.

---

## Eval Scoring

| Result | Meaning |
|--------|---------|
| PASS | All assertions in Expect checklist pass |
| PARTIAL | Some assertions fail -- note which ones |
| FAIL | Critical assertions fail or output is fundamentally wrong |

## Ship Gate Check

| Case | Priority | Required result |
|------|----------|----------------|
| Case 1: Fully compliant HTML | P0 | PASS |
| Case 2: Common violations | P0 | PASS |
| Case 3: Keyboard handling | P0 | PASS |
| Case 4: Performance budget | P1 | PASS or PARTIAL |
| Case 5: Cross-skill mobile+feedback | P1 | PASS or PARTIAL |
