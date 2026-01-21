/**
 * Error message utilities for consistent error handling across the application
 */

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  
  // Resource errors
  NOT_FOUND: 'The requested resource could not be found.',
  CONFLICT: 'This action conflicts with existing data.',
  
  // Validation errors
  VALIDATION: 'Please check your input and try again.',
  INVALID_INPUT: 'Invalid input provided. Please review and try again.',
  
  // Server errors
  SERVER: 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again in a moment.',
  
  // Generic
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES

/**
 * Extracts a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT
    }
    
    // Auth errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return ERROR_MESSAGES.UNAUTHORIZED
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return ERROR_MESSAGES.FORBIDDEN
    }
    
    // Resource errors
    if (message.includes('not found') || message.includes('404')) {
      return ERROR_MESSAGES.NOT_FOUND
    }
    if (message.includes('conflict') || message.includes('409')) {
      return ERROR_MESSAGES.CONFLICT
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_MESSAGES.VALIDATION
    }
    
    // Server errors
    if (message.includes('server') || message.includes('500')) {
      return ERROR_MESSAGES.SERVER
    }
    if (message.includes('service unavailable') || message.includes('503')) {
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE
    }
    
    // Return the error message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message
    }
  }

  // Handle API error responses
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    
    if (typeof err.message === 'string') {
      return err.message
    }
    
    if (typeof err.error === 'string') {
      return err.error
    }
    
    if (typeof err.details === 'string') {
      return err.details
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  return ERROR_MESSAGES.UNKNOWN
}

/**
 * Gets a field-specific error message
 */
export function getFieldError(field: string, error: string | unknown): string {
  const errorMessage = typeof error === 'string' ? error : getErrorMessage(error)
  
  // If the error already mentions the field, return as-is
  if (errorMessage.toLowerCase().includes(field.toLowerCase())) {
    return errorMessage
  }
  
  // Otherwise, prepend the field name
  const fieldLabel = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
  
  return `${fieldLabel}: ${errorMessage}`
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('failed to fetch')
  }
  return false
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('unauthorized') || 
           message.includes('forbidden') ||
           message.includes('401') ||
           message.includes('403')
  }
  return false
}

/**
 * Formats an API error response into a user-friendly message
 */
export function formatApiError(response: Response, data?: unknown): string {
  const status = response.status
  
  switch (status) {
    case 400:
      if (data && typeof data === 'object' && 'message' in data) {
        return String(data.message)
      }
      return ERROR_MESSAGES.VALIDATION
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return ERROR_MESSAGES.NOT_FOUND
    case 409:
      return ERROR_MESSAGES.CONFLICT
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER
    default:
      return ERROR_MESSAGES.UNKNOWN
  }
}
