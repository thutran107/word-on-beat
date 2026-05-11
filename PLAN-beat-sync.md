# Beat Sync Fix — Implementation Plan

## Goal
Fix beat-to-card-pop sync so audio and card reveals are perfectly aligned from
start to finish, across all 5 turns (one turn per player).

## File to edit
`project/components/screens.jsx` — `PlayScreen` function only (~lines 401–591).
No other screens, components, or files need to change.

---

## What's broken today

| Problem | Cause |
|---|---|
| Cards drift out of sync with audio | `setInterval` accumulates 2–5 ms of error per tick |
| Beat 1 never lands on time | Audio starts **before** the 3-s intro, so `currentTime ≈ 3 s` when first card pops |
| Audio just loops forever | `<audio loop>` — no concept of "turn done" |
| Round counter increments but beat doesn't restart | "Next round" button only calls `setRound` |

---

## Solution: Option A — `audio.currentTime` as master clock

Replace `setInterval` with `requestAnimationFrame`. Each frame, compute which
beat the audio is currently on:

```
beatIndex = floor(audio.currentTime / (60 / bpm))
```

When `beatIndex` ticks up → pop that card. Audio position is always truth,
zero drift.

---

## Step-by-step changes inside `PlayScreen`

### Step 1 — State & refs

Add one state:
```js
const [turnDone, setTurnDone] = useState(false);
```

Replace `beatTimerRef` with four refs:
```js
const rAFRef      = useRef(null);   // requestAnimationFrame handle
const lastBeatRef = useRef(-1);     // last beat index we triggered
const flashTimerRef = useRef(null); // setTimeout handle for showHit clear
const pingTimerRef  = useRef(null); // setTimeout handle for beatPing clear
```

Add a round mirror ref (avoids stale closure in auto-advance effect):
```js
const roundRef = useRef(round);
useEffect(() => { roundRef.current = round; }, [round]);
```

### Step 2 — Update `reshuffle`

Add `lastBeatRef.current = -1` so a reshuffle also resets the beat pointer:
```js
const reshuffle = () => {
  setTiles(generateTiles(total, activeSlots));
  setBeatIdx(-1);
  lastBeatRef.current = -1;
};
```

### Step 3 — Rename `beatInterval` → `beatInterval_ms` + add `beatInterval_s`

```js
const beatInterval_ms = 60000 / effectiveBpm;
const beatInterval_s  = 60    / effectiveBpm;
```

### Step 4 — Delete `popBeat()` entirely

Logic moves inside the rAF tick (Step 5).

### Step 5 — Rewrite the `useEffect` that drives playback

**Old flow:** audio starts → setInterval fires popBeat every N ms  
**New flow:** intro countdown → audio starts at 0 → rAF loop reads `currentTime`

```js
useEffect(() => {
  if (!playing) {
    clearInterval(introTimerRef.current);
    cancelAnimationFrame(rAFRef.current);
    clearTimeout(flashTimerRef.current);
    clearTimeout(pingTimerRef.current);
    if (audioRef.current) audioRef.current.pause();
    setIntro(0);
    window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
    return;
  }

  setTurnDone(false);
  lastBeatRef.current = -1;

  // --- Intro countdown (audio NOT started yet) ---
  let count = 3;
  setIntro(count);
  introTimerRef.current = setInterval(() => {
    count -= 1;
    if (count <= 0) {
      clearInterval(introTimerRef.current);
      introTimerRef.current = null;
      setIntro(0);

      // Audio starts here — currentTime === 0 === beat 1
      if (useFileTrack && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()?.catch(() => {});
      }
      window.parent.postMessage({ type: 'beat-playing', playing: true }, '*');

      // --- rAF loop ---
      const tick = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const b = Math.floor(audio.currentTime / beatInterval_s);

        if (b !== lastBeatRef.current) {
          lastBeatRef.current = b;

          if (b < total) {
            // Pop card b
            setBeatIdx(b);
            setShowHit(true);
            setBeatPing(true);
            clearTimeout(flashTimerRef.current);
            clearTimeout(pingTimerRef.current);
            flashTimerRef.current = setTimeout(
              () => setShowHit(false),
              Math.min(220, beatInterval_ms * 0.7)
            );
            pingTimerRef.current = setTimeout(() => setBeatPing(false), 180);
          } else {
            // Turn complete — stop everything
            audioRef.current?.pause();
            rAFRef.current = null;
            setPlaying(false);
            setTurnDone(true);
            window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
            return; // do NOT schedule next frame
          }
        }

        rAFRef.current = requestAnimationFrame(tick);
      };
      rAFRef.current = requestAnimationFrame(tick);

    } else {
      setIntro(count);
    }
  }, 1000);

  return () => {
    clearInterval(introTimerRef.current);
    cancelAnimationFrame(rAFRef.current);
    clearTimeout(flashTimerRef.current);
    clearTimeout(pingTimerRef.current);
    window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
  };
}, [playing, beatInterval_s, beatInterval_ms, useFileTrack, total]);
```

### Step 6 — Add auto-advance `useEffect`

When a turn finishes, wait 2 s then start the next turn automatically.
Stops after `totalRounds` turns.

```js
useEffect(() => {
  if (!turnDone) return;
  const timer = setTimeout(() => {
    const nextRound = roundRef.current + 1;
    if (nextRound > totalRounds) return; // game over — do nothing
    setRound(nextRound);
    reshuffle();
    setTurnDone(false);
    setPlaying(true); // triggers Step 5 effect → fresh intro → fresh audio
  }, 2000);
  return () => clearTimeout(timer);
}, [turnDone, totalRounds]);
```

### Step 7 — Update `startOrPause`

```js
const startOrPause = () => {
  if (turnDone) return; // auto-advance is counting down, don't interfere
  setPlaying(p => !p);
};
```

### Step 8 — Update JSX: audio element

Remove `loop` attribute. Each turn resets `currentTime = 0` manually.
If `loop` were left on, the browser would reset `currentTime` mid-turn,
breaking the beat math.

```jsx
{useFileTrack && (
  <audio ref={audioRef} src={BEAT_TRACK_URL} preload="auto" />
)}
```

### Step 9 — Add turn-done overlay

Reuse existing `.intro-overlay` / `.intro-ring` CSS. Show after the last card
pops, disappears when the next turn's intro countdown begins.

```jsx
{turnDone && (
  <div className="intro-overlay">
    <div className="intro-ring" style={{ width: 260, height: 260 }}>
      <div style={{ fontSize: 52, lineHeight: 1 }}>
        {round >= totalRounds ? '🎉' : '✓'}
      </div>
      <div style={{
        fontFamily: 'Nunito', fontWeight: 900, fontSize: 16,
        color: 'var(--coral)', letterSpacing: 1, marginTop: 8, textAlign: 'center'
      }}>
        {round >= totalRounds ? 'All done!' : `Round ${round} done`}
      </div>
      {round < totalRounds && (
        <div style={{
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
          color: 'var(--plum)', marginTop: 4, opacity: 0.7
        }}>
          Round {round + 1} starts in 2 s
        </div>
      )}
    </div>
  </div>
)}
```

### Step 10 — Disable "Start beat" button during turn-done

```jsx
<button
  className="btn primary"
  onClick={startOrPause}
  style={{ minWidth: 140 }}
  disabled={turnDone}
>
  {playing ? '⏸ Pause' : (beatIdx >= total - 1 && !turnDone ? '↺ Replay' : '▶ Start beat')}
</button>
```

---

## Flow after changes

```
[Start beat clicked]
  → 3 s intro (no audio)
  → audio.currentTime = 0, audio.play()
  → rAF loop starts
      frame N: b = floor(currentTime / beatInterval_s)
      b changed? → pop card b, flash
      b >= total? → pause audio, setTurnDone(true), stop loop
  → turnDone overlay: "Round N done · Round N+1 starts in 2 s"
  → 2 s timer fires → setRound(N+1), reshuffle, setPlaying(true)
  → repeat for totalRounds turns
  → last turn: overlay shows "🎉 All done!" — no auto-advance
```

---

## What does NOT change
- All other screens (Title, Difficulty, Mode, Setup, Grid)
- `Tile`, `ScreenShell`, `GridPreview`, `Stepper`, `generateTiles`
- `mascots.jsx`, `app.jsx`, `Say or Pay.html`
- CSS / visual design
- The "Shuffle", "Next round →", "New game" buttons (still work as before)
