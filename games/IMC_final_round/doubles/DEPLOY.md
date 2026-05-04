# Deploy: doubles

Local artifacts ready in this folder. The Core API MCP / GCP credentials were not available in the build env, so the human runs the API calls below.

## Files
- `index.html` — game artifact
- `inputSchema.json` — derived from `fallbackContent` (8 top-level + 16 per-round properties)
- `content-set-easy.json` — 45 rounds (sets A/B/C × 15), small N band
- `content-set-hard.json` — 45 rounds (sets A/B/C × 15), large N + cross-decade band
- (default content set = `fallbackContent` already inside `index.html`)

## Order of operations
1. **Register game** (Step 2)
2. **Patch preview audio** (Step 2.5) — must run before content-set creation, see note below
3. **Create default content set** from patched `fallbackContent`
4. **Create EASY + HARD content sets** from the JSON files (after patching their `previewAudio` field too)
5. **Health check** the live URL

## 1. Register game
```bash
curl -X POST "$CORE_API_URL/api/games/register" \
  -H "Authorization: Bearer $CORE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "name": "doubles",
  "version": "1.0.0-b<BUILD_ID>",
  "metadata": {
    "title": "Doubles - Doubling Speed Challenge",
    "description": "Tap the double of N from three pills. 15 rounds, 3 lives, sub-2s avg = 3 stars.",
    "concepts": ["multiplication", "doubling", "2x-table", "fact-fluency", "mental-arithmetic"],
    "difficulty": "medium",
    "estimatedTime": 300,
    "minGrade": 2,
    "maxGrade": 4,
    "type": "practice"
  },
  "capabilities": { "tracks": ["accuracy", "time", "stars"], "provides": ["score", "stars"] },
  "inputSchema": <contents of inputSchema.json>,
  "artifactContent": "<full HTML string from index.html>",
  "publishedBy": "alfred-pipeline"
}
JSON
```
Capture `body.data.id` (publishedGameId) and `body.data.artifactUrl`.

## 2.5. Preview-audio TTS patch (CRITICAL — do before any content-set create)
Per `alfred/skills/deployment/SKILL.md` Step 2.5 / PART-039:
1. Read `previewAudioText` from `fallbackContent` (in `index.html`) — it is the same string for the default set. EASY and HARD have their own `previewAudioText` values; generate a separate mp3 for each.
2. Call TTS, upload mp3 to CDN, get a URL per content set.
3. Patch `fallbackContent.previewAudio` in `index.html` (replace `null` with the default-set URL) and re-upload the HTML to the same GCP path.
4. Patch `previewAudio` in the JSON payload for **each** content set you create below (default uses the patched fallbackContent; EASY/HARD use their own URLs).

If TTS fails, leave `previewAudio: null` and log a WARN — PreviewScreen falls back to runtime TTS, then to a 5s silent timer.

## 3-4. Create content sets
For each of: default (from patched `fallbackContent`), EASY (`content-set-easy.json`), HARD (`content-set-hard.json`):
```bash
curl -X POST "$CORE_API_URL/api/content-sets/create" \
  -H "Authorization: Bearer $CORE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "gameId": "<publishedGameId>",
  "name": "Doubles -- Default",       // or "-- Easy" / "-- Hard"
  "description": "Baseline / Easy band 5-15 / Hard band 18-40 with cross-decade",
  "grade": 3,                           // default=3, easy=2, hard=4
  "difficulty": "medium",               // default=medium, easy=easy, hard=hard
  "concepts": ["multiplication", "doubling", "2x-table"],
  "content": <contents of patched fallbackContent | content-set-easy.json | content-set-hard.json>,
  "createdBy": "alfred-pipeline"
}
JSON
```
Verify `body.data.isValid === true`. Capture each `body.data.id`.

## 5. Health check (Playwright)
Navigate to `artifactUrl` and verify all five:
1. **Page loads** — HTTP 200, non-empty HTML.
2. **No JS errors** — zero `console.error` / `pageerror` during load.
3. **`game_ready` fires within 10 s** — `postMessage({type:'game_ready'})` observed.
4. **Viewport correct** — `<meta name="viewport" content="width=device-width, initial-scale=1">` present, renders at 375×667.
5. **CDN packages load** — no "Packages failed to load", no white screen after 5 s.

## Output
```
PUBLISH_RESULT:
{
  "publishedGameId": "<id>",
  "artifactUrl": "<cdn>",
  "gameLink": "https://learn.mathai.ai/game/<publishedGameId>/<defaultContentSetId>",
  "contentSets": [
    {"id":"<default>", "name":"Doubles -- Default", "difficulty":"medium", "grade":3, "valid":true},
    {"id":"<easy>",    "name":"Doubles -- Easy",    "difficulty":"easy",   "grade":2, "valid":true},
    {"id":"<hard>",    "name":"Doubles -- Hard",    "difficulty":"hard",   "grade":4, "valid":true}
  ],
  "inputSchemaProps": 8,
  "healthCheck": {"passed": true, "checks": {...}}
}
```
