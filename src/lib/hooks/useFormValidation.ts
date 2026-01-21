'use client'

import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  number?: boolean
  min?: number
  max?: number
  custom?: (value: any) => string | null
  message?: string
}

export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule
}

export type ValidationErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  errors: ValidationErrors<T>
  validate: (field: keyof T, value: any) => string | null
  validateAll: (values: Partial<T>) => boolean
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
  hasErrors: boolean
}

/**
 * Hook for form validation with real-time feedback
 */
export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors<T>>({})

  const validate = useCallback(
    (field: keyof T, value: any): string | null => {
      const rule = rules[field]
      if (!rule) return null

      const fieldName = String(field)
      let error: string | null = null

      // Required check
      if (rule.required) {
        if (value === null || value === undefined || value === '') {
          error = rule.message || `${fieldName} is required`
          setErrors(prev => ({ ...prev, [field]: error }))
          return error
        }
      }

      // Skip other validations if value is empty and not required
      if (value === null || value === undefined || value === '') {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
        return null
      }

      const valueStr = String(value)

      // Min length
      if (rule.minLength && valueStr.length < rule.minLength) {
        error = rule.message || `${fieldName} must be at least ${rule.minLength} characters`
      }

      // Max length
      if (!error && rule.maxLength && valueStr.length > rule.maxLength) {
        error = rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`
      }

      // Pattern
      if (!error && rule.pattern && !rule.pattern.test(valueStr)) {
        error = rule.message || `${fieldName} format is invalid`
      }

      // Email
      if (!error && rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(valueStr)) {
          error = rule.message || `${fieldName} must be a valid email address`
        }
      }

      // URL
      if (!error && rule.url) {
        try {
          new URL(valueStr)
        } catch {
          error = rule.message || `${fieldName} must be a valid URL`
        }
      }

      // Number
      if (!error && rule.number) {
        if (isNaN(Number(value))) {
          error = rule.message || `${fieldName} must be a number`
        }
      }

      // Min value
      if (!error && rule.min !== undefined && Number(value) < rule.min) {
        error = rule.message || `${fieldName} must be at least ${rule.min}`
      }

      // Max value
      if (!error && rule.max !== undefined && Number(value) > rule.max) {
        error = rule.message || `${fieldName} must be no more than ${rule.max}`
      }

      // Custom validation
      if (!error && rule.custom) {
        const customError = rule.custom(value)
        if (customError) {
          error = customError
        }
      }

      // Update errors state
      setErrors(prev => {
        if (error) {
          return { ...prev, [field]: error }
        } else {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        }
      })

      return error
    },
    [rules]
  )

  const validateAll = useCallback(
    (values: Partial<T>): boolean => {
      let isValid = true
      const newErrors: ValidationErrors<T> = {}

      for (const field in rules) {
        const value = values[field]
        const error = validate(field, value)
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }

      setErrors(newErrors)
      return isValid
    },
    [rules, validate]
  )

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    validate,
    validateAll,
    clearError,
    clearAllErrors,
    hasErrors,
  }
}
