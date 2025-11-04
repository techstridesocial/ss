'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Loader2, X } from 'lucide-react'

interface AutocompleteOption {
  value: string
  label: string
}

interface MultiAutocompleteInputProps {
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  apiEndpoint: string
  label?: string
  className?: string
  additionalParams?: Record<string, string>
  maxSelections?: number
}

const MultiAutocompleteInput: React.FC<MultiAutocompleteInputProps> = ({
  selectedValues,
  onChange,
  placeholder = "Type to search...",
  apiEndpoint,
  label,
  className = "",
  additionalParams = {},
  maxSelections = 10
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get selected option details for display
  const [selectedOptions, setSelectedOptions] = useState<AutocompleteOption[]>([])

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setOptions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        // Build query parameters including additional params (like platform)
        const params = new URLSearchParams({
          query: searchTerm,
          limit: '20', // Get more options for autocomplete
          ...additionalParams
        })
        const response = await fetch(`${apiEndpoint}?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Handle different response formats
          let suggestions: AutocompleteOption[] = []
          
          if (data.locations && Array.isArray(data.locations)) {
            // Modash locations format
            suggestions = data.locations.map((location: any) => ({
              value: location.id.toString(),
              label: location.title || location.name
            }))
          } else if (data.results && Array.isArray(data.results)) {
            // Generic results format
            suggestions = data.results.map((item: any) => ({
              value: item.id?.toString() || item.value,
              label: item.title || item.name || item.label
            }))
          } else if (Array.isArray(data)) {
            // Direct array format
            suggestions = data.map((item: any) => ({
              value: item.id?.toString() || item.value,
              label: item.title || item.name || item.label
            }))
          }

          // Filter out already selected options
          const filteredSuggestions = suggestions.filter(
            suggestion => !selectedValues.includes(suggestion.value)
          )

          setOptions(filteredSuggestions)
          setIsOpen(filteredSuggestions.length > 0)
        }
      } catch (error) {
        console.error('Multi-autocomplete fetch error:', error)
        setOptions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, apiEndpoint, additionalParams, selectedValues])

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

  // Update selected options details when selectedValues change
  useEffect(() => {
    // This would ideally fetch the details of selected items, but for now we'll use cached data
    // In a real implementation, you might want to store selected option details separately
    setSelectedOptions(
      selectedValues.map(value => ({
        value,
        label: selectedOptions.find(opt => opt.value === value)?.label || `Location ${value}`
      }))
    )
  }, [selectedValues])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
  }

  const handleOptionSelect = (option: AutocompleteOption) => {
    if (selectedValues.length >= maxSelections) {
      return // Don't allow more than max selections
    }

    const newSelectedValues = [...selectedValues, option.value]
    const newSelectedOptions = [...selectedOptions, option]
    
    onChange(newSelectedValues)
    setSelectedOptions(newSelectedOptions)
    setSearchTerm('') // Clear search after selection
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveSelection = (valueToRemove: string) => {
    const newSelectedValues = selectedValues.filter(value => value !== valueToRemove)
    const newSelectedOptions = selectedOptions.filter(option => option.value !== valueToRemove)
    
    onChange(newSelectedValues)
    setSelectedOptions(newSelectedOptions)
  }

  const handleInputFocus = () => {
    if (options.length > 0 && searchTerm.length >= 2) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !searchTerm && selectedValues.length > 0) {
      // Remove last selected item when backspace is pressed on empty input
      const lastValue = selectedValues[selectedValues.length - 1]
      if (lastValue) {
        handleRemoveSelection(lastValue)
      }
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      
      {/* Selected Items Display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              📍 {option.label}
              <button
                onClick={() => handleRemoveSelection(option.value)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                type="button"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length >= maxSelections 
            ? `Maximum ${maxSelections} locations selected` 
            : placeholder
          }
          disabled={selectedValues.length >= maxSelections}
          className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Search Instructions */}
      {selectedValues.length === 0 && !searchTerm && (
        <div className="text-xs text-gray-500 mt-1">
          💡 Type to search locations (e.g., "London", "New York", "Tokyo")
        </div>
      )}

      {/* Selected Count */}
      {selectedValues.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {selectedValues.length}/{maxSelections} locations selected
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              className="w-full text-left p-3 hover:bg-gray-50 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0 flex items-center"
            >
              <span className="mr-2">📍</span>
              <span className="flex-1">{option.label}</span>
              <span className="text-xs text-gray-400">ID: {option.value}</span>
            </button>
          ))}
          
          {/* Show loading state in dropdown */}
          {isLoading && (
            <div className="p-3 text-center text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin inline mr-2" />
              Searching Modash locations...
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {searchTerm.length >= 2 && !isLoading && options.length === 0 && isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-500 text-center">
            No locations found for "{searchTerm}"
            <br />
            <span className="text-xs">Try searching for a city or country name</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiAutocompleteInput
