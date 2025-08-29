/**
 * Reusable Credit Display Components
 * 
 * Provides consistent credit display across the application
 */

import React from 'react'
import { RefreshCw, TrendingUp, Calendar, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { useCreditDisplay } from '@/hooks/useCredits'
import type { CreditPeriod, CreditAlert, CreditDisplayFormat } from '@/types/credits'

/**
 * Props for credit display components
 */
interface CreditDisplayProps {
  /** Display format options */
  format?: Partial<CreditDisplayFormat>
  /** Custom CSS classes */
  className?: string
  /** Whether to show refresh button */
  showRefresh?: boolean
  /** Custom refresh handler */
  onRefresh?: () => void
}

interface CreditCardProps extends CreditDisplayProps {
  /** Card title */
  title: string
  /** Credit period to display */
  period: 'monthly' | 'yearly'
  /** Icon to display */
  icon?: React.ReactNode
  /** Whether to show trend/remaining info */
  showTrend?: boolean
}

interface CreditAlertProps {
  /** Alerts to display */
  alerts: CreditAlert[]
  /** Custom CSS classes */
  className?: string
  /** Callback when alert is dismissed */
  onDismiss?: (alert: CreditAlert) => void
}

/**
 * Default display format
 */
const DEFAULT_FORMAT: CreditDisplayFormat = {
  useCommas: true,
  abbreviateNumbers: false,
  showPercentage: true,
  showRemaining: true
}

/**
 * Credit usage card component
 */
export function CreditCard({ 
  title, 
  period, 
  icon, 
  showTrend = true, 
  showRefresh = true,
  format = {},
  className = '',
  onRefresh 
}: CreditCardProps) {
  const { usage, isLoading, refresh, formatters } = useCreditDisplay()
  const finalFormat = { ...DEFAULT_FORMAT, ...format }

  if (!usage) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const periodData = usage[period]
  const handleRefresh = onRefresh || refresh

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            {showRefresh && (
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Refresh credits"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
          
          <p className="text-2xl font-semibold text-gray-900">
            {formatters.ratio(
              periodData.used, 
              periodData.limit, 
              finalFormat.useCommas
            )}
          </p>
          
          {showTrend && (
            <div className="flex items-center mt-2">
              <p className="text-xs text-gray-500">
                {finalFormat.showPercentage && 
                  `${formatters.percentage(periodData.used, periodData.limit)} used`
                }
                {finalFormat.showRemaining && finalFormat.showPercentage && ' • '}
                {finalFormat.showRemaining && 
                  formatters.remaining(periodData.remaining, finalFormat.useCommas)
                }
              </p>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact credit display for headers/navbars
 */
export function CreditBadge({ 
  period = 'monthly', 
  format = {},
  className = ''
}: {
  period?: 'monthly' | 'yearly'
  format?: Partial<CreditDisplayFormat>
  className?: string
}) {
  const { usage, isLoading, formatters } = useCreditDisplay()
  const finalFormat = { ...DEFAULT_FORMAT, ...format }

  if (!usage || isLoading) {
    return (
      <div className={`px-3 py-1 bg-gray-100 rounded-full ${className}`}>
        <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const periodData = usage[period]
  const percentage = (periodData.used / periodData.limit) * 100

  // Determine badge color based on usage
  const getBadgeColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-100 text-red-800'
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(percentage)} ${className}`}>
      {finalFormat.useCommas 
        ? formatters.withCommas(periodData.remaining)
        : formatters.abbreviated(periodData.remaining)
      } left
    </div>
  )
}

/**
 * Progress bar for credit usage
 */
export function CreditProgress({ 
  period = 'monthly',
  className = '',
  showLabels = true
}: {
  period?: 'monthly' | 'yearly'
  className?: string
  showLabels?: boolean
}) {
  const { usage, formatters } = useCreditDisplay()

  if (!usage) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse h-3 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  const periodData = usage[period]
  const percentage = (periodData.used / periodData.limit) * 100

  // Determine progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{formatters.withCommas(periodData.used)} used</span>
          <span>{formatters.withCommas(periodData.remaining)} remaining</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="text-center text-xs text-gray-500 mt-1">
          {percentage.toFixed(1)}% of {formatters.withCommas(periodData.limit)}
        </div>
      )}
    </div>
  )
}

/**
 * Credit alerts display
 */
export function CreditAlerts({ alerts, className = '', onDismiss }: CreditAlertProps) {
  if (alerts.length === 0) return null

  const getAlertIcon = (type: CreditAlert['type']) => {
    switch (type) {
      case 'critical': return <AlertCircle size={16} />
      case 'warning': return <AlertTriangle size={16} />
      default: return <Info size={16} />
    }
  }

  const getAlertColor = (type: CreditAlert['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {alerts.map((alert, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border flex items-start space-x-3 ${getAlertColor(alert.type)}`}
        >
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
          {onDismiss && (
            <button 
              onClick={() => onDismiss(alert)}
              className="text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Complete credit dashboard component
 */
export function CreditDashboard({ className = '' }: { className?: string }) {
  const { usage, alerts, clearAlerts } = useCreditDisplay()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alerts */}
      <CreditAlerts alerts={alerts} onDismiss={clearAlerts} />
      
      {/* Credit cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CreditCard
          title="Monthly Credits"
          period="monthly"
          icon={<TrendingUp size={20} />}
        />
        <CreditCard
          title="Yearly Credits"
          period="yearly"
          icon={<Calendar size={20} />}
        />
      </div>
      
      {/* Progress visualization */}
      {usage && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Usage</h4>
              <CreditProgress period="monthly" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Yearly Usage</h4>
              <CreditProgress period="yearly" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
