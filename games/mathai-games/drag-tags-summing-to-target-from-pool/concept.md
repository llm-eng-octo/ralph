# Make the Total — The Pattern-and-Sum Puzzle

## In one line
A pattern-spotting and addition game where the student studies three little circle puzzles, works out the missing number from the pattern, then drags as many number tags as they need from a pool into a single drop zone — so that the tags they choose *add up* to the number they figured out.

## Who it's for
Class 4–6 students (ages ~9–12) who are comfortable with two-digit addition but who treat *finding a sum* as a one-step task: pick a number, type it, done. The game is for the student who has never had to *build* a target from parts, and who needs to discover that there are usually many ways to make a number — that *81 = 50 + 20 + 8 + 4 − 1* is a different but equally valid path to *81 = 40 + 40 + 1*. It's also for the student who can do the addition but freezes on pattern problems where they have to *find* the target before adding to it.

## What it tries to teach
The whole game is built around two skills bolted together: **see the pattern, then build the answer.**
Three threads inside that:
- **Pattern recognition.** The three circle diagrams all share the same hidden rule — usually *blue + purple = green* (the two top sectors sum to the bottom). The student must scan two worked examples to spot the rule before the third diagram (the one with the question mark) means anything.
- **Composing a sum from a pool.** Once the student knows the answer is, say, 81, the pool offers six small numbers — 20, 50, 40, 7, 4, 8. None alone reaches 81. The student must combine: *50 + 20 + 8 + 4 = 82* (close, no), *50 + 20 + 7 + 4 = 81* (yes). Trial and adjustment is the heart of the puzzle.
- **Mental arithmetic with running totals.** Each tag dropped updates a visible running total below the drop zone. Students learn to add as they drop, watch the total climb, and stop when they hit the target — not before, not after.

## What the player sees and does
A clean white panel. The status row at the top — a small avatar, the round badge ("Q1"), a chunky blue countdown timer reading **00:30** that ticks down, the heart counter (`2`), and the rolling star tally (`0/10`).

Below the header, the bold instruction line: *"**Observe the pattern** and drag and drop the tags that will **add up** to the **value of question mark**"*.

The middle of the screen shows **three pattern diagrams** in a horizontal row. Each is a circle divided into three sectors:
- **Top-left sector** — turquoise blue, with a number (e.g. `45`).
- **Top-right sector** — soft purple, with a number (e.g. `33`).
- **Bottom sector** — leafy green, with a number (e.g. `78`).

The first two circles show fully worked examples (45 + 33 = 78; 22 + 35 = 57). The third circle shows two filled top sectors (e.g. 27 and 54) and a green bottom sector with a `?` instead of a number. The student infers the rule from the first two and applies it to the third (27 + 54 = 81).

Below the diagrams, in friendly text: *"Drag numbers here"* with a downward-pointing yellow finger, and a single **drop zone** rectangle — wide enough to hold five or six small tags side by side.

At the bottom, the **tag pool** — a soft-grey panel holding six small white draggable tiles, each with a small number (canonical: `20`, `50`, `40`, `7`, `4`, `8`). The pool is roughly grid-arranged, with the larger numbers on the top row and the smaller on the bottom.

A live **running total** appears beside or below the drop zone the moment the first tag is dropped — quietly, in soft grey: *"Sum so far: 50"*. As more tags drop, the number updates.

- **Drag a tag into the drop zone** → it snaps in beside any existing tags, the running total updates.
- **Tap a placed tag** → it returns to the pool, the running total drops accordingly.
- **Sum equals the target, plus a Submit chevron tapped** → all tags glow green, the green sector animates the answer (`81`), a chime plays, the round badge ticks up.
- **Sum is wrong on submit** → the drop zone flashes amber and shows the running total in red against the target: *"Sum: 78. Target: 81."* No life lost, the student adjusts; only running out of time costs a heart.
- **Timer hits zero** → drop zone dims, correct combination flashes, heart shatters.

## Shape of the experience
10 rounds across three difficulty bands:

- **Rounds 1–3 — Find the pattern, simple sums.** Pattern is *top + top = bottom*. Targets are friendly (50, 75, 100). Pool of 4 tags, exactly one valid combination using 2–3 tags.
- **Rounds 4–7 — Same pattern, trickier sums.** Targets in the awkward middle (81, 67, 94). Pool of 6 tags; multiple valid combinations exist (50+20+7+4 = 81; 40+20+8+4+7+2 = 81 if 2 is in pool); any valid combination is accepted. This teaches students that a sum has many decompositions.
- **Rounds 8–10 — Pattern shifts.** The rule changes: maybe *top × top = bottom*, or *top − top = bottom*, or *(top + top) ÷ 2 = bottom*. Students must scan the worked examples and infer the new rule each round. Targets are tighter; tag pools include a couple of decoys that look right but overshoot.

Three hearts carry across the session.

## Win condition and stars
Stars are awarded per round, summed:
- **3 stars** — pattern solved and tags submitted correctly with at least 10 seconds left on the clock, no wrong submit.
- **2 stars** — submitted correctly within time, but slow or after one wrong submit.
- **1 star** — solved after running over time but before the heart was lost.
- **0 stars** — heart lost, round abandoned.

The session ends on the third heart loss or after round 10.

## Feel and motivation
- **The pattern is the lock; the sum is the key.** The two-step structure (figure out *what number*, then *build that number*) means students can fail at either step and be guided differently. Wrong target → "look at the first two circles again". Wrong sum → "your tags add to 78, you need 81". This is two skills in one game, and the feedback can tell them apart.
- **The running total is the hand-holding.** Letting students see the sum as they drop tags converts the puzzle from a *guess-and-check* feel into a *steer-toward-the-target* feel. They learn to read partial progress, which is the real-world skill — accountants, programmers, and scientists all watch running totals.
- **Multiple correct combinations.** Because more than one combination usually works, the game accepts any tag set that sums correctly. This sends the message that *math has multiple paths* — a lesson too rarely taught at this age.

## Why it works pedagogically
This game braids two distinct skills — pattern induction and mental addition — into a single tactile puzzle. Pattern-finding is the more cognitively demanding of the two; adding small numbers is mechanical. By front-loading pattern work and back-loading sums, the game lets students feel the satisfaction of "ah, I see it!" *before* asking them to do arithmetic. That sequence matches how real math discovery actually feels, and it conditions students to expect that math problems usually contain a *trick* worth spotting before the calculation begins. A 10-round session lasts 7–10 minutes; doing it weekly visibly speeds up a child's response on pattern-completion and missing-number questions in the rest of their work.
