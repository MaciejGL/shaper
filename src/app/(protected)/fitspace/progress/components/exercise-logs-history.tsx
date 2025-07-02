interface LogItemsProps {
  items: {
    monthYear: string
    logs: {
      date: string
      sets: ExerciseSet[]
      actions: React.ReactNode
    }[]
  }[]
}

export function ExerciseLogsHistory({ items }: LogItemsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="px-2">
      <div className="space-y-6 pt-6">
        {items.map(({ monthYear, logs }) => (
          <div key={monthYear}>
            <h3 className="font-semibold text-lg mb-3">{monthYear}</h3>
            {logs.map((log) => (
              <ExerciseLogItem
                key={log.date}
                date={log.date}
                sets={log.sets}
                actions={log.actions}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ExerciseSet {
  reps: number
  weight: number
  estimatedRM: number
}

export function ExerciseLogItem({
  date,
  sets,
  actions,
}: {
  date: string
  sets: ExerciseSet[]
  actions: React.ReactNode
}) {
  return (
    <div
      className={
        'flex items-start justify-between p-3 last-of-type:rounded-b-lg first-of-type:rounded-t-lg not-last-of-type:border-b border-border bg-card'
      }
    >
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-2">{date}</p>

        <div className="text-sm">
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-1 px-1">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight</span>
            <span>Est. 1RM</span>
          </div>
          <div className="space-y-1">
            {sets.map((set, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 py-1 px-1 bg-muted/30 rounded text-sm font-medium"
              >
                <span className="text-muted-foreground">{index + 1}</span>
                <span>{set.reps}</span>
                <span>{set.weight}kg</span>
                <span className="text-muted-foreground">
                  {set.estimatedRM.toFixed(1)}kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {actions}
    </div>
  )
}
