# Spot the Pairs — Deployment Bundle

This folder is a self-contained deployment bundle prepared by the Alfred pipeline (Step 10).
The actual Core API registration / GCS upload could **not** be performed in the orchestration
session because:

- No `mcp__core_api_*` tools were exposed in this Claude Code session.
- No `CORE_API_URL` / `CORE_API_TOKEN` env vars were set.
- No GCS bucket / project / artifact path was configured locally (GCP ADC alone is insufficient).

Everything below is locally-prepared and ready to be POSTed by hand once Core API access is available.

## What's in this folder

| File | Purpose |
|------|---------|
| `index.html` | Approved game artifact (passed Steps 5–9). |
| `spec.md` | Authoritative spec (read by every Alfred phase). |
| `inputSchema.json` | JSON Schema (draft-07) describing the content shape every content set must satisfy. Derived from `fallbackContent` and verified against it. |
| `content-sets/default.json` | Baseline content (= `fallbackContent` from `index.html`, verbatim). 12 rounds (Sets A/B/C × 4 levels). Make 10 / 20 alternating. **Mandatory** — the primary game link is built on this. |
| `content-sets/easy.json` | Class-1-friendly variant: all 4 levels are Make 10 (no Make 20), distractors are off-by-1 only (no off-by-2). 12 rounds. |
| `content-sets/hard.json` | Class-3 variant: 4 correct pills on every level (denser targets), all distractors off-by-1 (no easy off-by-2 exit). 12 rounds. |
| `content-sets/theme-fruit-baskets.json` | Cosmetic theme variant: same numbers as `default.json`, themed `previewInstruction` ("Fruit Basket Pairs", "Fill the 10 Basket"). No code changes required — only content text. 12 rounds. |
| `register-payload.json` | Skeleton for the `POST /api/games/register` body. Placeholders for `inputSchema` and `artifactContent` are filled in via `jq` at deploy time (see below). |

## Validation status

- `inputSchema.json` was derived from the actual `fallbackContent` literal in `index.html`.
- `fallbackContent` was extracted by JS-eval and validated against `inputSchema.json`: **PASS**.
- All four `content-sets/*.json` were validated against `inputSchema.json`: **PASS**.
- All four content sets also pass the following semantic checks:
  - For every `correctPills[i]`, the corresponding pill's `a + b === targetSum`.
  - Every pill is in `correctPills` XOR has a `misconception_tags[<id>]` entry (partition holds).
  - `answer.correctPills` equals `correctPills` (sorted).
  - `answer.targetSum` equals `targetSum`.

## Deploying when Core API access is available

Set env vars first:

```bash
export CORE_API_URL="https://core.mathai.ai"     # or wherever the Core API lives
export CORE_API_TOKEN="<bearer token>"
```

(In a multi-environment setup these are typically pulled from 1Password / a secrets manager.
Locally, `direnv` + a `.envrc` in the repo root works well — keep `.envrc` in `.gitignore`.)

### 1. Register the game

```bash
cd "$(dirname "$0")"

# Build the full registration body by inlining inputSchema and HTML.
jq -n \
  --slurpfile schema inputSchema.json \
  --rawfile html index.html \
  --argjson skeleton "$(cat register-payload.json)" \
  '$skeleton + { inputSchema: $schema[0], artifactContent: $html } | del(._notes)' \
  > /tmp/spot-the-pairs-register.json

curl -sS -X POST "$CORE_API_URL/api/games/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CORE_API_TOKEN" \
  --data-binary @/tmp/spot-the-pairs-register.json \
  | tee /tmp/spot-the-pairs-register.resp.json

# Capture publishedGameId + artifactUrl
PUBLISHED_GAME_ID=$(jq -r '.data.id' /tmp/spot-the-pairs-register.resp.json)
ARTIFACT_URL=$(jq -r '.data.artifactUrl' /tmp/spot-the-pairs-register.resp.json)
echo "publishedGameId=$PUBLISHED_GAME_ID  artifactUrl=$ARTIFACT_URL"
```

### 2. (Optional) Patch preview audio (TTS)

Per PART-039, deployment is the owner of the build-time `previewAudio` patch. If your TTS
service is wired up:

```bash
# Generate audio from previewAudioText, upload to CDN, capture URL.
PREVIEW_AUDIO_URL="https://cdn.mathai.ai/audio/spot-the-pairs/preview-<hash>.mp3"

# Update each content set in-place so the runtime game_init carries the URL.
for cs in content-sets/*.json; do
  jq --arg url "$PREVIEW_AUDIO_URL" '.previewAudio = $url' "$cs" > "$cs.tmp" && mv "$cs.tmp" "$cs"
done

# Also patch fallbackContent.previewAudio in the HTML (sed/awk over the HTML literal),
# then re-upload index.html to GCS so the standalone-cached artifact carries the URL too.
```

If TTS is not wired up, leave `previewAudio: null` — `PreviewScreen` falls back to runtime
TTS (5-second silent timer if even that fails). The orchestrator currently logs this as a
WARN, not a blocker.

### 3. Upload all four content sets

```bash
upload_content_set() {
  local file="$1"
  local name="$2"
  local difficulty="$3"
  local grade="$4"
  local description="$5"

  jq -n \
    --arg gameId "$PUBLISHED_GAME_ID" \
    --arg name "$name" \
    --arg description "$description" \
    --arg difficulty "$difficulty" \
    --argjson grade "$grade" \
    --slurpfile content "$file" \
    '{
      gameId: $gameId,
      name: $name,
      description: $description,
      grade: $grade,
      difficulty: $difficulty,
      concepts: ["number-bonds-to-10", "number-bonds-to-20", "addition"],
      content: $content[0],
      createdBy: "alfred-pipeline"
    }' > /tmp/cs-payload.json

  curl -sS -X POST "$CORE_API_URL/api/content-sets/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CORE_API_TOKEN" \
    --data-binary @/tmp/cs-payload.json
  echo
}

upload_content_set content-sets/default.json              "Spot the Pairs — Default"        medium 2 "Baseline content (Make 10 / Make 20 alternating, off-by-1 + off-by-2 distractors)."
upload_content_set content-sets/easy.json                 "Spot the Pairs — Easy"           easy   1 "Class 1 variant: Make 10 only, off-by-1 distractors only."
upload_content_set content-sets/hard.json                 "Spot the Pairs — Hard"           hard   3 "Class 3 variant: 4 correct pills per level, all off-by-1 distractors."
upload_content_set content-sets/theme-fruit-baskets.json  "Spot the Pairs — Fruit Baskets"  medium 2 "Fruit-harvest-themed preview text; same math as Default."
```

The Core API is expected to return `{ data: { id: <contentSetId>, isValid: true } }`. If
`isValid` is `false`, read `validationErrors`, fix the offending content set, and re-POST.

### 4. Health check

Once registration returns, navigate to `$ARTIFACT_URL` with Playwright (or just a browser):

- Page returns HTTP 200, non-empty HTML.
- Zero `console.error` / `pageerror` events on load.
- `postMessage({ type: 'game_ready' })` fires within 10 s.
- Viewport is mobile-sized.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` present.
- Start screen renders with title and start CTA.

### 5. Game links

Primary game link (default content set):

```
https://learn.mathai.ai/game/<publishedGameId>/<defaultContentSetId>
```

Plus per-set links for easy / hard / fruit-baskets.

## BLOCKED ON

The following steps cannot be completed inside this orchestration session and require the
Core API + GCS to be accessible from the operator's environment:

1. `POST /api/games/register` — needs `CORE_API_URL` + `CORE_API_TOKEN`.
2. `POST /api/content-sets/create` (×4) — same auth.
3. PART-039 § Audio URL Sources layer 1 TTS preview-audio patch — needs the TTS service URL +
   CDN write credentials. The four content sets currently ship `previewAudio: null`.
4. GCS artifact upload — no bucket / path configured. Currently `artifactContent` is intended
   to be inlined in the registration call (which is the documented path); a separate GCS push
   is only needed if the deployment story changes to pre-uploaded artifacts.
5. Step 5 health check (Playwright MCP against the live `artifactUrl`) — depends on (1).
