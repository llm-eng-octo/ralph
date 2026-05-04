# Age Matters — The Word-Problem Equation Trainer

## In one line
A word-problem speed game built around age relationships — *"Sara is 4 years older than Ravi. In 3 years, the sum of their ages will be 22. How old is Sara now?"* — that walks students from "I can't even start" to "I see the equation in the words."

## Who it's for
Class 6–8 students (ages ~11–14) who have met the idea of using a letter to stand for an unknown but still freeze when an age problem hits them in homework. The game is for students who *can* solve `2x + 3 = 17` but *can't* yet turn a sentence into that equation. It's the bridge between mechanical algebra and applied algebra.

## What it tries to teach
The whole game is built around one big, brittle skill: **translating a paragraph of English into a single linear equation in one variable**.
Three threads inside that:
- **Variable choice.** Most age problems have two unknowns (two people's ages) but only need one variable, because the second age is always expressible in terms of the first. Students learn to pick the *smaller* or *simpler* unknown as the variable so the second expression stays additive (`x + 4`) rather than awkward (`x − 4`).
- **Time-shift reasoning.** "In 5 years" means add 5 to *every* age in the room, not just one. "Five years ago" subtracts from every age. Students learn to apply the same time delta to every person in a problem, because that's what reality does.
- **Equation construction.** The crucial move is reading "the sum of their ages will be" or "twice as old as" or "the difference is" and immediately writing the corresponding equation. The game targets these phrase-to-symbol mappings explicitly.

## What the player sees and does
A clean panel with the word problem at the top in large, friendly text — about three sentences. Below it, the screen shows three numbered "build steps":

1. **Pick the variable.** Two name tiles appear. The student taps the person whose age they want to call `x`. (Wrong choice doesn't end anything, but a short prompt nudges: *"You can solve it this way, but the other choice keeps the numbers smaller.")*
2. **Write the other person's age.** A small expression-builder appears: a number pad and `+`/`−` buttons, with `x` already placed. The student taps to build something like `x + 4` or `x − 3`. The game checks the structure, not just the answer.
3. **Write the equation.** The time shift (if any) is shown above the builder as a reminder — *"In 3 years, add 3 to each."* The student then drops in the relationship that the problem describes (`+`, `=`, a number) to form an equation like `(x + 3) + (x + 4 + 3) = 22`. Once it's a valid equation, the game solves it for them — the focus is on *writing* the equation, not on the arithmetic.

After the equation is correct, the game animates the solve and shows both ages, then moves on. There's no algebra-grinding step — that's deliberate. The hard part is the *setup*, and the game keeps the spotlight there.

- **Right at any step** → green tick, a quick *chime*, the next step opens.
- **Wrong at any step** → the wrong piece flashes red, dims, and a one-line hint specific to the mistake appears: *"You wrote `x − 4`, but Sara is **older**. Try again."* No life is lost; the student fixes it and continues.
- **Stuck for too long (15s without input)** → a faint glow appears around the next correct piece. Tapping it advances. The hint nudge is gentle, not preachy.

## Shape of the experience
10 problems in three small stages:

- **Stage 1 — One person, one time shift (Rounds 1–3).** Single-person problems like *"Five years ago, Aman was 12. How old will he be in 4 years?"* These warm up time-shift thinking with no second variable in sight.
- **Stage 2 — Two people, present tense (Rounds 4–7).** *"Mira is 3 years younger than her brother. Together their ages sum to 25. How old is Mira?"* Two unknowns, one equation, no time shift. The student learns variable choice and equation construction.
- **Stage 3 — Two people across time (Rounds 8–10).** *"Anita is twice as old as Bobby. In 6 years, the sum of their ages will be 33. How old is Bobby now?"* The full skill — variable choice, time shift, equation. Three problems is enough; this is the stretch zone.

Between stages, a one-line takeaway slides in: *"Stage 2 done. Notice how picking the **younger** person as `x` kept the numbers small."* Short, specific, not a lecture.

## Win condition and stars
There are no lives. Stars are awarded by **how often the student picked the correct piece on the first tap, summed across all 10 rounds across all three steps** (so 30 step-decisions in total):
- **3 stars** — at least 27 of 30 first-tap correct.
- **2 stars** — 21–26 first-tap correct.
- **1 star** — completed all 10 rounds with fewer than 21 first-tap correct.
- **0 stars** — abandoned before round 10 (only possible if the student walks away).

This is deliberate: the game is teaching a skill, not testing under pressure. Time is unbounded. The wrong-tap penalty is purely informational (a hint), and stars reward fluency in *making the right move on the first try* — which is the actual indicator that the skill has clicked.

## Feel and motivation
- **Words feel friendly, not formal.** Names are short and common (Sara, Ravi, Mira, Aman). Numbers are small and round; nobody's age is 47. The point is not arithmetic, so the arithmetic should never be the obstacle.
- **The math gets done for you.** Once the equation is correct, the game solves it on the screen with a clean line-by-line animation — *"`2x + 7 = 22` → `2x = 15` → `x = 7.5`."* This signals that the student's job ends at the equation, and reinforces what algebra is *for*: doing the boring part automatically once the setup is right.
- **Replay is unfamiliar.** A second run loads ten *different* problems (from a bank of about 60), so students aren't memorizing answers — they're rehearsing the *move*.

## Why it works pedagogically
Age problems are the canonical "I hate word problems" topic for a reason: they require translating multiple English phrases into algebra at once. Most curricula throw whole problems at students and grade only the final answer, so a student who got the equation wrong but the algebra right looks identical to a student who got the equation right but the algebra wrong. This game pulls those steps apart and grades each one, so the student can see exactly where the skill breaks for them and fix it without the rest of the problem getting in the way. Once age problems click, the same translation moves transfer directly to motion problems, mixture problems, work problems, and most of the algebra word-problem genre — making this a high-leverage teaching investment for an age range where word-problem confidence either takes root or curdles for years.

A 10-round session takes about 8–12 minutes. Long enough to feel like a real practice block; short enough to fit at the end of a class period or the start of homework time.
