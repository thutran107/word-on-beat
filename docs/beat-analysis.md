# Beat Analysis — beat.mp3

**File:** `word-on-beat/uploads/beat.mp3`
**Duration:** 76.03s | Stereo, 48kHz, 128kbps MP3

---

## Structure Overview

The track has two distinct sections separated by a clear energy drop at ~3.25s.

| Section | Time Range | RMS Energy | Character |
|---------|-----------|-----------|-----------|
| Waiting notes (intro) | 0 – 3.25s | ~0.09 | Sparse, rhythmic hits |
| Main beat | 3.25s – end | ~0.50 | Dense, full energy drop |

---

## Tempo

**~75 BPM** (based on main beat energy peak intervals: ~0.80s per quarter note)

- Quarter note = 0.800s
- 8th note = 0.400s
- 16th note = 0.200s

> Note: The app's `effectiveBpm` defaults to 100 BPM when no level BPM is set. If you want beat-synced gameplay, set level BPM to **75** for this track.

---

## Waiting Notes (0 – 3.25s)

7 sparse hits spanning exactly **1 bar (4 beats)** before the main drop. All intervals align to 75 BPM subdivisions.

| # | Time | Gap from previous | Beat subdivision |
|---|------|-------------------|-----------------|
| 1 | 0.064s | — | beat 1 |
| 2 | 0.459s | +0.395s | 8th note |
| 3 | 1.260s | +0.801s | beat 3 (quarter) |
| 4 | 1.660s | +0.400s | 8th note |
| 5 | 2.055s | +0.395s | 8th note |
| 6 | 2.456s | +0.401s | 8th note |
| 7 | 2.653s | +0.197s | 16th note |

**Current behavior:** `AUDIO_BEAT_OFFSET_S = 3.25` skips this entire intro — playback starts at the main beat drop.

---

## Main Beat Energy Peaks (first 30)

These are the loudest hit points, useful for syncing visuals or validating beat offset.

```
 1:  3.437s     11:  7.438s     21: 10.885s
 2:  3.687s     12:  7.822s     22: 11.439s
 3:  4.235s     13:  8.236s     23: 11.683s
 4:  4.485s     14:  8.625s     24: 12.237s
 5:  5.039s     15:  9.039s     25: 12.487s
 6:  5.423s     16:  9.294s     26: 13.035s
 7:  5.837s     17:  9.583s     27: 13.420s
 8:  6.226s     18:  9.838s     28: 13.839s
 9:  6.640s     19: 10.222s     29: 14.083s
10:  7.019s     20: 10.636s     30: 14.637s
```

Quarter-note beat interval confirmed at ~0.798–0.804s (±0.006s jitter).

---

## Energy by Second (first 12s)

```
 0-1s: ███            (0.0883)  ← waiting notes
 1-2s: ███            (0.0800)  ← waiting notes
 2-3s: ████           (0.1027)  ← waiting notes
 3-4s: ████████████████████     (0.4769)  ← beat drops
 4-5s: █████████████████████    (0.5211)
 5-6s: █████████████████████    (0.5093)
 6-7s: ███████████████████████  (0.5501)
 7-8s: ██████████████████████   (0.5397)
 8-9s: ██████████████████████   (0.5270)
 9-10s: █████████████████       (0.4046)  ← slight dip (fill/break)
10-11s: ███████████████████████ (0.5517)
11-12s: ██████████████████████  (0.5283)
```

---

## Notes for Level Design

- **If using `music: 'beat'`** and the current `beatOffset = 3.25s`, the game starts in sync with the main beat drop at 3.437s.
- **If you change `beatOffset`** to 0, the waiting notes play first — good for a pre-warmup musical intro.
- The ~9-10s dip in energy is a likely **break/fill** — could be a good spot for a harder level transition or visual cue.
- The consistent ~0.8s beat interval means 75 BPM is solid throughout; no tempo changes detected.
