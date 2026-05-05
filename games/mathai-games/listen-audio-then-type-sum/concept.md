# One Listen Only — The Audio Mental-Sum Challenge

## In one line
A focused listening game where a calm voice reads a list of numbers — *"twelve... eight... nineteen..."* — exactly once, and the student must hold a running sum in their head as they hear it, then type the total when the recording ends.

## Who it's for
Class 4–6 students (ages ~9–12) who can comfortably add two-digit numbers on paper but who have never been forced to do it without seeing the numbers. The skill the game targets is the one mental-arithmetic move that almost no worksheet trains: **maintaining a running total while new addends arrive faster than you can write them down**. It's auditory working memory wearing arithmetic's clothes — and it's the bottleneck for everything from rapid mental change-counting to following a multi-step instruction in a busy classroom.

## What it tries to teach
The whole game is built around one quiet, hard skill: **listening, computing, and committing — without rewinds**.
Three threads:
- **Friendly-pair detection.** The instructions tell the student outright: *"Tip: Check for friendly pairs that make 10, 20, 30, 40 or 50 to add faster."* In a list of `12, 8, 17, 13, 4, 6, 25` the fluent solver hears `12 + 8 = 20` and `17 + 13 = 30` and `4 + 6 = 10` *as the numbers arrive*, not after. The student's job is to listen *for* pairs, not just *to* numbers.
- **Working-memory chunking.** The list is long enough (8–12 numbers) that holding individual numbers is impossible — the student must commit to a running total and forget the numbers behind them. This is exactly what fluent mental arithmetic feels like, and it is rarely practised because the textbook always shows the numbers.
- **Single-shot commitment.** The audio plays *once*. The replay button greys out after the first play. There is no scrubbing back. The student must accept that they didn't catch a number and either ask their brain to fill it in or commit to their best total. The discomfort is the practice.

## What the player sees and does
A spacious, almost cinematic layout — most of the screen is whitespace, because the action is auditory.

At the top, a thin status row — round badge `Q1`, a friendly avatar, a big blue countdown timer (`00:24`), and a soft mint star tally `0/10`. The timer here is for the *full round*, not just the audio — the student has 30 seconds total from the moment the audio starts.

Below the header, a multi-line instruction: *"Numbers will be read one by one in the voice note. Add them **mentally** and as you hear them. 💡 Tip: Check for friendly pairs that make 10, 20, 30, 40 or 50 to add faster. You can play the voice note only **1 time**."*

The audio player itself is a soft, friendly pill — a yellow circular play button with a cream-yellow progress bar to its right. There is no waveform, no number markers — just a track that fills as the voice progresses, so the student knows roughly how far they are without being told *which* number is playing.

Below the player, a small instruction *"Write the total here 👇"* with a small pointing-hand emoji, then a single white input box.

- **Tap play** → the voice begins reading numbers, one per ~1.2 seconds, with a clear pause between each. The play button greys out the moment the audio ends; it cannot be retapped.
- **Type the correct total and submit** → the box turns green, a quiet *cha-ching*, the next round loads.
- **Type a wrong total** → the box flashes red, a heart deflates, and the correct total is revealed in a small text below: *"The total was 87."* No diagnostic hint here — wrong-total reasons are too varied to label cleanly.
- **Run out of time** without typing → all interaction freezes, the correct total is shown, and the round ends.

## Shape of the experience
10 rounds, scaling steadily:

- **Rounds 1–2 — Short and friendly.** 5–6 numbers, all under 15, with at least one obvious friendly pair (`12, 8, 5, 7, 3` → friendly pair `12 + 8`). Read at a comfortable 1.2-second cadence.
- **Rounds 3–6 — Standard.** 7–9 numbers, mixed sizes from 5 to 25, friendly pairs hidden among non-pairs (`14, 6, 18, 9, 7, 12, 23` — the pairs are `14 + 6` and `18 + 12`, but they aren't adjacent). The student must hold candidates from earlier in the list.
- **Rounds 7–10 — Stretch.** 10–12 numbers, sizes up to 35, audio cadence slightly faster (1 second per number). At least one round has *no* friendly pairs, forcing pure running-sum technique.

## Win condition and stars
A run is 10 rounds with 3 lives. Each life-loss happens on a wrong total or a timed-out non-answer. Stars are based on first-attempt correctness:
- **3 stars** — 9 or 10 first-attempt correct.
- **2 stars** — 6–8 first-attempt correct.
- **1 star** — at least 1 first-attempt correct.
- **0 stars** — all 3 lives lost.

There is no per-round retry; the audio plays once per round and there's no second chance to relisten.

## Feel and motivation
- **The voice is the game.** It is calm, evenly paced, never urgent. There is no music underneath. The student must develop comfort with listening as a math activity — most math is shown, not heard, and that asymmetry is what this game corrects.
- **The play-only-once rule is the lesson.** Students initially hate it, then find that they listen *much* harder once they accept it. This single design decision is what separates this game from a passive listening exercise.
- **Friendly pairs are visible only in retrospect.** After the round resolves, the game flashes the list visually with the friendly pairs highlighted (`14 + 6` in green, `18 + 12` in green) — so the student can see, post-mortem, what their brain could have grabbed onto. Over 10 rounds this trains the ear to listen *forward* for those pairs.

## Why it works pedagogically
Almost every mental-arithmetic exercise in school is silent: the numbers are on the page, the student adds them. But fluent mental arithmetic in real life — counting change at a stall, adding a list of grocery prices, totalling cricket scores — is overwhelmingly *auditory and one-shot*. By forcing the student to add what they hear, this game closes a gap the curriculum doesn't even acknowledge. It also exposes a useful diagnostic: a student who is fluent on paper but freezes on audio has not built the working-memory layer of arithmetic, and that gap, once visible, can be closed in two weeks of three-minute daily sessions. A 10-round run takes about 6–8 minutes and feels surprisingly intense for a game where the only physical action is pressing one play button and typing one number.
