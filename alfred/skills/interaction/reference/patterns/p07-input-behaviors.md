# P7 Required Input Behaviors

Companion to `p07-text-input.md`. Every **Text/Number Input** game must implement these two UX behaviors in addition to the base P7 pattern.

## When to use

Every P7 game. These are **mandatory**, not optional. The base P7 pattern covers Enter/Submit, keyboard dismissal, and `visualViewport`; this file covers:

1. **Auto-focus + scroll-into-view on tap** — the user should never have to manually scroll to type, and the input should never sit under the virtual keyboard.
2. **Auto-growing width** — the input starts compact and grows with content up to a hard cap. Without this, a fixed-width input either looks empty (too wide for "7") or truncates ("1234567").

---

## Behavior 1 — Auto-focus + Scroll-Into-View

### Required UX

| Trigger | Behavior |
|---------|----------|
| Click/tap the input | Input receives focus **and** scrolls to center of viewport (above virtual keyboard) |
| Programmatic `focus()` (e.g. round transition) | Same scroll-into-view |
| `visualViewport` resize (keyboard opens) | Re-scroll input into view |

### Implementation

```javascript
var input = document.getElementById('answer-input');
var inputWrap = input.parentElement;

function focusAndScroll() {
  input.focus({ preventScroll: true });
  // Give the browser a tick for virtual-keyboard layout
  setTimeout(function() {
    inputWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

input.addEventListener('click', focusAndScroll);
input.addEventListener('focus', function() {
  // Tab / programmatic focus — still scroll into view
  setTimeout(function() {
    inputWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
});

// Re-scroll when the virtual keyboard opens
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', function() {
    if (document.activeElement === input) {
      setTimeout(function() {
        inputWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  });
}
```

### Required CSS

```css
.input-wrap {
  /* Ensure scrollIntoView leaves room for top chrome and virtual keyboard */
  scroll-margin-top: 24px;
  scroll-margin-bottom: 280px;
}

body {
  /* Bottom padding so the input can reach vertical center even on the last screen */
  padding-bottom: 320px;
  min-height: 100vh;
}
```

### Why wrap the input

Always call `scrollIntoView` on a **wrapper span/div** around the input (not the input itself). On iOS Safari, `input.scrollIntoView()` sometimes triggers the browser's own caret-scroll, which conflicts with `smooth` behavior. Scrolling the wrapper is reliable across browsers.

### Anti-patterns

1. Calling `scrollIntoView({ block: 'start' })` — puts the input flush with the top, leaving no breathing room for the question above it.
2. Calling `focus()` without `preventScroll: true` — causes a double-scroll (browser default + our smooth scroll).
3. Omitting the `setTimeout` — scrollIntoView fires before the virtual keyboard has resized the viewport, and the input ends up hidden behind the keyboard again.
4. Calling `scrollIntoView` on the `<input>` directly — unreliable on iOS.

---

## Behavior 2 — Auto-Growing Width

### Required UX

| State | Width |
|-------|-------|
| Empty | `MIN_W` (the "compact" size, fits 1 digit) |
| 1–N chars (short answer) | Grows proportionally with content |
| Typed beyond the visible cap | Clamped at `MAX_W` |
| User deletes chars | Shrinks back toward `MIN_W` |

**Default values:** `MIN_W = 72px`, `MAX_W = 300px`, `CHAR_W ≈ 22px` per digit at 28px bold tabular-nums font. Recalibrate `CHAR_W` if the font size or family changes.

### Implementation

```javascript
var MIN_W = 72;
var MAX_W = 300;
var CHAR_W = 22;         // visual width per digit at the input's font size
var BASE_PADDING = 28;   // horizontal padding + border (measured, not guessed)

function updateInputWidth() {
  var len = input.value.length;
  var target = len === 0
    ? MIN_W
    : Math.min(MAX_W, Math.max(MIN_W, len * CHAR_W + BASE_PADDING));
  input.style.width = target + 'px';
}

input.addEventListener('input', function() {
  // Numeric filter — mobile keyboards sometimes send other characters
  var cleaned = input.value.replace(/[^0-9-]/g, '');
  if (cleaned !== input.value) input.value = cleaned;
  updateInputWidth();
  // Clear transient feedback colors while editing
  input.classList.remove('input-correct', 'input-wrong');
});
```

### Required CSS

```css
#answer-input {
  width: 72px;          /* initial MIN_W */
  min-width: 72px;
  max-width: 300px;     /* belt-and-suspenders with the JS cap */
  font-size: 16px;      /* required anyway to prevent iOS zoom */
  font-variant-numeric: tabular-nums;  /* equal-width digits so CHAR_W is predictable */
  transition: width 140ms ease-out;    /* smooth resize */
}
```

### Measuring `CHAR_W` for a non-default font

If the input uses a font other than the system default at 28px bold, recalibrate:

1. Render the input with 5 digits: `<input value="12345">`.
2. Measure the input's rendered width minus `BASE_PADDING`.
3. Divide by 5. That is your `CHAR_W`.

Don't assume — a 5px miscalibration accumulates quickly and the input either clips digits or has a lopsided right gap.

### Anti-patterns

1. **Using `ch` units** (`width: calc(${len}ch + 2rem)`) — `ch` is the width of the "0" character in the font, which is unreliable for proportional fonts and for `font-variant-numeric` that the browser applies late. Pixel math against calibrated `CHAR_W` is more predictable.
2. **Using a hidden `<span>` mirror + `offsetWidth`** — works, but requires keeping the span's padding and font in sync with the input. Overkill for monospaced-digit inputs.
3. **Forgetting `font-variant-numeric: tabular-nums`** — with proportional digits, "1111" is much narrower than "8888"; `CHAR_W` becomes meaningless.
4. **No `transition`** — the input snaps width on every keystroke, which reads as a glitch.
5. **Growing but never shrinking** — looks broken when the user backspaces: the empty input still displays at 300px width.

---

## Combined Verification Checklist

When building a P7 game, verify ALL of:

- [ ] Clicking the input focuses it **and** scrolls it into view
- [ ] On mobile (simulated visualViewport), the input sits above the virtual keyboard when focused
- [ ] Initial input width equals `MIN_W`
- [ ] Width is non-decreasing as characters are typed (from `MIN_W` upward)
- [ ] Width never exceeds `MAX_W`, even when content overflows
- [ ] Width shrinks when characters are deleted
- [ ] Non-numeric characters filtered out (numeric games only)
- [ ] `font-variant-numeric: tabular-nums` present on the input
- [ ] `transition: width 140ms ease-out` present on the input
- [ ] `scroll-margin-top` and `scroll-margin-bottom` set on the wrapper
- [ ] Body has `padding-bottom` large enough to scroll the input to center even on the last screen
- [ ] `visualViewport` resize re-scrolls when keyboard opens

---

## Reference Implementation

`games/sum-quiz/index.html` implements both behaviors with 19/19 passing Playwright tests covering:

- Initial width 72px
- Click auto-focuses
- Scrolled into view (top ≥ 0, bottom ≤ viewportH)
- Width non-decreasing on type
- Widths in [72, 300]
- Caps at 300px
- Shrinks on delete
- Non-numeric filtered

Use this as the known-good baseline when adding P7 to a new game.
