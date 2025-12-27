module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only include react-native-reanimated plugin, remove worklets which might cause conflicts
      'react-native-reanimated/plugin'
    ],
  };
};