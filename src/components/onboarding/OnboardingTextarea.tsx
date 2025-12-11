import React from 'react'

interface OnboardingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  showCharCount?: boolean
  maxLength?: number
}

export function OnboardingTextarea({ 
  error, 
  label,
  showCharCount = false,
  maxLength,
  value,
  className = '',
  ...props 
}: OnboardingTextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-white text-sm font-medium">{label}</label>
      )}
      <div className="relative">
        <textarea
          className={`w-full p-4 bg-white/10 border-2 ${
            error ? 'border-red-500/50' : 'border-white/20'
          } rounded-2xl text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white/50 
          focus:bg-white/20 transition-all duration-300 backdrop-blur-sm resize-none ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="absolute bottom-4 right-4 text-blue-200 text-sm">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p id={props.id ? `${props.id}-error` : undefined} className="text-red-300 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
