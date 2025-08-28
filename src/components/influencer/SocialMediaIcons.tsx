'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import { getBrandLogo, getBrandColor } from '../icons/BrandLogos'

export interface SocialContact {
  type: string
  value: string
}

interface SocialMediaIconsProps {
  contacts: SocialContact[]
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

const SocialMediaIcons = ({ 
  contacts = [], 
  size = 'md', 
  showLabels = false,
  className = '' 
}: SocialMediaIconsProps) => {
  if (!contacts || contacts.length === 0) {
    return null
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-7 h-7'
    }
  }

  const getIconSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3'
      case 'lg':
        return 'w-5 h-5'
      default:
        return 'w-4 h-4'
    }
  }

  const getPlatformIcon = (contact: SocialContact) => {
    const sizeClasses = getSizeClasses()
    const iconSizeClasses = getIconSizeClasses()
    const platform = contact.type.toLowerCase()
    
    // Get the brand logo and color
    const logo = getBrandLogo(platform, iconSizeClasses)
    const colorClass = getBrandColor(platform)
    
    return (
      <div className={`${sizeClasses} ${colorClass} hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors`}>
        {logo}
      </div>
    )
  }

  const formatPlatformName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'instagram':
        return 'Instagram'
      case 'youtube':
        return 'YouTube'
      case 'tiktok':
        return 'TikTok'
      case 'linktree':
        return 'Linktree'
      case 'twitter':
        return 'Twitter'
      case 'x':
        return 'X'
      case 'facebook':
        return 'Facebook'
      case 'website':
      case 'link':
      case 'url':
        return 'Website'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {contacts.map((contact, index) => {
        const icon = getPlatformIcon(contact)
        const platformName = formatPlatformName(contact.type)
        
        return (
          <div key={index} className="flex items-center gap-1">
            <a
              href={contact.value}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative transition-transform hover:scale-105"
              title={`${platformName}: ${contact.value}`}
            >
              {icon}
              {/* Hover tooltip for better UX */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Open {platformName}
              </div>
            </a>
            {showLabels && (
              <span className="text-sm text-gray-600 font-medium">
                {platformName}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SocialMediaIcons
