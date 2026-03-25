#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# test-feedback-step.sh — Run ONLY Step 3b (FeedbackManager verification)
#
# Usage: ./scripts/test-feedback-step.sh <game-dir> [spec-path]
#
# This script tests the feedback verification step in isolation:
#   Part A: Static validation (validate-feedback.js)
#   Part B: LLM-generated Playwright feedback tests + fix loop
#
# Requires: PROXY_URL and PROXY_KEY env vars (or defaults to local proxy)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

GAME_DIR="${1:?Usage: test-feedback-step.sh <game-dir> [spec-path]}"
GAME_DIR="$(cd "$(dirname "$GAME_DIR")" && pwd)/$(basename "$GAME_DIR")"

SPEC_PATH="${2:-}"
if [ -z "$SPEC_PATH" ]; then
  # Try to find spec in common locations
  GAME_ID="$(basename "$GAME_DIR")"
  for candidate in \
    "$GAME_DIR/spec.md" \
    "$GAME_DIR/../spec.md" \
    "$(dirname "$0")/../data/games/$GAME_ID/spec.md"; do
    if [ -f "$candidate" ]; then
      SPEC_PATH="$(cd "$(dirname "$candidate")" && pwd)/$(basename "$candidate")"
      break
    fi
  done
fi

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HTML_FILE="$GAME_DIR/index.html"
FEEDBACK_TEST_FILE="$GAME_DIR/tests/feedback.spec.js"

if [ ! -f "$HTML_FILE" ]; then
  echo "✗ HTML file not found: $HTML_FILE"
  exit 1
fi

mkdir -p "$GAME_DIR/tests"

# ─── Config ────────────────────────────────────────────────────────────────
PROXY_URL="${PROXY_URL:-http://localhost:8317}"
PROXY_KEY="${PROXY_KEY:-ralph-local-dev-key}"
TEST_MODEL="${RALPH_TEST_MODEL:-gemini-2.5-pro}"
FIX_MODEL="${RALPH_FIX_MODEL:-claude-opus-4-6}"
MAX_FEEDBACK_ITERATIONS="${RALPH_MAX_FEEDBACK_ITERATIONS:-3}"
LLM_TIMEOUT="${RALPH_LLM_TIMEOUT:-300}"
TEST_TIMEOUT="${RALPH_TEST_TIMEOUT:-120}"

# ─── Helpers ────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
warn() { echo "[$(date '+%H:%M:%S')] ⚠ $*" >&2; }
err()  { echo "[$(date '+%H:%M:%S')] ✗ $*" >&2; }

LLM_OUTPUT=""
call_llm() {
  local STEP_NAME="$1"
  local PROMPT="$2"
  local MODEL="${3:-$FIX_MODEL}"
  local TIMEOUT="${4:-$LLM_TIMEOUT}"

  log "  [$STEP_NAME] model=$MODEL timeout=${TIMEOUT}s ..."

  local RESPONSE
  RESPONSE=$(timeout "$TIMEOUT" curl -s -w "\n%{http_code}" --max-time "$TIMEOUT" \
    -X POST "$PROXY_URL/v1/messages" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $PROXY_KEY" \
    -d "$(jq -n \
      --arg model "$MODEL" \
      --arg prompt "$PROMPT" \
      '{
        model: $model,
        max_tokens: 128000,
        messages: [{ role: "user", content: $prompt }]
      }')") || {
    err "[$STEP_NAME] failed (exit $?)"
    LLM_OUTPUT=""
    return 1
  }

  local HTTP_CODE
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  local BODY
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -eq 200 ]; then
    LLM_OUTPUT=$(echo "$BODY" | jq -r '.content[0].text // .choices[0].message.content // empty')
    log "  ✓ [$STEP_NAME] completed"
    return 0
  else
    err "[$STEP_NAME] HTTP $HTTP_CODE"
    LLM_OUTPUT=""
    return 1
  fi
}

extract_tests() {
  local OUTPUT="$1"
  local EXTRACTED
  EXTRACTED=$(echo "$OUTPUT" | sed -n '/```javascript/,/```/p' | sed '1d;$d')
  [ -n "$EXTRACTED" ] && { echo "$EXTRACTED"; return 0; }
  EXTRACTED=$(echo "$OUTPUT" | sed -n '/```js/,/```/p' | sed '1d;$d')
  [ -n "$EXTRACTED" ] && { echo "$EXTRACTED"; return 0; }
  EXTRACTED=$(echo "$OUTPUT" | sed -n '/```/,/```/p' | sed '1d;$d')
  [ -n "$EXTRACTED" ] && echo "$EXTRACTED" | grep -q 'test\|expect\|describe' && { echo "$EXTRACTED"; return 0; }
  return 1
}

extract_html() {
  local OUTPUT="$1"
  local EXTRACTED
  EXTRACTED=$(echo "$OUTPUT" | awk '
    /^```html/ { capture=1; current=""; next }
    /^```/ && capture { if (length(current) > length(best)) best=current; capture=0; next }
    capture { current = current (current ? "\n" : "") $0 }
    END { if (capture && length(current) > length(best)) best=current; print best }
  ')
  if [ -n "$EXTRACTED" ] && echo "$EXTRACTED" | grep -q '<!DOCTYPE\|<html\|<head'; then
    echo "$EXTRACTED"
    return 0
  fi
  return 1
}

SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# ═════════════════════════════════════════════════════════════════════════════
log "═══════════════════════════════════════════════════════════"
log "FeedbackManager Verification — Standalone Test"
log "═══════════════════════════════════════════════════════════"
log "Game dir: $GAME_DIR"
log "HTML:     $HTML_FILE"
log "Spec:     ${SPEC_PATH:-<none>}"
log ""

if ! grep -q "FeedbackManager" "$HTML_FILE"; then
  log "Game does not use FeedbackManager — nothing to test"
  exit 0
fi

# ─── Part A: Static feedback validation ──────────────────────────────────────
log "Part A: Static feedback validation"
if [ -f "$SCRIPT_DIR/lib/validate-feedback.js" ]; then
  node "$SCRIPT_DIR/lib/validate-feedback.js" "$HTML_FILE" ${SPEC_PATH:+"$SPEC_PATH"} 2>&1 || true
else
  warn "validate-feedback.js not found at $SCRIPT_DIR/lib/"
fi

log ""

# ─── Part B: Playwright feedback tests ───────────────────────────────────────
log "Part B: Generating feedback-specific Playwright tests"

SPEC_CONTENT=""
[ -n "$SPEC_PATH" ] && [ -f "$SPEC_PATH" ] && SPEC_CONTENT=$(cat "$SPEC_PATH")
HTML_CONTENT=$(cat "$HTML_FILE")

FEEDBACK_TEST_PROMPT="You are an expert Playwright test writer specializing in audio/feedback verification for HTML games.

The game uses a FeedbackManager package that emits console.log events when audio plays, subtitles show, or stickers show:

- \`[FeedbackManager:event] audio_play\` followed by JSON: {id, type: \"sound\"|\"stream\", volume}
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
- Use \`@playwright/test\` imports
- Base URL is http://localhost:8787
- Use \`page.goto('/')\` to load the game
- Wait for game initialization (look for #gameContent or game-ready indicators in the HTML)
- Use the EXACT element selectors from the HTML — do not invent selectors
- Use \`page.waitForTimeout()\` sparingly — prefer \`waitForSelector\` or event-based waits
- For console event capture, collect messages in an array and assert on them after actions
- Skip tests that don't apply (e.g., skip sticker test if no stickers are used in the game)
- Output ONLY the test code wrapped in a \`\`\`javascript code block

SPECIFICATION:
$SPEC_CONTENT

HTML:
$HTML_CONTENT"

if ! call_llm "generate-feedback-tests" "$FEEDBACK_TEST_PROMPT" "$TEST_MODEL"; then
  err "Feedback test generation failed"
  exit 1
fi

EXTRACTED_FEEDBACK_TESTS=$(extract_tests "$LLM_OUTPUT") || {
  err "Could not extract feedback tests from LLM output"
  echo "Raw output (first 500 chars):"
  echo "$LLM_OUTPUT" | head -c 500
  exit 1
}

printf '%s\n' "$EXTRACTED_FEEDBACK_TESTS" > "$FEEDBACK_TEST_FILE"
log "✓ Feedback tests saved to $FEEDBACK_TEST_FILE"

# Copy playwright config if not present
if [ ! -f "$GAME_DIR/playwright.config.js" ] && [ -f "$SCRIPT_DIR/playwright.config.js" ]; then
  cp "$SCRIPT_DIR/playwright.config.js" "$GAME_DIR/playwright.config.js"
fi

# Start server
log "Starting local server on port 8787..."
npx -y serve "$GAME_DIR" -l 8787 -s --no-clipboard 2>/dev/null &
SERVER_PID=$!
sleep 2

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  err "Server failed to start"
  exit 1
fi
log "✓ Server started (PID $SERVER_PID)"

# ─── Feedback test → fix loop ───────────────────────────────────────────────
FEEDBACK_ITERATION=0

while [ "$FEEDBACK_ITERATION" -lt "$MAX_FEEDBACK_ITERATIONS" ]; do
  FEEDBACK_ITERATION=$(( FEEDBACK_ITERATION + 1 ))
  log ""
  log "── Feedback iteration $FEEDBACK_ITERATION / $MAX_FEEDBACK_ITERATIONS ──"

  FEEDBACK_TEST_OUTPUT=""
  FEEDBACK_TEST_EXIT=0
  FEEDBACK_TEST_OUTPUT=$(timeout "$TEST_TIMEOUT" npx playwright test \
    "$FEEDBACK_TEST_FILE" \
    --config "$GAME_DIR/playwright.config.js" \
    --reporter=json 2>&1) || FEEDBACK_TEST_EXIT=$?

  if [ "$FEEDBACK_TEST_EXIT" -eq 124 ]; then
    warn "Playwright timed out after ${TEST_TIMEOUT}s"
    FEEDBACK_TEST_OUTPUT='{"suites":[],"stats":{"expected":0,"unexpected":1,"flaky":0}}'
  fi

  FEEDBACK_PASSED=$(echo "$FEEDBACK_TEST_OUTPUT" | jq -r '.stats.expected // 0' 2>/dev/null || echo "0")
  FEEDBACK_FAILED=$(echo "$FEEDBACK_TEST_OUTPUT" | jq -r '.stats.unexpected // 0' 2>/dev/null || echo "0")
  FEEDBACK_FAILURES_DESC=$(echo "$FEEDBACK_TEST_OUTPUT" | jq -r '[.suites[]?.specs[]? | select(.ok == false) | .title] | join(", ")' 2>/dev/null || echo "unknown")

  log "Results: $FEEDBACK_PASSED passed, $FEEDBACK_FAILED failed"

  if [ "$FEEDBACK_FAILED" -eq 0 ] && [ "$FEEDBACK_PASSED" -gt 0 ]; then
    log "✓ All feedback tests passed!"
    exit 0
  fi

  if [ "$FEEDBACK_ITERATION" -ge "$MAX_FEEDBACK_ITERATIONS" ]; then
    err "Feedback fix loop exhausted — $FEEDBACK_FAILED failure(s) remain"
    log "Failed tests: $FEEDBACK_FAILURES_DESC"
    exit 1
  fi

  log "Attempting feedback fix..."

  FEEDBACK_FIX_PROMPT="The HTML game's FeedbackManager audio/subtitle/sticker integration has test failures.
Fix ONLY the audio/feedback-related code. Do NOT change game logic, layout, or scoring.

FAILING FEEDBACK TESTS:
$FEEDBACK_FAILURES_DESC

TEST OUTPUT (summary):
$(echo "$FEEDBACK_TEST_OUTPUT" | head -80)

CURRENT HTML:
$(cat "$HTML_FILE")

${SPEC_CONTENT:+SPECIFICATION:
$SPEC_CONTENT}

Common fixes needed:
- sound.preload() array missing an audio ID that sound.play() uses
- sound.play() not awaited before screen transition
- FeedbackManager.sound.playDynamicFeedback() should be FeedbackManager.playDynamicFeedback()
- VisibilityTracker using sound.stopAll() instead of sound.pause()/resume()
- Missing await on FeedbackManager.init()

Output the complete fixed HTML wrapped in a \`\`\`html code block."

  call_llm "feedback-fix-$FEEDBACK_ITERATION" "$FEEDBACK_FIX_PROMPT" "$FIX_MODEL" || {
    warn "Feedback fix LLM call failed"
    break
  }

  FIXED_HTML=$(extract_html "$LLM_OUTPUT") || {
    warn "Could not extract HTML from feedback fix output"
    continue
  }

  printf '%s\n' "$FIXED_HTML" > "$HTML_FILE"
  log "✓ HTML updated ($(wc -c < "$HTML_FILE") bytes)"
done
