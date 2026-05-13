# UI Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the turn-done overlay dark/readable and make tile pop animations physically sync to the beat BPM.

**Architecture:** Two CSS changes in `index.html` (new class + custom property references), two JSX changes in `screens.jsx` (compute vars from BPM, update turn-done markup). No new files. No framework, no bundler — changes take effect on browser reload.

**Tech Stack:** Vanilla React (CDN), inline JSX compiled by Babel standalone, plain CSS in `index.html` `<style>` block.

---

## File Map

| File | What changes |
|---|---|
| `word-on-beat/index.html` | Add `.turn-done-ring` CSS class; update `.tile.just-popped`, `.tile.beat-hit`, `.tile.beat-hit::after` to use CSS custom properties |
| `word-on-beat/components/screens.jsx` | Compute `popDur`/`flashDur`/`hitScale` in PlayScreen; apply as CSS vars on grid container; replace turn-done overlay markup |

---

## Task 1: Add `.turn-done-ring` CSS class

**Files:**
- Modify: `word-on-beat/index.html` (after the `.intro-ring` block, around line 129)

- [ ] **Step 1: Locate the insertion point**

Open `word-on-beat/index.html`. Find this block (ends around line 129):
```css
  .intro-ring .caption {
    font-family: 'Nunito'; font-weight: 900; font-size: 14px;
    color: var(--coral); letter-spacing: 2px; margin-top: 8px; text-transform: uppercase;
  }
```

- [ ] **Step 2: Add the new class immediately after `.intro-ring .caption`**

Insert this block after the closing brace of `.intro-ring .caption`:
```css
  .turn-done-ring {
    width: 380px; height: 380px; border-radius: 50%;
    background: radial-gradient(circle at 50% 40%, #1a1640 0%, #0a0b1e 65%, #06081a 100%);
    box-shadow:
      0 0 0 6px rgba(140,120,255,0.9),
      0 0 60px rgba(140,120,255,0.35),
      0 24px 80px rgba(0,0,0,0.6);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    animation: ringPulse 0.6s ease-out infinite alternate;
    padding: 32px; box-sizing: border-box;
  }
```

- [ ] **Step 3: Verify in browser**

Open `word-on-beat/index.html` in a browser. Start a game and finish a turn. The turn-done circle should now be dark (navy/indigo) with a purple glowing ring. If it still shows cream, check you're editing the right file.

- [ ] **Step 4: Commit**

```bash
git add word-on-beat/index.html
git commit -m "feat: add turn-done-ring CSS class with dark cosmic theme"
```

---

## Task 2: Update tile animations to use CSS custom properties

**Files:**
- Modify: `word-on-beat/index.html` (tile section, around lines 385–408)

- [ ] **Step 1: Update `.tile.beat-hit` transform**

Find this line inside `.tile.beat-hit` (around line 386):
```css
    transform: scale(1.08);
```
Replace with:
```css
    transform: scale(var(--hit-scale, 1.08));
```

- [ ] **Step 2: Update `.tile.beat-hit::after` animation duration**

Find this line inside `.tile.beat-hit::after` (around line 397):
```css
    animation: flashPulse 0.4s ease-out;
```
Replace with:
```css
    animation: flashPulse var(--flash-dur, 0.4s) ease-out;
```

- [ ] **Step 3: Update `.tile.just-popped` animation duration**

Find this line (around line 408):
```css
  .tile.just-popped { animation: popIn 0.35s cubic-bezier(.34,1.56,.64,1); }
```
Replace with:
```css
  .tile.just-popped { animation: popIn var(--pop-dur, 0.35s) cubic-bezier(.34,1.56,.64,1); }
```

- [ ] **Step 4: Verify defaults still work**

Reload the browser. Play a game without touching React yet — the CSS vars will fall back to their defaults (`0.35s`, `0.4s`, `1.08`). Tiles should pop exactly as before.

- [ ] **Step 5: Commit**

```bash
git add word-on-beat/index.html
git commit -m "feat: wire tile pop animations to CSS custom properties"
```

---

## Task 3: Compute and apply BPM-driven CSS vars in PlayScreen

**Files:**
- Modify: `word-on-beat/components/screens.jsx` (PlayScreen component, around lines 608–612 and lines 752–768)

- [ ] **Step 1: Add the three computed values after `effectiveBpm`**

Find this line in PlayScreen (around line 609):
```js
  const effectiveBpm = levelBpm || 100;
```
Add three lines directly after it:
```js
  const popDur = Math.max(0.18, (60 / effectiveBpm) * 0.55);
  const flashDur = Math.max(0.15, (60 / effectiveBpm) * 0.45);
  const hitScale = levelCfg.id === 'hard' ? 1.15 : levelCfg.id === 'medium' ? 1.10 : 1.06;
```

- [ ] **Step 2: Apply the CSS vars to the grid container div**

Find the grid container div (around line 752):
```jsx
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 12,
            width: gridW,
            height: gridH,
          }}>
```
Replace with:
```jsx
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 12,
            width: gridW,
            height: gridH,
            '--pop-dur': `${popDur}s`,
            '--flash-dur': `${flashDur}s`,
            '--hit-scale': hitScale,
          }}>
```

- [ ] **Step 3: Verify in browser**

Reload. Play through Easy (120 BPM) and Hard (150 BPM) levels and watch the tile pops:
- Easy: tiles pop with a gentle scale (1.06) over ~0.28s
- Hard: tiles snap in faster (~0.22s) and jump bigger (1.15)
- The flash ring disappears quicker on Hard

If you can't see the difference clearly, temporarily set Easy BPM to 60 and Hard to 180 via the Tweaks panel to exaggerate the effect.

- [ ] **Step 4: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: compute pop duration and hit scale from BPM, apply as CSS vars"
```

---

## Task 4: Update turn-done overlay JSX to use new class and sizes

**Files:**
- Modify: `word-on-beat/components/screens.jsx` (turnDone block, around lines 816–860)

- [ ] **Step 1: Replace the intro-ring div with turn-done-ring**

Find this JSX block (around line 817):
```jsx
        <div className="intro-ring" style={{ width: 280, height: 280 }}>
          <div style={{ fontSize: 46, lineHeight: 1 }}>
            {isLastTurn ? '🎉' : '✓'}
          </div>
          <div style={{
            fontFamily: 'Nunito', fontWeight: 900, fontSize: 16,
            color: 'var(--coral)', letterSpacing: 1, marginTop: 8, textAlign: 'center'
          }}>
            {isLastTurn ? 'Game complete!' : `${playerName} done!`}
          </div>
          {/* Same player, next level — auto-advances, no button */}
          {!isLastTurn && !isPlayerDone && (
            <div style={{
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
              color: 'rgba(220,225,255,0.55)', marginTop: 6, textAlign: 'center'
            }}>
              🎵 Next level dropping…
            </div>
          )}
```

Replace the entire opening div and its first three children with:
```jsx
        <div className="turn-done-ring">
          <div style={{ fontSize: 72, lineHeight: 1 }}>
            {isLastTurn ? '🎉' : '✓'}
          </div>
          <div style={{
            fontFamily: 'Nunito', fontWeight: 900, fontSize: 32,
            color: '#f4f0ff', letterSpacing: 1, marginTop: 12, textAlign: 'center',
            textShadow: '0 0 30px rgba(140,120,255,0.5)',
          }}>
            {isLastTurn ? 'Game complete!' : `${playerName} done!`}
          </div>
          {/* Same player, next level — auto-advances, no button */}
          {!isLastTurn && !isPlayerDone && (
            <div style={{
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 18,
              color: 'rgba(220,225,255,0.7)', marginTop: 10, textAlign: 'center'
            }}>
              🎵 Next level dropping…
            </div>
          )}
```

**Note:** Keep everything else in the block (the `isPlayerDone` button and `isLastTurn` button) exactly as-is — only the opening div tag and first three children change.

- [ ] **Step 2: Verify in browser**

Play a full turn until it ends. The turn-done overlay should show:
- Large dark circle with purple glow ring
- Big ✓ or 🎉 emoji (72px)
- "Player X done!" or "Game complete!" in large white text (32px)
- "Next level dropping…" in readable light text (18px)
- "Next player →" button unchanged

Check all three states: mid-game player done (shows button), same-player level transition (shows "Next level dropping…"), and game complete (shows 🎉 + New game button).

- [ ] **Step 3: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: turn-done overlay — dark cosmic theme, larger text, readable colors"
```

---

## Done

All four tasks complete. The game should now show:
1. A dark, glowing purple-ringed circle on turn completion with large readable text
2. Tile pops that feel snappier and more intense as difficulty increases
