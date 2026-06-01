# Intro Waiting Notes — Design Spec

**Date:** 2026-06-01
**Status:** Approved

---

## Goal

Play the beat file's waiting notes (0–3.25s) as a musical intro for every player's first level. The warmup overlay is already visible and the beat dot pulses with the waiting notes. The warmup countdown (1-2-3-4) begins when the main beat drops.

---

## Background

`beat.mp3` has 7 sparse rhythmic hits from 0–3.25s before the main beat drops (see `docs/beat-analysis.md`). Currently `AUDIO_BEAT_OFFSET_S = 3.25` skips them entirely. Playing from `currentTime = 0` makes them audible during the `elapsed < 0` phase of the rAF tick, which runs before any warmup beats are counted.

---

## When Waiting Notes Play

Only on a player's **first level** (`playerTurnNumber === 1`). Auto-advance levels (level 2, 3) skip waiting notes and start audio at `beatOffset` as now — the transition should feel fast, not ceremonial.

---

## Design

### Audio start position

**File:** `word-on-beat/components/screens.jsx`

Add one ref to track whether waiting notes have already played for this turn:

```js
const waitingNotesPlayedRef = useRef(false);
```

The component is re-keyed on every turn (`key={currentPlayerIdx}-{currentLevelIdx}` in `app.jsx`), so this ref naturally resets to `false` for each new turn.

Change the audio seek when playback starts:

```js
// was:
audioRef.current.currentTime = beatOffset ?? AUDIO_BEAT_OFFSET_S;

// becomes:
const fromStart = playerTurnNumber === 1 && !waitingNotesPlayedRef.current;
audioRef.current.currentTime = fromStart ? 0 : (beatOffset ?? AUDIO_BEAT_OFFSET_S);
```

When `elapsed` first crosses 0 (main beat drops), set `waitingNotesPlayedRef.current = true`. This ensures a pause/resume on level 1 resumes from `beatOffset`, not from 0.

`playerTurnNumber` is already a prop on `PlayScreen` (the player's current level index, 1-based).

### Visual feedback during waiting notes (elapsed < 0)

The current tick loop exits early when `elapsed < 0`:
```js
if (elapsed < 0) {
  rAFRef.current = requestAnimationFrame(tick);
  return;
}
```

Replace with an 8th-note pulse during this phase:

```js
if (elapsed < 0) {
  // Pulse beat dot on 8th-note boundaries during waiting notes
  const b8 = Math.floor(audio.currentTime / (beatInterval_s / 2));
  if (b8 !== lastBeatRef.current) {
    lastBeatRef.current = b8;
    setBeatPing(true);
    clearTimeout(pingTimerRef.current);
    pingTimerRef.current = setTimeout(() => setBeatPing(false), 180);
  }
  rAFRef.current = requestAnimationFrame(tick);
  return;
}
```

At 75 BPM, `beatInterval_s / 2 = 0.4s`, giving ~8 pulses over 3.2s — close enough to the actual waiting note hit pattern without hardcoding timestamps.

### Overlay during waiting notes

The overlay already shows "Feel the beat" + `{countdown ?? '🎵'}`. Since `countdown` is initialized to `1` at playback start and only changes when `b >= 0`, it shows `1` during the waiting notes. Change the initial value to `null` so the 🎵 emoji shows during the waiting notes phase:

```js
// was:
setCountdown(1); // will be updated beat-by-beat in the tick loop

// becomes:
setCountdown(null); // shows 🎵 during waiting notes; updates to 1-2-3-4 on main beat
```

When `elapsed >= 0` and `b < warmupBeats`, the existing code sets `setCountdown((b % 4) + 1)`, so the counter appears on the first warmup beat. Also set `waitingNotesPlayedRef.current = true` on this first crossing (guarded so it only runs once).

### Reset `lastBeatRef` before the waiting notes phase

`lastBeatRef` is reset to `-1` at playback start. The 8th-note pulse uses it to detect new beats. Since 8th-note indices are positive integers (0, 1, 2…), starting at `-1` correctly triggers on the first 8th note boundary.

No additional reset needed.

---

## What Does NOT Change

- Auto-advance levels: audio still starts at `beatOffset`, `lastBeatRef` reset to `-1` as now, no waiting notes
- Warmup countdown (1-2-3-4): unchanged
- Tile pop logic: unchanged
- Turn-done overlay: unchanged
- BPM or beat offset values: unchanged

---

## Files Changed

| File | Lines | What changes |
|---|---|---|
| `word-on-beat/components/screens.jsx` | ~615–675 | Add `waitingNotesPlayedRef`, audio seek conditional, 8th-note pulse in elapsed < 0 branch, `setCountdown(null)`, set ref when elapsed crosses 0 |

---

## Testing

1. Press "Start beat" on a player's first level — confirm the overlay shows 🎵 and the beat dot pulses ~8 times over ~3 seconds before the warmup counter starts.
2. Confirm the 1-2-3-4 countdown begins exactly when the main beat drops (~3.25s after start).
3. Auto-advance to level 2 — confirm waiting notes do NOT play; warmup starts immediately.
4. Pause and resume mid-turn — confirm no waiting notes on resume (only on first start per player).
