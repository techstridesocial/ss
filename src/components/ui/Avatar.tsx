'use client'

import Image from 'next/image'
import { useState } from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback = '/default-avatar.svg',
  className = ''
}: AvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback)
  const [hasError, setHasError] = useState(false)
  
  const sizePx = sizeMap[size]
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  return (
    <div 
      className={`relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100 ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {imgSrc && !hasError ? (
        <Image
          src={imgSrc}
          alt={alt}
          width={sizePx}
          height={sizePx}
          className="object-cover"
          loading="lazy"
          onError={handleError}
          unoptimized={imgSrc.startsWith('http') && !imgSrc.includes('localhost')}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center bg-gray-100"
          style={{ width: sizePx, height: sizePx }}
        >
          <User 
            size={sizePx * 0.5} 
            className="text-gray-400" 
          />
        </div>
      )}
    </div>
  )
}
