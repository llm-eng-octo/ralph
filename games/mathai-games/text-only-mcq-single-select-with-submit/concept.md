# Better Way — The Strategy-Picking Word Problem Game

## In one line
A word-problem game where the child reads a real-life sharing scenario, then picks from three sentences which *strategy* they'd use to solve it — not the answer, the **method** — turning the moment of "what operation do I even reach for?" into the actual game.

## Who it's for
Class 3–4 students (ages ~8–10) who can do division when an exam tells them *"divide 108 by 4"* but freeze when a word problem says *"how can you find how many pins each student gets?"* The game is built for the gap between *knowing how* and *recognising when*. The student who picks "guess and check" or "do it one by one" instead of the obvious operation isn't bad at division — they don't yet have a mental cue that says *"this is a division-shaped problem."*

## What it tries to teach
The leverage is **operation recognition** — reading a sentence and feeling which of `+`, `−`, `×`, `÷` is the right tool. Three threads:
- **Equal-share = division.** Whenever a problem says *"share equally"*, *"split into groups"*, *"how many each"*, the answer is to divide. The game builds this reflex by repeating the cue across many surface stories — pins to students, sweets to friends, marbles to bags — so the child stops parsing the noun and starts hearing the *verb shape*.
- **Faster-than-counting beats counting.** One of the three options is always a slow-but-correct method (*"give one pin at a time"* or *"draw all 108 dots"*). The game lets the child see that this works but is exhausting, then asks them to commit to the faster alternative. Speed is framed as *cleverness*, not laziness.
- **Confidence over hedging.** The third option is always a *"I don't know"* or *"there isn't a faster way"* hedge — included on purpose. A child who clicks the hedge is gently shown the right answer with no shame, and the game tracks how often they self-eject; teachers see the pattern in the gauge view.

## What the player sees and does
A spacious vertical layout. Top status bar: small avatar, *"Q1"*, a heart with the lives count, and a star tally `0/10`. Below it, a few short paragraphs that make up the scenario, in conversational language:

> *"You tried to give away **108 pins to 4 students**.*  
> *We saw that giving out one pin at a time is slow.*  
> *How can you find the number of pins each student gets and the number of pins left in a faster way?*  
> ***Choose the best answer.***"

Below the prompt, three vertically-stacked option cards — each a wide rounded rectangle with a thin grey border, holding one full sentence:

1. *"No, I don't think there is a faster way."*
2. *"Use division to find out how many pins each student gets and how many are left over."*
3. *"Guess how many pins each student should get and how many are leftover."*

A large yellow **Submit & check** button anchors the bottom of the screen. The button is bright on purpose — the act of *committing* to an answer is part of what the game is teaching.

- **Tap a card** → the card border turns deep blue and a subtle inner glow appears; previously-selected card de-selects. Submit button activates.
- **Tap Submit on the right answer** → the chosen card turns green, a quick chime, the next round loads.
- **Tap Submit on a wrong answer** → the chosen card turns soft red, the *correct* card pulses green for a beat, and a single-line explanation slides in: *"Division splits a total into equal groups quickly — that's exactly what's happening here."* A heart shatters. The child taps **Continue** to move on.
- **No selection, Submit pressed** → button gives a tiny shake; nothing else happens.

## Shape of the experience
10 rounds across three small flavours:

- **Rounds 1–3 — Equal share.** *Pins to students*, *sweets among friends*, *cards to players* — division-shaped problems where the right option is always *"divide"*.
- **Rounds 4–6 — Total of equal groups.** *"6 boxes of 9 pencils each — how many pencils?"* — multiplication-shaped problems where the right option is *"multiply"*. Forces the child to distinguish from rounds 1–3.
- **Rounds 7–9 — Combine or separate.** *"You had 47, gave away 19 — how many left?"* — addition/subtraction. Easier on paper but harder in this format because the child must tell *combine* from *separate*.
- **Round 10 — Mixed.** A two-step problem where the right option requires picking the order: *"first multiply, then add"*. Stretch goal.

The hedge option (*"I don't know"* / *"there's no faster way"*) is present in every round, never goes away.

## Win condition and stars
Three lives. Stars are awarded per round and summed:

- **3 stars** — correct on the first tap and within 15 seconds.
- **2 stars** — correct on the first tap but slower than 15 seconds.
- **1 star** — correct after a wrong tap (a heart was lost).
- **0 stars** — did not answer correctly within the round.

Game ends when 10 rounds finish or all 3 lives are gone. Maximum is 30 stars; a 24+ run unlocks a "Strategy Spotter" badge that shows up on the home screen for a week.

## Feel and motivation
- **Story over arithmetic.** The numbers in each prompt are deliberately *kind* — `108 / 4`, not `743 / 11`. The game isn't testing whether the child can divide; it's testing whether they recognise that they *should*. Hard arithmetic would mask the lesson.
- **Cards, not radio buttons.** Each option is a generously-sized card the child taps with a thumb, not a radio button next to a long line of text. This makes the screen feel like a choice between *strategies*, not between letters A/B/C.
- **The hedge stays available.** Many curricula remove the *"I don't know"* option as the child progresses. This game keeps it forever, on purpose — the goal is not "force a guess" but "build the muscle of choosing knowingly." A student who taps "I don't know" three times in a row is shown a hint screen explaining *what to look for* in a problem statement.

## Why it works pedagogically
The hidden gap between *can-do-the-arithmetic* and *can-recognise-which-arithmetic-to-do* is where most children quietly fall behind in late primary. Conventional worksheets test it as a side effect — the child gets the wrong answer and the teacher assumes they couldn't compute. By isolating the strategy choice — and explicitly *not* asking for the final number — this game makes the recognition skill into the thing being practised, scored, and corrected. The student leaves with a clearer ear for keywords (*share*, *each*, *together*, *left over*) and the meta-habit of pausing to ask *what kind of problem is this?* before they reach for a pencil. Once that habit is in place, division and multiplication become the obvious tools they already are; what was missing was the trigger.
