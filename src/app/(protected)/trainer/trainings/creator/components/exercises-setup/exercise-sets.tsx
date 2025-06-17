import { AnimatePresence } from 'framer-motion'
import { InfoIcon, Plus, X } from 'lucide-react'

import { useIsFirstRender } from '@/components/animated-grid'
import { AnimateHeightItem } from '@/components/animations/animated-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { TrainingExercise } from '../types'

type ExerciseSetsProps = {
  sets: TrainingExercise['sets']
  exerciseIndex: number
}

export function ExerciseSets({ sets, exerciseIndex }: ExerciseSetsProps) {
  const isFirstRender = useIsFirstRender()
  const { addSet, removeSet, activeWeek, activeDay, updateSet } =
    useTrainingPlan()
  const onAddSet = () => {
    addSet(activeWeek, activeDay, exerciseIndex, {
      order: sets.length + 1,
    })
  }
  const onRemoveSet = (index: number) => {
    removeSet(activeWeek, activeDay, exerciseIndex, index)
  }
  const onUpdateSet = (index: number, field: string, value?: number) => {
    updateSet(activeWeek, activeDay, exerciseIndex, index, {
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Sets</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddSet()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Set
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <div className="space-y-2">
          {sets.map((set, index) => (
            <AnimateHeightItem
              id={`set-${set.order}`}
              key={set.order}
              className="flex items-center gap-2"
              isFirstRender={isFirstRender}
            >
              <div className="font-medium w-10">{set.order}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  {set.order === 1 && (
                    <Label htmlFor={`reps-${set.order}`} className="text-xs">
                      Reps
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Minimum reps are required. If You don't want to
                            specify range of reps You can leave Max Reps blank.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  )}
                  <div className="flex items-center gap-1">
                    <Input
                      id={`min-reps-${set.order}`}
                      placeholder="Min*"
                      type="number"
                      min="1"
                      value={set.minReps || ''}
                      onChange={(e) =>
                        onUpdateSet(
                          index,
                          'minReps',
                          e.target.value === ''
                            ? undefined
                            : Number.parseInt(e.target.value),
                        )
                      }
                    />
                    -
                    <Input
                      id={`max-reps-${set.order}`}
                      type="number"
                      placeholder="Max"
                      min="1"
                      error={
                        set.minReps && set.maxReps && set.minReps > set.maxReps
                          ? 'Min reps must be less than max reps'
                          : undefined
                      }
                      value={set.maxReps || ''}
                      onChange={(e) =>
                        onUpdateSet(
                          index,
                          'maxReps',
                          e.target.value === ''
                            ? undefined
                            : Number.parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex-1">
                  {set.order === 1 && (
                    <Label htmlFor={`weight-${set.order}`} className="text-xs">
                      Weight
                    </Label>
                  )}
                  <Input
                    id={`weight-${set.order}`}
                    type="number"
                    min="0"
                    step="2.5"
                    value={set.weight ?? ''}
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'weight',
                        e.target.value === ''
                          ? undefined
                          : Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="flex-1">
                  {set.order === 1 && (
                    <Label htmlFor={`rpe-${set.order}`} className="text-xs">
                      RPE
                    </Label>
                  )}
                  <Input
                    id={`rpe-${set.order}`}
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={set.rpe ?? ''}
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'rpe',
                        e.target.value === ''
                          ? undefined
                          : Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                className="self-end"
                onClick={() => onRemoveSet(index)}
                disabled={sets.length <= 1}
                iconOnly={<X />}
              />
            </AnimateHeightItem>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
