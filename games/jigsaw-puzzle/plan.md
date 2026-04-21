# Pre-Generation Plan: Jigsaw Puzzle

**Game ID:** jigsaw-puzzle
**Archetype:** Board Puzzle (#6) — Shape 2 (Multi-round)
**Bloom:** L1–L2
**Interaction:** P6 Drag-and-Drop (Pick & Place)
**Rounds:** 5 | **Lives:** None | **Timer:** None | **PreviewScreen:** YES (mandatory per PART-039)

---

## 1. Screen Flow

```
          ┌─────────────────────────────────────────────────────────────┐
          │                     PreviewScreen wrapper                   │
          │  (persistent: header bar + scroll area + progress-bar slot) │
          │                                                             │
          │   DOMContentLoaded                                          │
          │        │                                                    │
          │        ▼                                                    │
          │   setupGame()  ── renderInitialState() ── previewScreen.show() ─┐
          │                                                             │   │
          │                                                             │   ▼
          │                                                      ┌──── Preview State ────┐
          │                                                      │ blue progress bar,    │
          │                                                      │ instruction HTML,     │
          │                                                      │ "Skip & show options" │
          │                                                      └───────────┬───────────┘
          │                                                                  │ skip OR audio-end
          │                                                                  ▼
          │                                                          startGameAfterPreview()
          │                                                                  │
          │                                                                  ▼
          │                         ┌───────────────── Gameplay Round N (1..5) ─────────────┐
          │                         │  header (Round N / 5)  ·  ProgressBar (N segments lit) │
          │                         │  Grid (3×3 | 4×3 | 4×4)                                │
          │                         │  PieceBank (3 or 4 pieces)                             │
          │                         │                                                        │
          │                         │  (drag loop → placedPieces map grows)                  │
          │                         └────────────┬───────────────────────────────────────────┘
          │                                      │ round_complete (all cells covered)
          │                                      ▼
          │                      ┌────────── TransitionScreen ──────────┐
          │                      │  "Puzzle complete!" → "Round N+1/5"  │
          │                      │  auto-advance after TTS + 1200ms     │
          │                      └────────────┬─────────────────────────┘
          │                                   │ N<5 → next round
          │                                   │ N==5 ▼
          │                             ┌── Results ──┐
          │                             │ stars 1..3  │
          │                             │ [Play again]│
          │                             └─────┬───────┘
          │                                   │ restartGame() (no preview)
          │                                   ▼
          │                              Gameplay Round 1
          └─────────────────────────────────────────────────────────────┘
```

**Entry/exit triggers table:**

| Screen | Entry trigger | Exit trigger |
|---|---|---|
| PreviewScreen (preview state) | `DOMContentLoaded` → `setupGame()` calls `previewScreen.show()` after `renderInitialState()` | skip button OR audio-finish OR 5s fallback → `onComplete` → `startGameAfterPreview()` |
| PreviewScreen (game state) | `startGameAfterPreview()` | persists for entire session; only `endGame()` calls `destroy()` |
| Gameplay Round N | `renderRound(N)` | all cells covered + pieces placed ⇒ round-complete |
| TransitionScreen (round-N intro / "Puzzle complete!") | round-complete OR restart | button tap OR auto-advance timeout |
| Results | after round 5 complete | "Play again" → `restartGame()` |

**ProgressBar** (top of scroll area, inside preview wrapper): 5 segments. Fills one segment per completed round, persists across rounds. Never advances on individual piece drops.

---

## 2. Round-by-Round Breakdown

| R | Grid | Pieces (bank order) | Student sees | Win condition | Misconception | Expected drops |
|---|------|---------------------|--------------|--------------- |---------------|----------------|
| 1 | 3×3 | A yellow I-tromino vert, B purple L-tromino, C orange corner (reverse-L) | Empty 3×3 board + 3 pieces in bank. Instruction ("Drag the three pieces onto the grid…") shown via PreviewScreen on round 1, not repeated afterwards. | `placedCells == {all 9 cells}` AND `availablePieces == []` | `ignore_shape` | ~3 drops (low ambiguity) |
| 2 | 3×3 | A yellow I-tromino horiz, B purple reverse-L, C orange S-tromino | Empty 3×3 board + 3 pieces. Round 2 transition ("Round 2 of 5"). | same — full tile | `wrong_orientation` | ~4 drops (1 bounce likely) |
| 3 | 4×3 | A yellow T-tetromino, B purple L-tetromino, C orange skew | Empty 4×3 board + 3 tetrominoes. | full 12-cell tile | `edge_overflow` | ~5 drops (larger grid) |
| 4 | 4×3 | A yellow J-tetromino, B purple I-tetromino vert, C orange L-tetromino | Empty 4×3 board + 3 tetrominoes. | full 12-cell tile | `overlap` | ~5–6 drops |
| 5 | 4×4 | A yellow I-tetromino horiz, B purple O, C orange O, D green I-tetromino horiz | Empty 4×4 board + 4 pieces incl. new green. | full 16-cell tile | `color_matching` | ~6–7 drops |

All solutions come directly from `spec.md` content samples and have been verified as exact tilings.

---

## 3. Drag-and-Drop Interaction Logic

**Drag start**
- From bank: `pointerdown`/`touchstart` on a bank piece → `dragState = { pieceId, source: 'bank', offset: pointer-within-piece-origin-cell }`. Bank item becomes semi-transparent.
- From grid: if piece is already placed, pick it up → removes it from `placedPieces`, recomputes `grid cell occupancy`, piece becomes the dragged element.

**Drag over (live ghost)**
- On every `pointermove`, compute target origin cell `[r, c]` via bounding-rect math on `#gameGrid`.
- Render a translucent "ghost" covering `piece.cells.map(([dr,dc]) => [r+dr, c+dc])`.
- Ghost tinted: **green** if placement is valid (in-bounds AND no overlap with any other `placedPieces` cell), **red** if invalid.
- If pointer leaves `#gameGrid`, hide ghost (drop-off-grid will return piece to bank).

**Drop — valid** (all cells in-bounds AND no overlap)
- Snap piece into grid cells with CSS transform animation (150ms).
- `placedPieces[pieceId] = [r, c]`; remove from `availablePieces`.
- Fire-and-forget snap SFX via `FeedbackManager.sound.play('snap')`.
- Reset `consecutiveWrongDropsByPiece[pieceId] = 0`.
- `recordAttempt({ pass: true, pieceId, placedAt: [r,c] })`.
- Check round-complete.

**Drop — invalid** (out-of-bounds OR overlap)
- Bounce-back: piece animates back to bank slot (400ms ease-out transform).
- No state change to `placedPieces`.
- `consecutiveWrongDropsByPiece[pieceId] += 1`.
- Soft shake SFX: `FeedbackManager.sound.play('shake')` (fire-and-forget).
- Tag misconception based on drop geometry:
  - any cell `r<0 || r>=rows || c<0 || c>=cols` → `edge_overflow`
  - else any cell collides with another placed piece → `overlap`
  - else (neither OOB nor overlap but student released outside a valid spot — e.g., on empty grid but hovering wrong cells) → round's `expected_misconception`
- `recordAttempt({ pass: false, pieceId, attempted: [r,c], misconception: <tag> })`.
- If `consecutiveWrongDropsByPiece[pieceId] === 2` → soft-glow highlight on valid origin cells for 1500ms, then fade.

**Drop — outside grid** (pointerup over non-grid area, any non-bank region too)
- Return piece to bank slot (if from bank: restore opacity; if from grid: pop back to bank list).
- No SFX, no attempt recorded (this is a "cancelled drag", not a wrong answer).

**Touch + mouse parity**
- Use Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) with `touch-action: none` on draggable elements.
- Capture pointer on `pointerdown` (`element.setPointerCapture`) so drag survives fast swipes.
- Minimum touch target: 44×44 px per cell on 375px viewport (see Section 8).

---

## 4. State Machine

**gameState shape:**

```
gameState = {
  phase: 'start' | 'gameplay' | 'round_complete' | 'results',
  roundIndex: 0..4,                     // 0-based; round 1 = index 0
  round: {                              // snapshot of current round from content
    gridRows, gridCols, pieces, solution, expected_misconception
  },
  placedPieces: { pieceId: [r, c] },    // absolute origin cell per placed piece
  availablePieces: [pieceId, ...],      // pieces still in bank (order preserved)
  consecutiveWrongDropsByPiece: { pieceId: n },  // resets on correct drop or round change
  roundsCompleted: 0..5,                // feeds stars + progress bar
  attempts: [],                         // buffered for recordAttempt calls
  previewResult: null | { duration },
  startTime: null | ms,                 // set by startGameAfterPreview()
  isActive: false | true,
  duration_data: { preview: [], startTime: ISO }
}
```

**Phase transitions:**

| From | Event | To | Side effects |
|------|-------|----|--------------|
| `start` | `DOMContentLoaded` | preview (component state, not `phase`) | `setupGame()` renders grid + bank, calls `previewScreen.show()` |
| `start` | preview `onComplete` | `gameplay` | `startGameAfterPreview()`: set `startTime`, `isActive`, call `renderRound(0)` |
| `gameplay` | valid drop | `gameplay` | update `placedPieces`; check round-complete |
| `gameplay` | every cell covered AND `availablePieces.length === 0` | `round_complete` | fire "Puzzle complete!" TTS (awaited), celebratory SFX, `roundsCompleted += 1`, advance ProgressBar |
| `round_complete` | transition-screen advance (roundIndex < 4) | `gameplay` | `roundIndex += 1`, reset `placedPieces/availablePieces/consecutiveWrongDropsByPiece`, `renderRound(roundIndex)`, `syncDOMState()` |
| `round_complete` | transition-screen advance (roundIndex === 4) | `results` | render stars + Play Again, fire `game_complete` |
| `results` | Play Again | `gameplay` | `restartGame()` resets state, roundIndex=0, roundsCompleted=0, calls `renderRound(0)` — **does NOT re-show preview** |

**Round-complete check (canonical):**

```
occupiedCells = union of (cell offset + origin) for every pieceId in placedPieces
allCells = cartesian product rows × cols
roundComplete = (occupiedCells === allCells) AND (availablePieces.length === 0)
```

Compare as sorted `"r,c"` string sets — not coordinate arrays.

---

## 5. Scoring & Progression Logic

- **Points:** +1 per round completed. Max 5.
- **Lives:** None. No game-over screen exists.
- **Timer:** None. `previewScreen.show()` passes `timerConfig: null, timerInstance: null`.
- **Round-complete validator:** explicit cell-set equality (not "pieces placed === pieces.length", which could pass if a piece is placed but leaves a gap — but given the solutions are exact tilings, both hold. Use cell-set as authoritative guard.)
- **Star rating** (computed once on transition to `results`):
  - 3⭐ = 5 rounds completed
  - 2⭐ = 3–4 rounds completed
  - 1⭐ = 1–2 rounds completed
  - 0⭐ = 0 rounds — unreachable here because a session that started completed ≥1 round to reach results naturally; results is only shown after round 5 so in this game stars are always 3⭐ unless the student abandons. Still emit the formula in code for future re-use.
- **ProgressBar:**
  - 5 discrete segments.
  - Advance exactly one segment when a round completes (not per piece drop).
  - Fill color matches brand; completed segments persist across rounds.
  - Component rendered once inside PreviewScreen wrapper, NOT re-created per round.

---

## 6. Feedback Patterns

Cross-reference: `alfred/skills/feedback/SKILL.md` 17 cases + await/fire-and-forget priority table.

| Event | Audio | Visual | Await? | TTS? |
|---|---|---|---|---|
| Piece picked up (drag start) | — | piece floats (scale 1.05, shadow) | fire-and-forget | — |
| Ghost-valid (hover on legal drop) | — | green cell outline on projected footprint | — | — |
| Ghost-invalid (hover OOB/overlap) | — | red cell outline on projected footprint | — | — |
| Correct drop (snap) | `FeedbackManager.sound.play('snap')` | piece snaps to grid cells; 300ms soft glow on cells | fire-and-forget | — |
| Wrong drop | `FeedbackManager.sound.play('shake')` | bounce-back 400ms ease-out to bank slot; 100ms shake on piece | fire-and-forget | — |
| 2 consecutive wrongs same piece | — | soft glow (0.15 alpha pulse, 1500ms) on valid origin cells for that piece | fire-and-forget | — |
| Round complete | celebratory SFX + `FeedbackManager.playDynamicFeedback({ audio_content: "Puzzle complete!", subtitle: "Puzzle complete!", sticker: "celebrate" })` | grid cells all pulse green 600ms; confetti particle burst | **AWAIT** — block round advance until TTS resolves | YES |
| Results (5 rounds done) | victory SFX | stars reveal one-by-one (300ms stagger), "Play again" button | fire-and-forget | — |

**Bounce-back hint escalation** (spec scaffold): check `consecutiveWrongDropsByPiece[pieceId] === 2` at end of wrong-drop handler; schedule highlight timer; reset the counter to 0 after the highlight displays to avoid spam on every subsequent wrong drop.

---

## 7. Platform Integration Checklist

- `recordAttempt` on EVERY drop:
  - valid drop → `{ pass: true, pieceId, placedAt: [r,c], roundId }`
  - invalid drop → `{ pass: false, pieceId, attempted: [r,c], roundId, misconception }`
- `game_complete` fires exactly once on transition to `results` with schema: `{ rounds_completed, stars, attempts, duration_ms, previewResult }`
- `syncDOMState()` called on every phase transition (start→gameplay, per round change, gameplay→round_complete→gameplay, gameplay→results). `data-phase` and `data-round-index` always reflect current state.
- `FeedbackManager` handles ALL audio — no raw `new Audio()`. Preload `'snap'`, `'shake'`, and celebration SFX at `setupGame()`.
- `PreviewScreenComponent` rules:
  - `ScreenLayout.inject('app', { slots: { previewScreen: true, transitionScreen: true } })`.
  - `previewScreen.show()` called at end of `setupGame()` AFTER grid + bank are rendered.
  - `timerConfig: null, timerInstance: null` (no timer in this game).
  - `endGame()` must call `previewScreen.destroy()` exactly once.
  - `restartGame()` must NOT re-call `previewScreen.show()`.
- `VisibilityTracker` wired to `previewScreen.pause()`/`resume()`.
- Fallback content in `fallbackContent.previewInstruction` = round 1 `previewInstruction` HTML; `previewAudioText` = round 1's; `previewAudio: null` (pipeline patches at build time).
- `data-testid` attributes required on: every grid cell (`cell-r-c`), every piece in bank (`piece-<id>`), every placed piece (`placed-<id>`), "Play Again" button (`play-again`), progress-bar segment (`progress-seg-<i>`).

---

## 8. Technical Notes

**Grid rendering**
- `#gameGrid` is a CSS grid with `grid-template-rows: repeat(rows, 1fr)` and `grid-template-columns: repeat(cols, 1fr)`. Each cell is an absolutely identifiable `<div data-row="r" data-col="c" data-testid="cell-r-c">`. Keep cell aspect-ratio 1:1 via `aspect-ratio: 1` on `.cell`.
- Grid container max-width: `min(90vw, 320px)` so 4×4 grid on 375px viewport has ~80px cells (well above 44px touch target).

**Piece rendering**
- Pieces are absolutely-positioned containers with child `<div>`s at relative offsets derived from `cells`. Each child cell sized in `em` or relative to bank/grid-cell size so the same piece component scales between bank (smaller) and grid (1:1 cell size).
- Color by class: `.piece-yellow`, `.piece-purple`, `.piece-orange`, `.piece-green`.
- Placed pieces live in a separate `#placedLayer` absolutely overlaying the grid, positioned by computing the origin cell's `offsetLeft/offsetTop` — this avoids re-parenting and keeps grid CSS simple.

**Coordinate conversion (pointer → cell)**
- On drag end, read `#gameGrid.getBoundingClientRect()`; compute `cellW = rect.width / gridCols`, `cellH = rect.height / gridRows`.
- `targetCol = Math.floor((pointerX - rect.left) / cellW)`; same for row.
- Validate placement using `piece.cells`: `valid = every cell ([r+dr, c+dc]) is in-bounds AND not in occupiedCells`.

**Mobile viewport (375×667)**
- 4×4 grid at `width:min(90vw, 320px)` → ~80px cells.
- 3×3 grid at same max-width → ~106px cells.
- Piece bank row below grid, horizontally scrollable if it overflows, pieces min 60×60px.
- `touch-action: none` on grid and pieces to prevent browser swipe gestures from cancelling drags.
- Pointer Events (not legacy `touchstart`/`mousedown`) with `setPointerCapture` for reliable fast drags.
- Respect persistent PreviewScreen header — no duplicate header inside `#gameContent`.

**Accessibility (light)**
- Every piece has `aria-label="yellow I-tromino"` etc.
- Every grid cell has `aria-label="row 1 column 1, empty"` / `"...filled with yellow"`.
- Drops announced via `aria-live="polite"` region: "Placed yellow piece" / "Doesn't fit there".
