'use client'

import { useQueryClient } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerGoBackButton,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useStartWorkoutFromFavouriteMutation } from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'

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
        // Use centralized query invalidation for starting workout from favourite
        await queryInvalidation.favouriteWorkoutStart(queryClient)

        // Refresh server components
        router.refresh()

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
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent
        dialogTitle="Select Custom Workout"
        className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
      >
        <DrawerGoBackButton className="relative mb-8" />
        <div className="px-4 pb-4 overflow-y-auto">
          <DrawerHeader className="relative px-0">
            <DrawerTitle>My Plans</DrawerTitle>
            <DrawerDescription>
              Select a saved workout to add to your day
            </DrawerDescription>
          </DrawerHeader>
          <FavouritesStep
            onSelectFavourite={handleSelectFavourite}
            isStarting={isStarting}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
