import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { TrainingExercise } from '../types'

type ExerciseSetsProps = {
  sets: TrainingExercise['sets']
  onAddSet: () => void
  onRemoveSet: (index: number) => void
  onUpdateSet: (index: number, field: 'reps' | 'weight', value: number) => void
}

export function ExerciseSets({
  sets,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: ExerciseSetsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Sets</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddSet}>
          <Plus className="h-4 w-4 mr-1" /> Add Set
        </Button>
      </div>

      <div className="space-y-2">
        {sets.map((set, index) => (
          <div key={set.order} className="flex items-center gap-2">
            <div className="font-medium w-16">Set {set.order}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor={`reps-${set.order}`} className="text-xs">
                  Reps
                </Label>
                <Input
                  id={`reps-${set.order}`}
                  type="number"
                  min="1"
                  value={set.reps}
                  onChange={(e) =>
                    onUpdateSet(index, 'reps', Number.parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`weight-${set.order}`} className="text-xs">
                  Weight
                </Label>
                <Input
                  id={`weight-${set.order}`}
                  type="number"
                  min="0"
                  step="2.5"
                  value={set.weight || 0}
                  onChange={(e) =>
                    onUpdateSet(
                      index,
                      'weight',
                      Number.parseFloat(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              onClick={() => onRemoveSet(index)}
              disabled={sets.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
