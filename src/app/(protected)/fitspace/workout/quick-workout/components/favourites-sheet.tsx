'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  useFitspaceGetWorkoutDayQuery,
  useStartWorkoutFromFavouriteMutation,
} from '@/generated/graphql-client'

import { FavouritesStep } from './favourites-step'

interface FavouritesSheetProps {
  open: boolean
  onClose: () => void
  dayId?: string
}

export function FavouritesSheet({
  open,
  onClose,
  dayId,
}: FavouritesSheetProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayIdFromUrl] = useQueryState('day')

  const { mutateAsync: startFromFavourite, isPending: isStarting } =
    useStartWorkoutFromFavouriteMutation({
      onSuccess: async () => {
        // If we have a dayId (from empty-workout-options), invalidate that specific day's query
        if (dayId || dayIdFromUrl) {
          const currentDayId = dayIdFromUrl || dayId
          const queryKeyToInvalidate = useFitspaceGetWorkoutDayQuery.getKey({
            dayId: currentDayId,
          })

          // Invalidate queries to refresh the data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate }),
            queryClient.invalidateQueries({ queryKey: ['navigation'] }),
            queryClient.invalidateQueries({
              queryKey: ['FitspaceGetQuickWorkoutNavigation'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['GetQuickWorkoutPlan'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['FitspaceGetQuickWorkoutDay'],
            }),
          ])

          // Refetch the day query to ensure fresh data
          await queryClient.refetchQueries({
            queryKey: queryKeyToInvalidate,
          })

          // Refresh server components
          router.refresh()
        }

        // Close the drawer
        onClose()
      },
    })

  const handleSelectFavourite = async (favouriteId: string) => {
    const currentDayId = dayIdFromUrl || dayId

    await startFromFavourite({
      input: {
        favouriteWorkoutId: favouriteId,
        replaceExisting: true,
        dayId: currentDayId || undefined, // Pass the current day if available
      },
    })
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        dialogTitle="Select Favourite Workout"
        className="max-h-[85vh]"
      >
        <DrawerHeader>
          <DrawerTitle>From Favourites</DrawerTitle>
          <DrawerDescription>
            Select a saved workout to add to your day
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          <FavouritesStep
            onSelectFavourite={handleSelectFavourite}
            isStarting={isStarting}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
