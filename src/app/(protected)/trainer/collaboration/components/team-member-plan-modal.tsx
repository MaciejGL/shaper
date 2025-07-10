'use client'

import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLAllPlansWithPermissionsQuery,
  GQLCollaborationPermission,
  useAllPlansWithPermissionsQuery,
  useBulkUpdatePlanPermissionsMutation,
  useMyPlanCollaboratorsQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { getUserDisplayName, getUserInitials } from '@/lib/user-utils'
import { cn } from '@/lib/utils'

interface TeamMemberPlanModalProps {
  isOpen: boolean
  onClose: () => void
  teamMember: {
    id: string
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
      email: string
    }
  }
}

export function TeamMemberPlanModal({
  isOpen,
  onClose,
  teamMember,
}: TeamMemberPlanModalProps) {
  const invalidateQueries = useInvalidateQuery()
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, GQLCollaborationPermission | null>
  >({})
  const [pendingChanges, setPendingChanges] = useState<
    Record<
      string,
      { permission: GQLCollaborationPermission | null; changed: boolean }
    >
  >({})

  // Use the new unified query instead of separate queries
  const {
    data: allPlansData,
    refetch: refetchAllPlans,
    isLoading: allPlansLoading,
  } = useAllPlansWithPermissionsQuery(
    {
      userId: teamMember.user.id,
    },
    {
      enabled: isOpen,
    },
  )

  // Mutations
  const { mutateAsync: bulkUpdatePermissions, isPending: bulkUpdateLoading } =
    useBulkUpdatePlanPermissionsMutation({
      onSuccess: () => {
        toast.success('Plan permissions updated successfully')
        setPendingChanges({})
        refetchAllPlans()
      },
      onError: (error) => {
        console.error('Error updating plan permissions:', error)
        toast.error('Failed to update plan permissions')
      },
    })

  const allPlans = useMemo(
    () => allPlansData?.allPlansWithPermissions || [],
    [allPlansData],
  )

  // Initialize selected permissions when data loads
  React.useEffect(() => {
    if (allPlans.length > 0) {
      const initialPermissions: Record<
        string,
        GQLCollaborationPermission | null
      > = {}
      allPlans.forEach((plan) => {
        initialPermissions[plan.id] = plan.currentPermission ?? null
      })
      setSelectedPermissions(initialPermissions)
    }
  }, [allPlans])

  const handlePermissionChange = (
    planId: string,
    permission: GQLCollaborationPermission | null,
  ) => {
    const plan = allPlans.find((p) => p.id === planId)
    if (!plan) return

    const originalPermission = plan.currentPermission
    const isChanged = originalPermission !== permission

    setSelectedPermissions((prev) => ({
      ...prev,
      [planId]: permission,
    }))

    setPendingChanges((prev) => ({
      ...prev,
      [planId]: {
        permission,
        changed: isChanged,
      },
    }))
  }

  const handleSaveChanges = async () => {
    const changedPlans = Object.entries(pendingChanges).filter(
      ([, data]) => data.changed,
    )

    if (changedPlans.length === 0) {
      toast.info('No changes to save')
      return
    }

    const planUpdates = changedPlans.map(([planId, data]) => {
      const plan = allPlans.find((p) => p.id === planId)
      return {
        planId,
        planType: plan?.planType || 'TRAINING',
        permission: data.permission,
        removeAccess: data.permission === null,
      }
    })

    await bulkUpdatePermissions(
      {
        input: {
          userId: teamMember.user.id,
          planUpdates,
        },
      },
      {
        onSuccess: () => {
          toast.success('Plan permissions updated successfully')
          setPendingChanges({})
          refetchAllPlans()
          invalidateQueries({
            queryKey: useMyPlanCollaboratorsQuery.getKey(),
          })
        },
      },
    )
  }

  const hasChanges = Object.values(pendingChanges).some((data) => data.changed)
  const changesDone = Object.values(pendingChanges).filter(
    (data) => data.changed,
  ).length

  const mealPlans = useMemo(
    () => allPlans.filter((plan) => plan.planType === 'MEAL'),
    [allPlans],
  )
  const trainingPlans = useMemo(
    () => allPlans.filter((plan) => plan.planType === 'TRAINING'),
    [allPlans],
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="md:max-w-2xl md:max-h-[80vh]"
        dialogTitle={`Plan Permissions - ${getUserDisplayName(teamMember.user)}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getUserInitials(teamMember.user)}
              </AvatarFallback>
            </Avatar>
            <p className="leading-normal">
              Plan Permissions - {getUserDisplayName(teamMember.user)}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto grow">
          <p className="text-sm text-muted-foreground">
            Select permissions for each plan below.
          </p>
          <div className="grow">
            <Tabs defaultValue="training">
              <TabsList>
                <TabsTrigger value="training">Training Plans</TabsTrigger>
                <TabsTrigger value="meal">Meal Plans</TabsTrigger>
              </TabsList>
              <TabsContent value="training" className="space-y-3">
                {allPlansLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonPlanCard key={index} />
                  ))}
                {!allPlansLoading && trainingPlans.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No training plans found
                  </p>
                )}
                {trainingPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selectedPermissions={selectedPermissions}
                    pendingChanges={pendingChanges}
                    handlePermissionChange={handlePermissionChange}
                  />
                ))}
              </TabsContent>
              <TabsContent value="meal" className="space-y-3">
                {allPlansLoading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonPlanCard key={index} />
                  ))}
                {!allPlansLoading && mealPlans.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No meal plans found
                  </p>
                )}
                {mealPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selectedPermissions={selectedPermissions}
                    pendingChanges={pendingChanges}
                    handlePermissionChange={handlePermissionChange}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter className="flex flex-row items-center gap-2 justify-between">
          {changesDone > 0 && (
            <div className="flex items-center gap-2">
              {/* Changes done */}
              <p className="text-sm text-muted-foreground">
                {changesDone} changes done
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || bulkUpdateLoading}
              className="ml-auto"
            >
              {bulkUpdateLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PlanCard({
  plan,
  selectedPermissions,
  pendingChanges,
  handlePermissionChange,
  className,
}: {
  plan: GQLAllPlansWithPermissionsQuery['allPlansWithPermissions'][number]
  selectedPermissions: Record<string, GQLCollaborationPermission | null>
  pendingChanges: Record<
    string,
    { permission: GQLCollaborationPermission | null; changed: boolean }
  >
  handlePermissionChange: (
    planId: string,
    permission: GQLCollaborationPermission | null,
  ) => void
  className?: string
}) {
  return (
    <Card
      key={plan.id}
      className={cn(
        'transition-colors',
        pendingChanges[plan.id]?.changed
          ? '-outline-offset-2 outline outline-primary/50'
          : 'border-muted-foreground/20',
        className,
      )}
    >
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1">
          <div className="flex justify-between w-full gap-2">
            <h3 className="font-medium">{plan.title}</h3>
            <Select
              value={selectedPermissions[plan.id] || 'none'}
              onValueChange={(value) =>
                handlePermissionChange(
                  plan.id,
                  value === 'none'
                    ? null
                    : (value as GQLCollaborationPermission),
                )
              }
            >
              <SelectTrigger variant="ghost" size="sm" className="w-28">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Access</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EDIT">Edit</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {plan.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SkeletonPlanCard() {
  return (
    <PlanCard
      plan={{
        id: `skeleton`,
        title: '',
        description: '',
        planType: 'TRAINING',
        currentPermission: null,
        isTemplate: false,
        createdAt: new Date().toISOString(),
        hasAccess: false,
      }}
      selectedPermissions={{}}
      pendingChanges={{}}
      handlePermissionChange={() => {}}
      className="animate-pulse"
    />
  )
}
