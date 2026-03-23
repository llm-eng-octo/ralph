# stats-median — Game Dashboard

## Status

| Field | Value |
|---|---|
| **Status** | spec-written |
| **Session** | Statistics Session 2 — Game 3 of 4 |
| **Bloom Level** | L3 Apply |
| **Interaction** | MCQ (4 options) — find median of a small dataset |
| **Rounds** | 9 (3 easy / 3 medium / 3 hard) |
| **Lives** | 3 |
| **Timer** | 45 seconds per round |
| **Builds** | None yet |
| **Last approved build** | — |
| **Spec written** | 2026-03-23 |
| **Spec author** | Education slot agent |

---

## Session Context

**Predecessor:** `stats-mean-direct` (L2–L3 — compute the mean)
**This game:** `stats-median` (L3 — find the median of ungrouped data)
**Successor:** `stats-mode` (L3 — compute mode for grouped data)

---

## Pedagogical Rationale

This game follows NCERT Class 10 Chapter 14 Section 14.3 (Median of Ungrouped Data). Students who can compute the mean (Game 2) now apply the median algorithm: sort the data, then pick the middle value (odd n) or average the two middle values (even n).

Three difficulty tiers:
- **Easy (R1–R3):** Odd n=5, pre-sorted data. Median is trivially the 3rd value. Distractors target off-by-one index errors (picking 2nd or 4th value) and sum confusion.
- **Medium (R4–R6):** Unsorted data OR even n=6. R4 is unsorted odd-n (must sort first — M-no-sort trap). R5–R6 are even n=6 (must average two middle values — M-even-median trap). R6 has skewed data where mean ≠ median, directly targeting mean/median conflation.
- **Hard (R7–R9):** Unsorted, repeated values, n=7 with outliers. All three primary misconceptions active in each round. R8 has an extreme outlier (30) sitting at the middle position of the unsorted array — the most compelling M-no-sort trap in the game. R9 combines even-n + unsorted + repeated values + a distinct spatial-midpoint distractor.

Primary misconceptions targeted:
- **M-no-sort** — student picks the value at the middle position of the UNSORTED array (AAMT Top Drawer, highest-frequency median error)
- **M-even-median** — for even n, student picks one of the two middle values instead of averaging them (NCERT Class 10 Ch 14)
- **M-wrong-middle** — off-by-one index error, or spatial midpoint confusion (Bezuidenhout 2014)
- **M-use-mean** — student computes arithmetic mean instead of finding the positional middle (AAMT Top Drawer; most dangerous in symmetric datasets where mean = median in easy rounds)

Research sources:
- NCERT Class 10 Ch 14 (learncbse.in, askiitians.com, 2024) — canonical formulas for odd and even n
- AAMT Top Drawer "Misunderstandings of averages" — "data must actually be ordered" as primary documented student difficulty
- Bezuidenhout, H. (2014) "Median: The middle of what?" — spatial midpoint vs ranked midpoint confusion in Grade 10

---

## Build Queue Notes

**Before queuing first build:**
1. Verify spec.md is deployed to server warehouse: `warehouse/templates/stats-median/spec.md`
2. Run local verification (download GCP HTML, run diagnostic.js) if a prior build exists
3. Check DB for running builds before restart

**Expected build behaviour:**
- Easy rounds are simpler than stats-mean-direct (no arithmetic, just positional lookup) — LLM should generate cleanly
- Medium rounds introduce the sorting step and even-n averaging — slightly more complex logic to generate
- Hard rounds have decimal distractors (5.4, 8.3) — verify string comparison in validation works correctly for these
- The `sortedNumbers` field is extra metadata not displayed to the user — used only in feedback strings

---

## RCA Log

No builds yet.

---

## Next Action

Queue first build after confirming spec is deployed to server warehouse.
