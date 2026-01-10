'use client'

import { Dumbbell } from 'lucide-react'
import type { ReactNode } from 'react'

import { PlanPreviewExerciseRow } from '@/app/(protected)/fitspace/my-plans/components/plan-preview-exercise-row'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
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
      <SimpleDrawerContent
        title={title}
        headerIcon={<Dumbbell className="size-5 text-primary" />}
      >
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <PlanPreviewExerciseRow
              key={exercise.id}
              exercise={exercise}
              showDetails
            />
          ))}
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
