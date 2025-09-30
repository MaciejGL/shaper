import { StatCard } from '../stat-card'

import type { SelectedMuscleDetailsProps } from './types'

export function SelectedMuscleDetails({
  selectedMuscle,
  muscleIntensity,
  individualMuscleData,
  rawMuscleData,
}: SelectedMuscleDetailsProps) {
  const muscleData = rawMuscleData?.find((m) => m.muscleId === selectedMuscle)
  const intensity =
    (muscleIntensity as Record<string, number>)[selectedMuscle] || 0
  const sets =
    (individualMuscleData as Record<string, number>)[selectedMuscle] || 0

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-medium">
          {muscleData?.muscleAlias ||
            muscleData?.muscleName ||
            'Unknown Muscle'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Last 30 Days"
          value={sets}
          unit="sets"
          size="sm"
          isOnCard
        />
        <StatCard
          label="Focus Level"
          value={intensity * 100}
          unit="%"
          size="sm"
          isOnCard
        />
      </div>
    </div>
  )
}
