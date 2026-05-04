# Fill The Gaps — The Vertical-Addition Detective

## In one line
A column-addition puzzle where four digits have been knocked out of a partly-filled sum, and the student drags them back into place by reasoning column by column from the ones up — the way a fluent adder actually thinks.

## Who it's for
Class 2–3 students (ages ~7–9) who have learnt vertical addition with carrying but are still mechanical about it — they can compute `568 + 258` if you write it out for them, but they panic the moment a digit goes missing. The game is for the in-between phase where addition *procedure* is solid but addition *structure* — knowing that the ones column constrains the ones, that a carry comes from the column to the right, that the answer's hundreds digit can be predicted from the addends' hundreds digits — has not yet clicked. It's also a quiet first taste of algebraic thinking: "what number, if I put it here, would make this true?"

## What it tries to teach
The whole game lives around one big skill: **reading a vertical addition problem as a set of constrained columns, not a left-to-right sentence**.
Three threads inside that:
- **Column-by-column reasoning.** The ones column has only the ones digits and a possible carry-out. The student learns to attack the ones column first, find the missing ones digit (and the carry it produces), and only then move to the tens. This breaks a 4-digit addition into four small 1-digit problems.
- **Carry as a constraint, not a chore.** Most kids treat carrying as a thing you *do*. This game lets the student see carries as *information* — if the visible result digit is `9` and the visible addend digit is `2`, the missing addend's ones digit must be `7` (no carry) or `17` is impossible, so a carry of `1` must already be coming in. Wrestling with that backwards constraint is the leverage point.
- **Self-checking by re-adding.** Once all four blanks are filled, the student can quickly re-add the two complete numbers in their head and see the result line agree. The game encourages this with a small "check" beat before locking the round in — a habit students can carry into pencil-and-paper work.

## What the player sees and does
A clean white panel. At the top, a thin status row: a small Q1 badge with the teacher's avatar on the left, and on the right a heart icon with a number (lives) and an `0/10` star tally next to a soft yellow star.

Below the instruction text — *"Some digits are missing in the equation, can you figure them out? Look at the signs and **drop in the right digits**!"* — the screen shows a vertical addition laid out in fat, friendly digits. The first addend reads `5 ☐ 6 0`, the second reads `+ 2 5 ☐ 8`, a horizontal line sits underneath, and the result reads `☐ 9 9 ☐`. Empty boxes glow faintly to mark the four blanks. Below the equation, a 4×3 number-pad of digit tiles (`0` through `9`) waits as the source pool. Digits stay in the pool — dragging them creates a *copy*, so the same digit can be used twice if needed.

- **Drop the right digit into a blank** → the box snaps shut around it with a *click*, the digit settles in black, and a small green tick winks at the column edge.
- **Drop the wrong digit into a blank** → the box flashes red, the digit bounces back to the pool, and a one-line column-specific hint slides in: *"Look at the ones column — what plus 8 ends in 9?"* No life lost, no drama.
- **Drop a digit on the wrong blank (right digit, wrong column)** → the blank shakes once and refuses; the digit returns to the pool. The hint says *"That digit might fit somewhere else — try a different column."*

When all four blanks hold the right digits, the equation re-renders in solid black, a soft *cha-ching* plays, the row total animates left-to-right one carry at a time as a quick sanity replay, and the round resolves.

## Shape of the experience
10 rounds, gradually opening the structure:

- **Rounds 1–3 — One blank per column, no carry.** Single missing digit per column, no carrying, totals under 100. The student learns the column-isolation move.
- **Rounds 4–6 — Two blanks, one carry.** Three-digit addends, one carry somewhere in the middle. The student starts using the carry as a clue rather than a chore.
- **Rounds 7–9 — Four blanks, multi-carry.** The sample shown (`5 ☐ 6 0 + 2 5 ☐ 8 = ☐ 9 9 ☐`) is this stage — four blanks spread across both addends and the result, with carries chaining across columns.
- **Round 10 — The stretch.** A 4-digit blank in the result's leading position too, so the student has to predict whether the sum overflows into a new place.

## Win condition and stars
Three lives, one star tier per round, summed across the run:

- **3 stars per round** — first-tap-correct on every blank (no wrong drops).
- **2 stars per round** — at most one wrong drop.
- **1 star per round** — finished, but with two or more wrong drops.
- **0 stars** — round skipped or game over.

Lives are spent only on truly nonsensical drops (a digit that violates the column even after a hint) — three such drops across the whole run end the game with the current star tally locked in. The cap of 30 stars means a clean run is visible and brag-worthy; the lives logic means a careless child can still finish but won't max out.

## Feel and motivation
- **Numbers are small and friendly.** Three-digit addends, totals under 1500, no awkward digits like 7s next to 8s where mental arithmetic gets noisy. The point is structural reasoning, not computational grit.
- **Hints are column-specific.** Every wrong-drop hint names the column the student went wrong in (*"ones"*, *"tens"*, *"hundreds"*) so the vocabulary of place value gets repeated naturally.
- **Re-add replay.** The brief left-to-right animation after a correct round is deliberately slow — it shows the carries lighting up one at a time. Kids notice this and start anticipating the carries themselves on later rounds, which is exactly the habit being built.

## Why it works pedagogically
Standard addition worksheets show the student a complete problem and ask for the answer; this game shows a near-complete problem and asks for the *parts*, which is a much harder and more useful task. To fill a blank, the student has to think about the column constraint, the carry, and the relationship between addends and result — the whole structure of place-value addition in one micro-decision. Doing this ten times in five minutes hammers the structural intuition far faster than ten more standard sums would, and it transfers directly to the much harder skill of checking and debugging one's own arithmetic — the difference between a student who notices their own carry mistake and one who doesn't.
