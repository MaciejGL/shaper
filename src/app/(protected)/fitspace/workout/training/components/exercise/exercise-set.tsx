'use client'

import { motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { startTransition, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTrainingView } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { ExerciseWeightInput } from '../exercise-weight-input'

import { PROverlay } from './pr-overlay'
import { ExerciseSetProps } from './types'
import { useSetCompletion } from './use-set-completion'
import { useSetLogUpdate } from './use-set-log-update'
import { formatDisplayReps, formatDisplayWeight } from './utils'

export function ExerciseSet({
  set,
  previousSetWeightLog,
  previousSetRepsLog,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onSetCompleted,
  onSetUncompleted,
}: ExerciseSetProps) {
  const [dayId] = useQueryState('day')
  const { preferences } = useUserPreferences()
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced
  const { toDisplayWeight } = useWeightConversion()

  const { markAsEdited } = useSetLogUpdate({
    setId: set.id,
    dayId: dayId ?? '',
    reps,
    weight,
  })

  const { markSetAsCompletedOptimistic, prData, clearPR } = useSetCompletion({
    dayId: dayId ?? '',
    onSetCompleted,
  })

  const handleToggleSetCompletion = useCallback(async () => {
    const willBeCompleted = !set.completedAt
    const repsValue = reps ? +reps : previousSetRepsLog || null
    const weightValue = weight ? +weight : previousSetWeightLog || null

    startTransition(() => {
      if (!willBeCompleted) {
        onSetUncompleted()
      }
    })

    try {
      await markSetAsCompletedOptimistic({
        setId: set.id,
        completed: willBeCompleted,
        reps: repsValue,
        weight: weightValue,
      })
    } catch (error) {
      console.error('Failed to toggle set completion:', error)
    }
  }, [
    markSetAsCompletedOptimistic,
    set.completedAt,
    set.id,
    reps,
    weight,
    previousSetRepsLog,
    previousSetWeightLog,
    onSetUncompleted,
  ])

  const isCompleted = !!set.completedAt

  const previousDisplayWeight = previousSetWeightLog
    ? toDisplayWeight(previousSetWeightLog)?.toString()
    : null

  const targetDisplayWeight = set.weight
    ? toDisplayWeight(set.weight)?.toString()
    : null

  const displayReps = formatDisplayReps(set)
  const displayRepsSimple = reps || displayReps || '-'
  const displayWeight = formatDisplayWeight({
    weight,
    targetDisplayWeight,
    isAdvancedView,
  })

  return (
    <motion.div
      key={`set-${set.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {isAdvancedView && (
        <div
          className={cn(
            'relative grid grid-cols-[1.5rem_minmax(3rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_2rem] gap-2 px-4 pb-[2px] items-center',
          )}
        >
          <div />
          <div />
          <div>
            <p className="text-xs text-muted-foreground text-center truncate self-center leading-none">
              {displayReps}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground text-center truncate self-center">
              {displayWeight}
            </p>
          </div>
          <div />
        </div>
      )}
      <div
        className={cn(
          'relative grid grid-cols-[1.5rem_minmax(3rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_2rem] gap-2 px-2 items-center pb-2',
          'border-b border-border',
        )}
      >
        {/* Set Number */}
        <div
          className={cn(
            'text-xs font-medium text-center flex items-center justify-center mx-auto',
            'text-muted-foreground ',
          )}
        >
          {set.order}
        </div>

        {/* Previous Log */}
        <div className="text-xs text-muted-foreground text-center truncate ">
          {previousSetRepsLog ? `${previousSetRepsLog} × ` : ''}
          {previousDisplayWeight
            ? `${previousDisplayWeight}${preferences.weightUnit}`
            : '-'}
        </div>

        {/* Reps Input / Text */}
        {isAdvancedView ? (
          <Input
            id={`set-${set.id}-reps`}
            value={reps}
            onChange={(e) => {
              markAsEdited()
              const val = e.target.value.replace(/[^0-9]/g, '')
              onRepsChange(val)
            }}
            onFocus={(e) => {
              if (e.target.value) {
                requestAnimationFrame(() => e.target.select())
              }
            }}
            inputMode="numeric"
            variant="secondary"
            placeholder={set.minReps ? `${set.minReps}` : ''}
            className="text-center h-8 focus-visible:ring-0 text-sm w-full"
          />
        ) : (
          <div className="text-center text-sm font-medium">
            {displayRepsSimple}
          </div>
        )}

        {/* Weight Input / Text */}
        {isAdvancedView ? (
          <ExerciseWeightInput
            setId={set.id}
            weightInKg={weight ? parseFloat(weight) : null}
            onWeightChange={(weightInKg) => {
              markAsEdited()
              onWeightChange(weightInKg?.toString() || '')
            }}
            showWeightUnit={false}
          />
        ) : (
          <div className="text-center text-sm font-medium">
            {displayWeight}
            {displayWeight !== '-' && (
              <span className="text-xs text-muted-foreground ml-0.5">
                {preferences.weightUnit}
              </span>
            )}
          </div>
        )}

        {/* Check Button */}
        <div className="flex justify-center">
          <Button
            variant={isCompleted ? 'default' : 'secondary'}
            size="icon-sm"
            iconOnly={
              <CheckIcon className={cn(isCompleted && 'text-green-600')} />
            }
            onClick={handleToggleSetCompletion}
            className={cn(
              'rounded-lg',
              isCompleted &&
                'bg-green-500/20 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/20',
            )}
          />
        </div>

        <PROverlay
          isAdvancedView={isAdvancedView}
          prData={prData}
          onClose={clearPR}
        />
      </div>
    </motion.div>
  )
}
