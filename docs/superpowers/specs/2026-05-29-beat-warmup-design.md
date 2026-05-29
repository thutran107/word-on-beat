# Beat Warmup Phase — Design Spec

**Date:** 2026-05-29
**Branch:** feat/audio-enhancements

## Problem

The current `beatOffset` (3.25s) is silent audio in `beat.mp3`. Players have no rhythm cue before tiles start firing, making it hard to lock in to the tempo — especially at higher BPM.

## Goal

Play real music for a configurable number of full bars before tiles start, so players can feel the groove and be ready when the game begins.

## Playback Change

When the player hits **Start beat**, start `audio.currentTime = beatOffset` instead of `0`. This skips the silent intro and plays real music immediately. The silent intro section of `beat.mp3` is no longer used.

Setting `warmupBars = 0` restores the original behavior: tiles start on the first beat after the offset.

## New Config: `warmupBars`

| Property | Value |
|---|---|
| Default | `2` (two full bars, 8 beats) |
| Min | `0` (no warmup — tiles start immediately) |
| Max | `8` |
| Step | `1` (whole bars only) |
| Derived | `warmupBeats = warmupBars × 4` |

Rationale for default 2: at 150 BPM, 1 bar is only 1.6s — too fast for new players to lock in. Two bars is the industry standard (osu!, DDR, Beat Saber).

## Timing Logic

The existing tick loop computes `b = floor(elapsed / beatInterval_s)` where `elapsed = audio.currentTime - beatOffset`.

- **Warmup phase** (`b < warmupBeats`): beat dot pings on every beat, tiles visible but dimmed, no tile highlighting, beat counter shown in overlay.
- **Game phase** (`b >= warmupBeats`): tile index = `b - warmupBeats`, same behaviour as today. Overlay hides.

The warmup ends exactly on a bar boundary (beat 1 of a new bar), so the tile grid always starts on a musically natural downbeat.

## Visual Countdown

During warmup the intro overlay shows:

- **Caption:** "Feel the beat" (replaces "Are you ready?")
- **Number:** `(b % 4) + 1` — cycles 1 → 2 → 3 → 4 per bar, beat-synced (changes on the beat, not on a wall-clock timer)
- On the final warmup beat the number pulses larger before the overlay hides

## Config Surface (Tweaks Panel)

Add a **Warmup bars** number input (0–8, step 1) in the tweaks panel alongside the existing BPM and `beatOffset` controls. Data flows: tweaks state → `App` → `PlayScreen` prop, matching the existing `beatOffset` pattern.

## Files Affected

- `word-on-beat/components/app.jsx` — add `warmupBars` to tweaks state (default 2), pass as prop to `PlayScreen`, render input in tweaks panel
- `word-on-beat/components/screens.jsx` — update `PlayScreen` to accept `warmupBars` prop, change audio start to `beatOffset`, extend tick loop with warmup phase logic, update intro overlay caption and beat-synced counter

## Out of Scope

- Modifying `beat.mp3` itself
- Per-difficulty warmup length (use the single configurable value for all difficulties)
- Metronome click overlay
