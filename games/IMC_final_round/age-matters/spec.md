# Game Design: Age Matters — The Word-Problem Equation Trainer

> **REDESIGN — 2026-04-30 (authoritative; supersedes the 3-step build flow described below).**
> The game now shows **one age word problem per round** plus **a single numeric input** and a **Submit** action (handled by FloatingButton). The student types the final age in the box and submits; right answers advance, wrong answers shake the input red, reveal the correct value, and advance after a short pause. There is **no variable-choice tile, no expression builder, no piece bank, no equation-construction step** in the live build. Star rubric is now **first-attempt-correct out of 10** (≥9 = 3⭐, ≥6 = 2⭐, <6 with completion = 1⭐, abandoned = 0⭐). All later sections that describe Step 1 / Step 2 / Step 3 sub-decisions, slot templates, piece banks, misconception tags per piece, and the 30-decision star rule remain as **historical / data-shape context** (the round objects in `fallbackContent` still carry the `step2`/`step3`/`pieceBank`/`correctPieces` keys for forward compatibility) but are **not rendered** by the current build. The live skill is *solving* the problem end-to-end, not staged translation.

> **Archetype + Input-Pattern Rationale (live build).** This is now a single-input direct-answer game closest to **Q&A / numeric-recall** (archetype #2 / #3 family) rather than #7 Construction. Interaction pattern is **type-and-submit** via a numeric `<input>` plus FloatingButton's Submit CTA. **`answerComponent` remains `true`** — the post-victory carousel still walks through each round's canonical equation and algebraic solve so the student sees *how* each answer was reached.

## Identity
- **Game ID:** age-matters
- **Title:** Age Matters — The Word-Problem Equation Trainer
- **Class/Grade:** Class 6–8 (ages ~11–14). Explicitly stated by the creator.
- **Math Domain:** Algebra — Linear Equations from Word Problems
- **Topic:** Translating English-language age problems into a single linear equation in one variable (variable choice → second-age expression → equation construction; with time-shift reasoning in Stages 1 and 3).
- **Bloom Level:** L4 Analyze — translating a multi-sentence paragraph into algebraic form requires intersecting multiple semantic constraints (who is older, what time delta applies, which phrase encodes the equation). This is canonical L4 (analyze-then-construct), not L3 (apply a procedure). The construction itself is broken into 3 first-tap-correct sub-decisions per round so the analysis is *graded at each translation step* rather than only at the final answer.
- **Archetype:** #7 Construction — student assembles a linear equation from a piece bank. Modifier: **Multi-Step MCQ** (each round has 3 sequential decision steps; each step's evaluation is a P1 single-select tap).
- **NCERT Reference:**
  - **Class 6 — *Algebra* (Ch. 11)** — introduction of variables and using them to express patterns; first formal exposure to "let x stand for an unknown".
  - **Class 7 — *Simple Equations* (Ch. 4)** — solving linear equations of the form `ax + b = c`; the *mechanical* solving step that this game deliberately delegates to an animation so the student can focus on *setting up* the equation.
  - **Class 8 — *Linear Equations in One Variable* (Ch. 2)** — full treatment of word problems including age, ratio, money, and number problems. Age problems are the load-bearing example in NCERT Class 8 §2.3.
- **Pattern:** P1 (Tap-Select Single) used N times per round under the Multi-Step MCQ modifier (3 sub-steps per round). NOT drag-and-drop. Step 4 (Build) runs as a `[SUB-AGENT]` (no main-context override needed; no CDN library beyond the standard CDN core).
- **Input:** Single-tap on tiles. Step 1 = tap one of two name tiles. Step 2 = tap pieces from a small piece bank (`x`, digits, `+`, `−`) to build the second-age expression — each tap places the piece into the next slot in a constrained expression slot template; tapping a placed slot clears that slot. Step 3 = same tap-to-place piece-bank interaction to assemble the full equation, with one or more constrained slot templates pre-shaped to the equation form. No keyboard, no drag, no text input.

## One-Line Concept
The student translates short, friendly age problems into a single linear equation by tapping through three small decisions per round — pick the variable, write the other person's age, write the equation — while the game does the algebra solve for them, putting the spotlight squarely on the setup move that is the canonical L4 skill in algebra word problems.

## Target Skills

| Skill | Description | Round Type |
|-------|-------------|------------|
| Variable choice | Pick the *smaller* / *simpler* unknown so the second age is additive (`x + k`), not subtractive. Stage 2+ skill. | B, C |
| Time-shift reasoning | "In `k` years" adds `k` to *every* age in the room; "`k` years ago" subtracts. Single-person form in Stage 1, two-person form in Stage 3. | A, C |
| Phrase-to-symbol mapping | "Sum of their ages will be" → `+ … =`; "twice as old as" → `2 ·`; "the difference is" → `−`. The crucial L4 translation move. | B, C |
| Equation construction | Assemble a full linear equation in one variable from authored pieces. Round-defining skill across all 10 rounds. | A, B, C |
| Robust setup under context shifts | Same translation move applied across present-tense, single-person time-shift, and two-person time-shift contexts. | A → B → C progression |

## Core Mechanic

> **Live build (2026-04-30):** Each round renders the word problem at the top of the play area, an `0/10 correct` chip, and a single bordered card containing a label (`Your answer`), a numeric `<input>`, and the platform FloatingButton acting as the **Submit** CTA. The student types the integer age and submits. Right answer → input turns green, +1 to `firstTapCorrect`, soft chime, advance to next round. Wrong answer → input shakes red, hint reads `Not quite. The answer is N. Moving on.`, advance after ~1.2 s. No retry, no piece banks, no slot templates, no per-step idle nudge. The round-set cycling (3 sets × 10) and AnswerComponent end-game carousel still ship; everything described in the per-stage subsections below is **historical** and reflects the *original* 3-step design.

### Type A: "Single person, one time shift" (Rounds 1–3, Stage 1)

The simplest form. One person, one time delta, no second-age expression. Step 2 collapses: there is no "other person" — the second-age slot template just shows `(x ± k)` already prefilled and the student confirms the *direction* (+ or −). Step 3 (equation) is the load-bearing decision.

1. **What the student sees**
   - **Word-problem panel** at top: 2 short sentences in friendly large text. Example: *"Five years ago, Aman was 12. How old will he be in 4 years?"*
   - **Step indicator** (`Step 1 / 3`, `Step 2 / 3`, `Step 3 / 3`) — small chip under the problem.
   - **Step 1 — Variable choice** (rendered for consistency even though there's only one person; the only tile is `Aman = x`, displayed alone — the student taps it to confirm the variable. This keeps the 3-step structure consistent across all 10 rounds and earns one first-tap point on the friendliest possible decision).
   - **Step 2 — Time-shift direction tile-row** (rendered ONLY in Stage 1 Type A): two tiles `x − 5` and `x + 5` (where `5` is the past time delta from the problem). The student taps the tile that correctly represents Aman's age 5 years ago given `x` is his age *now*. Wrong tap → contextual hint ("5 years ago means subtract 5, not add 5"), no life lost.
   - **Step 3 — Equation builder**: a slot template appears showing the equation skeleton with empty drop-slots. Example for Aman: `[ ] = 12` (where `[ ]` is to be filled with `x − 5`). A small **piece bank** below the slot template shows tiles: `x`, `−`, `+`, `5`, plus 2–3 distractor pieces (e.g. `4`, `12`, `=`). Tapping a piece places it into the next empty slot; tapping a filled slot clears that slot back to empty (undo). When all slots are filled, the equation auto-evaluates against the round's canonical equation (structural match, see "What counts as correct").
2. **What the student does** (input: tap-to-select / tap-to-place; P1 used N times per round, Multi-Step MCQ modifier)
   - Step 1: tap the (single) name tile → green tick → step opens to Step 2.
   - Step 2: tap one of the two direction tiles → green tick on correct, contextual hint on wrong (no life), tap again to retry.
   - Step 3: tap pieces from the bank to fill the slot template; auto-evaluation when all slots full. Wrong piece in a wrong slot → that slot+piece pair flashes red, dims, contextual hint appears, slot clears, student retries.
3. **What counts as correct**
   - Step 1: the student tapped the (only) name tile. Recorded as first-tap correct (for stars accounting).
   - Step 2: the tile chosen represents the correct age expression for the past tense ("5 years ago" → `x − 5`).
   - Step 3: the constructed equation **structurally matches** the canonical equation. "Structural match" is checked by normalizing operand order (commutative `+`) and comparing the resulting expression tree to the round's `canonicalEquation` AST. e.g. `(x + 4) = 12` and `12 = (x + 4)` both match (canonicalEquation is `x + 4 = 12` with `=`-side commutativity allowed). Number-distractor pieces (e.g. `4`, `12` in the wrong slot) trigger a *misconception-tagged* hint.
4. **What feedback plays**
   - **Step-correct (any step, first tap)** : soft chime SFX (fire-and-forget, ~150 ms), green tick lands on the correct piece/tile. No TTS, no input block. The next step opens immediately. Contributes +1 to the running first-tap counter for star accounting.
   - **Step-correct (after one or more wrong taps on this step)**: same soft chime SFX (fire-and-forget). Step opens. Does NOT contribute to first-tap counter (already disqualified for this step).
   - **Step-wrong (any step, lives unaffected)**: short red flash (~600 ms) on the offending tile/piece + soft sad SFX (fire-and-forget). Contextual hint appears in a small inline panel below the play area: e.g. "You wrote `x − 4`, but Sara is **older**. Try again." Hint is misconception-tagged (see Content Structure). No life lost. Input re-enabled after flash.
   - **Idle nudge (15 s without input on the active step)**: a faint glow (`box-shadow: 0 0 12px var(--mathai-color-accent)`, 1.5 s ease-in-out, infinite alternate) appears around the next correct piece/tile. Fires ONCE per step. Tapping the glowing piece advances normally (counts as wrong-then-right for the first-tap counter — the glow is a forfeit of the "first-tap correct" reward).
   - **Round-equation correct (Step 3 final placement)**: per-piece celebration glow propagates across the assembled equation, awaited round-complete SFX with celebration sticker, then the **algebraic solve animation** plays in-place: the equation re-renders with line-by-line transformations (e.g. `2x + 7 = 22` → `2x = 15` → `x = 15/2 = 7.5`), each line fading in over ~600 ms with a soft tick SFX per transformation, and the final values for both ages displayed as captioned bubbles ("Sara: 11, Ravi: 7"). The animation runs ~3–4 s. Awaited dynamic TTS plays alongside the final line ("Sara is eleven, Ravi is seven."). Auto-advance to next round transition.
   - **Step 3 piece in wrong slot**: red flash on the slot, dim the wrong piece, contextual hint ("That's not the operator we need here — what does *sum* tell us to do?"), slot clears. Student retries. No life lost.

### Type B: "Two people, present tense" (Rounds 4–7, Stage 2)

Two unknowns, one variable, one equation. NO time shift. Variable choice is now a real decision (tap the *younger* or *simpler* person). Step 2 is a real second-age expression build. Step 3 is the equation.

1. **What the student sees**
   - **Word-problem panel**: 2–3 sentences. Example: *"Mira is 3 years younger than her brother Ravi. Together their ages sum to 25. How old is Mira?"*
   - **Step 1 — Variable choice**: two name tiles side by side (`Mira` and `Ravi`). The student taps the one they want to call `x`. The "preferred" variable for star accounting is the one that makes the second expression additive (smaller / simpler person → second expression is `x + k`, not `x − k`). Tapping the non-preferred variable does NOT lose a life and lets the student continue (the equation will still be solvable as `x − 3` with adjustments) — but it forfeits the first-tap point AND triggers a one-line contextual hint: *"You can solve it this way, but picking the younger person keeps the numbers smaller. Try the other tile?"* The student can then tap the other tile to switch (which counts as the first-tap correct path forfeit, but the rest of the round proceeds with the preferred variable).
   - **Step 2 — Other person's age expression**: a slot template `[ ] [ ] [ ]` (three slots) appears with `x` already pinned in the first slot (un-clearable; this is a scaffolded hint that all expressions are of the form `x ± k`). Piece bank shows: `+`, `−`, the correct number, 1–2 distractor numbers. Student taps `+` or `−`, then the correct number. Auto-evaluation when all 3 slots filled.
   - **Step 3 — Equation**: a larger slot template appears showing the equation skeleton: `[ ] + [ ] = [ ]` (for sum problems) or analogous shape for difference / multiple problems. Some slots may be pre-filled with the expressions the student just built (e.g. `x` in the left slot, `x + something` in the right slot derived from Step 2) — but the student still needs to assemble the rest. Piece bank shows the remaining required pieces plus distractors. Auto-evaluation on slot-full.
2. **What the student does**: same tap-to-select / tap-to-place pattern as Type A, repeated for the 3 sub-steps. Each step has its own piece bank or tile row.
3. **What counts as correct**
   - Step 1: tapped the *preferred* variable on first tap (smaller / simpler person, per the round's `preferredVariable` field).
   - Step 2: the assembled expression equals the round's `otherAgeExpression` AST.
   - Step 3: the assembled equation structurally matches the round's `canonicalEquation` AST (commutativity allowed for `+` and across `=`).
4. **What feedback plays**: same as Type A. Wrong-step plays sad SFX + contextual hint + slot clear. Right-step plays soft chime + step opens. Round-equation correct plays celebration + algebraic solve animation + TTS reading both ages aloud.

### Type C: "Two people across time" (Rounds 8–10, Stage 3)

Full problem: two people + a time delta applied to both. Variable choice + time shift + equation construction in one round. The stretch zone.

1. **What the student sees**
   - **Word-problem panel**: 3 sentences. Example: *"Anita is twice as old as Bobby. In 6 years, the sum of their ages will be 33. How old is Bobby now?"*
   - **Step 1 — Variable choice**: two tiles (`Anita`, `Bobby`). Preferred variable is the *younger / simpler* one (Bobby in this example, because Anita = 2x is the simpler expression).
   - **Step 2 — Other person's age (present tense, BEFORE the time shift)**: same slot-template pattern as Type B. For "twice as old" the slot template is `[2] · [x]` with the `·` pinned and slot for `2` and slot for `x` to fill. For "younger by k" / "older by k" the template is `[x] [+/−] [k]` as before.
   - **Step 2.5 — Time-shift reminder banner** (NOT a separate step — a passive UI element): above the Step-3 builder, a small banner reads *"In 6 years, add 6 to each age."* This is a free hint (no decision), present in Type C only. It scaffolds the time-shift application.
   - **Step 3 — Equation**: full equation slot template, e.g. for "in 6 years, sum will be 33": `([ ] + [ ]) + ([ ] + [ ]) = [ ]` — Bobby's future age plus Anita's future age equals 33. Pre-filled slots (where appropriate, e.g. `x`, `6`, `2x`, `6`, `33`) reduce piece-bank clutter, but the student still composes the operators and remaining numbers. Piece bank includes correct pieces + 2–3 distractors (e.g. a piece without the time-shift, a piece with the wrong sign).
2. **What the student does**: same tap-to-select / tap-to-place pattern.
3. **What counts as correct**: each step matches its canonical AST. The full equation must encode BOTH the relationship AND the time shift. Distractor "no time shift" or "time shift on only one person" triggers misconception-tagged hints.
4. **What feedback plays**: same as Types A and B. The algebraic solve animation in Stage 3 may produce a fractional answer (e.g. `x = 7.5`) — this is fine and is the deliberate "the math gets done for you" pedagogical point.

## Rounds & Progression

Per the concept: **10 rounds, 3 stages**, 3-7-3 split is also acceptable but creator brief specifies 3-4-3:

- Stage 1 (Type A) — Rounds 1–3 (warm-up: single person, time shift only).
- Stage 2 (Type B) — Rounds 4–7 (two people, present tense).
- Stage 3 (Type C) — Rounds 8–10 (full skill: two people + time shift).

Between Stage 1→2 and Stage 2→3, a one-line takeaway transition slides in:
- **After Round 3** (Stage 1 → Stage 2 boundary): *"Stage 1 done. Time-shifts add or subtract from every age in the room."*
- **After Round 7** (Stage 2 → Stage 3 boundary): *"Stage 2 done. Notice how picking the **younger** person as `x` kept the numbers small."*

These are TransitionScreens with a tap-to-continue CTA, motivation VO, no decision required.

### Stage 1: Single person, one time shift (Rounds 1–3, Type A)

- Round type: A.
- **Difficulty parameters:**
  - One person; pre-validated common short name (Aman, Sara, Ravi, Mira, Bobby, Anita).
  - One time delta `k ∈ {2, 3, 4, 5, 6}` (small round numbers).
  - Tense varies: 1 round past ("k years ago"), 1 round future ("in k years"), 1 round mixed ("k years ago, X was N. In m years, …" — single-person multi-step).
  - Numbers stay ≤ 20 throughout the equation.
- **Expected first-solve rate**: ~85 % (warm-up).
- **Piece-bank distractor count**: 2 distractors per piece bank.

### Stage 2: Two people, present tense (Rounds 4–7, Type B)

- Round type: B.
- **Difficulty parameters:**
  - Two people, two short names per round.
  - Relationship: "older by k", "younger by k", "twice as old", "three years more than".
  - Sum constraint: "their ages sum to N", "their ages add up to N", "together they are N".
  - Difference constraint (one round): "the difference is N", "X is N years older".
  - Numbers stay ≤ 30; canonical answer always integer ≤ 25.
- **Expected first-solve rate**: ~70 %.
- **Piece-bank distractor count**: 3 distractors per piece bank.

### Stage 3: Two people across time (Rounds 8–10, Type C)

- Round type: C.
- **Difficulty parameters:**
  - Two people + a time delta (past or future) applied to both.
  - Relationship: same set as Stage 2 PLUS "twice as old", "thrice as old".
  - At least one round produces a fractional canonical answer (e.g. `x = 7.5`) — the algebraic solve animation handles this gracefully and the captioned bubbles round to one decimal.
  - Numbers stay ≤ 40; canonical answer ≤ 30 (fractional permitted).
- **Expected first-solve rate**: ~50 %.
- **Piece-bank distractor count**: 3 distractors per piece bank.

### Stage summary

| Dimension | Stage 1 (Rounds 1–3) | Stage 2 (Rounds 4–7) | Stage 3 (Rounds 8–10) |
|-----------|----------------------|----------------------|-----------------------|
| Round type | A (single person + time shift) | B (two people, present tense) | C (two people + time shift) |
| Number of decisions per round | 3 (Step 1 trivial, Step 2 direction, Step 3 equation) | 3 (Step 1 variable choice, Step 2 expression, Step 3 equation) | 3 (Step 1 variable choice, Step 2 expression, Step 3 equation w/ time shift) |
| Canonical numbers cap | ≤ 20 | ≤ 30 | ≤ 40 |
| Canonical answer cap | ≤ 20 (integer) | ≤ 25 (integer) | ≤ 30 (fractional permitted) |
| Piece-bank distractors | 2 per bank | 3 per bank | 3 per bank |
| Time-shift reminder banner | hidden (single person, banner not needed) | n/a (no time shift) | shown above Step 3 |
| Expected first-solve rate | ~85 % | ~70 % | ~50 % |
| Stage takeaway after | "Time-shifts add or subtract from every age" | "Picking the younger person as `x` kept numbers small" | (no takeaway after Round 10 — Victory follows) |

**Round-set cycling (MANDATORY):** The runtime round-set-cycles `fallbackContent.rounds`. Set A plays first attempt; Set B plays after Try-Again / Play-Again; Set C plays after the next restart, then back to A. The spec authors **three full sets (A, B, C) × 10 rounds each = 30 round objects total**. Each set uses different names, numbers, and tenses but parallel difficulty (Set A's Round 1 ≈ Set B's Round 1 ≈ Set C's Round 1 in equation shape and decision count). The concept requires a **bank of about 60 problems** so the student doesn't memorize across replays — three full sets of 10 = 30 unique problems committed in `fallbackContent`; the remaining ~30 problems described in the concept's bank live in `pre-generation/problem-bank.md` for future expansion (out-of-scope for v1; see "Out of Scope"). Each round object carries `set: 'A' | 'B' | 'C'`. `setIndex` rotates on restart and persists across restarts within the session — it is NOT cleared in `resetGameState`.

## Game Parameters

- **Rounds:** 10 per session.
- **totalRounds:** 10.
- **Timer:** None (`timer: false`). The concept explicitly says "Time is unbounded." L4 deserves deliberation; the game is teaching a translation skill, not testing under speed pressure. PART-006 NOT included.
- **Lives:** 0 (`totalLives: 0`). The concept explicitly says "There are no lives." Wrong taps trigger a hint, no penalty. The pipeline default for Construction at L4 is "None or 5" — we are choosing **None** per creator brief. Note that a Lives = 0 archetype-7 game has NO `game_over` screen — see "Flow" below.
- **Lives semantics:** N/A (none). The student can ALWAYS complete all 10 rounds; the only failure mode is voluntary abandonment (closing the tab). The 0-star outcome reflects this.
- **retryPreservesInput:** N/A (multi-round game; flag ignored).
- **autoShowStar:** `true` (default; PART-050 standard).
- **Star rating** (creator-specified, redesigned 2026-04-30; based on **first-attempt-correct out of 10**):
  - **3⭐** = 9 or 10 first-attempt correct.
  - **2⭐** = 6, 7, or 8 first-attempt correct.
  - **1⭐** = completed all 10 rounds with ≤ 5 first-attempt correct.
  - **0⭐** = abandoned before reaching the Round-10 Victory transition (only possible if the student walks away or closes the tab).
- **Input:** Tap-to-select (P1) on tiles + tap-to-place on piece-bank pieces. No drag, no keyboard, no submit button (each step auto-evaluates on full slot-template fill or on direct tile tap).
- **Feedback:** PART-017 FeedbackManager (preloaded SFX, dynamic TTS). Per-step right/wrong feedback. Per-round equation-complete celebration + algebraic solve animation + TTS. Per-stage takeaway transition. End-of-game Victory + Stars Collected + AnswerComponent carousel.
- **previewScreen:** `true` (PART-039 default).
- **answerComponent:** `true` (creator did not opt out; default ships). The 10-slide carousel at end-of-game shows each round's *canonical equation in solved form* — the equation the student built + the algebraic solve in 2–3 lines + the captioned ages — so the student can review the canonical setup move for every round, including rounds they got first-tap-correct (the carousel is not gated on accuracy).
- **PARTs Used:** PART-001/004/005/007/008/009/010/042 (core), PART-017 (FeedbackManager — sound + TTS for per-round answer-correct + per-round wrong feedback), PART-019 (results), PART-021 (mobile layout), PART-023 (ProgressBar with 10 segments + first-attempt counter chip "X/10 correct" displayed alongside the bar), PART-024 (TransitionScreen — Welcome, per-stage takeaway breathers, Victory, Stars Collected), PART-025 (ScreenLayout), PART-027 (Play Area), PART-039 (PreviewScreen), PART-050 (FloatingButton — **owns in-round Submit CTA** plus end-of-game Next), PART-051 (AnswerComponent — 10-slide carousel after Victory).

## Scoring

- **Points (live build, redesigned 2026-04-30):** First-attempt-correct count out of 10. `gameState.score = gameState.firstTapCorrect = number of rounds answered correctly on the first submit`. Each round contributes 0 or 1 point. Wrong-on-first-submit forfeits the point for that round even if the correct answer is shown afterwards (the round always advances either way; there is no retry).
- **Stars (live build):** Computed from `firstTapCorrect` (0..10) AND completion state.
  ```js
  function getStars() {
    const firstTap = gameState.firstTapCorrect; // integer 0..10
    if (gameState.currentRound < gameState.totalRounds) return 0; // abandoned mid-session
    if (firstTap >= 9) return 3;
    if (firstTap >= 6) return 2;
    return 1; // completed all 10, ≤ 5 first-attempt correct
  }
  ```
- **Lives:** None. No game-over screen. `gameState.lives` is initialized to 0 and never decremented.
- **Partial credit:** None — each round is single-attempt single-point. A round contributes 1 or 0 to `firstTapCorrect`.

### Star Generosity Audit

(Authored per spec-creation skill expectation that L4 mastery games not give 3⭐ for free. Heuristic: 3⭐ should require demonstrated mastery, not survival.)

| Outcome scenario | Rounds completed | First-tap correct (out of 30) | Stars (per spec) | Generosity verdict |
|------------------|------------------|-------------------------------|------------------|--------------------|
| Completed all 10, no wrong taps anywhere | 10 | 30 | **3⭐** | TIGHT — perfect run only. Correct for L4 mastery. |
| Completed all 10, 3 wrong taps total | 10 | 27 | **3⭐** | NEUTRAL — 27/30 = 90 %, allows minor slips on hardest steps. |
| Completed all 10, 8 wrong taps total | 10 | 22 | **2⭐** | NEUTRAL — 22/30 = 73 %, broad middle band. |
| Completed all 10, 12 wrong taps total | 10 | 18 | **1⭐** | NEUTRAL — completion is acknowledged as progress. |
| Completed all 10, every step wrong on first tap | 10 | 0 | **1⭐** | LOOSE — but the student DID complete every round, which IS progress. The 1⭐ floor for completion preserves emotional safety. |
| Abandoned at Round 5 | 4 (round 5 in progress) | any | **0⭐** | TIGHT — only the abandonment case earns 0⭐. Correct framing per concept. |

**Verdict:** The star rule is appropriately tight at the 3⭐ end (90 %+ first-tap correct) and generously framed at the 1⭐ floor (completion = at least 1⭐). 0⭐ is reserved for abandonment, which is the genuine "no progress" case. **No generosity inflation detected at the 3⭐ end. The 1⭐ floor is a deliberate emotional-safety choice (the game is teaching a skill, not testing).**

## Flow

**Shape:** Multi-round (default).

**Changes from default:**
- Inserted **Stage-1→2 takeaway** transition between Round-3 feedback and Round-4 intro (flow-gallery: "section-intro / pep-talk every N rounds" — adapted as a single one-line takeaway, no decision).
- Inserted **Stage-2→3 takeaway** transition between Round-7 feedback and Round-8 intro (same pattern).
- **No Game Over branch** — Lives = 0, so the lives-exhausted path is removed (per archetype-7 default + per "Lives = 0 means no `game_over` screen" rule). The only off-ramp from gameplay is Victory after Round 10.
- **Algebraic solve animation** plays *inside* the gameplay screen between Round-N feedback and Round-(N+1) intro (NOT a separate transition screen). It is part of the Round-complete feedback beat, not a new screen.

```
┌──────────────────────────────────────────────────────────────────────────┐
│   Preview Screen (PART-039)                                              │
│   ─ instruction text + audio                                             │
│   ─ "Start" CTA                                                          │
│              │                                                           │
│              ▼                                                           │
│   Welcome / Round 1 transition (PART-024 TransitionScreen)               │
│   ─ "Round 1 of 10" + audio                                              │
│   ─ tap to begin                                                         │
│              │                                                           │
│              ▼                                                           │
│   Gameplay: Round 1 (Type A, single person, time shift)                  │
│   ─ Step 1 (variable confirm), Step 2 (direction), Step 3 (equation)     │
│   ─ tap-to-select / tap-to-place                                         │
│   ─ on wrong tap: red flash + sad SFX + contextual hint, slot clears     │
│   ─ on right tap (any step, any time): green tick + soft chime           │
│   ─ on Step-3 equation correct: celebration + algebraic solve animation  │
│      (in-place, ~3–4 s, line-by-line, with tick SFX + final TTS)         │
│              │                                                           │
│              ▼                                                           │
│   Round 2 transition ─ "Round 2 of 10"                                   │
│              │                                                           │
│              ▼                                                           │
│   Gameplay: Round 2 (Type A)                                             │
│              │                                                           │
│              ▼                                                           │
│   Round 3 transition ─ "Round 3 of 10"                                   │
│              │                                                           │
│              ▼                                                           │
│   Gameplay: Round 3 (Type A)                                             │
│              │                                                           │
│              ▼                                                           │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Stage-1→2 Takeaway transition                                    │   │
│ │ "Stage 1 done. Time-shifts add or subtract from every age."      │   │
│ │ tap to continue · motivation VO                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│              │                                                           │
│              ▼                                                           │
│   Round 4 transition ─ "Round 4 of 10"                                   │
│              │                                                           │
│              ▼                                                           │
│   Gameplay: Round 4 (Type B, two people, present tense)                  │
│              │                                                           │
│              ▼                                                           │
│   Round 5 transition ─ "Round 5 of 10" → Gameplay R5 (Type B)            │
│              │                                                           │
│              ▼                                                           │
│   Round 6 transition ─ "Round 6 of 10" → Gameplay R6 (Type B)            │
│              │                                                           │
│              ▼                                                           │
│   Round 7 transition ─ "Round 7 of 10" → Gameplay R7 (Type B)            │
│              │                                                           │
│              ▼                                                           │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Stage-2→3 Takeaway transition                                    │   │
│ │ "Stage 2 done. Notice how picking the younger person as x        │   │
│ │  kept the numbers small."                                        │   │
│ │ tap to continue · motivation VO                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│              │                                                           │
│              ▼                                                           │
│   Round 8 transition ─ "Round 8 of 10" → Gameplay R8 (Type C)            │
│              │                                                           │
│              ▼                                                           │
│   Round 9 transition ─ "Round 9 of 10" → Gameplay R9 (Type C)            │
│              │                                                           │
│              ▼                                                           │
│   Round 10 transition ─ "Round 10 of 10" → Gameplay R10 (Type C)         │
│              │                                                           │
│              ▼                                                           │
│   Victory (TransitionScreen)                                             │
│   ─ stars rendered (per first-tap rubric)                                │
│   ─ "Claim Stars" CTA · "Play Again" CTA (only if 1–2 ⭐)                │
│   ─ game_complete posted BEFORE end-game audio                           │
│              │                                                           │
│         ┌────┴─────┐                                                     │
│         │          │                                                     │
│   "Play Again"  "Claim Stars"                                            │
│  (1–2 ⭐ only)        │                                                  │
│         │             ▼                                                  │
│         ▼      Stars Collected (TransitionScreen, auto, no buttons)      │
│  "Ready to     ─ ✨ star animation · sound_stars_collected               │
│   improve?"    ─ auto hands off to AnswerComponent                       │
│   transition          │                                                  │
│         │             ▼                                                  │
│         │      AnswerComponent carousel (PART-051)                       │
│         │      ─ 10 slides (1 per round)                                 │
│         │      ─ each slide: word problem + solved equation + ages       │
│         │      ─ FloatingButton 'next' revealed                          │
│         │             │                                                  │
│         ▼             ▼                                                  │
│   restart from    next_ended postMessage → exit                          │
│   Round 1                                                                │
│   (skips Preview                                                         │
│   + Welcome)                                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

(No `Game Over` branch because Lives = 0 and abandonment is browser-level, not a game-screen transition. The 0⭐ outcome is recorded only if the student never reaches the Victory transition; the harness fires `game_complete` at Victory unconditionally.)

## Feedback

| Event | Behavior |
|-------|----------|
| Preview | PART-039 screen on game start. Instruction text + audio (live build): "Solve the age word problem. Read each problem, type the answer, and tap submit. Three stars for getting most answers right on the first try." |
| Welcome | TransitionScreen with "Welcome to Age Matters" + welcome VO, tap to continue. |
| Round N intro (any round) | TransitionScreen "Round N of 10", auto-advance after round-intro SFX + VO (sequential, awaited). |
| Round start | Play area paints: word problem panel up top, step indicator chip ("Step 1 / 3"), Step-1 tile row visible. Step-2 and Step-3 templates remain hidden until their step opens. Round-start TTS reads the word problem aloud (fire-and-forget — student can interact immediately if they read fast). |
| Step 1 tap (right) | `gameState.isProcessing = true` BEFORE await. Tile flashes green ~400 ms. `await sound.play('soft_chime')` (~150 ms, with celebration sticker fire-and-forget). No TTS. firstTapCorrect++. Step 2 opens (Step-2 template fades in, 300 ms). isProcessing cleared in `loadStep(2)`. CASE 4. |
| Step 1 tap (wrong, only possible in Type B/C) | Tile flashes red ~600 ms. `await sound.play('soft_sad')` (fire-and-forget actually here — Type B/C wrong on Step 1 is a "soft" wrong because the student CAN proceed with the suboptimal variable). Inline contextual hint appears below play area: "You can solve it this way, but picking the younger person keeps the numbers smaller. Try the other tile?" Step does NOT advance; student can re-tap the other tile. firstTapCorrect for this step = 0 regardless of subsequent right tap. |
| Step 2 tap on a piece (right piece, right slot) | Soft chime SFX (fire-and-forget). Piece animates into the slot with a scale-in. If this fills the last empty slot AND the assembled expression matches the canonical, Step-2 auto-completes: green tick on the full expression, awaited soft round-piece SFX, Step 3 opens. firstTapCorrect++ if no wrong piece was placed during this step. CASE 5 / 6. |
| Step 2 tap on a piece (wrong piece OR right piece in wrong slot) | Slot+piece flash red ~600 ms, sad SFX (fire-and-forget). Inline contextual hint per misconception (see Content Structure `misconception_tags`). Slot clears. firstTapCorrect for this step = 0 regardless of subsequent right placement. Student retries. |
| Step 3 tap on a piece (right piece, right slot) | Same as Step 2: soft chime, scale-in. If this fills the last empty slot AND the assembled equation structurally matches the canonical AST, Step-3 auto-completes — fires the **round-equation-correct** event below. |
| Step 3 tap on a piece (wrong piece OR wrong slot) | Same red-flash + sad SFX + contextual hint pattern as Step 2. Slot clears. firstTapCorrect for Step 3 = 0 if any wrong piece during this step. |
| Round-equation correct (Step 3 final placement) | `gameState.isProcessing = true` BEFORE await. Per-piece celebration glow propagates across the assembled equation. `await sound.play('correct_sound_effect', { sticker, minDuration: 1500 })`. Then **algebraic solve animation** plays in-place (~3–4 s): the equation re-renders with line-by-line transformations, each line fading in over ~600 ms with a soft tick SFX (fire-and-forget) per transformation, and the captioned ages appear as bubbles below the final line. Then `await playDynamicFeedback({ feedback_type:'correct', audio_content: '<round.successAudio>', subtitle: '<round.successSubtitle>' })` (e.g. audio_content "Sara is eleven, Ravi is seven."). ProgressBar bumps FIRST in the round-complete handler (per cross-cutting feedback rule). Auto-advance to next round transition (or to Stage-takeaway, or to Victory). CASE 6. |
| Idle nudge (15 s without input on the active step) | Faint glow CSS class added to the next-correct piece/tile. Animation `box-shadow` 1.5 s ease-in-out infinite alternate. Fires ONCE per step (timer cleared on next valid input). NO sound — purely visual. Tapping the glowing piece advances normally; firstTapCorrect for this step = 0 (the glow is a forfeit). |
| Stage-1→2 Takeaway transition (after Round 3 feedback) | TransitionScreen with copy "Stage 1 done. Time-shifts add or subtract from every age." Motivation VO. Tap-to-continue button. Auto-advances on tap to Round 4 intro. |
| Stage-2→3 Takeaway transition (after Round 7 feedback) | TransitionScreen with copy "Stage 2 done. Notice how picking the younger person as `x` kept the numbers small." Motivation VO. Tap-to-continue button. Auto-advances to Round 8 intro. |
| Complete all 10 rounds (Victory) | Victory TransitionScreen with stars (per first-tap rubric). `game_complete` postMessage sent BEFORE end-game audio. CASE 11. Buttons: "Play Again" (only if 1–2 ⭐), "Claim Stars" (always). |
| Stars Collected (after Claim Stars) | Auto-mounted celebration screen: `await sound.play('victory_sound_effect')` → `postMessage({type:'show_star'})` → setTimeout(showAnswerCarousel, 1500). |
| AnswerComponent carousel | PART-051, 10 slides. Each slide shows the round's word problem (compact), the canonical equation in solved form (with the algebraic solve as 2–3 lines), and the captioned ages. FloatingButton 'next' revealed. Tap Next → `next_ended` postMessage → exit. |
| Pause (tab switch) | VisibilityTracker's built-in PopupComponent auto-shows. All audio pauses (Case 14). On resume, audio resumes (Case 15). |
| Audio failure (any audio call rejects) | Try/catch swallows; visual feedback (green tick, red flash, glow, sticker) still renders. Game continues. CASE 16. |

**Voice-line / hint priority on Step-3 wrong piece** (when a wrong piece could be flagged for multiple misconceptions): pick the highest-priority one in this order: **time-shift-omission > sign-error > operation-mismatch > distractor-number-confusion**. Implementation: `misconception_tags` is a per-piece map for each round; the handler reads the tag for the wrong piece and selects the matching hint string.

## Content Structure (fallbackContent)

**Top-level fields:**
- `previewInstruction` — HTML, full instruction shown on PART-039 preview overlay.
- `previewAudioText` — plain-text narration for preview TTS (patched at deploy time).
- `previewAudio` — `null` (filled at deploy time by TTS pipeline).
- `showGameOnPreview` — `false` (the play area should not be visible behind preview).
- `totalRounds` — `10`.
- `totalLives` — `0` (no lives system).
- `answerComponent` — `true` (default; not opted out).
- `rounds[]` — 30 round objects (3 sets × 10 rounds), with `set: 'A' | 'B' | 'C'` on every entry.

### Per-round payload shape

Each round object carries the full data needed to render and validate one round's three steps:

```js
{
  set: 'A' | 'B' | 'C',
  id: 'A_r1_aman',                       // globally unique across sets
  round: 1,                               // 1..10 within the set
  stage: 1 | 2 | 3,                       // 1 (rounds 1-3), 2 (rounds 4-7), 3 (rounds 8-10)
  type: 'A' | 'B' | 'C',
  // Word-problem text shown in the panel (HTML allowed for emphasis):
  problemText: '<p>Five years ago, Aman was 12. How old will he be in 4 years?</p>',
  // Plain-text version for TTS:
  problemAudioText: 'Five years ago, Aman was twelve. How old will he be in four years?',
  // People in the problem; Step 1 tile row renders these.
  people: [
    { name: 'Aman' }
    // For Type A this is a single-element array; the Step-1 tile is a no-op confirmation.
    // For Type B/C this has two elements.
  ],
  // For Type A and C only: the single time-delta. Sign indicates direction.
  // (Type A: rounds 1-3 use a single delta. Type C: rounds 8-10 use a single delta applied to BOTH people.)
  // Type B (rounds 4-7): timeDelta is null.
  timeDelta: -5,                          // -5 = "5 years ago"; +4 = "in 4 years"
  // Step 1 — preferred variable (used for first-tap accounting on Type B/C; trivial on Type A):
  preferredVariable: 'Aman',              // for Type A, the only person; for Type B/C, the simpler / younger
  // Step 2 — for Type A: direction tiles (+/− with delta). For Type B/C: piece-bank slot template.
  step2: {
    // Stage-1 (Type A) shape:
    kind: 'directionTiles',
    tiles: [
      { label: 'x − 5', expression: { op: 'sub', operands: ['x', 5] }, correct: true,  misconception: null },
      { label: 'x + 5', expression: { op: 'add', operands: ['x', 5] }, correct: false, misconception: 'time-shift-direction-flip' }
    ]
    // For Type B/C, kind = 'pieceBank' with these fields instead:
    //   slotTemplate: ['x', '__op__', '__num__'],   // 3 slots, x pinned, op + num to fill
    //   pieceBank: ['+', '−', 3, 4, 5, '=', 12],    // includes correct + distractors
    //   canonical: { op: 'add', operands: ['x', 3] }, // AST of the correct other-age expression
    //   pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', '4': 'distractor-number-confusion', ... }
  },
  // Step 3 — equation slot template + piece bank.
  step3: {
    // Slot template — strings name pinned content; '__slot__' is empty; arrays group brackets.
    slotTemplate: ['__slot__', '=', 12],  // for Type A: [ ] = 12
    // For Type B sum: ['__slot__', '+', '__slot__', '=', '__slot__']
    // For Type C: full equation with parens, e.g. ['(', '__slot__', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', '__slot__']
    pieceBank: ['x', '−', '+', 5, 4, '=', 12, 7],
    // Canonical equation as an AST. Validation normalizes commutativity of '+' and across '='.
    canonicalEquation: { lhs: { op: 'sub', operands: ['x', 5] }, rhs: 12 },
    // Per-piece misconception tags for hint selection on wrong taps.
    pieceMisconceptions: {
      '+':  'time-shift-direction-flip',
      '7':  'distractor-number-confusion',
      '4':  'time-shift-wrong-delta',
      '12': 'distractor-number-confusion'
      // (the correct pieces are also in this map, with `null`)
    },
    // Contextual hint strings keyed by misconception:
    hints: {
      'time-shift-direction-flip': 'Five years AGO means subtract 5, not add 5. Try a different operator.',
      'time-shift-wrong-delta':    'The problem says five years ago, not four. Pick the right number.',
      'distractor-number-confusion': "That number isn't in the problem — pick a number you can read in the sentence.",
      'sign-error-younger-confused-with-older': 'Sara is OLDER than Ravi, so her age is x + 4, not x − 4.',
      'operation-mismatch':         "Sum tells us to add, not multiply. Look at the operator pieces again.",
      'time-shift-omission':        'In 6 years, both ages go up by 6. Did you add 6 to BOTH?'
    }
  },
  // Solution data — used by the round-complete algebraic solve animation AND by AnswerComponent.
  solution: {
    // The variable's value (Aman's current age in this example):
    variableValue: 7,
    // Solve trace, line by line, for the in-game animation:
    solveLines: [
      'x − 5 = 12',     // initial equation
      'x = 12 + 5',     // move term
      'x = 17'          // final
    ],
    // Captioned final answer (TTS + on-screen bubbles):
    captionedAnswers: [
      { name: 'Aman (now)',     value: 17 },
      { name: 'Aman (in 4 yr)', value: 21 }
    ],
    // Audio + subtitle for the round-complete TTS.
    successSubtitle: 'Aman is 17 now, and 21 in four years.',
    successAudio:    'Aman is seventeen now, and twenty-one in four years.'
  },
  // AnswerComponent payload — what the carousel slide shows.
  answer: {
    problemText: '<p>Five years ago, Aman was 12. How old will he be in 4 years?</p>',
    canonicalEquationDisplay: 'x − 5 = 12',
    solveLines: ['x − 5 = 12', 'x = 17'],
    captionedAnswers: [
      { name: 'Aman (now)',     value: 17 },
      { name: 'Aman (in 4 yr)', value: 21 }
    ],
    explanation: '"Five years ago" subtracts 5 from his current age x. So x − 5 = 12 means x = 17.'
  },
  // Misconception tags rolled up at round level for telemetry. These are SOURCED from
  // step2.tiles[].misconception, step2.pieceMisconceptions, and step3.pieceMisconceptions.
  // recordAttempt() captures one tag per wrong tap, per step.
  misconception_tags: {
    'time-shift-direction-flip':         'time-shift-direction-flip',
    'time-shift-wrong-delta':            'time-shift-wrong-delta',
    'distractor-number-confusion':       'distractor-number-confusion',
    'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older',
    'operation-mismatch':                'operation-mismatch',
    'time-shift-omission':               'time-shift-omission'
  }
}
```

**Misconception tags used (named, real misconceptions for L4 algebra word-problem translation):**
- `time-shift-direction-flip` — student added when they should subtract (or vice versa) a time delta. *"Five years AGO" → `x − 5`, not `x + 5`.*
- `time-shift-wrong-delta` — student picked the wrong number for the time delta (often the *other* number that appears in the problem). *"Five years ago" + "in 4 years" → student picked 4 for the past shift.*
- `time-shift-omission` — student applied a time delta to only ONE of the two people, not both. (Type C only.) *"In 6 years, both ages go up by 6.*"
- `sign-error-younger-confused-with-older` — student wrote `x − k` for the older person, or `x + k` for the younger. (Type B/C, when the relationship is comparative.) *"Sara is older than Ravi, so Sara's age is x + 4, not x − 4."*
- `operation-mismatch` — student used the wrong operator at the equation level (e.g. `·` for sum, `+` for "twice as old"). *"Sum tells us to add, not multiply."*
- `distractor-number-confusion` — student picked a number that's not in the problem (a piece-bank distractor). *"That number isn't in the problem — pick a number you can read in the sentence."*
- `variable-choice-suboptimal` — student picked the older / more complex person as `x` (Type B/C Step 1). The student CAN proceed with this choice; the hint just nudges them toward the simpler form. NOT a hard wrong, but tracked for telemetry.

### Round-set cycling — 30 round objects total

The spec authors **three full sets (A, B, C) × 10 rounds = 30 round objects**. The build step copies these verbatim into `fallbackContent.rounds`. Each set has different names, numbers, and tense variations, but parallel difficulty (Set A's Round 1 ≈ Set B's Round 1 ≈ Set C's Round 1).

```js
const fallbackContent = {
  previewInstruction:
    '<p><b>Translate the word problem into an equation.</b></p>' +
    '<p>Each round has 3 small steps:</p>' +
    '<ol>' +
      '<li>Pick the person you want to call <b>x</b>.</li>' +
      '<li>Write the other person\'s age.</li>' +
      '<li>Write the equation.</li>' +
    '</ol>' +
    '<p>Wrong taps just give you a hint — <b>no lives lost</b>. ' +
    'Three stars for getting most steps right on the first try.</p>',
  previewAudioText:
    'Translate each word problem into an equation in three small steps. ' +
    'Pick a variable, write the other age, write the equation. ' +
    'Wrong taps just give you a hint, no lives lost. ' +
    'Three stars for getting most steps right on the first try.',
  previewAudio: null,
  showGameOnPreview: false,
  totalRounds: 10,
  totalLives: 0,
  answerComponent: true,

  rounds: [
    // ──────────────────────────────────────────────────────────────────
    // SET A — 10 rounds
    // ──────────────────────────────────────────────────────────────────

    // Stage 1 — Type A (single person + time shift), Rounds 1–3
    {
      set: 'A', id: 'A_r1_aman_past', round: 1, stage: 1, type: 'A',
      problemText: '<p>Five years ago, Aman was 12. How old is he now?</p>',
      problemAudioText: 'Five years ago, Aman was twelve. How old is he now?',
      people: [{ name: 'Aman' }],
      timeDelta: -5,
      preferredVariable: 'Aman',
      step2: {
        kind: 'directionTiles',
        tiles: [
          { label: 'x − 5', expression: { op: 'sub', operands: ['x', 5] }, correct: true,  misconception: null },
          { label: 'x + 5', expression: { op: 'add', operands: ['x', 5] }, correct: false, misconception: 'time-shift-direction-flip' }
        ]
      },
      step3: {
        slotTemplate: ['__slot__', '=', 12],
        pieceBank: ['x', '−', '+', 5, '=', 12, 4],
        canonicalEquation: { lhs: { op: 'sub', operands: ['x', 5] }, rhs: 12 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 4: 'time-shift-wrong-delta' },
        hints: { /* see misconception map above */ }
      },
      solution: {
        variableValue: 17,
        solveLines: ['x − 5 = 12', 'x = 12 + 5', 'x = 17'],
        captionedAnswers: [{ name: 'Aman (now)', value: 17 }],
        successSubtitle: 'Aman is 17 now.',
        successAudio: 'Aman is seventeen now.'
      },
      answer: {
        problemText: '<p>Five years ago, Aman was 12. How old is he now?</p>',
        canonicalEquationDisplay: 'x − 5 = 12',
        solveLines: ['x − 5 = 12', 'x = 17'],
        captionedAnswers: [{ name: 'Aman (now)', value: 17 }],
        explanation: '"Five years ago" subtracts 5 from his current age x. So x − 5 = 12 means x = 17.'
      },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-wrong-delta': 'time-shift-wrong-delta' }
    },
    {
      set: 'A', id: 'A_r2_sara_future', round: 2, stage: 1, type: 'A',
      problemText: '<p>Sara is 8 now. How old will she be in 6 years?</p>',
      problemAudioText: 'Sara is eight now. How old will she be in six years?',
      people: [{ name: 'Sara' }], timeDelta: 6, preferredVariable: 'Sara',
      step2: {
        kind: 'directionTiles',
        tiles: [
          { label: 'x + 6', expression: { op: 'add', operands: ['x', 6] }, correct: true,  misconception: null },
          { label: 'x − 6', expression: { op: 'sub', operands: ['x', 6] }, correct: false, misconception: 'time-shift-direction-flip' }
        ]
      },
      step3: {
        slotTemplate: ['x', '=', '__slot__'],
        pieceBank: ['x', '+', '−', 8, 6, '=', 14],
        canonicalEquation: { lhs: 'x', rhs: 8 },
        pieceMisconceptions: { 14: 'time-shift-omission', '−': 'time-shift-direction-flip', 6: 'distractor-number-confusion' },
        hints: { /* see misconception map above */ }
      },
      solution: {
        variableValue: 8,
        solveLines: ['x = 8', 'so in 6 years, x + 6 = 14'],
        captionedAnswers: [
          { name: 'Sara (now)', value: 8 },
          { name: 'Sara (in 6 yr)', value: 14 }
        ],
        successSubtitle: 'Sara is 8 now, and 14 in six years.',
        successAudio: 'Sara is eight now, and fourteen in six years.'
      },
      answer: {
        problemText: '<p>Sara is 8 now. How old will she be in 6 years?</p>',
        canonicalEquationDisplay: 'x = 8 (so x + 6 = 14)',
        solveLines: ['x = 8', 'x + 6 = 14'],
        captionedAnswers: [{ name: 'Sara (now)', value: 8 }, { name: 'Sara (in 6 yr)', value: 14 }],
        explanation: 'x is Sara\'s age now. The problem gives x = 8, and "in 6 years" adds 6 → 14.'
      },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-omission': 'time-shift-omission', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r3_ravi_mixed', round: 3, stage: 1, type: 'A',
      problemText: '<p>Three years ago, Ravi was 9. How old will he be in 5 years?</p>',
      problemAudioText: 'Three years ago, Ravi was nine. How old will he be in five years?',
      people: [{ name: 'Ravi' }], timeDelta: -3, preferredVariable: 'Ravi',
      step2: {
        kind: 'directionTiles',
        tiles: [
          { label: 'x − 3', expression: { op: 'sub', operands: ['x', 3] }, correct: true,  misconception: null },
          { label: 'x + 3', expression: { op: 'add', operands: ['x', 3] }, correct: false, misconception: 'time-shift-direction-flip' }
        ]
      },
      step3: {
        slotTemplate: ['__slot__', '=', 9],
        pieceBank: ['x', '−', '+', 3, 5, '=', 9, 12],
        canonicalEquation: { lhs: { op: 'sub', operands: ['x', 3] }, rhs: 9 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 5: 'time-shift-wrong-delta', 12: 'distractor-number-confusion' },
        hints: { /* see misconception map above */ }
      },
      solution: {
        variableValue: 12,
        solveLines: ['x − 3 = 9', 'x = 9 + 3', 'x = 12'],
        captionedAnswers: [
          { name: 'Ravi (now)', value: 12 },
          { name: 'Ravi (in 5 yr)', value: 17 }
        ],
        successSubtitle: 'Ravi is 12 now, and 17 in five years.',
        successAudio: 'Ravi is twelve now, and seventeen in five years.'
      },
      answer: {
        problemText: '<p>Three years ago, Ravi was 9. How old will he be in 5 years?</p>',
        canonicalEquationDisplay: 'x − 3 = 9',
        solveLines: ['x − 3 = 9', 'x = 12', 'x + 5 = 17'],
        captionedAnswers: [{ name: 'Ravi (now)', value: 12 }, { name: 'Ravi (in 5 yr)', value: 17 }],
        explanation: '"Three years ago" subtracts 3 from his current age x. So x − 3 = 9 means x = 12. In 5 years he will be 17.'
      },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-wrong-delta': 'time-shift-wrong-delta', 'distractor-number-confusion': 'distractor-number-confusion' }
    },

    // Stage 2 — Type B (two people, present tense), Rounds 4–7
    {
      set: 'A', id: 'A_r4_mira_brother', round: 4, stage: 2, type: 'B',
      problemText: '<p>Mira is 3 years younger than her brother Ravi. Together their ages sum to 25. How old is Mira?</p>',
      problemAudioText: 'Mira is three years younger than her brother Ravi. Together their ages sum to twenty-five. How old is Mira?',
      people: [{ name: 'Mira' }, { name: 'Ravi' }],
      timeDelta: null,
      preferredVariable: 'Mira',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['x', '__slot__', '__slot__'],
        pieceBank: ['+', '−', 3, 25, 4],
        canonical: { op: 'add', operands: ['x', 3] },
        pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 25: 'distractor-number-confusion', 4: 'distractor-number-confusion' },
        hints: { /* see misconception map above */ }
      },
      step3: {
        slotTemplate: ['x', '+', '__slot__', '=', 25],
        // (After Step-2, the pre-filled "x + 3" expression is shown re-rendered; here Step 3 needs the student
        //  to assemble the full sum equation.)
        pieceBank: ['x', '+', '−', '·', 3, 25, 28, 22, '='],
        canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 3] }] }, rhs: 25 },
        pieceMisconceptions: { '−': 'operation-mismatch', '·': 'operation-mismatch', 28: 'distractor-number-confusion', 22: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 11,
        solveLines: ['x + (x + 3) = 25', '2x + 3 = 25', '2x = 22', 'x = 11'],
        captionedAnswers: [{ name: 'Mira', value: 11 }, { name: 'Ravi', value: 14 }],
        successSubtitle: 'Mira is 11 and Ravi is 14.',
        successAudio: 'Mira is eleven and Ravi is fourteen.'
      },
      answer: {
        problemText: '<p>Mira is 3 years younger than her brother Ravi. Together their ages sum to 25. How old is Mira?</p>',
        canonicalEquationDisplay: 'x + (x + 3) = 25',
        solveLines: ['x + (x + 3) = 25', '2x + 3 = 25', 'x = 11'],
        captionedAnswers: [{ name: 'Mira', value: 11 }, { name: 'Ravi', value: 14 }],
        explanation: 'Picking Mira (the younger) as x makes Ravi\'s age x + 3. Their sum is x + (x + 3) = 25 → x = 11.'
      },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r5_aman_father', round: 5, stage: 2, type: 'B',
      problemText: '<p>Aman is 4 years older than his cousin Bobby. Their ages add up to 22. How old is Bobby?</p>',
      problemAudioText: 'Aman is four years older than his cousin Bobby. Their ages add up to twenty-two. How old is Bobby?',
      people: [{ name: 'Bobby' }, { name: 'Aman' }],
      timeDelta: null, preferredVariable: 'Bobby',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['x', '__slot__', '__slot__'],
        pieceBank: ['+', '−', 4, 22, 3],
        canonical: { op: 'add', operands: ['x', 4] },
        pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 22: 'distractor-number-confusion', 3: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['x', '+', '__slot__', '=', 22],
        pieceBank: ['x', '+', '−', 4, 22, 18, '='],
        canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 4] }] }, rhs: 22 },
        pieceMisconceptions: { '−': 'operation-mismatch', 18: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 9,
        solveLines: ['x + (x + 4) = 22', '2x + 4 = 22', '2x = 18', 'x = 9'],
        captionedAnswers: [{ name: 'Bobby', value: 9 }, { name: 'Aman', value: 13 }],
        successSubtitle: 'Bobby is 9 and Aman is 13.',
        successAudio: 'Bobby is nine and Aman is thirteen.'
      },
      answer: {
        problemText: '<p>Aman is 4 years older than his cousin Bobby. Their ages add up to 22. How old is Bobby?</p>',
        canonicalEquationDisplay: 'x + (x + 4) = 22',
        solveLines: ['x + (x + 4) = 22', '2x = 18', 'x = 9'],
        captionedAnswers: [{ name: 'Bobby', value: 9 }, { name: 'Aman', value: 13 }],
        explanation: 'Picking Bobby (the younger) as x makes Aman\'s age x + 4. Their sum is x + (x + 4) = 22 → x = 9.'
      },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r6_anita_twice', round: 6, stage: 2, type: 'B',
      problemText: '<p>Anita is twice as old as her cousin Sara. Their ages sum to 18. How old is Sara?</p>',
      problemAudioText: 'Anita is twice as old as her cousin Sara. Their ages sum to eighteen. How old is Sara?',
      people: [{ name: 'Sara' }, { name: 'Anita' }],
      timeDelta: null, preferredVariable: 'Sara',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['__slot__', '·', 'x'],
        pieceBank: [2, 3, '+', '·', 18],
        canonical: { op: 'mul', operands: [2, 'x'] },
        pieceMisconceptions: { 3: 'distractor-number-confusion', '+': 'operation-mismatch', 18: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['x', '+', '__slot__', '__slot__', '=', 18],
        pieceBank: ['x', '+', '−', '·', 2, 3, 18, '='],
        canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'mul', operands: [2, 'x'] }] }, rhs: 18 },
        pieceMisconceptions: { 3: 'distractor-number-confusion', '−': 'operation-mismatch' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 6,
        solveLines: ['x + 2x = 18', '3x = 18', 'x = 6'],
        captionedAnswers: [{ name: 'Sara', value: 6 }, { name: 'Anita', value: 12 }],
        successSubtitle: 'Sara is 6 and Anita is 12.',
        successAudio: 'Sara is six and Anita is twelve.'
      },
      answer: {
        problemText: '<p>Anita is twice as old as her cousin Sara. Their ages sum to 18. How old is Sara?</p>',
        canonicalEquationDisplay: 'x + 2x = 18',
        solveLines: ['x + 2x = 18', '3x = 18', 'x = 6'],
        captionedAnswers: [{ name: 'Sara', value: 6 }, { name: 'Anita', value: 12 }],
        explanation: 'Sara as x, Anita is 2x. Sum is 18 → 3x = 18 → x = 6.'
      },
      misconception_tags: { 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r7_bobby_diff', round: 7, stage: 2, type: 'B',
      problemText: '<p>Bobby is 5 years older than Mira. The difference between their ages is 5 and Mira is 7. How old is Bobby?</p>',
      problemAudioText: 'Bobby is five years older than Mira. The difference between their ages is five and Mira is seven. How old is Bobby?',
      people: [{ name: 'Mira' }, { name: 'Bobby' }],
      timeDelta: null, preferredVariable: 'Mira',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['x', '__slot__', '__slot__'],
        pieceBank: ['+', '−', 5, 7, 12],
        canonical: { op: 'add', operands: ['x', 5] },
        pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 7: 'distractor-number-confusion', 12: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['x', '=', '__slot__'],
        pieceBank: ['x', '+', '−', 5, 7, 12, '='],
        canonicalEquation: { lhs: 'x', rhs: 7 },
        pieceMisconceptions: { 12: 'distractor-number-confusion', 5: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 7,
        solveLines: ['x = 7', 'so Bobby = x + 5 = 12'],
        captionedAnswers: [{ name: 'Mira', value: 7 }, { name: 'Bobby', value: 12 }],
        successSubtitle: 'Mira is 7 and Bobby is 12.',
        successAudio: 'Mira is seven and Bobby is twelve.'
      },
      answer: {
        problemText: '<p>Bobby is 5 years older than Mira. Mira is 7. How old is Bobby?</p>',
        canonicalEquationDisplay: 'x = 7, Bobby = x + 5',
        solveLines: ['x = 7', 'Bobby = x + 5 = 12'],
        captionedAnswers: [{ name: 'Mira', value: 7 }, { name: 'Bobby', value: 12 }],
        explanation: 'Mira as x, Bobby is x + 5. Mira is 7, so Bobby is 12.'
      },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },

    // Stage 3 — Type C (two people + time shift), Rounds 8–10
    {
      set: 'A', id: 'A_r8_anita_bobby_future', round: 8, stage: 3, type: 'C',
      problemText: '<p>Anita is twice as old as Bobby. In 6 years, the sum of their ages will be 33. How old is Bobby now?</p>',
      problemAudioText: 'Anita is twice as old as Bobby. In six years, the sum of their ages will be thirty-three. How old is Bobby now?',
      people: [{ name: 'Bobby' }, { name: 'Anita' }],
      timeDelta: 6, preferredVariable: 'Bobby',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['__slot__', '·', 'x'],
        pieceBank: [2, 3, 6, '+', 33],
        canonical: { op: 'mul', operands: [2, 'x'] },
        pieceMisconceptions: { 3: 'distractor-number-confusion', 6: 'time-shift-omission', 33: 'distractor-number-confusion', '+': 'operation-mismatch' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 33],
        pieceBank: ['x', '2x', '+', '−', 6, 33, '=', 27],
        canonicalEquation: {
          lhs: { op: 'add', operands: [
            { op: 'add', operands: ['x', 6] },
            { op: 'add', operands: [{ op: 'mul', operands: [2, 'x'] }, 6] }
          ] },
          rhs: 33
        },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 27: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 7,
        solveLines: ['(x + 6) + (2x + 6) = 33', '3x + 12 = 33', '3x = 21', 'x = 7'],
        captionedAnswers: [{ name: 'Bobby (now)', value: 7 }, { name: 'Anita (now)', value: 14 }],
        successSubtitle: 'Bobby is 7 now, Anita is 14.',
        successAudio: 'Bobby is seven now, and Anita is fourteen.'
      },
      answer: {
        problemText: '<p>Anita is twice as old as Bobby. In 6 years, the sum of their ages will be 33. How old is Bobby now?</p>',
        canonicalEquationDisplay: '(x + 6) + (2x + 6) = 33',
        solveLines: ['(x + 6) + (2x + 6) = 33', '3x = 21', 'x = 7'],
        captionedAnswers: [{ name: 'Bobby (now)', value: 7 }, { name: 'Anita (now)', value: 14 }],
        explanation: 'Bobby as x, Anita is 2x. In 6 years both add 6. Sum (x+6) + (2x+6) = 33 → x = 7.'
      },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r9_sara_ravi_past', round: 9, stage: 3, type: 'C',
      problemText: '<p>Sara is 4 years older than Ravi. In 3 years, the sum of their ages will be 22. How old is Ravi now?</p>',
      problemAudioText: 'Sara is four years older than Ravi. In three years, the sum of their ages will be twenty-two. How old is Ravi now?',
      people: [{ name: 'Ravi' }, { name: 'Sara' }],
      timeDelta: 3, preferredVariable: 'Ravi',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['x', '__slot__', '__slot__'],
        pieceBank: ['+', '−', 4, 3, 22],
        canonical: { op: 'add', operands: ['x', 4] },
        pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 3: 'time-shift-omission', 22: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', '+', '__slot__', ')', '=', 22],
        pieceBank: ['x', '+', '−', 3, 4, 22, '=', 7],
        canonicalEquation: {
          lhs: { op: 'add', operands: [
            { op: 'add', operands: ['x', 3] },
            { op: 'add', operands: [{ op: 'add', operands: ['x', 4] }, 3] }
          ] },
          rhs: 22
        },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 7: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 6,
        solveLines: ['(x + 3) + (x + 4 + 3) = 22', '2x + 10 = 22', '2x = 12', 'x = 6'],
        captionedAnswers: [{ name: 'Ravi (now)', value: 6 }, { name: 'Sara (now)', value: 10 }],
        successSubtitle: 'Ravi is 6 now, Sara is 10.',
        successAudio: 'Ravi is six now, and Sara is ten.'
      },
      answer: {
        problemText: '<p>Sara is 4 years older than Ravi. In 3 years, the sum of their ages will be 22. How old is Ravi now?</p>',
        canonicalEquationDisplay: '(x + 3) + (x + 4 + 3) = 22',
        solveLines: ['(x + 3) + (x + 7) = 22', '2x + 10 = 22', 'x = 6'],
        captionedAnswers: [{ name: 'Ravi (now)', value: 6 }, { name: 'Sara (now)', value: 10 }],
        explanation: 'Ravi as x, Sara is x + 4. In 3 years both add 3. Sum (x+3) + (x+4+3) = 22 → x = 6.'
      },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    {
      set: 'A', id: 'A_r10_mira_aman_thrice', round: 10, stage: 3, type: 'C',
      problemText: '<p>Aman is three times as old as Mira. In 4 years, the sum of their ages will be 32. How old is Mira now?</p>',
      problemAudioText: 'Aman is three times as old as Mira. In four years, the sum of their ages will be thirty-two. How old is Mira now?',
      people: [{ name: 'Mira' }, { name: 'Aman' }],
      timeDelta: 4, preferredVariable: 'Mira',
      step2: {
        kind: 'pieceBank',
        slotTemplate: ['__slot__', '·', 'x'],
        pieceBank: [2, 3, 4, '+', 32],
        canonical: { op: 'mul', operands: [3, 'x'] },
        pieceMisconceptions: { 2: 'distractor-number-confusion', 4: 'time-shift-omission', 32: 'distractor-number-confusion', '+': 'operation-mismatch' },
        hints: { /* see map */ }
      },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 32],
        pieceBank: ['x', '3x', '+', '−', 4, 32, '=', 24],
        canonicalEquation: {
          lhs: { op: 'add', operands: [
            { op: 'add', operands: ['x', 4] },
            { op: 'add', operands: [{ op: 'mul', operands: [3, 'x'] }, 4] }
          ] },
          rhs: 32
        },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 24: 'distractor-number-confusion' },
        hints: { /* see map */ }
      },
      solution: {
        variableValue: 6,
        solveLines: ['(x + 4) + (3x + 4) = 32', '4x + 8 = 32', '4x = 24', 'x = 6'],
        captionedAnswers: [{ name: 'Mira (now)', value: 6 }, { name: 'Aman (now)', value: 18 }],
        successSubtitle: 'Mira is 6 now, Aman is 18.',
        successAudio: 'Mira is six now, and Aman is eighteen.'
      },
      answer: {
        problemText: '<p>Aman is three times as old as Mira. In 4 years, the sum of their ages will be 32. How old is Mira now?</p>',
        canonicalEquationDisplay: '(x + 4) + (3x + 4) = 32',
        solveLines: ['(x + 4) + (3x + 4) = 32', '4x = 24', 'x = 6'],
        captionedAnswers: [{ name: 'Mira (now)', value: 6 }, { name: 'Aman (now)', value: 18 }],
        explanation: 'Mira as x, Aman is 3x. In 4 years both add 4. Sum (x+4) + (3x+4) = 32 → x = 6.'
      },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },

    // ──────────────────────────────────────────────────────────────────
    // SET B — 10 rounds (parallel difficulty to A; different names + numbers)
    // Build step inlines fresh problems following the same Stage-1/2/3 shape
    // and the same misconception-tag coverage. Numbers stay within stage caps.
    // ──────────────────────────────────────────────────────────────────

    { set: 'B', id: 'B_r1_anita_past',     round: 1,  stage: 1, type: 'A',
      problemText: '<p>Four years ago, Anita was 6. How old is she now?</p>',
      problemAudioText: 'Four years ago, Anita was six. How old is she now?',
      people: [{ name: 'Anita' }], timeDelta: -4, preferredVariable: 'Anita',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x − 4', expression: { op: 'sub', operands: ['x', 4] }, correct: true,  misconception: null },
        { label: 'x + 4', expression: { op: 'add', operands: ['x', 4] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: {
        slotTemplate: ['__slot__', '=', 6],
        pieceBank: ['x', '−', '+', 4, 6, '=', 10],
        canonicalEquation: { lhs: { op: 'sub', operands: ['x', 4] }, rhs: 6 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 10: 'distractor-number-confusion' },
        hints: {}
      },
      solution: { variableValue: 10, solveLines: ['x − 4 = 6', 'x = 10'], captionedAnswers: [{ name: 'Anita (now)', value: 10 }], successSubtitle: 'Anita is 10 now.', successAudio: 'Anita is ten now.' },
      answer: { problemText: '<p>Four years ago, Anita was 6. How old is she now?</p>', canonicalEquationDisplay: 'x − 4 = 6', solveLines: ['x − 4 = 6', 'x = 10'], captionedAnswers: [{ name: 'Anita (now)', value: 10 }], explanation: '"Four years ago" subtracts 4 from her current age x. So x − 4 = 6 means x = 10.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r2_bobby_future',   round: 2,  stage: 1, type: 'A',
      problemText: '<p>Bobby is 9 now. How old will he be in 3 years?</p>',
      problemAudioText: 'Bobby is nine now. How old will he be in three years?',
      people: [{ name: 'Bobby' }], timeDelta: 3, preferredVariable: 'Bobby',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x + 3', expression: { op: 'add', operands: ['x', 3] }, correct: true,  misconception: null },
        { label: 'x − 3', expression: { op: 'sub', operands: ['x', 3] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: {
        slotTemplate: ['x', '=', '__slot__'],
        pieceBank: ['x', '+', '−', 9, 3, '=', 12],
        canonicalEquation: { lhs: 'x', rhs: 9 },
        pieceMisconceptions: { 12: 'time-shift-omission', '−': 'time-shift-direction-flip', 3: 'distractor-number-confusion' },
        hints: {}
      },
      solution: { variableValue: 9, solveLines: ['x = 9', 'x + 3 = 12'], captionedAnswers: [{ name: 'Bobby (now)', value: 9 }, { name: 'Bobby (in 3 yr)', value: 12 }], successSubtitle: 'Bobby is 9 now, and 12 in three years.', successAudio: 'Bobby is nine now, and twelve in three years.' },
      answer: { problemText: '<p>Bobby is 9 now. How old will he be in 3 years?</p>', canonicalEquationDisplay: 'x = 9', solveLines: ['x = 9', 'x + 3 = 12'], captionedAnswers: [{ name: 'Bobby (now)', value: 9 }, { name: 'Bobby (in 3 yr)', value: 12 }], explanation: 'x is Bobby\'s age now. The problem gives x = 9; in 3 years he will be 12.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-omission': 'time-shift-omission', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r3_mira_mixed',     round: 3,  stage: 1, type: 'A',
      problemText: '<p>Two years ago, Mira was 8. How old will she be in 6 years?</p>',
      problemAudioText: 'Two years ago, Mira was eight. How old will she be in six years?',
      people: [{ name: 'Mira' }], timeDelta: -2, preferredVariable: 'Mira',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x − 2', expression: { op: 'sub', operands: ['x', 2] }, correct: true,  misconception: null },
        { label: 'x + 2', expression: { op: 'add', operands: ['x', 2] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: {
        slotTemplate: ['__slot__', '=', 8],
        pieceBank: ['x', '−', '+', 2, 6, '=', 8, 16],
        canonicalEquation: { lhs: { op: 'sub', operands: ['x', 2] }, rhs: 8 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 6: 'time-shift-wrong-delta', 16: 'distractor-number-confusion' },
        hints: {}
      },
      solution: { variableValue: 10, solveLines: ['x − 2 = 8', 'x = 10', 'x + 6 = 16'], captionedAnswers: [{ name: 'Mira (now)', value: 10 }, { name: 'Mira (in 6 yr)', value: 16 }], successSubtitle: 'Mira is 10 now, and 16 in six years.', successAudio: 'Mira is ten now, and sixteen in six years.' },
      answer: { problemText: '<p>Two years ago, Mira was 8. How old will she be in 6 years?</p>', canonicalEquationDisplay: 'x − 2 = 8', solveLines: ['x − 2 = 8', 'x = 10', 'x + 6 = 16'], captionedAnswers: [{ name: 'Mira (now)', value: 10 }, { name: 'Mira (in 6 yr)', value: 16 }], explanation: '"Two years ago" subtracts 2. x − 2 = 8 → x = 10; in 6 years, she\'s 16.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-wrong-delta': 'time-shift-wrong-delta', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r4_sara_aman_younger', round: 4, stage: 2, type: 'B',
      problemText: '<p>Sara is 2 years younger than Aman. Together their ages sum to 20. How old is Sara?</p>',
      problemAudioText: 'Sara is two years younger than Aman. Together their ages sum to twenty. How old is Sara?',
      people: [{ name: 'Sara' }, { name: 'Aman' }], timeDelta: null, preferredVariable: 'Sara',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 2, 20, 4], canonical: { op: 'add', operands: ['x', 2] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 20: 'distractor-number-confusion', 4: 'distractor-number-confusion' }, hints: {} },
      step3: {
        slotTemplate: ['x', '+', '__slot__', '=', 20],
        pieceBank: ['x', '+', '−', '·', 2, 20, 18, '='],
        canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 2] }] }, rhs: 20 },
        pieceMisconceptions: { '−': 'operation-mismatch', '·': 'operation-mismatch', 18: 'distractor-number-confusion' },
        hints: {}
      },
      solution: { variableValue: 9, solveLines: ['x + (x + 2) = 20', '2x + 2 = 20', 'x = 9'], captionedAnswers: [{ name: 'Sara', value: 9 }, { name: 'Aman', value: 11 }], successSubtitle: 'Sara is 9 and Aman is 11.', successAudio: 'Sara is nine and Aman is eleven.' },
      answer: { problemText: '<p>Sara is 2 years younger than Aman. Together their ages sum to 20.</p>', canonicalEquationDisplay: 'x + (x + 2) = 20', solveLines: ['x + (x + 2) = 20', '2x = 18', 'x = 9'], captionedAnswers: [{ name: 'Sara', value: 9 }, { name: 'Aman', value: 11 }], explanation: 'Sara as x (younger), Aman = x + 2. Sum 20 → x = 9.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r5_ravi_aman_older',   round: 5, stage: 2, type: 'B',
      problemText: '<p>Aman is 6 years older than Ravi. Their ages add up to 30. How old is Ravi?</p>',
      problemAudioText: 'Aman is six years older than Ravi. Their ages add up to thirty. How old is Ravi?',
      people: [{ name: 'Ravi' }, { name: 'Aman' }], timeDelta: null, preferredVariable: 'Ravi',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 6, 30, 5], canonical: { op: 'add', operands: ['x', 6] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 30: 'distractor-number-confusion', 5: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '=', 30], pieceBank: ['x', '+', '−', 6, 30, 24, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 6] }] }, rhs: 30 }, pieceMisconceptions: { '−': 'operation-mismatch', 24: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 12, solveLines: ['x + (x + 6) = 30', '2x + 6 = 30', 'x = 12'], captionedAnswers: [{ name: 'Ravi', value: 12 }, { name: 'Aman', value: 18 }], successSubtitle: 'Ravi is 12 and Aman is 18.', successAudio: 'Ravi is twelve and Aman is eighteen.' },
      answer: { problemText: '<p>Aman is 6 years older than Ravi. Their ages add up to 30.</p>', canonicalEquationDisplay: 'x + (x + 6) = 30', solveLines: ['x + (x + 6) = 30', '2x = 24', 'x = 12'], captionedAnswers: [{ name: 'Ravi', value: 12 }, { name: 'Aman', value: 18 }], explanation: 'Ravi as x (younger), Aman = x + 6. Sum 30 → x = 12.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r6_anita_mira_thrice', round: 6, stage: 2, type: 'B',
      problemText: '<p>Anita is three times as old as Mira. Their ages sum to 24. How old is Mira?</p>',
      problemAudioText: 'Anita is three times as old as Mira. Their ages sum to twenty-four. How old is Mira?',
      people: [{ name: 'Mira' }, { name: 'Anita' }], timeDelta: null, preferredVariable: 'Mira',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [2, 3, '+', '·', 24], canonical: { op: 'mul', operands: [3, 'x'] }, pieceMisconceptions: { 2: 'distractor-number-confusion', '+': 'operation-mismatch', 24: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '__slot__', '=', 24], pieceBank: ['x', '+', '−', '·', 2, 3, 24, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'mul', operands: [3, 'x'] }] }, rhs: 24 }, pieceMisconceptions: { 2: 'distractor-number-confusion', '−': 'operation-mismatch' }, hints: {} },
      solution: { variableValue: 6, solveLines: ['x + 3x = 24', '4x = 24', 'x = 6'], captionedAnswers: [{ name: 'Mira', value: 6 }, { name: 'Anita', value: 18 }], successSubtitle: 'Mira is 6 and Anita is 18.', successAudio: 'Mira is six and Anita is eighteen.' },
      answer: { problemText: '<p>Anita is three times as old as Mira. Their ages sum to 24.</p>', canonicalEquationDisplay: 'x + 3x = 24', solveLines: ['x + 3x = 24', '4x = 24', 'x = 6'], captionedAnswers: [{ name: 'Mira', value: 6 }, { name: 'Anita', value: 18 }], explanation: 'Mira as x, Anita is 3x. Sum 24 → 4x = 24 → x = 6.' },
      misconception_tags: { 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r7_aman_ravi_diff',    round: 7, stage: 2, type: 'B',
      problemText: '<p>Aman is 7 years older than Ravi. Aman is 15. How old is Ravi?</p>',
      problemAudioText: 'Aman is seven years older than Ravi. Aman is fifteen. How old is Ravi?',
      people: [{ name: 'Ravi' }, { name: 'Aman' }], timeDelta: null, preferredVariable: 'Ravi',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 7, 15, 8], canonical: { op: 'add', operands: ['x', 7] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 15: 'distractor-number-confusion', 8: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '=', 15], pieceBank: ['x', '+', '−', 7, 15, 8, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', 7] }, rhs: 15 }, pieceMisconceptions: { 8: 'distractor-number-confusion', 15: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 8, solveLines: ['x + 7 = 15', 'x = 8'], captionedAnswers: [{ name: 'Ravi', value: 8 }, { name: 'Aman', value: 15 }], successSubtitle: 'Ravi is 8 and Aman is 15.', successAudio: 'Ravi is eight and Aman is fifteen.' },
      answer: { problemText: '<p>Aman is 7 years older than Ravi. Aman is 15.</p>', canonicalEquationDisplay: 'x + 7 = 15', solveLines: ['x + 7 = 15', 'x = 8'], captionedAnswers: [{ name: 'Ravi', value: 8 }, { name: 'Aman', value: 15 }], explanation: 'Ravi as x (younger), Aman = x + 7 = 15 → x = 8.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r8_sara_ravi_future',  round: 8, stage: 3, type: 'C',
      problemText: '<p>Sara is twice as old as Ravi. In 4 years, the sum of their ages will be 26. How old is Ravi now?</p>',
      problemAudioText: 'Sara is twice as old as Ravi. In four years, the sum of their ages will be twenty-six. How old is Ravi now?',
      people: [{ name: 'Ravi' }, { name: 'Sara' }], timeDelta: 4, preferredVariable: 'Ravi',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [2, 3, 4, '+', 26], canonical: { op: 'mul', operands: [2, 'x'] }, pieceMisconceptions: { 3: 'distractor-number-confusion', 4: 'time-shift-omission', 26: 'distractor-number-confusion', '+': 'operation-mismatch' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 26],
        pieceBank: ['x', '2x', '+', '−', 4, 26, '=', 18],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'add', operands: ['x', 4] },
          { op: 'add', operands: [{ op: 'mul', operands: [2, 'x'] }, 4] }
        ] }, rhs: 26 },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 18: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 6, solveLines: ['(x + 4) + (2x + 4) = 26', '3x + 8 = 26', '3x = 18', 'x = 6'], captionedAnswers: [{ name: 'Ravi (now)', value: 6 }, { name: 'Sara (now)', value: 12 }], successSubtitle: 'Ravi is 6 now, Sara is 12.', successAudio: 'Ravi is six now, and Sara is twelve.' },
      answer: { problemText: '<p>Sara is twice as old as Ravi. In 4 years, the sum of their ages will be 26.</p>', canonicalEquationDisplay: '(x + 4) + (2x + 4) = 26', solveLines: ['(x + 4) + (2x + 4) = 26', '3x = 18', 'x = 6'], captionedAnswers: [{ name: 'Ravi (now)', value: 6 }, { name: 'Sara (now)', value: 12 }], explanation: 'Ravi as x, Sara is 2x. In 4 years both add 4. (x+4) + (2x+4) = 26 → x = 6.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r9_bobby_anita_past', round: 9, stage: 3, type: 'C',
      problemText: '<p>Bobby is 5 years older than Anita. 2 years ago, the sum of their ages was 15. How old is Anita now?</p>',
      problemAudioText: 'Bobby is five years older than Anita. Two years ago, the sum of their ages was fifteen. How old is Anita now?',
      people: [{ name: 'Anita' }, { name: 'Bobby' }], timeDelta: -2, preferredVariable: 'Anita',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 5, 2, 15], canonical: { op: 'add', operands: ['x', 5] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 2: 'time-shift-omission', 15: 'distractor-number-confusion' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '−', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', '−', '__slot__', ')', '=', 15],
        pieceBank: ['x', '+', '−', 2, 5, 15, '=', 9],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'sub', operands: ['x', 2] },
          { op: 'sub', operands: [{ op: 'add', operands: ['x', 5] }, 2] }
        ] }, rhs: 15 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 9: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 8, solveLines: ['(x − 2) + (x + 5 − 2) = 15', '2x + 1 = 15', '2x = 14', 'x = 7'], captionedAnswers: [{ name: 'Anita (now)', value: 7 }, { name: 'Bobby (now)', value: 12 }], successSubtitle: 'Anita is 7 now, Bobby is 12.', successAudio: 'Anita is seven now, and Bobby is twelve.' },
      answer: { problemText: '<p>Bobby is 5 years older than Anita. 2 years ago, the sum of their ages was 15.</p>', canonicalEquationDisplay: '(x − 2) + (x + 5 − 2) = 15', solveLines: ['(x − 2) + (x + 3) = 15', '2x + 1 = 15', 'x = 7'], captionedAnswers: [{ name: 'Anita (now)', value: 7 }, { name: 'Bobby (now)', value: 12 }], explanation: 'Anita as x, Bobby = x + 5. 2 years ago both subtract 2. (x−2) + (x+5−2) = 15 → x = 7.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'B', id: 'B_r10_aman_sara_thrice_future', round: 10, stage: 3, type: 'C',
      problemText: '<p>Aman is 4 times as old as Sara. In 5 years, the sum of their ages will be 35. How old is Sara now?</p>',
      problemAudioText: 'Aman is four times as old as Sara. In five years, the sum of their ages will be thirty-five. How old is Sara now?',
      people: [{ name: 'Sara' }, { name: 'Aman' }], timeDelta: 5, preferredVariable: 'Sara',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [3, 4, 5, '+', 35], canonical: { op: 'mul', operands: [4, 'x'] }, pieceMisconceptions: { 3: 'distractor-number-confusion', 5: 'time-shift-omission', 35: 'distractor-number-confusion', '+': 'operation-mismatch' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 35],
        pieceBank: ['x', '4x', '+', '−', 5, 35, '=', 25],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'add', operands: ['x', 5] },
          { op: 'add', operands: [{ op: 'mul', operands: [4, 'x'] }, 5] }
        ] }, rhs: 35 },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 25: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 5, solveLines: ['(x + 5) + (4x + 5) = 35', '5x + 10 = 35', '5x = 25', 'x = 5'], captionedAnswers: [{ name: 'Sara (now)', value: 5 }, { name: 'Aman (now)', value: 20 }], successSubtitle: 'Sara is 5 now, Aman is 20.', successAudio: 'Sara is five now, and Aman is twenty.' },
      answer: { problemText: '<p>Aman is 4 times as old as Sara. In 5 years, the sum of their ages will be 35.</p>', canonicalEquationDisplay: '(x + 5) + (4x + 5) = 35', solveLines: ['(x + 5) + (4x + 5) = 35', '5x = 25', 'x = 5'], captionedAnswers: [{ name: 'Sara (now)', value: 5 }, { name: 'Aman (now)', value: 20 }], explanation: 'Sara as x, Aman is 4x. In 5 years both add 5. Sum (x+5) + (4x+5) = 35 → x = 5.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },

    // ──────────────────────────────────────────────────────────────────
    // SET C — 10 rounds (parallel difficulty to A and B; different names + numbers)
    // ──────────────────────────────────────────────────────────────────

    { set: 'C', id: 'C_r1_ravi_past',      round: 1,  stage: 1, type: 'A',
      problemText: '<p>Six years ago, Ravi was 5. How old is he now?</p>',
      problemAudioText: 'Six years ago, Ravi was five. How old is he now?',
      people: [{ name: 'Ravi' }], timeDelta: -6, preferredVariable: 'Ravi',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x − 6', expression: { op: 'sub', operands: ['x', 6] }, correct: true,  misconception: null },
        { label: 'x + 6', expression: { op: 'add', operands: ['x', 6] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: { slotTemplate: ['__slot__', '=', 5], pieceBank: ['x', '−', '+', 6, 5, '=', 11], canonicalEquation: { lhs: { op: 'sub', operands: ['x', 6] }, rhs: 5 }, pieceMisconceptions: { '+': 'time-shift-direction-flip', 11: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 11, solveLines: ['x − 6 = 5', 'x = 11'], captionedAnswers: [{ name: 'Ravi (now)', value: 11 }], successSubtitle: 'Ravi is 11 now.', successAudio: 'Ravi is eleven now.' },
      answer: { problemText: '<p>Six years ago, Ravi was 5. How old is he now?</p>', canonicalEquationDisplay: 'x − 6 = 5', solveLines: ['x − 6 = 5', 'x = 11'], captionedAnswers: [{ name: 'Ravi (now)', value: 11 }], explanation: '"Six years ago" subtracts 6 from his current age x. So x − 6 = 5 means x = 11.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r2_mira_future',    round: 2,  stage: 1, type: 'A',
      problemText: '<p>Mira is 7 now. How old will she be in 5 years?</p>',
      problemAudioText: 'Mira is seven now. How old will she be in five years?',
      people: [{ name: 'Mira' }], timeDelta: 5, preferredVariable: 'Mira',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x + 5', expression: { op: 'add', operands: ['x', 5] }, correct: true,  misconception: null },
        { label: 'x − 5', expression: { op: 'sub', operands: ['x', 5] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: { slotTemplate: ['x', '=', '__slot__'], pieceBank: ['x', '+', '−', 7, 5, '=', 12], canonicalEquation: { lhs: 'x', rhs: 7 }, pieceMisconceptions: { 12: 'time-shift-omission', '−': 'time-shift-direction-flip', 5: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 7, solveLines: ['x = 7', 'x + 5 = 12'], captionedAnswers: [{ name: 'Mira (now)', value: 7 }, { name: 'Mira (in 5 yr)', value: 12 }], successSubtitle: 'Mira is 7 now, and 12 in five years.', successAudio: 'Mira is seven now, and twelve in five years.' },
      answer: { problemText: '<p>Mira is 7 now. How old will she be in 5 years?</p>', canonicalEquationDisplay: 'x = 7', solveLines: ['x = 7', 'x + 5 = 12'], captionedAnswers: [{ name: 'Mira (now)', value: 7 }, { name: 'Mira (in 5 yr)', value: 12 }], explanation: 'x is Mira\'s age now. The problem gives x = 7; in 5 years she will be 12.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-omission': 'time-shift-omission', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r3_aman_mixed',     round: 3,  stage: 1, type: 'A',
      problemText: '<p>Four years ago, Aman was 7. How old will he be in 3 years?</p>',
      problemAudioText: 'Four years ago, Aman was seven. How old will he be in three years?',
      people: [{ name: 'Aman' }], timeDelta: -4, preferredVariable: 'Aman',
      step2: { kind: 'directionTiles', tiles: [
        { label: 'x − 4', expression: { op: 'sub', operands: ['x', 4] }, correct: true,  misconception: null },
        { label: 'x + 4', expression: { op: 'add', operands: ['x', 4] }, correct: false, misconception: 'time-shift-direction-flip' }
      ] },
      step3: { slotTemplate: ['__slot__', '=', 7], pieceBank: ['x', '−', '+', 4, 3, '=', 7, 14], canonicalEquation: { lhs: { op: 'sub', operands: ['x', 4] }, rhs: 7 }, pieceMisconceptions: { '+': 'time-shift-direction-flip', 3: 'time-shift-wrong-delta', 14: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 11, solveLines: ['x − 4 = 7', 'x = 11', 'x + 3 = 14'], captionedAnswers: [{ name: 'Aman (now)', value: 11 }, { name: 'Aman (in 3 yr)', value: 14 }], successSubtitle: 'Aman is 11 now, and 14 in three years.', successAudio: 'Aman is eleven now, and fourteen in three years.' },
      answer: { problemText: '<p>Four years ago, Aman was 7. How old will he be in 3 years?</p>', canonicalEquationDisplay: 'x − 4 = 7', solveLines: ['x − 4 = 7', 'x = 11', 'x + 3 = 14'], captionedAnswers: [{ name: 'Aman (now)', value: 11 }, { name: 'Aman (in 3 yr)', value: 14 }], explanation: '"Four years ago" subtracts 4. x − 4 = 7 → x = 11; in 3 years, he\'s 14.' },
      misconception_tags: { 'time-shift-direction-flip': 'time-shift-direction-flip', 'time-shift-wrong-delta': 'time-shift-wrong-delta', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r4_anita_younger',  round: 4, stage: 2, type: 'B',
      problemText: '<p>Anita is 5 years younger than Bobby. Together their ages sum to 27. How old is Anita?</p>',
      problemAudioText: 'Anita is five years younger than Bobby. Together their ages sum to twenty-seven. How old is Anita?',
      people: [{ name: 'Anita' }, { name: 'Bobby' }], timeDelta: null, preferredVariable: 'Anita',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 5, 27, 4], canonical: { op: 'add', operands: ['x', 5] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 27: 'distractor-number-confusion', 4: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '=', 27], pieceBank: ['x', '+', '−', '·', 5, 27, 22, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 5] }] }, rhs: 27 }, pieceMisconceptions: { '−': 'operation-mismatch', '·': 'operation-mismatch', 22: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 11, solveLines: ['x + (x + 5) = 27', '2x + 5 = 27', 'x = 11'], captionedAnswers: [{ name: 'Anita', value: 11 }, { name: 'Bobby', value: 16 }], successSubtitle: 'Anita is 11 and Bobby is 16.', successAudio: 'Anita is eleven and Bobby is sixteen.' },
      answer: { problemText: '<p>Anita is 5 years younger than Bobby. Together their ages sum to 27.</p>', canonicalEquationDisplay: 'x + (x + 5) = 27', solveLines: ['x + (x + 5) = 27', '2x = 22', 'x = 11'], captionedAnswers: [{ name: 'Anita', value: 11 }, { name: 'Bobby', value: 16 }], explanation: 'Anita as x (younger), Bobby = x + 5. Sum 27 → x = 11.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r5_aman_bobby_older', round: 5, stage: 2, type: 'B',
      problemText: '<p>Aman is 8 years older than Bobby. Their ages add up to 28. How old is Bobby?</p>',
      problemAudioText: 'Aman is eight years older than Bobby. Their ages add up to twenty-eight. How old is Bobby?',
      people: [{ name: 'Bobby' }, { name: 'Aman' }], timeDelta: null, preferredVariable: 'Bobby',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 8, 28, 7], canonical: { op: 'add', operands: ['x', 8] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 28: 'distractor-number-confusion', 7: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '=', 28], pieceBank: ['x', '+', '−', 8, 28, 20, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'add', operands: ['x', 8] }] }, rhs: 28 }, pieceMisconceptions: { '−': 'operation-mismatch', 20: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 10, solveLines: ['x + (x + 8) = 28', '2x + 8 = 28', 'x = 10'], captionedAnswers: [{ name: 'Bobby', value: 10 }, { name: 'Aman', value: 18 }], successSubtitle: 'Bobby is 10 and Aman is 18.', successAudio: 'Bobby is ten and Aman is eighteen.' },
      answer: { problemText: '<p>Aman is 8 years older than Bobby. Their ages add up to 28.</p>', canonicalEquationDisplay: 'x + (x + 8) = 28', solveLines: ['x + (x + 8) = 28', '2x = 20', 'x = 10'], captionedAnswers: [{ name: 'Bobby', value: 10 }, { name: 'Aman', value: 18 }], explanation: 'Bobby as x (younger), Aman = x + 8. Sum 28 → x = 10.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r6_sara_anita_twice', round: 6, stage: 2, type: 'B',
      problemText: '<p>Anita is twice as old as Sara. Their ages sum to 21. How old is Sara?</p>',
      problemAudioText: 'Anita is twice as old as Sara. Their ages sum to twenty-one. How old is Sara?',
      people: [{ name: 'Sara' }, { name: 'Anita' }], timeDelta: null, preferredVariable: 'Sara',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [2, 3, '+', '·', 21], canonical: { op: 'mul', operands: [2, 'x'] }, pieceMisconceptions: { 3: 'distractor-number-confusion', '+': 'operation-mismatch', 21: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '+', '__slot__', '__slot__', '=', 21], pieceBank: ['x', '+', '−', '·', 2, 3, 21, '='], canonicalEquation: { lhs: { op: 'add', operands: ['x', { op: 'mul', operands: [2, 'x'] }] }, rhs: 21 }, pieceMisconceptions: { 3: 'distractor-number-confusion', '−': 'operation-mismatch' }, hints: {} },
      solution: { variableValue: 7, solveLines: ['x + 2x = 21', '3x = 21', 'x = 7'], captionedAnswers: [{ name: 'Sara', value: 7 }, { name: 'Anita', value: 14 }], successSubtitle: 'Sara is 7 and Anita is 14.', successAudio: 'Sara is seven and Anita is fourteen.' },
      answer: { problemText: '<p>Anita is twice as old as Sara. Their ages sum to 21.</p>', canonicalEquationDisplay: 'x + 2x = 21', solveLines: ['x + 2x = 21', '3x = 21', 'x = 7'], captionedAnswers: [{ name: 'Sara', value: 7 }, { name: 'Anita', value: 14 }], explanation: 'Sara as x, Anita is 2x. Sum 21 → 3x = 21 → x = 7.' },
      misconception_tags: { 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r7_mira_ravi_diff', round: 7, stage: 2, type: 'B',
      problemText: '<p>Ravi is 3 years older than Mira. Mira is 9. How old is Ravi?</p>',
      problemAudioText: 'Ravi is three years older than Mira. Mira is nine. How old is Ravi?',
      people: [{ name: 'Mira' }, { name: 'Ravi' }], timeDelta: null, preferredVariable: 'Mira',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 3, 9, 12], canonical: { op: 'add', operands: ['x', 3] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 9: 'distractor-number-confusion', 12: 'distractor-number-confusion' }, hints: {} },
      step3: { slotTemplate: ['x', '=', '__slot__'], pieceBank: ['x', '+', '−', 3, 9, 12, '='], canonicalEquation: { lhs: 'x', rhs: 9 }, pieceMisconceptions: { 12: 'distractor-number-confusion', 3: 'distractor-number-confusion' }, hints: {} },
      solution: { variableValue: 9, solveLines: ['x = 9', 'Ravi = x + 3 = 12'], captionedAnswers: [{ name: 'Mira', value: 9 }, { name: 'Ravi', value: 12 }], successSubtitle: 'Mira is 9 and Ravi is 12.', successAudio: 'Mira is nine and Ravi is twelve.' },
      answer: { problemText: '<p>Ravi is 3 years older than Mira. Mira is 9.</p>', canonicalEquationDisplay: 'x = 9', solveLines: ['x = 9', 'Ravi = x + 3 = 12'], captionedAnswers: [{ name: 'Mira', value: 9 }, { name: 'Ravi', value: 12 }], explanation: 'Mira as x, Ravi = x + 3 = 12.' },
      misconception_tags: { 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r8_sara_aman_future', round: 8, stage: 3, type: 'C',
      problemText: '<p>Aman is twice as old as Sara. In 3 years, the sum of their ages will be 24. How old is Sara now?</p>',
      problemAudioText: 'Aman is twice as old as Sara. In three years, the sum of their ages will be twenty-four. How old is Sara now?',
      people: [{ name: 'Sara' }, { name: 'Aman' }], timeDelta: 3, preferredVariable: 'Sara',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [2, 3, '+', '·', 24], canonical: { op: 'mul', operands: [2, 'x'] }, pieceMisconceptions: { 3: 'time-shift-omission', 24: 'distractor-number-confusion', '+': 'operation-mismatch' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 24],
        pieceBank: ['x', '2x', '+', '−', 3, 24, '=', 18],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'add', operands: ['x', 3] },
          { op: 'add', operands: [{ op: 'mul', operands: [2, 'x'] }, 3] }
        ] }, rhs: 24 },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 18: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 6, solveLines: ['(x + 3) + (2x + 3) = 24', '3x + 6 = 24', '3x = 18', 'x = 6'], captionedAnswers: [{ name: 'Sara (now)', value: 6 }, { name: 'Aman (now)', value: 12 }], successSubtitle: 'Sara is 6 now, Aman is 12.', successAudio: 'Sara is six now, and Aman is twelve.' },
      answer: { problemText: '<p>Aman is twice as old as Sara. In 3 years, the sum of their ages will be 24.</p>', canonicalEquationDisplay: '(x + 3) + (2x + 3) = 24', solveLines: ['(x + 3) + (2x + 3) = 24', '3x = 18', 'x = 6'], captionedAnswers: [{ name: 'Sara (now)', value: 6 }, { name: 'Aman (now)', value: 12 }], explanation: 'Sara as x, Aman is 2x. In 3 years both add 3. (x+3) + (2x+3) = 24 → x = 6.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r9_ravi_aman_past',   round: 9, stage: 3, type: 'C',
      problemText: '<p>Aman is 6 years older than Ravi. 3 years ago, the sum of their ages was 14. How old is Ravi now?</p>',
      problemAudioText: 'Aman is six years older than Ravi. Three years ago, the sum of their ages was fourteen. How old is Ravi now?',
      people: [{ name: 'Ravi' }, { name: 'Aman' }], timeDelta: -3, preferredVariable: 'Ravi',
      step2: { kind: 'pieceBank', slotTemplate: ['x', '__slot__', '__slot__'], pieceBank: ['+', '−', 6, 3, 14], canonical: { op: 'add', operands: ['x', 6] }, pieceMisconceptions: { '−': 'sign-error-younger-confused-with-older', 3: 'time-shift-omission', 14: 'distractor-number-confusion' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '−', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', '−', '__slot__', ')', '=', 14],
        pieceBank: ['x', '+', '−', 3, 6, 14, '=', 8],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'sub', operands: ['x', 3] },
          { op: 'sub', operands: [{ op: 'add', operands: ['x', 6] }, 3] }
        ] }, rhs: 14 },
        pieceMisconceptions: { '+': 'time-shift-direction-flip', 8: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 7, solveLines: ['(x − 3) + (x + 6 − 3) = 14', '2x = 14', 'x = 7'], captionedAnswers: [{ name: 'Ravi (now)', value: 7 }, { name: 'Aman (now)', value: 13 }], successSubtitle: 'Ravi is 7 now, Aman is 13.', successAudio: 'Ravi is seven now, and Aman is thirteen.' },
      answer: { problemText: '<p>Aman is 6 years older than Ravi. 3 years ago, the sum of their ages was 14.</p>', canonicalEquationDisplay: '(x − 3) + (x + 6 − 3) = 14', solveLines: ['(x − 3) + (x + 3) = 14', '2x = 14', 'x = 7'], captionedAnswers: [{ name: 'Ravi (now)', value: 7 }, { name: 'Aman (now)', value: 13 }], explanation: 'Ravi as x, Aman = x + 6. 3 years ago both subtract 3. (x−3) + (x+6−3) = 14 → x = 7.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'sign-error-younger-confused-with-older': 'sign-error-younger-confused-with-older', 'distractor-number-confusion': 'distractor-number-confusion' }
    },
    { set: 'C', id: 'C_r10_anita_aman_thrice', round: 10, stage: 3, type: 'C',
      problemText: '<p>Aman is three times as old as Anita. In 5 years, the sum of their ages will be 38. How old is Anita now?</p>',
      problemAudioText: 'Aman is three times as old as Anita. In five years, the sum of their ages will be thirty-eight. How old is Anita now?',
      people: [{ name: 'Anita' }, { name: 'Aman' }], timeDelta: 5, preferredVariable: 'Anita',
      step2: { kind: 'pieceBank', slotTemplate: ['__slot__', '·', 'x'], pieceBank: [2, 3, 5, '+', 38], canonical: { op: 'mul', operands: [3, 'x'] }, pieceMisconceptions: { 2: 'distractor-number-confusion', 5: 'time-shift-omission', 38: 'distractor-number-confusion', '+': 'operation-mismatch' }, hints: {} },
      step3: {
        slotTemplate: ['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 38],
        pieceBank: ['x', '3x', '+', '−', 5, 38, '=', 28],
        canonicalEquation: { lhs: { op: 'add', operands: [
          { op: 'add', operands: ['x', 5] },
          { op: 'add', operands: [{ op: 'mul', operands: [3, 'x'] }, 5] }
        ] }, rhs: 38 },
        pieceMisconceptions: { '−': 'time-shift-direction-flip', 28: 'distractor-number-confusion' }, hints: {}
      },
      solution: { variableValue: 7, solveLines: ['(x + 5) + (3x + 5) = 38', '4x + 10 = 38', '4x = 28', 'x = 7'], captionedAnswers: [{ name: 'Anita (now)', value: 7 }, { name: 'Aman (now)', value: 21 }], successSubtitle: 'Anita is 7 now, Aman is 21.', successAudio: 'Anita is seven now, and Aman is twenty-one.' },
      answer: { problemText: '<p>Aman is three times as old as Anita. In 5 years, the sum of their ages will be 38.</p>', canonicalEquationDisplay: '(x + 5) + (3x + 5) = 38', solveLines: ['(x + 5) + (3x + 5) = 38', '4x = 28', 'x = 7'], captionedAnswers: [{ name: 'Anita (now)', value: 7 }, { name: 'Aman (now)', value: 21 }], explanation: 'Anita as x, Aman is 3x. In 5 years both add 5. (x+5) + (3x+5) = 38 → x = 7.' },
      misconception_tags: { 'time-shift-omission': 'time-shift-omission', 'time-shift-direction-flip': 'time-shift-direction-flip', 'operation-mismatch': 'operation-mismatch', 'distractor-number-confusion': 'distractor-number-confusion' }
    }
  ]
};
```

**Round-set cycling (validator: GEN-ROUNDSETS-MIN-3):** `rounds.length === 30 === totalRounds (10) × 3 sets`. Set A plays first attempt; Set B plays after Try-Again / Play-Again; Set C plays after the next restart, then back to A. Difficulty is parallel across sets — Set A's Round 1 ≈ Set B's Round 1 ≈ Set C's Round 1, all targeting Stage 1 Type A (single person + single time shift). Across all three sets, every Stage-1 round uses one person + one time delta in `{2..6}`, every Stage-2 round uses two people + present tense, every Stage-3 round uses two people + a single time delta applied to both.

### AnswerComponent payload shape

Each round's `answer` is rendered by `renderAnswerForRound(round, container)` as a non-interactive review slide:
- The original word problem rendered in compact form (smaller font than gameplay).
- The canonical equation rendered statically (e.g. `x + (x + 4) = 22`) — NOT a piece-bank.
- The 2–3-line algebraic solve below the equation.
- Captioned ages bubble below the solve (e.g. *"Mira: 9, Aman: 11"*).
- A small explanation paragraph at the bottom (1 sentence) explaining the variable choice.
- No tap handlers, no piece bank, no slot templates — pure solved-state visual recap.
- The carousel shows 10 slides (one per round). Slide title: "Round N — <type>" (e.g. "Round 4 — Two people, present tense").

## Visual / Theme

- **Layout:** PART-021 standard mobile layout. Header (round counter + first-tap counter chip "X / 30 first-tap correct") on top, word-problem panel below header, step indicator chip below that, play area (tile row OR piece bank + slot template) centred. No FloatingButton in gameplay (only at end-of-game).
- **Word-problem panel:** large readable font (16px+ per mobile rule #35), padded card with `--mathai-color-card-bg` background and a 1 px `--mathai-color-border`. ~3 lines of text on a 375 px viewport.
- **Step indicator chip:** small (14 px text but inside a 28 px tall pill — not an interactive target, so 14 px is OK), `Step N of 3` with a soft animated fill that grows as the step advances.
- **Step-1 tile row** (Type A: 1 tile; Type B/C: 2 tiles): each tile is ~44 px tall and full-width-minus-margins, padded, with `--mathai-color-card-bg`. The student's name goes on the tile in 18 px font. Tap triggers green flash + advance.
- **Step-2 piece bank + slot template (Type B/C) OR direction tiles (Type A):**
  - **Direction tiles (Type A):** two side-by-side pills, each ~44 px tall × ~140 px wide, label e.g. `x − 5`. Tap auto-evaluates.
  - **Piece bank + slot template (Type B/C):** the slot template renders as a row of empty 44×44 px squares with `--mathai-color-border` outlines; pinned content (`x`) shows in solid `--mathai-color-card-bg`. The piece bank below renders as a wrapping flex of 44×44 px tappable pieces with 8 px margins (per mobile rule #10, NOT flex `gap` — per mobile rule #23, use margin instead). Tapping a piece moves it into the next empty slot. Tapping a filled slot clears that slot back to empty.
- **Step-3 piece bank + slot template:** same as Step-2 but the slot template is wider (full equation). The slot template wraps to two lines if it exceeds the play-area width (Type C only).
- **Per-step soft chime SFX**: `correct_sound_effect` short variant; per-step sad SFX: `incorrect_sound_effect` short variant. Round-equation correct uses the full `correct_sound_effect` with celebration sticker.
- **Algebraic solve animation (after Step 3 correct):** the slot template is replaced in-place with the round's `solveLines[]` rendered as stacked text lines. Each line fades in over 600 ms (`opacity 0 → 1`, `transform translateY(8px) → translateY(0)`) with a soft tick SFX (fire-and-forget) on each line's start. Captioned ages bubble in below the final line with `--mathai-color-accent` background. NO continuous animation per mobile rule #14 — each line is a momentary fade-in, then static.
- **First-tap counter chip in header**: "21/30 correct so far" — small 14 px text inside a 28 px tall pill. Updates on each step's first-tap-correct event.
- **Idle nudge glow:** `box-shadow: 0 0 12px var(--mathai-color-accent), inset 0 0 0 2px var(--mathai-color-accent)` with `animation: alfred-idle-glow 1.5s ease-in-out infinite alternate`. Applied via a `.alfred-idle-glow` class on the next-correct piece/tile, removed on next valid input.
- **Stage-takeaway transition copy:** centred 18 px text on `--mathai-color-card-bg`, with a "Keep going" CTA button (PART-022 primary).
- **No FloatingButton during gameplay** — every step auto-evaluates on slot-fill or single tap. PART-050 IS used at end-of-game for the AnswerComponent's Next button (per the FloatingButton sub-rule "Next button at end-of-game"). End-of-game path: Victory TransitionScreen → "Claim Stars" → Stars Collected → AnswerComponent → FloatingButton('next') → exit.
- **Mobile compliance:** all rules in mobile/SKILL.md apply. `viewport meta` correct, `100dvh`, `overflow-x: hidden`, `overscroll-behavior: none`, `touch-action: manipulation` on all tiles + pieces, `-webkit-` prefixes paired with standard properties, no flexbox `gap` (margin-based spacing), no `aspect-ratio`, no optional chaining, no `Array.at()`. Number rendering uses `var(--mathai-font-family)`. Inputs are NOT used (the game has no text input), so the `inputmode` rule is N/A.
- **Slot-fill animation:** when a piece moves from the bank into a slot, it animates with `transform: scale(1) → scale(1.1) → scale(1)` over 250 ms (a momentary "land" feedback, not continuous). When a slot clears (student taps a filled slot to undo), the piece animates back to the bank with the same momentary scale and a 200 ms `opacity 1 → 0` fade in the slot. Per mobile rule #14: momentary feedback only; no continuous gameplay animations.

## Out of Scope

- **No procedural problem generation** — the 30 round objects (3 sets × 10) are hand-authored. Future work: a build-time generator that produces parametric age problems and verifies their canonical equations admit integer (or known-fractional) solutions. The "bank of about 60" mentioned in the concept is the target; v1 ships 30 (committed in `fallbackContent`); the remaining ~30 problems live in `pre-generation/problem-bank.md` for future expansion (out-of-scope for v1).
- **No drag-and-drop variant** — interaction pattern is locked to P1 tap-to-select / tap-to-place. (A drag variant would let students drag pieces from the bank into slots; out of scope.)
- **No Hindi / bilingual variant** — concept does not request it; `pedagogy.md` flags Hindi bridges as ADVISORY for Class 4–6 (we are Class 6–8, so the advisory does not apply).
- **No timer / speed scoring** — the concept explicitly says "Time is unbounded." PART-006 NOT included.
- **No leaderboard / streak tracking across sessions** — single-session game.
- **No scoring credit for the algebraic solve** — the game DOES the solve (per concept). The student's job ends at the equation. No "type x = ?" step.
- **No type-the-answer fallback** — input is tap-only, throughout. Number-pad UI mentioned in the concept ("a number pad and `+`/`−` buttons") IS implemented as the piece bank, but it's tap-to-select pieces, not type-into-an-input.
- **No multi-equation / system of equations** — Stage 3 is single linear equation in one variable. No 2-variable systems. (Future work for Class 9–10.)
- **No motion / mixture / work problems in v1** — concept calls these out as transferable extensions but explicitly scopes v1 to age problems.
- **No standalone problems with no time-shift cap** — every problem fits within stage difficulty caps so the algebraic solve animation completes in ≤ 4 lines.

## Decision-Points / Open Items

(For the creator and spec-review to confirm before Step 4 / Build.)

1. **Step 1 in Type A is a single-tile no-op confirmation.** This keeps the 3-step structure consistent across all 10 rounds and lets the first-tap counter award a "free" point on Type A rounds. **Confirm:** acceptable, or should Type A rounds have only 2 effective steps (Step 2 direction + Step 3 equation) and the first-tap counter cap at 20 instead of 30? Current design says 30 for predictability — every round has exactly 3 step-decisions.
2. **Type B Step 1 wrong-tap "soft" path.** Tapping the older / more complex person as `x` does NOT trigger a hard wrong (no flash, no slot clear) — it shows a gentle hint and lets the student retap. firstTapCorrect for that step = 0 regardless. **Confirm:** the "soft" wrong is the right design for variable choice (which is genuinely a *preference*, not a hard error). Spec author thinks yes.
3. **Algebraic solve animation runs in-place on the gameplay screen** (NOT a separate transition screen). It is part of the round-complete feedback beat, played between Round-N's Step-3 correct and Round-(N+1)'s intro transition. **Confirm:** acceptable. Alternative: render the solve in a small modal that the student dismisses with a tap. Current design favours in-place to keep the spotlight on the equation the student just built.
4. **First-tap counter visible in header during gameplay** ("21/30 correct so far"). **Confirm:** spec author thinks this is a useful real-time cue (the student sees their star tier converging). Alternative: hide the counter during gameplay, reveal only at the Victory screen. Concept brief is silent.
5. **Stage-takeaway transitions are auto-advance OR tap-to-continue?** Concept says "a one-line takeaway slides in" — which suggests auto-advance after a brief pause. Spec author chose tap-to-continue (more agency, lets the student dwell on the takeaway). **Confirm:** which is preferred?
6. **Lives = 0 means no Game Over screen.** End-of-game is always Victory after Round 10. The 0-star outcome only fires if the student abandons (tab close). **Confirm with spec-review:** archetype-7 default lives is 0; we are aligned. Validator should NOT trip on missing `game_over` screen because we never have lives > 0.
7. **AnswerComponent slide content scope.** Each slide shows: word problem (compact) + canonical equation + 2–3-line solve + captioned ages + 1-sentence explanation. **Confirm:** is this too much for one slide on a 375 px viewport, or appropriate? Spec author suggests a slide layout test in Step 6 visual review.
8. **No PART-006 (timer).** Concept says "time is unbounded". Validator rule `TIMER-MANDATORY-WHEN-DURATION-VISIBLE` should NOT trip because nothing in `getStars()` reads elapsed time and the preview text does not promise any speed-based reward. **Confirm with spec-review:** PART-006 omission is correct.
9. **Does the round-complete TTS read both ages or just the variable's value?** Spec author chose "both ages" for richer feedback (e.g. "Mira is 9 and Aman is 11"). **Confirm:** keep both, or only read `x` to keep the focus on the variable?
10. **The bank of ~60 problems** mentioned in the concept maps to ~30 in `fallbackContent` (3 sets × 10 = the round-set cycling minimum) plus ~30 in `pre-generation/problem-bank.md` for future expansion. **Confirm:** v1 ships 30; future expansion adds the remaining 30 via a build-step that dynamically picks from a larger pool.

## Defaults Applied

(Decisions NOT specified by the creator and filled by a default. Per spec-creation Step 3, `answerComponent` is silently `true` and is NOT listed here.)

- **Idle nudge timing (15 s without input):** explicitly stated in the concept. NOT defaulted.
- **Step 1 Type A no-op tile confirmation:** spec-author choice for structural consistency across all 10 rounds (Decision-Point #1). Concept did not explicitly say Type A should have 3 steps OR 2 steps — the spec author chose 3 for predictability and to align the first-tap counter scale across all rounds.
- **Step 1 Type B/C "soft" wrong path** (suboptimal variable choice does NOT clear or hard-flash, just shows hint): spec-author choice (Decision-Point #2). Concept said "Wrong choice doesn't end anything, but a short prompt nudges" — this softer rendering is the spec author's interpretation.
- **Algebraic solve animation rendered in-place on gameplay screen** (NOT a separate transition): spec-author choice (Decision-Point #3). Concept said "the game animates the solve and shows both ages, then moves on" — the spec author chose in-place over modal for spotlight reasons.
- **First-tap counter chip visible in header during gameplay**: spec-author choice (Decision-Point #4). Concept said the star rule is based on first-tap accuracy; the spec author chose to surface the running count for self-assessment.
- **Stage-takeaway transitions tap-to-continue** (NOT auto-advance): spec-author choice (Decision-Point #5). Concept said "a one-line takeaway slides in" — could be either; spec author chose tap-to-continue.
- **Round-complete TTS reads both ages** (e.g. "Mira is 9 and Aman is 11"): spec-author choice (Decision-Point #9). Concept said "shows both ages" — the spec author extended this to the audio.
- **Slot-fill scale animation (250 ms scale 1 → 1.1 → 1) on piece placement and 200 ms fade on slot clear**: defaulted (concept did not specify any animation timing for slot-fills).
- **Algebraic solve line fade-in (600 ms per line)**: defaulted (concept said "clean line-by-line animation" — timing was not specified).
- **Distractor count per piece bank (Stage 1: 2; Stage 2/3: 3)**: defaulted by spec author per pedagogy 70–85 % first-attempt target (more distractors at higher stages tightens the gate).
- **Misconception tag set** (`time-shift-direction-flip`, `time-shift-wrong-delta`, `time-shift-omission`, `sign-error-younger-confused-with-older`, `operation-mismatch`, `distractor-number-confusion`, `variable-choice-suboptimal`): defaulted by spec author from real, documented age-problem misconceptions in NCERT Class 8 §2.3 errata and from common-error catalogues.
- **NCERT chapter alignment** (Class 6 §11, Class 7 §4, Class 8 §2.3): defaulted by spec author per pedagogy.md constraint #6 (every spec must reference an NCERT chapter).
- **Heart / lives display:** N/A — Lives = 0, no heart UI.
- **Bloom level L4:** spec-author inference from "translating multiple English phrases into algebra at once" — this is canonical L4 (analyze + construct), not L3 (apply). Concept did not state a Bloom level explicitly. NOTE: `pedagogy.md` would default to L2 if silent; the spec author chose L4 because the concept's described skill is unambiguously analyze-and-construct and the per-step grading is the L4 affordance.
- **`autoShowStar`:** defaulted to `true` (creator did not specify; PART-050 standard is true).
- **`previewScreen`:** defaulted to `true` (creator did not specify; PART-039 standard is true).
- **Class/Grade 6–8:** explicitly stated by the creator. NOT defaulted.
- **Lives = 0 (no lives system):** explicitly stated by the creator. NOT defaulted.
- **No timer:** explicitly stated by the creator. NOT defaulted.
- **Star rule (3⭐ = 27–30 first-tap; 2⭐ = 21–26; 1⭐ = <21 with completion; 0⭐ = abandoned):** explicitly stated by the creator. NOT defaulted.
- **10 rounds, 3 stages (3-4-3 split):** explicitly stated by the creator. NOT defaulted.
- **Names list (Sara, Ravi, Mira, Aman, Bobby, Anita):** explicitly stated by the creator. NOT defaulted.

## Warnings

- **WARNING: Bloom L4 with rounds = 10.** The pedagogy default for L4 is 6 rounds (per `pedagogy.md` Bloom Quick-Reference). The creator explicitly specified 10 rounds across 3 stages. 10 rounds is at the upper edge for L4 — but the per-step structure (3 sub-decisions per round) means the actual cognitive load is more like 30 small decisions across ~8–12 minutes, which fits the L4 pacing budget (15–60 s per question × 10 = 2.5–10 minutes of pure reasoning, plus transitions). **Spec-review confirms** the 10-round count is justified by the per-step decomposition.
- **WARNING: No lives at L4.** The pedagogy default for L4 is "None or 5". The creator explicitly chose 0 (no lives). This is consistent with the concept's explicit "no lives" framing and with the 1⭐ floor being completion. **Spec-review confirms** L4 + Lives = 0 is intentional and the failure mode is voluntary abandonment, not lives-exhausted.
- **WARNING: Star rubric uses FIRST-TAP ACCURACY across step-decisions, not round-level accuracy.** This deviates from the platform-standard 90/66/33 % thresholds at the round level. The creator's brief makes this an explicit pedagogical choice — the game grades each translation step, not just the final answer. The build must wire `gameState.firstTapCorrect` (integer 0..30), increment it on the FIRST tap on each step (only if that tap is correct), and `getStars()` must consume that data. Per `getStars()` implementation in Scoring above. Validator note: this is creator-specified scoring; it overrides the archetype-7 default of "stars at 90/66/33 % of total rounds".
- **WARNING: Round-set cycling cycles only 30 problems but concept implies a bank of ~60.** The validator requires `rounds.length === totalRounds × 3`, which is 30. The remaining ~30 problems described in the concept's "bank of about 60" are deferred to `pre-generation/problem-bank.md` (out of scope for v1). After 4+ replays a determined student WILL see Set A again. Acceptable for v1; future iterations should expand the bank or add a build-time problem generator.
- **WARNING: Per-step misconception tags are stored TWICE per round** — once on `step2.pieceMisconceptions` / `step2.tiles[].misconception` and once on `step3.pieceMisconceptions`, plus a roll-up `misconception_tags` at round level for telemetry. This is intentional: the per-step maps drive the inline hint selection on wrong taps; the round-level roll-up is what `recordAttempt` writes to telemetry. Build step must NOT collapse these — they serve different purposes.
- **WARNING: Type A Step 1 is a "free" first-tap-correct point.** The student gets a free point per Type A round (3 of 10) just for confirming the single name tile. This means a perfect Type-A run + abandon-after-Round-3 yields 9 first-tap correct but 0 stars (abandoned). A perfect Type-A run + slip on every Type-B/C step yields 9 + 0 = 9 first-tap, completion → 1⭐. The free point is a deliberate "warm-up" reward consistent with the on-ramp framing of Stage 1; spec-review should confirm.
- **WARNING: AST-based equation matching is non-trivial.** "Structural match" with commutativity allowed for `+` and across `=` requires a small AST normalizer in the validation function. Build step should implement this once and reuse across all 30 rounds. A naive string-compare on the slot-template fill will reject `(x + 4) + (x + 7) = 22` against `(x + 7) + (x + 4) = 22` — both should be accepted. Spec-review should confirm the AST approach is acceptable.
- **WARNING: Algebraic solve animation may produce fractional answers in Stage 3.** At least one Stage-3 round is designed to produce a fractional answer (none of Set A's Stage-3 currently do — `x = 7`, `x = 6`, `x = 6` all integer; Set B and Set C also currently produce integers). The spec author elected to keep all Set A/B/C answers integer for v1 to avoid the rendering complexity of fractional-age captions ("Sara is 7.5 years old"). The concept's example "x = 7.5" is a *teaching point* that the game would handle gracefully — but for v1 we sidestep it by selecting integer-only problem instances. **Spec-review note:** if spec-review wants to see at least one fractional answer to honour the concept's pedagogy ("the math gets done for you, even if the answer is awkward"), the build step can substitute one round in Set A Stage 3 with a fractional-answer variant.
- **WARNING: Variable-choice "soft wrong" complicates the first-tap accounting.** Type B/C Step 1: tapping the suboptimal variable triggers a hint and forfeits the first-tap point, but the student keeps playing with the suboptimal `x`. The build must track which variable the student actually picked and adjust Step 2/3's canonical AST to reflect that choice (the canonical equation flips: `x` now represents the older person, second expression becomes `x − k`, etc.). This is a non-trivial branch in the round logic. **Alternative:** force the student to retap the preferred variable (hard wrong, slot doesn't open). Spec author chose soft wrong because it preserves the "no lives" feel — but it adds branch complexity. Spec-review should confirm.
- **WARNING: 30 round objects in `fallbackContent` makes the HTML file larger.** Per mobile rule #29, HTML under 500 KB is ADVISORY. With 30 fully populated round objects (problemText, solveLines, AST canonicalEquation, hints, etc.), the spec estimates `fallbackContent` adds ~30 KB to the HTML. Should remain well under 500 KB.
- **WARNING: No PART-050 FloatingButton during gameplay.** Each step auto-evaluates on slot-fill or tile-tap; no Submit/Check CTA in the round. PART-050 IS required for the end-of-game Next button (per the FloatingButton sub-rule). Validator `GEN-FLOATING-BUTTON-NEXT-MISSING` should NOT trip because the end-of-game Next IS wired. Validator should ALSO NOT flag any in-round Submit because there isn't one — the per-step auto-evaluation pattern is the design.
- **WARNING: Step 2 Type A is essentially a 2-option MCQ for direction.** This is structurally identical to a Tap-Select Single (P1) MCQ, even though Step 3 of the same round is more like a Construction. The "Multi-Step MCQ" modifier accommodates this by treating each step independently; the archetype is still #7 Construction because the *defining* step is Step 3 (build the equation), not Step 2 (pick direction). Spec-review should confirm the archetype + modifier choice is correct.
