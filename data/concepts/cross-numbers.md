### Game Concept: Cross Numbers — Multi-Intersection Digit Grid

This is a number crossword where 6 numbers of varying length (3–5 digits) share cells at their intersections, so each shared cell's digit must satisfy the constraints of both the vertical number and the horizontal number it participates in. The student places digits drawn from a fixed pool, and the overall solution must satisfy three global mathematical conditions.

### Core Mechanics & Interface

* **Header Bar:** Shows the question id "Q1", a timer "00:02", a score of "0/10", and a blue star progress icon.
* **Conditions List:** Three rules govern the final grid:
  1. Digits should not repeat in any number.
  2. Product of tens and ones digit should always be 24.
  3. Make the greatest possible 5-digit number with the sum of all its digits equal to 27.
* **The Grid:** A **custom non-rectangular cross/stair layout** of 14 interactive cells — each cell is a white square with a **dashed gray border** (distinctive: dashed, not solid). The six "numbers" run like crossword entries, with small "Number N 🔢" labels printed in the empty margin beside the arm they head (labels are OUTSIDE the grid, pointing into it):
  * **Number 1 🔢** — vertical, 5 cells (the rightmost long arm, labelled above the top cell).
  * **Number 2 🔢** — vertical, 4 cells, one column left of Number 1 (label above row 2).
  * **Number 3 🔢** — vertical, 4 cells, further left (label above row 2).
  * **Number 4 🔢** — horizontal, 3 cells spanning row 2 of the cross (label to the left of the leftmost cell in the row).
  * **Number 5 🔢** — horizontal, 3 cells, row 3 (label to the left).
  * **Number 6 🔢** — horizontal, 4 cells at the bottom, extending one cell further left than the main stack (label to the left).
* **Digit Pool:** Below the grid in a **light-gray rounded-rectangle tray**, digits are laid out in a **4+4+4+1 keypad** — row 1 `1 2 3 4`, row 2 `4 4 6 6`, row 3 `6 7 8 8`, row 4 single centred `9` — total bank {1, 2, 3, 4, 4, 4, 6, 6, 6, 7, 8, 8, 9}. Each digit is a white rounded-square button with subtle drop shadow.
* **Progression:** The puzzle is a single round. The intro reads, "Make 6 numbers in the grid from the digits given below, satisfying the given conditions."

### Behaviors and Interactions

* **Cell Tap (Focus):** The student taps a grid cell to focus it. The focused cell is the active input target for the next digit selection.
* **Digit Pool Tap:** After focusing a cell, the student taps a digit button in the pool to place that digit into the active cell. Because cells are shared across multiple numbers, a single digit placement simultaneously contributes to its vertical and horizontal runs.

### Victory / Completion

All 14 cells are filled such that no digit repeats within any single number, the product of the tens and ones digit of every number equals 24, and Number 1 is the greatest possible 5-digit number whose digits sum to 27.

### Variant Progression

All three variants share the same irregular cross-number grid, the "product of tens and ones = 24" constraint, and the tap-cell-then-tap-digit input model. Cell count and digit pool shift slightly:
* **B1 (canonical, 310546):** 14 cells, target digit sum **27**, digit pool {1, 2, 3, 4, 4, 4, 6, 6, 6, 7, 8, 8, 9}.
* **B2 (310547):** 13 cells, target digit sum **28**, digit pool {1, 2, 3, 3, 3, 4, 6, 6, 7, 8, 8, 8, 9}.
* **B3 (310548):** 13 cells, target digit sum **28**, same digit pool as B2.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 3, chunk "Cross numbers" (block 310546; block_count 3). Screenshots: 16483_303471_0.png.
