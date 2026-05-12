# Feedback Validator Map

Use this file only when a build/review failure cites a validator ID or when checking docs drift against `alfred/scripts/validate-static.js`.

| Rule id | What it checks | Status |
|---|---|---|
| `GEN-FEEDBACK-TTS-AWAIT` | Submit-handler `playDynamicFeedback(...)` is awaited, not fire-and-forget | LIVE |
| `GEN-FEEDBACK-RUN-SEQUENCE` | 2+ awaited audio calls in one body use `FeedbackManager.runSequence`; bans `audioStopped` | LIVE |
| `GEN-FEEDBACK-SUBTITLE-LINKED-TO-AUDIO` | `subtitle` is paired with the same round-authored content as `audio_content` | LIVE |
| `GEN-FEEDBACK-ORDER` | Lifecycle side-effects occur after awaited TTS | LIVE |
| `GEN-FEEDBACK-CUSTOM-DIALOGUE` | No bespoke fail-dialogue UI competing with TransitionScreen | LIVE |
| `GEN-CUSTOM-SUBTITLE-RENDER` | No custom subtitle DOM competing with FeedbackManager | LIVE |
| `GEN-INLINE-CTA-WITH-FLOATING-BUTTON` | No inline advance button when FloatingButton is mounted | LIVE |
| `GEN-SOUND-ID-CANONICAL` | Sound IDs match canonical table or creator `creatorSounds` | LIVE |
| `GEN-ENDGAME-AFTER-TTS` | No split standalone `runFeedbackSequence` / `finalizeAfterDwell` flow | LIVE |
| `GEN-ROUND-BOUNDARY-STOP` | Round boundary handlers stop sound + stream before mutation | LIVE |
| `GEN-TS-AUDIO-AWAITED` / `GEN-TS-TTS-MISSING` | Transition-screen SFX and VO/TTS are both present and awaited in order | LIVE |
| `GEN-LASTLIFE-FEEDBACK` | Wrong-answer SFX plays before game-over screen | LIVE |
| `GEN-ANSWER-COMPONENT-SHOW-AFTER-FEEDBACK` | Answer-review carousel appears after prior feedback finishes | LIVE |
| `GEN-PHASE-SEQUENCE` | Cleanup / phase assignment / `syncDOMState()` ordering | LIVE |
| `GEN-DOM-CACHE` | No stale DOM re-query pattern for cached nodes | LIVE |
| `5e0-FEEDBACK-RACE-FORBIDDEN` | No `Promise.race` around FeedbackManager calls | LIVE |
| `5e0-FEEDBACK-MIN-DURATION` | Retired; direct `sound.play` await is canonical | RETIRED 2026-05 |
| `5e0-CLEANUP-BETWEEN-ROUNDS` | Round/end/restart cleanup happens before state mutation | LIVE |
| `5e0-LASTLIFE-SKIP-FORBIDDEN` | Last-life wrong SFX is not skipped | LIVE |
| `5e0-FLOATING-BUTTON-DUP` | No duplicate advance affordance | LIVE |
