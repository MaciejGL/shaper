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
    !dailyActual?.calories ||
    !dailyTargets.calories ||
    !dailyActual.protein ||
    !dailyTargets.protein ||
    !dailyActual.carbs ||
    !dailyTargets.carbs ||
    !dailyActual.fat ||
    !dailyTargets.fat
  )
    return null

  return (
    <div>
      <div className="text-xs mt-1.5">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="flex justify-end">
              <FlameIcon className="size-3" />
              <span>
                {Math.round(dailyActual.calories)}/
                {Math.round(dailyTargets.calories)}
              </span>
            </div>
            <Progress
              value={getProgressValue(
                dailyActual.calories,
                dailyTargets.calories,
              )}
            />
          </div>
          <div>
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.protein)}/
                {Math.round(dailyTargets.protein)}P
              </span>
            </div>
            <Progress
              value={getProgressValue(
                dailyActual.protein,
                dailyTargets.protein,
              )}
            />
          </div>
          <div>
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.carbs)}/{Math.round(dailyTargets.carbs)}
                C
              </span>
            </div>
            <Progress
              value={getProgressValue(dailyActual.carbs, dailyTargets.carbs)}
            />
          </div>
          <div>
            <div className="flex justify-end">
              <span>
                {Math.round(dailyActual.fat)}/{Math.round(dailyTargets.fat)}F
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
