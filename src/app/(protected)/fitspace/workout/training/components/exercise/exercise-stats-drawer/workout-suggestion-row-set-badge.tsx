interface WorkoutSuggestionRowSetBadgeProps {
  order: number
}

export function WorkoutSuggestionRowSetBadge({
  order,
}: WorkoutSuggestionRowSetBadgeProps) {
  return (
    <div className="dark text-xs font-medium tabular-nums text-muted-foreground flex-center size-10 bg-black/90 rounded-xl flex flex-col">
      <span className="text-sm font-semibold text-foreground">{order}</span>
      <span className="text-[10px] tabular-nums uppercase text-muted-foreground shrink-0">
        Set
      </span>
    </div>
  )
}

