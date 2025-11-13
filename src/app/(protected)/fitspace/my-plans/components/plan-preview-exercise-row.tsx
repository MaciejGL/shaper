import Image from 'next/image'
import { useState } from 'react'

import { VideoOverlayButton } from '@/components/video-overlay-button'
import { cn } from '@/lib/utils'

// Flexible exercise type that works with different query types
interface Exercise {
  __typename?: string
  id: string
  name: string
  videoUrl?: string | null
  completedAt?: string | null
  images?: {
    __typename?: string
    id: string
    thumbnail?: string | null
    medium?: string | null
    url: string
    order: number
  }[]
  // Optional fields from other query types (not used by this component)
  muscleGroups?: unknown
  sets?: unknown
  restSeconds?: unknown
  instructions?: unknown
}

interface PlanPreviewExerciseRowProps {
  exercise?: Exercise
  isTemplate?: boolean
  isRestDay?: boolean
}

export function PlanPreviewExerciseRow({
  exercise,
  isRestDay = false,
  isTemplate = false,
}: PlanPreviewExerciseRowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = exercise?.images || []
  const hasMultipleImages = images.length > 1
  const videoUrl = exercise?.videoUrl

  // Determine border color based on plan status and completion
  const getBorderColor = () => {
    if (isRestDay) {
      return 'bg-muted-foreground/40'
    }
    if (isTemplate) {
      return 'bg-muted-foreground/40' // Gray for templates
    }
    const isCompleted = !!exercise?.completedAt
    return isCompleted ? 'bg-green-500' : 'bg-amber-500'
  }

  const handleImageClick = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const borderColor = getBorderColor()

  return (
    <div
      className={cn(
        'flex items-center gap-3 pl-3 relative',
        isRestDay && 'py-3',
      )}
    >
      {/* Colored border line on the left */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-full',
          borderColor,
        )}
      />

      {!isRestDay && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleImageClick}
            className={cn(
              'relative size-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted',
              hasMultipleImages && 'cursor-pointer',
            )}
            disabled={!hasMultipleImages}
          >
            {images.length > 0 ? (
              <>
                {images.map((image, index) => {
                  const url = image.url || image.medium || image.thumbnail
                  if (!url) return null
                  return (
                    <Image
                      key={image.id || index}
                      width={128}
                      height={128}
                      src={url}
                      alt={exercise?.name || 'Exercise image'}
                      className={cn(
                        'w-full h-full object-cover absolute inset-0 transition-opacity duration-200',
                        index === currentImageIndex
                          ? 'opacity-100'
                          : 'opacity-0 pointer-events-none',
                      )}
                      loading="eager"
                    />
                  )
                })}
                {videoUrl && <VideoOverlayButton videoUrl={videoUrl} />}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center px-1">
                <span className="text-[10px] text-muted-foreground leading-tight">
                  No image
                </span>
              </div>
            )}
          </button>

          {hasMultipleImages && (
            <div className="flex items-center justify-center gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === currentImageIndex
                      ? 'w-6 bg-primary'
                      : 'w-1.5 bg-muted-foreground/30',
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className={cn('flex flex-col gap-2', hasMultipleImages && 'pb-[14px]')}
      >
        <span className="text-base flex-1">
          {isRestDay ? 'Rest Day' : exercise?.name || 'Exercise name'}
        </span>
      </div>
    </div>
  )
}
