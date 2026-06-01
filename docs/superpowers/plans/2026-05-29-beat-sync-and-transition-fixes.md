# Beat Sync & Transition Fixes

**Date:** 2026-05-29
**Branch:** feat/waiting-notes (or new branch)

---

## Context

`beat.mp3` is **75 BPM**. The actual beat drop starts at **3.25s** (7 sparse waiting notes play 0–3.25s before it). All three levels are configured with the wrong BPM, so tile animations are out of sync with the music. Additionally, level-to-level and player-to-player transitions are abrupt with no beat re-lock opportunity.

Key files:
- `word-on-beat/components/app.jsx` — `TWEAK_DEFAULTS`, `advanceTurn`, `PlayScreen` props
- `word-on-beat/components/screens.jsx` — `PlayScreen`, `AUDIO_BEAT_OFFSET_S`, `intro-overlay`, `turnDone` overlay

---

## Problems to Fix

### 1. BPM mismatch — all three levels

**File:** `app.jsx` — `TWEAK_DEFAULTS` (lines 7–9)

```js
// Current (wrong)
"bpmEasy": 120,
"bpmMedium": 120,
"bpmHard": 150,

// Fix
"bpmEasy": 75,
"bpmMedium": 75,
"bpmHard": 75,
```

The track is 75 BPM throughout with no tempo changes. All animation durations (`popDur`, `flashDur`, `beatInterval_ms`) derive from this value, so fixing it will sync tile flips to the actual beat.

---

### 2. BPM input placeholder inconsistency — Easy level

**File:** `app.jsx` line 452

```jsx
// Current — fallback shows 90, but default is 120
value={tweaks.bpmEasy ?? 90}

// Fix — match the default
value={tweaks.bpmEasy ?? 75}
```

---

### 3. Level transition — no beat re-lock for the player

**File:** `app.jsx` lines 359–360

```jsx
autoStart={currentLevelIdx > 0}
skipIntro={currentLevelIdx > 0}
```

When advancing from level 1 → 2 → 3, both flags are `true`, which means:
- The warmup countdown ("Feel the beat" overlay) is skipped entirely
- Audio restarts at `beatOffset` (3.25s) immediately with no warning
- The player gets no chance to re-lock to the beat before tiles appear

**Fix options (pick one):**
- **A (minimal):** Keep `skipIntro` but force 1 warmup bar (4 beats) even on transitions — pass `warmupBars={1}` when `currentLevelIdx > 0`
- **B (better UX):** Show the "Feel the beat" overlay for 1 bar on every level start, including transitions — set `skipIntro={false}` always, `autoStart={currentLevelIdx > 0}`

---

### 4. Player hand-off — next player starts cold

**File:** `screens.jsx` lines 866–901 (the `turnDone` overlay)

When a player finishes their last level (`isPlayerDone`), a "Next player →" button appears. Clicking it calls `onTurnDone` → `advanceTurn` → React re-renders with the new player's `PlayScreen` immediately.

**Problems:**
- The new player has no warning before the beat starts
- The device needs to physically change hands first

**Fix:** Add a "hand-off" interstitial screen (or overlay state) between `onTurnDone` click and actual `PlayScreen` mount. It should show the next player's name and a "I'm ready" button that the new player presses themselves before the beat begins.

Simplest implementation: a new screen state `'handoff'` in `app.jsx`, or a `handoffPending` boolean that renders a blocking overlay before `PlayScreen` starts.

---

### 5. Audio keeps playing during turn-done overlay

**File:** `screens.jsx` — `turnDone` state is set after the last tile, but `audioRef` is not paused.

The beat keeps playing while "Next player →" or "Game complete!" is shown. This is jarring.

**Fix:** When `turnDone` becomes `true`, pause the audio:
```js
if (audioRef.current) audioRef.current.pause();
```

---

## Summary Table

| # | Problem | File | Severity |
|---|---------|------|----------|
| 1 | All BPMs wrong (120/120/150 vs actual 75) | `app.jsx` TWEAK_DEFAULTS | High — breaks all beat sync |
| 2 | Easy BPM input placeholder is 90, not 75 | `app.jsx` line 452 | Low — cosmetic |
| 3 | Level transitions skip warmup, player can't re-lock | `app.jsx` lines 359–360 | Medium — UX |
| 4 | New player starts cold, no hand-off moment | `screens.jsx` turnDone overlay | Medium — UX |
| 5 | Audio plays during turn-done overlay | `screens.jsx` turnDone logic | Low — polish |
