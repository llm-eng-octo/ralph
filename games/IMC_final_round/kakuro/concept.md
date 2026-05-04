# Kakuro — Sum-Snake Logic Puzzle

## In one line
A crossword-shaped digit puzzle where every white run of cells must add up to the clue at its head and never reuse a digit — students reason their way to the only set of numbers that fits.

## Who it's for
Class 4–6 students (ages ~9–12) who already know their single-digit addition facts and are ready to use them as *constraints* rather than as *answers to compute*. The puzzle assumes the student can mentally answer "what two numbers from 1–9 sum to 11?" — and pushes them past that into "what two distinct numbers, given that one of them also has to fit a 7-sum across, sum to 11?"

## What it tries to teach
The whole game is built around three intertwined skills:
- **Decomposition fluency.** See a sum like `15` and pull from memory the small set of digit pairs/triples that produce it. The faster this recall is, the more enjoyable the puzzle is.
- **Constraint reasoning.** Each white cell sits at the intersection of a row clue and a column clue, so its value must satisfy both at once. Students learn to mentally intersect two sets — *"3 or 4 from the row, 4 or 5 from the column → it must be 4"* — which is the bones of algebraic thinking.
- **Process of elimination.** When two cells in a run both need values, students learn to tentatively place the easier one and watch the constraint on the other one collapse to a single answer. This is the same move that drives systems-of-equations work in later grades.

## What the player sees and does
A small grid — usually 4×4 to 6×6 — with three kinds of cells: black walls, **clue cells** showing one or two small numbers (top-right for the row sum, bottom-left for the column sum), and **empty white cells** waiting for a digit.

The student taps an empty cell. A small numpad of `1`–`9` slides in. They tap a digit; it lands in the cell. If they want to undo, they tap the cell again and either change the digit or clear it.

- **Right digit, completes a run** → the run flashes green, a soft *click-click* SFX plays, and the run "locks" so it can't be edited again.
- **Wrong digit, breaks a constraint** → the offending cell flashes red with a brief shake. The digit stays so the student can see what they tried, but a small hint appears: *"This row needs to sum to 11."* They can tap again to replace it.
- **Used the same digit twice in a run** → similar red flash with a tighter hint: *"No repeats in a run."*

There is no submit button. The puzzle is solved the moment the last cell is filled correctly; the grid celebrates and a stars screen rolls in.

## Shape of the experience
Three difficulty tiers, played as one puzzle each per session (so a session is short and complete):

- **Stage 1 — Warm-up (4×4).** Two or three short runs, sums in the 5–13 range, lots of pairs that have only one valid decomposition (e.g. a 17 made of two cells must be 8+9). The student should feel the "aha" of a constraint solving itself.
- **Stage 2 — Standard (5×5).** Mixed pair and triple runs, sums up to 20. Some cells genuinely require intersecting two sets to resolve. This is the meat of the game.
- **Stage 3 — Stretch (6×6).** Triples and the occasional quadruple. A few sums in the 20s. Students will need to hold two or three options in mind for a cell while they work the rest of the run.

A small hint button in the corner — *"Show me a single cell"* — fills one cell on demand. Each use costs a star at the end. Students who finish without using a hint get the full three stars; one hint drops them to two; two or more hints drops them to one.

## Win condition and stars
- **3 stars** — Solved without a hint.
- **2 stars** — Solved with one hint, OR with two or fewer wrong-digit attempts.
- **1 star** — Solved with two hints used, OR several wrong-digit attempts.
- **0 stars** — Did not solve (only possible if the student walks away).

Stars reward *quality of reasoning*, not speed. There is no timer in the gameplay header; this is a thinking game, and the absence of a clock is part of the tone.

## Feel and motivation
- **Quiet and deliberate.** No music loop, no "ding" between each digit. Audio is minimal — only on success, on error, and on completion. The student should feel like they're the one driving the pace.
- **Mistakes are information.** Wrong digits are not a punishment — they're the puzzle teaching back. Each red flash comes with the specific constraint that's broken so the student can update their model.
- **Replay is cosmetic.** A second play of the same puzzle isn't useful (the answer is fixed), so the game loads a fresh puzzle each session, drawing from a pre-authored bank of about 30 puzzles per stage. Students never see the same grid twice in a week.

## Why it works pedagogically
Kakuro is the rare puzzle that disguises arithmetic *practice* as logical *reasoning*. A student who plays one Stage-2 puzzle has likely retrieved 25–40 single-digit sums from memory, but they remember the session as "I figured out a hard puzzle," not as "I did a worksheet." The constraint-intersection move (this cell must satisfy both sums) is a direct rehearsal for substitution and elimination in algebra. And because the rule "no repeats in a run" forces students to track which digits are still available, the game also strengthens working-memory habits that pay off across all of math.

A solved 5×5 puzzle takes most Class 5 students 4–8 minutes. Short enough to fit a classroom warm-up; long enough to feel like a real win.
