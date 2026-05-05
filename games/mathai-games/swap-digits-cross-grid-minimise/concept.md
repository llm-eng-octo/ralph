# Smallest Sum Standoff — The Digit-Swap Cross-Grid Puzzle

## In one line
A place-value optimisation puzzle where ten digits sit on a cross-shaped grid that forms three intersecting numbers, and the student must swap them around — without any digits to spare — until the sum of those numbers is the smallest it can possibly be.

## Who it's for
Class 5–6 students (ages ~10–12) who fully understand place value (they can tell you the `2` in `2,847` is worth two thousand) but have never had to *use* place value as a strategic tool. The skill the game targets is one that most curricula skip entirely: **understanding that a digit's location matters more than the digit itself**, and using that to optimise a multi-number arrangement under a constraint.

## What it tries to teach
The whole game targets one strategic insight: **to make a sum small, push small digits into high place values and big digits into low place values — but be careful when a single cell contributes to two different numbers.**
Three threads:
- **Place-value as currency.** Putting a `9` in the thousands place adds `9,000` to a number; putting it in the units adds only `9`. The student learns to treat place-value slots like "expensive seats" and "cheap seats" and to seat their digits accordingly.
- **The shared-cell trick.** This is the puzzle's twist. The cross has cells that belong to *two* numbers at once — a digit there contributes to both. So a small digit in a shared cell saves twice as much; a big digit there costs twice as much. Recognising and exploiting these shared cells is what separates a 1-star solution from a 3-star solution.
- **Search under a fixed digit set.** Unlike a free-input game, the digits are *given* — you don't get to pick `1, 2, 3...`; you must work with the ten digits the puzzle handed you. Often that means accepting a `9` somewhere; the strategic question is *where the least damage is*.

## What the player sees and does
A clean, minimal layout — the puzzle is the visual.

At the top, the standard status row — round badge `Q1`, a friendly avatar, a big blue countdown timer (`00:24`), and the star tally `0/10` on the right.

Below the header, a calm two-line instruction in body text: *"Rearrange the digits in the grid in such a way that the **sum** of number 1, number 2, number 3 and number 4 is **minimum**."*

The puzzle itself is a cross-shaped lattice of ten white digit-tiles, arranged in two vertical columns of four tiles each, with a single horizontal row of four tiles cutting across them. Tiny grey labels float above and to the side: `Number 1` (the left column, read top-to-bottom as a 4-digit number), `Number 2` (the right column), `Number 3` (the horizontal row, read left-to-right). A fourth implicit number sits diagonally or in a secondary intersection depending on the round's layout.

Each tile holds a single digit — `5, 9, 2, 7, 6, 4, 8, 2, 3, 1` — on a clean white card with a soft border. Tapping a tile selects it (it glows yellow). Tapping a second tile swaps the two digits with a brief animation. Tap-elsewhere deselects.

There is no submit button. The puzzle is "live" — the current arrangement is always the active answer. The timer is what closes the round.

- **Make any swap** → the tiles slide past each other and settle in their new homes. A tiny "current sum" indicator below the grid updates: `Sum: 14,872`. The student watches it shrink as they improve.
- **Reach the optimal minimum** → the indicator glows green; a soft chime plays; the round can be ended manually or wait for the timer.
- **Time runs out** → the puzzle freezes; the student's final sum is compared to the optimal; partial credit is awarded based on how close they got.

## Shape of the experience
10 puzzles, ramping in three small phases:

- **Puzzles 1–3 — Three numbers, no shared cells.** Three independent 3-digit columns. The student learns the place-value rule (small digits up high) without the shared-cell complication.
- **Puzzles 4–7 — One shared cell.** A single intersection where one tile contributes to two numbers. The student starts noticing the doubling effect and learns to put the smallest available digit there.
- **Puzzles 8–10 — Two shared cells, four numbers.** The full mess of the screenshot's layout, with two intersections and four read-out numbers. Strategic thinking is essential; trial-and-error doesn't scale.

## Win condition and stars
Each puzzle is timed at 60 seconds. Stars are awarded by *how close* the student's sum is to the optimal minimum:
- **3 stars** — exactly the optimal minimum.
- **2 stars** — within 5% of the optimal (e.g., optimal `12,345`, student `12,800`).
- **1 star** — within 20% of the optimal.
- **0 stars** — worse than 20% off, or the timer ran out before any swap.

Lives carry across the 10 puzzles — three hearts total — but a heart is only lost if a puzzle ends at 0 stars. So the student can fail one puzzle hard and still complete the run.

## Feel and motivation
- **The grid feels like a chessboard.** Tiles are crisp white squares with subtle shadows. Every swap feels physical — a satisfying slide-and-settle, like moving a knight. This makes the search feel exploratory rather than tedious.
- **The current sum is always visible.** Unlike many optimisation games that hide the answer, this one shows it constantly. The student gets immediate feedback on every swap — a swap that *increases* the sum is a clear signal that the move was wrong, and reversing it teaches the rule by negative example.
- **Decoy strategies fail in instructive ways.** A student who applies "always put the small digit on the left" without thinking about shared cells will get a 1-star or 2-star result — close, but not optimal. The gap between their sum and the true minimum is exactly the value of the place-value insight they're missing, and seeing it as a number creates a curiosity hook for the next puzzle.

## Why it works pedagogically
Place value is universally taught in primary school but rarely *used* as a tool. Children learn that the `4` in `546` means forty, but they never face a situation where moving a digit to a different position has consequences they can feel. This game makes those consequences immediate and quantitative — every swap has a numeric effect the student can see — and over 10 puzzles, the place-value-as-currency intuition becomes second nature. The shared-cell mechanic adds a layer that points forward to *systems* thinking, where a single decision affects multiple constraints — exactly the cognitive move algebra and pre-algebra start to demand a year or two later. A 10-puzzle session takes 8–10 minutes; the optimisation feels game-like enough that students will replay it for sport, getting incidental place-value reps with every run.
