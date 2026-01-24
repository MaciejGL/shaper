'use client'

import { ArrowLeftIcon } from 'lucide-react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

type PlanDay = NonNullable<
  NonNullable<
    GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]['weeks']
  >[number]['days']
>[number]

interface PlanDayExercisePreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  day: PlanDay
}

export function PlanDayExercisePreviewDrawer({
  open,
  onOpenChange,
  day,
}: PlanDayExercisePreviewDrawerProps) {
  const workoutTypeLabel = day.workoutType
    ? formatWorkoutType(day.workoutType)
    : null
  const title = day.isRestDay
    ? `Day ${day.dayOfWeek + 1}`
    : `Day ${day.dayOfWeek + 1}${workoutTypeLabel ? ` • ${workoutTypeLabel}` : ''}`

  const exercises = day.exercises ?? []

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        dialogTitle="Day Exercise Preview"
        className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
        grabber={false}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center gap-4 px-4 py-4">
            <DrawerClose asChild>
              <Button
                variant="default"
                size="lg"
                iconStart={<ArrowLeftIcon />}
                className="w-max"
              >
                Plan
              </Button>
            </DrawerClose>

            <DrawerHeader className="flex-none p-0">
              <DrawerTitle className="text-xl font-medium">{title}</DrawerTitle>
            </DrawerHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-[calc(var(--safe-area-inset-bottom)+24px)]">
            {exercises.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">
                  No exercises to preview.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center gap-3">
                    <ExerciseMediaPreview
                      images={exercise.images}
                      videoUrl={exercise.videoUrl}
                      alt={exercise.name}
                      className="size-32"
                      hidePagination
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">
                        {exercise.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
