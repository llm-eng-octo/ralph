# Game-Specific Template: Subjective

> **Assembly Book** — An LLM reading ONLY this file should produce a working HTML file.

---

## 1. Game Identity

- **Title:** Subjective
- **Game ID:** game_1710000000_subjective001
- **Type:** standard
- **Description:** A text-input game with LLM-based subjective evaluation. Each round presents a bold question and a sub-question prompt. The player types their answer in a textarea, submits for LLM evaluation, and receives dynamic audio/subtitle feedback with stickers based on correctness. 3 rounds, no levels, no timer, no lives. Uses `MathAIHelpers.SubjectiveEvaluation.evaluate()` for answer assessment and `FeedbackManager.playDynamicFeedback()` for voice feedback.

---

## 2. Parts Selected

| Part ID | Name | Included | Config/Notes |
|---------|------|----------|-------------|
| PART-001 | HTML Shell | YES | — |
| PART-002 | Package Scripts | YES | — |
| PART-003 | waitForPackages | YES | Checks: FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector, MathAIHelpers |
| PART-004 | Initialization Block | YES | — |
| PART-005 | VisibilityTracker | YES | popupProps: default |
| PART-006 | TimerComponent | NO | No timer — thinking/writing focused. Note: TimerComponent is still checked in waitForPackages because it ships as part of the components package bundle. VisibilityTracker callbacks safely guard timer calls with `if (timer)`. |
| PART-007 | Game State Object | YES | Custom fields: userAnswer, isEvaluating, currentDynamicAudio |
| PART-008 | PostMessage Protocol | YES | — |
| PART-009 | Attempt Tracking | YES | — |
| PART-010 | Event Tracking & SignalCollector | YES | Custom events: answer_submitted, evaluation_complete, round_complete. SignalCollector v3 integrated. |
| PART-011 | End Game & Metrics | YES | Stars: correctAnswers-based (3/2/1/0) |
| PART-012 | Debug Functions | YES | — |
| PART-013 | Validation Fixed | NO | — |
| PART-014 | Validation Function | NO | — |
| PART-015 | Validation LLM | YES | MathAIHelpers.SubjectiveEvaluation.evaluate() for subjective answer checking |
| PART-016 | StoriesComponent | NO | — |
| PART-017 | Feedback Integration | YES | correct_sound_effect + incorrect_sound_effect for SFX, playDynamicFeedback for voice feedback. Stickers as `{ image, duration, type: 'IMAGE_GIF' }` objects for sound.play(), plain URL strings for playDynamicFeedback(). |
| PART-018 | Case Converter | NO | — |
| PART-019 | Results Screen UI | YES | Custom metrics: accuracy, time, correct count |
| PART-020 | CSS Variables & Colors | YES | — |
| PART-021 | Screen Layout CSS | YES | — |
| PART-022 | Game Buttons | YES | Submit + Reset buttons |
| PART-023 | ProgressBar Component | YES | totalRounds: 3, totalLives: 0 (no lives) |
| PART-024 | TransitionScreen Component | YES | Screens: start, round transitions, game complete |
| PART-025 | ScreenLayout Component | YES | sections: header=true, questionText=true, progressBar=true, playArea=true, transitionScreen=true |
| PART-026 | Anti-Patterns | YES (REFERENCE) | Verification checklist |
| PART-027 | Play Area Construction | YES | Layout: textarea input + submit/reset buttons + loading indicator + feedback display |
| PART-028 | InputSchema Patterns | YES | Schema type: rounds with question, subQuestion, rubric |
| PART-030 | Sentry Error Tracking | YES | SentryConfig-based centralized pattern, SDK v10.23.0 |
| PART-033 | Interaction Patterns | YES | Patterns: text input + submit button |
| PART-034 | Variable Schema Serialization | YES (POST_GEN) | Serializes Section 4 to inputSchema.json |
| PART-035 | Test Plan Generation | YES (POST_GEN) | Generates tests.md after HTML |
| PART-036 | EventCapture Package | YES | Inline placeholder |
| PART-037 | Playwright Testing | YES (POST_GEN) | Ralph loop generates tests + fix cycle |
| PART-038 | InteractionManager | YES | Selector: `.answer-area`, disableOnAudioFeedback: false, disableOnEvaluation: true |

---

## 3. Game State

```javascript
window.gameState = {
  // MANDATORY (from PART-007):
  gameId: 'game_1710000000_subjective001',
  contentSetId: null,
  signalConfig: {},
  sessionHistory: [],
  currentRound: 0,
  totalRounds: 3,
  score: 0,
  attempts: [],
  events: [],
  startTime: null,
  isActive: false,
  isProcessing: false,
  gameEnded: false,
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
  userAnswer: '',               // Current answer text
  isEvaluating: false,          // True while LLM evaluation in progress
  correctAnswers: 0,            // Running count of correct rounds
  roundResults: [],             // Array of { round, correct, feedback, userAnswer }
  currentDynamicAudio: null,    // Reference for stopping dynamic TTS
  voGameStartPlayed: false      // Play welcome VO only once, even across restarts
};

let visibilityTracker = null;
let signalCollector = null;
let progressBar = null;
let transitionScreen = null;
var visibilityTrackerConfig = null;
```

---

## 4. Input Schema

### Schema Definition

```json
{
  "type": "object",
  "properties": {
    "rounds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string",
            "description": "Bold main question displayed in questionText slot (e.g., 'Do you know what **variables** are?')"
          },
          "subQuestion": {
            "type": "string",
            "description": "Sub-question prompt below the main question (e.g., 'Can you **explain** what you know about it?')"
          },
          "evaluationPrompt": {
            "type": "string",
            "description": "Full evaluation prompt for the LLM. Must include {{student_answer}} placeholder. LLM returns one word: correct/incorrect/gibberish/idk."
          },
          "feedbackPrompt": {
            "type": "string",
            "description": "Full feedback prompt for the LLM. Must include {{student_answer}} and {{evaluation}} placeholders. LLM returns short feedback text."
          },
          "placeholder": {
            "type": "string",
            "description": "Placeholder text for the textarea input"
          }
        },
        "required": ["question", "subQuestion", "evaluationPrompt", "feedbackPrompt"]
      }
    }
  },
  "required": ["rounds"]
}
```

### Fallback Test Content

```javascript
var fallbackContent = {
  rounds: [
    {
      question: 'Do you know what **variables** are?',
      subQuestion: 'Can you **explain** what you know about it?',
      evaluationPrompt: '...round-specific evaluation prompt with {{student_answer}} placeholder...',
      feedbackPrompt: '...round-specific feedback prompt with {{student_answer}} and {{evaluation}} placeholders...',
      placeholder: 'Type your answer here...'
    },
    // ... (see HTML for full prompt text per round)
  ]
};
```

> **Prompt structure:** Each round has its own `evaluationPrompt` and `feedbackPrompt` tailored to the question. The evaluation prompt instructs the LLM to return exactly one word: `correct`, `incorrect`, `gibberish`, or `idk`. The feedback prompt uses `{{evaluation}}` to reference the evaluation result and provides category-specific feedback criteria. Both prompts include `{{student_answer}}` which is replaced at runtime with the actual answer.

**4-Category Evaluation System:**

| Category | Meaning | Criteria |
|----------|---------|----------|
| `correct` | Student knows the concept | Comprehensible after fixing spelling/grammar; even partial/incomplete answers; "yes I know" responses |
| `incorrect` | Wrong explanation | Has some explanation but incorrect or not remotely close |
| `gibberish` | Incomprehensible | Cannot be understood even after fixing errors; totally irrelevant |
| `idk` | Student doesn't know | "I don't know", "idk", "no" responses |

**Feedback criteria per category:**
- **correct:** Short, acknowledge understanding, assess LEVEL of understanding, end with "we will deepen understanding today". Do NOT reveal answers.
- **incorrect:** Acknowledge if possible, otherwise "That's an interesting answer!". Do NOT reveal answers.
- **idk:** "It's alright if you don't know! We will learn about them in this activity"
- **gibberish:** "It's alright if you don't know, we will learn about it"

### Content Sets

**Content Set 1 (General Math Concepts):**

```json
{
  "rounds": [
    {
      "question": "Do you know what **variables** are?",
      "subQuestion": "Can you **explain** what you know about it?",
      "rubric": "The student should demonstrate understanding that a variable is a symbol (usually a letter) that represents a value that can change. Accept: 'a letter that stands for a number', 'something that holds a value', 'like x or y that can be different numbers'. Partially correct: vague but shows some understanding like 'it changes'. Reject: completely unrelated answers or blank.",
      "placeholder": "Type your answer here..."
    },
    {
      "question": "What is the difference between **addition** and **multiplication**?",
      "subQuestion": "Can you **describe** how they are different with an example?",
      "rubric": "The student should explain that addition combines values while multiplication is repeated addition or scaling. Accept: 'addition is putting numbers together, multiplication is adding a number many times', '3+3+3 is same as 3×3'. Partially correct: knows they are different operations but cannot explain how. Reject: says they are the same or gives unrelated answer.",
      "placeholder": "Explain with an example..."
    },
    {
      "question": "What does it mean to **solve an equation**?",
      "subQuestion": "Can you **explain** the steps in your own words?",
      "rubric": "The student should convey that solving an equation means finding the value of the unknown variable that makes both sides equal. Accept: 'find what x equals', 'make both sides the same', 'figure out the missing number'. Partially correct: mentions finding an answer but does not reference equality or balance. Reject: completely unrelated or blank.",
      "placeholder": "Describe in your own words..."
    }
  ]
}
```

**Content Set 2 (Geometry Concepts):**

```json
{
  "rounds": [
    {
      "question": "What is the **perimeter** of a shape?",
      "subQuestion": "Can you **explain** how to find it?",
      "rubric": "The student should explain that perimeter is the total distance around the outside of a shape, found by adding all side lengths. Accept: 'add all the sides', 'distance around the shape'. Partially correct: says it has to do with the outside but no method. Reject: confuses with area or gives unrelated answer.",
      "placeholder": "Explain how to find the perimeter..."
    },
    {
      "question": "How are **squares** and **rectangles** related?",
      "subQuestion": "Can you **describe** what makes them similar and different?",
      "rubric": "The student should identify that a square is a special rectangle where all sides are equal. Accept: 'a square is a rectangle with equal sides', 'both have 4 sides and right angles but square sides are all the same'. Partially correct: knows both are shapes with 4 sides. Reject: says they are completely different or unrelated answer.",
      "placeholder": "Describe similarities and differences..."
    },
    {
      "question": "What is **symmetry** in math?",
      "subQuestion": "Can you **give an example** of something symmetrical?",
      "rubric": "The student should explain that symmetry means one half mirrors the other when folded along a line. Accept: 'when both sides look the same', 'like a butterfly - both wings match'. Partially correct: gives an example without explaining the concept. Reject: completely unrelated or blank.",
      "placeholder": "Explain with an example..."
    }
  ]
}
```

**Content Set 3 (Number Sense):**

```json
{
  "rounds": [
    {
      "question": "What are **fractions** and why do we use them?",
      "subQuestion": "Can you **explain** with a real-life example?",
      "rubric": "The student should explain that fractions represent parts of a whole and give a relevant example. Accept: 'a piece of a pizza like 1/2', 'when you split something into equal parts'. Partially correct: knows it involves parts but no example. Reject: completely unrelated answer.",
      "placeholder": "Give a real-life example..."
    },
    {
      "question": "What is the difference between **even** and **odd** numbers?",
      "subQuestion": "Can you **explain** how to tell them apart?",
      "rubric": "The student should explain that even numbers are divisible by 2 (or can be split into two equal groups) while odd numbers cannot. Accept: 'even can be divided by 2, odd cannot', 'even ends in 0,2,4,6,8'. Partially correct: can identify examples but cannot explain the rule. Reject: completely wrong or blank.",
      "placeholder": "Explain the difference..."
    },
    {
      "question": "Why is **zero** a special number?",
      "subQuestion": "Can you **describe** what makes it different from other numbers?",
      "rubric": "The student should identify at least one unique property of zero: additive identity (adding 0 changes nothing), multiplying by 0 gives 0, it's neither positive nor negative. Accept: 'anything plus zero stays the same', 'times zero is always zero'. Partially correct: says it means nothing or empty without a mathematical property. Reject: completely unrelated.",
      "placeholder": "What makes zero special..."
    }
  ]
}
```

### Content Set Generation Guidance

**3 content sets:** General Math, Geometry, Number Sense

**Dimensions that vary:**
- Topic area (algebra concepts, geometry concepts, number sense)
- Complexity of expected explanation (simple definition → comparison → reasoning)
- Each set has exactly 3 rounds

**Constraints all content sets must satisfy:**
- Every round must have a question, subQuestion, and rubric
- Questions should use **bold** markdown for key terms
- Sub-questions should prompt explanation/description, not yes/no
- Rubrics must specify accept/partially-correct/reject criteria
- Placeholder text should hint at the expected answer format
- Questions must be age-appropriate (elementary/middle school math)

---

## 5. Screens & HTML Structure

### Body HTML (PART-025)

The `<body>` contains only `<div id="app"></div>`. ScreenLayout.inject() creates the layout structure including `#gameContent` and the `questionText` slot. Content is injected into two separate areas:

1. **Question text → `layout.questionText` slot** — Question and sub-question go here. This slot stays visible on ALL screens (gameplay, transitions, results). Updated per round. Never put question text inside `#gameContent`.
2. **Play area → `#gameContent`** — Textarea, buttons, loading indicator, feedback display go here. This area is toggled by TransitionScreen (hidden during transitions, visible during gameplay).

```html
<div id="app"></div>
```

**questionText slot content (updated per round):**
```html
<div class="question-text-container">
  <p class="instruction-text"><strong>Do you know what <strong>variables</strong> are?</strong></p>
  <p class="instruction-text-sub">Can you <strong>explain</strong> what you know about it?</p>
</div>
```

> **IMPORTANT:** The questionText slot content is updated dynamically at the start of each round via `updateQuestionText(roundData)`. Bold markdown `**text**` in the content is converted to `<strong>text</strong>` in HTML.

**#gameContent content (play area only):**
```html
<div id="game-screen" class="game-block">
  <div class="answer-area" id="answer-area" data-signal-id="answer-area">
    <textarea id="answer-input" data-signal-id="answer-input" class="game-textarea" rows="4" placeholder="Type your answer here..."></textarea>
  </div>
  <div id="loading-indicator" class="loading-indicator" style="display: none;">
    <div class="spinner"></div>
    <span id="loading-text">Evaluating your answer...</span>
  </div>
  <div id="feedback-display" class="feedback-display" style="display: none;">
    <div id="feedback-result" class="feedback-result"></div>
  </div>
  <div class="btn-container">
    <button class="game-btn btn-secondary" data-signal-id="btn-reset" onclick="handleReset()">Reset</button>
    <button class="game-btn btn-primary" id="btn-submit" data-signal-id="btn-submit" onclick="handleSubmit()">
      <span class="btn-spinner" id="btn-spinner"></span>
      <span id="btn-text">Submit</span>
    </button>
  </div>
</div>
```

---

## 6. CSS

```css
/* === CSS Variables (PART-020) === */
:root {
  --mathai-green: #219653;
  --mathai-light-green: #EAFBF1;
  --mathai-red: #E35757;
  --mathai-light-red: #FDECEC;
  --mathai-blue: #2563eb;
  --mathai-light-blue: #EBF0FF;
  --mathai-gray: #828282;
  --mathai-light-gray: #F2F2F2;
  --mathai-white: #FFFFFF;
  --mathai-black: #1A1A2E;
  --mathai-text-primary: #000000;
  --mathai-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mathai-font-size-title: 24px;
  --mathai-font-size-body: 16px;
  --mathai-font-size-label: 14px;
  --mathai-font-size-small: 12px;
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

/* === Reset === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-white);
  color: var(--mathai-text-primary, #000000);
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

.instruction-text-sub strong { font-weight: 700; color: var(--mathai-text-primary, #000000); }

/* === Answer Area === */
.answer-area {
  width: 100%;
  max-width: 340px;
}

.game-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--mathai-light-gray);
  border-radius: 12px;
  font-size: var(--mathai-font-size-body);
  font-family: var(--mathai-font-family);
  color: var(--mathai-text-primary, #000000);
  resize: vertical;
  min-height: 120px;
  max-height: 200px;
  outline: none;
  box-sizing: border-box;
  line-height: 1.5;
  background: var(--mathai-white);
  transition: border-color 0.2s ease;
}

.game-textarea:focus {
  border-color: var(--mathai-blue);
}

.game-textarea::placeholder {
  color: var(--mathai-gray);
  font-style: italic;
}

/* === Loading Indicator === */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  color: var(--mathai-gray);
  font-size: var(--mathai-font-size-label);
  width: 100%;
  max-width: 340px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--mathai-light-gray);
  border-top-color: var(--mathai-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Button spinner (inside submit button) */
.btn-spinner {
  display: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

.btn-primary:disabled .btn-spinner {
  display: inline-block;
}

/* === Feedback Display === */
.feedback-display {
  width: 100%;
  max-width: 340px;
}

.feedback-result {
  padding: 14px 16px;
  border-radius: 12px;
  font-size: var(--mathai-font-size-label);
  line-height: 1.5;
}

.feedback-result.correct {
  background: var(--mathai-light-green);
  color: var(--mathai-green);
  border: 1px solid var(--mathai-green);
}

.feedback-result.incorrect {
  background: var(--mathai-light-red);
  color: var(--mathai-red);
  border: 1px solid var(--mathai-red);
}

.feedback-result.partial {
  background: var(--mathai-light-blue);
  color: var(--mathai-blue);
  border: 1px solid var(--mathai-blue);
}

/* === BUTTONS (PART-022) === */
.btn-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  max-width: 340px;
  margin: 8px auto 0;
}

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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary {
  background: var(--mathai-green);
  color: var(--mathai-white);
}
.btn-primary:hover { filter: brightness(0.9); }
.btn-primary:active { transform: scale(0.95); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:disabled:active { transform: none; }

.btn-secondary {
  background: var(--mathai-light-gray);
  color: var(--mathai-text-primary, #000000);
  border: 2px solid #ddd;
}
.btn-secondary:hover { background: #e8e8e8; }
.btn-secondary:active { transform: scale(0.95); }
```

---

## 7. Game Flow

1. **Page loads** → DOMContentLoaded fires
   - waitForPackages() — checks FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector, MathAIHelpers
   - FeedbackManager.init()
   - Preload sounds: correct_sound_effect, incorrect_sound_effect, victory_sound_effect, victory, game_complete_sound_effect, game_complete_1_star, game_complete_2_star, game_over_sound_effect, game_over
   - SignalCollector created with gameId, contentSetId and assigned to window.signalCollector (PART-010 v3)
   - ScreenLayout.inject('app', { sections: { header: true, questionText: true, progressBar: true, playArea: true, transitionScreen: true } })
   - Build initial question text into `layout.questionText` slot (title: "Subjective", sub: "Answer questions in your own words")
   - Build game play area HTML into `#gameContent` via innerHTML (textarea, buttons, loading indicator, feedback area)
   - InteractionManager creation targeting `.answer-area`
   - ProgressBar created (totalRounds: 3, totalLives: 0)
   - TransitionScreen created
   - VisibilityTracker created
   - window.addEventListener('message', handlePostMessage)
   - Send `game_ready` postMessage to parent (PART-008)
   - Show start transition screen with welcome audio

2. **Start screen shows:**
   - Icons: ['✍️']
   - Title: "Subjective"
   - Subtitle: "Answer questions in your own words. Be as detailed as you can!"
   - Button: "Start!" → calls `startGame()`
   - Audio: Welcome VO via `playDynamicFeedback` with sticker (only plays once via `voGameStartPlayed` guard)

3. **startGame() runs:**
   - `FeedbackManager._stopCurrentDynamic()`
   - Load content from gameState.content or fallbackContent
   - Sync totalRounds from content.rounds.length
   - Set gameState.startTime = Date.now(), gameState.isActive = true
   - Fire 'game_start' event
   - Call `startRound()`

4. **startRound():**
   - Increment gameState.currentRound
   - Update questionText slot with current round's question and subQuestion
   - Clear textarea, hide feedback, hide loading
   - Enable submit button
   - Update progressBar
   - Focus textarea
   - Record content_render view event

5. **User types answer, clicks Submit:**
   - Guard: `if (gameState.isProcessing || !gameState.isActive) return`
   - Validate non-empty input (trim + length check)
   - Set `gameState.isProcessing = true`, disable button, show "Evaluating..."
   - Call `MathAIHelpers.SubjectiveEvaluation.evaluate()` with the round's rubric
   - Parse evaluation result to determine correctness (correct/partial/incorrect)
   - Show feedback UI with result text
   - Record attempt
   - Play correct/incorrect SFX with sticker (fire-and-forget)
   - Play dynamic feedback audio with evaluation feedback text + sticker
   - After feedback completes, show "Next" button (or auto-advance to next round / end game)

6. **handleNextRound():**
   - `FeedbackManager._stopCurrentDynamic()`
   - If more rounds: call `startRound()`
   - If last round: call `endGame()`

7. **endGame():**
   - Guard: `if (gameState.gameEnded) return`
   - Calculate metrics (accuracy = correctAnswers/totalRounds * 100, stars based on correctAnswers)
   - recordViewEvent → seal → show results via TransitionScreen content slot → postMessage → play star-based audio → guarded cleanup

---

## 8. Functions

### Global Scope (RULE-001)

**setupGame()**
- Load content only — does NOT start rounds (idempotent, safe to call multiple times)
- If !gameState.content → use fallbackContent
- Sync totalRounds: `gameState.totalRounds = gameState.content.rounds.length`

> **IMPORTANT:** `setupGame()` only loads content. It does NOT set startTime, isActive, or call startRound(). Those happen in `startGame()`. This prevents double-advancing when both `handlePostMessage` and "Let's Go!" button call setupGame().

**startRound()**
- gameState.currentRound++
- var roundData = gameState.content.rounds[gameState.currentRound - 1]
- updateQuestionText(roundData)
- Reset UI: clear textarea, hide feedback, hide loading, enable submit, set btn text to "Submit"
- gameState.userAnswer = ''
- gameState.isProcessing = false
- progressBar.update(gameState.currentRound - 1, 0) — (currentRound - 1 because round not yet completed)
- Focus textarea
- Record view events:
  ```javascript
  if (signalCollector) {
    signalCollector.recordViewEvent('content_render', {
      screen: 'gameplay',
      content_snapshot: {
        type: 'round_started',
        round: gameState.currentRound,
        question: roundData.question,
        trigger: 'round_start'
      },
      components: {
        progress: { current: gameState.currentRound, total: gameState.totalRounds }
      }
    });
  }
  ```

**updateQuestionText(roundData)**
- Convert markdown bold to HTML: replace `**text**` with `<strong>text</strong>`
- Set questionText slot innerHTML:
  ```javascript
  function updateQuestionText(roundData) {
    var questionSlot = document.getElementById(questionSlotId);
    if (!questionSlot) return;
    var questionHTML = roundData.question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    var subQuestionHTML = roundData.subQuestion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    questionSlot.innerHTML = '<div class="question-text-container">'
      + '<p class="instruction-text">' + questionHTML + '</p>'
      + '<p class="instruction-text-sub">' + subQuestionHTML + '</p>'
      + '</div>';
  }
  ```

> **IMPORTANT:** `questionSlotId` is stored from `layout.questionText` during init. This is a module-scope variable (e.g., `var questionSlotId = null;`) set once during DOMContentLoaded.

**async handleSubmit()**
- Guard: `if (gameState.isProcessing || !gameState.isActive) return`
- `gameState.isProcessing = true`
- Get answer: `var answer = document.getElementById('answer-input').value.trim()`
- Validate: if empty, show feedback "Please type your answer first", set `gameState.isProcessing = false`, return
- `gameState.userAnswer = answer`
- Disable submit button, show spinner, set btn text to "Evaluating..."
- Show loading indicator
- trackEvent('answer_submitted', 'game', { round: gameState.currentRound, answerLength: answer.length })
- try/catch block:
  ```javascript
  try {
    var roundData = gameState.content.rounds[gameState.currentRound - 1];
    var evaluationPrompt = 'Question: "' + roundData.question.replace(/\*\*/g, '') + '"\n'
      + 'Sub-question: "' + roundData.subQuestion.replace(/\*\*/g, '') + '"\n'
      + 'Student answer: "' + answer + '"\n\n'
      + 'Rubric: ' + roundData.rubric + '\n\n'
      + 'Evaluate the student\'s answer. Respond with EXACTLY this JSON format:\n'
      + '{"correct": true/false, "feedback": "Your feedback text here"}\n'
      + 'Set correct=true if the answer meets the rubric\'s acceptance criteria (including partially correct). Set correct=false only if the answer is clearly wrong or unrelated.';

    var result = await MathAIHelpers.SubjectiveEvaluation.evaluate({
      components: [{
        component_id: 'round_' + gameState.currentRound,
        evaluation_prompt: evaluationPrompt,
        feedback_prompt: 'Based on {{evaluation}}, write a short, encouraging feedback message (1-2 sentences) for the student. If correct, praise their understanding. If incorrect, gently guide them toward the right concept without giving the full answer.'
      }],
      timeout: 30000
    });

    // Hide loading
    document.getElementById('loading-indicator').style.display = 'none';

    // Parse result
    var evaluation = result.data[0].evaluation || '';
    var feedback = result.data[0].feedback || 'Good attempt!';
    var isCorrect = false;

    // Try to parse JSON from evaluation
    try {
      var evalJson = JSON.parse(evaluation);
      isCorrect = evalJson.correct === true;
      if (evalJson.feedback && !feedback) feedback = evalJson.feedback;
    } catch(parseErr) {
      // Fallback: check if evaluation contains positive indicators
      isCorrect = /\bcorrect\b/i.test(evaluation) && !/\bincorrect\b/i.test(evaluation);
    }

    // Update game state
    if (isCorrect) gameState.correctAnswers++;
    gameState.roundResults.push({
      round: gameState.currentRound,
      correct: isCorrect,
      feedback: feedback,
      userAnswer: answer
    });

    // Record attempt
    recordAttempt({
      userAnswer: answer,
      correct: isCorrect,
      question: roundData.question,
      correctAnswer: 'subjective',
      validationType: 'llm',
      metadata: {
        round: gameState.currentRound,
        question: roundData.question,
        evaluation: evaluation,
        feedback: feedback
      }
    });

    trackEvent('evaluation_complete', 'game', { round: gameState.currentRound, correct: isCorrect });

    // Show feedback UI
    var feedbackEl = document.getElementById('feedback-result');
    feedbackEl.textContent = feedback;
    feedbackEl.className = 'feedback-result ' + (isCorrect ? 'correct' : 'incorrect');
    document.getElementById('feedback-display').style.display = 'block';

    // Record feedback view event
    if (signalCollector) {
      signalCollector.recordViewEvent('feedback_display', {
        screen: 'gameplay',
        content_snapshot: {
          feedback_type: isCorrect ? 'correct' : 'incorrect',
          message: feedback,
          audio_id: 'dynamic'
        }
      });
    }

    // Update progress
    progressBar.update(gameState.currentRound, 0);

    // Play SFX (fire-and-forget) + dynamic feedback audio
    if (isCorrect) {
      FeedbackManager.sound.play('correct_sound_effect', {
        sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-20.gif', duration: 2, type: 'IMAGE_GIF' }
      }).catch(function(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); });
    } else {
      FeedbackManager.sound.play('incorrect_sound_effect', {
        sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-28.gif', duration: 2, type: 'IMAGE_GIF' }
      }).catch(function(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); });
    }

    // Update button to "Generating Audio..."
    document.getElementById('btn-text').textContent = 'Playing Feedback...';

    // Play dynamic feedback with voice + subtitle + sticker
    try {
      var dynamicSticker = isCorrect
        ? 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-20.gif'
        : 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-28.gif';

      gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
        audio_content: feedback,
        subtitle: feedback,
        sticker: dynamicSticker
      });
      await gameState.currentDynamicAudio;
    } catch(audioErr) {
      console.error('Dynamic feedback error:', JSON.stringify({ error: audioErr.message }, null, 2));
    }
    gameState.currentDynamicAudio = null;

    // Show Next button (replace Submit)
    document.getElementById('btn-text').textContent = gameState.currentRound < gameState.totalRounds ? 'Next' : 'See Results';
    document.getElementById('btn-submit').disabled = false;
    document.getElementById('btn-submit').onclick = handleNextRound;
    document.getElementById('btn-spinner').style.display = 'none';

    // Disable textarea and reset button after submission
    document.getElementById('answer-input').disabled = true;

    gameState.isProcessing = false;

  } catch(error) {
    console.error('Evaluation error:', JSON.stringify({ error: error.message }, null, 2));
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('btn-text').textContent = 'Submit';
    document.getElementById('btn-submit').disabled = false;
    document.getElementById('btn-spinner').style.display = 'none';
    gameState.isProcessing = false;

    // Show error feedback
    var feedbackEl = document.getElementById('feedback-result');
    feedbackEl.textContent = 'Something went wrong. Please try again.';
    feedbackEl.className = 'feedback-result incorrect';
    document.getElementById('feedback-display').style.display = 'block';
  }
  ```

**handleNextRound()**
- `FeedbackManager._stopCurrentDynamic()`
- Restore submit button onclick: `document.getElementById('btn-submit').onclick = handleSubmit`
- If gameState.currentRound < gameState.totalRounds:
  - startRound()
- Else:
  - endGame()

**handleReset()**
- If `gameState.isProcessing || gameState.isEvaluating` → return (don't reset during evaluation)
- Clear textarea value
- Hide feedback display
- `gameState.userAnswer = ''`
- Focus textarea
- trackEvent('answer_reset', 'game', { round: gameState.currentRound })

**startGame()**
- `FeedbackManager._stopCurrentDynamic()`
- `if (transitionScreen) { try { transitionScreen.hide(); } catch(e) {} }` — explicitly hide transition screen
- setupGame() — loads content (idempotent)
- `gameState.currentRound = 0` — reset round counter
- `gameState.startTime = Date.now()`
- `gameState.duration_data.startTime = new Date().toISOString()`
- `gameState.isActive = true`
- `trackEvent('game_start', 'game')`
- `startRound()` — begins round 1

**async endGame()**
- Guard: `if (gameState.gameEnded) return;`
- `gameState.gameEnded = true; gameState.isActive = false;`
- gameState.duration_data.currentTime = new Date().toISOString()
- Calculate accuracy: `Math.round((gameState.correctAnswers / gameState.totalRounds) * 100)`
- timeTaken = Math.round((Date.now() - gameState.startTime) / 1000)
- Stars (correctAnswers-based): correctAnswers >= 3 ? 3 : correctAnswers >= 2 ? 2 : correctAnswers >= 1 ? 1 : 0
- Build metrics object:
  ```javascript
  var metrics = {
    accuracy: accuracy,
    time: timeTaken,
    stars: stars,
    attempts: gameState.attempts,
    duration_data: gameState.duration_data,
    totalLives: 0,
    correctAnswers: gameState.correctAnswers,
    totalRounds: gameState.totalRounds,
    tries: computeTriesPerRound(gameState.attempts),
    sessionHistory: gameState.sessionHistory || []
  };
  ```
- console.log('Final Metrics:', JSON.stringify(metrics, null, 2))
- trackEvent('game_end', 'game', { score: gameState.score, accuracy: accuracy, stars: stars, correctAnswers: gameState.correctAnswers })
- Sentry breadcrumb:
  ```javascript
  if (typeof Sentry !== 'undefined') Sentry.addBreadcrumb({ category: 'game', message: 'endGame', data: { stars: stars, accuracy: accuracy, correctAnswers: gameState.correctAnswers }, level: 'info' });
  ```
- SignalCollector record + seal:
  ```javascript
  if (signalCollector) {
    signalCollector.recordViewEvent('screen_transition', {
      screen: 'results',
      metadata: { transition_from: 'gameplay' }
    });
    signalCollector.seal();
  }
  ```
- `showResults(metrics)` — TransitionScreen shows results screen
- postMessage game_complete:
  ```javascript
  window.parent.postMessage({
    type: 'game_complete',
    data: {
      metrics: metrics,
      attempts: gameState.attempts,
      completedAt: Date.now()
    }
  }, '*');
  ```
- Play end-game audio with stickers based on stars (all awaited):
- If stars === 3:
  - try { await FeedbackManager.sound.play('victory_sound_effect', { sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757430772002-98.gif', duration: 3, type: 'IMAGE_GIF' } }); } catch(e) { console.error('victory_sfx error:', JSON.stringify({ error: e.message }, null, 2)); }
  - try { await FeedbackManager.sound.play('victory'); } catch(e) { console.error('victory audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- Else if stars === 2:
  - try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-25.gif', duration: 3, type: 'IMAGE_GIF' } }); } catch(e) { console.error('complete_sfx error:', JSON.stringify({ error: e.message }, null, 2)); }
  - try { await FeedbackManager.sound.play('game_complete_2_star'); } catch(e) { console.error('2star audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- Else if stars === 1:
  - try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-25.gif', duration: 3, type: 'IMAGE_GIF' } }); } catch(e) { console.error('complete_sfx error:', JSON.stringify({ error: e.message }, null, 2)); }
  - try { await FeedbackManager.sound.play('game_complete_1_star'); } catch(e) { console.error('1star audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- Else (stars === 0):
  - try { await FeedbackManager.sound.play('game_over_sound_effect', { sticker: { image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757430772002-95.gif', duration: 3, type: 'IMAGE_GIF' } }); } catch(e) { console.error('game_over_sfx error:', JSON.stringify({ error: e.message }, null, 2)); }
  - try { await FeedbackManager.sound.play('game_over'); } catch(e) { console.error('game_over audio error:', JSON.stringify({ error: e.message }, null, 2)); }
- Guarded cleanup:
  ```javascript
  if (gameState.gameEnded) {
    if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
    try { FeedbackManager._stopCurrentDynamic(); } catch(e) {}
    if (progressBar) { progressBar.destroy(); progressBar = null; }
  }
  ```

**showResults(metrics)**
- Builds HTML string and passes to `transitionScreen.show({ content: metricsHTML, ... })`:
  ```javascript
  function showResults(metrics) {
    var starsHTML = '';
    for (var i = 0; i < 3; i++) { starsHTML += i < metrics.stars ? '⭐' : '☆'; }

    var buttonText = metrics.stars >= 3 ? 'Play Again' : 'Retry for more stars';

    var metricsHTML = '<div style="text-align:center;padding:16px;">'
      + '<div style="font-size:40px;margin-bottom:16px;display:flex;justify-content:center;gap:8px;">' + starsHTML + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">'
      + '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--mathai-light-gray);"><span style="color:var(--mathai-gray);font-size:14px;">Score</span><span style="font-weight:700;font-size:16px;">' + metrics.accuracy + '%</span></div>'
      + '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--mathai-light-gray);"><span style="color:var(--mathai-gray);font-size:14px;">Time</span><span style="font-weight:700;font-size:16px;">' + formatTime(metrics.time) + '</span></div>'
      + '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--mathai-light-gray);"><span style="color:var(--mathai-gray);font-size:14px;">Correct</span><span style="font-weight:700;font-size:16px;">' + metrics.correctAnswers + '/' + metrics.totalRounds + '</span></div>'
      + '</div></div>';

    transitionScreen.show({
      title: metrics.stars >= 3 ? 'Excellent!' : (metrics.stars >= 1 ? 'Good Try!' : 'Keep Practicing!'),
      content: metricsHTML,
      persist: true,
      buttons: [{ text: buttonText, type: metrics.stars >= 3 ? 'primary' : 'secondary', action: function() { FeedbackManager._stopCurrentDynamic(); restartGame(); } }]
    });
  }
  ```

**restartGame()**
- Push session snapshot BEFORE resetting:
  ```javascript
  if (!gameState.sessionHistory) gameState.sessionHistory = [];
  gameState.sessionHistory.push({
    correctAnswers: gameState.correctAnswers,
    totalRounds: gameState.totalRounds,
    tries: computeTriesPerRound(gameState.attempts)
  });
  ```
- Preserve across restart: `var preserved = { content: gameState.content, contentSetId: gameState.contentSetId, signalConfig: gameState.signalConfig, sessionHistory: gameState.sessionHistory, voGameStartPlayed: gameState.voGameStartPlayed };`
- Reset gameState fields: currentRound=0, score=0, attempts=[], events=[], isActive=false, isProcessing=false, gameEnded=false, userAnswer='', isEvaluating=false, correctAnswers=0, roundResults=[], currentDynamicAudio=null
- Restore preserved: `gameState.content = preserved.content; gameState.contentSetId = preserved.contentSetId; gameState.signalConfig = preserved.signalConfig; gameState.sessionHistory = preserved.sessionHistory; gameState.voGameStartPlayed = preserved.voGameStartPlayed;`
- Reset duration_data (fresh startTime, empty arrays, totalInactiveTime=0)
- Recreate SignalCollector:
  ```javascript
  signalCollector = new SignalCollector({
    sessionId: (window.gameVariableState && window.gameVariableState.sessionId) ? window.gameVariableState.sessionId : 'session_' + Date.now(),
    studentId: (window.gameVariableState && window.gameVariableState.studentId) ? window.gameVariableState.studentId : null,
    gameId: gameState.gameId,
    contentSetId: gameState.contentSetId
  });
  window.signalCollector = signalCollector;
  if (gameState.signalConfig.flushUrl) {
    signalCollector.flushUrl = gameState.signalConfig.flushUrl;
    signalCollector.playId = gameState.signalConfig.playId || null;
    signalCollector.sessionId = gameState.signalConfig.sessionId || signalCollector.sessionId;
    signalCollector.studentId = gameState.signalConfig.studentId || signalCollector.studentId;
    signalCollector.startFlushing();
  }
  ```
- Recreate VisibilityTracker with saved config: `visibilityTracker = new VisibilityTracker(visibilityTrackerConfig);`
- Recreate ProgressBar using `createProgressBar()`
- progressBar.update(0, 0)
- Restore question text to initial state
- Re-enable textarea, restore submit button onclick to handleSubmit
- trackEvent('game_start', 'game')
- Show start screen:
  ```javascript
  transitionScreen.show({
    icons: ['✍️'],
    iconSize: 'large',
    title: 'Subjective',
    subtitle: 'Answer questions in your own words. Be as detailed as you can!',
    persist: true,
    buttons: [{ text: "Let's Go!", type: 'primary', action: function() { FeedbackManager._stopCurrentDynamic(); startGame(); } }]
  });
  ```

**computeTriesPerRound(attempts)**
  ```javascript
  function computeTriesPerRound(attempts) {
    var rounds = {};
    attempts.forEach(function(a) {
      var r = a.metadata && a.metadata.round ? a.metadata.round : 0;
      rounds[r] = (rounds[r] || 0) + 1;
    });
    return Object.keys(rounds).map(function(r) {
      return { round: Number(r), triesCount: rounds[r] };
    });
  }
  ```

**createProgressBar()**
  ```javascript
  function createProgressBar() {
    if (progressBar) { progressBar.destroy(); progressBar = null; }
    progressBar = new ProgressBarComponent({
      autoInject: true,
      totalRounds: gameState.totalRounds,
      totalLives: 0,
      slotId: 'mathai-progress-slot'
    });
  }
  ```

**formatTime(seconds)**
  ```javascript
  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }
  ```

**handlePostMessage(event)**
- From PART-008 + PART-010 v3:
- if (!event.data || event.data.type !== 'game_init') return
- var d = event.data.data
- gameState.content = d.content
- if (d.gameId) gameState.gameId = d.gameId
- gameState.contentSetId = d.contentSetId || null
- gameState.signalConfig = d.signalConfig || {}
- Configure SignalCollector with harness-provided metadata:
  ```javascript
  if (signalCollector && gameState.signalConfig.flushUrl) {
    signalCollector.flushUrl = gameState.signalConfig.flushUrl;
    signalCollector.playId = gameState.signalConfig.playId || null;
    signalCollector.sessionId = gameState.signalConfig.sessionId || signalCollector.sessionId;
    signalCollector.studentId = gameState.signalConfig.studentId || signalCollector.studentId;
    signalCollector.startFlushing();
  }
  ```
- Call setupGame()

**recordAttempt(data)**
- From PART-009 (exact code):
  ```javascript
  function recordAttempt(data) {
    var attempt = {
      attempt_timestamp: new Date().toISOString(),
      time_since_start_of_game: gameState.startTime ? Date.now() - gameState.startTime : 0,
      input_of_user: data.userAnswer,
      attempt_number: gameState.attempts.length + 1,
      correct: data.correct,
      metadata: {
        round: data.metadata && data.metadata.round ? data.metadata.round : gameState.currentRound,
        question: data.question,
        correctAnswer: data.correctAnswer,
        validationType: data.validationType || 'llm',
        evaluation: data.metadata && data.metadata.evaluation ? data.metadata.evaluation : null,
        feedback: data.metadata && data.metadata.feedback ? data.metadata.feedback : null
      }
    };
    gameState.attempts.push(attempt);
    gameState.duration_data.attempts.push({
      timestamp: attempt.attempt_timestamp,
      correct: attempt.correct,
      round: attempt.metadata.round
    });
    console.log('Attempt recorded:', JSON.stringify(attempt, null, 2));
  }
  ```

**trackEvent(type, target, data)**
- From PART-010 (exact code):
  ```javascript
  function trackEvent(type, target, data) {
    var event = {
      type: type,
      target: target,
      timestamp: new Date().toISOString(),
      data: data || {}
    };
    gameState.events.push(event);
    console.log('Event:', JSON.stringify(event, null, 2));
  }
  ```

### Sentry Initialization (PART-030)

```javascript
function initSentry() {
  if (typeof Sentry === 'undefined' || typeof SentryConfig === 'undefined') return;
  if (!SentryConfig.enabled) return;
  Sentry.init({
    dsn: SentryConfig.dsn,
    environment: SentryConfig.environment,
    release: 'subjective@1.0.0',
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

window.addEventListener('error', function(event) {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.error || new Error(event.message), {
      tags: { errorType: 'unhandled', severity: 'critical' },
      contexts: { errorEvent: { message: event.message, filename: event.filename, lineno: event.lineno } }
    });
  }
});

window.addEventListener('unhandledrejection', function(event) {
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.reason || new Error('Unhandled promise rejection'), {
      tags: { errorType: 'unhandled-promise', severity: 'critical' }
    });
  }
});
```

### Package Script Order (PART-002 + PART-030)

```html
<!-- 1. Sentry Config + SDK FIRST (PART-030) -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- 2. Game Packages (PART-002) — FeedbackManager → Components → Helpers in this order -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

> **IMPORTANT:** Helpers package MUST load THIRD. It includes `MathAIHelpers.SubjectiveEvaluation` which is the ONLY way to call subjective evaluation. Never use a standalone subjective-evaluation script.

### waitForPackages (PART-003) — defined inline BEFORE DOMContentLoaded

```javascript
async function waitForPackages() {
  var timeout = 10000;
  var interval = 50;
  var elapsed = 0;
  while (
    typeof ScreenLayout === 'undefined' ||
    typeof ProgressBarComponent === 'undefined' ||
    typeof TransitionScreenComponent === 'undefined' ||
    typeof TimerComponent === 'undefined' ||
    typeof FeedbackManager === 'undefined' ||
    typeof VisibilityTracker === 'undefined' ||
    typeof SignalCollector === 'undefined' ||
    typeof MathAIHelpers === 'undefined'
  ) {
    if (elapsed >= timeout) throw new Error('Packages failed to load within 10s');
    await new Promise(function(resolve) { setTimeout(resolve, interval); });
    elapsed += interval;
  }
  console.log('[subjective] All packages loaded');
}
```

### Inside DOMContentLoaded (PART-004)

```javascript
var questionSlotId = null;

window.addEventListener('DOMContentLoaded', async function() {
  try {
    await waitForPackages();
    if (typeof Sentry !== 'undefined') {
      Sentry.addBreadcrumb({ category: 'package-loading', message: 'All packages loaded', level: 'info' });
    }
    await FeedbackManager.init();

    // Preload all sound effects (PART-017)
    try {
      await FeedbackManager.sound.preload([
        // Gameplay feedback SFX
        { id: 'correct_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757588479110.mp3' },
        { id: 'incorrect_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3' },
        // Victory (3 stars)
        { id: 'victory_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506672258.mp3' },
        { id: 'victory', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/e252bcc4-bd5f-4195-ad04-a02582095b6d.mp3' },
        // Game complete (1-2 stars)
        { id: 'game_complete_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506659491.mp3' },
        { id: 'game_complete_1_star', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/2ee85ea3-919b-4010-95a2-40bcd7d90d22.mp3' },
        { id: 'game_complete_2_star', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/84f4ff34-6e59-43d6-9663-4d9936cad002.mp3' },
        // Game over (0 stars)
        { id: 'game_over_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506638331.mp3' },
        { id: 'game_over', url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/5140e0b6-cada-4424-8e5d-f9cd06a0c83f.mp3' }
      ]);
    } catch(e) { console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2)); }

    // SignalCollector (PART-010 v3)
    signalCollector = new SignalCollector({
      sessionId: (window.gameVariableState && window.gameVariableState.sessionId) ? window.gameVariableState.sessionId : 'session_' + Date.now(),
      studentId: (window.gameVariableState && window.gameVariableState.studentId) ? window.gameVariableState.studentId : null,
      gameId: gameState.gameId,
      contentSetId: gameState.contentSetId
    });
    window.signalCollector = signalCollector;

    // EventCapture (PART-036)
    try { if (typeof EventCapture !== 'undefined') EventCapture.init(); } catch (e) { console.error('EventCapture init error:', JSON.stringify({ error: e.message }, null, 2)); }

    // ScreenLayout (PART-025)
    var layout = ScreenLayout.inject('app', {
      sections: { header: true, questionText: true, progressBar: true, playArea: true, transitionScreen: true }
    });

    // Store questionText slot ID for dynamic updates
    questionSlotId = layout.questionText;

    // Build initial question text into questionText slot (stays visible on ALL screens)
    var questionSlot = document.getElementById(questionSlotId);
    if (questionSlot) {
      questionSlot.innerHTML = '<div class="question-text-container">'
        + '<p class="instruction-text"><strong>Subjective</strong></p>'
        + '<p class="instruction-text-sub">Answer questions in your own words.</p>'
        + '</div>';
    }

    // Build game content into #gameContent (play area only — no title/instructions here)
    var gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = '<div id="game-screen" class="game-block">'
      + '<div class="answer-area" id="answer-area" data-signal-id="answer-area">'
      + '<textarea id="answer-input" data-signal-id="answer-input" class="game-textarea" rows="4" placeholder="Type your answer here..."></textarea>'
      + '</div>'
      + '<div id="loading-indicator" class="loading-indicator" style="display: none;">'
      + '<div class="spinner"></div>'
      + '<span id="loading-text">Evaluating your answer...</span>'
      + '</div>'
      + '<div id="feedback-display" class="feedback-display" style="display: none;">'
      + '<div id="feedback-result" class="feedback-result"></div>'
      + '</div>'
      + '<div class="btn-container">'
      + '<button class="game-btn btn-secondary" data-signal-id="btn-reset" onclick="handleReset()">Reset</button>'
      + '<button class="game-btn btn-primary" id="btn-submit" data-signal-id="btn-submit" onclick="handleSubmit()">'
      + '<span class="btn-spinner" id="btn-spinner"></span>'
      + '<span id="btn-text">Submit</span>'
      + '</button>'
      + '</div>'
      + '</div>';

    // InteractionManager (PART-038)
    window.interactionManager = new InteractionManager({
      selector: '.answer-area',
      disableOnAudioFeedback: false,
      disableOnEvaluation: true
    });

    // ProgressBar (PART-023)
    createProgressBar();

    // TransitionScreen (PART-024)
    transitionScreen = new TransitionScreenComponent({
      autoInject: true
    });

    // VisibilityTracker (PART-005)
    visibilityTrackerConfig = {
      onInactive: function() {
        var inactiveStart = Date.now();
        gameState.duration_data.inActiveTime.push({ start: inactiveStart });
        if (signalCollector) {
          signalCollector.pause();
          signalCollector.recordCustomEvent('visibility_hidden', {});
        }
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
        if (signalCollector) {
          signalCollector.resume();
          signalCollector.recordCustomEvent('visibility_visible', {});
        }
        FeedbackManager.sound.resume();
        FeedbackManager.stream.resumeAll();
        trackEvent('game_resumed', 'system');
      },
      popupProps: {
        title: 'Game Paused',
        description: 'Click Resume to continue.',
        primaryText: 'Resume'
      }
    };
    visibilityTracker = new VisibilityTracker(visibilityTrackerConfig);

    // Register postMessage listener BEFORE game_ready (prevents race condition)
    window.addEventListener('message', handlePostMessage);

    // Signal to parent harness that game is ready to receive content (PART-008)
    window.parent.postMessage({ type: 'game_ready' }, '*');

    // Poll canPlayAudio before first audio (game starts directly from transition screen with audio)
    await new Promise(function(resolve) {
      if (FeedbackManager.canPlayAudio()) return resolve();
      var check = setInterval(function() {
        if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
      }, 200);
      setTimeout(function() { clearInterval(check); resolve(); }, 15000);
    });

    // Show start screen with welcome audio
    transitionScreen.show({
      icons: ['✍️'],
      iconSize: 'large',
      title: 'Subjective',
      subtitle: 'Answer questions in your own words. Be as detailed as you can!',
      persist: true,
      buttons: [{ text: "Let's Go!", type: 'primary', action: function() { FeedbackManager._stopCurrentDynamic(); startGame(); } }]
    });

    // Play welcome VO (only once)
    if (!gameState.voGameStartPlayed) {
      gameState.voGameStartPlayed = true;
      try {
        gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
          audio_content: 'Welcome to Subjective! Answer questions in your own words. Be as detailed as you can!',
          subtitle: 'Welcome! Answer in your own words.',
          sticker: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1743761988949-44.gif'
        });
        await gameState.currentDynamicAudio;
      } catch(e) { console.error('Welcome VO error:', JSON.stringify({ error: e.message }, null, 2)); }
      gameState.currentDynamicAudio = null;
    }

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
    await FeedbackManager.sound.play(id || 'correct_sound_effect');
  } catch (e) {
    console.error('Audio test failed:', JSON.stringify({ error: e.message }, null, 2));
  }
};

window.testPause = function() {
  if (visibilityTracker) visibilityTracker.triggerInactive();
};

window.testResume = function() {
  if (visibilityTracker) visibilityTracker.triggerResume();
};

window.debugSignals = function() {
  if (signalCollector) {
    console.log('SignalCollector State:', JSON.stringify({
      inputEvents: signalCollector.inputEvents,
      currentView: signalCollector.currentView,
      sealed: signalCollector.sealed
    }, null, 2));
  }
};

window.debugEventCapture = function() {
  try {
    if (typeof EventCapture !== 'undefined') {
      var summary = EventCapture.getSummary();
      console.log('EventCapture Debug:', JSON.stringify(summary, null, 2));
      console.log('All Events:', JSON.stringify(EventCapture.getEvents(), null, 2));
      return summary;
    }
    console.log('EventCapture not available');
  } catch(e) { console.error('EventCapture debug error:', JSON.stringify({ error: e.message }, null, 2)); }
};

window.verifySentry = function() {
  var checks = {
    sdkLoaded: typeof Sentry !== 'undefined',
    configLoaded: typeof SentryConfig !== 'undefined',
    clientActive: typeof Sentry !== 'undefined' && !!Sentry.getClient()
  };
  console.log('Sentry Verification:', JSON.stringify(checks, null, 2));
  return checks;
};

window.testSentry = function() {
  try {
    throw new Error('Test error from testSentry()');
  } catch (error) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, { tags: { test: true } });
      console.log('Test error sent to Sentry');
    } else {
      console.warn('Sentry not available');
    }
  }
};

window.loadRound = function(n) {
  if (n < 1 || n > gameState.totalRounds) {
    console.error('Round must be between 1 and ' + gameState.totalRounds);
    return;
  }
  gameState.currentRound = n - 1;
  gameState.isActive = true;
  gameState.isProcessing = false;
  gameState.gameEnded = false;
  startRound();
  console.log('Jumped to round ' + n);
};
```

---

## 9. Event Schema

### Game Lifecycle Events (from PART-010)

| Event | Target | When Fired |
|-------|--------|------------|
| game_start | game | setupGame() completes |
| game_end | game | endGame() fires |
| game_paused | system | VisibilityTracker fires onInactive |
| game_resumed | system | VisibilityTracker fires onResume |

### Game-Specific Events

| Event | Target | When Fired | Data |
|-------|--------|------------|------|
| answer_submitted | game | User clicks Submit with non-empty answer | { round, answerLength } |
| evaluation_complete | game | LLM evaluation returns | { round, correct } |
| round_complete | game | Round transitions to next | { round, correct, feedback } |
| answer_reset | game | User clicks Reset | { round } |

### SignalCollector Events (from PART-010 v3)

> **Note:** SignalCollector v3 does NOT use `startProblem()`/`endProblem()` lifecycle methods. All tracking is done via `recordViewEvent()` and `recordCustomEvent()`. Signal data streams to GCS via batch flushing (`startFlushing()`).

**recordViewEvent types:**

| viewType | When Emitted | Key Data |
|----------|-------------|----------|
| `screen_transition` | setupGame() shows gameplay; endGame() shows results (recorded BEFORE seal) | `screen`, `metadata.transition_from` |
| `content_render` | startRound() renders the question | `content_snapshot.type: 'round_started'`, `round`, `question`, `trigger: 'round_start'` |
| `feedback_display` | After LLM evaluation returns | `feedback_type`, `message`, `audio_id: 'dynamic'` |
| `overlay_toggle` | TransitionScreen shows/hides | `overlay`, `visible`, `title` |

---

## 10. Audio Sequence Table

| Trigger | Sound ID / Method | Await? | Sticker | Notes |
|---------|-------------------|--------|---------|-------|
| Welcome screen | `playDynamicFeedback()` | Yes | `rc-upload-1743761988949-44.gif` (string) | Only once via `voGameStartPlayed` guard |
| Correct answer SFX | `sound.play('correct_sound_effect')` | No (fire-and-forget) | `{ image: rc-upload-1754587201419-20.gif, duration: 2, type: 'IMAGE_GIF' }` | Object sticker format for sound.play |
| Incorrect answer SFX | `sound.play('incorrect_sound_effect')` | No (fire-and-forget) | `{ image: rc-upload-1754587201419-28.gif, duration: 2, type: 'IMAGE_GIF' }` | Object sticker format for sound.play |
| Feedback voice | `playDynamicFeedback()` | Yes | URL string (correct or incorrect GIF) | String sticker format for playDynamicFeedback |
| Victory (3 stars) SFX | `sound.play('victory_sound_effect')` | Yes | `{ image: rc-upload-1757430772002-98.gif, duration: 3, type: 'IMAGE_GIF' }` | Object sticker |
| Victory voice | `sound.play('victory')` | Yes | — | No sticker |
| Complete (1-2 stars) SFX | `sound.play('game_complete_sound_effect')` | Yes | `{ image: rc-upload-1754587201419-25.gif, duration: 3, type: 'IMAGE_GIF' }` | Object sticker |
| Complete 2-star voice | `sound.play('game_complete_2_star')` | Yes | — | No sticker |
| Complete 1-star voice | `sound.play('game_complete_1_star')` | Yes | — | No sticker |
| Game over (0 stars) SFX | `sound.play('game_over_sound_effect')` | Yes | `{ image: rc-upload-1757430772002-95.gif, duration: 3, type: 'IMAGE_GIF' }` | Object sticker |
| Game over voice | `sound.play('game_over')` | Yes | — | No sticker |

> **IMPORTANT:** `sound.play()` expects sticker as OBJECT `{ sticker: { image: URL, type: 'IMAGE_GIF' } }`. `playDynamicFeedback()` expects sticker as plain URL STRING `{ sticker: URL_STRING }`. **Never mix formats.**

---

## 11. Test Scenarios

### T1: Full Game Flow (All Correct)
1. Open game → start screen visible with title "Subjective" and "Let's Go!" button
2. Wait for welcome VO audio to play (or time out)
3. Click "Let's Go!" → round 1 question appears in questionText slot
4. Verify question text contains bold terms
5. Type a correct answer in textarea → click Submit
6. Verify "Evaluating..." appears, button disabled
7. Wait for evaluation → verify feedback appears with green "correct" styling
8. Verify dynamic audio plays with subtitle
9. Verify button changes to "Next"
10. Click "Next" → round 2 question appears
11. Repeat for rounds 2 and 3
12. After round 3, click "See Results" → results screen shows 3 stars, 100% score
13. Verify "Play Again" button text (max stars)

### T2: Mixed Results
1. Complete round 1 correctly, round 2 incorrectly, round 3 correctly
2. Verify results: 2 stars, 67% accuracy, 2/3 correct
3. Verify "Retry for more stars" button text

### T3: Empty Submit
1. Click Submit with empty textarea → verify "Please type your answer first" feedback
2. Verify button stays enabled, no evaluation call

### T4: Reset Button
1. Type some text → click Reset → verify textarea cleared
2. Verify feedback hidden if it was showing

### T5: Evaluation Error
1. Simulate network error → verify error message shown
2. Verify button re-enabled with "Submit" text
3. User can retry submission

### T6: Restart
1. Complete all 3 rounds → click "Play Again"
2. Verify fresh start: round 1, empty textarea, score 0
3. Verify questionText slot shows round 1 question

### T7: Visibility
1. During gameplay, switch tabs → verify pause popup on return
2. Verify audio paused/resumed correctly
3. Verify SignalCollector paused/resumed

---

## 12. Scaffold Points (Optional Extensions)

- **Hint system:** After incorrect answer, show a hint from rubric before allowing retry
- **Difficulty adjustment:** Harder rubrics or stricter evaluation for higher rounds
- **Image questions:** Support for question images alongside text
- **Voice input:** Integrate speech-to-text for answer input (microphone button in toolbar)
- **Retry within round:** Allow one retry per round with a "Try Again" button before advancing

---

## 13. Production Readiness Checklist

- [x] `<!DOCTYPE html>` declaration
- [x] `<meta charset="UTF-8">` and viewport meta
- [x] Single `<style>` block — all CSS inline
- [x] Single `<script>` block — all JS inline
- [x] Body contains only `<div id="app"></div>` — no manual layout divs
- [x] No `#results-screen` div — uses TransitionScreen `content` slot
- [x] Script loading order: SentryConfig → Sentry SDK → FeedbackManager → Components → Helpers
- [x] `initSentry()` defined before SDK, called via `window.addEventListener('load', ...)`
- [x] Sentry release: `'subjective@1.0.0'`
- [x] `waitForPackages()` checks all required packages including MathAIHelpers
- [x] `FeedbackManager.init()` is awaited — no `unlock()` call after it
- [x] `canPlayAudio()` polling with `setInterval(200ms)` + `setTimeout(15000ms)` fallback
- [x] PostMessage listener registered BEFORE `game_ready` sent
- [x] ScreenLayout v2 `sections` API (NOT `slots`)
- [x] All 5 sections enabled: header, questionText, progressBar, playArea, transitionScreen
- [x] Question text in `layout.questionText` slot — stays visible on ALL screens
- [x] Question text updated dynamically per round via `updateQuestionText()`
- [x] Play area HTML in `#gameContent` only — no title/instructions here
- [x] CSS: `100dvh` not `100vh`
- [x] CSS: playarea `display` has NO `!important`
- [x] CSS: All colors use `var(--mathai-*)` variables with fallbacks
- [x] CSS: `.mathai-ts-screen.active` and `.mathai-ts-card` overrides
- [x] No timer declared — game doesn't use TimerComponent
- [x] `isProcessing` guard at top of handleSubmit
- [x] `isActive` guard at top of handleSubmit
- [x] `gameEnded` guard in endGame
- [x] `voGameStartPlayed` flag — welcome VO plays only once
- [x] All `sound.play()` use object sticker format: `{ sticker: { image, duration, type } }`
- [x] All `playDynamicFeedback()` use string sticker format: `{ sticker: URL }`
- [x] `FeedbackManager._stopCurrentDynamic()` called in every button action and transition
- [x] `gameState.currentDynamicAudio` reference stored and nulled after cleanup
- [x] `persist: true` on ALL transition screens
- [x] End screen: TransitionScreen shows BEFORE audio plays
- [x] `postMessage` sent BEFORE audio plays
- [x] `recordViewEvent()` called BEFORE `seal()` — seal freezes collector
- [x] Guarded cleanup: `if (gameState.gameEnded)` before destroying components
- [x] `createProgressBar()` helper with destroy-before-recreate pattern
- [x] `visibilityTrackerConfig` saved for reuse in restartGame
- [x] `restartGame()` preserves: content, contentSetId, signalConfig, sessionHistory, voGameStartPlayed
- [x] `restartGame()` recreates: signalCollector, visibilityTracker, progressBar
- [x] No optional chaining (`?.`) — uses explicit `&&` checks
- [x] All `console.log`/`console.error` use `JSON.stringify()` — never raw objects
- [x] Every async function has try/catch
- [x] EventCapture wrapped: `try { if (typeof EventCapture !== 'undefined') ... } catch (e) {}`
- [x] `MathAIHelpers.SubjectiveEvaluation.evaluate()` — correct namespace (NOT standalone)
- [x] Submit button has loading states: idle → evaluating → playing feedback → next/complete
- [x] Button re-enabled on ALL exit paths (success and error)
- [x] Textarea disabled after submission (prevents editing during feedback)
- [x] Stars based on correctAnswers: 3→3⭐, 2→2⭐, 1→1⭐, 0→0⭐
- [x] Conditional button text: "Play Again" at max stars, "Retry for more stars" otherwise
- [x] All preloaded sound IDs have corresponding `sound.play()` calls
- [x] `totalRounds` synced from `content.rounds.length` — never hardcoded after content loads
- [x] Debug functions: debugGame, debugAudio, testAudio, testPause, testResume, debugSignals, debugEventCapture, verifySentry, testSentry, loadRound
- [x] `formatTime()` helper for MM:SS display
- [x] `computeTriesPerRound()` for analytics
