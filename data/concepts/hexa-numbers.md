### Game Concept: Hexa Numbers — Hexagon Sum Overlap Puzzle

This is a drag-and-drop placement puzzle built on a honeycomb of hexagonal cells. Three dark-gray target hexagons are pre-labelled with sum values, and the student must drag numbered hexagons from a pool into the surrounding blank cells so that the hexagons adjacent to each target add up to the target's displayed value. Colour-coded blanks enforce that certain numbers can only go in certain positions.

### Core Mechanics & Interface

* **Status Bar:** The header shows a timer "00:03", a progress readout "0/10", and a star progress icon.
* **Workspace Grid:** A **non-rectangular honeycomb cross** of square-ish hex slots. Three **dark-green filled target hexagons** (**4279** top-left, **7248** top-right, **9346** bottom-centre, forming a downward-pointing triangle) sit at the heart of the workspace, each **completely surrounded by a ring of six adjacent slot hexagons** sharing edges with the target. The three targets also share some of their neighbour slots with each other, so the puzzle has a tight interlocking tri-cluster shape rather than three isolated rings. Blank slots are painted in two colours: **light-cyan/blue blanks** (6 total, positioned as the direct inner ring around each target) and **white blanks with thin gray borders** (7 total, positioned as the outer halo above each of the top targets and below the bottom target).
* **Hexagon Pool:** Mounted below the workspace in a light-gray rounded-rectangle tray, a **4-row hexagon palette** holding 13 draggable hexagons split by colour. Row 1: white **6**, white **30**, white **40**, white **100**. Row 2: white **200**, white **2000**, white **5000**, blue **2**. Row 3: blue **3**, blue **40**, blue **200**, blue **4000**. Row 4: a single centred blue **5000**. Colour-gating is strict — each hex can be used only once and must land in a matching-colour blank.
* **Progression:** The puzzle is a single round. The intro reads, "Arrange all the hexagons such that their sum equals the centre. 1⃣ Drag and drop the blue hexagons in the blue blanks, and 2⃣ White hexagons in the white blanks. You can drag and drop each hexagon only once."

### Behaviors and Interactions

* **Drag-and-Drop:** The student drags a numbered hexagon from the pool and drops it into a blank of the matching colour. Each hexagon from the pool can only be placed once, so the student must plan combinations rather than experiment freely.

### Victory / Completion

All 13 blank hexagons are filled with the correct pool values such that every hexagon surrounding each of the three targets (4279, 7248, 9346) sums to that target's displayed value.

### Variant Progression

All three variants share the same three target values (4279, 7248, 9346), the same white/blue colour-gated drop rule, and the "each hexagon can be used only once" constraint. Minor surface differences:
* **B1 (canonical, 310525):** Target hexagons rendered in dark gray; rules numbered 1⃣ / 2⃣.
* **B2 (310526):** Target hexagons rendered in dark green; rules printed as plain 1./2.
* **B3 (310527):** Target hexagons rendered in dark green; rules numbered with 1️⃣ / 2️⃣.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 2, chunk "Hexa Numbers" (block 310525; block_count 3). Screenshots: 16483_303500_0.png.
