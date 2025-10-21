'use client'

import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { ExerciseEditor } from '@/components/exercises/exercise-editor'
import { Button } from '@/components/ui/button'
import {
  useMuscleGroupCategoriesQuery,
  useTrainerExercisesQuery,
} from '@/generated/graphql-client'

import { CreatePublicExerciseDialog } from './create-public-exercise-dialog'

export function ExerciseManagementContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch muscle group categories for the dialog
  const { data: muscleGroupCategories } = useMuscleGroupCategoriesQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )

  // Fetch public exercises for name validation
  const { data: exercisesData } = useTrainerExercisesQuery(
    {
      where: undefined, // Get all exercises
    },
    {
      refetchOnWindowFocus: false,
    },
  )

  const categories = muscleGroupCategories?.muscleGroupCategories
  const publicExercises = exercisesData?.publicExercises

  const handleExerciseCreated = () => {
    // Trigger a refresh of the exercise list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exercise Management</h1>
          <p className="text-muted-foreground">
            Manage the public exercise library available to all users
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          iconStart={<PlusIcon />}
        >
          Add Public Exercise
        </Button>
      </div>

      {/* Exercise Editor Table */}
      <ExerciseEditor
        key={refreshKey} // Force refresh when new exercise is created
        apiEndpoint="/api/moderator/exercises/list"
        updateEndpoint="/api/moderator/exercises/update"
        deleteEndpoint="/api/moderator/exercises/update"
        title=""
        onStatsUpdate={handleExerciseCreated}
      />

      {/* Create Public Exercise Dialog */}
      <CreatePublicExerciseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        publicExercises={publicExercises}
        onExerciseCreated={handleExerciseCreated}
      />
    </div>
  )
}
