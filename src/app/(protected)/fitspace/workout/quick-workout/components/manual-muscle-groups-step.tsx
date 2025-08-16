'use client'

import { motion } from 'framer-motion'

import { LazyEnhancedBodyView as EnhancedBodyView } from '@/components/human-body/lazy-enhanced-body-view'
import { GQLMuscleGroup } from '@/generated/graphql-client'

interface ManualMuscleGroupsStepProps {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
  selectedMuscleGroups: string[]
  onMuscleGroupToggle: (alias: string) => void
}

export function ManualMuscleGroupsStep({
  muscleGroups,
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
        <EnhancedBodyView
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupClick={onMuscleGroupToggle}
          muscleGroups={muscleGroups}
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
