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
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} exercise{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear
          </Button>
        </div>
        <Button onClick={onReview} size="lg">
          Review workout
        </Button>
      </div>
    </DrawerFooter>
  )
}

