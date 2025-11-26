'use client'

import { BookIcon, ImageIcon, Lightbulb, VideoIcon, XIcon } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { SectionIcon } from '@/components/ui/section-icon'
import { YouTubePlayer } from '@/components/youtube-player'
import { cn } from '@/lib/utils'

import { WorkoutExercise } from '../workout-day'

interface ExerciseDetailDrawerProps {
  exercise: WorkoutExercise
}

export function ExerciseDetailDrawer({ exercise }: ExerciseDetailDrawerProps) {
  const videoUrl = exercise.videoUrl
  const images = exercise.images
  const instructions = exercise.instructions
  const tips = exercise.tips
  const description = exercise.description

  if (!images.length && !instructions?.length && !tips?.length && !description)
    return null

  const getIcon = () => {
    if (videoUrl) return <VideoIcon />
    if (images.length) return <ImageIcon />
    if (instructions?.length || tips?.length || description) return <BookIcon />
  }

  return (
    <Drawer direction="right" disablePreventScroll>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon-md" iconOnly={getIcon()} />
      </DrawerTrigger>
      <DrawerContent
        dialogTitle="Exercise Metadata"
        className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
        grabber={false}
      >
        <div className="overflow-y-auto overscroll-behavior-y-contain">
          <DrawerClose asChild>
            <Button
              variant="secondary"
              size="icon-lg"
              iconOnly={<XIcon className="dark text-white" />}
              className="dark absolute top-4 right-4 rounded-full z-10 bg-black/30 dark:bg-black/30 border-none backdrop-blur-md transition-opacity"
            />
          </DrawerClose>
          {/* Exercise Video */}
          {videoUrl && (
            <div className="aspect-video w-full">
              <YouTubePlayer
                videoUrl={videoUrl}
                autoplay={true}
                mute={true}
                loop={true}
                minimal={true}
                className="w-full h-full"
              />
            </div>
          )}
          {/* Exercise Images */}
          {images && images.length > 0 && !videoUrl && (
            <div className="grid grid-cols-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/5] overflow-hidden shadow-xs"
                >
                  <Image
                    src={image.url || '/placeholder.svg'}
                    alt={`${exercise.name} - Step ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}
          <DrawerHeader className="py-4">
            <div
              className={cn(
                'flex items-center justify-between gap-2',
                images.length === 0 && !videoUrl && ' pr-8',
              )}
            >
              <DrawerTitle className="text-xl font-semibold">
                {exercise.name}
              </DrawerTitle>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroups &&
                  exercise.muscleGroups.length > 0 &&
                  exercise.muscleGroups.slice(0, 1).map((muscleGroup) => (
                    <Badge
                      variant="secondary"
                      className="w-fit capitalize"
                      key={muscleGroup.id}
                    >
                      {muscleGroup.groupSlug}
                    </Badge>
                  ))}
              </div>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-8">
            {/* Instructions */}
            <div className="space-y-4">
              {exercise.instructions && exercise.instructions.length >= 2 && (
                <div className="flex items-start gap-3 flex-col">
                  <ol className="space-y-2 list-decimal list-outside pl-4">
                    <li className="text-sm dark:text-muted-foreground leading-relaxed">
                      {exercise.instructions[0]}
                    </li>
                    <li className="text-sm dark:text-muted-foreground leading-relaxed">
                      {exercise.instructions[1]}
                    </li>
                  </ol>
                </div>
              )}

              {/* Exercise Images */}
              {images && images.length > 0 && videoUrl && (
                <div className="grid grid-cols-2 gap-1 -mx-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/5] overflow-hidden shadow-xs rounded-md"
                    >
                      <Image
                        src={image.url || '/placeholder.svg'}
                        alt={`${exercise.name} - Step ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {/* {exercise.description && (
              <div className="flex items-start gap-3 flex-col">
                <div className="flex items-center gap-2">
                  <SectionIcon icon={InfoIcon} variant="blue" size="sm" />
                  <h3 className="font-medium">Description</h3>
                </div>
                <p className="text-sm dark:text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            )} */}

            {/* Tips */}
            {exercise.tips && exercise.tips.length > 0 && (
              <div className="flex items-start gap-3 flex-col">
                <div className="flex items-center gap-2">
                  <SectionIcon icon={Lightbulb} variant="yellow" size="sm" />
                  <h3 className="font-medium">Tips</h3>
                </div>
                <ul className="space-y-2 list-disc list-outside pl-4">
                  {exercise.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="list-item text-sm dark:text-muted-foreground leading-relaxed"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
