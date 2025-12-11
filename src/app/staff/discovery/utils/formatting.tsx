import React from 'react'
import { formatters } from '@/lib/utils/formatters'

export const formatNumber = formatters.display
export const formatNumberWithCommas = formatters.precise

/**
 * Converts a number to percentage string
 */
export const toPct = (n: any): string => {
  const num = Number(n)
  if (!num) return '0.00%'
  return num > 1 ? `${num.toFixed(2)}%` : `${(num * 100).toFixed(2)}%`
}

/**
 * Gets a score badge component based on score value
 */
export const getScoreBadge = (score: number) => {
  if (score >= 90) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Excellent</span>
  } else if (score >= 75) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Good</span>
  } else if (score >= 60) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Fair</span>
  } else {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Poor</span>
  }
}

/**
 * Gets metric value with fallback logic
 */
export const getMetricValue = (primaryValue: any, fallbackValue?: any): any => {
  return primaryValue !== undefined && primaryValue !== null ? primaryValue : fallbackValue
}
