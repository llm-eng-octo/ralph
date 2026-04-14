# Pattern 14: Edge/Segment Toggle

### Description

Student taps between dots/nodes to toggle line segments on/off, building a closed loop.

### Used by: Loop the Loop

### Event Handling

```javascript
// Edges rendered as clickable elements between dot pairs
function renderEdges() {
  for (var r = 0; r <= gridSize; r++) {
    for (var c = 0; c <= gridSize; c++) {
      // Horizontal edge (right of dot)
      if (c < gridSize) {
        var hEdge = createEdgeElement('h', r, c);
        hEdge.addEventListener('click', function() {
          handleEdgeToggle(this.dataset.type, parseInt(this.dataset.row), parseInt(this.dataset.col));
        });
        edgeContainer.appendChild(hEdge);
      }
      // Vertical edge (below dot)
      if (r < gridSize) {
        var vEdge = createEdgeElement('v', r, c);
        vEdge.addEventListener('click', function() {
          handleEdgeToggle(this.dataset.type, parseInt(this.dataset.row), parseInt(this.dataset.col));
        });
        edgeContainer.appendChild(vEdge);
      }
    }
  }
}

function handleEdgeToggle(type, row, col) {
  if (gameState.isProcessing || gameState.solved) return;

  var key = type + '_' + row + '_' + col;
  if (gameState.edges[key]) {
    gameState.edges[key] = false;
    getEdgeElement(key).classList.remove('edge-on');
  } else {
    gameState.edges[key] = true;
    getEdgeElement(key).classList.add('edge-on');
  }

  FeedbackManager.sound.play('tap_sound').catch(function() {});

  // Check constraints
  checkConstraintViolations();

  // Auto-validate if valid loop detected
  if (isValidClosedLoop()) {
    handlePuzzleSolved();
  }
}
```

### CSS

```css
.edge {
  position: absolute;
  cursor: pointer;
  touch-action: manipulation;
}
/* Hit area — 44px minimum even though visual line is thin */
.edge.horizontal {
  width: var(--cell-size);
  height: 44px;
  margin-top: -22px; /* center on the line */
}
.edge.vertical {
  width: 44px;
  height: var(--cell-size);
  margin-left: -22px;
}
/* Visual line inside the hit area */
.edge::after {
  content: '';
  position: absolute;
  background: transparent;
  transition: background 0.15s;
}
.edge.horizontal::after {
  width: 100%; height: 4px;
  top: 50%; transform: translateY(-50%);
}
.edge.vertical::after {
  height: 100%; width: 4px;
  left: 50%; transform: translateX(-50%);
}
.edge.edge-on::after { background: var(--mathai-blue); }
.edge.constraint-violation::after { background: var(--mathai-red); }

.dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--mathai-black);
  position: absolute;
  z-index: 2;
}
.clue-number {
  position: absolute;
  font-size: 16px; font-weight: bold;
  text-align: center;
}
```
