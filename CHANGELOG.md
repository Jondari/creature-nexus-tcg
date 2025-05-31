# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.1](https://github.com/Jondari/creature-nexus-tcg/compare/v0.1.0...v0.1.1) (2025-05-31)

#### Added
- Set up automated changelog and versioning system using `standard-version`.

---

### [0.1.0](https://github.com/Jondari/creature-nexus-tcg/releases/tag/0.1.0) (2024-05-31)

### Added
- Initial implementation of Creature Nexus TCG core loop.
- Anonymous authentication with Firebase.
- Card pack opening system: 1 free pack available every 12 hours.
- Card rarity logic with weights and visual effects (Common → Mythic).
- Storage of cards per user in Firebase Firestore.
- Collection screen with filter by rarity and duplicate counter.
- Basic tabbed navigation using `expo-router`.

### Tech Stack
- Expo (React Native)
- Firebase (Auth + Firestore)
- TypeScript
- Expo Router

---

## [Unreleased]

### Planned
- Shop screen with in-game currency
- Card trading between users
- PvE battle mode (missions vs AI)
- Advanced animations and sound for pack openings
- Progression system with achievements or rewards
