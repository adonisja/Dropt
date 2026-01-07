const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 1. Add 'wasm' to the list of asset extensions
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
