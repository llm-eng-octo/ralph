# Logic Seating Puzzle — Who Sits Where?

## In one line

A drag-and-drop deduction game where students seat a group of friends around a numbered table so that every clue — _"Anu sits between Priya and Ravi"_, _"Neha is across from Anu"_ — is satisfied at the same time.

## Who it's for

Class 4–6 students (ages ~9–12) who are comfortable reading short sentences and ready to start using language as math. The game doesn't ask the student to add or multiply — it asks them to _think_. It's for the student who's bored by drill-and-practice and lights up when handed a puzzle with no obvious procedure.

## What it tries to teach

The whole game is built around three intertwined skills:

- **Reading clues as constraints.** A sentence like "Ravi sits to the left of Anu" isn't just words — it's a rule about where two named characters can go. Students learn to translate each clue into a concrete spatial restriction on the seating diagram. This is the core move that, in later years, becomes "translate a word problem into an equation."
- **Combining constraints.** One clue rarely solves the puzzle. Two or three clues together do. Students learn to hold several partial restrictions in mind, look for the piece that's already pinned down, and let that piece unlock the rest. This is exactly the deductive reasoning skill that powers algebra, geometry proofs, and logic grids in later grades.
- **Hypothesis and test.** When a student's not sure where a character belongs, the right move is to _try_. Place a guess, see which clues break, learn from the failure. The game's CHECK button rewards this — it tells the student which clues are violated, not just whether the whole thing is right or wrong.

## What the player sees and does

A small top-down diagram of a table with numbered seats — 4 in the easiest puzzles, 6 in the hardest. Below the table is a pool of character chips, each with a friendly avatar and a short name (Anu, Ravi, Priya, Neha, Meera, Bobby). Above the table is a clue panel — three to five short sentences, each one a constraint.

The student drags a character chip from the pool and drops it onto a seat. Drop on an occupied seat to swap the previous occupant back into the pool. Pull a chip back out of a seat to free it up.

A CHECK button below the table is dimmed until every required seat is full. Tapping it tests the whole arrangement at once.

- **All clues satisfied** → green flash on every seat, a quick celebratory chime, voice-over says _"Yes! That's the right seating."_ Round complete.
- **Some clues broken** → the seats that participate in any violated clue glow red. A short message appears: _"Oh no — that's not quite right!"_ The CHECK button transforms into a NEXT button to move on (no retry — see below).

The interaction is deliberately spare. No hint button, no animations between drops, no clutter on the table. The puzzle is the puzzle.

## Shape of the experience

7 rounds across three small stages:

- **Stage 1 — Translate (Rounds 1–2).** Four seats, four characters, two or three simple "next to" / "across from" clues. The student isn't really doing deduction yet — they're learning how the table is shaped, what "across" means in this game, and how dragging works. Most students should solve these on the first attempt.
- **Stage 2 — Combine (Rounds 3–5).** Five seats with a "head of the table," five characters, three or four clues that include the trickier "between X and Y" phrase. Now the student needs to use one clue to lock down a position and let that unlock the rest. This is where deduction starts.
- **Stage 3 — Reject (Rounds 6–7).** Six seats, but the pool now has _seven_ characters — one of whom is never mentioned in any clue. The student first has to notice the distractor, set them aside, then solve the seating with the remaining six. Adds one round with a "not next to" negation clue, which is harder than it sounds.

## Win condition and stars

There are no lives. Students play through all 7 rounds regardless of how many they get wrong. Stars are awarded by **how many rounds were solved on the first CHECK**:

- **3 stars** — All 7 rounds solved on first CHECK.
- **2 stars** — 5 or 6 of 7 rounds solved on first CHECK.
- **1 star** — Fewer than 5 rounds solved on first CHECK, but the student finished all 7.
- **0 stars** — Walked away before round 7.

Speed isn't graded. There's no timer in the gameplay header — this is a thinking game, and a clock would push students toward guessing. Whether a student takes 2 minutes or 8 minutes on a Stage-3 puzzle is not the point; whether they _got there_ is.

## Feel and motivation

- **The diagram does the heavy lifting.** Seats are labeled with big numbers and the table has a clear top/bottom/sides so spatial words like "across" and "next to" never need explaining in text. The visual layout teaches what "between" means before the student has to use it.
- **Wrong feels informational, not punishing.** Red-glowing seats tell the student _which clues their arrangement violates_. The student walks away from a wrong answer knowing more than they walked in with — which is exactly how a logic puzzle should feel.
- **No retries.** A student who gets a round wrong moves to the next round rather than redoing the same one. This is deliberate: re-solving a puzzle whose answer you've half-figured-out feels stale, and the goal is _practice reasoning_, not _pass this puzzle_. A second play loads fresh puzzles, so the student gets new material to work on.
- **No music, minimal SFX.** Audio is reserved for moments that matter — the success chime, the gentle "not quite" cue, the round transitions. The rest of the time, the student hears their own thinking.

## Why it works pedagogically

Logic-grid and seating-style puzzles are some of the most powerful pre-algebra exercises a young student can do. They build the _exact_ habits of mind that algebra requires: turning a sentence into a precise restriction, holding multiple partial answers in mind, intersecting constraints, and using "if I assume X, what follows?" reasoning. They also strengthen reading comprehension, because every clue rewards careful, literal interpretation — _"to the left of Anu"_ is not the same as _"on Anu's left"_ — and they reward the working-memory habit of keeping several facts active at once.

Most curricula tuck this kind of puzzle into a side appendix, framed as enrichment. This game treats it as the main event, with a difficulty curve that takes students from "what is this game even" to "I can solve a six-character distractor puzzle" inside a single 7-round session of about 6–10 minutes. Long enough to feel like a real workout; short enough to fit between two pieces of homework.
