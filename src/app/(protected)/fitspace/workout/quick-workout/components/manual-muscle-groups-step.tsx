'use client'

import { motion } from 'framer-motion'

import { SelectableMuscleBodyMap } from '@/app/(protected)/fitspace/progress/components/muscle-heatmap/selectable-muscle-body-map'

interface ManualMuscleGroupsStepProps {
  selectedMuscleGroups: string[]
  onMuscleGroupToggle: (alias: string) => void
}

export function ManualMuscleGroupsStep({
  selectedMuscleGroups,
  onMuscleGroupToggle,
}: ManualMuscleGroupsStepProps) {
  return (
    <div className="space-y-6">
      {/* Body view */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SelectableMuscleBodyMap
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupClick={onMuscleGroupToggle}
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg mb-4"
      >
        {selectedMuscleGroups.length === 0 ? (
          <>
            Select the muscle groups you want to target, or skip this step to
            see all available exercises.
          </>
        ) : (
          <>
            {selectedMuscleGroups.length} muscle group
            {selectedMuscleGroups.length !== 1 ? 's' : ''} selected. Continue to
            choose your equipment.
          </>
        )}
      </motion.div>
    </div>
  )
}
