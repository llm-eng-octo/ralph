# Break and Add — The Tens-and-Ones Decomposition Game

## In one line
A guided drag-and-drop game where the student watches a worked example of *"break the number into tens and ones, then add"*, then has to do the same to a new addition like `23 + 45` — dragging `20`, `3`, `40`, `5` from a pool into two side-by-side decomposition tables.

## Who it's for
Class 1–3 students (ages ~6–9) who can add single-digit numbers fluently, but who freeze when asked to add two two-digit numbers in their head. The game is for the student whose teacher just said *"23 plus 45 — do it in your head!"* and who immediately reached for fingers, paper, or a panicked guess. It's the pre-column-addition stage where mental math happens by *splitting numbers up* — and the game makes that split visible and physical.

## What it tries to teach
The whole game is built around one foundational mental-arithmetic move: **decomposing a two-digit number into its tens and ones, then adding the tens to the tens and the ones to the ones.**
Three threads inside that:
- **Place value as splitting.** *23 = 20 + 3*. That's not a calculation; it's a way of seeing. Students who learn to mentally read 23 as *twenty-and-three* unlock every two-digit-addition strategy that follows. The game makes the split a literal physical action — drag `20` and `3` into separate boxes.
- **Like adds with like.** Once both numbers are split, the student adds *tens with tens* (20 + 40 = 60) and *ones with ones* (3 + 5 = 8). They are doing two single-digit additions instead of one two-digit one. The two side-by-side tables enforce this — you cannot drag `3` into the tens table.
- **Imitating a worked example.** Each round opens with a fully-worked example (Tina's decomposition of 20 + 30), so the student is not asked to invent the strategy — they are asked to copy it onto a new pair of numbers. This is *modelling*, the pedagogical move closest to how students actually learn at this age.

## What the player sees and does
A clean white panel. The status row at the top — a small avatar, the round badge ("Q1"), a heart counter (`2`), and the rolling star tally (`0/10`).

The screen has four stacked sections:

- **Worked example (top).** A short text line: *"Tina broke down numbers and added them like this:"*. Below it, two horizontal three-cell tables drawn with thick black borders. The first reads: `[ 20 ] [ + ] [ 30 ]` (the tens of 23 and 53 from Tina's example). The second reads: `[ 2 ] [ + ] [ 4 ]` (oddly, the tens-digit-as-just-a-digit — many curricula use this dual representation to bridge between *"twenty"* and *"two tens"*). The plus signs are pre-printed in fixed cells.

- **Problem statement (middle).** A short paragraph: *"You have to find the sum of **23 and 45**. Drag and drop the **numbers** in the table **like Tina** that will help you find the sum."* Below that, the addition itself in *huge* dark text, dominating the screen: **23 + 45**. The visual size of this text signals: *this is the problem*.

- **Two empty target tables (lower-middle).** Same form as Tina's: two horizontal three-cell tables, each with the middle cell pre-printed as `+`. The first table is for the *tens* (it expects `20` and `40`); the second is for the *ones* (it expects `3` and `5`). Empty boxes at left and right of each `+` are the drop targets.

- **Number pool (bottom).** A soft-grey panel holding six draggable tiles: `20`, `40`, `3`, `5`, plus two distractors (`30`, `4`) drawn from the *neighbour digits* of 23 and 45 — the student must resist grabbing the wrong tile. Each tile is a clean rounded square with a single number in dark text.

- **Drag a tile into a correct slot** → snaps in, soft chime, tile fades from the pool.
- **Drag a tile into a wrong slot** → bounce-back, soft buzz, one-line nudge: *"`3` is the *ones* of 23, not the tens. Try the bottom table."*
- **All four slots filled correctly** → both tables glow green, the running totals appear below them (`60` for the tens, `8` for the ones), then a third single-line shows up: *"60 + 8 = 68"*, the chime plays, round complete.
- **Three wrong drops in a single round** → a heart shatters.

There is no per-round timer. This game is about understanding, not speed.

## Shape of the experience
10 rounds, scaffolded carefully:

- **Rounds 1–3 — Tina's example matches the problem.** The worked example uses the same numbers as the problem, so the student is essentially copying. This builds confidence and teaches the form.
- **Rounds 4–7 — Tina's example is a different but similar pair.** The student must apply Tina's *strategy* to *new numbers* (e.g. example uses 24 + 35, problem asks for 17 + 52). No carrying yet — sums of ones stay below 10.
- **Rounds 8–10 — Carrying enters.** Problems where the ones sum exceeds 10 (e.g. 28 + 35 → ones make 13). After the student decomposes correctly, a new step appears: *"3 + 5 was easy, but 8 + 5 = 13 — that's a ten and a 3. The extra ten goes up to the tens column."* This is the bridge to column addition. Rounds 9 and 10 ask the student to drop the carried-over ten themselves.

Three hearts carry across the whole session.

## Win condition and stars
Stars are awarded per round, summed:
- **3 stars** — round completed with zero wrong drops.
- **2 stars** — round completed with 1 wrong drop.
- **1 star** — round completed with 2 wrong drops.
- **0 stars** — heart lost on the round.

A perfect run is 30 stars across 10 rounds.

## Feel and motivation
- **Tina is doing the thinking aloud.** The worked example at the top of every round is a small piece of dialogue with a peer named Tina. *"Tina broke down numbers and added them like this..."* gives the student a model to imitate without it feeling like a lecture from a teacher. Children copy peers more readily than they copy adults.
- **Two tables, not one.** Splitting tens and ones into physically separate tables is the entire pedagogical trick. A single decomposition table would let students drop `3` into the wrong slot without realising. Two tables make the *kind* of digit explicit before the addition happens.
- **Decoys are the mistake-prevention tool.** The pool contains `30` (the swap-of-23) and `4` (the swap-of-45) deliberately — exactly the wrong tens and ones a careless student would grab. Resisting them is half the skill; the game catches the slip with a one-line, kind explanation.
- **Big problem text.** Showing `23 + 45` in oversized type, far bigger than any other text on the screen, keeps the original problem visible while the student decomposes. They never lose sight of *what they are trying to find*.

## Why it works pedagogically
Two-digit mental addition is the single biggest leap in early arithmetic — it's where students go from "I memorised 7+8" to "I can do 27+38 in my head". Most curricula teach the column-addition algorithm first, and only later (if ever) explain *why* it works. This game inverts that order: students discover place-value addition by doing it physically, and only meet the column algorithm afterwards as a faster way of writing down what they already understand. By round 10, students who started as finger-counters typically can decompose and add 23 + 45 in their head in under five seconds — and the *carrying* step in rounds 8–10 is the natural bridge to the column algorithm they'll meet next year. A 10-round session takes 6–9 minutes; running it daily for two weeks is a meaningful arithmetic intervention for a stuck-on-paper second-grader.
