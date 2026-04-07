# PART-019: Results Screen UI

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-011, PART-024

---

> ⛔ **DEPRECATED (v1):** The standalone `#results-screen` HTML div approach is **deprecated**. All new games MUST show results via **TransitionScreen v2 content slot** (PART-024). TransitionScreen hides `#gameContent` when shown — any results div inside `#gameContent` would be hidden. Using the TransitionScreen content slot avoids this issue entirely.

## v2 Approach — Results via TransitionScreen Content Slot (REQUIRED)

```javascript
function showResults(metrics, reason) {
  // Build metrics HTML for the TransitionScreen content slot
  var metricsHTML =
    '<div class="results-metrics">' +
      '<div class="metric-row">' +
        '<span class="metric-label">Time</span>' +
        '<span class="metric-value">' + metrics.time + 's</span>' +
      '</div>' +
      '<div class="metric-row">' +
        '<span class="metric-label">Avg. Speed</span>' +
        '<span class="metric-value">' + metrics.avgTimePerRound + 's/round</span>' +
      '</div>' +
      '<div class="metric-row">' +
        '<span class="metric-label">Accuracy</span>' +
        '<span class="metric-value">' + metrics.accuracy + '%</span>' +
      '</div>' +
    '</div>';

  transitionScreen.show({
    stars: metrics.stars,
    title: reason === 'victory' ? 'Great Job!' : 'Game Over',
    content: metricsHTML,
    buttons: [{
      text: 'Play Again',
      type: 'primary',
      action: function() { restartGame(); }
    }],
    persist: true,
    styles: {
      title: { fontSize: '36px', color: '#2D1448' }
    }
  });
}
```

## Required CSS for Metrics

```css
.results-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
  text-align: left;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--mathai-light-gray);
}

.metric-label {
  color: var(--mathai-gray);
  font-size: var(--mathai-font-size-label);
}

.metric-value {
  font-weight: 700;
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-black);
}
```

## Customization

Add game-specific metrics as additional `metric-row` elements in the HTML string:

```javascript
var metricsHTML =
  '<div class="results-metrics">' +
    // ... standard metrics ...
    '<div class="metric-row">' +
      '<span class="metric-label">Streak</span>' +
      '<span class="metric-value">' + metrics.streak + '</span>' +
    '</div>' +
  '</div>';
```

## CRITICAL: Why Not a Separate #results-screen Div?

TransitionScreen toggles `#gameContent` visibility:
- `show()` sets `#gameContent.style.display = 'none'`
- `hide()` sets `#gameContent.style.display = 'block'`

If `#results-screen` is inside `#gameContent`, it gets hidden when TransitionScreen shows — defeating the purpose. Using the `content` slot of TransitionScreen avoids this entirely.

## Audio on Results (MANDATORY)

Results must be shown AFTER playing the appropriate sound:

```javascript
// Victory
await FeedbackManager.sound.play('sound_game_complete', {
  sticker: { image: 'URL.gif', duration: 3000, type: 'IMAGE_GIF' }
});
showResults(metrics, 'victory');

// Game Over
await FeedbackManager.sound.play('sound_game_over');
showResults(metrics, 'game_over');
```

---

## Legacy v1 Approach (DEPRECATED)

> ⛔ The HTML below is deprecated. Do not use in new games.

```html
<!-- ⛔ DEPRECATED: Use TransitionScreen content slot instead -->
<div id="results-screen" style="display:none;">
  <div class="results-container">
    <h2 id="results-title">Game Complete!</h2>
    <div id="stars-display" class="stars-display"></div>
    <div class="results-metrics">
      <div class="metric-row">
        <span class="metric-label">Score</span>
        <span id="result-score" class="metric-value">0%</span>
      </div>
    </div>
    <button onclick="location.reload()">Play Again</button>
  </div>
</div>
```

## Verification

- [ ] ⛔ NOT using standalone `#results-screen` div (deprecated)
- [ ] Results shown via `transitionScreen.show({ content: metricsHTML, persist: true })`
- [ ] Stars passed to TransitionScreen (`stars: metrics.stars`)
- [ ] "Play Again" button calls `restartGame()` (not `location.reload()`)
- [ ] Audio played BEFORE showing results screen
- [ ] Metrics HTML includes all relevant game stats
- [ ] `.results-metrics` CSS defined for layout
