# Beat on the Mic

A party rhythm game where players say the right word the moment the beat drops. Miss the beat — you pay.

---

## Game Description

**Beat on the Mic** is a multiplayer word-on-beat party game. A grid of cards is revealed one by one in sync with a music track. Players must say the word (or name the image) shown on each card exactly on the beat. The faster the BPM, the harder it gets.

Built as a single-file HTML app with React loaded from CDN — no build step, runs anywhere.

---

## How to Play

1. **Set up players** — enter 2–5 player names and choose how many levels each player plays (1–3)
2. **Choose content** — pick Words or Images, then type/upload your options (A, B, C, D)
3. **Start the beat** — the intro music plays as a warm-up, then cards start popping on the drop
4. **Say the word** — call out whichever word or image appears on the highlighted card, exactly on the beat
5. **Miss the beat?** — you pay (house rules apply)
6. **Next player** — when a player finishes all their levels, pass the phone and click "Next player →"

---

## Levels

| Level | BPM | Grid | Options |
|---|---|---|---|
| 🍋 Easy | 120 BPM | 2×4 (8 cards) | 2 |
| 🌶️ Medium | 120 BPM | 2×4 (8 cards) | 3 |
| 🌟 Hard | 150 BPM | 3×4 (12 cards) | 4 |

Each level uses the same background track. The beat drops at **~3.25s** into the track — the intro plays as a "feel the beat" warm-up before cards start popping.

Between levels for the same player, the next level auto-starts using the intro as transition. Between players, a "Next player →" button appears so everyone can catch up.

---

## Running Locally

No npm, no build step — just serve the files:

```bash
cd word-on-beat
python3 -m http.server 8080
```

Then open: `http://localhost:8080/Say%20or%20Pay.html`

---

## Project Structure

```
word-on-beat/
├── Say or Pay.html        # Main entry point — all styles + React bootstrap
├── components/
│   ├── app.jsx            # App shell, screen routing, player/level state, tweaks panel
│   ├── screens.jsx        # All screens: Title, Setup, Play, etc. Beat engine lives here
│   └── mascots.jsx        # Animated stage mascots (active during play)
└── uploads/
    └── beat.mp3           # Background beat track (~150 BPM, drop at 3.25s)
```

---

## Tweaks Panel

Press the **backtick key** (`` ` ``) during play to open the Tweaks panel:

- **Beat offset** — seconds into the track before the first card pops (default: 3.25)
- **BPM per level** — override Easy / Medium / Hard tempo independently
- **Music** — toggle beat track on/off
- **Jump to Play** — skip setup for quick testing

---

## Build Progress

- [x] Title screen (lux cosmic theme)
- [x] Player setup (2–5 players, 1–3 levels each)
- [x] Content setup — Words mode and Images mode
- [x] Beat-driven card reveal using `audio.currentTime` as master clock (zero drift)
- [x] Beat offset calibration — synced to actual drop in the MP3 (3.25s)
- [x] Intro music as countdown — "Feel the beat" overlay instead of silent 3-2-1
- [x] Auto-advance between same-player levels using beat intro as transition
- [x] Manual "Next player →" button between players
- [x] Turn counter, progress bar, beat dot indicator
- [x] Shuffle, pause, new game controls
- [x] Tweaks panel for live BPM + offset tuning
- [ ] Sound effect on beat hit
- [ ] Scoring / penalty tracking
- [ ] Custom beat upload in-game
