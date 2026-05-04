# Measure Selector — Game-Specific Template (Assembly Book)

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

> **CRITICAL — PART-017 is NO (Feedback Integration NOT included).** Do NOT call `FeedbackManager.init()` in this game. Calling it triggers an audio permission popup that causes non-deterministic test failures in Playwright. The game uses `FeedbackManager.sound` and `FeedbackManager.playDynamicFeedback` directly (which do not require init). Omit `FeedbackManager.init()` entirely.

> **CRITICAL — window.gameState MUST be set.** `window.gameState = gameState` must appear at the bottom of the gameState declaration block (module scope, NOT inside DOMContentLoaded). The test harness reads `window.gameState` to sync `data-phase` / `data-lives` / `data-score`. If omitted, `waitForPhase()` will always timeout.

> **CRITICAL — window.endGame, window.restartGame, window.nextRound MUST be set.** These must be assigned in DOMContentLoaded after the functions are defined: `window.endGame = endGame; window.restartGame = restartGame; window.nextRound = nextRound`. Tests call these directly.

> **CRITICAL — TimerComponent destroy/recreate on restart.** `restartGame()` MUST call `timer.destroy()` then `timer = new TimerComponent(...)` before calling `startGame()`. Reusing the old timer after destroy causes a no-op and the timer never starts.

> **CRITICAL — gameId MUST be the FIRST field in the gameState object literal.** The pipeline validator checks that `gameState.gameId` is set and matches the game directory name. Any other field before gameId causes the contract check to fail.

> **CRITICAL — waitForPackages maxWait MUST be 180000.** Never use 10000. The CDN bundle can take up to 3 minutes to load on cold start. A 10s timeout causes false CDN-load failures on every first build.

> **CRITICAL — results screen MUST be position:fixed overlay.** `#results-screen` must have `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` in its CSS. If not position:fixed, Playwright cannot detect it (it renders behind the game area).

> **CRITICAL — endGame() guard MUST use gameState.gameEnded ONLY.** Never guard with `!isActive`. The `isActive` flag causes premature endGame() blocking on the results path. Only `if (gameState.gameEnded) return;` is correct.

> **CRITICAL — progressBar.update() MUST wrap lives in Math.max(0, lives).** `progressBar.update(gameState.currentRound, Math.max(0, gameState.lives))` — prevents negative lives crashing the progress bar component.

> **PEDAGOGICAL DESIGN NOTE.** This game implements Bloom's Level 4 (Analyze) for the skill `stats-which-measure`: given a real-world data scenario, the learner must analyze the data's characteristics and decide which measure of central tendency (Mean, Median, or Mode) is most appropriate — and the distractor options include brief justifications so the learner must evaluate competing reasoning, not just recall a label. This is NOT a computation game. No numbers are calculated. The learner must reason about data type (categorical vs numerical) and distribution shape (symmetric vs skewed/outlier-containing) to select the correct tool. 6 rounds, 3 lives, 60-second timer per round (L4 reasoning needs more time than L1–L3 computation). Stars based on correct answers out of 6. Session position: Game 5 of 5 in the Statistics session, the L4 Analyze cap. Bloom L4 rationale: learner must decompose the data scenario into its properties (data type, distribution symmetry, outlier presence) and map those properties to the correct statistical tool — a multi-step analysis act, not recall or application. Interaction type: `measure-selection-mcq`.
>
> **RESEARCH SOURCES (Exa, 2026-03-23):**
> - Source A: NCERT Class 11 Statistics Chapter 5 "Measures of Central Tendency" — https://ncert.nic.in/textbook/pdf/kest105.pdf. NCERT explicitly states: "The median is the preferred measure when the data has extreme values or outliers, as it remains unaffected by them." The NCERT farmer example (land ownership in Balapur) demonstrates all three measures for the same dataset, illustrating that mean, median, and mode answer different questions about the same data. Grounds the outlier-skew → Median rounds.
> - Source B: Australian Bureau of Statistics "Measures of Central Tendency" — https://www.abs.gov.au/statistics/understanding-statistics/statistical-terms-and-concepts/measures-central-tendency. "The median is usually the preferred measure of central tendency when the distribution is not symmetrical." Also: "When a distribution is symmetrical, the mean, median and mode are all equal" — symmetric data is the canonical case for mean. Grounds R3 (test scores → Mean) and R4 (house prices → Median).
> - Source C: Laerd Statistics "Mean, Mode and Median — Measures of Central Tendency" — https://statistics.laerd.com/statistical-guides/measures-central-tendency-mean-mode-median.php. Summary: Nominal/categorical data → Mode; Ordinal → Median; Interval/Ratio (symmetric) → Mean. "The mode can provide valuable insights, especially in categorical data where mean and median may not apply." Grounds R2 (shoe sizes → Mode) and R5 (favourite colours → Mode).
> - Source D: Penn State STAT 200 "Skewness & Central Tendency" — https://online.stat.psu.edu/stat200/lesson/2/2.2/2.2.4/2.2.4.1. "For distributions that have outliers or are skewed, the median is often the preferred measure of central tendency." Grounds R1 (salaries → Median), R4 (house prices → Median), R6 (daily rainfall → Median).
> - Source E: Pubadmin Institute "How to Choose the Right Measure of Central Tendency" — https://pubadmin.institute/research-methodologies/choose-right-measure-central-tendency. Real estate price example and income salary example both demonstrate that "billionaires/luxury properties pull the mean far above what typical earners/buyers experience — median is the right measure." Grounds R1 and R4 scenarios directly.

---

## 1. Game Identity

| Field | Value |
|---|---|
| **Title** | Measure Selector |
| **Game ID** | `stats-which-measure` |
| **Type** | standard |
| **Session** | Statistics Session 2 — Game 5 of 5 |
| **Bloom Level** | L4 Analyze |
| **Description** | Students analyze a real-world data scenario and choose the most appropriate measure of central tendency. Each question presents 3 options (Mean / Median / Mode) each with a brief justification — learner must evaluate competing reasoning, not just recall a label. 6 rounds, 3 lives, 60-second timer per round. Stars based on correct answers out of 6. Session predecessor: stats-mode (L3 — compute mode). Session cap: the L4 Analyze game that concludes the 5-game statistics session. Targets NCERT Class 10 Ch 14 §14.4 (relationship between Mean, Median and Mode — appropriate use by context). |

---

## 2. Parts Selected

| Part ID  | Name                          | Included        | Config/Notes                                                                                                                     |
| -------- | ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PART-001 | HTML Shell                    | YES             | —                                                                                                                                |
| PART-002 | Package Scripts               | YES             | —                                                                                                                                |
| PART-003 | waitForPackages               | YES             | required = ['ScreenLayout', 'TransitionScreenComponent', 'ProgressBarComponent', 'TimerComponent', 'FeedbackManager']. **maxWait = 180000** (NOT 10000) |
| PART-004 | Initialization Block          | YES             | —                                                                                                                                |
| PART-005 | VisibilityTracker             | YES             | popupProps: default                                                                                                               |
| PART-006 | TimerComponent                | YES             | 60s countdown per round; loses a life on timeout. Destroyed and recreated on restartGame().                                      |
| PART-007 | Game State Object             | YES             | Custom fields: isProcessing, gameEnded                                                                                           |
| PART-008 | PostMessage Protocol          | YES             | game_complete on BOTH victory and game_over paths                                                                                |
| PART-009 | Attempt Tracking              | YES             | —                                                                                                                                |
| PART-010 | Event Tracking                | YES             | Events: answer_correct, answer_wrong, timeout, round_complete                                                                    |
| PART-011 | End Game & Metrics            | YES             | Star logic: 6/6 = 3★; 4–5/6 = 2★; 2–3/6 = 1★; 0–1/6 = 0★. Game-over on 0 lives.                                              |
| PART-012 | Debug Functions               | YES             | —                                                                                                                                |
| PART-013 | Validation Fixed              | YES             | String equality: selectedMeasure === round.correctMeasure                                                                        |
| PART-014 | Validation Function           | NO              | —                                                                                                                                |
| PART-015 | Validation LLM                | NO              | —                                                                                                                                |
| PART-016 | StoriesComponent              | NO              | —                                                                                                                                |
| PART-017 | Feedback Integration          | NO              | Not included — FeedbackManager.init() triggers audio permission popup. Use .sound() and .playDynamicFeedback() only.             |
| PART-018 | Case Converter                | NO              | —                                                                                                                                |
| PART-019 | Results Screen UI             | YES             | Metrics: correct answers, accuracy %, stars earned, rounds completed. MUST be position:fixed overlay.                           |
| PART-020 | CSS Variables & Colors        | YES             | —                                                                                                                                |
| PART-021 | Screen Layout CSS             | YES             | —                                                                                                                                |
| PART-022 | Game Buttons                  | YES             | —                                                                                                                                |
| PART-023 | ProgressBar Component         | YES             | `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 6, totalLives: 3 })`                                   |
| PART-024 | TransitionScreen Component    | YES             | Screens: start, victory, game_over. OBJECT FORM ONLY — never string mode.                                                        |
| PART-025 | ScreenLayout Component        | YES             | slots: progressBar=true, transitionScreen=true                                                                                   |
| PART-026 | Anti-Patterns                 | YES (REFERENCE) | Verification checklist in Section 15                                                                                             |
| PART-027 | Play Area Construction        | YES             | Layout: scenario card (styled text box describing the data context) + question text + 3 MCQ option buttons (vertical stack), each button shows the measure name + justification label. All buttons min-height: 44px. |
| PART-028 | InputSchema Patterns          | YES             | Schema type: rounds with scenario, question, options (3 objects: label + justification), correctMeasure, feedbackCorrect, feedbackWrong, misconceptionTag |
| PART-029 | Story-Only Game               | NO              | —                                                                                                                                |
| PART-030 | Sentry Error Tracking         | YES             | —                                                                                                                                |
| PART-031 | API Helper                    | NO              | —                                                                                                                                |
| PART-032 | AnalyticsManager              | NO              | —                                                                                                                                |
| PART-033 | Interaction Patterns          | NO              | —                                                                                                                                |
| PART-034 | Variable Schema Serialization | YES (POST_GEN)  | Serializes Section 4 to inputSchema.json                                                                                         |
| PART-035 | Test Plan Generation          | YES (POST_GEN)  | Generates tests.md after HTML                                                                                                    |
| PART-037 | Playwright Testing            | YES (POST_GEN)  | Ralph loop generates tests + fix cycle                                                                                           |

---

## 3. Game State

```javascript
const gameState = {
  // MANDATORY FIRST FIELD — gameId must be the FIRST key in this object literal:
  gameId: 'stats-which-measure',
  phase: 'start',                // 'start' | 'playing' | 'results' | 'game_over'
  // MANDATORY (from PART-007):
  currentRound: 0,
  totalRounds: 6,
  lives: 3,
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
  isProcessing: false,   // guard against double-submit during feedback delay
  gameEnded: false       // ONLY guard for endGame() — never use !isActive
};

window.gameState = gameState;   // MANDATORY: test harness reads window.gameState

let visibilityTracker = null;
let progressBar = null;
let transitionScreen = null;
let timer = null;
```

**Lives system:** 3 lives. A life is deducted on WRONG ANSWER or TIMEOUT. When `gameState.lives` reaches 0, `endGame(false)` is called immediately (game_over). Victory requires completing all 6 rounds with at least 1 life remaining.

**Phase values (MANDATORY — syncDOMState maps these to data-phase):**
- `'start'` — start screen visible, game not begun
- `'playing'` — active round in progress
- `'results'` — victory screen, all 6 rounds completed
- `'game_over'` — lives exhausted before round 6

---

## 4. Input Schema (External Variables)

```json
{
  "type": "object",
  "properties": {
    "rounds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "scenario": {
            "type": "string",
            "description": "2–4 sentences describing the real-world data context, including the dataset values or distribution. Must include enough detail for learner to identify: (a) whether data is categorical or numerical, (b) whether outliers are present, (c) what question is being asked. Max 70 words."
          },
          "question": {
            "type": "string",
            "description": "Always: 'Which measure of central tendency best represents this data?' or close variant. Max 20 words."
          },
          "options": {
            "type": "array",
            "description": "Exactly 3 option objects. Each has a 'label' (the measure name) and a 'justification' (brief reason — displayed inside the button). Fixed order: index 0 = Mean option, index 1 = Median option, index 2 = Mode option.",
            "minItems": 3,
            "maxItems": 3,
            "items": {
              "type": "object",
              "properties": {
                "label": { "type": "string", "enum": ["Mean", "Median", "Mode"] },
                "justification": { "type": "string", "description": "Brief reasoning shown inside the button. Example: 'it uses all values in the data'. Max 10 words." }
              },
              "required": ["label", "justification"]
            }
          },
          "correctMeasure": {
            "type": "string",
            "enum": ["Mean", "Median", "Mode"],
            "description": "The correct answer. Must match one of the option labels exactly."
          },
          "feedbackCorrect": {
            "type": "string",
            "description": "One sentence shown on correct answer. Names the key characteristic. Max 20 words."
          },
          "feedbackWrong": {
            "type": "string",
            "description": "One sentence shown on wrong answer. Names why the chosen measure is wrong and what is correct. Max 25 words."
          },
          "misconceptionTag": {
            "type": "string",
            "enum": ["MC-outlier-ignore", "MC-categorical-mean", "MC-symmetric-median", "MC-mode-discrete"],
            "description": "Primary misconception targeted. MC-outlier-ignore: learner ignores extreme values distorting mean. MC-categorical-mean: learner tries to average non-numeric categories. MC-symmetric-median: learner picks median even for symmetric data. MC-mode-discrete: learner misses that mode identifies peak demand for discrete/categorical data."
          }
        },
        "required": ["scenario", "question", "options", "correctMeasure", "feedbackCorrect", "feedbackWrong", "misconceptionTag"]
      },
      "minItems": 6,
      "maxItems": 6,
      "description": "Exactly 6 rounds. No shuffle — order is fixed for pedagogical scaffolding (outlier/skew first, then categorical, then symmetric mean, then harder outlier, then pure categorical, then multi-zero outlier)."
    }
  },
  "required": ["rounds"]
}
```

### Fallback Test Content (6 rounds, fixed order)

Field names per schema: `scenario`, `question`, `options` (array of 3 objects with `label` + `justification`), `correctMeasure`, `feedbackCorrect`, `feedbackWrong`, `misconceptionTag`.

```javascript
// FIELD NAMES PER SCHEMA: scenario, question, options (3 objects: label + justification),
// correctMeasure, feedbackCorrect, feedbackWrong, misconceptionTag
const fallbackContent = {
  rounds: [
    // ============================================================
    // ROUND 1 — Salaries with CEO outlier → MEDIAN
    // Misconception: MC-outlier-ignore (learner ignores the CEO salary spike)
    // Source D (Penn State) + Source E (Pubadmin): outlier → median
    // ============================================================
    {
      scenario: 'A small company records monthly salaries: ₹18,000 · ₹20,000 · ₹22,000 · ₹24,000 · ₹1,20,000. The last value is the CEO salary. HR wants to report the "typical" employee salary.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it ignores extreme values' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Median',
      feedbackCorrect: 'Correct! The CEO salary is an extreme outlier — median ignores it and shows the typical pay.',
      feedbackWrong: 'The CEO salary is an extreme outlier. Mean is pulled upward by it; Median is unaffected. Use Median.',
      misconceptionTag: 'MC-outlier-ignore'
    },

    // ============================================================
    // ROUND 2 — Shoe sizes (discrete, peak demand) → MODE
    // Misconception: MC-mode-discrete (learner picks Mean; Mode = most demanded size)
    // Source C (Laerd): discrete/categorical → Mode
    // ============================================================
    {
      scenario: 'A shoe shop records sizes purchased by 8 customers: 38 · 40 · 40 · 41 · 40 · 39 · 42 · 40. The owner wants to know which size to stock the most.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it splits the data at the midpoint' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Mode',
      feedbackCorrect: 'Correct! The owner needs the most-demanded size — that is the Mode (size 40, occurs 4 times).',
      feedbackWrong: 'Mean gives 40.0 — but a fractional size cannot be stocked. Mode (40) identifies peak demand directly.',
      misconceptionTag: 'MC-mode-discrete'
    },

    // ============================================================
    // ROUND 3 — Test scores (symmetric, no outliers) → MEAN
    // Misconception: MC-symmetric-median (learner defaults to median)
    // Source B (ABS): symmetric distribution → mean preferred
    // ============================================================
    {
      scenario: 'A class of 10 students scores: 62 · 67 · 71 · 73 · 75 · 76 · 78 · 80 · 82 · 95. Scores are spread fairly evenly, with no extreme outliers at either end.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it ignores extreme values' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Mean',
      feedbackCorrect: 'Correct! Symmetric distribution, no extreme outliers — mean uses all values for the best summary.',
      feedbackWrong: 'No repeated values (Mode is useless). No extreme outliers (Median offers no advantage). Mean is most informative here.',
      misconceptionTag: 'MC-symmetric-median'
    },

    // ============================================================
    // ROUND 4 — House prices (luxury outlier) → MEDIAN
    // Misconception: MC-outlier-ignore (learner ignores luxury property spike)
    // Source E (Pubadmin): real estate prices — median preferred
    // ============================================================
    {
      scenario: 'House prices in a locality (in lakhs): ₹4.2L · ₹4.5L · ₹4.8L · ₹5.1L · ₹5.3L · ₹18.9L. The last property is a luxury penthouse. A buyer wants to know the typical price.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it ignores extreme values' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Median',
      feedbackCorrect: 'Correct! The luxury penthouse is an extreme outlier — median is unaffected and shows the typical price.',
      feedbackWrong: 'No repeated values (Mode is useless). The ₹18.9L outlier inflates Mean. Median gives the true typical price.',
      misconceptionTag: 'MC-outlier-ignore'
    },

    // ============================================================
    // ROUND 5 — Favourite colours in class (categorical/nominal) → MODE
    // Misconception: MC-categorical-mean (cannot average colours)
    // Source C (Laerd): Nominal data → Mode only
    // ============================================================
    {
      scenario: 'A class votes for their favourite colour: Red = 8 students · Blue = 12 students · Green = 5 students · Yellow = 3 students. The teacher wants to know which colour is most popular.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it finds the middle of ordered data' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Mode',
      feedbackCorrect: 'Correct! Colour names are categories — you cannot average or order them. Mode (Blue) is the only valid measure.',
      feedbackWrong: 'Colour is categorical — you cannot add or rank Red, Blue, Green, Yellow. Only Mode (most frequent) applies.',
      misconceptionTag: 'MC-categorical-mean'
    },

    // ============================================================
    // ROUND 6 — Daily rainfall (many zeros + extreme spike) → MEDIAN
    // Misconception: MC-outlier-ignore (learner picks Mean = 9mm, misleading)
    // Source D (Penn State): skewed data + outlier → median
    // ============================================================
    {
      scenario: 'Rainfall (mm) recorded over 10 days: 0 · 0 · 0 · 2 · 3 · 5 · 8 · 12 · 15 · 45. Most days were dry; one day had an extreme storm. A farmer wants to know the "typical" daily rainfall.',
      question: 'Which measure of central tendency best represents this data?',
      options: [
        { label: 'Mean', justification: 'it uses all values in the data' },
        { label: 'Median', justification: 'it ignores extreme values' },
        { label: 'Mode', justification: 'it identifies the most frequent value' }
      ],
      correctMeasure: 'Median',
      feedbackCorrect: 'Correct! Three zero-rain days + one 45mm storm skew the mean (9mm). Median (4mm) is more representative.',
      feedbackWrong: 'Mean = 9mm implies "usually rainy" — misleading. Mode = 0mm implies "never rains" — wrong. Median (4mm) is most representative.',
      misconceptionTag: 'MC-outlier-ignore'
    }
  ]
};
```

---

## 5. HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Measure Selector</title>
  <!-- PART-002: Package Scripts -->
  <script src="https://unpkg.com/@hw-app/cdn-games@latest/dist/bundle.js"></script>
  <style>
    /* CSS defined in Section 10 */
  </style>
</head>
<body>
  <div id="app">
    <!-- ScreenLayout injects: progress bar slot + transition screen slot + game area -->

    <!-- Game Area (visible during 'playing' phase) -->
    <div id="game-area" class="screen" style="display:none;">

      <!-- Timer slot -->
      <div id="timer-container"></div>

      <!-- Scenario Card -->
      <div id="scenario-card" class="scenario-card">
        <p id="scenario-text" class="scenario-text" data-testid="scenario-text"></p>
      </div>

      <!-- Question -->
      <p id="question-text" class="question-text" data-testid="question-text"></p>

      <!-- 3 MCQ option buttons (vertical stack) -->
      <div id="options-grid" class="options-grid" data-testid="options-grid">
        <!-- Buttons injected dynamically in loadRound() -->
        <!-- Each button: measure label (bold) + justification text (smaller) -->
        <!-- Minimum height: 44px per button (touch target rule) -->
      </div>

      <!-- Answer feedback (aria-live) -->
      <div
        id="answer-feedback"
        class="answer-feedback hidden"
        aria-live="polite"
        role="status"
        data-testid="answer-feedback"
      ></div>

    </div>

    <!-- Results Screen (PART-019) — position:fixed overlay, z-index:100 -->
    <div id="results-screen" class="results-screen" style="display:none;" data-testid="results-screen">
      <!-- Populated dynamically by showResultsScreen() -->
    </div>

  </div>
</body>
</html>
```

**Key structural rules:**
- `#app` is the root — `data-phase`, `data-lives`, `data-score`, `data-round` attributes live here.
- `#timer-container` must be in the DOM before `new TimerComponent('timer-container', ...)` is called.
- Each option button renders the measure `label` as bold text and the `justification` as smaller sub-text within the same button. Example structure: `<button class="option-btn"><strong>Median</strong><span class="justification">it ignores extreme values</span></button>`. Both elements inside one `<button>`.
- All option buttons MUST have `min-height: 44px` (WCAG touch target).
- `#answer-feedback` MUST have `aria-live="polite"` and `role="status"`.
- `#results-screen` MUST have `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` in CSS.

---

## 6. Screen Flow + Phase State Machine

```
                    ┌─────────────────────────────────────┐
                    │         page loads                  │
                    │  gameState.phase = 'start'          │
                    │  syncDOMState()                     │
                    │  transitionScreen.show({...start...}) │
                    └───────────────┬─────────────────────┘
                                    │ [Play button clicked]
                                    ▼
                    ┌─────────────────────────────────────┐
                    │  startGame()                        │
                    │  gameState.phase = 'playing'        │
                    │  syncDOMState()                     │
                    │  transitionScreen.hide()            │
                    │  loadRound(1)                       │
                    └──────┬─────────────────────┬────────┘
                           │                     │
               [Button clicked]            [Timer expires]
                           │                     │
              ┌────────────▼──────────────────────▼────────┐
              │  handleMeasureSelect(measure)               │
              │  OR handleTimeout()                         │
              └──────┬──────────────────────────┬───────────┘
                     │                          │
               [CORRECT]                    [WRONG / Timeout]
                     │                          │
              score += 10                   lives--
              advance round                 syncDOMState()
                     │                     if lives === 0 → endGame(false)
                     │                     else advance round
                     │                          │
              ┌──────▼──────────────────────────▼──────────┐
              │  nextRound()                               │
              │  if currentRound === 6 → endGame(true)     │
              │  else → loadRound(currentRound + 1)        │
              └─────────────────────────────────────────────┘
```

### syncDOMState() — MANDATORY (GEN-PHASE-001)

Every phase change MUST call `syncDOMState()` immediately after setting `gameState.phase`. Define BEFORE any function that calls it.

```javascript
function syncDOMState() {
  const app = document.getElementById('app');
  if (!app) return;
  app.dataset.phase = gameState.phase;
  app.dataset.lives = gameState.lives;
  app.dataset.score = gameState.score || 0;
  app.dataset.round = gameState.currentRound;
}
```

**Phase transitions (ALL MANDATORY):**
- Page loads → `gameState.phase = 'start'` → `syncDOMState()` (before `transitionScreen.show({...start object...})`)
- `startGame()` → `gameState.phase = 'playing'` → `syncDOMState()` (before `transitionScreen.hide()`)
- `endGame(true)` → `gameState.phase = 'results'` → `syncDOMState()` (before `transitionScreen.show({...victory object...})`)
- `endGame(false)` → `gameState.phase = 'game_over'` → `syncDOMState()` (before `transitionScreen.show({...game_over object...})`)
- Life lost (wrong answer or timeout) → `gameState.lives--` → `progressBar.update(gameState.currentRound, Math.max(0, gameState.lives))` → `syncDOMState()`

---

## 7. Core Logic

### 7.1 startGame()

```javascript
function startGame() {
  gameState.isActive = true;
  gameState.startTime = Date.now();
  gameState.currentRound = 0;
  gameState.lives = 3;
  gameState.score = 0;
  gameState.attempts = [];
  gameState.events = [];
  gameState.gameEnded = false;
  gameState.isProcessing = false;
  gameState.phase = 'playing';
  syncDOMState();                   // GEN-PHASE-001 MANDATORY
  transitionScreen.hide();
  document.getElementById('game-area').style.display = 'block';
  progressBar.setLives(3);
  loadRound(1);
}
```

### 7.2 loadRound(roundNumber)

```javascript
function loadRound(roundNumber) {
  const round = gameState.content.rounds[roundNumber - 1];
  gameState.currentRound = roundNumber;
  gameState.isProcessing = false;

  // Update scenario text
  document.getElementById('scenario-text').textContent = round.scenario;

  // Update question text
  document.getElementById('question-text').textContent = round.question;

  // Hide feedback
  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.textContent = '';
  feedbackEl.classList.add('hidden');

  // Render 3 option buttons (each: bold label + justification span)
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  round.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-testid', 'option-' + i);
    btn.setAttribute('data-value', opt.label);
    btn.innerHTML = `<strong>${opt.label}</strong><span class="justification">${opt.justification}</span>`;
    btn.addEventListener('click', () => handleMeasureSelect(opt.label));
    grid.appendChild(btn);
  });

  // Update progress bar
  progressBar.update(gameState.currentRound, Math.max(0, gameState.lives));

  // Start timer (60s)
  timer.stop();
  timer.start(60, handleTimeout);
}
```

### 7.3 handleMeasureSelect(selectedMeasure)

```javascript
function handleMeasureSelect(selectedMeasure) {
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  timer.stop();

  const round = gameState.content.rounds[gameState.currentRound - 1];
  const isCorrect = selectedMeasure === round.correctMeasure;

  // Disable all option buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === round.correctMeasure) btn.classList.add('correct');
    if (btn.dataset.value === selectedMeasure && !isCorrect) btn.classList.add('wrong');
  });

  // Record attempt
  gameState.attempts.push({
    round: gameState.currentRound,
    selected: selectedMeasure,
    correct: round.correctMeasure,
    isCorrect,
    timestamp: Date.now()
  });

  // Show feedback
  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.textContent = isCorrect ? round.feedbackCorrect : round.feedbackWrong;
  feedbackEl.classList.remove('hidden');

  // Track event
  gameState.events.push({ type: isCorrect ? 'answer_correct' : 'answer_wrong', round: gameState.currentRound, value: selectedMeasure });

  if (isCorrect) {
    gameState.score += 10;
    FeedbackManager.sound('correct');
  } else {
    gameState.lives--;
    progressBar.update(gameState.currentRound, Math.max(0, gameState.lives));
    syncDOMState();
    FeedbackManager.sound('wrong');
  }

  setTimeout(() => {
    if (gameState.gameEnded) return;
    advanceGame();
  }, 1500);
}
```

### 7.4 handleTimeout()

```javascript
function handleTimeout() {
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  gameState.lives--;
  progressBar.update(gameState.currentRound, Math.max(0, gameState.lives));
  syncDOMState();

  // Disable buttons, reveal correct answer
  const round = gameState.content.rounds[gameState.currentRound - 1];
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === round.correctMeasure) btn.classList.add('correct');
  });

  gameState.events.push({ type: 'timeout', round: gameState.currentRound });

  setTimeout(() => {
    if (gameState.gameEnded) return;
    advanceGame();
  }, 1500);
}
```

### 7.5 advanceGame()

```javascript
function advanceGame() {
  gameState.events.push({ type: 'round_complete', round: gameState.currentRound });

  if (gameState.lives <= 0) {
    endGame(false);
    return;
  }
  if (gameState.currentRound >= gameState.totalRounds) {
    endGame(true);
    return;
  }
  loadRound(gameState.currentRound + 1);
}

window.nextRound = advanceGame;   // MANDATORY: tests call window.nextRound
```

### 7.6 endGame(victory)

```javascript
function endGame(victory) {
  if (gameState.gameEnded) return;   // ONLY guard — never use !isActive
  gameState.gameEnded = true;
  gameState.isActive = false;

  const duration = Math.round((Date.now() - gameState.startTime) / 1000);
  const correctCount = gameState.attempts.filter(a => a.isCorrect).length;
  const stars = correctCount === 6 ? 3 : correctCount >= 4 ? 2 : correctCount >= 2 ? 1 : 0;

  gameState.phase = victory ? 'results' : 'game_over';
  syncDOMState();

  // postMessage — MANDATORY fields: score, totalRounds, lives, events, attempts, duration
  window.parent.postMessage({
    type: 'game_complete',
    gameId: gameState.gameId,
    score: gameState.score,
    totalRounds: gameState.totalRounds,
    lives: Math.max(0, gameState.lives),
    stars,
    correctAnswers: correctCount,
    accuracy: Math.round((correctCount / gameState.totalRounds) * 100),
    events: gameState.events,
    attempts: gameState.attempts,
    duration,
    victory
  }, '*');

  // Show results via transitionScreen (OBJECT FORM — never string mode)
  transitionScreen.show({
    type: victory ? 'victory' : 'game_over',
    score: gameState.score,
    stars,
    message: victory
      ? `You chose correctly in ${correctCount} out of 6 rounds!`
      : 'Better luck next time! Review which measure fits which data type.'
  });
}
```

### 7.7 restartGame()

```javascript
function restartGame() {
  // MANDATORY: destroy and recreate timer (reusing after destroy = no-op)
  if (timer) timer.destroy();
  timer = new TimerComponent('timer-container', { theme: 'minimal' });

  // Reset game state fields
  gameState.phase = 'start';
  gameState.currentRound = 0;
  gameState.lives = 3;
  gameState.score = 0;
  gameState.attempts = [];
  gameState.events = [];
  gameState.gameEnded = false;
  gameState.isProcessing = false;
  gameState.isActive = false;

  document.getElementById('game-area').style.display = 'none';
  document.getElementById('results-screen').style.display = 'none';
  progressBar.setLives(3);
  syncDOMState();

  startGame();
}
```

---

## 8. postMessage Payload

The `game_complete` message sent via `window.parent.postMessage` MUST include all of the following fields:

| Field | Type | Description |
|---|---|---|
| `type` | `'game_complete'` | Fixed string |
| `gameId` | string | `'stats-which-measure'` |
| `score` | number | Total score (10 per correct answer) |
| `totalRounds` | number | `6` |
| `lives` | number | Remaining lives, `Math.max(0, gameState.lives)` |
| `stars` | number | 0–3 |
| `correctAnswers` | number | Count of correct answers |
| `accuracy` | number | `Math.round((correctAnswers / 6) * 100)` |
| `events` | array | All tracked events |
| `attempts` | array | All attempt records |
| `duration` | number | Seconds from startTime to endGame |
| `victory` | boolean | `true` if all 6 rounds completed |

---

## 9. Scoring and Stars

| Correct Answers | Stars |
|---|---|
| 6 / 6 | 3 ★★★ |
| 4–5 / 6 | 2 ★★☆ |
| 2–3 / 6 | 1 ★☆☆ |
| 0–1 / 6 | 0 ☆☆☆ |

Score per correct answer: +10. Maximum score: 60. Game-over on 0 lives (can happen before round 6 completes).

---

## 10. CSS Rules (Key Constraints)

```css
/* Results screen MUST be position:fixed — Playwright cannot see it otherwise */
.results-screen {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 100;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Option buttons — min-height 44px for touch target (WCAG) */
.option-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 44px;
  padding: 10px 16px;
  margin-bottom: 8px;
  width: 100%;
  border: 2px solid #ccc;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}
.option-btn:hover:not(:disabled) {
  border-color: #4a90d9;
  background: #f0f6ff;
}
.option-btn .justification {
  font-size: 0.85em;
  color: #666;
  margin-top: 2px;
}
.option-btn.correct { border-color: #27ae60; background: #eafaf1; }
.option-btn.wrong   { border-color: #e74c3c; background: #fdf2f2; }
.option-btn:disabled { cursor: not-allowed; opacity: 0.9; }

/* Scenario card */
.scenario-card {
  background: #f8f9fa;
  border-left: 4px solid #4a90d9;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.scenario-text { margin: 0; font-size: 1em; line-height: 1.5; }

/* Feedback */
.answer-feedback {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.95em;
  background: #eef;
}
.answer-feedback.hidden { display: none; }
```

---

## 11. All 6 Questions — Correct Answers Reference

| # | Scenario | Correct Answer | Key Reason | Misconception Tag |
|---|---|---|---|---|
| 1 | Salaries [18k, 20k, 22k, 24k, 120k] | **Median** | CEO salary is extreme outlier; mean inflated | MC-outlier-ignore |
| 2 | Shoe sizes [38,40,40,41,40,39,42,40] | **Mode** | Store needs most-demanded size; mode = 40 (×4) | MC-mode-discrete |
| 3 | Test scores [62,67,71,73,75,76,78,80,82,95] | **Mean** | Symmetric, no outliers; mean most informative | MC-symmetric-median |
| 4 | House prices [4.2L,4.5L,4.8L,5.1L,5.3L,18.9L] | **Median** | Luxury penthouse is outlier; mean inflated | MC-outlier-ignore |
| 5 | Favourite colours (Red×8, Blue×12, Green×5, Yellow×3) | **Mode** | Categorical data; mean/median meaningless for colours | MC-categorical-mean |
| 6 | Daily rainfall [0,0,0,2,3,5,8,12,15,45] | **Median** | Many zeros + one storm spike; mean (9mm) misleads | MC-outlier-ignore |

---

## 12. CDN Component Usage

| Component | Usage | Notes |
|---|---|---|
| `ScreenLayout` | `new ScreenLayout({ slots: { progressBar: true, transitionScreen: true } })` | Injects `mathai-progress-slot` and transition screen container |
| `ProgressBarComponent` | `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 6, totalLives: 3 })` | **totalRounds: 6** (not 9). `progressBar.update(round, Math.max(0, lives))` on every life change. |
| `TransitionScreenComponent` | `transitionScreen.show({...})` — ALWAYS object form | Never pass a string to `.show()`. Types: `'start'`, `'victory'`, `'game_over'`. |
| `TimerComponent` | `new TimerComponent('timer-container', { theme: 'minimal' })` | 60s per round. `timer.start(60, handleTimeout)`. Destroy + recreate on `restartGame()`. |
| `FeedbackManager` | `FeedbackManager.sound('correct')` / `FeedbackManager.sound('wrong')` | NO `FeedbackManager.init()` — triggers audio permission popup. |
| `SignalCollector` | Auto-initialized by ScreenLayout | No manual init needed. |

---

## 13. waitForPackages Configuration (CRITICAL)

```javascript
await waitForPackages(
  ['ScreenLayout', 'TransitionScreenComponent', 'ProgressBarComponent', 'TimerComponent', 'FeedbackManager'],
  { maxWait: 180000 }   // MUST be 180000 — never 10000
);
```

If `maxWait` is 10000, the CDN bundle will time out on cold start and every first build will fail with "Packages failed to load".

---

## 14. window.gameState Shape (Test Harness Requirements)

The test harness reads these fields directly from `window.gameState`:

| Field | Required | Description |
|---|---|---|
| `gameId` | YES | Must be `'stats-which-measure'` — first field in object literal |
| `phase` | YES | `'start'` \| `'playing'` \| `'results'` \| `'game_over'` |
| `lives` | YES | Current lives (0–3) |
| `score` | YES | Current score |
| `currentRound` | YES | Current round number (1–6 during play) |
| `totalRounds` | YES | Must be `6` |
| `gameEnded` | YES | `true` after `endGame()` fires |
| `attempts` | YES | Array of attempt records |
| `events` | YES | Array of event records |

`window.gameState` assignment MUST appear at module scope (NOT inside DOMContentLoaded), immediately after the `gameState` object literal closes.

---

## 15. Anti-Patterns to AVOID

1. **Never call `FeedbackManager.init()`** — triggers audio permission popup causing non-deterministic Playwright failures. Use `FeedbackManager.sound()` and `FeedbackManager.playDynamicFeedback()` directly.

2. **Never guard `endGame()` with `!isActive`** — use `if (gameState.gameEnded) return;` only. The `isActive` guard fires too early on the results path and blocks the victory screen.

3. **Never use `maxWait: 10000` in `waitForPackages`** — always `180000`. A 10s CDN timeout kills every cold-start build before the game even initialises.

4. **Never pass a string to `transitionScreen.show()`** — always pass an object: `transitionScreen.show({ type: 'victory', score: ..., stars: ... })`. String-mode API causes a runtime TypeError that breaks the results screen.

5. **Never omit `Math.max(0, gameState.lives)` in `progressBar.update()`** — if lives drops to -1 (race condition), the ProgressBar component crashes with an assertion error.

6. **Never make `#results-screen` a non-fixed element** — if it is `position: static` or `relative`, Playwright cannot detect it over the game area and the results-screen test always fails (P0 pattern confirmed in soh-cah-toa-worked-example #544).

7. **Never assign `window.gameState` inside `DOMContentLoaded`** — it must be at module scope. The test harness calls `window.gameState` before DOMContentLoaded fires, and `waitForPhase()` will always timeout if the assignment is deferred.

8. **Never reuse the timer after `timer.destroy()`** — always `timer.destroy()` then `timer = new TimerComponent(...)` in `restartGame()`. A destroyed timer is a no-op; the countdown never starts on second play.

9. **Never render option buttons without `data-value` and `data-testid` attributes** — Playwright uses `[data-value="Median"]` to click options and `[data-testid="option-0"]` etc. for indexed access. Missing attributes cause all MCQ click tests to fail.

10. **Never skip `syncDOMState()` after any phase change or lives change** — `data-phase` and `data-lives` on `#app` are the ONLY source of truth for `waitForPhase()` in the test harness. Any omission causes a test timeout.

---

## 16. A/B Option Labeling Guidance

- Options are ALWAYS presented in fixed order: **Mean** (index 0), **Median** (index 1), **Mode** (index 2). No shuffle.
- Each button displays two lines: (1) the measure name in bold, (2) the justification phrase in smaller text.
- The justification is part of the distractor design — learner must evaluate whether the justification applies to THIS data, not just recognize the measure name.
- Data-testid values: `option-0` (Mean), `option-1` (Median), `option-2` (Mode). Fixed — tests rely on these indices.
- Data-value values: `"Mean"`, `"Median"`, `"Mode"` — capital first letter, exact string match to `correctMeasure`.
- Correct answer highlighting: after selection, add class `correct` to the correct button and `wrong` to the incorrect selected button. Always reveal the correct answer on wrong selection or timeout.
