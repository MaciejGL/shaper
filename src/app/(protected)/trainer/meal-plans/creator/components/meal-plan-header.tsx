import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useMealPlanContext } from '@/context/meal-plan-context/meal-plan-context'
import { useGetMealPlanTemplatesQuery } from '@/generated/graphql-client'
import { useAutoSyncedInput } from '@/hooks/use-auto-synced-input'
import { useMealPlanDetailsMutation } from '@/hooks/use-meal-plan-details-mutation'
import { useInvalidateQuery } from '@/lib/invalidate-query'

export function MealPlanHeader({
  title,
  dailyCalories,
  dailyProtein,
}: {
  title?: string | null
  dailyCalories?: number | null
  dailyProtein?: number | null
}) {
  const {
    mealPlan,
    currentUserPermission,
    isCreator,
    isViewingOthersPlans,
    canEdit,
    isLoading,
  } = useMealPlanContext()
  const { updateDetails } = useMealPlanDetailsMutation(mealPlan?.id || '')
  const invalidateQuery = useInvalidateQuery()
  const draftInput = useAutoSyncedInput(
    mealPlan?.isDraft ?? false,
    (value) => {
      updateDetails({ isDraft: value })
      invalidateQuery({
        queryKey: useGetMealPlanTemplatesQuery.getKey(),
      })
    },
    500,
  )

  // Permission badge helper
  const getPermissionBadge = () => {
    if (isLoading) return null

    if (isCreator) {
      return null
    }

    if (isViewingOthersPlans) {
      const permissionLabel = currentUserPermission?.toLowerCase() || 'view'
      const variant = canEdit ? 'primary' : 'secondary'
      if (permissionLabel === 'view') {
        return (
          <Badge variant={variant} className="capitalize">
            View mode
          </Badge>
        )
      }
      if (permissionLabel === 'edit') {
        return (
          <Badge variant={variant} className="capitalize">
            Edit mode
          </Badge>
        )
      }
      if (permissionLabel === 'admin') {
        return (
          <Badge variant={variant} className="capitalize">
            Edit mode
          </Badge>
        )
      }
    }

    return null
  }

  return (
    <div className="bg-card/50 rounded-lg sticky -top-4 z-10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Meal Plan Creator
              {getPermissionBadge()}
            </h1>
            {title && <p className="text-muted-foreground mt-1">{title}</p>}
          </div>

          <div className="flex items-center gap-4">
            {dailyCalories && (
              <Badge variant="outline" className="flex items-center gap-1">
                {dailyCalories} kcal
              </Badge>
            )}
            {dailyProtein && (
              <Badge variant="outline" className="flex items-center gap-1">
                {dailyProtein}g protein
              </Badge>
            )}

            <div className="flex items-center justify-between bg-card-on-card/50 rounded-lg p-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="draft-toggle" className="text-sm font-medium">
                  Draft Mode
                </Label>
              </div>
              <Switch
                id="draft-toggle"
                checked={draftInput.value}
                onCheckedChange={draftInput.onChange}
                onFocus={draftInput.onFocus}
                onBlur={draftInput.onBlur}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
