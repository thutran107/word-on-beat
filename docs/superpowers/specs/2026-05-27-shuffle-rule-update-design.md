# Shuffle Rule Update — Design Spec

**Date:** 2026-05-27
**Status:** Approved

## Overview

Two changes to how tiles are shuffled in the Play screen:

1. **Partial shuffle for easy and medium** — only half the tiles are randomized; the other half stay in grouped order. Hard keeps the existing full random shuffle.
2. **Per-player uniqueness within a session** — players at the same difficulty level never see the same tile layout in the same game session.

## Change 1: Difficulty-Aware Partial Shuffle

**File:** `word-on-beat/components/screens.jsx` — `generateTiles(total, activeSlots)`

Add a `difficulty` parameter (default `'hard'`).

**Easy and medium:** After the initial cycling pass (which distributes options evenly across tile slots), select `Math.floor(total / 2)` random index positions. Extract the tiles at those positions, shuffle just that subset using Fisher-Yates, then put them back. The remaining half of the tiles stay in their original grouped order.

**Hard:** No change — full Fisher-Yates shuffle of all tiles, as today.

All callers of `generateTiles` (initial state, `reshuffle()`, and the preview in `GridSizeScreen`) pass the current level's `id` as the `difficulty` argument.

## Change 2: Per-Player Uniqueness Within a Session

**File:** `word-on-beat/components/app.jsx`

Add a `usedLayoutsRef = useRef({ easy: new Set(), medium: new Set(), hard: new Set() })`.

- Reset all sets when a new game starts (i.e., when `currentPlayerIdx` and `currentLevelIdx` reset to 0).
- Pass the ref down to `PlayScreen` as a `usedLayouts` prop.

**File:** `word-on-beat/components/screens.jsx` — `PlayScreen`

On initial tile generation (and on manual reshuffle), wrap `generateTiles` in a retry loop:

1. Generate a candidate layout.
2. Stringify it (join tile labels/srcs into a string key).
3. If the key is already in `usedLayouts.current[levelId]`, retry — up to **10 attempts**.
4. On success, record the key in the set.
5. If all 10 attempts collide (edge case: very small grids with few options), use the last generated layout anyway.

Manual reshuffles (the 🔀 button) also participate in this check so the same board doesn't reappear mid-session.

## Out of Scope

- Persisting used layouts across separate game sessions.
- Changing shuffle behavior for the `reshuffle` button in hard mode.
- Any change to BPM, grid size, or difficulty definitions.
