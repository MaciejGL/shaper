'use client'

import { motion } from 'framer-motion'

import { StatsItem } from '@/components/stats-item'
import { GQLEquipment } from '@/generated/graphql-client'

import type {
  RepFocus,
  WorkoutSubType,
  WorkoutType,
} from '../../hooks/use-ai-workout-generation'
import { WORKOUT_TYPE_OPTIONS } from '../../types/workout-types'

interface WorkoutSummaryProps {
  exerciseCount: number
  maxSetsPerExercise: number
  repFocus: RepFocus
  workoutType: WorkoutType | null
  workoutSubType: WorkoutSubType | null
  selectedEquipment: GQLEquipment[]
  className?: string
}

export function WorkoutSummary({
  exerciseCount,
  maxSetsPerExercise,
  repFocus,
  workoutType,
  workoutSubType,
  selectedEquipment,
  className,
}: WorkoutSummaryProps) {
  const getWorkoutTypeLabel = () => {
    if (!workoutType) return 'Not selected'

    const workoutOption = WORKOUT_TYPE_OPTIONS.find(
      (opt) => opt.id === workoutType,
    )
    if (!workoutOption) return 'Not selected'

    if (!workoutSubType || !workoutOption.hasSubTypes) {
      return workoutOption.label
    }

    const subTypeOption = workoutOption.subTypes?.find(
      (sub) => sub.id === workoutSubType,
    )
    return subTypeOption ? subTypeOption.label : workoutOption.label
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <StatsItem value={getWorkoutTypeLabel()} label="Workout type" />
        </div>
        <StatsItem
          value={<p className="capitalize">{repFocus}</p>}
          label="Workout focus"
        />
        <StatsItem value={selectedEquipment.length} label="Equipment" />
        <StatsItem value={exerciseCount} label="Exercises" />
        <StatsItem value={maxSetsPerExercise} label="Sets per exercise" />
      </div>
    </motion.div>
  )
}
