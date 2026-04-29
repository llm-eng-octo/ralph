# Game Design: Hexa Numbers

## Identity

- **Game ID:** hexa-numbers
- **Title:** Hexa Numbers — Hexagon Sum Overlap Puzzle
- **Class/Grade:** Class 4-6 (Grade 4-6) — DECISION-POINT flagged; source concept silent on grade.
- **Math Domain:** Number Sense / Place-Value Reasoning / Addition (with constraint satisfaction).
- **Topic:** Colour-gated hexagonal overlap puzzle — drag unique-value hexagons into blank cells so that every one of three distinct target totals is satisfied simultaneously. The game reinforces (a) decomposing a target number into place-value-friendly parts (e.g. 4279 ≈ 4000 + 200 + 40 + 30 + 6 + 3), and (b) recognising that a single shared hexagon contributes to the sums of two (or three) adjacent targets at once.
- **Bloom Level:** L4 Analyze — students must decompose three target sums simultaneously, hold partial placements in working memory, recognise which slots are shared between targets, and test the whole arrangement. Pure recall (L1) or single-step addition (L3) does not cover the constraint-intersection demand.
- **Archetype:** Board Puzzle (#6) — each round is a single board solved as a whole (not sequential per-item questions). Colour-gated drag-and-drop places hexagons; a CHECK button validates the entire arrangement once all 13 slots are filled.
- **NCERT Alignment:** NCERT Class 4 Math "Play With Patterns" + Class 5 "Parts and Wholes" (place-value decomposition) + Class 6 "Knowing Our Numbers" (large-number reading, addition with mixed magnitudes). Constraint-satisfaction / logic-puzzle portion aligns with the NCERT puzzle appendices and Math Olympiad worksheets (source: IMC 2025-26 Final Round, worksheet 16483, "Hexa Numbers" block 310525).

## One-Line Concept

Students drag colour-coded numbered hexagons from a 13-hex pool into 13 blank cells (6 light-blue shared slots around a tight tri-cluster of dark-teal target hexagons + 7 white outer-halo slots) so that the six hexagons around each of the three targets (4279, 7248, 9346) add to that target's value — tapping CHECK validates the whole board at once.

---

## Target Skills

| Skill | Description | Round Type |
|-------|-------------|------------|
| Place-value decomposition | Break a 4-digit target (4279) into additive parts that can be represented by pool hexagons (4000 + 200 + 40 + 30 + 6 + 3). | All rounds |
| Large-number addition (mental / scratch) | Add 6 numbers of mixed magnitudes (ones / tens / hundreds / thousands) to verify each target sum. | All rounds |
| Constraint intersection | Recognise that a single hexagon in a shared (blue) slot counts toward two (or three) target totals — cannot be chosen without considering both. | All rounds (Type A) |
| Colour-gated reasoning | Respect the rule "blue hexagon → blue slot, white hexagon → white slot". Plan placements within the colour palette each target has access to. | All rounds |
| Hypothesis testing / whole-board validation | Commit to an arrangement, predict which targets will be off, revise. CHECK gives whole-board feedback with per-target conflict highlighting. | All rounds |

---

## Core Mechanic

Single interaction type across all three variants — colour-gated drag-and-drop with check-on-submit (Pattern P6). Difficulty scales by (a) tightness of the sum decomposition, (b) how many hexagon values are unique vs near-duplicates (misleads), and (c) cosmetic variant style (target colour and rule-glyph style). The underlying geometry, slot colours, and target values are identical across the three variants per the source concept.

### Type A: "Colour-gated hexagon overlap sum" (all rounds, all three variants)

1. **Student sees:** A honeycomb-cross workspace with three dark-teal / dark-green **target hexagons** showing values 4279, 7248, 9346 arranged as a downward-pointing triangle (two targets on top, one below-centre). Around them, 13 blank slot hexagons — **6 light-blue inner slots** forming the shared ring between targets and **7 white outer-halo slots** on the perimeter. A **pool tray** below the workspace holding exactly 13 hexagons in 4 rows, each painted blue or white and labelled with a number. A single **CHECK** button at the bottom, initially disabled. Instruction bar above: "Arrange all the hexagons such that their sum equals the centre. 1⃣ Drag and drop the **blue hexagons** in the **blue blanks**, and 2⃣ **White hexagons** in the **white blanks**. You can drag and drop each hexagon only once."
2. **Student does:** Drags each pool hexagon onto a matching-colour slot. Drop-on-occupied-slot **evicts** the previous occupant back to its pool row (or **swaps** if the source was another slot). Drop-on-pool returns a placed hexagon. Drop on a mismatched-colour slot is rejected (hexagon snaps back, soft error SFX). CHECK enables only when every one of the 13 slots is filled with a matching-colour hexagon. Tapping CHECK validates: **each target's 6-member ring sums to its displayed value**.
3. **Correct criterion:** Every one of the three target sums passes (Target1 ring sums to 4279, Target2 ring to 7248, Target3 ring to 9346). Because all 13 pool hexagons must be placed, "leftovers" are not possible — every hex is in play.
4. **Feedback:** See § Feedback. Correct → all slots flash green + correct SFX + TTS celebration + advance. Wrong → per-target red highlighting on the slots contributing to any violated target sum, the three target values each show a red ✗ if their sum fails (and green ✓ if they pass), CHECK button morphs to NEXT, correct arrangement is briefly revealed after ~1.5s, then NEXT advances. No retry inside the same round (matches source concept).

**Variant cosmetic differences:**

- **B1 (canonical, round 1):** Target hexagons rendered in **dark teal-grey** (#2F5F61). Instruction uses the glyphs **1⃣** and **2⃣**.
- **B2 (round 2):** Target hexagons rendered in **dark green** (#27666D). Instruction uses plain **1.** and **2.**.
- **B3 (round 3):** Target hexagons rendered in **dark green** (#27666D). Instruction uses the glyphs **1️⃣** and **2️⃣**.

Mechanically identical. Cosmetic styling differs so students who replay notice the variant label but not the puzzle structure.

---

## Rounds & Progression

The game ships **three round-sets (A, B, C)**, each containing exactly 3 rounds (B1/B2/B3 cosmetic variants). Per the platform's round-set cycle (validator `GEN-ROUNDSETS-MIN-3`), a student playing the game on first attempt sees Set A; tapping **Try Again** rotates to Set B; another Try Again rotates to Set C; then back to A. Each set is a **different puzzle** (different target triple + different pool) so retry is a genuinely fresh challenge, not a memorisation bypass.

**Within a set**, rounds R1/R2/R3 share the SAME target values and SAME solution — only the cosmetic skin (target colour + rule glyph style) changes per the source concept's B1 → B2 → B3 progression. Total rounds per session = three (one set), played as B1 (R1) → B2 (R2) → B3 (R3).

### Set A: targets 4279, 7248, 9346 (canonical source values)

#### Stage A1: "Classic tri-target, clean decomposition" (Round 1 — Variant B1)
- Round type: Type A.
- Targets: **4279, 7248, 9346** (dark teal-grey).
- Slots: 6 blue (shared inner ring) + 7 white (outer halo) = 13.
- Pool: 13 hexagons, pre-designed so exactly one valid arrangement exists across colour constraints. Values chosen to emphasise place-value decomposition (e.g. {4000, 200, 40, 30, 6, 3, 2000, 5000, 2, 100, 200, 40, 6}).
- Cognitive demand: **Decompose + intersect** — find values whose sum equals each target; respect colour gating; recognise shared slots contribute to two sums.
- Rule-glyph style: **1⃣ / 2⃣**.

#### Stage A2: "Same targets, green variant" (Round 2 — Variant B2)
- Round type: Type A. Identical mechanics, identical geometry, **identical solution** to A1.
- Cosmetic: dark-green targets; rule glyphs **1. / 2.**
- Cognitive demand: identical to A1. The point of the variant is to reinforce the rule with a slightly different visual skin and train "same-puzzle-different-chrome" recognition.

#### Stage A3: "Same targets, emoji-glyph variant" (Round 3 — Variant B3)
- Round type: Type A. Identical mechanics, identical geometry, **identical solution** to A1/A2.
- Cosmetic: dark-green targets; rule glyphs **1️⃣ / 2️⃣**.
- Cognitive demand: identical.

### Set B: targets 5318, 6427, 8259 (Try Again rotation 1)

Parallel structure to Set A. Three rounds (B1/B2/B3 cosmetic) over the SAME three target values **5318, 6427, 8259**, with a distinct pool whose values decompose those targets. Within-set cosmetic progression mirrors Set A exactly (B1 dark teal-grey + 1⃣/2⃣ → B2 dark green + 1./2. → B3 dark green + 1️⃣/2️⃣).

### Set C: targets 3147, 8624, 9135 (Try Again rotation 2)

Parallel structure to Sets A/B. Three rounds (B1/B2/B3 cosmetic) over the SAME three target values **3147, 8624, 9135**, with a distinct pool. Cosmetic progression identical to Sets A/B.

### Summary Table — Set A

| Dimension | A1 (R1 — B1) | A2 (R2 — B2) | A3 (R3 — B3) |
|-----------|---------------|---------------|---------------|
| Set | A | A | A |
| Round type | A | A | A |
| Target values | 4279, 7248, 9346 | 4279, 7248, 9346 | 4279, 7248, 9346 |
| Slot count | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) |
| Pool size | 13 hexagons | 13 hexagons | 13 hexagons |
| Target colour | Dark teal-grey | Dark green | Dark green |
| Rule glyphs | 1⃣ / 2⃣ | 1. / 2. | 1️⃣ / 2️⃣ |
| Distractors | None (every hex must be placed) | None | None |
| Target first-attempt rate | 45–60% | 55–70% (same puzzle again) | 65–80% (third look) |

### Summary Table — Set B

| Dimension | B1 (R1 — B1) | B2 (R2 — B2) | B3 (R3 — B3) |
|-----------|---------------|---------------|---------------|
| Set | B | B | B |
| Round type | A | A | A |
| Target values | 5318, 6427, 8259 | 5318, 6427, 8259 | 5318, 6427, 8259 |
| Slot count | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) |
| Pool size | 13 hexagons | 13 hexagons | 13 hexagons |
| Target colour | Dark teal-grey | Dark green | Dark green |
| Rule glyphs | 1⃣ / 2⃣ | 1. / 2. | 1️⃣ / 2️⃣ |
| Distractors | None | None | None |
| Target first-attempt rate | 45–60% | 55–70% | 65–80% |

### Summary Table — Set C

| Dimension | C1 (R1 — B1) | C2 (R2 — B2) | C3 (R3 — B3) |
|-----------|---------------|---------------|---------------|
| Set | C | C | C |
| Round type | A | A | A |
| Target values | 3147, 8624, 9135 | 3147, 8624, 9135 | 3147, 8624, 9135 |
| Slot count | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) | 13 (6 blue + 7 white) |
| Pool size | 13 hexagons | 13 hexagons | 13 hexagons |
| Target colour | Dark teal-grey | Dark green | Dark green |
| Rule glyphs | 1⃣ / 2⃣ | 1. / 2. | 1️⃣ / 2️⃣ |
| Distractors | None | None | None |
| Target first-attempt rate | 45–60% | 55–70% | 65–80% |

---

## Game Parameters

- **totalRounds:** 3
- **Rounds:** 3 — one per variant per the source concept (block_count 3). Each is a full honeycomb puzzle.
- **Timer:** None — L4 constraint-satisfaction tasks should not be timed. Source concept shows a timer in the status bar ("00:03") but treats it as elapsed-time display only. Spec defaults to **no countdown**; elapsed time may be shown but does not constrain play.
- **Lives:** **None** (0). Source concept shows CHECK → NEXT flow without retry. Matches Board Puzzle archetype default. Flagged in Warnings.
- **Star rating:**
  - **3 stars** = all 3 rounds solved on first CHECK (perfect).
  - **2 stars** = 2 of 3 rounds solved on first CHECK.
  - **1 star** = 1 of 3 rounds solved on first CHECK.
  - **0 stars** (still reaches results) = 0 rounds solved on first CHECK.
- **Input:** Drag-and-drop (touch + mouse) using **Pattern P6**. Source = pool hexagon or currently-placed slot hexagon. Target = any colour-matching slot OR the pool tray (return). Plus CHECK / NEXT button tap.
- **Feedback:** Per-round whole-arrangement validation on CHECK. Per-drop micro-feedback is visual only (soft snap SFX fire-and-forget on success, soft error SFX fire-and-forget on colour mismatch). Awaited SFX + TTS on CHECK resolution. FeedbackManager handles all audio.

---

## Scoring

- **Points:** +1 per round solved on first CHECK (max 3). No partial credit per target — the entire arrangement must be correct.
- **Stars:** 3 stars = 3 first-CHECK solves, 2 = 2 solves, 1 = 1 solve, 0 = 0 solves.
- **Lives:** None (no game_over path).
- **Partial credit:** None for scoring. Telemetry records **per-target pass/fail** and per-slot placement so analytics can distinguish "one target off by a small amount" from "widely scrambled".

---

## Flow

**Shape:** Multi-round (default) with two deltas from the canonical default:
1. **No Game Over branch.** Lives = 0 → the "wrong AND lives = 0" branch is removed entirely. Wrong CHECK → NEXT button → next round transition → next round. Never transitions to game_over.
2. **Wrong answer does NOT loop back to same round.** NEXT advances. Matches source concept ("drag-and-drop each hexagon only once" + single CHECK per round).

**Changes from default:**
- Remove Game Over path (no lives).
- After wrong CHECK, advance to next round (no retry loop inside same round).
- Replace the "submit" transition in the Gameplay → Feedback edge with an explicit CHECK button tap.

```
[Preview Screen (PART-039)]
        |
        v
[Welcome / Level Screen]
        |
        v
[Round N Transition: "Round N — Variant B{N}"]
        |
        v
[Gameplay: Drag hexagons into colour-matching slots; CHECK disabled until all 13 slots filled]
        |
        | tap CHECK (all 13 slots filled with matching colours)
        v
[Validate 3 target sums]
        |
        +--> all 3 targets pass --> Correct feedback (green flash, SFX + TTS)
        |                                 |
        |                                 v
        |                          [If N < 3: Round N+1 Transition]
        |                          [If N == 3: Victory / Results]
        |
        +--> at least 1 target fails --> Wrong feedback
                 (red on conflict slots,
                  ✓/✗ badges on 3 target values,
                  SFX + TTS, CHECK -> NEXT,
                  correct arrangement briefly revealed)
                 |
                 | tap NEXT (or auto after ~3500 ms)
                 v
          [If N < 3: Round N+1 Transition]
          [If N == 3: Victory / Results]

(No Game Over; always reaches Results after Round 3.)
```

---

## Feedback

| Event | Behavior |
|-------|----------|
| Hexagon picked up from pool | Hex lifts (scale 1.06 + drop-shadow), pool slot dims. No audio. Soft cursor-grab. |
| Hexagon dragged over a matching-colour slot | Slot border highlights purple. No audio. |
| Hexagon dragged over a mismatched-colour slot | Slot border highlights soft red (feedback-only). No audio. |
| Hexagon dropped on empty matching-colour slot | Snap SFX (fire-and-forget, no sticker, no TTS, no block). Slot turns filled. CHECK enables if all 13 slots now filled. |
| Hexagon dropped on occupied matching-colour slot | Previous occupant animates back to the pool (evict) OR swaps (if source was another slot). Snap SFX (fire-and-forget). |
| Hexagon dropped on mismatched-colour slot | Reject: hex returns to source (pool or seat). Soft error SFX (fire-and-forget). No placement change. |
| Hexagon dragged from slot back to pool | Slot clears, pool slot refills. CHECK disables (not all slots filled). Soft deselect SFX (fire-and-forget). |
| CHECK pressed, all 3 targets pass | Input blocked (`isProcessing = true`) before any await. All slots flash green (400ms). Three target badges show ✓. Awaited correct SFX + celebration sticker (~1.5s min duration). Fire-and-forget TTS + subtitle: "Great thinking! Every sum is spot on." After SFX, advance to next round. `recordAttempt` captures the whole arrangement BEFORE audio starts. |
| CHECK pressed, one or more targets fail | Input blocked. Conflict slots (every slot contributing to any failed target) highlight red. Each target value shows ✓ or ✗ based on its own sum. Awaited wrong SFX + sad sticker (~1.5s min duration). Fire-and-forget TTS + subtitle: "Oh no! Not quite — check each sum." CHECK morphs to NEXT. After ~1500ms, the correct arrangement is briefly revealed (hexagons slide to their solution positions) so the student sees the answer before advancing. NEXT is tappable any time. |
| NEXT pressed (or 3500ms auto-advance after wrong) | Stop all audio. Transition to next-round screen. If N == 3, transition to Victory / Results. |
| Round complete (correct OR wrong+next) | `recordAttempt` already sent (before audio). Auto-advance. |
| All 3 rounds complete | Results screen renders first; `game_complete` postMessage sent; then victory SFX + VO sequence (awaited, CTA interruptible). Star count by first-CHECK solves. |
| Play Again / Claim Stars | Stop all audio; reset state; follow standard multi-round replay flow (no preview rerun). |
| Visibility hidden | `VisibilityTracker` handles pause overlay (do not roll a custom one). Audio + drag state paused. |
| Visibility restored | `VisibilityTracker` dismisses overlay. State continues. |

### Conflict-slot rule (for red highlighting on wrong CHECK)

For each target whose 6-member ring does NOT sum to its value, every slot in that ring is marked as a conflict slot. A slot shared between two targets becomes a conflict slot if **either** target's sum fails. A slot in only-passing rings is NOT highlighted (stays neutral) — this tells the student which slot-groups to reconsider.

### Per-target badges

On CHECK, each target hexagon displays a small badge (✓ green if its sum matches, ✗ red if not) so the student sees per-target which sums were right and which were wrong — critical for diagnosing the error on a 3-constraint puzzle.

---

## Content Structure (fallbackContent)

Geometry note: this spec commits to an explicit slot-membership list per target rather than computing hex adjacency from coordinates. The 13 slot IDs are `s1..s13`; slots `s1..s6` are blue (shared inner ring), `s7..s13` are white (outer halo). Each round ships with (a) the 13 pool hexagons (id + colour + value), (b) the three target definitions (id + value + colour-variant + member-slot list), and (c) the ground-truth `solution` mapping each slot-id to the pool hex id that belongs there. The renderer uses explicit layout indices for CSS placement.

```js
const fallbackContent = {
  previewInstruction:
    '<p><b>Hexa Numbers!</b><br>' +
    'Arrange all the hexagons so their sum equals the target in the centre.<br>' +
    '1⃣ Drag the <b>blue</b> hexagons into <b>blue</b> slots.<br>' +
    '2⃣ Drag the <b>white</b> hexagons into <b>white</b> slots.<br>' +
    'Each hexagon can be used only once. Tap <b>CHECK</b> when all slots are filled.</p>',
  previewAudioText:
    'Arrange the hexagons so their sums equal each target. Blue hexagons go in blue slots, white hexagons in white slots. Each hexagon is used only once. Then tap CHECK.',
  previewAudio: null,
  showGameOnPreview: false,
  rounds: [
    // ==============================================================
    // SET A — canonical source values: 4279, 7248, 9346
    // Three rounds (B1/B2/B3 cosmetic variants) sharing identical
    // geometry, identical target values, identical solution.
    // First puzzle the student plays. Try Again rotates to Set B.
    // ==============================================================

    // ==============================================================
    // SET A — ROUND 1 — Variant B1 — dark teal-grey targets, 1⃣ / 2⃣ glyphs
    // Targets T1=4279 (top-left), T2=7248 (top-right), T3=9346 (bottom-centre)
    //
    // SLOTS:
    //   Blue (inner, shared):   s1..s6
    //     s1 = shared by T1 & T2 (top-middle, between T1 and T2)
    //     s2 = shared by T1 & T3 (left-middle, between T1 and T3)
    //     s3 = shared by T2 & T3 (right-middle, between T2 and T3)
    //     s4 = belongs to T1 only (between T1 outer ring and the shared centre)
    //     s5 = belongs to T2 only
    //     s6 = belongs to T3 only
    //   White (outer halo, unique per target):
    //     s7, s8 = T1 outer (top-left + left)
    //     s9, s10 = T2 outer (top-right + right)
    //     s11, s12, s13 = T3 outer (bottom-left, bottom, bottom-right)
    //
    // Membership (each target's 6-slot ring):
    //   T1 ring = [s1, s2, s4, s7, s8, s13]   (s13 borrowed as 6th member;
    //                                           geometry allows a corner hex
    //                                           to touch both T1 + T3 outer)
    //   T2 ring = [s1, s3, s5, s9, s10, s11]  (s11 borrowed similarly)
    //   T3 ring = [s2, s3, s6, s11, s12, s13]
    //
    // 6 blue slots (s1..s6) + 7 white slots (s7..s13) = 13 total. ✓
    //
    // The illustrative pool values below may NOT arithmetically sum to the
    // declared targets — the authoring pipeline regenerates pool values at
    // build time so each target's ring sum equals its declared value.
    // See "Puzzle authoring invariant" below.
    // ==============================================================
    {
      set: 'A',
      id: 'A_r1_b1_4279_7248_9346',
      round: 1,
      stage: 1,
      type: 'A',
      variant: 'B1',
      targetColor: 'dark-teal-grey', // #2F5F61
      ruleGlyph: '1⃣/2⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 4279, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 7248, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9346, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 2 },
        { id: 'b2', color: 'blue',  value: 3 },
        { id: 'b3', color: 'blue',  value: 40 },
        { id: 'b4', color: 'blue',  value: 34 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 1 },
        { id: 'w1', color: 'white', value: 4000 },
        { id: 'w2', color: 'white', value: 200 },
        { id: 'w3', color: 'white', value: 5000 },
        { id: 'w4', color: 'white', value: 2000 },
        { id: 'w5', color: 'white', value: 100 },
        { id: 'w6', color: 'white', value: 300 },
        { id: 'w7', color: 'white', value: 30 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values shipped here are illustrative; the builder regenerates
      // them so each target's ring sum equals its declared target value.
      misconception_tags: {
        'color-mismatch':        'Student attempts to place a blue hexagon in a white slot (or vice versa). Blocked by UI but the attempt is telemetry-logged.',
        'ignore-shared-slots':   'Student picks values for one target without considering that shared slots contribute to two target sums.',
        'single-target-fix':     'Student fixes one target at the expense of another (solves T1 but leaves T2 and T3 mis-summed).',
        'decomposition-error':   "Student decomposes a target incorrectly (e.g. treats 4279 as 4000+200+79, ignoring that 79 isn't a pool value)."
      }
    },

    // ==============================================================
    // SET A — ROUND 2 — Variant B2 — dark green targets, plain 1./2. glyphs
    // Same geometry, same target values, same solution as A_r1. Cosmetic refresh only.
    // ==============================================================
    {
      set: 'A',
      id: 'A_r2_b2_4279_7248_9346',
      round: 2,
      stage: 2,
      type: 'A',
      variant: 'B2',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1./2.',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 4279, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 7248, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9346, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 2 },
        { id: 'b2', color: 'blue',  value: 3 },
        { id: 'b3', color: 'blue',  value: 40 },
        { id: 'b4', color: 'blue',  value: 34 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 1 },
        { id: 'w1', color: 'white', value: 4000 },
        { id: 'w2', color: 'white', value: 200 },
        { id: 'w3', color: 'white', value: 5000 },
        { id: 'w4', color: 'white', value: 2000 },
        { id: 'w5', color: 'white', value: 100 },
        { id: 'w6', color: 'white', value: 300 },
        { id: 'w7', color: 'white', value: 30 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores that shared slots contribute to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Decomposes a target using parts that are not available in the pool palette.'
      }
    },

    // ==============================================================
    // SET A — ROUND 3 — Variant B3 — dark green targets, 1️⃣ / 2️⃣ emoji glyphs
    // Same geometry, same target values, same solution as A_r1/A_r2. Cosmetic refresh only.
    // ==============================================================
    {
      set: 'A',
      id: 'A_r3_b3_4279_7248_9346',
      round: 3,
      stage: 3,
      type: 'A',
      variant: 'B3',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1️⃣/2️⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 4279, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 7248, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9346, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 2 },
        { id: 'b2', color: 'blue',  value: 3 },
        { id: 'b3', color: 'blue',  value: 40 },
        { id: 'b4', color: 'blue',  value: 34 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 1 },
        { id: 'w1', color: 'white', value: 4000 },
        { id: 'w2', color: 'white', value: 200 },
        { id: 'w3', color: 'white', value: 5000 },
        { id: 'w4', color: 'white', value: 2000 },
        { id: 'w5', color: 'white', value: 100 },
        { id: 'w6', color: 'white', value: 300 },
        { id: 'w7', color: 'white', value: 30 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET B — Try Again rotation 1 — fresh puzzle, targets 5318, 6427, 8259
    // Three rounds (B1/B2/B3 cosmetic variants) sharing identical
    // geometry, identical target values, identical solution.
    // The pool below is illustrative — builder regenerates per Set B targets.
    // ==============================================================
    {
      set: 'B',
      id: 'B_r1_b1_5318_6427_8259',
      round: 1,
      stage: 1,
      type: 'A',
      variant: 'B1',
      targetColor: 'dark-teal-grey', // #2F5F61
      ruleGlyph: '1⃣/2⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 5318, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 6427, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 8259, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 4 },
        { id: 'b2', color: 'blue',  value: 7 },
        { id: 'b3', color: 'blue',  value: 20 },
        { id: 'b4', color: 'blue',  value: 18 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 5000 },
        { id: 'w2', color: 'white', value: 300 },
        { id: 'w3', color: 'white', value: 6000 },
        { id: 'w4', color: 'white', value: 400 },
        { id: 'w5', color: 'white', value: 200 },
        { id: 'w6', color: 'white', value: 1000 },
        { id: 'w7', color: 'white', value: 50 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy target sums (5318, 6427, 8259).
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET B — ROUND 2 — Variant B2 — dark green targets, plain 1./2. glyphs
    // Same geometry, same target values (5318, 6427, 8259), same solution as B_r1.
    // ==============================================================
    {
      set: 'B',
      id: 'B_r2_b2_5318_6427_8259',
      round: 2,
      stage: 2,
      type: 'A',
      variant: 'B2',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1./2.',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 5318, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 6427, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 8259, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 4 },
        { id: 'b2', color: 'blue',  value: 7 },
        { id: 'b3', color: 'blue',  value: 20 },
        { id: 'b4', color: 'blue',  value: 18 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 5000 },
        { id: 'w2', color: 'white', value: 300 },
        { id: 'w3', color: 'white', value: 6000 },
        { id: 'w4', color: 'white', value: 400 },
        { id: 'w5', color: 'white', value: 200 },
        { id: 'w6', color: 'white', value: 1000 },
        { id: 'w7', color: 'white', value: 50 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy Set B target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET B — ROUND 3 — Variant B3 — dark green targets, 1️⃣ / 2️⃣ emoji glyphs
    // Same geometry, same target values (5318, 6427, 8259), same solution as B_r1/B_r2.
    // ==============================================================
    {
      set: 'B',
      id: 'B_r3_b3_5318_6427_8259',
      round: 3,
      stage: 3,
      type: 'A',
      variant: 'B3',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1️⃣/2️⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 5318, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 6427, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 8259, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 4 },
        { id: 'b2', color: 'blue',  value: 7 },
        { id: 'b3', color: 'blue',  value: 20 },
        { id: 'b4', color: 'blue',  value: 18 },
        { id: 'b5', color: 'blue',  value: 5 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 5000 },
        { id: 'w2', color: 'white', value: 300 },
        { id: 'w3', color: 'white', value: 6000 },
        { id: 'w4', color: 'white', value: 400 },
        { id: 'w5', color: 'white', value: 200 },
        { id: 'w6', color: 'white', value: 1000 },
        { id: 'w7', color: 'white', value: 50 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy Set B target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET C — Try Again rotation 2 — fresh puzzle, targets 3147, 8624, 9135
    // Three rounds (B1/B2/B3 cosmetic variants) sharing identical
    // geometry, identical target values, identical solution.
    // ==============================================================
    {
      set: 'C',
      id: 'C_r1_b1_3147_8624_9135',
      round: 1,
      stage: 1,
      type: 'A',
      variant: 'B1',
      targetColor: 'dark-teal-grey', // #2F5F61
      ruleGlyph: '1⃣/2⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 3147, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 8624, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9135, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 1 },
        { id: 'b2', color: 'blue',  value: 5 },
        { id: 'b3', color: 'blue',  value: 24 },
        { id: 'b4', color: 'blue',  value: 12 },
        { id: 'b5', color: 'blue',  value: 7 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 3000 },
        { id: 'w2', color: 'white', value: 100 },
        { id: 'w3', color: 'white', value: 8000 },
        { id: 'w4', color: 'white', value: 600 },
        { id: 'w5', color: 'white', value: 70 },
        { id: 'w6', color: 'white', value: 900 },
        { id: 'w7', color: 'white', value: 40 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy Set C target sums (3147, 8624, 9135).
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET C — ROUND 2 — Variant B2 — dark green targets, plain 1./2. glyphs
    // Same geometry, same target values (3147, 8624, 9135), same solution as C_r1.
    // ==============================================================
    {
      set: 'C',
      id: 'C_r2_b2_3147_8624_9135',
      round: 2,
      stage: 2,
      type: 'A',
      variant: 'B2',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1./2.',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 3147, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 8624, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9135, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 1 },
        { id: 'b2', color: 'blue',  value: 5 },
        { id: 'b3', color: 'blue',  value: 24 },
        { id: 'b4', color: 'blue',  value: 12 },
        { id: 'b5', color: 'blue',  value: 7 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 3000 },
        { id: 'w2', color: 'white', value: 100 },
        { id: 'w3', color: 'white', value: 8000 },
        { id: 'w4', color: 'white', value: 600 },
        { id: 'w5', color: 'white', value: 70 },
        { id: 'w6', color: 'white', value: 900 },
        { id: 'w7', color: 'white', value: 40 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy Set C target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    },

    // ==============================================================
    // SET C — ROUND 3 — Variant B3 — dark green targets, 1️⃣ / 2️⃣ emoji glyphs
    // Same geometry, same target values (3147, 8624, 9135), same solution as C_r1/C_r2.
    // ==============================================================
    {
      set: 'C',
      id: 'C_r3_b3_3147_8624_9135',
      round: 3,
      stage: 3,
      type: 'A',
      variant: 'B3',
      targetColor: 'dark-green', // #27666D
      ruleGlyph: '1️⃣/2️⃣',
      slots: [
        { id: 's1', color: 'blue',  position: 'shared-t1-t2' },
        { id: 's2', color: 'blue',  position: 'shared-t1-t3' },
        { id: 's3', color: 'blue',  position: 'shared-t2-t3' },
        { id: 's4', color: 'blue',  position: 't1-only' },
        { id: 's5', color: 'blue',  position: 't2-only' },
        { id: 's6', color: 'blue',  position: 't3-only' },
        { id: 's7', color: 'white', position: 't1-outer-a' },
        { id: 's8', color: 'white', position: 't1-outer-b' },
        { id: 's9', color: 'white', position: 't2-outer-a' },
        { id: 's10', color: 'white', position: 't2-outer-b' },
        { id: 's11', color: 'white', position: 'shared-t2-t3-outer' },
        { id: 's12', color: 'white', position: 't3-outer-a' },
        { id: 's13', color: 'white', position: 'shared-t1-t3-outer' }
      ],
      targets: [
        { id: 't1', value: 3147, ring: ['s1','s2','s4','s7','s8','s13'] },
        { id: 't2', value: 8624, ring: ['s1','s3','s5','s9','s10','s11'] },
        { id: 't3', value: 9135, ring: ['s2','s3','s6','s11','s12','s13'] }
      ],
      pool: [
        { id: 'b1', color: 'blue',  value: 1 },
        { id: 'b2', color: 'blue',  value: 5 },
        { id: 'b3', color: 'blue',  value: 24 },
        { id: 'b4', color: 'blue',  value: 12 },
        { id: 'b5', color: 'blue',  value: 7 },
        { id: 'b6', color: 'blue',  value: 9 },
        { id: 'w1', color: 'white', value: 3000 },
        { id: 'w2', color: 'white', value: 100 },
        { id: 'w3', color: 'white', value: 8000 },
        { id: 'w4', color: 'white', value: 600 },
        { id: 'w5', color: 'white', value: 70 },
        { id: 'w6', color: 'white', value: 900 },
        { id: 'w7', color: 'white', value: 40 }
      ],
      solution: {
        s1: 'b1', s2: 'b2', s3: 'b3',
        s4: 'b4', s5: 'b5', s6: 'b6',
        s7: 'w1', s8: 'w2', s9: 'w3',
        s10: 'w4', s11: 'w5', s12: 'w6', s13: 'w7'
      },
      // Pool values illustrative; builder regenerates to satisfy Set C target sums.
      misconception_tags: {
        'color-mismatch':        'Attempts blue-into-white placement (blocked by UI).',
        'ignore-shared-slots':   'Ignores shared-slot contribution to two targets.',
        'single-target-fix':     'Fixes one target at the expense of others.',
        'decomposition-error':   'Uses a decomposition not representable in the pool palette.'
      }
    }
  ]
};
```

### Puzzle authoring invariant (CRITICAL for builder)

The builder generating `index.html` MUST guarantee, for **every round in every set** (all 9 round objects: A_r1/A_r2/A_r3, B_r1/B_r2/B_r3, C_r1/C_r2/C_r3):

1. Every slot declared in `slots[]` appears exactly once as a key in `solution`.
2. Every pool-hex id appears exactly once as a value in `solution`.
3. For each `target` in `targets[]`, the sum of `pool.find(p => p.id === solution[slotId]).value` across `slotId ∈ target.ring` equals `target.value`.
4. For each `slot.color`, the corresponding `pool[solution[slot.id]].color` matches.

If these invariants fail at build time, the builder MUST regenerate the pool values (keeping target values fixed) using a constraint-solver pass before shipping the HTML.

**Per-set regeneration (CRITICAL):** Set A targets are 4279/7248/9346, Set B targets are 5318/6427/8259, Set C targets are 3147/8624/9135. The builder MUST run the constraint-solver pass independently for each of the three sets so each set's pool sums to its own target triple. The illustrative pool values shipped in `fallbackContent` for ANY round (A, B, or C) may not arithmetically sum to that round's declared targets — this is per spec, not a typo, and applies uniformly across all 9 rounds. Within a set, all 3 rounds share the same regenerated pool + solution (only cosmetic fields differ).

A runtime self-check MAY additionally be embedded (see game-building code: `verifyPuzzleSolvability()` helper) that logs a warning if any round's solution fails validation — this guards against content-set drift.

---

## Defaults Applied

- **Class/Grade:** defaulted to **Class 4–6**. Source concept silent; puzzle uses 4-digit sums suitable for Class 4 / 5 "Knowing our numbers" + Class 6 "Whole numbers" curricula.
- **Bloom Level:** defaulted to **L4 Analyze**. Source silent; constraint intersection across 3 sums is analytic reasoning.
- **Archetype:** **Board Puzzle (#6)**. Construction (#7) was considered but rejected — there is nothing being *built* from parts; fixed pool + fixed slots + validate-whole-board matches Board Puzzle exactly.
- **Rounds:** defaulted to **3** per session (matches source concept's block_count = 3, one per variant).
- **Round-sets:** A/B/C with parallel B1/B2/B3 cosmetic progression within each set per validator rule `GEN-ROUNDSETS-MIN-3`. `fallbackContent.rounds.length === 9` (`totalRounds × 3`). Set A targets 4279/7248/9346 (canonical source values), Set B targets 5318/6427/8259, Set C targets 3147/8624/9135 — three distinct puzzles. Try Again rotates `gameState.setIndex` (A → B → C → A) so a student replaying gets a genuinely fresh decomposition challenge each time, not a repeat. **Cross-set difficulty progression is now provided by the three different target triples** (Set A → B → C are parallel-difficulty 4-digit sums but different decompositions); within-set progression remains cosmetic-only per the source concept's B1/B2/B3 mandate.
- **Lives:** defaulted to **0** per source concept and Board Puzzle archetype default. Flagged in Warnings.
- **Timer:** defaulted to **None** per Board Puzzle default and L4 default. Source shows a "00:03" elapsed timer cosmetically but no countdown; spec defaults to no countdown.
- **Input:** Drag-and-drop (P6) per source explicit.
- **Feedback style:** FeedbackManager + `playDynamicFeedback` on CHECK resolution. Fire-and-forget SFX on per-drop micro-interactions.
- **Scaffolding:** defaulted to **reveal-correct-arrangement** after wrong CHECK (matches logic-seat-puzzle pattern) because source concept dictates CHECK→NEXT (no retry).
- **Star thresholds:** 3★ = 3 first-CHECK solves, 2★ = 2 solves, 1★ = 1 solve. Source silent; chose linear thresholds because only 3 rounds.
- **Game-over path:** **removed entirely** (no lives).
- **Preview screen:** included (default `previewScreen: true` — PART-039).
- **Variant rendering order:** B1 → B2 → B3 (canonical source order).
- **Pool row layout:** 4 rows (4 + 4 + 4 + 1). DECISION-POINT: could also be 3 rows of 4 + 1 row of 1, or a single scrollable row — chose 4 rows to visually match the source screenshot.
- **Left/right / top/bottom mirroring:** all three variants use the same geometric layout (T1 top-left, T2 top-right, T3 bottom-centre). Source shows the same arrangement for B1; inferred identical for B2/B3.

---

## Warnings

- **WARNING — No retry on wrong answer.** Source concept's "drag-and-drop each hexagon only once" + CHECK-only-once flow means a wrong first attempt gets no revision chance. Platform norm for L4 allows retry. DECISION-POINT for Education slot: keep strict CHECK→NEXT or add a "retry once, then NEXT" scaffold. Spec currently matches source.
- **WARNING — Grade level assumed.** Source silent on grade. 4-digit addition with colour-gating is likely Class 4-6. Confirm with Education slot.
- **WARNING — Only 3 rounds.** Below the default 9 for rounds-based games. Justified by source concept's explicit variant count. Session will be short (~3–5 min). Consider pairing with a companion spec for additional puzzles in future.
- **WARNING — Within a set, all three rounds are cosmetically differentiated but mechanically identical.** Students who memorise the solution from round 1 of a set can auto-replay rounds 2/3 of the same set without thinking. The Try Again rotation to a different set (A → B → C) is what introduces a fresh puzzle. DECISION-POINT: is the within-set variant progression meaningful pedagogically, or should B2/B3 have different pool values (same target values) to keep cognitive demand? Spec currently mirrors source concept exactly (same values across B1/B2/B3 within a set), with cross-set rotation providing the fresh challenge.
- **WARNING — Shared-slot / outer-halo asymmetry.** Geometry design: one blue slot (s11) is "shared" between T2 and T3 but is coloured *white* per the source concept's palette rules. The spec classifies slots by their visual colour (blue vs white), not by their sharing status. Builder must respect the colour-only gating for drag validation, not the sharing relation.
- **WARNING — Pool value authoring (all 9 rounds).** The illustrative pool values in `fallbackContent` for ANY round in ANY set (A, B, or C) may not arithmetically sum to that round's declared targets (a known limitation of hand-edited examples). The builder's `verifyPuzzleSolvability()` step MUST regenerate pool values **independently for each of the three sets** so all three target sums hold simultaneously per set before shipping. Within a set, the regenerated pool + solution is shared across the 3 rounds (only cosmetic fields differ). If the constraint solver cannot find any valid assignment for a given set's target triple, the builder must fall back to adjusting that set's target values (flagging a regression — Set A target values are canonical from the source concept and should remain fixed; Sets B/C may be adjusted as a last resort).
- **WARNING — Colour-gated drag is custom on top of P6.** Pattern P6 does not natively enforce "only blue hex can land in blue slot". Builder must add a colour-check in the drop handler, rejecting mismatched colours (animate snap-back + soft error SFX), without violating any P6 invariant (R1–R4, V1–V24). Drag-state styling cleanup MUST fire on the colour-rejected path too — this is a new 9th drop path not enumerated in p06-drag-and-drop.md's V1–V7 matrix. Treat as "drop-outside-cancel" equivalent: full `resetDragStyling(el)` call, chip returns to source. See Drag-drop gotchas in report.
- **WARNING — R4 drag-state styling cleanup.** Recent update to p06-drag-and-drop.md mandates `resetDragStyling(el)` on every drop path including zone-to-bank-return (V5). This is the #1 drag-drop freeze bug. Builder MUST factor styling reset into a single helper and call from: drop-on-empty, drop-on-occupied-evict, drop-on-occupied-swap, zone-to-zone-transfer, **zone-to-bank-return**, drop-outside-cancel, same-zone-no-op, pointercancel, AND (new) colour-mismatch-reject. 9 paths total.
- **WARNING — 13-hex pool + 13 slots = every hex must be placed.** CHECK button enablement requires all 13 slots filled. With no distractors, if a student mis-colours early, they will hit a dead-end where no valid pool hex matches a remaining slot colour — they must return placements to pool to unblock. This is intentional per source but adds friction; acceptable for L4.
- **WARNING — Bloom-lives compatibility.** L4 default is lives=0 or lives=5. Spec chose 0 (matches source). Acceptable but unusual for L4 challenges.
- **WARNING — Per-target badge UI.** Spec adds ✓/✗ badges to each target hexagon on CHECK — a custom UI affordance not part of standard feedback patterns. Builder must ensure these clear cleanly on round reset and during the reveal-solution animation.

