# Observe Phase Implementation (Generic)

For any game with a memorize/observe phase:

```javascript
// Start observe phase
async function startObservePhase(round) {
  gameState.phase = 'observing';
  syncDOM(); // data-phase="observing"

  // Show content (grid, sequence, pairs, etc.)
  renderObserveContent(round);

  // Wait for observe duration
  if (round.observeType === 'timed') {
    // Show countdown
    await countdownTimer(round.observeDuration);
  } else if (round.observeType === 'sequential') {
    // Play items one by one
    for (var i = 0; i < round.items.length; i++) {
      showItem(round.items[i]);
      await delay(round.itemDuration || 1000);
      hideItem(round.items[i]);
      await delay(300);
    }
  }

  // Hide content (for memorize games)
  hideObserveContent();

  // Enable interaction
  gameState.phase = 'responding';
  syncDOM();
  renderResponseUI(round);
}

// Guard in ALL interaction handlers:
function handleAnyInteraction() {
  if (gameState.phase === 'observing') return; // Block during observe
  // ... normal handling
}
```
