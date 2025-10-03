'use client'

import { motion } from 'framer-motion'

import { StatsItem } from '@/components/stats-item'
import { GQLEquipment } from '@/generated/graphql-client'

import type { RepFocus, RpeRange } from '../../hooks/use-ai-workout-generation'

interface WorkoutSummaryProps {
  exerciseCount: number
  maxSetsPerExercise: number
  rpeRange: RpeRange
  repFocus: RepFocus
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  className?: string
}

export function WorkoutSummary({
  exerciseCount,
  maxSetsPerExercise,
  rpeRange,
  repFocus,
  selectedMuscleGroups,
  selectedEquipment,
  className,
}: WorkoutSummaryProps) {
  const rpeRangeText = () => {
    switch (rpeRange) {
      case '6-7':
        return 'Moderate'
      case '7-8':
        return 'Challenging'
      case '8-10':
        return 'No Pain, No Gain'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <div className="grid grid-cols-2 gap-2">
        <StatsItem value={rpeRangeText()} label="Intensity" />
        <StatsItem
          value={<p className="capitalize">{repFocus}</p>}
          label="Workout focus"
        />
        <StatsItem value={exerciseCount} label="Exercises" />
        <StatsItem value={maxSetsPerExercise} label="Sets per exercise" />
        <StatsItem value={selectedMuscleGroups.length} label="Muscle groups" />
        <StatsItem value={selectedEquipment.length} label="Equipment" />
      </div>
    </motion.div>
  )
}
