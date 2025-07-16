'use client'

import imageCompression from 'browser-image-compression'
import { AlertCircle, Camera, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { IMAGE_CONFIGS, type ImageType } from '@/lib/aws/s3'

import { Button } from './button'
import { Progress } from './progress'

interface ImageUploadProps {
  imageType: ImageType
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: () => void
  relatedId?: string // For exercise images
  className?: string
  disabled?: boolean
  showRemoveButton?: boolean
  placeholder?: string
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

export function ImageUpload({
  imageType,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  relatedId,
  className = '',
  disabled = false,
  showRemoveButton = true,
  placeholder,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  })
  const [dragActive, setDragActive] = useState(false)

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
            relatedId,
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
    [config, imageType, relatedId, onImageUploaded, disabled],
  )

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0])
      }
    },
    [handleFileUpload],
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

  return (
    <div className={`relative ${className}`}>
      {/* Current Image Display */}
      {currentImageUrl && !uploadState.uploading && (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt="Uploaded image"
            className={`w-full h-full object-cover rounded-lg ${
              imageType === 'avatar' ? 'aspect-square' : 'aspect-video'
            }`}
          />
          {showRemoveButton && !disabled && (
            <Button
              onClick={handleRemoveImage}
              size="icon-sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {imageType === 'avatar' && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {(!currentImageUrl || imageType !== 'avatar') && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            ${uploadState.uploading ? 'pointer-events-none' : ''}
            ${imageType === 'avatar' ? 'aspect-square' : 'aspect-video'}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !disabled &&
            !uploadState.uploading &&
            document.getElementById(`file-input-${imageType}`)?.click()
          }
        >
          {uploadState.uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div className="w-full max-w-xs">
                <Progress value={uploadState.progress} className="h-2" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploading... {Math.round(uploadState.progress)}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {placeholder || `Upload ${imageType} image`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Max {config.maxSize / (1024 * 1024)}MB • JPEG, PNG, WebP
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {uploadState.error}
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id={`file-input-${imageType}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploadState.uploading}
      />
    </div>
  )
}
