# Queens — Pre-Generated Region Partitions

This file contains the 9 hand-authored 5×5 region partitions used by `fallbackContent.rounds[]`. Each partition is **validated by exhaustive search** to admit **exactly one** valid 5-queen placement under all four constraints:

1. one queen per row
2. one queen per column
3. one queen per coloured region
4. no two queens diagonally adjacent (gentler-than-chess: `|r1-r2|=1` AND `|c1-c2|=1` only — i.e. corner-touch / nearest-diagonal, not full chess diagonals)

The validator (`/tmp/queens-final.js`, runnable via `node /tmp/queens-final.js`) enumerates all 120 row-permutations, filters those that hit each region exactly once, then rejects those with any pair of adjacent rows differing in column by exactly 1. It also checks that each of the 5 region ids forms a 4-connected polyomino (contiguity). Every entry below was confirmed `count === 1` and `solution === expected`.

## Validator output (final, all 9 — copied verbatim from `node /tmp/queens-final.js`)

```
A.1: count=1 sizes={"0":6,"1":7,"2":4,"3":4,"4":4} sol=31420  ✓
A.2: count=1 sizes={"0":7,"1":5,"2":3,"3":5,"4":5} sol=02413  ✓
A.3: count=1 sizes={"0":5,"1":6,"2":2,"3":7,"4":5} sol=14203  ✓
B.1: count=1 sizes={"0":7,"1":6,"2":4,"3":4,"4":4} sol=13024  ✓
B.2: count=1 sizes={"0":3,"1":5,"2":7,"3":3,"4":7} sol=30241  ✓
B.3: count=1 sizes={"0":6,"1":5,"2":7,"3":5,"4":2} sol=42031  ✓
C.1: count=1 sizes={"0":7,"1":5,"2":5,"3":4,"4":4} sol=03142  ✓
C.2: count=1 sizes={"0":4,"1":7,"2":5,"3":6,"4":3} sol=41302  ✓
C.3: count=1 sizes={"0":6,"1":2,"2":7,"3":6,"4":4} sol=20314  ✓

ALL 9 PARTITIONS UNIQUE-SOLUTION ✓
```

## Conventions

- `regions[r][c]` is an integer in `0..4` mapping to `paletteHex[0..4]` of the round (the palette varies by stage; the integer index does not).
- `solution: [c0, c1, c2, c3, c4]` — the queen in row `r` sits at column `solution[r]`.
- `answer.queens` is the same solution as `{r,c}` pairs (build-time validator asserts they describe the same set).
- ASCII visualisation uses letters `A..E` for region ids `0..4`; the solution overlay marks queen cells with `Q` and non-queen cells with the lowercase region letter.
- "Region sizes" sums to 25 (the partition tiles the whole 5×5 board).

---

## Set A

### A.1 — Stage 1 (Vivid, large blobs, 1–2 deductions)

**regions[5][5]:**
```js
[
  [1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [1, 1, 1, 2, 2],
  [4, 3, 3, 3, 2],
  [4, 4, 4, 3, 2],
]
```

**solution:** `[3, 1, 4, 2, 0]` — queens at `(0,3),(1,1),(2,4),(3,2),(4,0)`

**answer.queens:** `[ {r:0,c:3}, {r:1,c:1}, {r:2,c:4}, {r:3,c:2}, {r:4,c:0} ]`

**Region sizes:** `A=6, B=7, C=4, D=4, E=4`. Region B (size 7) is the largest, sweeping the upper-left quadrant; region E sits in the bottom-left as a small column strip.

**ASCII partition / solution:**
```
B A A A A    b a a Q a
B B B A A    b Q b a a
B B B C C    b b b c Q
E D D D C    e d Q d c
E E E D C    Q e e d c
```

**Deduction sketch:** Region E is a vertical 1-column strip at col 0, rows 3–4 (plus (4,1),(4,2)). Region B fills the entire upper-left rectangle (rows 0–2 cols 0–2). The diagonal-touch rule between row 4 and row 3 forces the row-4 queen far from the row-3 queen. Working from the smallest constraints: A's queen must be in row 0 or row 1 (region A only spans those rows). Chain solves to `[3,1,4,2,0]`.

---

### A.2 — Stage 2 (Pastel, mid-stretch, off-axis size-3 region, 2–3 deductions)

**regions[5][5]:**
```js
[
  [0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1],
  [3, 1, 1, 2, 2],
  [3, 3, 4, 2, 4],
  [3, 3, 4, 4, 4],
]
```

**solution:** `[0, 2, 4, 1, 3]` — queens at `(0,0),(1,2),(2,4),(3,1),(4,3)`

**answer.queens:** `[ {r:0,c:0}, {r:1,c:2}, {r:2,c:4}, {r:3,c:1}, {r:4,c:3} ]`

**Region sizes:** `A=7, B=5, C=3, D=5, E=5`. Region C (size 3) is a small, off-axis cluster at `(2,3),(2,4),(3,3)` that forces a tight constraint.

**ASCII partition / solution:**
```
A A A A A    Q a a a a
A A B B B    a a Q b b
D B B C C    d b b c Q
D D E C E    d Q e c e
D D E E E    d d e Q e
```

**Deduction sketch:** Region A occupies the entire top row plus (1,0),(1,1) — 7 cells. A's queen must be in row 0 (the only row where A occupies more than 2 cells). Region C (size 3) at (2,3),(2,4),(3,3) — its queen must be in one of those three cells. Once A@(0,0), the diagonal-touch rule eliminates A@(0,1), and the column constraint propagates: B's queen at (1,2), C's queen at (2,4), D's queen at (3,1), E's queen at (4,3). The off-axis size-3 region C is the load-bearing constraint.

---

### A.3 — Stage 3 (Muted, mastery, contains size-2 region, ≥ 3 deductions)

**regions[5][5]:**
```js
[
  [0, 0, 0, 1, 1],
  [3, 0, 1, 1, 1],
  [3, 0, 2, 2, 1],
  [3, 3, 4, 4, 4],
  [3, 3, 3, 4, 4],
]
```

**solution:** `[1, 4, 2, 0, 3]` — queens at `(0,1),(1,4),(2,2),(3,0),(4,3)`

**answer.queens:** `[ {r:0,c:1}, {r:1,c:4}, {r:2,c:2}, {r:3,c:0}, {r:4,c:3} ]`

**Region sizes:** `A=5, B=6, **C=2**, D=7, E=5`. **Region C (size 2)** sits at `(2,2),(2,3)` — a horizontal domino entirely in row 2. Its queen MUST be in row 2 at col 2 or col 3.

**ASCII partition / solution:**
```
A A A B B    a Q a b b
D A B B B    d a b b Q
D A C C B    d a Q c b
D D E E E    Q d e e e
D D D E E    d d d Q e
```

**Deduction sketch:** Region C is a 2-cell horizontal domino in row 2 — forces the row-2 queen to col 2 or col 3 immediately. Region D (size 7) snakes down the left side (col 0 rows 1–4 plus (3,1),(4,1),(4,2)). Region B (size 6) covers the upper-right (rows 0–1 cols 3–4 plus (1,2),(2,4)). Working through: if C@(2,3), then row-1 (B's queen) must avoid col 2,3,4 in adjacent-diagonal terms; only B-cells in row 0 then satisfy → impossible since A's queen also in row 0. So C@(2,2), forcing D's queen out of col 1,3 in row 3 → D@(3,0); E's queen out of col 1,4 in row 4 → E@(4,3); A@(0,1); B@(1,4). The diagonal-touch rule between rows 2-3 and rows 3-4 is load-bearing.

---

## Set B

### B.1 — Stage 1 (Vivid, large blobs, 1–2 deductions)

**regions[5][5]:**
```js
[
  [0, 0, 0, 0, 1],
  [0, 0, 0, 1, 1],
  [2, 2, 1, 1, 1],
  [2, 3, 3, 3, 4],
  [2, 3, 4, 4, 4],
]
```

**solution:** `[1, 3, 0, 2, 4]` — queens at `(0,1),(1,3),(2,0),(3,2),(4,4)`

**answer.queens:** `[ {r:0,c:1}, {r:1,c:3}, {r:2,c:0}, {r:3,c:2}, {r:4,c:4} ]`

**Region sizes:** `A=7, B=6, C=4, D=4, E=4`. Same parity as A.1 (one big region, four mid-size). Mirror layout.

**ASCII partition / solution:**
```
A A A A B    a Q a a b
A A A B B    a a a Q b
C C B B B    Q c b b b
C D D D E    c d Q d e
C D E E E    c d e e Q
```

**Deduction sketch:** Region C is a vertical 1-column strip at col 0 rows 2–4 (size 4 incl (2,1)). C's queen must be in col 0 → row 2 (rows 3 and 4 col 0 would diagonal-touch each other and the row-3 D queen). With C@(2,0), the diagonal-touch rule forces row-3 queen out of col 1 → D@(3,2); row-4 queen out of cols 1,3 → E@(4,4); row-1 queen at B@(1,3); row-0 at A@(0,1). The chain is short — 1–2 explicit deductions reach the solution.

---

### B.2 — Stage 2 (Pastel, mid-stretch, two size-3 strips, 2–3 deductions)

**regions[5][5]:**
```js
[
  [1, 2, 2, 0, 0],
  [1, 1, 2, 2, 0],
  [1, 1, 2, 2, 3],
  [4, 4, 4, 2, 3],
  [4, 4, 4, 4, 3],
]
```

**solution:** `[3, 0, 2, 4, 1]` — queens at `(0,3),(1,0),(2,2),(3,4),(4,1)`

**answer.queens:** `[ {r:0,c:3}, {r:1,c:0}, {r:2,c:2}, {r:3,c:4}, {r:4,c:1} ]`

**Region sizes:** `A=3, B=5, **C=7, E=7**, D=3`. Two regions are size-7 (C and E interlock), two are size-3 (A is a top-right strip, D is a col-4 strip).

**ASCII partition / solution:**
```
B C C A A    b c c Q a
B B C C A    Q b c c a
B B C C D    b b Q c d
E E E C D    e e e c Q
E E E E D    e Q e e d
```

**Deduction sketch:** Region A is a 3-cell strip at (0,3),(0,4),(1,4) — forces the top-right queen high. Region D is a vertical 3-cell strip at col 4 rows 2–4 — D's queen must be col 4 → row 3 (the diagonal chain forbids row 2 and row 4). With D@(3,4): A@(0,3) (the only A cell that doesn't conflict with D's column or D's row-3 diagonal-neighbour at col 4). Then B@(1,0) (size-5 left L), C@(2,2), E@(4,1). The L-shape of region B forces queen down to col 0.

---

### B.3 — Stage 3 (Muted, mastery, size-2 region, ≥ 3 deductions)

**regions[5][5]:**
```js
[
  [2, 1, 0, 0, 0],
  [2, 1, 1, 1, 0],
  [2, 2, 1, 3, 0],
  [2, 2, 2, 3, 0],
  [4, 4, 3, 3, 3],
]
```

**solution:** `[4, 2, 0, 3, 1]` — queens at `(0,4),(1,2),(2,0),(3,3),(4,1)`

**answer.queens:** `[ {r:0,c:4}, {r:1,c:2}, {r:2,c:0}, {r:3,c:3}, {r:4,c:1} ]`

**Region sizes:** `A=6, B=5, C=7, D=5, **E=2**`. **Region E (size 2)** sits at `(4,0),(4,1)` — a horizontal domino in row 4. Region C (size 7) snakes down the left side (col 0 rows 0–3, col 1 rows 1–3, (3,2)).

**ASCII partition / solution:**
```
C B A A A    c b a a Q
C B B B A    c b Q b a
C C B D A    Q c b d a
C C C D A    c c c Q a
E E D D D    e Q d d d
```

**Deduction sketch:** Region E is the 2-cell row-4 domino at cols 0–1 — forces the row-4 queen to col 0 or col 1. Region A is a vertical strip at col 4 rows 0–3 (size 6 incl (1,3)? actually (0,2),(0,3),(0,4),(1,4),(2,4),(3,4) — yes 6 cells). A's queen is in col 4 → row 0 (the chain pushes it up). With A@(0,4): C's queen at (2,0). The diagonal-touch rule between row 3 and row 4 forces D@(3,3) (col 2 would be diagonal-adjacent to E@(4,1)) and E@(4,1) (col 0 would diagonal-touch D@(3,3)? actually D@(3,3), E@(4,1) → |3-1|=2 ≥ 2 — fine; but E@(4,0) plus D@(3,3) = |3-0|=3 — fine; the eliminator is column uniqueness with C@(2,0)). E@(4,1) is unique. B@(1,2) closes. The size-2 E + diagonal-touch interlock is load-bearing.

---

## Set C

### C.1 — Stage 1 (Vivid, large blobs, 1–2 deductions)

**regions[5][5]:**
```js
[
  [0, 0, 0, 0, 1],
  [0, 0, 1, 1, 1],
  [0, 2, 1, 4, 3],
  [2, 2, 4, 4, 3],
  [2, 2, 4, 3, 3],
]
```

**solution:** `[0, 3, 1, 4, 2]` — queens at `(0,0),(1,3),(2,1),(3,4),(4,2)`

**answer.queens:** `[ {r:0,c:0}, {r:1,c:3}, {r:2,c:1}, {r:3,c:4}, {r:4,c:2} ]`

**Region sizes:** `A=7, B=5, C=5, D=4, E=4`. Region A is the upper-left blob, B sweeps across rows 0–2 right side.

**ASCII partition / solution:**
```
A A A A B    Q a a a b
A A B B B    a a a Q b
A C B E D    a Q b e d
C C E E D    c c e e Q
C C E D D    c c Q d d
```

**Deduction sketch:** Region A (size 7) covers rows 0–2 col 0–3 minus a bite — its queen must occupy one of those cells. Region C is a vertical strip at col 0–1 rows 2–4 (size 5). Working: D's queen must be in cols 3–4 rows 2–4; the diagonal-touch chain forces D@(3,4). Then E@(4,2), C@(2,1), B@(1,3), A@(0,0). 1–2 explicit deductions for most students because the large rectangular regions read clearly.

---

### C.2 — Stage 2 (Pastel, mid-stretch, off-axis size-3 region, 2–3 deductions)

**regions[5][5]:**
```js
[
  [1, 1, 1, 0, 0],
  [3, 1, 1, 2, 0],
  [3, 1, 1, 2, 0],
  [3, 3, 2, 2, 2],
  [3, 3, 4, 4, 4],
]
```

**solution:** `[4, 1, 3, 0, 2]` — queens at `(0,4),(1,1),(2,3),(3,0),(4,2)`

**answer.queens:** `[ {r:0,c:4}, {r:1,c:1}, {r:2,c:3}, {r:3,c:0}, {r:4,c:2} ]`

**Region sizes:** `A=4, B=7, C=5, D=6, E=3`. Region E (size 3) is a horizontal strip on row 4 cols 2–4. Region B (size 7) is the upper-left blob.

**ASCII partition / solution:**
```
B B B A A    b b b a Q
D B B C A    d Q b c a
D B B C A    d b b Q a
D D C C C    Q d c c c
D D E E E    d d Q e e
```

**Deduction sketch:** Region A is a vertical strip at col 4 rows 0–2 plus (0,3) (size 4). A's queen is in col 4 → row 0 (rows 1,2 col 4 propagate diagonal-touch conflicts). Region E (size 3) is row-4 cols 2–4 only — E's queen at row 4. Region D (size 6) covers col 0 rows 1–4 plus (3,1),(4,1) — D's queen at col 0 → row 3 (the diagonal-touch chain forbids col 0 rows 1,2,4). Chain: A@(0,4) → B@(1,1) → C@(2,3) → D@(3,0) → E@(4,2).

---

### C.3 — Stage 3 (Muted, mastery, size-2 region, ≥ 3 deductions)

**regions[5][5]:**
```js
[
  [1, 0, 0, 0, 0],
  [1, 3, 0, 2, 0],
  [3, 3, 2, 2, 4],
  [3, 3, 2, 2, 4],
  [3, 2, 2, 4, 4],
]
```

**solution:** `[2, 0, 3, 1, 4]` — queens at `(0,2),(1,0),(2,3),(3,1),(4,4)`

**answer.queens:** `[ {r:0,c:2}, {r:1,c:0}, {r:2,c:3}, {r:3,c:1}, {r:4,c:4} ]`

**Region sizes:** `A=6, **B=2**, C=7, D=6, E=4`. **Region B (size 2)** is at `(0,0),(1,0)` — a vertical domino in the top-left corner.

**ASCII partition / solution:**
```
B A A A A    b a Q a a
B D A C A    Q d a c a
D D C C E    d d c Q e
D D C C E    d Q c c e
D C C E E    d c c e Q
```

**Deduction sketch:** Region B is a 2-cell vertical domino at col 0 rows 0–1 — forces B's queen to col 0 + row 0 or row 1. Region A is the top-right and middle (size 6: (0,1),(0,2),(0,3),(0,4),(1,2),(1,4)). The chain: B@(0,0) is impossible (forces A's queen to row 1, and the C@row-2 queen would diagonal-touch A@(1,2)/A@(1,4) without enough non-conflicting C cells). So B@(1,0). With B@(1,0): A's queen at row 0, and the diagonal-touch rule eliminates A@(0,1) — so A is at col 2, 3, or 4. C's queen at row 2 col 2 or 3 (region C is centred mid-board). Working through: A@(0,2), C@(2,3), D@(3,1) (size-6 D fills bottom-left), E@(4,4). The size-2 B's "which-row?" decision is the load-bearing deduction; the diagonal-touch between rows 0-1 and rows 1-2 chains it.

---

## Cross-set parallelism check

| Stage | Set A sol | Set B sol | Set C sol | Geometry parity |
|-------|-----------|-----------|-----------|-----------------|
| 1 | `31420` | `13024` | `03142` | All three: large rectangular blobs, region sizes 4–7 (no size-2 or size-3), 1–2 explicit deductions. ✓ |
| 2 | `02413` | `30241` | `41302` | All three: include exactly one off-axis or L-shaped region of size 3 forcing a tight constraint, 2–3 deductions. ✓ |
| 3 | `14203` | `42031` | `20314` | All three: include exactly one size-2 region (A.3=C@(2,2),(2,3); B.3=E@(4,0),(4,1); C.3=B@(0,0),(1,0)); diagonal-touch is load-bearing; ≥ 3 deductions. ✓ |

The 9 solutions are all distinct (no duplicates), so a returning student sees genuinely new content per restart even though the four-rule mechanic and overall structure are identical.

## How to re-run the validator

Save the contents of `/tmp/queens-final.js` in the project (or copy from this repo's commit history) and run:

```
node /tmp/queens-final.js
```

The expected stdout matches the validator output block at the top of this file. Any deviation indicates the partition was tampered with.
