import { Check, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type BaseExercise = {
  id: string
  name: string
  equipment: string
  muscleGroups: string[]
}
const mockBaseExercises: BaseExercise[] = [
  {
    id: 'ex1',
    name: 'Barbell Bench Press',
    equipment: 'BARBELL',
    muscleGroups: ['Chest', 'Triceps'],
  },
  {
    id: 'ex2',
    name: 'Barbell Squat',
    equipment: 'BARBELL',
    muscleGroups: ['Quadriceps', 'Glutes'],
  },
  {
    id: 'ex3',
    name: 'Deadlift',
    equipment: 'BARBELL',
    muscleGroups: ['Back', 'Hamstrings'],
  },
  {
    id: 'ex4',
    name: 'Pull-up',
    equipment: 'BODYWEIGHT',
    muscleGroups: ['Back', 'Biceps'],
  },
  {
    id: 'ex5',
    name: 'Dumbbell Shoulder Press',
    equipment: 'DUMBBELL',
    muscleGroups: ['Shoulders', 'Triceps'],
  },
]

type ExerciseSearchProps = {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedExercise: string | null
  onExerciseSelect: (id: string | null) => void
}

export function ExerciseSearch({
  searchTerm,
  onSearchChange,
  selectedExercise,
  onExerciseSelect,
}: ExerciseSearchProps) {
  const filteredExercises = mockBaseExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="exercise-search"
          iconStart={<Search />}
          placeholder="Search exercises..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="max-h-[200px] overflow-y-auto border rounded-md">
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
                <div className="font-medium">{exercise.name}</div>
                <div className="text-xs text-muted-foreground">
                  {exercise.equipment} • {exercise.muscleGroups.join(', ')}
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
