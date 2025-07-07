import { ExerciseLogsHistory } from './exercise-logs-history'
import { ExerciseProgress } from './exercise-progress-constants'

// Component to handle exercise logs display
export function ExerciseLogsContent({
  exercise,
}: {
  exercise: ExerciseProgress
}) {
  const exerciseLogs = exercise.estimated1RMProgress || []

  // Transform the data into the format expected by LogItems
  const groupedLogs = exerciseLogs.reduce(
    (
      acc: Record<
        string,
        {
          date: string
          sets: { reps: number; weight: number; estimatedRM: number }[]
          actions: React.ReactNode
        }[]
      >,
      entry,
    ) => {
      const date = new Date(entry.date)
      const monthYear = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })

      if (!acc[monthYear]) {
        acc[monthYear] = []
      }

      // Create one log entry per workout day with structured sets data
      const displayDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      })

      // Transform detailed logs into structured sets data
      const sets = entry.detailedLogs.map((log) => ({
        reps: log.reps || 0,
        weight: log.weight || 0,
        estimatedRM: log.estimated1RM,
      }))

      acc[monthYear].push({
        date: displayDate,
        sets,
        actions: null, // No actions needed for now
      })

      return acc
    },
    {},
  )

  // Convert to the array format expected by LogItems
  const logItems = Object.entries(groupedLogs)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort by most recent first
    .map(([monthYear, logs]) => ({
      monthYear,
      logs: [...logs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ), // Sort logs within month by most recent first
    }))

  if (logItems.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No exercise logs found for this exercise.
      </div>
    )
  }

  return <ExerciseLogsHistory items={logItems} />
}
