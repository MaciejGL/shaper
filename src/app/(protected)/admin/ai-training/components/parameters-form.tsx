import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GQLEquipment } from '@/generated/graphql-client'
import type { RepFocus, WorkoutInput } from '@/lib/ai-training/types'

interface ParametersFormProps {
  input: WorkoutInput
  onChange: (input: WorkoutInput) => void
}

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Lower Back',
]

const EQUIPMENT = [
  { label: 'Barbell', value: GQLEquipment.Barbell },
  { label: 'Dumbbell', value: GQLEquipment.Dumbbell },
  { label: 'Kettlebell', value: GQLEquipment.Kettlebell },
  { label: 'Cable', value: GQLEquipment.Cable },
  { label: 'Machine', value: GQLEquipment.Machine },
  { label: 'Bodyweight', value: GQLEquipment.Bodyweight },
  { label: 'Band', value: GQLEquipment.Band },
  { label: 'EZ Bar', value: GQLEquipment.EzBar },
  { label: 'Smith Machine', value: GQLEquipment.SmithMachine },
  { label: 'Trap Bar', value: GQLEquipment.TrapBar },
  { label: 'Bench', value: GQLEquipment.Bench },
]

export function ParametersForm({ input, onChange }: ParametersFormProps) {
  const toggleMuscleGroup = (group: string) => {
    const updated = input.selectedMuscleGroups.includes(group)
      ? input.selectedMuscleGroups.filter((g) => g !== group)
      : [...input.selectedMuscleGroups, group]
    onChange({ ...input, selectedMuscleGroups: updated })
  }

  const toggleEquipment = (equipment: GQLEquipment) => {
    const updated = input.selectedEquipment.includes(equipment)
      ? input.selectedEquipment.filter((e) => e !== equipment)
      : [...input.selectedEquipment, equipment]
    onChange({ ...input, selectedEquipment: updated })
  }

  return (
    <div className="space-y-4">
      {/* Muscle Groups */}
      <div>
        <Label>Muscle Groups (optional)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => toggleMuscleGroup(group)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                input.selectedMuscleGroups.includes(group)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <Label>Equipment (optional)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {EQUIPMENT.map((equip) => (
            <button
              key={equip.value}
              type="button"
              onClick={() => toggleEquipment(equip.value)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                input.selectedEquipment.includes(equip.value)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {equip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Count */}
      <div>
        <Label htmlFor="exerciseCount">Exercise Count</Label>
        <Select
          value={input.exerciseCount.toString()}
          onValueChange={(value) =>
            onChange({ ...input, exerciseCount: parseInt(value) })
          }
        >
          <SelectTrigger id="exerciseCount">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[3, 4, 5, 6, 7, 8].map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count} exercises
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max Sets */}
      <div>
        <Label htmlFor="maxSets">Max Sets Per Exercise</Label>
        <Select
          value={input.maxSetsPerExercise.toString()}
          onValueChange={(value) =>
            onChange({ ...input, maxSetsPerExercise: parseInt(value) })
          }
        >
          <SelectTrigger id="maxSets">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5].map((sets) => (
              <SelectItem key={sets} value={sets.toString()}>
                {sets} sets
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rep Focus */}
      <div>
        <Label htmlFor="repFocus">Training Focus</Label>
        <Select
          value={input.repFocus}
          onValueChange={(value) =>
            onChange({ ...input, repFocus: value as RepFocus })
          }
        >
          <SelectTrigger id="repFocus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STRENGTH">Strength (3-6 reps)</SelectItem>
            <SelectItem value="HYPERTROPHY">Hypertrophy (8-15 reps)</SelectItem>
            <SelectItem value="ENDURANCE">Endurance (15-20 reps)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
