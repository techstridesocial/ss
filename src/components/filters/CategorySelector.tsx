'use client'

import React, { useState, useRef, useEffect } from 'react'

interface CategorySelectorProps {
  selectedCategories: string[]
  target: 'creator' | 'audience'
  onCategoriesChange: (categories: string[]) => void
  onTargetChange: (target: 'creator' | 'audience') => void
}

const CATEGORIES = [
  'Television & film',
  'Music',
  'Shopping & retail',
  'Coffee, tea & beverages',
  'Camera & photography',
  'Clothes, shoes, handbags & accessories',
  'Beer, wine & spirits',
  'Sports',
  'Electronics & computers',
  'Gaming',
  'Activewear',
  'Art & design',
  'Travel, tourism & aviation',
  'Business & careers',
  'Beauty & cosmetics',
  'Healthcare & medicine',
  'Jewellery & watches',
  'Restaurants, food & grocery',
  'Toys, children & baby',
  'Fitness & yoga',
  'Wedding',
  'Tobacco & smoking',
  'Pets',
  'Healthy lifestyle',
  'Luxury goods',
  'Home decor, furniture & garden',
  'Friends, family & relationships',
  'Cars & motorcycles'
]

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  target,
  onCategoriesChange,
  onTargetChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
      <div className="space-y-3">
        {/* Creator/Audience Toggle */}
        <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
          <button 
            onClick={() => onTargetChange('creator')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              target === 'creator' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Creator
          </button>
          <button 
            onClick={() => onTargetChange('audience')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              target === 'audience' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audience
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-left bg-white"
          >
            {selectedCategories.length === 0 
              ? 'Select categories...' 
              : `${selectedCategories.length} selected`}
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {category}
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategorySelector 