'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateFavouriteModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateFavouriteModal({
  open,
  onClose,
  onSuccess,
}: CreateFavouriteModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [step, setStep] = useState<'details' | 'exercises'>('details')

  const handleNext = () => {
    if (!title.trim()) return

    // Note: This will be integrated with the existing QuickWorkoutWizard
    // in a future iteration to provide full exercise selection functionality
    setStep('exercises')

    // Placeholder: Simulate workout creation process
    setTimeout(() => {
      onSuccess()
      handleClose()
    }, 1000)
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setStep('details')
    onClose()
  }

  if (step === 'exercises') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden"
          dialogTitle="Create Favourite Workout"
        >
          <DialogHeader>
            <DialogTitle>Create Favourite Workout</DialogTitle>
            <DialogDescription>Setting up your workout...</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Preparing exercise selection...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Exercise wizard integration coming soon
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dialogTitle="Create Favourite Workout">
        <DialogHeader>
          <DialogTitle>Create Favourite Workout</DialogTitle>
          <DialogDescription>
            Give your favourite workout a name and description, then add
            exercises.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Workout Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Push Routine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your workout routine..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={!title.trim()}>
            Next: Add Exercises
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
