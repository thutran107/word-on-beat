# Player & Level Progression — Implementation Plan

## Goal

Add 5-player structure with 3 progressive turns per player (Easy → Medium → Hard),
auto-configuring grid size, option count, and BPM per level. Audio must reset and
align to each player's turn with the correct BPM and card count.

---

## What changes and what doesn't

### Changes

- **New PlayerSetup screen** — enter 5 player names before game starts
- **Level auto-config** — rows/cols/numOptions/BPM locked per level, no manual grid screen
- **Turn state machine** — 15 turns total (5 players × 3 levels), sequential
- **Between-turn overlay** — shows next player name + level badge before each turn
- **generateTiles for medium** — distribute 3 options as evenly as possible in 8 tiles
- **Audio per turn** — BPM auto-sets per level; audio resets to 0 at each turn start
- **Turn indicator in PlayScreen header** — player name + level badge

### Does NOT change

- All visual design, CSS, existing UI polish
- `Tile`, `ScreenShell`, `GridPreview`, `Stepper` components
- `mascots.jsx`
- Mode selection (words vs images) — still user-chosen
- ContentSetup component logic — but it now always receives `numOptions = 4`

### Key architectural fix (from review)

**ContentSetup must always show 4 slots.** Since difficulty is removed from the setup
flow, there is no `numOptions` from difficulty to feed ContentSetup. Hard level needs
all 4 options, so the user must fill them all upfront. App passes a constant `4` to
ContentSetup and ModeSelect. PlayScreen receives `levelCfg.numOptions` (2/3/4) as its
active option count — Easy uses slots 0-1, Medium 0-2, Hard 0-3. The unused slots
are simply ignored per turn.

---

## Level config (locked, not user-adjustable)

```js
const LEVEL_CONFIG = [
  { id: 'easy',   label: 'Easy',   emoji: '🍋', rows: 2, cols: 4, numOptions: 2, bpm: 90  },
  { id: 'medium', label: 'Medium', emoji: '🌶️', rows: 2, cols: 4, numOptions: 3, bpm: 120 },
  { id: 'hard',   label: 'Hard',   emoji: '🌟', rows: 3, cols: 4, numOptions: 4, bpm: 150 },
];
```

- Easy: 8 beats at 90 BPM ≈ 5.3 s
- Medium: 8 beats at 120 BPM ≈ 4 s
- Hard: 12 beats at 150 BPM ≈ 4.8 s

---

## New state in App

```js
// Replace: difficulty, rows, cols, bpm, round, totalRounds
const [players, setPlayers]           = useState(['Player 1','Player 2','Player 3','Player 4','Player 5']);
const [numPlayers, setNumPlayers]     = useState(5);           // 2–5
const [numTurns, setNumTurns]         = useState(3);           // 1–3 (levels per player)
const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
const [currentLevelIdx, setCurrentLevelIdx]   = useState(0);

// Tweaks — BPM per level (admin-adjustable, override LEVEL_CONFIG defaults)
// Stored in tweaks object, not separate state
// tweaks.bpmEasy, tweaks.bpmMedium, tweaks.bpmHard
```

Derived values (not stored in state):
```js
const activeLevels = LEVEL_CONFIG.slice(0, numTurns); // first N levels
const levelCfg     = activeLevels[currentLevelIdx];
const playerName   = players[currentPlayerIdx];
const totalTurns   = numPlayers * numTurns;
const turnNumber   = currentPlayerIdx * numTurns + currentLevelIdx + 1;

// Apply BPM tweaks to level config (admin override)
const effectiveLevelCfg = {
  ...levelCfg,
  bpm: tweaks[`bpm${levelCfg.label}`] ?? levelCfg.bpm
};
```

Grid is NOT user-configurable during play (locked per level). BPM is admin-tweakable via tweaks panel.

---

## Screen flow

```
title → playersetup → mode → setup → play
                                      ↑
                         auto-loops 15 turns
```

Remove: `difficulty` screen, `grid` screen (GridSizeScreen hidden from flow, kept for tweaks).

### New: PlayerSetup screen

- Q1 badge, title "Who's playing?"
- **Player count stepper**: 2–5 (default 5), controls how many name inputs show
- Name inputs for each active player, pre-filled "Player 1"–"Player N"
- **Turns per player stepper**: 1–3 (default 3) — labeled "Levels per player (1=Easy only, 2=Easy+Medium, 3=All)"
- "Start game →" button (enabled when all active player names non-empty)

---

## Between-turn overlay (inside PlayScreen)

When `turnDone === true` and there is a next turn, show an overlay INSTEAD of immediately
auto-advancing. The overlay replaces the current "Round N done / starts in 2s" copy.

```
┌─────────────────────────────┐
│                             │
│   ✓  Player 1 done!         │
│                             │
│   Up next                   │
│   🌶️ Medium                 │
│   Player 1                  │
│                             │
│  [Next turn →]  (button)    │
│                             │
└─────────────────────────────┘
```

- Manual "Next turn →" button (not auto-2s) so host controls pacing
- Last turn (Hard for Player 5): shows "🎉 All done!" with "New game" button

---

## generateTiles — medium level handling

Current: `optIdx = i % n` → for 3 options in 8 tiles: counts [3, 3, 2] (A, B, C).
This is already a reasonable distribution. No change needed — the shuffle randomises
positions anyway, so visual distribution is already good.

Keep current algorithm. The "less duplication" vs Easy is inherent: 3 options means
each word appears 2-3×, vs Easy where 2 options → each appears 4×.

---

## Audio per turn

`PlayScreen` already resets `audio.currentTime = 0` when `playing` flips to true.
With level auto-config, `bpm` and `total` (rows×cols) change per turn, so the rAF
loop naturally plays the correct number of beats at the correct tempo.

No new audio code needed beyond passing `levelCfg.bpm` and `levelCfg.rows/cols`
into `PlayScreen` instead of the old user-set values.

---

## Step-by-step changes

### Step 1 — screens.jsx: Add LEVEL_CONFIG constant

Replace `DIFFICULTY_LEVELS` (keep for reference) with `LEVEL_CONFIG` array (above).
Also keep `DIFFICULTY_LEVELS` unexported for backward compat with any existing code
that references it (but it won't be used in new flow).

### Step 2 — screens.jsx: Add PlayerSetup screen

New component `PlayerSetupScreen`:
- Props: `players, setPlayer, onNext, onBack`
- 5 labeled text inputs (Player 1 → Player 5), autofocuses first
- "Start game →" disabled until all names ≥ 1 char

### Step 3 — screens.jsx: PlayScreen props change

```js
// Old
PlayScreen({ slots, numOptions, rows, cols, music, bpm, round, setRound, totalRounds, ... })

// New
PlayScreen({ slots, music, playerName, levelIdx, levelCfg,
             onTurnDone, onReset, onBack, subtitle })
```

- Remove internal round/totalRounds state from PlayScreen
- `onTurnDone` called when turn completes (App drives sequencing)
- `levelCfg` provides rows, cols, numOptions, bpm
- Header shows `playerName` + level badge instead of "ROUND N/N"

### Step 4 — screens.jsx: Between-turn overlay update

Replace auto-2s timer in PlayScreen with:
1. Show overlay with "Player X done!" + "Up next: [emoji] [Level] — [NextPlayerName]"
2. "Next turn →" button calls `onTurnDone()`
3. If last turn: "🎉 Game complete!" + "New game" button calls `onReset()`

### Step 5 — app.jsx: State restructure

Replace `round`, `totalRounds`, `bpm`, `difficulty`, `rows`, `cols` with
`players[]`, `currentPlayerIdx`, `currentLevelIdx`.

Pass `numOptions = 4` (constant) to `ModeSelect` and `ContentSetup`.
Pass `levelCfg.numOptions` to `PlayScreen`.

```js
const LEVEL_CONFIG = [
  { id: 'easy',   label: 'Easy',   emoji: '🍋', rows: 2, cols: 4, numOptions: 2, bpm: 90  },
  { id: 'medium', label: 'Medium', emoji: '🌶️', rows: 2, cols: 4, numOptions: 3, bpm: 120 },
  { id: 'hard',   label: 'Hard',   emoji: '🌟', rows: 3, cols: 4, numOptions: 4, bpm: 150 },
];

const advanceTurn = () => {
  const nextLevel = currentLevelIdx + 1;
  if (nextLevel < numTurns) {           // numTurns = 1, 2, or 3
    setCurrentLevelIdx(nextLevel);
  } else {
    const nextPlayer = currentPlayerIdx + 1;
    setCurrentLevelIdx(0);
    if (nextPlayer < numPlayers) {      // numPlayers = 2, 3, 4, or 5
      setCurrentPlayerIdx(nextPlayer);
    } else {
      // Game complete → back to title (player names/config preserved for replay)
      setCurrentPlayerIdx(0);
      setCurrentLevelIdx(0);
      setScreen('title');
    }
  }
};
```

### Step 6 — app.jsx: Screen flow update

```
'title' → 'playersetup' → 'mode' → 'setup' → 'play'
```

- Title `onStart` → `'playersetup'`
- `PlayerSetupScreen` receives `numPlayers, setNumPlayers, numTurns, setNumTurns, players, setPlayers` 
- `PlayerSetupScreen` `onNext` → `'mode'`
- `PlayScreen` `onTurnDone` → `advanceTurn()` (stays on `'play'`)
- `reset()` → clears `currentPlayerIdx = 0`, `currentLevelIdx = 0` → back to `'title'` (player names/count preserved for replay)

### Step 7 — app.jsx: Update persist

Update `persist()` to remove old keys (`difficulty`, `rows`, `cols`, `round`, `bpm`)
and add new keys (`players`, `numPlayers`, `numTurns`, `currentPlayerIdx`, `currentLevelIdx`).

`loadPersisted()` already guards with `|| defaultValue` on each key, so old saved state
won't crash — missing new keys just default gracefully.

### Step 8 — app.jsx: Tweaks panel update

Remove single BPM slider and grid row/col steppers (now locked to level).

Add per-level BPM sliders:
```jsx
<label>Easy BPM
  <input type="range" min="60" max="180" value={tweaks.bpmEasy ?? 90}
    onChange={(e) => applyTweak('bpmEasy', +e.target.value)} />
  <span>{tweaks.bpmEasy ?? 90}</span>
</label>
<label>Medium BPM
  <input type="range" min="60" max="180" value={tweaks.bpmMedium ?? 120}
    onChange={(e) => applyTweak('bpmMedium', +e.target.value)} />
  <span>{tweaks.bpmMedium ?? 120}</span>
</label>
<label>Hard BPM
  <input type="range" min="60" max="180" value={tweaks.bpmHard ?? 150}
    onChange={(e) => applyTweak('bpmHard', +e.target.value)} />
  <span>{tweaks.bpmHard ?? 150}</span>
</label>
```

Keep: subtitle, luxTitle.

### Step 9 — PlayScreen header

Replace "ROUND N/N" badge with:
```jsx
<div className="q-badge">{levelCfg.emoji} {levelCfg.label}</div>
<span>[playerName]</span>
```

---

## Files to edit

| File | Sections |
|------|----------|
| `project/components/screens.jsx` | Add `LEVEL_CONFIG`, `PlayerSetupScreen`, update `PlayScreen` props + header + overlay + export |
| `project/components/app.jsx` | Replace round/bpm/difficulty state with player/level state, update screen flow, tweaks panel |

---

## What does NOT change

- `generateTiles` algorithm (already distributes evenly)
- `Tile`, `GridPreview`, `Stepper`, `ScreenShell`
- `mascots.jsx`
- All CSS/visual design
- Mode and ContentSetup screens (unchanged)
- Audio rAF loop logic (unchanged, just fed different bpm/total)

---

## TWEAK_DEFAULTS update

```js
const TWEAK_DEFAULTS = {
  "subtitle": "Anduin Edition",
  "bpmEasy": 90,
  "bpmMedium": 120,
  "bpmHard": 150,
  "luxTitle": true
};
```

## Edge cases

- Player name blank → blocked by "Start game" disabled state
- numPlayers = 2, numTurns = 1 → 2 total turns (just Easy for each player) — works fine
- Last player's last level done → `advanceTurn()` → `setScreen('title')`, indices reset to 0, player names preserved for replay
- "Back" from play → goes to `'setup'` screen (content re-editable, then "Next →" replays same game from current player/level)
- Audio file shorter than turn duration → audio ends early, cards stop popping (same as today — acceptable)
- BPM tweaks applied in real-time — if admin changes BPM mid-game, it takes effect on the NEXT turn (playing turn uses the `effectiveLevelCfg` at render time)
- `localStorage` migration — old persisted state has `round`/`difficulty`; `loadPersisted()` guard defaults gracefully (already does via `|| defaultValue`)

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — plan written, ready for review or implementation.
