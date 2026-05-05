# Operator's Maze — The Crossword of Equations

## In one line
A crossword-style number puzzle where the student drags single digits from a pool into a grid riddled with `+`, `-`, and `=` signs, making horizontal *and* vertical equations true at the same time — turning arithmetic into a constraint satisfaction puzzle.

## Who it's for
Class 3–5 students (ages ~8–11) who are comfortable with single-digit addition and subtraction but treat each equation as an isolated calculation. The game is for the moment when students need to learn that *the same number can play two roles at once* — a 6 in the grid might be both the answer to `9 - 3` and a piece of the equation `6 + 4 = 10`. This bidirectional thinking is what algebra is built on, and this game is the gateway.

## What it tries to teach
The whole game is built around one structural skill: **placing digits so that every horizontal AND vertical equation involving them works simultaneously.**
Three threads inside that:
- **Equation-as-constraint, not equation-as-calculation.** Most arithmetic worksheets give a partial expression and ask for the missing piece. Here, the grid is full of partial expressions and the student must pick a digit that satisfies *all* the expressions a cell touches at once. That's a meaningful conceptual jump.
- **Working both directions.** A cell might be the `?` in `9 - ? = 6` (subtract to find it) and also the second operand in `? + ? = 12` (add to check it). The student learns to verify by trying the cell in every equation it sits in.
- **Resourcing from a finite pool.** Digits in the pool are limited. If the student burns the `7` in the wrong slot, they may have nothing left to fill another. Strategy emerges: solve the most-constrained slot first.

## What the player sees and does
A clean white panel. At the top, the usual thin status row — round badge, hearts, star tally. Below that, a single instruction line: *"Drag and drop the numbers to make the math statements true."*

The body of the screen is the maze: a 5x5 grid where some cells hold pre-filled digits (`9`, `6`, `4`, `10`, `12`), some hold operator symbols (`-`, `+`, `=`), some are empty drop targets, and some are blank/spacer cells. The structure forms three horizontal equations and two vertical equations that *cross* through shared cells — exactly like a crossword. For example, the top row reads `9 − ? = 6` (so `?` must be 3), and that same `?` cell might also be the answer to a vertical equation reading `? = ? + ?`.

Below the grid, a digit pool — a soft grey panel containing tiles for 1, 2, 3, 4, 5, 6, 7, 8, 9, and 14 — sits ready to drag from.

- **Drag a correct digit into a slot** → the slot snaps to green, the tile is consumed from the pool, and any equation that's now fully formed gets a quick green flash to confirm it.
- **Drag a wrong digit into a slot** → the slot flashes red, the digit returns to the pool, a heart shatters. The student tries again.
- **Drag a digit into a slot, but the value breaks an *intersecting* equation** → the slot turns amber and the conflicting equation pulses to show the conflict. No heart is lost (the conflict is a *warning*, not a final mistake) — but the digit doesn't stick, so the student has to rethink.
- **Fill all 4 empty slots correctly** → all five equations turn green together, a triumph chime, the round resolves.

## Shape of the experience
10 rounds, increasing maze complexity:

- **Rounds 1–3 — Two empty slots, no intersections.** Single-equation puzzles dressed up in the grid. The student gets used to the drag-and-drop and the shape.
- **Rounds 4–7 — Three or four empty slots, one intersection.** One slot is shared between a horizontal and a vertical equation, so the student must satisfy both. The pool always has enough digits to solve cleanly.
- **Rounds 8–10 — Four slots, two intersections, tight pool.** Two slots are shared. The pool has *exactly* the right digits. Students must plan the order of their placements — solving the most-constrained slot first.

## Win condition and stars
Three lives across the whole session.
- **3 stars** — finish all 10 rounds with no hearts lost.
- **2 stars** — finish all 10 rounds, losing one heart.
- **1 star** — finish all 10 rounds, losing two hearts.
- **0 stars** — all three hearts lost before round 10.

The amber-warning state is deliberately *not* a heart loss — it's the game *helping* the student avoid a real mistake. Hearts only fire on a confidently wrong drop.

## Feel and motivation
- **The pool is finite.** Watching the digit tiles disappear from the pool gives a satisfying *building it up* feel. Putting back a wrong digit is forgiving.
- **Equations light up.** When a horizontal equation is fully satisfied, it glows green for a beat — a little celebration that says *this row is done*. The same for verticals. The student gets micro-feedback on each piece.
- **The pre-filled digits are friendly.** Numbers in the grid stay under 20. Operations are only `+` and `−`. The point is the *interlocking* of equations, not the arithmetic — so the arithmetic should be invisible work.

## Why it works pedagogically
Crossword-style number puzzles are a classic gateway from arithmetic to algebra: they force the student to think of a number not as the answer to one calculation but as a value that must be *consistent across multiple constraints*. That mental shift — "the same x has to make every equation true" — is the entire conceptual leap behind solving systems of equations later. By presenting it concretely, with draggable digits and visible intersections, this game teaches the leap before the algebra notation arrives, so when systems-of-equations show up in Class 7 or 8, students recognise the move rather than meeting it cold.

A 10-round session takes 8–12 minutes — long enough to flex strategy, short enough that students don't burn out on the constraint solving.
