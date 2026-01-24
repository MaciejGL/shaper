'use client'

import { ChevronRight, Folder, Plus } from 'lucide-react'
import { useState } from 'react'

import { HeaderTab } from '@/components/header-tab'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import type {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import {
  useFavouriteWorkoutFolderOperations,
  useFavouriteWorkoutFolders,
  useFavouriteWorkoutOperations,
  useFavouriteWorkoutStatus,
  useFavouriteWorkouts,
} from '@/hooks/use-favourite-workouts'
import { cn } from '@/lib/utils'

import { CustomPlansDrawer } from './custom-plans-drawer/custom-plans-drawer'
import type { CustomPlan } from './custom-plans-drawer/types'
import { DeleteFavouriteDialog } from './favourites/delete-favourite-dialog'
import { FolderCard } from './favourites/folder-card'
import { ManageFolderDialog } from './favourites/manage-folder-dialog'
import { ReplacementConfirmationDialog } from './favourites/replacement-confirmation-dialog'

type FavouriteWorkout = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
>[number]

type FavouriteWorkoutFolder = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
>[number]

export function CustomPlansTab() {
  const { hasPremium, subscription } = useUser()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [favouriteToDelete, setFavouriteToDelete] =
    useState<FavouriteWorkout | null>(null)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)
  const [pendingFavouriteId, setPendingFavouriteId] = useState<string | null>(
    null,
  )
  const [isStarting, setIsStarting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<CustomPlan | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [isManageFolderOpen, setIsManageFolderOpen] = useState(false)
  const [folderToEdit, setFolderToEdit] = useState<{
    id: string
    name: string
  } | null>(null)

  const {
    data: favouriteWorkouts,
    isLoading: isLoadingFavourites,
    refetch,
  } = useFavouriteWorkouts()
  const {
    data: folders,
    isLoading: isLoadingFolders,
    refetch: refetchFolders,
  } = useFavouriteWorkoutFolders()
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

    setFavouriteToDelete(favourite)
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

  const foldersList: FavouriteWorkoutFolder[] =
    folders?.getFavouriteWorkoutFolders ?? []
  const allFavourites: FavouriteWorkout[] =
    favouriteWorkouts?.getFavouriteWorkouts ?? []

  const uncategorizedCount = allFavourites.filter((w) => !w.folderId).length
  const totalWorkoutCount = allFavourites.length

  const hasReachedWorkoutLimit =
    !hasPremium &&
    totalWorkoutCount >= (subscription?.favouriteWorkoutLimit ?? 3)
  const hasReachedFolderLimit =
    !hasPremium &&
    foldersList.length >= (subscription?.favouriteFolderLimit ?? 1)

  const handleOpenPlan = (plan: CustomPlan) => {
    setSelectedPlan(plan)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedPlan(null)
  }

  const handleCreateFolder = () => {
    if (hasReachedFolderLimit) return
    setFolderToEdit(null)
    setIsManageFolderOpen(true)
  }

  const handleRefetchAll = () => {
    void refetch()
    void refetchFolders()
  }

  return (
    <>
      <HeaderTab
        title="Custom plans"
        description="Create plans templates to use in your training."
      />

      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="text-sm text-muted-foreground">
          {hasPremium
            ? `${foldersList.length} plans · ${totalWorkoutCount} days`
            : `${foldersList.length}/${subscription?.favouriteFolderLimit ?? 1} plans · ${totalWorkoutCount}/${subscription?.favouriteWorkoutLimit ?? 3} days`}
        </div>
        <PremiumButtonWrapper
          hasPremium={hasPremium}
          showIndicator={hasReachedFolderLimit}
          tooltipText="Organize your workout plans into unlimited collections and build a training library ready whenever you are."
        >
          <Button
            iconStart={<Plus />}
            onClick={handleCreateFolder}
            variant="default"
            disabled={hasReachedFolderLimit}
          >
            New plan
          </Button>
        </PremiumButtonWrapper>
      </div>

      {isLoadingFavourites || isLoadingFolders ? (
        <div className="space-y-3">
          <LoadingSkeleton count={6} variant="sm" cardVariant="secondary" />
        </div>
      ) : foldersList.length === 0 && uncategorizedCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Create your first plan
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create plans to use in your training.
            </p>
            <div className="flex gap-2">
              <PremiumButtonWrapper
                hasPremium={hasPremium}
                showIndicator={hasReachedFolderLimit}
                tooltipText="Organize your workout plans into unlimited collections and build a training library ready whenever you are."
              >
                <Button
                  onClick={handleCreateFolder}
                  iconStart={<Plus />}
                  disabled={hasReachedFolderLimit}
                >
                  Create Plan
                </Button>
              </PremiumButtonWrapper>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {uncategorizedCount > 0 ? (
            <button
              type="button"
              onClick={() => handleOpenPlan({ kind: 'uncategorized' })}
              className={cn(
                'cursor-pointer hover:bg-accent/50 group active:scale-[0.98] transition-all duration-200 shadow-md border-transparent',
                'rounded-xl border bg-card text-left p-2',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-center size-20 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Folder className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">Uncategorized</h3>
                    <p className="text-sm text-muted-foreground">
                      {uncategorizedCount}{' '}
                      {uncategorizedCount === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </div>
              </div>
            </button>
          ) : null}

          {foldersList.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onClick={() => handleOpenPlan({ kind: 'folder', folder })}
            />
          ))}
        </div>
      )}

      <CustomPlansDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        plan={selectedPlan}
        favourites={allFavourites}
        isLoading={isLoadingFavourites || isLoadingFolders}
        onRefetch={handleRefetchAll}
        workoutStatus={workoutStatus}
        canCreateDay={!hasReachedWorkoutLimit}
        isStartingWorkout={isStarting}
        onStartWorkout={handleStartFromFavourite}
        onRequestDeleteDay={handleDeleteFavourite}
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

      <ManageFolderDialog
        open={isManageFolderOpen}
        onClose={() => setIsManageFolderOpen(false)}
        onSuccess={() => {
          setIsManageFolderOpen(false)
          handleRefetchAll()
        }}
        folderOperations={folderOperations}
        folderToEdit={folderToEdit}
      />
    </>
  )
}
