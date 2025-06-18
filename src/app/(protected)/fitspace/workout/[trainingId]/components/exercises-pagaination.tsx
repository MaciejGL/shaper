import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useWorkout } from '@/context/workout-context/workout-context'
import { cn } from '@/lib/utils'

import { Summary } from './summary'

export function ExercisesPagination({
  onClick,
}: {
  onClick: (exerciseId: string | null, type: 'prev' | 'next') => void
}) {
  const [activeExerciseId] = useQueryState('exercise')
  const { activeDay } = useWorkout()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const exercises = activeDay?.exercises ?? []
  const currentExerciseIndex = exercises.findIndex(
    (exercise) => exercise.id === activeExerciseId,
  )
  const lastExercise = exercises[exercises.length - 1]
  const prevExercise = activeExerciseId
    ? exercises[currentExerciseIndex - 1]
    : lastExercise
  const nextExercise = activeExerciseId
    ? exercises[currentExerciseIndex + 1]
    : null

  const isSummary = activeExerciseId === 'summary'

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-2 w-full py-4">
      <Button
        variant="secondary"
        size="sm"
        iconStart={<ChevronLeftIcon />}
        onClick={() =>
          onClick(isSummary ? lastExercise?.id : prevExercise?.id, 'prev')
        }
        disabled={!prevExercise && !isSummary}
        className={cn(!prevExercise && !isSummary && 'invisible')}
      >
        Prev
      </Button>
      <Dots
        currentExerciseIndex={currentExerciseIndex}
        pagesNumber={exercises.length}
      />

      <Button
        variant="secondary"
        size="sm"
        iconEnd={<ChevronRightIcon />}
        onClick={() => {
          if (nextExercise) {
            onClick(nextExercise?.id, 'next')
          } else {
            onClick('summary', 'next')
          }
        }}
      >
        Next
      </Button>

      <Summary onOpenChange={setSummaryOpen} open={summaryOpen} />
    </div>
  )
}

function Dots({
  currentExerciseIndex,
  pagesNumber,
}: {
  currentExerciseIndex: number
  pagesNumber: number
}) {
  return (
    <div className="flex gap-1 w-max mx-auto items-center relative">
      {/* Sliding indicator */}
      <motion.div
        key={'indicator'}
        className="absolute w-2 h-2 rounded-full bg-primary left-0 top-1/2 -translate-y-1/2"
        initial={false}
        animate={{
          x: `${currentExerciseIndex * (8 + 4)}px`, // 8px (w-2) + 4px (gap-1)
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
      {/* Dots container */}
      <div className="flex gap-1">
        {Array.from({ length: pagesNumber }).map((_, index) => (
          <Dot key={index} />
        ))}
      </div>
    </div>
  )
}

function Dot() {
  return <div className="w-2 h-2 rounded-full bg-accent" />
}
