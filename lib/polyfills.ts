import { Buffer } from 'buffer';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import EventEmitter from 'eventemitter3';
import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';

// Add web streams to global scope if not already defined
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}

// Add Buffer to global scope
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Add crypto polyfills
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  };
}

// Add EventEmitter polyfill on web
if (Platform.OS === 'web' && typeof global.EventEmitter === 'undefined') {
  global.EventEmitter = EventEmitter as any;
}

export { ReadableStream, WritableStream, TransformStream }; 