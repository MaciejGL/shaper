'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Dumbbell } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { PlanPreviewExerciseRow } from '../../plan-preview-exercise-row'

import type { PlanExercise } from './types'

interface ExercisesListProps {
  exercises: PlanExercise[]
  showDetails?: boolean
}

export function ExercisesList({
  exercises,
  showDetails = false,
}: ExercisesListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-on-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Dumbbell className="size-4 text-muted-foreground" />
          <span className="font-medium">{exercises.length} Exercises</span>
        </div>

        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-4 border-t border-border pt-4">
              {exercises.map((exercise) => (
                <PlanPreviewExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  showDetails={showDetails}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
