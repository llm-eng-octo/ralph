### PART-030: Sentry Error Tracking
**Purpose:** Production error monitoring via Sentry SDK + SentryConfig package.
**API:** `SentryConfig.dsn`, `SentryConfig.enabled`, `SentryConfig.sampleRate`
**Key rules:**
- SentryConfig + Sentry SDK scripts load FIRST (before FeedbackManager/Components/Helpers)
- Check `SentryConfig.enabled` before calling `Sentry.init()`
- Full script order: SentryConfig -> Sentry SDK -> FeedbackManager -> Components -> Helpers
