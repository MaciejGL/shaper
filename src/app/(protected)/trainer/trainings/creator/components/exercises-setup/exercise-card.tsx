import { Edit, GaugeIcon, TimerIcon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { VideoPreview } from '@/components/video-preview'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLExerciseType } from '@/generated/graphql-server'
import { formatTempoInput, handleTempoKeyDown } from '@/lib/format-tempo'

import type { TrainingExercise } from '../types'

import { ExerciseSets } from './exercise-sets'

type ExerciseCardProps = {
  exercise: TrainingExercise
  exerciseIndex: number
  onEdit: (index: number) => void
}

const EXERCISE_TYPES = {
  [GQLExerciseType.Superset_1A]: 'Superset 1A',
  [GQLExerciseType.Superset_1B]: 'Superset 1B',
  [GQLExerciseType.Dropset]: 'Dropset',
  [GQLExerciseType.Cardio]: 'Cardio',
}

export function ExerciseCard({
  exercise,
  onEdit,
  exerciseIndex,
}: ExerciseCardProps) {
  const { removeExercise, activeWeek, activeDay, updateExercise } =
    useTrainingPlan()

  return (
    <Card className="gap-2 bg-card-on-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">
            {exercise.order}. {exercise.name}
          </CardTitle>
          <div className="flex gap-1">
            {exercise.videoUrl && <VideoPreview url={exercise.videoUrl} />}
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => {
                onEdit(exerciseIndex)
              }}
              iconOnly={<Edit />}
            />
            <Button
              variant="ghost"
              size="icon-md"
              onClick={() => {
                removeExercise(activeWeek, activeDay, exerciseIndex)
              }}
              iconOnly={<Trash2 />}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="exerciseType">Exercise type</Label>
            <Select
              value={exercise.type ?? ''}
              onValueChange={(value) =>
                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  type: value === 'none' ? null : (value as GQLExerciseType),
                })
              }
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No variation</SelectItem>
                {Object.entries(EXERCISE_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="restSeconds"
              label="Rest (s)"
              type="number"
              size="md"
              value={exercise.restSeconds ?? ''}
              min="0"
              step="15"
              onChange={(e) =>
                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  restSeconds:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className="min-w-28 max-w-min"
              iconStart={<TimerIcon />}
            />
          )}

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="warmup"
              label="Warmup sets"
              size="md"
              type="number"
              min="0"
              step="1"
              value={exercise.warmupSets ?? ''}
              onChange={(e) => {
                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  warmupSets:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}

          {exercise.type !== GQLExerciseType.Cardio && (
            <Input
              id="tempo"
              label="Tempo"
              size="md"
              pattern="[0-9]*"
              placeholder="3-2-3"
              value={exercise.tempo ?? ''}
              onChange={(e) => {
                const formattedValue = formatTempoInput(e)

                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  tempo: formattedValue,
                })
              }}
              onKeyDown={handleTempoKeyDown}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}
        </div>
        <div className="w-full grid grid-cols-1 @4xl/section:grid-cols-[1fr_400px] gap-4">
          {exercise.type !== GQLExerciseType.Cardio && (
            <ExerciseSets sets={exercise.sets} exerciseIndex={exerciseIndex} />
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="instructions" className="flex flex-col items-start">
              <p>Instructions</p>
              <p className="text-xs text-muted-foreground">
                Visible in instructions tab
              </p>
            </Label>
            <Textarea
              id="instructions"
              className="text-sm text-foreground bg-muted p-2 rounded-md h-full min-h-24"
              value={exercise.instructions ?? ''}
              onChange={(e) =>
                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  instructions: e.target.value,
                })
              }
            />

            <Label
              htmlFor="additionalInstructions"
              className="flex flex-col items-start mt-2"
            >
              <p>Additional Instructions</p>
              <p className="text-xs text-muted-foreground">
                Visible directly in the exercise card
              </p>
            </Label>
            <Textarea
              id="additionalInstructions"
              className="text-sm text-foreground bg-muted p-2 rounded-md h-full min-h-12"
              value={exercise.additionalInstructions ?? ''}
              onChange={(e) =>
                updateExercise(activeWeek, activeDay, exerciseIndex, {
                  ...exercise,
                  additionalInstructions: e.target.value,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
