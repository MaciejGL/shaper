'use client'

import { motion } from 'framer-motion'

import { SelectableMuscleBodyMap } from '@/app/(protected)/fitspace/progress/components/muscle-heatmap/selectable-muscle-body-map'

import type { AiWorkoutInputData } from '../hooks/use-ai-workout-generation'

interface AiMuscleGroupsStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiMuscleGroupsStep({
  data,
  onDataChange,
}: AiMuscleGroupsStepProps) {
  const handleMuscleGroupToggle = (muscle: string) => {
    const selectedMuscleGroups = data.selectedMuscleGroups.includes(muscle)
      ? data.selectedMuscleGroups.filter((g) => g !== muscle)
      : [...data.selectedMuscleGroups, muscle]

    onDataChange({ ...data, selectedMuscleGroups })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <SelectableMuscleBodyMap
        selectedMuscleGroups={data.selectedMuscleGroups}
        onMuscleGroupClick={handleMuscleGroupToggle}
      />
    </motion.div>
  )
}
