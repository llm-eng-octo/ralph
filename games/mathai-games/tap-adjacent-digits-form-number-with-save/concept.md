# Treasure Grid — The Number-Hunting Word Puzzle

## In one line
A "find the hidden treasure" game where four secret numbers are buried in a 4×4 grid of digits, the student gets a clue for each one (*"half of 500"*, *"100 less than 365"*), and they swipe-tap a horizontal or vertical run of adjacent cells to reveal the number that matches the clue.

## Who it's for
Class 3–5 students (ages ~8–11) who can perform a single-step calculation when *given* the calculation, but freeze when asked to do the calculation *and* spell out the resulting digits separately. The game is for students who can compute *half of 500 = 250* in their head but can't yet glance at a digit grid and know they're hunting for the digits `2`, `5`, `0` in that order, sitting next to each other.

## What it tries to teach
The whole game is built around a single chain of moves: **read a verbal clue → compute a small number → read off its digits → find that digit run in the grid**.
Three threads live inside that:
- **Mental computation from words.** Clues are pure number-talk — *"half of 500"*, *"twice 75"*, *"100 less than 365"*, *"digits sum to 9, all even"*. The student must convert the English to a number without scratch paper.
- **Digit decomposition.** Once they've computed `250`, they have to *think of it as the sequence 2, 5, 0* — a different mental representation. Students who only ever see numbers as totals struggle here.
- **Spatial scanning.** Locating *2 next to 5 next to 0* in a grid of sixteen mixed digits is genuinely hunting. The student learns to anchor on the rare digit (the `0`) and scan its neighbours, rather than reading the grid left-to-right like text.

## What the player sees and does
A clean white panel. The header carries the standard frame — `Q1` avatar, a blue countdown timer (`00:39`), heart counter showing 3 lives, and a `0/10` star tally with a star icon.

The instruction text fills the upper screen in three friendly chunks:
*"4 treasures are hidden in the grid below. You will get 4 clues, one for each treasure.*
*Tap on blocks from left ➡ right OR from top to bottom ⬇ to form a number.*
*Select check, once your number matches the clue! You have 3 lives!"*

A thin yellow progress bar reads *Treasures found · 0/4*.

Below it, a soft-yellow clue card holds a single line — for instance *"Half of 500"*. The clue is short, teasing, never fully spelled out as an arithmetic expression.

The grid sits below the clue: a 4×4 block of square mint-blue cells, each holding a single digit (0–9, with repeats). The screenshot's grid reads:
```
1 6 2 8
9 0 1 7
7 2 5 0
2 5 6 3
```
A bright yellow **CHECK** button with a dashed border sits below the grid, dimmed until the student has selected at least one cell.

- **Tap a cell** → it highlights blue. Each subsequent tap *must* be on a cell *immediately right of* or *immediately below* the previous one — building a single horizontal or vertical run. A tap on a non-adjacent cell is rejected with a tiny shake.
- **Tap a highlighted cell again** → it deselects, shrinking the run from the end.
- **Press CHECK with the run forming the right number** → the cells flash green, the treasure-found bar ticks up to 1/4, the clue card swaps to the next clue, and the run clears. A bright collection chime plays.
- **Press CHECK with the wrong number** → cells flash red, the run clears, a heart shatters, the clue stays put, and a one-line hint appears: *"That made 962 — try halving 500 again."*
- **Run out of time** (clock hits 00:00) → the round ends, remaining treasures are revealed in soft outline so the student sees what they missed.

There's no number pad, no expression builder. The only act is *selecting cells*, which forces the student to *think the digits, not just the number*.

## Shape of the experience
4 treasures per round, 4 rounds total in a session. Difficulty drifts up:

- **Round 1 — Friendly arithmetic.** Clues like *"half of 100"*, *"twice 25"*, *"5 × 6"*. The numbers (50, 50, 30) are obvious; the work is in finding the digit run.
- **Round 2 — Two-step clues.** *"100 more than 350"*, *"half of one quarter of 800"*. Computation is harder; digit grid is the same difficulty.
- **Round 3 — Digit-property clues.** *"A 3-digit number whose digits add to 9 and end in 0"*. The student has to *enumerate* candidates (180, 270, 360, 450, 540, 630, 720, 810, 900) and find which one sits in the grid. This is the stretch.
- **Round 4 — Bigger numbers.** *"10% of 4500"*. *"The smallest 3-digit multiple of 7"*. The grid grows to 5×5.

3 lives carry across all 4 rounds.

## Win condition and stars
Stars are awarded **per round** based on treasures found and lives spent, then summed across rounds:

- **3 stars** for finding all 4 treasures in a round on the first attempt each.
- **2 stars** for finding all 4 with one wrong CHECK along the way.
- **1 star** for finding 2–3 treasures.
- **0 stars** for the round if the timer expires with fewer than 2 found.

A perfect run is 12 stars across 4 rounds, displayed as `X/10` capped at 10 (the back two rounds weight higher than the front two).

The session ends when **either** all 4 rounds are complete **or** all 3 lives are lost.

## Feel and motivation
- **The grid feels alive.** Tapped cells light up bright blue with a small click sound; building a run is physically satisfying. The constraint that runs must be straight (no diagonals, no L-shapes) keeps the controls predictable.
- **Clues are riddles, not equations.** Phrases like *"half of 500"* or *"digits add to nine"* invite a guess-and-check loop, which is exactly the loop the game wants. Pure equations would make the game a calculation drill; word clues make it a hunt.
- **Decoy digit runs are deliberate.** The grid always contains at least one *almost-right* run — e.g. for *"half of 500"* the grid might contain `2 5 1` (close to 251, off by 1). Students who skim instead of computing get caught here.
- **Replay shuffles everything.** Different clues, different grid, different treasure positions. The skill repeats; the answers don't.

## Why it works pedagogically
By Class 3–5, students know how to do small calculations and they know how to read digits, but they rarely link the two. *"What is half of 500?"* on a worksheet gets *"250"* and a tick, and the student moves on without ever holding *2, 5, 0* in their head. This game splits the act in two: first compute, then *spell*. That spelling step is the hidden lesson — it forces the student to think of numbers as sequences of digits, which is exactly the muscle they'll need for place-value, expanded form, and (later) algorithm-based arithmetic. A 4-round session takes about 8–10 minutes, perfect for a quick post-lunch wake-up activity that feels like a puzzle book and works like an arithmetic-fluency drill.
