import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MealDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealName: string
  onConfirm: () => void
  isDeleting: boolean
}

export function MealDeleteDialog({
  open,
  onOpenChange,
  mealName,
  onConfirm,
  isDeleting,
}: MealDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Remove Meal">
        <DialogHeader>
          <DialogTitle>Remove Meal from Plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{mealName}" from this nutrition
            plan day? The meal will remain in your meal library and can be added
            to other plans.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing...' : 'Remove from Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
