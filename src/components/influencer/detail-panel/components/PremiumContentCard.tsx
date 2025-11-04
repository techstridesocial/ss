'use client'

import { ExternalLink } from 'lucide-react'

interface ContentMetric {
  label: string
  value: string | number
  color?: 'default' | 'red' | 'blue' | 'green' | string
}

interface PremiumContentCardProps {
  imageUrl?: string
  title?: string
  description?: string
  url?: string
  metrics?: ContentMetric[]
  date?: string
  isVideo?: boolean
  onClick?: () => void
  className?: string
}

export const PremiumContentCard = ({
  imageUrl,
  title,
  description,
  url,
  metrics = [],
  date,
  isVideo = false,
  onClick,
  className = ""
}: PremiumContentCardProps) => {
  
  const getMetricColor = (color: string = 'default') => {
    switch (color) {
      case 'red': return 'text-red-600'
      case 'blue': return 'text-blue-600'
      case 'green': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div 
      className={`group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Image Section */}
      {imageUrl && (
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img 
            src={imageUrl}
            alt={title || 'Content preview'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Video indicator */}
          {isVideo && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-0 h-0 border-l-[8px] border-l-gray-800 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </div>
            </div>
          )}
          
          {/* External link button */}
          {url && (
            <button
              onClick={handleExternalClick}
              className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        {title && (
          <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2">
            {title}
          </h4>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Date */}
        {date && (
          <div className="text-xs text-gray-500 font-medium">
            {date}
          </div>
        )}
        
        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`text-sm font-semibold ${getMetricColor(metric.color)}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
