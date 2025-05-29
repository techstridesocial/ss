import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Archive, 
  Edit, 
  Download,
  X,
  ChevronDown
} from 'lucide-react'

interface BulkActionsToolbarProps {
  selectedItems: string[]
  totalItems: number
  onClearSelection: () => void
  onBulkPause: (ids: string[]) => Promise<void>
  onBulkResume: (ids: string[]) => Promise<void>
  onBulkDelete: (ids: string[]) => Promise<void>
  onBulkDuplicate: (ids: string[]) => Promise<void>
  onBulkArchive: (ids: string[]) => Promise<void>
  onBulkEdit: (ids: string[]) => void
  onBulkExport: (ids: string[]) => Promise<void>
}

export default function BulkActionsToolbar({
  selectedItems,
  totalItems,
  onClearSelection,
  onBulkPause,
  onBulkResume,
  onBulkDelete,
  onBulkDuplicate,
  onBulkArchive,
  onBulkEdit,
  onBulkExport
}: BulkActionsToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string, handler: (ids: string[]) => Promise<void>) => {
    setLoading(action)
    try {
      await handler(selectedItems)
    } finally {
      setLoading(null)
    }
  }

  if (selectedItems.length === 0) {
    return null
  }

  const bulkActions = [
    {
      id: 'resume',
      label: 'Resume',
      icon: <Play className="w-4 h-4" />,
      handler: () => handleAction('resume', onBulkResume),
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: <Pause className="w-4 h-4" />,
      handler: () => handleAction('pause', onBulkPause),
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      handler: () => handleAction('duplicate', onBulkDuplicate),
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'edit',
      label: 'Bulk Edit',
      icon: <Edit className="w-4 h-4" />,
      handler: () => onBulkEdit(selectedItems),
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      handler: () => handleAction('export', onBulkExport),
      color: 'text-indigo-600 hover:bg-indigo-50'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      handler: () => handleAction('archive', onBulkArchive),
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      handler: () => handleAction('delete', onBulkDelete),
      color: 'text-red-600 hover:bg-red-50'
    }
  ]

  const primaryActions = bulkActions.slice(0, 3)
  const secondaryActions = bulkActions.slice(3)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-96">
          {/* Selection info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {selectedItems.length}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {selectedItems.length} of {totalItems} selected
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Primary actions */}
          <div className="flex items-center gap-1">
            {primaryActions.map((action) => (
              <button
                key={action.id}
                onClick={action.handler}
                disabled={loading !== null}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${action.color}
                  ${loading === action.id ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {loading === action.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            ))}

            {/* More actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-150"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32 z-50"
                  >
                    {secondaryActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.handler()
                          setIsExpanded(false)
                        }}
                        disabled={loading !== null}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-left
                          transition-colors duration-150
                          ${action.color}
                          ${loading === action.id ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {loading === action.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          action.icon
                        )}
                        {action.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 