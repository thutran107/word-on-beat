# UI Enhancements: Turn-Done Modal + Beat Pop Animation
**Date:** 2026-05-13  
**Scope:** Three visual improvements to the play experience

---

## 1. Turn-Done Overlay — Dark Cosmic Theme + Larger Text

### Problem
The current `intro-ring` class renders a cream (#fff5e0) circle with coral-colored text on top. Coral on cream is low-contrast and hard to read for an audience. Text sizes are also too small (16px main, 12px sub) for a game shown on a screen.

### Solution
Introduce a new CSS class `turn-done-ring` (distinct from `.intro-ring` which is used for the "Feel the beat" intro and stays as-is). The turn-done ring follows the dark cosmic aesthetic used throughout the play screen.

**Visual spec:**
- Circle diameter: 380px (was 280px)
- Background: deep cosmic dark with subtle radial glow — `radial-gradient(circle at 50% 40%, #1a1640 0%, #0a0b1e 65%, #06081a 100%)`
- Border ring: 6px solid with purple glow — `box-shadow: 0 0 0 6px rgba(140,120,255,0.9), 0 0 60px rgba(140,120,255,0.35), 0 24px 80px rgba(0,0,0,0.6)`
- Continues the `ringPulse` animation (subtle breathing scale)

**Text spec:**
| Element | Current | New |
|---|---|---|
| Icon (✓ / 🎉) | fontSize 46 | fontSize 72 |
| Main text ("Player done!" / "Game complete!") | 16px coral | 32px `#f4f0ff` |
| Sub-text ("Next level dropping…") | 12px `rgba(220,225,255,0.55)` | 18px `rgba(220,225,255,0.7)` |
| Button ("Next player →") | unchanged | unchanged (existing `.btn.primary` on cosmic shell) |

**Implementation:** Replace the `className="intro-ring"` + inline `style={{ width:280, height:280 }}` in the `turnDone` block with `className="turn-done-ring"`. The intro overlay block (Feel the beat) keeps its `intro-ring` class unchanged.

---

## 2. Beat Pop Animation — Speed and Intensity Tied to BPM

### Problem
The `just-popped` animation (`popIn`, 0.35s) and the `flashPulse` animation (0.4s) are hardcoded. At Hard level (150 BPM, 400ms beat interval) the tile pop feels slow relative to the beat. The audience can't feel the tempo accelerating as levels increase.

### Solution
Use CSS custom properties set inline on the play grid container, computed from the live BPM in React. Three properties drive the effect:

| CSS Variable | Purpose | Formula |
|---|---|---|
| `--pop-dur` | `popIn` animation duration | `max(0.18, 60/bpm × 0.55)` seconds |
| `--flash-dur` | `flashPulse` animation duration | `max(0.15, 60/bpm × 0.45)` seconds |
| `--hit-scale` | `beat-hit` transform scale | easy=1.06, medium=1.10, hard=1.15 |

**Computed values per level at default BPMs:**

| Level | BPM | `--pop-dur` | `--flash-dur` | `--hit-scale` |
|---|---|---|---|---|
| Easy 🍋 | 120 | 0.28s | 0.23s | 1.06 |
| Medium 🌶️ | 120 | 0.28s | 0.23s | 1.10 |
| Hard 🌟 | 150 | 0.22s | 0.18s | 1.15 |

Easy and Medium share BPM at default config, so the differentiation is the scale intensity (subtle vs medium jump). Hard is faster AND more dramatic.

If a user tweaks BPM via the panel (e.g. Easy to 90 BPM), pop duration auto-adjusts to 0.37s — slower tiles to match the slower beat. No code change needed.

**CSS changes:**
```css
.tile.just-popped {
  animation: popIn var(--pop-dur, 0.35s) cubic-bezier(.34,1.56,.64,1);
}
.tile.beat-hit {
  transform: scale(var(--hit-scale, 1.08));
}
.tile.beat-hit::after {
  animation: flashPulse var(--flash-dur, 0.4s) ease-out;
}
```

**React change (PlayScreen):** Compute the three values from `effectiveBpm` and `levelCfg.id`. Set as inline CSS variables on the grid container div that wraps all tiles.

---

## Files Changed

| File | Change |
|---|---|
| `word-on-beat/index.html` | Add `.turn-done-ring` CSS class; update `--pop-dur`, `--flash-dur`, `--hit-scale` references in existing tile classes |
| `word-on-beat/components/screens.jsx` | Update `turnDone` JSX block to use `turn-done-ring`, new text sizes/colors; compute CSS vars in PlayScreen, apply to grid container |

---

## Out of Scope
- The "Feel the beat" intro overlay — stays as cream `intro-ring`
- Tile option colors (A/B/C/D palette) — unchanged
- Any other screens or modals
