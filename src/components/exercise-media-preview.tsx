'use client'

import { Dumbbell } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { VideoOverlayButton } from './video-overlay-button'

interface ExerciseMediaPreviewProps {
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  alt?: string
  className?: string
}

export function ExerciseMediaPreview({
  images,
  videoUrl,
  alt = 'Exercise preview',
  className,
}: ExerciseMediaPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const validImages = (images || []).filter(
    (img): img is { medium: string } => !!img?.medium,
  )
  const hasMultipleImages = validImages.length > 1

  const handleImageClick = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
    }
  }

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={hasMultipleImages ? handleImageClick : undefined}
        className={cn(
          'relative overflow-hidden rounded-xl bg-muted',
          className || 'size-32',
          hasMultipleImages && 'cursor-pointer',
        )}
      >
        {validImages.length > 0 ? (
          <>
            {validImages.map((image, index) => (
              <Image
                key={index}
                src={image.medium}
                alt={alt}
                fill
                className={cn(
                  'object-cover transition-opacity duration-200',
                  index === currentImageIndex
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none',
                )}
                sizes="128px"
                loading="eager"
              />
            ))}
            {videoUrl && <VideoOverlayButton videoUrl={videoUrl} />}
          </>
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {hasMultipleImages && (
        <div className="flex items-center justify-center gap-1">
          {validImages.map((_, index) => (
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
  )
}

function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex-center flex-col bg-muted">
      <Dumbbell className="size-5 text-muted-foreground" />
    </div>
  )
}
