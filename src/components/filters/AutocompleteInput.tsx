'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'

interface AutocompleteOption {
  value: string
  label: string
}

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  apiEndpoint: string
  label?: string
  className?: string
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = "Type to search...",
  apiEndpoint,
  label,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setOptions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${apiEndpoint}?query=${encodeURIComponent(searchTerm)}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          
          // Handle different response formats
          let suggestions: AutocompleteOption[] = []
          
          if (data.tags) {
            // Hashtags endpoint
            suggestions = data.tags.map((tag: any) => ({
              value: tag.tag || tag.name || tag,
              label: tag.tag || tag.name || tag
            }))
          } else if (data.topics) {
            // Topics endpoint
            suggestions = data.topics.map((topic: any) => ({
              value: topic.topic || topic.name || topic,
              label: topic.topic || topic.name || topic
            }))
          } else if (data.locations) {
            // Locations endpoint
            suggestions = data.locations.map((loc: any) => ({
              value: loc.name || loc.location || loc,
              label: loc.name || loc.location || loc
            }))
          } else if (data.interests) {
            // Interests endpoint
            suggestions = data.interests.map((interest: any) => ({
              value: interest.interest || interest.name || interest,
              label: interest.interest || interest.name || interest
            }))
          } else if (data.languages) {
            // Languages endpoint
            suggestions = data.languages.map((lang: any) => ({
              value: lang.language || lang.name || lang,
              label: lang.language || lang.name || lang
            }))
          } else if (data.partnerships) {
            // Partnerships endpoint
            suggestions = data.partnerships.map((partnership: any) => ({
              value: partnership.brand || partnership.name || partnership,
              label: partnership.brand || partnership.name || partnership
            }))
          }
          
          setOptions(suggestions)
          setIsOpen(suggestions.length > 0)
        }
      } catch (error) {
        console.error('Autocomplete fetch error:', error)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, apiEndpoint])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
  }

  const handleOptionSelect = (option: AutocompleteOption) => {
    setSearchTerm(option.value)
    onChange(option.value)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    if (options.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="w-full text-left p-3 hover:bg-gray-50 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutocompleteInput