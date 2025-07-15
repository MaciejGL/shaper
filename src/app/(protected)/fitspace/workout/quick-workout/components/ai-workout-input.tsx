'use client'

import { motion } from 'framer-motion'
import { MinusIcon, PlusIcon, SparklesIcon } from 'lucide-react'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment, GQLMuscleGroup } from '@/generated/graphql-client'

import { EquipmentFilters } from '../../[trainingId]/components/equipment-filters'

export interface AiWorkoutInputData {
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  exerciseCount: number
  maxSetsPerExercise: number
}

interface AiWorkoutInputProps {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiWorkoutInput({
  muscleGroups,
  data,
  onDataChange,
}: AiWorkoutInputProps) {
  const allEquipment = EQUIPMENT_OPTIONS.map((equipment) => equipment.value)

  const handleMuscleGroupToggle = (alias: string) => {
    const selectedMuscleGroups = data.selectedMuscleGroups.includes(alias)
      ? data.selectedMuscleGroups.filter((g) => g !== alias)
      : [...data.selectedMuscleGroups, alias]

    onDataChange({ ...data, selectedMuscleGroups })
  }

  const handleEquipmentToggle = (equipment: GQLEquipment) => {
    const selectedEquipment = data.selectedEquipment.includes(equipment)
      ? data.selectedEquipment.filter((e) => e !== equipment)
      : [...data.selectedEquipment, equipment]

    onDataChange({ ...data, selectedEquipment })
  }

  const updateExerciseCount = (count: number) => {
    const exerciseCount = Math.max(1, Math.min(10, count))
    onDataChange({ ...data, exerciseCount })
  }

  const updateMaxSets = (sets: number) => {
    const maxSetsPerExercise = Math.max(1, Math.min(8, sets))
    onDataChange({ ...data, maxSetsPerExercise })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-amber-500" />
          <p className="text-lg font-medium">
            Let AI design your perfect workout
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us your preferences and we'll create a personalized workout plan
        </p>
      </motion.div>

      {/* Muscle Groups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Target Muscle Groups</CardTitle>
            <CardDescription>
              Select the muscles you want to focus on
              {data.selectedMuscleGroups.length > 0 && (
                <span className="ml-1">
                  ({data.selectedMuscleGroups.length} selected)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedBodyView
              selectedMuscleGroups={data.selectedMuscleGroups}
              onMuscleGroupClick={handleMuscleGroupToggle}
              muscleGroups={muscleGroups}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Equipment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Available Equipment</CardTitle>
            <CardDescription>
              Select the equipment you have access to
              {data.selectedEquipment.length > 0 && (
                <span className="ml-1">
                  ({data.selectedEquipment.length} selected)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EquipmentFilters
              selectedEquipment={data.selectedEquipment}
              onEquipmentToggle={handleEquipmentToggle}
              equipment={allEquipment}
              variant="cards"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Workout Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Workout Intensity</CardTitle>
            <CardDescription>Customize your workout structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exercise Count */}
            <div className="space-y-3">
              <Label htmlFor="exercise-count" className="text-sm font-medium">
                Number of Exercises
              </Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateExerciseCount(data.exerciseCount - 1)}
                    disabled={data.exerciseCount <= 1}
                    iconOnly={<MinusIcon />}
                  >
                    Decrease
                  </Button>
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold">
                      {data.exerciseCount}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateExerciseCount(data.exerciseCount + 1)}
                    disabled={data.exerciseCount >= 10}
                    iconOnly={<PlusIcon />}
                  >
                    Increase
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Recommended: 4-6
                </div>
              </div>
            </div>

            {/* Max Sets */}
            <div className="space-y-3">
              <Label htmlFor="max-sets" className="text-sm font-medium">
                Maximum Sets per Exercise
              </Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateMaxSets(data.maxSetsPerExercise - 1)}
                    disabled={data.maxSetsPerExercise <= 1}
                    iconOnly={<MinusIcon />}
                  >
                    Decrease
                  </Button>
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold">
                      {data.maxSetsPerExercise}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateMaxSets(data.maxSetsPerExercise + 1)}
                    disabled={data.maxSetsPerExercise >= 8}
                    iconOnly={<PlusIcon />}
                  >
                    Increase
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Recommended: 3-4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800"
      >
        <div className="text-center space-y-2">
          <h4 className="font-medium text-amber-800 dark:text-amber-200">
            AI will generate:
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>{data.exerciseCount}</strong> exercises
            {data.selectedMuscleGroups.length > 0 && (
              <>
                {' '}
                targeting{' '}
                <strong>{data.selectedMuscleGroups.join(', ')}</strong>
              </>
            )}
            {data.selectedEquipment.length > 0 && (
              <>, using your selected equipment</>
            )}
            , with up to <strong>{data.maxSetsPerExercise}</strong> sets each
          </p>
        </div>
      </motion.div>
    </div>
  )
}
