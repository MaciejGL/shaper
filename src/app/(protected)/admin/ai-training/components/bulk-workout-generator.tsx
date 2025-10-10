'use client'

import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { WorkoutOutput } from '@/lib/ai-training/types'

interface BulkWorkoutGeneratorProps {
  onWorkoutsGenerated: (workouts: WorkoutOutput[]) => void
}

type WorkoutType =
  | 'fullbody'
  | 'upper-lower'
  | 'push-pull-legs'
  | 'split'
  | 'upper-body'
  | 'lower-body'
  | 'glute-focus'
  | 'arms-only'

type TrainingFocus = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE'

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: 'fullbody', label: 'Full Body' },
  { value: 'upper-lower', label: 'Upper/Lower Split' },
  { value: 'push-pull-legs', label: 'Push/Pull/Legs' },
  { value: 'split', label: 'Body Part Split' },
  { value: 'upper-body', label: 'Upper Body Focus' },
  { value: 'lower-body', label: 'Lower Body Focus' },
  { value: 'glute-focus', label: 'Glute Focus (Women)' },
  { value: 'arms-only', label: 'Arms Only' },
]

const TRAINING_FOCUSES: { value: TrainingFocus; label: string }[] = [
  { value: 'STRENGTH', label: 'Strength (4-8 reps)' },
  { value: 'HYPERTROPHY', label: 'Hypertrophy (8-15 reps)' },
  { value: 'ENDURANCE', label: 'Endurance (12-20 reps)' },
]

export function BulkWorkoutGenerator({
  onWorkoutsGenerated,
}: BulkWorkoutGeneratorProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>('fullbody')
  const [trainingFocus, setTrainingFocus] =
    useState<TrainingFocus>('HYPERTROPHY')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!workoutType) {
      toast.error('Please select a workout type')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(
        '/api/admin/ai-training/generate-bulk-workouts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutType,
            trainingFocus,
            customPrompt: customPrompt.trim() || undefined,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate workouts')
      }

      const data = await response.json()
      onWorkoutsGenerated(data.workouts)
      toast.success(`Generated ${data.workouts.length} workout examples`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate workouts',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-center gap-2">
          <Plus className="size-5" />
          Bulk Workout Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="workoutType">Workout Type</Label>
            <Select
              value={workoutType}
              onValueChange={(value) => setWorkoutType(value as WorkoutType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {WORKOUT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="trainingFocus">Training Focus</Label>
            <Select
              value={trainingFocus}
              onValueChange={(value) =>
                setTrainingFocus(value as TrainingFocus)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select training focus" />
              </SelectTrigger>
              <SelectContent>
                {TRAINING_FOCUSES.map((focus) => (
                  <SelectItem key={focus.value} value={focus.value}>
                    {focus.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
          <Textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Focus on compound movements', 'Include unilateral exercises', 'Equipment limited to dumbbells and bands'"
            rows={3}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          iconStart={
            isGenerating ? <Loader2 className="animate-spin" /> : <Plus />
          }
        >
          {isGenerating
            ? 'Generating 10 Workouts...'
            : 'Generate 10 Workout Examples'}
        </Button>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-semibold mb-2">What this generates:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>10 different workout examples of the selected type</li>
            <li>Each with appropriate exercises, sets, and reps</li>
            <li>Professional reasoning and explanations</li>
            <li>Ready for review and approval in the editor</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
