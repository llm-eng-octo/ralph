# Color Sudoku — The 3x3 Tapping Logic Puzzle

## In one line
A miniature sudoku built from three colours instead of digits — the student taps each empty square to cycle through pink, purple, and blue until every row holds one of each, training the *one-of-each-per-line* logic that real sudoku is built on.

## Who it's for
Class 1–3 students (ages ~6–8) who are too young for digit sudoku but old enough to spot a missing colour in a row. The game is for kids who haven't yet met formal logic puzzles and need the cognitive scaffolding of *colours you can see* rather than *numbers you have to hold in your head*. It's also a gentle introduction to *constraint reasoning* — the idea that a solution has to satisfy multiple simultaneous rules.

## What it tries to teach
The whole game is built around one big, transferable skill: **filling cells in a grid so that every row obeys a one-of-each constraint** — the foundational move of sudoku and many other logic games.
Three threads inside that:
- **Spotting what's missing.** Given a row with one pink and one purple already filled, the missing cell *has* to be blue. The student learns to scan a row for what's *absent* rather than guess.
- **Cycle-tap as commitment-light input.** Each tap on a white square cycles the colour: blue → pink → purple → back to blue. The student can change their mind without erasing — taps are cheap, so experimentation is encouraged.
- **Multiple constraints at once.** Although the rules only mention rows, the way pre-filled cells are chosen means the student often has to also *not break* what's already there. They learn that valid moves are constrained by neighbours.

## What the player sees and does
A clean white panel. At the very top, the usual thin status row — round badge on the left, hearts and star tally on the right. Below that, three short instruction lines: *"Solve this sudoku. Each row should have 1 blue, 1 pink and 1 purple block. Tap on the white blocks to change it to blue, tap again to change it to pink and tap again to change it to purple."*

The body of the screen is the puzzle: a 3x3 grid of soft pastel squares with row labels (`Row 1 👉`, `Row 2 👉`, `Row 3 👉`) sitting to the left of each row. Some squares are pre-filled in pink, purple, or light blue. Empty cells show a dashed outline against white — these are the tappable ones. The colours are gentle and friendly: cotton-candy pink, soft lavender purple, pale sky blue.

- **Tap a white cell** → it becomes blue. Tap again → pink. Tap again → purple. Tap again → blue, and so on.
- **Complete a row correctly (one of each colour)** → the row gets a quick green pulse and the row label turns into a tick.
- **Complete the grid (all three rows correct)** → a soft chime, a confetti burst, the round resolves.
- **Walk away from a row that's wrong** → no penalty until the student tries to advance. The game waits.
- **Try to advance with a row still broken** → the broken row pulses red briefly, a heart shatters, and the round either continues (if hearts remain) or resets.

## Shape of the experience
10 rounds, increasing in puzzle complexity:

- **Rounds 1–3 — One missing per row.** Each row has two cells filled, so the student fills exactly three cells across the whole grid. Pure *spot the missing colour* practice.
- **Rounds 4–7 — Two missing per row, but locked first cell.** Each row starts with one pre-filled cell. The student must fill the other two — and which colour comes first now matters because of column-style constraints (some rounds start enforcing "no repeated colour in a column" too, with the column rule made visible by a tinted column header).
- **Rounds 8–10 — All three cells empty in some rows.** The grid arrives almost blank. The student has to reason from very few clues, working out one row at a time and using filled rows to pin down the next.

## Win condition and stars
Three lives across the whole session.
- **3 stars** — solve all 10 puzzles with no row-break errors (no hearts lost).
- **2 stars** — solve all 10 puzzles, losing one heart total.
- **1 star** — solve all 10 puzzles, losing two hearts total.
- **0 stars** — all three hearts lost before round 10.

The lives system is gentle on purpose: cycling through colours is supposed to feel like *trying things*, so penalising every wrong tap would freeze the student. The hearts only fire when the student commits to an *advance* with a broken row.

## Feel and motivation
- **No numbers anywhere.** The whole game is colour. This is deliberate — sudoku is a *logic* puzzle dressed up as an arithmetic puzzle, and at this age the dressing-up confuses students. Stripping it back to colours reveals the logic underneath.
- **Tapping feels playful.** The cycle is fast and satisfying — pink-purple-blue, pink-purple-blue. Children often tap a cell several times just to enjoy the colour shifts before settling on the right one.
- **Row labels point.** The little 👉 emoji next to each row label is doing real work — it pulls the student's eye along the row and reminds them *this is the unit you're solving for*.

## Why it works pedagogically
Logical-deduction skills are notoriously hard to teach by lecture — they have to be *practised*. But traditional sudoku is intimidating for beginners: the symbol set (1–9), the grid size (9x9), and the multiple constraint types (row, column, box) all combine to bury the core skill under cognitive load. This game strips sudoku back to its skeleton: 3 colours, a 3x3 grid, one constraint at a time. After 10 rounds, the student has internalised the rhythm — *look at the row, see what's missing, place it* — that they can later port to digit sudoku, KenKen, and the constraint-satisfaction problems that haunt secondary-school maths.

A 10-round session takes 5–8 minutes — short enough to fit into a transition between activities, long enough to feel like a real puzzle session.
