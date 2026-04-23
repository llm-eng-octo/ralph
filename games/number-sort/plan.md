# Pre-Generation Plan: Number Sort

**Game ID:** number-sort
**Archetype:** Sort/Classify (#4) — Shape 2 (Multi-round)
**Bloom:** L2 Understand
**Interaction:** P6 Drag-and-Drop (multi-target, multi-drop)
**Rounds:** 5 | **Lives:** None | **Timer:** None | **PreviewScreen:** YES (mandatory per PART-039)

---

## 1. Screen Flow

```
          ┌─────────────────────────────────────────────────────────────────┐
          │                     PreviewScreen wrapper                       │
          │   (persistent: header bar + scroll area + progress-bar slot)    │
          │                                                                 │
          │   DOMContentLoaded                                              │
          │        │                                                        │
          │        ▼                                                        │
          │   setupGame()  ── renderRound(0) ── previewScreen.show() ──┐    │
          │                                                            │    │
          │                                                            ▼    │
          │                                                ┌──── Preview State ────┐
          │                                                │ blue progress bar,    │
          │                                                │ instruction HTML,     │
          │                                                │ "Skip & show options" │
          │                                                └───────────┬───────────┘
          │                                                            │ skip OR audio-end
          │                                                            ▼
          │                                                    startGameAfterPreview()
          │                                                            │
          │                                                            ▼
          │                   ┌────────────── Gameplay Round N (1..5) ──────────┐
          │                   │  header (Round N / 5)  ·  ProgressBar (N of 5)  │
          │                   │  Bank (flex-wrap cluster of pills)              │
          │                   │  Drop zones (2 or 3; labelled; colour-tinted)   │
          │                   │                                                 │
          │                   │  (drag loop → pillLocations map mutates)        │
          │                   └─────────────┬───────────────────────────────────┘
          │                                 │ round_complete (bank empty + all pills correct)
          │                                 ▼
          │                    ┌────────── TransitionScreen ──────────┐
          │                    │  "Great sort!" → "Round N+1 of 5"    │
          │                    │  auto-advance after SFX+VO sequence  │
          │                    └────────────┬─────────────────────────┘
          │                                 │ N<5 → next round
          │                                 │ N==5 ▼
          │                           ┌── Results ──┐
          │                           │ stars 1..3  │
          │                           │ [Play again]│
          │                           └─────┬───────┘
          │                                 │ restartGame() (no preview)
          │                                 ▼
          │                            Gameplay Round 1
          └─────────────────────────────────────────────────────────────────┘
```

**Entry/exit triggers table:**

| Screen | Entry trigger | Exit trigger |
|---|---|---|
| PreviewScreen (preview state) | `DOMContentLoaded` → `setupGame()` calls `previewScreen.show()` AFTER round 0 DOM is rendered | skip button OR audio-finish OR 5s fallback → `onComplete` → `startGameAfterPreview()` |
| PreviewScreen (game state) | `startGameAfterPreview()` | persists entire session; `endGame()` calls `destroy()` exactly once |
| Gameplay Round N | `renderRound(N)` | bank empty AND every pill's `pillLocations[tagId] === correctZone` |
| TransitionScreen (round-complete / Round-N intro) | round-complete OR restart | auto-advance after awaited SFX+VO sequence |
| Results | after round 5 complete | "Play again" → `restartGame()` |

**ProgressBar** (top of scroll area, inside preview wrapper): 5 segments. Fills exactly one segment per completed round. Never advances on individual pill drops. Rendered once at `setupGame()` via `createProgressBar({ slotId: 'mathai-progress-slot', totalRounds: 5, totalLives: 1 })` — `totalLives: 1` is the minimum allowed by PART-023 even though this game has no lives; the hearts strip is hidden via CSS.

---

## 2. Round-by-Round Breakdown

| R | Stage | Zones (zoneId, label, tint) | # pills | Layout | Misconception | Ideal drops |
|---|-------|----------------------------|---------|--------|---------------|-------------|
| 1 | 1 (Even/Odd) | `even` (Even, green) · `odd` (Odd, purple) | 6 | horizontal zones (2 columns on 375px) | `confuses_even_odd_by_digit` | 6 (one per pill) |
| 2 | 1 (Even/Odd) | same as R1 | 6 | horizontal (2 columns) | `rule_reversal` | 6 |
| 3 | 2 (Mult-5) | `mult5` (Multiples of 5, amber) · `notmult5` (Not multiples of 5, slate) | 8 | horizontal (2 columns) | `ignores_rule` | 8 |
| 4 | 2 (Mult-5) | same as R3 | 8 | horizontal (2 columns) | `multiples_of_all` | 8 |
| 5 | 3 (Three-way) | `mult3` (Multiples of 3, pink) · `even_not3` (Even, green) · `odd_not3` (Odd, purple) | 9 | **vertical stack** (each zone full-width, pills wrap inside) | `multiples_of_all` | 9 |

All tag content, zone rules, and `correctZone` mappings come verbatim from `spec.md` §Content Samples.

**Layout decision rationale:**
- Rounds 1-4: 2 zones side-by-side; each zone ~46vw wide with flex-wrap. Fits 3-4 pills per row inside a zone at 375px (pill min-width 48px, min-height 44px, 8px margin).
- Round 5: 3 zones stacked vertically (WARNING in spec). Trying to squeeze 3 zones horizontally at 375px violates the 44px touch target. `display: flex; flex-direction: column` on `.ns-zones-container` for R5; `flex-direction: row` (or `flex-wrap: wrap`) for R1-R4. Branch on `round.dropZones.length`.

---

## 3. Drag-and-Drop Interaction Logic

Pointer Events API throughout (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`). No legacy `touchstart` / `mousedown`. `element.setPointerCapture(pointerId)` at drag-start so drag survives finger leaving the pill.

**Drag start (`pointerdown` on `.ns-pill`)**
- Record `activeDrag = { tagId, source: pillLocations[tagId], pointerId, originRect: pill.getBoundingClientRect(), offsetX, offsetY }`.
- Clone the pill into `document.body` as a `position: fixed` ghost (`.ns-pill-ghost`); position via `left/top = event.clientX - offsetX`.
- Set `opacity: 0` on the original pill (keeps it in the flex layout so bank/zone doesn't reflow mid-drag). `visibility: hidden` is NOT used — opacity 0 preserves layout slot.
- Fire-and-forget soft pick-up SFX (`FeedbackManager.sound.play('sound_bubble')`). No sticker.
- `gameState.isDragging = true` (document-level `touchmove` handler reads this to `preventDefault()` during active drag only — see mobile rule 22).

**Drag move (`pointermove`)**
- Ghost `left/top` follows pointer every frame.
- Compute hovered target: `document.elementFromPoint(clientX, clientY)` → climb `.closest('.ns-zone, .ns-bank')`.
- Apply `.ns-zone--hover` class to hovered zone (subtle lift + ring). Remove from any previously hovered zone.

**Drop — valid** (pointer released over a zone AND `tag.value` satisfies `zone.acceptIf`)
- Move the original pill's DOM parent from source (bank or previous zone) to the target zone. Because both containers are flex-wrap clusters, the new pill joins the cluster automatically; both containers reflow via a CSS transition on `min-height` and the pill's transform.
- Restore pill opacity to 1; release pointer capture; remove ghost from body.
- Mutate state: `pillLocations[tagId] = zoneId`.
- Reset `consecutiveWrongDropsByTag[tagId] = 0`.
- Fire-and-forget snap SFX: `FeedbackManager.sound.play('correct_match_sound', { sticker: STICKER_THUMBS_UP })`. No awaited TTS, no subtitle — multi-step game.
- Apply `.ns-pill--snap` class to the pill for a 300ms green glow; remove after animationend.
- `recordAttempt({ pass: true, question_id: 'R'+roundNum+'-'+tagId, selected_option: zoneId, correct_answer: correctZone, misconception_tag: null, ... })` — full 12-field schema per PART-009.
- Check round-complete (see §5 canonical check). If complete → trigger round-complete handler.

**Drop — invalid** (pointer released over a zone AND value does NOT satisfy `zone.acceptIf`)
- `consecutiveWrongDropsByTag[tagId] += 1`.
- Bounce-back animation: animate ghost's `transform: translate(...)` from drop point back to `activeDrag.originRect` over 400ms cubic-bezier, then destroy ghost; original pill stays in source container (opacity restored).
- Apply `.ns-zone--reject` to the attempted zone for 300ms (red flash).
- Apply `.ns-pill--shake` to the original pill for 300ms.
- Fire-and-forget shake SFX: `FeedbackManager.sound.play('wrong_tap', { sticker: STICKER_SAD })`. No awaited TTS.
- `recordAttempt({ pass: false, question_id: 'R'+roundNum+'-'+tagId, selected_option: zoneId, correct_answer: correctZone, misconception_tag: round.expected_misconception, ... })`.
- If `consecutiveWrongDropsByTag[tagId] === 2` → scaffolding highlight: apply `.ns-zone--hint` to the pill's `correctZone` for 1500ms (soft outer glow). Reset the counter to 0 when the highlight expires so subsequent wrong drops don't re-fire immediately.

**Drop — outside any zone, outside bank** (pointer released over empty area / background)
- Bounce-back to `activeDrag.source` (bank if was in bank, origin zone if was in a zone).
- NO state change, NO `recordAttempt`, NO SFX. This is a cancelled drag, not a wrong answer.

**Drop — inside bank** (pointer released over `.ns-bank`)
- If source was `'bank'`: no-op (bounce-back to original slot, no attempt).
- If source was a zone: move pill DOM from zone to bank, `pillLocations[tagId] = 'bank'`. Fire-and-forget snap SFX (soft; this is a legitimate re-organisation). NO `recordAttempt` (removing from an incorrect zone is not an answer; removing from the correct zone does not record a new attempt either).

**Drop — into pill's OWN current zone** (dragged from zone X, dropped on zone X)
- No-op. No state change, no attempt, no SFX. Restore opacity, remove ghost.

**Pointer cancel (`pointercancel`)** — browser cancelled the drag (e.g. system dialog):
- Restore pill opacity, destroy ghost, clear `activeDrag` and `isDragging`. NO state change, NO attempt.

**Touch + mouse parity**
- Only `.ns-pill` has `touch-action: none; user-select: none;`. Zones and bank container MUST NOT set `touch-action: none` (mobile rule 22 — kills page scroll).
- During active drag, a document-level `touchmove` listener calls `preventDefault()` **only when** `gameState.isDragging === true`.
- `setPointerCapture` on `pointerdown` so drag survives finger leaving the pill.
- `isProcessing` guard on the drop-evaluation body to avoid rapid re-entry (see §10).

---

## 4. Drop-Zone Behavior

| Behavior | Rule |
|---|---|
| Multi-drop | Each zone accepts UNLIMITED tags. No count-based rejection; only rule-based. |
| Cluster rendering | Every zone is `display: flex; flex-wrap: wrap;` — single pill renders as one chip; many pills wrap across rows. |
| Gap | **Use margins, never flex `gap`** (mobile rule 23). Each `.ns-pill` has `margin: 4px` (effective 8px between chips). |
| Min-height | Every zone has `min-height: 72px` so empty zones don't collapse. CSS transition `min-height 180ms ease` for smooth growth. |
| Auto layout | Bank and zones are all flex-wrap containers. When a pill moves, source shrinks (loses a slot) and target grows (gains a slot). No absolute positioning of resting pills. `transition: min-height 180ms ease, transform 150ms ease` on `.ns-pill` for smooth reflow. |
| Re-draggability | Pills placed in a zone can be picked back up and dragged to the bank OR directly to another zone. |
| Current-location truth | `pillLocations[tagId] ∈ 'bank' | zoneId` is the single source of truth. DOM parentage must always match this map. |
| Accessibility | Every pill ≥ 44×44 CSS px. ≥ 8px between pills (enforced by 4px margin on each side). Each zone has a `<header class="ns-zone-label">` above the cluster. |
| Color tokens | `even`: `--ns-zone-green` (soft green tint background); `odd`: `--ns-zone-purple`; `mult5`: `--ns-zone-amber`; `notmult5`: `--ns-zone-slate`; `mult3`: `--ns-zone-pink`; `even_not3`: green; `odd_not3`: purple. All defined as `--ns-zone-*` custom properties and sourced from `--mathai-*` base palette (mobile rule 37). |

---

## 5. State Machine

**gameState shape (game-specific fields shown; base fields per PART-007):**

```
gameState = {
  phase: 'start_screen' | 'playing' | 'round_complete' | 'results' | 'game_over_na',
  currentRound: 0..4,                   // 0-based index into rounds[]
  totalRounds: 5,
  score: 0..5,                          // same as roundsCompleted
  round: { roundId, stage, dropZones, tags, expected_misconception, ... },  // snapshot of current round

  pillLocations: { tagId: 'bank' | zoneId },     // SOURCE OF TRUTH
  consecutiveWrongDropsByTag: { tagId: n },
  activeDrag: { tagId, source, pointerId, originRect, offsetX, offsetY } | null,
  isDragging: false | true,
  isProcessing: false | true,           // guards drop-evaluation re-entry
  gameEnded: false | true,

  attempts: [],
  events: [],
  previewResult: null | { duration },
  startTime: null | ms,                 // set in startGameAfterPreview()
  isActive: false | true,
  duration_data: { preview: [], startTime: ISO },

  content: null | {...},                // from game_init payload
  stars: 0..3                           // set on entry to 'results'
}
```

**Round-complete canonical check:**

```
bankEmpty = every tagId in round.tags has pillLocations[tagId] !== 'bank'
allCorrect = every tagId in round.tags has pillLocations[tagId] === tag.correctZone
roundComplete = bankEmpty AND allCorrect
```

Both must hold. Evaluated after every valid drop AND after every drop-into-bank (a pill leaving a zone un-completes the round).

**Phase transitions:**

| From | Event | To | Side effects |
|------|-------|----|--------------|
| `start_screen` | `DOMContentLoaded` | preview (component state, not `phase`) | `setupGame()` renders zones + bank for round 0, then `previewScreen.show()` |
| `start_screen` | preview `onComplete` | `playing` | `startGameAfterPreview()`: set `startTime`, `isActive`, `trackEvent('game_start')`, `renderRound(0)` |
| `playing` | valid drop | `playing` | mutate `pillLocations`; if roundComplete → `round_complete` |
| `playing` | roundComplete condition holds | `round_complete` | `progressBar.update(currentRound+1, 1)` FIRST → awaited round-complete SFX + "Great sort!" dynamic TTS with sticker → `score += 1` |
| `round_complete` | transition advance (currentRound < 4) | `playing` | `currentRound += 1`, reset `pillLocations` / `consecutiveWrongDropsByTag` / bank DOM, `renderRound(currentRound)`, `syncDOM()` |
| `round_complete` | transition advance (currentRound === 4) | `results` | compute `stars = getStars(score)`, `postGameComplete(true)`, show Victory TransitionScreen |
| `results` | Play Again | `playing` | `restartGame()` resets state, currentRound=0, renderRound(0) — does NOT re-show preview |

**Between-round cleanup (cross-cutting rule 10):** before `currentRound += 1` mutates any state, the handler MUST call `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.pauseAll()` and clear any subtitle/sticker state. Cleanup is the FIRST statement in `advanceToNextRound()`.

---

## 6. Scoring & Progression

- **Points:** +1 per round completed. `score` = `roundsCompleted`. Max 5.
- **Lives:** None. No game-over screen is reachable via gameplay (only `endGame(true)` path exists). `gameState.lives` / `totalLives` are omitted from the shape; ProgressBar is instantiated with `totalLives: 1` (PART-023 minimum) and the hearts strip is hidden via `.mathai-progress-hearts { display: none !important; }`.
- **Timer:** None. `previewScreen.show({ timerConfig: null, timerInstance: null, ... })`.
- **Star thresholds** (spec §Scoring; computed on entry to `results`):
  - 3★ = 5 rounds completed
  - 2★ = 3 or 4 rounds completed
  - 1★ = 1 or 2 rounds completed
  - 0★ = 0 rounds (unreachable in natural play — a game that reaches `results` has cleared 5 rounds)
- **Partial credit:** None. A round is either complete or not.
- **ProgressBar:**
  - 5 discrete segments. Fills one segment per completed round. Never advances on individual drops.
  - `progressBar.update(score, 1)` fires FIRST inside the round-complete handler — BEFORE the awaited round-complete SFX, BEFORE the VO, BEFORE the transition screen (cross-cutting rule 0). The last round must paint `5/5` before Victory renders.
  - On restart: `progressBar.update(0, 1)`.

---

## 7. Feedback Patterns

Cross-reference: `alfred/skills/feedback/SKILL.md` (17 cases). Number Sort is a **multi-step** game → mid-round feedback is SFX + sticker only, fire-and-forget, no dynamic TTS. Round-complete and end-game audio ARE awaited.

| Event | Audio | Visual | Await? | TTS? |
|---|---|---|---|---|
| Pill pick-up (drag start) | `FeedbackManager.sound.play('sound_bubble')` | pill lifts (scale 1.05), shadow, ghost follows pointer | fire-and-forget | — |
| Zone hover (ghost over valid-rule zone) | — | `.ns-zone--hover` ring | — | — |
| Zone hover (ghost over invalid-rule zone) | — | `.ns-zone--hover` ring (no red preview — reject happens only on drop) | — | — |
| Correct drop (snap into correct zone) | `FeedbackManager.sound.play('correct_match_sound', { sticker: STICKER_THUMBS_UP })` | pill snaps into cluster; `.ns-pill--snap` 300ms green glow; source+target reflow | **fire-and-forget** | — |
| Wrong drop | `FeedbackManager.sound.play('wrong_tap', { sticker: STICKER_SAD })` | `.ns-zone--reject` 300ms red flash; `.ns-pill--shake` 300ms; ghost animates back to origin 400ms | fire-and-forget | — |
| 2 consecutive wrongs same pill | — | `.ns-zone--hint` soft outer glow on pill's `correctZone` for 1500ms | fire-and-forget | — |
| Drop back into bank (from zone) | `FeedbackManager.sound.play('sound_bubble')` | pill moves back to bank cluster; bank reflows | fire-and-forget | — |
| Drop cancelled (outside any container) | — | ghost animates back to origin 400ms | — | — |
| Round complete | `progressBar.update(score+1, 1)` FIRST → `await Promise.all([FeedbackManager.sound.play('all_correct', { sticker: STICKER_CELEBRATE }), setTimeout 1500ms])` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Great sort!', subtitle: 'Great sort!', sticker: STICKER_CELEBRATE })` | all zones pulse green 400ms | **AWAIT** — blocks `advanceToNextRound()` | YES |
| Round-N intro (between rounds, N≥2) | `await FeedbackManager.sound.play('sound_new_round', { sticker: STICKER_ROUND })` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round N', subtitle: 'Round N', sticker })` | TransitionScreen with title "Round N of 5", icons `['🧮']` (NOT stars), CTA "Let's go!" | **AWAIT** sequentially; CTA interrupts via `stopAll()` | YES |
| Victory (5 rounds complete) | Screen renders FIRST → `FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })` via `onMounted` → VO on CTA tap stops it | TransitionScreen with `stars: gameState.stars`, per-star subtitle, `Play Again` + `Claim Stars` buttons (or `Claim Stars` alone if 3★, per default-transition-screens.md) | fire-and-forget inside `onMounted`; CTA interrupts | — |
| Visibility hidden | — | VisibilityTracker's built-in `PopupComponent` (autoShowPopup default `true`) | — | — |
| Visibility restored | — | built-in popup auto-dismisses | — | — |
| Audio failure | — | visual feedback (snap/bounce/red flash/sticker) still renders | non-blocking try/catch | — |

**Bounce-back hint escalation logic:** inside the wrong-drop handler, after incrementing `consecutiveWrongDropsByTag[tagId]`, check `=== 2`; if so, schedule highlight via `setTimeout(() => zone.classList.remove('ns-zone--hint'), 1500)` and reset the counter to 0 at the start of that same timeout callback (so the next wrong drop starts a fresh count). Hint is visual only — the pill still only snaps on a correct drop.

**Cleanup between rounds (cross-cutting rule 10):** first statement in `advanceToNextRound()` MUST be `FeedbackManager.sound.stopAll(); FeedbackManager.stream.pauseAll();` and clearing any subtitle/sticker state. THEN `currentRound += 1` and `renderRound()`. Same for `restartGame()` and `endGame()`.

---

## 8. Platform Integration Checklist

- **recordAttempt on EVERY evaluated drop** (per PART-009, full 12-field schema):
  - Valid drop (into correct zone) → `{ pass: true, question_id, selected_option: zoneId, correct_answer: correctZone, misconception_tag: null, response_time_ms, ... }`
  - Invalid drop (into wrong zone) → `{ pass: false, question_id, selected_option: zoneId, correct_answer: correctZone, misconception_tag: round.expected_misconception, response_time_ms, ... }`
  - Drop outside any zone / drop into bank / drop into own zone → NO `recordAttempt` (cancelled / re-organisation, not an answer).
- **`game_complete`** fires exactly once on entry to `results` with `{ rounds_completed, stars, score, attempts, duration_ms, previewResult, completedAt }`. Sent via `postGameComplete(true)` BEFORE any victory audio (cross-cutting rule 2).
- **`syncDOM()`** called on EVERY phase transition: `start_screen` → `playing`, per round advance, `playing` → `round_complete` → `playing`, `playing` → `results`. `data-phase` and `data-round-index` always reflect current state (mandatory call sites — PART-007 + GEN-PHASE-MCQ analogue).
- **`FeedbackManager`** handles ALL audio. No raw `new Audio()` anywhere. Preload in `DOMContentLoaded`: `sound_bubble`, `correct_match_sound`, `wrong_tap`, `sound_new_round`, `all_correct`, `sound_game_victory`. Exact SFX URLs come from `feedback/reference/feedbackmanager-api.md` — do NOT hardcode.
- **`PreviewScreenComponent`** (PART-039) rules:
  - `ScreenLayout.inject('app', { slots: { previewScreen: true, progressBar: true, transitionScreen: true } })`.
  - `new PreviewScreenComponent({ slotId: 'mathai-preview-slot' })` — no other options.
  - `previewScreen.show()` called as the LAST step of `setupGame()` AFTER round 0's bank + zones are rendered into `#gameContent`.
  - `timerConfig: null, timerInstance: null` (no timer).
  - `endGame()` calls `previewScreen.destroy()` exactly once.
  - **After `destroy()`, explicitly `document.getElementById('app').classList.remove('game-hidden')`** — lesson learned from jigsaw-puzzle, where a lingering `.game-hidden` class made the results screen invisible until manual class removal. Add a guarded `if (app && app.classList.contains('game-hidden'))` check before removing.
  - `restartGame()` must NOT call `previewScreen.show()` or `setupGame()` — preview is once per session.
  - `hide()` does NOT exist. Do not call it.
- **`VisibilityTracker`** onInactive / onResume wiring — **ONLY these calls, NO custom overlay:**
  ```
  onInactive: FeedbackManager.sound.pause(), FeedbackManager.stream.pauseAll(),
              previewScreen.pause(), signalCollector?.pause()
  onResume:   FeedbackManager.sound.resume(), FeedbackManager.stream.resumeAll(),
              previewScreen.resume(), signalCollector?.resume()
  ```
  Leave `autoShowPopup: true` (default). VisibilityTracker's built-in `PopupComponent` owns the pause UI. Do NOT build a game-local `.pause-overlay` div. (Case 14 anti-pattern.)
- **`SignalCollector`** — `signalCollector.reset()` (NOT seal + re-instantiate) inside `restartGame`. `signalCollector.recordViewEvent('screen_transition', { from: 'preview', to: 'game' })` inside `startGameAfterPreview`.
- **`fallbackContent`** structure:
  ```
  {
    previewInstruction: '<p>Drag each number into <b>Even</b> or <b>Odd</b>.</p>',  // round 1
    previewAudioText:   'Drag each number into the even or odd box...',              // round 1
    previewAudio:       null,  // pipeline patches at build time
    rounds: [ ...all 5 rounds verbatim from spec.md... ]
  }
  ```
  `getRounds()` returns `gameState.content.rounds` if it has ≥ 5 entries, else `fallbackContent.rounds`.
- **`data-testid` attributes** (required for test harness):
  - `#ns-bank` → `data-testid="bank"`
  - Each zone → `data-testid="zone-{zoneId}"` (e.g. `zone-even`)
  - Each pill → `data-testid="pill-{tagId}"` (e.g. `pill-t1`)
  - `#results-screen` content element → `data-testid="results"`
  - "Play Again" button → `data-testid="play-again"`
  - Progress bar segments inherit ProgressBar-assigned testids.
- **Window exposures** (GEN-WINDOW-EXPOSE): `window.gameState`, `window.endGame`, `window.restartGame`, `window.startGame`, `window.nextRound` — all five assigned.
- **Standalone fallback** (CRITICAL code-patterns rule): top-level `setTimeout(..., 2000)` sibling of `waitForPackages().then(...)`, gated on `previewScreen && previewScreen.isActive()` — do NOT nest inside `waitForPackages`.
- **Duplicate-instruction ban** (PART-039 "Single source of instructions"): `#gameContent` MUST NOT render any static banner with verbs "Drag / Sort / Place / Put". The preview instruction is the only how-to-play copy. Zone labels ("Even", "Odd", "Multiples of 5") are NOT instructions — they are labels. A tiny prompt like "Round 3" is acceptable only via Round-N-intro TransitionScreen, not as a banner inside `#gameContent`.

---

## 9. Technical Notes — Rendering

**Outer structure**
```html
<div id="gameContent">
  <div class="ns-round">
    <!-- bank at top, flex-wrap cluster -->
    <div id="ns-bank" class="ns-bank" data-testid="bank">
      <!-- pills initially -->
    </div>

    <!-- zones below; row layout for R1-4, column layout for R5 -->
    <div class="ns-zones ns-zones--row" data-zones-count="2">
      <div class="ns-zone" data-zone-id="even"  data-testid="zone-even">
        <header class="ns-zone-label">Even</header>
        <div class="ns-zone-cluster"><!-- pills placed here --></div>
      </div>
      <div class="ns-zone" data-zone-id="odd" data-testid="zone-odd">
        <header class="ns-zone-label">Odd</header>
        <div class="ns-zone-cluster"></div>
      </div>
    </div>
  </div>
</div>
```

Round 5 uses `<div class="ns-zones ns-zones--col" data-zones-count="3">` with three zones stacked vertically.

**Pill element**
```html
<div class="ns-pill" data-tag-id="t1" data-value="4" data-testid="pill-t1"
     role="button" aria-label="number 4" tabindex="0">4</div>
```

- Each pill is **always a direct child of EITHER `#ns-bank` OR one of the `.ns-zone-cluster` elements** — never duplicated, never absolute-positioned in resting state.
- On drop, the pill's parent is changed via `targetParent.appendChild(pillEl)` — browser reflows both containers automatically.

**Ghost during drag**
```html
<div class="ns-pill ns-pill--ghost" style="position:fixed; left:...; top:...; pointer-events:none; z-index:9999;">4</div>
```

- Ghost is a fresh `cloneNode(true)` appended to `document.body`.
- Original pill gets `opacity: 0` (keeps its layout slot — bank doesn't reflow mid-drag).
- On valid drop: remove ghost, move original to target parent, `opacity: 1`.
- On invalid drop: animate ghost back to origin rect 400ms, then remove; original pill `opacity: 1` stays in source.

**Key CSS tokens** (all resolved from `--mathai-*`)
```
.ns-bank, .ns-zone-cluster { display: flex; flex-wrap: wrap; min-height: 72px; transition: min-height 180ms ease; }
.ns-pill { min-width: 48px; min-height: 44px; margin: 4px; padding: 0 14px;
           touch-action: none; user-select: none; cursor: grab;
           transition: transform 150ms ease, opacity 150ms ease; }
.ns-pill:active, .ns-pill--dragging { cursor: grabbing; }
.ns-pill--snap { animation: ns-glow 300ms ease-out; }
.ns-pill--shake { animation: ns-shake 300ms ease-in-out; }
.ns-zone { background: var(--ns-zone-tint); border: 2px solid transparent;
           border-radius: 12px; padding: 12px; flex: 1 1 0; /* row layout */
           transition: border-color 180ms ease; }
.ns-zone--hover { border-color: var(--mathai-primary); }
.ns-zone--reject { border-color: var(--mathai-error); }
.ns-zone--hint { box-shadow: 0 0 0 3px var(--mathai-warning); }
.ns-zones--col { flex-direction: column; }
.ns-zones--col .ns-zone { flex: 0 0 auto; width: 100%; margin-bottom: 8px; }
```

**Grid-col handling for Round 5** (3-zone layout on 375px):
- `.ns-zones--col` switches to `flex-direction: column`, each zone full-width, 8px margin-bottom (NOT flex `gap` — mobile rule 23).
- Each zone's inner cluster remains `flex-wrap: wrap`, so 3 pills sit in one row per zone with room to spare at 375px.

**Color tokens per zone** (defined in `:root`):
```
--ns-zone-green:  /* Even, even_not3 */   hsl from --mathai-success at 0.12 alpha
--ns-zone-purple: /* Odd, odd_not3 */     hsl from --mathai-primary at 0.12 alpha
--ns-zone-amber:  /* Multiples of 5 */    hsl from --mathai-warning at 0.14 alpha
--ns-zone-slate:  /* Not multiples of 5 */ hsl from --mathai-muted at 0.12 alpha
--ns-zone-pink:   /* Multiples of 3 */    hsl from --mathai-accent at 0.14 alpha
```
All RGBA/HSL values sourced from `--mathai-*` base palette — no hardcoded hex (mobile rule 37). If `color-mix` is unavailable (mobile rule 24 bans it), pre-compute the tint hex in CSS and still reference the base semantic via CSS variable name.

**Coordinate conversion (pointer → zone)**
- On `pointerup`, `document.elementFromPoint(clientX, clientY)` → `.closest('.ns-zone, .ns-bank')`.
- If result is a zone → evaluate `tag.value` against zone's `acceptIf` (stored as a closure or a lookup by `zoneId` — NEVER `eval` the spec's `acceptIf` string; map `zoneId` → predicate function at round setup).
- If result is `#ns-bank` → drop-into-bank path.
- If result is `null` → drop-outside-all path.

**Mobile viewport (375×667)**
- Bank min-height 72px, pills 44–48px tall with 8px gaps.
- Row layout (R1-4): 2 zones with `flex: 1 1 0`, each ~46vw wide, 12px padding, fits 3 pills per row easily.
- Column layout (R5): 3 full-width zones stacked, each cluster fits 4+ pills per row.
- `touch-action: none` ONLY on pills. Body-level `touchmove preventDefault` gated on `gameState.isDragging`.
- `overflow-x: hidden` on html, body, `.game-stack` (mobile rule 4). Preview wrapper owns the single vertical scroll via `.mathai-preview-body` (mobile rule 39).

**No banned features:** no flex `gap`, no `aspect-ratio`, no `:has()`, no optional chaining, no `??`, no `Array.at()`, no `structuredClone()` (mobile rules 23-26).

---

## 10. Edge Cases

1. **Pick up a pill from a zone that has other pills.** Removing the pill should leave the remaining pills in the zone and reflow the cluster. Since the pill is removed from DOM parent and re-inserted on drop, browser flex-wrap handles reflow automatically. No explicit re-layout code needed.
2. **Drop a pill back into its OWN current zone.** Compare `activeDrag.source === targetZoneId` at drop time. If equal → bounce-back animation (so the user sees the action completed), NO state change, NO `recordAttempt`, NO SFX beyond a soft settle. Treat as no-op.
3. **Rapid drag / drop spam.** `gameState.isProcessing` guard at the top of the drop-evaluation handler — if already processing a drop (the recordAttempt + DOM mutation is async-ish due to the CSS transition), subsequent drops are no-ops. `isProcessing` is set false at the END of the drop handler after state + DOM are consistent. This prevents a second `pointerdown` on a newly-landed pill before the first animation completes.
4. **Pointer cancel mid-drag** (`pointercancel` event — OS dialog, screen lock, etc.). Restore pill opacity, destroy ghost, clear `activeDrag`, `isDragging = false`. NO `recordAttempt` — the drag never completed.
5. **Pointer leaves viewport.** With `setPointerCapture` the drag continues even if the pointer exits the pill's bounding rect. On `pointerup` outside the viewport, `elementFromPoint` returns `null` → drop-outside-all path (bounce-back, no attempt).
6. **Dragging while preview is active.** `previewScreen.isActive()` returns true during preview; bind the `pointerdown` handlers only AFTER `startGameAfterPreview()` sets `gameState.isActive = true`, OR guard the handler body with `if (!gameState.isActive) return`. Preview overlay has `pointer-events: auto` on the transparent blocker so drags can't start anyway — but defence in depth.
7. **Last pill drops correctly → round completes.** Round-complete handler fires exactly once. Guard with a round-complete check at the TOP of the valid-drop branch (after state mutation). Subsequent drops during the awaited round-complete audio are blocked by `isProcessing = true` (set before the `progressBar.update` call; reset only in `advanceToNextRound()` after cleanup).
8. **Picking a pill from its correct zone (un-doing a correct placement).** `pillLocations[tagId]` changes from `correctZone` to `'bank'` or to another zone. If the round was previously complete, it is now incomplete — `roundComplete` check returns false, no re-trigger. This works automatically from the canonical check formula.
9. **Dropping a pill from zone A into zone B where zone B is wrong.** Two state effects: (a) `recordAttempt(pass: false)` with the wrong zone's misconception; (b) `pillLocations[tagId] = 'bank'` (bounce-back returns to bank, NOT to zone A — keeps the rule "wrong drop sends pill to bank" simple per spec §Drop Zone Behavior rule 5). Visual bounce animates from the drop point to the bank slot, not to zone A.
10. **Restart during active drag.** `restartGame()` must clear `activeDrag`, destroy any ghost DOM, set `isDragging = false`, and release any active pointer captures before resetting state.
11. **Keyboard / accessibility fallback.** Not required for this generation (drag-and-drop only, per spec). `tabindex="0"` on pills + `aria-label` is the minimum for screen-reader announcement; no keyboard-driven sort is implemented.
12. **Zero-value handling** (misconception `zero_is_odd`). If a round includes value 0 (not present in the current content samples, but defensive), `n % 2 === 0` correctly places it in `even`. No special-case code; rely on the `acceptIf` predicates.
