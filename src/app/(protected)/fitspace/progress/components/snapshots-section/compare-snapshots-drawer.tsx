'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { GQLGetUserBodyProgressLogsQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { useBodyProgressLogs } from '../body-progress/use-body-progress-logs'

interface CompareSnapshotsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  preselectedSnapshot?: {
    id: string
    date: string
    weight?: number
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
  } | null
}

type BodyProgressLog =
  GQLGetUserBodyProgressLogsQuery['userBodyProgressLogs'][0]

interface SelectedSnapshots {
  snapshot1: BodyProgressLog | null
  snapshot2: BodyProgressLog | null
}

export function CompareSnapshotsDrawer({
  isOpen,
  onOpenChange,
  preselectedSnapshot,
}: CompareSnapshotsDrawerProps) {
  const { progressLogs } = useBodyProgressLogs()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedSnapshots, setSelectedSnapshots] = useState<SelectedSnapshots>(
    {
      snapshot1: null,
      snapshot2: null,
    },
  )

  // Handle preselected snapshot
  React.useEffect(() => {
    if (preselectedSnapshot && isOpen) {
      // Find the matching progress log
      const matchingLog = progressLogs.find(
        (log) => log.id === preselectedSnapshot.id,
      )
      if (matchingLog) {
        setSelectedSnapshots({ snapshot1: matchingLog, snapshot2: null })
        setStep(1) // Stay on step 1 to select the second snapshot
      }
    } else if (!preselectedSnapshot && isOpen) {
      // Reset when opening without preselection
      setSelectedSnapshots({ snapshot1: null, snapshot2: null })
      setStep(1)
    }
  }, [preselectedSnapshot, isOpen, progressLogs])

  const handleSnapshotSelect = (snapshot: BodyProgressLog) => {
    const isSnapshot1 = selectedSnapshots.snapshot1?.id === snapshot.id
    const isSnapshot2 = selectedSnapshots.snapshot2?.id === snapshot.id

    // Toggle off if already selected
    if (isSnapshot1) {
      setSelectedSnapshots({ ...selectedSnapshots, snapshot1: null })
    } else if (isSnapshot2) {
      setSelectedSnapshots({ ...selectedSnapshots, snapshot2: null })
      setStep(1) // Go back to step 1 if we unselect the second snapshot
    } else {
      // Select new snapshot
      if (!selectedSnapshots.snapshot1) {
        setSelectedSnapshots({ ...selectedSnapshots, snapshot1: snapshot })
      } else if (!selectedSnapshots.snapshot2) {
        setSelectedSnapshots({ ...selectedSnapshots, snapshot2: snapshot })
        setStep(2)
      }
    }
  }

  const handleReset = () => {
    setSelectedSnapshots({ snapshot1: null, snapshot2: null })
    setStep(1)
  }

  const handleOpenChange = (open: boolean) => {
    handleReset()
    onOpenChange(open)
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent dialogTitle="Compare Snapshots" className="h-[95vh]">
        <DrawerHeader className="grid grid-cols-[auto_1fr_auto] items-center">
          {step === 2 && (
            <Button
              onClick={() => setStep(1)}
              variant="ghost"
              iconOnly={<ArrowLeft />}
              size="icon-sm"
            >
              Back
            </Button>
          )}
          <DrawerTitle
            className={cn(
              'text-center col-span-full',
              step === 2 && 'col-span-1',
            )}
          >
            {step === 1 ? 'Select Snapshots to Compare' : 'Compare Snapshots'}
          </DrawerTitle>

          <Button
            iconOnly={<ChevronRight />}
            size="icon-sm"
            className="opacity-0"
          >
            Compare
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <SnapshotSelectionStep
                  progressLogs={progressLogs}
                  selectedSnapshots={selectedSnapshots}
                  onSnapshotSelect={handleSnapshotSelect}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <ImageComparisonStep
                  snapshot1={selectedSnapshots.snapshot1}
                  snapshot2={selectedSnapshots.snapshot2}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <DrawerFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              Selected{' '}
              {
                [
                  selectedSnapshots.snapshot1?.loggedAt,
                  selectedSnapshots.snapshot2?.loggedAt,
                ].filter(Boolean).length
              }
              /2
            </div>
            <div className="flex items-center gap-2">
              <Button variant="tertiary" onClick={() => onOpenChange(false)}>
                Close
              </Button>

              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={
                    !selectedSnapshots.snapshot1 || !selectedSnapshots.snapshot2
                  }
                  iconEnd={<ChevronRight />}
                >
                  Compare
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(1)}
                  variant="tertiary"
                  iconStart={<ChevronLeft />}
                >
                  Back
                </Button>
              )}
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

interface SnapshotSelectionStepProps {
  progressLogs: BodyProgressLog[]
  selectedSnapshots: SelectedSnapshots
  onSnapshotSelect: (snapshot: BodyProgressLog) => void
}

function SnapshotSelectionStep({
  progressLogs,
  selectedSnapshots,
  onSnapshotSelect,
}: SnapshotSelectionStepProps) {
  const sortedLogs = [...progressLogs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {sortedLogs.map((log) => {
          const isSelected1 = selectedSnapshots.snapshot1?.id === log.id
          const isSelected2 = selectedSnapshots.snapshot2?.id === log.id
          const isDisabled =
            !isSelected1 &&
            !isSelected2 &&
            selectedSnapshots.snapshot1 &&
            selectedSnapshots.snapshot2

          return (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                outlineColor: isSelected1
                  ? '#10b981'
                  : isSelected2
                    ? '#3b82f6'
                    : '#e5e7eb',
              }}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
                layout: { duration: 0.2, ease: 'easeInOut' },
              }}
              className={cn(
                'relative cursor-pointer rounded-lg overflow-hidden outline transition-all ',
                {
                  'outline-green-500 bg-green-50 dark:bg-green-900/20':
                    isSelected1,
                  'outline-blue-500 bg-blue-50 dark:bg-blue-900/20':
                    isSelected2,
                  'outline-muted opacity-50 cursor-not-allowed': isDisabled,
                  'outline-border hover:outline-primary':
                    !isSelected1 && !isSelected2,
                },
              )}
              onClick={() => !isDisabled && onSnapshotSelect(log)}
            >
              <div className="aspect-[3/4] relative">
                {log.image1?.url ? (
                  <Image
                    src={log.image1.url}
                    alt={`Snapshot from ${new Date(log.loggedAt).toLocaleDateString()}`}
                    fill
                    className="object-cover select-none"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Selection indicator */}
                <AnimatePresence>
                  {(isSelected1 || isSelected2) && (
                    <motion.div
                      key={log.id + '-selection-indicator'}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-2 right-2"
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ',
                          isSelected1 ? 'bg-green-500' : 'bg-blue-500',
                        )}
                      >
                        {isSelected1 ? '1' : '2'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-2">
                <p className="text-xs font-medium">
                  {new Date(log.loggedAt).toLocaleDateString()}
                </p>
                {log.notes && (
                  <p className="text-xs text-muted-foreground truncate">
                    {log.notes}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface ImageComparisonStepProps {
  snapshot1: BodyProgressLog | null
  snapshot2: BodyProgressLog | null
}

function ImageComparisonStep({
  snapshot1,
  snapshot2,
}: ImageComparisonStepProps) {
  if (!snapshot1 || !snapshot2) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No snapshots selected</p>
      </div>
    )
  }

  const images = [
    {
      label: 'Image 1',
      url1: snapshot1.image1?.url,
      url2: snapshot2.image1?.url,
    },
    {
      label: 'Image 2',
      url1: snapshot1.image2?.url,
      url2: snapshot2.image2?.url,
    },
    {
      label: 'Image 3',
      url1: snapshot1.image3?.url,
      url2: snapshot2.image3?.url,
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          >
            <ImageComparisonRow
              label={image.label}
              image1Url={image.url1}
              image2Url={image.url2}
              snapshot1Date={new Date(snapshot1.loggedAt).toLocaleDateString()}
              snapshot2Date={new Date(snapshot2.loggedAt).toLocaleDateString()}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface ImageComparisonRowProps {
  label: string
  image1Url?: string | null
  image2Url?: string | null
  snapshot1Date: string
  snapshot2Date: string
}

function ImageComparisonRow({
  label,
  image1Url,
  image2Url,
  snapshot1Date,
  snapshot2Date,
}: ImageComparisonRowProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  const [isDragging, setIsDragging] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    },
    [isDragging],
  )

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const percentage = (x / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, percentage)))
    },
    [isDragging],
  )

  const handleTouchEnd = React.useCallback(() => {
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

  if (!image1Url && !image2Url) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <div className="aspect-[3/4] bg-muted/20 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <motion.h3
        className="text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {label}
      </motion.h3>
      <div className="relative" ref={containerRef}>
        <motion.div
          className="aspect-[3/4] relative overflow-hidden rounded-lg"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
        >
          {/* Background image (snapshot 2) */}
          {image2Url && (
            <Image
              src={image2Url}
              alt={`${label} - ${snapshot2Date}`}
              fill
              className="object-cover select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              draggable={false}
            />
          )}

          {/* Foreground image (snapshot 1) with clip */}
          {image1Url && (
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={image1Url}
                alt={`${label} - ${snapshot1Date}`}
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

          {/* Labels */}
          <motion.div
            className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {snapshot1Date}
          </motion.div>
          <motion.div
            className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {snapshot2Date}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
