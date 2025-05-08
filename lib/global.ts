import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';
import CryptoJS from 'crypto-js';

// Initialize global scope with required polyfills
export function initializeGlobalScope() {
  console.log('Starting global scope initialization...');
  
  try {
    // Initialize crypto polyfill if needed
    if (typeof crypto === 'undefined' || !crypto.randomUUID) {
      console.log('Crypto API not found, initializing polyfill');
      // @ts-ignore
      if (!globalThis.crypto) {
        console.log('Creating crypto object on globalThis');
        // @ts-ignore
        globalThis.crypto = {};
      }
      
      // Initialize crypto methods one by one with error checking
      try {
        if (!globalThis.crypto.randomUUID) {
          console.log('Adding randomUUID polyfill');
          // @ts-ignore
          globalThis.crypto.randomUUID = () => {
            try {
              const array = new Uint8Array(16);
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
              }
              array[6] = (array[6] & 0x0f) | 0x40;
              array[8] = (array[8] & 0x3f) | 0x80;
              
              const hex = Array.from(array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
              
              return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
            } catch (e) {
              console.error('Error in randomUUID implementation:', e);
              // Fallback to simpler UUID generation
              return Date.now().toString(36) + Math.random().toString(36).substring(2);
            }
          };
        }
        
        if (!globalThis.crypto.getRandomValues) {
          console.log('Adding getRandomValues polyfill');
          // @ts-ignore
          globalThis.crypto.getRandomValues = (array) => {
            try {
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
              }
              return array;
            } catch (e) {
              console.error('Error in getRandomValues implementation:', e);
              throw e;
            }
          };
        }
      } catch (cryptoError) {
        console.error('Error setting up crypto polyfills:', cryptoError);
        // Continue execution - app might work without crypto
      }
    }

    // Initialize stream polyfills
    console.log('Initializing stream polyfills...');
    if (typeof global !== 'undefined') {
      try {
        Object.assign(global, {
          ReadableStream: ReadableStream || global.ReadableStream,
          WritableStream: WritableStream || global.WritableStream,
          TransformStream: TransformStream || global.TransformStream,
        });
        console.log('Stream polyfills initialized successfully');
      } catch (streamError) {
        console.error('Error initializing stream polyfills:', streamError);
        // Continue execution - app might work without streams
      }
    }

    // Initialize CryptoJS
    console.log('Initializing CryptoJS...');
    if (typeof window !== 'undefined' && !window.CryptoJS) {
      try {
        // @ts-ignore
        window.CryptoJS = CryptoJS;
        console.log('CryptoJS initialized successfully');
      } catch (cryptoJsError) {
        console.error('Error initializing CryptoJS:', cryptoJsError);
        // Continue execution - app might work without CryptoJS
      }
    }

    console.log('Global scope initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Critical error in global scope initialization:', error);
    // Return true anyway to allow app to continue
    return true;
  }
}

export {
  ReadableStream,
  WritableStream,
  TransformStream,
}; 