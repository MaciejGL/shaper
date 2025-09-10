'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Exercise, ExerciseUpdate } from '@/components/exercises/types'
import { useMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

interface UseExerciseUpdateProps {
  exercise: Exercise
  updateEndpoint: string
  onSilentRefresh?: () => void
}

export function useExerciseUpdate({
  exercise,
  updateEndpoint,
  onSilentRefresh,
}: UseExerciseUpdateProps) {
  const [changes, setChanges] = useState<ExerciseUpdate>({ id: exercise.id })
  const [isSaving, setIsSaving] = useState(false)
  const [localSubstitutes, setLocalSubstitutes] = useState<
    { id: string; name: string; equipment: string }[]
  >(exercise.substitutes || [])

  // Fetch muscle group data for conversions
  const { data: muscleGroupsData } = useMuscleGroupCategoriesQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )

  // Helper function to convert muscle group IDs to objects
  const getMuscleGroupsFromIds = useCallback(
    (muscleGroupIds: string[]) => {
      if (!muscleGroupsData?.muscleGroupCategories) return []

      const allMuscleGroups = muscleGroupsData.muscleGroupCategories.flatMap(
        (category) => category.muscles,
      )

      return muscleGroupIds
        .map((id) => {
          const muscleGroup = allMuscleGroups.find((mg) => mg.id === id)
          return muscleGroup
            ? {
                id: muscleGroup.id,
                name: muscleGroup.name,
                alias: muscleGroup.alias,
                groupSlug: muscleGroup.groupSlug,
              }
            : null
        })
        .filter(Boolean) as {
        id: string
        name: string
        alias: string | null
        groupSlug: string
      }[]
    },
    [muscleGroupsData],
  )

  // Create current exercise state by merging original with changes
  // Transform muscle group IDs to full objects for UI display
  const currentExercise = useMemo(() => {
    const merged = { ...exercise, ...changes }

    // Transform muscle group IDs to full objects if they've been changed
    if (changes.muscleGroupIds) {
      merged.muscleGroups = getMuscleGroupsFromIds(changes.muscleGroupIds)
    }

    if (changes.secondaryMuscleGroupIds) {
      merged.secondaryMuscleGroups = getMuscleGroupsFromIds(
        changes.secondaryMuscleGroupIds,
      )
    }

    return merged
  }, [exercise, changes, getMuscleGroupsFromIds])

  // Update field handler
  const updateField = useCallback(
    (
      field: keyof ExerciseUpdate,
      value:
        | string
        | boolean
        | number
        | string[]
        | { id: string; url: string; order: number }[]
        | null,
    ) => {
      // Only track changes if the value is actually different from original
      const originalValue = exercise[field as keyof Exercise]

      // Deep comparison for arrays and objects
      const isEqual =
        Array.isArray(value) && Array.isArray(originalValue)
          ? JSON.stringify(value) === JSON.stringify(originalValue)
          : value === originalValue

      if (isEqual) {
        // Value hasn't changed, remove from changes if it exists
        setChanges((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: removedField, ...rest } = prev
          return Object.keys(rest).length > 1
            ? (rest as ExerciseUpdate)
            : { id: exercise.id }
        })
      } else {
        // Value has changed, add to changes
        setChanges((prev) => ({ ...prev, [field]: value }))
      }

      // Handle special cases for immediate UI feedback
      if (field === 'substituteIds' && Array.isArray(value)) {
        // Convert substitute IDs to substitute objects for local state
        const substituteDetails = value
          .map((subId) => {
            // We'll need to get this data from a parent component or context
            // For now, we'll just store the IDs and handle display separately
            return { id: subId, name: 'Loading...', equipment: 'Unknown' }
          })
          .filter(Boolean) as { id: string; name: string; equipment: string }[]

        setLocalSubstitutes(substituteDetails)
      }
    },
    [exercise],
  )

  // Handle substitute updates with proper data
  const updateSubstitutes = useCallback(
    (substituteIds: string[], allExercises: Exercise[]) => {
      // Update the field
      updateField('substituteIds', substituteIds)

      // Update local substitutes with proper data
      const substituteDetails = substituteIds
        .map((subId) => {
          const foundEx = allExercises.find((ex) => ex.id === subId)
          return foundEx
            ? {
                id: foundEx.id,
                name: foundEx.name,
                equipment: foundEx.equipment || 'Unknown',
              }
            : null
        })
        .filter(Boolean) as { id: string; name: string; equipment: string }[]

      setLocalSubstitutes(substituteDetails)
    },
    [updateField],
  )

  // Handle muscle group updates
  const updateMuscleGroups = useCallback(
    (
      field: 'muscleGroupIds' | 'secondaryMuscleGroupIds',
      muscleGroupIds: string[],
    ) => {
      updateField(field, muscleGroupIds)
    },
    [updateField],
  )

  // Save changes
  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true)

      // Remove the id field from changes before saving
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...updatesWithoutId } = changes

      // Only send fields that have actually changed (non-empty updatesWithoutId)
      if (Object.keys(updatesWithoutId).length === 0) {
        toast.info('No changes to save')
        return true
      }

      // Handle temp images - convert to proper images format
      let finalPayload = { id: exercise.id, ...updatesWithoutId }
      if (updatesWithoutId.tempImageUrls) {
        const { tempImageUrls, ...restUpdates } = updatesWithoutId
        finalPayload = {
          id: exercise.id,
          ...restUpdates,
          images: tempImageUrls.map((url, index) => ({
            id: `temp-${Date.now()}-${index}`,
            url,
            order: index,
          })),
        }
      }

      const updatePayload = finalPayload

      const response = await fetch(updateEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [updatePayload] }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Save failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          payload: updatePayload,
        })
        throw new Error(
          `Failed to save changes: ${response.status} ${response.statusText}`,
        )
      }

      void (await response.json())

      // Clear changes after successful save (but keep temp images until refresh)
      setChanges({ id: exercise.id })
      toast.success('Exercise saved successfully')

      // Silent background refresh to keep data in sync
      if (onSilentRefresh) {
        onSilentRefresh()
      }

      return true
    } catch (error) {
      console.error('Failed to save exercise:', error)
      toast.error('Failed to save exercise')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [changes, updateEndpoint, exercise.id, onSilentRefresh])

  // Discard changes
  const discardChanges = useCallback(() => {
    setChanges({ id: exercise.id })
    setLocalSubstitutes(exercise.substitutes || [])
    toast.info('Changes discarded')
  }, [exercise.id, exercise.substitutes])

  // Check if there are unsaved changes
  const hasChanges = Object.keys(changes).length > 1 // > 1 because id is always present

  // Sync local substitutes when exercise changes
  useEffect(() => {
    setLocalSubstitutes(exercise.substitutes || [])
  }, [exercise.substitutes])

  // Reset changes when exercise changes (e.g., new exercise loaded)
  useEffect(() => {
    setChanges({ id: exercise.id })
    setLocalSubstitutes(exercise.substitutes || [])
  }, [exercise.id, exercise.substitutes])

  return {
    currentExercise,
    changes,
    hasChanges,
    isSaving,
    localSubstitutes,
    updateField,
    updateSubstitutes,
    updateMuscleGroups,
    saveChanges,
    discardChanges,
    getMuscleGroupsFromIds,
  }
}
