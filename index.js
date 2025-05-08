// Import polyfills if needed
import { ReadableStream } from 'web-streams-polyfill';
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}

// Polyfill EventEmitter if needed
if (typeof global.EventEmitter === 'undefined') {
  const EventEmitter = require('eventemitter3');
  global.EventEmitter = EventEmitter;
}

// Import and start the app using Expo Router
import 'expo-router/entry'; 