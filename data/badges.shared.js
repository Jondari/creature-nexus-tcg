// Single source of truth for badge IDs.
// Consumed by utils/badgeUtils.ts (app) and scripts/redeem-code.js (admin).
const AVAILABLE_BADGES = [
  { id: 'backer', name: 'backer' },
  { id: 'beta_tester', name: 'beta_tester' },
];

module.exports = { AVAILABLE_BADGES };
