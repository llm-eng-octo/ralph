# Totals in a Flash â€” Game-Specific Template (Assembly Book)

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

---

## 1. Game Identity

- **Title:** Totals in a Flash
- **Game ID:** game_totals_in_a_flash
- **Type:** standard
- **Description:** Speed mental arithmetic â€” numbers flash on screen one by one (visual + TTS audio). Player keeps a running total in their head, then enters the final sum. 5 rounds of increasing difficulty with 3 lives. For grades 6-8.

---

## 2. Parts Selected

| Part ID  | Name                             | Included        | Config/Notes                                                                                                                                                                         |
| -------- | -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PART-001 | HTML Shell                       | YES             | â€”                                                                                                                                                                                  |
| PART-002 | Package Scripts                  | YES             | â€”                                                                                                                                                                                  |
| PART-003 | waitForPackages                  | YES             | â€”                                                                                                                                                                                  |
| PART-004 | Initialization Block             | YES             | â€”                                                                                                                                                                                  |
| PART-005 | VisibilityTracker                | YES             | popupProps: default                                                                                                                                                                  |
| PART-006 | TimerComponent                   | YES             | timerType: 'increase', startTime: 0, autoStart: false, format: 'min'                                                                                                                 |
| PART-007 | Game State Object                | YES             | Custom fields: lives, totalLives, currentSequence, correctSum, sequenceIndex, roundStartTime, roundTimes, isShowingSequence, pendingEndProblem                                       |
| PART-008 | PostMessage Protocol             | YES             | â€”                                                                                                                                                                                  |
| PART-009 | Attempt Tracking                 | YES             | â€”                                                                                                                                                                                  |
| PART-010 | Event Tracking & SignalCollector | YES             | Custom events: number_shown, sequence_complete, answer_correct, answer_wrong, life_lost. SignalCollector: deferred endProblem (advance-on-wrong), recordViewEvent on all DOM changes |
| PART-011 | End Game & Metrics               | YES             | Custom star logic: lives remaining (3â†’3â˜…, 2â†’2â˜…, 1â†’1â˜…, 0â†’0â˜…). Flush deferred endProblem â†’ seal SignalCollector â†’ showResults â†’ postMessage with signalPayload   |
| PART-012 | Debug Functions                  | YES             | â€”                                                                                                                                                                                  |
| PART-013 | Validation Fixed                 | YES             | Rule: user input must equal correct sum                                                                                                                                              |
| PART-014 | Validation Function              | NO              | â€”                                                                                                                                                                                  |
| PART-015 | Validation LLM                   | NO              | â€”                                                                                                                                                                                  |
| PART-016 | StoriesComponent                 | NO              | â€”                                                                                                                                                                                  |
| PART-017 | Feedback Integration             | NO              | Not needed for this game                                                                                                                                                             |
| PART-018 | Case Converter                   | NO              | â€”                                                                                                                                                                                  |
| PART-019 | Results Screen UI                | YES             | Custom metrics: lives remaining, rounds completed                                                                                                                                    |
| PART-020 | CSS Variables & Colors           | YES             | â€”                                                                                                                                                                                  |
| PART-021 | Screen Layout CSS                | YES             | â€”                                                                                                                                                                                  |
| PART-022 | Game Buttons                     | YES             | â€”                                                                                                                                                                                  |
| PART-023 | ProgressBar Component            | YES             | totalRounds: 5, totalLives: 3                                                                                                                                                        |
| PART-024 | TransitionScreen Component       | YES             | Screens: start, round-transition, victory, game-over                                                                                                                                 |
| PART-025 | ScreenLayout Component           | YES             | slots: progressBar=true, transitionScreen=true                                                                                                                                       |
| PART-026 | Anti-Patterns                    | YES (REFERENCE) | â€”                                                                                                                                                                                  |
| PART-027 | Play Area Construction           | YES             | Layout: center number display + input field                                                                                                                                          |
| PART-028 | InputSchema Patterns             | YES             | Schema type: rounds with number sequences and sums                                                                                                                                   |
| PART-029 | Story-Only Game                  | NO              | â€”                                                                                                                                                                                  |
| PART-030 | Sentry Error Tracking            | YES             | SentryConfig-based centralized pattern, SDK v10.23.0, replay/profiling/console integrations                                                                                          |
| PART-031 | API Helper                       | NO              | â€”                                                                                                                                                                                  |
| PART-032 | AnalyticsManager                 | NO              | â€”                                                                                                                                                                                  |
| PART-033 | Interaction Patterns             | NO              | â€”                                                                                                                                                                                  |
| PART-034 | Variable Schema Serialization    | YES (POST_GEN)  | â€”                                                                                                                                                                                  |
| PART-035 | Test Plan Generation             | YES (POST_GEN)  | â€”                                                                                                                                                                                  |
| PART-037 | Playwright Testing               | YES (POST_GEN)  | â€”                                                                                                                                                                                  |

---

## 3. Game State

```javascript
const gameState = {
  // MANDATORY (from PART-007):
  currentRound: 0,
  totalRounds: 5,
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

  // GAME-SPECIFIC:
  lives: 3,
  totalLives: 3,
  currentSequence: [], // Array of numbers for current round
  correctSum: 0, // Correct total for current round
  sequenceIndex: 0, // Current number being shown in sequence
  isShowingSequence: false, // True while numbers are being displayed
  roundStartTime: null,
  roundTimes: [],
  sequenceInterval: 0, // ms between numbers for current round
  pendingEndProblem: null, // Deferred endProblem { id, outcome } (PART-010)
};

let timer = null;
let visibilityTracker = null;
let progressBar = null;
let transitionScreen = null;
let signalCollector = null; // SignalCollector instance (PART-010)
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
          "numbers": {
            "type": "array",
            "items": { "type": "integer" },
            "description": "Sequence of numbers to flash."
          },
          "sum": {
            "type": "integer",
            "description": "Correct sum of all numbers in the sequence."
          },
          "interval": {
            "type": "integer",
            "description": "Milliseconds each number is displayed."
          }
        },
        "required": ["numbers", "sum", "interval"]
      }
    }
  },
  "required": ["rounds"]
}
```

### Fallback Test Content

5 rounds with verified sums, increasing difficulty.

```javascript
const fallbackContent = {
  rounds: [
    // Round 1: 3 numbers, single-digit, 1.5s each
    // Numbers: 4, 7, 2. Sum: 4+7+2 = 13 âœ“
    { numbers: [4, 7, 2], sum: 13, interval: 1500 },
    // Round 2: 3 numbers, single-digit, 1s each
    // Numbers: 8, 3, 6. Sum: 8+3+6 = 17 âœ“
    { numbers: [8, 3, 6], sum: 17, interval: 1000 },
    // Round 3: 4 numbers, 1-2 digit, 1s each
    // Numbers: 5, 12, 8, 15. Sum: 5+12+8+15 = 40 âœ“
    { numbers: [5, 12, 8, 15], sum: 40, interval: 1000 },
    // Round 4: 5 numbers, 1-2 digit, 0.75s each
    // Numbers: 9, 14, 6, 11, 7. Sum: 9+14+6+11+7 = 47 âœ“
    { numbers: [9, 14, 6, 11, 7], sum: 47, interval: 750 },
    // Round 5: 5 numbers, 2-digit, 0.75s each
    // Numbers: 23, 15, 34, 12, 26. Sum: 23+15+34+12+26 = 110 âœ“
    { numbers: [23, 15, 34, 12, 26], sum: 110, interval: 750 },
  ],
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
      <p class="instruction-text">Watch the numbers flash â€” <strong>add them up</strong> in your head!</p>
      <p class="instruction-text">Enter the total when all numbers have been shown.</p>
    </div>

    <!-- Sequence display area -->
    <div class="flash-area" id="flash-area" data-signal-id="flash-area">
      <div class="flash-number" id="flash-number" data-signal-id="flash-number"></div>
      <div class="progress-dots" id="progress-dots" data-signal-id="progress-dots">
        <!-- Dots generated by JS -->
      </div>
    </div>

    <!-- Answer input area (hidden during sequence) -->
    <div class="answer-area" id="answer-area" style="display: none;">
      <p class="answer-prompt" data-signal-id="answer-prompt">What's the total?</p>
      <input
        type="number"
        class="answer-input"
        id="answer-input"
        data-signal-id="answer-input"
        inputmode="numeric"
        placeholder="Enter sum"
        autocomplete="off"
      />
      <button class="game-btn btn-primary" id="btn-submit" data-signal-id="btn-submit" onclick="submitAnswer()">
        Submit
      </button>
    </div>

    <!-- Feedback area -->
    <div class="feedback-area" id="feedback-area" style="display: none;">
      <p class="feedback-text" id="feedback-text" data-signal-id="feedback-text"></p>
    </div>
  </div>

  <div id="results-screen" class="game-block" style="display: none;">
    <div class="results-card">
      <div id="stars-display" class="stars-display"></div>
      <h2 class="results-title">Game Complete!</h2>
      <div class="results-metrics">
        <div class="metric-row">
          <span class="metric-label">Score</span>
          <span class="metric-value" id="result-score">0/5</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Time</span>
          <span class="metric-value" id="result-time">0:00</span>
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
}

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

.game-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.instruction-area {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  padding: 0 4px;
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

/* === Flash Area === */
.flash-area {
  width: 100%;
  max-width: 340px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: var(--mathai-white);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 32px;
}

.flash-number {
  font-size: 72px;
  font-weight: 800;
  color: var(--mathai-blue);
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.1s ease;
}

.flash-number.hidden {
  opacity: 0;
}

@keyframes flashPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.flash-number.animate {
  animation: flashPop 0.3s ease forwards;
}

/* Progress dots */
.progress-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: background 0.2s ease;
}

.dot.active {
  background: var(--mathai-blue);
}

.dot.done {
  background: var(--mathai-green);
}

/* === Answer Area === */
.answer-area {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.answer-prompt {
  font-size: var(--mathai-font-size-title);
  font-weight: 700;
  color: var(--mathai-black);
}

.answer-input {
  width: 100%;
  max-width: 200px;
  height: 56px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 700;
  font-family: var(--mathai-font-family);
  text-align: center;
  color: var(--mathai-black);
  background: var(--mathai-white);
  outline: none;
  transition: border-color 0.2s ease;
}

.answer-input:focus {
  border-color: var(--mathai-blue);
}

.answer-input.correct {
  border-color: var(--mathai-green);
  background: var(--mathai-light-green);
  color: var(--mathai-green);
}

.answer-input.wrong {
  border-color: var(--mathai-red);
  background: var(--mathai-light-red);
  color: var(--mathai-red);
}

/* === Feedback Area === */
.feedback-area {
  width: 100%;
  max-width: 340px;
  text-align: center;
  padding: 12px;
}

.feedback-text {
  font-size: var(--mathai-font-size-body);
  font-weight: 600;
  line-height: 1.5;
}

.feedback-text.correct-text {
  color: var(--mathai-green);
}
.feedback-text.wrong-text {
  color: var(--mathai-red);
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
  min-width: 140px;
}

.btn-primary {
  background: var(--mathai-green);
  color: var(--mathai-white);
}
.btn-primary:hover {
  filter: brightness(0.9);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Results === */
.results-card {
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.results-title {
  font-size: var(--mathai-font-size-title);
  margin-bottom: 24px;
}
.stars-display {
  font-size: 40px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
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
```

---

## 7. Game Flow

1. **Page loads** â†’ DOMContentLoaded fires
   - Standard init: waitForPackages, FeedbackManager, ScreenLayout, SignalCollector, Timer, ProgressBar, TransitionScreen, VisibilityTracker
   - Show start transition screen

2. **startGame()** â†’ set startTime, isActive, timer.start, trackEvent('game_start'), setupRound()

3. **setupRound():**
   - Flush deferred endProblem from previous round (PART-010)
   - Start new SignalCollector problem for this round
   - Load round data (numbers, sum, interval)
   - Build progress dots
   - recordViewEvent('content_render') for round start
   - Start showing sequence: showNextNumber()

4. **showNextNumber():**
   - Set isShowingSequence = true
   - Hide answer area, show flash area
   - For each number in sequence at the configured interval:
     - Display number in large text with pop animation
     - Play TTS via FeedbackManager.playDynamicFeedback({ audio_content: number.toString() })
     - Mark progress dot as active/done
     - recordViewEvent('visual_update') for each number flash
   - After last number: sequenceComplete() â€” show answer input

5. **User enters answer:**
   - Type number in input, click Submit (or press Enter)
   - Compare to correct sum
   - **Correct:** green input, dynamic audio "that's right!", score++, defer endProblem, advance
   - **Wrong:** red input, dynamic audio with correct answer, lose life, defer endProblem, advance
   - recordViewEvent('feedback_display') for correct/wrong feedback
   - Both correct and wrong answers advance â†’ endProblem deferred after EVERY answer

6. **End conditions â€” every path that calls endGame():**
   - All 5 rounds completed â†’ nextRound() calls endGame() when currentRound >= totalRounds
   - 0 lives â†’ handleGameOver() calls endGame()
   - **There is NO game state where the player is stuck with no path to endGame()**

---

## 8. Functions

### Global Scope (RULE-001)

**startGame()**

- Set window.gameState.startTime = Date.now(), isActive = true
- window.gameState.duration_data.startTime = new Date().toISOString()
- timer.start()
- trackEvent('game_start', 'game')
- signalCollector.recordViewEvent('screen_transition', { screen: 'gameplay', metadata: { transition_from: 'ready' } })
- setupRound()

**setupRound()**

- Flush deferred endProblem from previous round:
  ```javascript
  if (signalCollector && gameState.pendingEndProblem) {
    signalCollector.endProblem(gameState.pendingEndProblem.id, gameState.pendingEndProblem.outcome);
    gameState.pendingEndProblem = null;
  }
  ```
- Get roundData = window.gameState.content.rounds[window.gameState.currentRound]
- window.gameState.currentSequence = roundData.numbers
- window.gameState.correctSum = roundData.sum
- window.gameState.sequenceInterval = roundData.interval
- window.gameState.sequenceIndex = 0
- window.gameState.isShowingSequence = true
- window.gameState.roundStartTime = Date.now()
- Hide #answer-area, #feedback-area
- Show #flash-area
- Build progress dots in #progress-dots (one per number)
- document.getElementById('flash-number').textContent = ''
- progressBar.update(window.gameState.currentRound, window.gameState.lives)
- Start SignalCollector problem:
  ```javascript
  signalCollector.startProblem('round_' + (gameState.currentRound + 1), {
    round_number: gameState.currentRound + 1,
    question_text: 'Sum of: ' + roundData.numbers.join(', '),
    correct_answer: roundData.sum,
    sequence_length: roundData.numbers.length,
    interval_ms: roundData.interval,
  });
  ```
- recordViewEvent('content_render'):
  ```javascript
  signalCollector.recordViewEvent('content_render', {
    screen: 'gameplay',
    content_snapshot: {
      round: gameState.currentRound + 1,
      sequence_length: roundData.numbers.length,
      interval_ms: roundData.interval,
      trigger: 'round_start',
    },
    components: {
      timer: timer ? { value: timer.getCurrentTime(), state: timer.isRunning ? 'running' : 'paused' } : null,
      progress: { current: gameState.currentRound, total: gameState.totalRounds },
    },
  });
  ```
- trackEvent('round_start', 'game', { round: gameState.currentRound + 1, numbers: roundData.numbers.length, interval: roundData.interval })
- showNextNumber()

**async showNextNumber()**

- If window.gameState.sequenceIndex >= window.gameState.currentSequence.length:
  - sequenceComplete()
  - return
- const num = window.gameState.currentSequence[window.gameState.sequenceIndex]
- const flashEl = document.getElementById('flash-number')
- flashEl.classList.remove('animate')
- void flashEl.offsetWidth // force reflow
- flashEl.textContent = num
- flashEl.classList.add('animate')
- Mark current dot as .active
- trackEvent('number_shown', 'game', { number: num, index: window.gameState.sequenceIndex })
- recordViewEvent('visual_update') for number flash:
  ```javascript
  signalCollector.recordViewEvent('visual_update', {
    screen: 'gameplay',
    content_snapshot: {
      type: 'number_flash',
      number: num,
      index: gameState.sequenceIndex,
      total_in_sequence: gameState.currentSequence.length,
    },
  });
  ```
- // TTS for the number
- try { await FeedbackManager.playDynamicFeedback({ audio_content: num.toString(), subtitle: num.toString() }); } catch(e) { console.error('Feedback error:', JSON.stringify({ error: e.message }, null, 2)); }
- window.gameState.sequenceIndex++
- Mark previous dot as .done
- // Wait for interval then show next
- setTimeout(() => showNextNumber(), window.gameState.sequenceInterval)

**sequenceComplete()**

- window.gameState.isShowingSequence = false
- document.getElementById('flash-number').textContent = '?'
- Mark all dots as .done
- trackEvent('sequence_complete', 'game', { round: window.gameState.currentRound + 1 })
- Show #answer-area
- document.getElementById('answer-input').value = ''
- document.getElementById('answer-input').className = 'answer-input'
- document.getElementById('answer-input').focus()
- document.getElementById('btn-submit').disabled = false
- recordViewEvent('visual_update') for sequence complete:
  ```javascript
  signalCollector.recordViewEvent('visual_update', {
    screen: 'gameplay',
    content_snapshot: {
      type: 'sequence_complete',
      round: gameState.currentRound + 1,
      answer_input_visible: true,
    },
  });
  ```

**async submitAnswer()**

- If !window.gameState.isActive || window.gameState.isShowingSequence â†’ return
- const userAnswer = parseInt(document.getElementById('answer-input').value, 10)
- If isNaN(userAnswer) â†’ return
- document.getElementById('btn-submit').disabled = true
- const isCorrect = userAnswer === window.gameState.correctSum
- const roundTime = Math.round((Date.now() - window.gameState.roundStartTime) / 1000)
- const roundId = 'round\_' + (window.gameState.currentRound + 1)
- If isCorrect:
  - window.gameState.score++
  - window.gameState.roundTimes.push(roundTime)
  - document.getElementById('answer-input').classList.add('correct')
  - document.getElementById('feedback-area').style.display = 'block'
  - document.getElementById('feedback-text').textContent = `Correct! The sum was ${window.gameState.correctSum}.`
  - document.getElementById('feedback-text').className = 'feedback-text correct-text'
  - recordAttempt({ input_of_user: { answer: userAnswer }, correct: true, metadata: { round: window.gameState.currentRound + 1, question: `Sum of: ${window.gameState.currentSequence.join(', ')}`, correctAnswer: window.gameState.correctSum, validationType: 'fixed' } })
  - trackEvent('answer_correct', 'game', { round: window.gameState.currentRound + 1, userAnswer, correctSum: window.gameState.correctSum, time: roundTime })
  - signalCollector.recordCustomEvent('round_solved', { correct: true, answer: userAnswer })
  - recordViewEvent('feedback_display'):
    ```javascript
    signalCollector.recordViewEvent('feedback_display', {
      screen: 'gameplay',
      content_snapshot: {
        feedback_type: 'correct',
        message: 'Correct! The sum was ' + gameState.correctSum + '.',
        audio_id: 'correct',
      },
    });
    ```
  - try { await FeedbackManager.playDynamicFeedback({ audio_content: "that's right!", subtitle: "That's right!" }); } catch(e) { console.error('Feedback error:', JSON.stringify({ error: e.message }, null, 2)); }
  - // Defer endProblem â€” will be flushed at next setupRound or endGame
  - window.gameState.pendingEndProblem = { id: roundId, outcome: { correct: true, answer: userAnswer } }
  - setTimeout(() => nextRound(), 1500)
- Else:
  - window.gameState.lives--
  - progressBar.update(window.gameState.currentRound, window.gameState.lives)
  - document.getElementById('answer-input').classList.add('wrong')
  - document.getElementById('feedback-area').style.display = 'block'
  - document.getElementById('feedback-text').textContent = `The correct answer was ${window.gameState.correctSum}. You entered ${userAnswer}.`
  - document.getElementById('feedback-text').className = 'feedback-text wrong-text'
  - recordAttempt({ input_of_user: { answer: userAnswer }, correct: false, metadata: { round: window.gameState.currentRound + 1, question: `Sum of: ${window.gameState.currentSequence.join(', ')}`, correctAnswer: window.gameState.correctSum, validationType: 'fixed' } })
  - trackEvent('answer_wrong', 'game', { round: window.gameState.currentRound + 1, userAnswer, correctSum: window.gameState.correctSum })
  - trackEvent('life_lost', 'game', { livesRemaining: window.gameState.lives })
  - signalCollector.recordCustomEvent('round_solved', { correct: false, answer: userAnswer })
  - recordViewEvent('feedback_display'):
    ```javascript
    signalCollector.recordViewEvent('feedback_display', {
      screen: 'gameplay',
      content_snapshot: {
        feedback_type: 'incorrect',
        message: 'The correct answer was ' + gameState.correctSum + '. You entered ' + userAnswer + '.',
        audio_id: 'incorrect',
      },
    });
    ```
  - try { await FeedbackManager.playDynamicFeedback({ audio_content: `oh no, not quite! the answer was ${window.gameState.correctSum}`, subtitle: `The answer was ${window.gameState.correctSum}` }); } catch(e) { console.error('Feedback error:', JSON.stringify({ error: e.message }, null, 2)); }
  - // Defer endProblem â€” wrong answers also advance
  - window.gameState.pendingEndProblem = { id: roundId, outcome: { correct: false, answer: userAnswer } }
  - If window.gameState.lives <= 0 â†’ setTimeout(() => handleGameOver(), 2000)
  - Else â†’ setTimeout(() => nextRound(), 2000)

**nextRound()**

- window.gameState.currentRound++
- If window.gameState.currentRound >= window.gameState.totalRounds â†’ endGame()
- Else:
  - timer.pause()
  - signalCollector.recordViewEvent('overlay_toggle', { screen: 'transition', content_snapshot: { overlay: 'round_transition', visible: true, title: 'Round ' + (window.gameState.currentRound + 1) } })
  - transitionScreen.show({ icons: ['âš¡'], iconSize: 'normal', title: `Round ${window.gameState.currentRound + 1}`, subtitle: `Get ready for ${window.gameState.content.rounds[window.gameState.currentRound].numbers.length} numbers!`, buttons: [{ text: 'Continue', type: 'primary', action: () => { signalCollector.recordViewEvent('overlay_toggle', { screen: 'transition', content_snapshot: { overlay: 'round_transition', visible: false } }); timer.resume(); setupRound(); } }] })

**async handleGameOver()**

- timer.pause()
- trackEvent('game_over', 'game', { livesRemaining: 0, roundsCompleted: window.gameState.score })
- signalCollector.recordViewEvent('overlay_toggle', { screen: 'transition', content_snapshot: { overlay: 'game_over', visible: true, title: 'Game Over!' } })
- try { await FeedbackManager.playDynamicFeedback({ audio_content: "oh no, you've run out of lives!", subtitle: "All lives lost!" }); } catch(e) { console.error('Feedback error:', JSON.stringify({ error: e.message }, null, 2)); }
- transitionScreen.show({ icons: ['ðŸ˜”'], iconSize: 'large', title: 'Game Over!', subtitle: 'All lives lost!', buttons: [{ text: 'Try Again', type: 'primary', action: () => restartGame() }] })
- endGame()

**endGame()**

- if (!window.gameState.isActive) return
- window.gameState.isActive = false
- window.gameState.duration_data.currentTime = new Date().toISOString()
- const correct = window.gameState.attempts.filter(a => a.correct).length
- const total = window.gameState.attempts.length
- const accuracy = total > 0 ? Math.round((correct / total) \* 100) : 0
- const timeTaken = timer ? timer.getTimeTaken() : Math.round((Date.now() - window.gameState.startTime) / 1000)
- const stars = window.gameState.lives >= 3 ? 3 : window.gameState.lives >= 2 ? 2 : window.gameState.lives >= 1 ? 1 : 0
- const metrics = { accuracy, time: timeTaken, stars, attempts: window.gameState.attempts, duration_data: window.gameState.duration_data, livesRemaining: window.gameState.lives, roundTimes: window.gameState.roundTimes }
- console.log('Final Metrics:', JSON.stringify(metrics, null, 2))
- console.log('Attempt History:', JSON.stringify(window.gameState.attempts, null, 2))
- trackEvent('game_end', 'game', { metrics })
- // Flush deferred endProblem before sealing (PART-010)
- if (signalCollector && window.gameState.pendingEndProblem) {
  signalCollector.endProblem(window.gameState.pendingEndProblem.id, window.gameState.pendingEndProblem.outcome);
  window.gameState.pendingEndProblem = null;
  }
- // Seal SignalCollector â€” detaches listeners, computes final signals (PART-010)
- const signalPayload = signalCollector ? signalCollector.seal() : { events: [], signals: {}, metadata: {} }
- showResults(metrics)
- window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts: window.gameState.attempts, ...signalPayload, completedAt: Date.now() } }, '\*')
- // Cleanup (RULE-005)
- if (timer) { timer.destroy(); timer = null; }
- if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
- FeedbackManager.sound.stopAll()
- FeedbackManager.stream.stopAll()
- if (progressBar) { progressBar.destroy(); progressBar = null; }

**showResults(metrics)**

- signalCollector.recordViewEvent('screen_transition', { screen: 'results', metadata: { transition_from: 'gameplay' } })
- document.getElementById('game-screen').style.display = 'none'
- document.getElementById('results-screen').style.display = 'flex'
- document.getElementById('result-score').textContent = `${window.gameState.score}/${window.gameState.totalRounds}`
- document.getElementById('result-time').textContent = formatTime(metrics.time)
- document.getElementById('result-lives').textContent = window.gameState.lives
- document.getElementById('result-accuracy').textContent = `${metrics.accuracy}%`
- const starsEl = document.getElementById('stars-display')
- starsEl.innerHTML = ''
- for (let i = 0; i < 3; i++) { const star = document.createElement('span'); star.textContent = i < metrics.stars ? 'â­' : 'â˜†'; starsEl.appendChild(star); }

**formatTime(seconds)** â€” Standard: `const m = Math.floor(seconds / 60); const s = seconds % 60; return m + ':' + s.toString().padStart(2, '0');`

**restartGame()**

- Reset all gameState fields: currentRound=0, score=0, lives=3, attempts=[], events=[], isActive=true, startTime=Date.now(), roundTimes=[], pendingEndProblem=null
- Reset duration_data: startTime=new Date().toISOString(), preview=[], attempts=[], evaluations=[], inActiveTime=[], totalInactiveTime=0, currentTime=null
- Recreate destroyed components (endGame nulls these):
  ```javascript
  signalCollector = new SignalCollector({
    sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(),
    studentId: window.gameVariableState?.studentId || null,
    templateId: gameState.gameId || null,
  });
  window.signalCollector = signalCollector;
  timer = new TimerComponent('timer-container', {
    timerType: 'increase',
    format: 'min',
    startTime: 0,
    autoStart: false,
  });
  visibilityTracker = new VisibilityTracker({
    onInactive: () => {
      if (timer && timer.isRunning) timer.pause();
      if (signalCollector) signalCollector.pause();
      try {
        FeedbackManager.sound.stopAll();
      } catch (e) {}
      gameState.duration_data.inActiveTime.push({ start: Date.now() });
    },
    onResume: () => {
      if (timer && timer.isPaused && gameState.isActive) timer.resume();
      if (signalCollector) signalCollector.resume();
      const last = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
      if (last && !last.end) {
        last.end = Date.now();
        gameState.duration_data.totalInactiveTime += last.end - last.start;
      }
    },
  });
  progressBar = new ProgressBarComponent({
    autoInject: true,
    totalRounds: 5,
    totalLives: 3,
    slotId: 'mathai-progress-slot',
  });
  progressBar.update(0, 3);
  ```
- Show start transition screen

**handlePostMessage(event)** â€” Standard (PART-008)

**recordAttempt(data)** â€” Standard (PART-009)

**trackEvent(type, target, data)** â€” Standard (PART-010)

**debugSignals()** â€” Returns SignalCollector debug info:

```javascript
window.debugSignals = () => {
  if (!signalCollector) return { status: 'not initialized' };
  return signalCollector.debug();
};
```

### Inside DOMContentLoaded (PART-004)

```javascript
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await waitForPackages();
    await FeedbackManager.init();

    const layout = ScreenLayout.inject('app', {
      slots: { progressBar: true, transitionScreen: true },
    });

    const gameContent = document.getElementById('gameContent');
    const template = document.getElementById('game-template');
    gameContent.appendChild(template.content.cloneNode(true));

    // SignalCollector (PART-010) â€” after FeedbackManager, before Timer/VisibilityTracker
    signalCollector = new SignalCollector({
      sessionId: window.gameVariableState?.sessionId || 'session_' + Date.now(),
      studentId: window.gameVariableState?.studentId || null,
      templateId: window.gameState?.gameId || null,
    });
    window.signalCollector = signalCollector;

    timer = new TimerComponent('timer-container', {
      timerType: 'increase',
      format: 'min',
      startTime: 0,
      autoStart: false,
    });

    progressBar = new ProgressBarComponent({
      autoInject: true,
      totalRounds: 5,
      totalLives: 3,
      slotId: 'mathai-progress-slot',
    });
    progressBar.update(0, 3);

    transitionScreen = new TransitionScreenComponent({ autoInject: true });

    visibilityTracker = new VisibilityTracker({
      onInactive: () => {
        if (timer && timer.isRunning) timer.pause();
        if (signalCollector) signalCollector.pause();
        try {
          FeedbackManager.sound.stopAll();
        } catch (e) {}
        gameState.duration_data.inActiveTime.push({ start: Date.now() });
      },
      onResume: () => {
        if (timer && timer.isPaused && gameState.isActive) timer.resume();
        if (signalCollector) signalCollector.resume();
        const last = gameState.duration_data.inActiveTime[gameState.duration_data.inActiveTime.length - 1];
        if (last && !last.end) {
          last.end = Date.now();
          gameState.duration_data.totalInactiveTime += last.end - last.start;
        }
      },
    });

    window.addEventListener('message', handlePostMessage);
    if (!window.gameState.content) {
      window.gameState.content = fallbackContent;
    }

    // Allow Enter key to submit
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !window.gameState.isShowingSequence && window.gameState.isActive) {
        submitAnswer();
      }
    });

    transitionScreen.show({
      icons: ['âš¡'],
      iconSize: 'large',
      title: 'Totals in a Flash',
      subtitle: 'Add up the numbers as they flash!',
      buttons: [{ text: "I'm ready!", type: 'primary', action: () => startGame() }],
    });

    window.debugGame = () => JSON.parse(JSON.stringify(window.gameState));
    window.debugAudio = () => {
      try {
        return FeedbackManager.getState();
      } catch (e) {
        return { error: e.message };
      }
    };
    window.testAudio = async () => {
      try {
        await FeedbackManager.sound.play('test');
      } catch (e) {
        console.error('Test audio error:', JSON.stringify({ error: e.message }, null, 2));
      }
    };
    window.testPause = () => {
      if (visibilityTracker) visibilityTracker.simulatePause();
    };
    window.testResume = () => {
      if (visibilityTracker) visibilityTracker.simulateResume();
    };
    window.debugSignals = () => {
      if (!signalCollector) return { status: 'not initialized' };
      return signalCollector.debug();
    };
  } catch (error) {
    console.error('Initialization error:', JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
  }
});
```

### waitForPackages (PART-003) â€” Standard 10s timeout

---

## 9. Event Schema

### Game Lifecycle Events

| Event      | Target | When Fired  |
| ---------- | ------ | ----------- |
| game_start | game   | startGame() |
| game_end   | game   | endGame()   |

### Game-Specific Events

| Event             | Target | When Fired              | Data                                    |
| ----------------- | ------ | ----------------------- | --------------------------------------- |
| round_start       | game   | setupRound()            | { round, numbers, interval }            |
| number_shown      | game   | Each number flashes     | { number, index }                       |
| sequence_complete | game   | All numbers shown       | { round }                               |
| answer_correct    | game   | User enters correct sum | { round, userAnswer, correctSum, time } |
| answer_wrong      | game   | User enters wrong sum   | { round, userAnswer, correctSum }       |
| life_lost         | game   | Wrong answer            | { livesRemaining }                      |
| game_over         | game   | All lives lost          | { livesRemaining: 0, roundsCompleted }  |

### SignalCollector Events (PART-010)

| Method                | When Called                         | Data                                                                                                |
| --------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| startProblem          | setupRound() â€” each new round     | problemId: 'round_N', { round_number, question_text, correct_answer, sequence_length, interval_ms } |
| endProblem (deferred) | Next setupRound() or endGame()      | problemId: 'round_N', { correct, answer }                                                           |
| recordCustomEvent     | submitAnswer() â€” after validation | 'round_solved', { correct, answer }                                                                 |
| recordViewEvent       | Every DOM-modifying function        | See Section 8 for all view event calls                                                              |
| seal()                | endGame() â€” before postMessage    | Returns { events, signals, metadata }                                                               |

---

## 10. Scaffold Points

| Point        | Function         | When             | What Can Be Injected                 |
| ------------ | ---------------- | ---------------- | ------------------------------------ |
| after_wrong  | submitAnswer()   | Wrong answer     | Show the sequence again slowly       |
| before_round | setupRound()     | New round starts | Tip: "try grouping numbers mentally" |
| on_game_over | handleGameOver() | Lives lost       | Encouragement                        |

---

## 11. Feedback Triggers

| Moment              | Trigger Function | Feedback Type       | Notes                                |
| ------------------- | ---------------- | ------------------- | ------------------------------------ |
| Each number shown   | showNextNumber() | dynamic audio (TTS) | Reads the number aloud               |
| Correct answer      | submitAnswer()   | dynamic audio       | "that's right!"                      |
| Wrong answer        | submitAnswer()   | dynamic audio       | "oh no, not quite! the answer was X" |
| All rounds complete | endGame()        | dynamic audio       | "amazing work!"                      |
| Game over           | handleGameOver() | dynamic audio       | "oh no, you've run out of lives!"    |

---

## 12. Visual Specifications

- **Layout:** Center-screen flash display area (card with number), answer input below. Max-width 340px.
- **Color palette:** Blue for flash numbers, green for correct, red for wrong. White card for flash area.
- **Typography:** 72px bold for flash numbers, 28px for input, 24px for prompt.
- **Spacing:** 16px padding, 24px gap in flash area, 12px gap in answer area.
- **Interactive states:** Number pop animation (scale 0.5â†’1.1â†’1), input focus blue border, correct green bg, wrong red bg.
- **Progress dots:** 12px circles, gray default, blue active, green done.
- **Transitions:** 0.1s opacity for number changes, 0.3s pop animation, 0.2s input border.

---

## 14. Test Scenarios

### Scenario: Game loads and shows start screen

```
SETUP: Page loaded
ASSERT:
  TransitionScreen title "Totals in a Flash"
  "I'm ready!" button visible
  gameState.isActive === false
```

### Scenario: Start game, round 1 sequence plays

```
SETUP: Start screen
ACTIONS: click "I'm ready!"
ASSERT:
  gameState.isActive === true
  #flash-area visible
  #answer-area hidden
  3 progress dots shown
  Numbers 4, 7, 2 flash sequentially at 1.5s intervals
  Each number triggers TTS playDynamicFeedback
  number_shown events tracked for each
  signalCollector.startProblem called with 'round_1'
  After all 3 numbers: #answer-area visible, input focused
```

### Scenario: Submit correct answer round 1

```
SETUP: Round 1 sequence complete, answer area visible
ACTIONS:
  type "13" in #answer-input
  click #btn-submit
ASSERT:
  answer-input has .correct class (green)
  feedback shows "Correct! The sum was 13."
  gameState.score === 1
  answer_correct event tracked
  signalCollector.recordCustomEvent('round_solved', { correct: true }) called
  gameState.pendingEndProblem set with { id: 'round_1', outcome: { correct: true, answer: 13 } }
  dynamic audio "that's right!" played
  transition screen shows "Round 2" after ~1500ms
```

### Scenario: Submit wrong answer loses a life

```
SETUP: Round 1 sequence complete
ACTIONS:
  type "15" in #answer-input (wrong, correct is 13)
  click #btn-submit
ASSERT:
  answer-input has .wrong class (red)
  feedback shows "The correct answer was 13. You entered 15."
  gameState.lives === 2
  progressBar shows 2 hearts
  answer_wrong event tracked
  life_lost event tracked
  signalCollector.recordCustomEvent('round_solved', { correct: false }) called
  gameState.pendingEndProblem set with { id: 'round_1', outcome: { correct: false, answer: 15 } }
  dynamic audio "oh no, not quite! the answer was 13"
```

### Scenario: Enter key submits answer

```
SETUP: Round answer area visible
ACTIONS:
  type "13" in #answer-input
  press Enter key
ASSERT:
  Same result as clicking Submit
```

### Scenario: Cannot submit during sequence

```
SETUP: Numbers still flashing
ASSERT:
  #answer-area is hidden
  #btn-submit not visible
  submitAnswer() returns immediately if isShowingSequence
```

### Scenario: Complete all 5 rounds perfectly

```
SETUP: Page loaded
ACTIONS:
  click "I'm ready!"
  Round 1: wait for sequence, enter 13, submit
  Continue
  Round 2: wait for sequence, enter 17, submit
  Continue
  Round 3: wait for sequence, enter 40, submit
  Continue
  Round 4: wait for sequence, enter 47, submit
  Continue
  Round 5: wait for sequence, enter 110, submit
ASSERT:
  gameState.score === 5, lives === 3
  #results-screen visible
  #result-score text "5/5"
  #result-accuracy text "100%"
  stars === 3 (â­â­â­)
  game_complete postMessage sent with ...signalPayload (events, signals, metadata)
  signalCollector.seal() called before postMessage
  All 5 pendingEndProblem entries flushed (4 at setupRound, 1 at endGame)
```

### Scenario: Lose all 3 lives

```
SETUP: Game started
ACTIONS:
  Enter wrong answers 3 times
ASSERT:
  gameState.lives === 0
  handleGameOver() called â†’ endGame() called
  TransitionScreen "Game Over!"
  "Try Again" visible
  signalCollector.seal() called
  game_complete postMessage sent with signalPayload
```

### Scenario: Round difficulty increases

```
SETUP: Game progresses through rounds
ASSERT:
  Round 1: 3 dots, numbers < 10, 1.5s interval
  Round 2: 3 dots, numbers < 10, 1s interval
  Round 3: 4 dots, numbers < 100, 1s interval
  Round 4: 5 dots, numbers < 100, 0.75s interval
  Round 5: 5 dots, numbers 10-99, 0.75s interval
```

### Scenario: Progress dots update during sequence

```
SETUP: Round 1, sequence playing
ASSERT:
  When number 1 shows: dot 1 is .active
  When number 2 shows: dot 1 is .done, dot 2 is .active
  When number 3 shows: dot 2 is .done, dot 3 is .active
  After sequence: all dots .done
  recordViewEvent('visual_update') called for each number flash
```

### Scenario: Play Again restarts

```
SETUP: Results screen
ACTIONS: click "Play Again"
ASSERT:
  Start screen, lives=3, score=0, currentRound=0
  signalCollector recreated (new instance)
  timer recreated
  visibilityTracker recreated with signalCollector.pause/resume
```

### Scenario: NaN input rejected

```
SETUP: Answer area visible
ACTIONS:
  type "abc" in #answer-input
  click Submit
ASSERT:
  Nothing happens (parseInt returns NaN, submitAnswer returns)
  No attempt recorded
  No life lost
```

### Scenario: SignalCollector deferred endProblem flushed correctly

```
SETUP: Game started, round 1 answered correctly
ACTIONS:
  Complete round 1 (enter 13)
  Wait for transition screen â†’ click Continue
ASSERT:
  setupRound() for round 2 flushes pendingEndProblem from round 1
  signalCollector.endProblem('round_1', { correct: true, answer: 13 }) called
  gameState.pendingEndProblem === null after flush
  signalCollector.startProblem('round_2', ...) called after flush
```

### Scenario: Visibility change pauses SignalCollector

```
SETUP: Game active, sequence playing or answer area visible
ACTIONS:
  Simulate tab hidden (visibilityTracker.simulatePause())
ASSERT:
  timer.pause() called
  signalCollector.pause() called
  FeedbackManager.sound.stopAll() called
ACTIONS:
  Simulate tab visible (visibilityTracker.simulateResume())
ASSERT:
  timer.resume() called
  signalCollector.resume() called
```

---

## 15. Verification Checklist

### Structural

- [ ] HTML has DOCTYPE, meta charset, meta viewport
- [ ] Package scripts correct order (PART-002)
- [ ] Single `<style>` / `<script>` (RULE-007)
- [ ] #game-screen, #results-screen, #timer-container exist
- [ ] `<template id="game-template">` used
- [ ] `data-signal-id` attributes on: flash-area, flash-number, progress-dots, answer-prompt, answer-input, btn-submit, feedback-text, btn-restart

### Functional

- [ ] waitForPackages() 10s timeout (PART-003)
- [ ] DOMContentLoaded init sequence (PART-004)
- [ ] VisibilityTracker (PART-005) with BOTH timer AND signalCollector pause/resume
- [ ] TimerComponent (PART-006)
- [ ] handlePostMessage + fallback (PART-008)
- [ ] recordAttempt, trackEvent (PART-009, PART-010)
- [ ] endGame with flush deferred endProblem â†’ seal â†’ showResults â†’ postMessage with ...signalPayload â†’ cleanup (PART-011)
- [ ] Debug functions including debugSignals (PART-012)
- [ ] showResults (PART-019)
- [ ] No anti-patterns (PART-026)
- [ ] **Every end condition calls endGame():** rounds complete (nextRound), lives lost (handleGameOver)

### SignalCollector (PART-010)

- [ ] SignalCollector initialized in DOMContentLoaded after FeedbackManager.init(), before Timer/VisibilityTracker
- [ ] `window.signalCollector` assigned
- [ ] `startProblem('round_N', {...})` called in setupRound() after flushing deferred endProblem
- [ ] Deferred `endProblem` pattern used â€” pendingEndProblem set after EVERY answer (both correct and wrong)
- [ ] Deferred endProblem flushed at start of setupRound() and in endGame()
- [ ] `recordViewEvent('screen_transition')` in startGame() and showResults()
- [ ] `recordViewEvent('content_render')` in setupRound()
- [ ] `recordViewEvent('visual_update')` in showNextNumber() for each number flash
- [ ] `recordViewEvent('visual_update')` in sequenceComplete()
- [ ] `recordViewEvent('feedback_display')` in submitAnswer() for correct and wrong
- [ ] `recordViewEvent('overlay_toggle')` in nextRound() for round transition (show and hide)
- [ ] `recordViewEvent('overlay_toggle')` in handleGameOver()
- [ ] `recordCustomEvent('round_solved')` in submitAnswer() for both correct and wrong
- [ ] `seal()` called in endGame() before postMessage
- [ ] postMessage data includes `...signalPayload` spread (events, signals, metadata)
- [ ] SignalCollector recreated in restartGame()
- [ ] `debugSignals` function on window
- [ ] No inline SignalCollector stub/polyfill (Anti-Pattern 18)
- [ ] Single text input auto-captured by SignalCollector â€” no updateCurrentAnswer needed

### Design & Layout

- [ ] CSS uses `var(--mathai-*)` (PART-020)
- [ ] ScreenLayout.inject with progressBar=true, transitionScreen=true (PART-025)
- [ ] Template cloneNode (PART-025)
- [ ] ScreenLayout.inject BEFORE ProgressBar/TransitionScreen (PART-025)
- [ ] Max-width 480px wrapper (PART-021)
- [ ] 100dvh not 100vh (PART-021)
- [ ] `.game-btn` classes (PART-022)
- [ ] ProgressBar totalRounds: 5, totalLives: 3 (PART-023)
- [ ] progressBar.update first param = rounds COMPLETED (PART-023)
- [ ] TransitionScreen start/round-transition/game-over (PART-024)

### Rules Compliance

- [ ] RULE-001: onclick handlers in global scope (submitAnswer, restartGame)
- [ ] RULE-002: async functions marked async (showNextNumber, submitAnswer, endGame, handleGameOver)
- [ ] RULE-003: async calls in try/catch (all FeedbackManager calls)
- [ ] RULE-004: JSON.stringify for all logging
- [ ] RULE-005: cleanup in endGame (timer, visibilityTracker, FeedbackManager, progressBar)
- [ ] RULE-006: no new Audio(), no setInterval for timer, no SubtitleComponent.show()
- [ ] RULE-007: single file

### Game-Specific

- [ ] Numbers flash one by one at configured intervals
- [ ] TTS audio via FeedbackManager.playDynamicFeedback for each number
- [ ] Large center-screen number display (72px)
- [ ] Progress dots show sequence position
- [ ] Pop animation on each number appearance
- [ ] Answer input with numeric keyboard (inputmode="numeric")
- [ ] Enter key submits answer
- [ ] Cannot submit during sequence playback
- [ ] NaN/empty input rejected gracefully
- [ ] 5 rounds with increasing difficulty:
  - R1: 3 nums, single-digit, 1.5s
  - R2: 3 nums, single-digit, 1s
  - R3: 4 nums, 1-2 digit, 1s
  - R4: 5 nums, 1-2 digit, 0.75s
  - R5: 5 nums, 2-digit, 0.75s
- [ ] 3 lives, game over at 0
- [ ] Dynamic audio correct: "that's right!"
- [ ] Dynamic audio wrong: "oh no, not quite! the answer was X"
- [ ] All 5 fallback round sums verified correct
- [ ] Stars: 3 livesâ†’3â˜…, 2â†’2â˜…, 1â†’1â˜…, 0â†’0â˜…
- [ ] Transition screens between rounds
- [ ] Timer pauses during transitions

### Contract Compliance

- [ ] gameState, attempts, metrics, duration_data, postMessage schemas
- [ ] postMessage `data` includes: metrics, attempts, events, signals, metadata, completedAt
