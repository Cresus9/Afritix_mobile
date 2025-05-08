const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    events: require.resolve('events/'),
  };

  // Ensure proper MIME types
  config.module.rules.push({
    test: /\.js$/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
}; 