'use client'

import { EditIcon, Share2Icon, Trash2Icon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NutritionPlan {
  id: string
  name: string
  description?: string | null
  isSharedWithClient: boolean
  createdAt: string
  dayCount: number
  totalMealCount: number
}

interface NutritionPlanCardProps {
  plan: NutritionPlan
  onToggleSharing: (planId: string, isShared: boolean) => void
  onDelete: (planId: string) => void
}

export function NutritionPlanCard({
  plan,
  onToggleSharing,
  onDelete,
}: NutritionPlanCardProps) {
  const isPending = plan.id.startsWith('temp-')

  return (
    <Card
      borderless
      className={cn(
        'overflow-hidden transition-colors py-0',
        isPending ? 'bg-muted/30' : 'hover:bg-muted/50',
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4
              className={cn(
                'font-medium',
                isPending && 'text-muted-foreground',
              )}
            >
              {plan.name}
              {isPending && <span className="ml-2 text-xs">(Creating...)</span>}
            </h4>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {plan.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Created{' '}
              {new Date(plan.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <Badge
            variant={
              isPending
                ? 'secondary'
                : plan.isSharedWithClient
                  ? 'success'
                  : 'outline'
            }
          >
            {isPending
              ? 'Creating...'
              : plan.isSharedWithClient
                ? 'Shared'
                : 'Draft'}
          </Badge>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="p-3 flex items-center justify-between">
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => onDelete(plan.id)}
          iconOnly={<Trash2Icon />}
        >
          Delete
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={plan.isSharedWithClient ? 'secondary' : 'default'}
            disabled={isPending}
            onClick={() => onToggleSharing(plan.id, plan.isSharedWithClient)}
            iconStart={
              <Share2Icon
                className={cn(plan.isSharedWithClient && 'text-green-500')}
              />
            }
          >
            {plan.isSharedWithClient ? 'Unshare' : 'Share'}
          </Button>

          <ButtonLink
            href={isPending ? '#' : `/trainer/nutrition-plans/${plan.id}`}
            size="sm"
            variant="secondary"
            disabled={isPending}
            iconStart={<EditIcon />}
          >
            Edit
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}
