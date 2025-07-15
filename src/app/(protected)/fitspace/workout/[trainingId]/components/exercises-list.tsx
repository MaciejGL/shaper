import { Input } from '@/components/ui/input'

import {
  type Exercise,
  ExerciseCard,
} from '../../quick-workout/components/exercise-card'

export function ExercisesList({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
  onSearch,
  searchTerm,
}: {
  filteredExercises: Exercise[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
  onSearch: (searchTerm: string) => void
  searchTerm: string
}) {
  return (
    <div className="pb-10">
      <Input
        id="search-exercises"
        placeholder="Search exercises"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="mb-4"
      />
      {filteredExercises.length > 0 ? (
        <div className="space-y-3">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              selectedExercises={selectedExercises}
              onExerciseSelect={onExerciseSelect}
            />
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
