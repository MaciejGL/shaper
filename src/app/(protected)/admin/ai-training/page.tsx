'use client'

import {
  AlertTriangle,
  Download,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  GQLRepFocus,
  GQLRpeRange,
  useAdminGenerateAiWorkoutMutation,
} from '@/generated/graphql-client'
// Remove direct import - use API instead
import type {
  RepFocus,
  RpeRange,
  TrainingExample,
  WorkoutInput,
  WorkoutOutput,
} from '@/lib/ai-training/types'

import { BulkWorkoutGenerator } from './components/bulk-workout-generator'
import { BulkWorkoutReviewer } from './components/bulk-workout-reviewer'
import { ParametersForm } from './components/parameters-form'
import { StatsDisplay } from './components/stats-display'
import { UnmatchedExercisesModal } from './components/unmatched-exercises-modal'
import { WorkoutEditor } from './components/workout-editor'
import { WorkoutParser } from './components/workout-parser'
import { useTrainingStats } from './hooks/use-training-stats'

export default function AITrainingPage() {
  const { stats, refreshStats } = useTrainingStats()

  // Mode state
  const [mode, setMode] = useState<'generate' | 'parse' | 'bulk'>('generate')
  const [unmatchedModalOpen, setUnmatchedModalOpen] = useState(false)

  // Workout generation state
  const [generatedWorkout, setGeneratedWorkout] =
    useState<WorkoutOutput | null>(null)
  const [bulkWorkouts, setBulkWorkouts] = useState<WorkoutOutput[] | null>(null)
  const [workoutInput, setWorkoutInput] = useState<WorkoutInput>({
    selectedMuscleGroups: [],
    selectedEquipment: [],
    exerciseCount: 5,
    maxSetsPerExercise: 3,
    rpeRange: 'RPE_7_8' as RpeRange,
    repFocus: 'HYPERTROPHY' as RepFocus,
  })

  // Editing state
  const [editedWorkout, setEditedWorkout] = useState<WorkoutOutput | null>(null)
  const [notes, setNotes] = useState('')

  // Use generated mutation hook
  const { mutateAsync: generateAiWorkout, isPending: isGenerating } =
    useAdminGenerateAiWorkoutMutation()

  const handleGenerateWorkout = async () => {
    try {
      // Map frontend types to GraphQL enum values
      const rpeRangeMap: Record<RpeRange, GQLRpeRange> = {
        RPE_6_7: GQLRpeRange.Rpe_6_7,
        RPE_7_8: GQLRpeRange.Rpe_7_8,
        RPE_8_10: GQLRpeRange.Rpe_8_10,
      }

      const repFocusMap: Record<RepFocus, GQLRepFocus> = {
        STRENGTH: GQLRepFocus.Strength,
        HYPERTROPHY: GQLRepFocus.Hypertrophy,
        ENDURANCE: GQLRepFocus.Endurance,
      }

      const result = await generateAiWorkout({
        input: {
          selectedMuscleGroups: workoutInput.selectedMuscleGroups,
          selectedEquipment: workoutInput.selectedEquipment,
          exerciseCount: workoutInput.exerciseCount,
          maxSetsPerExercise: workoutInput.maxSetsPerExercise,
          rpeRange: rpeRangeMap[workoutInput.rpeRange],
          repFocus: repFocusMap[workoutInput.repFocus],
        },
      })

      // Use first variant for admin training (we just need one example)
      const firstVariant = result.generateAiWorkout.variants[0]
      if (!firstVariant) {
        throw new Error('No workout variant returned')
      }

      // Transform to our format
      const workout: WorkoutOutput = {
        exercises: firstVariant.exercises.map((ex) => {
          // Get first set for defaults (all sets should have same reps/RPE in training data)
          const firstSet = ex.sets[0] || { minReps: 8, maxReps: 15, rpe: 7 }

          return {
            id: ex.exercise.id,
            name: ex.exercise.name,
            createdBy: 'system',
            sets: ex.sets.length,
            minReps: firstSet.minReps ?? 8,
            maxReps: firstSet.maxReps ?? 15,
            rpe: firstSet.rpe ?? 7,
            explanation: '', // Will be added manually during review
            equipment: ex.exercise.equipment || undefined,
            muscleGroups: ex.exercise.muscleGroups.map((m) => m.name),
          }
        }),
        summary: firstVariant.summary || 'Generated workout',
        reasoning:
          firstVariant.reasoning ||
          'Review and improve this workout before saving',
      }

      setGeneratedWorkout(workout)
      setEditedWorkout(workout)

      toast.success(
        `Workout generated (${workout.exercises.length} exercises from ${firstVariant.name})`,
      )
    } catch (error) {
      console.error('Error generating workout:', error)
      toast.error(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const handleWorkoutParsed = (workout: WorkoutOutput) => {
    setGeneratedWorkout(workout)
    setEditedWorkout(workout)
  }

  const handleBulkWorkoutsGenerated = (workouts: WorkoutOutput[]) => {
    setBulkWorkouts(workouts)
  }

  const handleBulkWorkoutsApproved = async (
    approvedWorkouts: WorkoutOutput[],
  ) => {
    try {
      const trainingExamples: TrainingExample[] = approvedWorkouts.map(
        (workout) => ({
          id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          input: workoutInput, // Use current input as template
          output: workout,
          approved: true,
          createdAt: new Date().toISOString(),
        }),
      )

      // Save training examples via API
      const response = await fetch('/api/admin/ai-training/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examples: trainingExamples }),
      })

      if (!response.ok) {
        throw new Error('Failed to save training examples')
      }
      setBulkWorkouts(null)
      refreshStats()
      toast.success(`Saved ${approvedWorkouts.length} approved workouts`)
    } catch (error) {
      console.error('Error saving bulk workouts:', error)
      toast.error('Failed to save approved workouts')
    }
  }

  const handleBulkCancel = () => {
    setBulkWorkouts(null)
  }

  const saveExample = async (approved: boolean) => {
    if (!editedWorkout || !generatedWorkout) return

    const example: TrainingExample = {
      id: `example-${Date.now()}`,
      createdAt: new Date().toISOString(),
      input: workoutInput,
      output: editedWorkout,
      notes,
      approved,
    }

    try {
      const response = await fetch('/api/admin/ai-training/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examples: [example] }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success(approved ? 'Example approved' : 'Example saved')

      // Reset state
      setGeneratedWorkout(null)
      setEditedWorkout(null)
      setNotes('')
      refreshStats()
    } catch (error) {
      toast.error('Failed to save training example')
    }
  }

  const exportTrainingData = async () => {
    try {
      const response = await fetch('/api/admin/ai-training/export')

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workout-training-${Date.now()}.jsonl`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Training data downloaded')
    } catch (error) {
      toast.error('Failed to export training data')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Workout Training</h1>
          <p className="text-muted-foreground">
            Generate, review, and approve training examples for fine-tuning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setUnmatchedModalOpen(true)}
            variant="outline"
            iconStart={<AlertTriangle />}
          >
            Unmatched Exercises
          </Button>
          <Button
            onClick={exportTrainingData}
            iconStart={<Download />}
            disabled={!stats || stats.approved === 0}
          >
            Export JSONL
          </Button>
        </div>
      </div>

      <StatsDisplay stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Generation or Parse Form */}
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'generate' ? 'default' : 'outline'}
              onClick={() => setMode('generate')}
              iconStart={<Sparkles />}
              className="flex-1"
            >
              Generate
            </Button>
            <Button
              variant={mode === 'parse' ? 'default' : 'outline'}
              onClick={() => setMode('parse')}
              iconStart={<Download />}
              className="flex-1"
            >
              Parse Existing
            </Button>
            <Button
              variant={mode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setMode('bulk')}
              iconStart={<Plus />}
              className="flex-1"
            >
              Bulk Generate
            </Button>
          </div>

          {mode === 'generate' ? (
            <Card>
              <CardHeader>
                <CardTitle>Generate Workout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ParametersForm
                  input={workoutInput}
                  onChange={setWorkoutInput}
                />

                <Button
                  onClick={handleGenerateWorkout}
                  loading={isGenerating}
                  disabled={isGenerating}
                  iconStart={<Sparkles />}
                  className="w-full"
                >
                  Generate Workout
                </Button>
              </CardContent>
            </Card>
          ) : mode === 'parse' ? (
            <WorkoutParser onWorkoutParsed={handleWorkoutParsed} />
          ) : (
            <BulkWorkoutGenerator
              onWorkoutsGenerated={handleBulkWorkoutsGenerated}
            />
          )}
        </div>

        {/* Right: Generated Workout Editor or Bulk Reviewer */}
        <div>
          {bulkWorkouts ? (
            <BulkWorkoutReviewer
              workouts={bulkWorkouts}
              onWorkoutsApproved={handleBulkWorkoutsApproved}
              onCancel={handleBulkCancel}
            />
          ) : (
            editedWorkout && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Edit Workout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Combined Workout Editor */}
                  <WorkoutEditor
                    workout={editedWorkout}
                    onChange={setEditedWorkout}
                  />

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this example..."
                      rows={2}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      onClick={() => saveExample(true)}
                      iconStart={<Save />}
                      className="flex-1"
                    >
                      Approve & Save
                    </Button>
                    <Button
                      onClick={() => saveExample(false)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Save Draft
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedWorkout(null)
                        setEditedWorkout(null)
                        setNotes('')
                      }}
                      variant="outline"
                      iconOnly={<RotateCcw />}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      {/* Unmatched Exercises Modal */}
      <UnmatchedExercisesModal
        open={unmatchedModalOpen}
        onOpenChange={setUnmatchedModalOpen}
      />
    </div>
  )
}
