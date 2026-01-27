'use client'

import { Check, FolderInput } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
  GQLUpdateFavouriteWorkoutInput,
} from '@/generated/graphql-client'
import { useUpdateFavouriteWorkoutMutation } from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'

interface MoveToFolderDrawerProps {
  open: boolean
  onClose: () => void
  favouriteId: string
  currentFolderId?: string | null
  folders: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
  >
  onSuccess: () => void
}

export function MoveToFolderDrawer({
  open,
  onClose,
  favouriteId,
  currentFolderId,
  folders,
  onSuccess,
}: MoveToFolderDrawerProps) {
  const queryClient = useQueryClient()
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId || 'none',
  )

  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedFolderId(currentFolderId || 'none')
    }
  }, [open, currentFolderId])

  const { mutateAsync: updateFavourite, isPending: isUpdating } =
    useUpdateFavouriteWorkoutMutation()
  const favouritesQueryKey = ['GetFavouriteWorkouts'] as const
  const { optimisticMutate: moveFavouriteOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    unknown,
    { input: GQLUpdateFavouriteWorkoutInput }
  >({
    queryKey: [...favouritesQueryKey],
    mutationFn: ({ input }) => updateFavourite({ input }),
    updateFn: (oldData, { input }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
          if (fav.id !== input.id) return fav

          const nextFolderId = input.folderId ?? null
          const nextFolder = nextFolderId
            ? {
                __typename: 'FavouriteWorkoutFolder' as const,
                id: nextFolderId,
                name:
                  folders.find((f) => f.id === nextFolderId)?.name ??
                  fav.folder?.name ??
                  '',
              }
            : null

          return {
            ...fav,
            folderId: nextFolderId,
            folder: nextFolder,
          }
        }),
      }
    },
    onSuccess: () => {
      void queryInvalidation.favourites(queryClient)
    },
    onError: () => {
      void queryInvalidation.favourites(queryClient)
    },
  })

  const handleMove = async () => {
    try {
      await moveFavouriteOptimistic({
        input: {
          id: favouriteId,
          folderId: selectedFolderId === 'none' ? null : selectedFolderId,
        },
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to move favourite workout:', error)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent dialogTitle="Move to Folder" className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Move to Folder</DrawerTitle>
          <DrawerDescription>
            Select a folder to move this workout to
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedFolderId('none')}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left',
                selectedFolderId === 'none'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80',
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">Uncategorized</span>
                <span className="text-sm text-muted-foreground">No folder</span>
              </div>
              {selectedFolderId === 'none' && (
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="size-4" />
                </div>
              )}
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolderId(folder.id)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left',
                  selectedFolderId === folder.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted hover:bg-muted/80',
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{folder.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {folder.favouriteWorkouts.length}{' '}
                    {folder.favouriteWorkouts.length === 1
                      ? 'workout'
                      : 'workouts'}
                  </span>
                </div>
                {selectedFolderId === folder.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="size-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <Button variant="tertiary" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isUpdating || selectedFolderId === currentFolderId}
            loading={isUpdating}
            iconStart={<FolderInput />}
          >
            Move to Folder
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
