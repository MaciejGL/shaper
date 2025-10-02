'use client'

import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { GQLOptimizedImage } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import { Dialog, DialogClose, DialogContent } from '../ui/dialog'

interface ProgressImageGalleryProps {
  /** Array of optimized images to display */
  images: (GQLOptimizedImage | null)[]
  /** Labels for each image position */
  imageLabels?: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Image Size Selection Strategy:
 * - Thumbnail: Fast loading for grid views with many images
 * - Medium: Good quality for modal views, balances performance and clarity
 * - Large: High quality for full-screen or detailed viewing
 * - URL: Original/fallback when optimized sizes aren't available
 */

/**
 * Get the best available image URL for thumbnail display (grid view)
 * Priority: thumbnail → medium → url (optimized for fast loading)
 */
function getThumbnailUrl(image: GQLOptimizedImage | null): string | null {
  if (!image) return null
  return image.thumbnail || image.medium || image.url || null
}

/**
 * Get the best available image URL for modal display (larger view)
 * Priority: medium → large → url (balances quality and performance)
 */
function getModalUrl(image: GQLOptimizedImage | null): string | null {
  if (!image) return null
  return image.medium || image.large || image.url || null
}

/**
 * Reusable gallery component for displaying progress images
 * Supports zoom functionality and handles empty states
 */
export function ProgressImageGallery({
  images,
  imageLabels,
  className,
}: ProgressImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const hasAnyImage = images.some((img) => getThumbnailUrl(img) !== null)
  const validImages = images
    .map((img) => getModalUrl(img))
    .filter((url): url is string => url !== null)
  const [imageStates, setImageStates] = useState<Record<number, boolean>>({})
  const [carouselImageStates, setCarouselImageStates] = useState<
    Record<string, boolean>
  >({})

  // Preload images for faster carousel display
  useEffect(() => {
    validImages.forEach((imageUrl) => {
      if (imageUrl && !carouselImageStates[imageUrl]) {
        const img = new window.Image()
        img.src = imageUrl
        img.onload = () => {
          setCarouselImageStates((prev) => ({ ...prev, [imageUrl]: true }))
        }
      }
    })
  }, [validImages, carouselImageStates])

  // Track carousel position changes
  useEffect(() => {
    if (!carouselApi) return

    setCurrentGalleryIndex(carouselApi.selectedScrollSnap())

    carouselApi.on('select', () => {
      setCurrentGalleryIndex(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  // Navigate to specific image when modal opens (only once)
  useEffect(() => {
    if (selectedImageIndex !== null && carouselApi) {
      const selectedImage = images[selectedImageIndex]
      const selectedImageUrl = getModalUrl(selectedImage)
      if (!selectedImageUrl) return

      // Find the index of this image in the validImages array
      const validImageIndex = validImages.findIndex(
        (img) => img === selectedImageUrl,
      )
      if (validImageIndex !== -1) {
        // Small delay to ensure carousel is ready
        setTimeout(() => {
          carouselApi.scrollTo(validImageIndex, false) // false = no animation for instant positioning
        }, 50)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex, carouselApi]) // Intentionally excluding images and validImages to prevent re-triggering

  const openGallery = (index: number) => {
    const imageUrl = getThumbnailUrl(images[index])
    if (!imageUrl) return
    setSelectedImageIndex(index)
  }

  const goToImage = (index: number) => {
    if (carouselApi && index >= 0 && index < validImages.length) {
      carouselApi.scrollTo(index, true) // true = with animation
    }
  }

  if (!hasAnyImage) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <div className="text-center">
          <ImageIcon className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No photos added</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn('grid gap-2', className)}
        style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}
      >
        {images.map((image, index) => {
          const thumbnailUrl = getThumbnailUrl(image)
          return (
            <div key={index} className="space-y-1">
              {imageLabels && imageLabels[index] && (
                <div className="text-[10px] text-center text-muted-foreground font-medium">
                  {imageLabels[index]}
                </div>
              )}
              <div className="relative aspect-[3/4] bg-muted rounded-sm overflow-hidden">
                {thumbnailUrl ? (
                  <>
                    <Image
                      src={thumbnailUrl}
                      alt={imageLabels?.[index] || 'Progress Photo'}
                      fill
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className={cn(
                        'object-cover cursor-pointer transition-opacity duration-150',
                        imageStates[index] ? 'opacity-100' : 'opacity-0',
                      )}
                      onLoad={() =>
                        setImageStates((prev) => ({ ...prev, [index]: true }))
                      }
                      onClick={() => openGallery(index)}
                      priority={index < 2} // Prioritize first 2 images
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Carousel modal dialog */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={() => setSelectedImageIndex(null)}
      >
        <DialogContent
          className="max-w-4xl p-0 h-max max-md:rounded-none"
          dialogTitle="Progress Photos"
          withCloseButton={false}
          fullScreen
        >
          <DialogClose asChild>
            <Button
              variant="tertiary"
              iconOnly={<X />}
              className="absolute top-4 right-4 z-10"
            />
          </DialogClose>

          {selectedImageIndex !== null && validImages.length > 0 && (
            <div className="relative">
              <Carousel
                setApi={setCarouselApi}
                className="w-full"
                opts={{
                  align: 'center',
                  loop: true,
                }}
              >
                <CarouselContent>
                  {validImages.map((imageUrl, index) => (
                    <CarouselItem key={imageUrl}>
                      <div className="aspect-[3/4] bg-muted relative">
                        <Image
                          src={imageUrl}
                          alt={`Progress Photo ${index + 1}`}
                          fill
                          fetchPriority="high"
                          loading="eager"
                          quality={100}
                          sizes="(max-width: 768px) 100vw, 90vw"
                          className={cn(
                            'object-cover transition-opacity duration-300',
                            carouselImageStates[imageUrl]
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                          onLoad={() =>
                            setCarouselImageStates((prev) => ({
                              ...prev,
                              [imageUrl]: true,
                            }))
                          }
                          onError={() => {
                            console.error(
                              'Failed to load carousel image:',
                              imageUrl,
                            )
                            // Show error state or retry logic could go here
                          }}
                          priority={true} // High priority for carousel images
                        />
                        {!carouselImageStates[imageUrl] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Navigation buttons */}
                {validImages.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full !bg-black/80 backdrop-blur-sm hover:bg-background/90 text-white" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full !bg-black/80 backdrop-blur-sm hover:bg-background/90 text-white" />
                  </>
                )}
              </Carousel>

              {/* Image indicators */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {validImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={cn(
                        'size-2 rounded-full transition-all',
                        index === currentGalleryIndex
                          ? 'bg-primary scale-125'
                          : 'bg-background/60 hover:bg-background/80',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
