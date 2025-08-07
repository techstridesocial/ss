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
    <div className="flex items-center justify-between py-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="flex items-center space-x-3">
        {trend !== undefined && getTrendIndicator(trend, label)}
        {quality && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getQualityColor(quality)}`}>
            {getQualityText(quality)}
          </span>
        )}
        <div className="text-right">
          <div className="font-semibold text-gray-900">{value}</div>
          {secondaryValue && (
            <div className="text-xs text-gray-500">{secondaryValue}</div>
          )}
        </div>
      </div>
    </div>
  )
}