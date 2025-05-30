'use client'

import React from 'react'

interface ToggleFilterProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

const ToggleFilter: React.FC<ToggleFilterProps> = ({
  label,
  checked,
  onChange,
  description
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onChange(!checked)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                checked ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                  checked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              {checked ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ToggleFilter 