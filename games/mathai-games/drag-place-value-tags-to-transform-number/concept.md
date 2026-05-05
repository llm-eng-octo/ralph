# Tag Transform — The One-Step Place-Value Spotter

## In one line
A 30-second mental-math beat where the student looks at two near-twin numbers like `7513` and `7553`, spots the single column that changed, and drags the matching `±` tag (`+40`, `−40`, `+400`) into the drop zone before the timer runs out.

## Who it's for
Class 3–4 students (ages ~8–10) who can rattle off place-value names but freeze when asked *"what's 7553 − 7513?"* — a question their textbook treats as a paper-subtraction problem but which a fluent student solves in two seconds by glancing at the digits. The game is for the kid who can *do* place-value but doesn't yet *see* it. It's a deliberately micro-sized version of mental arithmetic — one column changes, one move fixes it — designed to hammer the spot-the-difference reflex.

## What it tries to teach
The whole game is built around one tight skill: **reading a single-column digit change as the corresponding additive operation**.
Three threads inside that:
- **Diff-the-digits, not the numbers.** A novice subtracts the whole numbers (`7553 − 7513 = 40`); a fluent student notices that only the tens digit moved (5 → 5… wait, the tens went from 1 to 5, so +4 tens, so +40). The game forces the latter habit because the answer choices are operation tags, not numerals.
- **Magnitude from position.** A change in the tens column is a `±` multiple of 10; in the hundreds, of 100; in the thousands, of 1000. The student learns to associate the column position with the tag's order of magnitude immediately.
- **Sign from direction.** If the new number is bigger, the tag is positive; if smaller, negative. Sounds trivial — and yet wrong-sign drops are the second-most-common early mistake. The game weeds them out fast.

## What the player sees and does
A clean white panel. The thin top status row holds the `Q1` badge with the teacher's avatar on the left, a big blue **00:00 → 00:30** countdown in the middle, and an `0/10` star tally with a soft yellow star on the right. There are no lives in this archetype — only the timer.

Below it the instruction reads: *"Drag and drop the below tags to **change** 7513 to 7553. You will get **30 seconds** to answer. Remember, to **calculate mentally**."*

The middle of the screen shows the two numbers each as a row of four cream-coloured digit tiles with bold blue digits:
- **Given number** ☟ → `7 5 1 3`
- **New number** ☟ → `7 5 5 3`

Below them is the drop zone — a small grey square labelled *"Drop the tags here ☟"* — and below it, the **tag pool**: three rectangular tag tiles in a row, e.g. `+40`, `−40`, `+400`. The pool always shows the *correct* tag plus two carefully chosen decoys: same magnitude wrong sign (`−40`), and one-place-up right sign (`+400`). The latter is the *"oh it's the tens, not the hundreds"* trap.

- **Drop the right tag** → the drop zone turns green, the given number animates digit-by-digit into the new number, the timer freezes, a soft *cha-ching* plays, and the round resolves.
- **Drop a wrong tag** → the drop zone flashes red, the tag bounces back, and a one-line hint appears: *"That's the right amount, but the wrong direction"* (sign error) or *"You're off by a place"* (magnitude error). The student tries again.
- **Run out of time** → tags dim, the correct tag floats into the drop zone in soft yellow, and the round resolves.

The whole interaction is meant to be one decisive gesture, not a process. The 30-second window is generous because the *thinking* is the bottleneck, not the dexterity.

## Shape of the experience
10 rounds, the column climbing as the game progresses:

- **Rounds 1–2 — Tens column, positive.** `1234 → 1264` (`+30`). Pool has `+30, −30, +300`. The student gets the rhythm.
- **Rounds 3–4 — Hundreds column, positive.** `2410 → 2710` (`+300`). Same shape, bigger jump.
- **Rounds 5–6 — Negative direction.** `4567 → 4527` (`−40`). The student has to actually look at which number is bigger.
- **Rounds 7–8 — Thousands column.** `3456 → 8456` (`+5000`). Pool decoys include `+500`, `−5000`.
- **Rounds 9–10 — Mixed-magnitude trap.** Pool has `+50`, `+500`, `+5000` and only one of them is right; sign distractor swapped in for round 10.

## Win condition and stars
Stars per round, summed across the run:

- **3 stars** — first-tap correct and within 15 seconds.
- **2 stars** — first-tap correct, but slower than 15 seconds.
- **1 star** — solved after at least one wrong drop.
- **0 stars** — timed out (correct tag autorevealed).

A perfect run is 30 stars. There are no lives — running out of time is a 0-star round, not a death. This is deliberate: the failure mode the game is targeting (slow column-spotting) shouldn't end the practice session, it should *be* the practice session.

## Feel and motivation
- **The cream digit tiles do real work.** The two numbers are visually styled as identical rows so the student's eye naturally zips left-to-right looking for the column where they diverge. This trains the spot-the-difference reflex without a single instruction.
- **Decoys are always exactly one slip away.** Wrong sign, or wrong place-value column. Never a random wrong number. So a wrong drop is diagnostic — a student who consistently picks `+40` instead of `−40` doesn't have a math problem, they have a direction problem; teachers can see this in the gauge view.
- **Replay is unfamiliar.** The bank pulls 10 different number pairs from a pool of about 50, so the student isn't memorising answers — they're rehearsing the *move*.

## Why it works pedagogically
Mental subtraction is one of the most-used and most-poorly-trained skills in primary math. Most curricula treat *"7553 − 7513"* as a vertical subtraction problem with borrowing, when really it's a one-column scan that should take a second. By stripping the question down to *"which tag fits"* and putting a clock on it, this game forces the student into the fluent strategy and refuses to reward the laborious one. The skill transfers everywhere subtraction shows up — money, time, change-of-state word problems — and unlocks the running-totals work that comes a year later. A 10-round session lasts about 5 minutes; doing it three times a week for a fortnight measurably moves a child's place-value reaction time.
