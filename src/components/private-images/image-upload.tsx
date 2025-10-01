'use client'

import { Camera, ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

import { cn } from '../../lib/utils'
import { useMobileApp } from '../mobile-app-bridge'
import { Button } from '../ui/button'

interface PrivateImageUploadProps {
  /** Current image URL */
  imageUrl?: string
  /** Callback when image changes */
  onImageChange: (url: string | undefined) => void
  /** Label for the upload area */
  label: string
  /** Image type for S3 upload (determines folder) */
  imageType?: 'progress' | 'avatar'
  /** Additional CSS classes */
  className?: string
  /** Whether the upload is disabled */
  disabled?: boolean
}

/**
 * Reusable component for uploading private images with S3 integration
 * Handles the complete upload flow including presigned URLs and error handling
 */
export function PrivateImageUpload({
  imageUrl,
  onImageChange,
  label,
  imageType = 'progress',
  className,
  disabled = false,
}: PrivateImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { isNativeApp } = useMobileApp()
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file || disabled) return

    setIsUploading(true)
    try {
      // Get presigned URL from our API
      const response = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          imageType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { presignedUrl, publicUrl } = await response.json()

      // Store high-quality originals since we have on-demand processing
      // No need to compress here - keep originals for detailed analysis

      // Upload original file to S3 using presigned URL
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      // Update the image URL
      onImageChange(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    if (disabled) return
    onImageChange(undefined)
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs text-center text-muted-foreground font-medium">
        {label}
      </div>
      <div className="relative aspect-[3/4] border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <Button
              variant="tertiary"
              size="icon-xs"
              className="absolute top-1 right-1"
              onClick={handleRemove}
              disabled={disabled}
              iconOnly={<X />}
            />
          </>
        ) : (
          <label
            className={cn(
              'flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors',
              (isUploading || disabled) && 'pointer-events-none opacity-50',
            )}
          >
            <div className="text-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              ) : (
                <ImageIcon className="size-6 text-muted-foreground mx-auto mb-3" />
              )}
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Uploading...' : 'Add Photo'}
              </p>
              <Upload className="size-4 text-muted-foreground mx-auto mt-1" />
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading || disabled}
            />
          </label>
        )}
      </div>

      {/* Camera button - only show on mobile */}
      {isNativeApp && (
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="w-full"
          onClick={handleCameraCapture}
          disabled={isUploading || disabled}
          iconOnly={<Camera />}
        >
          Take Photo
        </Button>
      )}

      {/* Hidden camera input */}
      {isNativeApp && (
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          disabled={isUploading || disabled}
        />
      )}
    </div>
  )
}
