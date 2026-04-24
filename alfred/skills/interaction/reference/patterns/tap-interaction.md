# Tap Interaction — Unified Skill Reference

> Covers patterns **P1, P2, P3, P8, P9, P10, P11, P12, P14, P15, P16**.
> All tap-based interactions share one event type (`click`), the same guards, the same touch-target rules, and the same visual feedback foundations. They differ only in **selection model** and **evaluation trigger**.

---

## 1  Shared Requirements

### 1.1  Event Type

- Always use `click` events. Never raw touch events (`touchstart`/`touchend`). Never pointer events (those are for drag patterns P5, P6, P13). P4 (Tap + Swipe) is **deprecated** — use tap-only.

### 1.2  Universal Guards

Every tap handler **must** reject the tap if any of these are true:

| Guard | Meaning |
|-------|---------|
| Game not active | Game hasn't started or has ended |
| Processing | A previous tap is still being evaluated (audio playing, animation running) |
| Game ended | Victory or game-over has been triggered |

Additional per-model guards are listed in each section below.

### 1.3  Touch Targets

| Rule | Value |
|------|-------|
| Minimum size | 44 × 44 px |
| Minimum spacing | 8 px between adjacent targets |
| CSS | `touch-action: manipulation` on every tappable element |
| Cursor | `cursor: pointer` on tappable elements |

### 1.4  Visual State Classes

Every tap interaction uses a common vocabulary of visual states. The LLM chooses how to style them, but must apply these semantic states:

| State | When applied | Behaviour |
|-------|-------------|-----------|
| **selected** | Item is currently chosen/highlighted | Visually distinct from default; reversible |
| **correct** / **selected-correct** | Correct answer chosen | Green-tinted; usually disables further interaction |
| **wrong** / **selected-wrong** | Wrong answer chosen | Red-tinted; typically removed after 300–600 ms |
| **matched** | Successfully paired/completed item | Green-tinted; pointer-events disabled permanently |
| **completed** | Finished chain/sequence element | Green-tinted; pointer-events disabled permanently |
| **disabled** | Interaction not yet allowed | Reduced opacity; pointer-events disabled |
| **cell-filled** | Toggle cell is in "on" state | Distinct fill colour |
| **cell-selected** | Grid cell is actively selected (picker open) | Highlight border/background |
| **cell-locked** | Pre-filled/clue cell | Non-interactive; visually distinct |
| **constraint-violation** | Placement violates a rule | Red-tinted border/background |
| **palette-active** | Currently selected palette tool | Ring/border indicating active tool |
| **flash** | Momentary highlight (sequence replay) | Brief opacity/glow change |

### 1.5  Feedback Rules

| Step type | SFX | TTS | Input blocking |
|-----------|-----|-----|----------------|
| **Single-step** (1 tap = round over) | Awaited (~1.5s) | Fire-and-forget (L-VI-002) | Block input during SFX dwell; `isProcessing = false` in `loadRound()`, NOT after TTS |
| **Multi-step** per-tap | Fire-and-forget | None | Do not block input (or block only briefly during animation) |
| **Multi-step** round-complete / puzzle-solved | Awaited (~1.5s) | Fire-and-forget (L-VI-002) | Block input during SFX dwell; `isProcessing = false` in `loadRound()` / `renderRound()`, NOT after TTS |

### 1.6  Post-Evaluation Actions

After every evaluation, the game must:

1. Update score/lives display
2. Update progress bar (if present)
3. Record the attempt with standard telemetry fields
4. Fire an analytics event

---

## 2  Selection Models

### 2.1  Single-Select (P1)

**Behaviour:** Student taps exactly one element. That single tap immediately triggers evaluation. Round is over after one tap.

**Step type:** Single-step.

**Used by:** MCQ Quiz, Rapid Challenge, True/False, One Digit Doubles, Position Maximizer, Number Pattern, Face Memory, Associations, Keep Track, Two-Player Race, Expression Completer (per sub-step), Sequence Builder, Aided Game.

**Requirements:**

1. One tap = one evaluation = round over. No persistent selection state.
2. On tap: disable all options immediately (prevent double-tap).
3. Highlight the chosen option as correct or wrong.
4. If wrong: also reveal the correct answer visually.
5. Awaited SFX (~1.5s) → fire-and-forget TTS. Advance to next round after SFX dwell; do NOT block round advance on TTS completion (L-VI-002).
6. If correct (or no-lives mode): advance to next round after feedback.
7. If wrong + lives mode: lose a life. If lives = 0 → game over. Otherwise stay on same round or advance (game-dependent).

**State:**

```
READY → tap → EVALUATING (blocked) → feedback done → READY (next round)
```

**Undo:** None. Tap is final.

---

### 2.2  Toggle (P8, P10)

**Behaviour:** Tap cycles an item on ↔ off. Evaluation happens via constraint auto-check (P8) or explicit Submit button (P10).

**Step type:** Multi-step.

**Used by:**
- **P8 Click-to-Toggle:** Queens, Light Up, Hide-Unhide, Visual Memory (response phase).
- **P10 Multi-Select + Submit:** MCQ Multi-Select, Hidden Sums, Make-X, Hide-Unhide (row targets), Truth Tellers & Liars, Visual Memory (reconstruction phase).

#### P8 — Toggle with Constraint Auto-Check

**Requirements:**

1. Each tap toggles a cell between filled and empty (or cycles through N states).
2. After every toggle: run constraint validation and highlight any violations visually.
3. If zero violations AND win condition is met → puzzle solved (awaited SFX + fire-and-forget TTS — L-VI-002).
4. Locked/pre-filled cells must not be interactive.
5. No per-toggle audio. Audio only on puzzle-solve.

**State:**

```
PLAYING
  ↓ tap cell → toggle state → check constraints
  ↓ no violations + win condition → SOLVED (blocked, awaited feedback)
```

#### P14 — Edge/Segment Toggle

**Requirements:**

1. Edges are clickable elements between dots/nodes on a grid. Tapping an edge toggles a line segment on/off.
2. After every toggle: run constraint checks (each clue-number must match its adjacent active segments). Highlight violations.
3. If all constraints satisfied AND a valid closed loop is formed → puzzle solved (awaited SFX + fire-and-forget TTS — L-VI-002).
4. Fire-and-forget tap SFX per toggle.
5. Edge hit area must be 44px minimum even if the visual line is thin.

**State:**

```
PLAYING
  ↓ tap edge → toggle on/off → check constraints
  ↓ valid loop + no violations → SOLVED (blocked, awaited feedback)
```

**CSS essentials:**

```css
.edge { cursor: pointer; touch-action: manipulation; }
/* Hit area 44px, visual line 4px centered inside */
.edge.edge-on::after { background: var(--mathai-blue); }
.edge.constraint-violation::after { background: var(--mathai-red); }
```

**Used by:** Loop the Loop.

**Undo:** Tap the same edge again to toggle it off.

#### P10 — Toggle Set + Submit

**Requirements:**

1. Each tap toggles an item's selected state on/off (checkbox-style). Multiple items can be selected simultaneously.
2. Fire-and-forget tap SFX on each toggle.
3. Optional: display a running sum/count of selected items.
4. Submit/Check button triggers batch evaluation of all selections.
5. On submit: highlight which items were correct vs wrong. Awaited SFX → TTS.

**Variant — Auto-Check (Make-X):** No submit button. Instead:
- Running sum reaches target → auto-correct.
- Running sum exceeds target → auto-incorrect (deselect all, life lost).

**State:**

```
SELECTING
  ↓ tap item → toggle on/off
  ↓ tap Submit → EVALUATING (blocked, awaited feedback)
  ↓ (auto-check) sum = target → correct
  ↓ (auto-check) sum > target → incorrect
```

**Undo:**
- P8: Click same cell again to toggle back.
- P10: Tap item again to deselect before submitting.

---

### 2.3  Pair-Select (P3, P11)

**Behaviour:** Two taps = one evaluation. Tap item A, then tap item B → evaluate whether they form a valid pair.

**Step type:** Multi-step.

**Used by:**
- **P3 Two-Phase Match (cross-group):** Matching Doubles, Match the Cards, Memory Flip.
- **P11 Same-Grid Pair (single pool):** Bubbles Pairs, Speedy Taps, Identify Pairs List.

**Key difference:** P3 has two separate groups (e.g. left/right columns). Group B is only enabled after selecting from group A. P11 has one pool — any unmatched item can be tapped.

#### P3 — Two-Phase Match

**Requirements:**

1. Tap group A item → highlight as selected. Group B becomes interactive.
2. Tapping a different group A item → re-selects (replaces previous selection).
3. Tap group B item → evaluate pair.
4. Correct: mark both items as matched (non-interactive). Fire-and-forget SFX.
5. Wrong: flash group B item as wrong (300–600 ms). Fire-and-forget wrong SFX. Life lost.
6. After evaluation: clear selection, disable group B until next group A selection.
7. All pairs matched → round complete (awaited SFX + fire-and-forget TTS — L-VI-002).

**Variant — Memory Match (Card Flip):**
- Items are face-down cards in a single grid (no separate groups).
- Tap flips a card face-up. Two flipped cards = evaluation.
- Match: both stay face-up, marked as matched.
- No match: both flip back face-down after ~1 second delay.
- Card flip animation required (3D transform or equivalent).

**State:**

```
NO_SELECTION
  ↓ tap A → FIRST_SELECTED (B enabled / first card flipped)
  ↓ tap B → EVALUATING
  ↓ correct → both matched → NO_SELECTION
  ↓ wrong → flash wrong → NO_SELECTION
```

#### P11 — Same-Grid Pair

**Requirements:**

1. Tap any unmatched item → highlight as selected (first selection).
2. Tap same item again → deselect.
3. Tap a different unmatched item → evaluate pair.
4. Valid pair (e.g., sum = target): mark both as matched/removed. Fire-and-forget SFX.
5. Invalid pair: flash second item as wrong (300–600 ms). Fire-and-forget wrong SFX. Life lost.
6. Clear selection after every evaluation.
7. All pairs found → round complete (awaited SFX + fire-and-forget TTS — L-VI-002).

**State:**

```
NO_SELECTION
  ↓ tap item → FIRST_SELECTED
  ↓ tap same → NO_SELECTION (deselect)
  ↓ tap different → EVALUATING
  ↓ valid pair → both matched → NO_SELECTION
  ↓ invalid → flash wrong → NO_SELECTION
```

**Undo:**
- P3: Re-select a different group A item before tapping group B.
- P11: Tap selected item again to deselect.

---

### 2.4  Sequential (P2, P16)

**Behaviour:** Student taps elements in a specific order. Each tap is validated against the expected position in the sequence.

**Step type:** Multi-step.

**Used by:**
- **P2 Sequential Chain:** Doubles.
- **P16 Sequence Replay (Observe → Reproduce):** Simon Says.

**Key difference:** P2 builds a chain from a discoverable correct order (e.g., ascending numbers in a grid). P16 reproduces a memorized sequence after an observe phase.

#### P2 — Sequential Chain

**Requirements:**

1. Grid of elements. Student must find and tap elements in the correct chain order.
2. First tap must be a valid chain start. If not → incorrect (life lost).
3. Each subsequent tap must match the expected next element in the chain.
4. Correct tap: add to chain, highlight as selected. Fire-and-forget SFX.
5. Wrong tap: **entire chain resets**. Flash all chain tiles + wrong tile as wrong (~600 ms). Life lost. Fire-and-forget wrong SFX.
6. Chain complete: mark all chain tiles as completed (non-interactive).
7. Multiple chains may exist per round. After one completes, next begins.
8. All chains found → round complete (awaited SFX + fire-and-forget TTS — L-VI-002).

**State:**

```
IDLE (no chain active)
  ↓ tap valid start → BUILDING
BUILDING
  ↓ tap correct next → stay BUILDING (chain grows)
  ↓ tap wrong → flash + reset → IDLE (life lost)
  ↓ chain complete → CHAIN_DONE
CHAIN_DONE
  ↓ more chains → IDLE
  ↓ all done → ROUND_COMPLETE
```

#### P16 — Sequence Replay

**Requirements:**

1. **Observe phase:** Elements flash in sequence (highlight ~600 ms, pause ~300 ms between). All interaction is disabled during this phase.
2. **Respond phase:** Student taps elements in the same order as observed.
3. Each tap is validated immediately against the expected position.
4. Correct tap: brief highlight, fire-and-forget SFX, advance step.
5. Wrong tap: flash wrong, wrong SFX, life lost. If lives remain: replay the sequence. If no lives: game over.
6. All taps correct → sequence complete (awaited SFX + fire-and-forget TTS — L-VI-002). Next round adds one more element to the sequence.

**Additional guard:** Reject all taps when phase is "observing".

**State:**

```
IDLE
  ↓ round starts → OBSERVING (all input disabled)
  ↓ playback complete → RESPONDING (input enabled)
RESPONDING
  ↓ correct tap → increment step
  ↓ wrong tap → ROUND_FAILED (life lost, replay or game over)
  ↓ all correct → ROUND_COMPLETE
```

**Undo:**
- P2: Forced full chain reset on wrong tap. No voluntary undo.
- P16: None. Each tap is immediately evaluated.

---

### 2.5  Two-Phase: Tool + Apply (P12, P15)

**Behaviour:** Student first selects a tool/mode, then taps targets to apply it. Two distinct tap targets with different roles.

**Step type:** Multi-step.

**Used by:**
- **P12 Tap-to-Assign (Palette):** Colour Coding Tool, Truth Tellers & Liars.
- **P15 Cell Select → Number Picker:** Futoshiki, Kakuro, Killer Sudoku.

**Key difference:** P12 selects a **persistent** tool (colour stays active across multiple assignments). P15 selects a **transient** target (cell), and the picker dismisses after one value is placed.

#### P12 — Palette Assign

**Requirements:**

1. Palette of colour/category swatches. Tapping one makes it the active tool (highlight as active).
2. Tapping an item assigns the active colour to it. Fire-and-forget tap SFX.
3. Tapping an item again with a different colour changes its assignment.
4. Active palette colour persists — student can assign it to multiple items without re-selecting.
5. Tapping a different palette swatch changes the active tool.
6. Evaluation happens on Submit/Check (combines with text input or button).

**State:**

```
NO_TOOL_SELECTED
  ↓ tap swatch → TOOL_ACTIVE
TOOL_ACTIVE
  ↓ tap item → assign colour (stay TOOL_ACTIVE)
  ↓ tap different swatch → change active tool
  ↓ tap Submit → EVALUATING
```

#### P15 — Cell Select → Number Picker

**Requirements:**

1. Tap an empty/editable grid cell → cell highlights, number picker appears (popup or inline bar).
2. Tap a number in the picker → number placed in cell, picker dismisses. Fire-and-forget tap SFX.
3. Tap the same cell again (when it has a value) → clears the value (undo).
4. Tapping outside both the grid and picker → dismiss picker, deselect cell.
5. Locked/pre-filled cells are non-interactive.
6. After each placement: check constraints (row/column uniqueness, sum constraints, inequality constraints). Highlight violations.
7. If grid is fully filled with zero violations → puzzle solved (awaited SFX + fire-and-forget TTS — L-VI-002). Or: a Check button triggers validation.

**State:**

```
NO_SELECTION
  ↓ tap empty cell → CELL_SELECTED (picker visible)
  ↓ tap locked cell → ignored
CELL_SELECTED
  ↓ tap picker number → place value → NO_SELECTION
  ↓ tap same cell (has value) → clear value → NO_SELECTION
  ↓ tap outside → dismiss → NO_SELECTION
  ↓ grid complete + valid → SOLVED
```

**Undo:**
- P12: Tap item with different colour to reassign.
- P15: Tap filled cell to clear value.

---

### 2.6  Stepper: Adjust + Submit (P9)

**Behaviour:** Student taps +/− buttons to adjust numeric values, then submits a typed answer. Values may be linked (adjusting one changes another inversely).

**Step type:** Multi-step (multiple taps to adjust, then submit to evaluate).

**Used by:** Adjustment Strategy.

**Requirements:**

1. Each +/− button modifies a numeric value on tap. Fire-and-forget tap SFX per press.
2. If values are linked (e.g., A + B = constant), adjusting A inversely adjusts B.
3. +/− buttons respect min/max bounds. Disable at limits.
4. A text input + Submit/Check button triggers evaluation (or Enter key).
5. On submit: awaited SFX + fire-and-forget TTS (L-VI-002). Correct → next round advances on SFX dwell (do NOT await TTS). Wrong → life lost, retry.
6. CSS: `min-height: 44px; min-width: 44px; touch-action: manipulation; border-radius: 50%` for +/− buttons.

**State:**

```
ADJUSTING
  ↓ tap + → increment A (decrement B if linked)
  ↓ tap − → decrement A (increment B if linked)
  ↓ tap Submit / Enter → EVALUATING (blocked, awaited feedback)
  ↓ correct → next round
  ↓ wrong → life lost, retry
```

**Undo:** Tap the opposite +/− button.

---

## 3  Evaluation Triggers

Every tap model uses one of three evaluation triggers:

| Trigger | When evaluation fires | Patterns |
|---------|----------------------|----------|
| **Immediate** | On every tap (or every Nth tap in pair models) | P1, P2, P3, P11, P16 |
| **Auto-validate** | When a win condition / constraint is met after a tap | P8 (constraints), P10 auto-check (Make-X), P14 (valid loop), P15 (grid complete) |
| **Batch-submit** | When student taps a Submit/Check button | P9 (stepper + submit), P10 (submit variant), P12 (palette + submit), P15 (Check button variant) |

### Immediate

The tap handler itself contains the evaluation logic. No external trigger needed.

### Auto-validate

After every tap, the handler updates state, runs constraint checks, and if a win condition is detected, transitions to solved/complete. No explicit submit action from the student.

### Batch-submit

A separate Submit/Check button collects the current state (all selections, all assignments, full grid) and evaluates everything at once. The button should be disabled when nothing has been selected/placed.

---

## 4  Quick Identification Guide

| Spec says… | Selection Model | Pattern |
|------------|----------------|---------|
| "MCQ", "tap one answer", "choose the correct" | Single-Select | P1 |
| "toggle on/off", "fill cells", "place/remove" | Toggle (auto-check) | P8 |
| "select all correct + submit", "checkbox" | Toggle + Submit | P10 |
| "tap numbers to reach target sum" | Toggle + Auto-check | P10 (Make-X) |
| "match pairs", "left to right", "flip cards" | Pair-Select (cross-group) | P3 |
| "find pairs from same grid", "pairs that sum to" | Pair-Select (same pool) | P11 |
| "build chain in order", "tap in sequence" | Sequential (chain) | P2 |
| "watch then repeat", "Simon Says" | Sequential (replay) | P16 |
| "colour-code", "assign category", "label items" | Two-Phase (palette) | P12 |
| "tap cell then pick number", "Sudoku/Futoshiki" | Two-Phase (picker) | P15 |
| "+/- buttons", "adjust", "increment/decrement" | Stepper (adjust + submit) | P9 |
| "toggle edges", "draw segments between dots", "loop" | Edge Toggle (auto-check) | P14 |

---

## 5  Pattern ↔ Previous File Mapping

This unified file replaces the following individual pattern files:

| Old file | Now in section |
|----------|---------------|
| `p01-tap-select-single.md` | §2.1 Single-Select |
| `p02-tap-select-chain.md` | §2.4 Sequential (P2) |
| `p03-tap-select-match.md` | §2.3 Pair-Select (P3) |
| `p08-click-toggle.md` | §2.2 Toggle (P8) |
| `p10-multi-select-submit.md` | §2.2 Toggle (P10) |
| `p11-same-grid-pair.md` | §2.3 Pair-Select (P11) |
| `p12-tap-assign-palette.md` | §2.5 Two-Phase (P12) |
| `p15-cell-picker.md` | §2.5 Two-Phase (P15) |
| `p16-sequence-replay.md` | §2.4 Sequential (P16) |
| `p09-stepper.md` | §2.6 Stepper (P9) |
| `p14-edge-toggle.md` | §2.2 Toggle (P14) |
