import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RemoveClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  onConfirm: () => void
  isRemoving: boolean
}

export function RemoveClientDialog({
  open,
  onOpenChange,
  clientName,
  onConfirm,
  isRemoving,
}: RemoveClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Remove Client">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Client
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {clientName} from your client list?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <p className="text-sm text-muted-foreground">
            This will disconnect your coaching relationship. The client will
            keep access to all their training plans, notes, and data.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={isRemoving}
            disabled={isRemoving}
          >
            Remove Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
