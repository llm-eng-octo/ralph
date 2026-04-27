### Game Concept: Kakuro — Number Sum Crossword

This is a Kakuro puzzle: a number-crossword where the student fills empty white cells with digits 1–9 so that each horizontal and vertical run of white cells adds up to the clue in the black triangle that governs it, and no digit repeats inside any single run. It trains decomposition into addends, constraint intersection across shared cells, and disciplined elimination.

### Core Mechanics & Interface

* **Rules (as stated on screen):**
  1⃣ Sum of white blocks in each row must equal the number in the black block on their left.
  2⃣ Sum of white blocks in each column must equal the number in the black block above them.
  3⃣ Digits should not be repeated in any row or column.
* **The Grid:** A **5×5 grid** with three cell types: solid-black blocked cells (fully opaque, no content), **black clue cells split diagonally** (a thin white diagonal line divides the cell; the upper-right triangle holds the row-sum clue pointing right, the lower-left triangle holds the column-sum clue pointing down), and white answer cells with thin gray borders that accept a digit. B1's clue seeds: top row exposes column clues **29, 11, 17**; the left column exposes row clues starting with **18**, then **21 / 4** split diagonally (21 = across, 4 = down), then **13**, then **9**. Blocked cells cluster in the top-left corner and along the lower-right to produce the irregular playable area.
* **Number Pad:** A panel mounted below the grid with **light off-white / pale-gray background** containing a **3-row digit palette** — row 1 **1 2 3 4**, row 2 **5 6 7 8**, row 3 a single centred **9**. Each digit is a white rounded-square button with a subtle gray drop shadow and black digit text.
* **Progression:** One round; there are 12 empty white cells to fill.

### Behaviors and Interactions

* **Cell Tap:** The student taps a white answer cell to select it (the selected cell is highlighted), establishing the cell as the current input target.
* **Number-Pad Tap:** After selecting an answer cell, the student taps a digit button to place that number into the selected cell. Tapping a different cell changes focus; tapping a different digit replaces the current value.

### Victory / Completion

The puzzle is solved when every white cell holds a digit such that each row-run and column-run sums to its clue and no digit repeats within any run.

### Variant Progression

All three variants use the same 5x5 grid, the same three stated rules, 12 empty white cells, and the same select-cell-then-tap-digit number pad. Only the specific clue numbers and black-cell layout differ:
* **B1 (canonical, 310521):** Rules numbered with 1⃣ 2⃣ 3⃣; column clues include 29, 11, 17; row clues include 18 and split clues like 21/4.
* **B2 (310522):** Rules printed as 1./2./3.; top-row column clues include 16 and 11.
* **B3 (310523):** Rules printed as 1./2./3.; top-row column clues include 29.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 2, chunk "Kakuro" (block 310521; block_count 3). Screenshots: 16483_303528_0.png.
