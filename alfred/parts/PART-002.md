### PART-002: Package Scripts
**Purpose:** CDN script tags for game framework packages.
**URLs (exact, never invent):**
1. `SentryConfig` — `https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js`
2. `FeedbackManager` — `https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js`
3. `Components` — `https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js`
4. `Helpers` — `https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js`
**Key rules:**
- Load order is non-negotiable: Sentry -> FeedbackManager -> Components -> Helpers
- FeedbackManager loads SubtitleComponent; if Components loads first, duplicate registration error
