'use client'

import {
  ArrowLeft,
  Check,
  Dumbbell,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

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
import { Input } from '@/components/ui/input'
import { useUser } from '@/context/user-context'
import {
  GQLCreateFavouriteWorkoutFolderInput,
  GQLCreateFavouriteWorkoutFolderMutation,
  GQLCreateFavouriteWorkoutInput,
  GQLCreateFavouriteWorkoutMutation,
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
  useCreateFavouriteWorkoutFolderMutation,
  useCreateFavouriteWorkoutMutation,
} from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import {
  generateTempId,
  useOptimisticMutation,
} from '@/lib/optimistic-mutations'
import { queryInvalidation } from '@/lib/query-invalidation'

import { DeleteFolderDialog } from './delete-folder-dialog'
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
  hideTitle?: boolean
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
  hideTitle = false,
}: FavouriteWorkoutsListProps) {
  const { hasPremium, subscription } = useUser()
  const queryClient = useQueryClient()
  const [isManageFolderOpen, setIsManageFolderOpen] = useState(false)
  const [folderToEdit, setFolderToEdit] = useState<{
    id: string
    name: string
  } | null>(null)
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<{
    id: string
    name: string
    workoutCount: number
  } | null>(null)
  const [isRenamingFolder, setIsRenamingFolder] = useState(false)
  const [draftFolderName, setDraftFolderName] = useState('')
  const [folderNameOverride, setFolderNameOverride] = useState<string | null>(
    null,
  )

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
              <Button disabled iconStart={<Plus />}>
                New Plan
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

  const { mutateAsync: createFolderMutation, isPending: isCreatingFolder } =
    useCreateFavouriteWorkoutFolderMutation()
  const foldersQueryKey = ['GetFavouriteWorkoutFolders'] as const
  const { optimisticMutate: createFolderOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutFoldersQuery,
    GQLCreateFavouriteWorkoutFolderMutation,
    { input: GQLCreateFavouriteWorkoutFolderInput }
  >({
    queryKey: [...foldersQueryKey],
    mutationFn: ({ input }) => createFolderMutation({ input }),
    updateFn: (oldData, { input }, tempId) => {
      if (!oldData?.getFavouriteWorkoutFolders) return oldData

      const now = new Date().toISOString()
      const nextTempId = tempId ?? generateTempId('temp')

      return {
        ...oldData,
        getFavouriteWorkoutFolders: [
          {
            __typename: 'FavouriteWorkoutFolder',
            id: nextTempId,
            name: input.name,
            createdById: 'temp',
            createdAt: now,
            updatedAt: now,
            favouriteWorkouts: [],
          },
          ...oldData.getFavouriteWorkoutFolders,
        ],
      }
    },
    onSuccess: (data, _variables, tempId) => {
      if (!tempId) return
      const realId = data.createFavouriteWorkoutFolder.id

      queryClient.setQueryData<GQLGetFavouriteWorkoutFoldersQuery>(
        [...foldersQueryKey],
        (oldData) => {
          if (!oldData?.getFavouriteWorkoutFolders) return oldData

          return {
            ...oldData,
            getFavouriteWorkoutFolders: oldData.getFavouriteWorkoutFolders.map(
              (folder) =>
                folder.id === tempId ? { ...folder, id: realId } : folder,
            ),
          }
        },
      )

      void queryInvalidation.favourites(queryClient)
      onRefetch()
    },
    onError: () => {
      onRefetch()
    },
  })

  const { mutateAsync: createFavouriteWorkout, isPending: isCreatingDay } =
    useCreateFavouriteWorkoutMutation()
  const favouritesQueryKey = ['GetFavouriteWorkouts'] as const

  const { optimisticMutate: createDayOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    GQLCreateFavouriteWorkoutMutation,
    { input: GQLCreateFavouriteWorkoutInput }
  >({
    queryKey: [...favouritesQueryKey],
    mutationFn: ({ input }) => createFavouriteWorkout({ input }),
    updateFn: (oldData, { input }, tempId) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      const now = new Date().toISOString()
      const nextTempId = tempId ?? generateTempId('temp')
      const folder =
        input.folderId && currentFolder
          ? { id: currentFolder.id, name: currentFolder.name }
          : null

      return {
        ...oldData,
        getFavouriteWorkouts: [
          {
            __typename: 'FavouriteWorkout',
            id: nextTempId,
            title: input.title,
            description: input.description ?? null,
            createdById: 'temp',
            createdAt: now,
            updatedAt: now,
            folderId: input.folderId ?? null,
            folder,
            exercises: [],
          },
          ...oldData.getFavouriteWorkouts,
        ],
      }
    },
    onSuccess: (data, _variables, tempId) => {
      if (!tempId) return
      const realId = data.createFavouriteWorkout.id

      queryClient.setQueryData<GQLGetFavouriteWorkoutsQuery>(
        [...favouritesQueryKey],
        (oldData) => {
          if (!oldData?.getFavouriteWorkouts) return oldData

          return {
            ...oldData,
            getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) =>
              fav.id === tempId ? { ...fav, id: realId } : fav,
            ),
          }
        },
      )

      void queryInvalidation.favourites(queryClient)
      onRefetch()
    },
    onError: () => {
      onRefetch()
    },
  })

  const handleAddDay = async () => {
    if (hasReachedWorkoutLimit || isCreatingDay) return

    const nextTitle = `Day ${favouriteWorkouts.length + 1}`
    const tempId = generateTempId('temp')

    try {
      await createDayOptimistic(
        {
          input: {
            title: nextTitle,
            folderId: currentFolderId,
            exercises: [],
          },
        },
        tempId,
      )
    } catch {
      // errors handled globally + rollback in optimistic mutation
    }
  }

  const handleCreateFolder = async () => {
    if (hasReachedFolderLimit || isCreatingFolder) return

    const nextName = `Plan ${folders.length + 1}`
    const tempId = generateTempId('temp')

    try {
      await createFolderOptimistic({ input: { name: nextName } }, tempId)
    } catch {
      // errors handled globally + rollback in optimistic mutation
    }
  }

  const handleEditFolder = (folder: { id: string; name: string }) => {
    setFolderToEdit(folder)
    setIsManageFolderOpen(true)
  }

  const handleDeleteFolder = (folder: { id: string; name: string }) => {
    setFolderToDelete({
      id: folder.id,
      name: folder.name,
      workoutCount: favouriteWorkouts.length,
    })
    setDeleteFolderDialogOpen(true)
  }

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return

    try {
      await folderOperations.deleteFolder(folderToDelete.id)
      setDeleteFolderDialogOpen(false)
      setFolderToDelete(null)
      onBackToRoot()
    } catch (error) {
      console.error('Failed to delete folder:', error)
    }
  }

  const handleCloseDeleteFolderDialog = () => {
    setDeleteFolderDialogOpen(false)
    setFolderToDelete(null)
  }

  const handleStartFolderRename = () => {
    if (!currentFolder) return
    setIsRenamingFolder(true)
    setDraftFolderName(folderNameOverride ?? currentFolder.name)
  }

  const handleCancelFolderRename = () => {
    setIsRenamingFolder(false)
    setDraftFolderName('')
    setFolderNameOverride(null)
  }

  const handleSaveFolderRename = async () => {
    if (!currentFolder) return
    const nextName = draftFolderName.trim()
    if (!nextName) {
      handleCancelFolderRename()
      return
    }

    if (nextName === (folderNameOverride ?? currentFolder.name)) {
      setIsRenamingFolder(false)
      return
    }

    setFolderNameOverride(nextName)
    setIsRenamingFolder(false)
    try {
      await folderOperations.updateFolder({
        id: currentFolder.id,
        name: nextName,
      })
      onRefetch()
    } catch (error) {
      console.error('Failed to rename folder:', error)
      setFolderNameOverride(null)
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
          !hideTitle && <h2 className="text-lg font-semibold px-1">Plans</h2>
        )}

        <div className="flex gap-2 ml-auto">
          {isRoot && (
            <PremiumButtonWrapper
              hasPremium={hasPremium}
              showIndicator={hasReachedFolderLimit}
              tooltipText="Organize your workout plans into unlimited collections and build a training library ready whenever you are."
            >
              <Button
                iconStart={<Plus />}
                onClick={() => void handleCreateFolder()}
                variant="default"
                disabled={hasReachedFolderLimit || isCreatingFolder}
                loading={isCreatingFolder}
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
                      currentFolder &&
                      handleDeleteFolder({
                        id: currentFolder.id,
                        name: currentFolder.name,
                      })
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
                tooltipText="Save unlimited workout templates to build your personal training library."
              >
                <Button
                    onClick={handleAddDay}
                    iconStart={<Plus />}
                    disabled={hasReachedWorkoutLimit || isCreatingDay}
                    loading={isCreatingDay}
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
          <div className="flex items-center gap-2 mb-1">
            {isRenamingFolder ? (
              <div className="flex items-center gap-1 w-full min-w-0">
                <Input
                  id={`favourite-folder-${currentFolder.id}-name`}
                  value={draftFolderName}
                  onChange={(e) => setDraftFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSaveFolderRename()
                    if (e.key === 'Escape') handleCancelFolderRename()
                  }}
                  onBlur={() => void handleSaveFolderRename()}
                  maxLength={100}
                  className="h-9 text-2xl font-bold"
                  aria-label="Folder name"
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  iconOnly={<Check />}
                  aria-label="Save folder name"
                  onClick={() => void handleSaveFolderRename()}
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  iconOnly={<X />}
                  aria-label="Cancel folder rename"
                  onClick={handleCancelFolderRename}
                />
              </div>
            ) : (
              <>
                <h2
                  className="text-2xl font-bold truncate cursor-text"
                  onClick={handleStartFolderRename}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartFolderRename()
                  }}
                  aria-label="Rename folder"
                >
                  {folderNameOverride ?? currentFolder.name}
                </h2>
              </>
            )}
          </div>
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
            hasPremium={hasPremium}
            hasReachedFolderLimit={hasReachedFolderLimit}
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
                {isRoot && (
                  <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-2">
                    Uncategorized Training Days
                  </h3>
                )}
                <div className="grid gap-2 grid-cols-1 -mx-3">
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
                    <p>No training days in this folder yet.</p>
                    <Button
                      variant="link"
                      onClick={handleAddDay}
                      disabled={hasReachedWorkoutLimit || isCreatingDay}
                      loading={isCreatingDay}
                      className="mt-2"
                    >
                      Create your first training day
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteFolderDialog
        open={deleteFolderDialogOpen}
        folderName={folderToDelete?.name ?? null}
        workoutCount={folderToDelete?.workoutCount}
        onClose={handleCloseDeleteFolderDialog}
        onConfirm={handleConfirmDeleteFolder}
        isDeleting={folderOperations.isDeletingFolder}
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
  hasPremium,
  hasReachedFolderLimit,
  handleCreateFolder,
}: {
  hasPremium: boolean
  hasReachedFolderLimit: boolean
  handleCreateFolder: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center text-center py-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Create your first training day
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Create your first training with days, exercises and sets. Reusable for
          your next workouts.
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
              Create Training Plan
            </Button>
          </PremiumButtonWrapper>
        </div>
      </CardContent>
    </Card>
  )
}
