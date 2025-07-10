'use client'

import { Calendar, Edit, UserPlus, Users } from 'lucide-react'

import { ManageCollaboratorsDialog } from '@/app/(protected)/trainer/collaboration/components/manage-collaborators-dialog'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { TrainingPlanCollaboratorList } from '@/components/collaborator-list'
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
import {
  GQLGetCollaborationTemplatesQuery,
  GQLGetTemplatesQuery,
} from '@/generated/graphql-client'
import { getDisplayName } from '@/lib/user-utils'

export function TrainingPlansList({
  plans,
  collaborationPlans,
}: {
  plans: GQLGetTemplatesQuery['getTemplates']
  collaborationPlans: GQLGetCollaborationTemplatesQuery['getCollaborationTemplates']
}) {
  const drafts = plans.filter((plan) => plan.isDraft)
  const templates = plans.filter((plan) => !plan.isDraft)
  const collaborationDrafts = collaborationPlans.filter((plan) => plan.isDraft)
  const collaborationTemplates = collaborationPlans.filter(
    (plan) => !plan.isDraft,
  )

  return (
    <AnimatedPageTransition id="training-plans-list">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No templates found. Create a new template or mark drafts as
                ready to get started.
              </p>
            )}
            {templates.map((plan) => (
              <TrainingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {collaborationTemplates.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Collaboration Plans</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collaborationTemplates.map((plan) => (
                <CollaborationTrainingCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Drafts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((plan) => (
              <TrainingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {collaborationDrafts.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Collaboration Drafts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collaborationDrafts.map((plan) => (
                <CollaborationTrainingCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedPageTransition>
  )
}

export function TrainingCard({
  plan,
}: {
  plan: GQLGetTemplatesQuery['getTemplates'][number]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{plan.title}</CardTitle>
          <div className="flex gap-1">
            {plan.isDraft && <Badge variant="outline">Draft</Badge>}
            {plan.isPublic && <Badge>Public</Badge>}
          </div>
        </div>
        <CardDescription>
          <p className="line-clamp-2">{plan.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Badge variant="outline">
            <Calendar className="size-4" />
            {plan.weekCount} weeks
          </Badge>
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
          planType="training"
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
          href={`./trainings/creator/${plan.id}`}
          iconStart={<Edit className="h-4 w-4" />}
        >
          Edit
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}

export function CollaborationTrainingCard({
  plan,
}: {
  plan: GQLGetCollaborationTemplatesQuery['getCollaborationTemplates'][number]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{plan.title}</CardTitle>
          <div className="flex gap-1">
            {plan.isDraft && <Badge variant="outline">Draft</Badge>}
            {plan.isPublic && <Badge>Public</Badge>}
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
        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
          <Badge variant="outline">
            <Calendar className="size-4" />
            {plan.weekCount} weeks
          </Badge>
          {plan.assignedCount > 0 && (
            <Badge variant="outline">
              <Users className="size-4" />
              <span>Assigned to {plan.assignedCount} clients</span>
            </Badge>
          )}
        </div>
        {plan.collaborators && plan.collaborators.length > 0 && (
          <TrainingPlanCollaboratorList
            collaborators={plan.collaborators}
            maxVisible={2}
            showPermissions={true}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        <ManageCollaboratorsDialog
          planId={plan.id}
          planTitle={plan.title}
          planType="training"
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
          href={`./trainings/creator/${plan.id}`}
          iconStart={<Edit className="h-4 w-4" />}
        >
          Edit
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
