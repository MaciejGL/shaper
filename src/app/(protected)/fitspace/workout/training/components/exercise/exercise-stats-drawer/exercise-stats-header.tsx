'use client'

import { DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

export function ExerciseStatsHeader({
  exerciseName,
  lastPerformedLabel,
}: {
  exerciseName: string
  lastPerformedLabel: string | null
}) {
  return (
    <DrawerHeader className="relative pb-2 border-b border-border">
      <DrawerTitle className="text-lg">{exerciseName}</DrawerTitle>
      {lastPerformedLabel ? (
        <p className="text-xs text-muted-foreground">
          Last performed {lastPerformedLabel}
        </p>
      ) : null}
    </DrawerHeader>
  )
}
