import { ChefHat, MoreHorizontal } from 'lucide-react'

import { MacroBadge } from '@/app/(protected)/trainer/meal-plans/creator/components/macro-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { ActiveMealPlan, AvailableMealPlan, MealPlanAction } from '../types'

interface MealPlanCardProps {
  plan: NonNullable<ActiveMealPlan | AvailableMealPlan>
  isActive: boolean
  onClick: () => void
  onAction: (
    action: MealPlanAction,
    plan: NonNullable<ActiveMealPlan | AvailableMealPlan>,
  ) => void
  loading: boolean
}

export function MealPlanCard({
  plan,
  isActive,
  onClick,
  onAction,
  loading,
}: MealPlanCardProps) {
  if (loading) {
    return <MealPlanCardSkeleton />
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isActive && 'border-primary bg-primary/5',
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="size-4 text-muted-foreground" />
              {isActive && <Badge>Active</Badge>}
            </div>
            <CardTitle className="text-lg">{plan.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                iconOnly={<MoreHorizontal />}
                onClick={(e) => e.stopPropagation()}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isActive ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction('deactivate', plan)
                  }}
                >
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onAction('activate', plan)
                  }}
                >
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onAction('delete', plan)
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Macros */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Daily Calories</div>
              <div className="text-xs text-muted-foreground">
                <MacroBadge macro="calories" value={plan.dailyCalories ?? 0} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Macros</div>
              <div className="text-xs text-muted-foreground flex gap-1">
                <MacroBadge macro="protein" value={plan.dailyProtein ?? 0} />
                <MacroBadge macro="carbs" value={plan.dailyCarbs ?? 0} />
                <MacroBadge macro="fat" value={plan.dailyFat ?? 0} />
              </div>
            </div>
          </div>

          {/* Creator */}
          {plan.createdBy && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Created by {plan.createdBy.firstName} {plan.createdBy.lastName}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MealPlanCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Skeleton className="size-8" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
