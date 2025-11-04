// Setup global Web APIs for Node.js before Next.js loads
// Must set TextEncoder/TextDecoder BEFORE importing undici
import { TextEncoder, TextDecoder } from 'util'

// Set TextEncoder/TextDecoder FIRST before undici loads
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as any
  globalThis.TextDecoder = TextDecoder as any
  global.TextEncoder = TextEncoder as any
  global.TextDecoder = TextDecoder as any
}

// Now import undici (which requires TextEncoder)
import { Request, Response, Headers, fetch } from 'undici'

// Polyfill Web APIs for Node.js test environment
// Must be set before any Next.js imports
globalThis.Request = Request as any
globalThis.Response = Response as any
globalThis.Headers = Headers as any
globalThis.fetch = fetch as any

// Also set on global for compatibility
global.Request = Request as any
global.Response = Response as any
global.Headers = Headers as any
global.fetch = fetch as any

