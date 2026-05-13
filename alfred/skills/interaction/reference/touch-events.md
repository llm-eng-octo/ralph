# Touch Events & Hit Detection

How to choose event types, handle pointer events, detect hits during raw-pointer drag, and suppress unwanted browser gestures. **P6 drag-and-drop is NOT covered here** — it uses `@dnd-kit/dom` (`manager.monitor` events + the library's pointer sensor) instead of raw pointer events. See `patterns/p06-drag-and-drop.md`.

---

## Event Type Decision Tree

```
Is it P6 (drag-and-drop into zones / grid cells)?
│
├─ YES → Use @dnd-kit/dom — DragDropManager + Draggable + Droppable + manager.monitor
│         NEVER raw pointer events. The library owns pointerdown/move/up/cancel internally.
│         See patterns/p06-drag-and-drop.md.
│
└─ NO → Does the interaction involve the finger MOVING while pressed (continuous drag P5, directional drag P13)?
    │
    ├─ YES → Use RAW POINTER EVENTS
    │   │
    │   └─ Continuous drag (path drawing) / directional drag (constrained axis)
    │       → pointerdown + pointermove + pointerup + pointercancel
    │          pointermove/pointerup/pointercancel on DOCUMENT
    │          Use elementFromPoint() for hit detection (P5)
    │          preventDefault on pointerdown AND pointermove
    │          gesture CSS is owned by the mobile skill
    │
    └─ NO → Use CLICK events
        │
        ├─ Is it a text/number input?
        │   YES → keydown (Enter key) + click (Submit button)
        │          preventDefault on Enter key (prevents form submit)
        │          input mode / keyboard rules are owned by the mobile skill
        │
        └─ NO → click on buttons/cells
                 target sizing / gesture CSS is owned by the mobile skill
                 NO preventDefault needed
```

> P4 (Tap + Swipe) is **deprecated** — convert to P1 tap-only with directional buttons. Historical swipe-detection material lives in [`deprecated-p04-swipe.md`](./deprecated-p04-swipe.md); do not load it during normal game generation.

---

## Why Pointer Events (Not Touch Events)

| Feature | Pointer Events | Touch Events |
|---------|---------------|-------------|
| Mouse support | Built-in | Requires separate mouse listeners |
| Unified API | `pointerdown` works for touch, mouse, pen | `touchstart` is touch-only |
| Browser support | All modern browsers, Android 5+ | Same |
| `pointercancel` | Handles OS interruptions | `touchcancel` exists but less consistent |
| Standard | W3C Pointer Events spec | Legacy (predates pointer events) |

**Rule:** Use pointer events for raw-pointer drag (P5, P13). Use `@dnd-kit/dom` for drag-and-drop (P6) — it owns the pointer lifecycle internally. Never use `touchstart`/`touchmove`/`touchend` directly.

---

## Pointer Event Lifecycle

### For Continuous Drag (Pattern 5) and Directional Drag (Pattern 13)

```
User presses finger
  → pointerdown fires on the target element
  → e.preventDefault() — suppress scroll
  → Start drag state

User moves finger
  → pointermove fires on DOCUMENT (not original target!)
  → e.preventDefault() — suppress scroll
  → Use elementFromPoint(clientX, clientY) to find element under finger (P5 only — P13 uses pointer delta along the constrained axis)
  → Update drag state

User lifts finger
  → pointerup fires on DOCUMENT
  → End drag state, evaluate

OS interrupts (call, gesture)
  → pointercancel fires on DOCUMENT
  → Clean up drag state (same as pointerup)
```

> Drag-and-drop (P6) does NOT run this lifecycle. `@dnd-kit/dom` owns pointerdown/move/up/cancel internally; subscribe to `manager.monitor` events (`dragstart`, `dragend`) instead.

### ~~For Swipe (Pattern 4)~~ — DEPRECATED

Pattern 4 was retired because swipe is unreliable on mobile. New games must use P1 tap-only with directional buttons. Historical implementation details live in [`deprecated-p04-swipe.md`](./deprecated-p04-swipe.md) for legacy maintenance only.

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
| `pointerdown` (P5, P13) | The grid/container element | Scoped to the interaction area |
| `pointermove` (P5, P13) | `document` | Finger may drift outside the grid during drag |
| `pointerup` (P5, P13) | `document` | Finger may lift outside the grid |
| `pointercancel` (P5, P13) | `document` | OS events fire on document |
| `manager.monitor` `dragstart`/`dragend` (P6) | `@dnd-kit/dom` `DragDropManager` instance | Library-owned event bus; do not attach raw pointer listeners alongside |
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
| `pointerdown` (P5, P13) | **Yes** | Without it, the browser scrolls the page instead of dragging |
| `pointermove` (P5, P13) | **Yes** | Without it, the browser scrolls during continuous drag |
| `pointerup` (P5, P13) | No | Nothing to prevent — the gesture is already over |
| `pointercancel` (P5, P13) | No | Browser has already cancelled the gesture |
| `click` | No | Click is the final event, no default to prevent |
| `keydown` (Enter) | **Yes** | Without it, Enter may submit a `<form>` and reload the page |
| `@dnd-kit/dom` events (P6) | n/a | Library handles its own default-suppression via pointer sensor |

---

## Gesture CSS

The mobile skill owns `touch-action`, text selection, pull-to-refresh suppression, hit target sizes, and Safari input zoom prevention. This file only decides which event family to use and where raw-pointer listeners attach.

---

## `pointercancel` Handling

`pointercancel` fires when the OS interrupts the pointer gesture:
- Incoming phone call
- System gesture (swipe from edge)
- Palm rejection on tablets
- Browser decides to handle the gesture (scroll/zoom)

**Always** attach a `pointercancel` handler on raw-pointer drag patterns (**P5, P13**). It should clean up the same state as `pointerup`:

```javascript
// P5 example — clean up the in-flight path
document.addEventListener('pointercancel', function(e) {
  if (gameState.isDragging) {
    gameState.isDragging = false;
    // Reset drag visual state (clear .path-head, etc.)
  }
});

// P13 example — drop the block ref, clear the transform
document.addEventListener('pointercancel', function(e) {
  if (gameState.dragBlock) {
    gameState.dragBlock.element.classList.remove('dragging');
    gameState.dragBlock.element.style.transform = '';
    gameState.dragBlock = null;
    gameState.dragDelta = 0;
  }
});
```

Without this, the drag gets stuck in an active state after an OS interruption.

> P6 (Drag-and-Drop) does NOT need a manual `pointercancel` handler — `@dnd-kit/dom` handles cancellation inside `manager.monitor`'s `dragend` event. Do not bolt one on; it can race with the library.
