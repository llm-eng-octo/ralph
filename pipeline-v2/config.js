'use strict';

/**
 * Pipeline V2 — Configuration
 *
 * All env vars with sensible defaults. No external proxy needed —
 * Agent SDK uses Claude Code's built-in auth.
 */

const path = require('path');

module.exports = Object.freeze({
  // ── Models ──────────────────────────────────────────────────────────────────
  GEN_MODEL: process.env.RALPH_V2_GEN_MODEL || 'claude-opus-4-6',
  REVIEW_MODEL: process.env.RALPH_V2_REVIEW_MODEL || 'claude-opus-4-6',

  // ── Paths ───────────────────────────────────────────────────────────────────
  DATA_DIR: process.env.RALPH_V2_DATA_DIR || path.join(__dirname, '..', 'data'),
  WAREHOUSE_DIR: process.env.RALPH_V2_WAREHOUSE_DIR || path.join(__dirname, '..', 'data', 'games'),

  // ── Server ──────────────────────────────────────────────────────────────────
  PORT: parseInt(process.env.RALPH_V2_PORT || '3001', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // ── Slack ───────────────────────────────────────────────────────────────────
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID || '',

  // ── Concurrency ─────────────────────────────────────────────────────────────
  CONCURRENCY: parseInt(process.env.RALPH_V2_CONCURRENCY || '2', 10),

  // ── Mobile viewport ─────────────────────────────────────────────────────────
  VIEWPORT: { width: 375, height: 667 },
});
