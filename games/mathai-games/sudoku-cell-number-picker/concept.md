# Tiny Sudoku — The 4×4 Logic Trainer

## In one line
A pocket-sized sudoku where the student fills a 4×4 grid with the digits 1–4 so every row, every column, and every 2×2 box contains all four digits exactly once — by tapping each empty cell to cycle through candidates until the whole grid clicks shut.

## Who it's for
Class 3–5 students (ages ~8–11) meeting their first sudoku. Most children encounter the 9×9 version too early, get overwhelmed by the search space, and walk away with the impression that "sudoku is hard." The 4×4 version is the right entry point: small enough to hold in working memory, structured enough to require the same deductive habits as the full puzzle. The stuck-point this game targets isn't arithmetic — it's the **deductive habit of saying "this cell *must* be 3, because it can't be 1, 2, or 4."** Students who guess randomly hit dead ends; students who reason from the constraints solve it on the first pass. The game is built to nudge them from the first behaviour to the second.

## What it tries to teach
The whole game is built around one foundational logical move: **process of elimination across overlapping constraint sets**.
Three threads inside that:
- **Reading three constraints at once.** Every empty cell sits at the intersection of a row, a column, and a 2×2 box. The student learns to scan all three before placing a digit — a habit that transfers to every constraint puzzle ever.
- **Identifying the most-constrained cell first.** Some empty cells already have three of their four allowed digits eliminated by their row, column, or box; those cells have a *single* legal value and should be filled first. The game gently rewards this by making correct placements glow green and incorrect ones flash red — students who rush soon learn that hunting the easiest cell first is faster.
- **Tap-to-cycle as a lightweight commitment.** Unlike a number-pad, the tap-to-cycle interface lets a student *try* digits 1, 2, 3, 4 in sequence on a single cell without committing — a gentler form of hypothesis testing than a full erase-and-retry. Students experiment more, and learn faster.

## What the player sees and does
A clean white panel. Across the top, the familiar status strip — round badge `Q1`, a large blue **timer** in the centre (`00:35`), and the star counter `0/10` on the right. The timer is prominent on purpose: this game *does* have time pressure, but mild — long enough that thoughtful play wins.

Below the strip, three lines of instruction: *"**Solve this sudoku.** Every **row**, every **column**, and every **box** should have 1, 2, 3 and 4. Numbers in **grey** are correctly filled. Tap on the white blocks multiple times to change the number."*

The puzzle itself is a small 4×4 grid centred on the page. Cells with starting numbers have a soft grey background and bold black digits — they're locked, untappable. Empty cells are pure white with a thin black outline. **Thick black lines** divide the grid into four 2×2 sub-boxes; the dotted lines between cells *within* each sub-box are quieter, so the eye reads the sub-box structure first. A typical starting grid has 6–8 cells pre-filled and 8–10 cells empty.

A **Reset** button sits below the grid, ready to wipe all student-placed digits without costing a heart.

- **Tap an empty white cell** → its content cycles: blank → `1` → `2` → `3` → `4` → blank → `1` → ... Each tap is an experiment.
- **Land on a digit that satisfies all three constraints** (row, column, box, given the current state of the grid) → the cell glows green for a moment. The student can keep tapping if they want, but green means "this currently works."
- **Land on a digit that breaks a constraint** → the cell glows red and the conflicting cell (the row/column/box neighbour with the same digit) pulses red too, so the student sees *what* it conflicts with.
- **All cells filled, all constraints satisfied** → the whole grid pulses green, a small *chime*, and the round resolves.
- **Timer hits zero before completion** → the round ends with a heart lost; the correct solution animates in for two seconds.

## Shape of the experience
10 rounds, escalating in puzzle hardness rather than grid size:

- **Rounds 1–3 — Generous starts.** 8 of 16 cells pre-filled. Several cells have only one legal value from the very start. The student learns the mechanic and the rhythm of "scan, deduce, tap."
- **Rounds 4–7 — Standard difficulty.** 6 cells pre-filled. The student must do real one-step deduction (find a cell with only one legal value, fill it, propagate), and sometimes two-step deduction.
- **Rounds 8–10 — Stretch.** 4–5 cells pre-filled. The grid has *no immediately deducible cells* — the student must consider pairs of cells together (e.g. "in this row, the 3 and 4 must go in these two cells, but I can't yet tell which goes where") and find a constraint elsewhere that breaks the tie. This is real sudoku reasoning.

The timer per round is generous in early rounds (90 seconds) and tighter in stretch rounds (60 seconds), nudging the student toward efficient deduction without making it a speed contest.

## Win condition and stars
Three hearts, carried across all rounds. Stars per round are based on **time used and wrong placements**:

- **3 stars** for solving in under half the round's timer with zero red flashes.
- **2 stars** for solving within the timer with no more than 2 red flashes.
- **1 star** for solving within the timer with multiple red flashes.
- **0 stars** for the round if the timer expires (heart lost).

Total `X / 10`. The game ends at round 10 or when all three hearts are gone. Reset doesn't cost anything except progress — the student can plan, mess up, and restart freely within the round's timer.

## Feel and motivation
- **Tap-to-cycle is the soul of this game.** No number pad, no drag-and-drop. One tap = "try the next candidate." This radically lowers the cost of experimentation. Children who'd be afraid to "commit" a digit are happy to flip through candidates on a single cell, and that flipping *is* the deductive process being modelled.
- **Conflicts highlight the conflict, not just the cell.** When a placement breaks a constraint, the *other* cell with the same digit pulses red too. This converts the error message from "wrong" into "here's exactly which neighbour you clashed with" — a teaching moment instead of a punishment.
- **Tiny grid, real sudoku rules.** The 4×4 isn't a baby version of the 9×9; it's the same game with a smaller search space. Every habit a student builds here — most-constrained-first, scanning row+column+box, hypothesis testing — transfers directly to the bigger puzzle. The game doesn't tell the student that, but a teacher can.
- **The timer is loud but not mean.** It's the largest text on the screen and turns amber in the last 15 seconds, but the time budgets are calibrated so that thoughtful play (not racing) wins comfortably. Students who panic and tap randomly always lose; students who pause and scan always win.

## Why it works pedagogically
Sudoku is one of the cleanest expressions of **constraint satisfaction** in elementary recreational math. The 4×4 variant is a perfect first dose: small enough to be fully solvable in working memory, large enough to require real deduction (not just brute force). Beyond the puzzle itself, the deductive habit it builds — scanning multiple constraints, finding the most-constrained variable first, propagating consequences — is exactly the habit of mind that supports later work in algebra word problems, geometry proofs, and any logic-rich subject. A 10-round session takes 10–18 minutes; a daily warm-up of a single 4×4 round takes 60–90 seconds and is one of the highest-leverage low-effort routines a teacher can introduce.
