# Cat Grid — The Polyomino Tiling Puzzle

## In one line
A spatial puzzle game where the student fits a small bag of oddly-shaped polyomino pieces into a grid shaped like a cat's face — covering every empty cell exactly once, leaving the cat's two eyes uncovered, and finishing before the 60-second clock runs out.

## Who it's for
Class 3–6 students (ages ~8–12) who can count squares but who haven't yet developed a *spatial planner* — the part of math thinking that says *"this L-shape will fit in that corner if I rotate it"*. The game is for the student who solves jigsaws by trial and error and never by inspection, and who freezes on area-and-perimeter problems the moment the shape isn't a rectangle. It's also a wonderful one for the strong arithmetic student who has never been challenged on geometry.

## What it tries to teach
The whole game is built around one underdeveloped skill: **mentally rotating, fitting, and area-counting irregular shapes inside a constrained region**.
Three threads inside that:
- **Counting cells, not pieces.** The grid has, say, 23 empty cells. The bag has pieces totaling 23 cells. If the student counts both before placing anything, they realise the puzzle has no slack — every cell must be filled and no piece can be left out. Most students don't count first and end up with one piece too many.
- **Constraint-driven placement.** The two *eye* cells in the middle of the grid must remain uncovered, and the grid's outline isn't rectangular. The corners and bottlenecks of the cat's face only fit certain piece shapes — students learn to start from the constrained edges and work inward, instead of placing easy pieces first and getting stuck.
- **Spatial visualisation.** Holding a piece in mind, imagining it rotated 90°, and asking *"would it fit there?"* before lifting it — this is the same skill that powers fluent geometry, area decomposition, and the spatial reasoning sections of every standardised test.

## What the player sees and does
A clean white panel. At the top, the familiar status row — a small avatar, the round badge ("Q1"), a chunky blue countdown timer reading **00:60** that ticks down, and the rolling star tally (`0/10`).

Below the header, two short instruction lines: *"Drag and drop all the jigsaw pieces to complete the **cat's face**."* and a second hint line with a small lightbulb: *"Hint: Make sure not to cover the eyes. Place the pieces around them!"*

The middle of the screen is the **target grid** — a single big shape rendered as a faint dotted-grid background with a bold black outline that traces the outside of a cat's face: two pointed ears at the top, a wide cheek, a slight chin notch, a dimpled chin at the bottom. The grid cells inside are visible as faint dotted squares. Two cells in the middle are pre-filled with bright yellow cat eyes — these are the *do-not-cover* cells, drawn with thick black outlines to read as obstacles, not as drop targets.

Below the grid, the **piece tray** — a soft-grey panel holding 5–7 polyomino pieces, each rendered as a small group of solid coloured squares (lavender L-tetromino, mint Z-piece, orange domino, yellow square, lemon T-piece, pink straight tromino). The pieces are arranged in a casual cluster, not a rigid grid, so they read as physical objects in a tray.

- **Drag a piece toward the grid** → as the piece's centre cell crosses into a valid grid region, faint highlights show where it would land. A green outline means the piece fits cleanly; a red outline means at least one cell would overlap an eye, another piece, or fall off the cat's outline.
- **Drop in a valid spot** → the piece snaps into the grid, fills its cells in its colour, plays a soft *click*. The piece disappears from the tray.
- **Drop in an invalid spot** → the piece bounces back to the tray with a soft buzz. No heart lost — wrong placements are free, time pressure is the only constraint.
- **Tap a placed piece** → it lifts back into the tray (so the student can rearrange).
- **Every cell of the cat covered, both eyes still showing** → the cat's face animates: the eyes blink once, a soft *meow* plays, the round badge ticks up, and Next Round opens.
- **Timer hits zero with the grid unfinished** → the unplaced pieces dim, the cat face dims to grey, a heart shatters, the round ends.

The canonical version of the game does **not** include rotation — pieces have a fixed orientation, and the puzzle is designed to have a unique (or near-unique) solution at that orientation. Later rounds may add a rotate button.

## Shape of the experience
10 rounds, each a different animal silhouette, increasing in difficulty:

- **Rounds 1–3 — Easy shapes, generous solutions.** Small grids (15–20 cells), 4 pieces, multiple valid arrangements. Targets: a smiley face, a heart, a simple house. Time: 60 seconds (rarely a constraint).
- **Rounds 4–7 — Medium shapes, tighter fits.** 20–30 cell grids, 5–7 pieces, often a single solution or two. Targets: cat face (the canonical), elephant outline, fish. Time: 60 seconds, beginning to bite.
- **Rounds 8–10 — Hard shapes, unique solutions.** 30+ cell grids, 7–9 pieces including a tricky long piece, only one valid solution. Targets: dragon profile, dinosaur, butterfly. Time: 90 seconds; rotation enabled.

Three hearts carry across the whole session.

## Win condition and stars
Stars are awarded per round, summed:
- **3 stars** — solved with at least 20 seconds left on the clock and no piece taken back from the grid.
- **2 stars** — solved within the time limit, regardless of how many takebacks.
- **1 star** — solved after the timer expired (late rounds let you finish for partial credit).
- **0 stars** — round ended unsolved, heart lost.

A perfect run is 30 stars.

## Feel and motivation
- **The cat is the point.** Wrapping a polyomino puzzle in a *cute target shape* — a cat, a fish, a dragon — turns it from an abstract math task into a small craft project. Children who would refuse a "puzzle worksheet" will gleefully fill in a cat's face and ask for the next animal.
- **Eyes as obstacles.** The two yellow eye cells are the most visible feature of the grid and the only thing the student must *not* cover. Making the constraint visual rather than verbal turns it from a rule the student might forget into an obvious feature of the shape.
- **Pieces feel hand-sized.** Each polyomino is rendered as solid coloured squares with a small drop shadow, so it looks like a physical tile being moved. The drag has a slight lift and a slight settle; the drop has a soft click. Tactile feedback is half of what makes the loop addictive.
- **No rotation early on.** Removing rotation from rounds 1–7 lets students focus purely on *which piece goes where*. By round 8, they've internalised the shapes well enough to handle rotation as a lever, not a chaos source.

## Why it works pedagogically
Polyomino tiling is the most distilled form of spatial reasoning available — it combines area conservation (cells in pieces = cells in target), shape recognition (which piece fills this notch?), and constraint propagation (if the long piece goes here, the L must go there). All three skills underpin geometry, mensuration, and any future encounter with tessellations, area-by-decomposition, or coordinate-grid problems. By presenting the puzzle in a delightful, animal-shaped wrapper rather than a sterile rectangle, the game keeps engagement high through the difficulty ramp. A 10-round session takes 8–12 minutes — long enough to feel like real practice, short enough that students ask to play again. Three sessions across a week noticeably loosens up a child's spatial intuition, and the same skill shows up later in faster, more confident geometry diagrams in their notebook.
