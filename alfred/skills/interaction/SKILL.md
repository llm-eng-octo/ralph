# Skill: Interaction Patterns

## Purpose

Define the 17 canonical interaction patterns (16 active + 1 deprecated — P4 Tap+Swipe) so every game uses the correct event listeners, state management, touch handling, hit detection, undo behavior, and visual feedback for its interaction type. Without this, each game invents its own interaction code — leading to inconsistent touch handling, broken drag on mobile, missing guards, and unreliable input blocking.

## Ownership boundaries (read first)

This skill owns events, guards, selection state, undo/reset, and per-pattern drag/hit-detection. It does NOT own the rules below — for those, link to the canonical owner instead of restating:

| Concern | Owner | What this skill does |
|---|---|---|
| Events, guards, state machines, undo/reset | **Interaction (this skill)** | Owns directly |
| SFX / TTS sequencing + await rules + cleanup-between-rounds | **Feedback skill** (`skills/feedback/SKILL.md`) | Link; never restate timing |
| Touch targets (44×44), `touch-action`, `inputmode`, `visualViewport` | **Mobile skill** (`skills/mobile/SKILL.md`) | Link; never restate CSS |
| `recordAttempt` field shape + telemetry | **Data-contract skill** | Link; never inline `{ /* 12 fields */ }` placeholders |
| Round lifecycle helpers (`loadRound`, `renderRound`, `syncDOM`, `floatingBtn`, `endGame`, `restartGame`) | **Game-building / PART docs** | Reference by name; do not define |

## When to use

Every game generation. The game-building step reads this skill after identifying the interaction pattern from the archetype and spec. The interaction pattern determines which event listeners to attach, how to manage selection state, when to block input, and how to wire visual feedback.

## Owner

**Maintainer:** Gen Quality slot (reviews interaction code) + Mobile slot (reviews touch handling).
**Deletion trigger:** Retire when interaction handling moves to a shared CDN component that games import rather than implement inline.

## Reads

- `skills/game-archetypes/SKILL.md` — archetype determines the interaction type — **ALWAYS**
- `skills/mobile/SKILL.md` — touch targets, gesture suppression, `touch-action` — **ALWAYS**
- `skills/feedback/SKILL.md` — feedback behavior depends on single-step vs multi-step — **ALWAYS**
- `skills/game-building/reference/code-patterns.md` — answer handler sequence, guards, syncDOM — **ON-DEMAND**

## Input

- Game archetype (from spec-creation / game-planning)
- Interaction type from the spec (tap, drag, input, match, etc.)
- Single-step vs multi-step (determines feedback wiring)

## Output

Interaction code baked into the generated game. The builder reads this skill and implements the correct pattern for the game's interaction type.

## Reference Files

| File | Contents | When to read |
|------|----------|-------------|
| [patterns-summary.md](reference/patterns-summary.md) | Quick-reference table of all 17 patterns + 2 modifiers | **ALWAYS** (to identify which pattern files to load) |
| [touch-events.md](reference/touch-events.md) | Event type decision tree, pointer events guide, hit detection, gesture suppression, preventDefault rules | **ALWAYS during code generation** |
| [state-and-guards.md](reference/state-and-guards.md) | Selection state machines, isProcessing guards, undo/reset patterns, common guard code | **ALWAYS during code generation** |
| [host-helpers.md](reference/host-helpers.md) | Glossary of symbols used in interaction examples that are not defined here (game-local helpers, telemetry, test-harness `solveRound`, sticker constants). Cross-links to feedback skill's `host-helpers.md` for shared scaffolding helpers. | **ON-DEMAND** when a code example references an unfamiliar symbol |
| [validator-map.md](reference/validator-map.md) | Status table for every validator cited by this skill (`GEN-DND-*`, `GEN-FEEDBACK-TTS-AWAIT`, etc.) plus the retired/phantom `L-VI-002` entry. | **ON-DEMAND** when a build/review cites a rule id |

### Pattern Files (load only the ones needed for the game)

| File | Pattern |
|------|---------|
| [tap-interaction.md](reference/patterns/tap-interaction.md) | **All tap/click patterns** — P1, P2, P3, P8, P9, P10, P11, P12, P14, P15, P16 |
| [p05-continuous-drag-path.md](reference/patterns/p05-continuous-drag-path.md) | Continuous Drag (Path) — draw path across grid |
| [p06-drag-and-drop.md](reference/patterns/p06-drag-and-drop.md) | Drag-and-Drop via `@dnd-kit/dom` — eviction/swap, edge-scroll, zone-to-zone, bank re-centering |
| [p07-text-input.md](reference/patterns/p07-text-input.md) | Text/Number Input — Enter/Submit handler, guards, telemetry, awaited feedback |
| [p07-input-behaviors.md](reference/patterns/p07-input-behaviors.md) | **P7 required behaviors** — auto-focus + scroll-into-view, auto-growing width (MANDATORY for every P7 game) |
| [p13-directional-drag.md](reference/patterns/p13-directional-drag.md) | Directional Drag (Constrained Axis) — Rush Hour style |
| [p17-voice-input.md](reference/patterns/p17-voice-input.md) | Voice Input — speak or type answer via VoiceInput CDN package |
| [modifier-observe-phase.md](reference/patterns/modifier-observe-phase.md) | Observe-then-Respond phase wrapper |
| [modifier-multi-step-mcq.md](reference/patterns/modifier-multi-step-mcq.md) | Multi-Step MCQ — P1 repeated N times per round |

---

## Full Pattern Inventory (17 patterns — 16 active + P4 deprecated)

| # | Pattern | Events | Step type | Game count |
|---|---------|--------|-----------|------------|
| 1 | Tap-Select (Single) | `click` | Single | 11 |
| 2 | Tap-Select (Sequential Chain) | `click` | Multi | 1 |
| 3 | Tap-Select (Two-Phase Match) | `click` | Multi | 3 |
| 4 | ~~Tap + Swipe~~ **DEPRECATED** — use P1 tap-only | — | — | 0 |
| 5 | Continuous Drag (Path) | `pointerdown`+`pointermove`+`pointerup` | Multi | 3 |
| 6 | Drag-and-Drop (Pick & Place) | `@dnd-kit/dom` (ESM) — DragDropManager/Draggable/Droppable | Multi | 4 |
| 7 | Text/Number Input | `keydown`+`click` | Single | 8 |
| 8 | Click-to-Toggle | `click` | Multi | 3 |
| 9 | Stepper (Increment/Decrement) | `click` | Multi | 1 |
| 10 | Multi-Select + Submit | `click` + submit button | Multi | 6 |
| 11 | Same-Grid Pair Selection | `click` | Multi | 3 |
| 12 | Tap-to-Assign (Palette) | `click` (palette) + `click` (items) | Multi | 1 |
| 13 | Directional Drag (Constrained Axis) | `pointerdown`+`pointermove`+`pointerup` | Multi | 1 |
| 14 | Edge/Segment Toggle | `click` | Multi | 1 |
| 15 | Cell Select → Number Picker | `click` (cell) + `click` (picker) | Multi | 3 |
| 16 | Sequence Replay (Observe → Reproduce) | `click` | Multi | 1 |
| 17 | Voice Input (Speak or Type) | `getUserMedia` + `click` | Single | — |

---

## Interaction Pattern Identification

### Step 1: Read the archetype

| Archetype | Default interaction pattern |
|-----------|---------------------------|
| MCQ Quiz | Tap-Select (Single) — P1 |
| Speed Blitz | Tap-Select (Single) — P1 |
| Lives Challenge | Tap-Select (Single) — P1, or Text/Number Input — P7 |
| No-Penalty Explorer | Tap-Select (Single) — P1 |
| Sort/Classify | Drag-and-Drop (Pick & Place) — P6 |
| Memory Match | Tap-Select (Two-Phase Match) — P3 |
| Board Puzzle | Click-to-Toggle — P8, or Cell Select → Number Picker — P15 |
| Construction | Drag-and-Drop — P6, or Tap-Select (Single) — P1 |
| Worked Example | Tap-Select (Single) — P1 + Text/Number Input — P7 |
| Tracking/Attention | Tap-Select (Single) — P1, or Sequence Replay — P16 |

### Step 2: Check spec overrides

| Spec keyword | Overrides to | Pattern # |
|-------------|-------------|-----------|
| "drag", "sort into", "place in zone" | Drag-and-Drop | P6 |
| "drag into grid cells", "drag tags into cells" | Drag-and-Drop (grid variant) | P6 |
| "swipe", "slide jelly/piece", "push" | ~~Tap + Swipe~~ **DEPRECATED** — convert to Tap-Select (progressive tap with directional buttons) | P1 |
| "slide block", "Rush Hour", "move block along axis" | Directional Drag (Constrained) | P13 |
| "draw a path", "connect cells", "trace", "navigate maze" | Continuous Drag (Path) | P5 |
| "match pairs", "find the pair", "flip cards" | Two-Phase Match | P3 |
| "tap pairs from same grid", "pairs that sum to" | Same-Grid Pair Selection | P11 |
| "build a chain", "tap in sequence", "find the sequence" | Sequential Chain | P2 |
| "type", "enter the number", "fill in the blank" | Text/Number Input | P7 |
| "toggle", "place/remove", "click to fill", "hide/show" | Click-to-Toggle | P8 |
| "toggle edges", "draw segments between dots" | Edge/Segment Toggle | P14 |
| "select all correct", "checkbox", "multi-select + submit" | Multi-Select + Submit | P10 |
| "select numbers to reach target", "tap to add to sum" | Multi-Select + Submit (auto-check variant) | P10 |
| "+/- buttons", "adjust", "increment/decrement" | Stepper | P9 |
| "colour-code", "assign category", "label each item" | Tap-to-Assign (Palette) | P12 |
| "tap cell then pick number", "number picker" | Cell Select → Number Picker | P15 |
| "watch sequence then repeat", "Simon Says" | Sequence Replay | P16 |
| "say your answer", "speak", "voice input", "type or speak" | Voice Input | P17 |

### Step 3: Determine single-step vs multi-step

The "Step type" column in the Full Pattern Inventory above is the source of truth. Not restated here.

---

## Phase Modifier: Observe-then-Respond

Some games have a **memorize/observe phase** before the interaction phase. This is NOT a separate pattern — it's a phase that wraps an existing interaction pattern.

| Observe type | How it works | Then interacts via | Games |
|-------------|-------------|-------------------|-------|
| **Visual memorize** | Grid/pattern shown briefly, then hidden | Click-to-Toggle (P8), Text Input (P7), Tap-Select (P1) | Visual Memory, Disappearing Numbers, Matrix Memory |
| **Sequential memorize** | Items shown one by one | Sequence Replay (P16), Text Input (P7) | Simon Says, Listen and Add, Totals in a Flash |
| **Learn pairs** | Pairs shown sequentially | Two-Phase Match (P3), Text Input (P7), Tap-Select (P1) | Associations, Word Pairs, Face Memory |
| **Track movement** | Item hidden, containers shuffle | Tap-Select (P1) | Keep Track |

**Implementation:** The observe phase uses `setTimeout` or animation callbacks to control timing. During the observe phase, `gameState.phase = 'observing'` and all interaction handlers return early. After the observe phase completes, `gameState.phase = 'responding'` and interaction is enabled.

---

## Game-Flow Modifier: Multi-Step MCQ

Some games use Tap-Select (Single) — P1 — multiple times within a single round. Each step is an independent MCQ choice, but they're chained together as sub-steps of one round.

| How it works | Games |
|-------------|-------|
| Round has 2-3 MCQ sub-steps. Each step shows options, student taps one, immediate feedback, then next step appears. Round completes after all sub-steps are answered. | Expression Completer, Sequence Builder, Aided Game, Two-Digit Doubles Aided |

**Implementation:** Track `gameState.currentStep` within each round. The interaction pattern per step is still P1 (Tap-Select Single). The round advances when `currentStep >= totalSteps`.

---

## Game → Pattern Mapping

The pattern decision for a new game is made from the spec's interaction keywords against the **Step 2: Check spec overrides** table above (combined with the archetype default in Step 1). Per-game pattern assignments belong in spec-creation / game-planning, not here — a static roster in this skill drifts as games are added or retired.

A historical roster of the 50+ shipped games and their pattern assignments was removed during the 2026-05-12 interaction audit. If you need to look up "which pattern does game X use", the authoritative source is `games/<gameId>/spec.md` for that game.

---

## The 17 Patterns (Summary — P4 deprecated)

### Pattern 1: Tap-Select (Single)

**What:** Student taps one element to make a choice. One tap = one evaluation.
**Events:** `click` on option buttons or grid cells.
**Game type:** Single-step.
**Selection:** No persistent selection. Tap = immediate evaluation.
**Guards:** `isProcessing`, `isActive`, `gameEnded`.
**Feedback:** Awaited SFX → awaited dynamic TTS (see feedback skill `SKILL.md` Single-step row + validator `GEN-FEEDBACK-TTS-AWAIT`). Input stays blocked for the full awaited-feedback window; `isProcessing` is re-enabled in `loadRound()` / `renderRound()`, never in the submit handler.
**Used by:** MCQ Quiz, Rapid Challenge, True/False, One Digit Doubles, Position Maximizer, Number Pattern, Face Memory (response phase), Associations (response phase), Keep Track, Two-Player Race.

### Pattern 2: Tap-Select (Sequential Chain)

**What:** Student taps elements in a specific order to build a chain/sequence.
**Events:** `click` on grid tiles.
**Game type:** Multi-step.
**Selection:** Persistent — each valid tap adds `.selected`. Wrong tap force-resets entire chain.
**Guards:** `isProcessing`, `isActive`, tile in `completedTiles`.
**Feedback:** Fire-and-forget SFX + sticker per tap. Awaited SFX on round-complete.
**Used by:** Doubles.

### Pattern 3: Tap-Select (Two-Phase Match)

**What:** Student taps item A, then taps matching item B. Two taps = one evaluation.
**Events:** `click`/`onclick` on items in both groups.
**Game type:** Multi-step.
**Selection:** First tap highlights (`.selected`). Re-selectable before second tap. Second tap evaluates.
**Guards:** `isProcessing`, `selectedA !== null`, item not `.matched`.
**Feedback:** Fire-and-forget SFX + sticker per match. Awaited SFX on round-complete.
**Used by:** Matching Doubles, Match the Cards, Memory Flip.

### Pattern 4: ~~Tap + Swipe~~ — DEPRECATED

**DEPRECATED.** Swipe interactions are unreliable on mobile. Convert to P1 (Tap-Select) with directional buttons or progressive tapping. If a spec mentions "swipe", "slide", or "push", redesign as tap-only during spec creation.
**Previously used by:** Jelly Doods (now uses P1 with directional buttons).

### Pattern 5: Continuous Drag (Path)

**What:** Student draws a continuous path by pressing and dragging across cells.
**Events:** `pointerdown` on grid, `pointermove`+`pointerup`+`pointercancel` on document.
**Game type:** Multi-step.
**Hit detection:** `document.elementFromPoint(clientX, clientY)`.
**Feedback:** Fire-and-forget tap SFX per cell. Awaited SFX + TTS on puzzle-complete.
**Variant — Tap Path (Crazy Maze):** Student taps adjacent cells one by one instead of continuous drag. Same state (path array), but uses `click` events instead of pointer events. Running total tracked and displayed. *(Structurally this variant is closer to P1/P2 than to P5; it lives under P5 only because it shares the path-array state model. Treat the event-type rules as P1/P2.)*
**Used by:** Connect, Zip, Crazy Maze.

### Pattern 6: Drag-and-Drop (Pick & Place)

**What:** Student picks up an item and drops it into a target zone or grid cell.
**Library:** **`@dnd-kit/dom`** loaded via ESM CDN (`https://esm.sh/@dnd-kit/dom@beta`). Use `DragDropManager`, `Draggable`, `Droppable` — never native HTML5 drag (`draggable="true"` / `dataTransfer`) and never hand-rolled pointer events. See `reference/patterns/p06-drag-and-drop.md` for the full required behaviours and verification matrix, which is MANDATORY for every P6 game.
**Events:** handled by the library's pointer sensor — cross-device (mouse + touch) out of the box. Listen to `manager.monitor` (`dragstart`, `dragend`).
**Game type:** Multi-step.
**Gesture CSS:** Owned by the mobile skill. P6's interaction requirement is that any gesture suppression is scoped to draggable items and never applied to `body`, containers, the bank, or drop zones.
**Tracking:** game-controlled `locations` map (tagId → 'bank' | 'zone-N'). Never infer origin from `parentElement` — the library reparents during drag. Required to distinguish evict (bank→zone) from swap (zone→zone).
**Lifecycle:** destroy manager + draggables + droppables + clear tracking at the start of every round and in `endGame()`.
**Feedback:** Fire-and-forget SFX + sticker per drop. Awaited SFX on round-complete.
**Variant — Grid Cell Drop:** Drop targets are individual grid cells (not category zones). Used by Kakuro, Equation Grid, Math Crossword.
**Used by:** Equation Grid, Math Crossword, Kakuro.

### Pattern 7: Text/Number Input

**What:** Student types answer and submits via Enter key or Submit button.
**Events:** `keydown` (Enter) on input, `click` on submit button.
**Game type:** Single-step.
**Input surface:** Mobile skill owns input HTML attributes, keyboard behavior, font sizing, viewport handling, and blur-on-submit. Per-pattern interaction requirements live in [`p07-input-behaviors.md`](reference/patterns/p07-input-behaviors.md).
**Variant — Textarea (Subjective):** `<textarea>` for free-text responses. LLM evaluates.
**Variant — Mixed (Interactive Chat):** Alternates between text input and MCQ buttons per message.
**Used by:** Speed Input, Listen and Add, Totals in a Flash, Disappearing Numbers, Word Pairs, Matrix Memory, Adjustment Strategy (sum step), Colour Coding Tool (sum step), Explain the Pattern, Subjective, Interactive Chat.

### Pattern 8: Click-to-Toggle

**What:** Student clicks cells to cycle through states. Board evaluated against constraints.
**Events:** `click` on grid cells.
**Game type:** Multi-step.
**Selection:** Toggle (click again = undo).
**Feedback:** No audio per toggle. Constraint violations visual-only. Awaited SFX + TTS on solve.
**Variant — Toggle + Submit:** Student toggles cells, then presses Check/Submit to validate (Hide-Unhide, Visual Memory). Constraints NOT checked per-toggle — only on submit.
**Used by:** Queens, Light Up, Hide-Unhide, Visual Memory (response phase).

### Pattern 9: Stepper (Increment/Decrement)

**What:** Student taps +/− buttons to adjust a numeric value. Two linked values adjust inversely.
**Events:** `click` on +/− buttons.
**Game type:** Multi-step (adjust + then submit/type answer).
**Selection:** No selection state. Each +/− tap updates the displayed value immediately.
**State:** `adjustedValues` array tracking current values. Value clamped within valid range.
**Submit:** After adjusting, student types the sum into an input field (combines with P7).
**Guards:** `isProcessing`, value at min/max bound.
**Feedback:** Fire-and-forget tap SFX per +/− press. Evaluation happens on submit (single-step for the submit part).
**Used by:** Adjustment Strategy.

### Pattern 10: Multi-Select + Submit

**What:** Student taps multiple items to toggle their selected state (checkbox-style), then presses Submit to evaluate all selections at once.
**Events:** `click` on items (toggle `.selected`), `click` on Submit button.
**Game type:** Multi-step (toggling) → single-step evaluation (submit).
**Selection:** Each tap toggles `.selected` on/off. Multiple items can be selected simultaneously.
**State:** `selectedItems` Set tracking which items are toggled on.
**Variant — Running Sum (Hidden Sums, Make-X):** A live counter shows the running sum of selected values. Auto-check: if sum equals target → correct; if sum exceeds target → incorrect (Make-X).
**Variant — All-or-Nothing (MCQ Multi-Select):** Must select ALL correct AND no incorrect. Partial credit not given.
**Guards:** `isProcessing`, Submit disabled when nothing selected.
**Feedback:** Fire-and-forget tap SFX per toggle. Awaited SFX → TTS on Submit evaluation.
**Used by:** MCQ Multi-Select, Hidden Sums, Make-X, Hide-Unhide (row targets), Truth Tellers & Liars, Visual Memory (reconstruction phase).

### Pattern 11: Same-Grid Pair Selection

**What:** Student taps two items from the same grid that form a valid pair. Two taps from one pool.
**Events:** `click` on grid items.
**Game type:** Multi-step (multiple pairs per round).
**Selection:** First tap highlights item A (`.selected`). Second tap evaluates: if A + B form a valid pair, both are removed/marked. If not, flash incorrect.
**Difference from P3:** Both items come from the same grid (not separate left/right groups). No group enabling/disabling.
**State:** `selectedIndex` (first selection), `matchedPairs` Set, `removedItems` Set.
**Guards:** `isProcessing`, item not already matched/removed.
**Feedback:** Fire-and-forget SFX + sticker per correct pair. Fire-and-forget wrong SFX on mismatch. Awaited SFX on round-complete (all pairs found).
**Used by:** Bubbles Pairs, Speedy Taps, Identify Pairs List.

### Pattern 12: Tap-to-Assign (Palette)

**What:** Student selects a colour/category from a palette, then taps items to assign that colour/category to them.
**Events:** `click` on palette swatches (select colour), `click` on items (assign colour).
**Game type:** Multi-step (assign + then submit).
**Selection:** Active palette colour (`.palette-active`). Tapping an item applies the active colour.
**State:** `activePalette` (current colour), `assignments` Map (item → colour).
**Submit:** After colouring, student types the answer (combines with P7) or presses Check.
**Guards:** `isProcessing`, no active palette selected.
**Feedback:** Fire-and-forget tap SFX per assignment. Evaluation on submit.
**Used by:** Colour Coding Tool. (Truth Tellers & Liars can also use this pattern — assign T/L labels.)

### Pattern 13: Directional Drag (Constrained Axis)

**What:** Student drags blocks along their allowed axis (horizontal OR vertical, not both) to clear a path. Rush Hour / sliding block puzzle.
**Events:** `pointerdown` on block, `pointermove`+`pointerup`+`pointercancel` on document.
**Game type:** Multi-step (multiple block moves to solve).
**Drag constraint:** Each block has an `orientation` (horizontal/vertical). During drag, movement is locked to that axis only.
**Hit detection:** Track block position by pointer delta along the constrained axis. Snap to grid cells.
**State:** `blocks` array with `{id, row, col, length, orientation}`. `selectedBlock` during drag. `moveCount`.
**Win condition:** Key block reaches the exit cell/edge.
**Undo:** Move history stack. Undo button restores previous state.
**Guards:** `isProcessing`, `solved`, block not movable (blocked by adjacent block).
**Feedback:** Fire-and-forget slide SFX per move. Awaited SFX + TTS on puzzle-complete.
**Used by:** Free the Key.

### Pattern 14: Edge/Segment Toggle

**What:** Student taps between adjacent dots/nodes to toggle a line segment on/off, forming a closed loop or path.
**Events:** `click` on edge elements (rendered between dots).
**Game type:** Multi-step.
**Target:** The interactive elements are the **edges** between cells/dots, not the cells/dots themselves. Edges are typically thin rectangular hit areas between grid points.
**State:** `edges` Map (edge key → boolean on/off). Constraint: numbered squares dictate how many adjacent edges must be on.
**Constraint checking:** After each toggle, check if any numbered constraint is violated (highlight violations). Auto-validate when a valid closed loop is detected.
**Undo:** Click same edge again (toggle off).
**Guards:** `isProcessing`, `solved`.
**Feedback:** Fire-and-forget tap SFX per toggle. Constraint violations visual-only. Awaited SFX + TTS on puzzle-complete.
**Used by:** Loop the Loop.

### Pattern 15: Cell Select → Number Picker

**What:** Student taps a grid cell to select it, then chooses a number from a popup picker or inline number bar to place it.
**Events:** `click` on grid cell (opens picker), `click` on picker number (places value).
**Game type:** Multi-step (fill multiple cells).
**Two-phase within a single action:**
  1. Tap empty cell → cell highlights, picker appears (inline bar or popup).
  2. Tap number in picker → number placed in cell, picker dismisses.
  3. Tap same cell again → clears the placed number (undo).
**State:** `selectedCell` (`{row, col}` or null), `grid[][]` (placed values), `lockedCells` (pre-filled clues).
**Constraint checking:** Per-placement: check row/column uniqueness, sum constraints, inequality constraints. Highlight violations.
**Submit:** Check button validates entire grid (Kakuro, Killer Sudoku) or auto-validates when all cells filled (Futoshiki).
**Guards:** `isProcessing`, `solved`, cell is locked.
**Feedback:** Fire-and-forget tap SFX per placement. Awaited SFX + TTS on puzzle-complete.
**Used by:** Futoshiki, Kakuro (when not using drag), Killer Sudoku.

### Pattern 16: Sequence Replay (Observe → Reproduce)

**What:** Student watches a sequence play out (flashing lights, appearing items), then reproduces it by tapping in the same order.
**Events:** `click` on elements (during reproduction phase).
**Game type:** Multi-step (tap N elements in order).
**Two phases:**
  1. **Observe phase:** Elements flash/highlight in sequence with timed delays. Student watches. Input disabled (`gameState.phase = 'observing'`).
  2. **Reproduce phase:** Student taps elements in the same order. Each tap is validated immediately.
**State:** `sequence` array (the correct order), `playerSequence` array (student's taps so far), `currentStep` (position in reproduction).
**Per-tap evaluation:**
  - Correct (matches `sequence[currentStep]`): highlight, fire-and-forget SFX, increment `currentStep`.
  - Wrong: flash incorrect, life lost, round fails.
  - Sequence complete (`currentStep >= sequence.length`): round complete.
**Guards:** `isProcessing`, phase must be `'responding'` (not `'observing'`).
**Feedback:** Fire-and-forget SFX per correct tap. Wrong SFX + life lost on wrong tap. Awaited SFX on sequence complete.
**Used by:** Simon Says.

### Pattern 17: Voice Input (Speak or Type)

**What:** Student speaks an answer via microphone or types in a textarea. The VoiceInput CDN package owns recording, transcription, permission handling, and the input surface; the game only reads `voiceInput.value`.
**Events:** `getUserMedia` (managed by the CDN package) + `click` on submit. The game does NOT touch audio streams directly.
**Game type:** Single-step.
**Selection:** No persistent selection — the answer is `voiceInput.value` at submit time.
**Guards:** `isProcessing`, `isActive`, `gameEnded`. Defensive bundle around the awaited window: `voiceInput.disable()` + explicit `textarea.disabled = true; textarea.readOnly = true; textarea.blur()`; matching re-enable in `renderRound()`. See [`state-and-guards.md` §"The guard contract"](reference/state-and-guards.md).
**Feedback:** Awaited SFX → awaited dynamic TTS (canonical single-step shape, same as P7 — see [`p07-text-input.md`](reference/patterns/p07-text-input.md)).
**CDN package:** Loads via the Components bundle — no extra script tag. See `p17-voice-input.md` for full integration.
**Used by:** Speak-the-answer, Word Problem Workshop, Tap-or-Tell, Say-the-Answer (any game that accepts free-form spoken or typed answers).

---

## Cross-Cutting Rules

### 1–2. The guard contract

The full contract — three universal guards (`isActive`, `isProcessing`, `gameEnded`), per-modality entry points, when to set `isProcessing` true/false, why submit handlers must NOT clear it in-handler — lives in [`state-and-guards.md` §"The guard contract"](reference/state-and-guards.md). It is the single source of truth.

Quick reminders only (not a full restatement):

- Every handler's first three lines are the three guards.
- `isProcessing` blocks every input modality uniformly (tap, raw-pointer drag P5/P13, `@dnd-kit/dom` drag P6, text input P7, voice input P17).
- Single-step submit handlers (P1, P7, P17) set `isProcessing = true` BEFORE any await and clear it in `renderRound()` — never in the handler.
- Multi-step mid-round SFX is fire-and-forget; do NOT set `isProcessing` there.
- Audio shape (awaited vs fire-and-forget per case) is canonicalised by the feedback skill, not here.

### 3. Event type follows the touch decision tree

```
Drag-and-drop (P6, pick + place into zones / grid cells)? → @dnd-kit/dom (manager.monitor) — NEVER raw pointer events
Continuous drag (P5) or directional drag (P13)?           → raw pointer events (pointerdown, pointermove, pointerup, pointercancel)
Text input?                                              → keydown (Enter) + click (Submit)
Everything else?                                          → click
```

Never use `touchstart`/`touchmove`/`touchend` directly. Pointer events unify mouse + touch where they're used.

### 4. `preventDefault` rules

| Event | When to call `preventDefault` |
|-------|------------------------------|
| `pointerdown` (P5, P13) | Always (prevents scroll). P6 inherits this from `@dnd-kit/dom`; do not add manual `preventDefault`. |
| `pointermove` (P5, P13) | Always, when continuous drag (prevents scroll during drag) |
| `keydown` (Enter) | Always on inputs (prevents form submission / page reload) |
| `click` | Never (click is the final event, nothing to prevent) |

### 5. Hit detection during drag

Use `document.elementFromPoint(e.clientX, e.clientY)` for continuous drag (P5) and drag-and-drop (P6, P13). During a drag, `pointermove` fires on the element where the pointer was initially captured, NOT where it currently is.

### 6. Document-level listeners for drag

Attach `pointermove`, `pointerup`, and `pointercancel` to `document`, not to the grid. This ensures the drag continues even if the finger drifts outside the grid.

### 7. Gesture CSS

Owned by mobile skill — see `skills/mobile/SKILL.md` for `touch-action`, touch targets, input modes, and viewport rules. Interaction files may state the required event behavior, but mobile owns exact CSS values and severity.

### 8. Undo varies by pattern

| Pattern | Undo mechanism |
|---------|---------------|
| P1 Tap-Select (Single) | None — tap is final |
| P2 Sequential Chain | Forced reset on error |
| P3 Two-Phase Match | Re-select first item |
| ~~P4 Tap + Swipe~~ | **DEPRECATED** — use P1 tap-only |
| P5 Continuous Drag | Backtrack drag + Reset button |
| P6 Drag-and-Drop | Return to origin on miss; tap placed item to return |
| P7 Text Input | Clear input / retype |
| P8 Click-to-Toggle | Click again to toggle back |
| P9 Stepper | Tap opposite +/− button |
| P10 Multi-Select + Submit | Tap to deselect before submit |
| P11 Same-Grid Pair | Tap different item to change first selection |
| P12 Palette Assign | Tap item again with different colour |
| P13 Directional Drag | Undo button (move history stack) |
| P14 Edge Toggle | Click same edge to toggle off |
| P15 Cell + Picker | Tap filled cell to clear |
| P16 Sequence Replay | None — each tap is evaluated immediately |

---

## Constraints

1. **CRITICAL — Use the correct event type.** Drag (P5 / P13) = pointer events. Drag-and-drop (P6) = `@dnd-kit/dom` `manager.monitor` events (never raw pointer events). Everything else = click. Never mix. Never use raw touch events.
2. **CRITICAL — Every handler has guards.** `isActive`, `isProcessing`, `gameEnded`. Missing guards = double-fire, state corruption, **answer mutates during awaited feedback audio**.
2a. **CRITICAL — ALL gameplay interactions disabled during awaited feedback.** The `isProcessing` guard applies to every input modality: tap, click, drag (P5/P6/P13), text input (P7), voice (P17). For P17, also bracket the awaited audio window with `voiceInput.disable()` + explicit textarea disable/readOnly/blur in the same pre-await block; re-enable in `renderRound()`. For P6 submit-variants, also toggle `.dnd-disabled` (`pointer-events: none`) on the board. One flag, every channel.
3. **CRITICAL — `preventDefault` on pointer events for raw-pointer drag (P5, P13).** Without it, the page scrolls during drag on mobile. P6 inherits this from `@dnd-kit/dom`'s pointer sensor — do not add manual `preventDefault`.
4. **CRITICAL — Gesture CSS follows the mobile skill.** Especially: drag gesture suppression is scoped to the draggable/drag surface, never to `body`, containers, bank, or drop zones.
5. **CRITICAL — Document-level listeners for raw-pointer drag (P5, P13).** `pointermove`/`pointerup` on `document`, not on the grid. P6 uses `manager.monitor` instead.
6. **CRITICAL — `elementFromPoint` for continuous drag (P5) hit detection.** Direct `e.target` during `pointermove` gives the wrong element. P6 uses `@dnd-kit/dom` collision detection.
7. **CRITICAL — Observe phase blocks interaction.** During observe phases (P16, memorize games), `gameState.phase = 'observing'` and all handlers return early.
8. **STANDARD — Touch targets + spacing + `inputmode` + keyboard dismissal.** Per mobile skill — see there. Do not restate.
9. **STANDARD — `pointercancel` handler on raw-pointer drag patterns (P5, P13).** Handles OS-level interruptions. P6 inherits this from `@dnd-kit/dom` — do not bolt on a manual handler.
10. **STANDARD — Edge targets (P14) follow mobile touch-target rules.** Edges between dots are thin; use the mobile skill's target-sizing guidance.
11. **STANDARD — Number picker (P15) dismisses on outside tap.** Tapping outside the picker closes it without placing a number.

## Anti-patterns

1. **Using `touchstart`/`touchmove`/`touchend` instead of pointer events.**
2. **Attaching `pointermove` to the grid instead of `document`** (P5, P13).
3. **Using `e.target` during `pointermove` for hit detection.**
4. **Missing `isProcessing` guard.** (Especially on drag `pointerdown`/`@dnd-kit dragstart`, voice input, and P7 submit — not just on tap handlers. Any input channel without this guard lets the student mutate the answer while awaited feedback audio plays.)
5. **Clearing `isProcessing` in a single-step submit handler instead of `renderRound()` / `loadRound()`.** The next-round render is the single source of truth.
6. **Missing `preventDefault` on `pointerdown` for raw-pointer drag (P5, P13).**
7. **Hand-rolling pointer-event drag for P6.** Use `@dnd-kit/dom` — caught by validator `GEN-DND-KIT`. Clone-based / `draggable="true"` / `dataTransfer` approaches are forbidden.
8. **Auto-focusing input on round transition.**
9. **Not handling `pointercancel` on P5 / P13.** P6 inherits this from `@dnd-kit/dom` — do not bolt on a manual handler.
10. **Evaluating per-cell in continuous drag/puzzle games.**
11. **Blocking input with `isProcessing` during fire-and-forget multi-step SFX.**
12. **No undo in puzzle games.**
13. **Allowing interaction during observe phase.** Must check `gameState.phase !== 'observing'`.
14. **Not constraining drag axis in P13.** Free the Key blocks must only move along their orientation axis.
15. **Number picker not dismissing on outside tap.** Leaves picker open, blocks other interactions.

> Mobile concerns (raw touch events, `type="number"`, missing `touch-action: none` on draggables, sub-44px touch targets, thin edge hit areas) are anti-patterns owned by the mobile skill. Do not restate severity or rule here.

## Verification Checklist

- [ ] Correct event type used for the interaction pattern (click / raw pointer for P5,P13 / `@dnd-kit/dom` for P6 / `keydown`+`click` for P7)
- [ ] All three guards present in every handler (`isActive`, `isProcessing`, `gameEnded`)
- [ ] `preventDefault` called on `pointerdown`/`pointermove` for P5 / P13 (P6 inherits from `@dnd-kit/dom`)
- [ ] `pointermove`/`pointerup`/`pointercancel` attached to `document` for P5 / P13 (P6 uses `manager.monitor` and inherits `pointercancel` handling)
- [ ] `elementFromPoint` used for continuous drag (P5) hit detection
- [ ] Undo mechanism present for puzzle patterns
- [ ] `isProcessing` blocks during awaited audio only, not during fire-and-forget multi-step SFX
- [ ] `isProcessing` cleared in `renderRound()` / `loadRound()` — NOT in submit handler (single source of truth)
- [ ] **ALL gameplay input channels** (tap, raw-pointer drag `pointerdown`, `@dnd-kit` `dragstart`, text input submit, voice input) check `isProcessing` as the first guard — not just tap handlers
- [ ] For P17 (Voice Input): `voiceInput.disable()` + `textarea.disabled = true; readOnly = true; blur()` called before the first awaited `FeedbackManager.sound.play(...)`; matching re-enable in `renderRound()` (not in submit handler)
- [ ] For P6 (Drag-and-Drop): `.dnd-disabled` class (or equivalent `pointer-events: none`) applied to the board while `gameState.isProcessing === true`
- [ ] For P5 / P13 (raw-pointer drag): `pointermove` and `pointerup` re-check `isProcessing` / `gameEnded` so an in-flight drag aborts cleanly if awaited feedback starts mid-drag
- [ ] Feedback audio shape matches feedback skill canonical rules (single-step = awaited SFX + awaited TTS; multi-step mid-round = fire-and-forget SFX). Do not invent a local rule.
- [ ] Observe phase blocks all interaction (P16, memorize games)
- [ ] Drag axis constrained for P13 (Directional Drag)
- [ ] Number picker dismisses on outside tap (P15)
- [ ] Multi-Step MCQ tracks `currentStep` within round

> Mobile-owned items (touch-target sizing, `inputmode`, `touch-action`, `visualViewport` resize, blur-on-submit) live in the mobile skill verification checklist.
