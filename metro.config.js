const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm support as an asset
config.resolver.assetExts.push('wasm');

// Add resolver for react-native-worklets and expo-sqlite to use mock on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'expo-sqlite') {
      return {
        filePath: require.resolve('./expo-sqlite.web.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-worklets') {
      return {
        filePath: require.resolve('./react-native-worklets.web.js'),
        type: 'sourceFile',
      };
    }
  }
  // Let Metro handle all other requests normally
  return context.resolveRequest(context, moduleName, platform);
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;