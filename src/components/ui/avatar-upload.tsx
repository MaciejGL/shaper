'use client'

import imageCompression from 'browser-image-compression'
import { Camera, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { IMAGE_CONFIGS, type ImageType } from '@/lib/aws/s3'
import { cn } from '@/lib/utils'

import { Avatar, AvatarImage } from './avatar'
import { Button } from './button'
import { ProgressButton } from './progress-button'

interface AvatarUploadProps {
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: () => void
  className?: string
  disabled?: boolean
  showRemoveButton?: boolean
  fallbackUrl?: string
  alt?: string
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

export function AvatarUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className = '',
  disabled = false,
  showRemoveButton = true,
  fallbackUrl,
  alt = 'Avatar',
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  })

  const imageType: ImageType = 'avatar'
  const config = IMAGE_CONFIGS[imageType]

  // Reset upload state
  const resetUploadState = () => {
    setUploadState({ uploading: false, progress: 0, error: null })
  }

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (disabled) return

      resetUploadState()
      setUploadState((prev) => ({ ...prev, uploading: true }))

      try {
        // Validate file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Only JPEG, PNG, and WebP images are allowed')
        }

        if (file.size > config.maxSize) {
          throw new Error(
            `File size must be less than ${config.maxSize / (1024 * 1024)}MB`,
          )
        }

        // Compress image
        setUploadState((prev) => ({ ...prev, progress: 20 }))
        const compressedFile = await imageCompression(file, {
          maxWidthOrHeight: Math.max(config.maxWidth, config.maxHeight),
          useWebWorker: true,
          fileType: file.type,
          initialQuality: config.quality,
        })

        // Get presigned URL
        setUploadState((prev) => ({ ...prev, progress: 40 }))
        const presignedResponse = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: compressedFile.type,
            imageType,
          }),
        })

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json()
          throw new Error(errorData.error || 'Failed to get upload URL')
        }

        const { presignedUrl, publicUrl } = await presignedResponse.json()

        // Upload to S3
        setUploadState((prev) => ({ ...prev, progress: 70 }))
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: compressedFile,
          headers: {
            'Content-Type': compressedFile.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        setUploadState((prev) => ({ ...prev, progress: 100 }))

        // Call success callback
        onImageUploaded(publicUrl)

        // Reset state after short delay
        setTimeout(resetUploadState, 1000)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadState({
          uploading: false,
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed',
        })
      }
    },
    [config, imageType, onImageUploaded, disabled],
  )

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  // Handle remove image
  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved()
    }
    resetUploadState()
  }

  // Trigger file input
  const triggerFileInput = () => {
    if (!disabled && !uploadState.uploading) {
      document.getElementById('avatar-file-input')?.click()
    }
  }

  const displayImageUrl = currentImageUrl || fallbackUrl

  return (
    <div className={cn('relative group', className)}>
      {/* Avatar */}
      <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-800 shadow-xs bg-zinc-100 dark:bg-zinc-700 shadow-zinc-200 dark:shadow-black">
        <AvatarImage src={displayImageUrl || ''} alt={alt} />
      </Avatar>

      {/* Upload Button */}
      <ProgressButton
        icon={Camera}
        size="sm"
        variant="default"
        progress={uploadState.progress}
        isLoading={uploadState.uploading}
        onClick={triggerFileInput}
        disabled={disabled}
        className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 shadow-lg"
        title="Upload new avatar"
      />

      {/* Remove Button */}
      {showRemoveButton && currentImageUrl && !uploadState.uploading && (
        <Button
          onClick={handleRemoveImage}
          size="icon-sm"
          variant="destructive"
          className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 shadow-lg"
          title="Remove avatar"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs">
          <p className="text-red-700 dark:text-red-400">{uploadState.error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id="avatar-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploadState.uploading}
      />
    </div>
  )
}
