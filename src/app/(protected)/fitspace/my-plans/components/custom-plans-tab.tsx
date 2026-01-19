'use client'

import { useState } from 'react'

import { GQLFavouriteWorkout } from '@/generated/graphql-client'
import {
  useFavouriteWorkoutFolderOperations,
  useFavouriteWorkoutFolders,
  useFavouriteWorkoutOperations,
  useFavouriteWorkoutStatus,
  useFavouriteWorkouts,
} from '@/hooks/use-favourite-workouts'

import { DeleteFavouriteDialog } from './favourites/delete-favourite-dialog'
import { FavouriteWorkoutsList } from './favourites/favourite-workouts-list'
import { ReplacementConfirmationDialog } from './favourites/replacement-confirmation-dialog'

export function CustomPlansTab() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [favouriteToDelete, setFavouriteToDelete] =
    useState<GQLFavouriteWorkout | null>(null)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)
  const [pendingFavouriteId, setPendingFavouriteId] = useState<string | null>(
    null,
  )
  const [isStarting, setIsStarting] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  const {
    data: favouriteWorkouts,
    isLoading: isLoadingFavourites,
    refetch,
  } = useFavouriteWorkouts()
  const { data: folders, isLoading: isLoadingFolders } =
    useFavouriteWorkoutFolders()
  const favouriteOperations = useFavouriteWorkoutOperations()
  const folderOperations = useFavouriteWorkoutFolderOperations()

  const workoutStatus = useFavouriteWorkoutStatus()

  const startWorkout = async (favouriteId: string) => {
    try {
      setIsStarting(true)
      await favouriteOperations.startFromFavourite({
        favouriteWorkoutId: favouriteId,
        replaceExisting: true,
      })
    } catch (error) {
      console.error('Failed to start workout from favourite:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStartFromFavourite = async (favouriteId: string) => {
    if (!workoutStatus.canStart) return

    if (workoutStatus.needsConfirmation) {
      setPendingFavouriteId(favouriteId)
      setReplacementDialogOpen(true)
      return
    }

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
    const favourite = favouriteWorkouts?.getFavouriteWorkouts.find(
      (f) => f.id === favouriteId,
    )
    if (!favourite) return

    setFavouriteToDelete(favourite as GQLFavouriteWorkout)
    setDeleteDialogOpen(true)
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

  const filteredWorkouts =
    favouriteWorkouts?.getFavouriteWorkouts.filter((workout) => {
      if (currentFolderId === null) {
        return !workout.folderId
      }
      return workout.folderId === currentFolderId
    }) ?? []

  const totalWorkoutCount = favouriteWorkouts?.getFavouriteWorkouts.length ?? 0

  const foldersList = (folders?.getFavouriteWorkoutFolders ??
    []) as NonNullable<
    NonNullable<typeof folders>['getFavouriteWorkoutFolders']
  >
  const currentFolder = (foldersList.find((f) => f.id === currentFolderId) ??
    null) as (typeof foldersList)[number] | null

  return (
    <>
     
     <div className="space-y-0.5 mb-6">
            <div className="text-2xl font-semibold">Custom plans</div>
            <div className="text-sm text-muted-foreground">
              Create plans templates to use in your training.
            </div>
          </div>

      <FavouriteWorkoutsList
        hideTitle={true}
        favouriteWorkouts={filteredWorkouts}
        folders={foldersList}
        currentFolder={currentFolder}
        loading={isLoadingFavourites || isLoadingFolders}
        onStartWorkout={handleStartFromFavourite}
        onDeleteWorkout={handleDeleteFavourite}
        onRefetch={refetch}
        workoutStatus={workoutStatus}
        isStarting={isStarting}
        currentFolderId={currentFolderId}
        onFolderClick={setCurrentFolderId}
        onBackToRoot={() => setCurrentFolderId(null)}
        folderOperations={folderOperations}
        totalWorkoutCount={totalWorkoutCount}
      />

      <DeleteFavouriteDialog
        open={deleteDialogOpen}
        favourite={favouriteToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={favouriteOperations.isDeleting}
      />

      <ReplacementConfirmationDialog
        open={replacementDialogOpen}
        onClose={handleCancelReplacement}
        onConfirm={handleConfirmReplacement}
        isStarting={favouriteOperations.isStarting}
        message={workoutStatus.message}
      />
    </>
  )
}

