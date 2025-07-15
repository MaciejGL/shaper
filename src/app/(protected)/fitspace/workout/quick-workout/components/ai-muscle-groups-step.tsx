'use client'

import { motion } from 'framer-motion'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { GQLMuscleGroup } from '@/generated/graphql-client'

import type { AiWorkoutInputData } from './ai-workout-input'

interface AiMuscleGroupsStepProps {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiMuscleGroupsStep({
  muscleGroups,
  data,
  onDataChange,
}: AiMuscleGroupsStepProps) {
  const handleMuscleGroupToggle = (alias: string) => {
    const selectedMuscleGroups = data.selectedMuscleGroups.includes(alias)
      ? data.selectedMuscleGroups.filter((g) => g !== alias)
      : [...data.selectedMuscleGroups, alias]

    onDataChange({ ...data, selectedMuscleGroups })
  }

  return (
    <div className="space-y-6">
      {/* Body view */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <EnhancedBodyView
          selectedMuscleGroups={data.selectedMuscleGroups}
          onMuscleGroupClick={handleMuscleGroupToggle}
          muscleGroups={muscleGroups}
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg"
      >
        Select the muscle groups you want to focus on. We will choose exercises
        that target these areas.
        {data.selectedMuscleGroups.length === 0 && (
          <div className="mt-2 text-xs opacity-80">
            You can also skip this step to let us choose the best full-body
            workout for you.
          </div>
        )}
      </motion.div>
    </div>
  )
}
