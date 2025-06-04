import { Edit, GaugeIcon, TimerIcon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { VideoPreview } from '@/components/video-preview'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { formatTempoInput, handleTempoKeyDown } from '@/lib/format-tempo'

import type { TrainingExercise } from '../types'

import { ExerciseSets } from './exercise-sets'

type ExerciseCardProps = {
  exercise: TrainingExercise
  exerciseIndex: number
  onEdit: (index: number) => void
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Input
            id="restSeconds"
            label="Rest (s)"
            type="number"
            size="sm"
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

          <Input
            id="warmup"
            label="Warmup sets"
            size="sm"
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

          <Input
            id="tempo"
            label="Tempo"
            size="sm"
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
        </div>
        <div className="w-full grid grid-cols-1 @4xl/section:grid-cols-[1fr_300px] gap-4">
          <ExerciseSets sets={exercise.sets} exerciseIndex={exerciseIndex} />

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
          >
            {exercise.instructions}
          </Textarea>
        </div>
      </CardContent>
    </Card>
  )
}
