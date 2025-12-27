// Mock implementation of react-native-worklets for Web platform
// This resolves the "createSerializableObject should never be called in JSWorklets" error

module.exports = {
  // Export a minimal mock that doesn't use worklets functionality
  createWorklet: (fn) => fn,
  runOnWorkletThread: (fn, ...args) => fn(...args),
  WorkletContext: {
    create: () => ({
      run: (fn, ...args) => fn(...args),
      close: () => {},
    }),
  },
  // Add any other exports that might be needed
  __esModule: true,
};