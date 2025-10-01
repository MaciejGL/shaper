import { StatCard } from '../stat-card'

import type { SelectedMuscleDetailsProps } from './types'

export function SelectedMuscleDetails({
  selectedMuscle,
  muscleIntensity,
  individualMuscleData,
  rawMuscleData,
  groupedMuscleData,
}: SelectedMuscleDetailsProps) {
  // selectedMuscle is now a muscle group name (e.g., "Shoulders")
  const groupData = groupedMuscleData?.[selectedMuscle]
  const intensity = muscleIntensity[selectedMuscle] || 0
  const sets = groupData?.totalSets || 0

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-medium">
          {selectedMuscle || 'Unknown Muscle Group'}
        </h3>
        {groupData && groupData.muscles.length > 1 && (
          <p className="text-sm text-muted-foreground">
            {groupData.muscles.length} muscles:{' '}
            {groupData.muscles.map((m) => m.muscleAlias).join(', ')}
          </p>
        )}
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
