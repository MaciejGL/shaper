'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface DeclineOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  packageName: string
}

export function DeclineOfferModal({
  isOpen,
  onClose,
  onConfirm,
  packageName,
}: DeclineOfferModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('')
      onClose()
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
      setReason('')
      onClose()
    } catch (error) {
      console.error('Failed to decline offer:', error)
      // Keep modal open on error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent dialogTitle="Decline Offer" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Decline Offer</DialogTitle>
          <DialogDescription>
            Are you sure you want to decline this "{packageName}" offer? Your
            trainer will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="decline-reason" className="text-sm">
            Reason for declining (optional)
          </Label>
          <Textarea
            id="decline-reason"
            placeholder="e.g., Not interested at this time, too expensive, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="tertiary"
          >
            Keep Offer
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? 'Declining...' : 'Decline Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
