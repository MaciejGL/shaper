'use client'

import { Edit, X } from 'lucide-react'
import { Suspense, useCallback, useState } from 'react'
import React from 'react'

import { MuscleGroupSelector } from '@/app/(protected)/trainer/exercises/components/muscle-group-selector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { useMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '../ui/drawer'
import { Label } from '../ui/label'

import { Exercise, ExerciseUpdate } from './types'

// Simple substitute exercise selector component
interface SubstituteExerciseSelectorProps {
  exercisesData: {
    userExercises: {
      id: string
      name: string
      equipment: string
      muscleGroups: { id: string }[]
    }[]
    publicExercises: {
      id: string
      name: string
      equipment: string
      muscleGroups: { id: string }[]
    }[]
  }
  currentExercise: Exercise
  selectedSubstituteIds: string[]
  onSubstitutesChange: (ids: string[]) => void
}

function SubstituteExerciseSelector({
  exercisesData,
  currentExercise,
  selectedSubstituteIds,
  onSubstitutesChange,
}: SubstituteExerciseSelectorProps) {
  const allExercises = [
    ...(exercisesData?.userExercises || []),
    ...(exercisesData?.publicExercises || []),
  ]

  // Filter exercises to show relevant alternatives (same muscle groups, different exercise)
  const relevantExercises = allExercises
    .filter((ex) => ex.id !== currentExercise.id)
    .filter((ex) => {
      const currentMuscleIds =
        currentExercise.muscleGroups?.map((mg) => mg.id) || []
      const exerciseMuscleIds = ex.muscleGroups?.map((mg) => mg.id) || []
      return exerciseMuscleIds.some((id) => currentMuscleIds.includes(id))
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleToggleSubstitute = (exerciseId: string) => {
    if (selectedSubstituteIds.includes(exerciseId)) {
      onSubstitutesChange(
        selectedSubstituteIds.filter((id) => id !== exerciseId),
      )
    } else {
      onSubstitutesChange([...selectedSubstituteIds, exerciseId])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing exercises that target similar muscle groups
      </div>
      <div className="overflow-y-auto space-y-2">
        {relevantExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-card-on-card"
          >
            <div className="flex-1">
              <div className="flex flex-col items-start gap-2">
                <span className="font-medium">{exercise.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {exercise.equipment || 'Unknown'}
                </Badge>
              </div>
            </div>
            <Button
              variant={
                selectedSubstituteIds.includes(exercise.id)
                  ? 'default'
                  : 'secondary'
              }
              size="sm"
              onClick={() => handleToggleSubstitute(exercise.id)}
            >
              {selectedSubstituteIds.includes(exercise.id) ? 'Remove' : 'Add'}
            </Button>
          </div>
        ))}
        {relevantExercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No alternative exercises found with similar muscle groups</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ExerciseSettingsSectionProps {
  exercise: Exercise
  currentExercise: Exercise
  localSubstitutes: { id: string; name: string; equipment: string }[]
  allExercises: Exercise[]
  onUpdate: (
    field: keyof ExerciseUpdate,
    value:
      | string
      | boolean
      | number
      | string[]
      | { id: string; url: string; order: number }[]
      | null,
  ) => void
  onUpdateSubstitutes: (
    substituteIds: string[],
    allExercises: Exercise[],
  ) => void
  onUpdateMuscleGroups: (
    field: 'muscleGroupIds' | 'secondaryMuscleGroupIds',
    muscleGroupIds: string[],
  ) => void
}

export function ExerciseSettingsSection({
  exercise,
  currentExercise,
  localSubstitutes,
  allExercises,
  onUpdate,
  onUpdateSubstitutes,
  onUpdateMuscleGroups,
}: ExerciseSettingsSectionProps) {
  const [isEditingMuscles, setIsEditingMuscles] = useState(false)
  const [isEditingSubstitutes, setIsEditingSubstitutes] = useState(false)

  // GraphQL queries for muscle groups (still needed for muscle group selector)
  const { data: muscleGroupCategories } = useMuscleGroupCategoriesQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )

  // Update handlers - simplified with hook
  const handleFieldUpdate = useCallback(
    (
      field: keyof ExerciseUpdate,
      value: string | boolean | number | string[],
    ) => {
      onUpdate(field, value)
    },
    [onUpdate],
  )

  // Handle substitute management
  const handleRemoveSubstitute = useCallback(
    (substituteId: string) => {
      const updatedSubstituteIds = localSubstitutes
        .filter((s) => s.id !== substituteId)
        .map((s) => s.id)

      onUpdateSubstitutes(updatedSubstituteIds, allExercises)
    },
    [localSubstitutes, allExercises, onUpdateSubstitutes],
  )

  const handleSubstitutesChange = useCallback(
    (substituteIds: string[]) => {
      onUpdateSubstitutes(substituteIds, allExercises)
    },
    [allExercises, onUpdateSubstitutes],
  )

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4">
        <Label
          htmlFor={`isPublic-${currentExercise.id}`}
          className="p-2 bg-muted rounded-md flex items-center justify-between"
        >
          Public
          <Switch
            id={`isPublic-${currentExercise.id}`}
            checked={currentExercise.isPublic}
            onCheckedChange={(checked) =>
              handleFieldUpdate('isPublic', checked)
            }
          />
        </Label>

        <Label
          htmlFor={`isPremium-${currentExercise.id}`}
          className="p-2 bg-muted rounded-md flex items-center justify-between"
        >
          Premium
          <Switch
            id={`isPremium-${currentExercise.id}`}
            checked={currentExercise.isPremium}
            onCheckedChange={(checked) =>
              handleFieldUpdate('isPremium', checked)
            }
          />
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Equipment */}
        <div className="space-y-2">
          <Label>Equipment</Label>
          <Select
            value={currentExercise.equipment}
            onValueChange={(value) => handleFieldUpdate('equipment', value)}
          >
            <SelectTrigger variant="tertiary" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <SelectItem key={equipment.value} value={equipment.value}>
                  {equipment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Version */}
        <div className="space-y-2">
          <Label>Version</Label>
          <Select
            value={currentExercise.version.toString()}
            onValueChange={(value) =>
              handleFieldUpdate('version', parseInt(value))
            }
          >
            <SelectTrigger variant="tertiary" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Version 1</SelectItem>
              <SelectItem value="2">Version 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Muscle Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Muscle Groups</Label>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsEditingMuscles(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Muscles
          </Button>
        </div>
        <div className="p-3 border border-dashed rounded-md bg-muted/30">
          <div className="space-y-2">
            <Label>Primary</Label>
            <div className="flex flex-wrap gap-2">
              {currentExercise.muscleGroups &&
              currentExercise.muscleGroups.length > 0 ? (
                currentExercise.muscleGroups.map((muscle) => (
                  <Badge key={muscle.id} variant="secondary">
                    {muscle.alias || muscle.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No muscle groups assigned
                </span>
              )}
            </div>
            <Label>Secondary</Label>
            <div className="flex flex-wrap gap-2">
              {currentExercise.secondaryMuscleGroups &&
              currentExercise.secondaryMuscleGroups.length > 0 ? (
                currentExercise.secondaryMuscleGroups.map((muscle) => (
                  <Badge key={muscle.id} variant="secondary">
                    {muscle.alias || muscle.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No muscle groups assigned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Substitute Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Substitute Exercises</Label>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsEditingSubstitutes(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Substitutes
          </Button>
        </div>
        <div className="p-3 border border-dashed rounded-md bg-muted/30">
          {localSubstitutes && localSubstitutes.length > 0 ? (
            <div className="space-y-2">
              {localSubstitutes.map((substitute) => (
                <div
                  key={substitute.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{substitute.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {substitute.equipment}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubstitute(substitute.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No substitute exercises added yet
            </span>
          )}
        </div>
      </div>

      {/* Muscle Groups Edit Dialog */}
      <Drawer
        direction="right"
        open={isEditingMuscles}
        onOpenChange={setIsEditingMuscles}
      >
        <DrawerContent
          className="data-[vaul-drawer-direction=right]:sm:max-w-2xl"
          dialogTitle="Edit Muscle Groups"
        >
          <DrawerTitle>Edit Muscle Groups</DrawerTitle>
          <DrawerDescription>
            Select primary and secondary muscle groups for this exercise
          </DrawerDescription>
          <Suspense fallback={<div>Loading muscle selector...</div>}>
            <MuscleGroupSelector
              categories={muscleGroupCategories?.muscleGroupCategories}
              selectedPrimaryMuscleGroups={
                currentExercise.muscleGroups?.map((mg) => ({ id: mg.id })) || []
              }
              selectedSecondaryMuscleGroups={
                currentExercise.secondaryMuscleGroups?.map((mg) => ({
                  id: mg.id,
                })) || []
              }
              onPrimaryMuscleGroupsChange={(muscleGroups) => {
                onUpdateMuscleGroups(
                  'muscleGroupIds',
                  muscleGroups.map((mg) => mg.id),
                )
              }}
              onSecondaryMuscleGroupsChange={(muscleGroups) => {
                onUpdateMuscleGroups(
                  'secondaryMuscleGroupIds',
                  muscleGroups.map((mg) => mg.id),
                )
              }}
            />
          </Suspense>
        </DrawerContent>
      </Drawer>

      {/* Substitute Exercises Edit Dialog */}
      <Drawer
        direction="right"
        open={isEditingSubstitutes}
        onOpenChange={setIsEditingSubstitutes}
      >
        <DrawerContent
          className="p-4 overflow-y-auto"
          dialogTitle="Edit Substitute Exercises"
        >
          <DrawerTitle>Edit Substitute Exercises</DrawerTitle>
          <DrawerDescription>
            Select exercises that can be used as alternatives to this exercise
          </DrawerDescription>
          <SubstituteExerciseSelector
            exercisesData={{
              userExercises: allExercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                equipment: ex.equipment || 'Unknown',
                muscleGroups: ex.muscleGroups || [],
              })),
              publicExercises: [],
            }}
            currentExercise={exercise}
            selectedSubstituteIds={localSubstitutes.map((s) => s.id)}
            onSubstitutesChange={handleSubstitutesChange}
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
