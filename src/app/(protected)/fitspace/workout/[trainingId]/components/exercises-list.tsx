import { Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GQLBaseExercise, GQLMuscleGroup } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

export function ExercisesList({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
}: {
  filteredExercises: (Pick<
    GQLBaseExercise,
    'id' | 'name' | 'equipment' | 'isPublic'
  > & {
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
              className={`p-3 flex justify-between cursor-pointer hover:bg-accent/50 shadow-neuro-light dark:shadow-neuro-dark rounded-md transition-colors ${
                selectedExercises.includes(exercise.id)
                  ? 'bg-muted/50'
                  : ' bg-muted/50'
              }`}
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
                    <Badge size="sm" variant="outline">
                      {exercise.isPublic ? 'Public' : 'Trainer'}
                    </Badge>
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
