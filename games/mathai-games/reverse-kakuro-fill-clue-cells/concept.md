# Eight-Friendly — The Multiples-of-8 Cross-Number Puzzle

## In one line
A logic-grid puzzle where every two-cell pair — read horizontally or vertically — must form a two-digit multiple of 8, and the student fills the empty cells with digits drawn from a small pool, using each digit at most once (except `4`, which gets two uses).

## Who it's for
Class 4–6 students (ages ~9–12) who have learned the multiples of 8 in their times tables but only as a *list* (8, 16, 24, 32...) — not as a *set*. The stuck-point is recognition: ask a student "is 56 a multiple of 8?" and they'll often start at 8 and count up, taking ten seconds to confirm. Ask them "starting from `8_`, which one-digit values complete a multiple of 8?" and they freeze — they've never been asked to *generate* multiples around a fixed digit. This game forces that lookup-from-the-other-direction, which is how multiples actually need to work in flexible problem-solving.

## What it tries to teach
The whole game is built around one specific computational fluency: **recognising and generating two-digit multiples of 8 fluently from partial information**.
Three threads inside that:
- **Two-digit multiple recall under constraints.** The complete list of two-digit multiples of 8 is short: `16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96`. Eleven numbers. The game asks the student to internalise this list well enough to query it from either end — "what starts with 4?" → `40, 48`; "what ends with 6?" → `16, 56, 96`.
- **Constraint propagation.** Each cell is the intersection of two constraints (its horizontal neighbour and its vertical neighbour). When one cell narrows, the cells around it narrow too. The student learns to chase the most-constrained cell first — a habit of mind that transfers directly to harder logic puzzles, sudoku, and proof writing.
- **Reasoning about digit frequency.** The rule "each digit once except 4" is unusual and forces the student to track *which digits have been spent* alongside the multiple-of-8 constraint. It's two simultaneous bookkeeping tasks — and learning to manage two at once is a real cognitive milestone.

## What the player sees and does
A clean white panel. Status strip — round badge `Q1`, hearts, star counter `0/10`. Below it, the puzzle's setup in two paragraphs: *"The number grid below is made up of numbers that are **multiples of 8**. You can use the digit '4' **twice** and other digits **once** to complete the number grid such that..."* — followed by two numbered conditions: *"All numbers formed **vertically** are multiples of 8. All numbers formed **horizontally** are multiples of 8."*

The grid itself is **not rectangular** — that's its signature look. It's a zigzag staircase of two-cell pairs, descending diagonally down the page. The reference layout has a horizontal pair at the top (two empty cells), a vertical pair below them (one empty above, the digit `4` below), then another horizontal pair beside that, then another vertical pair, and so on — about five two-cell pairs total, 10 cells total, with three or four pre-filled "anchor" digits like `4`, `8`, `2`. Pre-filled cells have a soft cyan top-and-bottom border to mark them as fixed; empty cells are plain white with a thin black outline.

Below the grid, a **digit pool** strip displays the digits `0 1 2 3 4 5 6 7 8 9`. As digits are placed in the grid, they fade out of the pool — except `4`, which has a small `×2` badge and stays available until it's been used twice.

- **Tap an empty cell** → it highlights yellow and the digit pool cells become tappable.
- **Tap a digit in the pool** → that digit drops into the highlighted cell. If the cell now completes a valid two-digit multiple of 8 with both its neighbours (where neighbours exist), the cell glows green for a moment.
- **Tap a digit that breaks a multiple-of-8 constraint** → the cell briefly flashes red, the digit returns to the pool, and a one-line hint appears: *"`5` and `4` make 54 — not a multiple of 8."*
- **Tap an already-placed digit in the grid** → it lifts back out into the pool, freeing the cell to try a different digit.
- **All cells filled and all multiples valid** → the entire grid pulses green, a soft *chime*, the round resolves.

## Shape of the experience
10 rounds, each its own grid:

- **Rounds 1–3 — Small grids, multiple of 4 (introductory).** 4–6 cells, 2–3 pairs, multiples of 4 instead of 8 (so the working list is shorter: `12, 16, 20, 24, 28, 32...`). The student learns the mechanic and the propagation habit.
- **Rounds 4–7 — Multiples of 8, medium grids.** 8–10 cells, 4–5 pairs. The reference puzzle. Now the student is doing the real work: hunting two-digit multiples of 8 in both directions.
- **Rounds 8–10 — Multiples of 9 or 12, larger grids.** 10–14 cells, 5–6 pairs. The number being multipled changes per round — *"This grid uses multiples of 9"* — so the student has to swap their lookup table, which is a separate skill from grinding the same one. Some rounds also introduce three-cell *triples* (a three-digit number) for a specific row, raising the bar.

Each round has at least one valid solution (sometimes the grid admits multiple, in which case any valid placement wins).

## Win condition and stars
Three hearts, across the whole game. Per-round stars are based on **wrong-placement count**:

- **3 stars** for completing the grid with zero invalid placements.
- **2 stars** for completing it with 1–2 wrong taps that were corrected.
- **1 star** for completing it with 3+ wrong taps.
- **0 stars** for the round if a heart is lost (the student gives up or the grid is unsolvable from their state, requiring a forced reset).

Total `X / 10`. Game ends at round 10 or when all hearts are gone. There's no time pressure — the puzzle rewards careful thinking over speed.

## Feel and motivation
- **Zigzag layout is the lesson.** The non-rectangular grid forces the student to read the puzzle as a series of overlapping pairs, not as a "grid I should fill row-by-row." That structural shift is part of the teaching: numbers connect locally through shared digits, not globally through table rows.
- **The digit pool is a living constraint.** As digits are spent, the pool visibly thins. By round end, the student is choosing from 2–3 remaining digits, which makes the final placements feel like a final move in a chess game — focused and irreversible. The `×2` badge on `4` is a small visual reminder of the asymmetry rule that's easy to forget.
- **Anchor digits are tutorial scaffolding.** The pre-filled cells in early rounds are placed to make at least one empty cell "obvious" — e.g. an `8` already in a vertical pair, with the upper cell empty, narrows the answer to `1, 2, 3, 4, 5, 6, 7, 8, 9` such that `_8` is a multiple of 8 → `48`, `88`. As rounds get harder, anchor digits become rarer and the student must do more independent reasoning.
- **No timer.** The clock would punish the slow careful thinker, who is exactly the kind of student this game is for.

## Why it works pedagogically
Multiples are taught as lists in school but used as sets in real problem-solving — and the gap between "I know my 8 times table" and "I can flexibly query the multiples of 8" is wide. This game closes the gap with concentrated practice: a single round forces the student to look up multiples of 8 ten or fifteen times in different directions, while the constraint-propagation logic of the grid keeps the work feeling like a puzzle rather than a drill. The skill — fluent multiple recognition — is foundational for divisibility tests, prime factorisation, fraction simplification, and the entire HCF/LCM machinery of Classes 5–7. A session takes 8–15 minutes for early grids, longer for the stretch puzzles; a teacher running this as a weekly warm-up will see student lookup speed measurably improve over a half-term.
