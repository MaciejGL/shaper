'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/context/user-context'
import {
  GQLFavouriteWorkout,
  useFitspaceGetExercisesQuery,
} from '@/generated/graphql-client'
import {
  FavouriteWorkoutWizardData,
  useFavouriteWorkoutOperations,
  useUpdateFavouriteFromWizard,
} from '@/hooks/use-favourite-workouts'
import { cn } from '@/lib/utils'

import { AiEquipmentStep } from '../../../workout/quick-workout/components/ai-equipment-step'
import { AiMuscleGroupsStep } from '../../../workout/quick-workout/components/ai-muscle-groups-step'
import { AiParametersStep } from '../../../workout/quick-workout/components/ai-parameters-step'
import { AiResultsStep } from '../../../workout/quick-workout/components/ai-results-step'
import { ManualEquipmentStep } from '../../../workout/quick-workout/components/manual-equipment-step'
import { ManualExercisesStep } from '../../../workout/quick-workout/components/manual-exercises-step'
// Import step components
import { ManualMuscleGroupsStep } from '../../../workout/quick-workout/components/manual-muscle-groups-step'
import { ManualReviewStep } from '../../../workout/quick-workout/components/manual-review-step'
import {
  QuickWorkoutWizard,
  WorkoutFlow,
} from '../../../workout/quick-workout/components/quick-workout-wizard'
import { WorkoutCreationLanding } from '../../../workout/quick-workout/components/workout-creation-landing'
import { useAiWorkoutGeneration } from '../../../workout/quick-workout/hooks/use-ai-workout-generation'
import { useManualWorkout } from '../../../workout/quick-workout/hooks/use-manual-workout'

interface EditFavouriteModalProps {
  open: boolean
  favourite: GQLFavouriteWorkout | null
  onClose: () => void
  onSuccess: () => void
}

export function EditFavouriteModal({
  open,
  favourite,
  onClose,
  onSuccess,
}: EditFavouriteModalProps) {
  // Edit state
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlow>('manual') // Default to manual for editing
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showTitleStep, setShowTitleStep] = useState(true)

  // Data fetching
  const { data: exercisesData } = useFitspaceGetExercisesQuery()

  // Check premium access for AI features
  const { hasPremium: hasPremiumAccess } = useUser()

  // Muscle groups data
  const allMuscleGroups = useMemo(() => {
    return (
      exercisesData?.muscleGroupCategories?.flatMap(
        (category) => category.muscles,
      ) || []
    )
  }, [exercisesData])

  // All exercises data for manual flow
  const allExercises = useMemo(() => {
    return [
      ...(exercisesData?.getExercises.trainerExercises || []),
      ...(exercisesData?.getExercises.publicExercises || []),
    ]
  }, [exercisesData])

  // Extract initial exercise IDs from favourite
  const initialSelectedExercises = useMemo(() => {
    if (!favourite?.exercises) return []
    return favourite.exercises
      .filter((ex) => ex.baseId) // Only include exercises with baseId
      .map((ex) => ex.baseId!)
  }, [favourite])

  // Manual workout hooks
  const {
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedEquipment,
    setSelectedEquipment,
    selectedExercises,
    handleExerciseSelect,
    searchTerm,
    setSearchTerm,
    selectedExerciseObjects,
    handleReorderExercises,
    handleRemoveExercise,
    canProceedToReview,
    filteredExercises,
  } = useManualWorkout({ allExercises, initialSelectedExercises })

  const {
    aiInputData,
    setAiInputData,
    aiWorkoutResult,
    isGeneratingAiWorkout,
    aiGenerationError,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
    handleExercisesReorder,
  } = useAiWorkoutGeneration()

  // Update hook
  const { updateFromWizard, isUpdating } = useUpdateFavouriteFromWizard()

  // Separate hook for just updating title/description
  const { updateFavourite, isUpdating: isUpdatingTitle } =
    useFavouriteWorkoutOperations()

  const [dirty, setDirty] = useState(false)

  // Populate form when favourite changes
  useEffect(() => {
    if (favourite && open) {
      setTitle(favourite.title)
      setDescription(favourite.description || '')

      setWorkoutFlow('manual')
      setShowTitleStep(true)
    }
  }, [favourite, open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setShowTitleStep(true)
      setWorkoutFlow('manual')
    }
  }, [open])

  // Handle workflow selection (for switching between manual and AI)
  const handleSelectManual = () => {
    setWorkoutFlow('manual')
    setShowTitleStep(false)
  }

  const handleSelectAI = () => {
    // Block AI flow for non-premium users
    if (!hasPremiumAccess) {
      console.warn(
        'AI flow blocked in edit favorite: Premium subscription required',
      )
      return
    }
    setWorkoutFlow('ai')
    setShowTitleStep(false)
  }

  // Handle workflow changes - go back to title step when flow is reset to null
  const handleFlowChange = (flow: WorkoutFlow) => {
    if (flow === null) {
      // User clicked prev on first step, go back to title step
      setShowTitleStep(true)
    }
    setWorkoutFlow(flow)
  }

  // Handle step changes - trigger AI generation when reaching AI results step
  const handleStepChange = (step: number) => {
    if (
      workoutFlow === 'ai' &&
      step === 3 &&
      !aiWorkoutResult &&
      !isGeneratingAiWorkout
    ) {
      handleGenerateAiWorkout()
    }
  }

  // Handle updating favourite from manual data
  const handleFinishManual = async () => {
    if (!title.trim() || !favourite || selectedExerciseObjects.length === 0) {
      console.error('Missing title, favourite, or exercises')
      return
    }

    try {
      // Convert selected exercise objects to workout data format
      const exercises = selectedExerciseObjects.map((exercise, index) => ({
        exerciseId: exercise.id,
        order: index + 1,
        name: exercise.name, // Use the actual exercise name from the object
        baseId: exercise.id,
        restSeconds: undefined,
        instructions: undefined,
        sets: [
          {
            order: 1,
            reps: undefined,
            minReps: undefined,
            maxReps: undefined,
            weight: undefined,
            rpe: undefined,
          },
          {
            order: 2,
            reps: undefined,
            minReps: undefined,
            maxReps: undefined,
            weight: undefined,
            rpe: undefined,
          },
          {
            order: 3,
            reps: undefined,
            minReps: undefined,
            maxReps: undefined,
            weight: undefined,
            rpe: undefined,
          },
        ],
      }))

      const workoutData: FavouriteWorkoutWizardData = {
        title: title.trim(),
        description: description.trim() || undefined,
        exercises,
      }

      await updateFromWizard(favourite.id, workoutData)
      handleSuccess()
    } catch (error) {
      console.error('Failed to update favourite workout:', error)
    }
  }

  // Handle updating favourite from AI data
  const handleFinishAI = async () => {
    if (!title.trim() || !favourite || !aiWorkoutResult) {
      console.error('Missing title, favourite, or AI workout result')
      return
    }

    try {
      // Convert AI result to workout data format
      // Use the exercises from aiWorkoutResult which may have been reordered by the user
      const aiExercises = aiWorkoutResult.exercises.map(
        (aiExercise, index: number) => ({
          exerciseId: aiExercise.exercise.id,
          order: favourite?.exercises.length + index + 1, // Start after existing exercises
          name: aiExercise.exercise.name,
          baseId: aiExercise.exercise.id,
          restSeconds: undefined,
          instructions: undefined,
          sets:
            aiExercise.sets?.map((aiSet, setIndex: number) => ({
              order: setIndex + 1,
              reps: aiSet?.reps || undefined,
              minReps: undefined,
              maxReps: undefined,
              rpe: aiSet?.rpe || undefined,
              weight: undefined,
            })) || [],
        }),
      )

      const mappedExercises = favourite?.exercises.map(
        (exercise, index: number) => ({
          exerciseId: exercise.baseId || '',
          order: favourite?.exercises.length + index + 1, // Start after existing exercises
          name: exercise.name,
          baseId: exercise.baseId || '',
          restSeconds: undefined,
          instructions: undefined,
          sets:
            exercise.sets?.map((set, setIndex: number) => ({
              order: setIndex + 1,
              reps: set.reps || undefined,
              minReps: undefined,
              maxReps: undefined,
              rpe: set.rpe || undefined,
              weight: undefined,
            })) || [],
        }),
      )

      // Combine existing and new exercises
      const allExercises = [...mappedExercises, ...aiExercises]

      const workoutData: FavouriteWorkoutWizardData = {
        title: title.trim(),
        description: description.trim() || undefined,
        exercises: allExercises,
      }

      await updateFromWizard(favourite.id, workoutData)
      handleSuccess()
    } catch (error) {
      console.error('Failed to update favourite workout:', error)
    }
  }

  // Unified finish handler
  const handleFinish = () => {
    if (workoutFlow === 'ai') {
      return handleFinishAI()
    } else if (workoutFlow === 'manual') {
      return handleFinishManual()
    }
  }

  // Step validation for the wizard
  const canProceedFromStep = (step: number) => {
    if (workoutFlow === 'manual') {
      switch (step) {
        case 2: // exercises step
          return canProceedToReview
        default:
          return true
      }
    }

    if (workoutFlow === 'ai') {
      switch (step) {
        case 3: // ai-results step
          return (
            !!aiWorkoutResult && !isGeneratingAiWorkout && !aiGenerationError
          )
        default:
          return true
      }
    }

    return true
  }

  // Handle saving just title/description changes
  const handleSaveTitleOnly = async () => {
    if (!favourite || !title.trim()) {
      return
    }

    try {
      await updateFavourite({
        id: favourite.id,
        title: title.trim(),
        description: description.trim() || null,
        // Don't include exercises to avoid overwriting them
      })
      setDirty(false)
    } catch (error) {
      console.error('Failed to update favourite workout title:', error)
    }
  }

  const handleSuccess = () => {
    onSuccess()
    handleClose()
  }

  const handleClose = () => {
    // Reset state
    setTitle('')
    setDescription('')
    setWorkoutFlow('manual')
    setShowTitleStep(true)

    onClose()
  }

  if (!favourite) {
    return null
  }

  // Title and description step
  if (showTitleStep) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent fullScreen dialogTitle="Edit Favourite Workout">
          <div>
            <div className="text-center space-y-2 my-4">
              <h2 className="text-2xl font-bold">Edit Favourite Workout</h2>
              <p className="text-muted-foreground">
                Update your workout details and exercises
              </p>
            </div>

            <div className="space-y-4 mb-4">
              <Input
                label="Workout Name"
                id="edit-title"
                className="w-full"
                placeholder="e.g., Morning Push Routine"
                value={title}
                variant="secondary"
                autoFocus={false}
                tabIndex={-1}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setDirty(true)
                }}
              />
              <Textarea
                label="Description"
                id="edit-description"
                className="w-full min-h-[60px]"
                placeholder="Add a description for your workout..."
                value={description}
                variant="ghost"
                onChange={(e) => {
                  setDescription(e.target.value)
                  setDirty(true)
                }}
              />
            </div>

            {/* Save title changes button */}

            {dirty && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium">Save changes</p>
                    <p className="text-xs text-muted-foreground">
                      Save title and description changes without modifying
                      exercises
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveTitleOnly}
                    disabled={!title.trim() || isUpdatingTitle}
                    loading={isUpdatingTitle}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Workout Creation Options */}
            <div className="space-y-3 my-4">
              <p className="text-lg font-medium">
                How would you like to update exercises?
              </p>
              <WorkoutCreationLanding
                className="gap-2"
                onSelectManual={handleSelectManual}
                onSelectAI={handleSelectAI}
              />
            </div>

            {/* Current exercises preview */}
            <div className="space-y-3 my-4">
              <p className="text-lg font-medium">Current Exercises</p>

              {favourite.exercises.length > 0 ? (
                <div className="space-y-1">
                  {favourite.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="text-sm font-medium bg-card rounded-md p-3"
                    >
                      {index + 1}. {exercise.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No exercises</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent fullScreen dialogTitle="Edit Favourite Workout">
        <div className="h-full relative">
          <QuickWorkoutWizard
            workoutFlow={workoutFlow}
            onFlowChange={handleFlowChange}
            canProceedFromStep={canProceedFromStep}
            isAdding={isUpdating}
            onFinish={handleFinish}
            onStepChange={handleStepChange}
            footerClassName={cn(
              'sticky bottom-[-24px] left-0 right-0 mx-0 mt-8',
            )}
            finishButtonText="Update Favourite"
            // Manual flow components (reuse existing)
            muscleGroupsComponent={
              <ManualMuscleGroupsStep
                muscleGroups={allMuscleGroups}
                selectedMuscleGroups={selectedMuscleGroups}
                onMuscleGroupToggle={(alias: string) => {
                  const newSelection = selectedMuscleGroups.includes(alias)
                    ? selectedMuscleGroups.filter((g) => g !== alias)
                    : [...selectedMuscleGroups, alias]
                  setSelectedMuscleGroups(newSelection)
                }}
              />
            }
            equipmentComponent={
              <ManualEquipmentStep
                selectedEquipment={selectedEquipment}
                onEquipmentToggle={(equipment) => {
                  const newSelection = selectedEquipment.includes(equipment)
                    ? selectedEquipment.filter((e) => e !== equipment)
                    : [...selectedEquipment, equipment]
                  setSelectedEquipment(newSelection)
                }}
              />
            }
            exercisesComponent={
              <ManualExercisesStep
                filteredExercises={filteredExercises}
                selectedExercises={selectedExercises}
                onExerciseSelect={handleExerciseSelect}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                existingExercises={[]} // No existing exercises for favourites
                selectedMuscleGroups={selectedMuscleGroups}
                onMuscleGroupChange={setSelectedMuscleGroups}
                selectedEquipment={selectedEquipment}
                onEquipmentChange={setSelectedEquipment}
              />
            }
            reviewComponent={
              <ManualReviewStep
                existingExercises={[]} // No existing exercises for favourites
                selectedExercises={selectedExerciseObjects}
                onReorderExercises={handleReorderExercises}
                onRemoveExercise={handleRemoveExercise}
              />
            }
            // AI flow components (reuse existing)
            aiMuscleGroupsComponent={
              <AiMuscleGroupsStep
                data={aiInputData}
                onDataChange={setAiInputData}
                muscleGroups={allMuscleGroups}
              />
            }
            aiEquipmentComponent={
              <AiEquipmentStep
                data={aiInputData}
                onDataChange={setAiInputData}
              />
            }
            aiParametersComponent={
              <AiParametersStep
                data={aiInputData}
                onDataChange={setAiInputData}
              />
            }
            aiResultsComponent={
              <AiResultsStep
                data={aiWorkoutResult}
                inputData={aiInputData}
                isLoading={isGeneratingAiWorkout}
                error={aiGenerationError}
                onRetry={handleRetryAiGeneration}
                onExercisesReorder={handleExercisesReorder}
              />
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
