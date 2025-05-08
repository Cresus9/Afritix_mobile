const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add all possible extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
  'mjs',
  'cjs'
];

// Configure module resolution and polyfills
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'stream': require.resolve('stream-browserify'),
  'crypto': require.resolve('crypto-browserify'),
  'events': require.resolve('events/'),
  'buffer': require.resolve('buffer/'),
  'util': require.resolve('util/'),
  'process': require.resolve('process')
};

// Custom resolver configuration
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle web-streams-polyfill special cases
  if (moduleName.startsWith('web-streams-polyfill')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/web-streams-polyfill/dist/ponyfill.js'),
      type: 'sourceFile',
    };
  }
  // Let Metro handle all other cases
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure proper MIME types for web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      }
      return middleware(req, res, next);
    };
  },
};

config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true
    }
  },
  unstable_transformProfile: 'hermes-stable'
};

// Handle web assets
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx'
];

// Add watchFolders to include node_modules and project root
config.watchFolders = [
  path.resolve(__dirname),
  path.resolve(__dirname, 'node_modules')
];

module.exports = withNativeWind(config, { input: './global.css' }); 