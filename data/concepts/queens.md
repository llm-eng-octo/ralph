### Game Concept: Queens — 7-Queens Coloured-Region Puzzle

This is a constraint-placement puzzle in the N-Queens family. The player must place 7 queens on a 7x7 board partitioned into 7 distinctly coloured regions, so that no two queens attack each other under four rules. It trains systematic constraint propagation, region-aware spatial reasoning, and recovery from near-miss placements.

### Core Mechanics & Interface

* **Status Header:** Shows the round indicator "Q1", a timer starting at "00:03", a lives indicator showing a heart with the value **2**, and a progress indicator reading "0/10" next to a star icon.
* **The Board:** A **7×7 grid** of coloured cells (thick black outer border, thin black cell lines) divided into 7 contiguous, irregularly-shaped regions. In B1 the regions use **purple** (left edge, ~6 cells), **pink** (large central blob), **yellow** (small 2-cell island near top), **gray** (right edge), **light green** (lower-left band), **cyan** (a thin 2-cell strip), and **orange** (a small L-shape in the lower middle) — cells of the same colour are always edge-contiguous, and region shapes are visibly non-uniform (not rows or columns).
* **Lives Indicator:** The header shows a single red heart icon with a numeric overlay "2" (not 2 separate heart icons) — tracks remaining lives as queens are mis-placed.
* **Rules (as stated on screen):** A queen can attack another queen in the
  1⃣ same row
  2⃣ same column
  3⃣ same coloured areas
  4⃣ nearest diagonals
* **Life System:** The instruction reads, "You lose a life every time a queen attacks another queen. Place 7 queens ♛ safely on the given board without losing all lives."
* **Progression:** One puzzle round; completion requires safely placing all 7 queens before lives run out.

### Behaviors and Interactions

* **Cell Tap (3-state cycle):** "Tap on a block to mark ✖, tap again to place ♛ and tap again to reset." Each cell cycles empty → ✖ (marked as forbidden / scratch-pad) → ♛ (queen placed) → empty on successive taps.
* **Queen Placement Consequence:** If a queen is placed such that it attacks another under any of the four rules, a life is deducted (as reflected in the heart counter in the header).

### Victory / Completion

Successfully placing 7 queens ♛ on the board without any mutual attacks — and without exhausting all lives — completes the puzzle.

### Variant Progression

All three variants share the 7x7 colour-partitioned grid, the four attack rules, 2 lives, and the ✖ → queen → empty tap cycle. Surface details shift:
* **B1 (canonical, 310517):** Regions are purple, pink, yellow, gray; queen glyph ♛; rules numbered with 1⃣–4⃣.
* **B2 (310518):** Regions are light pink, purple, orange, light green; queen glyph 👑; rules still use 1⃣–4⃣.
* **B3 (310519):** Regions are light gray, light lime green, purple, light cyan; queen glyph 👑; rules printed as plain 1./2./3./4.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 2, chunk "Queens" (block 310517; block_count 3). Screenshots: 16483_303525_0.png.
