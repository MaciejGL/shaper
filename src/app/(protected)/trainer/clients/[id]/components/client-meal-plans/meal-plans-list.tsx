import { useQueryClient } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import {
  Calendar,
  Edit,
  MoreVertical,
  Target,
  Trash2,
  Utensils,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLGetClientByIdQuery,
  useGetClientByIdQuery,
  useRemoveMealPlanFromClientMutation,
} from '@/generated/graphql-client'

type MealPlansListProps = {
  clientId: string
}

export function MealPlansList({ clientId }: MealPlansListProps) {
  const { data, isLoading } = useGetClientByIdQuery({
    id: clientId,
  })

  const mealPlans = data?.getClientMealPlans || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (mealPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted dark:bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Meal Plans</h3>
        <p className="text-muted-foreground text-sm">
          This client doesn't have any meal plans assigned yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {mealPlans.map((plan) => (
        <MealPlanCard key={plan.id} plan={plan} clientId={clientId} />
      ))}
    </div>
  )
}

function MealPlanCard({
  plan,
  clientId,
}: {
  plan: NonNullable<GQLGetClientByIdQuery['getClientMealPlans']>[number]
  clientId: string
}) {
  const { openModal } = useConfirmationModalContext()
  const queryClient = useQueryClient()

  const { mutateAsync: removeMealPlan, isPending: isRemoving } =
    useRemoveMealPlanFromClientMutation({
      onSuccess: () => {
        toast.success('Meal plan removed successfully')
        // Invalidate the client query to refresh the meal plans
        queryClient.invalidateQueries({
          queryKey: useGetClientByIdQuery.getKey({ id: clientId }),
        })
      },
    })

  // Can only remove plans with 1 week or less
  const canRemove = plan.weekCount <= 1

  const handleRemove = async () => {
    openModal({
      title: 'Remove Meal Plan',
      description: `Are you sure you want to remove "${plan.title}" from this client? This action cannot be undone.`,
      confirmText: 'Remove',
      variant: 'destructive',
      onConfirm: async () => {
        await removeMealPlan({
          planId: plan.id,
          clientId,
        })
      },
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plan.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {plan.isDraft && <Badge variant="outline">Draft</Badge>}
              {plan.active && <Badge variant="secondary">Active</Badge>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" disabled={isRemoving}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/trainer/meal-plans/creator/${plan.id}`}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Link>
                </DropdownMenuItem>
                {canRemove && (
                  <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-destructive focus:text-destructive"
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Plan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{plan.weekCount} weeks</span>
          </div>

          {plan.dailyCalories && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{plan.dailyCalories} kcal/day</span>
            </div>
          )}

          {plan.dailyProtein && (
            <div className="flex items-center gap-1">
              <span>{plan.dailyProtein}g protein</span>
            </div>
          )}

          {plan.startDate && (
            <div className="flex items-center gap-1">
              <span>Started: {formatDate(plan.startDate, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {!canRemove && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground italic">
              Plans with more than 1 week cannot be removed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
