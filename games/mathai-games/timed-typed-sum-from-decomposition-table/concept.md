# Friendly Pairs — The Color-Coded Mental-Add Race

## In one line
A timed mental-addition game where the student stares at a row of six to eight numbers laid out as `a + b + c + d + ...`, with the *friendly pairs* (numbers that sum to 10, 20, 30, 40, or 50) colour-matched, and types the total before the clock runs out.

## Who it's for
Class 4–5 students (ages ~9–11) who can add two-digit numbers cleanly with a pencil but add a six-number row left-to-right and lose track halfway. The game is for the in-between phase where the student *can* do the arithmetic but hasn't yet learned to *re-order* the numbers in their head to make the work easier. It targets the specific stuck-point where students don't yet trust the commutative property as a mental tool — they treat the numbers as a fixed sequence to be processed, not a flexible bag to be re-grouped.

## What it tries to teach
The whole game is built around one quiet skill: **re-pairing a list of numbers to find friendly sums first, then totalling the friendly chunks**.
Three threads inside that:
- **Spotting friendly pairs.** Two numbers are *friendly* if they sum to 10, 20, 30, 40, or 50 — a clean number that's easy to hold in working memory. The game colour-codes the pairs explicitly: `7` and `3` share a turquoise tile (they sum to 10), `25` and `25` share a purple tile (they sum to 50). The student's job at the start is just to *trust the colours* — same colour means "add these two first."
- **Summing pair-sums.** Once the row resolves to a handful of friendly numbers (`10 + 20 + 50 + 50`), the student adds those instead of the original list. This is dramatically easier — multiples of 10 are basically subitizable. The game makes that ease *felt*, not just told.
- **Eventually, finding pairs without the colours.** The colour scaffold is removed in later rounds. The student now has to look at `7 + 3 + 19 + 1 + 25 + 25 + 24 + 26` and recognize the pairs themselves. This is the actual destination — the colour was just training wheels.

## What the player sees and does
A clean white panel. Top status row — Q1 badge with avatar, big blue countdown timer reading `00:32` and ticking, and `0/10` stars on the right.

Below the status, two short instruction lines: *"Mentally add the numbers given below. All the **friendly pairs** are color coded for your ease!"* And a tip in italic: *"💡 Tip: Check for friendly pairs that make 10, 20, 30, 40 or 50 to add faster."*

The body of the screen is the math itself: a single horizontal row of square coloured tiles, each holding one number, separated by light grey `+` symbols. In the screenshot:
- `7` (turquoise) `+` `3` (turquoise) `+` `19` (yellow) `+` `1` (yellow) `+` `25` (purple) `+` `25` (purple) `+` `24` (orange) `+` `26` (orange)

So the student sees, at a glance, four friendly pairs: two turquoise = 10, two yellow = 20, two purple = 50, two orange = 50. Total: `10 + 20 + 50 + 50 = 130`. The hard arithmetic has already been pre-organized for the student by the colour grouping; their only job is to *use* the structure.

Below the row, an instruction with a finger pointing down: *"Write the total here ↓"* and a `Type here` input box.

- **Type the correct total and submit before time runs out** → input turns green, the tile pairs briefly merge in colour-coded animations (`7` and `3` flow together to form `10`, etc.), *cha-ching*, round badge ticks, a star is awarded.
- **Type a wrong total** → input shakes red, a heart shatters, and the correct decomposition reveals: *"`7 + 3 = 10`, `19 + 1 = 20`, `25 + 25 = 50`, `24 + 26 = 50`. Total: `130`."*
- **Run out of time** → tiles dim, the correct decomposition reveals, a heart shatters, and the round ends.

## Shape of the experience
10 rounds across three small stages:

- **Stage 1 — Pairs to 10 only (Rounds 1–3).** Six-number rows, all pairs sum to 10 (`7 + 3`, `4 + 6`, `8 + 2`). Three friendly pairs per row. Total around 30. Time limit 40 seconds. Students get the rhythm and trust the colours.
- **Stage 2 — Pairs to 20 and 50 mixed (Rounds 4–7).** Eight-number rows. Pairs of varying sums (some to 10, some to 20, some to 50). Total around 100–150. Time limit 30 seconds. Students learn to add a *list of round numbers*.
- **Stage 3 — No colours, just numbers (Rounds 8–10).** The colour-coding fades to neutral grey. The student must spot pairs themselves. Eight numbers, mixed friendly sums, total around 150–200. Time limit 30 seconds. This is the destination — the student does what the colours used to do for them.

## Win condition and stars
The student starts with 3 hearts, carried across rounds. Stars are awarded **per round**:
- **3 stars** — correct total typed within the time bonus window (first 60% of the timer).
- **2 stars** — correct total typed before the timer ends.
- **1 star** — correct total typed after a wrong attempt or after time ran out and a retry was given.
- **0 stars** — round failed.

The game ends when either all 10 rounds are complete or all 3 hearts are lost. A perfect run is 30 stars, displayed as *"X / 10"* with later rounds (especially the colour-free Stage 3) weighted higher.

## Feel and motivation
- **Colour does most of the work, deliberately.** A student looking at the row sees the colours before the numbers — turquoise pulls together, purple pulls together. The brain is a pattern-matching machine, and the game hijacks that to teach a *mathematical* pattern: numbers that pair up nicely. By Stage 3, the student is doing that pattern-match without colours, which means the lesson has stuck.
- **The pair-merge animation is the celebration.** When the correct total is typed, the tiles literally flow into one another to show the pairs combining into round numbers. The student *sees* what they did, and that visual reinforces the strategy more than any verbal feedback could.
- **The timer is loud but not cruel.** 40 seconds in early rounds, dropping to 30. Plenty of time once the student trusts the colours — but uncomfortable for a student trying to add left-to-right. The pressure is calibrated to make the *good strategy* feel fast and the *bad strategy* feel slow. Decoy answers in the game's bank are the result of left-to-right addition with one number missed — so a wrong answer is diagnostic.

## Why it works pedagogically
The commutative property of addition is one of the earliest "grown-up" ideas a primary student meets, and it's almost always taught as a sentence — *"order doesn't matter when you add"* — and then never used again. Students nod and move on, and add left-to-right for the next decade. This game makes the commutative property *useful*: re-ordering the numbers visibly halves the work, and the student feels the speed-up in their bones. Once that's felt, the student starts re-ordering automatically — when summing the bill at a restaurant, when totalling marks on a test, when adding any list of numbers anywhere. That's the long shadow of this game: a mental habit that pays off forever. A 10-round session takes about 5–7 minutes — perfect for a daily warm-up, and after a week of daily play, students who used to add left-to-right start spontaneously pairing.
