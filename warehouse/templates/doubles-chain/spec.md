# Doubles-Chain — Game Specification (Assembly Book)

> **Single-file game.** Everything lives in `game/index.html`. This spec is the generation source — keep it in sync with the HTML at all times.

---

## Game Identity

| Field | Value |
|-------|-------|
| **Title** | Doubles-Chain |
| **Game ID** | `doubles-chain` |
| **Type** | Progressive grid puzzle (chain-of-doubles) |
| **Description** | Find chains of numbers on a grid where each subsequent number is exactly double the previous one (e.g., 5 → 10 → 20). 5 rounds, escalating grid size and chain count. 3 lives, stars = lives remaining. |

---

## Parts Selected

| Part | Name | Included | Config / Notes |
|------|------|----------|----------------|
| PART-001 | HTML Shell | YES | `<!DOCTYPE html>`, viewport meta, single `<div id="app">` |
| PART-002 | Package Scripts | YES | SentryConfig → Sentry SDK → FeedbackManager → Components → Helpers |
| PART-003 | waitForPackages | YES | Checks: FeedbackManager, VisibilityTracker, SignalCollector (NO TimerComponent) |
| PART-004 | Initialization Block | YES | ScreenLayout v2, InteractionManager |
| PART-005 | VisibilityTracker | YES | Pauses audio, signalCollector (no timer to pause) |
| PART-006 | TimerComponent | **NO** | This game has no timer — stars are lives-based |
| PART-007 | Game State | YES | Custom: lives, chainsFound, requiredChains, selectedTiles, completedTiles, currentChainIndex (-1 = no chain active), completedChainIndices (Set) |
| PART-008 | PostMessage Protocol | YES | game_ready → game_init → game_complete |
| PART-009 | Attempt Tracking | YES | recordAttempt() on every chain complete/incorrect tap |
| PART-010 | Event Tracking | YES | trackEvent() at all interaction points |
| PART-011 | End Game & Metrics | YES | stars = lives remaining (0–3), accuracy, rounds completed |
| PART-012 | Debug Functions | YES | debugGame, debugAudio, testAudio, jumpToRound, etc. |
| PART-013 | Validation (Fixed) | YES | Each tile validated against `previousTile × 2` rule |
| PART-017 | Feedback Integration | YES | 26 preloaded sounds + stickers via STICKER_URLS. NO dynamic TTS (all audio is pre-recorded). |
| PART-020 | CSS Variables | YES | Standard mathai variables |
| PART-022 | Buttons | YES | "Start" on round transition, "Try Again" / "Play Again" on end screens |
| PART-023 | ProgressBar Component (v2) | YES | totalRounds: gameState.totalRounds (dynamic), totalLives: 3 |
| PART-024 | TransitionScreen Component (v2) | YES | Screens: round-transition (×5), game-complete, game-over + AUDIO (NO welcome screen, NO level transitions) |
| PART-025 | ScreenLayout Component (v2) | YES | sections: header + questionText + progressBar + playArea + transitionScreen |
| PART-028 | Input Schema | YES | 5 rounds with grid, chains[], requiredChains |
| PART-030 | Sentry Error Tracking | YES | release: 'game-doubles-chain@1.0.0' |
| PART-038 | InteractionManager | YES | selector: '.chain-grid', disableOnAudioFeedback: false, disableOnEvaluation: true |

---

## Game State

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
  phase: 'start',              // 'start' | 'transition' | 'playing' | 'ended'
  chainsFound: 0,              // resets each round
  requiredChains: 0,           // set from round data (1, 1, 2, 3, 4)
  currentChainIndex: -1,       // -1 = no chain active; player picks by tapping any incomplete chain's first tile
  completedChainIndices: new Set(), // tracks which chain indices are done
  selectedTiles: [],           // indices of currently selected tiles in sequence
  completedTiles: new Set(),   // indices of tiles belonging to completed chains
  isProcessing: false,         // double-tap guard during feedback
  gameEnded: false,            // idempotency guard for endGame/handleGameOver
  pendingEndProblem: null,     // deferred endProblem for signalCollector
  gameId: null,
  contentSetId: null,
  signalConfig: {}
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

## Constants

### STICKER_URLS

All GIFs/PNGs — plain URL strings. Used as `{ sticker: { image: STICKER_URLS.xxx, type: 'IMAGE_GIF' } }` in `sound.play()`.

```javascript
var STICKER_URLS = {
  round_1:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-10.gif',
  round_2:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-13.gif',
  round_3:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-16.gif',
  round_4:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-20.gif',
  round_5:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-24.gif',
  partial_correct:      'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-27.png',
  chain_progress:       'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-30.gif',
  all_chains_found:     'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-38.gif',
  incorrect:            'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-49.gif',
  life_lost:            'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-44.gif',
  game_over_sfx:        'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-47.gif',
  game_over_vo:         'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-52.gif',
  victory:              'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-73.gif',
  game_complete:        'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-69.gif',
  complete_2_stars:     'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-67.gif',
  complete_1_star:      'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-63.gif'
};
```

### Audio Preload List

All 26 audio files preloaded at init. Every ID has a matching `sound.play(id)` call.

```javascript
await FeedbackManager.sound.preload([
  // Round transition SFX + announcements
  { id: 'rounds_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757498381203.mp3' },
  { id: 'round_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/e81d1cf2-6d68-451a-abbf-44a87ed5911f.mp3' },
  { id: 'round_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b7e3ec2f-6740-4468-b7de-7dfbf0e7e907.mp3' },
  { id: 'round_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/a6859e2c-fb63-428d-8954-1777b323face.mp3' },
  { id: 'round_4', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/aacb85b6-bd0e-4743-87e2-15c2bc0078ae.mp3' },
  { id: 'round_5', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/218c8171-ea2c-40d5-8bf8-7bf8cfdd6593.mp3' },

  // Chain feedback
  { id: 'soundPartialCorrect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501548938.mp3' },
  { id: 'soundChainComplete', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3' },

  // Chain progress voiceovers (first chain found)
  { id: 'vo_first_chain_3_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b3b0695f-2bd2-4f90-bbae-97d5ce300090.mp3' },
  { id: 'vo_first_chain_2_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/de466461-7e59-4fbd-8bf8-3724866b5b88.mp3' },
  { id: 'vo_first_chain_1_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/5a9c0a05-3c02-497a-ae18-7a36d52f314a.mp3' },

  // Chain progress voiceovers (subsequent chains found)
  { id: 'vo_another_chain_3_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b86de656-09b9-4ff2-b2c6-20bace1bf21f.mp3' },
  { id: 'vo_another_chain_2_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/21fc3248-8235-406f-a89a-539861c1ae15.mp3' },
  { id: 'vo_another_chain_1_more', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/a262e27f-1c5c-4e77-9607-19cdabe8904f.mp3' },

  // All chains found
  { id: 'vo_all_chains_found', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/f8cb9056-7b16-4990-a57b-1caf83c299ae.mp3' },

  // Incorrect / life lost
  { id: 'soundIncorrect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3' },
  { id: 'soundLifeLost', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757502061748.mp3' },

  // Game over
  { id: 'soundGameOver', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757503513043.mp3' },
  { id: 'vo_game_over_0_rounds', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/1582d67e-43f0-47c6-b3d8-a06b61b227a2.mp3' },
  { id: 'vo_game_over_1_round', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/bb4b548f-4fbf-4ef5-89ba-3d563fa1acd6.mp3' },
  { id: 'vo_game_over_2_rounds', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b17eb897-1008-47a0-b459-2527b1fd961f.mp3' },
  { id: 'vo_game_over_3_rounds', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b6489857-43e6-4a44-8a46-a66aad375764.mp3' },
  { id: 'vo_game_over_4_rounds', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/f3b52938-9e3e-46dc-abdc-a3e5c4a910ce.mp3' },

  // Victory / game complete
  { id: 'soundVictory', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757503919451.mp3' },
  { id: 'vo_victory_3_stars', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/5c33bc2e-8797-4c72-b7da-95797101297d.mp3' },
  { id: 'game_complete_sound', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757503970396.mp3' },
  { id: 'vo_victory_2_stars', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/7108b6ed-b947-4ac2-a9af-ac0df2a09a3d.mp3' },
  { id: 'vo_victory_1_star', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/a6d11949-ec93-4a10-80f4-6716c2487cb1.mp3' }
]);
```

---

## Input Schema & Content

### Round Data Structure

```json
{
  "rounds": [
    {
      "gridSize": 3,
      "requiredChains": 1,
      "grid": [5, 10, 20, 7, 3, 14, 6, 12, 15],
      "chains": [
        { "indices": [0, 1, 2], "values": [5, 10, 20] }
      ]
    }
  ]
}
```

**Fields:**
- `gridSize`: 3 (3×3), 4 (4×4), or 5 (5×5)
- `requiredChains`: number of chains to find (1, 1, 2, 3, 4)
- `grid`: flat array of numbers (gridSize × gridSize length), row-major order
- `chains[]`: each chain has:
  - `indices`: array of grid indices forming the chain (in doubling order)
  - `values`: the actual numbers at those indices (each = 2× previous)

### Content Generation Constraints

1. Each chain has exactly the length specified (minimum 3, maximum 5)
2. `chains[i].values[j+1] === chains[i].values[j] * 2` for all consecutive pairs
3. No grid cell belongs to multiple chains
4. Chain values fit in reasonable range (avoid numbers > 1000 for readability)
5. Grid must contain distractor numbers that don't form valid chains
6. Total chain cells + distractor cells = gridSize × gridSize
7. Numbers must be positive integers

### Fallback Content

> **CRITICAL:** Chain values MUST be scattered randomly across the grid — never in consecutive positions. The player should have to search the entire grid to find chains.

```javascript
const fallbackContent = {
  rounds: [
    // Round 1: 3×3 grid, 1 chain of length 3 — chain: 5→10→20 at positions 2,4,7
    {
      gridSize: 3,
      requiredChains: 1,
      grid: [13, 17, 5, 23, 10, 29, 11, 20, 40],
      chains: [
        { indices: [2, 4, 7], values: [5, 10, 20] }
      ]
    },
    // Round 2: 3×3 grid, 1 chain of length 4 — chain: 3→6→12→24 at positions 1,5,8,3
    {
      gridSize: 3,
      requiredChains: 1,
      grid: [17, 3, 19, 24, 11, 6, 35, 23, 12],
      chains: [
        { indices: [1, 5, 8, 3], values: [3, 6, 12, 24] }
      ]
    },
    // Round 3: 4×4 grid, 2 chains
    //  Chain A: 7→14→28→56 at positions 3,9,12,6
    //  Chain B: 4→8→16 at positions 1,10,15
    {
      gridSize: 4,
      requiredChains: 2,
      grid: [23, 4, 19, 7, 31, 11, 56, 33, 17, 14, 8, 27, 28, 21, 39, 16],
      chains: [
        { indices: [3, 9, 12, 6], values: [7, 14, 28, 56] },
        { indices: [1, 10, 15], values: [4, 8, 16] }
      ]
    },
    // Round 4: 5×5 grid, 3 chains
    //  Chain A: 2→4→8→16 at positions 0,11,18,6
    //  Chain B: 5→10→20 at positions 3,14,22
    //  Chain C: 9→18→36 at positions 8,17,24
    {
      gridSize: 5,
      requiredChains: 3,
      grid: [2, 31, 23, 5, 33, 27, 16, 37, 9, 41, 13, 4, 35, 19, 10, 43, 29, 18, 8, 15, 47, 21, 20, 39, 36],
      chains: [
        { indices: [0, 11, 18, 6], values: [2, 4, 8, 16] },
        { indices: [3, 14, 22], values: [5, 10, 20] },
        { indices: [8, 17, 24], values: [9, 18, 36] }
      ]
    },
    // Round 5: 5×5 grid, 4 chains
    //  Chain A: 3→6→12 at positions 4,16,10
    //  Chain B: 1→2→4→8 at positions 20,7,13,2
    //  Chain C: 7→14→28 at positions 9,19,23
    //  Chain D: 5→10→20→40 at positions 1,15,21,12
    {
      gridSize: 5,
      requiredChains: 4,
      grid: [31, 5, 8, 33, 3, 27, 37, 2, 43, 7, 12, 17, 40, 4, 39, 10, 6, 29, 23, 14, 1, 20, 41, 28, 47],
      chains: [
        { indices: [4, 16, 10], values: [3, 6, 12] },
        { indices: [20, 7, 13, 2], values: [1, 2, 4, 8] },
        { indices: [9, 19, 23], values: [7, 14, 28] },
        { indices: [1, 15, 21, 12], values: [5, 10, 20, 40] }
      ]
    }
  ],
  totalLives: 3
};
```

### Fallback Content Verification

| Round | Grid | Chains | Chain Details | Distractor Count | Indices Scattered? |
|-------|------|--------|---------------|------------------|--------------------|
| 1 | 3×3 (9) | 1 | 5→10→20 (len 3) at [2,4,7] | 6 | ✅ Non-consecutive |
| 2 | 3×3 (9) | 1 | 3→6→12→24 (len 4) at [1,5,8,3] | 5 | ✅ Non-consecutive |
| 3 | 4×4 (16) | 2 | 7→14→28→56 (len 4) at [3,9,12,6], 4→8→16 (len 3) at [1,10,15] | 9 | ✅ Non-consecutive |
| 4 | 5×5 (25) | 3 | 2→4→8→16 (len 4) at [0,11,18,6], 5→10→20 (len 3) at [3,14,22], 9→18→36 (len 3) at [8,17,24] | 15 | ✅ Non-consecutive |
| 5 | 5×5 (25) | 4 | 3→6→12 (len 3) at [4,16,10], 1→2→4→8 (len 4) at [20,7,13,2], 7→14→28 (len 3) at [9,19,23], 5→10→20→40 (len 4) at [1,15,21,12] | 11 | ✅ Non-consecutive |

---

## Screens & HTML Structure

### Body HTML

```html
<body>
  <div id="app"></div>
</body>
```

Everything injected via `ScreenLayout.inject('app', { sections })`.

### ScreenLayout v2 Sections

```javascript
var layout = ScreenLayout.inject('app', {
  sections: {
    header: true,
    questionText: true,
    progressBar: true,
    playArea: true,
    transitionScreen: true
  }
});
```

### Question Text (always visible)

```html
<div class="question-text-container">
  <p class="instruction-text">Make a chain of doubles! <strong>🔗</strong></p>
  <p class="instruction-text-sub">A chain has a minimum of 3 and a maximum of 5 numbers!</p>
  <p class="instruction-text-sub">Complete all rounds without making any mistakes to win 3 stars!</p>
</div>
```

### Game Content (injected into #gameContent)

```html
<div id="game-screen" class="game-block">
  <div class="round-info" id="round-info">
    <span class="round-label" id="round-label">Round 1</span>
    <span class="chain-progress" id="chain-progress">Find 1 chain to win! 🔗</span>
  </div>
  <div class="chain-grid" id="chain-grid" data-signal-id="chain-grid"></div>
</div>
```

---

## CSS

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

/* === Question Text === */
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
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-text-primary, #000000);
  line-height: 1.4;
  margin-bottom: 4px;
}

/* === Game Block === */
.game-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
}

/* === Round Info === */
.round-info {
  display: none;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 340px;
  padding: 8px 0;
}
.round-label {
  font-size: var(--mathai-font-size-body);
  font-weight: 700;
  color: var(--mathai-text-primary, #000000);
}
.chain-progress {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
}

/* === Chain Grid === */
.chain-grid {
  display: grid;
  gap: 8px;
  width: 100%;
  max-width: 340px;
  justify-items: center;
}
.chain-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
.chain-grid.grid-4 { grid-template-columns: repeat(4, 1fr); }
.chain-grid.grid-5 { grid-template-columns: repeat(5, 1fr); }

/* === Grid Tile === */
.grid-tile {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  color: var(--mathai-text-primary, #000000);
  background: var(--mathai-white);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
}

/* Responsive font sizes per grid size */
.chain-grid.grid-3 .grid-tile { font-size: 24px; }
.chain-grid.grid-4 .grid-tile { font-size: 20px; }
.chain-grid.grid-5 .grid-tile { font-size: 16px; }

.grid-tile:hover:not(.completed):not(.selected) {
  border-color: var(--mathai-blue);
  background: var(--mathai-light-blue);
}
.grid-tile:active:not(.completed) {
  transform: scale(0.95);
}

/* Selected (currently building chain) — light blue highlight */
.grid-tile.selected {
  border-color: var(--mathai-blue);
  background: var(--mathai-light-blue);
  color: var(--mathai-blue);
}

/* Completed (chain found) — solid green, non-interactive */
.grid-tile.completed {
  border-color: var(--mathai-green);
  background: var(--mathai-light-green);
  color: var(--mathai-green);
  cursor: default;
  pointer-events: none;
}

/* Wrong (incorrect tap flash) — red, 600ms then removed */
.grid-tile.wrong {
  border-color: var(--mathai-red);
  background: var(--mathai-light-red);
  color: var(--mathai-red);
}

/* === Buttons === */
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

/* === Results Metrics === */
.results-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  margin: 16px auto;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--mathai-light-gray);
}
.metric-label {
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-gray);
}
.metric-value {
  font-size: var(--mathai-font-size-body);
  font-weight: 700;
  color: var(--mathai-text-primary, #000000);
}
```

---

## Script Loading Order (PART-002)

```html
<!-- 1. SentryConfig -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

<!-- 2. initSentry() function definition (inline) -->

<!-- 3. Sentry SDK (3 scripts, NO integrity) -->
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- 4. Init Sentry on load -->
<script>window.addEventListener('load', initSentry);</script>

<!-- 5-7. Game packages -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

---

## Game Flow

### Overview

```
DOMContentLoaded
  → waitForPackages()
  → FeedbackManager.init()
  → ScreenLayout.inject()
  → Build question text + game content HTML
  → InteractionManager, VisibilityTracker, ProgressBar, TransitionScreen
  → Audio preload (26 sounds)
  → PostMessage listener + game_ready
  → setupGame()
    → showRoundTransition(1)       [canPlayAudio() poll before first audio]
      → loadRound()                [gameplay]
        → handleTileTap()          [repeat per tap]
          → correct chain → chainComplete()
            → all chains found → roundComplete()
              → round 5 done → endGame('victory')
              → else → showRoundTransition(N+1)
          → incorrect tap → handleIncorrect()
            → lives=0 → handleGameOver()
```

### Detailed Step-by-Step

**1. setupGame()**
- Set `gameState.startTime`, `gameState.isActive = true`
- `progressBar.update(0, gameState.lives)`
- `trackEvent('game_start', 'game')`
- `signalCollector.recordViewEvent('screen_transition', { screen: 'gameplay', metadata: { transition_from: 'start' } })`
- Call `showRoundTransition(1)`

**2. showRoundTransition(roundNumber)** — async
- `gameState.phase = 'transition'`
- `try { FeedbackManager.sound.stopAll(); } catch(e) {}`
- Show TransitionScreen: title `'Round ' + roundNumber`, subtitle `'Find ' + requiredChains + ' chain(s) to win! 🔗'`, button `"Let's go!"` (round 1) or `"Next Round"` (round 2+), persist: true
- Button action: `FeedbackManager.sound.stopAll(); transitionScreen.hide(); loadRound();`
- **canPlayAudio() poll** (only needed for Round 1 — first audio in the game):
  ```javascript
  if (roundNumber === 1) {
    await new Promise(function(resolve) {
      if (FeedbackManager.canPlayAudio()) return resolve();
      var check = setInterval(function() {
        if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
      }, 200);
      setTimeout(function() { clearInterval(check); resolve(); }, 15000);
    });
  }
  ```
- Play audio: `await FeedbackManager.sound.play('rounds_sound_effect')`
- Play round VO: `await FeedbackManager.sound.play('round_' + roundNumber, { sticker: { image: STICKER_URLS['round_' + roundNumber], type: 'IMAGE_GIF' } })`

**3. loadRound()**
- Flush deferred endProblem if exists
- Get round data from `gameState.content.rounds[gameState.currentRound]`
- `signalCollector.startProblem('round_' + (gameState.currentRound + 1), { ... })`
- Reset per-round state: `chainsFound = 0`, `currentChainIndex = -1`, `completedChainIndices = new Set()`, `selectedTiles = []`, `completedTiles = new Set()`, `requiredChains` from round data
- Update round-info UI: round label, chain progress text
- Call `renderGrid(round)`
- `signalCollector.recordViewEvent('content_render', { ... })`
- `gameState.phase = 'playing'`

**4. renderGrid(round)**
- Clear `#chain-grid` innerHTML
- Add CSS class `grid-{round.gridSize}` for column count
- For each cell in `round.grid`:
  - Create `div.grid-tile` with `data-index`, `data-value`, `data-signal-id`
  - Set `textContent` to the number
  - Attach click handler: `handleTileTap(index)`

**5. handleTileTap(tileIndex)** — async
- Guards: `if (!gameState.isActive || gameState.isProcessing) return`
- Guard: `if (gameState.phase !== 'playing') return`
- Guard: `if (gameState.completedTiles.has(tileIndex)) return` (already in a completed chain)
- Guard: `if (gameState.chainsFound >= gameState.requiredChains) return` (all chains found, waiting for roundComplete)
- Get `tileValue` from grid data

**Flexible chain selection — no chain active (`currentChainIndex === -1`):**
- Player can start with ANY incomplete chain, not forced sequential order
- Loop through all chains: for each `ci` not in `completedChainIndices`, check if `tileIndex === round.chains[ci].indices[0]`
- If match found: set `currentChainIndex = ci`, add to `selectedTiles`, play `soundPartialCorrect` (fire-and-forget), highlight tile
- If no match: tile isn't the start of any incomplete chain → `handleIncorrect()`

**Chain active (`currentChainIndex >= 0`) — subsequent tiles:**
- Get current chain: `round.chains[gameState.currentChainIndex]`
- Get `expectedIndex = gameState.selectedTiles.length`
- Check if `tileIndex === currentChain.indices[expectedIndex]`
- If yes: add to `selectedTiles`, play `soundPartialCorrect` (fire-and-forget), highlight tile
- Check if chain is now complete: `selectedTiles.length === currentChain.indices.length`
  - If yes: `await chainComplete()`
- If no (wrong tile): `handleIncorrect()` (which resets `currentChainIndex = -1`)

**6. chainComplete()** — async, **non-blocking audio**
- `gameState.isProcessing = true`
- Mark all selected tiles as completed (add to `completedTiles`, add `.completed` CSS class, remove `.selected`)
- `gameState.completedChainIndices.add(currentChainIndex)`
- `gameState.chainsFound++`
- Clear `selectedTiles = []`
- `gameState.currentChainIndex = -1` — unlock, player picks next chain freely
- Record attempt (correct)
- `signalCollector.recordViewEvent('feedback_display', { feedback_type: 'correct', ... })`
- Update chain-progress text immediately (if remaining > 0)
- **`gameState.isProcessing = false`** — unlock interaction BEFORE audio plays

- **Fire-and-forget audio** (does NOT block interaction — user can start next chain immediately):
  ```javascript
  FeedbackManager.sound.play('soundChainComplete', {
    sticker: { image: STICKER_URLS.partial_correct, type: 'IMAGE_GIF' }
  }).then(function() {
    var remaining = gameState.requiredChains - gameState.chainsFound;
    if (remaining === 0) {
      return FeedbackManager.sound.play('vo_all_chains_found', {
        sticker: { image: STICKER_URLS.all_chains_found, type: 'IMAGE_GIF' }
      }).then(function() {
        if (!gameState.gameEnded) roundComplete();
      });
    } else {
      var voId = (gameState.chainsFound === 1)
        ? 'vo_first_chain_' + remaining + '_more'
        : 'vo_another_chain_' + remaining + '_more';
      return FeedbackManager.sound.play(voId, {
        sticker: { image: STICKER_URLS.chain_progress, type: 'IMAGE_GIF' }
      });
    }
  }).catch(function(err) { console.warn('chainComplete audio error:', err); });
  ```

- `gameState.pendingEndProblem = { id: 'round_' + (gameState.currentRound + 1), outcome: { correct: true, ... } }`

> **Design note:** All chainComplete audio is fire-and-forget. `isProcessing` is released immediately after state updates so the player can start tapping the next chain while audio plays in background. The `chainsFound >= requiredChains` guard in `handleTileTap` prevents stray taps after all chains are found.

**7. handleIncorrect()** — async
- `gameState.isProcessing = true`
- `gameState.lives--`
- `progressBar.update(gameState.currentRound, gameState.lives)`
- Flash all selected tiles as `.wrong` for 600ms, then remove class + `.selected`
- Clear `selectedTiles = []`
- `gameState.currentChainIndex = -1` — reset so player can pick any chain again
- Record attempt (incorrect)
- `trackEvent('life_lost', 'game', { livesRemaining: gameState.lives })`
- `signalCollector.recordViewEvent('feedback_display', { feedback_type: 'incorrect', ... })`

- If `gameState.lives <= 0`:
  - `gameState.pendingEndProblem = { ... }`
  - `gameState.isProcessing = false`
  - `await handleGameOver()`
- Else:
  - Play incorrect SFX: `await FeedbackManager.sound.play('soundIncorrect', { sticker: { image: STICKER_URLS.incorrect, type: 'IMAGE_GIF' } })`
  - Play life lost: `await FeedbackManager.sound.play('soundLifeLost', { sticker: { image: STICKER_URLS.life_lost, type: 'IMAGE_GIF' } })`
  - `gameState.isProcessing = false`

**8. roundComplete()**
- `gameState.currentRound++`
- `gameState.score++`
- `progressBar.update(gameState.currentRound, gameState.lives)`
- `trackEvent('round_complete', 'game', { round: gameState.currentRound, livesRemaining: gameState.lives })`
- `signalCollector.recordCustomEvent('round_solved', { round: gameState.currentRound, correct: true })`

- If `gameState.currentRound >= gameState.totalRounds`:
  - `endGame('victory')`
- Else:
  - `showRoundTransition(gameState.currentRound + 1)`

**9. endGame(reason)** — async (victory path)
- Guard: `if (gameState.gameEnded) return`
- `gameState.gameEnded = true; gameState.isActive = false`
- `gameState.duration_data.currentTime = new Date().toISOString()`
- Calculate metrics: accuracy, totalTime, stars = gameState.lives, tries = computeTries()
- `trackEvent('game_end', 'game', { ... })`
- Flush pendingEndProblem
- `signalCollector.recordViewEvent('screen_transition', { screen: 'results', ... })` — **BEFORE seal**
- `var signalPayload = signalCollector.seal()` — **AFTER all events**
- **SCREEN-FIRST:** `showResults(metrics, 'victory')`
- **postMessage BEFORE audio:** `window.parent.postMessage({ type: 'game_complete', ... })`
- **Play audio AFTER screen:**
  ```javascript
  if (stars === 3) {
    await FeedbackManager.sound.play('soundVictory', { sticker: { image: STICKER_URLS.victory, type: 'IMAGE_GIF' } });
    await FeedbackManager.sound.play('vo_victory_3_stars', { sticker: { image: STICKER_URLS.victory, type: 'IMAGE_GIF' } });
  } else if (stars === 2) {
    await FeedbackManager.sound.play('game_complete_sound', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } });
    await FeedbackManager.sound.play('vo_victory_2_stars', { sticker: { image: STICKER_URLS.complete_2_stars, type: 'IMAGE_GIF' } });
  } else if (stars === 1) {
    await FeedbackManager.sound.play('game_complete_sound', { sticker: { image: STICKER_URLS.game_complete, type: 'IMAGE_GIF' } });
    await FeedbackManager.sound.play('vo_victory_1_star', { sticker: { image: STICKER_URLS.complete_1_star, type: 'IMAGE_GIF' } });
  }
  ```
- **Guarded cleanup:**
  ```javascript
  if (gameState.gameEnded) {
    if (progressBar) { progressBar.destroy(); progressBar = null; }
    if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
    try { FeedbackManager.sound.stopAll(); } catch(e) {}
  }
  ```

**10. handleGameOver()** — async
- Guard: `if (gameState.gameEnded) return`
- `gameState.gameEnded = true; gameState.isActive = false`
- Calculate metrics (stars = 0)
- `signalCollector.recordViewEvent(...)` — **BEFORE seal**
- `signalCollector.seal()`
- **SCREEN-FIRST:** `showResults(metrics, 'game_over')`
- **postMessage BEFORE audio**
- **Play audio:**
  ```javascript
  await FeedbackManager.sound.play('soundGameOver', { sticker: { image: STICKER_URLS.game_over_sfx, type: 'IMAGE_GIF' } });
  var voId = 'vo_game_over_' + gameState.currentRound + '_round' + (gameState.currentRound !== 1 ? 's' : '');
  await FeedbackManager.sound.play(voId, { sticker: { image: STICKER_URLS.game_over_vo, type: 'IMAGE_GIF' } });
  ```
- **Guarded cleanup** (same pattern as endGame)

**11. showResults(metrics, reason)**
- Build `metricsHTML` with: Rounds Completed (X/5), Wrong Attempts, Accuracy
- `var buttonText = 'Play Again'`
- `transitionScreen.show({ stars, title: reason === 'victory' ? 'Great Job!' : 'Game Over', content: metricsHTML, buttons: [{ text: buttonText, action: function() { try { FeedbackManager.sound.stopAll(); } catch(e) {} restartGame(); } }], persist: true })`

**12. restartGame()**
- Push session to history
- Reset ALL gameState fields (currentRound, score, lives, attempts, events, chainsFound, selectedTiles, completedTiles, completedChainIndices, currentChainIndex = -1, isProcessing, gameEnded, pendingEndProblem, duration_data, phase)
- Recreate: signalCollector, progressBar, visibilityTracker
- Call `setupGame()`

---

## Audio Sequence Table

| # | Moment | Trigger | Sound ID | Sticker | Await? | Notes |
|---|--------|---------|----------|---------|--------|-------|
| 1 | Round jingle | showRoundTransition(N) | `rounds_sound_effect` | — | Yes | Plays before round VO |
| 2 | Round N VO | showRoundTransition(N) | `round_N` | `STICKER_URLS.round_N` | Yes | Sequential after jingle |
| 3 | Tile tap (valid) | handleTileTap() | `soundPartialCorrect` | — | **No** | Fire-and-forget on each valid partial tile selection |
| 4 | Chain complete SFX | chainComplete() | `soundChainComplete` | `STICKER_URLS.partial_correct` | **No** | Fire-and-forget; does NOT block interaction |
| 5 | First chain, 3 more | chainComplete() | `vo_first_chain_3_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 6 | First chain, 2 more | chainComplete() | `vo_first_chain_2_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 7 | First chain, 1 more | chainComplete() | `vo_first_chain_1_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 8 | Another chain, 3 more | chainComplete() | `vo_another_chain_3_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 9 | Another chain, 2 more | chainComplete() | `vo_another_chain_2_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 10 | Another chain, 1 more | chainComplete() | `vo_another_chain_1_more` | `STICKER_URLS.chain_progress` | **No** | Fire-and-forget .then() after soundChainComplete |
| 11 | All chains found | chainComplete() | `vo_all_chains_found` | `STICKER_URLS.all_chains_found` | **No** | Fire-and-forget; triggers roundComplete() in .then() callback |
| 12 | Incorrect tap SFX | handleIncorrect() | `soundIncorrect` | `STICKER_URLS.incorrect` | Yes | Before life lost |
| 13 | Life lost SFX | handleIncorrect() | `soundLifeLost` | `STICKER_URLS.life_lost` | Yes | Sequential after incorrect |
| 14 | Game over SFX | handleGameOver() | `soundGameOver` | `STICKER_URLS.game_over_sfx` | Yes | Screen shown first |
| 15 | Game over VO | handleGameOver() | `vo_game_over_N_round(s)` | `STICKER_URLS.game_over_vo` | Yes | N = rounds completed |
| 16 | Victory SFX (3★) | endGame('victory') | `soundVictory` | `STICKER_URLS.victory` | Yes | Screen shown first |
| 17 | Victory VO (3★) | endGame('victory') | `vo_victory_3_stars` | `STICKER_URLS.victory` | Yes | Sequential after SFX |
| 18 | Complete SFX (2★) | endGame('victory') | `game_complete_sound` | `STICKER_URLS.game_complete` | Yes | Screen shown first |
| 19 | Complete VO (2★) | endGame('victory') | `vo_victory_2_stars` | `STICKER_URLS.complete_2_stars` | Yes | Sequential after SFX |
| 20 | Complete SFX (1★) | endGame('victory') | `game_complete_sound` | `STICKER_URLS.game_complete` | Yes | Screen shown first |
| 21 | Complete VO (1★) | endGame('victory') | `vo_victory_1_star` | `STICKER_URLS.complete_1_star` | Yes | Sequential after SFX |

---

## Signal Events

### Game Lifecycle Events

| Event | Target | When Fired |
|-------|--------|------------|
| `game_start` | game | setupGame() |
| `game_end` | game | endGame() / handleGameOver() |
| `game_paused` | system | VisibilityTracker onInactive |
| `game_resumed` | system | VisibilityTracker onResume |

### Game-Specific Events

| Event | Target | When Fired | Data |
|-------|--------|------------|------|
| `tile_tap` | grid | handleTileTap() | tileIndex, tileValue, selectedCount |
| `chain_complete` | grid | chainComplete() | chainIndex, chainValues, chainsFound, chainsRemaining |
| `incorrect_tap` | grid | handleIncorrect() | tileIndex, tileValue, expectedValue, livesRemaining |
| `round_complete` | game | roundComplete() | round, livesRemaining |
| `life_lost` | game | handleIncorrect() | livesRemaining |

### SignalCollector View Events

| viewType | When Emitted | Key Data |
|----------|-------------|----------|
| `screen_transition` | setupGame, endGame, handleGameOver | screen, metadata.transition_from |
| `content_render` | loadRound | screen: 'gameplay', content_snapshot: { round, gridSize, requiredChains, chainLengths } |
| `visual_update` | handleTileTap (select) | type: 'tile_selected', tileIndex, selectedCount |
| `visual_update` | chainComplete() | type: 'chain_completed', chainIndex, completedCount |
| `visual_update` | handleIncorrect() | type: 'selection_cleared', livesRemaining |
| `feedback_display` | chainComplete() | feedback_type: 'correct', chainValues |
| `feedback_display` | handleIncorrect() | feedback_type: 'incorrect', tileValue, expectedValue |

### SignalCollector Custom Events

| Event | When Emitted | Data |
|-------|-------------|------|
| `round_solved` | roundComplete() | round, correct: true, chainsFound |
| `round_solved` | handleGameOver() | round, correct: false, reason: 'lives_exhausted' |
| `visibility_hidden` | VisibilityTracker onInactive | — |
| `visibility_visible` | VisibilityTracker onResume | — |

### SignalCollector Problem Lifecycle

| Method | When Called | Details |
|--------|-----------|---------|
| `startProblem('round_N', { ... })` | loadRound() | round_number, gridSize, requiredChains, chains |
| `endProblem('round_N', outcome)` | loadRound() (deferred flush) or endGame/handleGameOver | outcome: { correct, chainsFound } |
| `seal()` | endGame() / handleGameOver() | Returns `{ events, signals, metadata }` — called AFTER all recordViewEvent, BEFORE postMessage |

---

## Initialization (DOMContentLoaded)

```javascript
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForPackages();
    await FeedbackManager.init();

    // SignalCollector
    signalCollector = new SignalCollector({
      sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(),
      studentId: window.gameVariableState?.studentId || null,
      templateId: gameState.gameId || null
    });
    window.signalCollector = signalCollector;

    // ScreenLayout v2
    var layout = ScreenLayout.inject('app', {
      sections: { header: true, questionText: true, progressBar: true, playArea: true, transitionScreen: true }
    });

    // Question text
    var questionSlot = document.getElementById(layout.questionText);
    if (questionSlot) {
      questionSlot.innerHTML = '<div class="question-text-container">...</div>';
    }

    // Game content
    var gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = '<div id="game-screen" class="game-block">...</div>';

    // InteractionManager
    interactionManager = new InteractionManager({
      selector: '.chain-grid',
      disableOnAudioFeedback: false,
      disableOnEvaluation: true
    });
    window.interactionManager = interactionManager;

    // VisibilityTracker (no timer references)
    var visibilityTrackerConfig = {
      onInactive: function() {
        var inactiveStart = Date.now();
        gameState.duration_data.inActiveTime.push({ start: inactiveStart });
        if (signalCollector) { signalCollector.pause(); signalCollector.recordCustomEvent('visibility_hidden', {}); }
        FeedbackManager.sound.pause();
        FeedbackManager.stream.pauseAll();
        trackEvent('game_paused', 'system');
      },
      onResume: function() {
        var lastInactive = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
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
    window.visibilityTrackerConfig = visibilityTrackerConfig;

    // ProgressBar
    createProgressBar();

    // TransitionScreen
    transitionScreen = new TransitionScreenComponent({ autoInject: true });

    // Audio preload (26 sounds — every ID used in sound.play)
    try {
      await FeedbackManager.sound.preload([ /* ... full list ... */ ]);
    } catch(e) { console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2)); }

    // StickerComponent.configure() is NOT needed — all stickers passed as inline objects
    // via STICKER_URLS constant in sound.play() calls

    // PostMessage listener BEFORE game_ready
    if (!gameState.content) gameState.content = fallbackContent;
    gameState.totalRounds = gameState.content.rounds.length;
    window.addEventListener('message', handlePostMessage);
    window.parent.postMessage({ type: 'game_ready' }, '*');

    // Start game (NO welcome screen — direct to Round 1)
    setupGame();
  } catch(e) {
    console.error('Init error:', JSON.stringify({ error: e.message }, null, 2));
    if (typeof Sentry !== 'undefined') Sentry.captureException(e);
  }
});
```

---

## Debug Functions (PART-012)

```javascript
window.debugGame = function() { /* dump gameState */ };
window.debugAudio = function() { /* FeedbackManager status */ };
window.testAudio = async function(id) { /* play sound by ID */ };
window.testPause = function() { console.log('No timer in this game — audio/signals pause via VisibilityTracker'); };
window.testResume = function() { console.log('No timer in this game — audio/signals resume via VisibilityTracker'); };
window.debugSignals = function() { /* signalCollector.debug() */ };
window.verifySentry = function() { /* check Sentry SDK */ };
window.testSentry = function() { /* send test error */ };
window.jumpToRound = function(n) { /* jump to round N for testing */ };
```

---

## Verification Checklist

### Structural
- [ ] `<!DOCTYPE html>`, `<meta charset="UTF-8">`, viewport meta
- [ ] SentryConfig → Sentry SDK → FeedbackManager → Components → Helpers (exact order)
- [ ] Sentry release: `'game-doubles-chain@1.0.0'`
- [ ] Body: only `<div id="app"></div>` — no manual layout divs
- [ ] `data-signal-id` on interactive elements (grid tiles)

### Layout & CSS
- [ ] `html, body { height: 100dvh }` — NOT 100vh
- [ ] `.mathai-layout-root { max-width: 480px; margin: 0 auto; }`
- [ ] No `display: !important` on `.mathai-layout-playarea`
- [ ] Touch targets ≥ 44×44px on grid tiles
- [ ] Grid responsive: 3×3, 4×4, 5×5 via CSS grid classes
- [ ] All colors use `var(--mathai-*)` CSS variables

### Functional
- [ ] `waitForPackages()` checks FeedbackManager, VisibilityTracker, SignalCollector (NO TimerComponent)
- [ ] `FeedbackManager.init()` awaited, no `unlock()` call after
- [ ] No `let timer = null` declaration — game has no timer
- [ ] `isProcessing` guard at top of handleTileTap
- [ ] `isActive` guard at top of handleTileTap
- [ ] `gameEnded` guard at top of endGame and handleGameOver
- [ ] `totalRounds` synced from `content.rounds.length`

### Audio
- [ ] 26 sounds preloaded — every ID has a `sound.play(id)` call
- [ ] No `playDynamicFeedback` — all audio is preloaded static
- [ ] `canPlayAudio()` poll before Round 1 audio (no welcome screen)
- [ ] Stickers passed as `{ sticker: { image: URL, type: 'IMAGE_GIF' } }` in sound.play()
- [ ] No `StickerComponent.configure()` — inline objects only
- [ ] Sound.stopAll() in round transition button actions
- [ ] Screen-first-then-audio on endGame/handleGameOver

### Signal & PostMessage Ordering
- [ ] `signalCollector.endProblem()` flushed before seal
- [ ] `signalCollector.recordViewEvent('screen_transition')` BEFORE seal
- [ ] `signalCollector.seal()` BEFORE postMessage
- [ ] `postMessage` BEFORE audio await
- [ ] Cleanup guarded by `if (gameState.gameEnded)`

### Results & Restart
- [ ] Button text: "Play Again"
- [ ] restartGame resets ALL state, recreates signalCollector, progressBar, visibilityTracker
- [ ] sessionHistory preserved across restarts

### Game-Specific
- [ ] Grid renders correctly for 3×3, 4×4, 5×5
- [ ] Chain validation: each tile must be 2× previous in exact order from content
- [ ] Chain auto-completes when all tiles in chain selected
- [ ] Completed tiles turn green, non-interactive
- [ ] Wrong tap: flash red 600ms, clear selection, decrement life
- [ ] Last life lost: skip incorrect SFX, go directly to handleGameOver
- [ ] Chain progress VO: first_chain vs another_chain, 1/2/3_more
- [ ] All chains found VO plays before round advance
- [ ] Stars = lives remaining (0, 1, 2, 3)
- [ ] Game over VO uses correct rounds-completed variant (0-4)

### Rules Compliance
- [ ] RULE-001: All functions in global scope (not inside DOMContentLoaded)
- [ ] RULE-002: Every function with `await` is declared `async`
- [ ] RULE-003: Every async operation in try/catch
- [ ] RULE-004: All console.log uses `JSON.stringify(obj, null, 2)`
- [ ] RULE-005: Cleanup destroys progressBar, visibilityTracker, stops audio
- [ ] RULE-006: No `new Audio()`, no `setInterval` timers, no `SubtitleComponent.show()`, no `StickerComponent.configure()`
- [ ] RULE-007: Everything in single `index.html`
