# Cosmic Pairs — The Logic-Driven Memory Hunt

## In one line
A 4×4 memory game where 16 themed cards (Moon, Sun, Saturn, Comet) hide ten pairs of numbers — but instead of guessing blindly, the student gets four logical clues that narrow down where each number could be, and must find every pair within a tight 30-tap budget.

## Who it's for
Class 4–6 students (ages ~9–12) who can handle "ordinary" memory games (just keep flipping until you remember) but who haven't yet learned that **the constraints in a problem are themselves clues, not just trivia**. The game is for the kid who reads "two corners hide numbers more than 15" and skims past it instead of using it. It targets the leap from random search to *informed* search — the same leap that separates kids who solve logic puzzles from kids who guess at them, and the same skill that underlies number-property reasoning all the way to algebra.

## What it tries to teach
The whole game is built around one big skill: **using positional and category constraints to deduce hidden information without seeing it**.
Three threads inside that:
- **Reading constraints as filters.** *"Moon and Saturn cards only hide even numbers"* tells the student that a Sun or Comet card is *guaranteed* odd. Most kids hear this and do nothing with it; the game's tap budget forces them to start using it.
- **Spatial reasoning on a small grid.** Clues like *"two corners hide numbers more than 15"* and *"10 and 18 are next to each other"* are about *positions*, not values. The student learns to keep a mental map of which cell is which type, and to reason backwards from the clues to the contents.
- **Cost-benefit of a flip.** Each tap costs one of 30 moves. A student who flips randomly will run out before finding all ten pairs. A student who uses the clues to flip *strategically* — testing a hypothesis with one flip, confirming with the second — will finish with moves to spare. Teaching the difference between "flip and hope" and "flip to test" is the real lesson.

## What the player sees and does
A clean white panel. The thin top status row holds the `Q1` badge with the teacher's avatar on the left, a blue countdown timer in the middle (this round runs ~5 minutes, plenty of thinking time), and an `0/10` star tally with a soft cyan star on the right.

Below the instruction (*"Find all matching pairs within **30 moves** using these clues"*) the screen shows a numbered list of four clues in cream-coloured boxes:

1. **Moon** and **Saturn** cards only hide **even** numbers.
2. **1, 3 and 12** are hidden adjacent to cards hiding the number **6**.
3. **Two corners** hide numbers **more than 15** and the other 2 hide **1**.
4. **10 and 18** are hidden next to each other.

Below the clues is a thin progress bar labelled *"Number of taps left"* with `30` on the right end and a yellow-to-red fill that drains as the student taps.

The 4×4 grid sits beneath: 16 themed cards, each tinted by category — pale blue moons, soft yellow suns, pale-pink saturns, lilac comets. Tapping flips a card; the number behind it animates in. Tapping a *second* card reveals its number too. If the two match, both stay face-up and a pair of soft sparkles fires from each card; the score in the top-left ticks up. If they don't match, both flip back after a beat, and the move counter drops by 2 (one per flip).

- **Match a pair** → cards lock face-up with a *cha-ching*, the score jumps from `2/10` to `3/10`, etc.
- **Miss a pair** → both cards flip back, the move counter drops, no penalty beyond the moves spent.
- **Run out of moves before finding all 10 pairs** → the remaining cards reveal in a quick cascade, the round ends, and the star tier locks in based on how many pairs were found.
- **Find all 10 pairs within budget** → confetti, the card grid lights up gold, and the timer is shown as a brag stat.

There's no hint button. The clues *are* the hints. Reading them carefully is the whole point.

## Shape of the experience
This is a single-round game, but the round itself has internal phases:

- **Phase 1 — Clue digestion (no time pressure).** A patient student pauses, re-reads the clues, and starts ruling out cells before the first flip. The game doesn't enforce this, but the move budget rewards it.
- **Phase 2 — Constraint-driven flips.** "Clue 3 says two corners are >15 — let me flip the four corners first to see which two." Four flips, two pairs partially identified.
- **Phase 3 — Adjacency confirmation.** "Clue 4 says 10 and 18 are adjacent. I haven't seen 10 yet, but I've seen 18 in this corner — so 10 is in one of these three neighbours." Two more flips to pin it down.
- **Phase 4 — Mop up.** Last few unmatched pairs, hopefully with several moves to spare.

## Win condition and stars
One round, stars by remaining-moves-on-completion:

- **3 stars** — all 10 pairs found with 8+ moves to spare.
- **2 stars** — all 10 pairs found with 1–7 moves to spare.
- **1 star** — at least 7 of 10 pairs found before moves run out.
- **0 stars** — fewer than 7 pairs found.

There are no lives, no death state — running out of moves doesn't end the run, it just locks the star tier based on how many pairs were on the board. The game ends naturally either way.

## Feel and motivation
- **The themed cards are not just decoration.** Each card type means something — Moons and Saturns are even, Suns and Comets are odd (per Clue 1). The student literally cannot solve the puzzle without using the categories. So the visual variety is doing pedagogical work, not just looking nice.
- **Clues stay visible the whole time.** They sit *above* the grid, not in a popup, because re-reading them mid-puzzle is the correct strategy. A child who has to remember the clues by heart isn't being tested on memory — they're being told to use the clues.
- **The move counter is a loud constraint.** It's a thick yellow bar that visibly shrinks. Kids feel each flip in their gut. By the time they're at 8 moves left with 3 pairs to go, they're forced into using the clues — which is exactly the skill being trained.

## Why it works pedagogically
Most memory games teach memory. This one teaches *reasoning under constraints*, which is a far more valuable skill and rarer to find in a math classroom. The puzzle's structure — 16 cells, four clues, ten pairs, 30 moves — is tuned so that random flipping reliably runs out of budget and clue-driven flipping reliably succeeds, so the student gets immediate, embodied feedback that the slow careful approach is *faster* than the fast careless one. That single insight transfers to word problems, logic grids, geometric reasoning, and number-theory puzzles. A single round takes 4–8 minutes depending on how seriously the student treats the clues — long enough to feel like a real workout for working memory and short enough to replay with fresh clues.
