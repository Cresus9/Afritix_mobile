import 'expo/build/Expo.fx';
import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Polyfill EventEmitter for web
if (Platform.OS === 'web') {
  const EventEmitter = require('eventemitter3');
  if (!global.EventEmitter) {
    global.EventEmitter = EventEmitter;
  }
}

// Register the root component
registerRootComponent(() => {
  return <ExpoRoot context={require.context('./app')} />;
}); 