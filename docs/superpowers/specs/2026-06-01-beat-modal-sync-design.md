# Beat Modal Sync — Design Spec

**Date:** 2026-06-01
**Status:** Approved

---

## Problem

Four timing bugs make the game feel unpolished:

| Bug | Symptom | Root cause |
|---|---|---|
| Countdown overlay never disappears | "Feel the beat" screen stays up through gameplay | `intro` state is stale in the rAF closure |
| Turn-done modal one beat late | Modal appears one beat after the last card pops | `setTurnDone` fires at beat `total`, not `total - 1` |
| Auto-advance not beat-synced | Next level starts after a random 5 s pause | `setTimeout(5000)` — hardcoded, not BPM-aware |
| Wrong BPM defaults | Cards pop 60–100% faster than the beat | `TWEAK_DEFAULTS` has 120/120/150 BPM; beat.mp3 is 75 BPM |

---

## Design

### Change 1 — Fix stale closure on intro overlay

**File:** `word-on-beat/components/screens.jsx`

Add one ref alongside the existing refs:

```js
const inIntroRef = useRef(false);
```

When playback starts (inside the `useEffect` where `playing === true`), set it immediately before `setIntro(1)`:

```js
inIntroRef.current = true;
setIntro(1);
setCountdown(1);
```

Inside the rAF tick, replace the stale state check with the ref:

```js
// Before (broken — intro is always 0 in the closure):
if (b >= warmupBeats && intro > 0) {
  setIntro(0);
  setCountdown(null);
}

// After:
if (b >= warmupBeats && inIntroRef.current) {
  inIntroRef.current = false;
  setIntro(0);
  setCountdown(null);
}
```

Also reset `inIntroRef.current = false` in the cleanup return and in the `!playing` branch so it doesn't leak across sessions.

---

### Change 2 — Turn-done fires on the same beat as the last card

**File:** `word-on-beat/components/screens.jsx`

Current tick logic (simplified):

```js
if (tileB < total) {
  setBeatIdx(tileB); setShowHit(true); /* flash timers */
} else {
  // tileB === total — one beat AFTER the last card
  audioRef.current?.pause();
  setPlaying(false);
  setTurnDone(true);
  return;
}
```

Replace with: pop the last card and end the turn on the same beat.

```js
if (tileB < total) {
  setBeatIdx(tileB);
  setShowHit(true);
  setBeatPing(true);
  clearTimeout(flashTimerRef.current);
  clearTimeout(pingTimerRef.current);
  flashTimerRef.current = setTimeout(() => setShowHit(false), Math.min(220, beatInterval_ms * 0.7));
  pingTimerRef.current  = setTimeout(() => setBeatPing(false), 180);

  if (tileB === total - 1) {
    // Last card — end turn on this beat
    audioRef.current?.pause();
    cancelAnimationFrame(rAFRef.current);
    rAFRef.current = null;
    setPlaying(false);
    setTurnDone(true);
    window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
    return;
  }
}
// Remove the `else` branch entirely — it is no longer reachable
```

---

### Change 3 — 1-bar beat-aligned auto-advance

**File:** `word-on-beat/components/screens.jsx`

Current auto-advance effect:

```js
useEffect(() => {
  if (!turnDone || isLastTurn || isPlayerDone) return;
  const timer = setTimeout(onTurnDone, 5000);
  return () => clearTimeout(timer);
}, [turnDone]);
```

Replace with 1 bar (4 beats) at the current BPM:

```js
useEffect(() => {
  if (!turnDone || isLastTurn || isPlayerDone) return;
  const timer = setTimeout(onTurnDone, 4 * beatInterval_ms);
  return () => clearTimeout(timer);
}, [turnDone, beatInterval_ms]);
```

At 75 BPM: `4 × 800 ms = 3200 ms`. The delay scales automatically if BPM ever changes.

---

### Change 4 — BPM defaults to 75

**File:** `word-on-beat/components/app.jsx`

`beat.mp3` runs at a constant 75 BPM from its main drop (3.25 s) to the end. All three difficulty levels should default to this tempo. Difficulty is expressed through more word options and a larger tile grid, not a faster beat.

```js
// Before:
"bpmEasy": 120,
"bpmMedium": 120,
"bpmHard": 150,

// After:
"bpmEasy": 75,
"bpmMedium": 75,
"bpmHard": 75,
```

Users can still override BPM per level via the Tweaks panel.

---

## Files Changed

| File | Lines touched | What changes |
|---|---|---|
| `word-on-beat/components/screens.jsx` | ~617–728 | Add `inIntroRef`, fix tick logic, fix auto-advance timer |
| `word-on-beat/components/app.jsx` | 7–9 | Update `TWEAK_DEFAULTS` BPM values |

No other files need to change.

---

## Testing

1. Start a game with `music: beat`. Confirm the countdown overlay ("Feel the beat") disappears on the first tile pop.
2. Watch the last tile pop. Confirm the turn-done modal appears **on the same beat** (no 1-beat gap visible).
3. For a mid-game turn (not last player, not last turn): confirm the next level starts automatically after exactly ~3.2 s (1 bar at 75 BPM).
4. Clear `localStorage` and reload. Confirm all three levels show **75 BPM** in the header.
5. Confirm the Tweaks panel still allows BPM override and the game respects it.
