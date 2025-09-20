import {
  Calendar,
  Edit,
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
import { ButtonLink } from '@/components/ui/button-link'
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

import { ClientHeader } from './header'
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
    <div className="@container/shared-plans">
      <ClientHeader
        title="Assigned Plans"
        action={
          <div className="flex gap-2">
            <AssignPlanDialog
              clientName={clientName}
              clientId={clientId}
              activePlan={activePlan}
              trigger={
                <Button size="sm" iconStart={<LucideFilePlus2 />}>
                  Assign Plan
                </Button>
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
        }
      />
      <CardContent className="p-0">
        {plans.length > 0 ? (
          <div className="grid gap-6 @3xl/shared-plans:grid-cols-2">
            {plans.map((plan) => (
              <TrainingCard key={plan.id} plan={plan} clientName={clientName} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No plans assigned</p>
          </div>
        )}
      </CardContent>
    </div>
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
    <Card borderless>
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
        <div className="flex gap-2 items-center justify-between w-full">
          <div className="flex gap-2">
            <Badge variant="outline">
              <Calendar className="size-4" />
              <span>{plan.weekCount} weeks</span>
            </Badge>
            {plan.active && <Badge variant="primary">Active</Badge>}
          </div>
          <ButtonLink
            href={`/trainer/trainings/creator/${plan.id}`}
            variant="secondary"
            size="sm"
            iconStart={<Edit />}
          >
            Edit Plan
          </ButtonLink>
        </div>
      </CardFooter>
    </Card>
  )
}
