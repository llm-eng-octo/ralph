# Zero Quest — The Subtraction-Path Maze

## In one line
A puzzle-maze where the student steers a yellow block through a grid of numbers, each step subtracting the new cell's value from the block's running total, and has to land next to the orange goal with a value of exactly zero.

## Who it's for
Class 3–5 students (ages ~8–11) who can subtract two numbers on paper but have never had to *plan a sequence* of subtractions to hit a specific target. The stuck-point is forward-looking arithmetic: most school subtraction is reactive (the problem hands you two numbers, you subtract them), but real number sense is *predictive* — given a goal, can you choose the operations that get you there? Students who do well at "what is 47 minus 23" can struggle for ten minutes at "starting from 47, what numbers should I subtract to land on zero?" The game targets exactly that gap.

## What it tries to teach
The whole game is built around one hard, transferable skill: **planning a sequence of subtractions to hit a target value**.
Three threads inside that:
- **Running totals as state.** The yellow block's value changes every step. The student learns to track *current value, not original value* — a small but profound shift, because most school arithmetic treats numbers as static. Here, a number is a state that updates with every move.
- **Choosing differences strategically.** Some cells are 1, some are 7, some are 12. To go from 18 to 0 in three moves, the student must pick cells whose values sum to 18. The game gently introduces additive decomposition disguised as path-finding.
- **Reasoning backwards from the goal.** Stronger players quickly realise it's easier to ask "what value do I need to land *next to* the orange block?" than to brute-force forward. The game rewards this by making the goal cell adjacency-only — you don't step *onto* the orange block, you stop next to it — so the student has to plan a final approach with the right pre-arrival value.

## What the player sees and does
A clean white panel. The familiar status strip across the top — round badge `Q1`, hearts indicator, star counter `0/10`. Below it, the rules in two short blocks: *"You need to **move the yellow block** in a way that **satisfies both conditions**. As the yellow block moves, the number in the yellow cell will be the result of the **difference** between the value in the previous cell and in the new cell."* A small video preview sits just under the rules — a 38-second silent demo that loops a single example so the mechanic is unambiguous.

Below the video, two numbered conditions remind the student what "winning" means:
1. *Move the yellow block so it reaches a cell **next to** the orange block.*
2. *The value of the yellow block should be **0** when it reaches the orange block.*

The puzzle itself is a 5×5 grid of pale cells, each containing a small whole number (1–9). One cell is the **yellow block**, displaying its current value in big bold digits — say `18` at the start. One cell on the opposite side is the **orange block**, the goal. The student moves the yellow block one step at a time — up, down, left, or right — by tapping an adjacent cell. As the block enters that cell, the displayed value subtracts the cell's number and updates instantly: tap a `7` cell and `18` becomes `11`. The cell the block left turns into a faint trail so the student can see the path so far. Cells already visited can't be re-entered. A **Reset** button below the grid restarts the round from scratch.

- **Reach a cell adjacent to orange, with value 0** → the goal cell pulses orange, a small bell chimes, the round resolves and a star animates in.
- **Reach orange-adjacent with a non-zero value** → a quiet *"not quite — your block reads 3, you need 0"* message appears, and the round ends (heart lost).
- **Get trapped (no unvisited adjacent cells, value not yet 0)** → a soft red border flashes; the student must Reset to try again. Reset doesn't cost a heart, only progress.
- **Negative values mid-path are allowed** — the block can read `-3` for a step, as long as future moves bring it back to `0`. This is deliberate; it forces the student to think of the value as a continuous quantity, not just a countdown.

## Shape of the experience
10 rounds across three difficulty bands:

- **Rounds 1–3 — Short paths, single solution.** 3×3 or 4×4 grids, starting value around 10, two or three moves to victory. The student learns the mechanic without being asked to plan ahead.
- **Rounds 4–7 — Real planning required.** 5×5 grids, starting values 15–25, four or five moves needed, and **multiple valid paths** — but only one or two of them land on zero. Reset becomes a real tool here.
- **Rounds 8–10 — Stretch puzzles.** 5×5 or 6×6 grids with starting values up to 40, paths of six or seven moves, and at least one decoy cell whose value seems helpful but pushes the block past zero. The student has to plan the final two moves before committing to the first.

## Win condition and stars
Three hearts total, carried across all rounds. Stars per round are based on **resets and missteps**:

- **3 stars** for solving the round with zero resets and no wrong moves (no orange-adjacent dead ends).
- **2 stars** for solving with one reset.
- **1 star** for solving with multiple resets.
- **0 stars** for the round if a heart is lost (the student reached the orange block with a non-zero value).

The headline tally is `X / 10`. A perfect run requires every round on the first plan — which is the actual mark of strategic subtraction having clicked. The game ends at round 10 or when all three hearts are gone.

## Feel and motivation
- **The number is the character.** The yellow block's value updates with a quick "tick-down" animation each step, like a counter ticking. The student watches a single number live and breathe through the whole round, which is the entire intuition the game is teaching: *one number changing through operations*.
- **Trail-of-breadcrumbs feedback.** Visited cells fade to a soft cream, so the student can see their path at a glance and reason about what remains. This is not just navigation — it's a visual log of arithmetic operations performed.
- **Reset is a friend, not a failure.** Reset doesn't cost a heart and doesn't end the round; it just rewinds. The game's quiet message: *planning is hard, you're allowed to think it through twice*. This contrasts deliberately with timed games that punish hesitation.
- **No dead-end traps in early rounds.** Rounds 1–3 have only viable paths (every move keeps zero reachable), so the student can't accidentally fail by exploring. Rounds 8–10 introduce real traps where bad early choices doom the run — but by then, the student has the planning instinct to avoid them.

## Why it works pedagogically
This game converts subtraction from a *single-step arithmetic task* into a *multi-step planning problem*, which is the form arithmetic actually takes in life: you don't subtract once and stop, you subtract and add and subtract again toward a goal. By embedding subtraction inside spatial navigation, the game also taps the part of the brain that's good at remembering routes — children who struggle with abstract chains of arithmetic often find it surprisingly easier when the chain is a *path*. Once the planning instinct is in place, it transfers directly to multi-step word problems, money calculations, and early algebra ("if I take away x and add y, what's left?"). A 10-round session takes 8–14 minutes — slower than a typical fluency drill, because thinking is the point.
