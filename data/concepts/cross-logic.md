### Game Concept: Cross Logic — Students, Instruments, and Foods

This is a classic cross-logic grid puzzle. The student reads a set of written clues about a small group of people and uses a tap-cycle grid to deduce a unique pairing across multiple attribute categories — here, matching names to instruments and to foods. It trains constraint reasoning and process-of-elimination thinking.

### Core Mechanics & Interface

* **Status Indicator:** A compact header carries the question identifier "Q1", a timer ("00:02"), a lives indicator set to **2** (heart icon), and a "0/10" star progress readout.
* **Clue Box:** Three numbered clues frame the puzzle:
  1. The person who plays piano likes pasta.
  2. Diya does not like pasta.
  3. Veer does not play guitar.
* **Logic Grid:** An **L-shaped grid** with thick black outer border and thin black internal lines. Category labels (INSTRUMENTS, FOODS, NAMES) are printed in purple; column sub-labels (Guitar, Piano, Pizza, Pasta) are rotated **90° to read vertically** so all four fit across a narrow header strip. The row axis has "NAMES" printed vertically on the outer left (Diya, Veer) with a secondary "FOODS" band below it (Pizza, Pasta). The columns span two category blocks (INSTRUMENTS: Guitar/Piano; FOODS: Pizza/Pasta). The bottom-left quadrant of the L is blank (no Foods-vs-Foods cells) — only the two upper-right sub-blocks and the lower-left 2×2 sub-block are interactive.
* **Clue Box Styling:** Clues sit in a **pale-yellow rounded rectangle** with purple text, numbered 1/2/3, positioned directly above the grid.
* **Objective:** The student fills each cell with a ✅ (positive deduction), an ❌ (negative deduction), or leaves it blank, so that the fully marked grid satisfies every clue without contradiction.
* **Progression:** The puzzle is a single round.

### Behaviors and Interactions

* **Grid Cell Tap (3-state cycle):** The instruction reads, "Tap a block to add ✅, tap again to add ❌, tap again to reset." Each cell cycles empty → ✅ → ❌ → empty on successive taps, letting the student commit, reverse, and clear deductions.

### Victory / Completion

The grid is considered solved when every cell is marked such that all three clues are satisfied and no contradictions remain.

### Variant Progression

All three variants use the same L-shaped logic grid + yellow clue box + tap-cycle interaction; categories and cast rotate:
* **B1 (canonical, 310513):** Diya / Veer paired against INSTRUMENTS (Guitar, Piano) and FOODS (Pizza, Pasta). Cycle glyphs: ✅ / ❌ / empty.
* **B2 (310514):** Maya / Arjun paired against ANIMALS (Lion, Elephant) and COUNTRIES (India, Japan). Cycle glyphs: ✅ / ✖ / empty.
* **B3 (310515):** Tara / Kiran paired against VEHICLES (Car, Bike) and ICE CREAMS (Vanilla, Chocolate). Cycle glyphs: ✔ / ✖ / empty.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 2, chunk "Cross logic" (block 310513; block_count 3). Screenshots: 16483_303520_0.png.
