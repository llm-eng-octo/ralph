### PART-032: AnalyticsManager
**Purpose:** Unified analytics to Mixpanel, Amplitude, and CleverTap.
**Condition:** Game requires multi-platform analytics.
**API:** `new AnalyticsManager(window.AnalyticsConfig)` -> `.track(eventName, properties)`
**Key rules:**
- Requires TWO extra script tags: `helpers/analytics/config.js` THEN `helpers/analytics/index.js`
- NOT part of Helpers bundle — separate package
- `config.js` MUST load before `index.js`
- Add `AnalyticsManager` to `waitForPackages()` checks
