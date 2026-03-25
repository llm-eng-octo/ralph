'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// pipeline-visual-review.js — Step 3.5: Visual UI/UX Review
//
// After all Playwright tests pass, this step:
// 1. Captures screenshots of the game at each key state
// 2. Sends them to a vision-capable LLM for UI/UX review
// 3. If issues found, applies fixes and re-captures (max 2 iterations)
//
// Screenshots captured:
//   - Start/transition screen
//   - Gameplay (active round)
//   - Correct answer feedback
//   - Wrong answer feedback
//   - Results/victory screen
//   - Game over screen
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const MAX_VISUAL_FIX_ITERATIONS = 2;
const SCREENSHOT_TIMEOUT = 120000; // 2 min for screenshot capture

// ─── Screenshot capture via Playwright ───────────────────────────────────────

/**
 * Writes a temporary Playwright script that drives the game through key states
 * and captures screenshots at each point. Returns the script path.
 */
function writeScreenshotScript(gameDir) {
  const scriptPath = path.join(gameDir, 'tests', '_visual-screenshots.spec.js');
  const script = `
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'visual-screenshots');

// Resilient button click — retries on detached-element errors (transition screens
// frequently replace DOM nodes mid-animation, causing "element was detached" failures).
async function safeClick(page, locator, opts = {}) {
  const maxAttempts = opts.attempts || 3;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await locator.click({ force: true, timeout: opts.timeout || 5000 });
      return true;
    } catch (err) {
      const msg = (err.message || '');
      if (msg.includes('detached') || msg.includes('not stable') || msg.includes('intercept')) {
        await page.waitForTimeout(300);
        continue;
      }
      if (i === maxAttempts - 1) return false;
      await page.waitForTimeout(300);
    }
  }
  return false;
}

async function dismissPopups(page) {
  try {
    const okayBtn = page.locator('button:has-text("Okay!")');
    if (await okayBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await safeClick(page, okayBtn);
      await page.waitForTimeout(300);
    }
  } catch {
    // popup dismiss is best-effort
  }
}

async function waitForReady(page) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await dismissPopups(page);
    // Check multiple readiness signals — transition slot button OR game content visible
    const hasTransitionBtn = await page.locator('#mathai-transition-slot button').first()
      .isVisible({ timeout: 300 }).catch(() => false);
    if (hasTransitionBtn) return;
    // Fallback: if #gameContent is visible, the game may already be playing (no transition)
    const hasGameContent = await page.locator('#gameContent').first()
      .isVisible({ timeout: 300 }).catch(() => false);
    if (hasGameContent) return;
    // Also check for data-phase attribute as readiness signal
    const phase = await page.locator('#app').getAttribute('data-phase').catch(() => null);
    if (phase && phase !== 'loading') return;
    await page.waitForTimeout(500);
  }
  throw new Error('Game did not reach ready state within 60s');
}

async function saveScreenshot(page, name) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, name + '.png');
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

// Click through all transition screens until gameplay is reached or deadline expires.
async function clickThroughTransitions(page, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await dismissPopups(page);
    const btn = page.locator('#mathai-transition-slot button').first();
    const hasBtn = await btn.isVisible({ timeout: 600 }).catch(() => false);
    if (!hasBtn) break;
    const clicked = await safeClick(page, btn);
    if (!clicked) break;
    await page.waitForTimeout(500);
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'hidden', { get: () => false });
  });
  // Suppress non-critical errors
  page.on('pageerror', () => {});
  await page.goto('/');
  await waitForReady(page);
});

test('capture game screenshots', async ({ page }) => {
  // 1. Start screen
  await saveScreenshot(page, '01-start-screen');

  // 2. Click start — advance through transitions to gameplay
  const startBtn = page.locator('#mathai-transition-slot button').first();
  await safeClick(page, startBtn);
  await page.waitForTimeout(500);
  await dismissPopups(page);

  // Click through any additional transition screens (level intros)
  await clickThroughTransitions(page);

  // Wait for playing phase
  try {
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'playing', { timeout: 10000 });
  } catch {
    // Some games may not set data-phase; continue anyway
  }
  await page.waitForTimeout(500);

  // 3. Gameplay screen (round 1)
  await saveScreenshot(page, '02-gameplay-round1');

  // 4. Try answering correctly
  try {
    await page.evaluate(() => window.__ralph && window.__ralph.answer(true));
    await page.waitForTimeout(1500); // wait for feedback animation
    await saveScreenshot(page, '03-correct-feedback');
  } catch {
    // Game may not support __ralph.answer — skip
  }

  // 5. Try answering incorrectly (restart or next round first)
  try {
    // If game advanced to next round, answer wrong on this one
    const phase = await page.locator('#app').getAttribute('data-phase').catch(() => null);
    if (phase === 'playing' || phase === null) {
      await page.evaluate(() => window.__ralph && window.__ralph.answer(false));
      await page.waitForTimeout(1500);
      await saveScreenshot(page, '04-wrong-feedback');
    }
  } catch {
    // Skip if not possible
  }

  // 6. Victory screen
  try {
    await page.evaluate(() => window.__ralph && window.__ralph.endGame('victory'));
    await page.evaluate(() => window.__ralph && window.__ralph.syncDOMState && window.__ralph.syncDOMState());
    await page.waitForTimeout(1000);

    // Click through any transition buttons to reach results
    const vDeadline = Date.now() + 5000;
    while (Date.now() < vDeadline) {
      const btn = page.locator('#mathai-transition-slot button').first();
      const hasBtn = await btn.isVisible({ timeout: 500 }).catch(() => false);
      if (!hasBtn) break;
      // Don't click Play Again — just wait for results to show
      const btnText = await btn.textContent().catch(() => '');
      if (/play again|restart/i.test(btnText)) break;
      await safeClick(page, btn);
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(500);
    await saveScreenshot(page, '05-victory-results');
  } catch {
    // Skip if endGame not available
  }

  // 7. Restart and trigger game over
  try {
    await page.evaluate(() => window.__ralph && window.__ralph.restartGame());
    await page.waitForTimeout(1000);
    await dismissPopups(page);

    // Click through transitions again
    await clickThroughTransitions(page);

    await page.evaluate(() => window.__ralph && window.__ralph.endGame('game_over'));
    await page.evaluate(() => window.__ralph && window.__ralph.syncDOMState && window.__ralph.syncDOMState());
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '06-gameover');
  } catch {
    // Skip if not possible
  }
});
`;

  fs.writeFileSync(scriptPath, script);
  return scriptPath;
}

/**
 * Runs the screenshot Playwright script and returns base64-encoded screenshots.
 * @returns {Array<{name: string, base64: string}>}
 */
async function captureScreenshots(gameDir, info) {
  const scriptPath = writeScreenshotScript(gameDir);
  const screenshotDir = path.join(gameDir, 'visual-screenshots');

  // Clean previous screenshots
  if (fs.existsSync(screenshotDir)) {
    fs.rmSync(screenshotDir, { recursive: true, force: true });
  }

  try {
    await execFileAsync(
      'npx',
      ['playwright', 'test', '--config', 'playwright.config.js', '--reporter=list',
        path.relative(gameDir, scriptPath)],
      { timeout: SCREENSHOT_TIMEOUT, encoding: 'utf-8', cwd: gameDir },
    );
  } catch (err) {
    // Test may "fail" due to non-critical errors but screenshots are still captured
    if (info) info(`[visual-review] Screenshot capture had warnings: ${(err.message || '').slice(0, 200)}`);
  }

  // Collect screenshots
  const screenshots = [];
  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir)
      .filter(f => f.endsWith('.png'))
      .sort();
    for (const file of files) {
      const filePath = path.join(screenshotDir, file);
      const base64 = fs.readFileSync(filePath).toString('base64');
      const name = file.replace('.png', '').replace(/^\d+-/, '');
      screenshots.push({ name, base64 });
    }
  }

  // Cleanup temp script
  try { fs.unlinkSync(scriptPath); } catch {}

  return screenshots;
}

// ─── Visual review prompt ────────────────────────────────────────────────────

function buildVisualReviewPrompt(screenshots, specContent, htmlContent) {
  const content = [];

  content.push({
    type: 'text',
    text: `You are reviewing the UI/UX of a MathAI educational game. Below are screenshots captured at different game states, followed by the game spec and HTML code.

Review each screenshot for UI/UX issues. Focus on:

1. **Layout & Spacing**: Elements properly centered, consistent spacing, no overflow
2. **Readability**: Text is legible, good contrast, appropriate font sizes
3. **Touch Targets**: Interactive elements are at least 44x44px
4. **Visual Feedback**: Correct/wrong states are clearly distinguishable with appropriate colors
5. **Screen Coverage**: Results/game-over screens should cover the full viewport
6. **Responsive**: Content fits within mobile viewport (375x667) without horizontal scroll
7. **Visual Hierarchy**: Important elements (score, lives, prompt) are prominently displayed
8. **Consistency**: Colors, fonts, and spacing are consistent across screens
9. **Accessibility**: Sufficient color contrast, clear focus indicators

For each issue found, respond in this exact format:

ISSUE: [severity: critical|warning] [brief description]
FIX: [describe the CSS/HTML change needed — be specific about selectors and properties]

After all issues, provide a verdict:
VERDICT: [APPROVED — no critical issues | NEEDS_FIX — list critical issues]

If there are NO issues, just respond:
VERDICT: APPROVED

Screenshots follow:
`
  });

  // Add each screenshot with label
  for (const ss of screenshots) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: ss.base64 }
    });
    content.push({
      type: 'text',
      text: `Screenshot: ${ss.name}`
    });
  }

  // Add spec (truncated to key visual sections)
  const specExcerpt = specContent.length > 8000
    ? specContent.slice(0, 8000) + '\n... [spec truncated]'
    : specContent;

  content.push({
    type: 'text',
    text: `\n--- GAME SPEC (for reference) ---\n${specExcerpt}\n\n--- HTML CODE ---\n${htmlContent}`
  });

  return content;
}

function buildVisualFixPrompt(reviewFeedback, htmlContent) {
  return `You are fixing UI/UX issues in a MathAI educational game HTML file.

The visual review found these issues:

${reviewFeedback}

Fix ALL the issues listed above. Return the COMPLETE corrected HTML file wrapped in:
\`\`\`html
... full HTML here ...
\`\`\`

Rules:
- Only modify CSS styles and HTML structure — do NOT change game logic or JavaScript behavior
- Preserve all data-testid attributes
- Preserve all window.__ralph harness code
- Preserve all CDN script tags exactly as-is
- Do not remove any existing functionality

Current HTML:
${htmlContent}`;
}

/**
 * Parse the visual review response to extract verdict and issues.
 */
function parseVisualReview(response) {
  const verdictMatch = response.match(/VERDICT:\s*(APPROVED|NEEDS_FIX)/i);
  const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : 'APPROVED';

  const issues = [];
  const issueRegex = /ISSUE:\s*\[?(critical|warning)\]?\s*(.+?)(?=\nFIX:|ISSUE:|VERDICT:|$)/gis;
  let match;
  while ((match = issueRegex.exec(response)) !== null) {
    issues.push({
      severity: match[1].toLowerCase(),
      description: match[2].trim(),
    });
  }

  return { verdict, issues, rawResponse: response };
}

// ─── Main visual review function ─────────────────────────────────────────────

/**
 * Runs the visual UI/UX review step.
 *
 * @param {object} opts
 * @param {string} opts.gameDir - Path to game build directory
 * @param {string} opts.htmlFile - Path to index.html
 * @param {string} opts.specContent - Game spec markdown content
 * @param {Function} opts.trackedLlmCall - LLM call function with cost tracking
 * @param {string} opts.model - Vision-capable model to use
 * @param {Function} opts.info - Logger
 * @param {Function} opts.warn - Logger
 * @param {Function} opts.progress - Progress callback
 * @param {object} opts.report - Pipeline report object
 * @param {Function} opts.extractHtml - HTML extraction function
 * @param {Function} opts.injectHarnessToFile - Harness injection function
 * @param {string} opts.gameId - Game identifier
 * @returns {object} { verdict, issues, iterations }
 */
async function runVisualReview(opts) {
  const {
    gameDir, htmlFile, specContent,
    trackedLlmCall, model,
    info, warn, progress,
    report, extractHtml, injectHarnessToFile,
    gameId,
  } = opts;

  info('[pipeline] Step 3.5: Visual UI/UX Review');
  progress('visual-review', { gameId, model });

  let lastVerdict = 'APPROVED';
  let allIssues = [];
  let iteration = 0;

  for (iteration = 0; iteration < MAX_VISUAL_FIX_ITERATIONS + 1; iteration++) {
    // ── Capture screenshots ──────────────────────────────────────────────
    info(`[visual-review] Capturing screenshots (iteration ${iteration})...`);
    const screenshots = await captureScreenshots(gameDir, info);

    if (screenshots.length === 0) {
      warn('[visual-review] No screenshots captured — skipping visual review');
      return { verdict: 'SKIPPED', issues: [], iterations: 0 };
    }

    info(`[visual-review] Captured ${screenshots.length} screenshots: ${screenshots.map(s => s.name).join(', ')}`);

    // ── Send to LLM for review ───────────────────────────────────────────
    const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
    const reviewContent = buildVisualReviewPrompt(screenshots, specContent, htmlContent);

    let reviewResponse;
    try {
      reviewResponse = await trackedLlmCall(
        `visual-review-${iteration}`,
        reviewContent,
        model,
        { maxTokens: 16000 },
        report,
      );
    } catch (err) {
      warn(`[visual-review] LLM call failed: ${err.message} — skipping visual review`);
      return { verdict: 'SKIPPED', issues: [], iterations: iteration };
    }

    const parsed = parseVisualReview(reviewResponse);
    lastVerdict = parsed.verdict;
    allIssues = parsed.issues;

    info(`[visual-review] Verdict: ${parsed.verdict} | Issues: ${parsed.issues.length} (${parsed.issues.filter(i => i.severity === 'critical').length} critical)`);

    // Log issues
    for (const issue of parsed.issues) {
      const prefix = issue.severity === 'critical' ? '🔴' : '⚠️';
      info(`[visual-review]   ${prefix} ${issue.description}`);
    }

    // ── If approved or no more iterations, stop ──────────────────────────
    if (parsed.verdict === 'APPROVED') {
      info('[visual-review] APPROVED — no critical UI/UX issues');
      break;
    }

    if (iteration >= MAX_VISUAL_FIX_ITERATIONS) {
      warn(`[visual-review] Max fix iterations (${MAX_VISUAL_FIX_ITERATIONS}) reached — proceeding with current state`);
      break;
    }

    // ── Fix the issues ───────────────────────────────────────────────────
    info(`[visual-review] Fixing ${parsed.issues.length} UI/UX issues (iteration ${iteration + 1})...`);
    progress('visual-fix', { gameId, iteration: iteration + 1, issues: parsed.issues.length });

    const fixPrompt = buildVisualFixPrompt(reviewResponse, htmlContent);

    let fixResponse;
    try {
      fixResponse = await trackedLlmCall(
        `visual-fix-${iteration + 1}`,
        fixPrompt,
        model,
        { maxTokens: 128000 },
        report,
      );
    } catch (err) {
      warn(`[visual-review] Fix LLM call failed: ${err.message} — proceeding with current state`);
      break;
    }

    const fixedHtml = extractHtml(fixResponse);
    if (!fixedHtml) {
      warn('[visual-review] Could not extract HTML from fix response — proceeding with current state');
      break;
    }

    // Size guard: reject if fix shrank HTML by more than 20%
    const origSize = htmlContent.length;
    const fixedSize = fixedHtml.length;
    if (fixedSize < origSize * 0.8) {
      warn(`[visual-review] Fix shrank HTML by ${Math.round((1 - fixedSize / origSize) * 100)}% — rejecting fix`);
      break;
    }

    fs.writeFileSync(htmlFile, fixedHtml + '\n');

    // Re-inject harness after modifying HTML
    if (injectHarnessToFile) {
      try { injectHarnessToFile(htmlFile); } catch (e) {
        warn(`[visual-review] Harness re-injection failed: ${e.message}`);
      }
    }

    info(`[visual-review] Fix applied (${origSize} → ${fixedSize} bytes)`);
  }

  // Store results in report
  report.visual_review = {
    verdict: lastVerdict,
    issues_count: allIssues.length,
    critical_count: allIssues.filter(i => i.severity === 'critical').length,
    iterations: iteration,
    model,
  };

  return {
    verdict: lastVerdict,
    issues: allIssues,
    iterations: iteration,
  };
}

module.exports = { runVisualReview };
