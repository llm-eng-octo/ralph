# Deprecated P4 Swipe Detection

P4 (Tap + Swipe) is deprecated. Do not use this material in new games. Convert spec keywords like "swipe", "slide", and "push" to P1 tap-only with directional buttons.

This file exists only for legacy maintenance of old games that still contain swipe code.

The historical swipe lifecycle attached `pointerdown` to the grid and `pointerup` to `document`, recorded `startX` / `startY` on press, computed direction from the delta on release, and used a 30px threshold to distinguish tap from swipe:

```javascript
var SWIPE_THRESHOLD = 30;

function detectSwipe(startX, startY, endX, endY) {
  var dx = endX - startX;
  var dy = endY - startY;
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}
```
