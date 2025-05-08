import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill';

// Polyfill global scope
if (typeof global !== 'undefined') {
  Object.assign(global, {
    ReadableStream,
    WritableStream,
    TransformStream,
  });
}

export {
  ReadableStream,
  WritableStream,
  TransformStream,
}; 