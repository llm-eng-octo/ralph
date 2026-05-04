# Break And Add — The Mental Sum Sprint

## In one line
A timed mental-addition sprint where one two-digit-plus-two-digit problem appears in the centre of a calm yellow strip, and the student must break each number apart in their head — *forty plus twenty, two plus five* — and type the answer into a single small box before the clock runs out.

## Who it's for
Class 3–4 students (ages ~8–10) who can add two-digit numbers on paper using the standard column algorithm but freeze when asked to do the same problem in their head. The skill the game targets is the **break-down strategy**: rewriting `42 + 25` as `(40 + 20) + (2 + 5)` and computing each chunk separately. This is the most important mental-addition strategy in primary school, and the one most students learn as a sentence rather than a habit.

## What it tries to teach
The whole game is about **decomposing a 2-digit addition into its tens and ones, adding each, and recombining — fast**.
Three threads:
- **Tens and ones, separately.** `42 + 25` → tens give `40 + 20 = 60`, ones give `2 + 5 = 7`, recombine to `67`. The student is taught this decomposition as a path through the calculation, not just a fact about place value.
- **No-carry first, then carry.** Early rounds avoid carrying entirely (e.g., `42 + 25`, `31 + 47`). Later rounds force carries (`38 + 26` → ones give `14`, which spills back into the tens). The carry is the move where mental arithmetic gets hard, and the game escalates into it gradually.
- **Speed as commitment.** A student given infinite time will revert to column-add-on-fingers. A 15-second timer per problem makes the column method too slow — the student must use the break-down method to keep up. The timer is the pedagogical lever, not a stress device.

## What the player sees and does
A spare, friendly layout. At the top, a soft yellow status strip — round badge `Q1`, a friendly avatar, a big blue countdown timer (`00:00` ticking up — or down depending on the round's mode), and the star tally `0/10` on the right. The yellow band itself is the only colour on the screen, and it carries the tempo: when the timer is healthy it stays cream-yellow; in the last 3 seconds it pulses amber.

Below the strip, a single instruction: *"**Find the sum** of the following numbers mentally by **breaking down** numbers."* The bold words are the game's whole pedagogical signal — *find* (commit), *breaking down* (the method).

The body of the screen is just the equation: `42 + 25 = ` followed by a small white input box, sized for a 2-3 digit answer. Nothing else competes for attention. There is no number pad on screen — the device's keyboard is what the student uses. (For mobile this means the soft keyboard pops up automatically when the round starts.)

A bright yellow **Next** button anchors the bottom of the screen — it is greyed out until the round resolves.

- **Type the correct answer and confirm** → the box turns green, a *cha-ching* plays, the timer freezes, the round badge ticks up, and Next becomes tappable.
- **Type a wrong answer and confirm** → the box flashes red, a heart deflates in the top right, the correct answer appears under the equation in a soft grey, and Next lights up.
- **Run out of time** → the box dims, the message *"Oh no! Time up!"* appears under the equation, the correct answer is revealed, a heart deflates, and Next lights up.

## Shape of the experience
10 rounds, scaling steadily:

- **Rounds 1–3 — No carry, friendly numbers.** `42 + 25`, `31 + 47`, `54 + 33`. Both addends end in small digits whose sum is under 10. The student learns the decomposition rhythm: tens-then-ones, no surprises.
- **Rounds 4–7 — Carry from ones to tens.** `38 + 26`, `47 + 35`, `29 + 64`. The ones-sum spills past 10. The student learns to handle the carry mentally — one of the trickiest moves at this level.
- **Rounds 8–10 — Larger numbers.** `67 + 58`, `89 + 47`, `74 + 69`. Both addends in the 60s–80s, with carries. Some answers are 3 digits. The student is now operating at the edge of comfortable mental arithmetic.

Each round has a 15-second timer. The timer starts the moment the equation appears.

## Win condition and stars
A run is 10 rounds with 3 lives. Stars are based on a hybrid of speed and accuracy:
- **3 stars** for a round solved correctly in under 8 seconds.
- **2 stars** for solving correctly between 8 and 15 seconds.
- **1 star** for solving correctly after a wrong answer (i.e., on a second attempt).
- **0 stars** for the round if time runs out or all 3 lives are lost.

The headline display is the running total `X/10` — but per-round stars accumulate, so a perfect run is 30 stars compressed into the visible 10/10 score. This nudges the student to push for speed in the easy rounds, not coast.

## Feel and motivation
- **Yellow as a tempo cue.** The status strip is the only coloured surface on the screen. Its breathing pulse is the visual equivalent of a metronome — it keeps the student's eyes moving and rewards rhythm.
- **The decomposition is invisible but felt.** The game never *shows* the break-down (`40 + 20 = 60`, `2 + 5 = 7`) on screen. It's the student's job to do it in their head. The deliberate absence is the lesson — surfacing the decomposition would let the student stay in see-and-copy mode, which is what the game is trying to break.
- **The 15-second timer is the friend, not the foe.** It is set at the threshold where column-add-on-fingers fails but break-down succeeds. Students who use the wrong method run out of time; students who use the right method finish in 6–8 seconds. The timer enforces method discovery.

## Why it works pedagogically
The break-down strategy is the bridge between paper arithmetic and *real* mental arithmetic. A child who only knows column addition can't add `42 + 25` in their head without imagining a column on a wall — slow, error-prone, easily disrupted. A child who has internalised break-down adds `42 + 25` faster than they could read the numbers. This game targets exactly the migration: 10 short rounds, each forcing the strategy through time pressure rather than nagging instruction. A session takes 2–4 minutes, fits in the dead time at the start of a class, and over a two-week daily run measurably moves a child's mental-addition fluency. Pair it with column-method on paper for the first week and watch the child stop reaching for paper by the second.
