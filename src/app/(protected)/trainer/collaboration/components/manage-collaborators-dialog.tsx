'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  GQLCollaborationPermission,
  useAddMealPlanCollaboratorMutation,
  useAddTrainingPlanCollaboratorMutation,
  useMealPlanCollaboratorsQuery,
  useTrainingPlanCollaboratorsQuery,
} from '@/generated/graphql-client'
import { getUserDisplayName } from '@/lib/user-utils'

import { AddCollaboratorForm } from './add-collaborator-form'

interface ManageCollaboratorsDialogProps {
  planId: string
  planTitle: string
  planType: 'training' | 'meal'
  trigger: React.ReactNode
}

export function ManageCollaboratorsDialog({
  planId,
  planTitle,
  planType,
  trigger,
}: ManageCollaboratorsDialogProps) {
  const [open, setOpen] = useState(false)

  const { data: trainingCollaborators, refetch: refetchTraining } =
    useTrainingPlanCollaboratorsQuery(
      { trainingPlanId: planId },
      { enabled: planType === 'training' && open },
    )

  const { data: mealCollaborators, refetch: refetchMeal } =
    useMealPlanCollaboratorsQuery(
      { mealPlanId: planId },
      { enabled: planType === 'meal' && open },
    )

  const { mutate: addTrainingCollaborator } =
    useAddTrainingPlanCollaboratorMutation({
      onSuccess: () => {
        refetchTraining()
        toast.success('Collaborator added successfully')
      },
      onError: () => {
        toast.error('Failed to add collaborator')
      },
    })

  const { mutate: addMealCollaborator } = useAddMealPlanCollaboratorMutation({
    onSuccess: () => {
      refetchMeal()
      toast.success('Collaborator added successfully')
    },
    onError: () => {
      toast.error('Failed to add collaborator')
    },
  })

  const collaborators =
    planType === 'training'
      ? trainingCollaborators?.trainingPlanCollaborators || []
      : mealCollaborators?.mealPlanCollaborators || []

  const handleAddCollaborator = (
    collaboratorEmail: string,
    permission: GQLCollaborationPermission,
  ) => {
    if (planType === 'training') {
      addTrainingCollaborator({
        input: {
          trainingPlanId: planId,
          collaboratorEmail,
          permission,
        },
      })
    } else {
      addMealCollaborator({
        input: {
          mealPlanId: planId,
          collaboratorEmail,
          permission,
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent dialogTitle="Manage Collaborators" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
          <DialogDescription>
            Manage collaborators for "{planTitle}" {planType} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Current Collaborators</h3>
            {collaborators.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No collaborators added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">
                            {getUserDisplayName(collaborator.collaborator)}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {collaborator.collaborator.email}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {collaborator.permission}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Add New Collaborator</h3>
            <AddCollaboratorForm onSubmit={handleAddCollaborator} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
