'use client'

import { ExternalLink, MoreVertical, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
  useMyMealPlanCollaborationsQuery,
  useMyTrainingPlanCollaborationsQuery,
  useRemoveMealPlanCollaboratorMutation,
  useRemoveTrainingPlanCollaboratorMutation,
} from '@/generated/graphql-client'
import { getUserDisplayName } from '@/lib/user-utils'

import { LoadingSkeleton } from './loading-skeleton'

export function SharedWithMe() {
  const {
    data: trainingCollaborations,
    refetch: refetchTraining,
    isLoading: isLoadingTraining,
  } = useMyTrainingPlanCollaborationsQuery()
  const {
    data: mealCollaborations,
    refetch: refetchMeal,
    isLoading: isLoadingMeal,
  } = useMyMealPlanCollaborationsQuery()

  const { mutate: removeTrainingCollaborator } =
    useRemoveTrainingPlanCollaboratorMutation({
      onSuccess: () => {
        refetchTraining()
        toast.success('Collaborator removed')
      },
      onError: () => {
        toast.error('Failed to remove collaborator')
      },
    })

  const { mutate: removeMealCollaborator } =
    useRemoveMealPlanCollaboratorMutation({
      onSuccess: () => {
        refetchMeal()
        toast.success('Collaborator removed')
      },
      onError: () => {
        toast.error('Failed to remove collaborator')
      },
    })

  const trainingCollaborationCount =
    trainingCollaborations?.myTrainingPlanCollaborations.length || 0
  const mealCollaborationCount =
    mealCollaborations?.myMealPlanCollaborations.length || 0

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Training Plans{' '}
            {trainingCollaborationCount > 0 && (
              <Badge className="ml-2 rounded-full">
                {trainingCollaborationCount}
              </Badge>
            )}
          </h2>
        </div>

        <div className="space-y-4">
          {isLoadingTraining ? <LoadingSkeleton count={3} /> : null}
          {!isLoadingTraining &&
          trainingCollaborations?.myTrainingPlanCollaborations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No training plan collaborations
                </p>
              </CardContent>
            </Card>
          ) : null}
          {!isLoadingTraining &&
          (trainingCollaborations?.myTrainingPlanCollaborations.length ?? 0) > 0
            ? trainingCollaborations?.myTrainingPlanCollaborations.map(
                (collaboration) => (
                  <Link
                    key={collaboration.id}
                    href={`/trainer/trainings/creator/${collaboration.trainingPlan.id}`}
                    className="block"
                  >
                    <Card
                      key={collaboration.id}
                      className="group/card cursor-pointer hover:bg-card-on-card transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <CardTitle className="text-lg group-hover/card:underline group-hover/card:underline-offset-2 decoration-1 decoration-zinc-500/80 transition-all">
                                {collaboration.trainingPlan.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Collaborating with{' '}
                                <span className="font-medium">
                                  {getUserDisplayName(collaboration.addedBy)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {collaboration.permission}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Link
                                    href={`/trainer/trainings/creator/${collaboration.trainingPlan.id}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    View Training
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    removeTrainingCollaborator({
                                      input: {
                                        collaboratorId: collaboration.id,
                                      },
                                    })
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Leave Collaboration
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ),
              )
            : null}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Meal Plans{' '}
            {mealCollaborationCount > 0 && (
              <Badge className="ml-2 rounded-full">
                {mealCollaborationCount}
              </Badge>
            )}
          </h2>
        </div>

        <div className="space-y-4">
          {isLoadingMeal ? <LoadingSkeleton count={3} /> : null}
          {!isLoadingMeal &&
          mealCollaborations?.myMealPlanCollaborations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No meal plan collaborations
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!isLoadingMeal &&
          (mealCollaborations?.myMealPlanCollaborations.length ?? 0) > 0
            ? mealCollaborations?.myMealPlanCollaborations.map(
                (collaboration) => (
                  <Card key={collaboration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg">
                              {collaboration.mealPlan.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Collaborating with{' '}
                              <span className="font-medium">
                                {getUserDisplayName(collaboration.addedBy)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {collaboration.permission}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  removeMealCollaborator({
                                    input: {
                                      collaboratorId: collaboration.id,
                                    },
                                  })
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Leave Collaboration
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ),
              )
            : null}
        </div>
      </div>
    </div>
  )
}
