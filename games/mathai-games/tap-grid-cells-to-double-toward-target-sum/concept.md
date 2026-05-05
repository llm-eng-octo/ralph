# Double Trouble — The Doubling-To-Target Puzzle

## In one line
A grid puzzle where the student stares at sixteen small numbers, a target total, and decides which numbers to *double* — by tapping them — so that the new sum of the whole grid lands exactly on the target.

## Who it's for
Class 3–5 students (ages ~8–11) who already know how to add a column of numbers and roughly understand "doubling" but haven't yet developed the *search* skill — the ability to look at a target, look at a current state, and figure out which moves close the gap. The game is for the moment a child stops solving math by trying random things and starts solving math by *measuring the gap and choosing the right-sized move*.

## What it tries to teach
The whole game is built around one small but high-leverage skill: **gap-closing arithmetic — given a current sum and a target, identify the move (or set of moves) that closes the gap exactly.**
Three threads inside that:
- **Doubling as adding the same value again.** Tapping a cell with a `9` doesn't replace it with some other number — it *adds another 9 to the grid total*. The student learns to translate "double this 9" into "add 9 to the running sum," which is the actual algebraic identity `2x = x + x`.
- **Reading the gap, not the parts.** The naive student computes the current grid sum, computes the target, computes the difference, and *then* looks for cells whose values match that difference. The expert student looks at the gap directly and asks *"what cells, when added to themselves, sum to this gap?"* The game rewards the second move: after a few rounds, students stop re-summing the entire grid and start chasing the delta.
- **Combinatorial choice.** Sometimes one tap closes the gap exactly. Sometimes you need two cells, neither of which alone is enough. Sometimes there are multiple valid combinations. Students learn to *plan a move set* before tapping, because tapping is reversible but committing to a wrong combination wastes time.

## What the player sees and does
A bright, focused panel. The status row at the top shows the round badge `Q1`, a heart with `2`, and the progress chip `0/10`.

Below the status row, two short instruction lines: *"Tap on a cell to double it and reach the target sum."* and *"Solve 3 rounds."*

Then the central play area, stacked vertically:

1. **A round-progress bar.** A clean rounded bar across the screen labelled *"Rounds Completed"* on the left and the count *"0/3"* on the right, filling up in a warm yellow as the student clears rounds. This makes the three-round arc feel concrete.
2. **The target.** Centred and big, in a confident purple: *"Sum Target: 60"*. There is no other number on screen this size — it's the lodestar of the round.
3. **A 4×4 grid of small-digit cells.** Sixteen white cells, each with a single integer between 1 and 15 — for example `4, 13, 15, 1` on the first row, `9, 9, 13, 12` on the second, `8, 5, 11, 12` on the third, `10, 12, 4, 9` on the bottom. The current grid sum (around 137 in the reference layout — but importantly, far above the target) sits below as a subtle live tally.

Wait — that's the *trick*. The target (60) is *less* than the current sum, which feels like a contradiction. But the student notices that the cells doubled previously can be doubled again, that doubling shifts the sum *upward*, and that the puzzle is actually framed differently per round: sometimes the student starts *below* target and doubles their way up; sometimes the puzzle is reset so that some cells start partially doubled and the student fine-tunes. The grid layout supports both directions.

A bright **Next Round** button sits in the bottom-right corner of the screen but is greyed out until the round is solved.

- **Tap a cell that hasn't been doubled** → the cell's number visibly grows (the doubled value, e.g. `9` → `18`), the cell border turns gold to mark it as doubled, the running sum updates with a soft *tick*.
- **Tap a doubled cell again** → optional toggle-back behaviour: the cell un-doubles (or doubles again, depending on the variant). Mid rounds default to "doubling once, no toggle"; later rounds allow re-doubling for harder puzzles.
- **Reach the target exactly** → the grid pulses green, a chord sound plays, the *Next Round* button lights up.
- **Reach a number close to but not equal to the target** → no penalty, the student keeps tapping; only *committing* to a wrong final state (via Next Round) costs a life.

## Shape of the experience
3 rounds per session — the source contract is short and intense, designed to be done in a single focused sitting:

- **Round 1 — Single tap suffices.** A target whose gap from the current sum is exactly equal to one of the cell values. The student spots the cell, taps once, lands on target. About 30 seconds of work.
- **Round 2 — Two-tap combination.** A gap that requires doubling two cells, where the cells must sum to exactly the gap. There are usually two or three valid pairs, so the student has freedom.
- **Round 3 — Three-tap planning.** A gap that needs three cells, with at least one near-miss combination that gets you to *"target ± 1"*. Students who tap impulsively will land on `61` or `59` and lose a heart. Students who plan first will close it cleanly.

A round-progress bar across the top fills as each round resolves, so the three-round arc has visible momentum.

## Win condition and stars
Three lives across the three-round run. A life is lost only when the student commits a wrong final state via Next Round; experimenting freely in the grid is free. Stars are based on **rounds solved on the first submit**:
- **3 stars** — all 3 rounds first-submit correct.
- **2 stars** — 2 of 3 first-submit correct.
- **1 star** — completed all 3 rounds, at least one wrong submit.
- **0 stars** — all hearts lost.

The session is short enough that perfection feels achievable but not automatic.

## Feel and motivation
- **Tapping feels like a deliberate decision.** When a cell is doubled, the new larger number expands into the cell with a satisfying squish-and-settle animation. Doubling a `13` into `26` is *visibly* a bigger commitment than doubling a `4` into `8`, which makes the size of each move emotionally legible.
- **The target is sacred.** The target number sits in a colour and weight reserved for it alone. Children quickly learn to glance up at the target between every tap, because the target never moves and the grid sum keeps changing.
- **Decoys live in the grid layout.** The grid almost always contains *one* "obvious" cell whose value equals the gap exactly — but tapping it overshoots because doubling means *adding* the value, not *replacing* the cell. A student who hasn't yet understood "double = add the same again" will be tempted by this cell and learn the lesson on first miss.

## Why it works pedagogically
By Class 3, children have addition facts and they have a vague sense of "doubling," but they rarely connect *doubling* to *adding the value again*, which is the actual identity that makes algebraic doubling work later. This game enforces that connection through the geometry of the grid: tapping a cell with value `n` adds `n` to the running sum, period. Wrapped around that core arithmetic identity is a search puzzle — *which subset of cells produces this gap?* — that trains the *search* habit students need for problem-solving later. The constraint of just three rounds keeps the puzzle dense; there's no room to coast. A full session takes 3–6 minutes — short enough to drop in as a transition activity between two longer lessons, structured enough to feel like a real win when nailed.
