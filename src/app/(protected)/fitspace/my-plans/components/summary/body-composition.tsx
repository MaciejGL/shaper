'use client'

import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Scale,
  TrendingUpDown,
} from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface BodyCompositionProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function BodyComposition({ summary }: BodyCompositionProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const bodyComp = summary.bodyComposition

  if (!bodyComp) {
    return null
  }

  const hasWeightData =
    bodyComp.startWeight != null && bodyComp.endWeight != null
  const weightChange = bodyComp.weightChange || 0
  const isWeightGain = weightChange > 0
  const isWeightLoss = weightChange < 0

  const hasSnapshots = bodyComp.startSnapshot && bodyComp.endSnapshot

  if (!hasWeightData) {
    return null
  }

  const images = [
    {
      label: 'Front',
      startUrl: bodyComp.startSnapshot?.image1Url,
      endUrl: bodyComp.endSnapshot?.image1Url,
    },
    {
      label: 'Side',
      startUrl: bodyComp.startSnapshot?.image2Url,
      endUrl: bodyComp.endSnapshot?.image2Url,
    },
    {
      label: 'Back',
      startUrl: bodyComp.startSnapshot?.image3Url,
      endUrl: bodyComp.endSnapshot?.image3Url,
    },
  ].filter((img) => img.startUrl || img.endUrl)

  // Track carousel index
  React.useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap())
    }

    carouselApi.on('select', onSelect)
    return () => {
      carouselApi.off('select', onSelect)
    }
  }, [carouselApi])

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h3 className="text-base font-semibold flex items-center gap-2">
        <SectionIcon icon={TrendingUpDown} size="xs" variant="blue" />
        Body Composition
      </h3>

      <Card>
        <CardContent className="space-y-4">
          {/* Weight comparison */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Weight</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {bodyComp.startWeight?.toFixed(1)} {bodyComp.unit}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-lg font-semibold">
                  {bodyComp.endWeight?.toFixed(1)} {bodyComp.unit}
                </span>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                isWeightLoss &&
                  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                isWeightGain &&
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                !isWeightLoss &&
                  !isWeightGain &&
                  'bg-muted text-muted-foreground',
              )}
            >
              {isWeightLoss && <ArrowDown className="size-4" />}
              {isWeightGain && <ArrowUp className="size-4" />}
              <span className="font-medium">
                {Math.abs(weightChange).toFixed(1)} {bodyComp.unit}
              </span>
            </div>
          </div>

          {/* Visual indicator */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 rounded-full',
                isWeightLoss && 'bg-green-500',
                isWeightGain && 'bg-blue-500',
              )}
              style={{
                width: `${Math.min(Math.abs(weightChange / (bodyComp.startWeight || 1)) * 100 * 10, 100)}%`,
              }}
            />
          </div>

          {/* Snapshots comparison carousel */}
          {hasSnapshots && images.length > 0 && (
            <div className="mt-6">
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  watchDrag: false,
                }}
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <ImageComparisonSlider
                        startImageUrl={image.startUrl}
                        endImageUrl={image.endUrl}
                        startDate={new Date(
                          bodyComp.startSnapshot?.loggedAt || '',
                        ).toLocaleDateString()}
                        endDate={new Date(
                          bodyComp.endSnapshot?.loggedAt || '',
                        ).toLocaleDateString()}
                        startWeight={bodyComp.startSnapshot?.weight}
                        endWeight={bodyComp.endSnapshot?.weight}
                        unit={bodyComp.unit}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="w-full grid grid-cols-[auto_1fr_auto] items-center mt-4">
                  {images.length > 1 && (
                    <>
                      <CarouselPrevious
                        className="size-8 bg-black/50 hover:bg-black/70 text-white border-0 relative left-2"
                        variant="tertiary"
                      />
                      {/* Carousel indicators below images */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => carouselApi?.scrollTo(index)}
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
                      </div>
                      <CarouselNext
                        className="size-8 bg-black/50 hover:bg-black/70 text-white border-0 relative right-2"
                        variant="tertiary"
                      />
                    </>
                  )}
                </div>
              </Carousel>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Draggable slider comparison component
interface ImageComparisonSliderProps {
  startImageUrl?: string | null
  endImageUrl?: string | null
  startDate: string
  endDate: string
  startWeight?: number | null
  endWeight?: number | null
  unit: string
}

function ImageComparisonSlider({
  startImageUrl,
  endImageUrl,
  startDate,
  endDate,
  startWeight,
  endWeight,
  unit,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    },
    [isDragging],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ])

  if (!startImageUrl && !endImageUrl) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="relative" ref={containerRef}>
        <motion.div
          className="aspect-[3/4] relative overflow-hidden rounded-lg"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
        >
          {/* Background image (end/after) */}
          {endImageUrl && (
            <Image
              src={endImageUrl}
              alt={`End - ${endDate}`}
              fill
              className="object-cover select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              draggable={false}
            />
          )}

          {/* Foreground image (start/before) with clip */}
          {startImageUrl && (
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={startImageUrl}
                alt={`Start - ${startDate}`}
                fill
                className="object-cover select-none"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
              />
            </div>
          )}

          {/* Slider line with larger touch target */}
          <motion.div
            className="absolute top-0 bottom-0 w-12 -ml-6 cursor-col-resize z-10"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Invisible touch target */}
            <div className="absolute inset-0" />

            {/* Visible slider line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white shadow-lg transform -translate-x-1/2" />

            {/* Handle */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <ChevronLeft className="w-3 h-3 text-gray-600" />
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </motion.div>
          </motion.div>

          {/* Labels with date and weight */}
          <motion.div
            className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded space-y-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>{startDate}</div>
            {startWeight != null && (
              <div className="font-semibold">
                {startWeight.toFixed(1)} {unit}
              </div>
            )}
          </motion.div>
          <motion.div
            className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded space-y-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div>{endDate}</div>
            {endWeight != null && (
              <div className="font-semibold">
                {endWeight.toFixed(1)} {unit}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
