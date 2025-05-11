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

// This would come from your database
const mockPlans = [
  {
    id: '1',
    title: 'Strength Building Program',
    description: 'A 12-week program focused on building overall strength',
    isPublic: true,
    isTemplate: false,
    createdAt: new Date('2023-01-15'),
    assignedCount: 5,
    weekCount: 12,
  },
  {
    id: '2',
    title: 'Hypertrophy Focus',
    description: '8-week muscle building program with progressive overload',
    isPublic: false,
    isTemplate: true,
    createdAt: new Date('2023-03-22'),
    assignedCount: 0,
    weekCount: 8,
  },
]

export function TrainingPlansList() {
  return (
    <AnimatedPageTransition id="training-plans-list">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.title}</CardTitle>
                <div className="flex gap-1">
                  {plan.isTemplate && <Badge variant="outline">Template</Badge>}
                  {plan.isPublic && <Badge>Public</Badge>}
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{plan.weekCount} weeks</span>
                {plan.assignedCount > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <Users className="mr-1 h-4 w-4" />
                    <span>Assigned to {plan.assignedCount} clients</span>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <ButtonLink
                variant="outline"
                size="sm"
                href={`/trainings/${plan.id}`}
                iconStart={<Edit className="h-4 w-4" />}
              >
                Edit
              </ButtonLink>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AnimatedPageTransition>
  )
}
