/**
 * StatCard component for displaying statistics
 */

'use client'

import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-100/50',
      iconBg: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    green: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100/50',
      iconBg: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/25'
    },
    purple: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-100/50',
      iconBg: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/25'
    },
    yellow: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-100/50',
      iconBg: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/25'
    }
  }

  const config = colorConfig[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative ${config.bg} backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${config.border} overflow-hidden`}
    >
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 bg-gradient-to-br ${config.iconBg} rounded-xl shadow-lg ${config.shadow}`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
