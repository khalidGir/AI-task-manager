// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder to the jsdom environment
// These are needed by some React dependencies
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.TextEncoder = require('util').TextEncoder;
  // @ts-ignore
  window.TextDecoder = require('util').TextDecoder;
} else {
  // @ts-ignore
  global.TextEncoder = require('util').TextEncoder;
  // @ts-ignore
  global.TextDecoder = require('util').TextDecoder;
}