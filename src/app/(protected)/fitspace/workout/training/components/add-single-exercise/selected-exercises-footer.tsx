'use client'

import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'

interface SelectedExercisesFooterProps {
  selectedCount: number
  onClearAll: () => void
  onReview: () => void
}

export function SelectedExercisesFooter({
  selectedCount,
  onClearAll,
  onReview,
}: SelectedExercisesFooterProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <DrawerFooter className="border-t">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-between w-full gap-3">
        <span className="text-sm font-medium">
          {selectedCount} exercise{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button variant="outline" size="md" onClick={onClearAll}>
          Clear
        </Button>

        <Button onClick={onReview} size="md">
          Review workout
        </Button>
      </div>
    </DrawerFooter>
  )
}
