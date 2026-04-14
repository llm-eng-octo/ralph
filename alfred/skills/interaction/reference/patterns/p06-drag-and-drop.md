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

Whenever a tag is returned to the starting bank (either dropped outside a zone or evicted), it snaps back into its correct original position. Use dedicated placeholder slots in the bank, one per tag, so returning a tag means appending it back to its own slot. **Empty slots must collapse** (e.g. `display: none` via a class) so that the remaining tags stay center-aligned in the bank. Remove the class when a tag returns to its slot.

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
| V5  | Zone → bank (return)         | Tag A in zone 0                  | Drop A on bank            | A is in its bank slot, bank slot visible, zone 0 is empty, value tracking cleared for zone 0, location tracking has A = bank                                   |
| V6  | Drop outside (cancel)        | Tag A in zone 0                  | Drop A outside any target | A returns to bank slot, zone 0 is empty, same state as V5                                                                                                      |
| V7  | Same zone (no-op)            | Tag A in zone 0                  | Drop A into zone 0        | Zone 0 still contains A, no state change                                                                                                                       |

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
