const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add .cjs to source extensions to handle Firebase's CommonJS modules
defaultConfig.resolver.sourceExts.push('cjs');

// Disable package.json exports field handling to avoid conflicts with Firebase SDK in Expo SDK 53
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;