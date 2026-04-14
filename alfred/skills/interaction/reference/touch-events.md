# Touch Events & Hit Detection

How to choose event types, handle pointer events, detect hits during drag, and suppress unwanted browser gestures.

---

## Event Type Decision Tree

```
Does the interaction involve the finger MOVING while pressed (drag, swipe, path)?
│
├─ YES → Use POINTER EVENTS
│   │
│   ├─ Is it a continuous drag (path drawing, item follows finger)?
│   │   YES → pointerdown + pointermove + pointerup + pointercancel
│   │          pointermove/pointerup/pointercancel on DOCUMENT
│   │          Use elementFromPoint() for hit detection
│   │          preventDefault on pointerdown AND pointermove
│   │          touch-action: none on drag surface / draggable items
│   │
│   └─ Is it a swipe gesture (tap then flick)?
│       YES → pointerdown + pointerup (NO pointermove needed)
│              Compute direction from delta on pointerup
│              SWIPE_THRESHOLD = 30px
│              preventDefault on pointerdown only
│
└─ NO → Use CLICK events
    │
    ├─ Is it a text/number input?
    │   YES → keydown (Enter key) + click (Submit button)
    │          preventDefault on Enter key (prevents form submit)
    │          inputmode="numeric" for numbers
    │
    └─ NO → click on buttons/cells
             touch-action: manipulation on targets
             NO preventDefault needed
```

---

## Why Pointer Events (Not Touch Events)

| Feature | Pointer Events | Touch Events |
|---------|---------------|-------------|
| Mouse support | Built-in | Requires separate mouse listeners |
| Unified API | `pointerdown` works for touch, mouse, pen | `touchstart` is touch-only |
| Browser support | All modern browsers, Android 5+ | Same |
| `pointercancel` | Handles OS interruptions | `touchcancel` exists but less consistent |
| Standard | W3C Pointer Events spec | Legacy (predates pointer events) |

**Rule:** Always use pointer events for drag/swipe. Never use `touchstart`/`touchmove`/`touchend`.

---

## Pointer Event Lifecycle

### For Continuous Drag (Patterns 5, 6)

```
User presses finger
  → pointerdown fires on the target element
  → e.preventDefault() — suppress scroll
  → Start drag state

User moves finger
  → pointermove fires on DOCUMENT (not original target!)
  → e.preventDefault() — suppress scroll
  → Use elementFromPoint(clientX, clientY) to find element under finger
  → Update drag state

User lifts finger
  → pointerup fires on DOCUMENT
  → End drag state, evaluate

OS interrupts (call, gesture)
  → pointercancel fires on DOCUMENT
  → Clean up drag state (same as pointerup)
```

### For Swipe (Pattern 4)

```
User presses finger
  → pointerdown fires on grid
  → e.preventDefault()
  → Record startX, startY
  → Handle selection (tap part)

User lifts finger
  → pointerup fires on DOCUMENT
  → Compute dx = clientX - startX, dy = clientY - startY
  → If |dx| < 30 AND |dy| < 30 → just a tap, no swipe
  → If |dx| > |dy| → horizontal (right if dx > 0, left otherwise)
  → Else → vertical (down if dy > 0, up otherwise)
  → Execute swipe action
```

---

## Hit Detection During Drag

### The Problem

During a `pointermove`, the `e.target` property gives the element where the pointer was **originally captured** (where `pointerdown` happened), NOT the element currently under the finger. This is by design (pointer capture).

### The Solution

```javascript
document.addEventListener('pointermove', function(e) {
  if (!isDragging) return;
  e.preventDefault();

  // Get the actual element under the finger
  var el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return;

  // Find the nearest game element (grid cell, drop zone, etc.)
  var cell = el.closest('.grid-cell');
  if (!cell) return;

  // Now work with the correct cell
  var row = parseInt(cell.dataset.row);
  var col = parseInt(cell.dataset.col);
  handleDragOver(row, col);
});
```

### Why `closest()`

`elementFromPoint` may return a child element inside the cell (e.g., a text span, an icon). `.closest('.grid-cell')` walks up the DOM tree to find the actual cell element.

### For Drop Zones

```javascript
// During drag — highlight the zone under the finger
var el = document.elementFromPoint(x, y);
var zone = el ? el.closest('.drop-zone') : null;

// Clear all previous highlights
document.querySelectorAll('.drop-hover').forEach(function(z) {
  z.classList.remove('drop-hover');
});

// Highlight current zone
if (zone) zone.classList.add('drop-hover');
```

---

## Listener Attachment Rules

### Where to attach each event

| Event | Attach to | Why |
|-------|-----------|-----|
| `pointerdown` | The grid/container element | Scoped to the interaction area |
| `pointermove` | `document` | Finger may drift outside the grid during drag |
| `pointerup` | `document` | Finger may lift outside the grid |
| `pointercancel` | `document` | OS events fire on document |
| `click` | Individual buttons/cells | Direct target, no drift concern |
| `keydown` | The input element | Scoped to the input |

### Preventing duplicate listeners

```javascript
var gridListenersAttached = false;

function attachGridListeners() {
  if (gridListenersAttached) return;
  gridListenersAttached = true;

  grid.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointermove', handlePointerMove);
  document.addEventListener('pointerup', handlePointerUp);
  document.addEventListener('pointercancel', handlePointerCancel);
}
```

**Why the guard:** `loadRound()` may re-render the grid's `innerHTML`, which destroys the grid's `pointerdown` listener but NOT the document-level listeners. Without the guard, calling `attachGridListeners()` per round would stack document listeners.

**Alternative for grid-level listeners:** If the grid element itself is replaced (via `innerHTML`), re-attach `pointerdown` on each render — it's safe because the old element (and its listener) is garbage collected. Only document-level listeners need the guard.

---

## preventDefault Rules

| Event | Call `preventDefault`? | Why |
|-------|----------------------|-----|
| `pointerdown` (drag/swipe) | **Yes** | Without it, the browser scrolls the page instead of dragging |
| `pointermove` (drag) | **Yes** | Without it, the browser scrolls during continuous drag |
| `pointerup` | No | Nothing to prevent — the gesture is already over |
| `pointercancel` | No | Browser has already cancelled the gesture |
| `click` | No | Click is the final event, no default to prevent |
| `keydown` (Enter) | **Yes** | Without it, Enter may submit a `<form>` and reload the page |

---

## `touch-action` CSS Property

Controls which touch gestures the browser handles natively vs which are passed to JavaScript.

| Value | What it does | When to use |
|-------|-------------|-------------|
| `manipulation` | Allows pan + pinch-zoom, disables double-tap-zoom | Tap-based patterns (buttons, cells) |
| `none` | Disables ALL browser touch handling — gives full control to JS | Drag-and-drop items, continuous drag surfaces |
| (default) | Browser handles everything (scroll, zoom, etc.) | Non-interactive areas, text input |

### Application by pattern

```css
/* Tap patterns (1, 2, 3, 8) — suppress double-tap zoom */
.option-btn, .grid-tile, .left-cell, .right-cell, .grid-cell {
  touch-action: manipulation;
}

/* Drag patterns (5, 6) — full JS control */
.draggable {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Continuous drag grid (pattern 5) — prevent scroll during path draw */
#game-grid.drag-grid {
  touch-action: none;
}

/* Input (pattern 7) — default (let browser handle keyboard) */
#answer-input {
  /* No touch-action override */
}
```

---

## Gesture Suppression (Applied Globally)

These prevent common mobile browser behaviors that break gameplay:

```css
/* Prevent pull-to-refresh */
html, body {
  overscroll-behavior: none;
}

/* Prevent text selection in game area */
.game-wrapper {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Re-enable selection in inputs */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}

/* Prevent long-press context menu on game elements */
.option-btn, .grid-cell, .draggable {
  -webkit-touch-callout: none;
}
```

---

## Swipe Detection Reference

```javascript
var SWIPE_THRESHOLD = 30; // pixels — below this, it's a tap

function detectSwipe(startX, startY, endX, endY) {
  var dx = endX - startX;
  var dy = endY - startY;

  // Too small — not a swipe
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
    return null;
  }

  // Determine primary axis
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}
```

**Why 30px:** Smaller thresholds cause accidental swipes on tap. Larger thresholds make intentional swipes feel unresponsive. 30px is the established standard from shipped games.

---

## `pointercancel` Handling

`pointercancel` fires when the OS interrupts the pointer gesture:
- Incoming phone call
- System gesture (swipe from edge)
- Palm rejection on tablets
- Browser decides to handle the gesture (scroll/zoom)

**Always** attach a `pointercancel` handler on drag patterns. It should clean up the same state as `pointerup`:

```javascript
document.addEventListener('pointercancel', function(e) {
  // Same cleanup as pointerup
  if (gameState.isDragging) {
    gameState.isDragging = false;
    // Reset drag visual state
  }
  if (gameState.dragItem) {
    snapBack(gameState.dragItem);
    gameState.dragItem = null;
  }
});
```

Without this, the drag gets stuck in an active state after an OS interruption.
