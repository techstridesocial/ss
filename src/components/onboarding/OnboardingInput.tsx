import React from 'react'
import { LucideIcon } from 'lucide-react'

interface OnboardingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  error?: string
  label?: string
}

export function OnboardingInput({ 
  icon: Icon, 
  error, 
  label,
  className = '',
  ...props 
}: OnboardingInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-white text-sm font-medium">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
        )}
        <input
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white/10 border-2 ${
            error ? 'border-red-500/50' : 'border-white/20'
          } rounded-2xl text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
          focus:bg-white/20 transition-all duration-300 backdrop-blur-sm ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={props.id ? `${props.id}-error` : undefined} className="text-red-300 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

