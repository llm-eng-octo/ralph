# Addition MCQ Blitz — Game Spec v2

## 1. Overview

| Field | Value |
|-------|-------|
| **Game ID** | `addition-mcq` |
| **Title** | Addition MCQ Blitz |
| **Description** | A multiple-choice quiz game where players solve addition problems by selecting the correct answer from 4 options. 3 lives, 30-second countdown per question. |
| **Input Method** | Tap / Click |
| **Validation Type** | Fixed Answer (PART-013) |
| **Timer** | Countdown, 30 seconds per question (PART-006) |
| **Lives** | 3 |
| **Questions per Session** | Configurable via content (default: 10) |
| **Win Condition** | Answer all questions before running out of lives |
| **Lose Condition** | Lose all 3 lives OR timer reaches 0 on any question |

---

## 2. Parts Used

| Part | Name | Reason |
|------|------|--------|
| PART-001 | HTML Shell | Mandatory |
| PART-002 | Package Scripts | Mandatory |
| PART-003 | waitForPackages | Mandatory |
| PART-004 | Initialization Block | Mandatory |
| PART-005 | VisibilityTracker | Mandatory |
| PART-006 | TimerComponent | 30-second countdown per question |
| PART-007 | Game State Object | Mandatory |
| PART-008 | PostMessage Protocol | Mandatory |
| PART-009 | Attempt Tracking | Mandatory |
| PART-010 | Event Tracking & SignalCollector | Mandatory |
| PART-011 | End Game & Metrics | Mandatory |
| PART-012 | Debug Functions | Mandatory |
| PART-013 | Validation — Fixed Answer | Single correct MCQ answer |
| PART-019 | Results Screen UI | Mandatory |
| PART-020 | CSS Variables & Colors | Mandatory |
| PART-021 | Screen Layout CSS | Mandatory |
| PART-022 | Game Buttons | 4 MCQ option buttons |
| PART-023 | ProgressBar Component | Show question progress + lives |
| PART-024 | TransitionScreen Component | Start screen, game-over screen |
| PART-025 | ScreenLayout Component | Required by ProgressBar + TransitionScreen |
| PART-026 | Anti-Patterns | Verification checklist |
| PART-027 | Play Area Construction | Mandatory |
| PART-028 | InputSchema Patterns | Mandatory |
| PART-030 | Sentry Error Tracking | Mandatory |

---

## 3. Game State

```javascript
const gameState = {
  currentRound: 0,
  totalRounds: 10,       // overwritten by postMessage content
  lives: 3,
  totalLives: 3,
  score: 0,
  isGameOver: false,
  startTime: null,
  questions: [],
  selectedAnswer: null,
  isAnswered: false,
};
```

---

## 4. Content Structure (InputSchema)

```json
{
  "questions": [
    {
      "question": "What is 7 + 8?",
      "options": ["12", "14", "15", "16"],
      "correctAnswer": "15"
    },
    {
      "question": "What is 23 + 45?",
      "options": ["58", "67", "68", "78"],
      "correctAnswer": "68"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `questions` | array | Array of question objects |
| `questions[].question` | string | The addition problem text |
| `questions[].options` | string[4] | Exactly 4 answer choices |
| `questions[].correctAnswer` | string | Must match one of the options exactly |

---

## 5. Screen Flow

```
PostMessage received
       │
       ▼
  Start Screen          [TransitionScreen]
  "Addition Blitz!"
  [Let's Go!] button
       │
       ▼
  Game Screen           [ProgressBar: question X/Y + ❤️ lives]
  ┌─────────────────┐
  │  ⏱ 30          │   [TimerComponent — sec format]
  │                 │
  │  "7 + 8 = ?"    │   [Question display]
  │                 │
  │  [12]    [14]   │   [4 MCQ buttons — 2x2 grid]
  │  [15]    [16]   │
  └─────────────────┘
       │
   ┌───┴──────────────────┐
   │ Correct              │ Wrong / Timer = 0
   ▼                      ▼
  Button turns green     Button turns red
  +1 score               -1 life
  800ms pause            800ms pause
       │                      │
       ▼                      ▼
  Next question         Lives left? ──► No ──► Game Over Screen
                             │                  [TransitionScreen]
                             ▼
                        Yes → Next question
       │
   All questions done
       ▼
  Results Screen        [Standard PART-019]
```

---

## 6. Timer Behavior

- Timer type: `decrease` (countdown)
- Start time: `30` seconds per question
- End time: `0`
- Format: `'sec'` (shows SS only)
- On timer end: treat as wrong answer — deduct a life, check lives, load next question or show game over
- Timer resets to 30 seconds on each new question via `timer.reset()` then `timer.start()`
- Timer pauses/resumes via VisibilityTracker flags (see PART-006 cross-system pause)
- Timer is destroyed in both `endGame()` and `showGameOver()`

```javascript
timer = new TimerComponent('timer-container', {
  timerType: 'decrease',
  format: 'sec',
  startTime: 30,
  endTime: 0,
  autoStart: false,
  onEnd: (timeTaken) => {
    handleTimeout();
  }
});
```

---

## 7. Helper Functions

### 7a. getOptionButtons() → HTMLButtonElement[]

Returns all 4 option button elements in order.

```javascript
function getOptionButtons() {
  return [0, 1, 2, 3].map(i => document.getElementById(`option-${i}`));
}
```

### 7b. disableAllOptions()

Disables all 4 option buttons immediately (prevents double-tap after answer).

```javascript
function disableAllOptions() {
  getOptionButtons().forEach(btn => { btn.disabled = true; });
}
```

---

## 8. Core Game Logic

### 8a. loadQuestion(index)

```javascript
function loadQuestion(index) {
  const q = gameState.questions[index];
  document.getElementById('question-text').textContent = q.question;
  getOptionButtons().forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.className = 'option-btn';
    btn.disabled = false;
  });
  gameState.isAnswered = false;
  gameState.selectedAnswer = null;
  timer.reset();
  timer.start();
  progressBar.update(gameState.currentRound, gameState.lives);
}
```

### 8b. handleOptionClick(buttonElement)

Called from inline onclick with `this` (the button element). Receives the DOM button directly — no lookup needed.

```javascript
function handleOptionClick(buttonElement) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  timer.pause();

  const selectedOption = buttonElement.textContent.trim();
  const q = gameState.questions[gameState.currentRound];
  const isCorrect = validateAnswer(selectedOption, q.correctAnswer);

  buttonElement.classList.add(isCorrect ? 'correct' : 'incorrect');
  disableAllOptions();

  trackAttempt({
    question: q.question,
    userAnswer: selectedOption,
    correctAnswer: q.correctAnswer,
    isCorrect
  });

  if (isCorrect) {
    gameState.score++;
  } else {
    gameState.lives--;
  }

  setTimeout(() => {
    advanceGame();
  }, 800);
}
```

### 8c. handleTimeout()

```javascript
function handleTimeout() {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  gameState.lives--;

  const q = gameState.questions[gameState.currentRound];
  trackAttempt({
    question: q.question,
    userAnswer: null,
    correctAnswer: q.correctAnswer,
    isCorrect: false
  });

  disableAllOptions();

  setTimeout(() => {
    advanceGame();
  }, 800);
}
```

### 8d. advanceGame()

```javascript
function advanceGame() {
  gameState.currentRound++;

  if (gameState.lives <= 0) {
    showGameOver();
    return;
  }

  if (gameState.currentRound >= gameState.totalRounds) {
    endGame();
    return;
  }

  loadQuestion(gameState.currentRound);
}
```

### 8e. showGameOver()

Destroys the timer before showing game-over screen to prevent phantom `onEnd` callbacks during retry. TransitionScreen overlays the game screen — no need to explicitly hide `#game-screen`.

```javascript
function showGameOver() {
  timer.destroy();   // destroy, not just stop, to prevent phantom callbacks on retry
  progressBar.destroy();
  transitionScreen.show({
    icons: ['💔'],
    iconSize: 'large',
    title: 'Game Over!',
    subtitle: `You scored ${gameState.score} out of ${gameState.totalRounds}`,
    buttons: [{ text: 'Try Again', type: 'primary', action: () => restartGame() }]
  });
}
```

### 8f. startGame()

```javascript
function startGame() {
  transitionScreen.hide();
  document.getElementById('game-screen').style.display = 'flex';
  gameState.startTime = Date.now();
  loadQuestion(0);
}
```

### 8g. restartGame()

Resets all game state, recreates timer and ProgressBar, and starts from question 0. Bypasses intro screen on retry — goes straight to question 1 for better UX.

```javascript
function restartGame() {
  // Reset game state
  gameState.currentRound = 0;
  gameState.lives = gameState.totalLives;
  gameState.score = 0;
  gameState.isGameOver = false;
  gameState.isAnswered = false;
  gameState.selectedAnswer = null;
  gameState.startTime = null;

  // Recreate timer (previous one was destroyed in showGameOver)
  timer = new TimerComponent('timer-container', {
    timerType: 'decrease',
    format: 'sec',
    startTime: 30,
    endTime: 0,
    autoStart: false,
    onEnd: (timeTaken) => { handleTimeout(); }
  });

  // Recreate ProgressBar
  progressBar = new ProgressBarComponent({
    autoInject: true,
    totalRounds: gameState.totalRounds,
    totalLives: gameState.totalLives
  });
  progressBar.update(0, gameState.totalLives);

  // Start fresh
  startGame();
}
```

---

## 9. PostMessage Handler

ProgressBar is created **inside** the postMessage handler, after `totalRounds` is known from content — not during initialization.

```javascript
// Inside postMessage handler, after content is received:
gameState.questions = content.questions;
gameState.totalRounds = content.questions.length;

// ProgressBar created here, not at init time, so totalRounds is correct
progressBar = new ProgressBarComponent({
  autoInject: true,
  totalRounds: gameState.totalRounds,
  totalLives: gameState.totalLives
});
progressBar.update(0, gameState.totalLives);

// Show start screen
transitionScreen.show({
  icons: ['➕'],
  iconSize: 'large',
  title: 'Addition Blitz!',
  subtitle: 'Answer fast — you have 3 lives and 30 seconds per question.',
  buttons: [{ text: "Let's Go!", type: 'primary', action: () => startGame() }]
});
```

---

## 10. HTML Structure

Note: `onclick="handleOptionClick(this)"` passes the button element directly — no text lookup needed.

```html
<div id="app">
  <!-- ScreenLayout injects progress bar and transition slots -->

  <!-- Game Screen -->
  <div id="game-screen" style="display:none">
    <div id="timer-container"></div>
    <div id="question-container">
      <p id="question-text"></p>
    </div>
    <div id="options-grid">
      <button id="option-0" class="option-btn" onclick="handleOptionClick(this)"></button>
      <button id="option-1" class="option-btn" onclick="handleOptionClick(this)"></button>
      <button id="option-2" class="option-btn" onclick="handleOptionClick(this)"></button>
      <button id="option-3" class="option-btn" onclick="handleOptionClick(this)"></button>
    </div>
  </div>

  <!-- Results Screen (PART-019) -->
  <div id="results-screen" style="display:none"></div>
</div>
```

---

## 11. ScreenLayout Setup

```javascript
ScreenLayout.inject('app', {
  slots: { progressBar: true, transitionScreen: true }
});

const transitionScreen = new TransitionScreenComponent({ autoInject: true });
// Note: progressBar is created in postMessage handler (Section 9), not here
```

---

## 12. CSS Specifications

```css
#game-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 16px;
  height: 100%;
}

#question-container {
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

#question-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--mathai-dark);
  margin: 0;
}

#options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.option-btn {
  background: var(--mathai-white);
  border: 2px solid var(--mathai-blue);
  border-radius: 12px;
  padding: 18px 12px;
  font-size: 22px;
  font-weight: 600;
  color: var(--mathai-blue);
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-btn:hover:not(:disabled) {
  background: var(--mathai-blue);
  color: white;
  transform: scale(1.03);
}

.option-btn.correct {
  background: var(--mathai-green);
  border-color: var(--mathai-green);
  color: white;
}

.option-btn.incorrect {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## 13. Metrics (endGame)

```javascript
{
  score: gameState.score,
  totalRounds: gameState.totalRounds,
  livesRemaining: gameState.lives,
  totalLives: gameState.totalLives,
  accuracy: gameState.score / gameState.totalRounds,
  // total elapsed game time in seconds
  timeTaken: Math.round((Date.now() - gameState.startTime) / 1000),
  attempts: gameState.attempts
}
```

---

## 14. Verification Checklist (PART-026)

- [ ] `handleOptionClick` accepts `buttonElement` (DOM element via `this`), not a string
- [ ] `handleOptionClick` and `handleTimeout` defined on `window` (global scope)
- [ ] `getOptionButtons()` and `disableAllOptions()` defined as helpers
- [ ] Timer uses `TimerComponent`, no `setInterval`
- [ ] `timer.destroy()` called in BOTH `endGame()` and `showGameOver()`
- [ ] `progressBar.destroy()` called in BOTH `endGame()` and `showGameOver()`
- [ ] ProgressBar instantiated INSIDE postMessage handler (not at init time)
- [ ] `restartGame()` fully resets all gameState fields and recreates timer + ProgressBar
- [ ] Answer comparison via `validateAnswer()` (PART-013)
- [ ] Buttons disabled immediately after click via `disableAllOptions()`
- [ ] `gameState.isAnswered` guard in both `handleOptionClick` and `handleTimeout`
- [ ] `timeTaken` in metrics uses `Date.now() - gameState.startTime` (total game duration)
- [ ] ProgressBar `update()` first param = rounds completed (0-based)
- [ ] Results screen shown after all questions answered (not on game-over)
- [ ] 4 option buttons use `onclick="handleOptionClick(this)"` (pass element, not text)

---

## 15. Test Scenarios

### Page Load
1. Page loads without JS errors
2. Start screen NOT visible until postMessage content is received

### PostMessage
3. Game receives content via postMessage
4. Content has 10 questions → `totalRounds` = 10
5. ProgressBar shows "0/10 rounds completed" immediately after content load
6. Start screen shown after content arrives

### Start
7. Clicking "Let's Go!" hides start screen, shows game screen
8. First question text displayed
9. 4 option buttons populated with content options
10. Timer starts counting down from 30

### Correct Answer
11. Click correct option → that button turns green, others disabled
12. `score` increments by 1
13. After 800ms, next question loads, timer resets to 30

### Wrong Answer
14. Click wrong option → that button turns red, others disabled
15. `lives` decrements by 1
16. After 800ms, next question loads

### Timeout
17. Wait 30s → `handleTimeout` fires
18. `lives` decrements, buttons disabled
19. After 800ms, next question loads (or game over)

### Game Over
20. After 3 wrong/timeout events, game-over TransitionScreen shown
21. "Try Again" button fully resets game: score=0, lives=3, round=0
22. New timer created, ProgressBar recreated with correct totalRounds

### Win / End
23. After answering all questions, Results screen shown
24. Score and accuracy displayed correctly
25. `timeTaken` reflects total elapsed seconds from startGame() to endGame()

### ProgressBar
26. Progress bar shows "0/N rounds completed" at start
27. Increments by 1 after each question (including wrong answers)
28. Hearts update after each life lost
