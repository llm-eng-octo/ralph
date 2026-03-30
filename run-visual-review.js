#!/usr/bin/env node
'use strict';

// Load .env (same pattern as worker.js / server.js)
try { require('dotenv').config({ path: require('path').join(__dirname, '.env') }); } catch { /* dotenv optional */ }

// ─────────────────────────────────────────────────────────────────────────────
// run-visual-review.js — Standalone runner for Step 3.5 (Visual UI/UX Review)
//
// Usage:
//   node run-visual-review.js <html-file> <spec-file> [--model <model>] [--dry-run]
//
// Example:
//   node run-visual-review.js \
//     data/games/matching-doubles/builds/30/index.html \
//     games/matching-doubles/spec.md \
//     --model claude-sonnet-4-6
//
// This script wires up the real runVisualReview() from pipeline-visual-review.js
// with a real trackedLlmCall backed by the CLIProxyAPI (same as ralph pipeline).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// ─── Parse CLI args ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node run-visual-review.js <html-file> <spec-file> [options]

Options:
  --model <model>   LLM model to use (default: claude-sonnet-4-6)
  --dry-run         Only generate + run screenshot tests, skip LLM review/fix
  --no-fix          Run review but don't attempt to fix issues
  --game-id <id>    Game identifier (default: derived from directory name)
  --verbose         Show full LLM prompts/responses

Example:
  node run-visual-review.js \\
    data/games/matching-doubles/builds/30/index.html \\
    games/matching-doubles/spec.md
`);
  process.exit(0);
}

const htmlFile = path.resolve(args[0]);
const specFile = path.resolve(args[1]);

if (!fs.existsSync(htmlFile)) {
  console.error(`Error: HTML file not found: ${htmlFile}`);
  process.exit(1);
}
if (!fs.existsSync(specFile)) {
  console.error(`Error: Spec file not found: ${specFile}`);
  process.exit(1);
}

const MODEL = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'claude-sonnet-4-6';
const DRY_RUN = args.includes('--dry-run');
const NO_FIX = args.includes('--no-fix');
const VERBOSE = args.includes('--verbose');
const GAME_ID = args.includes('--game-id')
  ? args[args.indexOf('--game-id') + 1]
  : path.basename(path.dirname(path.dirname(htmlFile)));

const gameDir = path.dirname(htmlFile);
const specContent = fs.readFileSync(specFile, 'utf-8');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('  Step 3.5: Visual UI/UX Review — Standalone Runner');
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`  HTML:     ${htmlFile}`);
console.log(`  Spec:     ${specFile}`);
console.log(`  Game dir: ${gameDir}`);
console.log(`  Game ID:  ${GAME_ID}`);
console.log(`  Model:    ${MODEL}`);
console.log(`  Dry run:  ${DRY_RUN}`);
console.log(`  No fix:   ${NO_FIX}`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// ─── Import pipeline modules ────────────────────────────────────────────────

const { runVisualReview } = require('./lib/pipeline-visual-review');
const { extractSpecMetadata, injectTestHarness, buildPlaywrightConfig, findFreePort } = require('./lib/pipeline-utils');
const { callLlm } = require('./lib/llm');

// ─── Extract spec metadata ──────────────────────────────────────────────────

const specMeta = extractSpecMetadata(specContent);
console.log(`[spec-metadata] interactionType=${specMeta.interactionType}, totalRounds=${specMeta.totalRounds}, totalLives=${specMeta.totalLives}, starType=${specMeta.starType}`);

// ─── Ensure playwright.config.js exists ─────────────────────────────────────

async function ensurePlaywrightConfig() {
  const configPath = path.join(gameDir, 'playwright.config.js');
  if (!fs.existsSync(configPath)) {
    const port = await findFreePort();
    const config = buildPlaywrightConfig(port);
    fs.writeFileSync(configPath, config);
    console.log(`[setup] Created playwright.config.js (port ${port})`);
  } else {
    console.log(`[setup] playwright.config.js already exists`);
  }
}

// ─── Ensure tests/ directory exists ─────────────────────────────────────────

function ensureTestsDir() {
  const testsDir = path.join(gameDir, 'tests');
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
    console.log(`[setup] Created tests/ directory`);
  }
}

// ─── Inject test harness into HTML ──────────────────────────────────────────

function injectHarnessToFile(filePath) {
  try {
    const original = fs.readFileSync(filePath, 'utf-8');
    const patched = injectTestHarness(original, specMeta);
    if (patched !== original) {
      fs.writeFileSync(filePath, patched);
      console.log(`[setup] Test harness injected into ${path.basename(filePath)}`);
    } else {
      console.log(`[setup] Test harness already present in ${path.basename(filePath)}`);
    }
  } catch (e) {
    console.warn(`[setup] Harness injection failed: ${e.message}`);
  }
}

// ─── Extract HTML from LLM response ────────────────────────────────────────

function extractHtml(output) {
  let match = output.match(/```html\n([\s\S]*?)\n```/);
  if (match) return match[1];
  match = output.match(/```\n([\s\S]*?)\n```/);
  if (match && /<!DOCTYPE|<html|<head|<body/.test(match[1])) return match[1];
  const htmlStart = output.search(/<!DOCTYPE html|<html/i);
  if (htmlStart !== -1) return output.slice(htmlStart);
  return null;
}

// ─── trackedLlmCall — wraps callLlm with logging + cost tracking ────────────

const report = {
  llm_calls: [],
  total_cost_usd: 0,
  errors: [],
};

let callCount = 0;

async function trackedLlmCall(stepName, prompt, model, options = {}, _report = null) {
  callCount++;
  const callNum = callCount;
  const start = Date.now();

  // Summarize prompt for logging
  const promptSummary = typeof prompt === 'string'
    ? `${prompt.length} chars`
    : Array.isArray(prompt)
      ? `${prompt.length} content blocks (${prompt.filter(b => b.type === 'image').length} images)`
      : 'object';

  console.log(`\n  ┌─ LLM Call #${callNum}: ${stepName}`);
  console.log(`  │  Model: ${model}`);
  console.log(`  │  Prompt: ${promptSummary}`);
  console.log(`  │  Max tokens: ${options.maxTokens || 'default'}`);

  if (DRY_RUN) {
    console.log(`  │  ⏭️  DRY RUN — skipping LLM call`);
    console.log(`  └─ (skipped)\n`);

    // Return appropriate dry-run responses based on step
    if (stepName.startsWith('visual-screenshot-testgen')) {
      return getDryRunTestBlocks();
    }
    if (stepName.startsWith('visual-screenshot-validate')) {
      return 'VERDICT: SCREENSHOTS_VALID';
    }
    if (stepName.startsWith('visual-review')) {
      return 'VERDICT: APPROVED';
    }
    if (stepName.startsWith('visual-fix')) {
      return '```html\n' + fs.readFileSync(htmlFile, 'utf-8') + '\n```';
    }
    return 'DRY_RUN_RESPONSE';
  }

  if (VERBOSE && typeof prompt === 'string') {
    console.log(`  │  ── Prompt (first 500 chars) ──`);
    console.log(`  │  ${prompt.slice(0, 500).replace(/\n/g, '\n  │  ')}`);
  }

  try {
    const result = await callLlm(stepName, prompt, model, options);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`  │  ✅ Completed in ${elapsed}s`);
    console.log(`  │  Response: ${result.length} chars`);

    if (VERBOSE) {
      console.log(`  │  ── Response (first 500 chars) ──`);
      console.log(`  │  ${result.slice(0, 500).replace(/\n/g, '\n  │  ')}`);
    }

    console.log(`  └─\n`);

    report.llm_calls.push({
      step: stepName,
      model,
      elapsed_s: parseFloat(elapsed),
      prompt_size: typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length,
      response_size: result.length,
    });

    return result;
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  │  ❌ Failed after ${elapsed}s: ${err.message}`);
    console.log(`  └─\n`);
    report.errors.push(`${stepName}: ${err.message}`);
    throw err;
  }
}

// ─── Dry-run fallback test blocks ───────────────────────────────────────────
// When --dry-run is used, we return minimal test blocks so Playwright still runs.

function getDryRunTestBlocks() {
  const totalRounds = specMeta.totalRounds || 9;
  return `\`\`\`javascript
test('screenshot 01 — start screen', async ({ page }) => {
  setupPage(page);
  await page.goto('/');
  await waitForReady(page);
  await saveScreenshot(page, '01-start-screen');
});

test('screenshot 02 — gameplay round 1 clean', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  await saveScreenshot(page, '02-gameplay-round1-clean');
  const overflow = await checkViewportOverflow(page);
  saveViewportMeta('viewport-round1', overflow);
});

test('screenshot 03 — correct answer feedback', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  await tryInteraction(page, true);
  await saveScreenshot(page, '03-correct-feedback');
});

test('screenshot 04 — wrong answer feedback', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  await tryInteraction(page, false);
  await saveScreenshot(page, '04-wrong-feedback');
});

test('screenshot 05 — later round', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  const targetRound = Math.max(2, Math.floor(${totalRounds} * 0.7));
  await page.evaluate((r) => window.__ralph?.jumpToRound?.(r), targetRound);
  await page.waitForTimeout(1000);
  await dismissPopups(page);
  await clickThroughTransitions(page);
  await waitForPlaying(page, 8000);
  await saveScreenshot(page, '05-gameplay-later-round');
  const overflow = await checkViewportOverflow(page);
  saveViewportMeta('viewport-later-round', overflow);
});

test('screenshot 06 — victory results', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  await page.evaluate(() => {
    if (window.__ralph?.endGame) window.__ralph.endGame('victory');
    else if (window.endGame) window.endGame('victory');
  });
  await page.evaluate(() => window.__ralph?.syncDOMState?.());
  await page.waitForTimeout(1500);
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const btn = page.locator('#mathai-transition-slot button').first();
    const hasBtn = await btn.isVisible({ timeout: 500 }).catch(() => false);
    if (!hasBtn) break;
    const btnText = await btn.textContent().catch(() => '');
    if (/play again|restart|try again/i.test(btnText)) break;
    await safeClick(page, btn);
    await page.waitForTimeout(500);
  }
  await saveScreenshot(page, '06-victory-results');
});

test('screenshot 07 — game over', async ({ page }) => {
  setupPage(page);
  await navigateToGameplay(page);
  await page.evaluate(() => {
    if (window.__ralph?.endGame) window.__ralph.endGame('game_over');
    else if (window.endGame) window.endGame('game_over');
  });
  await page.evaluate(() => window.__ralph?.syncDOMState?.());
  await page.waitForTimeout(1500);
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const btn = page.locator('#mathai-transition-slot button').first();
    const hasBtn = await btn.isVisible({ timeout: 500 }).catch(() => false);
    if (!hasBtn) break;
    const btnText = await btn.textContent().catch(() => '');
    if (/play again|restart|try again/i.test(btnText)) break;
    await safeClick(page, btn);
    await page.waitForTimeout(500);
  }
  await saveScreenshot(page, '07-gameover');
});

test('screenshot 08 — responsive large phone', async ({ page }) => {
  setupPage(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await navigateToGameplay(page);
  await saveScreenshot(page, '08-responsive-large-phone');
  const overflow = await checkViewportOverflow(page);
  saveViewportMeta('viewport-large-phone', overflow);
});
\`\`\``;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  // Setup
  ensureTestsDir();
  await ensurePlaywrightConfig();
  injectHarnessToFile(htmlFile);

  // Override MAX_VISUAL_FIX_ITERATIONS if --no-fix
  let opts = {
    gameDir,
    htmlFile,
    specContent,
    specMetadata: specMeta,
    trackedLlmCall,
    model: MODEL,
    info: (msg) => console.log(msg),
    warn: (msg) => console.warn(`⚠️  ${msg}`),
    progress: (step, data) => console.log(`  [progress] ${step} ${JSON.stringify(data)}`),
    report,
    extractHtml,
    injectHarnessToFile,
    gameId: GAME_ID,
  };

  // Run the full Step 3.5
  let result;
  try {
    result = await runVisualReview(opts);
  } catch (err) {
    console.error(`\n❌ Visual review failed: ${err.message}`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }

  // ─── Summary ────────────────────────────────────────────────────────────

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const screenshotDir = path.join(gameDir, 'visual-screenshots');
  const screenshotCount = fs.existsSync(screenshotDir)
    ? fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png')).length
    : 0;

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Verdict:      ${result.verdict}`);
  console.log(`  Issues:       ${result.issues.length} (${result.issues.filter(i => i.severity === 'critical').length} critical)`);
  console.log(`  Fix iters:    ${result.iterations}`);
  console.log(`  Screenshots:  ${screenshotCount} (in ${screenshotDir})`);
  console.log(`  LLM calls:    ${report.llm_calls.length}`);
  console.log(`  Total time:   ${elapsed}s`);

  if (result.issues.length > 0) {
    console.log('\n  Issues found:');
    for (const issue of result.issues) {
      const icon = issue.severity === 'critical' ? '🔴' : '⚠️';
      console.log(`    ${icon} [${issue.severity}] ${issue.description}`);
    }
  }

  if (report.llm_calls.length > 0) {
    console.log('\n  LLM call breakdown:');
    for (const call of report.llm_calls) {
      console.log(`    ${call.step}: ${call.elapsed_s}s (model=${call.model}, prompt=${call.prompt_size} chars, response=${call.response_size} chars)`);
    }
  }

  if (report.errors.length > 0) {
    console.log('\n  Errors:');
    for (const err of report.errors) {
      console.log(`    ❌ ${err}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');

  // Exit code reflects verdict
  if (result.verdict === 'NEEDS_FIX') {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
