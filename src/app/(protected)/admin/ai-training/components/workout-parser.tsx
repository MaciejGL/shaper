import { FileText, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { WorkoutOutput } from '@/lib/ai-training/types'

interface WorkoutParserProps {
  onWorkoutParsed: (workout: WorkoutOutput) => void
}

export function WorkoutParser({ onWorkoutParsed }: WorkoutParserProps) {
  const [workoutText, setWorkoutText] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const handleParse = async () => {
    if (!workoutText.trim()) {
      toast.error('Please paste workout data first')
      return
    }

    setIsParsing(true)
    try {
      const response = await fetch('/api/admin/ai-training/parse-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutText }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to parse workout')
      }

      const data = await response.json()
      const { workout } = data

      // Transform to WorkoutOutput format
      const parsedWorkout: WorkoutOutput = {
        exercises: workout.exercises
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((ex: any) => ex.id) // Only include matched exercises
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            createdBy: 'system',
            sets: ex.sets,
            minReps: ex.minReps,
            maxReps: ex.maxReps,
            rpe: ex.rpe,
            explanation: ex.explanation,
            equipment: ex.equipment || undefined,
            muscleGroups: ex.muscleGroups || [],
          })),
        summary: workout.summary || 'Parsed from professional program',
        reasoning: workout.reasoning || '',
      }

      const unmatchedCount =
        workout.exercises.length - parsedWorkout.exercises.length

      if (unmatchedCount > 0) {
        toast.warning(
          `Parsed ${parsedWorkout.exercises.length} exercises. ${unmatchedCount} exercises couldn't be matched to database.`,
        )
      } else {
        toast.success(
          `Successfully parsed ${parsedWorkout.exercises.length} exercises`,
        )
      }

      onWorkoutParsed(parsedWorkout)
      // Keep text in textarea so user can tweak and re-parse
    } catch (error) {
      console.error('Parse error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to parse workout',
      )
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-center gap-2">
          <FileText className="size-5" />
          Parse Existing Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="workoutText">
            Paste Workout Data (Excel, PDF, or formatted text)
          </Label>
          <Textarea
            id="workoutText"
            value={workoutText}
            onChange={(e) => setWorkoutText(e.target.value)}
            placeholder="Paste your workout here, e.g.:
            
Push #1
BARBELL BENCH PRESS    3    4-6    80%    2-3min
DUMBBELL SHOULDER PRESS    3    8-10    7    2-3min
CABLE FLYE    2    12-15    8    1-2min
..."
            rows={12}
            className="font-mono text-sm"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            AI will parse exercises, sets, reps, RPE and match them to your
            database
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleParse}
            disabled={isParsing || !workoutText.trim()}
            className="flex-1"
            iconStart={
              isParsing ? <Loader2 className="animate-spin" /> : <FileText />
            }
          >
            {isParsing ? 'Parsing...' : 'Parse Workout'}
          </Button>
          <Button
            onClick={() => setWorkoutText('')}
            disabled={isParsing || !workoutText.trim()}
            variant="outline"
            iconOnly={<X />}
            title="Clear"
          />
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-semibold mb-2">Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Works with Excel copy-paste, PDF text, or any format</li>
            <li>Include exercise names, sets, reps, RPE if available</li>
            <li>AI will match exercises to your database</li>
            <li>Review and edit the parsed result before saving</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
