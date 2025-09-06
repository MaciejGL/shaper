'use client'

import imageCompression from 'browser-image-compression'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, Pencil, Trash2 } from 'lucide-react'
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
  fallbackUrl?: string
  alt?: string
  id?: string
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

interface EditState {
  isEditing: boolean
}

export function AvatarUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className = '',
  disabled = false,
  fallbackUrl,
  alt = 'Avatar',
  id = 'avatar-file-input',
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  })

  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
  })

  const imageType: ImageType = 'avatar'
  const config = IMAGE_CONFIGS[imageType]

  // Reset upload state
  const resetUploadState = () => {
    setUploadState({ uploading: false, progress: 0, error: null })
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditState((prev) => ({ isEditing: !prev.isEditing }))
    resetUploadState()
  }

  // Exit edit mode
  const exitEditMode = useCallback(() => {
    setEditState({ isEditing: false })
    resetUploadState()
  }, [])

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

        // Exit edit mode and reset state after short delay
        setTimeout(() => {
          resetUploadState()
          exitEditMode()
        }, 1000)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadState({
          uploading: false,
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed',
        })
      }
    },
    [config, imageType, onImageUploaded, disabled, exitEditMode],
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
    exitEditMode()
  }

  // Trigger file input
  const triggerFileInput = () => {
    if (!disabled && !uploadState.uploading && editState.isEditing) {
      document.getElementById(id)?.click()
    }
  }

  const displayImageUrl = currentImageUrl || fallbackUrl

  return (
    <div className={cn('relative group', className)}>
      {/* Avatar */}
      <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-800 shadow-xs bg-zinc-100 dark:bg-zinc-700 shadow-zinc-200 dark:shadow-black">
        <AvatarImage src={displayImageUrl || ''} alt={alt} />
      </Avatar>

      {/* Action Buttons */}
      <AnimatePresence mode="wait">
        <div className="absolute -bottom-2 -right-3 flex flex-row flex-nowrap gap-2">
          {/* If no avatar, show upload button directly */}
          {!currentImageUrl ? (
            <ProgressButton
              icon={Camera}
              size="sm"
              variant="default"
              progress={uploadState.progress}
              isLoading={uploadState.uploading}
              onClick={() => document.getElementById(id)?.click()}
              disabled={disabled}
              className="shadow-lg size-9"
              title="Upload avatar"
            />
          ) : (
            <>
              {/* Edit mode buttons - shown when user has avatar and is editing */}
              {editState.isEditing && (
                <div className="flex flex-row flex-nowrap gap-2">
                  {/* Remove Button */}
                  {!uploadState.uploading && (
                    <motion.div
                      key="remove-button"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Button
                        onClick={handleRemoveImage}
                        size="icon-md"
                        variant="outline"
                        className="transition-opacity shadow-lg rounded-full dark:bg-input"
                        title="Remove avatar"
                        iconOnly={<Trash2 />}
                      />
                    </motion.div>
                  )}
                  <motion.div
                    key="upload-button"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.1 }}
                  >
                    <ProgressButton
                      icon={Camera}
                      size="sm"
                      variant="default"
                      progress={uploadState.progress}
                      isLoading={uploadState.uploading}
                      onClick={triggerFileInput}
                      disabled={disabled}
                      className="shadow-lg size-9"
                      title="Upload new avatar"
                    />
                  </motion.div>
                </div>
              )}
              {/* Edit/Done toggle button - only shown when user has avatar */}
              <Button
                onClick={toggleEditMode}
                size="icon-md"
                variant="default"
                disabled={disabled}
                className="shadow-lg rounded-full"
                title="Edit avatar"
                iconOnly={editState.isEditing ? <Check /> : <Pencil />}
              />
            </>
          )}
        </div>
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploadState.uploading}
      />
    </div>
  )
}
