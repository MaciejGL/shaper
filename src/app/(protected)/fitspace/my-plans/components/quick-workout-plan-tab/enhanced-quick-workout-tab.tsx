'use client'

import { useState } from 'react'

import { GQLFavouriteWorkout } from '@/generated/graphql-client'
import {
  useFavouriteWorkoutOperations,
  useFavouriteWorkoutStatus,
  useFavouriteWorkouts,
} from '@/hooks/use-favourite-workouts'

import { DeleteFavouriteDialog } from '../favourites/delete-favourite-dialog'
import { FavouriteWorkoutsList } from '../favourites/favourite-workouts-list'
import { ReplacementConfirmationDialog } from '../favourites/replacement-confirmation-dialog'

export function EnhancedQuickWorkoutTab() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [favouriteToDelete, setFavouriteToDelete] =
    useState<GQLFavouriteWorkout | null>(null)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)
  const [pendingFavouriteId, setPendingFavouriteId] = useState<string | null>(
    null,
  )
  const [isStarting, setIsStarting] = useState(false)

  // Favourite workouts hooks
  const {
    data: favouriteWorkouts,
    isLoading: isLoadingFavourites,
    refetch,
  } = useFavouriteWorkouts()
  const favouriteOperations = useFavouriteWorkoutOperations()

  // Workout status analysis
  const workoutStatus = useFavouriteWorkoutStatus()

  const startWorkout = async (favouriteId: string) => {
    try {
      setIsStarting(true)
      await favouriteOperations.startFromFavourite({
        favouriteWorkoutId: favouriteId,
        replaceExisting: true,
      })

      // Show success message (could be a toast notification)
    } catch (error) {
      console.error('Failed to start workout from favourite:', error)
      // Handle error (could show error toast)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStartFromFavourite = async (favouriteId: string) => {
    // Check workout status before proceeding
    if (!workoutStatus.canStart) {
      // If user has active plan with workout today, don't allow starting
      return
    }

    if (workoutStatus.needsConfirmation) {
      // Show confirmation dialog for replacement
      setPendingFavouriteId(favouriteId)
      setReplacementDialogOpen(true)
      return
    }

    // Direct start if no confirmation needed
    await startWorkout(favouriteId)
  }

  const handleConfirmReplacement = async () => {
    if (!pendingFavouriteId) return

    await startWorkout(pendingFavouriteId)
    setReplacementDialogOpen(false)
    setPendingFavouriteId(null)
  }

  const handleCancelReplacement = () => {
    setReplacementDialogOpen(false)
    setPendingFavouriteId(null)
  }

  const handleDeleteFavourite = (favouriteId: string) => {
    // Find the favourite to delete
    const favourite = favouriteWorkouts?.getFavouriteWorkouts.find(
      (f) => f.id === favouriteId,
    )
    if (favourite) {
      setFavouriteToDelete(favourite as GQLFavouriteWorkout)
      setDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!favouriteToDelete) return

    try {
      await favouriteOperations.deleteFavourite(favouriteToDelete.id)
      setDeleteDialogOpen(false)
      setFavouriteToDelete(null)
    } catch (error) {
      console.error('Failed to delete favourite:', error)
    }
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setFavouriteToDelete(null)
  }

  return (
    <div className="space-y-6">
      <FavouriteWorkoutsList
        favouriteWorkouts={favouriteWorkouts?.getFavouriteWorkouts ?? []}
        loading={isLoadingFavourites}
        onStartWorkout={handleStartFromFavourite}
        onDeleteWorkout={handleDeleteFavourite}
        onRefetch={refetch}
        workoutStatus={workoutStatus}
        isStarting={isStarting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteFavouriteDialog
        open={deleteDialogOpen}
        favourite={favouriteToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={favouriteOperations.isDeleting}
      />

      {/* Replacement Confirmation Dialog */}
      <ReplacementConfirmationDialog
        open={replacementDialogOpen}
        onClose={handleCancelReplacement}
        onConfirm={handleConfirmReplacement}
        isStarting={favouriteOperations.isStarting}
        message={workoutStatus.message}
      />
    </div>
  )
}
