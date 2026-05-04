# Cross-Factor Crossword — The HCF Detective Puzzle

## In one line
A pencil-puzzle-flavoured drag-and-drop game where the student fills a tiny cross-shaped grid with numbers from a pool, making sure every empty box contains a *factor* of its neighbours and the special teal box contains the *highest common factor* of the numbers around it.

## Who it's for
Class 5–6 students (ages ~10–12) who can list the factors of a number when asked but haven't internalised that *finding common factors* and *finding HCF* are the same hunt at different depths. The game is for students who can answer *"what are the factors of 12?"* without trouble but stumble when asked *"what's the largest number that divides both 12 and 18?"* — the moment they have to hold two factor lists in their head at the same time.

## What it tries to teach
The whole game is built around a single move: **finding the common factors of a small set of numbers, then picking the *largest* one**.
Three threads inside that:
- **Factor recall under constraint.** *Pick a factor of 9 AND a factor of 12* is harder than each one separately. The student learns to list mentally and intersect — the pool only has four candidates, so brute force works, but the student who *intersects in their head* is a step ahead.
- **HCF as the biggest survivor.** The teal box rule (*"must be the HCF of its neighbours"*) is the puzzle's keystone. Students who try to drop *any* common factor there will fail; only the *highest* fits. This makes HCF a tactile decision rather than a memorised definition.
- **Constraint propagation.** Solving the puzzle isn't four independent factor lookups — placing a number in one box constrains what can go in the next. Students learn to start with the most-constrained box (usually the teal HCF cell) and let it cascade.

## What the player sees and does
A clean white panel. The header carries the standard frame — `Q1` avatar, heart counter showing 2 lives, `0/10` star tally with a yellow star.

Below the header, four lines of friendly instruction sit on top:
*"Solve the below cross-factor.*
*Remember that in cross-factor:*
*• The number in an empty box must be a factor of its neighbouring numbers.*
*• The teal-coloured empty box must be the HCF of its neighbouring numbers."*

The puzzle itself is a small irregular cross — about six cells arranged in a plus-with-a-tail shape. Three cells are pre-filled in soft mint-green (`9`, `12`, and a free-standing `8`). One cell, sitting at the heart of the cross, is filled solid teal-green and **empty** — that's the HCF target. Two more white cells are empty drop targets.

Below the grid, a horizontal pool sits on a soft grey shelf with four small white tiles, each holding a candidate number — `3`, `6`, `5`, `2` in the screenshot.

- **Drag a tile from the pool, drop it into an empty white box** → the tile snaps in. If it's a factor of every adjacent filled cell, the cell pulses a soft green; otherwise it stays neutral until the puzzle is checked.
- **Drag a tile into the teal box** → the tile snaps in, and the box checks whether the dropped number is a *common factor* of its neighbours **and** the *largest* such number among the pool. A non-HCF common factor (e.g. `1` when `3` is also available) gets a gentle nudge: *"That divides both — but is there a bigger one in the pool?"*
- **Drop the wrong tile in any cell** → the tile bounces back to the pool, the cell flashes amber, no life is lost, and a one-line hint appears: *"`5` doesn't divide `12`. Try a smaller factor."*
- **Submit a complete board with all rules satisfied** → the whole grid blooms green, a chime plays, the round resolves. A *second* wrong submit costs a life.

The pool tiles can be re-dragged at any time — placement is reversible. The teal box's special rule is highlighted by its colour, not by extra UI.

## Shape of the experience
A single round of careful play, typically 2–4 minutes. The puzzle has three internal phases:

- **Phase 1 — Scan the pool, scan the grid.** The student looks at the pre-filled neighbours (9, 12, 8) and the candidates (3, 6, 5, 2). One candidate (`5`) is a decoy — it doesn't divide any of the neighbours. Spotting that early simplifies everything.
- **Phase 2 — Lock the HCF.** The teal box is sandwiched between `9` and `12`. The common factors of 9 and 12 are 1 and 3 — only `3` is in the pool. So `3` goes in the teal box.
- **Phase 3 — Fill the white cells.** With `3` placed, the remaining cells inherit looser rules — *factor of neighbours* — and the student tries `2` and `6` against the remaining empties (one neighbours `12`, the other neighbours `8`).

Replay loads a fresh grid layout — different shape, different anchor numbers, different pool — so the *strategy* (HCF-first, rule out the decoy) repeats but the answer doesn't.

## Win condition and stars
Two lives, one round of substantial depth.

- **3 stars** — submit a fully correct grid on the first try, with both lives intact and within 90 seconds.
- **2 stars** — submit correctly with both lives intact but slower than 90 seconds.
- **1 star** — submit correctly after losing one life.
- **0 stars** — both lives lost before the grid is correct.

Wrong individual drops (which bounce back without penalty) are free; only a wrong *full submit* costs a life. This nudges the student to verify mentally before calling it done.

## Feel and motivation
- **The grid looks like a crossword.** The irregular cross shape, the dashed cell borders, the soft mint pre-fills — they all evoke a Friday newspaper puzzle, not a worksheet. That framing matters: students *want* to solve a puzzle far more than they want to *do a question*.
- **The teal cell is a character.** Its single distinct colour is teaching the rule visually — *this one is special, treat it differently*. By round three of replay, students reflexively look at the teal cell first, which is exactly the strategic instinct the game is teaching.
- **Decoys teach by exclusion.** The pool always contains one number that's *not* a factor of anything in the grid. Recognising and ignoring that decoy is a small applied skill in factor-listing under pressure.
- **Numbers stay friendly.** The pre-filled numbers are always under 30 and always have rich factor structure (12, 18, 24, 30 — never primes like 17). The puzzle is about reasoning, not arithmetic acrobatics.

## Why it works pedagogically
HCF is one of those topics where students learn the algorithm (list both, find the biggest match) and pass tests on it without ever using it for anything. Cross-factors flip that — the *answer* is HCF, but the *path* is constraint puzzle. The student arrives at HCF as the only number that fits, not as a recital. That experience — *"the highest common factor was forced by the puzzle"* — sticks far better than ten worked examples on the board, and it transfers immediately to LCM, prime factorisation, and (later) algebraic GCD problems. A single puzzle takes 2–4 minutes; ten puzzles in a sitting takes about half an hour and is enough to shift HCF from rote definition to working tool. It also doubles as a great printable for non-screen practice.
