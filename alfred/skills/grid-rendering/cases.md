# Grid Cases

---

## 1. Tap interactions in grid

### Tap-select-single

Single tap on one cell commits selection, immediate right/wrong feedback.

- Variants: tap-pool-option-to-fill-slot · tap-cell-at-given-coordinate · tap-incorrect-digits-to-eliminate

### Tap-cycle (tristate / multi-state)

Each tap cycles through fixed value set: empty → A → B → ... → empty. No external picker.

- Variants: cycle digits in kakuro cells · cycle colour-numbers (sudoku-style) · tap-toggle on/off (queens)

### Tap-cell-then-pick-from-palette (P15)

Two-phase: tap empty cell to focus, then tap value from external keypad / palette below grid.

- Variants: numeric keypad after tap · colour palette after tap · "I don't know" button included · cross-factor 5-cell with HCF cell · place-value constraint cells (green/yellow)

### Tap-multi-select (select all matching, no submit)

Tap multiple cells to mark all that satisfy a condition; each tap is immediately scored.

- Variants: select all multiples of N · select cells with quota constraint (max 2 per colour) · eliminate cells by colour rule

### Tap-adjacent-chain (path build)

Tap adjacent cells sequentially to build a path; each tap extends from the previous cell.

- Variants: 4-clue treasure hunt · path to target sum · maze navigation · doubling-chain · hex sequence build

### Tap-to-reveal / memory pair

Tap pairs of cells to reveal and match; matched pairs lock or vanish.

### Tap-as-focus (keyboard cell)

Tap cell to focus it; keyboard or numeric keypad opens automatically. Cell shows focus border.

### Audio-button cell

Cell contains speaker icon; tap plays audio. No input.

### Stepper cell (+/−)

Cell shows value with adjacent + and − buttons; tap to increment/decrement.

---

## 2. Drag-and-drop into grid (from external pool)

### Drop digit token (pool to cell)

Drag digit card from pool tray onto target grid cell. Cell becomes filled/locked on drop.

- Variants: maximise sum · minimise sum · hit bounded sum · satisfy clues · cross-numbers

### Drop colour / shape token

Drag a coloured block or shape from a pool into a grid cell, often with adjacency / region rules.

- Variants: Y/G/B blocks with sequence · colour-no-repeat constraint · cross-number colour grid

### Drop multi-cell piece (polyomino / shape group)

Drag a single shape made of multiple cells (tetromino, L, domino) into the grid as one unit.

- Variants: drop into coloured region with region-sum constraint · drop number cards into ordering slots

### Drop with rotation

Piece can be rotated before or during drag.

### Drop with snap-to-cell

Released drag automatically aligns to nearest grid cell. Implicit in nearly every cross-grid drop.

### Drop with category filter

Only certain pool items can drop into certain cells based on rules (colour matches cell type, digit matches constraint, etc.).

- Variants: digit pool with target-sum filter · compass distance + direction dropdown pairs

### Drop into irregular / scattered zones

Drop targets are scattered, not part of a regular grid; each is independent.

- Variants: drag label into image zone · drag place-value blocks to two zones for balance

---

## 3. Rearranging within grid via DnD

### Swap two cells (drag A onto B)

Drag one filled cell onto another to exchange their values. No external pool involved.

- Variants: tap-pair swap (P11 alternative) · hex-tile swap · cross-grid digit swap

### Move cell to empty slot (within grid)

Drag a filled cell to an empty position; source becomes empty.

### Drag-reorder whole row / column

Use a row/column handle to move the entire row/column up/down (or left/right). Vertical or horizontal axis only.

### Drag a sub-section / block

Drag a rectangular sub-grid of cells together.

---

## 4. Arbitrary cell positions (non-rectangular layouts)

### Rectangular bounding box with hidden cells

Most "cross-shape" / "T-shape" / "L-shape" grids are this — a rectangular grid with some interior cells masked out (transparent / no border / not interactive).

- Variants: 5-cell cross · 7-cell cross with HCF · L-shape cross-number · T-shape variants

### Hex honeycomb (single cluster)

7 cells: one centre + 6 surrounding hexes.

- Variants: type variables A & B · tap-divide-to-target · multi-select hexes summing to target · tap sequence to build number

### Hex honeycomb (multi-cluster)

Two or more 7-cell hex clusters, each independent or sharing seams.

### Polyomino / silhouette outline

Non-rectangular outline (animal shape, letter shape) bounding a region of cells.

### Kakuro grid

Rectangular grid with thick borders separating clue cells (black, two-number split for horizontal+vertical sums) from answer cells. Answer cells in runs must sum to clue.

- Variants: drag-numbers-into-cells · tap-cycle digits · tap incorrect digits to hide · swap prefilled digits

### Nonogram grid

Rectangular grid with numeric clues on top (columns) and left (rows). Clue cells are not interactive.

- Variants: tap clue header then fill cells · multi-select cells must stay empty · drag clue tiles into headers (reverse)

### Coordinate grid (with axes)

Rectangular grid with x/y axis labels; cells referenced by (x, y).

- Variants: tap cell at given coordinate · type coords from icon position · two-clue intersect then type

### Staircase / zigzag (kakuro-derived, asymmetric)

Cells arranged along a diagonal staircase. Subset of carved-rectangular layout.

### Irregular collage / free layout

Cells scattered non-uniformly (no regular row/column pattern).

---

## 5. Input in grid

### Single-cell typed input

Tap to focus, type one number or word. Length 1–N.

- Variants: long-division blanks · pyramid input across tiers · decimal input · place-value clue input

### Input wrapped in styled box

Visible border, dashed outline, or background colour distinguishes input from locked label cells.

### Input with constraint

Numeric-only · max length · range-clamped · single digit · decimal allowed.

### Input with auto-focus / auto-advance

After entering a digit, focus moves automatically to next cell in sequence (left-to-right or top-to-bottom).

### Input in irregular / scattered position

Input fields placed at non-regular positions on the grid.

### Inline-keypad input

Cell focus opens an on-screen keypad rendered below the grid (vs. system keyboard).

---

## 6. Multiple inputs in a single row / column

### Row of N input cells in sequence

Multiple input cells across one row; student fills in order or any order.

- Variants: tens + ones decomposition · pyramid tier · long-division row · pair-sum table

### Input row + computed-output row

Top row inputs; bottom row displays computed result (or also inputs).

### Mixed-input row (some prefilled / some blank)

Some cells locked-given, others empty inputs interleaved.

### Input column (vertical sequence)

Vertical list of input cells.

### Vertical sum / multiplication column

Column of inputs whose total is computed (column addition layout).

---

## 7. Disabled / non-interactive cells

### Question-context cells

Labels, headers, illustrations, axis labels, clue text — visible but non-interactive.

- Variants: clue cells in cross-factor (e.g. "24", "15") · operator cells in kakuro ("+", "−", "×", "=") · axis labels (x / y) · multi-line instruction cell

### Prefilled answer (locked-given)

Cell contains the correct answer; student cannot modify. Often light bg or lock icon.

### Cells disabled mid-round

Cell becomes disabled after a state change — memory matched-pair, exhausted move, completed sub-task.

### Visible but un-targetable

Obstacle cells, boundary cells, masked cells. Visible in layout but cannot be tapped or dropped on.

- Variants: dark blocked cells in kakuro · transparent cells in cross / T / L shapes (carved)

---

## 8. Content-only cells

### Pure text label

Cell renders text only ("Enter:", "Find:", names of cells).

### Pure image / illustration

Icon, illustration, marker, treasure-island art.

- Variants: speaker icon · treasure marker · start/finish illustration

### Pure number (locked given)

Fixed reference number. Most common content-only case in cross-factor / kakuro.

### Operator symbol

Single math operator: `+`, `−`, `×`, `=`, `÷`, `±`. Locked, never an input.

- Variants: kakuro split clue (`8\15`), arithmetic-row operators

### Audio button as content

Speaker icon, tap to play. The cell _content_ is the audio control, not text.

### Animated / decorative content

Pulsing target, themed background, decorative illustration.

### Multi-symbol stacked content

Single cell rendering multiple values: kakuro clue (`8\15` = 8 across, 15 down), fraction notation (numerator/denominator).

---

## 9. Cell-state behaviours during play

| State                | Trigger                             |
| -------------------- | ----------------------------------- |
| `pre-fill`           | Round start, locked-given           |
| `focus`              | Cell tapped, picker opens           |
| `correct-flash`      | Right answer                        |
| `wrong-flash`        | Wrong answer                        |
| `conflict-pulse`     | Constraint violation with neighbour |
| `auto-grey`          | Constraint forces value             |
| `trail`              | Visited path cell                   |
| `goal-pulse`         | Round complete / target highlight   |
| `hide / reveal`      | State change shows or hides cell    |
| `rotate`             | Cell content rotates                |
| `animate value`      | Tween from old → new                |
| `locked-after-match` | Pair matched / completion           |

---

## 10. Cross-cell behaviours

### Live row / column sum readout

Cumulative sum / product display updating in real time as cells fill.

### Path line drawn between cells

Visual line / arrow connecting tapped cells in sequence, drawn on top of grid.

### Multi-cell piece spans N cells

Atomic piece occupies multiple cells; drag/place is one action.

### Reorder propagation

Reordering a row updates all dependent display cells together.

### Constraint propagation (cell forces neighbour)

Filling one cell narrows neighbours' valid options. Sudoku, kakuro, nonogram.

### Dependent cells (computed from another)

Cell B = f(Cell A); B updates when A changes.

### Clue-tap highlights related cells

Tap a clue cell, all answer cells it governs highlight.

---

## 11. Surround pieces tied to grid

- Pool / tray of draggables
- Clue panel (separate)
- Live readout (progress, lives)
- Reset button
- Submit button
- Hint button
- Palette / number picker on focus
- Dropdown summary table
- Compass / direction picker

---

## 12. Tail / one-off cases

- Cells with rotation handles (rotate-pipes)
- Cells that grow with input length (crossword)
- Conditional appearance (toggle visibility)
- Drag with axis-restriction (vertical row drag)
- Marquee multi-select
- Slider in cell
- Speech-to-text in cell
- Colour swatch picker in cell
- 2D coord drag (free placement)
- Programming-arrow code blocks in grid
- Stacking / layering cells (cycle layers)
- Shape-Sudoku (shapes instead of digits)
- Factor-tree / node-link puzzle cells
- Multi-game emoji feedback matrix (skip — meta-UI)
- Calendar multi-select (skip — not a math grid)
