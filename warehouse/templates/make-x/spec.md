# Make-X: Target Sum Math Game — Assembly Book

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

---

## 1. Game Identity

- **Title:** Reach the Target Sum
- **Game ID:** make-x
- **Type:** standard
- **Description:** A fast-paced, level-based math addition game where the user selects combinations of number tiles (or math expression tiles) that add up to a specific target sum. 9 rounds across 3 levels, 3 lives, star rating based on average per-round speed.

---

## 2. Parts Selected

| Part ID  | Name                           | Included        | Config/Notes                                                                 |
| -------- | ------------------------------ | --------------- | ---------------------------------------------------------------------------- |
| PART-001 | HTML Shell                     | YES             | Title: "Reach the Target Sum"                                                |
| PART-002 | Package Scripts                | YES             | Standard 4 scripts (Sentry + 3 game packages)                               |
| PART-003 | waitForPackages                | YES             | Checks: FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector  |
| PART-004 | Initialization Block           | YES             | Includes ScreenLayout, Timer, InteractionManager                             |
| PART-005 | VisibilityTracker              | YES             | Pauses timer, audio, signalCollector                                         |
| PART-006 | TimerComponent                 | YES             | `timerType: 'increase'`, `startTime: 0`, `endTime: 100000`, `format: 'min'` |
| PART-007 | Game State Object              | YES             | Custom fields: lives, totalLives, currentLevel, selectedTiles, roundTimes, roundStartTime, voGameStartPlayed |
| PART-008 | PostMessage Protocol           | YES             | game_ready + game_init + game_complete                                       |
| PART-009 | Attempt Tracking               | YES             | validationType: 'function'                                                   |
| PART-010 | Event Tracking & SignalCollector| YES            | Custom events: tile_select, tile_deselect, correct_answer, incorrect_answer, life_lost, level_transition |
| PART-011 | End Game & Metrics             | YES             | Custom star logic: time-based (avg ≤3s=3★, 3-5s=2★, >5s=1★)               |
| PART-012 | Debug Functions                | YES             | Standard 6 debug functions                                                   |
| PART-013 | Validation Fixed               | NO              | —                                                                            |
| PART-014 | Validation Function            | YES             | Rule: sum of evaluated selected tiles === target                             |
| PART-015 | Validation LLM                 | NO              | —                                                                            |
| PART-016 | StoriesComponent               | NO              | —                                                                            |
| PART-017 | Feedback Integration           | YES             | 14 preloaded sounds + dynamic TTS "Make {target}" + stickers                |
| PART-018 | Case Converter                 | NO              | —                                                                            |
| PART-019 | Results Screen (v2)            | YES             | Via TransitionScreen content slot — custom metrics: avg time, stars          |
| PART-020 | CSS Variables & Colors         | YES             | Standard mathai variables                                                    |
| PART-021 | Screen Layout CSS (v2)         | YES             | v2 CSS reset only                                                            |
| PART-022 | Game Buttons                   | YES             | No Submit/Retry/Next — auto-validation on tap                               |
| PART-023 | ProgressBar Component (v2)     | YES             | totalRounds: 9, totalLives: 3                                                |
| PART-024 | TransitionScreen Component (v2)| YES            | Screens: welcome, level-intro (x3), game-complete, game-over + AUDIO        |
| PART-025 | ScreenLayout Component (v2)    | YES             | sections: header + questionText + progressBar + playArea + transitionScreen  |
| PART-026 | Anti-Patterns                  | YES (REFERENCE) | Verification checklist                                                       |
| PART-027 | Play Area Construction         | YES             | Layout: flex-wrapped pill tiles                                              |
| PART-028 | InputSchema Patterns           | YES             | Schema type: nested levels with rounds                                       |
| PART-029 | Story-Only Game                | NO              | —                                                                            |
| PART-030 | Sentry Error Tracking          | YES             | Standard Sentry integration                                                  |
| PART-031 | API Helper                     | NO              | —                                                                            |
| PART-032 | AnalyticsManager               | NO              | —                                                                            |
| PART-033 | Interaction Patterns           | NO              | —                                                                            |
| PART-034 | Variable Schema Serialization  | YES (POST_GEN)  | Serializes Section 4 to inputSchema.json                                     |
| PART-035 | Test Plan Generation           | YES (POST_GEN)  | Generates tests.md after HTML                                                |
| PART-037 | Playwright Testing             | YES (POST_GEN)  | Ralph loop generates tests + fix cycle                                       |
| PART-038 | InteractionManager             | YES             | selector: '.tile-grid', disableOnAudioFeedback: false                        |

---

## 3. Game State

```javascript
window.gameState = {
  // MANDATORY (from PART-007):
  currentRound: 0,
  totalRounds: 9,
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
  lives: 3,                 // Current lives (decrements on wrong answer)
  totalLives: 3,            // Starting lives count (for metrics)
  currentLevel: 1,          // Current level (1-3), derived from currentRound
  selectedTiles: [],         // Array of indices of currently selected tiles
  roundTimes: [],            // Array of seconds taken per completed round
  roundStartTime: null,      // Timestamp when current round started (for per-round timing)
  isProcessing: false,       // Guard: prevents rapid double-taps during feedback/transitions
  voGameStartPlayed: false,  // Guard: only play welcome VO once
  gameId: 'make-x',
  contentSetId: null
};

let timer = null;
let visibilityTracker = null;
let signalCollector = null;
let progressBar = null;
let transitionScreen = null;
let currentDynamicAudio = null;  // Reference to stop dynamic "Make X" audio on early tap
```

---

## 4. Input Schema

```json
{
  "type": "object",
  "properties": {
    "rounds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "level": { "type": "integer", "minimum": 1, "maximum": 3 },
          "round": { "type": "integer", "minimum": 1, "maximum": 9 },
          "target": { "type": "integer" },
          "tiles": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Each tile is a string — plain number '40' or expression '40+50'. Evaluated at runtime."
          }
        },
        "required": ["level", "round", "target", "tiles"]
      },
      "minItems": 9,
      "maxItems": 9
    }
  },
  "required": ["rounds"]
}
```

### Content Authoring Constraints

1. **Proper subset rule:** For every round, at least one proper subset of tiles (not all tiles) must sum exactly to the target. This ensures the user must think about which tiles to pick, not just select everything.
2. **Multiple valid solutions are intentional.** A round may have more than one combination of tiles that sums to the target. The game accepts any valid combination — the learning goal is number sense, not finding a unique answer.
3. **Expression tile evaluation:** Tiles containing `+` (e.g., `"40+50"`) are evaluated by splitting on `+` and summing the integer parts. All tile strings must be valid under this rule — only non-negative integers joined by `+`.
4. **No tile should equal the target alone** — at least 2 tiles must be selected for a correct answer. This ensures the addition concept is exercised.

### Content Set Generation Guidance

Generate **3 content sets** (easy, medium, hard). Each set has 9 rounds across 3 levels.

| Dimension          | Easy                         | Medium                          | Hard                              |
| ------------------ | ---------------------------- | ------------------------------- | --------------------------------- |
| Target range       | 50–120                       | 100–200                         | 150–300                           |
| Tiles per round    | 4–5                          | 5–7                             | 6–8                               |
| Expression tiles   | None (Level 1–3 all plain)   | Level 2–3 include 1–2 each     | Level 2: 1–2, Level 3: 2–3       |
| Distractor density | Low (most tiles are useful)  | Medium                          | High (more tiles that don't help) |
| Number granularity | Multiples of 10 only         | Multiples of 10                 | Mix of multiples of 5 and 10     |

**Constraints all sets must satisfy:**
- Every round has at least one valid proper subset summing to target (see constraint #1 above)
- No single tile equals the target
- All expression tiles are valid (non-negative integers joined by `+`)
- Levels 1→2→3 should feel progressively harder within each set
- No duplicate tiles within the same round (identical display strings)

### Fallback Test Content

```javascript
var fallbackContent = {
  rounds: [
    { level: 1, round: 1, target: 90,  tiles: ['20', '30', '40', '50', '60'] },
    { level: 1, round: 2, target: 110, tiles: ['10', '30', '30', '40', '70', '80'] },
    { level: 1, round: 3, target: 120, tiles: ['20', '40', '50', '60', '70', '80'] },
    { level: 2, round: 4, target: 140, tiles: ['30', '40', '50', '70', '80', '40+50'] },
    { level: 2, round: 5, target: 130, tiles: ['20', '30', '50', '60', '70', '80', '30+30'] },
    { level: 2, round: 6, target: 160, tiles: ['30', '40', '50', '70', '90', '20+20', '60+30'] },
    { level: 3, round: 7, target: 150, tiles: ['20', '30', '40', '60', '70', '80', '50+40', '30+20'] },
    { level: 3, round: 8, target: 180, tiles: ['30', '40', '50', '50', '70', '80', '60+40', '40+30'] },
    { level: 3, round: 9, target: 170, tiles: ['20', '30', '40', '60', '80', '90', '50+50', '70+20'] }
  ]
};
```

---

## 5. Screens & HTML Structure (v2)

### Body HTML

```html
<div id="app"></div>
```

### ScreenLayout v2 Init

```javascript
ScreenLayout.inject('app', {
  sections: {
    header: true,              // Timer HUD
    questionText: true,        // Game instructions
    progressBar: true,         // Round X/9 + lives
    playArea: true,            // Tile grid
    transitionScreen: true     // Welcome/level/results/game-over
  },
  styles: {
    header: { background: 'var(--mathai-white, #ffffff)' },
    questionText: {
      padding: '16px 20px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%'
    },
    progressBar: {
      padding: '0 20px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '8px',
      width: '100%'
    }
  }
});
```

### Timer Injection (into header slot)

```javascript
// Inject timer container into header
var headerSlot = document.getElementById('mathai-header-slot');
if (headerSlot) {
  headerSlot.innerHTML = '<div id="timer-container" style="display:flex;justify-content:center;align-items:center;padding:8px 0;"></div>';
}
```

### Play Area Content (injected into #gameContent via JS)

```javascript
var gameContent = document.getElementById('gameContent');
gameContent.innerHTML =
  '<div class="game-play-area">' +
    '<div class="target-display" id="target-display">' +
      '<h2 class="target-title" id="target-title">Make Sum <span id="target-value">0</span></h2>' +
    '</div>' +
    '<div class="tile-grid" id="tile-grid"></div>' +
  '</div>';
```

### Question Text Content

```javascript
function updateInstructions() {
  var slot = document.getElementById('mathai-question-slot');
  if (!slot) return;
  slot.innerHTML =
    '<div class="instruction-area">' +
      '<p class="instruction-text">Tap & select to reach the target sum.</p>' +
      '<p class="instruction-text instruction-sub">Tap to select, tap again to de-select.</p>' +
      '<p class="instruction-text instruction-highlight">Complete all <strong>9</strong> rounds with an average speed of <strong>3 seconds</strong> or less per round to win 3 stars.</p>' +
    '</div>';
}
```

### Transition Screen Usage

#### Welcome Screen

```javascript
async function showWelcomeScreen() {
  // Pause and reset timer (prevents stale timer running during transition)
  if (timer) { timer.pause(); timer.reset(); }

  var questionSlot = document.getElementById('mathai-question-slot');
  if (questionSlot) questionSlot.style.display = '';

  transitionScreen.show({
    title: 'Reach the Target Sum',
    buttons: [{
      text: 'Start Game',
      type: 'primary',
      action: function() { handleStartGame(); }
    }],
    persist: true
  });

  // Play welcome VO (once) — poll for audio unlock first
  if (!gameState.voGameStartPlayed) {
    gameState.voGameStartPlayed = true;
    try {
      // Wait for init()'s permission popup to be clicked (audio unlock)
      // Do NOT call FeedbackManager.unlock() — it races with init's fire-and-forget unlock and rejects
      await new Promise(function(resolve) {
        if (FeedbackManager.canPlayAudio()) return resolve();
        var check = setInterval(function() {
          if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
        }, 200);
        setTimeout(function() { clearInterval(check); resolve(); }, 15000);
      });
      await FeedbackManager.sound.play('vo_game_start', {
        sticker: {
          image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-155.gif',
          duration: 5,
          type: 'IMAGE_GIF'
        }
      });
    } catch (e) { console.error('[make-x] Welcome VO error:', e.message); }
  }
}
```

#### Level Intro Screen

```javascript
async function showLevelTransition(level) {
  // Pause and reset timer (prevents stale timer running during transition)
  if (timer) { timer.pause(); timer.reset(); }

  var subtitleText = '';
  if (level > 1) {
    var avgSoFar = gameState.roundTimes.length > 0
      ? Math.round(gameState.roundTimes.reduce(function(a, b) { return a + b; }, 0) / gameState.roundTimes.length)
      : 0;
    subtitleText = 'Average time per round so far: ' + avgSoFar + ' seconds';
  }

  transitionScreen.show({
    title: 'Level ' + level,
    subtitle: subtitleText || undefined,
    buttons: [{
      text: "I'm ready! \ud83d\udcaa",
      type: 'primary',
      action: function() { handleLevelReady(); }
    }],
    persist: true
  });

  // Play level VO with sticker
  var stickerUrls = {
    1: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-152.gif',
    2: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-149.gif',
    3: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-145.gif'
  };

  try {
    await FeedbackManager.sound.play('vo_level_start_' + level, {
      sticker: {
        image: stickerUrls[level],
        duration: 5,
        type: 'IMAGE_GIF'
      }
    });
  } catch (e) { console.error('Level VO error:', JSON.stringify({ error: e.message }, null, 2)); }
}
```

#### Game Complete Screen

```javascript
async function showGameComplete() {
  var avgTime = gameState.roundTimes.length > 0
    ? Math.round(gameState.roundTimes.reduce(function(a, b) { return a + b; }, 0) / gameState.roundTimes.length)
    : 0;

  var stars = avgTime <= 3 ? 3 : avgTime <= 5 ? 2 : 1;

  // End game immediately — metrics are final at this point
  endGame(stars, avgTime);

  var stickerUrls = {
    3: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-93.gif',
    2: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-90.gif',
    1: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-88.gif'
  };

  var metricsHTML =
    '<div class="results-metrics">' +
      '<div class="metric-row">' +
        '<span class="metric-label">Average time taken to complete each round</span>' +
      '</div>' +
      '<div class="metric-value-large">' + avgTime + ' seconds</div>' +
      '<p class="metric-hint">Complete each round in 3 seconds or less for 3 stars</p>' +
    '</div>';

  // Show victory screen FIRST, then play audio
  transitionScreen.show({
    stars: stars,
    title: 'Game Complete! \ud83c\udf8a',
    content: metricsHTML,
    buttons: [
      {
        text: stars >= 3 ? 'Play Again' : 'Retry for more stars',
        type: 'secondary',
        action: function() { restartGame(); }
      }
    ],
    persist: true
  });

  // Play victory audio sequence after screen is visible
  try {
    await FeedbackManager.sound.play('sound_game_victory', {
      sticker: {
        image: stickerUrls[stars],
        duration: 5,
        type: 'IMAGE_GIF'
      }
    });
    await FeedbackManager.sound.play('vo_victory_stars_' + stars, {
      sticker: {
        image: stickerUrls[stars],
        duration: 5,
        type: 'IMAGE_GIF'
      }
    });
  } catch (e) { console.error('Victory audio error:', JSON.stringify({ error: e.message }, null, 2)); }
}
```

#### Game Over Screen

```javascript
async function showGameOver() {
  // End the game immediately (0 stars, no avg time — game over is a loss)
  endGame(0, 0);

  // Show game over screen FIRST, then play audio
  transitionScreen.show({
    icons: ['\ud83d\ude14'],
    iconSize: 'large',
    title: 'Game Over',
    subtitle: 'You ran out of lives! \ud83d\udc94',
    buttons: [{
      text: 'Try Again',
      type: 'primary',
      action: function() { restartGame(); }
    }],
    persist: true
  });

  // Play game over audio after screen is visible
  try {
    await FeedbackManager.sound.play('sound_game_over', {
      sticker: {
        image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758711007491-96.gif',
        duration: 5,
        type: 'IMAGE_GIF'
      }
    });
  } catch (e) { console.error('Game over audio error:', JSON.stringify({ error: e.message }, null, 2)); }
}
```

---

## 6. CSS

```css
/* === RESET === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100dvh; overflow: hidden; }
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-white);
  color: var(--mathai-text-primary);
}

/* === LAYOUT ROOT (constrain game width) === */
.mathai-layout-root {
  max-width: 480px;
  margin: 0 auto;
}

/* === PLAY AREA LAYOUT (ScreenLayout v2 override) === */
/* NOTE: display must NOT use !important — TransitionScreen toggles
   #gameContent display:none/block to swap between game and transitions. */
.mathai-layout-playarea {
  display: flex;
  flex-direction: column !important;
  align-items: center !important;
  padding: 0 20px 32px !important;
}

.mathai-ts-screen.active {
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  padding-top: 16px;
}

.mathai-ts-card {
  min-height: 50dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* === GAME PLAY AREA === */
.game-play-area {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
}

/* === TARGET DISPLAY === */
.target-display {
  text-align: center;
  padding: 16px;
}

.target-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--mathai-primary);
  font-family: var(--mathai-font-family);
}

#target-value {
  color: var(--mathai-blue);
}

/* === TILE GRID === */
.tile-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 400px;
  width: 100%;
}

/* === INDIVIDUAL TILE === */
.tile {
  padding: 14px 24px;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 24px;
  cursor: pointer;
  font-size: var(--mathai-font-size-body);
  font-weight: 600;
  font-family: var(--mathai-font-family);
  background: var(--mathai-white);
  color: var(--mathai-text-primary);
  transition: all 0.2s ease;
  min-width: 64px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.tile:active {
  transform: scale(0.95);
}

/* Tile states */
.tile.selected {
  background: var(--mathai-cell-bg-yellow);
  border-color: #f0c800;
}

.tile.correct {
  background: var(--mathai-cell-bg-green);
  border-color: var(--mathai-cell-border-green);
}

.tile.incorrect {
  background: var(--mathai-cell-bg-red);
  border-color: var(--mathai-cell-border-red);
}

.tile.disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* Interaction disabled state (from InteractionManager) */
.tile-grid.interaction-disabled .tile {
  pointer-events: none;
}

/* === INSTRUCTION AREA === */
.instruction-area {
  text-align: center;
}

.instruction-text {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-text-primary, #000000);
  margin-bottom: 4px;
  line-height: 1.4;
}

.instruction-sub {
  font-size: 13px;
  color: var(--mathai-text-primary, #000000);
}

.instruction-highlight {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-text-primary, #000000);
  margin-top: 4px;
}

/* === RESULTS METRICS (in TransitionScreen content slot) === */
.results-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  margin-bottom: 8px;
}

.metric-row {
  padding: 4px 0;
}

.metric-label {
  color: var(--mathai-gray);
  font-size: var(--mathai-font-size-small);
}

.metric-value-large {
  font-size: 32px;
  font-weight: 700;
  color: var(--mathai-primary);
}

.metric-hint {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-blue);
  margin-top: 4px;
}

/* === BUTTON OVERRIDES === */
.game-btn {
  padding: 14px 32px;
  font-size: var(--mathai-font-size-button);
  font-weight: 600;
  font-family: var(--mathai-font-family);
  border: none;
  border-radius: var(--mathai-border-radius-button);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--mathai-white);
}

.btn-primary {
  background: var(--mathai-green);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 83, 0.4);
}

.btn-secondary {
  background: var(--mathai-blue);
}
.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.hidden { display: none !important; }
```

---

## 7. Script Loading (copy these EXACT tags -- never invent URLs)

```html
<!-- STEP 1: SentryConfig package -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

<!-- STEP 2: initSentry() function definition -->
<script>
function initSentry() {
  try {
    if (typeof SentryConfig !== 'undefined' && SentryConfig.enabled && typeof Sentry !== 'undefined') {
      Sentry.init({
        dsn: SentryConfig.dsn,
        environment: SentryConfig.environment,
        release: "make-x@1.0.0",
        tracesSampleRate: SentryConfig.tracesSampleRate,
        sampleRate: SentryConfig.sampleRate,
        maxBreadcrumbs: 50,
        ignoreErrors: [
          "ResizeObserver loop limit exceeded",
          "ResizeObserver loop completed with undelivered notifications",
          "Non-Error promise rejection captured",
          "Script error.",
          "Load failed",
          "Failed to fetch"
        ]
      });
    }
  } catch (e) { console.error('Sentry init failed:', e.message); }
}
</script>

<!-- STEP 3: Sentry SDK v10.23.0 (3 scripts, NO integrity attribute) -->
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- STEP 4: Initialize on load -->
<script>window.addEventListener('load', initSentry);</script>

<!-- STEP 5-7: Game packages (exact URLs, in this order) -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

---

## 8. Game Flow

### 1. Page loads -> DOMContentLoaded fires

1. `waitForPackages()` — waits for FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector
2. `FeedbackManager.init()`
3. SignalCollector creation
4. `ScreenLayout.inject('app', { sections: {...} })`
5. Inject timer container into header slot
6. Build play area HTML into `#gameContent`
7. `TimerComponent` creation (count-up, no auto-start, endTime: 100000)
8. `InteractionManager` creation (selector: '.tile-grid')
9. `VisibilityTracker` creation
10. `createProgressBar()`
11. `TransitionScreenComponent` creation
12. Audio preloading (14 sounds)
13. Register `handlePostMessage` listener
14. Send `game_ready` postMessage
15. `setupGame()`

> **IMPORTANT — Audio unlock pattern:** `FeedbackManager.init()` fires `unlock({ showPopup: true })` internally as fire-and-forget (no await). Do NOT call `FeedbackManager.unlock()` again in DOMContentLoaded — it races with init's unlock and rejects with "User did not grant audio permission". Do NOT block init by polling `canPlayAudio()` either — it prevents the UI from rendering. Instead, poll `canPlayAudio()` in `showWelcomeScreen()` right before playing the welcome VO (see step 3 below). This way the UI loads fully while the user interacts with the permission popup.

### 2. setupGame() runs

1. If no content from postMessage, use `fallbackContent`
2. Reset all game state (round 0, lives 3, score 0, attempts [], events [], selectedTiles [], roundTimes [], isProcessing: false)
3. Set `gameState.startTime = Date.now()` and `gameState.isActive = true`
4. Set `gameState.duration_data.startTime = new Date().toISOString()`
5. `createProgressBar()`
6. `progressBar.update(0, gameState.lives)`
7. `trackEvent('game_start', 'game')`
8. `updateInstructions()`
9. `showWelcomeScreen()`

### 3. Welcome Screen

1. Show TransitionScreen with "Reach the Target Sum" title and "Start Game" button
2. Poll `FeedbackManager.canPlayAudio()` every 200ms (15s timeout) — waits for user to click the audio permission popup that `init()` showed. This does NOT block the UI since the transition screen is already visible.
3. Play `vo_game_start` + sticker (awaited)
4. User clicks "Start Game" -> stop any playing audio -> `handleStartGame()`

### 4. handleStartGame() / handleLevelReady()

1. Hide TransitionScreen
2. Question text stays visible on all screens (do NOT hide it)
3. Determine current level from round number
4. If at level boundary (round 0, 3, 6) -> show `showLevelTransition(level)` first
5. Otherwise -> start gameplay: `startRound()`

### 5. Level Intro Screen

1. Show TransitionScreen with "Level X" title
2. For levels 2/3: show average time per round subtitle
3. Play `vo_level_start_{N}` + sticker (awaited)
4. User clicks "I'm ready!" -> stop any playing audio -> hide transition -> `startRound()`

### 6. startRound() — Each gameplay round

1. Get round data from `gameState.content.rounds[gameState.currentRound]`
2. Update target display: "Make Sum {target}"
3. Render tile buttons into `.tile-grid`
4. Clear selectedTiles
5. Reset and start timer for this round
6. Record `gameState.roundStartTime = Date.now()`
7. Record view event for SignalCollector
8. Play dynamic "Make {target}" audio via `FeedbackManager.playDynamicFeedback()`
   - If user taps a tile before audio finishes -> stop dynamic audio -> play `sound_bubble_select`

### 7. Tile tap interaction loop

**On tile tap:**
0. If `gameState.isProcessing` is true -> return immediately (prevents double-taps during feedback)
1. If tile already selected -> deselect it: remove from `selectedTiles`, remove `.selected` class, play `sound_bubble_deselect`
2. If tile not selected -> add to `selectedTiles`, add `.selected` class
3. Calculate sum of selected tiles (evaluate expressions like "40+50" = 90)
4. Auto-check:
   - If `sum === target` -> **CORRECT** flow (skip bubble select sound to avoid overlap with correct sound)
   - If `sum > target` -> **INCORRECT** flow (skip bubble select sound to avoid overlap with life lost sound). Note: incorrect triggers immediately on any selection that exceeds the target — this is intentional, as the student should reason about sums before selecting.
   - If `sum < target` -> play `sound_bubble_select`, wait for more selections

**CORRECT flow:**
1. Lock interaction (InteractionManager auto-handles via audio)
2. Add `.correct` class to all selected tiles
3. Pause timer
4. Record round time: `roundTime = (Date.now() - gameState.roundStartTime) / 1000`
5. Push `roundTime` to `gameState.roundTimes`
6. `recordAttempt({ userAnswer: selectedValues, correct: true, question: 'Make ' + target, correctAnswer: target, validationType: 'function' })`
7. `trackEvent('correct_answer', 'game', { round, target, selectedTiles, timeTaken: roundTime })`
8. Play `await FeedbackManager.sound.play('sound_correct', { sticker: { image: correctStickerUrl, duration: 2, type: 'IMAGE_GIF' } })`
9. After audio completes -> advance:
   - Increment `gameState.currentRound`
   - Update progress bar: `progressBar.update(gameState.currentRound, gameState.lives)`
   - If `currentRound >= 9` -> `showGameComplete()`
   - Else if at level boundary (round 3 or 6) -> `showLevelTransition(nextLevel)`
   - Else -> `startRound()`

**INCORRECT flow:**
1. Lock interaction
2. Add `.incorrect` class to all selected tiles
3. Decrement `gameState.lives`
4. Update progress bar: `progressBar.update(gameState.currentRound, gameState.lives)`
5. `recordAttempt({ userAnswer: selectedValues, correct: false, question: 'Make ' + target, correctAnswer: target, validationType: 'function' })`
6. `trackEvent('incorrect_answer', 'game', { round, target, selectedTiles, sum })`
7. `trackEvent('life_lost', 'game', { livesRemaining: gameState.lives })`
8. Play `await FeedbackManager.sound.play('sound_life_lost', { sticker: { image: lifeLostStickerUrl, duration: 2, type: 'IMAGE_GIF' } })`
9. After audio completes:
   - If `gameState.lives <= 0` -> `showGameOver()`
   - Else -> deselect all tiles (remove `.incorrect`, `.selected`), clear `selectedTiles`, unlock interaction

### 8. End conditions (EVERY path to endGame())

1. **All 9 rounds completed** -> `showGameComplete()` calls `endGame(stars, avgTime)` immediately, then shows the victory results screen, then plays victory audio sequence (`sound_game_victory` → `vo_victory_stars_{N}`). User can click "Retry for more stars" -> `restartGame()`.
2. **All lives lost** (lives == 0) -> `showGameOver()` calls `endGame(0, 0)` immediately (0 stars for a loss), then shows the game over screen, then plays `sound_game_over` audio. User clicks "Try Again" -> `restartGame()`.

**Note:** `endGame()` is called at the START of both `showGameComplete()` and `showGameOver()`, before audio plays. This ensures metrics are captured immediately and the `game_complete` postMessage is sent promptly. The transition screen is shown BEFORE audio plays so the user sees the results/game-over screen immediately while audio plays over it.

---

## 9. Functions

### Global Scope (RULE-001)

**evaluateTile(tileStr)**

```javascript
function evaluateTile(tileStr) {
  // Evaluates a tile string: '40' -> 40, '40+50' -> 90
  // Split on '+' and sum the parts
  try {
    var parts = tileStr.split('+');
    var sum = 0;
    for (var i = 0; i < parts.length; i++) {
      sum += parseInt(parts[i].trim(), 10);
    }
    return sum;
  } catch (e) {
    console.error('Tile eval error:', JSON.stringify({ tile: tileStr, error: e.message }, null, 2));
    return 0;
  }
}
```

**getSelectedSum()**

```javascript
function getSelectedSum() {
  var roundData = gameState.content.rounds[gameState.currentRound];
  var sum = 0;
  for (var i = 0; i < gameState.selectedTiles.length; i++) {
    sum += evaluateTile(roundData.tiles[gameState.selectedTiles[i]]);
  }
  return sum;
}
```

**handleTileTap(index)**

```javascript
async function handleTileTap(index) {
  if (!gameState.isActive) return;
  if (gameState.isProcessing) return; // Prevent rapid double-taps during feedback

  // Stop dynamic "Make X" audio if still playing
  if (currentDynamicAudio) {
    try { FeedbackManager.stream.stopAll(); } catch(e) {}
    currentDynamicAudio = null;
  }

  var tileEl = document.querySelectorAll('.tile')[index];
  if (!tileEl) return;

  var selectedIdx = gameState.selectedTiles.indexOf(index);

  if (selectedIdx !== -1) {
    // DESELECT
    gameState.selectedTiles.splice(selectedIdx, 1);
    tileEl.classList.remove('selected');
    trackEvent('tile_deselect', 'tile-' + index, { tileValue: gameState.content.rounds[gameState.currentRound].tiles[index] });

    try { FeedbackManager.sound.play('sound_bubble_deselect'); } catch(e) {}

    // Record visual update
    signalCollector.recordViewEvent('visual_update', {
      screen: 'gameplay',
      content_snapshot: { type: 'tile_deselected', tile_index: index, selected_tiles: gameState.selectedTiles.slice() }
    });
  } else {
    // SELECT
    gameState.selectedTiles.push(index);
    tileEl.classList.add('selected');
    trackEvent('tile_select', 'tile-' + index, { tileValue: gameState.content.rounds[gameState.currentRound].tiles[index] });

    signalCollector.recordViewEvent('visual_update', {
      screen: 'gameplay',
      content_snapshot: { type: 'tile_selected', tile_index: index, selected_tiles: gameState.selectedTiles.slice() }
    });

    // Auto-evaluate
    var sum = getSelectedSum();
    var target = gameState.content.rounds[gameState.currentRound].target;

    if (sum === target) {
      // Skip bubble sound — correct sound plays immediately instead (avoids overlap)
      await handleCorrectAnswer();
    } else if (sum > target) {
      // Skip bubble sound — life lost sound plays immediately instead (avoids overlap)
      await handleIncorrectAnswer();
    } else {
      // sum < target: play bubble select, wait for more selections
      try { FeedbackManager.sound.play('sound_bubble_select'); } catch(e) {}
    }
    // sum < target: do nothing, wait for more selections
  }
}
```

**handleCorrectAnswer()**

```javascript
async function handleCorrectAnswer() {
  gameState.isProcessing = true; // Lock out taps during feedback
  var roundData = gameState.content.rounds[gameState.currentRound];

  // Mark tiles green
  gameState.selectedTiles.forEach(function(idx) {
    var tile = document.querySelectorAll('.tile')[idx];
    if (tile) { tile.classList.remove('selected'); tile.classList.add('correct'); }
  });

  // Pause timer, record round time
  if (timer) timer.pause();
  var roundTime = Math.round((Date.now() - gameState.roundStartTime) / 1000);
  gameState.roundTimes.push(roundTime);

  // Record attempt
  var selectedValues = gameState.selectedTiles.map(function(idx) { return roundData.tiles[idx]; });
  recordAttempt({
    userAnswer: selectedValues,
    correct: true,
    question: 'Make ' + roundData.target,
    correctAnswer: roundData.target,
    validationType: 'function'
  });

  trackEvent('correct_answer', 'game', { round: gameState.currentRound + 1, target: roundData.target, timeTaken: roundTime });

  signalCollector.recordCustomEvent('round_solved', {
    round: gameState.currentRound + 1,
    correct: true,
    timeTaken: roundTime
  });

  signalCollector.recordViewEvent('feedback_display', {
    screen: 'gameplay',
    content_snapshot: { feedback_type: 'correct', audio_id: 'sound_correct' }
  });

  // Play correct sound + sticker (await — blocks until done)
  try {
    await FeedbackManager.sound.play('sound_correct', {
      sticker: {
        image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758384662281-51.gif',
        duration: 2,
        type: 'IMAGE_GIF'
      }
    });
  } catch (e) { console.error('Correct sound error:', JSON.stringify({ error: e.message }, null, 2)); }

  // Advance
  gameState.currentRound++;
  progressBar.update(gameState.currentRound, gameState.lives);
  gameState.isProcessing = false; // Unlock taps for next round

  if (gameState.currentRound >= 9) {
    showGameComplete();
  } else if (gameState.currentRound === 3 || gameState.currentRound === 6) {
    gameState.currentLevel = Math.floor(gameState.currentRound / 3) + 1;
    showLevelTransition(gameState.currentLevel);
  } else {
    startRound();
  }
}
```

**handleIncorrectAnswer()**

```javascript
async function handleIncorrectAnswer() {
  gameState.isProcessing = true; // Lock out taps during feedback
  var roundData = gameState.content.rounds[gameState.currentRound];

  // Mark tiles red
  gameState.selectedTiles.forEach(function(idx) {
    var tile = document.querySelectorAll('.tile')[idx];
    if (tile) { tile.classList.remove('selected'); tile.classList.add('incorrect'); }
  });

  // Lose a life
  gameState.lives--;
  progressBar.update(gameState.currentRound, gameState.lives);

  // Record attempt
  var selectedValues = gameState.selectedTiles.map(function(idx) { return roundData.tiles[idx]; });
  recordAttempt({
    userAnswer: selectedValues,
    correct: false,
    question: 'Make ' + roundData.target,
    correctAnswer: roundData.target,
    validationType: 'function'
  });

  var sum = getSelectedSum();
  trackEvent('incorrect_answer', 'game', { round: gameState.currentRound + 1, target: roundData.target, sum: sum });
  trackEvent('life_lost', 'game', { livesRemaining: gameState.lives });

  signalCollector.recordViewEvent('feedback_display', {
    screen: 'gameplay',
    content_snapshot: { feedback_type: 'incorrect', audio_id: 'sound_life_lost' }
  });

  // Play life lost sound + sticker (await)
  try {
    await FeedbackManager.sound.play('sound_life_lost', {
      sticker: {
        image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758987649744-178.gif',
        duration: 2,
        type: 'IMAGE_GIF'
      }
    });
  } catch (e) { console.error('Life lost sound error:', JSON.stringify({ error: e.message }, null, 2)); }

  // Check game over
  if (gameState.lives <= 0) {
    showGameOver();
  } else {
    // Deselect all tiles
    gameState.selectedTiles.forEach(function(idx) {
      var tile = document.querySelectorAll('.tile')[idx];
      if (tile) { tile.classList.remove('incorrect', 'selected'); }
    });
    gameState.selectedTiles = [];
    gameState.isProcessing = false; // Unlock taps for retry
  }
}
```

**startRound()**

```javascript
async function startRound() {
  var roundData = gameState.content.rounds[gameState.currentRound];
  if (!roundData) return;

  // Update target display
  document.getElementById('target-value').textContent = roundData.target;

  // Render tiles
  var tileGrid = document.getElementById('tile-grid');
  tileGrid.innerHTML = '';
  for (var i = 0; i < roundData.tiles.length; i++) {
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = roundData.tiles[i];
    tile.setAttribute('data-signal-id', 'tile-' + i);
    tile.setAttribute('data-index', i);
    tile.onclick = (function(idx) {
      return function() { handleTileTap(idx); };
    })(i);
    tileGrid.appendChild(tile);
  }

  // Clear selections
  gameState.selectedTiles = [];

  // Show game content, hide transition
  var gameContentEl = document.getElementById('gameContent');
  if (gameContentEl) gameContentEl.style.display = '';
  transitionScreen.hide();

  // Timer: resume (clears isExternallyControlled from manual pause), reset, start
  if (timer) {
    timer.resume();
    timer.reset();
    timer.start();
  }
  gameState.roundStartTime = Date.now();

  // Signal: content render
  signalCollector.recordViewEvent('content_render', {
    screen: 'gameplay',
    content_snapshot: {
      round: gameState.currentRound + 1,
      level: roundData.level,
      target: roundData.target,
      tiles: roundData.tiles,
      trigger: 'round_start'
    },
    components: {
      timer: timer ? { value: timer.getCurrentTime(), state: 'running' } : null,
      progress: { current: gameState.currentRound, total: gameState.totalRounds }
    }
  });

  trackEvent('question_shown', 'game', { round: gameState.currentRound + 1, target: roundData.target, level: roundData.level });

  // Play dynamic "Make {target}" audio
  try {
    await FeedbackManager.playDynamicFeedback({
      audio_content: 'Make ' + roundData.target,
      subtitle: 'Make ' + roundData.target
    });
  } catch (e) { console.error('Dynamic audio error:', JSON.stringify({ error: e.message }, null, 2)); }
}
```

**handleStartGame()**

```javascript
function handleStartGame() {
  // Stop any playing welcome VO
  try { FeedbackManager.sound.stopAll(); } catch(e) {}

  // Question text stays visible on all screens (do NOT hide it)

  // Show level 1 intro
  gameState.currentLevel = 1;
  showLevelTransition(1);
}
```

**handleLevelReady()**

```javascript
function handleLevelReady() {
  // Stop any playing level VO
  try { FeedbackManager.sound.stopAll(); } catch(e) {}

  // Start gameplay
  startRound();
}
```

**endGame(stars, avgTime)**

```javascript
function endGame(stars, avgTime) {
  if (!gameState.isActive) return;
  gameState.isActive = false;
  gameState.duration_data.currentTime = new Date().toISOString();

  var correct = gameState.attempts.filter(function(a) { return a.correct; }).length;
  var total = gameState.attempts.length;
  var accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  var timeTaken = timer ? timer.getTimeTaken() : Math.round((Date.now() - gameState.startTime) / 1000);

  // Stars based on average time (overriding default accuracy-based)
  // stars passed in from showGameComplete, but recalculate if not provided
  if (stars === undefined) {
    stars = avgTime <= 3 ? 3 : avgTime <= 5 ? 2 : 1;
  }

  var metrics = {
    accuracy: accuracy,
    time: timeTaken,
    stars: stars,
    attempts: gameState.attempts,
    duration_data: gameState.duration_data,
    totalLives: gameState.totalLives,
    tries: computeTriesPerRound(gameState.attempts),
    avgTimePerRound: avgTime || 0,
    roundTimes: gameState.roundTimes
  };

  if (gameState.sessionHistory && gameState.sessionHistory.length > 0) {
    metrics.sessionHistory = gameState.sessionHistory.concat([{
      totalLives: gameState.totalLives,
      tries: computeTriesPerRound(gameState.attempts)
    }]);
  }

  console.log('Final Metrics:', JSON.stringify(metrics, null, 2));
  console.log('Attempt History:', JSON.stringify(gameState.attempts, null, 2));

  trackEvent('game_end', 'game', { metrics: metrics });

  if (signalCollector) signalCollector.seal();

  window.parent.postMessage({
    type: 'game_complete',
    data: {
      metrics: metrics,
      attempts: gameState.attempts,
      completedAt: Date.now()
    }
  }, '*');

  // Cleanup
  if (timer) { timer.destroy(); timer = null; }
  if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
  FeedbackManager.sound.stopAll();
  FeedbackManager.stream.stopAll();
}
```

**computeTriesPerRound(attempts)**

```javascript
function computeTriesPerRound(attempts) {
  var rounds = {};
  attempts.forEach(function(a) {
    var r = a.metadata.round;
    rounds[r] = (rounds[r] || 0) + 1;
  });
  return Object.keys(rounds).map(function(r) {
    return { round: Number(r), triesCount: rounds[r] };
  });
}
```

**restartGame()**

```javascript
function restartGame() {
  // Push session snapshot before resetting
  if (!gameState.sessionHistory) gameState.sessionHistory = [];
  gameState.sessionHistory.push({
    totalLives: gameState.totalLives,
    tries: computeTriesPerRound(gameState.attempts)
  });

  // Reset state
  window.gameState.currentRound = 0;
  window.gameState.score = 0;
  window.gameState.attempts = [];
  window.gameState.events = [];
  window.gameState.isActive = true;
  window.gameState.startTime = Date.now();
  window.gameState.lives = 3;
  window.gameState.currentLevel = 1;
  window.gameState.selectedTiles = [];
  window.gameState.roundTimes = [];
  window.gameState.roundStartTime = null;
  window.gameState.isProcessing = false;
  window.gameState.duration_data = {
    startTime: new Date().toISOString(),
    preview: [],
    attempts: [],
    evaluations: [],
    inActiveTime: [],
    totalInactiveTime: 0,
    currentTime: null
  };

  // Recreate destroyed components
  signalCollector = new SignalCollector({
    sessionId: window.gameVariableState ? window.gameVariableState.sessionId : 'session_' + Date.now(),
    studentId: window.gameVariableState ? window.gameVariableState.studentId : null,
    gameId: gameState.gameId
  });
  window.signalCollector = signalCollector;

  timer = new TimerComponent('timer-container', {
    timerType: 'increase',
    format: 'min',
    startTime: 0,
    endTime: 100000,
    autoStart: false,
    onEnd: function() { /* No time limit */ }
  });

  visibilityTracker = new VisibilityTracker({
    onInactive: onInactiveHandler,
    onResume: onResumeHandler,
    popupProps: { title: 'Game Paused', description: 'Click Resume to continue.', primaryText: 'Resume' }
  });

  createProgressBar();
  progressBar.update(0, gameState.lives);

  trackEvent('game_start', 'game');

  // Show welcome screen again
  var questionSlot = document.getElementById('mathai-question-slot');
  if (questionSlot) questionSlot.style.display = '';
  showWelcomeScreen();
}
```

**setupGame()**

```javascript
function setupGame() {
  if (!gameState.content) {
    gameState.content = fallbackContent;
  }

  gameState.totalRounds = gameState.content.rounds.length;
  gameState.startTime = Date.now();
  gameState.isActive = true;
  gameState.currentRound = 0;
  gameState.score = 0;
  gameState.attempts = [];
  gameState.events = [];
  gameState.lives = 3;
  gameState.currentLevel = 1;
  gameState.selectedTiles = [];
  gameState.roundTimes = [];
  gameState.roundStartTime = null;
  gameState.isProcessing = false;
  gameState.duration_data.startTime = new Date().toISOString();

  createProgressBar();
  progressBar.update(0, gameState.lives);

  trackEvent('game_start', 'game');
  updateInstructions();
  showWelcomeScreen();
}
```

**handlePostMessage(event)**

```javascript
function handlePostMessage(event) {
  if (!event.data || event.data.type !== 'game_init') return;
  var d = event.data.data;
  gameState.content = d.content;
  gameState.signalConfig = d.signalConfig || {};
  if (signalCollector && gameState.signalConfig.flushUrl) {
    signalCollector.flushUrl = gameState.signalConfig.flushUrl;
    signalCollector.playId = gameState.signalConfig.playId || null;
    signalCollector.gameId = gameState.signalConfig.gameId || signalCollector.gameId;
    signalCollector.sessionId = gameState.signalConfig.sessionId || signalCollector.sessionId;
    signalCollector.contentSetId = gameState.signalConfig.contentSetId || signalCollector.contentSetId;
    signalCollector.studentId = gameState.signalConfig.studentId || signalCollector.studentId;
    signalCollector.startFlushing();
  }
  setupGame();
}
```

**recordAttempt(data)** — From PART-009

```javascript
function recordAttempt(data) {
  var attempt = {
    attempt_timestamp: new Date().toISOString(),
    time_since_start_of_game: (Date.now() - gameState.startTime) / 1000,
    input_of_user: data.userAnswer,
    attempt_number: gameState.attempts.length + 1,
    correct: data.correct,
    metadata: {
      round: gameState.currentRound + 1,
      question: data.question,
      correctAnswer: data.correctAnswer,
      validationType: data.validationType || 'function'
    }
  };

  gameState.attempts.push(attempt);
  gameState.duration_data.attempts.push({
    startTime: new Date().toISOString(),
    time_to_first_attempt: (Date.now() - gameState.startTime) / 1000,
    duration: 0
  });

  console.log('Attempt:', JSON.stringify(attempt, null, 2));
}
```

**trackEvent(type, target, data)** — From PART-010

```javascript
function trackEvent(type, target, data) {
  gameState.events.push({
    type: type,
    target: target,
    timestamp: Date.now(),
    ...(data || {})
  });
}
```

**createProgressBar()** — From PART-023

```javascript
function createProgressBar() {
  if (progressBar) progressBar.destroy();
  progressBar = new ProgressBarComponent({
    slotId: 'mathai-progress-slot',
    totalRounds: gameState.totalRounds,
    totalLives: gameState.totalLives
  });
}
```

**onInactiveHandler / onResumeHandler** — From PART-005

```javascript
function onInactiveHandler() {
  var inactiveStart = Date.now();
  gameState.duration_data.inActiveTime.push({ start: inactiveStart });
  if (signalCollector) {
    signalCollector.pause();
    signalCollector.recordCustomEvent('visibility_hidden', {});
  }
  if (timer) timer.pause({ fromVisibilityTracker: true });
  FeedbackManager.sound.pause();
  FeedbackManager.stream.pauseAll();
  trackEvent('game_paused', 'system');
}

function onResumeHandler() {
  var lastInactive = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
  if (lastInactive && !lastInactive.end) {
    lastInactive.end = Date.now();
    gameState.duration_data.totalInactiveTime += (lastInactive.end - lastInactive.start);
  }
  if (signalCollector) {
    signalCollector.resume();
    signalCollector.recordCustomEvent('visibility_visible', {});
  }
  if (timer && timer.isPaused) timer.resume({ fromVisibilityTracker: true });
  FeedbackManager.sound.resume();
  FeedbackManager.stream.resumeAll();
  trackEvent('game_resumed', 'system');
}
```

### Inside DOMContentLoaded (PART-004)

```javascript
window.addEventListener('DOMContentLoaded', async function() {
  try {
    await waitForPackages();
    await FeedbackManager.init();
    // init() fires unlock({ showPopup: true }) internally — do NOT await or re-call unlock() here.
    // Audio unlock polling happens in showWelcomeScreen() before VO play.

    // SignalCollector
    signalCollector = new SignalCollector({
      sessionId: window.gameVariableState ? window.gameVariableState.sessionId : 'session_' + Date.now(),
      studentId: window.gameVariableState ? window.gameVariableState.studentId : null,
      gameId: gameState.gameId,
      contentSetId: gameState.contentSetId
    });
    window.signalCollector = signalCollector;

    // ScreenLayout v2
    ScreenLayout.inject('app', {
      sections: {
        header: true,
        questionText: true,
        progressBar: true,
        playArea: true,
        transitionScreen: true
      },
      styles: {
        header: { background: 'var(--mathai-white, #ffffff)' },
        questionText: { padding: '16px 20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', width: '100%' },
        progressBar: { padding: '0 20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginTop: '8px', width: '100%' }
      }
    });

    // Inject timer container into header
    var headerSlot = document.getElementById('mathai-header-slot');
    if (headerSlot) {
      headerSlot.innerHTML = '<div id="timer-container" style="display:flex;justify-content:center;align-items:center;padding:8px 0;"></div>';
    }

    // Build play area
    var gameContentEl = document.getElementById('gameContent');
    gameContentEl.innerHTML =
      '<div class="game-play-area">' +
        '<div class="target-display" id="target-display">' +
          '<h2 class="target-title" id="target-title">Make Sum <span id="target-value">0</span></h2>' +
        '</div>' +
        '<div class="tile-grid" id="tile-grid"></div>' +
      '</div>';

    // Timer (count-up, no auto-start)
    timer = new TimerComponent('timer-container', {
      timerType: 'increase',
      format: 'min',
      startTime: 0,
      endTime: 100000,
      autoStart: false,
      onEnd: function() { /* No time limit — game ends by rounds or lives */ }
    });

    // InteractionManager
    var interactionManager = new InteractionManager({
      selector: '.tile-grid',
      disableOnAudioFeedback: false,
      disableOnEvaluation: true
    });
    window.interactionManager = interactionManager;

    // VisibilityTracker
    visibilityTracker = new VisibilityTracker({
      onInactive: onInactiveHandler,
      onResume: onResumeHandler,
      popupProps: {
        title: 'Game Paused',
        description: 'Click Resume to continue.',
        primaryText: 'Resume'
      }
    });

    // ProgressBar
    createProgressBar();

    // TransitionScreen
    transitionScreen = new TransitionScreenComponent({ autoInject: true });

    // Audio preloading
    try {
      await FeedbackManager.sound.preload([
        { id: 'sound_bubble_select', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758162403784.mp3' },
        { id: 'sound_bubble_deselect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758712800721.mp3' },
        { id: 'sound_correct', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758973311359.mp3' },
        { id: 'sound_life_lost', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3' },
        { id: 'sound_level_transition', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1756742499143.mp3' },
        { id: 'sound_game_over', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504545907.mp3' },
        { id: 'sound_game_victory', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504678281.mp3' },
        { id: 'vo_game_start', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/abfbe256-6b2a-4aa1-9cd7-bae00a464ca7.mp3' },
        { id: 'vo_level_start_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/62d37f18-0322-4623-9436-8001c5322cd7.mp3' },
        { id: 'vo_level_start_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/e2352a09-5ab6-4dca-8e39-b382bf0b4571.mp3' },
        { id: 'vo_level_start_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/c7324be5-52d1-476e-aeb7-9bb28dfc5e2d.mp3' },
        { id: 'vo_victory_stars_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/da6cab5b-c537-4bb6-b5fc-6bca05e9b442.mp3' },
        { id: 'vo_victory_stars_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/7f123176-27cc-490c-9c84-6e2910cdcf5d.mp3' },
        { id: 'vo_victory_stars_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/eab5006f-7e6b-42a9-9791-94d56b653b2f.mp3' }
      ]);
    } catch (e) { console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2)); }

    // PostMessage listener
    window.addEventListener('message', handlePostMessage);

    // Signal ready
    window.parent.postMessage({ type: 'game_ready' }, '*');

    // Setup game
    setupGame();
  } catch (error) {
    console.error('Initialization failed:', JSON.stringify({ error: error.message }, null, 2));
  }
});
```

### Window-Attached Debug (PART-012)

```javascript
window.debugGame = function() {
  console.log('Game State:', JSON.stringify(gameState, null, 2));
};

window.debugAudio = function() {
  console.log('Audio State:', JSON.stringify({
    sound: FeedbackManager.sound.getState(),
    stream: FeedbackManager.stream.getState()
  }, null, 2));
};

window.testAudio = async function(id) {
  console.log('Testing audio:', id);
  try {
    await FeedbackManager.sound.play(id);
  } catch (e) {
    console.error('Audio test failed:', JSON.stringify({ error: e.message }, null, 2));
  }
};

window.testPause = function() {
  if (visibilityTracker) {
    visibilityTracker.triggerInactive();
  } else {
    if (timer) timer.pause();
    FeedbackManager.sound.pause();
    FeedbackManager.stream.pauseAll();
  }
  console.log(JSON.stringify({ event: 'testPause', timerPaused: true }));
};

window.testResume = function() {
  if (visibilityTracker) {
    visibilityTracker.triggerResume();
  } else {
    if (timer && timer.isPaused) timer.resume();
    FeedbackManager.sound.resume();
    FeedbackManager.stream.resumeAll();
  }
  console.log(JSON.stringify({ event: 'testResume', timerResumed: true }));
};

window.debugSignals = function() {
  if (!signalCollector) { console.log('SignalCollector not initialized'); return; }
  console.log('=== Signal Collector Debug ===');
  signalCollector.debug();
  console.log('Input events:', signalCollector.getInputEvents().length);
  console.log('Current view:', JSON.stringify(signalCollector.getCurrentView(), null, 2));
  console.log('Metadata:', JSON.stringify(signalCollector.getMetadata(), null, 2));
};

window.verifySentry = function() {
  var checks = {
    sdkLoaded: typeof Sentry !== 'undefined',
    configLoaded: typeof SentryConfig !== 'undefined',
    initialized: typeof Sentry !== 'undefined' && Sentry.getClient() !== undefined,
    dsn: typeof Sentry !== 'undefined' && Sentry.getClient() ? Sentry.getClient().getDsn().toString() : null
  };
  console.log('Sentry Status:', JSON.stringify(checks, null, 2));
  return checks;
};

window.testSentry = function() {
  try {
    throw new Error('Test error from testSentry()');
  } catch (error) {
    if (typeof Sentry !== 'undefined') Sentry.captureException(error, { tags: { test: true } });
    console.log('Test error sent to Sentry. Check dashboard.');
  }
};

window.loadRound = function(n) {
  gameState.currentRound = n - 1;
  gameState.isActive = true;
  startRound();
};
```

---

## 10. Event Schema

### Game Lifecycle Events (from PART-010)

| Event        | Target | When Fired            |
| ------------ | ------ | --------------------- |
| game_start   | game   | setupGame() completes |
| game_end     | game   | endGame() fires       |
| game_paused  | system | Tab loses focus        |
| game_resumed | system | User resumes           |

### Game-Specific Events

| Event             | Target     | When Fired                          | Data                                              |
| ----------------- | ---------- | ----------------------------------- | ------------------------------------------------- |
| tile_select       | tile-{N}   | User taps to select a tile          | `{ tileValue }` |
| tile_deselect     | tile-{N}   | User taps to deselect a tile        | `{ tileValue }` |
| correct_answer    | game       | Selected sum == target              | `{ round, target, timeTaken }` |
| incorrect_answer  | game       | Selected sum > target               | `{ round, target, sum }` |
| life_lost         | game       | After incorrect answer              | `{ livesRemaining }` |
| question_shown    | game       | Round renders                       | `{ round, target, level }` |

---

## 11. Scaffold Points

| Point           | Function                | When                     | What Can Be Injected                    |
| --------------- | ----------------------- | ------------------------ | --------------------------------------- |
| after_incorrect | handleIncorrectAnswer() | User selects wrong combo | Hint: "Try smaller numbers first"       |
| before_round    | startRound()            | New round starts         | Difficulty preview, tile-sum hints      |
| on_level_intro  | showLevelTransition()   | Level transition shown   | Strategy tip for harder levels          |

### Scaffold Integration Notes

- Scaffolds are optional -- game works without them
- Each scaffold point has a no-op default
- Scaffold content provided via postMessage

---

## 12. Feedback Triggers

### Audio Preload List

```javascript
await FeedbackManager.sound.preload([
  { id: 'sound_bubble_select', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758162403784.mp3' },
  { id: 'sound_bubble_deselect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758712800721.mp3' },
  { id: 'sound_correct', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758973311359.mp3' },
  { id: 'sound_life_lost', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3' },
  { id: 'sound_level_transition', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1756742499143.mp3' },
  { id: 'sound_game_over', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504545907.mp3' },
  { id: 'sound_game_victory', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757504678281.mp3' },
  { id: 'vo_game_start', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/abfbe256-6b2a-4aa1-9cd7-bae00a464ca7.mp3' },
  { id: 'vo_level_start_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/62d37f18-0322-4623-9436-8001c5322cd7.mp3' },
  { id: 'vo_level_start_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/e2352a09-5ab6-4dca-8e39-b382bf0b4571.mp3' },
  { id: 'vo_level_start_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/c7324be5-52d1-476e-aeb7-9bb28dfc5e2d.mp3' },
  { id: 'vo_victory_stars_3', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/da6cab5b-c537-4bb6-b5fc-6bca05e9b442.mp3' },
  { id: 'vo_victory_stars_2', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/7f123176-27cc-490c-9c84-6e2910cdcf5d.mp3' },
  { id: 'vo_victory_stars_1', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/eab5006f-7e6b-42a9-9791-94d56b653b2f.mp3' }
]);
```

> **IMPORTANT — Sticker duration unit:** `StickerComponent.show()` expects `duration` in **seconds** (not milliseconds). It internally does `duration * 1000` for the auto-hide timeout. Passing `5000` would create an 83-minute timeout. Use `duration: 5` for 5 seconds.

### Feedback Trigger Table

| Moment                        | Trigger Function        | Audio ID              | Sticker                                                      | Await? |
| ----------------------------- | ----------------------- | --------------------- | ------------------------------------------------------------ | ------ |
| Welcome screen                | showWelcomeScreen()     | `vo_game_start`       | `rc-upload-1758711007491-155.gif`                            | Yes    |
| Level 1 intro                 | showLevelTransition(1)  | `vo_level_start_1`    | `rc-upload-1758711007491-152.gif`                            | Yes    |
| Level 2 intro                 | showLevelTransition(2)  | `vo_level_start_2`    | `rc-upload-1758711007491-149.gif`                            | Yes    |
| Level 3 intro                 | showLevelTransition(3)  | `vo_level_start_3`    | `rc-upload-1758711007491-145.gif`                            | Yes    |
| Round start                   | startRound()            | Dynamic TTS           | none (subtitle only)                                         | Yes*   |
| Tile select (sum < target)    | handleTileTap()         | `sound_bubble_select` | none                                                         | No     |
| Tile deselect                 | handleTileTap()         | `sound_bubble_deselect`| none                                                        | No     |
| Correct answer                | handleCorrectAnswer()   | `sound_correct`       | `rc-upload-1758384662281-51.gif`                             | Yes    |
| Incorrect / life lost         | handleIncorrectAnswer() | `sound_life_lost`     | `rc-upload-1758987649744-178.gif`                            | Yes    |
| Game complete (3 stars)       | showGameComplete()      | `sound_game_victory` + `vo_victory_stars_3` | `rc-upload-1758711007491-93.gif`          | Yes    |
| Game complete (2 stars)       | showGameComplete()      | `sound_game_victory` + `vo_victory_stars_2` | `rc-upload-1758711007491-90.gif`          | Yes    |
| Game complete (1 star)        | showGameComplete()      | `sound_game_victory` + `vo_victory_stars_1` | `rc-upload-1758711007491-88.gif`          | Yes    |
| Game over                     | showGameOver()          | `sound_game_over`     | `rc-upload-1758711007491-96.gif`                             | Yes    |

*Dynamic TTS "Make {target}" is awaited, but stops immediately if user taps a tile.

### Stop-on-Action Behavior

| Screen             | Audio Playing             | Stop Trigger                         |
| ------------------ | ------------------------- | ------------------------------------ |
| Welcome            | `vo_game_start`           | User clicks "Start Game"            |
| Level Intro        | `vo_level_start_{N}`      | User clicks "I'm ready!"            |
| Gameplay (round)   | Dynamic TTS "Make {target}" | User taps any tile               |

---

## 13. Visual Specifications

- **Layout:** Flex column, centered, max-width 440px for play area
- **Color palette:** mathai standard CSS variables (primary purple, green buttons, blue secondary, yellow selected, green correct, red incorrect)
- **Typography:** Epilogue font via `--mathai-font-family`, 28px target title, 16px tiles, 14px instructions
- **Spacing:** 24px gap between target and tiles, 12px gap between tiles
- **Interactive states:**
  - Default: white bg, gray border, pill shape (border-radius: 24px)
  - Selected: yellow bg (`--mathai-cell-bg-yellow`), gold border
  - Correct: green bg (`--mathai-cell-bg-green`), green border
  - Incorrect: red bg (`--mathai-cell-bg-red`), red border
- **Transitions:** 0.2s ease on all tile state changes, scale(0.95) on tap
- **Responsive:** max-width 440px, flex-wrap on tiles
- **Timer:** Centered in header, blue text, MM:SS format
- **Progress bar:** Blue fill, "Round X/9" label, 3 heart lives

---

## 14. Test Scenarios

> These scenarios are consumed by the ralph loop to generate `tests/game.spec.js`.
> Every scenario must specify exact selectors, exact actions, and exact assertions.

### Scenario: Page loads and shows welcome screen

```
SETUP: Page loaded
ACTIONS:
  Wait for page load
ASSERT:
  TransitionScreen is visible with title "Reach the Target Sum"
  "Start Game" button is visible
  Timer shows "00:00"
  Progress bar shows "Round 0/9"
  3 filled hearts visible
```

### Scenario: Start game shows level 1 intro

```
SETUP: Page loaded, welcome screen visible
ACTIONS:
  Click "Start Game" button on TransitionScreen
ASSERT:
  TransitionScreen shows title "Level 1"
  "I'm ready!" button is visible
  Timer still shows "00:00"
```

### Scenario: First round loads after level intro

```
SETUP: Level 1 intro visible
ACTIONS:
  Click "I'm ready!" button
ASSERT:
  TransitionScreen is hidden
  #target-value shows "90"
  .tile-grid contains 5 .tile elements
  Tiles show text: "20", "30", "40", "50", "60"
  Timer is running (not "00:00" after 1s)
  No tiles have .selected class
```

### Scenario: Select and deselect tiles

```
SETUP: Round 1 gameplay active (target 90)
ACTIONS:
  Click .tile with text "40"
ASSERT:
  Clicked tile has .selected class
  gameState.selectedTiles.length === 1

ACTIONS:
  Click same .tile with text "40" again
ASSERT:
  Tile no longer has .selected class
  gameState.selectedTiles.length === 0
```

### Scenario: Correct answer on Round 1 (select 40 + 50 = 90)

```
SETUP: Round 1 gameplay active (target 90, tiles: 20, 30, 40, 50, 60)
ACTIONS:
  Click .tile[data-index="2"] (text "40")
  Click .tile[data-index="3"] (text "50")
ASSERT:
  Both tiles get .correct class (green)
  Timer pauses
  After ~2s, round advances to Round 2
  #target-value shows "110"
  Progress bar shows "Round 1/9"
  gameState.attempts.length >= 1
  gameState.attempts[last].correct === true
```

### Scenario: Incorrect answer loses a life (select tiles summing > target)

```
SETUP: Round 1 gameplay active (target 90, tiles: 20, 30, 40, 50, 60)
ACTIONS:
  Click .tile[data-index="2"] (text "40")
  Click .tile[data-index="4"] (text "60")
ASSERT:
  sum = 100 > 90 = target → incorrect
  Both tiles get .incorrect class (red)
  Lives drop from 3 to 2 (one heart becomes empty)
  After ~1.5s, tiles reset to default state
  gameState.lives === 2
  gameState.attempts[last].correct === false
```

### Scenario: Game over when all 3 lives lost

```
SETUP: Game in progress, gameState.lives === 1
ACTIONS:
  Make an incorrect selection (sum > target)
ASSERT:
  gameState.lives === 0
  TransitionScreen shows with title "Game Over"
  Subtitle shows "You ran out of lives!"
  "Try Again" button visible
```

### Scenario: Complete all 9 rounds and see results

```
SETUP: Page loaded
ACTIONS:
  Start game, complete level 1 intro
  Round 1: Click tiles "40" + "50" (= 90)
  Round 2: Click tiles "30" + "80" (= 110)
  Round 3: Click tiles "40" + "80" (= 120) → Level 2 intro
  Complete level 2 intro
  Round 4: Click tiles "40+50" + "50" + "40" (evaluate: 90+50+40 = 180... needs recalculation)
  ... (complete all rounds with correct sums)
  Round 9 complete
ASSERT:
  TransitionScreen shows with stars
  Title shows "Game Complete!"
  Average time metric is displayed
  "Retry for more stars" button visible
  gameState.currentRound === 9
```

### Scenario: Retry from game complete resets everything

```
SETUP: Game complete screen showing
ACTIONS:
  Click "Retry for more stars" button
ASSERT:
  gameState.lives === 3
  gameState.currentRound === 0
  gameState.roundTimes === []
  Welcome screen shows again
  Progress bar shows "Round 0/9" with 3 hearts
```

### Scenario: Try Again from game over resets everything

```
SETUP: Game over screen showing
ACTIONS:
  Click "Try Again" button
ASSERT:
  gameState.lives === 3
  gameState.currentRound === 0
  Welcome screen shows again
```

### Scenario: Level transition shows at round 4 and round 7

```
SETUP: Game in progress
ACTIONS:
  Complete rounds 1-3 (all correct)
ASSERT:
  After round 3, TransitionScreen shows "Level 2"
  Subtitle shows average time
  "I'm ready!" button visible

ACTIONS:
  Click "I'm ready!", complete rounds 4-6
ASSERT:
  After round 6, TransitionScreen shows "Level 3"
  Subtitle shows average time
```

### Scenario: Expression tiles evaluate correctly

```
SETUP: Round 4 (target 140, tiles include "40+50")
ACTIONS:
  Click tile "40+50" (evaluates to 90)
  Click tile "50" (evaluates to 50)
ASSERT:
  sum = 90 + 50 = 140 === target → correct
  Both tiles get .correct class
```

### Scenario: endGame fires automatically on game complete

```
SETUP: Game in progress, completing round 9
ACTIONS:
  Complete round 9 with correct selection
ASSERT:
  gameState.isActive === false (endGame called automatically)
  game_complete postMessage sent with metrics
  metrics.stars is 1, 2, or 3
  metrics.attempts is array with all attempts
  metrics.duration_data is populated
  TransitionScreen shows with stars and "Retry for more stars" button
```

### Scenario: endGame fires automatically on game over

```
SETUP: Game in progress, gameState.lives === 1
ACTIONS:
  Make an incorrect selection (sum > target)
ASSERT:
  gameState.isActive === false (endGame called automatically with 0 stars)
  game_complete postMessage sent with metrics.stars === 0
  TransitionScreen shows "Game Over" with "Try Again" button
```

---

## 15. Verification Checklist

### Structural

- [ ] HTML has DOCTYPE, meta charset, meta viewport
- [ ] Package scripts in correct order: SentryConfig -> Sentry SDK -> FeedbackManager -> Components -> Helpers
- [ ] Single `<style>` in `<head>`, single `<script>` in `<body>` (RULE-007)
- [ ] Body contains only `<div id="app"></div>` -- no manual layout divs
- [ ] No `#results-screen` div (use TransitionScreen content slot)
- [ ] No `.page-center` / `.game-wrapper` / `.game-stack` HTML

### Functional

- [ ] `waitForPackages()` checks FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector with 10s timeout
- [ ] DOMContentLoaded calls init sequence in order (PART-004)
- [ ] VisibilityTracker created with onInactive + onResume, uses `sound.pause()` NOT `sound.stopAll()`
- [ ] VisibilityTracker passes `{ fromVisibilityTracker: true }` to timer pause/resume
- [ ] TimerComponent: count-up, format 'min', endTime 100000, autoStart false
- [ ] InteractionManager on `window.interactionManager` with selector '.tile-grid'
- [ ] handlePostMessage registered and handles game_init with SignalCollector config
- [ ] `game_ready` postMessage sent AFTER listener registered
- [ ] Fallback content for standalone testing (9 rounds)
- [ ] recordAttempt produces correct attempt shape with validationType 'function'
- [ ] trackEvent fires at all interaction points
- [ ] endGame calculates metrics with time-based stars, logs, sends postMessage, cleans up
- [ ] **endGame() called at start of showGameComplete()** (stars based on avg time)
- [ ] **endGame(0, 0) called at start of showGameOver()** (0 stars for loss)
- [ ] **isProcessing guard** in handleTileTap() prevents double-taps during feedback
- [ ] **Timer paused and reset** in showWelcomeScreen() and showLevelTransition()
- [ ] **Bubble select sound skipped** when auto-eval triggers correct/incorrect (avoids overlap)
- [ ] Debug functions: debugGame, debugAudio, testAudio, testPause, testResume, debugSignals, verifySentry, testSentry, loadRound
- [ ] showResults uses TransitionScreen content slot (no separate div)
- [ ] Audio preloaded with `sound.preload([{id, url}])` -- NOT `sound.register()`
- [ ] All 14 sounds preloaded
- [ ] Dynamic TTS uses `FeedbackManager.playDynamicFeedback()` -- NOT `sound.play('dynamic')`
- [ ] Dynamic audio stops on tile tap
- [ ] Transition screen audio stops on button click ("Start Game", "I'm ready!")
- [ ] setupGame() sets `gameState.startTime = Date.now()`, `gameState.isActive = true`, calls `trackEvent('game_start')`
- [ ] restartGame() recreates timer, visibilityTracker, signalCollector, progressBar
- [ ] restartGame() pushes to sessionHistory before resetting
- [ ] evaluateTile() correctly parses "40+50" -> 90
- [ ] Auto-evaluation on every tile tap: sum == target -> correct, sum > target -> incorrect
- [ ] SignalCollector: recordViewEvent on every DOM change, seal() before postMessage

### Design & Layout (v2)

- [ ] CSS uses `var(--mathai-*)` variables, no hardcoded colors
- [ ] Tile states use correct colors: yellow selected, green correct, red incorrect
- [ ] ScreenLayout v2 with `config.sections` API (NOT v1 `config.slots`)
- [ ] Sections: header + questionText + progressBar + playArea + transitionScreen all true
- [ ] `.mathai-layout-playarea` CSS overrides use `!important`
- [ ] CSS reset with `100dvh`, not `100vh`
- [ ] ProgressBar v2: `createProgressBar()` helper, `update(0, lives)` at init
- [ ] TransitionScreen v2: welcome + level-intro (x3) + game-complete + game-over screens
- [ ] **Every transition screen plays audio** -- no silent transitions
- [ ] Question text stays visible on ALL screens (welcome, level intro, gameplay, results, game over)

### Rules Compliance

- [ ] RULE-001: All onclick handlers (handleTileTap, handleStartGame, handleLevelReady) in global scope
- [ ] RULE-002: All async functions have async keyword
- [ ] RULE-003: All async calls in try/catch
- [ ] RULE-004: All logging uses JSON.stringify
- [ ] RULE-005: Cleanup in endGame (timer.destroy, visibilityTracker.destroy, sound.stopAll, stream.stopAll)
- [ ] RULE-006: No new Audio(), no setInterval for timer, no SubtitleComponent.show()
- [ ] RULE-007: Single file, no external CSS/JS

### Game-Specific

- [ ] 9 rounds across 3 levels (3 rounds per level)
- [ ] 3 lives system with heart display
- [ ] Count-up timer per round (resets each round)
- [ ] Star rating: 3★ if avg ≤ 3s, 2★ if 3-5s, 1★ if > 5s
- [ ] Level intro screens at rounds 1, 4, 7 with "I'm ready!" button
- [ ] Level 2/3 intros show average time per round
- [ ] Tiles are pill-shaped, flex-wrapped
- [ ] Expression tiles (e.g., "40+50") evaluate correctly
- [ ] Content constraint: proper subset of tiles sums to target (not all tiles)
- [ ] Content constraint: no single tile equals the target
- [ ] Content constraint: multiple valid solutions are acceptable (intentional)
- [ ] Tile toggle: tap to select (yellow), tap again to deselect (white)
- [ ] Auto-evaluate on each selection (no submit button)
- [ ] Correct: tiles turn green, advance after sound completes
- [ ] Incorrect (sum > target): tiles turn red, lose life, reset after sound completes
- [ ] Game complete screen shows stars, avg time, "Retry for more stars" button (endGame already called)
- [ ] Game over screen shows sad emoji, "Try Again" button (endGame already called with 0 stars)

### Contract Compliance

- [ ] gameState matches contracts/game-state.schema.json
- [ ] Attempts match contracts/attempt.schema.json
- [ ] Metrics match contracts/metrics.schema.json (with custom avgTimePerRound, roundTimes)
- [ ] duration_data matches contracts/duration-data.schema.json
- [ ] postMessage out matches contracts/postmessage-out.schema.json
