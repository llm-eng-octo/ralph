# Touch and Input

Rules for touch target sizing, thumb zone layout, keyboard handling, gesture suppression, and input focus management.

---

## 1. Touch Target Size (CRITICAL)

Minimum size: 44x44 CSS pixels. No exceptions.

```css
.game-btn,
.option-btn,
.grid-cell,
[role="button"],
button,
input[type="submit"],
a {
  min-height: 44px;
  min-width: 44px;
  /* Why: 44px is Apple HIG minimum for reliable thumb taps; smaller targets cause mis-taps on budget phones */
}
```

---

## 2. Touch Target Spacing (STANDARD)

Minimum spacing between adjacent targets: 8px.

```css
.option-btn + .option-btn {
  margin-top: 8px;
  /* Why: prevents accidental taps on the wrong button when two 44px targets are flush */
}

.grid-cell {
  /* When using gap in a grid/flex container */
  /* gap: 8px; -- see cross-browser.md for gap alternatives */
}
```

If two 44px buttons are flush with no gap, a student's thumb hits both.

---

## 3. Thumb Zone (STANDARD)

Interactive elements MUST be in the lower 60% of the screen.

```
 +-------------------+
 |                   |  <- Top 40%: question text, diagrams,
 |   Question /      |     progress bar, informational content
 |   Diagram area    |
 |                   |
 +-------------------+  <- 40% line
 |                   |
 |   Option buttons  |  <- Bottom 60%: all tappable elements
 |   Submit button   |     (options, submit, input fields)
 |   Input fields    |
 |                   |
 +-------------------+
```

This layout matches one-handed phone use. The `.content-fill` flexbox from PART-021 already pushes content toward vertical center, but option buttons and submit MUST be below the question, never above it.

---

## 4. Disabled Targets (STANDARD)

```css
.game-btn:disabled,
.option-btn.disabled {
  opacity: 0.6;
  pointer-events: none; /* Why: prevents ghost taps on disabled buttons that could corrupt game state */
  cursor: not-allowed;
}
```

---

## 5. Keyboard Input Mode (CRITICAL)

```html
<!-- Number input — shows numeric keypad -->
<input type="text" inputmode="numeric" pattern="[0-9]*" id="answer-input"
       placeholder="Type your answer" autocomplete="off">
<!-- Why: type="number" has spinner arrows on desktop and inconsistent behavior across mobile browsers;
     inputmode="numeric" gives a clean numeric keypad; pattern="[0-9]*" triggers iOS numeric keyboard -->
```

- Use `type="text"` with `inputmode="numeric"`, NOT `type="number"`.
- `pattern="[0-9]*"` triggers the numeric keypad on iOS Safari.
- Add `autocomplete="off"` to prevent autofill overlays.

---

## 6. Question Visibility with Keyboard (STANDARD)

```javascript
// Scroll question into view when keyboard appears
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', function() {
    // Why: visualViewport reports actual visible area excluding keyboard;
    // without this, the question scrolls off-screen and the student can't see what they're answering
    var input = document.activeElement;
    if (input && input.tagName === 'INPUT') {
      var question = document.querySelector('.question-text');
      if (question) {
        question.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
}
```

The `visualViewport` API reports the actual visible area (excluding keyboard). When the viewport shrinks (keyboard opens), scroll the question into view.

---

## 7. FeedbackManager Overlay with Keyboard (CRITICAL)

When the on-screen keyboard reduces the viewport, FeedbackManager feedback overlays (correct/incorrect toasts, explanations) MUST remain visible within the reduced viewport.

```javascript
// When showing feedback while keyboard may be open, position relative to visualViewport
if (window.visualViewport) {
  var vpHeight = window.visualViewport.height;
  // Why: FeedbackManager overlays positioned at bottom of full viewport are invisible
  // when keyboard consumes 40% of screen; use visualViewport.height to stay visible
  feedbackOverlay.style.bottom = (window.innerHeight - vpHeight) + 'px';
}
```

Ensure feedback overlays use `position: fixed` with bottom offset adjusted for the keyboard, or are placed inline within the scrollable game area above the input.

---

## 8. Submit on Enter (CRITICAL)

```javascript
document.getElementById('answer-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault(); // Why: without preventDefault, Enter may submit a <form> and reload the page
    handleSubmit();
  }
});
```

Without this, pressing Enter on the mobile keyboard does nothing (or worse, submits a form and reloads the page).

---

## 9. Input Focus Management (STANDARD)

```javascript
// After processing an answer, blur the input to dismiss keyboard
function afterAnswerProcessed() {
  document.getElementById('answer-input').blur();
  // ... show feedback, advance round, etc.
}

// On next round, do NOT auto-focus the input
// Let the student tap it when ready
```

Never call `.focus()` on an input during a screen transition — it causes the keyboard to flash open and closed.

---

## 10. Pull-to-Refresh Suppression (CRITICAL)

```css
html, body {
  overscroll-behavior: none;
  /* Why: prevents pull-to-refresh on Android Chrome, which reloads the page and destroys game state mid-round */
}
```

Without this, swiping down on Android Chrome triggers pull-to-refresh, reloading the game mid-round. Apply to both `html` and `body`.

---

## 11. Double-Tap Zoom Suppression (STANDARD)

```css
button,
.option-btn,
.grid-cell,
input,
[role="button"] {
  touch-action: manipulation;
  /* Why: disables double-tap-to-zoom, eliminating the 300ms tap delay on older browsers
     and preventing accidental zoom when tapping options quickly */
}
```

`touch-action: manipulation` allows panning and pinch-zoom but disables double-tap-to-zoom.

---

## 12. Long-Press Context Menu Suppression (STANDARD)

```css
.game-wrapper {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* Why: long-pressing a button shows a context menu (copy/share) that interrupts gameplay */
}

/* But allow selection in text inputs */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
```

---

## 13. Text Selection on Drag (STANDARD)

```css
.draggable,
.drop-zone {
  touch-action: none; /* Why: gives full touch control to JS drag handlers, preventing browser scroll/zoom interference */
  -webkit-user-select: none;
  user-select: none;
}
```
