import { isNil } from 'lodash'
import { FlameIcon } from 'lucide-react'

import { Progress } from '@/components/ui/progress'

interface DailyProgressCardProps {
  dailyTargets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  dailyActual?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export function DailyProgressCard({
  dailyTargets,
  dailyActual,
}: DailyProgressCardProps) {
  const getProgressValue = (actual: number, target: number) => {
    if (target === 0) return 0
    return (actual / target) * 100
  }

  if (
    isNil(dailyActual?.calories) ||
    isNil(dailyActual?.protein) ||
    isNil(dailyActual?.carbs) ||
    isNil(dailyActual?.fat)
  )
    return null

  return (
    <div>
      <div className="text-xs text-muted-foreground mt-1.5">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex justify-end items-center">
              <span>
                {Math.round(dailyActual.calories)}
                {dailyTargets.calories
                  ? `/${Math.round(dailyTargets.calories)}`
                  : ''}
              </span>
              <FlameIcon className="size-2.5 shrink-0" />
            </div>
            <Progress
              value={getProgressValue(
                dailyActual.calories,
                dailyTargets.calories,
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.protein)}
                {dailyTargets.protein
                  ? `/${Math.round(dailyTargets.protein)}P`
                  : ''}
                P
              </span>
            </div>
            <Progress
              value={getProgressValue(
                dailyActual.protein,
                dailyTargets.protein,
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.carbs)}
                {dailyTargets.carbs ? `/${Math.round(dailyTargets.carbs)}` : ''}
                C
              </span>
            </div>
            <Progress
              value={getProgressValue(dailyActual.carbs, dailyTargets.carbs)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.fat)}
                {dailyTargets.fat ? `/${Math.round(dailyTargets.fat)}` : ''}F
              </span>
            </div>
            <Progress
              value={getProgressValue(dailyActual.fat, dailyTargets.fat)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyProgressCardSkeleton() {
  return (
    <div>
      <div className="text-xs text-muted-foreground mt-1.5">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex justify-end items-center">
              <FlameIcon className="size-3 shrink-0" />
              <span className="masked-placeholder-text rounded-md">
                1300/1300
              </span>
            </div>
            <Progress value={0} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span className="masked-placeholder-text rounded-md">
                180/180 P
              </span>
            </div>
            <Progress value={0} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span className="masked-placeholder-text rounded-md">
                180/180 C
              </span>
            </div>
            <Progress value={0} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span className="masked-placeholder-text rounded-md">
                60/60 F
              </span>
            </div>
            <Progress value={0} />
          </div>
        </div>
      </div>
    </div>
  )
}
