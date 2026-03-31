'use strict';

/**
 * Pipeline V2 — Agent SDK session wrapper
 *
 * Creates a logical session per build using the SDK's built-in session
 * resume mechanism. Each pipeline step is a separate query() call that
 * resumes the same session, giving the agent full context across steps:
 *
 *   generate HTML → test → fix → visual review → fix → final review
 *
 * STEP COMPLETION:
 * Each query() call produces an async generator that ends with a `result`
 * message. That message is the ONLY reliable signal that the step is done.
 * No idle timers, no heuristics — just consume the generator until it ends.
 *
 * SESSION CONTINUITY:
 * - Step 1: fresh query() → captures session_id from init/result message
 * - Step 2+: query() with resume: sessionId → agent has full prior context
 */

const config = require('./config');

// Dynamic import for ESM-only SDK
let _sdk;
async function getSDK() {
  if (!_sdk) {
    _sdk = await import('@anthropic-ai/claude-agent-sdk');
  }
  return _sdk;
}
async function getQuery() {
  const sdk = await getSDK();
  return sdk.query;
}

// ─── Session class ──────────────────────────────────────────────────────────

/**
 * A logical session that wraps multiple query() calls sharing one session ID.
 *
 * Usage:
 *   const session = createSession({ gameDir, specPath, ... });
 *   const result1 = await session.send('generate', 'Generate the HTML game');
 *   const result2 = await session.send('test', 'Run Playwright tests');
 *   const summary = session.getSummary();
 */
function createSession({ gameDir, specPath, model, additionalDirectories = [], log, onProgress }) {
  const query_fn_promise = getQuery();
  const logger = log || { info: console.log, warn: console.warn, error: console.error };
  const fs = require('fs');
  const pathMod = require('path');

  const mcpServers = {
    playwright: {
      command: 'npx',
      args: ['@anthropic-ai/mcp-server-playwright'],
    },
  };

  // Base options shared across all query() calls for this session
  const baseOptions = {
    cwd: gameDir,
    model: model || config.GEN_MODEL,
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    persistSession: true, // Required for resume to work
    includePartialMessages: false,
    settingSources: [],   // Don't load user/project settings (avoids pulling in global MCP servers)
    mcpServers,
    ...(additionalDirectories.length ? { additionalDirectories } : {}),
  };

  // State tracking
  let sessionId = null;  // Captured from first query's init/result message
  let totalTurns = 0;
  let totalToolUses = 0;
  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheReadTokens = 0;
  let lastResultMessage = null;
  const toolLog = [];
  const stepResults = []; // { step, turns, toolUses, elapsed }

  // Transcript: append raw SDK messages to JSONL file after each step
  let transcriptPath = null;

  function _appendToTranscript(lines) {
    if (!transcriptPath || lines.length === 0) return;
    try {
      fs.appendFileSync(transcriptPath, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
    } catch (err) {
      logger.warn(`[session] Transcript append failed: ${err.message}`);
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    /**
     * Send a prompt to the agent and wait for it to finish processing.
     * Each send() is a separate query() call. The first creates a fresh
     * session; subsequent calls resume the same session via session ID.
     *
     * @param {string} step - Step name for logging (e.g., 'generate', 'test')
     * @param {string} prompt - The user message
     * @returns {Promise<{ text: string, turns: number, toolUses: number, done: boolean, error?: string }>}
     */
    async send(step, prompt) {
      const query = await query_fn_promise;
      const stepStartTime = Date.now();
      const stepTurnStart = totalTurns;
      const stepToolStart = totalToolUses;
      const turnTexts = [];

      logger.info(`\n${'═'.repeat(70)}`);
      logger.info(`[${step}] Sending prompt (${prompt.length} chars)${sessionId ? ` [resume: ${sessionId.slice(0, 8)}...]` : ' [new session]'}`);
      logger.info(`${'═'.repeat(70)}`);

      if (onProgress) onProgress({ type: 'step-start', step, promptLength: prompt.length });

      // Build options: first call = fresh session, subsequent calls = resume
      const queryOptions = { ...baseOptions };
      if (sessionId) {
        queryOptions.resume = sessionId;
      }

      let stepError = null;
      let sessionEnded = false;
      const stepToolNames = [];  // Track actual tool names used in this step
      const rawMessages = [];    // Capture every raw SDK message for transcript

      // Timeout: if no new messages arrive for this long after receiving a result,
      // assume background subagents are hung and break out of the generator.
      const POST_RESULT_IDLE_MS = 5 * 60 * 1000; // 5 minutes after last result
      const STEP_ABSOLUTE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes absolute max per step
      let firstResultReceivedAt = null;
      let lastActivityAt = Date.now();

      try {
        const sdkStream = query({ prompt, options: queryOptions });

        // Wrap the async iterator with a timeout-aware consumer.
        // If we've received a successful result and the generator goes idle
        // for POST_RESULT_IDLE_MS, we break out (background subagent likely hung).
        const iterator = sdkStream[Symbol.asyncIterator]();
        while (true) {
          // Determine appropriate timeout for the next message
          let timeoutMs;
          if (firstResultReceivedAt) {
            // After receiving first result, use shorter idle timeout
            const sinceResult = Date.now() - firstResultReceivedAt;
            timeoutMs = Math.max(POST_RESULT_IDLE_MS - sinceResult, 1000);
          } else {
            // Before any result, use absolute step timeout
            const sinceStart = Date.now() - stepStartTime;
            timeoutMs = Math.max(STEP_ABSOLUTE_TIMEOUT_MS - sinceStart, 1000);
          }

          // Race: next message vs timeout
          const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => resolve({ done: true, value: undefined, _timedOut: true }), timeoutMs)
          );
          const nextPromise = iterator.next();

          const result = await Promise.race([nextPromise, timeoutPromise]);

          if (result._timedOut) {
            if (firstResultReceivedAt) {
              logger.warn(`[${step}] ⏰ Post-result idle timeout (${(POST_RESULT_IDLE_MS / 1000)}s) — likely a hung background subagent. Breaking out with results collected so far.`);
            } else {
              logger.error(`[${step}] ⏰ Absolute step timeout (${(STEP_ABSOLUTE_TIMEOUT_MS / 60000)}min) reached without any result message.`);
              stepError = `Step timed out after ${(STEP_ABSOLUTE_TIMEOUT_MS / 60000)} minutes`;
              sessionEnded = true;
            }
            // Try to return the iterator to allow cleanup
            try { iterator.return?.(); } catch { /* best effort */ }
            break;
          }

          if (result.done) break;

          const message = result.value;
          lastActivityAt = Date.now();

          // Capture raw message for transcript (everything: reasoning, tools, results)
          rawMessages.push({ ...message, _step: step, _ts: Date.now() });

          switch (message.type) {
            case 'system': {
              if (message.subtype === 'init') {
                // Capture session ID from the first init message
                if (message.session_id) {
                  sessionId = message.session_id;
                  logger.info(`[${step}] Session: ${sessionId.slice(0, 8)}...`);
                }
                logger.info(`[${step}] Init: model=${message.model}, tools=${message.tools?.length || 0}, mcp=${message.mcp_servers?.map((s) => s.name).join(', ') || 'none'}`);
                if (onProgress) onProgress({ type: 'init', step, model: message.model, tools: message.tools, mcpServers: message.mcp_servers });
              }
              break;
            }

            case 'assistant': {
              totalTurns++;
              const content = message.message?.content || [];

              // Text
              const textBlocks = content.filter((b) => b.type === 'text');
              const text = textBlocks.map((b) => b.text).join('\n');
              if (text) {
                const preview = text.replace(/\n/g, ' ').slice(0, 250);
                logger.info(`[${step}] Turn ${totalTurns}: ${preview}${text.length > 250 ? '...' : ''}`);
                turnTexts.push(text);
              }

              // Tool uses
              const toolBlocks = content.filter((b) => b.type === 'tool_use');
              for (const t of toolBlocks) {
                totalToolUses++;
                const inputSummary = _formatToolInput(t.name, t.input);
                logger.info(`[${step}]   🔧 ${t.name} ${inputSummary}`);
                toolLog.push({ name: t.name, input: inputSummary, turn: totalTurns, step });
                stepToolNames.push(t.name);
              }

              // Tool errors
              const toolResults = content.filter((b) => b.type === 'tool_result');
              for (const tr of toolResults) {
                if (tr.is_error) {
                  const errText = typeof tr.content === 'string' ? tr.content : JSON.stringify(tr.content);
                  logger.warn(`[${step}]   ✗ Tool failed: ${errText.slice(0, 200)}`);
                }
              }

              if (onProgress) onProgress({ type: 'turn', step, turn: totalTurns, toolUses: totalToolUses });
              break;
            }

            case 'tool_progress': {
              logger.info(`[${step}]   ⏳ ${message.tool_name} (${message.elapsed_time_seconds?.toFixed(0)}s)`);
              break;
            }

            case 'result': {
              // This is THE completion signal — the step is done
              lastResultMessage = message;
              totalCost += message.total_cost_usd || 0;
              totalInputTokens += message.usage?.input_tokens || 0;
              totalOutputTokens += message.usage?.output_tokens || 0;
              totalCacheReadTokens += message.usage?.cache_read_input_tokens || 0;

              // Capture session ID if we didn't get it from init
              if (message.session_id && !sessionId) {
                sessionId = message.session_id;
              }

              const status = message.subtype === 'success' ? '✅' : '❌';
              logger.info(`[${step}] ${status} Step result: ${message.subtype} | $${totalCost.toFixed(4)}`);

              if (message.subtype !== 'success') {
                stepError = `Step ended with: ${message.subtype}`;
                sessionEnded = true;
              }

              // Track when we got the first result — start idle timer for background subagents
              if (!firstResultReceivedAt) {
                firstResultReceivedAt = Date.now();
              }
              break;
            }

            default:
              break;
          }
        }
      } catch (err) {
        logger.error(`[${step}] Stream error: ${err.message}`);
        stepError = err.message;
        sessionEnded = true;
      }

      // Record step results
      const stepTurns = totalTurns - stepTurnStart;
      const stepTools = totalToolUses - stepToolStart;
      const elapsed = ((Date.now() - stepStartTime) / 1000).toFixed(1);

      stepResults.push({ step, turns: stepTurns, toolUses: stepTools, elapsed });

      // Flush raw messages to transcript JSONL after each step
      if (transcriptPath) {
        // Write step separator + all raw messages
        const stepHeader = {
          _type: 'step-boundary', step, turns: stepTurns, toolUses: stepTools,
          elapsed, totalTurns, totalToolUses, totalCost, sessionId, _ts: Date.now(),
        };
        _appendToTranscript([stepHeader, ...rawMessages]);
        logger.info(`[${step}] Transcript: ${rawMessages.length} messages appended to ${pathMod.basename(transcriptPath)}`);
      }

      logger.info(`[${step}] Step done: ${stepTurns} turns, ${stepTools} tools, ${elapsed}s`);
      if (onProgress) onProgress({ type: 'step-done', step, turns: stepTurns, toolUses: stepTools, elapsed });

      // Deduplicate tool names preserving order of first use
      const uniqueToolNames = [...new Set(stepToolNames)];

      return {
        text: turnTexts.join('\n') || '',
        turns: stepTurns,
        toolUses: stepTools,
        toolNames: uniqueToolNames,
        done: sessionEnded,
        error: stepError || null,
      };
    },

    /** End the session gracefully (no-op since each step is a self-contained query) */
    async close() {
      // Nothing to close — each query() call is self-contained.
      // The session persists on disk and can be resumed later if needed.
      logger.info(`[session] Closed. Total: ${totalTurns} turns, ${totalToolUses} tools, $${totalCost.toFixed(4)}`);
    },

    /**
     * Enable incremental transcript saving. Call BEFORE the first send().
     * Each step's raw SDK messages (reasoning, tool calls, tool results,
     * system messages, costs — everything) are appended to this JSONL file
     * as soon as the step completes.
     *
     * @param {string} outputPath - Absolute path for the output JSONL file
     */
    setTranscriptPath(outputPath) {
      transcriptPath = outputPath;
      // Write header line with session metadata
      const header = {
        _type: 'session-start', gameDir, model: model || config.GEN_MODEL,
        _ts: Date.now(), _version: 'pipeline-v2',
      };
      try {
        fs.writeFileSync(transcriptPath, JSON.stringify(header) + '\n');
        logger.info(`[session] Transcript file: ${outputPath}`);
      } catch (err) {
        logger.warn(`[session] Could not create transcript file: ${err.message}`);
        transcriptPath = null;
      }
    },

    /** Get the transcript file path (if set) */
    getTranscriptPath() {
      return transcriptPath;
    },

    /** Get cumulative session stats */
    getSummary() {
      return {
        sessionId,
        totalTurns,
        totalToolUses,
        totalCost,
        steps: [...stepResults],
        toolLog: [...toolLog],
        status: lastResultMessage?.subtype || 'running',
        usage: {
          input: totalInputTokens,
          output: totalOutputTokens,
          cacheRead: totalCacheReadTokens,
        },
      };
    },
  };
}

// ─── Tool input formatter ────────────────────────────────────────────────────

function _formatToolInput(name, input) {
  if (!input) return '';
  switch (name) {
    case 'Write': return `path=${input.file_path || '?'} (${(input.content || '').length} chars)`;
    case 'Edit': return `path=${input.file_path || '?'} Δ${(input.old_string || '').length}→${(input.new_string || '').length}`;
    case 'Read': return `path=${input.file_path || '?'}`;
    case 'Bash': return `$ ${(input.command || '').replace(/\n/g, ' ').slice(0, 120)}`;
    case 'Glob': return `${input.pattern || '?'}`;
    case 'Grep': return `/${input.pattern || '?'}/`;
    default: {
      const s = JSON.stringify(input);
      return s.length > 120 ? s.slice(0, 120) + '...' : s;
    }
  }
}

module.exports = { createSession };
