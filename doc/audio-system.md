# Audio System

> Technical documentation for the audio and sound management in Creature Nexus TCG.
> Introduced in v0.12.0 (September 2025).

---

## Overview

The audio system handles background music and sound effects across all platforms. It uses `expo-audio` for playback, persists user preferences via AsyncStorage, and handles web-specific constraints (user interaction required before audio playback).

---

## Architecture

| File | Role |
|------|------|
| `utils/game/soundManager.ts` | Singleton `SoundManager` class — core audio engine |
| `hooks/useAudio.ts` | React hook wrapping SoundManager with state management |
| `components/MusicControls.tsx` | UI component for audio settings (profile screen) |

---

## Music Types

| Type | Asset | Usage |
|------|-------|-------|
| `general` | `assets/audio/general-background.mp3` | Menu, collection, profile screens |
| `battle` | `assets/audio/battle-background.mp3` | During battles |

Music transitions use a crossfade effect (800ms default) when switching between types.

---

## Sound Effects

| Key | Asset | Trigger | Co-located in |
|-----|-------|---------|---------------|
| `impact` | `assets/audio/sfx/impact.wav` | Element-less attack (fallback) | `DamageEffect` |
| `card_play` | `assets/audio/sfx/card_play.wav` | Card placed on battlefield | `CardComponent` (`entryAnimation`) |
| `card_death` | `assets/audio/sfx/card_death.wav` | Creature killed | `DamageEffect` (delayed to shake end) |
| `card_retire` | `assets/audio/sfx/card_retire.wav` | Card retired from field | `CardComponent` (`isRetiring`) |
| `victory` | `assets/audio/sfx/victory.wav` | Player wins | `GameOverAnimation` |
| `defeat` | `assets/audio/sfx/defeat.wav` | Player loses | `GameOverAnimation` |
| `turn_end` | `assets/audio/sfx/turn_end.wav` | Turn transition | `TurnTransitionBanner` |
| `energy_gain` | `assets/audio/sfx/energy_gain.wav` | Energy granted at turn start | `EnergyWaveAnimation` |
| `spell_cast` | `assets/audio/sfx/spell_cast.wav` | Spell cast | `SpellCastAnimation` |
| `attack_fire` | `assets/audio/sfx/attack_fire.wav` | Fire attack | `DamageEffect` via `playAttackSound` |
| `attack_water` | `assets/audio/sfx/attack_water.wav` | Water attack | `DamageEffect` via `playAttackSound` |
| `attack_air` | `assets/audio/sfx/attack_air.wav` | Air attack | `DamageEffect` via `playAttackSound` |
| `attack_earth` | `assets/audio/sfx/attack_earth.wav` | Earth attack | `DamageEffect` via `playAttackSound` |

Sound effects are loaded at app startup via `initializeSounds()` (called in `app/_layout.tsx`) and played via `playAttackSound(element?)` or `soundManager.playSound(SFX.KEY)`.

### SFX co-location principle

SFX are triggered **from the animation component** they accompany, not from game logic (`GameBoard`, `GameContext`). This prevents duplicates and keeps sound and visuals in sync.

| ❌ Avoid | ✅ Correct |
|---------|----------|
| `GameBoard.handleRetire()` plays `CARD_RETIRE` | `CardComponent` `isRetiring` useEffect plays `CARD_RETIRE` |
| `GameContext.executeAITurn()` plays `CARD_PLAY` | `CardComponent` `entryAnimation` useEffect plays `CARD_PLAY` |

Exception: `DamageEffect` hosts multiple sounds (`playAttackSound` + delayed `CARD_DEATH`) because it owns the entire hit sequence.

---

## SoundManager API

### Music

| Method | Description |
|--------|-------------|
| `playMusic(type, forceRestart?)` | Play background music with crossfade |
| `stopMusic()` | Stop and release current music |
| `pauseMusic()` | Pause current music |
| `resumeMusic()` | Resume paused music |

### Sound Effects

| Method | Description |
|--------|-------------|
| `loadSound(name, source)` | Register a sound effect |
| `playSound(name)` | Play a registered sound effect |

### Settings

| Method | Description |
|--------|-------------|
| `setMusicEnabled(bool)` | Toggle music on/off |
| `setSoundEffectsEnabled(bool)` | Toggle SFX on/off |
| `setMusicVolume(0-1)` | Set music volume |
| `setSoundEffectsVolume(0-1)` | Set SFX volume |
| `enableAudio()` | Manually unlock audio context (web) |

---

## useAudio Hook

React hook that wraps SoundManager with reactive state. Provides all SoundManager methods plus:

- `isPlaying` — whether music is currently playing
- `currentMusicType` — `'general'` | `'battle'` | `null`
- `hasUserInteracted` — whether audio context is unlocked (web)
- `settings` — current `AudioSettings` object

### Options

```typescript
useAudio({ autoPlay: true, musicType: MusicType.GENERAL });
```

Auto-plays the specified music type on mount if no music is currently playing.

### App State Handling

The hook automatically pauses music when the app goes to background and resumes when it returns to foreground (via `AppState` listener).

---

## UI Components

### MusicControls

Rendered in the profile screen. Provides:

- Music toggle (on/off switch)
- Music volume control (+/- buttons, percentage display)
- Sound effects toggle (on/off switch)
- Sound effects volume control (+/- buttons, percentage display)
- "Now Playing" indicator showing current music type

### AudioPermissionBanner

Web-only floating banner (`components/AudioPermissionBanner.tsx`) displayed when music is enabled but the audio context is still locked. Shows an "Enable" button that calls `enableAudio()`. Automatically hidden after interaction or manual dismissal.

---

## Platform Behavior

### Web

Browsers block audio playback until a user interaction occurs. The SoundManager handles this by:

1. Registering `click`, `touchstart`, `keydown` listeners on `document`
2. Storing music requests as `pendingMusicType` until interaction occurs
3. Playing pending music automatically after first user interaction
4. Listeners are removed after first interaction (`{ once: true }`)

### Mobile (iOS/Android)

`userHasInteracted` is set to `true` immediately — no interaction gate required.

---

## Persistence

| Key | Storage | Data |
|-----|---------|------|
| `audio-settings` | AsyncStorage | `AudioSettings` JSON |

### Default Settings

```typescript
{
  musicEnabled: true,
  musicVolume: 0.5,
  soundEffectsEnabled: true,
  soundEffectsVolume: 0.7
}
```

---

## Crossfade

When switching music types, the SoundManager performs a crossfade:

1. New player starts at volume 0
2. Old player volume fades from current to 0
3. New player volume fades from 0 to target
4. Fade duration: 800ms, updated every 50ms
5. Old player is paused and released after fade completes

If no previous music is playing, a simple fade-in is performed instead.

---

## i18n Keys

| Key | EN | FR |
|-----|----|----|
| `audio.settingsTitle` | Audio Settings | Paramètres audio |
| `audio.backgroundMusic` | Background Music | Musique de fond |
| `audio.musicVolume` | Music Volume | Volume de la musique |
| `audio.soundEffects` | Sound Effects | Effets sonores |
| `audio.effectsVolume` | Effects Volume | Volume des effets |
| `audio.nowPlaying` | Now Playing: | Lecture en cours : |
| `audio.noMusic` | No music | Aucune musique |
| `audio.battleMusic` | Battle Music | Musique de combat |
| `audio.enableTitle` | Enable Audio | Activer le son |
| `audio.enableSubtitle` | Tap to enable background music | Touchez pour activer la musique de fond |
| `audio.enableButton` | Enable | Activer |

---

*Last updated: March 2026*
