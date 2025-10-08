'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutOutput } from '@/lib/ai-training/types'

import { WorkoutEditor } from './workout-editor'

interface BulkWorkoutReviewerProps {
  workouts: WorkoutOutput[]
  onWorkoutsApproved: (approvedWorkouts: WorkoutOutput[]) => void
  onCancel: () => void
}

export function BulkWorkoutReviewer({
  workouts,
  onWorkoutsApproved,
  onCancel,
}: BulkWorkoutReviewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editedWorkouts, setEditedWorkouts] =
    useState<WorkoutOutput[]>(workouts)
  const [approvedWorkouts, setApprovedWorkouts] = useState<WorkoutOutput[]>([])

  const currentWorkout = editedWorkouts[currentIndex]
  const isLastWorkout = currentIndex === workouts.length - 1
  const totalWorkouts = workouts.length

  const handleWorkoutChange = (updatedWorkout: WorkoutOutput) => {
    const updated = [...editedWorkouts]
    updated[currentIndex] = updatedWorkout
    setEditedWorkouts(updated)
  }

  const handleApprove = () => {
    const approved = [...approvedWorkouts, currentWorkout]
    setApprovedWorkouts(approved)

    if (isLastWorkout) {
      onWorkoutsApproved(approved)
      toast.success(`Approved ${approved.length} workouts`)
    } else {
      setCurrentIndex(currentIndex + 1)
      toast.success(`Workout ${currentIndex + 1} approved`)
    }
  }

  const handleSkip = () => {
    if (isLastWorkout) {
      onWorkoutsApproved(approvedWorkouts)
      toast.success(
        `Approved ${approvedWorkouts.length} workouts (skipped ${totalWorkouts - approvedWorkouts.length})`,
      )
    } else {
      setCurrentIndex(currentIndex + 1)
      toast.info(`Skipped workout ${currentIndex + 1}`)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex-center justify-between">
            <span>Review Generated Workouts</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentIndex + 1} of {totalWorkouts}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button onClick={handleSkip} variant="outline" size="sm">
                Skip
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApprove} iconStart={<Check />} size="sm">
                {isLastWorkout ? 'Finish Review' : 'Approve & Next'}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                iconStart={<X />}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalWorkouts) * 100}%`,
              }}
            />
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Approved: {approvedWorkouts.length} | Remaining:{' '}
            {totalWorkouts - currentIndex - 1}
          </div>
        </CardContent>
      </Card>

      {/* Current Workout Editor */}
      <Card>
        <CardHeader>
          <CardTitle>
            Workout {currentIndex + 1}: {currentWorkout.summary}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutEditor
            workout={currentWorkout}
            onChange={handleWorkoutChange}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isLastWorkout
            ? `Ready to save ${approvedWorkouts.length} approved workouts`
            : `Review and approve workout ${currentIndex + 1}`}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSkip} variant="outline" iconStart={<X />}>
            Skip This Workout
          </Button>
          <Button onClick={handleApprove} iconStart={<Check />}>
            {isLastWorkout ? 'Finish Review' : 'Approve & Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
