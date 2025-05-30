'use client'

import React from 'react'

interface TextInputFilterProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'text' | 'search'
}

const TextInputFilter: React.FC<TextInputFilterProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text'
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default TextInputFilter 