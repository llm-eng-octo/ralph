# Four Friends, One Grid — The Deduction Detective Game

## In one line
A logic-puzzle game where four friends each picked a different starting number, performed a different operation, and got a different result — and the student uses three clues plus a tappable tick/cross grid to deduce who did what, then locks in the answer through dropdowns.

## Who it's for
Class 5–7 students (ages ~10–13) who can perform basic arithmetic operations confidently but have never been asked to *reason backwards* through a constraint puzzle. The game is for the student who knows that *4 × 3 = 12* but has never thought to use *"the result is 12, the operation is ×3"* as a clue to identify *who* the person was. It's the bridge between mechanical computation and logical inference — the kind of thinking that shows up in IMC-style competition maths.

## What it tries to teach
The whole game is built around one quiet but powerful skill: **pencil-and-paper logical deduction using a cross-elimination grid**.
Three threads inside that:
- **Reading a clue as elimination, not assignment.** A clue like *"Diya's result is even"* doesn't tell you *what* Diya got — it tells you what she *didn't* get. Students learn to mark crosses (✘) on impossible cells *first*, because crosses propagate further than ticks.
- **Cross-referencing two grids.** The puzzle has two relationships to track: *start → operation* and *operation → result* (or equivalently *start → result*). Students learn to pivot between sub-grids — once the operation is locked for a person, the result is *forced*, and vice versa.
- **Committing to an inference chain.** The final dropdowns are the test — the student has to reconstruct *"Diya started with 7, did ×3, got 21"* as a single line. Students who guessed their way through the grid get exposed here; students who reasoned end up with all four lines correct in one pass.

## What the player sees and does
A clean panel. The top row carries the standard frame: avatar badge (`Q1`), a blue countdown timer reading something like `00:35`, and a `0/10` star tally. Time is generous — this is a thinking puzzle, not a sprint.

Below, the instruction text reads in two friendly lines: *"Diya, Arjun, Meera, and Kabir took 1 number each and operated on it to get a new number. Each of them had a different starting number, performed only 1 operation, and got a different result."* And then: *"Tap to mark ✓, tap again for ✘, tap again to reset."*

The body of the screen is the puzzle. A purple-labelled **OPERATION** header sits across the top of a wide grid with four columns (`+8`, `−6`, `×3`, `÷3`). Down the left side, a vertical purple **START** label runs alongside four rows of starting numbers (`7, 16, 4, 18`). Below that, a second sub-grid uses the same operation columns but its left side is labelled **RESULT** with rows (`15, 10, 12, 6`). Each empty cell is a tappable square — first tap places a green ✓, second a red ✘, third clears it.

Below the grid, a yellow-tinted clue box holds three clue lines like *"Diya started with an even number"*, *"Arjun's operation involves division"*, *"Meera's result is the largest among the four"*.

At the very bottom, a four-row summary table appears: each row is *Name | Start | Operation | Result*, with the name pre-filled and the other three columns as dropdowns.

- **Tap a grid cell** → cycles ✓ → ✘ → blank. No correctness check on the grid itself; the grid is just the student's scratch space.
- **Submit a complete summary table** (all 12 dropdowns set) and **all four rows are valid against the puzzle** → green ticks bloom across the table, a triumphant chime plays, the round resolves.
- **Submit with one or more wrong rows** → the wrong rows shake red, a heart shatters, and the cells that conflict glow amber. The student fixes them and resubmits. A second wrong submit ends the round.

There is no auto-check on the grid scratch work. The grid is the student's *thinking surface*, the dropdowns are the *answer* — same as it would be on paper.

## Shape of the experience
The puzzle is **one round** of substantial depth — typically 5–10 minutes of real work. Internally, it has three implicit phases the student moves through:

- **Phase 1 — Read and place obvious crosses (1–2 min).** Each clue eliminates a row or column. Most students cross out 4–6 cells immediately just from the clue wording.
- **Phase 2 — Chain the inferences (3–5 min).** Once one person's operation is locked, that operation column becomes ✘ for everyone else, which often locks a second person's operation by elimination. The chain unwinds.
- **Phase 3 — Lock in the summary (1–2 min).** With the grid solved, the student transfers the four rows into the dropdown table. This is where careful students score and careless students get caught.

Replay loads a different scenario — different names, different ops (`+12`, `×2`, etc.), different clues — so the *moves* transfer but the answer doesn't.

## Win condition and stars
- **3 stars** — submit the complete summary table correctly on the first attempt, with time remaining on the clock.
- **2 stars** — submit correctly within the time limit, but with one revision after a partial mistake.
- **1 star** — eventually submit correctly, but only after multiple revisions or after the timer expired (game gives a buffer).
- **0 stars** — the puzzle is abandoned or the lives run out.

Lives are 2 — meant for two genuine attempts at the summary table. The grid scratchpad has unlimited tapping; only the final dropdown commit costs a life.

## Feel and motivation
- **The grid feels like real detective work.** The tri-state tap (✓ / ✘ / blank) is the same gesture used in printed logic-puzzle books, and the satisfaction of crossing out an impossible cell is doing real cognitive work — the student is making the puzzle smaller with their finger.
- **Clues sound like a story.** *"Meera doesn't do subtraction"* reads better than *"row 3 col 2 is false"*, and the names anchor the maths in a tiny social scene the student can hold in working memory.
- **No partial reveals.** The grid never tells the student if their crosses are right. That's deliberate — the *value* of the grid is that it forces the student to trust their own reasoning. A game that auto-corrected the grid would short-circuit the skill.
- **Names rotate, ops escalate.** Replay rotates the four names from a pool (Diya, Arjun, Meera, Kabir, Riya, Vihaan, Sara, Aditya...) and the operations span easy (+, −) to harder (×, ÷, squared) in later levels.

## Why it works pedagogically
Logic puzzles are usually treated as enrichment — the kid who finishes early gets a printout. But the cross-elimination grid is one of the most powerful general-purpose reasoning tools in school maths, and it transfers directly to the kind of constraint thinking used in algebra word problems, geometry proofs, and (later) discrete maths. By packaging it as a four-friend story with a tappable grid and a forced commit at the end, this game makes deduction *concrete* — the student can see their thinking on the screen, and the dropdown table is the moment of truth that separates real reasoning from lucky guessing. A single puzzle takes 5–10 minutes; a daily session of one puzzle for two weeks measurably improves a student's ability to attack any constraint problem with a structured grid rather than a hopeful stare.
