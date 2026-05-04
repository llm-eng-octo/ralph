# Logic Seating Puzzle — Pre-Generated Puzzles (21 = 3 sets × 7 rounds)

This file is the canonical source for the 21 puzzle objects that Step 4 (Build) inlines into `fallbackContent.rounds[]`. Each puzzle was authored by hand, then verified by exhaustive permutation search (`P(seats, chips)` enumeration over all `4! / 5! / 7P6` arrangements) against every clue — every puzzle has **exactly one** solution.

**Format per round:**

- **Chips:** the chip IDs available in this round's pool (length matches `seats.length` for Stages 1–2; `seats.length + 1` for Stage 3, with one distractor).
- **Distractor:** the chip ID never named in any clue (Stage 3 only; `null` for Stages 1–2).
- **Seats:** the seat numbering for the stage's geometry, for reader convenience.
- **Clues:** the verbatim text the student reads, plus the structured `{ kind, args }` for the runtime evaluator. Strings match the Clue Grammar Reference in `spec.md` exactly.
- **Solution:** map seat → chip (the unique pre-validated arrangement).
- **Answer payload:** the `round.answer` object the runtime + AnswerComponent consume.
- **Uniqueness check:** the count from exhaustive enumeration (always `1`).
- **Misconception tags:** the clue kinds present in this round; the runtime maps each to the canonical tag from `spec.md`.

**Geometry recap (from `spec.md`):**

- **Stage 1** (4 seats — square): `1=top, 2=right, 3=bottom, 4=left`. Adjacency cycle 1-2-3-4-1. Across pairs `1↔3, 2↔4`. `leftNeighbour: {1:2, 2:3, 3:4, 4:1}`.
- **Stage 2** (5 seats — oval with head, foot open): `1=head/top, 2/3=right side, 5/4=left side`. Clockwise traversal from head: 1 → 2 → 3 → 5 → 4 → 1. Adjacency: `{1:[2,4], 2:[1,3], 3:[2,5], 5:[3,4], 4:[1,5]}`. Across pairs `2↔4, 3↔5` (head has no across partner). `leftNeighbour: {1:2, 2:3, 3:5, 5:4, 4:1}`.
- **Stage 3** (6 seats — rectangle with head + foot): `1=head/top, 2/3=right side, 4=foot/bottom, 5/6=left side`. Clockwise traversal: 1 → 2 → 3 → 4 → 5 → 6 → 1. Adjacency: `{1:[2,6], 2:[1,3], 3:[2,4], 4:[3,5], 5:[4,6], 6:[1,5]}`. Across pairs `1↔4, 2↔6, 3↔5`. `leftNeighbour: {1:2, 2:3, 3:4, 4:5, 5:6, 6:1}`.

**Negation distribution (Stage 3, "≥1 of the two R6/R7 per set"):** in all three sets, the negation clue (`X is NOT next to Y`) lives in **R6**; R7 uses positive clues only. This keeps the "negation is the new wrinkle" beat tied to the first Stage-3 puzzle, with R7 acting as a same-shape consolidation round (different distractor, no negation).

**Distractor distribution (Stage 3):** different chip per round to keep students from pattern-matching ("the same kid is always the distractor").

| Set | R6 distractor | R7 distractor |
|-----|---------------|---------------|
| A   | tara          | bobby         |
| B   | meera         | kavya         |
| C   | kavya         | bobby         |

---

## Set A

Chip name bank: `anu, ravi, priya, neha, meera, bobby, tara`.

### A_r1 — Stage 1, Round 1

**Chips:** `anu, ravi, priya, neha`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Anu sits in seat 1." → kind: `seat-pin`, args: `["anu", 1]`
2. "Ravi is across from Anu." → kind: `across-from`, args: `["ravi", "anu"]`
3. "Priya sits to the left of Ravi." → kind: `left-of`, args: `["priya", "ravi"]`

**Solution (seat → chip):** `{ "1": "anu", "2": "neha", "3": "ravi", "4": "priya" }`
**Answer payload:** `{ seating: { "1": "anu", "2": "neha", "3": "ravi", "4": "priya" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused"]`

### A_r2 — Stage 1, Round 2

**Chips:** `anu, ravi, priya, neha`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Neha sits in seat 2." → kind: `seat-pin`, args: `["neha", 2]`
2. "Priya sits to the left of Neha." → kind: `left-of`, args: `["priya", "neha"]`
3. "Anu is across from Priya." → kind: `across-from`, args: `["anu", "priya"]`

**Solution (seat → chip):** `{ "1": "anu", "2": "neha", "3": "priya", "4": "ravi" }`
**Answer payload:** `{ seating: { "1": "anu", "2": "neha", "3": "priya", "4": "ravi" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "left-right-orientation-confused", "across-from-constraint-overlooked"]`

### A_r3 — Stage 2, Round 3

**Chips:** `meera, anu, ravi, priya, neha`
**Distractor:** none
**Seats:** 1 (head/top), 2 (upper right), 3 (lower right), 5 (lower left), 4 (upper left). Clockwise from head: 1 → 2 → 3 → 5 → 4.
**Clues:**
1. "Meera is at the head of the table." → kind: `head-of-table`, args: `["meera"]`
2. "Anu sits next to Meera." → kind: `next-to`, args: `["anu", "meera"]`
3. "Ravi sits between Anu and Priya." → kind: `between`, args: `["ravi", "anu", "priya"]`
4. "Neha sits to the left of Meera." → kind: `left-of`, args: `["neha", "meera"]`

**Solution (seat → chip):** `{ "1": "meera", "2": "neha", "3": "priya", "4": "anu", "5": "ravi" }`
**Answer payload:** `{ seating: { "1": "meera", "2": "neha", "3": "priya", "4": "anu", "5": "ravi" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "next-to-constraint-overlooked", "between-constraint-misread", "left-right-orientation-confused"]`

### A_r4 — Stage 2, Round 4

**Chips:** `anu, ravi, priya, neha, meera`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Priya is at the head of the table." → kind: `head-of-table`, args: `["priya"]`
2. "Neha sits to the left of Priya." → kind: `left-of`, args: `["neha", "priya"]`
3. "Meera sits between Priya and Ravi." → kind: `between`, args: `["meera", "priya", "ravi"]`
4. "Anu is across from Ravi." → kind: `across-from`, args: `["anu", "ravi"]`

**Solution (seat → chip):** `{ "1": "priya", "2": "neha", "3": "anu", "4": "meera", "5": "ravi" }`
**Answer payload:** `{ seating: { "1": "priya", "2": "neha", "3": "anu", "4": "meera", "5": "ravi" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "between-constraint-misread", "across-from-constraint-overlooked"]`

### A_r5 — Stage 2, Round 5

**Chips:** `anu, ravi, priya, neha, meera`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Ravi is at the head of the table." → kind: `head-of-table`, args: `["ravi"]`
2. "Meera sits to the left of Ravi." → kind: `left-of`, args: `["meera", "ravi"]`
3. "Priya sits between Meera and Anu." → kind: `between`, args: `["priya", "meera", "anu"]`
4. "Neha sits next to Anu." → kind: `next-to`, args: `["neha", "anu"]`

**Solution (seat → chip):** `{ "1": "ravi", "2": "meera", "3": "priya", "4": "neha", "5": "anu" }`
**Answer payload:** `{ seating: { "1": "ravi", "2": "meera", "3": "priya", "4": "neha", "5": "anu" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "between-constraint-misread", "next-to-constraint-overlooked"]`

### A_r6 — Stage 3, Round 6

**Chips:** `meera, anu, ravi, priya, neha, bobby, tara`
**Distractor:** `tara` (never named in any clue)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Meera is at the head of the table." → kind: `head-of-table`, args: `["meera"]`
2. "Anu is across from Meera." → kind: `across-from`, args: `["anu", "meera"]`
3. "Ravi sits between Bobby and Anu." → kind: `between`, args: `["ravi", "bobby", "anu"]`
4. "Priya is NOT next to Anu." → kind: `not-next-to`, args: `["priya", "anu"]`
5. "Neha sits to the left of Anu." → kind: `left-of`, args: `["neha", "anu"]`

**Solution (seat → chip):** `{ "1": "meera", "2": "bobby", "3": "ravi", "4": "anu", "5": "neha", "6": "priya" }`
**Answer payload:** `{ seating: { "1": "meera", "2": "bobby", "3": "ravi", "4": "anu", "5": "neha", "6": "priya" }, distractor: "tara" }`
**Uniqueness check:** Enumerated all 5040 arrangements (7 chips into 6 seats); only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "between-constraint-misread", "negation-clue-misread", "left-right-orientation-confused", "distractor-not-recognised"]`

### A_r7 — Stage 3, Round 7

**Chips:** `meera, anu, ravi, priya, neha, bobby, tara`
**Distractor:** `bobby` (different chip than R6's `tara`; never named in any clue here)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Tara is at the head of the table." → kind: `head-of-table`, args: `["tara"]`
2. "Anu is across from Tara." → kind: `across-from`, args: `["anu", "tara"]`
3. "Neha sits to the left of Tara." → kind: `left-of`, args: `["neha", "tara"]`
4. "Meera sits between Anu and Priya." → kind: `between`, args: `["meera", "anu", "priya"]`
5. "Ravi sits next to Neha." → kind: `next-to`, args: `["ravi", "neha"]`

**Solution (seat → chip):** `{ "1": "tara", "2": "neha", "3": "ravi", "4": "anu", "5": "meera", "6": "priya" }`
**Answer payload:** `{ seating: { "1": "tara", "2": "neha", "3": "ravi", "4": "anu", "5": "meera", "6": "priya" }, distractor: "bobby" }`
**Uniqueness check:** Enumerated all 5040 arrangements; only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused", "between-constraint-misread", "next-to-constraint-overlooked", "distractor-not-recognised"]`

---

## Set B

Chip name bank: `rohan, kavya, arjun, diya, kabir, anu, meera`.

### B_r1 — Stage 1, Round 1

**Chips:** `rohan, kavya, arjun, diya`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Rohan sits in seat 1." → kind: `seat-pin`, args: `["rohan", 1]`
2. "Kavya is across from Rohan." → kind: `across-from`, args: `["kavya", "rohan"]`
3. "Arjun sits to the left of Kavya." → kind: `left-of`, args: `["arjun", "kavya"]`

**Solution (seat → chip):** `{ "1": "rohan", "2": "diya", "3": "kavya", "4": "arjun" }`
**Answer payload:** `{ seating: { "1": "rohan", "2": "diya", "3": "kavya", "4": "arjun" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused"]`

### B_r2 — Stage 1, Round 2

**Chips:** `rohan, kavya, arjun, diya`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Diya sits in seat 2." → kind: `seat-pin`, args: `["diya", 2]`
2. "Arjun sits to the left of Diya." → kind: `left-of`, args: `["arjun", "diya"]`
3. "Rohan is across from Diya." → kind: `across-from`, args: `["rohan", "diya"]`

**Solution (seat → chip):** `{ "1": "kavya", "2": "diya", "3": "arjun", "4": "rohan" }`
**Answer payload:** `{ seating: { "1": "kavya", "2": "diya", "3": "arjun", "4": "rohan" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "left-right-orientation-confused", "across-from-constraint-overlooked"]`

### B_r3 — Stage 2, Round 3

**Chips:** `kabir, rohan, kavya, arjun, diya`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Kabir is at the head of the table." → kind: `head-of-table`, args: `["kabir"]`
2. "Rohan sits next to Kabir." → kind: `next-to`, args: `["rohan", "kabir"]`
3. "Kavya sits between Rohan and Arjun." → kind: `between`, args: `["kavya", "rohan", "arjun"]`
4. "Diya sits to the left of Kabir." → kind: `left-of`, args: `["diya", "kabir"]`

**Solution (seat → chip):** `{ "1": "kabir", "2": "diya", "3": "arjun", "4": "rohan", "5": "kavya" }`
**Answer payload:** `{ seating: { "1": "kabir", "2": "diya", "3": "arjun", "4": "rohan", "5": "kavya" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "next-to-constraint-overlooked", "between-constraint-misread", "left-right-orientation-confused"]`

### B_r4 — Stage 2, Round 4

**Chips:** `rohan, kavya, arjun, diya, kabir`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Arjun is at the head of the table." → kind: `head-of-table`, args: `["arjun"]`
2. "Kabir sits to the left of Arjun." → kind: `left-of`, args: `["kabir", "arjun"]`
3. "Diya sits between Arjun and Rohan." → kind: `between`, args: `["diya", "arjun", "rohan"]`
4. "Kavya is across from Rohan." → kind: `across-from`, args: `["kavya", "rohan"]`

**Solution (seat → chip):** `{ "1": "arjun", "2": "kabir", "3": "kavya", "4": "diya", "5": "rohan" }`
**Answer payload:** `{ seating: { "1": "arjun", "2": "kabir", "3": "kavya", "4": "diya", "5": "rohan" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "between-constraint-misread", "across-from-constraint-overlooked"]`

### B_r5 — Stage 2, Round 5

**Chips:** `rohan, kavya, arjun, diya, kabir`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Diya is at the head of the table." → kind: `head-of-table`, args: `["diya"]`
2. "Arjun sits to the left of Diya." → kind: `left-of`, args: `["arjun", "diya"]`
3. "Kavya sits next to Arjun." → kind: `next-to`, args: `["kavya", "arjun"]`
4. "Rohan sits between Kavya and Kabir." → kind: `between`, args: `["rohan", "kavya", "kabir"]`

**Solution (seat → chip):** `{ "1": "diya", "2": "arjun", "3": "kavya", "4": "kabir", "5": "rohan" }`
**Answer payload:** `{ seating: { "1": "diya", "2": "arjun", "3": "kavya", "4": "kabir", "5": "rohan" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "next-to-constraint-overlooked", "between-constraint-misread"]`

### B_r6 — Stage 3, Round 6

**Chips:** `rohan, kavya, arjun, diya, kabir, anu, meera`
**Distractor:** `meera` (never named in any clue)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Rohan is at the head of the table." → kind: `head-of-table`, args: `["rohan"]`
2. "Diya is across from Rohan." → kind: `across-from`, args: `["diya", "rohan"]`
3. "Arjun sits between Kabir and Diya." → kind: `between`, args: `["arjun", "kabir", "diya"]`
4. "Kavya is NOT next to Diya." → kind: `not-next-to`, args: `["kavya", "diya"]`
5. "Anu sits to the left of Diya." → kind: `left-of`, args: `["anu", "diya"]`

**Solution (seat → chip):** `{ "1": "rohan", "2": "kabir", "3": "arjun", "4": "diya", "5": "anu", "6": "kavya" }`
**Answer payload:** `{ seating: { "1": "rohan", "2": "kabir", "3": "arjun", "4": "diya", "5": "anu", "6": "kavya" }, distractor: "meera" }`
**Uniqueness check:** Enumerated all 5040 arrangements; only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "between-constraint-misread", "negation-clue-misread", "left-right-orientation-confused", "distractor-not-recognised"]`

### B_r7 — Stage 3, Round 7

**Chips:** `rohan, kavya, arjun, diya, kabir, anu, meera`
**Distractor:** `kavya` (different chip than R6's `meera`; never named in any clue here)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Kabir is at the head of the table." → kind: `head-of-table`, args: `["kabir"]`
2. "Rohan is across from Kabir." → kind: `across-from`, args: `["rohan", "kabir"]`
3. "Diya sits to the left of Kabir." → kind: `left-of`, args: `["diya", "kabir"]`
4. "Arjun sits between Rohan and Anu." → kind: `between`, args: `["arjun", "rohan", "anu"]`
5. "Meera sits next to Diya." → kind: `next-to`, args: `["meera", "diya"]`

**Solution (seat → chip):** `{ "1": "kabir", "2": "diya", "3": "meera", "4": "rohan", "5": "arjun", "6": "anu" }`
**Answer payload:** `{ seating: { "1": "kabir", "2": "diya", "3": "meera", "4": "rohan", "5": "arjun", "6": "anu" }, distractor: "kavya" }`
**Uniqueness check:** Enumerated all 5040 arrangements; only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused", "between-constraint-misread", "next-to-constraint-overlooked", "distractor-not-recognised"]`

---

## Set C

Chip name bank: `tara, rohan, priya, bobby, neha, ravi, kavya`.

### C_r1 — Stage 1, Round 1

**Chips:** `tara, rohan, priya, bobby`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Tara sits in seat 1." → kind: `seat-pin`, args: `["tara", 1]`
2. "Rohan is across from Tara." → kind: `across-from`, args: `["rohan", "tara"]`
3. "Priya sits to the left of Rohan." → kind: `left-of`, args: `["priya", "rohan"]`

**Solution (seat → chip):** `{ "1": "tara", "2": "bobby", "3": "rohan", "4": "priya" }`
**Answer payload:** `{ seating: { "1": "tara", "2": "bobby", "3": "rohan", "4": "priya" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused"]`

### C_r2 — Stage 1, Round 2

**Chips:** `tara, rohan, priya, bobby`
**Distractor:** none
**Seats:** 1 (top), 2 (right), 3 (bottom), 4 (left)
**Clues:**
1. "Bobby sits in seat 2." → kind: `seat-pin`, args: `["bobby", 2]`
2. "Rohan sits to the left of Bobby." → kind: `left-of`, args: `["rohan", "bobby"]`
3. "Tara is across from Bobby." → kind: `across-from`, args: `["tara", "bobby"]`

**Solution (seat → chip):** `{ "1": "priya", "2": "bobby", "3": "rohan", "4": "tara" }`
**Answer payload:** `{ seating: { "1": "priya", "2": "bobby", "3": "rohan", "4": "tara" }, distractor: null }`
**Uniqueness check:** Enumerated all 24 arrangements; only 1 satisfies all 3 clues.
**Misconception tags:** `["absolute-seat-pin-overlooked", "left-right-orientation-confused", "across-from-constraint-overlooked"]`

### C_r3 — Stage 2, Round 3

**Chips:** `neha, tara, rohan, priya, bobby`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Neha is at the head of the table." → kind: `head-of-table`, args: `["neha"]`
2. "Tara sits next to Neha." → kind: `next-to`, args: `["tara", "neha"]`
3. "Rohan sits between Tara and Bobby." → kind: `between`, args: `["rohan", "tara", "bobby"]`
4. "Priya sits to the left of Neha." → kind: `left-of`, args: `["priya", "neha"]`

**Solution (seat → chip):** `{ "1": "neha", "2": "priya", "3": "bobby", "4": "tara", "5": "rohan" }`
**Answer payload:** `{ seating: { "1": "neha", "2": "priya", "3": "bobby", "4": "tara", "5": "rohan" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "next-to-constraint-overlooked", "between-constraint-misread", "left-right-orientation-confused"]`

### C_r4 — Stage 2, Round 4

**Chips:** `neha, tara, rohan, priya, bobby`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Bobby is at the head of the table." → kind: `head-of-table`, args: `["bobby"]`
2. "Tara sits to the left of Bobby." → kind: `left-of`, args: `["tara", "bobby"]`
3. "Priya sits between Bobby and Rohan." → kind: `between`, args: `["priya", "bobby", "rohan"]`
4. "Neha is across from Rohan." → kind: `across-from`, args: `["neha", "rohan"]`

**Solution (seat → chip):** `{ "1": "bobby", "2": "tara", "3": "neha", "4": "priya", "5": "rohan" }`
**Answer payload:** `{ seating: { "1": "bobby", "2": "tara", "3": "neha", "4": "priya", "5": "rohan" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "between-constraint-misread", "across-from-constraint-overlooked"]`

### C_r5 — Stage 2, Round 5

**Chips:** `neha, tara, rohan, priya, bobby`
**Distractor:** none
**Seats:** 1 (head/top), 2, 3, 5, 4 (clockwise from head)
**Clues:**
1. "Rohan is at the head of the table." → kind: `head-of-table`, args: `["rohan"]`
2. "Bobby sits to the left of Rohan." → kind: `left-of`, args: `["bobby", "rohan"]`
3. "Neha sits next to Bobby." → kind: `next-to`, args: `["neha", "bobby"]`
4. "Tara sits between Neha and Priya." → kind: `between`, args: `["tara", "neha", "priya"]`

**Solution (seat → chip):** `{ "1": "rohan", "2": "bobby", "3": "neha", "4": "priya", "5": "tara" }`
**Answer payload:** `{ seating: { "1": "rohan", "2": "bobby", "3": "neha", "4": "priya", "5": "tara" }, distractor: null }`
**Uniqueness check:** Enumerated all 120 arrangements; only 1 satisfies all 4 clues.
**Misconception tags:** `["head-anchor-overlooked", "left-right-orientation-confused", "next-to-constraint-overlooked", "between-constraint-misread"]`

### C_r6 — Stage 3, Round 6

**Chips:** `tara, rohan, priya, bobby, neha, ravi, kavya`
**Distractor:** `kavya` (never named in any clue)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Tara is at the head of the table." → kind: `head-of-table`, args: `["tara"]`
2. "Rohan is across from Tara." → kind: `across-from`, args: `["rohan", "tara"]`
3. "Priya sits between Bobby and Rohan." → kind: `between`, args: `["priya", "bobby", "rohan"]`
4. "Neha is NOT next to Rohan." → kind: `not-next-to`, args: `["neha", "rohan"]`
5. "Ravi sits to the left of Rohan." → kind: `left-of`, args: `["ravi", "rohan"]`

**Solution (seat → chip):** `{ "1": "tara", "2": "bobby", "3": "priya", "4": "rohan", "5": "ravi", "6": "neha" }`
**Answer payload:** `{ seating: { "1": "tara", "2": "bobby", "3": "priya", "4": "rohan", "5": "ravi", "6": "neha" }, distractor: "kavya" }`
**Uniqueness check:** Enumerated all 5040 arrangements; only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "between-constraint-misread", "negation-clue-misread", "left-right-orientation-confused", "distractor-not-recognised"]`

### C_r7 — Stage 3, Round 7

**Chips:** `tara, rohan, priya, bobby, neha, ravi, kavya`
**Distractor:** `bobby` (different chip than R6's `kavya`; never named in any clue here)
**Seats:** 1 (head/top), 2, 3, 4 (foot/bottom), 5, 6 (clockwise from head)
**Clues:**
1. "Ravi is at the head of the table." → kind: `head-of-table`, args: `["ravi"]`
2. "Tara is across from Ravi." → kind: `across-from`, args: `["tara", "ravi"]`
3. "Kavya sits to the left of Ravi." → kind: `left-of`, args: `["kavya", "ravi"]`
4. "Neha sits between Tara and Priya." → kind: `between`, args: `["neha", "tara", "priya"]`
5. "Rohan sits next to Kavya." → kind: `next-to`, args: `["rohan", "kavya"]`

**Solution (seat → chip):** `{ "1": "ravi", "2": "kavya", "3": "rohan", "4": "tara", "5": "neha", "6": "priya" }`
**Answer payload:** `{ seating: { "1": "ravi", "2": "kavya", "3": "rohan", "4": "tara", "5": "neha", "6": "priya" }, distractor: "bobby" }`
**Uniqueness check:** Enumerated all 5040 arrangements; only 1 satisfies all 5 clues.
**Misconception tags:** `["head-anchor-overlooked", "across-from-constraint-overlooked", "left-right-orientation-confused", "between-constraint-misread", "next-to-constraint-overlooked", "distractor-not-recognised"]`
