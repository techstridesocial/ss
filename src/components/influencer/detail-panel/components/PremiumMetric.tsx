'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface PremiumMetricProps {
  label: string
  value: string | number
  secondaryValue?: string
  trend?: number
  quality?: 'high' | 'medium' | 'low'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const PremiumMetric = ({ 
  label, 
  value, 
  secondaryValue, 
  trend, 
  quality,
  className = "",
  size = 'md'
}: PremiumMetricProps) => {
  
  const getTrendIndicator = (trendValue: number) => {
    const isNegative = trendValue < 0
    const Icon = isNegative ? TrendingDown : TrendingUp
    const colorClass = isNegative ? 'text-red-500' : 'text-green-500'
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">
          {Math.abs(trendValue).toFixed(1)}%
        </span>
      </div>
    )
  }

  const getQualityColor = (q: string) => {
    switch (q) {
      case 'high': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const sizeClasses = {
    sm: {
      label: 'text-sm',
      value: 'text-lg font-semibold',
      secondary: 'text-xs'
    },
    md: {
      label: 'text-sm',
      value: 'text-xl font-semibold',
      secondary: 'text-sm'
    },
    lg: {
      label: 'text-base',
      value: 'text-2xl font-bold',
      secondary: 'text-base'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={`py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className={`text-gray-600 font-medium ${classes.label} mb-1`}>
            {label}
          </div>
          <div className={`text-gray-900 ${classes.value} leading-tight`}>
            {value}
          </div>
          {secondaryValue && (
            <div className={`text-gray-500 ${classes.secondary} mt-1`}>
              {secondaryValue}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {trend !== undefined && getTrendIndicator(trend)}
          {quality && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getQualityColor(quality)}`}>
              {quality}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
