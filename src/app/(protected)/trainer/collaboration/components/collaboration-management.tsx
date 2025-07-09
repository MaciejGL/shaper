'use client'

import { Edit, MoreVertical, Trash2, Users } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLCollaborationPermission,
  useMyMealPlanCollaborationsQuery,
  useMyTrainingPlanCollaborationsQuery,
  useRemoveMealPlanCollaboratorMutation,
  useRemoveTrainingPlanCollaboratorMutation,
  useUpdateMealPlanCollaboratorPermissionMutation,
  useUpdateTrainingPlanCollaboratorPermissionMutation,
} from '@/generated/graphql-client'
import { getUserDisplayName } from '@/lib/user-utils'
import { ManageCollaboratorsDialog } from './manage-collaborators-dialog'



export function CollaborationManagement() {
  const { data: trainingCollaborations, refetch: refetchTraining } =
    useMyTrainingPlanCollaborationsQuery()
  const { data: mealCollaborations, refetch: refetchMeal } =
    useMyMealPlanCollaborationsQuery()

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

  const { mutate: updateTrainingPermission } =
    useUpdateTrainingPlanCollaboratorPermissionMutation({
      onSuccess: () => {
        refetchTraining()
        toast.success('Permission updated')
      },
      onError: () => {
        toast.error('Failed to update permission')
      },
    })

  const { mutate: updateMealPermission } =
    useUpdateMealPlanCollaboratorPermissionMutation({
      onSuccess: () => {
        refetchMeal()
        toast.success('Permission updated')
      },
      onError: () => {
        toast.error('Failed to update permission')
      },
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Collaborations</h2>
      </div>

      <Tabs defaultValue="training">
        <TabsList>
          <TabsTrigger value="training">
            Training Plans
            {trainingCollaborations?.myTrainingPlanCollaborations.length && (
              <Badge variant="outline" className="ml-2">
                {trainingCollaborations.myTrainingPlanCollaborations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="meal">
            Meal Plans
            {mealCollaborations?.myMealPlanCollaborations.length && (
              <Badge variant="outline" className="ml-2">
                {mealCollaborations.myMealPlanCollaborations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <div className="space-y-4">
            {trainingCollaborations?.myTrainingPlanCollaborations.length ===
            0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No training plan collaborations
                  </p>
                </CardContent>
              </Card>
            ) : (
              trainingCollaborations?.myTrainingPlanCollaborations.map(
                (collaboration) => (
                  <Card key={collaboration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg">
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
                          <ManageCollaboratorsDialog
                            planId={collaboration.trainingPlan.id}
                            planTitle={collaboration.trainingPlan.title}
                            planType="training"
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTrainingPermission({
                                    input: {
                                      collaboratorId: collaboration.id,
                                      permission:
                                        collaboration.permission ===
                                        GQLCollaborationPermission.Edit
                                          ? GQLCollaborationPermission.View
                                          : GQLCollaborationPermission.Edit,
                                    },
                                  })
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Toggle Permission
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
                ),
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="meal">
          <div className="space-y-4">
            {mealCollaborations?.myMealPlanCollaborations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No meal plan collaborations
                  </p>
                </CardContent>
              </Card>
            ) : (
              mealCollaborations?.myMealPlanCollaborations.map(
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
                          <ManageCollaboratorsDialog
                            planId={collaboration.mealPlan.id}
                            planTitle={collaboration.mealPlan.title}
                            planType="meal"
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMealPermission({
                                    input: {
                                      collaboratorId: collaboration.id,
                                      permission:
                                        collaboration.permission ===
                                        GQLCollaborationPermission.Edit
                                          ? GQLCollaborationPermission.View
                                          : GQLCollaborationPermission.Edit,
                                    },
                                  })
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Toggle Permission
                              </DropdownMenuItem>
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
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
