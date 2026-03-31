// Single source of truth for avatar frame IDs.
// Consumed by utils/avatarFrameUtils.ts (app) and scripts/redeem-code.js (admin).
const AVAILABLE_FRAMES = [
  { id: 'backer', name: 'Backer' },
  { id: 'beta_tester', name: 'Beta Tester' },
  { id: 'beta_tester_golden', name: 'Golden Beta Tester' },
  { id: 'fire', name: 'Fire' },
  { id: 'water', name: 'Water' },
  { id: 'earth', name: 'Earth' },
  { id: 'ice', name: 'Ice' },
  { id: 'vortex', name: 'Vortex' },
];

module.exports = { AVAILABLE_FRAMES };
