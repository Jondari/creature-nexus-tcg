# Quest System

> Technical documentation for the quest system in Creature Nexus TCG.
> Introduced in v0.32.0 (April 2026).

## Overview

The quest system lets players earn rewards by completing gameplay objectives. It supports both:
- **live mode** with Firebase-backed templates and player progress
- **demo mode** with fully local templates and AsyncStorage persistence

Quests come in four flavours:
- **permanent**
- **daily**
- **weekly**
- **event**

Rewards reuse the same domain model as redeem codes:
- Nexus Coins
- packs
- cards
- badges
- avatar frames

The system is designed so that gameplay emits canonical quest events and the quest runtime processes them without coupling gameplay code directly to quest storage or reward-granting logic.

## Architecture

### Files

| File | Role |
|------|------|
| `types/quest.ts` | Core TypeScript interfaces: `QuestTemplate`, `PlayerQuest`, `QuestService`, `QuestRuntimeEvent` |
| `data/quests.shared.js` | Shared quest catalog (CommonJS) — consumed by app and `scripts/push-quests.js` |
| `data/quests.demo.js` | Demo-only quests (CommonJS) — merged on top of shared, demo wins on ID collision |
| `data/quests.sample.js` | Example quest catalog for documentation/reference only |
| `services/questService.ts` | Re-export of `QuestService` type + `getLastResetBoundary()` / `getLastWeeklyResetBoundary()` |
| `services/questService.local.ts` | `QuestServiceLocal` — AsyncStorage-backed implementation for demo mode |
| `services/questService.firebase.ts` | `QuestServiceFirebase` — Firestore-backed implementation for production |
| `context/QuestContextLocal.tsx` | React context provider for demo mode |
| `context/QuestContextFirebase.tsx` | React context provider for production (real-time via `onSnapshot`) |
| `context/QuestContext.tsx` | Façade — re-exports from `Providers.tsx` |
| `context/Providers.tsx` | Conditional loader: injects Local or Firebase implementation |
| `utils/gameEventBus.ts` | Lightweight gameplay pub/sub used to emit canonical quest events |
| `utils/questText.ts` | Resolves quest `title` and `description` with i18n key fallback (`titleKey` / `descriptionKey`) |
| `utils/rewardAnimUtils.ts` | Shared helper that converts rewards into `RewardAnimation` queue items |
| `components/QuestRewardOverlay.tsx` | Global reward animation layer for quest rewards |
| `app/(tabs)/quests.tsx` | Player-facing quest list screen (accessible from home CTA, not in tab bar) |
| `app/dev-quests.tsx` | Dev-only debug screen showing full quest state, conditions, rewards and manual claim. Accessible from Profile in `__DEV__`. |
| `scripts/push-quests.js` | Admin script to push `SHARED_QUESTS` to Firestore `quests/` collection |

### Live vs Demo

| Concern | Demo mode | Live mode |
|---------|-----------|-----------|
| Template source | `SHARED_QUESTS` + `DEMO_QUESTS` merged | Firestore `quests/` collection (cached 5 min) |
| Player progress | AsyncStorage `@demo_quest_progress` | Firestore `users/{uid}/quests/{questId}` |
| Real-time updates | Refresh-driven | `onSnapshot` subscription |
| Coin rewards | `addDemoCoins()` | `addNexusCoins()` (Firebase) |
| Pack rewards | `addDemoPack()` with `STANDARD_PACK` (standard pack ID only) | `addPackToInventory()` |
| Card rewards | Generated and granted locally | Generated and added to collection |
| Badge/frame rewards | Granted locally via demo user profile | `arrayUnion` on user document |
| Authority | Local device only | Firebase authoritative |

### Quest Source Rules

- `data/quests.shared.js` is the real shared quest source
- `data/quests.demo.js` is the demo-only extension layer
- `data/quests.sample.js` is example/reference only
- only `data/quests.shared.js` is pushed to Firebase by `scripts/push-quests.js`
- in demo mode, `data/quests.shared.js` is optional; if absent, the local quest service falls back to demo-only quests from `data/quests.demo.js`

### Runtime Flow

The runtime is split into four layers:

1. **Quest definitions**
   - `data/quests.shared.js`
   - `data/quests.demo.js`
2. **Gameplay event emission**
   - `utils/gameEventBus.ts`
   - emitters in gameplay screens/components
3. **Quest runtime**
   - `QuestContextLocal` / `QuestContextFirebase`
   - `QuestServiceLocal` / `QuestServiceFirebase`
4. **Reward presentation**
   - `QuestRewardOverlay`
   - `RewardAnimation`

## Quest Template Structure

```ts
interface QuestTemplate {
  id: string;           // Unique identifier, e.g. "daily_open_pack"
  title: string;        // Display title (fallback if titleKey is absent or unresolved)
  titleKey?: string;    // i18n key — resolved via getQuestTitle() in utils/questText.ts
  type: QuestType;      // 'permanent' | 'daily' | 'weekly' | 'event'
  description?: string;    // Fallback description
  descriptionKey?: string; // i18n key — resolved via getQuestDescription() in utils/questText.ts
  conditions: QuestCondition[];  // All conditions must be satisfied
  rewards: QuestRewards;         // nexusCoins, packs, cards, badges, avatarFrames
  rewardMode?: QuestRewardMode;  // 'manual_claim' | 'auto_claim'
  hidden?: boolean;              // optional hidden/secret quest
  expiresAt?: string | null;     // ISO UTC — for 'event' type only
  repeatable?: boolean;          // true for daily/weekly
  enabled?: boolean;             // false = quest fully disabled: no progress, no player UI
  sortOrder?: number;
}

interface QuestCondition {
  id: string;                   // Unique within the quest
  event: QuestEventName;        // Event type that increments this condition
  count: number;                // Target count to complete
  filters?: {
    rankedOnly?: boolean;
    packId?: string;
    cardId?: string;
    rarity?: string;
    element?: string;
  };
}
```

### Runtime Event Shape

Gameplay should emit normalized quest runtime events:

```ts
interface QuestRuntimeEvent {
  name: QuestEventName;
  userId: string;
  occurredAt: string; // ISO UTC
  amount?: number;    // default 1
  metadata?: {
    rankedOnly?: boolean;
    packId?: string;
    cardId?: string;
    rarity?: string;
    element?: string;
  };
}
```

### Reward Modes

- `manual_claim`
  - the quest moves to `completed`
  - the player must claim it explicitly
- `auto_claim`
  - rewards are granted immediately when conditions are satisfied
  - the quest moves directly to `claimed`

### Reward Payload

Quest rewards reuse `RedeemCodeRewards`.

Canonical reward keys:
- `nexusCoins`
- `packs`
- `cards`
- `badges`
- `avatarFrames`

This keeps quest rewards compatible with the existing reward animation and reward-granting pipeline.

### Player Quest State

```ts
interface PlayerQuest {
  questId: string;
  state: 'available' | 'completed' | 'claimed' | 'expired';
  progressByCondition: Record<string, number>;
  completedAt?: string | null;
  claimedAt?: string | null;
  lastResetAt?: string | null;
  updatedAt?: string;
}
```

## Event Flow

Gameplay code emits canonical quest events through `gameEventBus`.

Example emitters currently in the app:
- battle victory from `GameBoard.tsx`
- pack opening from home/store flows

The quest contexts subscribe to those events and forward them to the active service.

```text
Gameplay / pack opening / battle end
  -> gameEventBus.emit('battle_won' | 'pack_opened' | ...)
    -> QuestContext*.processEvent(...)
      -> QuestService.processEvent(userId, event)
        -> match active templates by event name + filters
        -> increment progressByCondition[conditionId]
        -> if all conditions satisfied:
           -> manual_claim => state = 'completed'
           -> auto_claim   => grant rewards, state = 'claimed'
        -> persist updated state
```

Manual claim flow:

```text
Quest UI (current or future)
  -> useQuests().claimQuest(questId)
    -> QuestService.claimQuest(userId, questId)
      -> verify state === 'completed'
      -> grant rewards through the active storage backend
      -> return reward details for animation
      -> persist state = 'claimed'
```

### Reward Animation Flow

Quest rewards use the same visual pipeline as redeem code rewards:

```text
claimQuest() or auto_claim
  -> QuestContext stores pending quest rewards
    -> QuestRewardOverlay builds animation queue
      -> RewardAnimation plays coins / packs / cards / badges / frames
```

`utils/rewardAnimUtils.ts` is the shared conversion helper used by both:
- `RedeemCodeModal`
- `QuestRewardOverlay`

## Reset Boundaries

Daily and weekly quests reset at a fixed UTC time to ensure global consistency:

- **Daily reset**: most recent `22:00:00Z` — implemented in `getLastResetBoundary()`
- **Weekly reset**: most recent Monday at `22:00:00Z` — implemented in `getLastWeeklyResetBoundary()`

This corresponds to midnight in France during summer time and is intentionally fixed for MVP.

`resetRecurringQuestsIfNeeded()` is called on context mount. It resets any recurring quest in state:
- `claimed`
- `completed`

when `lastResetAt`, `claimedAt`, or `completedAt` predates the relevant boundary.

## Firebase Data Model

### Global Quest Templates

Firestore collection:

```text
quests/{questId}
```

These documents store the global quest catalogue pushed by:

```bash
node scripts/push-quests.js
```

### Player Quest State

Firestore path:

```text
users/{uid}/quests/{questId}
```

Each document stores player-specific runtime state.

Example:

```json
{
  "questId": "first_victory",
  "state": "completed",
  "progressByCondition": {
    "win_1": 1
  },
  "completedAt": "2026-04-01T10:25:00.000Z",
  "claimedAt": null,
  "lastResetAt": null,
  "updatedAt": "2026-04-01T10:25:00.000Z"
}
```

Design rules:
- never store player progress inside `quests/{questId}`
- never store quest templates inside `users/{uid}/quests/{questId}`
- keep reward payloads compatible with `RedeemCodeRewards`

## How to Add a New Quest

1. **Add the entry** to `data/quests.shared.js` (or `data/quests.demo.js` for demo-only):

   ```js
   {
     id: 'collect_10_cards',
     title: 'Collector',
     type: 'permanent',
     conditions: [{ id: 'collect_10_cards_cond1', event: 'cards_collected', count: 10 }],
     rewards: { nexusCoins: 150 },
     rewardMode: 'manual_claim',
     enabled: true,
     sortOrder: 3,
   }
   ```

2. **Push to Firestore** (production only):

   ```bash
   node scripts/push-quests.js
   ```

   Notes:
   - this pushes only `data/quests.shared.js`
   - it never pushes `data/quests.demo.js`
   - `data/quests.sample.js` is only a format example

3. **Make sure the relevant gameplay event is emitted**:

   ```ts
   gameEventBus.emit('cards_collected', { amount: cards.length });
   ```

4. **Choose the reward mode**:
   - `manual_claim` for standard visible quests
   - `auto_claim` for hidden/event-like rewards

5. **Add i18n keys** if the quest has custom UI text (use the `quests.*` namespace if/when quest UI is localized that way).

## Storage

### Demo mode

AsyncStorage key: `@demo_quest_progress`

Value: `Record<questId, PlayerQuest>` (JSON-serialised)

Demo limitation:
- local quest pack rewards currently support only the `standard` pack ID
- if a demo quest uses another pack ID, reward behavior is not guaranteed to match live mode

### Production

Firestore path: `users/{uid}/quests/{questId}`

Each document is a `PlayerQuest` object. Upserted via `setDoc` with `{ merge: true }`.

## Player UI

### Home block (`app/(tabs)/index.tsx`)

Displays up to 3 quests in the home screen alongside the rarity block. Filtering and sorting rules:

- excludes `hidden: true` and `enabled: false` templates
- sorted by: `completed` (unclaimed) → `available` → `sortOrder`
- capped at 3 entries
- shows: title, first condition description + progress `x/y`, claim button or state pill
- `claimed` / `expired` quests are grayed out (opacity 0.45)
- a badge dot appears on the quest CTA button if at least one quest is `completed`

### Quest page (`app/(tabs)/quests.tsx`)

Full quest list, accessible via the floating CTA on home (not in the tab bar). Same filtering and sorting rules as the home block (no cap). Additionally:

- time-limited quests (`type: 'event'` or `expiresAt` set) show a localized countdown (e.g. `2d 3h`, `45m`)
- time unit abbreviations are i18n keys: `time.dayShort`, `time.hourShort`, `time.minuteShort`

### Dev debug page (`app/dev-quests.tsx`)

Accessible from Profile in `__DEV__` only. Shows full quest state: template ID, reward mode, flags, all conditions with IDs, rewards breakdown, raw player state (completedAt, claimedAt, lastResetAt). Back button navigates to Profile.

## Known MVP Limitations

- player UI shows only the first condition of a quest — multi-condition quests will appear to have a single progress indicator
- partial multi-reward quest claims are not fully idempotent at the sub-reward level
- if a later sub-reward fails after an earlier one succeeded, retry behaviour is not fully hardened yet
- demo pack rewards currently support only the `standard` pack ID

These are intentional MVP tradeoffs.
