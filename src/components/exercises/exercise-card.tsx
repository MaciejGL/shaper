'use client'

import { AlertTriangle, Check, CheckCircle, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { useExerciseUpdate } from '@/hooks/use-exercise-update'

import { ExerciseContentSection } from './exercise-content-section'
import { ExerciseImagesVideoSection } from './exercise-images-video-section'
import { ExerciseSettingsSection } from './exercise-settings-section'
import { ExerciseTipsSection } from './exercise-tips-section'
import { Exercise } from './types'

interface ExerciseCardProps {
  exercise: Exercise
  updateEndpoint: string
  allExercises: Exercise[] // For substitute handling
  hasSimilarPublicExercise: (exercise: Exercise) => boolean // Function to check for similar public exercises
  onSilentRefresh?: () => void // Silent background refresh after save
  onDelete: (exercise: Exercise) => void
}

export function ExerciseCard({
  exercise,
  updateEndpoint,
  allExercises,
  hasSimilarPublicExercise,
  onSilentRefresh,
  onDelete,
}: ExerciseCardProps) {
  const {
    currentExercise,
    hasChanges,
    isSaving,
    localSubstitutes,
    updateField,
    updateSubstitutes,
    updateMuscleGroups,
    saveChanges,
    discardChanges,
  } = useExerciseUpdate({
    exercise,
    updateEndpoint,
    onSilentRefresh,
  })

  // Check if this non-public exercise has a similar public exercise
  const hasCollision = hasSimilarPublicExercise(currentExercise)

  const handleSave = async () => {
    await saveChanges()
  }

  const handleDiscard = () => {
    discardChanges()
  }

  return (
    <Card
      className={`transition-all duration-200 relative ${
        hasChanges ? 'border-1 border-blue-200 shadow-md' : 'hover:shadow-sm'
      }`}
    >
      {/* 4-Column Layout Grid */}
      <div className="grid grid-cols-4 gap-6 px-4">
        {/* Column 1: Images & Video */}
        <ExerciseImagesVideoSection
          exercise={currentExercise}
          onUpdate={(_, field, value) => updateField(field, value)}
        />

        {/* Column 2: Name, Description, Instructions */}
        <ExerciseContentSection
          exercise={exercise}
          currentExercise={currentExercise}
          onUpdate={(_, field, value) => updateField(field, value)}
        />

        {/* Column 3: Tips */}
        <ExerciseTipsSection
          exercise={exercise}
          currentExercise={currentExercise}
          onUpdate={(_, field, value) => updateField(field, value)}
        />

        {/* Column 4: Settings & Muscles */}
        <ExerciseSettingsSection
          exercise={exercise}
          currentExercise={currentExercise}
          localSubstitutes={localSubstitutes}
          allExercises={allExercises}
          onUpdate={(field, value) => updateField(field, value)}
          onUpdateSubstitutes={updateSubstitutes}
          onUpdateMuscleGroups={updateMuscleGroups}
        />
      </div>

      <CardFooter className="border-t flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            iconStart={<Trash2 />}
            onClick={() => {
              if (confirm('Are you sure you want to delete this exercise?')) {
                onDelete(exercise)
              }
            }}
          >
            Delete
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(exercise.id)
              toast.success('Exercise ID copied to clipboard')
            }}
          >
            {exercise.id}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Similar Exercise Warning Badge */}
          {hasCollision && (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Similar exercise already exists in public
            </Badge>
          )}

          {/* Verified Badge */}
          <Badge
            variant={currentExercise.verified ? 'success' : 'secondary'}
            className="cursor-pointer transition-colors hover:bg-primary/90"
            onClick={() => updateField('verified', !currentExercise.verified)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {currentExercise.verified ? 'Verified' : 'Mark as Verified'}
          </Badge>
          {hasChanges && <Badge>Modified</Badge>}
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleDiscard}
            disabled={isSaving || !hasChanges}
            iconStart={<X />}
          >
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            loading={isSaving}
            iconStart={<Check />}
          >
            Save Changes
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
