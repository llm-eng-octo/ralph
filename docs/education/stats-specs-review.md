# Stats Session 2 — Spec Cross-Consistency Review

**Reviewed:** 2026-03-23
**Status:** PASS WITH NOTES

---

## Summary

| Check | stats-identify-class | stats-mean-direct | stats-median | stats-mode | stats-which-measure |
|-------|---------------------|-------------------|--------------|------------|---------------------|
| waitForPackages maxWait explicitly 180000 | ✅ (inline code) | ⚠️ PART-003 only, no explicit maxWait | ⚠️ PART-003 only, no explicit maxWait | ⚠️ PART-003 only, no explicit maxWait | ✅ (CRITICAL note + code) |
| postMessage has `score` | ✅ | ✅ | ✅ | ✅ | ✅ |
| postMessage has `totalRounds` | ⚠️ absent from inline endGame payload | ✅ | ✅ | ✅ | ✅ |
| postMessage has `lives` / `livesRemaining` | ✅ (livesRemaining) | ✅ (livesRemaining) | ✅ (livesRemaining) | ✅ (livesRemaining) | ✅ (lives + Math.max) |
| postMessage has `events` | ⚠️ absent from inline endGame payload | ⚠️ absent | ⚠️ absent | ⚠️ absent | ✅ |
| postMessage has `attempts` | ✅ | ✅ | ✅ | ✅ | ✅ |
| postMessage has `duration` | ✅ | ✅ | ✅ | ✅ | ✅ |
| endGame guard uses `gameState.gameEnded` only | ✅ (correct in code, no explicit warning) | ✅ (correct in code, no explicit warning) | ✅ (correct in code, no explicit warning) | ✅ (correct in code, no explicit warning) | ✅ (CRITICAL warning + code comment) |
| Results screen position:fixed | ⚠️ not mentioned | ✅ | ✅ | ✅ | ✅ |
| progressBar.update with Math.max(0, lives) | ⚠️ not mentioned | ⚠️ not mentioned | ⚠️ not mentioned | ⚠️ not mentioned | ✅ |
| restartGame calls syncDOMState after state reset | ✅ (directly in restartGame) | ✅ (via startGame()) | ✅ (via startGame()) | ✅ (via startGame()) | ✅ (directly in restartGame) |
| Stars: 0–3 range | ✅ (min 1 star — learning game) | ✅ | ✅ | ✅ | ✅ |
| Lives: 3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| TransitionScreen icons: no local file paths | ✅ (emojis only) | ✅ (emojis only) | ✅ (emojis only) | ✅ (emojis only) | ✅ (type-based API, no icons[]) |

---

## Issues Found

### Issue 1 — MEDIUM: `events` missing from postMessage in 4 of 5 specs

**Affected:** stats-identify-class (inline endGame payload), stats-mean-direct, stats-median, stats-mode.

All four specs track `gameState.events[]` in state and populate it during gameplay. However, the `endGame()` postMessage payload in these four specs does NOT include `events: gameState.events` in the `game_complete` message.

- stats-identify-class has TWO postMessage definitions that are inconsistent with each other: the inline `endGame()` pseudocode (lines 665–676) includes `attempts` but NOT `events`, while the PostMessage Protocol section (around line 1050) shows a different payload shape with `events` inside a nested `payload:` wrapper — a structural mismatch.
- stats-mean-direct, stats-median, stats-mode all emit `attempts` but not `events`.

**stats-which-measure** has it correct: `events: gameState.events` is present.

**Risk:** Low for first build (tests do not assert `events` field). However, analytics downstream and cross-game consistency is broken. Fix before any analytics integration.

**Recommended fix:** Add `events: gameState.events` to the postMessage in stats-identify-class (inline endGame payload), stats-mean-direct, stats-median, stats-mode. For stats-identify-class also resolve the dual postMessage inconsistency — the inline payload should be the authority.

---

### Issue 2 — LOW: `waitForPackages` maxWait not explicit in stats-mean-direct, stats-median, stats-mode

**Affected:** stats-mean-direct, stats-median, stats-mode.

These three specs list `waitForPackages` in PART-003 but do not show the full function body with `const maxWait = 180000`. The gen rule GEN-WAIT-PACKAGES enforces 180000 globally, so builds will likely be correct. However, if the gen rule is ever weakened or the spec is read without that context, the LLM may default to 10000.

**stats-identify-class** has the full `waitForPackages` function body with `maxWait = 180000` inline.
**stats-which-measure** has a CRITICAL top-of-spec warning and a PART-003 note: `maxWait = 180000 (NOT 10000)`.

**Recommended fix:** Add `**maxWait = 180000** (NOT 10000)` to the PART-003 row for the three affected specs. Low priority — gen rule covers this.

---

### Issue 3 — LOW: `results screen position:fixed` not mentioned in stats-identify-class

**Affected:** stats-identify-class only.

stats-identify-class has no `#results-screen` position:fixed requirement in its spec, no CSS note about it, and no anti-pattern warning. The other four specs all have at least one mention of `position: fixed; z-index: 100` for the results screen.

**Note:** stats-identify-class does NOT have a traditional results screen in the same sense — end state is handled via `TransitionScreenComponent`. If there is no `#results-screen` div, this is a structural difference, not a bug. Flagging for awareness.

---

### Issue 4 — LOW: `progressBar.update(Math.max(0, lives))` guard not mentioned in 4 of 5 specs

**Affected:** stats-identify-class, stats-mean-direct, stats-median, stats-mode.

These four specs use `progressBar.loseLife()` and `progressBar.setRound()` (the correct CDN API). Only stats-which-measure uses `progressBar.update(round, Math.max(0, lives))` — a different API call pattern.

**This is not actually an inconsistency — it is a different (compatible) API style.** The `Math.max(0, lives)` guard in which-measure applies because it calls `progressBar.update()` directly. The other specs use `progressBar.loseLife()` which cannot receive a negative value. Both patterns are safe.

**No action required.**

---

### Issue 5 — NOTE: Star thresholds are intentionally non-uniform across specs

| Game | Rounds | 3★ threshold | 2★ threshold | 1★ threshold | 0★ |
|------|--------|-------------|-------------|-------------|-----|
| stats-identify-class | 10 | ≥8/10 first-attempt | ≥6/10 | <6/10 | — (min 1★) |
| stats-mean-direct | 9 | 9/9 | 6–8/9 | 3–5/9 | 0–2/9 |
| stats-median | 9 | 9/9 | 6–8/9 | 3–5/9 | 0–2/9 |
| stats-mode | 9 | 9/9 | 6–8/9 | 3–5/9 | 0–2/9 |
| stats-which-measure | 6 | 6/6 | 4–5/6 | 2–3/6 | 0–1/6 |

These are **pedagogically correct and intentional**: thresholds scale with round count. identify-class uses first-attempt accuracy (not total correct) because it is a worked-example game. No fix needed.

**One note:** identify-class guarantees a minimum of 1★ (it is a learning game, not a high-stakes assessment), while the other four can give 0★. This is a deliberate design difference that should be documented in the spec but is not a bug.

---

### Issue 6 — NOTE: Timer lengths are intentionally non-uniform

| Game | Timer | Rationale |
|------|-------|-----------|
| stats-identify-class | No timer | Conceptual-recall task; time pressure contradicts worked-example pedagogy |
| stats-mean-direct | 45s | Mental arithmetic (sum ÷ n); 45s allows calculation without pressure |
| stats-median | 45s | Sort + pick middle; 45s allows mental sort |
| stats-mode | 45s | Frequency scan; 45s for grouped table reading |
| stats-which-measure | 60s | L4 Analyze reasoning requires evaluating competing justifications |

The task checklist listed expected timers as "stats-median 60s" and "stats-mode 60s" — these are incorrect vs the actual specs. Both median and mode specs set `startTime: 45`. The 60s spec note in the task was the reviewer's expectation, not what the specs specify. The actual 45s is defensible: both median and mode require less reasoning than stats-which-measure's L4 Analyze task. No change needed.

---

### Issue 7 — NOTE: waitForPackages API shape inconsistency (stats-which-measure vs others)

stats-which-measure uses a different call signature in Section 13:
```javascript
await waitForPackages(
  ['ScreenLayout', ...],
  { maxWait: 180000 }
);
```

The other four specs define `waitForPackages` as a callback-based function:
```javascript
function waitForPackages(callback) {
  const maxWait = 180000;
  // ...
}
```

This is a documentation inconsistency in which-measure (the await + options-object form is not the CDN API — the CDN uses a callback-based helper). The LLM generating from stats-which-measure may produce incorrect code. However, the gen rule for waitForPackages enforces the correct callback form, so in practice the build should be correct.

**Recommended fix (low priority):** Align the Section 13 code sample in stats-which-measure to use the callback form matching the other specs.

---

## Verdict

**Ready to queue in pedagogical order.**

All 5 specs are structurally sound for first builds. The issues above are documentation gaps, not blockers. The gen rules (GEN-WAIT-PACKAGES, GEN-PHASE-001) cover the most dangerous gaps (maxWait, syncDOMState). The missing `events` field in 4 postMessage payloads is the most actionable finding but does not affect first-build success.

**Recommended queue order (must respect Bloom's L1 → L4 prerequisite chain):**
1. `stats-identify-class` — L1 prerequisite for all others
2. `stats-mean-direct` — L2/L3, builds on L1 classification
3. `stats-median` — L3, parallel to mean
4. `stats-mode` — L3, parallel to mean/median
5. `stats-which-measure` — L4 Analyze cap, requires L1–L3 understanding

**After first builds pass, recommended spec patches (non-blocking):**
- Add `events: gameState.events` to postMessage in stats-identify-class, stats-mean-direct, stats-median, stats-mode
- Add `maxWait = 180000 (NOT 10000)` note to PART-003 in stats-mean-direct, stats-median, stats-mode
- Resolve dual-postMessage inconsistency in stats-identify-class (inline endGame payload vs PostMessage Protocol section)
