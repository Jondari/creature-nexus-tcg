# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/Jondari/creature-nexus-tcg/compare/v0.1.3...v0.2.0) (2025-06-28)


### ⚠ BREAKING CHANGES

* Added full battle system with game engine and UI improvements

Major Features:
- Complete battle system with AI opponent and combat mechanics
- Game state management with card interactions and animations
- Battle UI components including GameBoard and ActionLog
- Deck management system with DeckBuilder component
- Audio integration with impact sound effects

UX Enhancements:
- Horizontal pack opening layout with user-controlled dismissal
- Click-to-dismiss and Continue button functionality
- Real-time collection synchronization between screens
- Responsive card sizing with small/normal modes
- Enhanced card detail modals with proper scaling

Visual Improvements:
- Unified card model using battle engine Card interface
- Grey color scheme for common cards matching design standards
- Fixed filter button sizing across all screen states
- Proportional element scaling for small cards
- Professional card animations and transitions

Technical Changes:
- Integrated battle engine types and game logic
- Added context providers for game and deck state
- Implemented card generation using battle engine data
- Enhanced navigation with Battle and Decks tabs
- Improved state management across multiple screens

### Features

* integrate complete battle system with enhanced UX ([a69e182](https://github.com/Jondari/creature-nexus-tcg/commit/a69e1821364eb5cb595c802c589f33c5c7c002ab))

### [0.1.3](https://github.com/Jondari/creature-nexus-tcg/compare/v0.1.2...v0.1.3) (2025-06-27)


### Features

* add Google authentication for web and anonymous account linking ([8375293](https://github.com/Jondari/creature-nexus-tcg/commit/837529361404e25ed295d49e671bf6ed47dc803b))
* implement complete authentication and profile management system ([0de1396](https://github.com/Jondari/creature-nexus-tcg/commit/0de1396f2e6078fdd2f693a5f26756544cd9a9a5))

### [0.1.2](https://github.com/Jondari/creature-nexus-tcg/compare/v0.1.1...v0.1.2) (2025-06-27)


### Features

* add Netlify redirects generation to build process ([5cb549b](https://github.com/Jondari/creature-nexus-tcg/commit/5cb549b1a31463f5d5e018a1e0f7fdbf1808529d))


### Bug Fixes

* switch to static output to resolve deployment issues ([13b8ce7](https://github.com/Jondari/creature-nexus-tcg/commit/13b8ce7b081461e4b6b23fa0dddf54be8cd97e31))
* update redirects to cover all routes and improve env handling ([2d67f5a](https://github.com/Jondari/creature-nexus-tcg/commit/2d67f5aa1d4b44fac550f441dbff63aea4b2e8e5))

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
