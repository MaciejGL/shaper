import { RulerIcon, UserMinus, WeightIcon } from 'lucide-react'
import { Calendar } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { HeightDisplay } from '@/components/ui/height-display'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientAllergies } from './client-allergies'
import { ClientCardHeader } from './client-card-header'
import { ClientGoals } from './client-goals'
import { RemoveClientDialog } from './remove-client-dialog'
import { useRemoveClient } from './use-remove-client'

type ClientInfoProps = {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientActivePlan'] | null
}

export function ClientInfo({ client, clientName }: ClientInfoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {
    hasActiveSubscription,
    isCheckingSubscription,
    isRemoving,
    canRemoveClient,
    handleRemoveClient,
  } = useRemoveClient(client.id)

  const age = client.birthday
    ? new Date().getFullYear() - new Date(client.birthday).getFullYear()
    : null

  const handleConfirmRemove = () => {
    handleRemoveClient()
    setIsDialogOpen(false)
  }

  return (
    <>
      <Card borderless variant="tertiary">
        <CardContent className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-6 items-center">
          <ClientCardHeader client={client} clientName={clientName} />

          <div className="flex flex-col gap-2 space-y-2">
            <div className="">
              <h4 className="font-medium mb-2">Personal Info</h4>
              <CardDescription className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <WeightIcon className="h-4 w-4" />
                  {client.currentWeight} kg
                </div>
                <div className="flex items-center gap-2">
                  <RulerIcon className="h-4 w-4" />
                  <HeightDisplay heightInCm={client.height} />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {age ? `${age} years old` : ''}
                </div>
              </CardDescription>
            </div>
            <div className="">
              <ClientGoals goals={client.goals} />
            </div>
            <div className="">
              <ClientAllergies allergies={client.allergies} />
            </div>

            <div className="pt-4 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        variant="destructive"
                        size="sm"
                        iconStart={<UserMinus />}
                        onClick={() => setIsDialogOpen(true)}
                        disabled={!canRemoveClient || isCheckingSubscription}
                        loading={isCheckingSubscription}
                      >
                        Remove Client
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {hasActiveSubscription && (
                    <TooltipContent>
                      Cannot remove client with active coaching subscription
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <RemoveClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clientName={clientName}
        onConfirm={handleConfirmRemove}
        isRemoving={isRemoving}
      />
    </>
  )
}
