import { AlertTriangle, ExternalLink, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UnmatchedExercise } from '@/lib/ai-training/unmatched-storage'

interface UnmatchedExercisesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnmatchedExercisesModal({
  open,
  onOpenChange,
}: UnmatchedExercisesModalProps) {
  const [exercises, setExercises] = useState<UnmatchedExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadExercises = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/ai-training/unmatched')
      const data = await response.json()
      setExercises(data.exercises || [])
    } catch (error) {
      console.error('Error loading unmatched exercises:', error)
      toast.error('Failed to load unmatched exercises')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadExercises()
    }
  }, [open])

  const handleRemove = async (id: string) => {
    try {
      await fetch('/api/admin/ai-training/unmatched', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setExercises((prev) => prev.filter((e) => e.id !== id))
      toast.success('Exercise removed')
    } catch (error) {
      toast.error('Failed to remove exercise')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        dialogTitle="Unmatched Exercises"
      >
        <DialogHeader>
          <DialogTitle className="flex-center gap-2">
            <AlertTriangle className="size-5 text-yellow-600" />
            Unmatched Exercises ({exercises.length})
          </DialogTitle>
          <DialogDescription>
            These exercises couldn't be matched to your database. Review and
            consider adding them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : exercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No unmatched exercises found
            </p>
          ) : (
            exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex-center justify-between">
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {exercise.parsedFrom}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open('/admin?tab=exercises', '_blank')
                      }
                      iconOnly={<ExternalLink />}
                      title="Add in Exercises tab"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(exercise.id)}
                      iconOnly={<Trash2 />}
                      title="Remove from list"
                    />
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  {exercise.suggestedEquipment && (
                    <p>
                      <span className="text-muted-foreground">Equipment:</span>{' '}
                      {exercise.suggestedEquipment}
                    </p>
                  )}
                  {exercise.suggestedMuscleGroups &&
                    exercise.suggestedMuscleGroups.length > 0 && (
                      <p>
                        <span className="text-muted-foreground">
                          Muscle Groups:
                        </span>{' '}
                        {exercise.suggestedMuscleGroups.join(', ')}
                      </p>
                    )}
                  {exercise.sets && exercise.reps && (
                    <p>
                      <span className="text-muted-foreground">
                        Typical usage:
                      </span>{' '}
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.rpe && ` @ RPE ${exercise.rpe}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Parsed: {new Date(exercise.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
