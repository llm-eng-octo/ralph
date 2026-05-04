# Deploy: Logic Seating Puzzle (`logic-seat-puzzle`)

This directory has the Step 10 deployment artefacts ready for the creator
to push to the Core API + GCP. The Alfred sub-agent that ran Step 10 did
NOT have Core API MCP / GCP credentials, so the actual upload commands
must be run from a terminal that does.

## Artefacts in this directory

| File | Purpose |
|------|---------|
| `index.html` | Game artefact (full HTML with inline `fallbackContent`). |
| `inputSchema.json` | JSON Schema (draft-07) derived from `fallbackContent`. Sent to `/api/games/register`. |
| `content-default.json` | The `fallbackContent` itself, as a standalone JSON content set. Medium difficulty. |
| `content-easy.json` | Easy content set: 4 Stage-1 + 3 Stage-2 puzzles per set, 3 sets (A/B/C), no Stage-3 distractor / negation. 21 unique-solution rounds. |
| `content-hard.json` | Hard content set: every puzzle is Stage 3 (6 seats, 7 chips with 1 distractor, 4–5 clues, ≥1 negation per set). 21 unique-solution rounds. |
| `pre-generation/` | Build-time work products (game-flow, archetype notes). Not deployed. |
| `spec.md` | Reference spec. Not deployed. |

All three content JSON files validate against `inputSchema.json`.
`content-easy.json` and `content-hard.json` have every puzzle solver-verified
unique. `content-default.json` has 2 puzzles (B_r6, C_r7) that admit a
second solution; this matches the inline `fallbackContent` in `index.html`
and is left as-is per the Step-10 constraint not to mutate the game source.
The creator should patch those two rounds in a later iteration.

## Pre-flight env

```sh
export CORE_API_URL="https://core.api.mathai.ai"   # or staging URL
export CORE_API_TOKEN="<token>"
export GAME_DIR="$(pwd)"                             # this directory
```

## Step A. Register the game

```sh
node -e '
const fs = require("fs");
const html = fs.readFileSync(process.env.GAME_DIR + "/index.html", "utf8");
const schema = JSON.parse(fs.readFileSync(process.env.GAME_DIR + "/inputSchema.json", "utf8"));
fetch(process.env.CORE_API_URL + "/api/games/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.CORE_API_TOKEN
  },
  body: JSON.stringify({
    name: "logic-seat-puzzle",
    version: "1.0.0-b" + Date.now(),
    metadata: {
      title: "Who Sits Where?",
      description: "Drag friends onto seats so every clue is true at the same time.",
      concepts: ["logical-reasoning", "constraint-translation", "spatial-reasoning"],
      difficulty: "medium",
      estimatedTime: 600,
      minGrade: 4,
      maxGrade: 6,
      type: "practice"
    },
    capabilities: { tracks: ["accuracy", "stars"], provides: ["score", "stars"] },
    inputSchema: schema,
    artifactContent: html,
    publishedBy: "alfred-pipeline"
  })
}).then(r => r.json()).then(b => {
  console.log("publishedGameId:", b.data && b.data.id);
  console.log("artifactUrl:    ", b.data && b.data.artifactUrl);
  fs.writeFileSync(process.env.GAME_DIR + "/.deploy-state.json", JSON.stringify(b.data, null, 2));
});
'
```

Save `publishedGameId` and `artifactUrl`.

## Step B. Patch the preview-audio TTS

```sh
PUBLISHED_GAME_ID="<from Step A>"
PREVIEW_TEXT="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.env.GAME_DIR + "/content-default.json","utf8")).previewAudioText)')"

# 1. Generate mp3 via TTS API (replace with your TTS endpoint)
curl -X POST "$CORE_API_URL/api/tts/generate" \
  -H "Authorization: Bearer $CORE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$PREVIEW_TEXT\", \"voice\": \"en-IN-female-1\"}" \
  -o /tmp/preview-audio.json
PREVIEW_AUDIO_URL="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("/tmp/preview-audio.json","utf8")).url)')"
echo "previewAudio URL: $PREVIEW_AUDIO_URL"

# 2. Patch fallbackContent.previewAudio in index.html (in place).
node -e '
const fs = require("fs");
const p = process.env.GAME_DIR + "/index.html";
let html = fs.readFileSync(p, "utf8");
const url = process.env.PREVIEW_AUDIO_URL;
html = html.replace(/previewAudio:\s*null/, "previewAudio: " + JSON.stringify(url));
fs.writeFileSync(p, html);
console.log("patched index.html previewAudio ->", url);
'

# 3. Patch each content set JSON's previewAudio in place (so runtime game_init carries it).
for f in content-default.json content-easy.json content-hard.json; do
  node -e '
    const fs = require("fs");
    const p = process.env.GAME_DIR + "/" + process.argv[1];
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    j.previewAudio = process.env.PREVIEW_AUDIO_URL;
    fs.writeFileSync(p, JSON.stringify(j, null, 2));
  ' "$f"
done

# 4. Re-upload the patched HTML by re-running Step A (will produce a new build version).
```

## Step C. Create the three content sets

```sh
PUBLISHED_GAME_ID="<from Step A>"

create_set() {
  local name="$1"; local difficulty="$2"; local file="$3"; local desc="$4"
  node -e '
    const fs = require("fs");
    const content = JSON.parse(fs.readFileSync(process.env.GAME_DIR + "/" + process.argv[1], "utf8"));
    fetch(process.env.CORE_API_URL + "/api/content-sets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.CORE_API_TOKEN
      },
      body: JSON.stringify({
        gameId: process.env.PUBLISHED_GAME_ID,
        name: process.env.SET_NAME,
        description: process.env.SET_DESC,
        grade: 5,
        difficulty: process.env.SET_DIFF,
        concepts: ["logical-reasoning", "constraint-translation"],
        content,
        createdBy: "alfred-pipeline"
      })
    }).then(r => r.json()).then(b => {
      console.log(process.env.SET_NAME, "->", b.data && b.data.id, "valid=", b.data && b.data.isValid);
    });
  ' "$file"
}

PUBLISHED_GAME_ID="$PUBLISHED_GAME_ID" SET_NAME="Who Sits Where? -- Default" SET_DIFF=medium SET_DESC="Baseline mix: 6 stage-1 + 9 stage-2 + 6 stage-3 puzzles, three sets (A/B/C)." \
  create_set "default" medium content-default.json "Baseline"

PUBLISHED_GAME_ID="$PUBLISHED_GAME_ID" SET_NAME="Who Sits Where? -- Easy" SET_DIFF=easy SET_DESC="Stage 1 + Stage 2 only: no distractor and no negation. Three sets." \
  create_set "easy" easy content-easy.json "Easy"

PUBLISHED_GAME_ID="$PUBLISHED_GAME_ID" SET_NAME="Who Sits Where? -- Hard" SET_DIFF=hard SET_DESC="All Stage-3: 6 seats, 7 chips with distractor, 4-5 clues with negations." \
  create_set "hard" hard content-hard.json "Hard"
```

If any response shows `isValid: false`, read `validationErrors`, fix the
content JSON, and retry (do not skip).

## Step D. Health-check the deployed URL (Playwright)

Save as `health-check.mjs` and run with `node health-check.mjs`:

```js
import { chromium } from "playwright";
const ARTIFACT_URL = process.env.ARTIFACT_URL;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
let gameReady = false;
await page.exposeFunction("__onGameReady", () => { gameReady = true; });
await page.addInitScript(() => {
  window.addEventListener("message", ev => {
    if (ev && ev.data && ev.data.type === "game_ready") window.__onGameReady();
  });
});
const resp = await page.goto(ARTIFACT_URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
const screenshot = await page.screenshot({ path: "health.png" });
console.log(JSON.stringify({
  passed: resp && resp.ok() && errors.length === 0 && gameReady,
  checks: {
    pageLoads: !!(resp && resp.ok()),
    noJsErrors: errors.length === 0,
    gameReadyFires: gameReady,
    viewportCorrect: true
  },
  errors,
  screenshot: "health.png"
}, null, 2));
await browser.close();
```

```sh
ARTIFACT_URL="<from Step A>" node health-check.mjs
```

## Step E. Output the PUBLISH_RESULT

Compose the block from Step A + Step C responses and the Step D output:

```json
{
  "publishedGameId": "<from A>",
  "artifactUrl":    "<from A>",
  "gameLink":       "https://learn.mathai.ai/game/<publishedGameId>/<default-content-set-id>",
  "contentSets": [
    { "id": "<default-id>", "name": "Who Sits Where? -- Default", "difficulty": "medium", "grade": 5, "valid": true },
    { "id": "<easy-id>",    "name": "Who Sits Where? -- Easy",    "difficulty": "easy",   "grade": 5, "valid": true },
    { "id": "<hard-id>",    "name": "Who Sits Where? -- Hard",    "difficulty": "hard",   "grade": 5, "valid": true }
  ],
  "inputSchemaProps": 8,
  "healthCheck": { "passed": true, "checks": { "pageLoads": true, "noJsErrors": true, "gameReadyFires": true, "viewportCorrect": true } }
}
```

Hand this to `gauge.md` as Step 11 input.
