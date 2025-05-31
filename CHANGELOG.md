# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [v0.1.0] - 2024-05-31

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
