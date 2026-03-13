#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// validate-static.js — Static HTML validation layer (T1)
//
// Deterministic checks against generated HTML before running Playwright.
// Catches ~40% of failures in <1 second.
//
// Usage: node validate-static.js <path-to-index.html>
// Exit 0 = pass, Exit 1 = failures found (printed to stdout)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

const fs = require('fs');
const path = require('path');

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Usage: node validate-static.js <path-to-index.html>');
  process.exit(2);
}

if (!fs.existsSync(htmlPath)) {
  console.error(`File not found: ${htmlPath}`);
  process.exit(2);
}

const html = fs.readFileSync(htmlPath, 'utf-8');
const errors = [];
const warnings = [];

// ─── Helper: check if pattern exists in HTML ────────────────────────────────
function requirePattern(pattern, description) {
  if (typeof pattern === 'string') {
    if (!html.includes(pattern)) {
      errors.push(`MISSING: ${description}`);
    }
  } else {
    if (!pattern.test(html)) {
      errors.push(`MISSING: ${description}`);
    }
  }
}

function forbidPattern(pattern, description) {
  if (typeof pattern === 'string') {
    if (html.includes(pattern)) {
      errors.push(`FORBIDDEN: ${description}`);
    }
  } else {
    if (pattern.test(html)) {
      errors.push(`FORBIDDEN: ${description}`);
    }
  }
}

// ─── 1. Basic HTML structure ────────────────────────────────────────────────
requirePattern('<!DOCTYPE html>', 'DOCTYPE declaration');
requirePattern('<html', 'HTML root element');
requirePattern('<head', 'HEAD element');
requirePattern('<body', 'BODY element');

// ─── 2. Required DOM containers ─────────────────────────────────────────────
requirePattern('gameContent', '#gameContent container (id or reference)');
requirePattern('gameArea', '#gameArea container (id or reference)');

// ─── 3. Required global functions ───────────────────────────────────────────
requirePattern(/function\s+initGame\s*\(/, 'initGame() function declaration');

// checkAnswer might be named differently, check common patterns
const hasCheckAnswer = /function\s+checkAnswer\s*\(/.test(html);
const hasHandleClick = /function\s+handleClick\s*\(/.test(html);
const hasHandleAnswer = /function\s+handleAnswer\s*\(/.test(html);
const hasHandleSubmit = /function\s+handleSubmit\s*\(/.test(html);
if (!hasCheckAnswer && !hasHandleClick && !hasHandleAnswer && !hasHandleSubmit) {
  warnings.push('WARNING: No checkAnswer/handleClick/handleAnswer/handleSubmit function found');
}

requirePattern(/function\s+endGame\s*\(/, 'endGame() function declaration');

// ─── 4. Single-file constraint ──────────────────────────────────────────────
requirePattern('<style', 'CSS <style> block (single-file constraint)');
requirePattern('<script', 'JavaScript <script> block (single-file constraint)');

// Check for external resource references (forbidden in single-file games)
const externalLinkPattern = /<link[^>]+href\s*=\s*["'][^"']*\.css["']/i;
const externalScriptPattern = /<script[^>]+src\s*=\s*["'][^"']*\.js["']/i;
if (externalLinkPattern.test(html)) {
  errors.push('FORBIDDEN: External CSS link (must be single-file, use <style>)');
}
if (externalScriptPattern.test(html)) {
  errors.push('FORBIDDEN: External JS script (must be single-file, use <script>)');
}

// ─── 5. Forbidden patterns ──────────────────────────────────────────────────
forbidPattern('document.write', 'document.write() usage');
// Inline event handlers (onclick= in HTML attributes, not in JS strings)
const inlineHandlerPattern = /<[^>]+\s+on(?:click|load|error|submit|change|input|keydown|keyup|mousedown|mouseup)\s*=/i;
if (inlineHandlerPattern.test(html)) {
  warnings.push('WARNING: Inline event handler found in HTML (prefer addEventListener)');
}

// ─── 6. postMessage communication ───────────────────────────────────────────
requirePattern('postMessage', 'postMessage for parent frame communication');

// ─── 7. Game state initialization ───────────────────────────────────────────
const hasGameState = /gameState\s*=\s*\{/.test(html) || /let\s+gameState/.test(html) || /var\s+gameState/.test(html) || /const\s+gameState/.test(html);
if (!hasGameState) {
  warnings.push('WARNING: No gameState object initialization found');
}

// ─── 8. Star thresholds ─────────────────────────────────────────────────────
// Check that star calculation references reasonable thresholds
const has80 = html.includes('0.8') || html.includes('80');
const has50 = html.includes('0.5') || html.includes('50');
if (!has80 || !has50) {
  warnings.push('WARNING: Star thresholds (80%/50%) not clearly visible in code');
}

// ─── 9. Responsive layout ───────────────────────────────────────────────────
const has480 = html.includes('480px') || html.includes('480');
const hasMaxWidth = /max-width/i.test(html);
if (!has480 && !hasMaxWidth) {
  warnings.push('WARNING: No 480px max-width constraint found');
}

// ─── 10. File size sanity ───────────────────────────────────────────────────
if (html.length < 1000) {
  errors.push(`FILE TOO SMALL: ${html.length} characters — likely incomplete generation`);
}
if (html.length > 500000) {
  warnings.push(`WARNING: File very large (${html.length} characters) — may have issues`);
}

// ─── Output results ─────────────────────────────────────────────────────────
if (warnings.length > 0) {
  warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
  console.log(`\nSTATIC VALIDATION FAILED — ${errors.length} error(s):`);
  errors.forEach(e => console.log(`  ✗ ${e}`));
  process.exit(1);
} else {
  console.log(`Static validation passed (${warnings.length} warning(s))`);
  process.exit(0);
}
