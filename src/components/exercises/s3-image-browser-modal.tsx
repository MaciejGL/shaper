'use client'

import { Check, Loader2, Search } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

interface S3Image {
  key: string
  url: string
  size: number
  lastModified: string
}

interface S3ImageBrowserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (imageUrls: string[]) => void
  maxImages?: number
}

export function S3ImageBrowserModal({
  open,
  onOpenChange,
  onConfirm,
  maxImages = 7,
}: S3ImageBrowserModalProps) {
  const [images, setImages] = useState<S3Image[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [continuationToken, setContinuationToken] = useState<
    string | undefined
  >()
  const [searchInput, setSearchInput] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const debouncedSearch = useDebounce(searchInput, 300)

  const fetchImages = useCallback(
    async (token?: string, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setImages([])
      }

      try {
        const params = new URLSearchParams({
          limit: '50',
          ...(token && { continuationToken: token }),
          ...(debouncedSearch && { search: debouncedSearch }),
        })

        const response = await fetch(`/api/admin/s3-images?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }

        const data = await response.json()

        if (isLoadMore) {
          setImages((prev) => [...prev, ...data.images])
        } else {
          setImages(data.images)
        }

        setHasMore(data.hasMore)
        setContinuationToken(data.continuationToken)
      } catch (error) {
        console.error('Error fetching S3 images:', error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [debouncedSearch],
  )

  useEffect(() => {
    if (open) {
      fetchImages()
      setSelectedImages([])
    }
  }, [open, fetchImages])

  const handleLoadMore = () => {
    if (continuationToken) {
      fetchImages(continuationToken, true)
    }
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImages((prev) => {
      const index = prev.indexOf(imageUrl)
      if (index > -1) {
        // Remove from selection
        return prev.filter((url) => url !== imageUrl)
      } else if (prev.length < maxImages) {
        // Add to selection
        return [...prev, imageUrl]
      }
      return prev
    })
  }

  const handleConfirm = () => {
    onConfirm(selectedImages)
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelectedImages([])
    setSearchInput('')
    onOpenChange(false)
  }

  const getSelectionOrder = (imageUrl: string): number => {
    const index = selectedImages.indexOf(imageUrl)
    return index > -1 ? index + 1 : 0
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        dialogTitle="Browse S3 Images"
        className="sm:max-w-4xl max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>Browse S3 Images</DialogTitle>
          <DialogDescription>
            Select images from the S3 bucket. Click images in the order you want
            them to appear. Selected: {selectedImages.length}/{maxImages}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              variant="secondary"
            />
          </div>

          <div className="overflow-y-auto max-h-[50vh] border rounded-lg p-2">
            {loading ? (
              <div className="flex-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No images found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {images.map((image) => {
                    const order = getSelectionOrder(image.url)
                    const isSelected = order > 0

                    return (
                      <button
                        key={image.key}
                        type="button"
                        onClick={() => handleImageClick(image.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.key.split('/').pop() || 'Exercise image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                        />

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20">
                            <div className="absolute top-1 left-1 size-6 rounded-full bg-primary text-primary-foreground flex-center text-xs font-bold">
                              {order}
                            </div>
                            <div className="absolute bottom-1 right-1">
                              <Check className="size-4 text-primary" />
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                          <span className="text-[10px] text-white truncate block">
                            {formatFileSize(image.size)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {hasMore && (
                  <div className="flex-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      loading={loadingMore}
                      disabled={loadingMore}
                    >
                      Load More Images
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedImages.length === 0}
          >
            Use {selectedImages.length} Image{selectedImages.length !== 1 && 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

