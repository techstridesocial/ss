import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendUp && <ArrowUpRight size={14} className="text-green-600 mr-1" />}
              <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>{trend}</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  )
}

