'use client'

import imageCompression from 'browser-image-compression'
import { Plus, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { IMAGE_CONFIGS, type ImageType } from '@/lib/aws/s3'
import { cn } from '@/lib/utils'

import { Button } from './button'

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

interface MultiImageUploadProps {
  imageType: ImageType
  currentImageUrls?: string[]
  onImagesChange: (imageUrls: string[]) => void
  maxImages?: number
  className?: string
  disabled?: boolean
}

export function MultiImageUpload({
  imageType,
  currentImageUrls = [],
  onImagesChange,
  maxImages = 4,
  className = '',
  disabled = false,
}: MultiImageUploadProps) {
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>(
    {},
  )
  const [dragActive, setDragActive] = useState(false)

  // Use ref to track latest image URLs for concurrent uploads
  const latestImageUrls = useRef(currentImageUrls)
  latestImageUrls.current = currentImageUrls

  const config = IMAGE_CONFIGS[imageType]

  // Reset upload state for specific slot
  const resetUploadState = (slotIndex: number) => {
    setUploadStates((prev) => {
      const newStates = { ...prev }
      delete newStates[slotIndex]
      return newStates
    })
  }

  // Handle file upload for specific slot
  const handleFileUpload = useCallback(
    async (file: File, slotIndex: number) => {
      if (disabled) return

      setUploadStates((prev) => ({
        ...prev,
        [slotIndex]: { uploading: true, progress: 0, error: null },
      }))

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
        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: { uploading: true, progress: 20, error: null },
        }))

        const compressedFile = await imageCompression(file, {
          maxWidthOrHeight: Math.max(config.maxWidth, config.maxHeight),
          useWebWorker: true,
          fileType: file.type,
          initialQuality: config.quality,
        })

        // Get presigned URL
        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: { uploading: true, progress: 40, error: null },
        }))

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
        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: { uploading: true, progress: 70, error: null },
        }))

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

        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: { uploading: true, progress: 100, error: null },
        }))

        // Update the images array using ref to get latest state for concurrent uploads
        const newImageUrls = [...latestImageUrls.current]
        newImageUrls[slotIndex] = publicUrl
        onImagesChange(newImageUrls.filter(Boolean))

        // Reset state after short delay
        setTimeout(() => resetUploadState(slotIndex), 1000)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: {
            uploading: false,
            progress: 0,
            error: error instanceof Error ? error.message : 'Upload failed',
          },
        }))
      }
    },
    [config, imageType, onImagesChange, disabled],
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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        const availableSlots = maxImages - latestImageUrls.current.length
        const filesToProcess = files.slice(0, availableSlots)

        filesToProcess.forEach((file, index) => {
          const slotIndex = latestImageUrls.current.length + index
          handleFileUpload(file, slotIndex)
        })
      }
    },
    [handleFileUpload, maxImages],
  )

  // Handle file input change
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: number,
  ) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], slotIndex)
    }
  }

  // Handle multiple file input change
  const handleMultipleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const availableSlots = maxImages - latestImageUrls.current.length
      const filesToProcess = files.slice(0, availableSlots)

      filesToProcess.forEach((file, index) => {
        const slotIndex = latestImageUrls.current.length + index
        handleFileUpload(file, slotIndex)
      })

      // Reset the input
      e.target.value = ''
    }
  }

  // Remove image
  const handleRemoveImage = (indexToRemove: number) => {
    const newImageUrls = currentImageUrls.filter(
      (_, index) => index !== indexToRemove,
    )
    onImagesChange(newImageUrls)
    resetUploadState(indexToRemove)
  }

  // Trigger file input for specific slot
  const triggerFileInput = (slotIndex: number) => {
    if (!disabled && !uploadStates[slotIndex]?.uploading) {
      document.getElementById(`file-input-${imageType}-${slotIndex}`)?.click()
    }
  }

  // Trigger multiple file input
  const triggerMultipleFileInput = () => {
    if (!disabled) {
      document.getElementById(`multiple-file-input-${imageType}`)?.click()
    }
  }

  const canAddMore = currentImageUrls.length < maxImages

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Images Grid */}
      {currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {currentImageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-video rounded-lg overflow-hidden border cursor-pointer"
              onClick={() => triggerFileInput(index)}
              title="Click to replace image"
            >
              <img
                src={imageUrl}
                alt={`Exercise image ${index + 1}`}
                className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
              />

              {/* Replace overlay on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-sm font-medium">
                  Click to replace
                </p>
              </div>

              {/* Upload Progress Overlay */}
              {uploadStates[index]?.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm">
                    {Math.round(uploadStates[index].progress)}%
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering the replace functionality
                  handleRemoveImage(index)
                }}
                size="icon-sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 size-6 shadow-lg rounded-full hover:opacity-100 transition-all duration-300"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add More Images */}
      {canAddMore && (
        <div
          className={cn(
            'border border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:border-primary hover:bg-primary/5',
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && triggerMultipleFileInput()}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Add Images</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Up to {maxImages} images • Max {config.maxSize / (1024 * 1024)}
                MB each
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {currentImageUrls.length}/{maxImages} uploaded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {Object.entries(uploadStates).map(
        ([slotIndex, state]) =>
          state.error && (
            <div
              key={slotIndex}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                Image {parseInt(slotIndex) + 1}: {state.error}
              </p>
            </div>
          ),
      )}

      {/* Multiple File Input for adding new images */}
      <input
        id={`multiple-file-input-${imageType}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleMultipleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Hidden File Inputs for individual slot replacements */}
      {Array.from({ length: maxImages }, (_, index) => (
        <input
          key={index}
          id={`file-input-${imageType}-${index}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileInputChange(e, index)}
          className="hidden"
          disabled={disabled || uploadStates[index]?.uploading}
        />
      ))}
    </div>
  )
}
