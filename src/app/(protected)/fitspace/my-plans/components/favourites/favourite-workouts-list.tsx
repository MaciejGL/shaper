'use client'

import {
  ArrowLeft,
  Dumbbell,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/context/user-context'
import {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'

import { CreateEmptyFavouriteDrawer } from './create-empty-favourite-drawer'
import { FavouriteWorkoutCard } from './favourite-workout-card'
import { FolderCard } from './folder-card'
import { ManageFolderDialog } from './manage-folder-dialog'

interface FavouriteWorkoutsListProps {
  favouriteWorkouts: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >
  folders: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
  >
  currentFolder:
    | NonNullable<
        NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
      >[number]
    | null
  loading: boolean
  onStartWorkout: (favouriteId: string) => void
  onDeleteWorkout: (favouriteId: string) => void
  onRefetch: () => void
  workoutStatus: WorkoutStatusAnalysis
  isStarting: boolean
  currentFolderId: string | null
  onFolderClick: (folderId: string) => void
  onBackToRoot: () => void
  folderOperations: ReturnType<
    typeof import('@/hooks/use-favourite-workouts').useFavouriteWorkoutFolderOperations
  >
  totalWorkoutCount: number
}

export function FavouriteWorkoutsList({
  favouriteWorkouts,
  folders,
  currentFolder,
  loading,
  onStartWorkout,
  onDeleteWorkout,
  onRefetch,
  workoutStatus,
  isStarting,
  currentFolderId,
  onFolderClick,
  onBackToRoot,
  folderOperations,
  totalWorkoutCount,
}: FavouriteWorkoutsListProps) {
  const { hasPremium, subscription } = useUser()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageFolderOpen, setIsManageFolderOpen] = useState(false)
  const [folderToEdit, setFolderToEdit] = useState<{
    id: string
    name: string
  } | null>(null)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          {currentFolderId && (
            <Button variant="ghost" iconStart={<ArrowLeft />} disabled>
              Plans
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            {!currentFolderId && (
              <Button disabled iconStart={<FolderPlus />}>
                New Folder
              </Button>
            )}
            <Button disabled iconStart={<Plus />}>
              Add Day
            </Button>
          </div>
        </div>
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
          <LoadingSkeleton count={6} variant="sm" cardVariant="secondary" />
        </div>
      </div>
    )
  }

  const hasReachedWorkoutLimit =
    !hasPremium &&
    totalWorkoutCount >= (subscription?.favouriteWorkoutLimit ?? 3)
  const hasReachedFolderLimit =
    !hasPremium && folders.length >= (subscription?.favouriteFolderLimit ?? 1)

  const isRoot = currentFolderId === null
  const isEmpty = favouriteWorkouts.length === 0 && folders.length === 0

  const handleCreateFolder = () => {
    if (hasReachedFolderLimit) return
    setFolderToEdit(null)
    setIsManageFolderOpen(true)
  }

  const handleEditFolder = (folder: { id: string; name: string }) => {
    setFolderToEdit(folder)
    setIsManageFolderOpen(true)
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      await folderOperations.deleteFolder(folderId)
      onBackToRoot()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center gap-2 min-h-[40px]">
        {currentFolderId ? (
          <Button
            variant="ghost"
            iconStart={<ArrowLeft />}
            onClick={onBackToRoot}
            className="shrink-0 font-semibold -ml-4"
          >
            Plans
          </Button>
        ) : (
          <h2 className="text-lg font-semibold px-1">Plans</h2>
        )}

        <div className="flex gap-2 ml-auto">
          {isRoot && (
            <PremiumButtonWrapper
              hasPremium={hasPremium}
              showIndicator={hasReachedFolderLimit}
              tooltipText="Free tier limit reached. Upgrade to create more folders."
            >
              <Button
                iconStart={<FolderPlus />}
                onClick={handleCreateFolder}
                variant="secondary"
                disabled={hasReachedFolderLimit}
              >
                New Plan
              </Button>
            </PremiumButtonWrapper>
          )}
          {!isRoot && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon-md"
                    iconOnly={<MoreHorizontal />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      currentFolder &&
                      handleEditFolder({
                        id: currentFolder.id,
                        name: currentFolder.name,
                      })
                    }
                  >
                    <Pencil className="mr-2 size-4" />
                    Rename Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() =>
                      currentFolder && handleDeleteFolder(currentFolder.id)
                    }
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <PremiumButtonWrapper
                hasPremium={hasPremium}
                showIndicator={hasReachedWorkoutLimit}
                tooltipText="Free tier limit reached. Upgrade to create more workouts."
              >
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconStart={<Plus />}
                  disabled={hasReachedWorkoutLimit}
                >
                  Add Day
                </Button>
              </PremiumButtonWrapper>
            </>
          )}
        </div>
      </div>

      {/* Folder Title (if inside folder) */}
      {currentFolder && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <h2 className="text-2xl font-bold mb-1">{currentFolder.name}</h2>
          <p className="text-sm text-muted-foreground">
            {favouriteWorkouts.length}{' '}
            {favouriteWorkouts.length === 1 ? 'workout' : 'workouts'}
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="animate-in fade-in zoom-in-95 duration-300">
        {isEmpty ? (
          <EmptyFavouritesState
            onCreateNew={() => setIsCreateModalOpen(true)}
            onCreateFolder={handleCreateFolder}
            workoutStatus={workoutStatus}
            hasPremium={hasPremium}
            hasReachedFolderLimit={hasReachedFolderLimit}
            hasReachedWorkoutLimit={hasReachedWorkoutLimit}
            handleCreateFolder={handleCreateFolder}
          />
        ) : (
          <div className="space-y-6">
            {/* Folders Grid (Root only) */}
            {isRoot && folders.length > 0 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={() => onFolderClick(folder.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Workouts Grid */}
            {(favouriteWorkouts.length > 0 ||
              (!isRoot && folders.length === 0)) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                {isRoot && folders.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-2">
                    Uncategorized Workouts
                  </h3>
                )}
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                  {favouriteWorkouts.map((favourite) => (
                    <FavouriteWorkoutCard
                      key={favourite.id}
                      favourite={favourite}
                      onStart={() => onStartWorkout(favourite.id)}
                      onRefetch={onRefetch}
                      onDelete={() => onDeleteWorkout(favourite.id)}
                      workoutStatus={workoutStatus}
                      isLoading={isStarting}
                      folders={folders}
                    />
                  ))}
                </div>
                {!isRoot && favouriteWorkouts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    <p>No workouts in this folder yet.</p>
                    <Button
                      variant="link"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-2"
                    >
                      Create your first workout
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateEmptyFavouriteDrawer
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          onRefetch()
        }}
        currentFolderId={currentFolderId}
      />

      <ManageFolderDialog
        open={isManageFolderOpen}
        onClose={() => setIsManageFolderOpen(false)}
        onSuccess={() => {
          setIsManageFolderOpen(false)
          onRefetch()
        }}
        folderOperations={folderOperations}
        folderToEdit={folderToEdit}
      />
    </div>
  )
}

function EmptyFavouritesState({
  onCreateNew,
  workoutStatus,
  hasPremium,
  hasReachedFolderLimit,
  hasReachedWorkoutLimit,
  handleCreateFolder,
}: {
  onCreateNew: () => void
  onCreateFolder: () => void
  workoutStatus: WorkoutStatusAnalysis
  hasPremium: boolean
  hasReachedFolderLimit: boolean
  hasReachedWorkoutLimit: boolean
  handleCreateFolder: () => void
}) {
  const canStartMessage =
    workoutStatus.status === 'active-plan-workout'
      ? 'You have already a workout scheduled in your training plan for today.'
      : workoutStatus.message

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center text-center py-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No custom days yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Create custom days or organize them into folders for quick access to
          your preferred exercise routines.
        </p>
        {workoutStatus.status === 'active-plan-workout' && (
          <p className="text-sm text-muted-foreground my-4 max-w-sm mx-auto">
            {canStartMessage}
          </p>
        )}
        <div className="flex gap-2">
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            showIndicator={hasReachedFolderLimit}
            tooltipText="Free tier limit reached. Upgrade to create more folders."
          >
            <Button
              onClick={handleCreateFolder}
              iconStart={<FolderPlus />}
              disabled={hasReachedFolderLimit}
            >
              Create Folder
            </Button>
          </PremiumButtonWrapper>
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            showIndicator={hasReachedWorkoutLimit}
            tooltipText="Free tier limit reached. Upgrade to create more workouts."
          >
            <Button
              onClick={onCreateNew}
              iconStart={<Plus />}
              disabled={hasReachedWorkoutLimit}
            >
              Create Day
            </Button>
          </PremiumButtonWrapper>
        </div>
      </CardContent>
    </Card>
  )
}
