'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { GQLGetMyMacroTargetsQuery } from '@/generated/graphql-client'

interface MacroSummaryCardProps {
  macroTargets?: GQLGetMyMacroTargetsQuery['getMyMacroTargets'] | null
  isLoading?: boolean
}

export function MacroSummaryCard({
  macroTargets,
  isLoading,
}: MacroSummaryCardProps) {
  if (isLoading) {
    return <MacroSummaryCardSkeleton />
  }

  if (!macroTargets) {
    return null
  }

  const { calories, protein, carbs, fat } = macroTargets

  const proteinKcal = (protein ?? 0) * 4
  const carbsKcal = (carbs ?? 0) * 4
  const fatKcal = (fat ?? 0) * 9
  const maxKcal = Math.max(proteinKcal, carbsKcal, fatKcal)

  const proteinFill = maxKcal > 0 ? (proteinKcal / maxKcal) * 100 : 0
  const carbsFill = maxKcal > 0 ? (carbsKcal / maxKcal) * 100 : 0
  const fatFill = maxKcal > 0 ? (fatKcal / maxKcal) * 100 : 0

  return (
    <Card className="shadow-xs">
      <CardContent>
        <div className="text-center space-y-1">
          <p className="text-xl text-foreground font-bold">
            {calories ?? 0} kcal
          </p>
          <div className="text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 w-full">
            <p className="text-blue-500">P {Math.round(protein ?? 0)}</p>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <p className="text-green-500">C {Math.round(carbs ?? 0)}</p>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <p className="text-yellow-500">F {Math.round(fat ?? 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-1">
          <Progress
            value={proteinFill}
            className="bg-blue-500/20 transform-[scaleX(-1)]"
            classNameIndicator="bg-blue-500"
          />
          <Progress
            value={carbsFill}
            className="bg-green-500/20"
            classNameIndicator="bg-green-500"
          />
          <Progress
            value={fatFill}
            className="bg-yellow-500/20"
            classNameIndicator="bg-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MacroSummaryCardSkeleton() {
  return (
    <div className="bg-card dark:bg-secondary rounded-2xl p-4 space-y-3">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}
