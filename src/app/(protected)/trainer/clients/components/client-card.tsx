import { differenceInDays, format } from 'date-fns'
import { Calendar, ChevronRight, Clock, Dumbbell } from 'lucide-react'
import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// import { Progress } from '@/components/ui/progress'

import { Client } from './clients-tabs'

export default function ClientCard({ client }: { client: Client }) {
  const daysLeft = differenceInDays(
    new Date(client.activePlan?.endDate ?? ''),
    new Date(),
  )
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="p-0">
        <div className="bg-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={client.image || '/avatar-male.png'}
                  alt={`${client.firstName} ${client.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">
                  {client.firstName ?? ''} {client.lastName ?? ''}
                </h3>
                <p className="text-xs text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <ButtonLink
              size="icon-sm"
              variant="ghost"
              href={`/trainer/clients/${client.id}`}
              iconOnly={<ChevronRight />}
            >
              View Profile
            </ButtonLink>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Current Plan:</span>
            <span className="ml-1">
              {client.activePlan?.title
                ? client.activePlan.title
                : 'No plan assigned'}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Last Active:</span>
            <span className="ml-1">
              {client.activePlan?.lastSessionActivity
                ? format(
                    new Date(client.activePlan.lastSessionActivity),
                    'dd MMM HH:mm',
                  )
                : 'No activity'}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">Plan ends:</span>
            <span className="ml-1">
              {client.activePlan?.endDate
                ? `${format(new Date(client.activePlan.endDate), 'dd MMM')}`
                : 'No end date'}
            </span>
            {daysLeft > 0 && daysLeft < 7 && (
              <span className="ml-1 text-xs text-amber-500">
                {daysLeft} days left
              </span>
            )}
            {daysLeft <= 0 && (
              <span className="ml-1 text-xs text-red-500">Plan ended</span>
            )}
          </div>
        </div>

        {client.activePlan && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{client.activePlan?.progress ?? 0}%</span>
            </div>
            <Progress
              value={client.activePlan?.progress ?? 0}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
