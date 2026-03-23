# stats-mean-direct — Game Dashboard

## Status

| Field | Value |
|---|---|
| **Status** | spec-written |
| **Session** | Statistics Session 2 — Game 2 of 4 |
| **Bloom Level** | L2 Understand + L3 Apply |
| **Interaction** | MCQ (4 options) — compute mean from dataset |
| **Rounds** | 9 (3 easy / 3 medium / 3 hard) |
| **Lives** | 3 |
| **Timer** | 45 seconds per round |
| **Builds** | None yet |
| **Last approved build** | — |
| **Spec written** | 2026-03-23 |
| **Spec author** | Education slot agent |

---

## Session Context

**Predecessor:** `stats-identify-class` (L1 — which measure is appropriate)
**This game:** `stats-mean-direct` (L2–L3 — compute the mean)
**Successors:** `stats-median` (L3 — grouped data median formula), `stats-mode` (L3 — grouped data mode formula)

---

## Pedagogical Rationale

This game follows NCERT Class 9 Chapter 14 Section 14.2 (Mean of Ungrouped Data). Students who can identify when to use the mean (Game 1) now apply the direct method: Mean = Σxi / n.

Three difficulty tiers:
- **Easy (R1–R3):** Whole numbers, sum ≤ 45, n = 5. Distractors: raw sum (forgot to divide) and off-by-one n.
- **Medium (R4–R6):** Larger values (n = 5–6), requires careful mental addition. Decimal mean introduced in R6.
- **Hard (R7–R9):** Repeated values that create a plausible mode distractor (most common misconception per Pollatsek et al. 1981). R8 uses n = 7 with a decimal mean.

Primary misconceptions targeted:
- **M-forget-divide** — student computes Σxi but forgets to divide by n (Cambridge Assessment, 2023)
- **M-wrong-n** — student divides by n−1 or n+1 (off-by-one count error)
- **M-mode-confusion** — student selects the most frequent value instead of computing the average (Pollatsek, Lima & Well, 1981; Cai, 1998)
- **M-median-confusion** — student selects the middle value (sorted) instead of computing the mean

---

## Build Queue Notes

**Before queuing first build:**
1. Verify spec.md is deployed to server warehouse: `warehouse/templates/stats-mean-direct/spec.md`
2. Run local verification (download GCP HTML, run diagnostic.js) if a prior build exists
3. Check DB for running builds before restart

**Expected build behaviour:**
- Round data is simple (whole numbers, verified sums) — LLM should generate correct round content
- Timer (45s) is longer than typical MCQ games — less risk of timer-related test flakiness
- No worked-example panel — simpler flow than stats-identify-class

---

## RCA Log

No builds yet.

---

## Next Action

Queue first build after confirming spec is deployed to server warehouse.
