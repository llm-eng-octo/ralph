# Simon Says â€” Game-Specific Template (Assembly Book)

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

---

## 1. Game Identity

- **Title:** Simon Says
- **Game ID:** game_simon_says
- **Type:** standard
- **Description:** Classic sequence memory game. Four colored quadrant buttons flash in a sequence; the player must repeat the sequence by tapping the buttons in the correct order. Each round adds one more step. 3 lives, game continues until all lives lost or sequence length reaches 10. Stars = lives remaining.

---

## 2. Parts Selected

| Part ID  | Name                          | Included        | Config/Notes                                                                                                                                                                                                                                                   |
| -------- | ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PART-001 | HTML Shell                    | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-002 | Package Scripts               | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-003 | waitForPackages               | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-004 | Initialization Block          | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-005 | VisibilityTracker             | YES             | popupProps: default. onInactive: timer.pause + signalCollector.pause + sound.stopAll. onResume: timer.resume + signalCollector.resume                                                                                                                          |
| PART-006 | TimerComponent                | YES             | timerType: 'increase', startTime: 0, autoStart: false, format: 'min'                                                                                                                                                                                           |
| PART-007 | Game State Object             | YES             | Custom fields: lives, totalLives, sequence, playerIndex, phase, currentSequenceLength, playbackSpeed, roundStartTime, roundTimes, pendingEndProblem                                                                                                            |
| PART-008 | PostMessage Protocol          | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-009 | Attempt Tracking              | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-010 | Event Tracking                | YES             | Custom events: button_correct, button_wrong, sequence_complete, life_lost, playback_start, playback_end. SignalCollector: startProblem per round, deferred endProblem on sequence complete or game_over, recordViewEvent on all DOM changes, seal() in endGame |
| PART-011 | End Game & Metrics            | YES             | Custom star logic: stars = lives remaining (3/2/1/0). Flush deferred endProblem â†’ seal SignalCollector â†’ show results â†’ postMessage with ...signalPayload â†’ cleanup                                                                                    |
| PART-012 | Debug Functions               | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-013 | Validation Fixed              | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-014 | Validation Function           | YES             | Rule: tapped color must match sequence[playerIndex]                                                                                                                                                                                                            |
| PART-015 | Validation LLM                | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-016 | StoriesComponent              | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-017 | Feedback Integration          | NO              | Not needed for this game                                                                                                                                                                                                                                       |
| PART-018 | Case Converter                | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-019 | Results Screen UI             | YES             | Custom metrics: score, time, longest sequence, lives remaining, accuracy                                                                                                                                                                                       |
| PART-020 | CSS Variables & Colors        | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-021 | Screen Layout CSS             | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-022 | Game Buttons                  | YES             | â€”                                                                                                                                                                                                                                                            |
| PART-023 | ProgressBar Component         | YES             | totalRounds: 10, totalLives: 3                                                                                                                                                                                                                                 |
| PART-024 | TransitionScreen Component    | YES             | Screens: start, victory, game-over                                                                                                                                                                                                                             |
| PART-025 | ScreenLayout Component        | YES             | slots: progressBar=true, transitionScreen=true                                                                                                                                                                                                                 |
| PART-026 | Anti-Patterns                 | YES (REFERENCE) | Verification checklist                                                                                                                                                                                                                                         |
| PART-027 | Play Area Construction        | YES             | Layout: 2x2 grid of colored quadrant buttons                                                                                                                                                                                                                   |
| PART-028 | InputSchema Patterns          | YES             | Schema type: single object with sequence array                                                                                                                                                                                                                 |
| PART-029 | Story-Only Game               | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-030 | Sentry Error Tracking         | YES             | SentryConfig-based centralized pattern, SDK v10.23.0, replay/profiling/console integrations                                                                                                                                                                    |
| PART-031 | API Helper                    | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-032 | AnalyticsManager              | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-033 | Interaction Patterns          | NO              | â€”                                                                                                                                                                                                                                                            |
| PART-034 | Variable Schema Serialization | YES (POST_GEN)  | Serializes Section 4 to inputSchema.json                                                                                                                                                                                                                       |
| PART-035 | Test Plan Generation          | YES (POST_GEN)  | Generates tests.md after HTML                                                                                                                                                                                                                                  |
| PART-037 | Playwright Testing            | YES (POST_GEN)  | Ralph loop generates tests + fix cycle                                                                                                                                                                                                                         |

---

## 3. Game State

```javascript
window.gameState = {
  // MANDATORY (from PART-007):
  gameId: 'game_simon_says',
  currentRound: 0,
  totalRounds: 10,
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
    currentTime: null,
  },

  gameEnded: false,

  // GAME-SPECIFIC:
  lives: 3,
  totalLives: 3,
  sequence: [], // Full sequence of 10 color indices (0=red, 1=blue, 2=yellow, 3=green)
  playerIndex: 0, // Index of next expected tap in current sequence
  phase: 'idle', // 'idle' | 'playback' | 'input' | 'feedback'
  currentSequenceLength: 1, // How many steps of the sequence to play this round (starts at 1)
  playbackSpeed: 0.8, // Seconds per flash during playback (decreases with difficulty)
  roundStartTime: null, // Timestamp when current round input phase started
  roundTimes: [], // Array of round completion times in seconds

  // SIGNAL COLLECTOR (PART-010):
  pendingEndProblem: null, // { id, outcome } â€” deferred endProblem for SignalCollector
};

let timer = null;
let visibilityTracker = null;
let progressBar = null;
let transitionScreen = null;
let signalCollector = null;
```

---

## 4. Input Schema

```json
{
  "type": "object",
  "properties": {
    "sequence": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 0,
        "maximum": 3
      },
      "minItems": 10,
      "maxItems": 10,
      "description": "Array of 10 color indices representing the full sequence. 0=red, 1=blue, 2=yellow, 3=green."
    }
  },
  "required": ["sequence"]
}
```

### Fallback Test Content

Pre-defined sequence of 10 color steps. Verified: all values in range 0-3, no more than 2 consecutive same-color values.

```javascript
const fallbackContent = {
  // Sequence: red, blue, yellow, red, green, blue, yellow, green, red, blue
  // Verification: all values 0-3 âœ“, varied distribution âœ“
  // 0=red(3), 1=blue(3), 2=yellow(2), 3=green(2) â€” balanced âœ“
  sequence: [0, 1, 2, 0, 3, 1, 2, 3, 0, 1],
};
```

---

## 5. Screens & HTML Structure

### Body HTML

```html
<div id="app"></div>

<template id="game-template">
  <div id="game-screen" class="game-block">
    <div id="timer-container"></div>

    <div class="instruction-area">
      <p class="instruction-text">Watch the sequence, then <strong>repeat it!</strong></p>
      <p class="instruction-text" id="phase-label" data-signal-id="phase-label">Watch carefully...</p>
    </div>

    <div class="simon-grid" id="simon-grid" data-signal-id="simon-grid">
      <button
        class="simon-btn simon-red"
        id="btn-color-0"
        data-color="0"
        data-signal-id="btn-red"
        onclick="handleSimonTap(0)"
        disabled
      ></button>
      <button
        class="simon-btn simon-blue"
        id="btn-color-1"
        data-color="1"
        data-signal-id="btn-blue"
        onclick="handleSimonTap(1)"
        disabled
      ></button>
      <button
        class="simon-btn simon-yellow"
        id="btn-color-2"
        data-color="2"
        data-signal-id="btn-yellow"
        onclick="handleSimonTap(2)"
        disabled
      ></button>
      <button
        class="simon-btn simon-green"
        id="btn-color-3"
        data-color="3"
        data-signal-id="btn-green"
        onclick="handleSimonTap(3)"
        disabled
      ></button>
    </div>
  </div>

  <div id="results-screen" class="game-block" style="display: none;">
    <div class="results-card">
      <div id="stars-display" class="stars-display"></div>
      <h2 class="results-title" id="results-title">Game Complete!</h2>
      <div class="results-metrics">
        <div class="metric-row">
          <span class="metric-label">Score</span>
          <span class="metric-value" id="result-score">0/10</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Time</span>
          <span class="metric-value" id="result-time">0:00</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Longest Sequence</span>
          <span class="metric-value" id="result-longest">0</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Lives Remaining</span>
          <span class="metric-value" id="result-lives">0</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Accuracy</span>
          <span class="metric-value" id="result-accuracy">0%</span>
        </div>
      </div>
      <button class="game-btn btn-primary" id="btn-restart" data-signal-id="btn-restart" onclick="restartGame()">
        Play Again
      </button>
    </div>
  </div>
</template>
```

---

## 6. CSS

```css
/* === CSS Variables (PART-020) === */
:root {
  --mathai-green: #219653;
  --mathai-light-green: #eafbf1;
  --mathai-red: #e35757;
  --mathai-light-red: #fdecec;
  --mathai-blue: #2563eb;
  --mathai-light-blue: #ebf0ff;
  --mathai-gray: #828282;
  --mathai-light-gray: #f2f2f2;
  --mathai-white: #ffffff;
  --mathai-black: #1a1a2e;
  --mathai-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mathai-font-size-title: 24px;
  --mathai-font-size-body: 16px;
  --mathai-font-size-label: 14px;
  --mathai-font-size-small: 12px;
  --mathai-border-radius-card: 12px;
}

/* === Reset === */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-light-gray);
  color: var(--mathai-black);
  -webkit-font-smoothing: antialiased;
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

/* === Instruction Area === */
.instruction-area {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  padding: 0 4px;
  text-align: center;
}

.instruction-text {
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-black);
  line-height: 1.5;
  margin-bottom: 4px;
}

.instruction-text strong {
  font-weight: 700;
}

#phase-label {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
  font-weight: 600;
  margin-top: 8px;
}

/* === Simon Grid (2x2 quadrant layout) === */
.simon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 280px;
  width: 100%;
  margin: 0 auto;
}

.simon-btn {
  aspect-ratio: 1;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: var(--mathai-font-size-title);
  font-weight: 700;
  user-select: none;
  transition:
    filter 0.15s ease,
    transform 0.1s ease;
  opacity: 0.7;
  outline: none;
  font-family: var(--mathai-font-family);
}

.simon-btn:disabled {
  cursor: default;
}

.simon-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Color assignments */
.simon-red {
  background: #e74c3c;
}
.simon-blue {
  background: #3498db;
}
.simon-yellow {
  background: #f1c40f;
}
.simon-green {
  background: #2ecc71;
}

/* Flash/active state â€” brighten */
.simon-btn.flash {
  opacity: 1;
  filter: brightness(1.4);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

/* Player tap feedback */
.simon-btn.pressed {
  opacity: 1;
  filter: brightness(1.3);
  transform: scale(0.95);
}

/* Correct feedback */
.simon-btn.correct-flash {
  opacity: 1;
  filter: brightness(1.5);
  box-shadow: 0 0 24px rgba(33, 150, 83, 0.6);
}

/* Wrong feedback */
.simon-btn.wrong-flash {
  opacity: 1;
  filter: brightness(0.6);
  box-shadow: 0 0 24px rgba(227, 87, 87, 0.6);
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
}

.btn-primary {
  background: var(--mathai-green);
  color: var(--mathai-white);
}
.btn-primary:hover {
  filter: brightness(0.9);
}

/* === Results Card (PART-019) === */
.results-card {
  width: 100%;
  max-width: 360px;
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stars-display {
  font-size: 40px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.results-title {
  font-size: var(--mathai-font-size-title);
  margin-bottom: 24px;
  color: var(--mathai-black);
}
.results-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--mathai-light-gray);
}
.metric-label {
  color: var(--mathai-gray);
  font-size: var(--mathai-font-size-label);
}
.metric-value {
  font-weight: 700;
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-black);
}

/* === Utility === */
.hidden {
  display: none !important;
}
```

---

## 7. Game Flow

1. **Page loads** -> DOMContentLoaded fires
   - waitForPackages(), FeedbackManager.init()
   - Register sounds (correct_tap, wrong_tap)
   - **SignalCollector init** (PART-010): `new SignalCollector({ sessionId, studentId, templateId })`
   - TimerComponent creation (increase, startTime: 0, autoStart: false)
   - ScreenLayout.inject, clone template
   - ProgressBarComponent (totalRounds: 10, totalLives: 3)
   - TransitionScreen, VisibilityTracker (with timer.pause/resume AND signalCollector.pause/resume)
   - Show start transition screen

2. **startGame()** from start screen:
   - Load content from gameState.content or fallbackContent
   - Set gameState.sequence, reset lives/round/playerIndex/phase
   - Set startTime, isActive, duration_data.startTime
   - timer.start()
   - progressBar.update(0, 3)
   - trackEvent('game_start')
   - **recordViewEvent('screen_transition')** â€” ready â†’ gameplay
   - Call playSequence()

3. **playSequence()** â€” plays first `currentSequenceLength` steps:
   - **Flush deferred endProblem** from previous round (if pending)
   - **signalCollector.startProblem()** for current round
   - Set phase = 'playback', disable all buttons
   - Update #phase-label to "Watch carefully..."
   - **recordViewEvent('content_render')** â€” round_start with sequence info
   - Determine playbackSpeed: length 1-3 -> 0.8s, 4-6 -> 0.5s, 7-10 -> 0.3s
   - Flash each button in sequence with delay
   - After all flashes: set phase = 'input', enable buttons
   - Update #phase-label to "Your turn!"
   - **recordViewEvent('visual_update')** â€” phase changed to input
   - Set roundStartTime = Date.now()

4. **handleSimonTap(colorIndex)** â€” player taps a button:
   - If phase !== 'input' || !isActive, return
   - Set phase = 'feedback' (prevent double-tap)
   - Validate: colorIndex === sequence[playerIndex]
   - recordAttempt, trackEvent
   - **Correct tap:**
     - Show pressed class briefly, increment playerIndex
     - **recordViewEvent('feedback_display')** â€” correct
     - If playerIndex === currentSequenceLength â†’ round complete:
       - score++, currentRound++, progressBar.update
       - **Defer endProblem** with correct outcome
       - If currentSequenceLength >= 10 â†’ endGame('victory')
       - Else â†’ currentSequenceLength++, playerIndex = 0, delay, playSequence() (which flushes deferred endProblem)
     - Else: phase = 'input' (ready for next tap)
   - **Wrong tap:**
     - Flash wrong on tapped, correct on expected
     - lives--, progressBar.update
     - **recordViewEvent('feedback_display')** â€” wrong
     - If lives <= 0 â†’ **defer endProblem** (incorrect), endGame('game_over')
     - Else â†’ playerIndex = 0, delay, replay same sequence (problem stays active through retries)

5. **endGame(reason):** (PART-011)
   - isActive = false, phase = 'idle'
   - timer.stop()
   - Stars = lives remaining (3/2/1/0)
   - trackEvent('game_end') BEFORE signal sealing
   - **Flush deferred endProblem** (PART-010)
   - **signalCollector.seal()** â†’ signalPayload
   - **recordViewEvent('screen_transition')** â€” gameplay â†’ results
   - showResults, postMessage with `...signalPayload`
   - Cleanup: timer, progressBar, visibilityTracker, audio

---

## 8. Functions

### Global Scope (RULE-001)

### Color Sounds (for dynamic audio)

```javascript
const colorNames = ['red', 'blue', 'yellow', 'green'];
const colorSounds = ['beep red', 'beep blue', 'beep yellow', 'beep green'];
```

**delay(ms)** â€” utility

- `return new Promise(resolve => setTimeout(resolve, ms))`

**startGame()**

- const content = gameState.content || fallbackContent
- gameState.sequence = content.sequence
- gameState.lives = 3
- gameState.totalLives = 3
- gameState.currentSequenceLength = 1
- gameState.playerIndex = 0
- gameState.phase = 'idle'
- gameState.currentRound = 0
- gameState.score = 0
- gameState.attempts = []
- gameState.events = []
- gameState.roundTimes = []
- gameState.pendingEndProblem = null
- gameState.startTime = Date.now()
- gameState.isActive = true
- gameState.duration_data.startTime = new Date().toISOString()
- timer.start()
- progressBar.update(0, 3)
- trackEvent('game_start', 'game')
- if (signalCollector) signalCollector.recordViewEvent('screen_transition', { screen: 'gameplay', metadata: { transition_from: 'start' } })
- playSequence()

**async playSequence()**

- // Flush deferred endProblem from previous round
- if (signalCollector && gameState.pendingEndProblem) { signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome); gameState.pendingEndProblem = null; }
- const roundNumber = gameState.currentRound + 1
- const len = gameState.currentSequenceLength
- // Start signal collection for this round
- if (signalCollector) { signalCollector.startProblem('round\_' + roundNumber, { round_number: roundNumber, sequence_length: len, sequence_colors: gameState.sequence.slice(0, len).map(i => colorNames[i]) }) }
- gameState.phase = 'playback'
- document.getElementById('phase-label').textContent = 'Watch carefully...'
- // Disable all buttons
- for (let i = 0; i < 4; i++) { document.getElementById('btn-color-' + i).disabled = true; }
- // Determine speed
- const speed = len <= 3 ? 0.8 : len <= 6 ? 0.5 : 0.3
- gameState.playbackSpeed = speed
- trackEvent('playback_start', 'game', { length: len, speed })
- if (signalCollector) signalCollector.recordViewEvent('content_render', { screen: 'gameplay', content_snapshot: { round: roundNumber, sequence_length: len, playback_speed: speed, trigger: 'round_start' }, components: { timer: timer ? { value: timer.getCurrentTime(), state: 'running' } : null, progress: { current: gameState.currentRound, total: gameState.totalRounds } } })
- // Play each step
- for (let i = 0; i < len; i++) {
  await delay(300)
  await flashButton(gameState.sequence[i], speed \* 1000)
  }
- trackEvent('playback_end', 'game', { length: len })
- await delay(500)
- // Enter input phase
- gameState.phase = 'input'
- gameState.playerIndex = 0
- for (let i = 0; i < 4; i++) { document.getElementById('btn-color-' + i).disabled = false; }
- document.getElementById('phase-label').textContent = 'Your turn!'
- gameState.roundStartTime = Date.now()
- if (signalCollector) signalCollector.recordViewEvent('visual_update', { screen: 'gameplay', content_snapshot: { type: 'phase_change', phase: 'input', round: roundNumber, sequence_length: len } })

**async flashButton(colorIndex, durationMs)**

- const btn = document.getElementById('btn-color-' + colorIndex)
- btn.classList.add('flash')
- try { await FeedbackManager.playDynamicFeedback({ audio_content: colorSounds[colorIndex], subtitle: '' }); } catch(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- await delay(durationMs)
- btn.classList.remove('flash')

**async handleSimonTap(colorIndex)** (onclick handler â€” global scope)

- if (gameState.phase !== 'input' || !gameState.isActive) return
- gameState.phase = 'feedback'
- const expectedColor = gameState.sequence[gameState.playerIndex]
- const isCorrect = colorIndex === expectedColor
- const btn = document.getElementById('btn-color-' + colorIndex)
- trackEvent(isCorrect ? 'button_correct' : 'button_wrong', 'simon-btn', { step: gameState.playerIndex, expected: expectedColor, actual: colorIndex })
- recordAttempt({ input_of_user: { action: 'simon_tap', colorIndex, colorName: colorNames[colorIndex] }, correct: isCorrect, metadata: { round: gameState.currentRound + 1, sequenceStep: gameState.playerIndex + 1, expectedColor, expectedColorName: colorNames[expectedColor], sequenceLength: gameState.currentSequenceLength, validationType: 'function' } })
- if (isCorrect):
  - await handleCorrectTap(colorIndex, btn)
- else:
  - await handleWrongTap(colorIndex, expectedColor, btn)

**async handleCorrectTap(colorIndex, btn)**

- btn.classList.add('pressed')
- try { await FeedbackManager.sound.play('correct_tap'); } catch(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- if (signalCollector) signalCollector.recordViewEvent('feedback_display', { screen: 'gameplay', content_snapshot: { feedback_type: 'correct', color: colorNames[colorIndex], step: gameState.playerIndex + 1, sequence_length: gameState.currentSequenceLength } })
- await delay(200)
- btn.classList.remove('pressed')
- gameState.playerIndex++
- if (gameState.playerIndex >= gameState.currentSequenceLength):
  - // Round complete
  - const roundTime = Math.round((Date.now() - gameState.roundStartTime) / 1000 \* 10) / 10
  - gameState.roundTimes.push(roundTime)
  - gameState.score++
  - gameState.currentRound++
  - progressBar.update(gameState.currentRound, gameState.lives)
  - trackEvent('sequence_complete', 'game', { length: gameState.currentSequenceLength, roundTime })
  - try { await FeedbackManager.playDynamicFeedback({ audio_content: 'great memory!', subtitle: 'Great!' }); } catch(e) {}
  - if (signalCollector) signalCollector.recordViewEvent('feedback_display', { screen: 'gameplay', content_snapshot: { feedback_type: 'sequence_complete', sequence_length: gameState.currentSequenceLength, round_time: roundTime } })
  - // Defer endProblem â€” will be flushed at next playSequence or endGame
  - gameState.pendingEndProblem = { id: 'round\_' + gameState.currentRound, outcome: { correct: true, answer: gameState.sequence.slice(0, gameState.currentSequenceLength).map(i => colorNames[i]).join(',') } }
  - if (signalCollector) signalCollector.recordCustomEvent('round_solved', { correct: true, round: gameState.currentRound, sequence_length: gameState.currentSequenceLength })
  - if (gameState.currentSequenceLength >= 10):
    - await delay(800)
    - endGame('victory')
  - else:
    - gameState.currentSequenceLength++
    - gameState.playerIndex = 0
    - await delay(1000)
    - playSequence()
- else:
  - gameState.phase = 'input'

**async handleWrongTap(colorIndex, expectedColor, btn)**

- btn.classList.add('wrong-flash')
- const correctBtn = document.getElementById('btn-color-' + expectedColor)
- correctBtn.classList.add('correct-flash')
- gameState.lives--
- progressBar.update(gameState.currentRound, gameState.lives)
- trackEvent('life_lost', 'game', { livesRemaining: gameState.lives })
- try { await FeedbackManager.sound.play('wrong_tap'); } catch(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- try { await FeedbackManager.playDynamicFeedback({ audio_content: 'oh no, wrong button!', subtitle: 'Wrong!' }); } catch(e) {}
- if (signalCollector) signalCollector.recordViewEvent('feedback_display', { screen: 'gameplay', content_snapshot: { feedback_type: 'wrong', tapped_color: colorNames[colorIndex], expected_color: colorNames[expectedColor], lives_remaining: gameState.lives } })
- await delay(1500)
- btn.classList.remove('wrong-flash')
- correctBtn.classList.remove('correct-flash')
- if (gameState.lives <= 0):
  - // Defer endProblem for game_over
  - gameState.pendingEndProblem = { id: 'round\_' + (gameState.currentRound + 1), outcome: { correct: false, answer: null } }
  - if (signalCollector) signalCollector.recordCustomEvent('round_failed', { reason: 'lives_exhausted', step: gameState.playerIndex })
  - endGame('game_over')
- else:
  - // Replay same sequence â€” problem stays active through retries
  - gameState.playerIndex = 0
  - if (signalCollector) signalCollector.recordViewEvent('visual_update', { screen: 'gameplay', content_snapshot: { type: 'sequence_retry', sequence_length: gameState.currentSequenceLength, lives_remaining: gameState.lives } })
  - playSequence()

**async endGame(reason)**

- if (gameState.gameEnded) return
- gameState.gameEnded = true
- gameState.isActive = false
- gameState.phase = 'idle'
- gameState.duration_data.currentTime = new Date().toISOString()
- // Disable all buttons
- for (let i = 0; i < 4; i++) { document.getElementById('btn-color-' + i).disabled = true; }
- timer.stop()
- const totalTime = timer.getTimeTaken ? timer.getTimeTaken() : Math.round((Date.now() - gameState.startTime) / 1000)
- const correctAttempts = gameState.attempts.filter(a => a.correct).length
- const totalAttempts = gameState.attempts.length
- const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) \* 100) : 0
- let stars = 0
- if (reason === 'victory'):
  - stars = gameState.lives // 3/2/1 based on lives remaining
- else:
  - stars = 0
- const metrics = { accuracy, time: totalTime, stars, attempts: gameState.attempts, duration_data: { ...gameState.duration_data, currentTime: new Date().toISOString() }, score: gameState.score, totalRounds: gameState.totalRounds, livesRemaining: gameState.lives, longestSequence: gameState.currentSequenceLength, roundTimes: gameState.roundTimes, reason }
- console.log('Final Metrics:', JSON.stringify(metrics, null, 2))
- console.log('Attempt History:', JSON.stringify(gameState.attempts, null, 2))
- trackEvent('game_end', 'game', { reason, score: gameState.score, accuracy, stars, time: totalTime })
- // Flush deferred endProblem before sealing (PART-010)
- if (signalCollector && gameState.pendingEndProblem) { signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome); gameState.pendingEndProblem = null; }
- // Seal SignalCollector â€” detaches listeners, computes final signals (PART-010)
- const signalPayload = signalCollector ? signalCollector.seal() : { events: [], signals: {}, metadata: {} }
- if (reason === 'victory'):
  - try { await FeedbackManager.playDynamicFeedback({ audio_content: 'Amazing! You remembered all 10 steps!', subtitle: 'Perfect memory!' }); } catch(e) {}
- else:
  - try { await FeedbackManager.playDynamicFeedback({ audio_content: 'Oh no, you ran out of lives! Better luck next time!', subtitle: 'Out of lives!' }); } catch(e) {}
- if (signalCollector) signalCollector.recordViewEvent('screen_transition', { screen: 'results', metadata: { transition_from: 'gameplay', reason } })
- showResults(metrics, reason)
- window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts: gameState.attempts, ...signalPayload, completedAt: Date.now() } }, '\*')
- if (timer) { timer.destroy(); timer = null; }
- if (progressBar) { progressBar.destroy(); progressBar = null; }
- if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
- try { FeedbackManager.sound.stopAll(); FeedbackManager.stream.stopAll(); } catch(e) {}

**showResults(metrics, reason)**

- document.getElementById('game-screen').style.display = 'none'
- document.getElementById('results-screen').style.display = 'flex'
- document.getElementById('results-title').textContent = reason === 'victory' ? 'Perfect Memory!' : 'Game Over'
- document.getElementById('result-score').textContent = `${metrics.score}/${metrics.totalRounds}`
- document.getElementById('result-time').textContent = formatTime(metrics.time)
- document.getElementById('result-longest').textContent = metrics.longestSequence
- document.getElementById('result-lives').textContent = metrics.livesRemaining
- document.getElementById('result-accuracy').textContent = `${metrics.accuracy}%`
- const starsDisplay = document.getElementById('stars-display')
- starsDisplay.innerHTML = ''
- for (let i = 0; i < 3; i++) { starsDisplay.innerHTML += i < metrics.stars ? 'â­' : 'â˜†'; }

**formatTime(seconds)**

- const m = Math.floor(seconds / 60)
- const s = Math.floor(seconds % 60)
- return m + ':' + String(s).padStart(2, '0')

**restartGame()** (onclick handler â€” global scope)

- // Reset all gameState fields
- gameState.gameEnded = false
- gameState.currentRound = 0
- gameState.score = 0
- gameState.attempts = []
- gameState.events = []
- gameState.isActive = false
- gameState.startTime = null
- gameState.lives = 3
- gameState.currentSequenceLength = 1
- gameState.playerIndex = 0
- gameState.phase = 'idle'
- gameState.roundTimes = []
- gameState.pendingEndProblem = null
- gameState.duration_data = { startTime: null, preview: [], attempts: [], evaluations: [], inActiveTime: [], totalInactiveTime: 0, currentTime: null }
- // Recreate SignalCollector (endGame sealed it)
- signalCollector = new SignalCollector({ sessionId: window.gameVariableState?.sessionId || 'session\_' + Date.now(), studentId: window.gameVariableState?.studentId || null, templateId: gameState.gameId || null })
- window.signalCollector = signalCollector
- // Recreate timer
- timer = new TimerComponent('timer-container', { timerType: 'increase', startTime: 0, autoStart: false, format: 'min' })
- // Recreate progressBar
- progressBar = new ProgressBarComponent({ autoInject: true, totalRounds: 10, totalLives: 3, slotId: 'mathai-progress-slot' })
- // Recreate visibilityTracker with timer + signalCollector pause/resume
- visibilityTracker = new VisibilityTracker({
  onInactive: () => {
  if (timer) timer.pause();
  if (signalCollector) signalCollector.pause();
  try { FeedbackManager.sound.stopAll(); } catch(e) {}
  gameState.duration_data.inActiveTime.push({ start: Date.now() });
  },
  onResume: () => {
  if (timer) timer.resume();
  if (signalCollector) signalCollector.resume();
  const last = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
  if (last && !last.end) { last.end = Date.now(); gameState.duration_data.totalInactiveTime += (last.end - last.start); }
  }
  })
- document.getElementById('results-screen').style.display = 'none'
- document.getElementById('game-screen').style.display = 'flex'
- transitionScreen.show({ icons: ['ðŸŽµ'], iconSize: 'large', title: 'Simon Says', subtitle: 'Watch and repeat the sequence!', buttons: [{ text: "Let's go!", type: 'primary', action: () => startGame() }] })

**handlePostMessage(event)**

- if (!event.data || event.data.type !== 'game_init') return
- try: gameState.content = event.data.data.content
- catch(e): console.error('PostMessage error:', JSON.stringify({ error: e.message }, null, 2))

**recordAttempt(data)**

- Standard attempt shape from PART-009:
- gameState.attempts.push({ ...data, attempt_number: gameState.attempts.length + 1, attempt_timestamp: new Date().toISOString(), time_since_start: gameState.startTime ? Date.now() - gameState.startTime : 0 })
- gameState.duration_data.attempts.push(new Date().toISOString())

**trackEvent(type, target, data = {})**

- Standard event tracking from PART-010:
- gameState.events.push({ type, target, data, timestamp: new Date().toISOString() })

### Inside DOMContentLoaded (PART-004)

```javascript
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForPackages();
    await FeedbackManager.init();

    // Sentry initialization (PART-030)
    try {
      const sentryConfig = new SentryConfig({
        gameId: 'game_simon_says',
        version: '1.0.0',
      });
      Sentry.init(sentryConfig.getConfig());
    } catch (e) {
      console.error('Sentry init error:', JSON.stringify({ error: e.message }, null, 2));
    }

    try {
      await FeedbackManager.sound.preload([
        { id: 'correct_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3' },
        { id: 'wrong_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3' },
      ]);
    } catch (e) {
      console.error('Sound registration error:', JSON.stringify({ error: e.message }, null, 2));
    }

    // SignalCollector init (PART-010) â€” AFTER FeedbackManager, BEFORE Timer/VisibilityTracker
    signalCollector = new SignalCollector({
      sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(),
      studentId: window.gameVariableState?.studentId || null,
      templateId: gameState.gameId || null,
    });
    window.signalCollector = signalCollector;

    timer = new TimerComponent('timer-container', {
      timerType: 'increase',
      startTime: 0,
      autoStart: false,
      format: 'min',
    });

    const layout = ScreenLayout.inject('app', { slots: { progressBar: true, transitionScreen: true } });
    const gameContent = document.getElementById('gameContent');
    const template = document.getElementById('game-template');
    gameContent.appendChild(template.content.cloneNode(true));

    progressBar = new ProgressBarComponent({
      autoInject: true,
      totalRounds: 10,
      totalLives: 3,
      slotId: 'mathai-progress-slot',
    });
    transitionScreen = new TransitionScreenComponent({ autoInject: true });
    visibilityTracker = new VisibilityTracker({
      onInactive: () => {
        if (timer) timer.pause();
        if (signalCollector) signalCollector.pause();
        try {
          FeedbackManager.sound.stopAll();
        } catch (e) {}
        gameState.duration_data.inActiveTime.push({ start: Date.now() });
      },
      onResume: () => {
        if (timer) timer.resume();
        if (signalCollector) signalCollector.resume();
        const last = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
        if (last && !last.end) {
          last.end = Date.now();
          gameState.duration_data.totalInactiveTime += last.end - last.start;
        }
      },
    });

    if (!gameState.content) gameState.content = fallbackContent;
    window.addEventListener('message', handlePostMessage);
    window.parent.postMessage({ type: 'game_ready' }, '*');

    transitionScreen.show({
      icons: ['ðŸŽµ'],
      iconSize: 'large',
      title: 'Simon Says',
      subtitle: 'Watch and repeat the sequence!',
      buttons: [{ text: "Let's go!", type: 'primary', action: () => startGame() }],
    });
  } catch (e) {
    console.error('Init error:', JSON.stringify({ error: e.message }, null, 2));
  }
});
```

### Window-Attached Debug (PART-012)

```javascript
window.debugGame = () => {
  console.log(
    'Game State:',
    JSON.stringify(
      {
        currentRound: gameState.currentRound,
        totalRounds: gameState.totalRounds,
        lives: gameState.lives,
        score: gameState.score,
        phase: gameState.phase,
        currentSequenceLength: gameState.currentSequenceLength,
        playerIndex: gameState.playerIndex,
        playbackSpeed: gameState.playbackSpeed,
        sequence: gameState.sequence,
        roundTimes: gameState.roundTimes,
        isActive: gameState.isActive,
        pendingEndProblem: gameState.pendingEndProblem,
      },
      null,
      2,
    ),
  );
};
window.debugAudio = () => {
  console.log('FeedbackManager available:', typeof FeedbackManager !== 'undefined');
};
window.testAudio = async (id) => {
  try {
    await FeedbackManager.sound.play(id || 'correct_tap');
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }, null, 2));
  }
};
window.testPause = () => {
  if (timer) timer.pause();
};
window.testResume = () => {
  if (timer) timer.resume();
};
window.debugSignals = () => {
  if (signalCollector) {
    console.log('Signal Debug:', JSON.stringify(signalCollector.debug(), null, 2));
  } else {
    console.log('SignalCollector not initialized');
  }
};

// Window exposure block — ensures onclick handlers work regardless of scope wrapping
window.handleSimonTap = handleSimonTap;
window.restartGame = restartGame;
window.startGame = startGame;
```

---

## 9. Event Schema

### Game Lifecycle Events

| Event      | Target | When Fired  |
| ---------- | ------ | ----------- |
| game_start | game   | startGame() |
| game_end   | game   | endGame()   |

### Game-Specific Events

| Event             | Target    | When Fired                               | Data                       |
| ----------------- | --------- | ---------------------------------------- | -------------------------- |
| button_correct    | simon-btn | Player taps correct color                | { step, expected, actual } |
| button_wrong      | simon-btn | Player taps wrong color                  | { step, expected, actual } |
| sequence_complete | game      | Player completes full sequence for round | { length, roundTime }      |
| life_lost         | game      | Player loses a life                      | { livesRemaining }         |
| playback_start    | game      | Sequence playback begins                 | { length, speed }          |
| playback_end      | game      | Sequence playback finishes               | { length }                 |

### SignalCollector View Events

| View Type         | When Emitted                                                                                     | Key Data                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| screen_transition | startGame (startâ†’gameplay), endGame (gameplayâ†’results)                                       | screen, metadata.transition_from                               |
| content_render    | playSequence â€” new round playback starts                                                       | round, sequence_length, playback_speed, trigger: 'round_start' |
| feedback_display  | handleCorrectTap (correct tap), handleWrongTap (wrong tap), handleCorrectTap (sequence complete) | feedback_type, color/step details                              |
| visual_update     | playSequence after input phase begins, handleWrongTap (sequence retry)                           | type: 'phase_change' / 'sequence_retry'                        |

### SignalCollector Problem Lifecycle

| Method                | When Called                                                                                       | Data                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| startProblem          | playSequence() â€” after flush                                                                    | 'round_N' with round_number, sequence_length, sequence_colors |
| endProblem (deferred) | playSequence() / endGame() â€” flush from pendingEndProblem                                       | correct, answer (color sequence or null on game_over)         |
| recordCustomEvent     | handleCorrectTap on round complete ('round_solved'), handleWrongTap on game_over ('round_failed') | correct, round, sequence_length / reason                      |
| seal()                | endGame() â€” before postMessage                                                                  | Returns { events, signals, metadata }                         |

**Note:** Problem stays active through wrong taps that don't end the game. When the player taps wrong and still has lives, the same sequence replays â€” the SignalCollector problem continues capturing retry interactions. endProblem is only deferred when a sequence is fully completed (correct) or when lives reach 0 (game_over).

---

## 10. Scaffold Points

| Point            | Function         | When                          | What Can Be Injected                        |
| ---------------- | ---------------- | ----------------------------- | ------------------------------------------- |
| after_incorrect  | handleWrongTap() | Player taps wrong button      | Hint: highlight correct button, slow replay |
| before_round     | playSequence()   | New sequence playback starts  | Strategy tip, difficulty preview            |
| on_slow_response | handleSimonTap() | Player takes >5s between taps | Encouragement, reminder of sequence         |
| after_life_lost  | handleWrongTap() | Life decremented              | Motivational message, offer slower replay   |

### Scaffold Integration Notes

- Scaffolds are optional â€” game works without them
- Each scaffold point must have a no-op default (game continues normally if no scaffold is provided)
- Scaffold content is provided via postMessage (same channel as game content)

---

## 11. Feedback Triggers

| Moment                       | Trigger              | Feedback Type                                                     |
| ---------------------------- | -------------------- | ----------------------------------------------------------------- |
| Button flash during playback | flashButton()        | dynamic audio per color (colorSounds)                             |
| Correct tap                  | handleCorrectTap()   | registered sound (correct_tap) + pressed class                    |
| Wrong tap                    | handleWrongTap()     | registered sound (wrong_tap) + dynamic TTS "oh no, wrong button!" |
| Sequence complete            | handleCorrectTap()   | dynamic TTS "great memory!"                                       |
| Victory                      | endGame('victory')   | dynamic TTS with completion message                               |
| Game over                    | endGame('game_over') | dynamic TTS with encouragement                                    |

### Sound Registration

```javascript
await FeedbackManager.sound.preload([
  { id: 'correct_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3' },
  { id: 'wrong_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3' },
]);
```

---

## 12. Visual Specifications

- **Layout:** 2x2 grid of large colored quadrant buttons, max-width 280px, centered
- **Color palette:** Red (#E74C3C), Blue (#3498DB), Yellow (#F1C40F), Green (#2ECC71), background var(--mathai-light-gray)
- **Typography:** var(--mathai-font-family), title 24px, body 16px, label 14px
- **Spacing:** Container padding 16px, grid gap 12px, section gap 16px
- **Interactive states:** Buttons at 0.7 opacity normally, 1.0 + brightness(1.4) when flashing, scale(0.95) on press, wrong-flash dims to brightness(0.6), correct-flash glows green
- **Transitions:** Flash duration varies by difficulty (0.8s/0.5s/0.3s), pressed feedback 200ms, wrong feedback 1.5s hold
- **Responsive:** Max-width 480px wrapper, 100dvh, grid scales within container

---

## 13. Test Scenarios

> These scenarios are consumed by the ralph loop to generate `tests/game.spec.js`.
> Every scenario must specify exact selectors, exact actions, and exact assertions.

### Scenario: Complete game with all correct answers (perfect run to sequence length 10)

```
SETUP: Page loaded, TransitionScreen start dismissed, gameState.isActive === true
ACTIONS:
  For each round r from 1 to 10:
    Wait for #phase-label text to be "Your turn!"
    For step s from 0 to r-1:
      Click #btn-color-{fallbackContent.sequence[s]}
    Wait 1000ms for round transition
ASSERT:
  gameState.score == 10
  gameState.lives == 3
  #results-screen is visible
  #result-score text is "10/10"
  #result-lives text is "3"
  #result-accuracy text is "100%"
  stars display shows 3 stars
  signalCollector.seal() was called
  postMessage data includes events, signals, metadata keys
```

### Scenario: First round correct tap (sequence[0] = 0 = red)

```
SETUP: Page loaded, game started, wait for #phase-label "Your turn!"
ACTIONS:
  Click #btn-color-0
ASSERT:
  gameState.score == 1
  gameState.currentRound == 1
  gameState.currentSequenceLength == 2
  pendingEndProblem set with { id: 'round_1', outcome: { correct: true } }
  After playSequence for round 2: pendingEndProblem flushed, startProblem('round_2') called
```

### Scenario: Wrong tap loses a life

```
SETUP: Page loaded, game started, wait for #phase-label "Your turn!"
ACTIONS:
  Click #btn-color-3 (green, but expected is #btn-color-0 red per fallback sequence[0]=0)
ASSERT:
  gameState.lives == 2
  .wrong-flash class visible on #btn-color-3
  .correct-flash class visible on #btn-color-0
  gameState.attempts[0].correct == false
  pendingEndProblem is null (problem stays active â€” same sequence replays)
  After 1.5s: wrong-flash and correct-flash removed, playSequence replays round 1
```

### Scenario: Three wrong taps triggers game over

```
SETUP: Page loaded, game started
ACTIONS:
  Wait for #phase-label "Your turn!"
  Click #btn-color-3 (wrong, expected 0) â€” life lost (2 remaining)
  Wait for playback to complete, #phase-label "Your turn!"
  Click #btn-color-3 (wrong again) â€” life lost (1 remaining)
  Wait for playback to complete, #phase-label "Your turn!"
  Click #btn-color-3 (wrong again) â€” life lost (0 remaining)
ASSERT:
  gameState.lives == 0
  gameState.isActive == false
  pendingEndProblem was set with { correct: false } and flushed in endGame
  signalCollector was sealed
  #results-screen eventually visible
  #result-lives text is "0"
  stars display shows 0 stars
```

### Scenario: Buttons disabled during playback phase

```
SETUP: Page loaded, game started, during playback phase
ACTIONS:
  Immediately try to click #btn-color-0 before #phase-label shows "Your turn!"
ASSERT:
  #btn-color-0 has disabled attribute
  gameState.phase == 'playback'
  gameState.playerIndex == 0 (unchanged)
  gameState.attempts.length == 0
```

### Scenario: Playback speed increases with sequence length

```
SETUP: Complete rounds 1-3 correctly (short sequences)
ACTIONS:
  Observe playback timing for round 4 (sequence length 4)
ASSERT:
  gameState.playbackSpeed == 0.5 (length 4 is in range 4-6)
  After completing rounds 1-6, round 7 playback:
  gameState.playbackSpeed == 0.3 (length 7 is in range 7-10)
```

### Scenario: Stars based on lives remaining

```
ASSERT:
  0 wrong taps, victory -> 3 lives -> 3 stars
  1 wrong tap, victory -> 2 lives -> 2 stars
  2 wrong taps, victory -> 1 life -> 1 star
  game over (3 wrong) -> 0 lives -> 0 stars
```

### Scenario: Game sends postMessage on complete

```
SETUP: Complete all 10 rounds or lose all lives
ASSERT:
  window.parent.postMessage called with { type: 'game_complete', data: { metrics, attempts, events, signals, metadata, completedAt } }
  metrics contains: score, totalRounds, stars, accuracy, time, livesRemaining, longestSequence, roundTimes, attempts, duration_data, reason
  postMessage data includes ...signalPayload (events, signals, metadata from SignalCollector)
```

### Scenario: Restart resets everything

```
SETUP: Game completed, results screen visible
ACTIONS:
  Click #btn-restart
ASSERT:
  #results-screen is hidden
  #game-screen is visible
  gameState.lives == 3
  gameState.currentSequenceLength == 1
  gameState.playerIndex == 0
  gameState.score == 0
  gameState.currentRound == 0
  gameState.pendingEndProblem == null
  signalCollector recreated (new instance)
  timer, progressBar, visibilityTracker recreated
  transition screen shows
```

### Scenario: VisibilityTracker pauses/resumes timer and SignalCollector

```
SETUP: Game active, timer running
ACTIONS:
  Trigger visibility change (tab hidden)
ASSERT:
  timer is paused
  signalCollector.pause() called
  FeedbackManager.sound.stopAll() called
  duration_data.inActiveTime has new entry with start timestamp
ACTIONS:
  Trigger visibility change (tab visible)
ASSERT:
  timer is resumed
  signalCollector.resume() called
  duration_data.inActiveTime last entry has end timestamp
  duration_data.totalInactiveTime is updated
```

### Scenario: SignalCollector lifecycle across rounds

```
SETUP: Start game, play through round 1 and into round 2
ACTIONS:
  startGame -> playSequence (round 1)
  // signalCollector.startProblem('round_1') called
  complete sequence for round 1 (tap correct color)
  // handleCorrectTap -> pendingEndProblem = { id: 'round_1', outcome: { correct: true } }
  // after delay -> playSequence (round 2)
  // playSequence flushes: signalCollector.endProblem('round_1', ...)
  // playSequence starts: signalCollector.startProblem('round_2', ...)
ASSERT:
  signalCollector.getProblemSignals('round_1') is not null
  problem 'round_2' is now active
  recordViewEvent called for content_render with round 2 data
```

### Scenario: PostMessage game_init loads custom content

```
SETUP: Page loaded
ACTIONS:
  Send postMessage { type: 'game_init', data: { content: { sequence: [3, 2, 1, 0, 3, 2, 1, 0, 3, 2] } } }
ASSERT:
  gameState.content.sequence deep equals [3, 2, 1, 0, 3, 2, 1, 0, 3, 2]
```

---

## 14. Verification Checklist

### Structural

- [ ] DOCTYPE, meta charset, meta viewport
- [ ] Package scripts in correct order (PART-002)
- [ ] Single style + single script (RULE-007)
- [ ] #app, #game-screen, #results-screen
- [ ] #timer-container div exists inside game-screen
- [ ] `<template id="game-template">` wraps game content
- [ ] `data-signal-id` on phase-label, simon-grid, all 4 simon buttons, btn-restart (static in template)

### Functional

- [ ] waitForPackages with 10s timeout (PART-003)
- [ ] Init sequence correct (PART-004)
- [ ] VisibilityTracker with timer.pause/resume AND signalCollector.pause/resume (PART-005)
- [ ] TimerComponent created with timerType 'increase', startTime 0, autoStart false (PART-006)
- [ ] PostMessage handling (PART-008)
- [ ] Fallback content with verified 10-step sequence (PART-008)
- [ ] recordAttempt shape (PART-009)
- [ ] trackEvent fires at all interaction points (PART-010)
- [ ] `gameId: 'game_simon_says'` is first property in gameState
- [ ] `gameEnded` flag in gameState, checked/set in endGame, reset in restartGame
- [ ] `window.parent.postMessage({ type: 'game_ready' }, '*')` after message listener registration
- [ ] Sentry initialized via SentryConfig in DOMContentLoaded (PART-030)
- [ ] Window exposure block: `window.handleSimonTap`, `window.restartGame`, `window.startGame`
- [ ] endGame: double-call guard via gameEnded, flush deferred endProblem â†’ seal SignalCollector â†’ show results â†’ postMessage with signalPayload â†’ cleanup (PART-011)
- [ ] Debug functions on window (PART-012)
- [ ] Validation function: colorIndex === sequence[playerIndex] (PART-014)
- [ ] showResults populates all fields (PART-019)
- [ ] No anti-patterns (PART-026)

### SignalCollector (PART-010)

- [ ] `signalCollector` variable declared at top level alongside other components
- [ ] SignalCollector initialized in DOMContentLoaded after FeedbackManager.init(), BEFORE Timer/VisibilityTracker
- [ ] `window.signalCollector` assigned
- [ ] `gameState.pendingEndProblem` field in gameState
- [ ] `startProblem('round_N')` called in playSequence() after flushing previous
- [ ] Deferred `endProblem` pattern: pendingEndProblem set in handleCorrectTap (sequence complete, correct) and handleWrongTap (game_over, incorrect)
- [ ] Flush in playSequence() before startProblem
- [ ] Flush in endGame() before seal()
- [ ] `seal()` called in endGame AFTER flush, BEFORE postMessage
- [ ] `...signalPayload` spread in postMessage data
- [ ] `recordViewEvent('screen_transition')` in startGame and endGame
- [ ] `recordViewEvent('content_render')` in playSequence (round start with timer state)
- [ ] `recordViewEvent('feedback_display')` in handleCorrectTap (correct tap + sequence complete) and handleWrongTap (wrong tap)
- [ ] `recordViewEvent('visual_update')` in playSequence (phase change to input) and handleWrongTap (sequence retry)
- [ ] `recordCustomEvent('round_solved')` in handleCorrectTap on sequence complete
- [ ] `recordCustomEvent('round_failed')` in handleWrongTap on game_over
- [ ] `signalCollector.pause()` in VisibilityTracker onInactive
- [ ] `signalCollector.resume()` in VisibilityTracker onResume
- [ ] SignalCollector recreated in restartGame()
- [ ] `window.debugSignals` function attached
- [ ] **No inline SignalCollector stub** (Anti-Pattern 18)
- [ ] Problem stays active through wrong taps that don't end game (replay same sequence)

### Design & Layout

- [ ] CSS variables (PART-020)
- [ ] Gameplay feedback uses correct colors â€” flash/pressed/wrong/correct classes (PART-020)
- [ ] `.page-center` / `.game-wrapper` / `.game-stack` layout structure (PART-021)
- [ ] 480px max, 100dvh (PART-021)
- [ ] game-btn + btn-primary (PART-022)
- [ ] ProgressBar: 10 rounds, 3 lives (PART-023)
- [ ] update() with rounds COMPLETED (PART-023)
- [ ] TransitionScreen: start, victory, game-over (PART-024)
- [ ] ScreenLayout.inject before components (PART-025)
- [ ] Template cloneNode (PART-025)

### Rules

- [ ] RULE-001: All onclick handlers (handleSimonTap, restartGame) in global scope
- [ ] RULE-002: All async functions have async keyword (playSequence, flashButton, handleSimonTap, handleCorrectTap, handleWrongTap, endGame)
- [ ] RULE-003: All async calls in try/catch
- [ ] RULE-004: All logging uses JSON.stringify
- [ ] RULE-005: Cleanup in endGame: timer, progressBar, visibilityTracker, audio
- [ ] RULE-006: No new Audio(), setInterval for timer, SubtitleComponent.show()
- [ ] RULE-007: Single file, no external CSS/JS

### Game-Specific

- [ ] 4 simon buttons exist with correct IDs (btn-color-0 through btn-color-3)
- [ ] Buttons disabled during playback phase, enabled during input phase
- [ ] Phase label updates correctly: "Watch carefully..." during playback, "Your turn!" during input
- [ ] Flash animation uses brightness(1.4) and lasts correct duration per speed tier
- [ ] Playback speed tiers correct: 0.8s (len 1-3), 0.5s (len 4-6), 0.3s (len 7-10)
- [ ] Wrong tap shows both wrong-flash on tapped and correct-flash on expected
- [ ] After wrong tap (with lives > 0), same sequence replays (not advanced)
- [ ] Sequence length increments only on successful completion
- [ ] Victory triggers at sequence length 10 completed
- [ ] Game over triggers at 0 lives
- [ ] Star rating: lives remaining (3/2/1/0)
- [ ] progressBar.update called with (roundsCompleted, livesRemaining)
- [ ] Dynamic audio uses FeedbackManager.playDynamicFeedback, not new Audio()
- [ ] `window.gameState`, restartGame recreates all components + signalCollector
- [ ] phase = 'feedback' prevents double-tap during processing

### Contract Compliance

- [ ] gameState matches contracts/game-state.schema.json
- [ ] Attempts match contracts/attempt.schema.json
- [ ] Metrics match contracts/metrics.schema.json
- [ ] duration_data matches contracts/duration-data.schema.json
- [ ] postMessage out matches contracts/postmessage-out.schema.json
- [ ] postMessage data includes ...signalPayload (events, signals, metadata from SignalCollector)
