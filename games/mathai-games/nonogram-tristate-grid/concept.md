# Block Run — The Tiny Nonogram for Counting and Spacing

## In one line
A miniature nonogram where the student is given a single column of empty cells and a pair of numbers like *"2, 2"* — and must tap to colour exactly two cells in a run, leave at least one cell as a gap, then colour two more cells, with a third tri-state (`x` mark) to keep track of the gaps.

## Who it's for
Class 2–3 students (ages ~7–9) who count fluently to ten but still treat *"how many"* and *"in a row"* as separate ideas. The game is for the child who, when asked *"colour 2 in a row, then leave a gap, then colour 2 more,"* will colour two random cells, two more random cells, and not understand why the answer is wrong. It's a primer on **runs of consecutive items** — a small but missing concept that underpins later work on patterns, time blocks, and even number-line reasoning.

## What it tries to teach
The whole game is built around **reading a number-pair as a recipe for runs and gaps**.
Three threads:
- **A number is a count of consecutive blocks.** Each clue *"2"* doesn't mean "2 cells anywhere" — it means "exactly 2 cells in a row, all touching." This is a surprisingly hard idea for a seven-year-old, who has only ever met numbers as quantities, not as *contiguous quantities*.
- **A gap is mandatory between runs.** When the clue is *"2, 2"*, the two runs must be separated by at least one cell that is *not coloured* (or that is marked with an `x`). A run that touches another run reads as a single bigger run and breaks the puzzle.
- **The `x` mark is for thinking out loud.** Tap once to colour, tap again to mark `x` (an explicit *"I know this is empty"*), tap a third time to clear. The `x` state lets the child commit to "this is the gap" without leaving it ambiguous, which is the same move adults make when they pencil-mark their own logic puzzles.

## What the player sees and does
A clean white screen. Top status bar in the now-familiar layout: avatar, *"Q1"*, heart with lives, star tally `0/10`. Below it, the instruction in conversational form, with the key phrases bolded:

> *"Colour the blocks to **match** the **numbers**.*  
> *The first number tells you how many blocks to colour first, then leave a space before colouring for the second number.*  
> *Tap a block to colour it, and tap again to mark 'x'."*

The puzzle itself is a single **vertical column of 5 (or sometimes 6) square cells**, centred on the screen. Above the column sits the clue — a stack of small numbers like:

```
2
2
```

— meaning *"first run is 2 cells, second run is 2 cells, in this order from top to bottom."* The cells themselves are empty, with thin grey borders, big enough for a seven-year-old to thumb-tap.

Below the grid sits a yellow **Reset** button with a circular-arrow icon, ready to wipe the column and start over.

- **First tap on a cell** → cell fills in deep blue (or the chosen "colour"), a soft *thunk* sound.
- **Second tap on the same cell** → blue clears, an `x` appears in the cell.
- **Third tap** → cell returns to empty.
- **Reset** → entire column clears with a brief sweep animation.
- **Final correct configuration** → the column glows gold, a quick *ding*, the round badge ticks up, the next round loads.
- **Wrong configuration** *(when the child taps a *Done* control or auto-checked when no more cells can change)* → mismatched cells flash red briefly, the correct ones stay green, a heart shatters, a one-line hint appears (*"You coloured 3 in a row — the clue says 2."*).

## Shape of the experience
10 rounds, each a fresh column with new clues:

- **Rounds 1–2 — Single-clue.** Just *"3"* on a 5-cell column. The child has to find the only valid placements (top-three, middle-three, bottom-three) — three solutions, all correct, the game accepts any of them. Pure *"colour exactly 3 in a row"* practice.
- **Rounds 3–5 — Two-clue, generous spacing.** Clues like *"2, 2"* on a 6-cell column where the gap is forced to one cell. The child learns the *gap-is-mandatory* rule.
- **Rounds 6–8 — Two-clue, tight.** Clues like *"3, 1"* on a 5-cell column, where the configuration is unique and no slack remains.
- **Rounds 9–10 — Three-clue stretch.** *"1, 1, 1"* on a 5-cell column — alternating colours and gaps, surprisingly tricky because the child has to remember that *every* cell either fills or marks.

## Win condition and stars
Three lives across the 10 rounds. Each round is its own little puzzle and stars are awarded per round:

- **3 stars** — solved on the first attempt with no resets and no wrong submissions.
- **2 stars** — solved with one reset or one wrong submission.
- **1 star** — solved eventually, multiple resets allowed.
- **0 stars** — abandoned or final lost-life on this round.

Total stars across 10 rounds is the headline score (max 30). Hearts shatter only on wrong final submissions, not on resets — exploration is encouraged.

## Feel and motivation
- **The column, not a square grid.** A tiny single-column puzzle is visually trivial, which is the point: a child looking at a 10×10 nonogram for the first time sees a wall of cells and gives up. The single column lets them feel the *one rule* (run + gap + run) before scale enters the picture.
- **Tri-state taps feel grown-up.** Tap-to-colour, tap-again-to-`x` is the same interaction adults use in real nonogram apps. Kids notice this and feel they're playing the *real* game, not a sanitised version.
- **Reset is loud and friendly.** The reset button is big, yellow, and right under the puzzle. Resetting is treated as part of solving, not as failure — a child who resets four times to find the right pattern still gets full stars if their final attempt is clean.

## Why it works pedagogically
Counting is taught as a one-way mapping (*"how many?" → number*). Runs reverse that map: the child is given the number first and must produce the layout. This is the same direction of inference that powers algebra later (*"x is the value that makes this true — find x"*) and even early programming (*"loop 3 times — what does the loop body do?"*). By practising runs in a simple, visual, spatial puzzle, the seven-year-old builds the early intuition that **numbers describe constraints, not just totals**. The mandatory-gap rule sneaks in a second idea — that the *spaces between* things can be the actual content of a math problem — which prepares the ground for fraction-of-a-line and integer-spacing topics two grades later. A 10-round session takes 4–6 minutes; teachers can drop it into the start of a class as a 5-minute warm-up that does real cognitive work without feeling like a worksheet.
