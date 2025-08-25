import { differenceInDays, format } from 'date-fns'
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  Dumbbell,
} from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { Client } from './clients-tabs'

interface TaskWithDelivery {
  id: string
  title: string
  status: string
  taskType: string
  requiresScheduling?: boolean
  scheduledAt?: string | null
  serviceDelivery: {
    packageName: string
    serviceType: string
  }
}

interface ClientCardProps {
  client: Client
  tasks?: TaskWithDelivery[]
}

export default function ClientCard({ client, tasks = [] }: ClientCardProps) {
  const daysLeft = differenceInDays(
    new Date(client.activePlan?.endDate ?? ''),
    new Date(),
  )

  // Group tasks by service delivery
  const serviceDeliveries = tasks.reduce(
    (acc, task) => {
      const key = `${task.serviceDelivery.packageName}-${task.serviceDelivery.serviceType}`
      if (!acc[key]) {
        acc[key] = {
          packageName: task.serviceDelivery.packageName,
          serviceType: task.serviceDelivery.serviceType,
          tasks: [],
        }
      }
      acc[key].tasks.push(task)
      return acc
    },
    {} as Record<
      string,
      { packageName: string; serviceType: string; tasks: TaskWithDelivery[] }
    >,
  )

  // Sort service deliveries by priority
  const serviceTypePriority = {
    coaching_complete: 1,
    workout_plan: 2,
    meal_plan: 3,
    in_person_meeting: 4,
  }

  const serviceDeliveryList = Object.values(serviceDeliveries).sort((a, b) => {
    const priorityA =
      serviceTypePriority[
        a.serviceType.toLowerCase() as keyof typeof serviceTypePriority
      ] || 999
    const priorityB =
      serviceTypePriority[
        b.serviceType.toLowerCase() as keyof typeof serviceTypePriority
      ] || 999
    return priorityA - priorityB
  })
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

        {/* Service Deliveries Section */}
        {serviceDeliveryList.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Service Deliveries</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {serviceDeliveryList.length} active
              </Badge>
            </div>

            <div className="space-y-2 max-h-100 overflow-y-auto">
              {serviceDeliveryList.map((delivery, index) => {
                const completedTasks = delivery.tasks.filter(
                  (task) => task.status === 'COMPLETED',
                ).length
                const totalTasks = delivery.tasks.length
                const pendingTasks = totalTasks - completedTasks
                const isCompleted = completedTasks === totalTasks

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-md bg-muted"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isCompleted
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground',
                          )}
                        >
                          {delivery.packageName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {delivery.serviceType.replaceAll('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {pendingTasks > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {pendingTasks} task{pendingTasks > 1 ? 's' : ''} left
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-primary text-primary-foreground">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
