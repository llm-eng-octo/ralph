# PART-024: TransitionScreen Component (v2)

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-002, PART-025

---

> ⚠️ **v2 Update:** TransitionScreen is now **MANDATORY** for all games (not conditional). Every game needs welcome, results, and optionally level transition screens. Additionally, **every transition screen MUST play audio** — silent transitions are not mathai-equivalent.

## Code

```javascript
var transitionScreen = new TransitionScreenComponent({
  autoInject: true  // Injects into #mathai-transition-slot
});
```

## show() Options

| Option | Type | Description |
|--------|------|-------------|
| `icons` | array/string | Emoji icons (e.g., `['🎮']`) |
| `iconSize` | string | `'small'` (48px), `'normal'` (72px), `'large'` (96px) |
| `stars` | number | Show SVG stars (0-3) instead of icons |
| `title` | string | Main title text |
| `subtitle` | string | Subtitle text |
| `buttons` | array | `[{ text, type, action, styles }]` |
| `duration` | number | Auto-hide after ms (only if no buttons and not persist) |
| `persist` | boolean | Never auto-hide |
| `content` | string/HTMLElement | **v2: Custom HTML injected into card's content slot** |
| `styles` | object | **v2: Per-element style overrides** |
| `titleStyles` | object | Custom CSS for title (v1 compat) |
| `subtitleStyles` | object | Custom CSS for subtitle (v1 compat) |

### v2 `styles` Object

```javascript
transitionScreen.show({
  // ...
  styles: {
    screen: { background: 'rgba(0,0,0,0.6)' },
    card: { background: '#1a1a2e', borderRadius: '28px' },
    title: { color: '#ffffff', fontSize: '36px' },
    subtitle: { color: '#a0a0b0' },
    icons: { /* ... */ },
    buttons: { /* ... */ },
    custom: { /* ... */ }
  }
});
```

### v2 `content` Slot

Inject custom HTML (e.g., results metrics) into the transition card:

```javascript
var metricsHTML = '<div class="results-metrics">...</div>';
transitionScreen.show({
  stars: 3,
  title: 'Great Job!',
  content: metricsHTML,  // HTML string or DOM element
  persist: true,
  buttons: [{ text: 'Play Again', type: 'primary', action: function() { restartGame(); } }]
});
```

## MANDATORY: Audio on Every Transition Screen

**Every `transitionScreen.show()` call MUST be accompanied by audio.** Silent transitions are not mathai-equivalent.

| Screen | Audio | Await? |
|--------|-------|--------|
| Welcome | `vo_game_start` | Yes |
| Level Transition | `vo_level_start_N` | Yes |
| Victory / Results | `sound_game_complete` | Yes (play BEFORE showing) |
| Game Over | `sound_game_over` | Yes (play BEFORE showing) |

## Required Screen Patterns

### Welcome Screen (MANDATORY)

```javascript
async function showWelcomeScreen() {
  // Show instructions
  var questionSlot = document.getElementById('mathai-question-slot');
  if (questionSlot) questionSlot.style.display = '';

  transitionScreen.show({
    title: 'Game Title Here',
    buttons: [{
      text: 'Start Game',
      type: 'primary',
      action: function() { startGame(); }
    }]
  });

  // MANDATORY: Play voiceover
  if (!voGameStartPlayed) {
    voGameStartPlayed = true;
    try {
      await FeedbackManager.sound.play('vo_game_start', {
        sticker: { image: 'URL.gif', duration: 3000, type: 'IMAGE_GIF' }
      });
    } catch (e) { /* handle gracefully */ }
  }
}
```

### Level Transition (if multi-level)

```javascript
async function showLevelTransition(level) {
  transitionScreen.show({
    title: 'Level ' + level,
    buttons: [{
      text: "I'm ready! 💪",
      type: 'primary',
      action: function() { startLevel(); }
    }]
  });

  // MANDATORY: Play level voiceover
  try {
    await FeedbackManager.sound.play('vo_level_start_' + level, {
      sticker: { image: 'URL.gif', duration: 3000, type: 'IMAGE_GIF' }
    });
  } catch (e) { /* handle gracefully */ }
}
```

### Victory / Results (MANDATORY)

```javascript
async function showResults(metrics, reason) {
  var metricsHTML = '<div class="results-metrics">...</div>';

  // MANDATORY: Play sound BEFORE showing results
  try {
    if (reason === 'victory') {
      await FeedbackManager.sound.play('sound_game_complete', {
        sticker: { image: 'URL.gif', duration: 3000, type: 'IMAGE_GIF' }
      });
    } else {
      await FeedbackManager.sound.play('sound_game_over');
    }
  } catch (e) { /* handle gracefully */ }

  transitionScreen.show({
    stars: metrics.stars,
    title: reason === 'victory' ? 'Great Job!' : 'Game Over',
    content: metricsHTML,
    buttons: [{ text: 'Play Again', type: 'primary', action: function() { restartGame(); } }],
    persist: true,
    styles: { title: { fontSize: '36px', color: '#2D1448' } }
  });
}
```

## Button Types

| Type | Color | Usage |
|------|-------|-------|
| `'primary'` | Green (`--mathai-green`) | Main action |
| `'secondary'` | Blue (`--mathai-blue`) | Alternative action |
| `'outline'` | Border only | Tertiary action (e.g., Retry) |

## CRITICAL: Results via Content Slot, NOT Separate Div

TransitionScreen hides `#gameContent` when shown. A `#results-screen` inside `#gameContent` would be hidden too. Always use the `content` property to inject results into the transition card. See PART-019 for details.

## Common Issue: duration + buttons

Do NOT combine `duration` with `buttons` on the same screen — the screen may auto-hide before the user clicks. Use one or the other.

## Requires ScreenLayout v2

```javascript
ScreenLayout.inject('app', {
  sections: { questionText: true, progressBar: true, playArea: true, transitionScreen: true }
});
```

## Deprecated: v1 Patterns

```javascript
// ⛔ DEPRECATED: Using ScreenLayout v1 slots
ScreenLayout.inject('app', { slots: { transitionScreen: true } });

// ⛔ DEPRECATED: Using #results-screen div
document.getElementById('results-screen').style.display = 'block';
```

## Verification

- [ ] `TransitionScreenComponent` instantiated with `autoInject: true`
- [ ] Welcome screen shown before gameplay with `vo_game_start` audio
- [ ] **Every transition screen plays audio** — no silent transitions
- [ ] Victory/results shown via `transitionScreen.show({ content: metricsHTML, persist: true })`
- [ ] Game over shown via TransitionScreen (not a separate div)
- [ ] Level transitions exist (if multi-level) with `vo_level_start_N` audio
- [ ] ScreenLayout has `sections.transitionScreen: true`
- [ ] No `#results-screen` div in HTML (use content slot instead)
- [ ] No mix of `duration` + `buttons` on same screen
- [ ] `voGameStartPlayed` guard prevents duplicate welcome VO

## Source Code

Full TransitionScreenComponent implementation: `warehouse/packages/components/transition-screen/index.js`
