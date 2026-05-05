# Screens: Age Matters

## Screen Inventory

- **preview** (`data-phase="start"`) — PART-039 PreviewScreen.
- **welcome** / **round_intro** (`data-phase="round_intro"`) — TransitionScreen, fired before every round (R1..R10).
- **gameplay** (`data-phase="gameplay"`) — Play Area; renders Type A / B / C round.
- **stage_takeaway** (`data-phase="motivation"`) — TransitionScreen, fired after R3 (Stage 1→2) and R7 (Stage 2→3).
- **victory** (`data-phase="victory"`) — TransitionScreen with stars.
- **stars_collected** (`data-phase="stars_collected"`) — TransitionScreen terminal celebration backdrop.
- **answer_carousel** (`data-phase="answer_carousel"`) — AnswerComponent overlay (10 slides).

(NO `game_over` screen — `totalLives = 0`, no path leads here. Validator note: archetype-7 lists `game_over` as conditional.)

---

## Persistent fixtures (drawn on every non-Preview wireframe)

- **Preview header** at the very top — owned by PreviewScreenComponent (avatar, "Age Matters" label, score chip, star). Visible in both preview + game states.
- **ProgressBar** below the preview header (10 segments) — `currentRound / totalRounds`. Visible on every non-Preview screen.
- **First-tap counter chip** — sits alongside the progress bar, e.g. "21/30 correct so far". Updates after every step-decision.
- **NO lives indicator** (lives = 0; the slot is hidden, not zero-rendered).
- **NO timer chip** (no timer).

---

## preview (data-phase="start")

### Layout

```
┌─────────────────────────────────┐
│ Age Matters                  ✦  │ <- preview header (avatar + label + star)
├─────────────────────────────────┤
│                                 │
│   [Sticker / Alfred avatar]     │
│                                 │
│   Translate the word problem    │
│   into an equation.             │ <- previewInstruction HTML
│                                 │
│   Each round has 3 small steps: │
│     1. Pick the person you want │
│        to call x.               │
│     2. Write the other          │
│        person's age.            │
│     3. Write the equation.      │
│                                 │
│   Wrong taps just give you a    │
│   hint — no lives lost. Three   │
│   stars for getting most steps  │
│   right on the first try.       │
│                                 │
│            ▶ Start              │
│                                 │
└─────────────────────────────────┘
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top | "Age Matters" label, avatar, star icon | no |
| Sticker | top-center | Alfred mascot waving | no |
| previewInstruction | center | HTML from `fallbackContent.previewInstruction` (verbatim) | no |
| previewAudio | (auto, onMounted) | TTS reads `previewAudioText` (filled by deploy-time pipeline) | no |
| Start CTA | bottom | exact label: **"Start"** → routes to Welcome / Round-1 intro TS | tap |

### Entry condition

Game boots; `previewScreen.show(...)` mounts.

### Exit condition

Player taps **Start** → `previewScreen.hide()` → `transitionScreen.show({title:'Round 1 of 10', ...})`.

---

## round_intro (data-phase="round_intro") — fires before every round R1..R10

### Layout

```
┌─────────────────────────────────┐
│ Age Matters         ●●●─── 0/30 │ <- header + progress (segment 0..N filled) + first-tap chip
├─────────────────────────────────┤
│                                 │
│         [round sticker]         │
│                                 │
│         Round N of 10           │ <- title (exact)
│                                 │
│      Translating ages into      │ <- subtitle (game-specific, optional)
│           equations             │
│                                 │
│         (tap anywhere)          │
│                                 │
└─────────────────────────────────┘
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Sticker / Icon | top-center | named sticker `alfred_thinking` | no |
| Title | center | exact quoted string: **"Round N of 10"** (N = currentRound) | no |
| Subtitle | center | omitted on round_intro (no subtitle row) | no |
| Audio | (auto, onMounted) | `await sound.play('rounds_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content:'Round N', subtitle:'Round N'})` (sequential, awaited) | no |
| Tap-to-continue | full screen | tap anywhere dismisses → `transitionScreen.hide()` → `renderRound(N)` | tap |

(No CTA button; `buttons: []` — tap-to-dismiss only.)

### Entry condition

Either Preview Start, previous round's round-complete handler, or stage-takeaway tap-to-continue.

### Exit condition

Tap-to-dismiss → gameplay R-N renders. `gameState.isProcessing = false` is set in `renderRound(N)` (single source of truth — see MEMORY `feedback_window_loadround_shadow`: never name a local function `loadRound`).

---

## gameplay — Type A (Stage 1, single person + time shift)

### Layout (375×667 mobile portrait)

```
┌─────────────────────────────────┐
│ Age Matters         ●●○──── 4/30│ <- header + progress (1 of 10 filled) + first-tap chip
├─────────────────────────────────┤
│ Step 1 / 3                      │ <- step indicator chip (left)
├─────────────────────────────────┤
│                                 │
│  Five years ago, Aman was 12.   │ <- problemText panel (HTML, friendly large)
│  How old is he now?             │
│                                 │
│  [TTS auto-reads at round start]│ <- (fire-and-forget VO)
│                                 │
├─────────────────────────────────┤
│   Step 1 — Pick the variable    │ <- step header (active step only)
│                                 │
│         ┌──────────┐            │
│         │ Aman = x │            │ <- single name tile (Type A: 1 tile)
│         └──────────┘            │
│                                 │
│  (taps Aman → green tick →      │
│   Step 2 fades in over 300ms)   │
│                                 │
├─────────────────────────────────┤
│   Step 2 — Aman's age 5 yr ago  │ <- (hidden until Step 1 complete)
│                                 │
│   ┌──────────┐  ┌──────────┐    │
│   │ x − 5    │  │ x + 5    │    │ <- direction tiles (Type A only)
│   └──────────┘  └──────────┘    │
│                                 │
├─────────────────────────────────┤
│   Step 3 — Build the equation   │ <- (hidden until Step 2 complete)
│                                 │
│   Slot template:                │
│   [ ___ ] = 12                  │ <- slot template (1 empty slot)
│                                 │
│   Piece bank:                   │
│   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  │
│   │x│ │−│ │+│ │5│ │=│ │12│ │4│  │ <- piece bank (correct + 2 distractors)
│   └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  │
│                                 │
├─────────────────────────────────┤
│   [contextual hint panel]       │ <- empty unless wrong-tap; small panel below play area
└─────────────────────────────────┘
```

(NO floating Submit button during gameplay. Each step auto-evaluates on tap or slot-fill.)

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top | persistent fixture | no |
| ProgressBar | below header | `currentRound / 10`, segment filled per round-complete | no |
| First-tap counter chip | next to progress bar | "N/30 correct so far" (updates after every step) | no |
| Step indicator chip | top-left of play area | "Step 1 / 3" / "Step 2 / 3" / "Step 3 / 3" (active step) | no |
| Word-problem panel | upper third | HTML from `round.problemText`; large friendly text | no |
| Round-start TTS | (auto, onMounted) | `playDynamicFeedback({audio_content: round.problemAudioText}).catch(...)` — FIRE-AND-FORGET | no |
| Step-1 tile row | mid (active step only) | single tile `Name = x` (Type A) — tap to confirm | tap |
| Step-2 direction tiles | mid (after Step 1) | two tiles labeled per `step2.tiles[]` (e.g. `x − 5` / `x + 5`) | tap |
| Step-3 slot template | lower | row of slot pills, `__slot__` rendered as empty pill, pinned content rendered as filled pill | tap-to-clear |
| Step-3 piece bank | bottom | tiles for each piece in `round.step3.pieceBank` | tap-to-place |
| Contextual hint panel | below play area | small inline panel; renders `round.step{2,3}.hints[misconception]` text on wrong tap; clears on next valid input | no |

### Entry condition

`renderRound(N)` paints the full gameplay screen for the round at index N (1-indexed). Word-problem panel and Step-1 tile row are visible immediately; Step-2 and Step-3 are hidden behind `display:none` and revealed via `loadStep(2)` / `loadStep(3)`.

### Exit condition

Step-3 slot-template fills + AST match → round-complete handler runs (see round-flow.md). Auto-advances to round_intro TS for round N+1, OR to stage_takeaway TS, OR to Victory TS.

### Round Presentation Sequence

1. **Question preview** — word-problem panel renders with `round.problemText`. Step-1 tile row visible. Steps 2 & 3 hidden.
2. **Instructions** — NOT a separate text block. Owned by PreviewScreen. Per-round step indicator (`Step N / 3`) is a *prompt*, not an instruction repeat.
3. **Media** — `round.problemAudioText` plays as fire-and-forget TTS. Skippable (a fast reader can interact immediately).
4. **Gameplay reveal** — Step-1 tile row's tap handler is bound; `gameState.isProcessing = false`. Each subsequent step's UI fades in (350ms) when the previous step completes.

---

## gameplay — Type B (Stage 2, two people present tense)

### Layout (375×667)

```
┌─────────────────────────────────┐
│ Age Matters         ●●●●●─ 12/30│ <- progress 4/10 filled
├─────────────────────────────────┤
│ Step 1 / 3                      │
├─────────────────────────────────┤
│                                 │
│  Mira is 3 years younger than   │
│  her brother Ravi. Together     │ <- problemText
│  their ages sum to 25. How old  │
│  is Mira?                       │
│                                 │
├─────────────────────────────────┤
│   Step 1 — Pick the variable    │
│   ┌─────────┐  ┌─────────┐      │
│   │  Mira   │  │  Ravi   │      │ <- TWO name tiles (Type B/C)
│   └─────────┘  └─────────┘      │
├─────────────────────────────────┤
│   Step 2 — Ravi's age           │ <- (hidden until Step 1 complete)
│                                 │
│   Slot template:                │
│   [ x ] [ ___ ] [ ___ ]         │ <- 3 slots; x pinned, op + num to fill
│                                 │
│   Piece bank:                   │
│   ┌─┐ ┌─┐ ┌─┐ ┌──┐ ┌─┐          │
│   │+│ │−│ │3│ │25│ │4│          │ <- correct (+, 3) + 3 distractors
│   └─┘ └─┘ └─┘ └──┘ └─┘          │
│                                 │
├─────────────────────────────────┤
│   Step 3 — Build the equation   │
│                                 │
│   Slot template:                │
│   [ x ] + [ ___ ] = [ 25 ]      │ <- partially pre-filled from Step 2
│                                 │
│   Piece bank:                   │
│   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌──┐ ┌──┐ ┌─┐│
│   │+│ │−│ │·│ │3│ │25│ │28│ │22│ <- 3 distractors
│   └─┘ └─┘ └─┘ └─┘ └──┘ └──┘ └─┘│
│                                 │
├─────────────────────────────────┤
│   [contextual hint panel]       │
└─────────────────────────────────┘
```

### Elements

(Same structure as Type A; differences:)

| Element | Differences from Type A |
|---------|-------------------------|
| Step-1 tile row | TWO name tiles (preferredVariable in `round.preferredVariable`); tapping non-preferred forfeits first-tap point + shows "soft-wrong" hint (`variable-choice-suboptimal`); student can re-tap the other tile, OR proceed (the equation is still solvable in either form, but the build pins the canonical AST to the preferred-variable form). |
| Step 2 | Becomes a real `pieceBank` round (`step2.kind === 'pieceBank'`): 3-slot template with `x` pinned in slot 1, op + num to fill in slots 2 & 3. Auto-evaluates when all 3 slots are full. |
| Piece-bank distractors | 3 (vs 2 in Type A). |

### Entry / exit

Same as Type A.

---

## gameplay — Type C (Stage 3, two people across time)

### Layout (375×667)

```
┌─────────────────────────────────┐
│ Age Matters         ●●●●●●●●─ 22/30│
├─────────────────────────────────┤
│ Step 1 / 3                      │
├─────────────────────────────────┤
│                                 │
│  Anita is twice as old as       │
│  Bobby. In 6 years, the sum of  │ <- problemText
│  their ages will be 33. How     │
│  old is Bobby now?              │
│                                 │
├─────────────────────────────────┤
│   Step 1 — Pick the variable    │
│   ┌─────────┐  ┌─────────┐      │
│   │  Bobby  │  │  Anita  │      │
│   └─────────┘  └─────────┘      │
├─────────────────────────────────┤
│   Step 2 — Anita's age now      │
│                                 │
│   Slot template:                │
│   [ ___ ] · [ x ]               │ <- "·" pinned for "twice as old"
│                                 │
│   Piece bank:                   │
│   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌──┐          │
│   │2│ │3│ │6│ │+│ │33│          │ <- correct (2) + distractors
│   └─┘ └─┘ └─┘ └─┘ └──┘          │
├─────────────────────────────────┤
│ ⚠ In 6 years, add 6 to each age.│ <- TIME-SHIFT REMINDER BANNER (Type C only)
├─────────────────────────────────┤
│   Step 3 — Build the equation   │
│                                 │
│   ( x + ___ ) + ( ___ + ___ )   │ <- slot template with parens scaffold
│                = 33             │
│                                 │
│   Piece bank:                   │
│   ┌─┐ ┌──┐ ┌─┐ ┌─┐ ┌─┐ ┌──┐ ┌─┐ ┌──┐│
│   │x│ │2x│ │+│ │−│ │6│ │33│ │=│ │27││
│   └─┘ └──┘ └─┘ └─┘ └─┘ └──┘ └─┘ └──┘│
│                                 │
├─────────────────────────────────┤
│   [contextual hint panel]       │
└─────────────────────────────────┘
```

### Elements

(Same structure as Type B; differences:)

| Element | Differences |
|---------|-------------|
| Time-shift reminder banner | NEW — passive UI element above Step-3 builder. Reads "In k years, add k to each age." or "k years ago, subtract k from each age." per `round.timeDelta` sign. NOT a decision; not interactive. Type C only. |
| Step-3 slot template | Includes parens to scaffold the time-shift application (each person's future / past age is enclosed). E.g. `(x + 6) + (2x + 6) = 33`. |
| Piece bank | Includes correct pieces + the relevant `n·x`-shaped tile (e.g. `2x` or `3x`) AS A SINGLE PIECE — to reduce slot-count clutter. |

### Entry / exit

Same as Types A and B. Round 10's exit goes to `endGame(true)` → Victory TS (not to a Round-11 intro).

---

## stage_takeaway (data-phase="motivation") — fired after R3 and R7

### Layout

```
┌─────────────────────────────────┐
│ Age Matters         ●●●●─── 9/30│
├─────────────────────────────────┤
│                                 │
│       [motivation sticker]      │
│                                 │
│         Stage 1 done.           │ <- title (exact for after-R3)
│                                 │
│   "Time-shifts add or subtract  │ <- subtitle (exact for after-R3)
│    from every age in the room." │
│                                 │
│         (tap to continue)       │
│                                 │
└─────────────────────────────────┘
```

### Elements (after R3, Stage-1→2)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Sticker / Icon | top-center | named sticker `alfred_celebration` | no |
| Title | center | exact: **"Stage 1 done."** | no |
| Subtitle | center | exact: **"Time-shifts add or subtract from every age in the room."** | no |
| Audio | (auto, onMounted) | `await sound.play('motivation_sound_effect', {sticker:'celebration'})` → `await playDynamicFeedback({audio_content: subtitle, subtitle, sticker:'celebration'})` | no |
| Tap-to-continue | full screen | `buttons: []` — tap-to-dismiss → Round-4 intro TS | tap |

### Elements (after R7, Stage-2→3)

| Element | Differences |
|---------|-------------|
| Title | exact: **"Stage 2 done."** |
| Subtitle | exact: **"Notice how picking the younger person as `x` kept the numbers small."** |

### Entry / exit

Entry: round-complete handler detects `currentRound === 3` or `currentRound === 7` AFTER its scoring updates. Exit: tap-to-dismiss → next round's round_intro TS.

---

## victory (data-phase="victory")

### Layout

```
┌─────────────────────────────────┐
│ Age Matters         ●●●●●●●●●● 30/30│
├─────────────────────────────────┤
│                                 │
│        [victory sticker]        │
│                                 │
│           Victory!              │ <- title (exact)
│                                 │
│   You translated all 10         │
│   problems!                     │ <- subtitle (exact)
│                                 │
│         ★ ★ ★                   │ <- stars rendered (3 / 2 / 1)
│                                 │
│       [Claim Stars]             │ <- primary CTA
│       [Play Again]              │ <- secondary CTA, ONLY if stars < 3
│                                 │
└─────────────────────────────────┘
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Sticker / Icon | top-center | named sticker `alfred_celebration` | no |
| Title | center | exact: **"Victory!"** | no |
| Subtitle | center | exact: **"You translated all 10 problems!"** | no |
| Stars row | center | `stars` ∈ {1,2,3} rendered (per first-tap rubric) | no |
| Audio | (auto, onMounted) | `await sound.play('victory_sound_effect', {sticker:'celebration'})` → `await playDynamicFeedback({audio_content: 'Victory! You translated all 10 problems.', subtitle, sticker:'celebration'})` | no |
| CTA 1 | bottom | exact label: **"Claim Stars"** → `showStarsCollected()` (NEVER calls `answerComponent.show()` from this action — validator `GEN-ANSWER-COMPONENT-AFTER-CELEBRATION`) | tap |
| CTA 2 | bottom | exact label: **"Play Again"** → `rotateRoundSet()` + `resetGameState()` + Round-1 intro TS. ONLY rendered when `stars < 3`. | tap |

### Entry condition

`endGame(true)` after Round-10 round-complete handler awaits feedback + posts `game_complete` BEFORE end-game audio.

### Exit condition

Claim Stars tap → Stars Collected TS. Play Again tap → restart with rotated set.

---

## stars_collected (data-phase="stars_collected") — terminal celebration backdrop

### Layout

```
┌─────────────────────────────────┐
│        [stars-collected         │
│         celebration sticker]    │
│                                 │
│      Yay! Stars collected!      │ <- title (exact)
│                                 │
│         ★ ★ ★                   │ <- stars rendered + show_star animation
│                                 │
│   (no buttons — terminal TS)    │
│                                 │
│   AnswerComponent + Next        │
│   layer over this backdrop      │
│   after ~1500 ms setTimeout     │
└─────────────────────────────────┘
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Sticker / Icon | top-center | named sticker `alfred_celebration` | no |
| Title | center | exact: **"Yay! Stars collected!"** | no |
| Stars row | center | stars rendered with `show_star` animation | no |
| Audio | (auto, onMounted) | `onMounted: async () => { await sound.play('sound_stars_collected', {sticker:'celebration'}); postMessage({type:'show_star'}); setTimeout(showAnswerCarousel, 1500); }` | no |
| Buttons | — | `buttons: []` — NO buttons. Tap-to-dismiss disabled (`persist: true`). The TS stays mounted as the celebration backdrop while AnswerComponent + Next layer over it. | no |

### Entry condition

Claim Stars tap on Victory TS → `showStarsCollected()`.

### Exit condition

NEVER unmounts on its own. The single-stage Next exit (after AnswerComponent) destroys both the TS and AnswerComponent simultaneously: `transitionScreen.destroy()` is implicit via the page tear-down on `next_ended`.

---

## answer_carousel (data-phase="answer_carousel") — AnswerComponent overlay

### Layout (one slide; carousel paginates between 10 slides)

```
┌─────────────────────────────────┐
│  Correct Answers!     1 / 10    │ <- carousel header (built-in to PART-051)
├─────────────────────────────────┤
│                                 │
│  Five years ago, Aman was 12.   │ <- round.answer.problemText (compact)
│  How old is he now?             │
│                                 │
│  Equation:                      │
│      x − 5 = 12                 │ <- canonicalEquationDisplay
│                                 │
│  Solve:                         │
│      x − 5 = 12                 │ <- solveLines (2-3 lines)
│      x = 17                     │
│                                 │
│  Answer:                        │
│      ┌────────────────┐         │
│      │ Aman (now): 17 │         │ <- captioned ages
│      └────────────────┘         │
│                                 │
│  "Five years ago" subtracts 5   │ <- one-line explanation
│  from his current age x.        │
│                                 │
│  ◀  ●●○○○○○○○○  ▶               │ <- carousel nav (built-in)
│                                 │
└─────────────────────────────────┘
                                  ↓
┌─────────────────────────────────┐
│        Next                     │ <- FloatingButton primary, AFTER show()
└─────────────────────────────────┘
```

### Elements (per slide)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Carousel header | top | "Correct Answers!" + "N / 10" pager (built-in to PART-051) | no |
| Problem text | top of slide | `round.answer.problemText` (compact) | no |
| Canonical equation | mid-upper | `round.answer.canonicalEquationDisplay` (e.g. `x − 5 = 12`) | no |
| Solve lines | mid | `round.answer.solveLines` rendered one per line | no |
| Captioned ages | mid-lower | `round.answer.captionedAnswers` rendered as small bubbles | no |
| Explanation | bottom of slide | `round.answer.explanation` — one-line | no |
| Carousel nav | bottom | left/right arrows + dot pager (built-in to PART-051) | tap |
| FloatingButton "Next" | fixed bottom | `floatingBtn.setMode('next')` AFTER `answerComponent.show()` | tap |

### Slide builder

```
function buildAnswerSlidesForAllRounds() {
  const setLetter = ['A','B','C'][gameState.setIndex];
  const rounds = fallbackContent.rounds.filter(r => r.set === setLetter); // length === 10
  return rounds.map(round => ({
    render(container) {
      // Self-contained: reads round.answer.problemText, .canonicalEquationDisplay,
      // .solveLines, .captionedAnswers, .explanation. No DOM lookups outside `container`.
      // Use template literal + container.innerHTML, then bind nothing (slide is non-interactive).
      renderAnswerSlideForRound(round, container);
    }
  }));
}
```

(Slide payload uses `{render(container){...}}` callbacks — NEVER `{html: '...'}` strings, NEVER `{element: ...}` — per PART-051 validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`.)

### Entry condition

`setTimeout` from Stars Collected `onMounted` fires `showAnswerCarousel()` after ~1500 ms.

### Exit condition

Tap **Next** on FloatingButton → `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({type:'next_ended'}); previewScreen.destroy(); floatingBtn.destroy(); })`. Single-stage exit (NOT a two-stage handler — validator `GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE`). The Stars Collected TS underneath is torn down as part of page tear-down.

---

## Round Presentation Sequence (gameplay screens, all types)

Every gameplay round (Types A, B, C across all sets) follows the same 4-phase render sequence:

1. **Question preview** — `round.problemText` panel paints. Step-1 tile row visible. Steps 2 & 3 hidden behind `display:none`.
2. **Instructions** — NOT a separate text block. The "how to play" copy is delivered ONCE by the PreviewScreen before Round 1 starts. Per-round step indicator (`Step N / 3`) is a lightweight prompt, not an instruction repeat. Round-type changes (A → B → C) are conveyed via the **stage_takeaway** TS, not via inline instruction banners.
3. **Media** — `round.problemAudioText` plays as fire-and-forget TTS (`playDynamicFeedback({audio_content: round.problemAudioText, subtitle: round.problemText.text, sticker:null}).catch(...)`). Skippable.
4. **Gameplay reveal** — Step-1 tile row's tap handler is bound; `gameState.isProcessing = false`. Step-2 / Step-3 UIs fade in (350ms with `.fade-in`) when their step opens via `loadStep(2)` / `loadStep(3)`.
