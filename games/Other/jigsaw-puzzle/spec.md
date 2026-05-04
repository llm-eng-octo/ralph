# Game Design: Jigsaw Puzzle

## Identity

- **Game ID:** jigsaw-puzzle
- **Title:** Jigsaw Puzzle
- **Class/Grade:** 1-4
- **Math Domain:** Geometry / Spatial Reasoning
- **Topic:** Polyomino fitting and shape recognition
- **Archetype:** Board Puzzle (#6)

## Bloom Level

**L1-L2 (Remember / Understand)** — shape identification and spatial visualization. Students recognize polyomino shapes and visualize where each one fits on a grid. No computation, no procedural steps — this is pure perception plus spatial matching.

## One-Line Concept

Kid drags colored polyomino pieces onto a grid to complete the puzzle — tests spatial reasoning and shape fitting.

---

## Target Skills

| Skill | Description | Grade |
|-------|-------------|-------|
| Spatial reasoning | Visualize where a piece fits on the grid by its shape | 1-4 |
| Shape recognition | Identify polyomino shapes (L, T, S, I, square) | 1-3 |
| Problem solving | Use trial, error, and elimination to place all pieces | 2-4 |

---

## Screen Flow

```
start → gameplay (loop 5 rounds) → results
```

- **No `game_over` screen** — lives = None, so the game cannot end in failure. The student can always recover by dragging pieces back to the bank.
- Between-round transitions ("Round 2 of 5", etc.) appear inside the preview-wrapper via `TransitionScreen`.
- Results screen shows star rating and "Play again" button.

---

## Common Misconceptions

Every wrong placement in Content Samples is tagged with one of the misconceptions below so test generation and distractor design target real cognitive errors (not random failures).

| Tag | Name | Description |
|-----|------|-------------|
| `wrong_orientation` | Mentally rotates piece | Kid imagines the piece rotated to fit — but rotation is NOT allowed in this game. The piece must go in its original orientation. |
| `ignore_shape` | Ignores piece shape | Kid drops the piece on the first empty cell they see without checking whether the piece's full footprint fits. |
| `color_matching` | Color-first thinking | Kid tries to match piece color to an imagined color in the grid (e.g., drops yellow piece in "the yellow spot") instead of matching shape to empty cells. |
| `edge_overflow` | Out-of-bounds placement | Kid positions the piece so part of it hangs off the grid edge. The origin cell is inside the grid but one or more of the piece's cells lie outside. |
| `overlap` | Placing on occupied cells | Kid drops the piece where some of its cells would cover cells already filled by another piece. |

---

## Core Mechanic

1. Kid sees an empty grid (3×3, 4×3, or 4×4) and 3-4 colored polyomino pieces in a bank below.
2. Each piece is a connected group of cells (like Tetris pieces but with 3-4 cells).
3. Kid drags a piece from the bank onto the grid.
4. If the piece fits in the position (all cells empty and within bounds), it snaps into place.
5. If the position is wrong, the piece bounces back to the bank.
6. When all pieces are placed and the grid is complete, the round is done.
7. Pieces can be dragged off the grid back to the bank to try a different arrangement.

---

## Rounds & Progression

### Stage 1: Small grid, few pieces (Rounds 1-2)
- 3×3 grid, 3 pieces (3 cells each = 9 total cells)
- Pieces are simple shapes (I-tromino, L-tromino, corner)
- Each piece has a distinct color (yellow, purple, orange)
- Low ambiguity — each piece has essentially one valid placement

### Stage 2: Larger grid (Rounds 3-4)
- 4×3 grid, 3 pieces (4 cells each = 12 total cells)
- Pieces are tetrominoes (T, L, S, J, O, I)
- Multiple possible piece positions — requires more spatial reasoning
- Same 3 colors (yellow, purple, orange)

### Stage 3: Full grid (Round 5)
- 4×4 grid, 4 pieces (4 cells each = 16 total cells)
- 4 pieces including a new green color
- Highest spatial complexity — 4 pieces to coordinate

| Dimension | Stage 1 | Stage 2 | Stage 3 |
|-----------|---------|---------|---------|
| Grid size | 3×3 | 4×3 | 4×4 |
| Pieces | 3 | 3 | 4 |
| Cells per piece | 3 | 4 | 4 |
| Piece complexity | Simple (I, L, corner) | Medium (T, L, S, J, O, I) | Mixed tetrominoes |
| Colors | 3 | 3 | 4 |

---

## Interaction Pattern

**P6 — Drag-and-Drop (Pick & Place)**

- Drag pieces from the bank onto the grid.
- Pieces snap to grid cells on valid drop.
- Invalid drop → piece bounces back to bank (no life lost, no penalty).
- Pieces on grid can be dragged back to bank to rearrange.
- **No rotation** — pieces are placed in their original orientation.

---

## Game Parameters

- **Rounds:** 5
- **Timer:** None
- **Lives:** None (no penalty for wrong placement — piece just bounces back)
- **Star rating:** 3 stars = 5 rounds completed, 2 stars = 3-4, 1 star = 1-2
- **Input:** Drag-and-drop only (P6)
- **Feedback:** Fire-and-forget SFX per correct piece placement. Awaited SFX + TTS on round complete ("Puzzle complete!"). Bounce-back animation on wrong placement.
- **Progress bar:** Represents rounds completed (1..5) — NOT puzzle sub-steps or pieces placed within a round. A round advances the bar by exactly one increment when the full board is solved.
- **Bounce-back hint escalation (optional scaffold):** After **2 consecutive wrong placements of the same piece** in a single round, briefly highlight the set of valid origin cells for that piece (soft glow on the target cells for ~1.5s). The piece itself still only snaps on a correct drop; the highlight is visual only. This is a Bloom-L1/L2 appropriate reveal-style scaffold (per pedagogy.md: "After 2 wrong: reveal").

---

## Scoring

- Points: +1 per round completed (max 5).
- Stars: 3 stars = all 5 rounds solved, 2 stars = 3-4 rounds solved, 1 star = 1-2 rounds solved.
- Lives: None.
- Partial credit: None — a round is either solved (all pieces placed correctly) or not.

---

## Round Schema

```ts
Round = {
  roundId: number,
  gridRows: number,
  gridCols: number,
  pieces: Piece[],
  solution: { [pieceId: string]: [row: number, col: number] },  // origin of piece on grid
  previewInstruction: string,   // HTML, shown on preview overlay (PART-039)
  previewAudioText: string,     // plain-text TTS for preview audio
  expected_misconception: string  // one of the misconception tags above
}

Piece = {
  id: string,             // e.g., "A", "B", "C"
  cells: [row, col][],    // origin-relative cell offsets; the piece's top-left bounding cell is (0,0)
  color: string           // "yellow" | "purple" | "orange" | "green"
}
```

**Coordinate convention:**
- Grid coordinates use `[row, col]` with `[0, 0]` = top-left.
- Row index increases downward; col index increases rightward.
- `solution[pieceId] = [r, c]` is where the piece's origin cell is placed on the grid. Absolute cells covered = `cells.map(([dr, dc]) => [r + dr, c + dc])`.
- A piece is validly placed when every absolute cell is in-bounds (`0 <= r < gridRows`, `0 <= c < gridCols`) and no two pieces share an absolute cell.

---

## Content Samples

Five fully specified rounds. Every solution below has been verified as a complete tiling: each grid cell is covered by exactly one piece, no cell is covered twice, and no piece spills outside the grid.

### Round 1 — Stage 1 (3×3, 3 pieces × 3 cells)

- **roundId:** 1
- **gridRows:** 3, **gridCols:** 3
- **Pieces:**

| id | shape | color | cells (origin-relative) |
|----|-------|-------|-------------------------|
| A  | I-tromino (vertical line) | yellow | `[[0,0],[1,0],[2,0]]` |
| B  | L-tromino | purple | `[[0,0],[0,1],[1,1]]` |
| C  | Corner (reverse-L) | orange | `[[0,0],[1,0],[1,1]]` |

- **Solution:**
  - `A → [0, 0]` covers (0,0), (1,0), (2,0)
  - `B → [0, 1]` covers (0,1), (0,2), (1,2)
  - `C → [1, 1]` covers (1,1), (2,1), (2,2)
- **Covered cells (verified tiling):** {(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)} = all 9 cells, no overlap, in-bounds.
- **previewInstruction:** `<p>Drag the <b>three colorful pieces</b> onto the grid. Fit them all to finish the puzzle!</p>`
- **previewAudioText:** `Drag the three colorful pieces onto the grid. Fit them all to finish the puzzle.`
- **expected_misconception:** `ignore_shape`

### Round 2 — Stage 1 (3×3, 3 pieces × 3 cells)

- **roundId:** 2
- **gridRows:** 3, **gridCols:** 3
- **Pieces:**

| id | shape | color | cells (origin-relative) |
|----|-------|-------|-------------------------|
| A  | I-tromino (horizontal line) | yellow | `[[0,0],[0,1],[0,2]]` |
| B  | Reverse-L tromino | purple | `[[0,0],[1,0],[1,1]]` |
| C  | Stairs (S-tromino) | orange | `[[0,0],[0,1],[1,1]]` |

- **Solution:**
  - `A → [0, 0]` covers (0,0), (0,1), (0,2)
  - `B → [1, 0]` covers (1,0), (2,0), (2,1)
  - `C → [1, 1]` covers (1,1), (1,2), (2,2)
- **Covered cells (verified tiling):** all 9 cells of the 3×3 grid, no overlap, in-bounds.
- **previewInstruction:** `<p>Three new shapes. Look at each one carefully and find the spot where it fits!</p>`
- **previewAudioText:** `Three new shapes. Look at each one carefully and find the spot where it fits.`
- **expected_misconception:** `wrong_orientation`

### Round 3 — Stage 2 (4×3, 3 pieces × 4 cells)

- **roundId:** 3
- **gridRows:** 4, **gridCols:** 3
- **Pieces:**

| id | shape | color | cells (origin-relative) |
|----|-------|-------|-------------------------|
| A  | T-tetromino | yellow | `[[0,0],[0,1],[0,2],[1,1]]` |
| B  | L-tetromino | purple | `[[0,0],[1,0],[2,0],[2,1]]` |
| C  | S-variant (skew) | orange | `[[0,1],[1,0],[1,1],[2,1]]` |

- **Solution:**
  - `A → [0, 0]` covers (0,0), (0,1), (0,2), (1,1)
  - `B → [1, 0]` covers (1,0), (2,0), (3,0), (3,1)
  - `C → [1, 1]` covers (1,2), (2,1), (2,2), (3,2)
- **Covered cells (verified tiling):** all 12 cells of the 4×3 grid, no overlap, in-bounds.
- **previewInstruction:** `<p>Now the grid is bigger. Each piece has <b>four cells</b>. Fit all three!</p>`
- **previewAudioText:** `Now the grid is bigger. Each piece has four cells. Fit all three pieces to solve the puzzle.`
- **expected_misconception:** `edge_overflow`

### Round 4 — Stage 2 (4×3, 3 pieces × 4 cells)

- **roundId:** 4
- **gridRows:** 4, **gridCols:** 3
- **Pieces:**

| id | shape | color | cells (origin-relative) |
|----|-------|-------|-------------------------|
| A  | J-tetromino | yellow | `[[0,0],[0,1],[1,1],[2,1]]` |
| B  | I-tetromino (vertical) | purple | `[[0,0],[1,0],[2,0],[3,0]]` |
| C  | L-tetromino | orange | `[[0,0],[1,0],[2,0],[2,1]]` |

- **Solution:**
  - `A → [0, 0]` covers (0,0), (0,1), (1,1), (2,1)
  - `B → [0, 2]` covers (0,2), (1,2), (2,2), (3,2)
  - `C → [1, 0]` covers (1,0), (2,0), (3,0), (3,1)
- **Covered cells (verified tiling):** all 12 cells of the 4×3 grid, no overlap, in-bounds.
- **previewInstruction:** `<p>Three different shapes. Some are <b>long</b>, some are <b>bent</b>. Match each shape to the right spot!</p>`
- **previewAudioText:** `Three different shapes. Some are long, some are bent. Match each shape to the right spot.`
- **expected_misconception:** `overlap`

### Round 5 — Stage 3 (4×4, 4 pieces × 4 cells)

- **roundId:** 5
- **gridRows:** 4, **gridCols:** 4
- **Pieces:**

| id | shape | color | cells (origin-relative) |
|----|-------|-------|-------------------------|
| A  | I-tetromino (horizontal) | yellow | `[[0,0],[0,1],[0,2],[0,3]]` |
| B  | O-tetromino (square) | purple | `[[0,0],[0,1],[1,0],[1,1]]` |
| C  | O-tetromino (square) | orange | `[[0,0],[0,1],[1,0],[1,1]]` |
| D  | I-tetromino (horizontal) | green | `[[0,0],[0,1],[0,2],[0,3]]` |

- **Solution:**
  - `A → [0, 0]` covers (0,0), (0,1), (0,2), (0,3)
  - `B → [1, 0]` covers (1,0), (1,1), (2,0), (2,1)
  - `C → [1, 2]` covers (1,2), (1,3), (2,2), (2,3)
  - `D → [3, 0]` covers (3,0), (3,1), (3,2), (3,3)
- **Covered cells (verified tiling):** all 16 cells of the 4×4 grid, no overlap, in-bounds.
- **previewInstruction:** `<p>The <b>final puzzle</b>! Four pieces, including a new <b style="color:green">green</b> one. Fit them all!</p>`
- **previewAudioText:** `The final puzzle. Four pieces, including a new green one. Fit them all to win.`
- **expected_misconception:** `color_matching`

---

## Feedback

| Event | Behavior |
|-------|----------|
| Correct piece placement | Fire-and-forget SFX ("snap"), piece locks into grid cells with a soft glow. |
| Wrong placement (out of bounds, overlap, or wrong spot) | Piece animates back to the bank (bounce-back). No penalty, no life lost. |
| 2 consecutive wrong placements of same piece | Soft highlight on valid origin cells for ~1.5s (bounce-back hint escalation). |
| Round complete (all pieces placed) | Awaited SFX + TTS: "Puzzle complete!" Grid celebrates briefly before advancing. |
| All 5 rounds complete | Results screen with star rating and "Play again" button. |

---

## Defaults Applied

- **Star thresholds:** 5 rounds = 3 stars, 3-4 = 2 stars, 1-2 = 1 star (spec-specific because game uses round-count scoring, not percentage).
- **Bloom level:** L1-L2 (chosen to match Board Puzzle archetype + shape-recognition skill).
- **Lives:** 0 (Board Puzzle default + L1-L2 no-penalty pedagogy).
- **Timer:** 0 (Board Puzzle default; no time pressure on spatial reasoning).
- **Feedback delay:** Default bounce-back animation (~400ms), snap-on-correct is instant.
- **Scaffolding:** Highlight valid cells after 2 wrong placements of same piece (aligns with pedagogy.md L1-L2 "reveal after 2 wrong").

## Warnings

- **WARNING:** Rounds 1 and 2 have essentially unique placements (low ambiguity). This is intentional for Stage 1 scaffolding but means first-attempt success should be high (~90%+). If analytics later show Stage 1 below 90%, revisit piece shapes for clarity.
- **WARNING:** Round 5 uses two identical O-tetrominoes (purple + orange) distinguishable only by color. This is acceptable (the `color_matching` misconception targets exactly this confusion), but make sure the test harness uses piece `id` (not color) to assert correct placement.
