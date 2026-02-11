# Animations

> Technical documentation for the animation components in Creature Nexus TCG.
> Various components added from v0.2.0 to v0.9.0.

---

## Overview

The app uses a set of specialized animation components for game feedback, card reveals, and visual effects. Most use React Native's built-in `Animated` API; `PackOpeningAnimation` uses `react-native-reanimated`.

---

## Components

### PackOpeningAnimation

| | |
|---|---|
| **File** | `components/Animation/PackOpeningAnimation.tsx` |
| **Library** | `react-native-reanimated` |
| **Used in** | Store screen, Home screen |

Displays opened cards in a modal with a 3-2 grid layout. Cards animate in sequentially with spring effects. Supports multi-pack pagination (5 cards per page).

| Prop | Type | Description |
|------|------|-------------|
| `cards` | `Card[]` | Cards to display |
| `onComplete` | `() => void` | Called when animation finishes |

---

### RewardAnimation

| | |
|---|---|
| **File** | `components/Animation/RewardAnimation.tsx` |
| **Library** | `Animated` |
| **Used in** | `RedeemCodeModal` |

Centered popup that displays a reward (card, pack, or coins) with scale-up + fade-in, hold, then fade-out.

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'card'` \| `'pack'` \| `'coins'` | Reward type |
| `message` | `string` | Text above the visual |
| `card?` | `Card` | Card to display (when type = card) |
| `pack?` | `BoosterPack` | Pack to display (when type = pack) |
| `coins?` | `number` | Coin amount (when type = coins) |
| `onComplete?` | `() => void` | Called when animation finishes |
| `durationMs?` | `number` | Total duration (default: 1600ms) |

---

### DamageEffect

| | |
|---|---|
| **File** | `components/DamageEffect.tsx` |
| **Library** | `Animated` |
| **Used in** | `CardComponent` (wraps attacked cards) |

Wraps a child component with a red flash overlay and horizontal shake. Plays the impact sound effect on trigger.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Component to wrap |
| `isActive` | `boolean` | Trigger the animation |
| `duration?` | `number` | Duration in ms (default: 1000, 0 to disable) |
| `onAnimationComplete?` | `() => void` | Called when animation finishes |

Animation sequence: double red flash (quick flash → fade → second flash → final fade) + precise shake pattern.

---

### SpellCastAnimation

| | |
|---|---|
| **File** | `components/Animation/SpellCastAnimation.tsx` |
| **Library** | `Animated` |
| **Used in** | `GameBoard` |

A spell card flies from its starting position to center screen, pulses, then fades out. A purple magic wave expands from the center simultaneously.

| Prop | Type | Description |
|------|------|-------------|
| `spell` | `Card` | The spell card to animate |
| `startPosition` | `{ x, y }` | Starting coordinates |
| `onComplete?` | `() => void` | Called when animation finishes |

---

### EnergyWaveAnimation

| | |
|---|---|
| **File** | `components/Animation/EnergyWaveAnimation.tsx` |
| **Library** | `Animated` |
| **Used in** | Energy gain phase |

A radiating green/cyan expanding circle with a bouncy text label showing energy gain amount.

| Prop | Type | Description |
|------|------|-------------|
| `energyAmount` | `number` | Energy amount to display |
| `onComplete?` | `() => void` | Called when animation finishes |

---

### EnergyOrbAnimation

| | |
|---|---|
| **File** | `components/Animation/EnergyOrbAnimation.tsx` |
| **Library** | `Animated` |
| **Used in** | Energy gain effects |

A glowing purple orb that floats from a start position to a target position, displaying the energy amount, then disappears with a burst effect.

| Prop | Type | Description |
|------|------|-------------|
| `energyAmount` | `number` | Energy amount to display |
| `onComplete?` | `() => void` | Called when animation finishes |
| `targetPosition?` | `{ x, y }` | Target coordinates (default: top-left) |
| `startPosition?` | `{ x, y }` | Start coordinates (default: bottom-center) |

---

### MonsterShowcaseAnimation

| | |
|---|---|
| **File** | `components/Animation/MonsterShowcaseAnimation.tsx` |
| **Library** | `Animated` |
| **Used in** | Auth/login screen |

Flipbook-style animation that cycles through monster images with increasing speed, ending with a final mythic reveal. Platform-specific image sets (web vs mobile).

| Prop | Type | Description |
|------|------|-------------|
| `transitionDuration?` | `number` | Time per image (default: 800ms) |
| `fadeDuration?` | `number` | Fade transition time (default: 400ms) |
| `autoStart?` | `boolean` | Auto-start on mount (default: true) |
| `fullScreen?` | `boolean` | Full-screen overlay mode (default: false) |
| `onAnimationComplete?` | `() => void` | Called when complete |
| `onSkip?` | `() => void` | Called when skip button pressed |

---

### EnergyAnimationDemo

| | |
|---|---|
| **File** | `components/Animation/EnergyAnimationDemo.tsx` |
| **Used in** | Dev/test only |

Test harness for previewing `EnergyOrbAnimation`, `EnergyWaveAnimation`, `SpellCastAnimation`, and `RewardAnimation`.

---

## Summary

| Component | Effect | Library | Trigger |
|-----------|--------|---------|---------|
| PackOpeningAnimation | Card grid reveal with pagination | Reanimated | Pack opened |
| RewardAnimation | Centered popup (scale + fade) | Animated | Promo code redeemed |
| DamageEffect | Red flash + shake | Animated | Card takes damage |
| SpellCastAnimation | Card flies to center + magic wave | Animated | Spell cast |
| EnergyWaveAnimation | Expanding circle + text | Animated | Energy gained |
| EnergyOrbAnimation | Floating orb trajectory | Animated | Energy gained |
| MonsterShowcaseAnimation | Flipbook creature reveal | Animated | Login screen |

---

*Last updated: February 2026*
