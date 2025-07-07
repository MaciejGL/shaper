import { Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GQLBaseExercise, GQLMuscleGroup } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

export function ExercisesList({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
}: {
  filteredExercises: (Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
    muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  })[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
}) {
  return (
    <div className="pb-10">
      {filteredExercises.length > 0 ? (
        <div className="space-y-2">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className={cn(
                'p-3 flex justify-between border border-border cursor-pointer hover:border-primary/20 rounded-lg transition-colors',
                selectedExercises.includes(exercise.id)
                  ? 'bg-primary/5'
                  : ' bg-card ',
              )}
              onClick={() => {
                if (selectedExercises.includes(exercise.id)) {
                  onExerciseSelect(exercise.id)
                } else {
                  onExerciseSelect(exercise.id)
                }
              }}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm">{exercise.name}</div>
                  <div className="flex items-center gap-2">
                    {selectedExercises.includes(exercise.id) && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                  {exercise.equipment && (
                    <Badge variant="secondary" size="sm">
                      {translateEquipment(exercise.equipment)}
                    </Badge>
                  )}

                  {exercise.muscleGroups.map((group) => (
                    <Badge key={group.id} variant="secondary" size="sm">
                      {group.alias}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No exercises found.
        </div>
      )}
    </div>
  )
}
