# Pattern 12: Tap-to-Assign (Palette)

### Description

Student selects a colour/category from a palette, then taps items to assign that colour to them.

### Used by: Colour Coding Tool

### Interaction Flow

```
Student sees a colour palette (4 swatches) + number chips + input field
  ↓
Student taps a colour swatch → swatch becomes active (.palette-active)
  ↓
Student taps number chips → chip gets coloured with active colour
  ↓ (fire-and-forget tap SFX per assignment)
Student taps same chip with different colour → colour changes
  ↓
Student types total sum into input field
  ↓
Student taps Check → evaluate sum
```

### Event Handling

```javascript
var activePalette = null;
var assignments = {}; // itemIndex → colour

function handlePaletteSelect(colour) {
  document.querySelectorAll('.palette-swatch').forEach(function(s) {
    s.classList.remove('palette-active');
  });
  document.querySelector('[data-colour="' + colour + '"]').classList.add('palette-active');
  activePalette = colour;
}

function handleChipTap(index) {
  if (!activePalette || gameState.isProcessing) return;

  // Assign colour
  assignments[index] = activePalette;
  var chip = getChip(index);
  // Remove all colour classes
  chip.className = chip.className.replace(/colour-\w+/g, '');
  chip.classList.add('colour-' + activePalette);

  FeedbackManager.sound.play('tap_sound').catch(function() {});
}
```

### CSS

```css
.palette-swatch {
  min-height: 44px; min-width: 44px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  touch-action: manipulation;
}
.palette-active { border-color: var(--mathai-black); box-shadow: 0 0 0 2px var(--mathai-blue); }
.colour-red { background: #e57373; }
.colour-blue { background: #64b5f6; }
.colour-green { background: #81c784; }
.colour-yellow { background: #fff176; }
.number-chip {
  min-height: 44px; padding: 8px 14px;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
```
