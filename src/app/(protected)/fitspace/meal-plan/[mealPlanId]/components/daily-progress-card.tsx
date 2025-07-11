import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DailyProgressCardProps {
  dailyTargets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  dailyActual: {
    calories: number
    protein: number
    carbs: number
    fat: number
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Calories</span>
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
            <div className="flex justify-between text-sm mb-1">
              <span>Protein</span>
              <span>
                {Math.round(dailyActual.protein)}g/
                {Math.round(dailyTargets.protein)}g
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
            <div className="flex justify-between text-sm mb-1">
              <span>Carbs</span>
              <span>
                {Math.round(dailyActual.carbs)}g/
                {Math.round(dailyTargets.carbs)}g
              </span>
            </div>
            <Progress
              value={getProgressValue(dailyActual.carbs, dailyTargets.carbs)}
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fat</span>
              <span>
                {Math.round(dailyActual.fat)}g/
                {Math.round(dailyTargets.fat)}g
              </span>
            </div>
            <Progress
              value={getProgressValue(dailyActual.fat, dailyTargets.fat)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
