# Pattern 16: Sequence Replay (Observe → Reproduce)

### Description

Student watches elements flash in sequence, then taps them in the same order to reproduce the sequence.

### Used by: Simon Says

### Interaction Flow

```
OBSERVE PHASE:
  Element 1 flashes (highlight 600ms, pause 300ms)
  Element 2 flashes
  ...
  Element N flashes
  ↓
RESPOND PHASE:
  Student taps Element 1
  → Correct? → highlight, fire-and-forget SFX, advance step
  → Wrong? → flash wrong, wrong SFX, life lost, round fails
  Student taps Element 2
  ...
  Student taps Element N
  → Sequence complete → awaited SFX + TTS → next round (longer sequence)
```

### State Machine

```
IDLE
  ↓ round starts
OBSERVING (interaction disabled)
  ↓ sequence playback complete
RESPONDING (interaction enabled)
  ↓ correct tap → increment currentStep
  ↓ wrong tap → ROUND_FAILED
  ↓ all taps correct → ROUND_COMPLETE
```

### Event Handling

```javascript
// Playback (observe phase)
async function playSequence() {
  gameState.phase = 'observing';

  for (var i = 0; i < gameState.sequence.length; i++) {
    var elementIndex = gameState.sequence[i];
    highlightElement(elementIndex);
    await delay(600); // Flash duration
    unhighlightElement(elementIndex);
    await delay(300); // Pause between flashes
  }

  gameState.phase = 'responding';
  gameState.currentStep = 0;
  gameState.playerSequence = [];
}

// Respond phase
function handleElementTap(index) {
  if (gameState.phase !== 'responding') return;
  if (gameState.isProcessing || !gameState.isActive) return;

  gameState.playerSequence.push(index);

  // Flash the tapped element
  highlightElement(index);
  setTimeout(function() { unhighlightElement(index); }, 300);

  if (index === gameState.sequence[gameState.currentStep]) {
    // Correct
    FeedbackManager.sound.play('correct_sound_effect').catch(function() {});
    gameState.currentStep++;

    if (gameState.currentStep >= gameState.sequence.length) {
      // Sequence complete
      sequenceComplete();
    }
  } else {
    // Wrong
    FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});
    gameState.lives--;
    syncDOM();
    if (progressBar) progressBar.update(gameState.currentRound + 1, Math.max(0, gameState.lives));

    if (gameState.lives <= 0) {
      endGame('game_over');
    } else {
      // Replay the sequence for retry
      setTimeout(function() { playSequence(); }, 1000);
    }
  }
}

function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}
```

### CSS

```css
.simon-quadrant {
  min-height: 100px;
  border-radius: 12px;
  cursor: pointer;
  touch-action: manipulation;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.simon-quadrant.flash {
  opacity: 1;
  box-shadow: 0 0 20px rgba(255,255,255,0.5);
}
.simon-quadrant.q-red { background: #e57373; }
.simon-quadrant.q-blue { background: #64b5f6; }
.simon-quadrant.q-green { background: #81c784; }
.simon-quadrant.q-yellow { background: #fff176; }

/* During observe phase — no pointer events */
.observing .simon-quadrant {
  pointer-events: none;
  cursor: default;
}
```
