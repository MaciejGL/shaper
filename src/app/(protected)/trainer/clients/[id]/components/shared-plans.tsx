import {
  Calendar,
  LucideFilePlus2,
  LucideList,
  MoreVertical,
  Trash2Icon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLGetClientByIdQuery,
  useGetClientByIdQuery,
  useRemoveTrainingPlanFromClientMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { AssignPlanDialog } from './plan-assignment/assignment-dialog'

type SharedPlansWithClientProps = {
  plans: GQLGetClientByIdQuery['getClientTrainingPlans']
  clientName: string
  clientId: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
}

export function SharedPlansWithClient({
  plans,
  clientName,
  clientId,
  activePlan,
}: SharedPlansWithClientProps) {
  return (
    <Card className="@container/shared-plans" borderless>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-2xl font-semibold">Assigned Plans</CardTitle>
        <div className="flex gap-2">
          <AssignPlanDialog
            clientName={clientName}
            clientId={clientId}
            activePlan={activePlan}
            trigger={
              <Button
                variant="outline"
                size="icon-sm"
                iconOnly={<LucideFilePlus2 />}
              />
            }
          />
          {plans.length > 3 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  iconOnly={<LucideList />}
                />
              </DialogTrigger>
              <DialogContent dialogTitle="Assigned Plans">
                <DialogTitle>Assigned Plans</DialogTitle>
                <DialogDescription className="grid gap-6">
                  {plans.map((plan) => (
                    <TrainingCard
                      key={plan.id}
                      plan={plan}
                      clientName={clientName}
                    />
                  ))}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {plans.length > 0 ? (
          <div className="grid gap-6 @3xl/shared-plans:grid-cols-2">
            {plans.slice(0, 3).map((plan) => (
              <TrainingCard key={plan.id} plan={plan} clientName={clientName} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No plans assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TrainingCard({
  plan,
  clientName,
}: {
  plan: GQLGetClientByIdQuery['getClientTrainingPlans'][number]
  clientName: string
}) {
  const invalidateQuery = useInvalidateQuery()
  const params = useParams<{ id: string }>()
  const { openModal } = useConfirmationModalContext()
  const { mutateAsync: removeTrainingPlanFromClient, isPending } =
    useRemoveTrainingPlanFromClientMutation({
      onSuccess: () => {
        toast.success('Training plan removed from client')

        invalidateQuery({
          queryKey: useGetClientByIdQuery.getKey({ id: params.id }),
        })
      },
    })

  const handleRemoveTrainingPlanFromClient = async () => {
    openModal({
      title: 'Remove Training Plan',
      description: `Are you sure you want to remove ${plan.title} from ${clientName}?`,
      onConfirm: () => {
        removeTrainingPlanFromClient({
          clientId: params.id,
          planId: plan.id,
        })
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{plan.title}</CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                iconOnly={<MoreVertical />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleRemoveTrainingPlanFromClient}
                loading={isPending}
              >
                <Trash2Icon className="size-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Calendar className="size-4" />
            <span>{plan.weekCount} weeks</span>
          </Badge>
          {plan.active && <Badge variant="primary">Active</Badge>}
        </div>
      </CardFooter>
    </Card>
  )
}
