# Avatar Frame System

> Technical documentation for the avatar frame system in Creature Nexus TCG.
> Introduced in v0.31.0 (April 2026).

---

## Overview

Avatar frames are cosmetic overlays displayed around the player's avatar circle. One frame can be active at a time (or none). Frames are unlocked via redeem codes and visible on the profile screen and in battle.

---

## Architecture

| File | Role |
|------|------|
| `types/avatarFrame.ts` | `AvatarFrameDefinition` interface |
| `data/frames.shared.js` | Source of truth — frame catalog (shared with admin scripts) |
| `utils/avatarFrameUtils.ts` | Image resolution, ID validation |
| `components/PlayerAvatar.tsx` | Renders avatar with optional frame overlay |
| `components/AvatarFrameSelector.tsx` | Modal to pick one frame from unlocked ones |
| `context/AuthContextFirebase.tsx` | State management — `unlockedFrames`, `selectedFrame`, mutations |
| `services/redeemCodeService.ts` | Attribution via redeem codes |
| `scripts/redeem-code.js` | Admin CLI — create codes with frame rewards |

---

## Frame Catalog

Defined in `data/frames.shared.js` (CommonJS, shared with `scripts/redeem-code.js`):

| ID | Display Name |
|----|-------------|
| `backer` | Backer |
| `beta_tester` | Beta Tester |
| `beta_tester_golden` | Golden Beta Tester |
| `fire` | Fire |
| `water` | Water |
| `earth` | Earth |
| `ice` | Ice |
| `vortex` | Vortex |

### Adding a new frame

1. Add the entry to `data/frames.shared.js`
2. Add the image at `assets/images/frame/avatar/{id}.png` (transparent PNG, square, ≥512×512 px, center ~70% transparent so the avatar shows through)
3. Register it in `FRAME_IMAGES` in `utils/avatarFrameUtils.ts`
4. Add i18n keys `avatarFrame.name.{id}` in `data/i18n_en.json` and `data/i18n_fr.json`

---

## Types

```typescript
// types/avatarFrame.ts
export interface AvatarFrameDefinition {
  id: string;
  name: string; // used as i18n key suffix: avatarFrame.name.{id}
}
```

---

## Firebase Storage

| Path | Type | Description |
|------|------|-------------|
| `users/{uid}.unlockedFrames` | `string[]` | All frame IDs the user has earned |
| `users/{uid}.selectedFrame` | `string \| null` | The currently active frame (`null` = no frame) |

Both fields are initialized to `[]` / `null` on user creation.

---

## AuthContext API

```typescript
unlockedFrames: string[];
selectedFrame: string | null;
updateSelectedFrame: (frameId: string | null) => Promise<void>;
refreshFrames: () => Promise<void>;
```

### `updateSelectedFrame(frameId)`

- Validates that `frameId` is in `unlockedFrames` (or `null` to clear the frame)
- Writes `selectedFrame` to Firestore and updates local state

### `refreshFrames()`

Reads `unlockedFrames` and `selectedFrame` from Firestore and syncs local state. Called after a successful redeem code redemption.

---

## Visual Rendering

Frames are rendered in `PlayerAvatar` as an absolutely-positioned image overlay on top of the avatar circle.

```typescript
<PlayerAvatar creatureName={avatarCreature} size="large" frame={selectedFrame} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `frame` | `string \| null \| undefined` | `undefined` | Frame ID to overlay, or null/undefined for none |

### Overlay dimensions

The frame image is scaled to **140% of the avatar size** and centered:

```
frameWidth  = avatarSize × 1.4
frameHeight = avatarSize × 1.4
top         = -(avatarSize × 0.2)
left        = -(avatarSize × 0.2)
```

When a frame is active, the element-colored border ring is hidden — the frame image visually replaces it.

### Image requirements

| Property | Requirement |
|----------|-------------|
| Format | PNG with alpha channel |
| Shape | Square |
| Minimum size | 512×512 px |
| Transparent zone | Center ~70% (so the avatar shows through) |

---

## UI Components

### `PlayerAvatar` (with frame)

The `frame` prop is threaded through to all contexts where the avatar appears:

| Screen / Component | Context |
|--------------------|---------|
| `app/(tabs)/profile.tsx` | Profile page (large size) |
| `components/board/PlayerInfo.tsx` | Battle player info bars (medium size) |
| `components/AvatarFrameSelector.tsx` | Live preview inside the selector modal |
| `components/Animation/RewardAnimation.tsx` | Reward animation after redemption |

### `AvatarFrameSelector`

Modal listing all unlocked frames plus a "No frame" option. Includes a live preview via `PlayerAvatar`.

```typescript
<AvatarFrameSelector
  visible={showFrameSelector}
  unlockedFrames={unlockedFrames}
  currentFrame={selectedFrame}
  currentAvatar={avatarCreature}
  onClose={() => setShowFrameSelector(false)}
  onSelect={handleFrameSelect}
/>
```

The selector button on the profile screen is only rendered when `unlockedFrames.length > 0`.

---

## Reward Flow

```
Admin creates code with avatarFrames: ["fire"]
  → Stored in Firestore /redeemCodes/{id}

User redeems code in RedeemCodeModal
  → RedeemCodeService.processRewards()
    → isValidFrameId(frameId) validates each frame
    → arrayUnion(...validFrames) → /users/{uid}.unlockedFrames
  → refreshFrames() called in AuthContext
  → RewardAnimation type='avatarFrame' queued
    → Shows PlayerAvatar preview with the new frame
  → AvatarFrameSelector button appears on profile
```

---

## i18n Keys

| Key | EN | FR |
|-----|----|----|
| `avatarFrame.changeFrame` | Change Frame | Changer le cadre |
| `avatarFrame.selectFrame` | Select Frame | Sélectionner un cadre |
| `avatarFrame.noFrame` | No Frame | Aucun cadre |
| `avatarFrame.updateFailed` | Failed to update frame | Échec de la mise à jour du cadre |
| `avatarFrame.name.backer` | Backer | Backer |
| `avatarFrame.name.beta_tester` | Beta Tester | Beta Testeur |
| `avatarFrame.name.beta_tester_golden` | Golden Beta Tester | Beta Testeur Doré |
| `avatarFrame.name.fire` | Fire | Feu |
| `avatarFrame.name.water` | Water | Eau |
| `avatarFrame.name.earth` | Earth | Terre |
| `avatarFrame.name.ice` | Ice | Glace |
| `avatarFrame.name.vortex` | Vortex | Vortex |
| `redeem.reward.avatarFrame` | You received the {{name}} avatar frame! | Vous avez reçu le cadre d'avatar {{name}} ! |

---

*Last updated: April 2026*
