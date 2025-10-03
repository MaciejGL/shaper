'use client'

import { motion } from 'framer-motion'

import { LazyEnhancedBodyView as EnhancedBodyView } from '@/components/human-body/lazy-enhanced-body-view'
import { GQLMuscleGroup } from '@/generated/graphql-client'

import type { AiWorkoutInputData } from '../hooks/use-ai-workout-generation'

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
  )
}
