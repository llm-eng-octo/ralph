# Hide Or Show — The Row-Sum Lights-Out Puzzle

## In one line
A tap-to-toggle grid puzzle where five rows of numbers each contain too much, and the student must black out exactly the right cells in each row so the visible numbers sum to 45.

## Who it's for
Class 4–5 students (ages ~9–11) who are fluent at adding two-digit numbers and have started to enjoy "search" problems — the kind where you scan a small space of options for the one that fits. The skill the game targets is **mental subtraction wearing a costume**: each row is really asking *"which subset of these five numbers sums to 45?"*, but framed as a hide-some-show-some game so the student's brain stays in additive mode.

## What it tries to teach
The whole game is about **finding a target sum inside a noisy collection** — a foundational skill for everything that comes later (algebraic thinking, factoring, partition reasoning).
Three threads:
- **Sum-then-subtract.** The fastest path to a row is to add all five numbers in the row, compare to 45, and decide what to remove. A row of `11 + 6 + ? + 14 + 17 = 48` (with one cell already hidden) tells you the visible cells already overshoot by 3, so you need to also hide a `3` — but there isn't one, so you have to hide something else and re-think. The student learns to use the *gap* as a search tool.
- **Combinatorial trim.** Sometimes you must hide two cells, sometimes none, sometimes the row's already at 45 and shouldn't be touched. The student learns to *try and revert*, building tolerance for non-linear search.
- **Independent rows.** The five rows do not interact — solving Row 1 doesn't constrain Row 2. This is deliberate: the student gets five fresh attempts at the same skill within one puzzle, and a row that gets stuck doesn't doom the whole game.

## What the player sees and does
A focused, almost meditative layout. At the top, a thin status row — round badge `Q1`, a friendly avatar, a big blue countdown timer in the centre (`00:26`), and the star tally `0/10` on the right.

Below the header, a two-line instruction in calm body text: *"The grid below shows numbers in each cell. Tap to hide or show the numbers such that the numbers in each row make a **sum of 45**."*

The puzzle itself is a 5×5 grid with row labels (`Row 1`, `Row 2`, ...) on the left, each labelled with a small pointing-hand emoji. Each cell holds a two-digit number on a clean white background, *or* a solid black square (the "hidden" state). The grid mixes both states from the start — so Row 1 might already have one cell pre-hidden, while Row 4 starts fully visible.

Tapping a numbered cell turns it black; tapping a black cell reveals its number again. There is no penalty for tapping — the entire game is "try and see".

A small running indicator next to each row would update as cells toggle, but the game deliberately *does not* show the current sum. The student must add mentally as they toggle. (A faint cue — the row label glowing green when its visible numbers sum to 45 — is the only confirmation.)

- **A row reaches 45** → the row label glows green; a soft chime plays; the row's cells lock briefly to confirm.
- **All five rows reach 45 simultaneously** → the whole grid pulses gold; a stars animation plays; the round resolves with full credit.
- **The timer runs out** before all five rows are at 45 → the puzzle freezes; rows that *are* at 45 stay green; the others reveal their solutions in a faded preview; partial credit is awarded.

## Shape of the experience
This is a single puzzle of 5 rows, but the difficulty is in the puzzle itself. A 5-puzzle progression across a session:

- **Puzzle 1 — Warm-up.** Rows where 4 of 5 cells are already in the right state; the student needs only one toggle per row.
- **Puzzles 2–3 — Standard.** Rows that need 2–3 toggles, but where the right answer is obvious if you add carefully.
- **Puzzle 4 — Twist.** A row that starts at exactly 45 — tapping anything would break it. The student has to learn restraint.
- **Puzzle 5 — Stretch.** Larger numbers (some cells hold values up to 50), so a single hide can change the sum by a lot, and the student has to plan rather than try.

## Win condition and stars
Each puzzle has a 60-second timer (longer than the 26 seconds shown in the screenshot, which is mid-game). Stars per puzzle:
- **3 stars** — all 5 rows at 45, with at least 30 seconds left on the clock.
- **2 stars** — all 5 rows at 45, but slower.
- **1 star** — at least 3 rows at 45 when time runs out.
- **0 stars** — fewer than 3 rows solved when time runs out.

There are no lives. Tapping a cell never ends the round; only the timer does. This is intentional — the puzzle rewards exploration, and a child who is mid-thought shouldn't be punished for an experimental tap.

## Feel and motivation
- **The black square is the protagonist.** Most grid puzzles use black to mean *empty*; here black means *I have decided to hide this*. The semantic flip is small but powerful — the student is *acting*, not *deficient*.
- **Mental addition lives in the body of the game.** The deliberate absence of a running sum forces the student to keep the row's total in their head while toggling. This is the practice the game smuggles in: not just the search, but the constant re-addition.
- **Each row is a tiny story.** A row that goes `11 + 6 + ⬛ + 14 + 17 = 48` hides a 3-overshoot; a row that goes `10 + ⬛ + 15 + 40 + 15` is way over and needs the 40 hidden. The student starts to see rows as creatures with personalities — some greedy, some exact, some empty.

## Why it works pedagogically
This puzzle is, underneath the costume, a partition-of-45 problem run five times in parallel — and partition-of-N is one of the most under-trained skills in primary school arithmetic. Students at this age are taught addition as `a + b = ?` (forward) and rarely as `? + ? = N` (backward), even though the backward direction is what almost every later math topic — factoring, equation solving, fraction simplification — depends on. Hiding cells is a perfect interface for backward addition because it makes the search visible, reversible, and physically rewarding (the satisfying tap, the dramatic black square). A 5-row puzzle takes 60–90 seconds; a 5-puzzle session takes ~6 minutes and gives the student 25 partition problems disguised as a clever little game.
