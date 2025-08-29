# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.2](https://github.com/Jondari/creature-nexus-tcg/compare/v0.5.1...v0.5.2) (2025-08-29)


### Features

* add iOS bundle identifier, audio permissions, Babel config, and update native build scripts to fix app crash ([fec0dc2](https://github.com/Jondari/creature-nexus-tcg/commit/fec0dc20168f1d32cd8d550f0377a4549e74cc0a))
* migrate from expo-iap to RevenueCat for in-app purchases ([aa49421](https://github.com/Jondari/creature-nexus-tcg/commit/aa49421119fb696337bd9a796ff693e14ce15878))

### [0.5.1](https://github.com/Jondari/creature-nexus-tcg/compare/v0.5.0...v0.5.1) (2025-08-28)


### Bug Fixes

* migrate billingService to expo-iap v2.8.3 API to resolve skus required error ([7590a46](https://github.com/Jondari/creature-nexus-tcg/commit/7590a46ea6de8cd78d99771c31ca679b55b58ac3))

## [0.5.0](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.8...v0.5.0) (2025-08-27)


### Features

* migrate from expo-in-app-purchases to expo-iap with comprehensive billing integration ([b264328](https://github.com/Jondari/creature-nexus-tcg/commit/b264328be0e1fa2fd572c855811264b5a130522e))

### [0.4.8](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.7...v0.4.8) (2025-08-27)


### Features

* add expo in app purchases dependency ([275fac7](https://github.com/Jondari/creature-nexus-tcg/commit/275fac7f077da120a355fcaca2a593e385ede687))


### Bug Fixes

* resolve app.json schema validation and update Expo dependencies to 53.0.22 ([6959c3d](https://github.com/Jondari/creature-nexus-tcg/commit/6959c3db0b9ff927aa8f6ec88e6a9764c6244487))

### [0.4.7](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.6...v0.4.7) (2025-08-27)


### Features

* add imagemin tools for optimizing JPEGs and PNGs to reduce app bundle size ([bb99153](https://github.com/Jondari/creature-nexus-tcg/commit/bb991537678d757946d9cdcf5ce5f4658428d040))

### [0.4.6](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.5...v0.4.6) (2025-08-27)

### [0.4.5](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.4...v0.4.5) (2025-08-26)


### Features

* enhance privacy policy with detailed account deletion procedures and data retention timelines ([22845e1](https://github.com/Jondari/creature-nexus-tcg/commit/22845e113e7101f83de6ef90faacf0fff49fdc26))

### [0.4.4](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.3...v0.4.4) (2025-08-26)


### Features

* add privacy policy page with navigation links from profile and auth screens ([0888a3c](https://github.com/Jondari/creature-nexus-tcg/commit/0888a3cf1237dc1ab6acca0e1ba81029de0f8792))

### [0.4.3](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.2...v0.4.3) (2025-08-24)


### Features

* add animated splash screen with pulsing icon effect ([4bbce11](https://github.com/Jondari/creature-nexus-tcg/commit/4bbce117be8b318a82624935afa8cac45c48f458))
* create a screen opening animation ([2427846](https://github.com/Jondari/creature-nexus-tcg/commit/24278467dca2d037c09562a2f90572ec34a1494e))

### [0.4.2](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.1...v0.4.2) (2025-08-24)


### Bug Fixes

* remove Bolt hackathon badge and associated image assets ([83f0e21](https://github.com/Jondari/creature-nexus-tcg/commit/83f0e21c922e97fbb494f06ea4ac681047dae72e))

### [0.4.1](https://github.com/Jondari/creature-nexus-tcg/compare/v0.4.0...v0.4.1) (2025-08-24)


### Features

* integrate energy wave animation system that triggers when players gain energy at turn start ([eb9f664](https://github.com/Jondari/creature-nexus-tcg/commit/eb9f664f7c8b0ec380a8872fdb4c3e9d3b2f4194))

## [0.4.0](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.10...v0.4.0) (2025-08-22)


### Features

* implement complete story mode with light persistence and dev tools ([1d3ba76](https://github.com/Jondari/creature-nexus-tcg/commit/1d3ba76e2d0bab4143787629411357e692461bba))


### Bug Fixes

* back button appearing in gameboard when battle starts from quick battle ([32706d2](https://github.com/Jondari/creature-nexus-tcg/commit/32706d24f596670c5ea8a2dd78599960b9b7010e))
* fix infinite load on battle replay ([8ee3fb7](https://github.com/Jondari/creature-nexus-tcg/commit/8ee3fb7a6d51b39c8ec2dcecbeeed142bfb25bb6))

### [0.3.10](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.9...v0.3.10) (2025-08-20)


### Features

* add damage & affinity preview on enemy targets when an attack is selected ([07cca96](https://github.com/Jondari/creature-nexus-tcg/commit/07cca96337735ff7eb2061b415e9cfbca4843743))


### Bug Fixes

* ensure hit animation plays before removing lethal targets for both player and AI ([ef31652](https://github.com/Jondari/creature-nexus-tcg/commit/ef3165227b82812a149bbc74c822690e702d0f47))
* make damage/affinity badge responsive (small vs normal card sizes) ([f977e11](https://github.com/Jondari/creature-nexus-tcg/commit/f977e112deb77dfd54ab4639dc6ac4171c61be5d))
* prevent stale attack damage ([6444772](https://github.com/Jondari/creature-nexus-tcg/commit/64447724c02e9138017a8c2b95df018e52b0f14a))
* properly cleanup damage animation timeouts to prevent memory leaks ([43ea178](https://github.com/Jondari/creature-nexus-tcg/commit/43ea178dc983241d2e114ad6a980a6a082da635b))

### [0.3.9](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.8...v0.3.9) (2025-08-17)


### Features

* sync deck data to firebase ([c336403](https://github.com/Jondari/creature-nexus-tcg/commit/c33640357264042124a95acc9546afd683dfa9de))


### Bug Fixes

* always promote most recent deck when none is active and remove stale snapshot check to prevent ghost active across devices ([6829f21](https://github.com/Jondari/creature-nexus-tcg/commit/6829f21c24fe3ecf4899a8ceca02c721026fd760))
* auto-activate & sync first deck on creation to avoid unsynced state ([2d792f5](https://github.com/Jondari/creature-nexus-tcg/commit/2d792f5b343cb39220d9c8096b5e554e30510918))
* ignore pending writes, handle zero decks, and use functional updates to prevent stale state & double sync ([4c27386](https://github.com/Jondari/creature-nexus-tcg/commit/4c27386de5b851239d0ef9515f3880aa711dc0bc))

### [0.3.8](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.7...v0.3.8) (2025-08-16)


### Features

* implement notification system for available pack opening ([7c2258c](https://github.com/Jondari/creature-nexus-tcg/commit/7c2258c665dbc829768577b992e93a27cd8d26c2))

### [0.3.7](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.6...v0.3.7) (2025-08-16)


### Features

* add dynamic version display from package.json in profile screen ([0b72d5d](https://github.com/Jondari/creature-nexus-tcg/commit/0b72d5d6ee6bc20692bc74e296c9b11e9f92d33c))
* externalize prices to config file ([d7ea4bc](https://github.com/Jondari/creature-nexus-tcg/commit/d7ea4bc2cf9559720566f12a24408bf66c700474))
* implement redeem code system and console crud ([c018d28](https://github.com/Jondari/creature-nexus-tcg/commit/c018d28837d96a597068f108231a385d092a49c4))

### [0.3.6](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.5...v0.3.6) (2025-08-14)


### Bug Fixes

* move drop_console to compress object in Terser config for production builds ([47dfebb](https://github.com/Jondari/creature-nexus-tcg/commit/47dfebb11c7d75244dbdf477a2e7d6d17e2a0642))

### [0.3.5](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.4...v0.3.5) (2025-08-14)


### Bug Fixes

* improve ActionLog sidebar height constraints for better mobile display ([c3badde](https://github.com/Jondari/creature-nexus-tcg/commit/c3badde65ba3e8cb03a5ac67907d718217861040))
* use PNG element symbols on Android for better compatibility, SVG on other platforms and remove unused SVG variants. ([1c299f9](https://github.com/Jondari/creature-nexus-tcg/commit/1c299f9f32a95956031d90216e2c26f723beb36a))

### [0.3.4](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.3...v0.3.4) (2025-08-13)


### Features

* optimize collection performance for mobile devices ([008bac4](https://github.com/Jondari/creature-nexus-tcg/commit/008bac48815a310d96dfa079421faab8411fc47a))

### [0.3.3](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.2...v0.3.3) (2025-08-13)


### Features

* configure EAS Build for Android with package name com.jondari.creaturenexustcg ([e0d1a9c](https://github.com/Jondari/creature-nexus-tcg/commit/e0d1a9c1f66434af397c02c69eabcc04d6162eb4))
* implement native Google Sign-In for Android Play Store with platform-specific authentication logic ([1227479](https://github.com/Jondari/creature-nexus-tcg/commit/1227479d8f43a8239c9ec71aed3c729f7f2ba896))


### Bug Fixes

* remove invalid androidClientId parameter from Google Sign-In configuration ([77c90dd](https://github.com/Jondari/creature-nexus-tcg/commit/77c90dd1d1bb331314a23309c890cdf32d08cce7))

### [0.3.2](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.1...v0.3.2) (2025-08-13)


### Bug Fixes

* enable Google OAuth authentication by disabling PKCE and uncommenting login buttons ([c97dec9](https://github.com/Jondari/creature-nexus-tcg/commit/c97dec9e3b7fd350da362dee98fa7cdbd038077c))

### [0.3.1](https://github.com/Jondari/creature-nexus-tcg/compare/v0.3.0...v0.3.1) (2025-08-12)


### Features

* hide status and navigation bars on Android devices for immersive gaming experience ([6b3d0ba](https://github.com/Jondari/creature-nexus-tcg/commit/6b3d0ba9a6f656060d9551be4b58f8f55cd76606))


### Bug Fixes

* enable statusBarTranslucent for Android modals to prevent edge-to-edge display gaps ([b553174](https://github.com/Jondari/creature-nexus-tcg/commit/b553174f6ddd074f265f88a534302123b2a675cd))

## [0.3.0](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.11...v0.3.0) (2025-08-12)


### Features

* implement comprehensive booster pack store system ([302c956](https://github.com/Jondari/creature-nexus-tcg/commit/302c9561c27c2d194419396f3896f51f89ea9bad))

### [0.2.11](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.10...v0.2.11) (2025-08-11)


### Bug Fixes

* resolve React Native modal positioning and flash issues on Android while preserving web functionality ([32df5f8](https://github.com/Jondari/creature-nexus-tcg/commit/32df5f8dcf982f641c58c29d0fd938205261a2a8))

### [0.2.10](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.9...v0.2.10) (2025-08-11)


### Features

* implement cross-platform alert system with unified API ([1d21bb1](https://github.com/Jondari/creature-nexus-tcg/commit/1d21bb17aa8bad31034c7d4f398ce30c101badff))

### [0.2.9](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.8...v0.2.9) (2025-08-10)


### Features

* add visual count indicators to deck builder collection cards ([a038753](https://github.com/Jondari/creature-nexus-tcg/commit/a0387538a912d43f1d2283075069f3147b035253))
* improve deck builder UI with sidebar and optimized layout ([cd1697c](https://github.com/Jondari/creature-nexus-tcg/commit/cd1697c44b931c7b0d955a4971314267885c8cce))

### [0.2.8](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.7...v0.2.8) (2025-08-09)


### Features

* migrate from expo-av to expo-audio and update Expo packages to compatible versions ([c95d094](https://github.com/Jondari/creature-nexus-tcg/commit/c95d094daa831497322e2a7a2fd849e6a845ce18))


### Bug Fixes

* add cross-platform compatibility for Android builds ([493eade](https://github.com/Jondari/creature-nexus-tcg/commit/493eadeeda535ad52e3d21fbe772d9219f294343))
* add Metro config to resolve Firebase Auth component registration on Android ([6eb0f25](https://github.com/Jondari/creature-nexus-tcg/commit/6eb0f25e63191754da14441bc13b3afc04dd9568))

### [0.2.7](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.6...v0.2.7) (2025-08-08)


### Features

* add energy-based attack highlighting with first-turn restrictions and responsive design ([32f8ea7](https://github.com/Jondari/creature-nexus-tcg/commit/32f8ea746eef0be263e132c18e202f2e89ef4d60))
* add profile option to toggle battle log display with default disabled state ([e83dc70](https://github.com/Jondari/creature-nexus-tcg/commit/e83dc7088331486958b175f49016d37b13087dc4))
* add reusable sidebar component with gesture support for battle log display ([1c09174](https://github.com/Jondari/creature-nexus-tcg/commit/1c0917405d17a0c4f92c1ea0549b996f49eaf5b9))
* make battle log start collapsed by default to reduce UI clutter ([61a1f14](https://github.com/Jondari/creature-nexus-tcg/commit/61a1f1487d4a7d49ea9c8eca07faaf14cc5fd295))


### Bug Fixes

* implement hybrid highlighting system to resolve card selection border alignment issues ([c04caec](https://github.com/Jondari/creature-nexus-tcg/commit/c04caec0f2efe413f9515675f21658e21b87710a))

### [0.2.6](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.5...v0.2.6) (2025-08-06)


### Features

* add UI validation to prevent invalid actions and replace native alerts with custom modal ([f9bd5cb](https://github.com/Jondari/creature-nexus-tcg/commit/f9bd5cb1feda6d7c17e8af55b3cbd026ff79caad))


### Bug Fixes

* implement comprehensive human-like AI battle system with visual feedback and damage animations ([593c5c4](https://github.com/Jondari/creature-nexus-tcg/commit/593c5c4c2fc46eb67a88e6246cc063a147aad8ed))
* improve card's highlighting ([f68bb4c](https://github.com/Jondari/creature-nexus-tcg/commit/f68bb4cd777ce7cc51f2df6ecf31cd69c89e1db3))
* resolve mythic card damage calculation and add red HP indicator for damaged cards ([9adffb5](https://github.com/Jondari/creature-nexus-tcg/commit/9adffb525f1142ab5f7211682161372d06b53b78))

### [0.2.5](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.3...v0.2.5) (2025-08-02)


### Features

* update card design and add monster illustrations ([3d380f2](https://github.com/Jondari/creature-nexus-tcg/commit/3d380f23873ab82fc1703ee27131d9d87c526ade))


### Bug Fixes

* move Bolt badge to assets folder for proper build inclusion ([402db58](https://github.com/Jondari/creature-nexus-tcg/commit/402db58912ca6043107ff88fcc22003b354c6702))

### [0.2.4](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.3...v0.2.4) (2025-06-30)


### Bug Fixes

* move Bolt badge to assets folder for proper build inclusion ([6d15cf9](https://github.com/Jondari/creature-nexus-tcg/commit/6d15cf9990a05694f03052d4839e491bea60186c))

### [0.2.3](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.2...v0.2.3) (2025-06-30)


### Features

* add Bolt hackathon badge to home and auth pages ([f5534d4](https://github.com/Jondari/creature-nexus-tcg/commit/f5534d44ff83612e2a87de8d187d03d9c9165609))

### [0.2.2](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.1...v0.2.2) (2025-06-30)


### Bug Fixes

* disable Google auth buttons temporarily ([89a14af](https://github.com/Jondari/creature-nexus-tcg/commit/89a14af8638adc2009b730af20fb4ec389332036))
* restore proper TouchableOpacity pattern and add close button for mobile ([91217eb](https://github.com/Jondari/creature-nexus-tcg/commit/91217eb254c6f88d013084ca6502f9bac458c30f))

### [0.2.1](https://github.com/Jondari/creature-nexus-tcg/compare/v0.2.0...v0.2.1) (2025-06-28)


### Features

* add card size preferences and fix profile links ([1adf61f](https://github.com/Jondari/creature-nexus-tcg/commit/1adf61fd10ff29d39a5efb56703d6fb7523d703a))


### Bug Fixes

* resolve mobile web click-away issue in pack opening modal ([dfd53de](https://github.com/Jondari/creature-nexus-tcg/commit/dfd53de0dcdc813739671f45af11daffaba71966))

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
