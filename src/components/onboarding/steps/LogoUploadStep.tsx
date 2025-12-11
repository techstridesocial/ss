import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { isValidImageFile, isValidFileSize } from '../../../lib/utils/validation'
import { MAX_LOGO_FILE_SIZE_MB } from '../../../constants/onboarding'

interface LogoUploadStepProps {
  value: string
  onChange: (value: string) => void
  onError: (error: string) => void
}

export function LogoUploadStep({ value, onChange, onError }: LogoUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!isValidImageFile(file)) {
      onError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size
    if (!isValidFileSize(file, MAX_LOGO_FILE_SIZE_MB)) {
      onError(`File size must be less than ${MAX_LOGO_FILE_SIZE_MB}MB`)
      return
    }

    onError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onChange(result.imageUrl)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to upload logo'
        onError(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading logo'
      onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center bg-white/5">
        <Upload className={`w-12 h-12 text-blue-300 mx-auto mb-4 ${isUploading ? 'animate-pulse' : ''}`} />
        <p className="text-white mb-4">
          {isUploading ? 'Uploading...' : 'Drop your logo here or click to browse'}
        </p>
        <p className="text-blue-200 text-sm">Optional - Upload your brand logo</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="logo-upload"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label
          htmlFor="logo-upload"
          className={`inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl 
            text-white cursor-pointer transition-all duration-200 mt-4 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </label>
      </div>
      {value && (
        <div className="text-center">
          <img
            src={value}
            alt="Logo preview"
            className="max-w-32 max-h-32 mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </motion.div>
  )
}
