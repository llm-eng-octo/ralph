# Place It Where It Hurts Least — The Drag-To-Minimise Cross Grid

## In one line
A drag-and-drop place-value puzzle where movable white tiles and locked grey tiles share a cross-shaped grid forming three 4-digit numbers, and the student must drag the loose digits into seats that make the total sum as small as it can be.

## Who it's for
Class 4–5 students (ages ~9–11) who know that the `4` in `4,253` is "four thousand" but who have never had to *exploit* that knowledge under a real constraint. The game is for the student who can read place values fluently but does not yet *feel* place values as different-sized levers. They're the same students who, asked to make the smallest 4-digit number from `4, 1, 7, 2`, sometimes write `1247` and sometimes write `1742` because they're guessing rather than reasoning.

## What it tries to teach
The whole game is built around one big idea: **a digit's worth depends on its seat — and some seats are bolted down.**
Three threads:
- **High seats cost more.** Putting a `9` in the thousands place adds 9,000; in the units, only 9. To minimise, push small digits to the high seats, big digits to the low seats. This is the rule the game drills.
- **Locked digits constrain the search.** Some grey tiles are pre-placed and cannot be moved. A locked `9` in a thousands place is an unavoidable cost; a locked `1` in a thousands place is a gift. The student must read what the puzzle has *given* them before deciding where to put what they *can* move.
- **Shared cells double up.** The horizontal row passes *through* the two vertical columns, so the cells at the intersections belong to two numbers at once. A small digit in a shared cell saves twice as much; a big digit there costs twice as much. Recognising the shared cells is the difference between a 2-star solution and a 3-star one.

## What the player sees and does
A clean white panel with most of the screen given over to the puzzle.

At the top, the standard status row — round badge `Q1`, a friendly avatar, a heart icon with the lives count `2`, and the star tally `0/10` on the right.

Below the header, a calm two-line instruction: *"Rearrange the digits in the grid in such a way that the **sum** of numbers 1, 2 and 3 is **minimum**."* A second softer line follows: *"Digits in grey are fixed and cannot be moved!"*

The puzzle itself is an irregular grid. Two vertical columns of four cells each (`Number 1` on the left, `Number 2` on the right, both labelled with tiny pointing-hand emoji above their top cell) and one horizontal row of four cells (`Number 3`, labelled to its left). The vertical columns and the horizontal row intersect at two cells, which are shared. Each cell holds a single digit on a white card with a soft border — *or* a grey card with a darker tile background, marking it as locked. Movable cards (white) have a subtle drag-handle feel; locked cards (grey) sit flat and refuse to lift.

Below the puzzle, a tiny live-sum display shows the current total of the three numbers: `Sum: 5,876`. It updates every time a tile lands in a new seat.

- **Drag a movable tile** → it lifts with a small shadow, follows the finger or pointer.
- **Drop on another movable tile** → the two digits swap places. The live sum updates.
- **Drop on a locked tile** → the dragged tile bounces back to its origin with a soft *thud*. No penalty.
- **Drop in empty space** → the tile snaps back to where it started.
- **Reach the optimal sum** → the live-sum display glows green, the three number labels light up, and a soft chime plays. The student can then submit (or keep tweaking — a swap that makes the sum bigger again will just turn the indicator off).
- **Submit a non-optimal answer** → a heart deflates, the optimal arrangement is briefly shown in green, and the round ends.

## Shape of the experience
10 puzzles in three escalation phases:

- **Puzzles 1–3 — No locked tiles, no shared cells.** Three independent 3-digit columns, all digits movable. The student internalises the rule: small up high, big down low.
- **Puzzles 4–7 — One or two locked tiles.** A grey `9` already sitting in a units cell (a gift) or a grey `7` already sitting in a thousands cell (a cost). The student must read the existing arrangement and adjust.
- **Puzzles 8–10 — Full layout with shared cells.** The screenshot's pattern: two vertical 4-digit numbers crossed by one horizontal 4-digit number, two shared cells, mixed locked and movable digits. The full strategic puzzle.

## Win condition and stars
A run is 10 puzzles with 3 lives across the run. Each puzzle has a generous timer (90 seconds) — long enough to think but short enough to discourage random shuffling.
- **3 stars** — exactly the optimal minimum sum.
- **2 stars** — within 1% of the optimal (typically off by tens, not hundreds).
- **1 star** — within 5% of the optimal.
- **0 stars** — worse than 5%, or the timer ran out before any successful drag.

A heart is lost only on a 0-star puzzle. So a student who gets close every time can complete the run on 1 star per puzzle without burning lives.

## Feel and motivation
- **Drag feels deliberate, not flicky.** Tiles lift with a small shadow and a brief delay, so accidental drags don't happen. The student commits to the move with the lift, not just the drop.
- **The locked grey tiles are characters.** They are the puzzle's "you must live with this" — a locked `9` at the top of a column is a wall to plan around. Students start to read them with personality: *"this puzzle is rude to me; the `9` is locked up high"*.
- **The live sum is honest.** It is *always* visible and updates instantly. There is no hidden state. This honesty is what makes the game playable as a search problem — every move is immediately reviewable, and reverting a bad swap is a normal part of the experience.

## Why it works pedagogically
This game gives students the missing experiential half of place value. Schools teach place value as *naming* (the `5` in `526` is "five hundred"), but rarely as *acting* (move the `5` to a different position and the number changes by 495). By forcing the student to optimise across multiple constrained numbers, the game makes place value *strategic* — and that strategic feel is what carries forward into pre-algebra (where coefficients matter), into rounding (where high places dominate), and into estimation (where ignoring units is sometimes safe but ignoring tens is not). Drag-and-drop is the right interface here because the physical move *is* the learning — the student feels the cost of placing a `9` up high before they read the new sum. A 10-puzzle session takes 12–15 minutes; the optimisation feels game-like and replayable, and most students will run a second session immediately.
