'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// pipeline-feedback.js — Step 3b: FeedbackManager Verification
//
// Two-part verification of audio/subtitle/sticker feedback:
//   Part A: Static validation via validate-feedback.js
//   Part B: LLM-generated Playwright tests for runtime feedback events
//
// Runs while the dev server is still alive (inside the try block in pipeline.js).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const VALIDATE_FEEDBACK_PATH = path.join(__dirname, 'validate-feedback.js');
const MAX_FEEDBACK_ITERATIONS = 3;
const FEEDBACK_TEST_TIMEOUT = 60000; // 60s per Playwright run

// ─── Part A: Static validation ──────────────────────────────────────────────

function runStaticFeedbackValidation(htmlFile, specPath, info, warn) {
  if (!fs.existsSync(VALIDATE_FEEDBACK_PATH)) {
    warn('[feedback] validate-feedback.js not found — skipping Part A');
    return { passed: false, skipped: true, output: '' };
  }

  try {
    const output = execFileSync(
      'node',
      [VALIDATE_FEEDBACK_PATH, htmlFile, specPath || ''],
      { encoding: 'utf-8', timeout: 10000 },
    );
    info(`[feedback] Part A: Static validation passed`);
    return { passed: true, skipped: false, output: output.trim() };
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    warn(`[feedback] Part A: Static validation found issues`);
    if (output.trim()) info(`[feedback] ${output.trim()}`);
    return { passed: false, skipped: false, output: output.trim() };
  }
}

// ─── Part B: Feedback test generation prompt ────────────────────────────────

function buildFeedbackTestPrompt(htmlContent, specContent) {
  return `You are an expert Playwright test writer specializing in audio/feedback verification for HTML games.

The game uses a FeedbackManager package that emits console.log events when audio plays, subtitles show, or stickers show:

- \`[FeedbackManager:event] audio_play\` followed by JSON: {id, type: "sound"|"stream", volume}
- \`[FeedbackManager:event] subtitle_shown\` followed by JSON: {text, duration}
- \`[FeedbackManager:event] sticker_shown\` followed by JSON: {type, sticker}

Also, warnings like \`[AudioKit] Sound not preloaded:\` indicate sounds that were played without being preloaded first.

Generate Playwright tests that verify the FeedbackManager integration is correct:

1. **Setup**: Create a console message collector that captures all \`[FeedbackManager:event]\` lines and \`[AudioKit]\` warnings. Attach it via \`page.on('console')\` BEFORE \`page.goto('/')\`.

2. **Test: No preload warnings** — Navigate to the game, let it initialise, interact with it (trigger at least one correct and one incorrect answer). Verify no \`Sound not preloaded\` warnings appear in console.

3. **Test: Correct answer plays success audio** — Trigger a correct answer action (use the exact selectors and game flow from the HTML). Verify an \`audio_play\` event fires. Check the sound ID matches the expected correct-answer sound from the HTML's preload list.

4. **Test: Incorrect answer plays error audio** — Trigger an incorrect answer. Verify an \`audio_play\` event fires with the expected wrong-answer sound ID.

5. **Test: Game completion audio** — If the game has end-game feedback (playDynamicFeedback / TTS), play through all rounds and verify a \`stream\` type audio_play event fires OR that playDynamicFeedback was triggered.

6. **Test: Subtitle shown on feedback** — If the game shows subtitles during feedback, verify \`subtitle_shown\` events fire with non-empty text.

7. **Test: Sticker shown on feedback** — If the game shows stickers during feedback, verify \`sticker_shown\` events fire.

IMPORTANT RULES:
- Use \`@playwright/test\` imports (ESM: \`import { test, expect } from '@playwright/test'\`)
- Base URL is configured in playwright.config.js — use \`page.goto('/')\` to load the game
- Wait for game initialization (look for #gameContent or game-ready indicators in the HTML)
- Use the EXACT element selectors from the HTML — do not invent selectors
- Use \`page.waitForTimeout()\` sparingly — prefer \`waitForSelector\` or event-based waits
- For console event capture, collect messages in an array and assert on them after actions
- Skip tests that don't apply (e.g., skip sticker test if no stickers are used in the game)
- Use \`{ force: true }\` on button clicks to avoid "element detached" failures from transition screens
- Output ONLY the test code wrapped in a \`\`\`javascript code block

SPECIFICATION:
${specContent}

HTML:
${htmlContent}`;
}

// ─── Part B: Feedback fix prompt ────────────────────────────────────────────

function buildFeedbackFixPrompt(failureDesc, testOutput, htmlContent, specContent, iteration) {
  // For large HTML, send only the <script> section on later iterations
  let htmlContext = htmlContent;
  if (htmlContent.length > 20000 && iteration >= 2) {
    const scriptMatch = htmlContent.match(/<script[\s\S]*?<\/script>/);
    htmlContext = scriptMatch
      ? `[HTML truncated — showing <script> section only]\n\n${scriptMatch[0]}\n\n[Full HTML is ${htmlContent.length} bytes]`
      : htmlContent;
  }

  return `The HTML game's FeedbackManager audio/subtitle/sticker integration has test failures.
Fix ONLY the audio/feedback-related code. Do NOT change game logic, layout, or scoring.

FAILING FEEDBACK TESTS:
${failureDesc}

TEST OUTPUT (summary):
${testOutput.slice(0, 4000)}

CURRENT HTML:
${htmlContext}

SPECIFICATION (reference for audio IDs, feedback triggers, and FeedbackManager API):
${specContent}

Common fixes needed:
- sound.preload() array missing an audio ID that sound.play() uses
- sound.play() not awaited before screen transition
- FeedbackManager.sound.playDynamicFeedback() should be FeedbackManager.playDynamicFeedback()
- VisibilityTracker using sound.stopAll() instead of sound.pause()/resume()
- Missing await on FeedbackManager.init()
- Audio URLs from spec not included in preload array

Output the complete fixed HTML wrapped in a \`\`\`html code block.`;
}

// ─── Extract test code from LLM output ──────────────────────────────────────

function extractTestCode(llmOutput) {
  // Try ```javascript blocks first, then ```js, then generic ```
  const patterns = [
    /```javascript\s*\n([\s\S]*?)```/,
    /```js\s*\n([\s\S]*?)```/,
    /```\s*\n([\s\S]*?)```/,
  ];
  for (const pattern of patterns) {
    const match = llmOutput.match(pattern);
    if (match && match[1].trim().length > 100) {
      return match[1].trim();
    }
  }
  return null;
}

// ─── Parse Playwright JSON results ──────────────────────────────────────────

function parseTestResults(stdout) {
  try {
    const result = JSON.parse(stdout);
    const passed = result?.stats?.expected || 0;
    const failed = result?.stats?.unexpected || 0;
    const skipped = result?.stats?.skipped || 0;

    // Extract failure descriptions
    const failures = [];
    const walkSuites = (suites) => {
      for (const suite of (suites || [])) {
        for (const spec of (suite.specs || [])) {
          if (!spec.ok) {
            failures.push(spec.title || 'unknown test');
          }
        }
        walkSuites(suite.suites);
      }
    };
    walkSuites(result.suites);

    return { passed, failed, skipped, failures };
  } catch {
    return { passed: 0, failed: 1, skipped: 0, failures: ['JSON parse error'] };
  }
}

// ─── Run Playwright feedback tests ──────────────────────────────────────────

async function runFeedbackTests(gameDir, testFile) {
  try {
    const { stdout } = await execFileAsync(
      'npx',
      ['playwright', 'test', '--config', 'playwright.config.js', '--reporter=json',
        path.relative(gameDir, testFile)],
      { timeout: FEEDBACK_TEST_TIMEOUT, encoding: 'utf-8', cwd: gameDir },
    );
    return { raw: stdout, ...parseTestResults(stdout) };
  } catch (err) {
    const stdout = err.stdout || '{}';
    return { raw: stdout, ...parseTestResults(stdout) };
  }
}

// ─── Main feedback verification function ────────────────────────────────────

/**
 * Runs Step 3b: FeedbackManager verification.
 *
 * @param {object} opts
 * @param {string} opts.gameDir - Path to game build directory
 * @param {string} opts.htmlFile - Path to index.html
 * @param {string} opts.specPath - Path to spec.md
 * @param {string} opts.specContent - Game spec markdown content
 * @param {Function} opts.trackedLlmCall - LLM call with cost tracking
 * @param {string} opts.testModel - Model for test generation
 * @param {string} opts.fixModel - Model for fix generation
 * @param {Function} opts.info - Logger
 * @param {Function} opts.warn - Logger
 * @param {Function} opts.progress - Progress callback
 * @param {object} opts.report - Pipeline report object
 * @param {Function} opts.extractHtml - HTML extraction function
 * @param {Function} opts.injectHarnessToFile - Harness injection function
 * @param {string} opts.gameId - Game identifier
 * @returns {object} { verdict, staticResult, testsPassed, testsFailed, iterations }
 */
async function runFeedbackVerification(opts) {
  const {
    gameDir, htmlFile, specPath, specContent,
    trackedLlmCall, testModel, fixModel,
    info, warn, progress,
    report, extractHtml, injectHarnessToFile,
    gameId,
  } = opts;

  info('[pipeline] Step 3b: FeedbackManager audio/subtitle/sticker verification');
  progress('feedback-verification', { gameId });

  const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

  // Check if game uses FeedbackManager at all
  if (!/FeedbackManager/.test(htmlContent)) {
    info('[feedback] Game does not use FeedbackManager — skipping feedback verification');
    return { verdict: 'N/A', staticResult: null, testsPassed: 0, testsFailed: 0, iterations: 0 };
  }

  // ── Part A: Static validation ──────────────────────────────────────────
  info('[feedback] Part A: Static feedback validation');
  const staticResult = runStaticFeedbackValidation(htmlFile, specPath, info, warn);

  // ── Part B: LLM-generated feedback Playwright tests ────────────────────
  info('[feedback] Part B: Generating feedback-specific Playwright tests');

  const testFile = path.join(gameDir, 'tests', 'feedback.spec.js');
  let testCode;

  try {
    const prompt = buildFeedbackTestPrompt(htmlContent, specContent);
    const llmOutput = await trackedLlmCall(
      'generate-feedback-tests',
      prompt,
      testModel,
      { maxTokens: 16000 },
      report,
    );
    testCode = extractTestCode(llmOutput);
  } catch (err) {
    warn(`[feedback] Feedback test generation LLM call failed: ${err.message} — skipping Part B`);
    const verdict = staticResult.passed ? 'PASSED_STATIC_ONLY' : 'STATIC_ISSUES';
    report.feedback_verification = { verdict, staticPassed: staticResult.passed };
    return { verdict, staticResult, testsPassed: 0, testsFailed: 0, iterations: 0 };
  }

  if (!testCode) {
    warn('[feedback] Could not extract feedback tests from LLM output — skipping Part B');
    const verdict = staticResult.passed ? 'PASSED_STATIC_ONLY' : 'STATIC_ISSUES';
    report.feedback_verification = { verdict, staticPassed: staticResult.passed };
    return { verdict, staticResult, testsPassed: 0, testsFailed: 0, iterations: 0 };
  }

  fs.writeFileSync(testFile, testCode);
  info(`[feedback] Feedback tests saved to ${path.basename(testFile)} (${testCode.length} bytes)`);

  // ── Feedback test → fix loop ───────────────────────────────────────────
  let bestPassed = 0;
  let lastFailed = 0;
  let iteration = 0;

  for (iteration = 1; iteration <= MAX_FEEDBACK_ITERATIONS; iteration++) {
    info(`[feedback] Iteration ${iteration}/${MAX_FEEDBACK_ITERATIONS}`);

    const result = await runFeedbackTests(gameDir, testFile);
    bestPassed = Math.max(bestPassed, result.passed);
    lastFailed = result.failed;

    info(`[feedback] Results: ${result.passed} passed, ${result.failed} failed`);

    if (result.failed === 0 && result.passed > 0) {
      info('[feedback] ✓ All feedback tests passed!');
      const feedbackResult = {
        verdict: 'PASSED',
        staticPassed: staticResult.passed,
        testsPassed: result.passed,
        testsFailed: 0,
        iterations: iteration,
      };
      report.feedback_verification = feedbackResult;
      return feedbackResult;
    }

    if (iteration >= MAX_FEEDBACK_ITERATIONS) {
      warn(`[feedback] Max iterations (${MAX_FEEDBACK_ITERATIONS}) reached — proceeding with ${result.failed} failure(s)`);
      break;
    }

    // ── Fix attempt ──────────────────────────────────────────────────────
    info(`[feedback] Attempting feedback fix (iteration ${iteration})...`);
    progress('feedback-fix', { gameId, iteration, failures: result.failures });

    const currentHtml = fs.readFileSync(htmlFile, 'utf-8');
    const fixPrompt = buildFeedbackFixPrompt(
      result.failures.join(', '),
      result.raw,
      currentHtml,
      specContent,
      iteration,
    );

    let fixedHtml;
    try {
      const fixOutput = await trackedLlmCall(
        `feedback-fix-${iteration}`,
        fixPrompt,
        fixModel,
        { maxTokens: 128000 },
        report,
      );
      fixedHtml = extractHtml(fixOutput);
    } catch (err) {
      warn(`[feedback] Feedback fix LLM call failed: ${err.message} — stopping fix loop`);
      break;
    }

    if (!fixedHtml) {
      warn('[feedback] Could not extract HTML from feedback fix output — stopping fix loop');
      break;
    }

    // Size guard: reject if fix shrank HTML by more than 20%
    const origSize = currentHtml.length;
    const fixedSize = fixedHtml.length;
    if (fixedSize < origSize * 0.8) {
      warn(`[feedback] Fix shrank HTML by ${Math.round((1 - fixedSize / origSize) * 100)}% — rejecting fix`);
      break;
    }

    fs.writeFileSync(htmlFile, fixedHtml);
    // Re-inject harness after HTML replacement
    injectHarnessToFile(htmlFile);
    info(`[feedback] HTML updated for feedback fix (${fixedSize} → ${fs.statSync(htmlFile).size} bytes with harness)`);
  }

  const feedbackResult = {
    verdict: lastFailed > 0 ? `FAILED:${lastFailed}` : 'PASSED',
    staticPassed: staticResult.passed,
    testsPassed: bestPassed,
    testsFailed: lastFailed,
    iterations: iteration,
  };
  report.feedback_verification = feedbackResult;
  return feedbackResult;
}

module.exports = { runFeedbackVerification };
