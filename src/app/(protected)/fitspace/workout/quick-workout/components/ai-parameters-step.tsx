'use client'

import { motion } from 'framer-motion'
import { MinusIcon, PlusIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { GQLEquipment } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

import type { AiWorkoutInputData, RepFocus, RpeRange } from './ai-workout-input'

interface AiParametersStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
}

export function AiParametersStep({
  data,
  onDataChange,
  selectedMuscleGroups,
  selectedEquipment,
}: AiParametersStepProps) {
  const updateExerciseCount = (count: number) => {
    const exerciseCount = Math.max(1, Math.min(10, count))
    onDataChange({ ...data, exerciseCount })
  }

  const updateMaxSets = (sets: number) => {
    const maxSetsPerExercise = Math.max(1, Math.min(8, sets))
    onDataChange({ ...data, maxSetsPerExercise })
  }

  const updateRpeRange = (rpeRange: RpeRange) => {
    onDataChange({ ...data, rpeRange })
  }

  const updateRepFocus = (repFocus: RepFocus) => {
    onDataChange({ ...data, repFocus })
  }

  return (
    <div className="space-y-8">
      {/* Parameters Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Workout Intensity</CardTitle>
            <CardDescription>
              Configure how many exercises and sets we should include
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Exercise Count */}
            <div className="space-y-4">
              <Label htmlFor="exercise-count" className="text-sm font-medium">
                Number of Exercises
              </Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => updateExerciseCount(data.exerciseCount - 1)}
                    disabled={data.exerciseCount <= 1}
                    iconOnly={<MinusIcon />}
                  >
                    Decrease
                  </Button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-bold text-primary">
                      {data.exerciseCount}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => updateExerciseCount(data.exerciseCount + 1)}
                    disabled={data.exerciseCount >= 10}
                    iconOnly={<PlusIcon />}
                  >
                    Increase
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div className="font-medium">Recommended</div>
                  <div>4-6 exercises</div>
                </div>
              </div>
            </div>

            {/* Max Sets */}
            <div className="space-y-4">
              <Label htmlFor="max-sets" className="text-sm font-medium">
                Maximum Sets per Exercise
              </Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => updateMaxSets(data.maxSetsPerExercise - 1)}
                    disabled={data.maxSetsPerExercise <= 1}
                    iconOnly={<MinusIcon />}
                  >
                    Decrease
                  </Button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-bold text-primary">
                      {data.maxSetsPerExercise}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => updateMaxSets(data.maxSetsPerExercise + 1)}
                    disabled={data.maxSetsPerExercise >= 8}
                    iconOnly={<PlusIcon />}
                  >
                    Increase
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div className="font-medium">Recommended</div>
                  <div>3-4 sets</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* RPE Range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Workout Intensity (RPE)
            </CardTitle>
            <CardDescription>
              Rate of Perceived Exertion - How challenging should your workout
              feel?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  value: '6-7' as RpeRange,
                  label: 'Moderate',
                  description: 'Sustainable, comfortable pace',
                },
                {
                  value: '7-8' as RpeRange,
                  label: 'Challenging',
                  description: 'Challenging but manageable',
                },
                {
                  value: '8-10' as RpeRange,
                  label: 'Very Challenging',
                  description: 'Near maximum effort',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                    data.rpeRange === option.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="rpeRange"
                    value={option.value}
                    checked={data.rpeRange === option.value}
                    onChange={() => updateRpeRange(option.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            data.rpeRange === option.value
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          } flex items-center justify-center`}
                        >
                          {data.rpeRange === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium">
                          {option.label} ({option.value})
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rep Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Training Focus
            </CardTitle>
            <CardDescription>
              What type of training adaptation are you targeting?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  value: 'strength' as RepFocus,
                  label: 'Strength',
                  description: '3-6 reps - Maximum strength gains',
                },
                {
                  value: 'hypertrophy' as RepFocus,
                  label: 'Hypertrophy',
                  description: '6-12 reps - Muscle growth and size',
                },
                {
                  value: 'endurance' as RepFocus,
                  label: 'Endurance',
                  description: '12-20 reps - Muscular endurance',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                    data.repFocus === option.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="repFocus"
                    value={option.value}
                    checked={data.repFocus === option.value}
                    onChange={() => updateRepFocus(option.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            data.repFocus === option.value
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          } flex items-center justify-center`}
                        >
                          {data.repFocus === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className=""
      >
        <Card className="text-muted-foreground">
          <CardContent>
            <div className="text-md space-y-1 w-full">
              <p>
                <span className="font-semibold text-primary">
                  {data.exerciseCount}
                </span>{' '}
                exercises
              </p>
              <p>
                Up to{' '}
                <span className="font-semibold text-primary">
                  {data.maxSetsPerExercise}
                </span>{' '}
                sets per exercise
              </p>

              <div className="flex flex-col gap-2 w-full">
                <p>Targeting muscle groups: </p>
                {selectedMuscleGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedMuscleGroups.map((muscleGroup) => (
                      <Badge key={muscleGroup} variant="muscle">
                        {muscleGroup}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>No muscle groups selected</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p>Preferred equipment: </p>
                {selectedEquipment.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipment.map((equipment) => (
                      <Badge key={equipment} variant="equipment">
                        {translateEquipment(equipment)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>No equipment selected</p>
                )}
              </div>

              <p>
                Intensity:{' '}
                <span className="font-semibold text-primary">
                  RPE {data.rpeRange}
                </span>
              </p>

              <p>
                Training focus:{' '}
                <span className="font-semibold text-primary capitalize">
                  {data.repFocus}
                </span>{' '}
                ({data.repFocus === 'strength' && '3-6 reps'}
                {data.repFocus === 'hypertrophy' && '6-12 reps'}
                {data.repFocus === 'endurance' && '12-20 reps'})
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
