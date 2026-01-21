'use client'

import { ReactNode } from 'react'
import { 
  Search, 
  Inbox, 
  AlertCircle, 
  FolderOpen, 
  FileText,
  Users,
  Calendar,
  DollarSign,
  Video,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'search' | 'error'
  className?: string
}

const defaultIcons = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
}

const contextualIcons = {
  shortlists: FolderOpen,
  campaigns: Calendar,
  invoices: DollarSign,
  quotations: FileText,
  influencers: Users,
  content: Video,
  images: ImageIcon,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className
}: EmptyStateProps) {
  const IconComponent = icon 
    ? null 
    : (defaultIcons[variant] || defaultIcons.default)
  
  // Try to infer icon from title/description
  const inferredIcon = !icon && !IconComponent ? (
    Object.entries(contextualIcons).find(([key]) => 
      title.toLowerCase().includes(key) || description.toLowerCase().includes(key)
    )?.[1]
  ) : null

  const FinalIcon = icon 
    ? null 
    : (inferredIcon || IconComponent || defaultIcons.default)

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      <div className="mb-4">
        {icon ? (
          <div className="text-gray-400">
            {icon}
          </div>
        ) : FinalIcon ? (
          <FinalIcon 
            size={48} 
            className="text-gray-400 mx-auto" 
          />
        ) : null}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
      
      {variant === 'search' && (
        <p className="text-sm text-gray-400 mt-4">
          Try adjusting your search or filters
        </p>
      )}
    </div>
  )
}
