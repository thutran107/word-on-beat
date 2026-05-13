# Game Library & Dual View — Design Spec
**Date:** 2026-05-13  
**Status:** Approved, pending implementation

---

## Goal

Add a reusable game library so pre-configured games can be saved and loaded without re-entering content each session. Add a dual-view mode so the same file works as a dev/testing view and as a locked 1024×768 view for the LED screen at the event.

---

## 1. Saved Game Data Model

A saved game is a JSON object stored in `localStorage` under the key `sayorpay:games` (an array).

```json
{
  "id": "abc123",
  "name": "Anduin Edition",
  "mode": "words",
  "slots": [
    { "kind": "word", "label": "CAP" },
    { "kind": "word", "label": "CLAP" },
    { "kind": "word", "label": "TAP" },
    { "kind": "word", "label": "NAP" }
  ],
  "bpmEasy": 120,
  "bpmMedium": 120,
  "bpmHard": 150,
  "beatOffset": 3.25,
  "createdAt": 1747123456789
}
```

**Image slots** use a filename path as `src` (not base64):
```json
{ "kind": "image", "src": "uploads/cat.png", "label": "cat" }
```

Images must exist in the `uploads/` folder on disk. This works both locally and when deployed as static files — no server needed.

**Always 4 slots** (A–D). Which ones are active during play depends on the level's `numOptions` (2, 3, or 4).

---

## 2. Storage

| Key | Value |
|-----|-------|
| `sayorpay:games` | JSON array of saved game objects |
| `sayorpay:state` | Existing — current session state (unchanged) |

**Export:** Downloads `sayorpay:games` as a `.json` file. Used to move games between machines (e.g. laptop → event machine).

**Import:** Reads a `.json` file and merges it into `sayorpay:games`, matching on `id` to skip duplicates.

---

## 3. Screen Flow

### Normal play flow (unchanged)
```
Title → Player Setup → Mode Select → Content Setup → Play
```

### Library flow (new)
```
Title → Library → [Load game] → Player Setup → Play
                               (skips Mode & Content Setup)

Title → Library → [Edit game] → Game Editor → Library
Title → Library → [New game]  → Game Editor → Library
```

### Save during setup (new entry point)
```
Content Setup → [Save to library] → name modal → saved ✓ → continue normally
```

---

## 4. New Screens

### LibraryScreen
- Grid of saved game cards
- Each card shows: game name, mode badge (Words / Images), BPM summary (🍋·🌶️·🌟), slot preview
- Card actions: **▶ Load**, **✏ Edit**, **🗑 Delete**
- Page actions: **+ New game**, **⬆ Import JSON**, **⬇ Export all**
- Empty state when no games saved yet

### GameEditorScreen
- **Name** text input
- **Mode** toggle: Words / Images
- **4 slot inputs** (A–D):
  - Words mode: text input + live word preview card
  - Images mode: text input for path (e.g. `uploads/cat.png`) + image preview (shows if file resolves)
- **BPM fields**: Easy, Medium, Hard (number inputs, 60–180)
- **Beat offset** (seconds, 0–10, step 0.1)
- Actions: **💾 Save game** (disabled until name + all slots filled), **Cancel**
- Used for both creating new games and editing existing ones

---

## 5. Modified Screens

### TitleScreen
- Adds a secondary **"📚 Saved games"** button below the main CTA
- Works in both lux and non-lux title variants

### ContentSetup
- Adds a **"💾 Save to library"** ghost button next to the existing "Next →" button
- Clicking opens an inline modal asking for a game name
- On confirm: saves current mode + slots + current BPM tweaks + beat offset as a new game
- Shows a brief "✓ Saved to library!" confirmation

---

## 6. App State Changes

New state variables in `App`:

| Variable | Type | Purpose |
|----------|------|---------|
| `savedGames` | array | All saved games, loaded from localStorage on mount |
| `editingGame` | object \| null | Game being edited in GameEditorScreen (null = new game) |
| `gameLoaded` | boolean | True when a game was loaded from library; skips Mode + ContentSetup |
| `ledMode` | boolean | True when LED view is active |

New localStorage helper functions: `loadGames()`, `persistGames()`, `genId()`

New screen names added to the router: `'library'`, `'editor'`

**When loading from library:**
1. Set `mode` from game
2. Set `slots` from game (all 4)
3. Apply game's BPM + beat offset to `tweaks`
4. Set `gameLoaded = true`
5. Navigate to `'playersetup'`
6. From player setup, "Start game" goes directly to `'play'` (not `'mode'`)
7. `reset()` clears `gameLoaded`

---

## 7. LED View

**Toggle:** Button in the Tweaks panel (backtick key opens Tweaks). Label: "📺 LED view" / "💻 Exit LED".

**Dev mode** (default):
- Stage scales responsively: `Math.min(window.innerWidth / 1280, window.innerHeight / 800)`
- Tweaks panel accessible normally

**LED mode:**
- Stage scale locked to: `Math.min(1024 / 1280, 768 / 800) = 0.8`
- Simulates exactly how the 1280×800 stage fits on the 1024×768 LED screen
- Tweaks panel hidden
- Small "📺 Exit LED" button fixed in corner to return to dev mode
- Switching to LED mode auto-closes the Tweaks panel
- Mode is **not persisted** — always starts in dev mode on page refresh

---

## 8. Deployment Notes

The game is pure static files. All of the above works on any static host (GitHub Pages, Netlify, Vercel, etc.) with no backend.

**Image constraint:** For image mode games, images referenced in saved games (e.g. `uploads/cat.png`) must be committed to the repo and deployed with the site. You cannot upload new images via the browser at runtime on a deployed static site. Fixed images for the event should be added to `uploads/` and committed.

---

## 9. Files Changed

| File | Change |
|------|--------|
| `components/screens.jsx` | Add `LibraryScreen`, `LibraryGameCard`, `GameEditorScreen`; modify `TitleScreen`, `ContentSetup` |
| `components/app.jsx` | Add library state + operations, LED mode, new screen routing |
| `Say or Pay.html` | No changes needed |
