# Badge System

> Technical documentation for the badge system in Creature Nexus TCG.
> Introduced in v0.30.0 (March 2026).

---

## Overview

Badges are cosmetic items that players can display on their profile (up to 3 simultaneously). They are unlocked exclusively via redeem codes and serve as proof of participation in early access, beta testing, or special events.

---

## Architecture

| File | Role |
|------|------|
| `types/badge.ts` | `BadgeDefinition` interface |
| `data/badges.shared.js` | Source of truth — badge catalog (shared with admin scripts) |
| `utils/badgeUtils.ts` | Image resolution, ID validation, constants |
| `components/BadgeDisplay.tsx` | Renders the row of selected badges on the profile screen |
| `components/BadgeSelector.tsx` | Modal to pick up to 3 badges from unlocked ones |
| `context/AuthContextFirebase.tsx` | State management — `unlockedBadges`, `selectedBadges`, mutations |
| `services/redeemCodeService.ts` | Attribution via redeem codes |
| `scripts/redeem-code.js` | Admin CLI — create codes with badge rewards |

---

## Badge Catalog

Defined in `data/badges.shared.js` (CommonJS, shared with `scripts/redeem-code.js`):

| ID | Display Name |
|----|-------------|
| `backer` | Backer |
| `beta_tester` | Beta Tester |

### Adding a new badge

1. Add the entry to `data/badges.shared.js`
2. Add the image at `assets/images/badge/{id}.png`
3. Register it in `getBadgeImage()` in `utils/badgeUtils.ts`
4. Add i18n keys `badge.name.{id}` in `data/i18n_en.json` and `data/i18n_fr.json`

---

## Types

```typescript
// types/badge.ts
export interface BadgeDefinition {
  id: string;
  name: string; // used as i18n key suffix: badge.name.{id}
}

export type SelectedBadges = string[]; // max 3 badge IDs
```

---

## Constants

| Constant | Value |
|----------|-------|
| `MAX_DISPLAYED_BADGES` | 3 |

---

## Firebase Storage

| Path | Type | Description |
|------|------|-------------|
| `users/{uid}.unlockedBadges` | `string[]` | All badge IDs the user has earned |
| `users/{uid}.selectedBadges` | `string[]` | Up to 3 badge IDs to display (subset of unlocked) |

Both fields are initialized to `[]` on user creation.

---

## AuthContext API

```typescript
unlockedBadges: string[];
selectedBadges: string[];
updateSelectedBadges: (badges: string[]) => Promise<void>;
refreshBadges: () => Promise<void>;
```

### `updateSelectedBadges(badges)`

- Deduplicates the input array
- Filters to only include IDs present in `unlockedBadges`
- Truncates to max 3 entries
- Writes to Firestore and updates local state

### `refreshBadges()`

Reads `unlockedBadges` and `selectedBadges` from Firestore and syncs local state. Called after a successful redeem code redemption.

---

## UI Components

### `BadgeDisplay`

Renders a horizontal row of badge images. Returns `null` if `selectedBadges` is empty.

```typescript
<BadgeDisplay selectedBadges={selectedBadges} size={70} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedBadges` | `string[]` | required | IDs of badges to display |
| `size` | `number` | `70` | Width and height of each badge image (px) |

### `BadgeSelector`

Modal with a grid of unlocked badges. The user taps to toggle selection (max 3). Calls `onSelect` with the updated array on confirm.

```typescript
<BadgeSelector
  visible={showBadgeSelector}
  unlockedBadges={unlockedBadges}
  currentSelected={selectedBadges}
  onClose={() => setShowBadgeSelector(false)}
  onSelect={handleBadgeSelect}
/>
```

The selector button on the profile screen is only rendered when `unlockedBadges.length > 0`.

---

## Reward Flow

```
Admin creates code with badges: ["backer"]
  → Stored in Firestore /redeemCodes/{id}

User redeems code in RedeemCodeModal
  → RedeemCodeService.processRewards()
    → isValidBadgeId(badgeId) validates each badge
    → arrayUnion(...validBadges) → /users/{uid}.unlockedBadges
  → refreshBadges() called in AuthContext
  → RewardAnimation type='badge' queued (shows badge image)
  → BadgeSelector button appears on profile
```

---

## i18n Keys

| Key | EN | FR |
|-----|----|----|
| `badge.changeBadges` | Change Badges | Changer les badges |
| `badge.selectBadges` | Select Badges | Sélectionner les badges |
| `badge.updateFailed` | Failed to update badges | Échec de la mise à jour des badges |
| `badge.name.backer` | Backer | Backer |
| `badge.name.beta_tester` | Beta Tester | Beta Testeur |
| `redeem.reward.badge` | You received the {{name}} badge! | Vous avez reçu le badge {{name}} ! |

---

*Last updated: April 2026*
