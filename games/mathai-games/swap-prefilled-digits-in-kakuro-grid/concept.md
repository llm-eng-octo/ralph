# Bindu's Cross-Number — The Digit-Swap Optimisation Puzzle

## In one line
A pencil-puzzle game where Bindu has *almost* solved a cross-shaped number puzzle but her digits are in the wrong cells, and the student drags-and-drops digits between cells to satisfy a tricky condition like *"the difference between Number 2 and Number 1 should be the smallest possible 3-digit number"*.

## Who it's for
Class 4–6 students (ages ~9–12) who have met place value, can do multi-digit subtraction on paper, but have never been asked to *design* numbers to optimise a result. The game is for the student who can compute *4621 − 312 = 4309* but has never thought *"hmm, if I rearranged those digits differently, would the answer be smaller?"* — the leap from computing to controlling.

## What it tries to teach
The whole game is built around a single sophisticated move: **placing digits in number positions to control the size of an arithmetic result**.
Three threads inside that:
- **Place value as a lever.** A `9` in the thousands column adds 9000; the same `9` in the ones column adds 9. Students who grew up reading numbers from left to right rarely *use* this asymmetry — this game forces them to.
- **Designing a minuend / subtrahend pair.** To minimise *Number 2 − Number 1* and still get a 3-digit answer, you want Number 2 just barely larger than Number 1. That's a real strategy: minimise the difference in the high-place digits, maximise the gap in the low-place digits — exactly the inverse of "make a big number" intuition.
- **Reading a condition carefully.** *"The difference should be a 3-digit number AND it should be minimum"* — students often grab the first part (3-digit) and forget the second (minimum), or vice versa. The game punishes a 2-digit answer (too small) just as harshly as a 4-digit one (too big). Multi-clause conditions are themselves a literacy skill.

## What the player sees and does
A clean panel. The header is the usual frame — `Q1` avatar, heart counter showing 2 lives, `0/10` star tally.

The instruction text leads with character: *"Bindu was asked to solve a cross number that satisfies this 👇🏽 condition."* Then the **Condition** in bolder text: *"The difference between number 2 and number 1 should be a 3-digit number and it should be minimum."* And the call to action: *"Check Bindu's solution and correct all her mistakes by rearranging the digits in the cross-number."*

The puzzle itself is a **plus-shaped grid** — one vertical 3-cell column intersecting a horizontal 4-cell row. Tiny labels in friendly handwriting font sit beside the grid: *Number 1* points down at the vertical column, and *Number 2* points right at the horizontal row. Each cell holds a single digit on a soft white tile with a dashed border. In the screenshot, Bindu's starting attempt reads:
- Number 1 (top to bottom): `3, 2, 7` → 327
- Number 2 (left to right): `1, 6, 2, 1` → 1621
- The shared cell is the second cell of Number 1 and the third cell of Number 2 (`2`).

So Bindu's current answer is *1621 − 327 = 1294* — **a 4-digit difference, which violates the rule**. The student's job: rearrange the existing digits (no new digits enter; nothing leaves) so the difference becomes a 3-digit number, and among all valid arrangements, the *smallest* one.

- **Drag a digit from one cell, drop it onto another cell** → the two digits swap places. (Cells are never empty; this is permutation, not insertion.)
- **The shared-intersection cell is sacred** — its digit must agree with both numbers. The grid enforces this automatically by treating swap into the intersection cell as a constraint.
- **Submit the puzzle (a small CHECK button appears once the layout has been touched)** → the game evaluates the difference. If it's a 3-digit number AND there is no smaller 3-digit difference reachable from the same digit set, the cells bloom green and a chime plays. If it's a *valid* 3-digit difference but not the *smallest*, the cells turn amber with a hint: *"Good — this difference is 138. Can you make it smaller?"* No life lost. If it's a 4-digit or 2-digit answer, a heart shatters and the puzzle resets to Bindu's starting layout.

## Shape of the experience
A single deep round, typically 4–6 minutes. The student moves through three implicit phases:

- **Phase 1 — Try a swap or two.** Most students start by intuition — pull a small digit into the front of Number 1, a small digit into the front of Number 2. They quickly discover the shared cell pins one digit in two places, which makes free swapping feel constrained.
- **Phase 2 — Narrow the gap deliberately.** The student notices that to minimise *Number 2 − Number 1*, the leading digits of Number 2 should be just larger than Number 1's. They start manipulating leading digits.
- **Phase 3 — Squeeze the last difference.** Once they've reached a 3-digit answer, they hunt for swaps within the trailing digits to shrink it further. *138 → 117 → 108 → 99 (oh wait, that's 2-digit, back off).* This is real optimisation thinking.

A small "best-known answer for these digits" hint can be unlocked as a 1-star hint after 90 seconds of inactivity.

## Win condition and stars
Two lives, one round.

- **3 stars** — submit the optimal (smallest 3-digit) difference on the first valid submission, both lives intact.
- **2 stars** — submit a valid 3-digit difference that's correct but *not* the smallest, then refine to optimal on the next submit.
- **1 star** — eventually reach the optimal, but with one heart lost along the way.
- **0 stars** — both hearts lost, or abandoned.

The "valid but not optimal" middle tier is intentional — it tells the student *"you've understood the constraint, now optimise"* without ending the run.

## Feel and motivation
- **The grid feels handmade.** Cells with dashed borders and two small handwritten labels (*Number 1*, *Number 2*) make the puzzle look like a maths-class doodle, not a worksheet. The "Bindu" framing makes it a *correction* task, which lowers the stakes — the student isn't *failing*, they're *helping*.
- **Swap, don't replace.** The pure-permutation rule (no digit added, no digit removed) is what makes the puzzle elegant. The student is reorganising fixed material — like a Rubik's cube of digits.
- **Tight constraints, big space.** Six cells with six digits feels small, but `6! / 1` (because of the shared cell) is several hundred legal arrangements — the student feels the search.
- **The optimisation message is gentle.** When the student hits a valid-but-not-optimal answer, the game *celebrates* the validity and *invites* the optimisation. No red, no heart loss — just *"can you do better?"*

## Why it works pedagogically
This is a place-value puzzle masquerading as a logic challenge, and that's the secret of why it works. Place value is taught with diagrams (*ones, tens, hundreds, thousands*) and tested with expansion exercises (*write 4567 as 4000 + 500 + 60 + 7*) — both fine, both forgettable. Asking the student to *use* place value as a tool — *"if I move the 9 from ones to thousands, how much bigger does my number get?"* — turns the concept from a definition into a strategy. That switch is the leap from arithmetic to early algebraic thinking, and it's the leap most students never make in standard worksheets. A single puzzle takes 4–6 minutes; running through a series of ten with different conditions (smallest difference, largest sum, closest to a target, biggest product) builds genuine number sense over a few sittings.
