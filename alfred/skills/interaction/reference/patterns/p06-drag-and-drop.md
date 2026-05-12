# Pattern 6: Drag-and-Drop (Pick & Place)

## Description

Student picks up an item and drops it into a target zone. Uses **@dnd-kit/dom** (vanilla JS, framework-agnostic) for cross-device drag-and-drop.

## Identification

- "drag into", "sort into buckets", "place in the correct zone", "drag to build"
- "drag tags into cells", "drag into grid cells"

## Archetype Match

Sort/Classify, Construction (drag variant), Equation Grid, Math Crossword, Kakuro (drag variant).

---

## Library

Use `@dnd-kit/dom` — the vanilla JS package of dnd-kit. Load via ESM CDN (`https://esm.sh/@dnd-kit/dom@beta`).

**Do not hardcode specific imports or method names.** Always look up the current API before implementing.

## How to Look Up Documentation

Before implementing, **always fetch the latest docs** using Context7 MCP:

1. `resolve-library-id` with `libraryName: "@dnd-kit"` and `query: "vanilla JavaScript DnD-kit drag and drop"`
2. Pick the result with ID format `/org/project` — look for the one describing vanilla/DOM support (not React-only)
3. `query-docs` with the selected library ID for each behavior you need to implement. Suggested queries:
   - `"vanilla JS setup quickstart how to initialize drag and drop"`
   - `"sensor configuration pointer touch activation constraints"`
   - `"monitor events drag start move end position coordinates"`
   - `"drop target effects collision detection"`
   - `"auto scroll plugin configuration"`

**Use whatever classes, functions, and APIs the docs specify at query time.** The API may evolve — never assume specific export names from memory.

---

## Architectural Requirements

These are constraints on **how the system is structured**, not on specific code. The LLM must design an implementation that satisfies all of them. Choose any approach — the verification matrix below defines what must be true.

### R1. ESM Async Loading

The library loads via `<script type="module">` which is inherently async — it will NOT be available at `DOMContentLoaded` time.

**Invariant:** DnD setup must never execute before the library has finished loading.
**Invariant:** Waiting for the library must NOT block `waitForPackages` or the standalone fallback. They are independent concerns — wait for them in parallel.
**Failure if violated:** DnD silently does nothing because the library classes are undefined at call time. Or: standalone fallback is blocked for 180s because it's chained behind the ESM load.

### R2. Tag Source Tracking

During a drag, the library may reparent or clone elements. The `dragend` handler needs to know **where the tag was before the drag started** (in the bank, or in which zone).

**Invariant:** The source location of a tag must be determined from a data structure the game controls — never by inspecting DOM hierarchy (e.g. `parentElement`, `closest`), which is unreliable during and after drag.
**Invariant:** The data structure must be updated on every placement, return, swap, and eviction.
**Failure if violated:** Zone-to-zone swap logic cannot distinguish "came from bank" (evict) from "came from another zone" (swap). Every occupied-zone drop degrades to evict-to-bank. This is the #1 DnD bug in generated games.

### R3. Per-Round Lifecycle

When a round transitions, the old DOM is replaced. Any DnD instances pointing to the old DOM become stale.

**Invariant:** All DnD instances (manager, draggables, droppables) must be destroyed before creating new ones for the next round.
**Invariant:** The tag source tracking data (R2) must be re-initialized each round.
**Failure if violated:** Stale instances cause silent failures — tags appear draggable but drops don't register. Or: leftover tracking data from the previous round causes incorrect swap/evict decisions.

### R4. Drag-State Styling Cleanup On Every Drop Path

While a drag is in flight, the implementation mutates the tag element — typically adding classes (e.g. `chip-dragging`, `chip-lift`) and setting inline styles (`position: fixed; left; top; width; height; transform; z-index`) so the tag tracks the pointer. These mutations must be undone on **every** path that ends the drag, not just the happy path.

**Invariant:** Every terminal drop path — drop-on-empty-zone, drop-on-occupied-zone-evict, drop-on-occupied-zone-swap, zone-to-zone-transfer, zone-to-bank-return (V5), drop-outside-cancel (V6), same-zone-no-op (V7), and `pointercancel` — must clear all inline drag styles and remove all drag-state classes from the tag before (or as part of) reparenting it.

**Invariant:** This applies whether the implementation uses @dnd-kit (which usually handles it for you) or a hand-rolled pointer-events sensor (which does not). If you wrote your own `pointerdown`/`pointermove`/`pointerup` handlers, you own the style cleanup — factor it into a single `resetDragStyling(el)` helper and call it from every drop path.

**Failure if violated:** On the drop path that forgets to clean up, the tag stays visually frozen at the pointer-up screen coordinates (because `position: fixed; left: Xpx; top: Ypx` remains on the element). If the drag class sets `pointer-events: none` (a common pattern to let pointermove events reach the drop-zone under the tag), the tag is now both visually wrong AND un-pickable — the student cannot recover without restarting the round. This bug typically ships because the builder implemented style-reset correctly in `placeInZone()` and `cancelDrag()` but missed `returnToBank()` — a silent asymmetry between sibling functions.

**Verification:** See V5/V6 in the verification matrix — after a seat-to-bank return, the tag must be pickable again. Any drop test that only exercises bank→zone and zone→zone will miss this; add a seat-to-bank-then-pick-up-again step.

---

## Required DnD Behaviours

The implementation **must** satisfy all 8 behaviours. Use the dnd-kit docs (fetched via Context7) to find the latest API for each. The verification matrix at the bottom defines how each behaviour is tested.

### 1. Pick Up & Move Anywhere

Any tag can be dragged, whether it's sitting in the starting bank or already placed inside a drop zone. Both locations must have draggable instances attached.

### 2. Exact Cursor Tracking

The tag stays exactly under the cursor/finger where the user clicked it, rather than snapping its center to the pointer. Compute the offset between the pointer position and the element's top-left corner on drag start, then apply that offset when positioning the drag overlay during drag move.

### 3. Snap to Drop Zones

When a tag is dropped over a valid zone, it perfectly centers itself inside. The zone element should use flex centering. On drag end, if a valid drop target is detected, move the tag DOM element into the zone.

### 4. Auto-Eviction & Swapping

Two distinct cases when dropping into an **occupied** zone:

| Source origin | Behaviour | What happens to existing tag            |
| ------------- | --------- | --------------------------------------- |
| Bank          | **Evict** | Existing tag returns to its bank slot   |
| Another zone  | **Swap**  | Existing tag moves to the source's zone |

**Invariant:** The dragend handler must read the source's origin from the tracking data (R2) to decide evict vs swap.
**Invariant:** After a swap, both zones must contain a tag, both zones must reflect the correct values in any value-tracking state, and both tags' locations must be updated in the tracking data.
**Failure if violated:** Every occupied-zone drop evicts to bank. The student cannot rearrange tags between zones without first returning them to the bank — a broken UX that makes the game feel buggy.

### 5. Smart Re-Sorting & Bank Re-Centering

Whenever a tag is returned to the starting bank (either dropped outside a zone or evicted), it snaps back into its correct original position. Use dedicated placeholder slots in the bank, one per tag, so returning a tag means appending it back to its own slot. **Empty slots must collapse** so that the remaining tags stay center-aligned in the bank.

**Collapse mechanism (MANDATORY — validator GEN-DND-BANK-COLLAPSE-CSS / GEN-DND-BANK-COLLAPSE-TOGGLE):**

Use `display: none` (NOT `visibility: hidden` — `visibility` keeps the slot's layout footprint and remaining tags do NOT re-center). Toggle a class on the bank slot at every placement boundary:

```css
/* CSS — required shape (any of pool/bank/tray + any of empty/collapsed/hidden + display:none) */
.pool-slot.empty { display: none; }   /* or .bank-slot, .tray-slot */
```

```javascript
// JS — three call sites, no exceptions
function placeOnSlot(tagId, zoneId) {
  // ... existing zone placement logic ...
  bankSlots[tagId].classList.add('empty');     // collapse the source bank slot
}

function returnToBank(tagId) {
  // ... existing return-to-bank logic ...
  bankSlots[tagId].classList.remove('empty');  // restore the bank slot
}

// Initial render: slots start WITHOUT the .empty class (every tag visible in the bank).
```

If you skip the JS toggle (CSS rule present but `classList.add/remove` never called) the bank visually de-syncs from placement state — tags appear in zones AND in the bank simultaneously, OR slots stay collapsed after a tag returns. The validator fails the build for either half missing.

### 6. Zone-to-Zone Transfer

A tag already in a drop zone can be picked up and directly dropped into another drop zone. The source zone becomes empty (or receives the swapped tag per rule 4).

**Invariant:** After a zone-to-zone transfer to an empty zone, the source zone must be cleared (no tag, no has-tag styling, value removed from tracking state).

### 7. Auto Edge-Scrolling

Dragging a tag to the extreme top or bottom of the viewport smoothly scrolls the page. Use the library's auto-scroll plugin if available, or implement manually via `requestAnimationFrame` with a ~60px threshold from viewport edges.

### 8. Universal Touch Support

Works flawlessly across desktop (mouse) and mobile (touch/swipe) without the screen accidentally panning while dragging.

**Critical rules for touch:**

- `touch-action: none` goes **only on the draggable elements themselves** — never on `body`, parent containers, or drop zones. Putting it on containers blocks page scrolling.
- Use a pointer-based sensor with a small distance activation constraint (e.g. 3px) for both mouse and touch — **no delay constraint**. The `touch-action: none` on the draggable already prevents the browser from hijacking the touch for scrolling, so a hold-delay is unnecessary and makes the interaction feel sluggish.
- Add a global `touchmove` handler with `{ passive: false }` that calls `preventDefault()` **only while a drag is active** (gate it with a flag set on drag start / cleared on drag end).

**Sensor configuration (MANDATORY — validator GEN-DND-SENSOR-DISTANCE / GEN-DND-SENSOR-NO-DELAY):**

`@dnd-kit/dom`'s default PointerSensor uses a **250ms touch hold-delay with 5px tolerance** (per [dndkit.com/extend/sensors/pointer-sensor § Default Behavior](https://dndkit.com/extend/sensors/pointer-sensor)). That delay makes mobile feel laggy — the player has to hold, then drag. Override the default with a Distance-only constraint, applied uniformly to mouse and touch:

```html
<!-- ESM CDN: import PointerSensor and the constraints class from the SAME root package -->
<script type="module">
  import {
    DragDropManager, Draggable, Droppable,
    PointerSensor, PointerActivationConstraints
  } from 'https://esm.sh/@dnd-kit/dom@beta';
  window.__dndKitClasses = {
    DragDropManager, Draggable, Droppable, PointerSensor, PointerActivationConstraints
  };
</script>
```

```javascript
// Inside DnD setup — REPLACE `new DragDropManager()` with:
var manager = new DragDropManager({
  sensors: [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 3 })
        // No `Delay` constraint — pickup activates after 3px of movement on both mouse and touch.
      ]
    })
  ]
});
```

**Why this exact shape (do NOT improvise):**

- `PointerActivationConstraints.Distance` is a **class, instantiated with `new`**. A plain object `{ distance: 3 }` is silently ignored.
- `activationConstraints` is an **array** of constraint instances, not a single object.
- Both `PointerSensor` and `PointerActivationConstraints` export from the **main package** (`@dnd-kit/dom`). There is no `/sensors` sub-path on the ESM CDN — that import will 404 silently.
- Do NOT spread `defaults` — the default array contains the very PointerSensor with the 250ms touch delay you're trying to remove. Replace it entirely.

**Anti-patterns (all silently break drag or keep the touch delay):**

```javascript
// ❌ Default — keeps the 250ms touch hold-delay
var manager = new DragDropManager();

// ❌ Plain-object constraint shape — ignored, falls back to defaults
PointerSensor.configure({ activationConstraints: { distance: 3 } });

// ❌ Sub-path import — 404 on esm.sh, PointerSensor === undefined, manager has no sensors → no drag
import { PointerSensor } from 'https://esm.sh/@dnd-kit/dom@beta/sensors';

// ❌ Spreading defaults — re-adds the default PointerSensor with the touch delay alongside the configured one
sensors: (defaults) => [...defaults, PointerSensor.configure({...})]
```

### 9. Input Blocking During Awaited Feedback

Drag-and-drop is a gameplay interaction. Like every other gameplay interaction, it MUST be disabled whenever awaited feedback audio is playing. Without this, a student can pick up a tag and drop it into a different zone while the round-complete / submit-evaluation awaited SFX (and any fire-and-forget TTS dwell before `loadRound()` re-enables) is still playing — mutating the answer that was just evaluated. TTS itself is fire-and-forget (L-VI-002); only SFX is awaited.

**Detailed timing — including all retry / exception paths — lives in [`../../state-and-guards.md` § Lifecycle matrix](../../state-and-guards.md#interaction-lifecycle--canonical-matrix).** This section enumerates only the P6-specific mechanism.

**Mechanism authority — read this carefully.** P6 (and every game built on `@dnd-kit/dom`) is the **one pattern in the catalog where the JS handler guard is NOT the load-bearing lock.** Every other pattern attaches direct DOM listeners — the JS `isProcessing` check runs first and is the actual block. `@dnd-kit/dom` works differently:

- The PointerSensor consumes `pointerdown` events before any game code runs.
- The `dragstart` event delivered to `manager.monitor` is a **synthetic post-activation notification**, fired AFTER the operation has already begun.
- `event.preventDefault()` on this synthetic event is a **no-op** — the operation is already in progress; there is no native event to prevent.

The only lock that actually prevents `@dnd-kit/dom` drags during feedback is **`.dnd-disabled` (`pointer-events: none` on the draggables)**. The browser stops delivering pointer events to the cells, the PointerSensor never activates, no drag is created.

The JS guard is still required as **defensive hygiene**:
- It documents the rule in code form for readers.
- It catches the narrow case where a drag was already in flight when `isProcessing` flipped (the operation is recoverable on dragend by the same guard re-checked there).
- The validator [`GEN-DND-DRAGSTART-GUARD`](../../../game-building/reference/static-validation-rules.md) enforces its presence.

But the JS guard **alone** does not block new drags. Builds that skip the CSS class while keeping the JS guard ship the failure mode where drags succeed during feedback audio (validator passes, runtime broken — see § Failure Modes F6).

**Invariant:** Every submit / retry / timer-expiry / API-failure handler that opens an awaited-feedback window MUST, BEFORE any `await`:

1. Set `gameState.isProcessing = true`
2. Add `.dnd-disabled` (or named equivalent) to the board wrapper. This is the load-bearing lock.
3. Register the JS `dragstart` guard. (Documented intent + validator compliance.)

```javascript
manager.monitor.addEventListener('dragstart', function(event) {
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) {
    event.preventDefault(); // no-op on @dnd-kit/dom monitor events; documents intent
    return;
  }
  // ... proceed with drag setup
});

async function handleSubmit() {
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;
  boardEl.classList.add('dnd-disabled'); // ← the actual lock on @dnd-kit/dom

  // ... evaluate, update state, recordAttempt, progressBar.update ...

  try {
    await FeedbackManager.sound.play(isCorrect ? 'correct_sound_effect' : 'incorrect_sound_effect', { sticker });
  } catch (e) {}
  FeedbackManager.playDynamicFeedback({ audio_content: msg, subtitle: msg, sticker })
    .catch(function(e) { console.error('TTS error:', e.message); });

  // Re-enable per ../../state-and-guards.md § Lifecycle matrix:
  //   - Single-step + advance: renderRound() / loadRound() removes .dnd-disabled
  //   - Standalone Try Again: on('retry') handler removes it (no renderRound between submit and retry)
  //   - Multi-round explicit retry button: on('retry') OR same-round re-render — pick one
  //   - API-failure recovery: catch branch removes it before surfacing error
  //   - Terminal game-over: removed before endGame() teardown so end-game UI stays tappable
  // Detailed per-shape × per-event timing lives in the matrix.
}
```

**Failure if violated:** Student drops a tag into a new zone mid-feedback → answer silently changes → recordAttempt captured one answer but gameState now reflects another → scoring drifts from telemetry. Worst case: a second drop triggers a second submit evaluation while the first is still awaiting audio → double-scoring or inconsistent UI state.

---

## Verification Matrix

Every P6 game must pass all of these conditions. The builder should mentally trace through each scenario before outputting code. Playwright tests will verify these programmatically.

### Drag operations

| #   | Scenario                     | Precondition                     | Action                    | Expected state after                                                                                                                                           |
| --- | ---------------------------- | -------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Bank → empty zone            | Tag A in bank, zone 0 empty      | Drop A into zone 0        | Zone 0 contains A, zone 0 has occupied styling, A's bank slot is collapsed, value tracking has zone 0 = A's value, location tracking has A = zone 0            |
| V2  | Bank → occupied zone (evict) | Tag A in zone 0, tag B in bank   | Drop B into zone 0        | Zone 0 contains B, A is back in its bank slot, A's bank slot is visible, location tracking has A = bank and B = zone 0                                         |
| V3  | Zone → occupied zone (swap)  | Tag A in zone 0, tag B in zone 1 | Drop A into zone 1        | Zone 0 contains B, zone 1 contains A, both zones have occupied styling, location tracking has A = zone 1 and B = zone 0, value tracking updated for both zones |
| V4  | Zone → empty zone (transfer) | Tag A in zone 0, zone 1 empty    | Drop A into zone 1        | Zone 1 contains A, zone 0 is empty (no tag, no occupied styling, value removed), location tracking has A = zone 1                                              |
| V5  | Zone → bank (return)         | Tag A in zone 0                  | Drop A on bank            | A is in its bank slot, bank slot visible, zone 0 is empty, value tracking cleared for zone 0, location tracking has A = bank. Tag has **no** drag classes (`chip-dragging`, `chip-lift`) and **no** inline drag styles (`position`, `left`, `top`, `width`, `height`). Tag is immediately pickable again — a subsequent drag onto an empty zone succeeds (R4) |
| V6  | Drop outside (cancel)        | Tag A in zone 0                  | Drop A outside any target | A returns to bank slot, zone 0 is empty, same state as V5 (including drag-style cleanup — R4)                                                                  |
| V7  | Same zone (no-op)            | Tag A in zone 0                  | Drop A into zone 0        | Zone 0 still contains A, no state change, drag classes and inline styles cleared (R4)                                                                          |

### Bank management

| #   | Condition                       | Expected                                                                |
| --- | ------------------------------- | ----------------------------------------------------------------------- |
| V8  | Tag placed in a zone            | Tag's bank slot collapses (hidden)                                      |
| V9  | Tag returned to bank (any path) | Tag's bank slot restores (visible), tag is a child of its original slot |
| V10 | Multiple tags placed            | Only their slots collapse; remaining tags re-center in bank             |

### State consistency

| #   | Condition                | Expected                                                        |
| --- | ------------------------ | --------------------------------------------------------------- |
| V11 | After any drag operation | Location tracking data matches actual DOM positions of all tags |
| V12 | After any drag operation | Value tracking state matches values displayed in zones          |
| V13 | All zones filled         | Submit/Check button becomes enabled                             |
| V14 | Any zone emptied         | Submit/Check button becomes disabled                            |

### Touch & CSS

| #   | Condition                    | Expected                         |
| --- | ---------------------------- | -------------------------------- |
| V15 | Draggable elements           | Have `touch-action: none`        |
| V16 | Body, containers, drop zones | Do NOT have `touch-action: none` |
| V17 | All draggable tags           | Meet 44px minimum touch target   |

### Lifecycle

| #   | Condition                  | Expected                                                                        |
| --- | -------------------------- | ------------------------------------------------------------------------------- |
| V18 | Round transition           | All DnD instances from previous round are destroyed before new ones are created |
| V19 | Game end                   | All DnD instances are destroyed                                                 |
| V20 | DnD library not yet loaded | Game still renders; DnD setup defers until library loads                        |

### Input Blocking During Awaited Feedback

| #   | Condition                                                              | Expected                                                                                                                                   |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| V21 | Pointer-down on a draggable cell while `gameState.isProcessing === true` | `@dnd-kit/dom`'s PointerSensor does **not** activate (`pointer-events: none` blocks at the browser layer); no `dragstart` fires; no tag is lifted; no state mutation. **Note:** Verifying this means checking that the CSS class is on the board wrapper — NOT that `preventDefault()` was called in the JS guard, which is a no-op on `@dnd-kit/dom`'s synthetic monitor event. |
| V22 | Submit / retry / timer-expiry / api-failure awaited feedback in flight | `gameState.isProcessing === true` for the full awaited-SFX duration (TTS is fire-and-forget — L-VI-002); board wrapper has `.dnd-disabled` class (or equivalent) applying `pointer-events: none` on draggables. The CSS class is the load-bearing lock. |
| V23 | Awaited feedback resolves AND game advances / retries                   | `gameState.isProcessing` flips back to `false`; `.dnd-disabled` removed; drag handlers re-accept input. **Re-enable site depends on path** — `renderRound()` for advance, `on('retry')` for standalone Try Again, same-round re-render for multi-round explicit retry, catch branch for api-failure. See [state-and-guards.md § Lifecycle matrix](../../state-and-guards.md#interaction-lifecycle--canonical-matrix). |
| V24 | Rapid drop during feedback (edge case)                                  | Second drop does not trigger a second submit; `gameState.attempts.length` increments by 1, not 2. Enforced by the CSS class blocking pointer events; the JS dragend guard is a backstop. |
| V25 | Terminal game-over (last life lost or global-countdown time-up)         | `.dnd-disabled` is **removed from the board wrapper** before `endGame()` teardown so end-game UI (Try Again button on Game Over TS) remains tappable. Per-cell prefilled `.locked` (puzzle state) STAYS. |

---

## Failure Modes (from prior builds)

These are bugs that have occurred in generated P6 games. The LLM should understand these to avoid repeating them.

| #   | Bug                                           | Root cause                                                                                                     | How to prevent                                                                                    |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| F1  | Zone-to-zone swap always evicts to bank       | Used `parentElement` to check source origin — unreliable during drag because the library reparents elements    | Use a game-controlled data structure (not DOM inspection) to track where each tag is              |
| F2  | DnD stops working after round 2               | Old DnD instances not destroyed; new ones conflict with stale listeners                                        | Destroy all instances at the start of each round's DnD setup                                      |
| F3  | Tags don't work in standalone/Playwright      | DnD library loaded via ESM but the setup was nested inside `waitForPackages` which blocks for 180s without CDN | Wait for the ESM library independently from CDN packages                                          |
| F4  | Evicted tag appears at wrong position in bank | Tags returned to a generic bank container instead of their dedicated placeholder slot                          | Each tag gets its own placeholder slot in the bank; return always targets the tag's specific slot |
| F5  | Bank doesn't re-center after tag removal      | Bank slot stays visible (taking up space) after tag is placed in a zone                                        | Collapse empty bank slots (e.g. via a CSS class); restore on tag return                           |
| F6  | Answer mutates during feedback audio          | Build relied on the JS `dragstart` guard + `event.preventDefault()` alone, without adding `.dnd-disabled` to the board wrapper. On `@dnd-kit/dom`, `preventDefault()` on monitor `dragstart` events is a no-op — the operation has already started. The CSS class is the only mechanism that prevents new drags. Validator `GEN-DND-DRAGSTART-GUARD` passes (JS guard present); runtime is broken. | **MUST add `.dnd-disabled` (or named equivalent) to the board wrapper in every submit / retry / timer-expiry / api-failure handler BEFORE any `await`.** The JS `dragstart` guard remains required as defensive hygiene but is NOT sufficient on its own. See Behaviour 9 § Mechanism authority for the full explanation. |
| F7  | Tag freezes mid-air after zone→bank return and can't be picked up again | `returnToBank()` / `returnChipToPoolSlot()` reparented the tag but forgot to clear inline drag styles (`position: fixed; left; top`) and drag classes (`chip-dragging`, `chip-lift`). Sibling functions (`placeInZone`, `cancelDrag`) did clear them — a silent asymmetry. If the drag class also sets `pointer-events: none`, the tag is un-pickable. Most common with hand-rolled pointer-events sensors (not @dnd-kit). | R4: factor drag-style cleanup into a single `resetDragStyling(el)` helper and call it from EVERY drop path — including the return-to-bank path. Add a Playwright step that drags seat→bank and then tries to re-pick-up the tag (real CDP mouse events, not `solveRound()` helpers that bypass the pointer flow). |
