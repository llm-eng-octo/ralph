# Position Maximizer: Digit Placement Game — Assembly Book

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

---

## 1. Game Identity

- **Title:** Position Maximizer
- **Game ID:** position-maximizer
- **Type:** standard
- **Description:** A place-value practice game where the student is shown a digit (0–9) and must tap the empty position in a number (Level 1) or columnar sum (Level 2) that maximizes the digit's place-value contribution. 5 rounds across 2 levels, 3 lives, stars = lives remaining.

---

## 2. Parts Selected

| Part ID  | Name                           | Included        | Config/Notes                                                                 |
| -------- | ------------------------------ | --------------- | ---------------------------------------------------------------------------- |
| PART-001 | HTML Shell                     | YES             | Title: "Position Maximizer"                                                  |
| PART-002 | Package Scripts                | YES             | Standard scripts (Sentry + 3 game packages)                                 |
| PART-003 | waitForPackages                | YES             | Checks: FeedbackManager, VisibilityTracker, SignalCollector                  |
| PART-004 | Initialization Block           | YES             | Includes ScreenLayout v2, InteractionManager                                |
| PART-005 | VisibilityTracker              | YES             | Pauses audio, signalCollector (no timer to pause)                            |
| PART-006 | TimerComponent                 | **NO**          | This game has no timer — purely accuracy-based                               |
| PART-007 | Game State Object              | YES             | Custom fields: lives, totalLives, level, phase, wrongPositions, digit, numbers, correctPosition |
| PART-008 | PostMessage Protocol           | YES             | game_ready + game_init + game_complete                                       |
| PART-009 | Attempt Tracking               | YES             | validationType: 'fixed'                                                      |
| PART-010 | Event Tracking & SignalCollector| YES            | Custom events: tap_position, correct_position, wrong_position, round_complete, level_complete, life_lost |
| PART-011 | End Game & Metrics             | YES             | Stars = lives remaining (3/2/1/0)                                            |
| PART-012 | Debug Functions                | YES             | Standard debug functions                                                     |
| PART-017 | Feedback Integration           | YES             | 15 preloaded sounds + dynamic TTS per-round feedback + stickers              |
| PART-019 | Results Screen (v2)            | YES             | Via TransitionScreen content slot — metrics: rounds completed, wrong attempts, accuracy |
| PART-020 | CSS Variables & Colors         | YES             | Standard mathai variables                                                    |
| PART-021 | Screen Layout CSS (v2)         | YES             | v2 CSS reset only                                                            |
| PART-022 | Game Buttons                   | YES             | No Submit — auto-validation on tap                                           |
| PART-023 | ProgressBar Component (v2)     | YES             | totalRounds: gameState.totalRounds (dynamic), totalLives: 3                  |
| PART-024 | TransitionScreen Component (v2)| YES            | Screens: level-intro (×2), round-transition (×5), game-complete, game-over + AUDIO (NO welcome screen) |
| PART-025 | ScreenLayout Component (v2)    | YES             | sections: header + questionText + progressBar + playArea + transitionScreen  |
| PART-026 | Anti-Patterns                  | YES (REFERENCE) | Verification checklist                                                       |
| PART-027 | Play Area Construction         | YES             | Layout: columnar number grid (horizontal rows + CSS Grid for sums)           |
| PART-028 | InputSchema Patterns           | YES             | Schema type: flat rounds array with level transition point                   |
| PART-030 | Sentry Error Tracking          | YES             | Standard Sentry integration                                                  |
| PART-038 | InteractionManager             | YES             | selector: '.play-area', disableOnEvaluation: true                            |

---

## 3. Game State

```javascript
window.gameState = {
  // MANDATORY (from PART-007):
  currentRound: 0,
  totalRounds: 5,                      // Updated from content.rounds.length after content loads
  score: 0,
  attempts: [],
  events: [],
  startTime: null,
  isActive: false,
  content: null,
  duration_data: {
    startTime: null,
    preview: [],
    attempts: [],
    evaluations: [],
    inActiveTime: [],
    totalInactiveTime: 0,
    currentTime: null
  },

  // GAME-SPECIFIC:
  lives: 3,
  totalLives: 3,
  level: 1,                    // 1 = single number, 2 = columnar sum
  phase: 'start',              // 'start' | 'transition' | 'playing' | 'ended'
  digit: null,                 // current digit to place (0-9)
  numbers: null,               // current round's numbers array
  correctPosition: null,       // { numberIndex, slotIndex }
  wrongPositions: new Set(),   // set of "numberIndex-slotIndex" strings
  isProcessing: false,         // prevents double-tap during feedback
  gameEnded: false,            // idempotency guard for endGame/handleGameOver
  pendingEndProblem: null,     // deferred endProblem for SignalCollector
  currentDynamicAudio: null,   // reference for stopping dynamic TTS on early interaction

  // Game identity
  gameId: null,
  contentSetId: null
};
```

**Global module-scope variables:**
```javascript
let visibilityTracker = null;  // No timer variable — this game has no timer
let signalCollector = null;
let progressBar = null;
let transitionScreen = null;
let interactionManager = null;
```

---

## 4. Input Schema & Content

### Input Schema

```json
{
  "rounds": [
    {
      "type": "number | sum",
      "digit": "integer 0-9",
      "numbers": [
        {
          "slots": [
            { "value": "integer (-1 for empty, 0-9 for filled)", "filled": "boolean" }
          ],
          "direction": "horizontal | vertical (sum type only)",
          "gridRow": "integer (horizontal numbers, sum type only)",
          "gridCol": "integer (vertical numbers, sum type only)",
          "slotsAbove": "integer (vertical numbers, sum type only)"
        }
      ],
      "rows": "integer (sum type only, grid rows)",
      "columns": "integer (sum type only, grid columns)",
      "correctPosition": { "numberIndex": "integer", "slotIndex": "integer" },
      "explanation": { "correctValue": "integer", "positionName": "string" },
      "audio_content": {
        "correct": "string — TTS text for correct tap",
        "incorrect": {
          "<numberIndex>-<slotIndex>": "string — TTS text for each wrong empty slot"
        }
      }
    }
  ],
  "totalLives": 3,
  "levelTransitionAfterRound": 2
}
```

**Constraints:**
- Every round has exactly one correct position — the empty slot with the highest place value across all empty slots in all numbers
- The highest place value among empty slots must be **unique** (no tie at the top)
- `correctValue` = `digit × placeValue` at the correct position
- `filled: false` slots use `value: -1` (not null — strict JSON schema compliance)
- Each content set should have a mix of `"number"` and `"sum"` round types
- Digits should vary across rounds (no digit repeated more than twice per set)
- Sum rounds should have numbers of different lengths (to exercise columnar right-alignment)

### Fallback Content

```javascript
const fallbackContent = {
  rounds: [
    // === LEVEL 1: Single number ===

    // Round 1: Place 8 in "9 _ _ 3" (4-digit number)
    // Empty slots: index 1 (hundreds), index 2 (tens)
    // Correct: index 1 (hundreds) → 8 × 100 = 800
    {
      type: 'number',
      digit: 8,
      numbers: [
        {
          slots: [
            { value: 9, filled: true },
            { value: -1, filled: false },
            { value: -1, filled: false },
            { value: 3, filled: true }
          ]
        }
      ],
      correctPosition: { numberIndex: 0, slotIndex: 1 },
      explanation: { correctValue: 800, positionName: 'hundreds' },
      audio_content: {
        correct: 'Correct! 8 will contribute 800 to the number from this position.',
        incorrect: {
          '0-2': 'Oops! 8 will contribute only 80 to this number from this position. This is not the maximum!'
        }
      }
    },

    // Round 2: Place 7 in "_ _ _ 4" (4-digit number)
    // Empty slots: index 0 (thousands), index 1 (hundreds), index 2 (tens)
    // Correct: index 0 (thousands) → 7 × 1000 = 7000
    {
      type: 'number',
      digit: 7,
      numbers: [
        {
          slots: [
            { value: -1, filled: false },
            { value: -1, filled: false },
            { value: -1, filled: false },
            { value: 4, filled: true }
          ]
        }
      ],
      correctPosition: { numberIndex: 0, slotIndex: 0 },
      explanation: { correctValue: 7000, positionName: 'thousands' },
      audio_content: {
        correct: 'Correct! 7 will contribute 7000 to the number from this position.',
        incorrect: {
          '0-1': 'Oops! 7 will contribute only 700 to this number from this position. This is not the maximum!',
          '0-2': 'Oops! 7 will contribute only 70 to this number from this position. This is not the maximum!'
        }
      }
    },

    // === LEVEL 2: Sum of 2 numbers (columnar addition) ===

    // Round 3: Place 9 in sum of 2 numbers (4 rows × 5 cols)
    // Number 1 (horizontal at row 2): [_, 6, 4, 3]
    // Number 2 (vertical in col 3): [_, 1]
    // Correct: N0 idx 0 (thousands) → 9000
    {
      type: 'sum',
      digit: 9,
      rows: 4, columns: 5,
      numbers: [
        {
          slots: [
            { value: -1, filled: false },
            { value: 6, filled: true },
            { value: 4, filled: true },
            { value: 3, filled: true }
          ],
          direction: 'horizontal', gridRow: 2
        },
        {
          slots: [
            { value: -1, filled: false },
            { value: 1, filled: true }
          ],
          direction: 'vertical', gridCol: 3, slotsAbove: 1
        }
      ],
      correctPosition: { numberIndex: 0, slotIndex: 0 },
      explanation: { correctValue: 9000, positionName: 'thousands' },
      audio_content: {
        correct: 'Correct! 9 will contribute 9000 to the sum from this position.',
        incorrect: {
          '1-0': 'Oops! 9 will contribute only 900 to the sum from this position. This is not the maximum!'
        }
      }
    },

    // Round 4: Place 6 in sum of 2 numbers (5 rows × 5 cols)
    // Number 1 (vertical in col 1): [_, _, 5]
    // Number 2 (horizontal at row 4): [_, 2, 3, 0]
    // Correct: N1 idx 0 (thousands) → 6000
    {
      type: 'sum',
      digit: 6,
      rows: 5, columns: 5,
      numbers: [
        {
          slots: [
            { value: -1, filled: false },
            { value: -1, filled: false },
            { value: 5, filled: true }
          ],
          direction: 'vertical', gridCol: 1, slotsAbove: 3
        },
        {
          slots: [
            { value: -1, filled: false },
            { value: 2, filled: true },
            { value: 3, filled: true },
            { value: 0, filled: true }
          ],
          direction: 'horizontal', gridRow: 4
        }
      ],
      correctPosition: { numberIndex: 1, slotIndex: 0 },
      explanation: { correctValue: 6000, positionName: 'thousands' },
      audio_content: {
        correct: 'Correct! 6 will contribute 6000 to the sum from this position.',
        incorrect: {
          '0-0': 'Oops! 6 will contribute only 600 to the sum from this position. This is not the maximum!',
          '0-1': 'Oops! 6 will contribute only 60 to the sum from this position. This is not the maximum!'
        }
      }
    },

    // Round 5: Place 5 in sum. Empty slots: N0 slot2 (tens→50), N0 slot3 (ones→5), N1 slot2 (ones→5). Correct: N0 slot2 (tens) → 50.
    {
      type: 'sum',
      digit: 5,
      rows: 5, columns: 5,
      numbers: [
        {
          slots: [
            { value: 9, filled: true },
            { value: 7, filled: true },
            { value: -1, filled: false },
            { value: -1, filled: false }
          ],
          direction: 'horizontal', gridRow: 3
        },
        {
          slots: [
            { value: 8, filled: true },
            { value: 6, filled: true },
            { value: -1, filled: false }
          ],
          direction: 'vertical', gridCol: 4, slotsAbove: 2
        }
      ],
      correctPosition: { numberIndex: 0, slotIndex: 2 },
      explanation: { correctValue: 50, positionName: 'tens' },
      audio_content: {
        correct: 'Correct! 5 will contribute 50 to the sum from this position.',
        incorrect: {
          '0-3': 'Oops! 5 will contribute only 5 to the sum from this position. This is not the maximum!',
          '1-2': 'Oops! 5 will contribute only 5 to the sum from this position. This is not the maximum!'
        }
      }
    }
  ],
  totalLives: 3,
  levelTransitionAfterRound: 2
};
```

**Verification:**

| Round | Level | Type | Digit | Numbers Layout | Empty Slots | Correct Position | Value | ✓ |
|-------|-------|------|-------|----------------|-------------|-----------------|-------|---|
| 1 | 1 | number | 8 | 9 _ _ 3 | [0,1], [0,2] | N0 slot1 (hundreds) | 800 | ✓ |
| 2 | 1 | number | 7 | _ _ _ 4 | [0,0], [0,1], [0,2] | N0 slot0 (thousands) | 7000 | ✓ |
| 3 | 2 | sum | 9 | _643 + _1 | [0,0], [1,0] | N0 slot0 (thousands) | 9000 | ✓ |
| 4 | 2 | sum | 6 | __5 + _230 | [0,0], [0,1], [1,0] | N1 slot0 (thousands) | 6000 | ✓ |
| 5 | 2 | sum | 5 | 97__ + 86_ | [0,2], [0,3], [1,2] | N0 slot2 (tens) | 50 | ✓ |

### Dynamic TTS Content

**Per-round feedback** — stored in `audio_content` field of each round in the content set. Generated per content set since they reference specific digits and contribution values.

**Fixed dynamic TTS** — hardcoded constants (same across all content sets):

```javascript
const DYNAMIC_AUDIO = {
  level_1: "Level 1!\nTap and select the position where the digit will contribute maximum value to the number.",
  level_2: "Level 2!\nNow maximise the sum of two numbers by placing digits in the best positions.",
  end_game: {
    3: "Amazing! You completed all rounds without making any mistakes! Claim your stars now!",
    2: "Superb! You completed all rounds but made 1 mistake and lost 1 life!",
    1: "Nice job! You completed all rounds but made 2 mistakes and lost 2 lives!",
    0: "Oops! You lost all lives. Try again to complete all rounds."
  }
};
```

### Content Set Generation

Generate **3 content sets** (easy, medium, hard). Each must be a valid JSON file matching the input schema above.

**Constraints all content sets must satisfy:**
- Every round has exactly one correct position — the empty slot with the highest place value across all empty slots in all numbers for that round
- The highest place value among empty slots must be **unique** (no tie at the top)
- `correctValue` = `digit × placeValue` at the correct position
- `filled: false` slots use `value: -1` (not null — strict JSON schema compliance)
- Each content set should have a mix of `"number"` and `"sum"` round types
- Digits should vary across rounds (no digit repeated more than twice per set)
- Sum rounds should have numbers of different lengths (to exercise columnar right-alignment)
- `audio_content` must be provided for every round with correct text for the correct slot and incorrect text for every other empty slot

**Dimensions that vary:**

| Dimension | Set 1 — Easy (≤ 4 digits) | Set 2 — Medium (4–5 digits) | Set 3 — Hard (5–7 digits) |
|-----------|---------------------------|----------------------------|--------------------------|
| Number length | 3–4 digit numbers | 4–5 digit numbers | 5–7 digit numbers |
| Place values exercised | ones → thousands | tens → ten-thousands | hundreds → millions |
| Digit range | 1–9 | 1–9 | 1–9 |
| Rounds | 5 (2 number + 3 sum) | 5 (2 number + 3 sum) | 5 (2 number + 3 sum) |
| Empty slots per round | 1–2 | 2–3 | 2–4 |
| Lives | 3 | 3 | 3 |
| Level transition | After round 2 | After round 2 | After round 2 |

> **Constraint:** Digit 0 should NOT be used as the round digit — since 0 × any place value = 0, there is no meaningful 'maximum' position and the exercise becomes trivial.

---

## 5. Screens & HTML Structure

### Body HTML

```html
<div id="app"></div>
```

> **IMPORTANT:** No manual layout divs (`.page-center`, `.game-wrapper`, `.game-stack`). ScreenLayout v2 creates all structure. No `#results-screen` div — use TransitionScreen content slot instead.

### Game Content (injected into `#gameContent` after ScreenLayout.inject)

```html
<div id="game-screen" class="game-block">
  <div class="prompt-area" id="prompt-area" data-signal-id="prompt-area">
    <p class="prompt-text" id="prompt-text" data-signal-id="prompt-text">Maximise contribution of this digit in the <strong>number</strong> 👇</p>
    <div class="digit-display" id="digit-display" data-signal-id="digit-display">0</div>
  </div>

  <div class="play-area" id="play-area" data-signal-id="play-area">
    <!-- Rendered by JS: columnar number layout -->
  </div>
</div>
```

> **Note:** Instruction text ("Tap and select the position where the given digits contribute the maximum value!") is displayed in the **questionText slot** of ScreenLayout v2 — it stays visible on ALL screens including transitions. It is NOT inside `#game-screen`.

---

## 6. CSS

```css
/* === CSS Variables (PART-020) === */
:root {
  --mathai-green: #4CAF50;
  --mathai-light-green: #E8F5E9;
  --mathai-red: #F44336;
  --mathai-light-red: #FFEBEE;
  --mathai-blue: #2196F3;
  --mathai-light-blue: #EBF0FF;
  --mathai-gray: #757575;
  --mathai-light-gray: #F5F5F5;
  --mathai-white: #FFFFFF;
  --mathai-black: #212121;
  --mathai-text-primary: #000000;
  --mathai-font-family: 'Nunito', sans-serif;
  --mathai-font-size-title: 24px;
  --mathai-font-size-body: 16px;
  --mathai-font-size-label: 14px;
  --mathai-font-size-small: 12px;
}

/* === Reset === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100dvh; overflow: hidden; }
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-white);
  color: var(--mathai-text-primary, #000000);
  -webkit-font-smoothing: antialiased;
}

.mathai-layout-root { max-width: 480px; margin: 0 auto; }

/* === ScreenLayout v2 overrides === */
.mathai-layout-playarea {
  /* Do NOT use !important on display — TransitionScreen toggles it inline */
  flex-direction: column !important;
  align-items: center !important;
  padding: 8px 16px !important;
}

/* === Transition Screen overrides === */
.mathai-ts-screen.active {
  flex: 1;
  justify-content: flex-start;
  padding-top: 16px;
}
.mathai-ts-card {
  min-height: 50dvh;
}

/* === Question Text (in questionText slot) === */
.question-text-container {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  padding: 8px 16px;
}

.instruction-text {
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-text-primary, #000000);
  line-height: 1.5;
  margin-bottom: 4px;
}

.instruction-text strong { font-weight: 700; }

.instruction-text-sub {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
  line-height: 1.4;
  margin-bottom: 4px;
}

/* === Game Block === */
.game-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

/* === Prompt Area === */
.prompt-area {
  text-align: center;
  margin: 8px 0;
}

.prompt-text {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
  margin-bottom: 8px;
}

.prompt-text strong { color: var(--mathai-text-primary, #000000); font-weight: 700; }

.digit-display {
  font-size: 48px;
  font-weight: 700;
  color: var(--mathai-text-primary, #000000);
  line-height: 1;
}

/* === Play Area (Columnar Number Layout) === */
.play-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin: 16px 0;
}

/* Each number row: label + slots */
.number-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number-label {
  font-size: var(--mathai-font-size-small);
  font-weight: 600;
  color: var(--mathai-gray);
  text-align: center;
  min-width: 48px;
  line-height: 1.2;
}

.number-label .label-icon {
  font-size: 14px;
}

.slots-row {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

/* === Slot Cell === */
.slot-cell {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--mathai-light-gray);
  border-radius: 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--mathai-text-primary, #000000);
  transition: all 0.15s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Pre-filled (gray, non-interactive) */
.slot-cell.filled {
  background: var(--mathai-light-gray);
  color: var(--mathai-text-primary, #000000);
  cursor: default;
}

/* Empty (white, tappable) */
.slot-cell.empty {
  background: var(--mathai-white);
  cursor: pointer;
  border-color: var(--mathai-light-gray);
}

.slot-cell.empty:hover:not(.correct):not(.wrong) {
  border-color: var(--mathai-blue);
  background: var(--mathai-light-blue);
}

.slot-cell.empty:active:not(.correct):not(.wrong) {
  transform: scale(0.95);
}

/* Correct — green highlight */
.slot-cell.correct {
  border: 2px solid var(--mathai-green);
  background: var(--mathai-light-green);
  color: var(--mathai-green);
  cursor: default;
}

/* Wrong — red highlight */
.slot-cell.wrong {
  border: 2px solid var(--mathai-red);
  background: var(--mathai-light-red);
  color: var(--mathai-red);
  cursor: default;
}

/* === Buttons (PART-022) === */
.game-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  font-size: var(--mathai-font-size-body);
  font-weight: 600;
  font-family: var(--mathai-font-family);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  width: 100%;
  max-width: 340px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary { background: var(--mathai-green); color: var(--mathai-white); }
.btn-primary:hover { filter: brightness(0.9); }
.btn-primary:active { transform: scale(0.97); }
```

---

## 7. Script Loading (PART-002)

```html
<!-- 1. SentryConfig package -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

<!-- 2. initSentry() function definition (inline — see Section 15) -->

<!-- 3. Sentry SDK (3 scripts, NO integrity attribute) -->
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- 4. Initialize Sentry on load -->
<script>window.addEventListener('load', initSentry);</script>

<!-- 5-7. Game packages (exact URLs, this order) -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

---

## 8. Game Flow

1. **Page loads** → Sentry initializes via `window.addEventListener('load', initSentry)`, then DOMContentLoaded fires:
   - waitForPackages() — checks FeedbackManager, VisibilityTracker, SignalCollector (NO TimerComponent)
   - FeedbackManager.init() — fires unlock popup internally, do NOT call unlock() again
   - SignalCollector creation
   - ScreenLayout.inject('app', { sections config })
   - Build question text into questionText slot
   - Build game content into #gameContent
   - InteractionManager creation
   - VisibilityTracker creation
   - createProgressBar()
   - TransitionScreenComponent creation
   - Preload ALL 15 sounds via sound.preload([{id, url}])
   - `window.addEventListener('message', handlePostMessage)` — BEFORE game_ready
   - `window.parent.postMessage({ type: 'game_ready' }, '*')` — AFTER addEventListener
   - setupGame() immediately (no welcome screen)

2. **setupGame():**
   - Set startTime, isActive, duration_data.startTime
   - progressBar.update(0, lives)
   - trackEvent('game_start')
   - recordViewEvent('screen_transition') — gameplay screen
   - showLevelTransition(1) — game starts directly with Level 1 transition (no welcome/start screen)

3. **showLevelTransition(level):**
   - transitionScreen.show with level info + button ("Let's go!" / "Next Level")
   - subtitle: level description text
   - recordViewEvent('overlay_toggle') — transition screen visible

   - Button action:
     - `FeedbackManager._stopCurrentDynamic()` — stop audio + hide subtitle + hide sticker
     - `FeedbackManager.sound.stopAll()`
     - transitionScreen.hide()
     - showRoundTransition(currentRound + 1)

   - **Audio permission polling** before level audio: `FeedbackManager.canPlayAudio()` with `setInterval(200ms)` + 15s timeout

   **Level 1:**
   - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.level_1, subtitle: 'Level 1', sticker: STICKER_URLS.level })` — single TTS call handles audio + subtitle + sticker

   **Level 2:**
   - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.level_2, subtitle: 'Level 2', sticker: STICKER_URLS.level })` — single TTS call handles audio + subtitle + sticker

4. **showRoundTransition(roundNumber):** — NO BUTTON, auto-advance after audio
   - `FeedbackManager._stopCurrentDynamic()` — stop any lingering audio/subtitle/sticker
   - `FeedbackManager.sound.stopAll()`
   - transitionScreen.show({ title: 'Round ' + roundNumber, subtitle: 'Get ready!', buttons: [] })
   - 🔊 `await sound.play('rounds_sound_effect')` — AWAITED, no sticker
   - 🔊 `await sound.play('round_' + roundNumber, { sticker: { image: STICKER_URLS.round, type: 'IMAGE_GIF' } })` — AWAITED, sequential
   - transitionScreen.hide()
   - loadRound()

5. **loadRound():**
   - Flush deferred endProblem from previous round
   - signalCollector.startProblem('round_N')
   - Get round data, set digit, numbers, correctPosition
   - Reset wrongPositions, isProcessing
   - Update prompt text ("number" for Level 1, "sum" for Level 2)
   - Render digit display + columnar number layout

   - recordViewEvent('content_render') — round content displayed

6. **User interaction — handleSlotTap(numberIndex, slotIndex):**
   - Guards: !isActive, isProcessing → return
   - Guards: slot is filled, already wrong, already correct → return
   - isProcessing = true
   - Show digit in tapped cell
   - Calculate place value & contribution
   - recordViewEvent('visual_update') — slot tapped

   **If CORRECT:**
   - Green highlight on cell

   - 🔊 `await sound.play('correct_sound_effect', { sticker: { image: STICKER_URLS.correct, type: 'IMAGE_GIF' } })` — AWAITED
   - 🔊 `await playDynamicFeedback({ audio_content: round.audio_content.correct, subtitle: round.audio_content.correct, sticker: STICKER_URLS.correct })` — AWAITED, sequential
   - recordViewEvent('feedback_display')
   - Defer endProblem
   - recordCustomEvent('round_solved')
   - isProcessing = false
   - roundComplete()

   **If WRONG:**
   - Red highlight on cell
   - lives--, wrongPositions.add(key)
   - progressBar.update()
   - recordViewEvent('feedback_display'), recordViewEvent('visual_update') — life lost

   **If lives <= 0:**
   - Skip incorrect SFX (avoid overlap with game-over audio)
   - Defer endProblem with incorrect outcome
   - recordCustomEvent('round_solved', { reason: 'game_over' })
   - isProcessing = false
   - await handleGameOver()

   **Else (lives > 0):**
   - 🔊 `await sound.play('incorrect_sound_effect', { sticker: { image: STICKER_URLS.incorrect, type: 'IMAGE_GIF' } })` — AWAITED
   - 🔊 `await playDynamicFeedback({ audio_content: incorrectText, subtitle: incorrectText, sticker: STICKER_URLS.incorrect })` — AWAITED, sequential
   - Clear wrong state: cell becomes gray (filled, non-tappable)
   - isProcessing = false
   - recordViewEvent('visual_update') — wrong flash cleared

7. **roundComplete():**
   - currentRound++, score++
   - progressBar.update()
   - If currentRound === 2 (end of Level 1):
     - level = 2
     - showLevelTransition(2)
   - Else if currentRound >= totalRounds → endGame('victory')
   - Else → showRoundTransition(currentRound + 1)

8. **endGame('victory'):** — Called only for victory (1–3 stars)
   - Guard: if (gameState.gameEnded) return
   - gameEnded = true, isActive = false
   - Calculate metrics, stars = lives remaining
   - trackEvent('game_end'), flush deferred endProblem, signalCollector.seal()

   > **IMPORTANT: Screen-first-then-audio pattern.** Show results FIRST so user sees feedback immediately, THEN play audio.

   - showResults(metrics, 'victory') — **results screen shown FIRST**
   - recordViewEvent('screen_transition')

   **Star-based audio (SFX jingle + dynamic TTS only — no duplicate static voice):**

   If 3★:
   - 🔊 `await sound.play('victory_sound_effect', { sticker: { image: STICKER_URLS.victory, type: 'IMAGE_GIF' } })`
   - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[3], subtitle: DYNAMIC_AUDIO.end_game[3], sticker: STICKER_URLS.victory })`

   If 2★:
   - 🔊 `await sound.play('game_complete_sound_effect', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } })`
   - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[2], subtitle: DYNAMIC_AUDIO.end_game[2], sticker: STICKER_URLS.complete_2_stars })`

   If 1★:
   - 🔊 `await sound.play('game_complete_sound_effect', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } })`
   - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[1], subtitle: DYNAMIC_AUDIO.end_game[1], sticker: STICKER_URLS.complete_1_star })`

   - postMessage with metrics + ...signalPayload spread
   - Cleanup: progressBar, visibilityTracker, sound.stopAll(), stream.stopAll()

9. **handleGameOver():** — Called when lives reach 0 (0 stars)
    - Guard: if (gameState.gameEnded) return
    - gameEnded = true, isActive = false
    - Calculate metrics (stars = 0)
    - trackEvent('game_end'), flush deferred endProblem, signalCollector.seal()

    > **Screen-first-then-audio pattern.**

    - showResults(metrics, 'game_over') — **results screen shown FIRST**
    - recordViewEvent('screen_transition')
    - 🔊 `await sound.play('game_over_sound_effect', { sticker: { image: STICKER_URLS.game_over, type: 'IMAGE_GIF' } })`
    - 🔊 `await playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[0], subtitle: DYNAMIC_AUDIO.end_game[0], sticker: STICKER_URLS.game_over })`
    - postMessage, cleanup

---

## 9. Functions

### Global Scope (RULE-001)

**setupGame()**
- gameState.startTime = Date.now()
- gameState.isActive = true
- gameState.duration_data.startTime = new Date().toISOString()
- progressBar.update(0, gameState.lives)
- trackEvent('game_start', 'game')
- signalCollector.recordViewEvent('screen_transition', { screen: 'gameplay', metadata: { transition_from: 'start' } })
- showLevelTransition(1) — goes directly to Level 1 transition (no welcome/start screen)

**async showLevelTransition(level)**
- gameState.level = level
- gameState.phase = 'transition'
- const levelNames = ['Level 1', 'Level 2']
- const levelSubtitles = ['Single number — find the best position', 'Columnar sum — find the best position']
- signalCollector.recordViewEvent('overlay_toggle', { screen: 'transition', content_snapshot: { overlay: 'transition_screen', visible: true, title: levelNames[level - 1], level } })
- transitionScreen.show({ icons: ['🔢'], iconSize: 'large', title: levelNames[level - 1], subtitle: levelSubtitles[level - 1], buttons: [{ text: level === 1 ? "Let's go!" : 'Next Level', type: 'primary', action: async function() { try { FeedbackManager._stopCurrentDynamic(); } catch(e) {} try { FeedbackManager.sound.stopAll(); } catch(e) {} gameState.currentDynamicAudio = null; transitionScreen.hide(); showRoundTransition(gameState.currentRound + 1); } }], persist: true })
- // Wait for audio permission before playing level audio (browser blocks audio before user interaction)
- await new Promise(function(resolve) { if (FeedbackManager.canPlayAudio()) return resolve(); var check = setInterval(function() { if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); } }, 200); setTimeout(function() { clearInterval(check); resolve(); }, 15000); });
- // Play level audio (single dynamic TTS call — no separate static sound.play to avoid double audio)
- if (level === 1):
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.level_1, subtitle: 'Level 1', sticker: STICKER_URLS.level }); } catch(e) {}
- else:
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.level_2, subtitle: 'Level 2', sticker: STICKER_URLS.level }); } catch(e) {}

**async showRoundTransition(roundNumber)**
- gameState.phase = 'transition'
- // Stop any lingering audio/subtitle/sticker from previous screen
- try { FeedbackManager._stopCurrentDynamic(); } catch(e) {}
- try { FeedbackManager.sound.stopAll(); } catch(e) {}
- gameState.currentDynamicAudio = null
- try { transitionScreen.show({ icons: ['🔢'], title: 'Round ' + roundNumber, subtitle: 'Get ready!', buttons: [], persist: false }); } catch(e) {}
- try { await FeedbackManager.sound.play('rounds_sound_effect'); } catch(e) {}
- try { await FeedbackManager.sound.play('round_' + roundNumber, { sticker: { image: STICKER_URLS.round, type: 'IMAGE_GIF' } }); } catch(e) {}
- try { transitionScreen.hide(); } catch(e) {}
- const gc = document.getElementById('gameContent')
- if (gc) gc.style.display = 'block'
- gameState.phase = 'playing'
- loadRound()

**loadRound()**
- // Flush deferred endProblem from previous round
- if (signalCollector && gameState.pendingEndProblem) { signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome); gameState.pendingEndProblem = null; }
- const roundNumber = gameState.currentRound + 1
- const round = gameState.content.rounds[gameState.currentRound]
- signalCollector.startProblem('round_' + roundNumber, { round_number: roundNumber, question_text: `Place ${round.digit} to maximise in ${round.type}`, correct_answer: `${round.explanation.positionName} (${round.explanation.correctValue})`, digit: round.digit, type: round.type, difficulty: roundNumber })
- gameState.digit = round.digit
- gameState.numbers = round.numbers
- gameState.correctPosition = round.correctPosition
- gameState.wrongPositions = new Set()
- gameState.isProcessing = false
- // Update prompt text
- const promptText = document.getElementById('prompt-text')
- if (round.type === 'sum'):
  - promptText.innerHTML = 'Maximise contribution of this digit in the <strong>sum</strong> 👇'
- else:
  - promptText.innerHTML = 'Maximise contribution of this digit in the <strong>number</strong> 👇'
- document.getElementById('digit-display').textContent = round.digit
- renderPlayArea(round)
- signalCollector.recordViewEvent('content_render', { screen: 'gameplay', content_snapshot: { round: roundNumber, digit: round.digit, type: round.type, numbers_count: round.numbers.length, trigger: 'round_start' }, components: { progress: { current: roundNumber, total: gameState.totalRounds }, lives: gameState.lives } })

**renderPlayArea(round)**
- const playArea = document.getElementById('play-area')
- playArea.innerHTML = ''
- playArea.style.cssText = ''
- function createSlotCell(slot, numIdx, slotIdx):
    const cell = document.createElement('div')
    cell.className = 'slot-cell'
    cell.dataset.numberIndex = numIdx
    cell.dataset.slotIndex = slotIdx
    cell.dataset.signalId = `slot-${numIdx}-${slotIdx}`
    cell.dataset.testid = `cell-${numIdx}-${slotIdx}`
    if (slot.filled):
      cell.classList.add('filled')
      cell.textContent = slot.value
    else:
      cell.classList.add('empty')
      cell.textContent = ''
      cell.addEventListener('click', () => handleSlotTap(numIdx, slotIdx))
    return cell
-
- if (round.type === 'number'):
    // Single number: simple horizontal row with label
    const row = document.createElement('div')
    row.className = 'number-row'
    const label = document.createElement('div')
    label.className = 'number-label'
    label.innerHTML = `Number<br>1 <span class="label-icon">👉</span>`
    row.appendChild(label)
    const slotsRow = document.createElement('div')
    slotsRow.className = 'slots-row'
    round.numbers[0].slots.forEach((slot, slotIdx) => slotsRow.appendChild(createSlotCell(slot, 0, slotIdx)))
    row.appendChild(slotsRow)
    playArea.appendChild(row)
- else (sum type):
    // CSS Grid layout for columnar addition
    const totalRows = round.rows
    const totalCols = round.columns
    playArea.style.display = 'grid'
    playArea.style.gridTemplateColumns = `auto repeat(${totalCols - 1}, 52px)`
    playArea.style.gridTemplateRows = `repeat(${totalRows}, 52px)`
    playArea.style.gap = '6px'
    playArea.style.alignItems = 'center'
    playArea.style.justifyItems = 'center'
    // Find horizontal and vertical numbers
    let horizontalNum, verticalNum, horizontalIdx, verticalIdx
    round.numbers.forEach((number, numIdx) => {
      if (number.direction === 'horizontal') { horizontalNum = number; horizontalIdx = numIdx }
      else { verticalNum = number; verticalIdx = numIdx }
    })
    const hRow = horizontalNum.gridRow
    const vCol = verticalNum.gridCol
    const slotsAbove = verticalNum.slotsAbove
    // Vertical label (👇) at row 0, in the vertical's column
    const vlabel = document.createElement('div')
    vlabel.className = 'number-label'
    vlabel.style.gridRow = '1'
    vlabel.style.gridColumn = String(vCol + 1)
    vlabel.innerHTML = `Number<br>${verticalIdx + 1} <span class="label-icon">👇</span>`
    playArea.appendChild(vlabel)
    // Vertical slots — all in ONE column
    verticalNum.slots.forEach((slot, slotIdx) => {
      const cell = createSlotCell(slot, verticalIdx, slotIdx)
      let gridRow
      if (slotIdx < slotsAbove):
        gridRow = 1 + slotIdx
      else:
        gridRow = hRow + 1 + (slotIdx - slotsAbove)
      cell.style.gridRow = String(gridRow + 1)
      cell.style.gridColumn = String(vCol + 1)
      playArea.appendChild(cell)
    })
    // Horizontal label (👉) at the horizontal row, col 0
    const hlabel = document.createElement('div')
    hlabel.className = 'number-label'
    hlabel.style.gridRow = String(hRow + 1)
    hlabel.style.gridColumn = '1'
    hlabel.innerHTML = `Number<br>${horizontalIdx + 1} <span class="label-icon">👉</span>`
    playArea.appendChild(hlabel)
    // Horizontal slots — one full row
    horizontalNum.slots.forEach((slot, slotIdx) => {
      const cell = createSlotCell(slot, horizontalIdx, slotIdx)
      cell.style.gridRow = String(hRow + 1)
      cell.style.gridColumn = String(slotIdx + 2)
      playArea.appendChild(cell)
    })

**computeTries()**
- Returns array of attempt counts per round (for metrics.tries)
- For each round 0..totalRounds-1, count attempts where metadata.round === r
- return tries[]

**getPlaceValue(number, slotIndex)**
- const totalSlots = number.slots.length
- const positionFromRight = totalSlots - 1 - slotIndex
- return Math.pow(10, positionFromRight)

**getPositionName(placeValue)**
- const names = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten-thousands', 100000: 'hundred-thousands', 1000000: 'millions' }
- return names[placeValue] || `×${placeValue}`

**async handleSlotTap(numberIndex, slotIndex)**
- If !gameState.isActive || gameState.isProcessing → return
- const key = `${numberIndex}-${slotIndex}`
- If gameState.wrongPositions.has(key) → return
- const cell = document.querySelector(`.slot-cell[data-number-index="${numberIndex}"][data-slot-index="${slotIndex}"]`)
- If !cell || cell.classList.contains('filled') || cell.classList.contains('correct') || cell.classList.contains('wrong') → return
- gameState.isProcessing = true
- const round = gameState.content.rounds[gameState.currentRound]
- const number = gameState.numbers[numberIndex]
- const placeValue = getPlaceValue(number, slotIndex)
- const contribution = gameState.digit * placeValue
- const posName = getPositionName(placeValue)
- const typeWord = round.type === 'sum' ? 'sum' : 'number'
- cell.textContent = gameState.digit
- trackEvent('tap_position', 'grid', { numberIndex, slotIndex, placeValue, contribution, digit: gameState.digit })
- signalCollector.recordViewEvent('visual_update', { screen: 'gameplay', content_snapshot: { type: 'slot_tapped', number_index: numberIndex, slot_index: slotIndex, digit: gameState.digit, contribution, position_name: posName } })
-
- If numberIndex === gameState.correctPosition.numberIndex && slotIndex === gameState.correctPosition.slotIndex:
  - // CORRECT
  - cell.classList.remove('empty')
  - cell.classList.add('correct')
  - // Awaited correct SFX → dynamic TTS (sequential)
  - try { await FeedbackManager.sound.play('correct_sound_effect', { sticker: { image: STICKER_URLS.correct, type: 'IMAGE_GIF' } }); } catch(e) {}
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: round.audio_content.correct, subtitle: round.audio_content.correct, sticker: STICKER_URLS.correct }); } catch(e) {}
  - trackEvent('correct_position', 'grid', { numberIndex, slotIndex, contribution, posName })
  - recordAttempt({ userAnswer: { action: 'tap_position', numberIndex, slotIndex, contribution }, correct: true, question: `Place ${gameState.digit} to maximise in ${typeWord}`, correctAnswer: `${posName} (${contribution})`, validationType: 'fixed' })
  - signalCollector.recordViewEvent('feedback_display', { screen: 'gameplay', content_snapshot: { feedback_type: 'correct', message: round.audio_content.correct, contribution, position_name: posName, audio_id: 'correct_sound_effect' } })
  - gameState.pendingEndProblem = { id: 'round_' + (gameState.currentRound + 1), outcome: { correct: true, answer: { numberIndex, slotIndex, contribution } } }
  - signalCollector.recordCustomEvent('round_solved', { round: gameState.currentRound + 1, correct: true, contribution, position_name: posName })
  - gameState.isProcessing = false
  - roundComplete()
- Else:
  - // WRONG
  - cell.classList.remove('empty')
  - cell.classList.add('wrong')
  - gameState.lives--
  - gameState.wrongPositions.add(key)
  - progressBar.update(gameState.currentRound, gameState.lives)
  - const incorrectText = round.audio_content.incorrect[key] || `Oops! ${gameState.digit} contributes only ${contribution.toLocaleString()} from this position.`
  - trackEvent('wrong_position', 'grid', { numberIndex, slotIndex, contribution, posName })
  - trackEvent('life_lost', 'game', { livesRemaining: gameState.lives })
  - recordAttempt({ userAnswer: { action: 'tap_position', numberIndex, slotIndex, contribution }, correct: false, question: `Place ${gameState.digit} to maximise in ${typeWord}`, correctAnswer: `${getPositionName(getPlaceValue(gameState.numbers[gameState.correctPosition.numberIndex], gameState.correctPosition.slotIndex))}`, validationType: 'fixed' })
  - signalCollector.recordViewEvent('feedback_display', { screen: 'gameplay', content_snapshot: { feedback_type: 'incorrect', message: incorrectText, contribution, position_name: posName, audio_id: 'incorrect_sound_effect' } })
  - signalCollector.recordViewEvent('visual_update', { screen: 'gameplay', content_snapshot: { type: 'life_lost', lives_remaining: gameState.lives } })
  - If gameState.lives <= 0:
    - // Skip incorrect SFX — go straight to handleGameOver
    - gameState.pendingEndProblem = { id: 'round_' + (gameState.currentRound + 1), outcome: { correct: false, answer: { numberIndex, slotIndex, contribution } } }
    - signalCollector.recordCustomEvent('round_solved', { round: gameState.currentRound + 1, correct: false, contribution, reason: 'game_over' })
    - gameState.isProcessing = false
    - await handleGameOver()
  - Else:
    - // Play incorrect SFX + TTS, then clear
    - try { await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: { image: STICKER_URLS.incorrect, type: 'IMAGE_GIF' } }); } catch(e) {}
    - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: incorrectText, subtitle: incorrectText, sticker: STICKER_URLS.incorrect }); } catch(e) {}
    - // Clear wrong state after audio finishes
    - cell.classList.remove('wrong')
    - cell.classList.add('filled')
    - cell.style.background = 'var(--mathai-light-gray)'
    - cell.style.color = 'var(--mathai-gray)'
    - cell.style.cursor = 'default'
    - gameState.isProcessing = false
    - signalCollector.recordViewEvent('visual_update', { screen: 'gameplay', content_snapshot: { type: 'wrong_flash_cleared', number_index: numberIndex, slot_index: slotIndex } })

**roundComplete()**
- gameState.currentRound++
- gameState.score++
- progressBar.update(gameState.currentRound, gameState.lives)
- trackEvent('round_complete', 'game', { round: gameState.currentRound, livesRemaining: gameState.lives })
- If gameState.currentRound === 2:
  - gameState.level = 2
  - trackEvent('level_complete', 'game', { level: 1 })
  - showLevelTransition(2)
- Else if gameState.currentRound >= gameState.totalRounds:
  - trackEvent('level_complete', 'game', { level: 2 })
  - endGame('victory')
- Else:
  - showRoundTransition(gameState.currentRound + 1)

**async endGame(reason)**
- if (gameState.gameEnded) return
- gameState.gameEnded = true
- gameState.isActive = false
- gameState.duration_data.currentTime = new Date().toISOString()
- const totalTime = Math.round((Date.now() - gameState.startTime) / 1000)
- const correctAttempts = gameState.attempts.filter(a => a.correct).length
- const totalAttempts = gameState.attempts.length
- const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
- const wrongAttempts = totalAttempts - correctAttempts
- const stars = gameState.lives  // stars === lives remaining (1, 2, or 3)
- const tries = computeTries()  // array of attempt counts per round
- const metrics = { accuracy, time: totalTime, stars, tries, attempts: gameState.attempts, duration_data: gameState.duration_data, roundsCompleted: gameState.currentRound, wrongAttempts, livesRemaining: gameState.lives, reason }
- console.log('Final Metrics:', JSON.stringify(metrics, null, 2))
- trackEvent('game_end', 'game', { reason, roundsCompleted: gameState.currentRound, accuracy, stars, time: totalTime })
- if (signalCollector && gameState.pendingEndProblem) { signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome); gameState.pendingEndProblem = null; }
- signalCollector.recordViewEvent('screen_transition', { screen: 'results', metadata: { transition_from: 'gameplay', reason } })
- const signalPayload = signalCollector ? signalCollector.seal() : { events: [], signals: {}, metadata: {} }
  // NOTE: recordViewEvent BEFORE seal() — seal() freezes the signal collector

- // **SCREEN-FIRST-THEN-AUDIO:** Show results before playing audio
- showResults(metrics, reason)

- // Send game_complete message BEFORE audio (so it's not blocked by audio await)
- window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts: gameState.attempts, ...signalPayload, completedAt: Date.now() } }, '*')

- // Play end-game audio AFTER screen is visible (SFX jingle + dynamic TTS only — no duplicate static voice)
- if (stars === 3):
  - try { await FeedbackManager.sound.play('victory_sound_effect', { sticker: { image: STICKER_URLS.victory, type: 'IMAGE_GIF' } }); } catch(e) {}
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[3], subtitle: DYNAMIC_AUDIO.end_game[3], sticker: STICKER_URLS.victory }); } catch(e) {}
- else if (stars === 2):
  - try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } }); } catch(e) {}
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[2], subtitle: DYNAMIC_AUDIO.end_game[2], sticker: STICKER_URLS.complete_2_stars }); } catch(e) {}
- else if (stars === 1):
  - try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } }); } catch(e) {}
  - try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[1], subtitle: DYNAMIC_AUDIO.end_game[1], sticker: STICKER_URLS.complete_1_star }); } catch(e) {}

- // Cleanup — guarded against restartGame() having already recreated components
- if (gameState.gameEnded) {
  - if (progressBar) { progressBar.destroy(); progressBar = null; }
  - if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
  - try { FeedbackManager.sound.stopAll(); FeedbackManager.stream.stopAll(); } catch(e) {}
- }

**async handleGameOver()**
- if (gameState.gameEnded) return
- gameState.gameEnded = true
- gameState.isActive = false
- gameState.duration_data.currentTime = new Date().toISOString()
- const totalTime = Math.round((Date.now() - gameState.startTime) / 1000)
- const correctAttempts = gameState.attempts.filter(a => a.correct).length
- const totalAttempts = gameState.attempts.length
- const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
- const wrongAttempts = totalAttempts - correctAttempts
- const stars = 0
- const tries = computeTries()
- const metrics = { accuracy, time: totalTime, stars, tries, attempts: gameState.attempts, duration_data: gameState.duration_data, roundsCompleted: gameState.currentRound, wrongAttempts, livesRemaining: 0, reason: 'game_over' }
- console.log('Final Metrics:', JSON.stringify(metrics, null, 2))
- trackEvent('game_end', 'game', { reason: 'game_over', roundsCompleted: gameState.currentRound, accuracy, stars: 0, time: totalTime })
- if (signalCollector && gameState.pendingEndProblem) { signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome); gameState.pendingEndProblem = null; }
- signalCollector.recordViewEvent('screen_transition', { screen: 'results', metadata: { transition_from: 'gameplay', reason: 'game_over' } })
- const signalPayload = signalCollector ? signalCollector.seal() : { events: [], signals: {}, metadata: {} }

- // **SCREEN-FIRST-THEN-AUDIO**
- showResults(metrics, 'game_over')

- // Send game_complete message BEFORE audio
- window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts: gameState.attempts, ...signalPayload, completedAt: Date.now() } }, '*')

- // Play game-over audio AFTER screen is visible (SFX jingle + dynamic TTS only — no duplicate static voice)
- try { await FeedbackManager.sound.play('game_over_sound_effect', { sticker: { image: STICKER_URLS.game_over, type: 'IMAGE_GIF' } }); } catch(e) {}
- try { gameState.currentDynamicAudio = await FeedbackManager.playDynamicFeedback({ audio_content: DYNAMIC_AUDIO.end_game[0], subtitle: DYNAMIC_AUDIO.end_game[0], sticker: STICKER_URLS.game_over }); } catch(e) {}

- // Cleanup — guarded against restartGame() having already recreated components
- if (gameState.gameEnded) {
  - if (progressBar) { progressBar.destroy(); progressBar = null; }
  - if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
  - try { FeedbackManager.sound.stopAll(); FeedbackManager.stream.stopAll(); } catch(e) {}
- }

**showResults(metrics, reason)**
- // Show results via TransitionScreen with content slot
- const stars = metrics.stars
- const metricsHTML = `<div class="results-metrics"><div class="metric-row"><span class="metric-label">Rounds Completed</span><span class="metric-value">${gameState.currentRound}/${gameState.totalRounds}</span></div><div class="metric-row"><span class="metric-label">Wrong Attempts</span><span class="metric-value">${metrics.wrongAttempts}</span></div><div class="metric-row"><span class="metric-label">Accuracy</span><span class="metric-value">${metrics.accuracy}%</span></div></div>`
- const buttonText = 'Play Again'
- transitionScreen.show({ stars: stars, title: reason === 'victory' ? 'Great Job!' : 'Game Over', content: metricsHTML, buttons: [{ text: buttonText, type: 'primary', action: function() { try { FeedbackManager._stopCurrentDynamic(); } catch(e) {} try { FeedbackManager.sound.stopAll(); } catch(e) {} gameState.currentDynamicAudio = null; restartGame(); } }], persist: true })

**restartGame()**
- // Push current session to history before resetting
- if (!window.sessionHistory) window.sessionHistory = []
- window.sessionHistory.push({ attempts: [...gameState.attempts], events: [...gameState.events], duration_data: { ...gameState.duration_data } })
- // Reset all gameState fields
- window.gameState.currentRound = 0
- window.gameState.score = 0
- window.gameState.attempts = []
- window.gameState.events = []
- window.gameState.lives = 3
- window.gameState.totalLives = 3
- window.gameState.wrongPositions = new Set()
- window.gameState.isProcessing = false
- window.gameState.isActive = false
- window.gameState.gameEnded = false
- window.gameState.startTime = null
- window.gameState.level = 1
- window.gameState.phase = 'start'
- window.gameState.pendingEndProblem = null
- window.gameState.currentDynamicAudio = null
- window.gameState.duration_data = { startTime: null, preview: [], attempts: [], evaluations: [], inActiveTime: [], totalInactiveTime: 0, currentTime: null }
- // Recreate destroyed components
- signalCollector = new SignalCollector({ sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(), studentId: window.gameVariableState?.studentId || null, templateId: gameState.gameId || null })
- window.signalCollector = signalCollector
- createProgressBar()
- progressBar.update(0, 3)
- visibilityTracker = new VisibilityTracker({ ...visibilityTrackerConfig })
- // Start game directly (no welcome screen)
- setupGame()

**createProgressBar()**
- if (progressBar) { try { progressBar.destroy(); } catch(e) {} progressBar = null; }
- progressBar = new ProgressBarComponent({ autoInject: true, totalRounds: gameState.totalRounds, totalLives: 3, slotId: 'mathai-progress-slot' })

**handlePostMessage(event)**
- if (!event.data || event.data.type !== 'game_init') return
- try:
  - const data = event.data.data
  - gameState.content = data.content
  - gameState.gameId = data.gameId || null
  - gameState.contentSetId = data.contentSetId || null
  - if (data.signalConfig && signalCollector) { signalCollector.configure(data.signalConfig); signalCollector.startFlushing(); }
  - if (typeof Sentry !== 'undefined') { Sentry.setContext('game', { gameId: data.gameId, contentSetId: data.contentSetId }); }
  - console.log('Game init received:', JSON.stringify({ gameId: data.gameId, contentSetId: data.contentSetId, hasContent: !!data.content }, null, 2))
- catch(e): console.error('PostMessage error:', JSON.stringify({ error: e.message }, null, 2))

**recordAttempt(data)**
- const attempt = { attempt_timestamp: new Date().toISOString(), time_since_start_of_game: (Date.now() - gameState.startTime) / 1000, input_of_user: data.userAnswer, attempt_number: gameState.attempts.length + 1, correct: data.correct, metadata: { round: gameState.currentRound, question: data.question, correctAnswer: data.correctAnswer, validationType: data.validationType || 'fixed' } }
- gameState.attempts.push(attempt)
- gameState.duration_data.attempts.push({ startTime: new Date().toISOString(), time_to_first_attempt: (Date.now() - gameState.startTime) / 1000, duration: 0 })
- console.log('Attempt:', JSON.stringify(attempt, null, 2))

**trackEvent(type, target, data = {})**
- gameState.events.push({ type, target, timestamp: Date.now(), ...data })
- console.log('Event:', JSON.stringify({ type, target, ...data }, null, 2))

---

## 10. Initialization (DOMContentLoaded)

```javascript
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForPackages();
    await FeedbackManager.init();
    // init() fires unlock() with permission popup internally (fire-and-forget).
    // Do NOT call unlock() again — it races and rejects.

    // SignalCollector — before VisibilityTracker
    signalCollector = new SignalCollector({
      sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(),
      studentId: window.gameVariableState?.studentId || null,
      templateId: gameState.gameId || null
    });
    window.signalCollector = signalCollector;

    // ScreenLayout v2
    const layout = ScreenLayout.inject('app', {
      sections: {
        header: true,
        questionText: true,
        progressBar: true,
        playArea: true,
        transitionScreen: true
      }
    });

    // Build question text into questionText slot (stays visible on ALL screens)
    const questionSlot = document.getElementById(layout.questionText);
    if (questionSlot) {
      questionSlot.innerHTML = '<div class="question-text-container"><p class="instruction-text">Tap and select the position where the given digits contribute the <strong>maximum value!</strong></p><p class="instruction-text-sub">Positions in grey are already filled and cannot be selected.</p><p class="instruction-text-sub">Take your time, think & answer each round! Complete all rounds without making any mistakes to win 3 stars!</p></div>';
    }

    // Build game content into #gameContent
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
      <div id="game-screen" class="game-block">
        <div class="prompt-area" id="prompt-area" data-signal-id="prompt-area">
          <p class="prompt-text" id="prompt-text" data-signal-id="prompt-text">Maximise contribution of this digit in the <strong>number</strong> 👇</p>
          <div class="digit-display" id="digit-display" data-signal-id="digit-display">0</div>
        </div>
        <div class="play-area" id="play-area" data-signal-id="play-area"></div>
      </div>
    `;

    // InteractionManager
    interactionManager = new InteractionManager({
      selector: '.play-area',
      disableOnAudioFeedback: false,
      disableOnEvaluation: true
    });
    window.interactionManager = interactionManager;

    // VisibilityTracker
    const visibilityTrackerConfig = {
      onInactive: () => {
        const inactiveStart = Date.now();
        gameState.duration_data.inActiveTime.push({ start: inactiveStart });
        if (signalCollector) { signalCollector.pause(); signalCollector.recordCustomEvent('visibility_hidden', {}); }
        FeedbackManager.sound.pause();
        FeedbackManager.stream.pauseAll();
        trackEvent('game_paused', 'system');
      },
      onResume: () => {
        const lastInactive = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
        if (lastInactive && !lastInactive.end) {
          lastInactive.end = Date.now();
          gameState.duration_data.totalInactiveTime += (lastInactive.end - lastInactive.start);
        }
        if (signalCollector) { signalCollector.resume(); signalCollector.recordCustomEvent('visibility_visible', {}); }
        FeedbackManager.sound.resume();
        FeedbackManager.stream.resumeAll();
        trackEvent('game_resumed', 'system');
      },
      popupProps: { title: 'Game Paused', description: 'Click Resume to continue.', primaryText: 'Resume' }
    };
    visibilityTracker = new VisibilityTracker(visibilityTrackerConfig);
    window.visibilityTrackerConfig = visibilityTrackerConfig; // stored for restartGame

    // ProgressBar
    createProgressBar();

    // TransitionScreen
    transitionScreen = new TransitionScreenComponent({ autoInject: true });

    // Audio preloading
    try {
      await FeedbackManager.sound.preload([
        { id: 'correct_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757756426373.mp3' },
        { id: 'incorrect_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3' },
        { id: 'rounds_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757498381203.mp3' },
        { id: 'game_over_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504545907.mp3' },
        { id: 'game_complete_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504686205.mp3' },
        { id: 'victory_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504678281.mp3' },
        { id: 'round_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/f6365f8c-a65d-45af-ac43-ef6ad966b6a7.mp3' },
        { id: 'round_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/f7d40e50-1af7-406c-93ed-dbb1faf548f0.mp3' },
        { id: 'round_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/105acac3-862f-4e00-807a-868921cb50e1.mp3' },
        { id: 'round_4', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/cd5dc5b3-951b-441e-9273-8d7c2f5f8894.mp3' },
        { id: 'round_5', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/bb563f3c-f849-421d-ba0a-d28d08161129.mp3' }
        // NOTE: Old static voice files (game_over, game_complete_1_star, etc., level_1, level_2) removed —
        // all voice audio now uses playDynamicFeedback() for TTS. Only SFX jingles are preloaded.
      ]);
    } catch(e) { console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2)); }

    // No StickerComponent.configure() needed — all stickers are passed as inline objects
    // via STICKER_URLS constant. For sound.play(), pass { image: STICKER_URLS.xxx, type: 'IMAGE_GIF' }.
    // For playDynamicFeedback(), pass URL string directly (STICKER_URLS.xxx).
    // FeedbackManager handles sticker display internally.

    // PostMessage listener BEFORE game_ready
    if (!gameState.content) gameState.content = fallbackContent;
    gameState.totalRounds = gameState.content.rounds.length;
    window.addEventListener('message', handlePostMessage);
    window.parent.postMessage({ type: 'game_ready' }, '*');

    // Start game
    setupGame();
  } catch(e) {
    console.error('Init error:', JSON.stringify({ error: e.message }, null, 2));
    if (typeof Sentry !== 'undefined') Sentry.captureException(e);
  }
});
```

---

## 11. Sentry Initialization (PART-030)

```javascript
function initSentry() {
  if (typeof SentryConfig !== 'undefined' && SentryConfig.enabled && typeof Sentry !== 'undefined') {
    Sentry.init({
      dsn: SentryConfig.dsn,
      environment: SentryConfig.environment,
      release: 'game-position-maximizer@1.0.0',
      tracesSampleRate: SentryConfig.tracesSampleRate,
      sampleRate: SentryConfig.sampleRate,
      maxBreadcrumbs: 50,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        'Script error.',
        'Load failed',
        'Failed to fetch'
      ]
    });
  }
}

window.addEventListener('error', (event) => {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.error || new Error(event.message), {
      tags: { errorType: 'unhandled', severity: 'critical' },
      contexts: { errorEvent: { message: event.message, filename: event.filename, lineno: event.lineno } }
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.reason || new Error('Unhandled promise rejection'), {
      tags: { errorType: 'unhandled-promise', severity: 'critical' }
    });
  }
});
```

---

## 12. Event Schema

### Game Lifecycle Events

| Event | Target | When Fired |
|-------|--------|------------|
| game_start | game | setupGame() |
| game_end | game | endGame() / handleGameOver() |
| game_paused | system | VisibilityTracker onInactive |
| game_resumed | system | VisibilityTracker onResume |

### Game-Specific Events

| Event | Target | When Fired | Data |
|-------|--------|------------|------|
| tap_position | grid | User taps empty slot | { numberIndex, slotIndex, placeValue, contribution, digit } |
| correct_position | grid | Tapped position is correct | { numberIndex, slotIndex, contribution, posName } |
| wrong_position | grid | Tapped position is wrong | { numberIndex, slotIndex, contribution, posName } |
| round_complete | game | Round advances | { round, livesRemaining } |
| level_complete | game | Level's rounds done | { level } |
| life_lost | game | Wrong position tapped | { livesRemaining } |

### SignalCollector View Events

| viewType | When Emitted | Key Data |
|----------|-------------|----------|
| screen_transition | setupGame(), endGame() | screen, metadata.transition_from |
| content_render | loadRound() | round, digit, type, numbers_count, trigger |
| visual_update | handleSlotTap() — slot tapped, life lost, wrong flash cleared | type, number_index, slot_index, digit, contribution |
| feedback_display | handleSlotTap() — correct or wrong | feedback_type, message, contribution, position_name, audio_id |
| overlay_toggle | showLevelTransition() | overlay, visible, title, level |

### SignalCollector Custom Events

| Event | When Emitted | Data |
|-------|-------------|------|
| round_solved | handleSlotTap() — correct tap or game_over | { round, correct, contribution, position_name?, reason? } |
| visibility_hidden | VisibilityTracker onInactive | {} |
| visibility_visible | VisibilityTracker onResume | {} |

### SignalCollector Problem Lifecycle

| Method | When Called | Details |
|--------|-----------|---------|
| `startProblem('round_N')` | loadRound() | problemData includes round_number, question_text, correct_answer, digit, type |
| `endProblem('round_N')` | loadRound() (flush from previous) or endGame() (flush before seal) | Deferred pattern via `gameState.pendingEndProblem` |
| `seal()` | endGame() / handleGameOver() | Returns `{ events, signals, metadata }` |

---

## 13. Feedback Triggers & Audio Sequence

### Audio Sequence Table

| # | Moment | Trigger | Audio Type | Content / Sound ID | Sticker | Await? | Notes |
|---|--------|---------|------------|-------------------|---------|--------|-------|
| 1 | Level 1 intro (TTS) | showLevelTransition(1) | Dynamic TTS | DYNAMIC_AUDIO.level_1 | `STICKER_URLS.level` | ✅ Awaited* | Single TTS call — no separate static sound.play. User can interrupt via button |
| 2 | Round N jingle | showRoundTransition(N) | Static | `rounds_sound_effect` | ❌ None | ✅ Awaited | No button — auto-advance |
| 3 | Round N narration | showRoundTransition(N) | Static | `round_N` | `{ image: STICKER_URLS.round, type: 'IMAGE_GIF' }` | ✅ Awaited | Sequential after #2 |
| 4 | Level 2 intro (TTS) | showLevelTransition(2) | Dynamic TTS | DYNAMIC_AUDIO.level_2 | `STICKER_URLS.level` | ✅ Awaited* | Single TTS call — no separate static sound.play |
| 5 | Correct tap SFX | handleSlotTap (correct) | Static | `correct_sound_effect` | `{ image: STICKER_URLS.correct, type: 'IMAGE_GIF' }` | ✅ Awaited | Blocks until sound ends |
| 6 | Correct tap TTS | handleSlotTap (correct) | Dynamic TTS | round.audio_content.correct | `STICKER_URLS.correct` | ✅ Awaited* | Sequential after #5 |
| 7 | Wrong tap SFX | handleSlotTap (wrong, lives>0) | Static | `incorrect_sound_effect` | `{ image: STICKER_URLS.incorrect, type: 'IMAGE_GIF' }` | ✅ Awaited | Blocks until sound ends |
| 8 | Wrong tap TTS | handleSlotTap (wrong, lives>0) | Dynamic TTS | round.audio_content.incorrect[key] | `STICKER_URLS.incorrect` | ✅ Awaited* | Sequential after #7; wrong clears AFTER |
| 9 | Wrong tap (last life) | handleSlotTap (wrong, lives=0) | — | *SKIPPED* | — | — | Skip incorrect SFX → handleGameOver |
| 10 | Victory SFX (3★) | endGame('victory') | Static | `victory_sound_effect` | `{ image: STICKER_URLS.victory, type: 'IMAGE_GIF' }` | ✅ Awaited | Screen shown FIRST |
| 11 | Victory TTS (3★) | endGame('victory') | Dynamic TTS | "Amazing! You completed..." | `STICKER_URLS.victory` | ✅ Awaited* | Sequential after #10 |
| 12 | Complete SFX (2★) | endGame('victory') | Static | `game_complete_sound_effect` | `{ image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' }` | ✅ Awaited | Screen shown FIRST |
| 13 | Complete TTS (2★) | endGame('victory') | Dynamic TTS | "Superb! You completed..." | `STICKER_URLS.complete_2_stars` | ✅ Awaited* | Sequential after #12 |
| 14 | Complete SFX (1★) | endGame('victory') | Static | `game_complete_sound_effect` | `{ image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' }` | ✅ Awaited | Screen shown FIRST |
| 15 | Complete TTS (1★) | endGame('victory') | Dynamic TTS | "Nice job! You completed..." | `STICKER_URLS.complete_1_star` | ✅ Awaited* | Sequential after #14 |
| 16 | Game over SFX (0★) | handleGameOver() | Static | `game_over_sound_effect` | `{ image: STICKER_URLS.game_over, type: 'IMAGE_GIF' }` | ✅ Awaited | Screen shown FIRST |
| 17 | Game over TTS | handleGameOver() | Dynamic TTS | "Oops! You lost all lives..." | `STICKER_URLS.game_over` | ✅ Awaited* | Sequential after #16 |

> **Awaited\*** = Dynamic TTS via `playDynamicFeedback`. On cache hit, awaited. On cache miss (streaming), may resolve before audio finishes.
>
> **Important:** `playDynamicFeedback` takes a single object `{ audio_content, subtitle, sticker }` where `sticker` is a **plain URL string** (e.g., `STICKER_URLS.correct`). FeedbackManager wraps it internally into `{ type: 'IMAGE_GIF', image: url, alignment: 'CENTER' }`. In contrast, `sound.play()` takes `sticker` as an object `{ image, type }` (e.g., `{ image: STICKER_URLS.correct, type: 'IMAGE_GIF' }`). NEVER use string sticker names from stickersList. NEVER use StickerComponent directly.

### Sticker Assets (`STICKER_URLS` constant)

All stickers are simple URL strings stored in the `STICKER_URLS` constant. No named sticker list (stickersList) is used.

```javascript
var STICKER_URLS = {
  round:            'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-87.gif',
  correct:          'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-95.gif',
  incorrect:        'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-99.gif',
  game_over:        'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-103.gif',
  game_complete:    'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-107.gif',
  complete_1_star:  'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-110.gif',
  complete_2_stars: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-113.gif',
  victory:          'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1759297084426-230.gif',
  level:            'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1759297084426-234.gif'
};
```

| `STICKER_URLS` Key | GIF File | Used With |
|--------------------|----------|-----------|
| `round` | `rc-upload-1758375013588-87.gif` | Round narration (all rounds) |
| `correct` | `rc-upload-1758375013588-95.gif` | Correct SFX + TTS |
| `incorrect` | `rc-upload-1758375013588-99.gif` | Incorrect SFX + TTS |
| `game_over` | `rc-upload-1758375013588-103.gif` | Game over SFX + TTS |
| `game_complete` | `rc-upload-1758375013588-107.gif` | Complete SFX (1-2★) |
| `complete_1_star` | `rc-upload-1758375013588-110.gif` | 1★ TTS |
| `complete_2_stars` | `rc-upload-1758375013588-113.gif` | 2★ TTS |
| `victory` | `rc-upload-1759297084426-230.gif` | Victory SFX + TTS (3★) |
| `level` | `rc-upload-1759297084426-234.gif` | Level 1 + Level 2 TTS |

> **IMPORTANT:** All stickers are managed through FeedbackManager only — NEVER use `StickerComponent` directly, NEVER use `StickerComponent.configure()`. For `sound.play()`, pass sticker as `{ image: STICKER_URLS.xxx, type: 'IMAGE_GIF' }`. For `playDynamicFeedback()`, pass sticker as a plain URL string (`STICKER_URLS.xxx`). NEVER use string sticker names from stickersList. FeedbackManager handles display, hiding, and cleanup internally.

---

## 14. Visual Specifications

- **Layout:** Vertical stack — instruction (in questionText slot) → prompt + digit → columnar number grid
- **Level 1:** Single horizontal number row with "Number 1 👉" label (points right toward slots)
- **Level 2:** Columnar addition using CSS Grid. The LONGER number fills one horizontal row (label → `👉`). The SHORTER number is displayed vertically in its column (label → `👇`). Both are right-aligned by ones place. Determine direction from `number.direction` property, NOT hardcoded per number index.
- **Slot cells:** 52px × 52px, border-radius 8px, min touch target 44×44px ✓
- **Filled slots:** Gray background (`var(--mathai-light-gray)`), non-interactive
- **Empty slots:** White background, 2px `var(--mathai-light-gray)` border, tappable, hover → blue border + light blue bg
- **Correct state:** `var(--mathai-light-green)` background, `var(--mathai-green)` border
- **Wrong state:** `var(--mathai-light-red)` background, `var(--mathai-red)` border. After audio/feedback → becomes gray (filled)
- **Digit display:** 48px bold, centered
- **Feedback:** All feedback text shown via FeedbackManager subtitles only (no `.feedback-area` UI element)
- **Right-alignment:** Numbers in columnar format are right-aligned (ones column aligned) with spacers for shorter numbers

---

## 15. Debug Functions (PART-012)

```javascript
window.debugGame = function() {
  console.log('Game State:', JSON.stringify({
    currentRound: gameState.currentRound, totalRounds: gameState.totalRounds,
    lives: gameState.lives, score: gameState.score, level: gameState.level,
    digit: gameState.digit, correctPosition: gameState.correctPosition,
    wrongPositions: [...gameState.wrongPositions], isActive: gameState.isActive,
    phase: gameState.phase, gameEnded: gameState.gameEnded
  }, null, 2));
};
window.debugAudio = function() {
  console.log('FeedbackManager available:', typeof FeedbackManager !== 'undefined');
  console.log('canPlayAudio:', typeof FeedbackManager !== 'undefined' && FeedbackManager.canPlayAudio());
};
window.testAudio = async function(id) {
  try { await FeedbackManager.sound.play(id || 'correct_sound_effect'); }
  catch(e) { console.error(JSON.stringify({ error: e.message }, null, 2)); }
};
window.testPause = function() { console.log('No timer in this game — audio/signals still pause via VisibilityTracker'); };
window.testResume = function() { console.log('No timer in this game — audio/signals still resume via VisibilityTracker'); };
window.debugSignals = function() {
  if (signalCollector) { signalCollector.debug(); }
  else { console.log('SignalCollector not initialized'); }
};
window.verifySentry = function() {
  const checks = { sdkLoaded: typeof Sentry !== 'undefined', initialized: typeof Sentry !== 'undefined' && Sentry.getClient() !== undefined, dsn: typeof Sentry !== 'undefined' && Sentry.getClient()?.getDsn()?.toString() };
  console.log('Sentry Status:', JSON.stringify(checks, null, 2));
  return checks;
};
window.testSentry = function() {
  try { throw new Error('Test error from testSentry()'); }
  catch (error) { if (typeof Sentry !== 'undefined') { Sentry.captureException(error, { tags: { test: true } }); } console.log('Test error sent to Sentry. Check dashboard.'); }
};
window.jumpToRound = function(n) {
  if (n < 1 || n > gameState.totalRounds) { console.log('Invalid round:', n); return; }
  gameState.currentRound = n - 1;
  gameState.isActive = true;
  gameState.isProcessing = false;
  gameState.gameEnded = false;
  if (n > 2) gameState.level = 2;
  loadRound();
  console.log('Jumped to round', n);
};
```

---

## 16. Scaffold Points

| Point | Function | When | What Can Be Injected |
|-------|----------|------|---------------------|
| after_wrong_tap | handleSlotTap() | Wrong position tapped | Hint showing place values, highlight correct area |
| before_round | loadRound() | New round starts | Strategy tip about place value |
| on_level_transition | showLevelTransition() | New level | Explanation of sum format |

Scaffolds are optional — game works without them. Each scaffold point must have a no-op default.

---

## 17. Test Scenarios

### Scenario: Complete game with all correct (5 rounds, 2 levels)

```
SETUP: Game starts → Level 1 transition shown immediately
ACTIONS:
  // Level 1 transition: level_1 audio + dynamic TTS plays, user clicks button
  click "Let's go!"
  // Round 1 transition: rounds_sound_effect → round_1 narration → auto-advance
  // Round 1: digit 8, "9 _ _ 3" → tap slot index 1 (hundreds)
  click .slot-cell[data-number-index="0"][data-slot-index="1"]
  → green highlight, subtitle "Correct! 8 will contribute 800..."
  → await correct_sound_effect + await dynamic TTS → roundComplete()
  // Round 2 transition: rounds_sound_effect → round_2 narration → auto-advance
  // Round 2: digit 7, "_ _ _ 4" → tap slot index 0 (thousands)
  click .slot-cell[data-number-index="0"][data-slot-index="0"]
  → green, await audio → roundComplete()
  → Level 2 transition screen appears
  click "Next Level"
  // Round 3-5: complete correctly
ASSERT:
  gameState.score == 5, results shown via TransitionScreen, 3 stars
  Button text: "Play Again" (3★)
  game_complete postMessage includes: metrics, attempts, events, signals, metadata
```

### Scenario: Wrong answer → red flash, lose life, retry same round

```
SETUP: Round 1, digit 8, "9 _ _ 3"
ACTIONS:
  click .slot-cell[data-number-index="0"][data-slot-index="2"] (tens position)
ASSERT:
  cell shows "8" with red background
  subtitle shows "Oops! 8 will contribute only 80..."
  await incorrect_sound_effect → await dynamic TTS (user hears full explanation)
  THEN: red cleared, cell becomes gray
  gameState.lives == 2
  still on round 1 (gameState.currentRound == 0)
  user can now tap remaining empty slot (index 1)
```

### Scenario: Wrong slot becomes non-tappable after wrong answer

```
SETUP: Round 2, digit 7, "_ _ _ 4", user tapped slot 2 (tens) incorrectly
ACTIONS:
  after red clears, try clicking slot 2 again
ASSERT:
  nothing happens — slot is now gray/filled, wrongPositions contains "0-2"
```

### Scenario: Level transition after round 2

```
SETUP: Complete rounds 1 and 2 correctly
ASSERT:
  Level 2 transition screen appears with "Next Level" button
  level_2 dynamic TTS plays (via playDynamicFeedback with STICKER_URLS.level)
  Prompt changes from "number" to "sum"
  After clicking "Next Level", round 3 loads with columnar CSS Grid layout
```

### Scenario: Game over after 3 wrong taps

```
ACTIONS:
  Round 1: tap wrong slot → lives=2 (hear incorrect SFX + TTS)
  Round 1: tap wrong slot → lives=1 (hear incorrect SFX + TTS)
  Round 1: tap wrong slot → lives=0
ASSERT:
  incorrect SFX SKIPPED on last life
  results screen shown FIRST (screen-first-then-audio)
  THEN: game_over_sound_effect → dynamic TTS (SFX + TTS only — no duplicate static voice)
  0 stars, button text: "Play Again"
```

### Scenario: Stars based on lives remaining

```
ASSERT:
  0 wrong = 3 lives remaining = 3★, button: "Play Again"
  1 wrong = 2 lives remaining = 2★, button: "Play Again"
  2 wrong = 1 life remaining = 1★, button: "Play Again"
  3 wrong = game over = 0★, button: "Play Again"
```

### Scenario: Screen-first-then-audio on end screens

```
SETUP: Complete all 5 rounds with 3★
ASSERT:
  transitionScreen.show() called BEFORE any audio plays
  User sees results (stars, metrics) immediately
  victory_sound_effect → dynamic TTS plays AFTER screen is visible (SFX + TTS only — no duplicate static voice)
```

### Scenario: Restart resets everything

```
ACTIONS: click restart button on results screen
ASSERT:
  Audio stopped: sound.stopAll(), stream.stopAll()
  All state reset: level=1, lives=3, currentRound=0
  signalCollector is a NEW instance
  visibilityTracker is a NEW instance
  progressBar is a NEW instance
  Level 1 transition screen shows immediately (no welcome screen)
```

### Scenario: VisibilityTracker pauses/resumes

```
SETUP: Game active, round in progress
ACTIONS: Tab loses focus
ASSERT:
  signalCollector.pause() called
  FeedbackManager.sound.pause() called (NOT stopAll)
  FeedbackManager.stream.pauseAll() called
  Popup shows "Game Paused" with "Resume" button
ACTIONS: User clicks Resume
ASSERT:
  signalCollector.resume() called
  FeedbackManager.sound.resume() called
  FeedbackManager.stream.resumeAll() called
  duration_data.inActiveTime updated
```

---

## 18. Verification Checklist

### Structural
- [ ] DOCTYPE, meta charset, meta viewport
- [ ] SentryConfig + Sentry SDK v10.23.0 scripts FIRST in `<head>` (3 SDK scripts, NO integrity)
- [ ] Package scripts in order: FeedbackManager → Components → Helpers
- [ ] Single style + single script (RULE-007)
- [ ] `<div id="app"></div>` only — no manual layout divs
- [ ] No `#results-screen` div — uses TransitionScreen content slot
- [ ] `data-signal-id` attributes on interactive elements

### Layout & CSS
- [ ] ScreenLayout v2 with `sections` config (NOT `slots`)
- [ ] Question text in questionText slot — visible on ALL screens
- [ ] `100dvh` used (NOT `100vh`)
- [ ] `max-width: 480px` on `.mathai-layout-root`
- [ ] `.mathai-layout-playarea` does NOT use `!important` on `display`
- [ ] `.mathai-ts-screen.active` and `.mathai-ts-card` overrides present
- [ ] All colors use `var(--mathai-*)` CSS variables
- [ ] Touch targets ≥ 44×44px (slot cells: 52×52px ✓)
- [ ] `:hover` and `:active` states on interactive elements
- [ ] `-webkit-tap-highlight-color: transparent` on interactive elements
- [ ] `user-select: none; -webkit-user-select: none;` on interactive elements

### Functional
- [ ] waitForPackages with 10s timeout — checks FeedbackManager, VisibilityTracker, SignalCollector (NO TimerComponent)
- [ ] `FeedbackManager.init()` awaited — do NOT call `unlock()` after
- [ ] No `timer` variable — this game has no timer at all
- [ ] Init sequence: waitForPackages → init → SignalCollector → ScreenLayout → content → InteractionManager → VisibilityTracker → ProgressBar → TransitionScreen → preload → postMessage → setupGame (no welcome screen, goes directly to Level 1 transition)
- [ ] PostMessage listener registered BEFORE `game_ready` sent
- [ ] `isProcessing` guard on handleSlotTap — prevents double-tap
- [ ] `isActive` guard on handleSlotTap
- [ ] `gameEnded` guard on endGame/handleGameOver — prevents double-call

### Audio
- [ ] 15 sounds preloaded via `sound.preload([{id, url}])` — NOT `sound.register()`
- [ ] All audio URLs use `cdn.mathai.ai` domain
- [ ] All stickers passed through FeedbackManager only (no direct StickerComponent usage)
- [ ] Correct tap: `await sound.play('correct_sound_effect')` → `await playDynamicFeedback(...)` — both AWAITED
- [ ] Wrong tap (lives > 0): `await sound.play('incorrect_sound_effect')` → `await playDynamicFeedback(...)` — both AWAITED
- [ ] Wrong tap (lives = 0): SKIP incorrect sound → handleGameOver
- [ ] Round transition: `await rounds_sound_effect` → `await round_N` (with `{ image: STICKER_URLS.round, type: 'IMAGE_GIF' }`) → auto-advance
- [ ] Level 1 transition: `await playDynamicFeedback` with `STICKER_URLS.level` — single TTS call only (no separate static sound.play)
- [ ] Level 2 transition: `await playDynamicFeedback` with `STICKER_URLS.level` — single TTS call only (no separate static sound.play)
- [ ] Audio permission polling (`FeedbackManager.canPlayAudio()` + setInterval 200ms + 15s timeout) before level audio
- [ ] Level/round transition button stops audio: `FeedbackManager._stopCurrentDynamic(); FeedbackManager.sound.stopAll();`
- [ ] Results retry button stops audio: `FeedbackManager._stopCurrentDynamic(); FeedbackManager.sound.stopAll();`
- [ ] `FeedbackManager._stopCurrentDynamic()` used at start of showRoundTransition()
- [ ] **Screen-first-then-audio** on ALL end screens (victory + game over)
- [ ] Victory 3★: `await victory_sound_effect` → `await playDynamicFeedback` (SFX + dynamic TTS only — no duplicate static voice)
- [ ] Complete 2★: `await game_complete_sound_effect` → `await playDynamicFeedback` (SFX + dynamic TTS only)
- [ ] Complete 1★: `await game_complete_sound_effect` → `await playDynamicFeedback` (SFX + dynamic TTS only)
- [ ] Game over 0★: `await game_over_sound_effect` → `await playDynamicFeedback` (SFX + dynamic TTS only)
- [ ] Static audio (`sound.play`) sticker uses `{ image: STICKER_URLS.xxx, type: 'IMAGE_GIF' }`. Dynamic TTS (`playDynamicFeedback`) stickers use plain URL string (`STICKER_URLS.xxx`).
- [ ] No `StickerComponent.configure()` — removed entirely
- [ ] No string sticker names from stickersList — all stickers use `STICKER_URLS` constant
- [ ] `STICKER_URLS.round` used for all round narrations (no `roundStickerName` variable)
- [ ] `FeedbackManager.feedback.hideAll()` is the correct API (not `FeedbackManager.hideAll()`)

### Results & Restart
- [ ] Button text: always "Play Again"
- [ ] restartGame() resets ALL state, recreates SignalCollector, ProgressBar, VisibilityTracker
- [ ] restartGame() pushes to sessionHistory before resetting
- [ ] restartGame() starts game directly — shows Level 1 transition immediately (no welcome screen)
- [ ] Results button stops audio before transitioning

### SignalCollector
- [ ] Initialized in DOMContentLoaded with sessionId, studentId, templateId
- [ ] `window.signalCollector` assigned
- [ ] `startProblem('round_N')` at each round start
- [ ] Deferred `endProblem` via `gameState.pendingEndProblem`
- [ ] Flushed at start of loadRound() and in endGame()/handleGameOver() before seal()
- [ ] `recordViewEvent('screen_transition')` called BEFORE `seal()` (seal freezes the collector)
- [ ] `seal()` called before postMessage
- [ ] `postMessage` sent BEFORE audio await (not blocked by audio playback)
- [ ] Cleanup guarded by `if (gameState.gameEnded)` to avoid destroying components recreated by restartGame()
- [ ] postMessage includes `...signalPayload` spread
- [ ] `configure()` + `startFlushing()` called from handlePostMessage when signalConfig received
- [ ] Pause/resume in VisibilityTracker
- [ ] `recordCustomEvent('visibility_hidden/visible')` in VisibilityTracker
- [ ] `data-signal-id` on all interactive elements (slots via renderPlayArea, prompt-area, play-area)

### Sentry
- [ ] SentryConfig loaded BEFORE SDK in `<head>`
- [ ] Sentry SDK v10.23.0 (3 scripts)
- [ ] `initSentry()` defined BEFORE SDK loads, checks `SentryConfig.enabled`
- [ ] Release: `'game-position-maximizer@1.0.0'`
- [ ] All 6 `ignoreErrors` patterns
- [ ] Global `error` + `unhandledrejection` handlers
- [ ] `verifySentry()` + `testSentry()` debug functions

### Game-Specific
- [ ] Digit (0-9) displayed prominently above grid
- [ ] Prompt text changes: "number" (L1) / "sum" (L2)
- [ ] Filled slots: gray, non-interactive
- [ ] Empty slots: white, tappable, show digit on tap
- [ ] Correct: green → awaited SFX + TTS → advance
- [ ] Wrong (lives>0): red → awaited SFX + TTS → gray → retry
- [ ] Wrong (lives=0): skip SFX → handleGameOver
- [ ] Wrong slot NOT re-tappable (wrongPositions set)
- [ ] Place value = 10^(totalSlots - 1 - slotIndex)
- [ ] Level 1: single number, Level 2: columnar sum
- [ ] Right-alignment in columnar layout (ones column aligned)
- [ ] 5 rounds: 2 in Level 1, 3 in Level 2
- [ ] Level transition after round 2
- [ ] Stars = lives remaining (3/2/1/0)
- [ ] No timer

### Rules
- [ ] RULE-001: Global scope — all functions callable from onclick
- [ ] RULE-002: async keyword on all async functions
- [ ] RULE-003: try/catch on all async calls
- [ ] RULE-004: JSON.stringify in all logging
- [ ] RULE-005: Cleanup in endGame/handleGameOver
- [ ] RULE-006: No new Audio(), no setInterval timers, no SubtitleComponent.show(), no sound.register()
- [ ] RULE-007: Single file, no external CSS/JS
