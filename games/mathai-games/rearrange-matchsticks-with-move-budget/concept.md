# Two Sticks — The Matchstick Equation Repair Shop

## In one line
A visual logic puzzle where the student stares at a broken equation built from matchsticks (`3 - 2 = 0`), drags exactly two sticks to new positions, and has to leave behind a mathematical statement that's actually true.

## Who it's for
Class 3–6 students (ages ~8–12) who can read a digital-display digit and do basic arithmetic but have never had to think about *which segments make which digit*. The game is for the student who knows `8` is "8" without ever having noticed it's the only digit using all seven segments — and so has never thought of digits as *constructions*. The stuck-point is dual: it's a number-sense problem (which equations are true?) and a perceptual problem (what digit can I make if I add or remove a segment from this one?). Together, those make the student see digits as objects with parts, not just labels — which is a small but powerful piece of mathematical structure.

## What it tries to teach
The game is built around one weirdly transferable skill: **mathematical statements have flexible internal structure, and small changes can convert false to true**.
Three threads inside that:
- **Digit anatomy.** A `0` becomes a `9` by adding one stick on top; a `6` becomes `8` by adding the top-right segment; an `8` becomes a `9` by removing one stick. The student internalises which digits are *neighbours* under one-stick edits — a piece of visual fluency that pays off in number-line reasoning later.
- **Operator transformation.** A horizontal stick (`-`) can become a `+` by adding a vertical stick across it. A `+` can become an `=` by moving the vertical stick to a horizontal position below. The student learns that operators are also visual objects, not magic symbols.
- **Working backwards from validity.** The student doesn't just rearrange and hope. Strong players check the *budget* (exactly two moves) against the *gap* (how false is the current equation, and which moves close that gap?). This is mathematical reasoning under a constraint — the heart of competition math.

## What the player sees and does
A clean white panel. The status strip up top — round badge `Q1`, hearts, star counter `0/10`. Below it, a single-line instruction: *"Move any **2 matchsticks** to make the given statement correct."*

A **Moves left** progress bar sits just below the instruction — a thin yellow horizontal track with a `2` on the right that ticks down to `1`, then `0`, as the student moves sticks. The bar is the visual heartbeat of the game; everyone watches it.

The puzzle itself dominates the middle of the screen: an equation rendered as red-tipped matchsticks on an invisible 7-segment display grid. The starting puzzle reads `3 - 2 = 0` — visibly wrong. Each digit is built from up to seven sticks; missing-segment positions are drawn as faint grey ghosts so the student can see where a stick *could* go. The minus sign and the equals sign are also matchsticks. Sticks are draggable; ghost positions are valid drop targets. Once two moves have been made, the puzzle auto-checks.

A **Reset** button below the puzzle restores the starting position without costing a heart.

- **Make a valid two-move solution** → the equation flashes green, a satisfying *thunk-thunk* of the two moved sticks settling, and the round resolves.
- **Use both moves to produce something invalid** → the equation flashes red briefly, a heart shatters, and the correct solution animates in for two seconds before the next round loads.
- **Try to drag a third stick** → nothing happens; the move budget is hard. The student must Reset to try a different plan.
- **Drop a stick onto an invalid spot** → it springs back to its origin, no penalty, no move counted.

## Shape of the experience
10 rounds, getting trickier:

- **Rounds 1–3 — Single-digit fixes.** `5 + 5 = 4` (move one stick on the `4` to make `9`, then... wait, that's only one move) — these rounds use one-move solutions but a budget of two, so the second move is a "free" cosmetic fix. Builds confidence with the digit-anatomy.
- **Rounds 4–7 — Two real moves required.** `3 - 2 = 0` becomes `3 - 3 = 0` (move one stick to turn `2` into `3`, then move another to fix the result) — or `3 + 2 = 5`, or any number of valid solutions. The student learns that puzzles often have **multiple correct answers** and the goal is *any* valid one.
- **Rounds 8–10 — Operator surgery.** `7 + 1 = 1` becomes `7 - 1 = 6` (move a `+` stick to make `-`, move another stick to turn `1` into `6`). Now the student has to consider operator changes, not just digit changes — the search space doubles.

## Win condition and stars
Three hearts, carried across all rounds. Per-round stars are based on **moves used and resets**:

- **3 stars** for solving on the first attempt with no resets.
- **2 stars** for solving after one reset.
- **1 star** for solving after multiple resets.
- **0 stars** for the round if a heart is lost (the student "submitted" two moves that didn't yield a valid equation).

Total tally: `X / 10`. The game ends at round 10 or when all hearts are gone.

## Feel and motivation
- **Sticks behave like real sticks.** Each match has a soft red tip and a wood-coloured body. When dragged, it lifts slightly off the canvas with a small shadow, follows the finger, and snaps into the nearest valid ghost position with a *click*. Children who don't even like math will play with the sticks just because they feel good.
- **Ghost segments tell you what's possible.** Every position on the digit grid where a stick *could* go is shown as a faint grey rectangle. This is critical scaffolding — without it, students have to imagine the seven-segment grid mentally, which is a separate (and harder) skill. The game wants the puzzle to be about *which moves*, not *which positions exist*.
- **Multiple solutions are explicitly fine.** Each round has 2–5 valid answers. The game accepts any of them. This is rare for a math game and very deliberate: real mathematical puzzles often admit multiple proofs, and rewarding the first valid one (rather than a "canonical" one) teaches that the destination matters more than the route.
- **Sound is muted, satisfying.** Stick clicks, a soft chime on success, no jingles or fanfares. The game wants to feel like a quiet desk puzzle, not an arcade.

## Why it works pedagogically
Matchstick puzzles have been a staple of recreational mathematics for over a century, because they sit at the unusual intersection of visual reasoning, arithmetic verification, and combinatorial search. Children doing them learn — without anyone telling them — that *numbers and operators are made of parts*, that *small structural changes can flip truth values*, and that *constraints (exactly two moves) make problems harder and more interesting*. These three lessons are foundational for everything from algebraic manipulation to proof writing. A 10-round session takes 6–12 minutes; the per-round time varies wildly with student ability, which is fine — the game is forgiving of slow thinkers and rewards careful planning over speed.
