'use client'

import { Dumbbell } from 'lucide-react'
import type { ReactNode } from 'react'

import { PlanPreviewExerciseRow } from '@/app/(protected)/fitspace/my-plans/components/plan-preview-exercise-row'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import type { PlanExercise } from './types'

interface WorkoutExercisesDrawerProps {
  exercises: PlanExercise[]
  trigger: ReactNode
  title?: string
}

export function WorkoutExercisesDrawer({
  exercises,
  trigger,
  title = "Today's Exercises",
}: WorkoutExercisesDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent dialogTitle={title} className="max-h-[90vh]">
        <div className="flex flex-col min-h-0">
          <DrawerHeader className="border-b flex-none">
            <DrawerTitle className="flex items-center gap-2">
              <Dumbbell className="size-5 text-primary" />
              {title}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-[calc(var(--safe-area-inset-bottom)+24px)]">
            <div className="space-y-4">
              {exercises.map((exercise) => (
                <PlanPreviewExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  showDetails
                />
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
