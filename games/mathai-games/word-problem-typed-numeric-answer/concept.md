# Tanya's Wallet — The Multi-Step Word Problem Solver

## In one line
A clean, focused word-problem game where the student reads a short real-life story — *"Tanya has Rs 100. Every day she buys an ice-cream for Rs 15. How much does she have left after 3 days?"* — and types the single number that closes the story out.

## Who it's for
Class 4–5 students (ages ~9–11) who can comfortably multiply a one-digit number by a two-digit number and subtract on paper, but who lock up the moment a problem arrives wrapped in a sentence instead of stacked between an `=` sign. The skill they're missing is not arithmetic — it is the ordering of operations *implied by the words*. This game is for the student who, given `100 − 15 × 3`, can compute `55`, but given the same story, types `255`, `85`, or `45` because they processed the sentence one word at a time.

## What it tries to teach
The whole game targets one move: **turning a 2–3 sentence story into a small chain of arithmetic and executing it in the correct order.**
Three threads inside that:
- **Spotting the recurring quantity.** "Every day", "each", "per" — these tiny words are the difference between adding once and multiplying. The game's problems all have one repeating quantity, deliberately phrased differently each time, so the student learns to scan for the recurrence cue rather than the literal word.
- **Ordering the operations.** The student must do the multiplication first (cost × days) and *then* the subtraction (start − total). Reversing the order or chunking by day (`100 − 15`, `85 − 15`, `70 − 15`) both work, but the multi-step path is faster and less error-prone. The game rewards the answer either way; the speed bonus rewards efficiency.
- **Trusting a number.** A single input box, no choices to pick from, no scratch buttons. The student must commit to a value. Word-problem confidence at this age is mostly about *commitment*, not computation.

## What the player sees and does
A spacious, almost stark layout. At the top, a thin status row — round badge `Q1`, a friendly avatar, and the running tally `0/10` next to a yellow star. The center of the screen holds the word problem in clean, large body text — about three sentences, no decoration, no illustrations. Below it, a single input box with the prompt *"Enter answer here"*. That's the entire screen. The deliberate emptiness puts the words and the box in conversation with each other, with nothing to fidget on.

- **Type the right number and confirm** → the box turns green, a quick *cha-ching*, the next problem fades in with a fresh story.
- **Type the wrong number and confirm** → the box flashes red, a heart deflates in the top right, and a one-line hint specific to the mistake type appears: *"Did you remember to multiply by the number of days?"* or *"Subtract from the starting amount, not from zero."*
- **Idle for too long (~20 seconds without any keystroke)** → a faint pulse on the part of the question that holds the recurrence cue (e.g., the words "every day"), nudging the student to reread.

## Shape of the experience
10 problems in three small bands of difficulty:

- **Rounds 1–3 — Money, two operations.** *Tanya buys ice-cream*; *Aman saves Rs 20 a week from his Rs 200 allowance*; *Riya pays Rs 25 each for 4 notebooks from her Rs 150*. Same shape: starting amount, recurring expense, fixed duration. The student learns the pattern.
- **Rounds 4–7 — Money plus a twist.** A change of direction (earnings instead of expenses), a per-unit cost ("Rs 8 per pencil, she bought 7"), or a comparison ("how much more than Rs 50 is left?"). Same arithmetic, harder reading.
- **Rounds 8–10 — Mixed contexts.** Distance ("walks 3 km a day for 5 days, target 20 km"), time ("reads 12 pages a day for a week, book has 100 pages"), capacity. The math doesn't get bigger; the *story* gets less familiar. Transfer matters here.

## Win condition and stars
There are 3 lives across the whole 10-problem run — a careless tap doesn't end the game, but a third mistake does. Stars are based on first-attempt correctness, summed:
- **3 stars** — 9 or 10 first-attempt correct.
- **2 stars** — 6–8 first-attempt correct.
- **1 star** — completed the run (any number correct) but with at least one second attempt needed.
- **0 stars** — lost all 3 lives.

There is no per-question timer; the focus is reading carefully, not racing.

## Feel and motivation
- **Numbers stay small and round.** Starts of `100`, `200`, `500`. Rates of `5`, `10`, `15`, `20`. Durations of `3`, `5`, `7` days. Nothing in this game asks the student to multiply `27 × 13` — that would steal attention from the parsing skill the game is actually teaching.
- **The story stays human.** Names rotate (Tanya, Aman, Riya, Bobby, Mira), the contexts are everyday — pocket money, snacks, trips, books — so the student is reading *about the world*, not about abstract `x` and `y`.
- **Hints are diagnostic, not preachy.** The wrong-answer hint depends on which canonical mistake the student made. Typing `15` means "you computed the cost of one day"; typing `45` means "you computed the total spent, not the remainder"; typing `85` means "you only counted one day". The hint names the slip and points at the next move — never lectures.

## Why it works pedagogically
At this age the bottleneck in word problems is almost always *parsing*, not *calculating*. Children who can comfortably do `100 − 45` will type `145` if the sentence runs a certain way, because their brains latched onto the wrong arithmetic relationship between the numbers. By stripping the screen down to just the words and one box, this game forces the student to do the parsing on their own, with no decoy answers to triangulate against and no expression-builder to pre-shape the math. Wrong answers then carry diagnostic value — and after 10 short rounds, the student has rehearsed the read-extract-compute-commit loop a dozen times in a row, which is where word-problem fluency actually lives.
