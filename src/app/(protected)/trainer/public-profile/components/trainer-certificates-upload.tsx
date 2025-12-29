'use client'

import { Loader2, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Icon } from '@/components/icons/icon'
import { Button } from '@/components/ui/button'
import { useUpdateProfileMutation } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

interface TrainerCertificatesUploadProps {
  currentUrls: string[]
  onUrlsChange: (urls: string[]) => void
}

const MAX_CERTIFICATES = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf')
}

function getFilenameFromUrl(url: string): string {
  const path = url.split('/').pop() || ''
  // Remove timestamp prefix: "1735500000-filename.pdf" -> "filename.pdf"
  const withoutTimestamp = path.replace(/^\d+-/, '')
  // Replace underscores with spaces for readability
  return decodeURIComponent(withoutTimestamp).replace(/_/g, ' ')
}

export function TrainerCertificatesUpload({
  currentUrls,
  onUrlsChange,
}: TrainerCertificatesUploadProps) {
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>(
    {},
  )
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const latestUrls = useRef(currentUrls)
  latestUrls.current = currentUrls

  const updateProfileMutation = useUpdateProfileMutation()

  const saveCredentials = useCallback(
    async (newUrls: string[]) => {
      await updateProfileMutation.mutateAsync({
        input: { credentials: newUrls },
      })
    },
    [updateProfileMutation],
  )

  const handleFileUpload = useCallback(
    async (file: File, slotIndex: number) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Only JPEG, PNG, WebP, or PDF files are allowed')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 10MB')
        return
      }

      setUploadStates((prev) => ({
        ...prev,
        [slotIndex]: { uploading: true, progress: 20, error: null },
      }))

      try {
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
            contentType: file.type,
            imageType: 'trainerCertificate',
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
          body: file,
          headers: { 'Content-Type': file.type },
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        setUploadStates((prev) => ({
          ...prev,
          [slotIndex]: { uploading: true, progress: 100, error: null },
        }))

        // Update URLs and auto-save
        const newUrls = [...latestUrls.current, publicUrl]
        latestUrls.current = newUrls
        onUrlsChange(newUrls)
        await saveCredentials(newUrls)

        toast.success('Certificate uploaded')

        // Reset state after short delay
        setTimeout(() => {
          setUploadStates((prev) => {
            const newStates = { ...prev }
            delete newStates[slotIndex]
            return newStates
          })
        }, 500)
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
        toast.error(error instanceof Error ? error.message : 'Failed to upload')
      }
    },
    [onUrlsChange, saveCredentials],
  )

  const handleDelete = async (url: string) => {
    setDeletingUrl(url)

    try {
      const response = await fetch('/api/trainer/certificates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete certificate')
      }

      // Update local state
      const newUrls = latestUrls.current.filter((u) => u !== url)
      latestUrls.current = newUrls
      onUrlsChange(newUrls)
      toast.success('Certificate deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete certificate',
      )
    } finally {
      setDeletingUrl(null)
    }
  }

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
        const availableSlots = MAX_CERTIFICATES - latestUrls.current.length
        const filesToProcess = files.slice(0, availableSlots)

        filesToProcess.forEach((file, index) => {
          const slotIndex = latestUrls.current.length + index
          handleFileUpload(file, slotIndex)
        })
      }
    },
    [handleFileUpload],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const availableSlots = MAX_CERTIFICATES - latestUrls.current.length
      const filesToProcess = files.slice(0, availableSlots)

      filesToProcess.forEach((file, index) => {
        const slotIndex = latestUrls.current.length + index
        handleFileUpload(file, slotIndex)
      })

      e.target.value = ''
    }
  }

  const canAddMore = currentUrls.length < MAX_CERTIFICATES
  const hasUploadingFiles = Object.values(uploadStates).some(
    (state) => state.uploading,
  )

  return (
    <div className="space-y-4">
      {/* Current certificates grid */}
      {currentUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentUrls.map((url) => {
            const isPdf = isPdfUrl(url)
            const isDeleting = deletingUrl === url

            return (
              <div
                key={url}
                className="relative group aspect-[4/3] rounded-lg overflow-hidden border bg-muted"
              >
                {isPdf ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex flex-col bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Icon Area - 2/3 height */}
                    <div className="flex-1 flex-center bg-muted/30 p-4">
                      <Icon
                        name="pdf"
                        size={40}
                        className="text-muted-foreground/50"
                      />
                    </div>
                    {/* Text Area - 1/3 height */}
                    <div className="h-12 px-3 flex items-center border-t bg-background/50">
                      <span className="text-[10px] font-medium text-muted-foreground truncate w-full">
                        {getFilenameFromUrl(url)}
                      </span>
                    </div>
                  </a>
                ) : (
                  <Image
                    src={url}
                    alt="Certificate"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                )}

                {/* Delete button */}
                <Button
                  onClick={() => handleDelete(url)}
                  disabled={isDeleting}
                  size="icon-sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 size-6 rounded-full transition-opacity"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </Button>
              </div>
            )
          })}

          {/* Uploading slots */}
          {Object.entries(uploadStates).map(([slotIndex, state]) => {
            if (state.uploading) {
              return (
                <div
                  key={`uploading-${slotIndex}`}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden border border-primary bg-primary/5 flex-center"
                >
                  <div className="text-center">
                    <Loader2 className="size-6 animate-spin text-primary mx-auto mb-2" />
                    <span className="text-xs text-primary">
                      {Math.round(state.progress)}%
                    </span>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      {/* Add more area */}
      {canAddMore && (
        <div
          className={cn(
            'border border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary hover:bg-primary/5',
            hasUploadingFiles && 'opacity-50 pointer-events-none',
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="size-10 rounded-full bg-primary/10 flex-center">
              <Plus className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Add Certificates</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images or PDF, max 10MB each ({currentUrls.length}/
                {MAX_CERTIFICATES})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {Object.entries(uploadStates).map(
        ([slotIndex, state]) =>
          state.error && (
            <div
              key={slotIndex}
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
            >
              <X className="size-4 text-destructive" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          ),
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
