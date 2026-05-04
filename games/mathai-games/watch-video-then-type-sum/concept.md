# One-Watch Sum — The Video-and-Hold Mental Addition Challenge

## In one line
A short video flashes a sequence of numbers on screen, one after another, and the student has to mentally add them as they go — with only **one** play allowed and a single text box waiting at the bottom for the final total.

## Who it's for
Class 4–5 students (ages ~9–11) who can add two-digit numbers on paper but who don't yet trust their working memory. The game is for the child who, on a list of *"7, 13, 8, 12, 5, 25"*, will pause the video, scribble each number on the back of their hand, and add at the end — defeating the whole point. The constraint of *"watch only once, no pencil"* turns out to be the most pedagogically useful part of the screen.

## What it tries to teach
This is the same friendly-pairs lesson as the table-based addition games, but the medium changes everything. The leverage is **maintaining a running mental total under temporal constraint** — keeping a number in your head while a new one walks in.
Three threads:
- **Friendly-pair scanning, in real time.** The video deliberately presents numbers in a sequence that *almost* but not quite pairs in order: `7, 13, 8, 12, 5, 25`. A naïve adder does `7 + 13 = 20`, `+ 8 = 28`, `+ 12 = 40`, `+ 5 = 45`, `+ 25 = 70`. A pair-spotter notices `7 + 13`, `8 + 12`, `5 + 25` are all friendly pairs that land on round numbers and shortcuts the whole thing.
- **Working memory under pressure.** Numbers appear for ~2 seconds each. The child can't see the previous one. They have to *commit* the running sum to memory before the next number lands. This is genuinely uncomfortable at first and improves quickly with practice.
- **Trust, then submit.** When the video ends, the child has one number in their head and a typing box. There is no scratchpad, no replay. They have to *trust* the sum they computed and type it. Decisiveness is a side-skill that primary-school worksheets never train; this screen does.

## What the player sees and does
A spacious vertical layout. Top status bar: avatar, *"Q1"*, a large bright-blue countdown timer in the middle of the bar (e.g. `00:24`), and a star tally `0/10`. There is **no heart icon** in this archetype — lives are not used; the timer enforces difficulty instead.

Below the bar, a few short paragraphs of instructions in conversational language:

> *"Find the sum of the numbers shown in the video by mentally adding them.*  
> *You can watch the video only **1 time**.*  
> *💡 Tip: Check for friendly pairs that make 10, 20, 30, 40 or 50 to add faster."*

The bulk of the screen is a centred **video player**, about 480px wide on desktop, 90% width on mobile, with native HTML5 controls — play, scrubber, mute, fullscreen, the usual. The video itself runs about 14 seconds: a clean white background with one number at a time appearing in large bold colourful text — `7` … `13` … `8` … `12` … `5` … `25` — each card sliding in for ~2 seconds before being replaced.

Below the video, the prompt *"Write the total here ↓"* and a single rounded text input labelled *"Type here"*.

A submit/next-round affordance sits below the input, lit only after the child types a value.

- **Tap play (first time)** → video plays through. The play button is greyed-out for replays for the rest of the round.
- **Try to scrub or replay** → controls are disabled after the first play. A small unobtrusive line appears: *"You've used your one watch."*
- **Type the right total + submit** → input box turns green, a quick *cha-ching*, the next round loads.
- **Type the wrong total + submit** → input box turns red, the correct answer appears below in soft grey, and a one-line diagnostic shows: *"You said 95. The actual sum was 90 — looks like you may have double-counted one number."*
- **Timer expires** (the per-round countdown — separate from the video duration) → round auto-submits whatever's in the input box, or empty.

## Shape of the experience
10 rounds, each a different short video clip. Difficulty climbs through three knobs — number count, value range, and friendly-pair availability:

- **Rounds 1–3 — Slow, friendly.** 4 numbers, all under 15, with two obvious friendly pairs. Cards display for 2.5 seconds each. The child should always finish with time to spare.
- **Rounds 4–6 — Moderate.** 6 numbers, mixed two-digit values, one friendly pair, one near-pair (off by 1). Cards display for 2 seconds each.
- **Rounds 7–9 — Fast.** 7–8 numbers, 1.5 seconds each, no obvious pairs — the child must keep a true running sum.
- **Round 10 — Stretch.** 10 numbers in 12 seconds, mixed sizes, decoy near-pairs (e.g., `7 + 14` looks pair-able to a careless eye). Most children will not get a perfect score on round 10 the first time they play.

## Win condition and stars
Stars per round, summed:

- **3 stars** — typed the correct total within the round timer (24 seconds total for 14-second videos).
- **2 stars** — correct total but submitted after the round timer expired.
- **1 star** — wrong total within ±10% of the right answer (i.e., the strategy was right but the arithmetic slipped).
- **0 stars** — wrong total beyond ±10%, or no submission.

There are no lives — every round runs to completion. Maximum is 30 stars over 10 rounds. End-of-game screen shows a small chart of *"how close you got each round"* — useful for the child to see whether their misses are *consistently low* (they're missing a number) or *consistently high* (they're double-counting).

## Feel and motivation
- **The video makes it real.** Static numbers on a page never put real pressure on working memory. Watching a number replace another forces the child to *commit* the running sum, which is the actual skill being trained. The medium *is* the lesson.
- **One watch is the rule, not the bug.** Children always ask if they can watch again. The answer is always no. This frustration is part of the design — it forces them to attend the *first* time, which is exactly the focused-attention habit the game is building.
- **Numbers are colourful, not stern.** The number cards in the video use friendly bold colours — orange `7`, purple `13`, teal `8` — so the moment-to-moment experience feels playful even though the constraint is strict.

## Why it works pedagogically
Mental addition under a steady arrival of new numbers is the same cognitive demand as listening to a teacher rattle off a list ("give me three more than seven, then double it, then add ten"), or scanning a price tag in a shop, or following a multi-step word problem read aloud. Most worksheets test addition in a static format that lets the child treat each number as a thing to look at in their own time — which builds the *fact* of addition but not the *fluency* of it. By forcing a temporal constraint and removing the option to write things down, this game targets fluency directly. After ten rounds, a child's "how fast can I add a list of six numbers in my head" speed measurably improves, and — more subtly — they start *trusting* their own running sum instead of needing to verify it on paper. That trust is the single biggest delta between a fluent mental adder and a struggling one, and this is one of the few games that trains it on purpose.
