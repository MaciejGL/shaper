'use client'

import { HistoryIcon, StarIcon } from 'lucide-react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLFavouriteWorkout,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import {
  useFavouriteWorkoutOperations,
  useFavouriteWorkouts,
} from '@/hooks/use-favourite-workouts'

import { QuickWorkoutPlan } from '../../types'
import { DeleteFavouriteDialog } from '../favourites/delete-favourite-dialog'
import { EditFavouriteModal } from '../favourites/edit-favourite-modal'
import { FavouriteWorkoutsList } from '../favourites/favourite-workouts-list'

import { PastWorkoutsView } from './past-workouts/past-workouts-view'

enum WorkoutTabView {
  Favourites = 'favourites',
  PastWorkouts = 'past-workouts',
}

interface EnhancedQuickWorkoutTabProps {
  plan: QuickWorkoutPlan
  loading: boolean
}

export function EnhancedQuickWorkoutTab({
  plan,
  loading,
}: EnhancedQuickWorkoutTabProps) {
  const [activeView, setActiveView] = useState<WorkoutTabView>(
    WorkoutTabView.Favourites,
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [favouriteToDelete, setFavouriteToDelete] =
    useState<GQLFavouriteWorkout | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [favouriteToEdit, setFavouriteToEdit] =
    useState<GQLFavouriteWorkout | null>(null)

  // Favourite workouts hooks
  const {
    data: favouriteWorkouts,
    isLoading: isLoadingFavourites,
    refetch,
  } = useFavouriteWorkouts()
  const favouriteOperations = useFavouriteWorkoutOperations()

  const handleStartFromFavourite = async (favouriteId: string) => {
    try {
      await favouriteOperations.startFromFavourite({
        favouriteWorkoutId: favouriteId,
        replaceExisting: true,
      })

      // Show success message (could be a toast notification)
      console.log('Workout started from favourite successfully!')
    } catch (error) {
      console.error('Failed to start workout from favourite:', error)
      // Handle error (could show error toast)
    }
  }

  const handleEditFavourite = (
    favourite: NonNullable<
      NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
    >[number],
  ) => {
    setFavouriteToEdit(favourite as GQLFavouriteWorkout)
    setEditDialogOpen(true)
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
      console.log('Favourite deleted successfully!')
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

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setFavouriteToEdit(null)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as WorkoutTabView)}
      >
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value={WorkoutTabView.Favourites}>
            <StarIcon /> Favourites
          </TabsTrigger>
          <TabsTrigger value={WorkoutTabView.PastWorkouts}>
            <HistoryIcon /> Past Workouts
          </TabsTrigger>
        </TabsList>

        {/* Favourites View */}
        <TabsContent value={WorkoutTabView.Favourites}>
          <FavouriteWorkoutsList
            favouriteWorkouts={favouriteWorkouts?.getFavouriteWorkouts ?? []}
            loading={isLoadingFavourites}
            onStartWorkout={handleStartFromFavourite}
            onEditWorkout={handleEditFavourite}
            onDeleteWorkout={handleDeleteFavourite}
            onRefetch={refetch}
          />
        </TabsContent>

        {/* Past Workouts View */}
        <TabsContent value={WorkoutTabView.PastWorkouts}>
          <PastWorkoutsView plan={plan} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteFavouriteDialog
        open={deleteDialogOpen}
        favourite={favouriteToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={favouriteOperations.isDeleting}
      />

      {/* Edit Favourite Modal */}
      <EditFavouriteModal
        open={editDialogOpen}
        favourite={favouriteToEdit}
        onClose={handleCloseEditDialog}
        onSuccess={() => {
          refetch()
          handleCloseEditDialog()
        }}
      />
    </div>
  )
}
