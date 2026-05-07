# Skill: Grid Rendering

## Purpose

Produce structurally correct grid markup for any grid-based game (sudoku, kakuro, cross-number, nonogram, polyomino, hex honeycomb, logic-grid, path-finding, memory, drag-into-cell). Every grid collapses into one of three layout modes plus an orthogonal cell content + visual layer.

## When to use

Step 4 (Build), when the spec describes a grid playfield. Trigger on keywords: `grid`, `sudoku`, `kakuro`, `nonogram`, `cross`, `polyomino`, `hex`, `honeycomb`, `lattice`, `cells`, `R×C`, `treasure grid`, `tristate`. Skip for single-row input strips or receipt-style tables.

## Reads

- `skills/interaction/SKILL.md` — cell tap / drag / type wiring
- `skills/feedback/SKILL.md` — correct/wrong cell states
- `skills/mobile/SKILL.md` — touch-target sizing

## Output

Grid markup in `games/<gameId>/index.html`, with three explicit choices: layout mode, per-cell role, visual state set.

---

## Decision tree — pick the layout mode first

```
1. Rectangular bounding box, every interior cell exists?
   → MODE A (pure rectangular)

2. Rectangular bounding box, but some interior cells are missing /
   carved out / not rendered?
   → MODE B (rectangular with carving)

3. Non-rectangular outline, hex cells, or anything that wants
   absolute positioning?
   → MODE C (absolute-positioned with shapes)
```

If you cannot place the spec into one mode, re-read the spec. Do not invent a fourth mode. Do not nest modes.

---

## Mode A — Pure rectangular `R×C`

```html
<div class="grid" style="
  display: grid;
  grid-template-columns: repeat(C, var(--cell));
  grid-template-rows: repeat(R, var(--cell));
  gap: var(--gap);
  --cell: 56px;
  --gap: 4px;
">
  <div class="cell" data-row="0" data-col="0">…</div>
  <!-- R*C cells, row-major -->
</div>
```

- `display: grid`. Never tables, never flexbox for the grid itself.
- Single `--cell` size. If cells must vary, you're in B or C.
- `gap` for spacing, not cell margin.
- Cells in row-major DOM order with `data-row` + `data-col` attributes.
- Touch target ≥ 44×44 CSS px. Default 56px.
- Pick **one** source of grid lines: outer border, cell borders, or `gap`. Never combine.

### Sub-region dividers (sudoku 2×2 boxes, kakuro pair-blocks rendered in A)

Use cell borders on boundary cells, not overlay elements:
```css
.cell[data-col="1"] { border-right: 2px solid #000; }
.cell[data-row="1"] { border-bottom: 2px solid #000; }
```

---

## Mode B — Rectangular with carving (cross, kakuro, asymmetric)

Smallest rectangular bounding box that contains every visible cell. Missing cells are **rendered but invisible**.

```html
<div class="grid" style="display: grid; grid-template-columns: repeat(C, var(--cell)); grid-template-rows: repeat(R, var(--cell));">
  <div class="cell hidden" data-row="0" data-col="0"></div>
  <div class="cell"        data-row="0" data-col="1">5</div>
  <!-- … -->
</div>
```

```css
.cell.hidden { visibility: hidden; pointer-events: none; }
```

- **`visibility: hidden`, never `display: none`.** `display: none` collapses the grid track and shifts every following cell.
- Bounding box = smallest rectangle containing the shape. Don't pad with extra rows.
- The shared centre of a cross-shape is **one** cell, not two stacked cells.
- Pre-filled anchor cells (kakuro, cross-sum starts) get a distinguishing border:
  ```css
  .cell.anchor { border-top: 2px solid #00bcd4; border-bottom: 2px solid #00bcd4; }
  ```
- Visible cell count in DOM must equal the spec's described count exactly.

---

## Mode C — Absolute-positioned cells with custom shapes

For hex honeycomb, polyomino outlines, and any non-tileable layout.

```html
<div class="grid" style="position: relative; width: var(--grid-w); height: var(--grid-h);">
  <div class="cell hex" data-id="cell-0" style="left: 100px; top: 50px;">1000</div>
</div>
```

```css
.cell.hex {
  position: absolute;
  width: 64px; height: 56px;
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
  display: flex; align-items: center; justify-content: center;
}
```

### Hex grids

- Decide flat-top vs. pointy-top before any positioning. Flat-top is canonical for honeycomb math games.
- Compute pixel positions via axial coords `(q, r)`:
  ```
  x = size * (3/2 * q)
  y = size * (sqrt(3) * (r + q/2))
  ```
  Never eyeball positions. They look right at one screen size and crooked everywhere else.
- Six-around-one flower: surrounding axial coords are `(1,0), (1,-1), (0,-1), (-1,0), (-1,1), (0,1)`, centre `(0,0)`.
- Centre input is a separate hex cell with an `<input>` instead of a label, styled `text-align: center; background: transparent`.

### Polyomino outlines

- Target outline = **one SVG silhouette** + faint dotted CSS background grid + obstacle cells (eyes, anchors) as separate elements positioned inside.
- Do **not** draw the silhouette as N individually-bordered cell `<div>`s — it becomes a grid worksheet, not a craft puzzle.
- Pieces in the tray are draggable parents containing one child `<div>` per cell of the piece. On drop, snap each child to a position on the underlying dotted grid.

---

## Default cell styles

Baseline for every cell across all three modes. States (next section) describe deltas from this default — they do not redefine the cell.

```css
.cell {
  border: 1px solid #000;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
  font-weight: 600;
  font-size: calc(var(--cell) * 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- Border colour is `#000` everywhere unless a state overrides it (`anchor` cyan, `focused` yellow). `correct` / `wrong` change background only; the black border stays.
- Border-radius `6px`. Use square corners (`0`) only when the spec explicitly calls for them.
- When `gap: 0`, set `border-right: 0; border-bottom: 0` on every cell and apply a single right+bottom border to the outer container, otherwise adjacent borders double to 2px.
- Drop-target hover cue: temporarily swap to `border: 2px dashed #000` on the hovered cell.

---

## Cell content layer (orthogonal to mode)

Each cell carries **at most one** content type:

| Content | Renders | Interaction |
|---|---|---|
| `text` | Static label | None (locked-given) |
| `input` | `<input>` | Type a value |
| `dropdown` | `<select>` | Pick option |
| `image` | `<img>` | None (illustration / marker) |
| `tappable` | Cycles through fixed value set | Tap to cycle |
| `drop-target` | Empty receptacle | Drop onto |
| `draggable` | Pre-filled, movable | Drag to swap |
| `prose` | Static text / label / heading rendered **inside a grid track without cell chrome** | None |

Never combine two on the same cell. If the spec seems to demand both, you've misread it — usually the spec means two distinct cells of UI.

**Prose cells.** When surround content (instructions, column labels like *Number 1*, sentence fragments in a re-arrange puzzle, kakuro sum hints) has a fixed row/column slot, render it inside the grid — not as a sibling above/beside — so tracks stay aligned on resize. Strip the chrome: `.cell.prose { border: 0; background: transparent; padding: 0; font-weight: 400; }`. Prose cells DO occupy a grid track but DO NOT count toward the spec's visible-cell count in § Validation checklist.

---

## Cell visual states

| State | When | Delta from default |
|---|---|---|
| `empty` | Default empty target | (no change — this *is* the default) |
| `locked` | Pre-filled, read-only | bg `#eee` |
| `draggable` | Pre-filled, movable | border becomes `1px dashed #000` |
| `anchor` | Special pre-filled (kakuro clue, cross start) | top + bottom borders become `2px solid #00bcd4` |
| `obstacle` | Impassable (path-grid black, polyomino eye) | bg `#000`; `pointer-events: none` |
| `marker` | Start / Goal | overlay element on top (oval / illustration) |
| `focused` | Selected for input/picker | border becomes `2px solid #f5c84a` |
| `correct` | Validated correct | bg `#d9f8d9`, brief flash |
| `wrong` | Validated wrong | bg `#ffd9d9`, brief flash |
| `trail` | Visited path cell | bg `#fef9e7`, retained until reset |
| `goal-pulse` | Round-complete celebration | gold `box-shadow` glow + pulse animation |

Conflict highlighting (sudoku, kakuro) must highlight **both** the offending cell and its constraint-neighbour, not just the offender.

---

## Surround UI

Render only the pieces the spec mentions. Do not invent.

| Piece | Position | When |
|---|---|---|
| Status strip (round, lives, stars, optional timer) | Above grid | Always |
| Instruction text | Above grid | Always |
| Clue panel | Above or beside | When spec mentions clues |
| Live readout (running totals, current value) | Beside grid | When spec mentions running totals |
| Source pool / tray | Below grid | When drag-from-pool |
| Reset button | Below grid | When spec mentions resetting freely |
| Submit / Done / Continue | Below grid | When spec describes a commit step |

Live readouts beside the grid are not optional decoration — for cross-sum, hex, and zero-quest the running value *is* the pedagogical point.

---

## Failure modes (the non-obvious ones)

1. **`display: none` on carved cells (mode B).** Grid track collapses, every following cell shifts. Use `visibility: hidden`.
2. **Eyeballed hex positions (mode C).** Looks right once, crooked everywhere else. Use the axial formula.
3. **Polyomino rendered as N bordered cells (mode C).** Looks like a worksheet. Use single SVG silhouette + dotted bg + obstacle cells.
4. **`tappable` + `drop-target` on the same cell.** Pick one model. The spec almost always means two distinct cells.
5. **Conflict highlight only colours the offender.** The constraint-neighbour must pulse too.
6. **Hallucinated Reset / Submit buttons.** Render only what the spec lists.
7. **Surround prose rendered as a sibling when it has a fixed grid slot.** Column labels, sentence fragments, in-grid instruction lines belong inside the grid as `prose` cells. Sibling DOM drifts on resize.

---

## Validation checklist

- [ ] Layout mode (A / B / C) recorded in a top-of-file comment.
- [ ] Visible cell count matches spec exactly.
- [ ] `data-row`/`data-col` (A/B) or `data-id` (C) on every cell.
- [ ] Touch target ≥ 44×44 CSS px on every interactive cell.
- [ ] Mode B: `visibility: hidden` (not `display: none`) on carved cells.
- [ ] Mode C: hex positions from axial formula; polyomino is one SVG, not N cells.
- [ ] Cell content types are mutually exclusive per cell.
- [ ] Surround pieces match the spec's mention list — nothing extra, nothing missing.
