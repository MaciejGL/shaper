'use client'

import { Calendar, Edit, Target, UserPlus, Users } from 'lucide-react'

import { ManageCollaboratorsDialog } from '@/app/(protected)/trainer/collaboration/components/manage-collaborators-dialog'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { MealPlanCollaboratorList } from '@/components/collaborator-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import {
  GQLGetCollaborationMealPlanTemplatesQuery,
  GQLGetMealPlanTemplatesQuery,
} from '@/generated/graphql-client'
import { useUserPermissions } from '@/lib/collaboration-utils'
import { getDisplayName } from '@/lib/user-utils'

export function MealPlansList({
  plans,
  collaborationPlans,
  isLoading,
}: {
  plans: GQLGetMealPlanTemplatesQuery['getMealPlanTemplates']
  collaborationPlans: GQLGetCollaborationMealPlanTemplatesQuery['getCollaborationMealPlanTemplates']
  isLoading?: boolean
}) {
  const drafts = plans.filter((plan) => plan.isDraft)
  const templates = plans.filter((plan) => !plan.isDraft)
  const collaborationDrafts = collaborationPlans.filter((plan) => plan.isDraft)
  const collaborationTemplates = collaborationPlans.filter(
    (plan) => !plan.isDraft,
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Meal Plans</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AnimatedPageTransition id="meal-plans-list">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Meal Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No meal plans found. Create a new meal plan or mark drafts as
                ready to get started.
              </p>
            )}
            {templates.map((plan) => (
              <MealPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {collaborationTemplates.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Collaboration Meal Plans</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collaborationTemplates.map((plan) => (
                <CollaborationMealPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Drafts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.length === 0 && (
              <p className="text-sm text-muted-foreground">No drafts found.</p>
            )}
            {drafts.map((plan) => (
              <MealPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {collaborationDrafts.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Collaboration Drafts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collaborationDrafts.map((plan) => (
                <CollaborationMealPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedPageTransition>
  )
}

export function MealPlanCard({
  plan,
}: {
  plan: GQLGetMealPlanTemplatesQuery['getMealPlanTemplates'][number]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{plan.title}</CardTitle>
          <div className="flex gap-1">
            {plan.isDraft && <Badge variant="outline">Draft</Badge>}
          </div>
        </div>
        <CardDescription>
          <p className="line-clamp-2">{plan.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
          <Badge variant="outline">
            <Calendar className="size-4" />
            {plan.weekCount} weeks
          </Badge>
          {plan.dailyCalories && (
            <Badge variant="outline">
              <Target className="size-4" />
              {plan.dailyCalories} cal/day
            </Badge>
          )}
          {plan.assignedCount > 0 && (
            <Badge variant="outline">
              <Users className="size-4" />
              <span>Assigned to {plan.assignedCount} clients</span>
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        <ManageCollaboratorsDialog
          planId={plan.id}
          planTitle={plan.title}
          planType="meal"
          trigger={
            <Button
              variant="ghost"
              size="sm"
              iconStart={<UserPlus className="h-4 w-4" />}
            >
              Collaborate
              {plan.collaboratorCount > 0 && ` (${plan.collaboratorCount})`}
            </Button>
          }
        />
        <ButtonLink
          variant="outline"
          size="sm"
          href={`./meal-plans/creator/${plan.id}`}
          iconStart={<Edit className="h-4 w-4" />}
        >
          Edit
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}

export function CollaborationMealPlanCard({
  plan,
}: {
  plan: GQLGetCollaborationMealPlanTemplatesQuery['getCollaborationMealPlanTemplates'][number]
}) {
  const { user } = useUser()

  // Check if current user has ADMIN permission on this plan
  const { hasAdmin } = useUserPermissions(plan, user)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{plan.title}</CardTitle>
          <div className="flex gap-1">
            {plan.isDraft && <Badge variant="outline">Draft</Badge>}
            <Badge variant="secondary">Collaboration</Badge>
          </div>
        </div>
        <CardDescription>
          <p className="line-clamp-2">{plan.description}</p>
          {plan.createdBy && (
            <p className="text-xs text-muted-foreground mt-1">
              Created by {getDisplayName(plan.createdBy)}
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap mb-3">
          <Badge variant="outline">
            <Calendar className="size-4" />
            {plan.weekCount} weeks
          </Badge>
          {plan.dailyCalories && (
            <Badge variant="outline">
              <Target className="size-4" />
              {plan.dailyCalories} cal/day
            </Badge>
          )}
          {plan.assignedCount > 0 && (
            <Badge variant="outline">
              <Users className="size-4" />
              <span>Assigned to {plan.assignedCount} clients</span>
            </Badge>
          )}
        </div>
        {plan.collaborators && plan.collaborators.length > 0 && (
          <MealPlanCollaboratorList
            collaborators={plan.collaborators}
            maxVisible={2}
            showPermissions={true}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        {hasAdmin && (
          <ManageCollaboratorsDialog
            planId={plan.id}
            planTitle={plan.title}
            planType="meal"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                iconStart={<UserPlus className="h-4 w-4" />}
              >
                Collaborate
                {plan.collaboratorCount > 0 && ` (${plan.collaboratorCount})`}
              </Button>
            }
          />
        )}
        <ButtonLink
          variant="secondary"
          size="sm"
          href={`./meal-plans/creator/${plan.id}`}
          iconStart={<Edit className="h-4 w-4" />}
          className="ml-auto"
        >
          Edit
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
