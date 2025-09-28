import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface MealActionsProps {
  onDelete: () => void
}

export function MealActions({ onDelete }: MealActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      {/* Delete button */}
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        iconOnly={<Trash2 />}
      />
    </div>
  )
}
