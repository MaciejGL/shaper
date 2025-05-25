import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  GQLGetClientByIdQuery,
  GQLGetTemplatesQuery,
  useAssignTrainingPlanToClientMutation,
  useGetClientByIdQuery,
} from '@/generated/graphql-client'
import { useGetTemplatesQuery } from '@/generated/graphql-client'

type AssignPlanDialogProps = {
  clientName: string
  clientId: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
  trigger?: React.ReactNode
}

export function AssignPlanDialog({
  clientName,
  clientId,
  activePlan,
  trigger,
}: AssignPlanDialogProps) {
  const { data } = useGetTemplatesQuery({ draft: false })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { mutateAsync: assignPlan, isPending: isAssigning } =
    useAssignTrainingPlanToClientMutation({
      onSuccess: () => {
        toast.success(`Training plan assigned to client`)
        setIsDialogOpen(false)
        setSelectedPlan(null)
        setSearchQuery('')
        queryClient.invalidateQueries({
          queryKey: useGetClientByIdQuery.getKey({ id: clientId }),
        })
      },
      onError: () => {
        toast.error('Failed to assign training plan to client')
      },
    })

  const filteredPlans = data?.getTemplates?.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAssignPlan = async () => {
    if (selectedPlan) {
      await assignPlan({
        input: { planId: selectedPlan, clientId },
      })
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {activePlan ? 'Change Plan' : 'Assign New Plan'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        dialogTitle={`Assign Training Plan to ${clientName}`}
        className="sm:max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>Assign Training Plan to {clientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PlanSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {filteredPlans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
              />
            ))}
          </div>

          {filteredPlans?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No plans found matching your search.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignPlan}
              disabled={!selectedPlan}
              loading={isAssigning}
            >
              Assign Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type PlanCardProps = {
  plan: GQLGetTemplatesQuery['getTemplates'][number]
  isSelected: boolean
  onSelect: () => void
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{plan.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plan.description}
        </p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{plan.weekCount} weeks</span>
        </div>
      </CardContent>
    </Card>
  )
}

type PlanSearchProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
}

function PlanSearch({ searchQuery, onSearchChange }: PlanSearchProps) {
  return (
    <div className="relative">
      <Input
        id="search"
        placeholder="Search plans by name or description"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        iconStart={<Search className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
