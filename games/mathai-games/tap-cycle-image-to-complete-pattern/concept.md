# Three Patterns, One Mind — The Visual Sequence Solver

## In one line
A pattern-completion game where the student looks at three short visual sequences side by side, taps the question-mark slot to cycle through possible answers, and lands on the one image that finishes each sequence the way it wants to be finished.

## Who it's for
Class 2–4 students (ages ~7–10) who are starting to see "patterns" as a real skill in school but tend to confuse *the rule* with *the next picture*. The game is for the moment when a child can recognise an obvious AB-AB-AB pattern but freezes when the pattern involves rotation, fractional fill, or a subtle change of position — the kinds of patterns that show up on entrance tests, math olympiads, and the visual-reasoning section of every standardised exam from here onward.

## What it tries to teach
The whole game is built around one habit: **read a sequence as a rule, predict what comes next, then verify by tapping**.
Three threads inside that:
- **Identifying the rule before predicting.** Children at this age tend to guess the next image first and then hunt for a justification. The game makes that strategy painful — there are 4–6 possible images per slot, all visually similar, so guessing without a rule means cycling forever. The student learns to *say the rule out loud* (*"the dot moves clockwise around the corner"*) before tapping anything.
- **Multiple kinds of rules in one screen.** The three sequences on the screen are deliberately of different rule families — a rotational pattern (a square with a moving dot), a fractional-fill pattern (circles filled in growing quarters), and a positional pattern (a cross with a dot drifting along its arms). The student has to reset their rule-finding lens *three times* in one round.
- **Verification by elimination.** Because tapping cycles, not selects, the student can only confirm an answer by exhausting the other options and noticing that the cycled-to image is the unique one that fits. Patience and process-of-elimination are first-class skills here.

## What the player sees and does
A bright, sparse layout. The status row sits at the top — round badge `Q1` on the left, a big blue countdown timer reading `00:44` in the centre, hearts with a count of `2` and a progress chip `0/10` on the right.

Below the status row, two short instruction lines: *"**Tap** on the blocks with question marks to change the image."* and *"Keep tapping until you find the correct match to **complete all** 3 patterns!"*

The body of the screen is three horizontal pattern strips stacked vertically, each one a row of five thumbnail tiles separated by faint dividers:

- **Strip 1 — the rotation.** Five lavender squares; each has a single small purple dot at one of the four corners. The dot moves position from tile to tile in a clockwise rule, but tile 4 is a pink question mark waiting to be set. The student has to spot that the dot's corner rotates one quarter-turn each step and pick the matching corner image.
- **Strip 2 — the filling.** Five circles, each split into quadrants and shaded in blue by an increasing fraction (one-quarter, then two-quarters, then three-quarters, then four-quarters). Tile 2 is the question mark. The student has to read the fraction sequence and choose the correctly-shaded circle.
- **Strip 3 — the drifting dot on a cross.** Five pink crosses, each with a small lavender dot at a different point along the arms. Tile 3 is the question mark. The student has to find the rule that determines where the dot moves next.

Each question-mark tile is interactive. Tapping it cycles forward through the candidate images for that slot. There is no separate "submit" — the round resolves automatically when *all three* question marks are simultaneously holding their correct image.

- **All three slots correct** → the three tiles flash green in unison, a soft chord plays, the timer freezes, and the round badge ticks up.
- **A slot lands on a wrong image** → nothing happens; the student keeps cycling. There's no penalty per tap, because tapping is the exploration mechanism.
- **Run out of time (60 seconds)** → the slots that are still wrong dim, the correct images fade in to show the answer, and a heart shatters in the top-right.

## Shape of the experience
10 rounds, where each round is a *fresh trio of three sequences*:

- **Rounds 1–3 — Friendly rules.** All three sequences in the round use simple AB-AB-AB or counting-up patterns. Rotation steps are quarter-turns. Fills go in halves and wholes.
- **Rounds 4–7 — Mixed rule families.** Each round mixes one rotation, one fill, and one positional. The student must context-switch within the round.
- **Rounds 8–10 — Compound rules.** Sequences combine two transformations at once — *both* rotate *and* change colour, or *both* shift *and* fill — so identifying the rule requires factoring the change into independent dimensions.

## Win condition and stars
Three lives across the run. A heart is lost only on time-out, never on individual taps (since tapping is exploration, not commitment). Stars per round are based on solve time:
- **3 stars** — all three slots correct in under 30 seconds.
- **2 stars** — solved in 30–60 seconds.
- **1 star** — solved with at least one heart remaining, regardless of time on this specific round.
- **0 stars** — round timed out and a life was lost.

The session ends when all 10 rounds are complete or all 3 hearts are lost.

## Feel and motivation
- **Cycling feels like a wheel, not a list.** Tapping a question-mark tile produces a small spinning animation as the image flips to the next candidate, with a soft *click* per change. Children quickly learn that the wheel comes back around — there are no hidden options, only patient cycling.
- **The wrong answers teach.** The candidate images for each slot are not random distractors — they are *adjacent positions in the rule-space*. The dot at corner A, B, C, D for the rotation strip; the fills at 0/4, 1/4, 2/4, 3/4, 4/4 for the fraction strip. So a student stuck on a slot is essentially scrolling through *what could have been here if the rule were slightly different*, which is itself a lesson in how rules generate options.
- **Three at once teaches focus discipline.** Because the round only resolves when all three are correct, students learn not to abandon a partially-solved strip while chasing the next one. They learn to lock one in mentally before moving on.

## Why it works pedagogically
Visual pattern recognition is a deceptively load-bearing skill: it shows up in early algebra (sequences and series), geometry (transformation and symmetry), and the abstract-reasoning sections of standardised tests right through middle school. Most classroom patterns work on the unfortunate assumption that the answer will be obvious if you just stare hard enough — which works for the first 20% of children and quietly fails the rest. By forcing a tap-to-cycle interaction across three different *kinds* of rules in the same round, the game makes "find the rule, then verify" into a physical loop the student must actually perform. Children who finish a session don't just feel sharper — they have rehearsed the meta-skill of *deciding what kind of pattern this is* before guessing, which is the move that transfers. A 10-round session takes about 5–8 minutes, fitting easily into the start of a math period or as a brain-warmup before harder problem-solving work.
