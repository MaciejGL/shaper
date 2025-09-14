'use client'

import { Lightbulb, VideoIcon, XIcon } from 'lucide-react'
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
import { getYouTubeEmbedUrl } from '@/lib/get-youtube-embed-url'

import { WorkoutExercise } from '../workout-page.client'

interface ExerciseDetailDrawerProps {
  exercise: WorkoutExercise
}

export function ExerciseDetailDrawer({ exercise }: ExerciseDetailDrawerProps) {
  const videoUrl = exercise.videoUrl
  const images = exercise.images.slice(0, 2)
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="tertiary" size="icon-sm" iconOnly={<VideoIcon />} />
      </DrawerTrigger>
      <DrawerContent
        dialogTitle="Exercise Metadata"
        className="data-[vaul-drawer-direction=bottom]:max-h-[93vh] overflow-hidden"
        grabber={false}
      >
        <div className="overflow-y-auto overscroll-behavior-y-contain">
          <DrawerClose asChild>
            <Button
              variant="tertiary"
              size="icon-sm"
              iconOnly={<XIcon />}
              className="absolute top-2 right-2 rounded-full z-10"
            />
          </DrawerClose>
          {/* Exercise Video */}
          {videoUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(videoUrl, {
                  autoplay: true,
                  mute: true,
                  loop: true,
                })}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
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
                    src={image.medium || '/placeholder.svg'}
                    alt={`${exercise.name} - Step ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute size-6 top-2 left-2 flex-center rounded-full bg-black/70 text-white font-semibold text-sm p-1">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DrawerHeader className="py-4">
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle className="text-xl font-semibold">
                {exercise.name}
              </DrawerTitle>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroups &&
                  exercise.muscleGroups.length > 0 &&
                  exercise.muscleGroups.slice(0, 2).map((muscleGroup) => (
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
                <div className="grid grid-cols-2 -mx-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/5] overflow-hidden shadow-xs"
                    >
                      <Image
                        src={image.medium || '/placeholder.svg'}
                        alt={`${exercise.name} - Step ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute size-6 top-2 left-2 flex-center rounded-full bg-black/70 text-white font-semibold text-sm p-1">
                        {index + 1}
                      </div>
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
