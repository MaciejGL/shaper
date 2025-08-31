'use client'

import { Calendar, Edit, Users } from 'lucide-react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GQLGetTemplatesQuery } from '@/generated/graphql-client'

export function TrainingPlansList({
  plans,
}: {
  plans: GQLGetTemplatesQuery['getTemplates']
}) {
  const drafts = plans.filter((plan) => plan.isDraft)
  const templates = plans.filter((plan) => !plan.isDraft)

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

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Drafts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((plan) => (
              <TrainingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
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
