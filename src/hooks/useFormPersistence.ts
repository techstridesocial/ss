import { useEffect, useRef } from 'react'
import { OnboardingData } from './useOnboardingForm'

const STORAGE_KEY = 'brand_onboarding_form_data'

export function useFormPersistence(
  formData: OnboardingData,
  setFormData: (data: OnboardingData) => void,
  isCompleted: boolean
) {
  const isInitialized = useRef(false)

  // Load persisted data on mount
  useEffect(() => {
    if (isInitialized.current) return
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only restore if not completed
        if (!isCompleted) {
          setFormData(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load persisted form data:', error)
    }
    
    isInitialized.current = true
  }, [setFormData, isCompleted])

  // Save form data on change
  useEffect(() => {
    if (!isInitialized.current || isCompleted) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.error('Failed to persist form data:', error)
    }
  }, [formData, isCompleted])

  // Clear persisted data on completion
  useEffect(() => {
    if (isCompleted) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Failed to clear persisted form data:', error)
      }
    }
  }, [isCompleted])

  const clearPersistence = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear persisted form data:', error)
    }
  }

  return { clearPersistence }
}
