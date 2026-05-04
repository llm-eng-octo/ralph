# Pirate's Path — The Friendly-Pairs Treasure Hunt

## In one line
A grid path-finding game where the student traces a route from a green `Start Here` cell to a treasure island, picking only *connected* cells whose coin values add up to exactly the target — turning addition into a small navigational adventure.

## Who it's for
Class 2–3 students (ages ~7–9) who can add small numbers but haven't yet developed the *running-total* habit — the constant background skill of mentally tracking "how much have I added so far, and how much more do I need?" The game is for the moment a child stops adding numbers in isolated pairs and starts holding a sum live in their head while comparing it to a target.

## What it tries to teach
The whole game is built around one habit: **planning a sequence of additions to land exactly on a target sum.**
Three threads inside that:
- **Friendly-pair recognition.** Most paths in the puzzle reward the student for spotting `10 + 10`, `20 + 20`, or `40 + 40` chunks — the kinds of mental-addition pairs that produce round numbers and make tracking easy. Other paths *don't* land on round intermediates, and those are the paths that overshoot or undershoot. The student learns to favour clean intermediate sums.
- **Running totals under spatial constraint.** Unlike a column of numbers on paper, the cells in this grid are connected by adjacency — each step must move one cell up, down, left, or right from the previous. This means the student can't choose values freely; they must choose a *route*. So the running-total habit is paired with a navigation constraint, which is a richer cognitive load than pure arithmetic.
- **Backward planning.** The expert move is to start by looking at the target (80) and the obvious starting cells (top-left `Start Here`, going via cells of `10` and `20`) and ask *"how many of each do I need? Four 20s, or two 20s and four 10s, or…"* before committing to a path. The reset button explicitly invites this — it's not a punishment, it's a *thinking aid*.

## What the player sees and does
A clean, sparse panel. The status row at the top has the round badge `Q1`, a heart icon with `2`, and a progress chip `0/10`.

Below the status row, an opening line of story sets the scene: *"A pirate wants to get to another island collecting a total of 80 coins on his path. Each cell has the number of coins written. Tap on the cells to make a path and help the pirate reach the island while collecting 80 coins on his way."* The text is warm and slightly playful — there's a child-sized pirate fantasy here, not a formal math problem.

The body of the screen is a 5×5 grid of cells, surrounded by a soft border:

- **Top-left cell** — a green oval bearing the words *"Start Here"* with a yellow arrow nudging the eye toward it. This is the only allowed entry point.
- **Bottom-row cell** — a small palm-tree-and-island illustration. This is the destination.
- **Most other cells** — white squares with `10` or `20` printed in them, each representing a friendly-numbered "coin pile."
- **Black cells, scattered through the grid** — impassable obstacles. The pirate cannot step on a black cell; valid paths must route around them.

A **Reset** button sits below the grid in the centre, with a soft circular-arrow icon in front of it.

The student plays by tapping cells in adjacency order:

- **Tap an adjacent passable cell** → the cell highlights with a soft yellow glow and joins the path; a faint line connects it to the previous cell; the running total updates (rendered subtly above or below the grid).
- **Tap the same cell twice or step backwards** → the path retracts to that cell, undoing later steps. This makes mid-route correction free.
- **Tap a non-adjacent cell or a black cell** → nothing happens; a one-line nudge appears: *"You can only step on neighbour cells, not jump."*
- **Reach the island cell with a running total of exactly 80** → the path glows gold, a chord sound plays, the round resolves.
- **Reach the island cell with a running total above or below 80** → the cell shakes briefly and the path stays where it is; the student can keep extending or use *Reset* to start over.
- **Tap Reset** → the entire path clears, free of penalty.

## Shape of the experience
10 rounds, each on a freshly-laid-out 5×5 grid:

- **Rounds 1–3 — Generous geometry.** The target sum is small (50–60), the obstacles are few, and there are at least three valid paths. The student gets used to the tap-to-extend, tap-back-to-undo mechanics.
- **Rounds 4–7 — Tighter routes.** Targets of 70–80, more black cells, and the obstacles are placed to force a single corridor through the middle. The student must route around blocks while watching the running total.
- **Rounds 8–10 — Trap paths.** The shortest path from start to island gives a sum that's *off by exactly one cell value* — for example, summing to 90 when the target is 80. The student must take a slightly *longer* route through smaller cells to land exactly on 80. Students who tap the obvious shortest path will overshoot and learn the most useful lesson the game offers: shortest is not always correct.

## Win condition and stars
Three lives across the run. A life is lost on a wrong submit (reaching the island with a non-target sum); using *Reset* costs nothing. Stars are based on **rounds resolved on the first reach-island submit**:
- **3 stars** — at least 8 of 10 first-submit correct.
- **2 stars** — 5–7 first-submit correct.
- **1 star** — completed all 10 rounds with at least 1 life remaining.
- **0 stars** — all hearts lost before round 10.

There is no clock. The puzzle is meant to be sat with, not raced.

## Feel and motivation
- **Tapping feels like footsteps.** Each cell join is accompanied by a subtle *tap* sound, like a foot landing on stone, with a small visual ripple. The path itself is rendered as a glowing trail, so the route the student has built is always visible.
- **The pirate is a child's pirate.** The illustration on the destination cell is friendly and uncluttered — a simple palm tree and an island shape. There is no narrative beyond "go from here to there," but the framing makes the addition feel like an adventure rather than a worksheet.
- **Decoys hide in the grid.** Designers tune the grid so that the *visually most direct* path almost always overshoots the target by exactly one cell-value, while the *correct* path requires either backtracking or a slight detour. This reinforces the lesson that adjacency choices matter and that sometimes adding more steps with smaller cells produces a better fit than fewer steps with bigger cells.

## Why it works pedagogically
The bridge from *adding two numbers* to *adding a list of numbers in a sequence with a target* is one of the most under-taught moves in early arithmetic. Children at this age can add 10 + 20 instantly, but ask them to plan a sum of 80 from a buffet of 10s and 20s and they often freeze, because they have never been asked to *plan* with addition; they've only been asked to *compute*. By pairing addition with a spatial path-finding constraint, this game forces the student to keep a running total alive in working memory while the rest of their attention is on which cell to step to next — which is exactly the cognitive load profile of real-world arithmetic, from money management to recipe scaling. The fantasy framing keeps the math feeling low-stakes; the friendly numbers (10s and 20s, not 13s and 27s) keep the arithmetic clean so that the *planning* is the hard part. A 10-round session takes about 8–12 minutes, and is best run as a two- or three-day rotation while the class is working on chapter-level addition strategies.
