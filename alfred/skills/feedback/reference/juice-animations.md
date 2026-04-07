The 7 required micro-animations every game ships with, plus CSS classes, application code, and the round presentation sequence that defines what the student sees before they can interact.

## Required Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Score bounce | Correct answer (score increments) | `.score-bounce` | 400ms |
| Shake | Wrong answer (on selected option) | `.shake-wrong` | 500ms |
| Confetti/celebration | Victory (game complete with score > 0) | FeedbackManager sticker or `@keyframes confettiFall` | 2000ms |
| Heart break / life lost | Life lost (wrong answer in lives game) | `.heart-break` | 600ms |
| Fade-in | New round appears | `.fade-in` | 350ms |
| Star pop | Star earned on results screen | `.star-earned` | 400ms |
| Streak glow | 3+ correct streak | `.streak-glow` | 600ms |

## CSS Keyframes

```css
/* Score bounces up when incremented */
@keyframes scoreBounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Wrong option shakes left-right */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* Round content fades in from below */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stars pop in on results screen */
@keyframes starPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Life icon breaks/fades when lost */
@keyframes heartBreak {
  0% { transform: scale(1); opacity: 1; }
  30% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.5); opacity: 0; color: var(--mathai-red); }
}

/* Score area pulses gold on streaks */
@keyframes streakGlow {
  0% { box-shadow: 0 0 0 rgba(255, 193, 7, 0); }
  50% { box-shadow: 0 0 16px rgba(255, 193, 7, 0.5); }
  100% { box-shadow: 0 0 0 rgba(255, 193, 7, 0); }
}

/* Confetti particles (lightweight version) */
@keyframes confettiFall {
  0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
```

## CSS Classes

```css
.score-bounce { animation: scoreBounce 0.4s ease; }
.shake-wrong { animation: shake 0.5s ease; }
.heart-break { animation: heartBreak 0.6s ease forwards; }
.star-earned { animation: starPop 0.4s ease forwards; }
.streak-glow { animation: streakGlow 0.6s ease; }
.fade-in { animation: fadeIn 0.35s ease; }
```

## Applying Animations

```javascript
// Score bounce on correct:
var scoreEl = document.getElementById('score-display');
if (scoreEl) {
  scoreEl.classList.remove('score-bounce');
  void scoreEl.offsetWidth; // force reflow to restart animation
  scoreEl.classList.add('score-bounce');
}

// Shake on wrong:
selectedOption.classList.add('shake-wrong');
setTimeout(function() {
  selectedOption.classList.remove('shake-wrong');
}, 500);

// Heart break on life lost:
var hearts = document.querySelectorAll('.life-icon');
var lostHeart = hearts[gameState.lives]; // the one just lost (0-indexed after decrement)
if (lostHeart) {
  lostHeart.classList.add('heart-break');
}
```

## Round Presentation Sequence

What the student sees BEFORE they can interact. This is the "question preview" phase -- distinct from feedback (which is after).

### Phase Sequence Within Each Round

```
1. Question preview  ->  2. Instructions (if needed)  ->  3. Media (if any)  ->  4. Gameplay reveal
```

### Phase 1: Question Preview

- The question text or prompt appears on screen
- Images/diagrams (if any) load alongside the text
- Gameplay elements (buttons, inputs, drag targets) are NOT yet visible or are disabled
- Duration: immediate render, no artificial delay
- Skippable: no (it is instant)

### Phase 2: Instructions (Conditional)

- Shown ONLY when the round type changes from the previous round or on the first round of the game
- Display: inline text above the question area, styled distinctly (lighter weight, smaller font)
- Duration: persistent -- stays visible during gameplay (does not auto-dismiss)
- Skippable: n/a (it does not block)

### Phase 3: Media (Conditional)

- If the round has audio (TTS reading the question): plays automatically after question renders
- If the round has video/animation: plays in a designated media area
- Duration: length of the audio/video clip
- Skippable: YES -- student can tap anywhere or tap a "Skip" button
- If media fails to load: skip silently, proceed to gameplay reveal (sound independence per 8.6)

### Phase 4: Gameplay Reveal

- Interaction elements appear (option buttons, input fields, drag targets)
- Elements animate in with `fadeIn` (350ms)
- Input is unblocked -- student can now act
- This is the moment the round timer starts (if the game has per-round timing)

### Timing Summary

| Phase | Typical duration | Blocks input? | Skippable? |
|-------|-----------------|---------------|------------|
| Question preview | 0ms (instant render) | Yes (no gameplay elements yet) | No |
| Instructions | Persistent (no duration) | No (non-blocking overlay) | N/A |
| Media (audio/video) | Clip length (1-5s typical) | Yes (gameplay not revealed yet) | Yes (tap to skip) |
| Gameplay reveal | 350ms (fade-in animation) | No (input unblocks after fade) | No |

### Between-Round Sequence

```
Feedback duration elapses (1500-2000ms)
  -> Current round fades out (300ms)
    -> Next round question preview renders (instant)
      -> Next round gameplay reveals (350ms fade-in)
        -> Input unblocks
```

Total between-round dead time: ~650ms of animation.
