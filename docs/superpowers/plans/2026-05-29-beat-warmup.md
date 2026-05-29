# Beat Warmup Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play real music for a configurable number of full bars before tiles start highlighting, replacing the current silent countdown.

**Architecture:** Start audio at `beatOffset` (skipping the silent intro), run warmup beats through the existing RAF tick loop, and derive the beat-synced visual counter from the beat index rather than a wall-clock interval. `warmupBars` flows from `TWEAK_DEFAULTS` → `app.jsx` state → `PlayScreen` prop.

**Tech Stack:** Vanilla React (CDN, no build step), Web Audio via `<audio>` element, `requestAnimationFrame` timing.

> **No test framework in this project.** All verification is manual in the browser by opening `word-on-beat/index.html` directly (file URL) or via a local server.

---

## File Map

| File | Change |
|---|---|
| `word-on-beat/components/app.jsx` | Add `warmupBars` to `TWEAK_DEFAULTS`, pass prop to `PlayScreen`, add tweaks panel input |
| `word-on-beat/components/screens.jsx` | Accept `warmupBars` prop in `PlayScreen`, change audio start position, replace wall-clock countdown with beat-synced counter in tick loop, update intro overlay text |

---

### Task 1: Add `warmupBars` to tweaks config in `app.jsx`

**Files:**
- Modify: `word-on-beat/components/app.jsx:5-12` (TWEAK_DEFAULTS)
- Modify: `word-on-beat/components/app.jsx:342-360` (PlayScreen usage)
- Modify: `word-on-beat/components/app.jsx:435-439` (tweaks panel, after Beat offset input)

- [ ] **Step 1: Add `warmupBars` to TWEAK_DEFAULTS**

In `app.jsx`, the `TWEAK_DEFAULTS` block is at lines 5–12. Add `warmupBars` after `beatOffset`:

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subtitle": "Anduin Edition",
  "bpmEasy": 120,
  "bpmMedium": 120,
  "bpmHard": 150,
  "beatOffset": 3.25,
  "warmupBars": 2,
  "luxTitle": true
}/*EDITMODE-END*/;
```

- [ ] **Step 2: Pass `warmupBars` prop to `PlayScreen`**

In `app.jsx`, the `<PlayScreen>` element starts at line 342. Add the prop after `beatOffset`:

```jsx
<PlayScreen
  key={`${currentPlayerIdx}-${currentLevelIdx}`}
  slots={effSlots}
  music={music}
  playerName={playerName}
  levelCfg={levelCfg}
  beatOffset={tweaks.beatOffset ?? 4}
  warmupBars={tweaks.warmupBars ?? 2}
  turnNumber={turnNumber}
  totalTurns={totalTurns}
  playerTurnNumber={playerTurnNumber}
  numTurns={numTurns}
  onTurnDone={advanceTurn}
  onReset={reset}
  onBack={() => setScreen(gameLoaded ? 'playersetup' : 'setup')}
  subtitle={tweaks.subtitle}
  autoStart={currentLevelIdx > 0}
  isPlayerDone={currentLevelIdx === numTurns - 1}
  usedLayouts={usedLayoutsRef}
/>
```

- [ ] **Step 3: Add Warmup bars input to the tweaks panel**

In `app.jsx`, find the Beat offset label block (around line 435) and add a Warmup bars input immediately after it:

```jsx
<label>Beat offset (s)
  <input type="number" min="0" max="10" step="0.1" value={tweaks.beatOffset ?? 4}
    onChange={(e) => applyTweak('beatOffset', Math.max(0, +e.target.value || 0))}
    style={{ width: 55 }} />
</label>
<label>Warmup bars
  <input type="number" min="0" max="8" step="1" value={tweaks.warmupBars ?? 2}
    onChange={(e) => applyTweak('warmupBars', Math.max(0, Math.min(8, Math.round(+e.target.value || 0))))}
    style={{ width: 55 }} />
</label>
```

- [ ] **Step 4: Commit**

```bash
git add word-on-beat/components/app.jsx
git commit -m "feat: add warmupBars config to tweaks (default 2 bars)"
```

---

### Task 2: Accept `warmupBars` in `PlayScreen` and skip the silent intro

**Files:**
- Modify: `word-on-beat/components/screens.jsx:580` (PlayScreen prop signature)
- Modify: `word-on-beat/components/screens.jsx:639-725` (playing useEffect)

- [ ] **Step 1: Add `warmupBars` to PlayScreen's prop signature**

Line 580 currently reads:

```js
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, turnNumber, totalTurns, playerTurnNumber, numTurns, onTurnDone, onReset, onBack, subtitle, autoStart, isPlayerDone, usedLayouts }) => {
```

Add `warmupBars` after `beatOffset`:

```js
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, warmupBars, turnNumber, totalTurns, playerTurnNumber, numTurns, onTurnDone, onReset, onBack, subtitle, autoStart, isPlayerDone, usedLayouts }) => {
```

- [ ] **Step 2: Derive `warmupBeats` near the other derived values**

After the line `const beatInterval_s  = 60    / effectiveBpm;` (around line 637), add:

```js
const warmupBeats = (warmupBars ?? 2) * 4;
```

- [ ] **Step 3: Replace the playing startup block to skip silence and remove the wall-clock interval**

The block from line 652 to 671 currently:
1. Sets a wall-clock `setInterval` to count down seconds
2. Starts audio from `currentTime = 0` (silent intro)

Replace it entirely with:

```js
setTurnDone(false);
lastBeatRef.current = -1;

setIntro(1);
setCountdown(1); // will be updated beat-by-beat in the tick loop

if (useFileTrack && audioRef.current) {
  audioRef.current.currentTime = beatOffset ?? AUDIO_BEAT_OFFSET_S;
  audioRef.current.play()?.catch(() => {});
}
window.parent.postMessage({ type: 'beat-playing', playing: true }, '*');
```

This removes the `introTimerRef` interval entirely. The `clearInterval(introTimerRef.current)` calls in the cleanup (line 718, 641) are harmless no-ops when the ref is never set.

- [ ] **Step 4: Add `warmupBeats` to the useEffect dependency array**

Line 725 currently:

```js
  }, [playing, beatInterval_s, beatInterval_ms, useFileTrack, total]);
```

Change to:

```js
  }, [playing, beatInterval_s, beatInterval_ms, useFileTrack, total, warmupBeats]);
```

- [ ] **Step 5: Verify in browser — audio starts immediately with music (no silence)**

Open `word-on-beat/index.html` in a browser. Start a game, press **Start beat**. Confirm:
- Music plays immediately (no 3-second silence)
- The intro overlay is still visible (we haven't updated the tick loop yet — tiles will start on beat 0 for now, which is expected)

- [ ] **Step 6: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: start audio at beatOffset, remove wall-clock countdown"
```

---

### Task 3: Implement warmup phase in the tick loop

**Files:**
- Modify: `word-on-beat/components/screens.jsx:673-715` (tick function inside the playing useEffect)

The current tick loop (lines 673–715) has this structure:

```
tick:
  elapsed = audio.currentTime - beatOffset
  if elapsed < 0 → skip frame
  else:
    setIntro(0)   ← clears overlay on first real beat
    b = floor(elapsed / beatInterval_s)
    if b changed:
      if b < total → highlight tile b, ping dot
      else → end turn
```

- [ ] **Step 1: Replace the tick function with the warmup-aware version**

Replace the entire `const tick = () => { ... };` block (lines 673–714) with:

```js
const tick = () => {
  const audio = audioRef.current;
  if (!audio) return;

  const elapsed = audio.currentTime - (beatOffset ?? AUDIO_BEAT_OFFSET_S);
  if (elapsed < 0) {
    rAFRef.current = requestAnimationFrame(tick);
    return;
  }

  const b = Math.floor(elapsed / beatInterval_s);

  if (b !== lastBeatRef.current) {
    lastBeatRef.current = b;

    if (b < warmupBeats) {
      // Warmup phase: pulse the beat dot and update the beat-synced counter
      setCountdown((b % 4) + 1);
      setBeatPing(true);
      clearTimeout(pingTimerRef.current);
      pingTimerRef.current = setTimeout(() => setBeatPing(false), 180);
    } else {
      // First game beat: hide the overlay
      if (b === warmupBeats) {
        setIntro(0);
        setCountdown(null);
      }

      const tileB = b - warmupBeats;
      if (tileB < total) {
        setBeatIdx(tileB);
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
        audioRef.current?.pause();
        rAFRef.current = null;
        setPlaying(false);
        setTurnDone(true);
        window.parent.postMessage({ type: 'beat-playing', playing: false }, '*');
        return;
      }
    }
  }

  rAFRef.current = requestAnimationFrame(tick);
};
```

- [ ] **Step 2: Verify in browser — warmup runs for 2 bars before tiles start**

Open `word-on-beat/index.html`. Start a game at **Easy (90 BPM)**. Press **Start beat** and confirm:
- Music plays immediately
- Beat dot pings on every beat
- Counter in the overlay cycles 1 → 2 → 3 → 4 → 1 → 2 → 3 → 4 (8 beats total)
- After 8 beats (~5.3s at 90 BPM) the overlay disappears and tiles start highlighting

Repeat for **Hard (150 BPM)**. Warmup should last 8 beats (~3.2s).

- [ ] **Step 3: Verify `warmupBars = 0` skips warmup entirely**

In the tweaks panel, set **Warmup bars** to `0`. Start a game. Tiles should start highlighting on the very first beat (no warmup phase, no overlay).

- [ ] **Step 4: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: implement beat-synced warmup phase in tick loop"
```

---

### Task 4: Update intro overlay text and style

**Files:**
- Modify: `word-on-beat/components/screens.jsx:849-856` (intro overlay JSX)

The current overlay (lines 849–856):

```jsx
{intro > 0 && (
  <div className="intro-overlay">
    <div className="intro-ring">
      <div className="caption">Are you ready?</div>
      <div className="num">{countdown ?? '🎵'}</div>
    </div>
  </div>
)}
```

- [ ] **Step 1: Update caption and pulse the counter on each beat**

Replace the overlay block with:

```jsx
{intro > 0 && (
  <div className="intro-overlay">
    <div className="intro-ring">
      <div className="caption">Feel the beat</div>
      <div className="num" key={countdown}>{countdown ?? '🎵'}</div>
    </div>
  </div>
)}
```

The `key={countdown}` causes React to remount the `div` on every beat number change, which triggers any CSS entry animation already defined on `.num` — giving a natural pulse on each beat without any extra CSS.

- [ ] **Step 2: Verify in browser — overlay shows correct text and pulses on beat**

Open `word-on-beat/index.html`. Start a game, press **Start beat**. Confirm:
- Overlay reads **"Feel the beat"** (not "Are you ready?")
- The number 1 → 2 → 3 → 4 → 1 → 2 → 3 → 4 changes exactly on each beat hit (in sync with the beat dot ping)
- After the warmup the overlay disappears cleanly and tiles begin

- [ ] **Step 3: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: update intro overlay to beat-synced feel-the-beat countdown"
```

---

### Task 5: End-to-end verification

- [ ] **Step 1: Full game flow at all difficulties**

Open `word-on-beat/index.html`. Run a 2-player game with all three difficulty levels (Easy → Medium → Hard). For each turn confirm:
- Warmup plays (2 bars, beat-synced 1-2-3-4 counter)
- Tiles start on beat 1 after warmup ends
- Turn completes normally and advances to the next player/level

- [ ] **Step 2: Multi-turn autoStart behavior**

In a 2-turn game: turn 2 uses `autoStart={true}` so the beat starts immediately without a button press. Confirm the warmup still plays correctly before tiles start on turn 2.

- [ ] **Step 3: Tweaks panel — change warmupBars mid-session**

With the tweaks panel open, change **Warmup bars** from 2 to 1 while on the play screen. Start the next turn. Confirm the warmup is now 4 beats (1 bar).

Change it to 0. Confirm tiles start immediately on the next turn with no overlay.

- [ ] **Step 4: Pause and resume**

During warmup, press **Pause**. Confirm the overlay disappears and audio stops. Press **Start beat** again. Confirm warmup restarts from beat 1.

- [ ] **Step 5: Final commit (if any cleanup needed)**

```bash
git add -p
git commit -m "fix: <describe any cleanup>"
```
