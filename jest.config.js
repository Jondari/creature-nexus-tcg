module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'modules/**/*.{ts,tsx}',
    'services/questService.ts',
    'services/questService.local.ts',
    'utils/cardUtils.ts',
    'utils/boosterUtils.ts',
    'utils/rewardAnimUtils.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
};
