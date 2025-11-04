'use client'

interface MetricData {
  label: string
  value: string | number
  secondaryValue?: string
  trend?: number
  quality?: 'high' | 'medium' | 'low' | 'below_average' | 'average' | 'above_average' | string
}

interface PremiumMetricsGridProps {
  metrics: MetricData[]
  columns?: 2 | 3 | 4
  className?: string
}

export const PremiumMetricsGrid = ({ 
  metrics, 
  columns = 2, 
  className = "" 
}: PremiumMetricsGridProps) => {
  
  const getTrendIndicator = (trend: number) => {
    const isPositive = trend > 0
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    const symbol = isPositive ? '+' : ''
    
    return (
      <span className={`text-xs font-medium ${colorClass}`}>
        {symbol}{trend.toFixed(1)}%
      </span>
    )
  }

  const getQualityDot = (quality: string) => {
    const colorClass = quality === 'high' ? 'bg-green-500' : 
                      quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
    return <div className={`w-2 h-2 rounded-full ${colorClass}`} />
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-4'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              {metric.label}
            </span>
            {metric.quality && getQualityDot(metric.quality)}
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-gray-900 leading-none">
              {metric.value}
            </div>
            
            <div className="flex items-center space-x-2">
              {metric.secondaryValue && (
                <span className="text-sm text-gray-500">
                  {metric.secondaryValue}
                </span>
              )}
              {metric.trend !== undefined && getTrendIndicator(metric.trend)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
