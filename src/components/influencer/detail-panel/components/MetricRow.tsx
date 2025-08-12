'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { MetricRowProps } from '../types'
import { getQualityColor, getQualityText } from '../utils'

const getTrendIndicator = (value: number, label: string) => {
  const isNegative = value < 0
  const Icon = isNegative ? TrendingDown : TrendingUp
  const colorClass = isNegative ? 'text-red-500' : 'text-green-500'
  
  return (
    <div className={`flex items-center space-x-1 ${colorClass}`} title={`${label} trend: ${value > 0 ? '+' : ''}${value.toFixed(1)}%`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">
        {Math.abs(value).toFixed(1)}%
      </span>
    </div>
  )
}

export const MetricRow = ({ 
  icon: Icon, 
  label, 
  value, 
  secondaryValue, 
  trend, 
  quality 
}: MetricRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-gray-50/70 rounded-xl transition-all duration-200 group">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-gray-700 font-medium text-sm leading-tight truncate">{label}</span>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        {trend !== undefined && getTrendIndicator(trend, label)}
        {quality && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getQualityColor(quality)}`}>
            {getQualityText(quality)}
          </span>
        )}
        <div className="text-right min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight">{value}</div>
          {secondaryValue && (
            <div className="text-xs text-gray-500 leading-tight mt-0.5">{secondaryValue}</div>
          )}
        </div>
      </div>
    </div>
  )
}