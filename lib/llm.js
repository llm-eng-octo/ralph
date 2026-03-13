'use strict';

const PROXY_URL = process.env.PROXY_URL || 'http://localhost:8080';
const PROXY_KEY = process.env.PROXY_KEY || 'ralph-pipeline-key';
const LLM_TIMEOUT = parseInt(process.env.RALPH_LLM_TIMEOUT || '300', 10) * 1000;

/**
 * Provider-agnostic LLM call through CLIProxyAPI.
 * Handles both Claude format (.content[0].text) and OpenAI format (.choices[0].message.content).
 *
 * @param {string} stepName - Identifier for logging
 * @param {string} prompt - The prompt to send
 * @param {string} [model] - Model name (routed by proxy to correct provider)
 * @param {object} [options] - Additional options
 * @param {number} [options.maxTokens=16000] - Max output tokens
 * @param {number} [options.timeout] - Timeout in ms
 * @returns {Promise<string>} The LLM response text
 */
async function callLlm(stepName, prompt, model, options = {}) {
  const { maxTokens = 16000, timeout = LLM_TIMEOUT } = options;
  model = model || process.env.RALPH_FIX_MODEL || 'claude-sonnet-4-6';

  console.log(`  [${stepName}] model=${model} ...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${PROXY_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PROXY_KEY,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      console.warn(`  [${stepName}] rate limited — retrying in 30s`);
      await new Promise(r => setTimeout(r, 30000));
      return callLlm(stepName, prompt, model, options);
    }

    if (!res.ok) {
      throw new Error(`Proxy returned HTTP ${res.status}: ${await res.text()}`);
    }

    const body = await res.json();

    // Handle both Claude and OpenAI response formats
    const text =
      body.content?.[0]?.text ||
      body.choices?.[0]?.message?.content ||
      null;

    if (!text) {
      throw new Error('No text content in response');
    }

    console.log(`  ✓ [${stepName}] completed`);
    return text;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { callLlm };
