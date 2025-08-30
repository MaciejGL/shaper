'use client'

import { AlertTriangle, Check, CheckCircle, Trash2, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { useExerciseUpdate } from '@/hooks/use-exercise-update'
import { useVerifiedExercises } from '@/hooks/use-verified-exercises'

import { ExerciseContentSection } from './exercise-content-section'
import { ExerciseImagesVideoSection } from './exercise-images-video-section'
import { ExerciseSettingsSection } from './exercise-settings-section'
import { ExerciseTipsSection } from './exercise-tips-section'
import { Exercise } from './types'
import { hasSimilarPublicExercise } from './utils/check-similar-exercise'

interface ExerciseCardProps {
  exercise: Exercise
  updateEndpoint: string
  allExercises: Exercise[] // For substitute handling
  onSilentRefresh?: () => void // Silent background refresh after save
  onDelete: (exercise: Exercise) => void
}

export function ExerciseCard({
  exercise,
  updateEndpoint,
  allExercises,
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

  const { isVerified, toggleVerified } = useVerifiedExercises()

  // Check if this non-public exercise has a similar public exercise
  const hasCollision = hasSimilarPublicExercise(currentExercise, allExercises)

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
          onUpdate={(id, field, value) => updateField(field, value)}
        />

        {/* Column 2: Name, Description, Instructions */}
        <ExerciseContentSection
          exercise={exercise}
          currentExercise={currentExercise}
          onUpdate={(id, field, value) => updateField(field, value)}
        />

        {/* Column 3: Tips */}
        <ExerciseTipsSection
          exercise={exercise}
          currentExercise={currentExercise}
          onUpdate={(id, field, value) => updateField(field, value)}
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
            variant={isVerified(exercise.id) ? 'success' : 'secondary'}
            className="cursor-pointer transition-colors hover:bg-primary/90"
            onClick={() => toggleVerified(exercise.id)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {isVerified(exercise.id) ? 'Verified' : 'Mark as Verified'}
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
