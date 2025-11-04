/**
 * ⚠️ IMPORTANT: Use direct imports from ./ui, ./hooks, ./utils, ./constants
 * 
 * This barrel export is provided for backward compatibility only.
 * 
 * To avoid circular dependency issues during Next.js bundling, prefer:
 * - import { ... } from './ui' for UI components
 * - import { ... } from './hooks' for hooks
 * - import { ... } from './utils' for utilities
 * - import { ... } from './constants' for constants
 * 
 * This prevents the "Cannot access before initialization" errors that occur
 * when the module graph re-imports itself during initialization.
 */

// Re-export from split files to maintain backward compatibility
export * from './ui'
export * from './hooks'
export * from './utils'
export * from './constants'

