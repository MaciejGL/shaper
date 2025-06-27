import { Check, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

type ExerciseSearchProps = {
  trainerExercises?: GQLTrainerExercisesQuery
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedExercise: string | null
  onExerciseSelect: (id: string | null) => void
}

export function ExerciseSearch({
  trainerExercises,
  searchTerm,
  onSearchChange,
  selectedExercise,
  onExerciseSelect,
}: ExerciseSearchProps) {
  const filteredExercises = [
    ...(trainerExercises?.userExercises || []),
    ...(trainerExercises?.publicExercises || []),
  ].filter((ex) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      ex.name.toLowerCase().includes(searchTermLower) ||
      ex.muscleGroups.some((group) =>
        group.alias?.toLowerCase().includes(searchTermLower),
      ) ||
      ex.equipment?.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="exercise-search"
          iconStart={<Search />}
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto border rounded-md">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`p-2 flex justify-between cursor-pointer hover:bg-accent ${
                selectedExercise === exercise.id ? 'bg-accent' : ''
              }`}
              onClick={() => {
                if (selectedExercise === exercise.id) {
                  onExerciseSelect(null)
                } else {
                  onExerciseSelect(exercise.id)
                }
              }}
            >
              <div>
                <div className="flex items-center">
                  <div className="font-medium">{exercise.name} </div>
                  <Badge size="sm" variant="outline" className="ml-2">
                    {exercise.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {exercise.equipment} •{' '}
                  {exercise.muscleGroups.map((group) => group.alias).join(', ')}
                </div>
              </div>
              {selectedExercise === exercise.id && (
                <Button
                  size="xs"
                  iconOnly={<Check />}
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                />
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No exercises found. Create a custom one below.
          </div>
        )}
      </div>
    </div>
  )
}
