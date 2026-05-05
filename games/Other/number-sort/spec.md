# Game Design: Number Sort

## Identity

- **Game ID:** number-sort
- **Title:** Number Sort
- **Class/Grade:** 2-4
- **Math Domain:** Number & Operations — Classification
- **Topic:** Even / odd numbers and multiples
- **Archetype:** Sort/Classify (#4)

## Bloom Level

**L2 Understand** — students classify numbers by applying a rule (parity, multiples). No computation, no multi-step procedure — students read a rule per zone, test each number against the rule, and place it in the correct zone. The cognitive work is applying a known definition ("an even number is divisible by 2") to a set of instances, which is exactly Bloom L2.

## One-Line Concept

Kid drags number pills from a bank into labelled category zones (Even / Odd / Multiples of 5) — tests rule-application and categorization.

---

## Target Skills

| Skill | Description | Grade |
|-------|-------------|-------|
| Even/odd classification | Identify whether a number is even or odd by the ones digit | 2-3 |
| Multiples recognition | Identify multiples of 5 and multiples of 3 by the ones digit or quick division | 3-4 |
| Rule application | Read a written rule (zone label) and apply it to a given number | 2-4 |
| Sorting under constraint | Place every item into exactly one of N disjoint buckets | 2-4 |

---

## Core Mechanic

1. Kid sees a set of number pills (tags) in a **bank** at the top and 2-3 labelled **drop zones** below (e.g., "Even numbers" / "Odd numbers").
2. Kid drags a pill from the bank into one of the drop zones.
3. If the pill's number satisfies the zone's rule, the pill **snaps** into the zone and joins the cluster of pills already in that zone.
4. If the pill's number does not satisfy the zone's rule, the pill **bounces back** to the bank. No life lost. An attempt is recorded with a misconception tag.
5. Pills inside a drop zone can be dragged back to the bank or to another zone to correct a placement.
6. Zones and the bank **auto-reflow** (flex-wrap) as pills move in and out — empty slots shrink, filled slots grow. Never absolute positioning.
7. Round complete when every pill in the bank has been placed into its correct zone and the bank is empty.

---

## Rounds & Progression

### Stage 1: Even vs Odd, 2 zones (Rounds 1-2)
- 2 drop zones: **Even numbers**, **Odd numbers**
- 6 tags per round
- Numbers 1-20 (small, familiar range)
- Disjoint rules: every number is exactly one of even or odd

### Stage 2: Multiples of 5 vs Not multiples of 5, 2 zones (Rounds 3-4)
- 2 drop zones: **Multiples of 5**, **Not multiples of 5**
- 8 tags per round
- Numbers 1-40
- Disjoint rules: every number is exactly one of the two

### Stage 3: Three-way classification — Multiples of 3 / Even (not mult of 3) / Odd (not mult of 3) (Round 5)
- 3 drop zones designed to be **mutually exclusive** by priority-free definition:
  - **Multiples of 3** (rule: `n % 3 == 0`)
  - **Even (not a multiple of 3)** (rule: `n % 2 == 0 AND n % 3 != 0`)
  - **Odd (not a multiple of 3)** (rule: `n % 2 == 1 AND n % 3 != 0`)
- 9 tags per round (3 per zone)
- Numbers 1-30
- Zones are phrased on screen as short labels ("Multiples of 3", "Even", "Odd") but the authoritative rule in the spec is the compound one so there is exactly one correct zone per tag.

| Dimension | Stage 1 | Stage 2 | Stage 3 |
|-----------|---------|---------|---------|
| Drop zones | 2 | 2 | 3 |
| Tags per round | 6 | 8 | 9 |
| Number range | 1-20 | 1-40 | 1-30 |
| Rule type | Parity | Divisibility by 5 | Divisibility by 3 combined with parity |
| Ambiguity | None (disjoint) | None (disjoint) | None (compound rules make it disjoint) |

---

## Interaction Pattern

**P6 — Drag-and-Drop (multi-target, multi-drop)**

- Drag pills from the bank into any drop zone.
- Each zone accepts an **unlimited** number of pills. A zone never rejects a drop based on count — only based on the rule.
- Pills on a zone can be picked back up and moved to the bank or to another zone.
- **No rotation, no resizing** — pills are simple rectangular chips with the number.
- Wrong drop → bounce-back animation, pill returns to the bank. Misconception recorded.
- Correct drop → pill snaps into the zone, joins the zone's cluster. Zone and bank reflow.

---

## Drop Zone Behavior

This section is load-bearing for the builder. Every rule below is mandatory.

1. **Multi-drop.** Each drop zone accepts **unlimited** tags. Zones never reject further drops based on count. The only rejection reason is "number does not satisfy this zone's rule."

2. **Tag cluster rendering.** Tags inside a zone render as a cluster using `display: flex; flex-wrap: wrap;` with a gap. A zone with 1 tag renders a single pill. A zone with many tags renders a wrapping row/grid of pills. Cluster height grows as tags are added; zone height is bounded by `min-height` so empty zones don't collapse to zero.

3. **Auto layout.** Both the bank and every drop zone use `display: flex; flex-wrap: wrap;` with `gap` applied via margin (grid `gap` on flex is banned by mobile rules — use `margin` around pills). When a pill is picked up or dropped, the source container loses the pill and reflows (shrinks), the destination container gains the pill and reflows (grows). **No absolute positioning of pills in their resting state** — absolute/transform is allowed only for the drag ghost during an active drag, and for the bounce-back animation.

4. **Re-draggability.** Pills placed inside a drop zone can be picked back up. Dragging from a zone to the bank moves the pill back to the bank. Dragging from zone A to zone B moves the pill directly. The "pill is currently in the bank" vs "pill is currently in zone X" is the only state for each pill.

5. **Wrong-drop behavior.** If a pill is dropped into an incorrect zone:
   - An attempt is recorded with the pill's id, the attempted zone id, and a misconception tag.
   - The pill **bounces back** to the bank with a ~400ms animation (translate back along the drop vector, with a soft ease).
   - The zone flashes red for ~300ms to indicate rejection.
   - No life lost. Pill remains in the bank, available for another try.

6. **Touch-action scope.** Only the draggable `.number-pill` elements get `touch-action: none` + `user-select: none`. Drop zones and the bank container must **NOT** set `touch-action: none` (it would kill page scroll wherever the user's finger lands). Active-drag scroll suppression is handled via a document-level `touchmove` + `preventDefault` keyed on `gameState.isDragging`.

7. **Accessibility.** Pill minimum size 44×44 CSS px. Minimum 8px margin between pills in a cluster. Zones have a clear label (text) above the cluster area and a subtle background tint to distinguish them.

---

## Screen Flow

```
start (preview overlay: PART-039)
  → gameplay (loop 5 rounds; each round = place all pills correctly)
  → results (star rating + "Play again")
```

- **No `game_over` screen** — lives = None, the game cannot end in failure.
- Between-round transitions ("Round 2 of 5", etc.) render inside the preview-wrapper via `TransitionScreen`.
- Results screen shows star rating and "Play again" button.

---

## Common Misconceptions

Every wrong placement in Content Samples is tagged with one of the misconceptions below so test generation and distractor design target real cognitive errors (not random failures).

| Tag | Name | Description |
|-----|------|-------------|
| `confuses_even_odd_by_digit` | Wrong parity by last digit | Kid looks at the ones digit but maps it incorrectly — e.g., thinks 15 is even because "5 looks round" or thinks 12 is odd because 1 is odd. Targets unreliable ones-digit heuristics. |
| `ignores_rule` | Does not read the label | Kid drops the pill into any zone (usually the first/nearest) without reading the zone's rule. Characterized by a random-looking placement pattern. |
| `zero_is_odd` | Zero parity confusion | Kid treats 0 as odd or refuses to classify 0. Relevant when 0, 10, 20 appear — the correct bucket for these is "even" and "multiple of 5" respectively. |
| `multiples_of_all` | Over-inclusive multiple rule | Kid places a number into every zone it "fits" under a loose reading — e.g., places 6 under both "Even" and "Multiples of 3" in Stage 3. Because zones are disjoint by design, this shows up as first trying a wrong zone even though a strictly-correct one exists. |
| `rule_reversal` | Applies the inverse rule | Kid applies the opposite of the zone's rule — places even numbers in "Odd", multiples of 5 in "Not multiples of 5". Characterized by a symmetric mirror pattern. |

---

## Round Schema

```ts
Round = {
  roundId: number,
  stage: number,
  dropZones: DropZone[],
  tags: Tag[],
  previewInstruction: string,   // HTML, shown on preview overlay (PART-039)
  previewAudioText: string,     // plain-text TTS for preview audio
  expected_misconception: string  // one of the misconception tags above
}

DropZone = {
  zoneId: string,      // e.g., "even", "odd", "mult5"
  label: string,       // short text shown above the cluster (≤ 20 chars)
  rule: string,        // human-readable rule description (shown in UI or tooltip)
  acceptIf: string     // executable rule description (e.g., "n % 2 === 0")
}

Tag = {
  tagId: string,       // "t1", "t2", ...
  value: number,       // the number displayed on the pill
  correctZone: string  // the zoneId this tag must land in
}
```

**Correctness convention:**
- Every tag has exactly one correct zone (by design — zones are disjoint).
- A round is complete when every tag's current container equals its `correctZone` AND the bank is empty.
- Partial correctness is visible in the DOM (pills sit in the zone they were dropped in) but scoring is per-round-complete, not per-pill.

---

## Content Samples

Five fully specified rounds. Every tag has been verified: exactly one `acceptIf` rule across the round's zones matches the tag's value.

### Round 1 — Stage 1 (Even vs Odd, 6 tags)

- **roundId:** 1, **stage:** 1
- **Drop zones:**

| zoneId | label | rule | acceptIf |
|--------|-------|------|----------|
| `even` | Even | Number is divisible by 2 | `n % 2 === 0` |
| `odd`  | Odd  | Number is not divisible by 2 | `n % 2 === 1` |

- **Tags:**

| tagId | value | correctZone |
|-------|-------|-------------|
| t1 | 4 | even |
| t2 | 7 | odd  |
| t3 | 10 | even |
| t4 | 3 | odd  |
| t5 | 8 | even |
| t6 | 5 | odd  |

- **previewInstruction:** `<p>Drag each number into <b>Even</b> or <b>Odd</b>.</p>`
- **previewAudioText:** `Drag each number into the even or odd box. Even numbers end in 0, 2, 4, 6, or 8.`
- **expected_misconception:** `confuses_even_odd_by_digit`

### Round 2 — Stage 1 (Even vs Odd, 6 tags)

- **roundId:** 2, **stage:** 1
- **Drop zones:** same as Round 1 (`even`, `odd`)
- **Tags:**

| tagId | value | correctZone |
|-------|-------|-------------|
| t1 | 14 | even |
| t2 | 19 | odd  |
| t3 | 6  | even |
| t4 | 11 | odd  |
| t5 | 20 | even |
| t6 | 17 | odd  |

- **previewInstruction:** `<p>More numbers! Sort each one into <b>Even</b> or <b>Odd</b>.</p>`
- **previewAudioText:** `More numbers. Sort each one into even or odd. The last digit tells you.`
- **expected_misconception:** `rule_reversal`

### Round 3 — Stage 2 (Multiples of 5 vs Not multiples of 5, 8 tags)

- **roundId:** 3, **stage:** 2
- **Drop zones:**

| zoneId | label | rule | acceptIf |
|--------|-------|------|----------|
| `mult5`   | Multiples of 5 | Number is divisible by 5 | `n % 5 === 0` |
| `notmult5`| Not multiples of 5 | Number is not divisible by 5 | `n % 5 !== 0` |

- **Tags:**

| tagId | value | correctZone |
|-------|-------|-------------|
| t1 | 5  | mult5 |
| t2 | 7  | notmult5 |
| t3 | 10 | mult5 |
| t4 | 12 | notmult5 |
| t5 | 15 | mult5 |
| t6 | 23 | notmult5 |
| t7 | 20 | mult5 |
| t8 | 31 | notmult5 |

- **previewInstruction:** `<p>Sort each number into <b>Multiples of 5</b> or <b>Not multiples of 5</b>.</p>`
- **previewAudioText:** `Sort each number. Multiples of 5 always end in 0 or 5.`
- **expected_misconception:** `ignores_rule`

### Round 4 — Stage 2 (Multiples of 5 vs Not multiples of 5, 8 tags)

- **roundId:** 4, **stage:** 2
- **Drop zones:** same as Round 3 (`mult5`, `notmult5`)
- **Tags:**

| tagId | value | correctZone |
|-------|-------|-------------|
| t1 | 25 | mult5 |
| t2 | 8  | notmult5 |
| t3 | 35 | mult5 |
| t4 | 14 | notmult5 |
| t5 | 40 | mult5 |
| t6 | 27 | notmult5 |
| t7 | 30 | mult5 |
| t8 | 19 | notmult5 |

- **previewInstruction:** `<p>Bigger numbers. Find the <b>Multiples of 5</b>!</p>`
- **previewAudioText:** `Bigger numbers now. Find the multiples of 5.`
- **expected_misconception:** `multiples_of_all`

### Round 5 — Stage 3 (Three-way, 9 tags)

- **roundId:** 5, **stage:** 3
- **Drop zones:**

| zoneId | label | rule | acceptIf |
|--------|-------|------|----------|
| `mult3` | Multiples of 3 | Number is divisible by 3 | `n % 3 === 0` |
| `even_not3` | Even | Even, not a multiple of 3 | `n % 2 === 0 && n % 3 !== 0` |
| `odd_not3` | Odd | Odd, not a multiple of 3 | `n % 2 === 1 && n % 3 !== 0` |

- **Tags:** (every tag fits exactly one zone by the compound rules above)

| tagId | value | correctZone | why |
|-------|-------|-------------|-----|
| t1 | 9  | mult3 | 9 = 3×3 |
| t2 | 12 | mult3 | 12 = 3×4 |
| t3 | 21 | mult3 | 21 = 3×7 |
| t4 | 4  | even_not3 | even, not ÷3 |
| t5 | 8  | even_not3 | even, not ÷3 |
| t6 | 20 | even_not3 | even, not ÷3 |
| t7 | 5  | odd_not3  | odd, not ÷3 |
| t8 | 11 | odd_not3  | odd, not ÷3 |
| t9 | 25 | odd_not3  | odd, not ÷3 |

- **previewInstruction:** `<p>The <b>final round</b>! Three boxes. Multiples of 3 first, then Even, then Odd.</p>`
- **previewAudioText:** `The final round. Three boxes. If the number is a multiple of 3, put it in the first box. Otherwise sort by even or odd.`
- **expected_misconception:** `multiples_of_all`

**Zone-label note:** On screen, the labels are simply `Multiples of 3`, `Even`, `Odd` for readability. The authoritative rule for `even_not3` and `odd_not3` excludes multiples of 3. The preview audio explicitly tells students to check "multiple of 3" first — this makes the categorization deterministic from the student's perspective even though the on-screen zone labels are short.

---

## Scoring

- Points: +1 per round completed (max 5).
- Stars: 3 stars = all 5 rounds solved, 2 stars = 3-4 rounds solved, 1 star = 1-2 rounds solved.
- Lives: None.
- Partial credit: None — a round is either solved (every pill in its correct zone, bank empty) or not yet.

---

## Feedback

Game type: **Multi-step** (multiple drops per round). Per `feedback.md`, multi-step games use SFX + sticker only, fire-and-forget, for mid-round feedback. Round-complete and end-game audio is awaited.

| Event | Behavior |
|-------|----------|
| Pick-up pill | Soft bubble SFX, fire-and-forget. No sticker. |
| Correct drop (mid-round) | Snap SFX with small "thumbs up" sticker — fire-and-forget. Pill locks into zone; cluster reflows. No dynamic TTS, no subtitle. |
| Wrong drop (mid-round) | Wrong SFX with sad sticker — fire-and-forget. Pill bounces back to bank. Zone flashes red ~300ms. No dynamic TTS, no subtitle. |
| 2 consecutive wrong drops of same pill | Soft highlight on the correct zone for ~1.5s (scaffold reveal, per pedagogy.md "reveal after 2 wrong"). Pill still only snaps on correct drop. |
| Round complete (bank empty, all pills in correct zones) | `progressBar.update(currentRound, 0)` fires **first**. Then awaited round-complete SFX + sticker + subtitle ("Round complete!"). Then advance to next round. |
| All 5 rounds complete | Results screen renders first. `game_complete` postMessage sent. Then victory SFX → victory VO (sequential, awaited). CTA ("Play again") is visible and interrupts audio on tap. |
| Visibility hidden | `VisibilityTracker` built-in popup (autoShowPopup default). Timer/audio pause. |
| Audio failure | Non-blocking. Visual feedback (snap, bounce-back, red flash, sticker) still renders. |

---

## Game Parameters

- **Rounds:** 5
- **Timer:** None
- **Lives:** None (no penalty for wrong drop — pill bounces back)
- **Star rating:** 3 stars = all 5 rounds, 2 stars = 3-4, 1 star = 1-2
- **Input:** Drag-and-drop only (P6, multi-target)
- **Feedback:** Multi-step — fire-and-forget SFX + sticker mid-round; awaited SFX + TTS on round complete; results screen before end-game audio.
- **Progress bar:** Represents rounds completed (1..5). Advances by exactly one increment when a full round is solved.
- **Bounce-back hint escalation (scaffold):** After 2 consecutive wrong drops of the same pill in the same round, briefly highlight the correct zone (soft glow ~1.5s). Visual only — pill still snaps only on a correct drop.

---

## Defaults Applied

- **Star thresholds:** 5 rounds = 3 stars, 3-4 = 2 stars, 1-2 = 1 star (spec-specific, uses round-count not percentage — matches jigsaw-puzzle pattern).
- **Bloom level:** L2 Understand (creator did not specify; matches Sort/Classify archetype default and the rule-application cognitive demand).
- **Lives:** 0 (Sort/Classify default + L1-L2 no-penalty pedagogy; creator specified "no lives").
- **Timer:** 0 (Sort/Classify default; creator specified "no timer").
- **Feedback delay:** Default bounce-back animation (~400ms); snap-on-correct instant.
- **Scaffolding:** Highlight correct zone after 2 wrong drops of the same pill (pedagogy.md L2 "reveal after 2 wrong").
- **Stage 3 category design:** Creator left the overlap-handling choice open. **Applied default: use compound rules (`even_not3`, `odd_not3`) to keep zones strictly disjoint** rather than a priority-based scheme. This makes the math unambiguous: every tag fits exactly one zone under its `acceptIf`. The on-screen label stays short ("Even", "Odd") for readability; the preview audio tells the student to check "multiple of 3" first. **Alternative considered and rejected:** using `Even / Odd / Multiples of 5 > 10` — also disjoint but introduces the ">10" edge case that creates its own misconception space. The Multiples-of-3 compound variant sticks closer to the creator's original intent.
- **Pill values:** Chosen to be small, familiar numbers within the grade range; each round's values selected so every `correctZone` is represented at least once and the parity/mult distribution is balanced.
- **Wrong-drop behavior:** Bounce-back (matches jigsaw pattern); accept-then-show-wrong rejected because it leaves incorrect pills visible in the wrong zone and conflicts with the "round complete when every pill is in its correct zone" rule.
- **Misconception assignment:** Each round's `expected_misconception` is the single most-likely cognitive error for that round's content; test generation targets this misconception as the primary failure mode.

## Warnings

- **WARNING:** Stage 3 uses compound rules (`n % 2 === 0 && n % 3 !== 0`) that are more rigorous than the short on-screen zone labels ("Even", "Odd") suggest. The preview audio resolves the ambiguity explicitly ("If it's a multiple of 3, put it in the first box"). If UI/UX audit finds students ignore the audio and try to sort purely by short label, consider relabelling the zones to "Even (not ÷3)" / "Odd (not ÷3)" — but be aware those labels exceed ~20 chars and may truncate on mobile.
- **WARNING:** The `multiples_of_all` misconception only fires in Stage 3 where it is possible to mis-place (e.g., dropping 12 into "Even" when the correct zone is "Multiples of 3"). Stages 1 and 2 have strictly disjoint simple rules — the misconception cannot manifest there. This is intentional but means test generation for Stages 1-2 should target the other four misconceptions only.
- **WARNING:** Round 5 has 9 tags across 3 zones. On a 375px-wide mobile viewport, three drop zones side-by-side risks cramping. The builder should default to a **vertical stack of zones** (each zone is full-width, pills wrap within) for Stage 3 unless the 3-zone horizontal layout demonstrably fits with 44px pill targets + 8px gaps. `flex-wrap: wrap` on the zones-container is the safe default.
- **WARNING:** Multi-drop + re-draggability means the DOM state for each pill must be tracked by `gameState` (current container id per pill), not inferred from live DOM. Tests will assert `gameState.pillLocations[tagId] === correctZoneId` for all tags.
- **WARNING:** No `previewScreen: false` override is specified, so the PART-039 preview screen is enabled. `previewInstruction`, `previewAudioText`, and `previewAudio` (TTS-patched at deploy) are required on every round.
