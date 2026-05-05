# Friendly Pairs Table — The Reorganise-Then-Add Worksheet

## In one line
A guided addition worksheet where a long messy expression like *"6 + 35 + 23 + 7 + 38 + 2 + 5"* is pre-sorted into a table of friendly pairs, and the student fills in each pair-sum, then the grand total — turning a hard-looking line of seven numbers into four short, easy additions.

## Who it's for
Class 3–4 students (ages ~8–10) who can add two two-digit numbers without mistakes but stall when the expression is long enough to need a strategy. The game is for the child whose finger lands on `6 + 35` first because that's the leftmost pair, then on `+ 23 = 64`, then mis-tracks at `+ 7`, and finally produces a number that is *almost* right but off by 4. The bottleneck isn't arithmetic — it's *what to add first*. This screen demonstrates a strategy and asks the child to walk through it themselves.

## What it tries to teach
The leverage is the **friendly-pairs strategy** — pairing numbers that sum to a multiple of 10 (or 50) so the running sum stays on round numbers and the mental load drops to almost zero.
Three threads:
- **Spotting friendly pairs.** `35 + 5 = 40`. `23 + 7 = 30`. `38 + 2 = 40`. The expression *looks* random but is engineered so three clean pairs hide inside it. The child learns that long addition lines are usually disguised friendly-pair puzzles.
- **Pair-sums first, total last.** Adding pair-sums is dramatically easier than adding the originals — `40 + 30 + 40 + 6 = 116` is doable in one pass. The table makes this two-stage strategy literal: pair-sums are written in one column, then summed in the row below.
- **Trust the regrouping.** When the table is finished, the total `116` should match the original expression's total. The child can verify by re-adding the original line — most won't, but the option is there. The lesson is *that two routes give the same answer*, which is the seed of associativity.

## What the player sees and does
A clean vertical layout. Top status bar: avatar, *"Q1"*, heart with lives, star tally `0/10`.

Below the bar, a short story-style instruction:

> *"Shubham is trying to find the sum of the following numbers"*

Then, centred and large, the expression itself in big black numerals:

> **`6 + 35 + 23 + 7 + 38 + 2 + 5`**

Below that, a second instruction:

> *"He arranged them in the table below. Find the sum of all the pairs, and then the total sum."*

The body of the screen is a **4-row table with three logical columns** — *Friendly Pairs*, the literal pair, *Sum of Pairs*:

| Friendly Pairs |   |   | Sum of Pairs |
|---|---|---|---|
| 23 | + | 7 | `[ ___ ]` |
| 35 | + | 5 | `[ ___ ]` |
| 38 | + | 2 | `[ ___ ]` |
| **Total Sum** |   | = | `[ ___ ]` |

Each row's right-most cell is a small white input box with a hairline border. The pair operands are pre-filled and uneditable — the child only fills the four output boxes. Notice the original expression has *seven* numbers but the table only consumes *six* of them in pairs — the leftover `6` is the "lonely" number that the child must remember to add into the final total. This omission is intentional; spotting it is part of the puzzle.

- **Tap an input box** → the on-screen number pad slides up; the box highlights blue.
- **Type the right pair-sum** → the box turns green, a soft chime plays, focus moves automatically to the next input.
- **Type the wrong pair-sum** → box turns soft red, the box clears, a one-line hint appears (*"Try again — `23 + 7` lands on a multiple of ten."*). No life lost yet.
- **Type the wrong total** → red flash on the total box; the three pair-sums stay green; hint: *"Don't forget the lone `6` from the start of the expression."* If the child gets it wrong twice, a heart breaks.
- **All four boxes correct** → the table glows gold briefly, a celebratory chime, the *Continue* button appears.

## Shape of the experience
10 rounds. Each round is one expression and one table. Difficulty climbs by:

- **Rounds 1–3 — Three pairs, no leftovers.** Six numbers, three friendly pairs, no lonely term. The child practises the pure two-step move.
- **Rounds 4–6 — One leftover.** Like the screenshot — seven numbers, three pairs, one lonely term. The child must remember to include it.
- **Rounds 7–8 — Two leftovers.** Eight numbers, three pairs, *two* lonely terms. The total has to absorb both.
- **Rounds 9–10 — Find-your-own-pairs.** The numbers in the *Friendly Pairs* column are blank too. The child has to *both* identify the pairs and compute their sums. This is the stretch level — the same skill, fully self-driven.

A short between-stage line — *"You found the friendly pairs. Now try one where you build the table yourself."* — bridges the jump.

## Win condition and stars
Three lives, ten rounds. Per round:

- **3 stars** — all four boxes filled correctly on the first try.
- **2 stars** — one wrong entry corrected without losing a life.
- **1 star** — completed eventually, with one heart lost in the round.
- **0 stars** — abandoned or all hearts gone.

Total max is 30 stars. The game ends at 10 rounds completed or 3 hearts lost; the final screen shows the rolling tally and a small breakdown of *"how many friendly pairs you spotted on your own."*

## Feel and motivation
- **The table teaches by shape.** Aligning pairs in their own column makes the strategy visible — the child can *see* `+ 7` next to `23 = 30` next to `+ 5` next to `35 = 40` and start to feel the rhythm of pairing-to-tens. A worksheet that shows the same expression on a single line never produces this.
- **Auto-advance keeps focus.** When a pair-sum is correct, focus jumps to the next box. The child never has to think about *where to type next*, only *what to type*. This removes a small but real friction that derails third-graders.
- **The lonely number is the test.** Most children get the three pair-sums right and then mechanically write `40 + 30 + 40 = 110` in the total — forgetting the leftover `6`. The hint is gentle, but the moment of *realising* lands hard, and after one or two rounds with leftovers, the child starts scanning every expression for stragglers. That habit is the actual win.

## Why it works pedagogically
Long-addition speed in late primary is not bottlenecked by addition facts — it's bottlenecked by *strategy choice*. A child who knows `7 + 3 = 10` will still spend ten seconds on `6 + 35 + 23 + 7` if they go strictly left-to-right. Friendly-pairs grouping is the cheapest, highest-leverage strategy upgrade for this age band, and it transfers without modification to multi-digit subtraction (compensation), to mental multiplication (factor pairing), and later to algebraic simplification (combining like terms). The table format makes the strategy *physical* before it is mental — the child re-enacts it for ten rounds, then on round twelve they catch themselves doing it spontaneously on a pencil-and-paper problem at school. That transfer is the moment the game has done its job.
