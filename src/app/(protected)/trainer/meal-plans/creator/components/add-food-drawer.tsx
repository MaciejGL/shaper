import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import FoodSearch from './food-search'
import { formatHour } from './utils'

export function AddFoodDrawer({
  selectedHour,
  dayId,
  handleCloseSheet,
}: {
  selectedHour: number
  dayId: string
  handleCloseSheet: () => void
}) {
  return (
    <Sheet open={selectedHour !== null} onOpenChange={handleCloseSheet}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Meal</SheetTitle>
          <SheetDescription>
            Add or edit foods for{' '}
            {selectedHour !== null ? formatHour(selectedHour) : ''}
          </SheetDescription>
        </SheetHeader>
        {selectedHour !== null && (
          <FoodSearch
            dayId={dayId}
            hour={selectedHour}
            onClose={handleCloseSheet}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
