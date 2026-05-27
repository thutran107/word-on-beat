# Shuffle Rule Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make tile shuffles difficulty-aware (only half shuffled on easy/medium) and guarantee each player in a session sees a unique tile layout.

**Architecture:** Two focused changes — (1) `generateTiles` gains a `difficulty` parameter that controls how many tiles are randomized; (2) `PlayScreen` wraps tile generation in a retry loop keyed against a session-level `usedLayouts` ref owned by `App`, preventing any layout from appearing twice in one game session.

**Tech Stack:** React (JSX, hooks), no test framework — verification is manual via browser.

---

## File Map

| File | Change |
|------|--------|
| `word-on-beat/components/screens.jsx` | Add `difficulty` param to `generateTiles`; update all three call sites; add retry loop in `PlayScreen` |
| `word-on-beat/components/app.jsx` | Add `usedLayoutsRef`; reset on new game; pass ref to `PlayScreen` |

---

### Task 1: Add `difficulty` parameter to `generateTiles`

**Files:**
- Modify: `word-on-beat/components/screens.jsx:906-919`

Current `generateTiles` always does a full Fisher-Yates shuffle. Add a `difficulty` param defaulting to `'hard'`. For `'easy'` and `'medium'`, select half the indices at random, shuffle only those tiles, and put them back; the other half stay grouped.

- [ ] **Step 1: Replace `generateTiles` with the new implementation**

Find this block (lines 906–919):
```js
function generateTiles(total, activeSlots) {
  const n = activeSlots.length || 1;
  const arr = [];
  for (let i = 0; i < total; i++) {
    const optIdx = i % n;
    const slot = activeSlots[optIdx] || { kind: 'word', label: '—' };
    arr.push({ ...slot, _optIdx: optIdx });
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

Replace with:
```js
function generateTiles(total, activeSlots, difficulty = 'hard') {
  const n = activeSlots.length || 1;
  const arr = [];
  for (let i = 0; i < total; i++) {
    const optIdx = i % n;
    const slot = activeSlots[optIdx] || { kind: 'word', label: '—' };
    arr.push({ ...slot, _optIdx: optIdx });
  }

  if (difficulty === 'easy' || difficulty === 'medium') {
    // Partial shuffle: randomize only half the tiles
    const halfCount = Math.floor(total / 2);
    // Pick halfCount unique random indices
    const indices = [];
    while (indices.length < halfCount) {
      const idx = Math.floor(Math.random() * total);
      if (!indices.includes(idx)) indices.push(idx);
    }
    // Extract those tiles, shuffle them with Fisher-Yates, put back
    const subset = indices.map(i => arr[i]);
    for (let i = subset.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [subset[i], subset[j]] = [subset[j], subset[i]];
    }
    indices.forEach((arrIdx, subIdx) => { arr[arrIdx] = subset[subIdx]; });
  } else {
    // Hard: full Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
}
```

- [ ] **Step 2: Verify the file saved correctly**

Open `word-on-beat/components/screens.jsx` and confirm:
- The function signature reads `function generateTiles(total, activeSlots, difficulty = 'hard')`
- The `if (difficulty === 'easy' || difficulty === 'medium')` branch is present
- The original Fisher-Yates loop is now inside the `else` block

- [ ] **Step 3: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: add difficulty-aware partial shuffle to generateTiles"
```

---

### Task 2: Thread `difficulty` through all `generateTiles` call sites in `screens.jsx`

**Files:**
- Modify: `word-on-beat/components/screens.jsx` (lines ~584, ~601, ~544)

There are three call sites. Two are in `PlayScreen` (initial state + reshuffle); one is in `GridPreview` (visual preview in the setup screen).

- [ ] **Step 1: Update the initial tile state in `PlayScreen`**

Find (line ~584):
```js
const [tiles, setTiles] = useState(() => generateTiles(total, activeSlots));
```
Replace with:
```js
const [tiles, setTiles] = useState(() => generateTiles(total, activeSlots, levelCfg.id));
```

- [ ] **Step 2: Update the `reshuffle` function in `PlayScreen`**

Find (line ~601):
```js
const reshuffle = () => {
  setTiles(generateTiles(total, activeSlots));
```
Replace with:
```js
const reshuffle = () => {
  setTiles(generateTiles(total, activeSlots, levelCfg.id));
```

- [ ] **Step 3: Update `GridPreview`**

`GridPreview` is a pure preview component with no level context. Derive difficulty from `numOptions` (2 → easy, 3 → medium, 4+ → hard) so the preview reflects the actual shuffle behavior.

Find in `GridPreview` (line ~544):
```js
const tiles = generateTiles(rows * cols, slots.slice(0, numOptions));
```
Replace with:
```js
const previewDifficulty = numOptions <= 2 ? 'easy' : numOptions === 3 ? 'medium' : 'hard';
const tiles = generateTiles(rows * cols, slots.slice(0, numOptions), previewDifficulty);
```

- [ ] **Step 4: Manual smoke-test in browser**

Start the dev server and play through:
1. Choose Easy and verify the tile grid has half the tiles in visible grouped order (e.g., options repeat in blocks, not fully scrambled).
2. Choose Hard and verify tiles look fully random.

- [ ] **Step 5: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: pass difficulty to all generateTiles call sites"
```

---

### Task 3: Add `usedLayoutsRef` to `App` and pass to `PlayScreen`

**Files:**
- Modify: `word-on-beat/components/app.jsx`

`App` owns session state. Add a ref that tracks every tile layout string seen during the session, keyed by difficulty level. Reset it when a new game starts. Pass it down to `PlayScreen`.

- [ ] **Step 1: Add the `usedLayoutsRef` ref after existing state declarations**

Find the block of `useStateA` calls (around line 48–59). After the last one (e.g., after `setLedMode`), add:

```js
const usedLayoutsRef = useRef({ easy: new Set(), medium: new Set(), hard: new Set() });
```

Make sure `useRef` is already imported — it comes from the same `react` import as `useState`. Check the top of the file; if `useRef` isn't in the import, add it.

- [ ] **Step 2: Reset `usedLayoutsRef` inside the `reset()` function**

Find `reset()` (line ~139):
```js
const reset = () => {
  setScreen('title');
  setMode(null);
  setSlots([null, null, null, null]);
  setCurrentPlayerIdx(0);
  setCurrentLevelIdx(0);
  setGameLoaded(false);
  // numPlayers, numTurns, players preserved for replay
};
```
Add one line after `setGameLoaded(false)`:
```js
usedLayoutsRef.current = { easy: new Set(), medium: new Set(), hard: new Set() };
```

- [ ] **Step 3: Pass `usedLayouts` to `PlayScreen`**

Find the `<PlayScreen ... />` JSX block (line ~339). It currently ends with:
```jsx
isPlayerDone={currentLevelIdx === numTurns - 1}
```
Add a new prop after it:
```jsx
usedLayouts={usedLayoutsRef}
```

- [ ] **Step 4: Commit**

```bash
git add word-on-beat/components/app.jsx
git commit -m "feat: add usedLayoutsRef session tracking and pass to PlayScreen"
```

---

### Task 4: Add retry loop in `PlayScreen` for per-player layout uniqueness

**Files:**
- Modify: `word-on-beat/components/screens.jsx`

`PlayScreen` receives the `usedLayouts` ref. Wrap tile generation in a helper that retries up to 10 times before accepting a collision. The same helper is used for both initial tile state and the reshuffle button.

- [ ] **Step 1: Add `usedLayouts` to `PlayScreen`'s props destructuring**

Find (line ~579):
```js
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, turnNumber, totalTurns, playerTurnNumber, numTurns, onTurnDone, onReset, onBack, subtitle, autoStart, isPlayerDone }) => {
```
Add `usedLayouts` to the destructured props:
```js
const PlayScreen = ({ slots, music, playerName, levelCfg, beatOffset, turnNumber, totalTurns, playerTurnNumber, numTurns, onTurnDone, onReset, onBack, subtitle, autoStart, isPlayerDone, usedLayouts }) => {
```

- [ ] **Step 2: Add the `generateUniqueTiles` helper inside `PlayScreen`**

Add this helper right after the `const total = rows * cols;` line (line ~582), before the `useState` call:

```js
const generateUniqueTiles = () => {
  const levelId = levelCfg.id;
  const seen = usedLayouts?.current?.[levelId];
  let candidate;
  for (let attempt = 0; attempt < 10; attempt++) {
    candidate = generateTiles(total, activeSlots, levelId);
    if (!seen) break;
    const key = candidate.map(t => t.label + (t.src || '')).join('|');
    if (!seen.has(key)) {
      seen.add(key);
      break;
    }
  }
  return candidate;
};
```

- [ ] **Step 3: Use `generateUniqueTiles` in the initial tile state**

Find (line ~584):
```js
const [tiles, setTiles] = useState(() => generateTiles(total, activeSlots, levelCfg.id));
```
Replace with:
```js
const [tiles, setTiles] = useState(() => generateUniqueTiles());
```

- [ ] **Step 4: Use `generateUniqueTiles` in `reshuffle`**

Find (line ~601):
```js
const reshuffle = () => {
  setTiles(generateTiles(total, activeSlots, levelCfg.id));
```
Replace with:
```js
const reshuffle = () => {
  setTiles(generateUniqueTiles());
```

- [ ] **Step 5: Manual end-to-end test in browser**

Set up a 3-player game (easy level). Play through all 3 players and visually confirm:
1. Player 1 and Player 2 do NOT see the same tile arrangement.
2. Player 2 and Player 3 do NOT see the same tile arrangement.
3. Tapping the 🔀 Shuffle button during a player's turn produces a different layout than they started with.

Also confirm hard mode still looks fully scrambled (not partial).

- [ ] **Step 6: Commit**

```bash
git add word-on-beat/components/screens.jsx
git commit -m "feat: retry loop ensures per-player unique tile layout within session"
```
