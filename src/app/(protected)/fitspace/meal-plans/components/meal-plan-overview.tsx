import { BigMacroBadge } from '@/app/(protected)/trainer/meal-plans/creator/components/macro-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ActiveMealPlan, AvailableMealPlan } from '../types'

interface MealPlanOverviewProps {
  plan: NonNullable<ActiveMealPlan | AvailableMealPlan>
}

export function MealPlanOverview({ plan }: MealPlanOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {plan.active && (
          <Badge
            variant="secondary"
            className="bg-primary text-primary-foreground"
          >
            Active
          </Badge>
        )}
      </div>

      {plan.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}

      {/* Daily Targets */}
      <Card className="bg-card-on-card">
        <CardHeader>
          <CardTitle className="text-base">Daily Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Calories</div>
              <BigMacroBadge macro="calories" value={plan.dailyCalories ?? 0} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Macros</div>
              <div className="flex items-center gap-2">
                <BigMacroBadge macro="protein" value={plan.dailyProtein ?? 0} />
                <BigMacroBadge macro="carbs" value={plan.dailyCarbs ?? 0} />
                <BigMacroBadge macro="fat" value={plan.dailyFat ?? 0} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
