'use client'

import { format } from 'date-fns'
import { orderBy } from 'lodash'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  History,
  Package,
  Send,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUser } from '@/context/user-context'
import {
  GQLDeliveryStatus,
  GQLGetTrainerServiceDeliveriesQuery,
  GQLTaskStatus,
  useGetTrainerServiceDeliveriesQuery,
  useUpdateServiceDeliveryMutation,
  useUpdateServiceTaskMutation,
} from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { cn } from '@/lib/utils'

import { OfferHistory } from '../client-services/offer-history'
import { SendOfferForm } from '../client-services/send-offer-form'
import { ClientSubscriptionManagement } from '../client-subscription-management/client-subscription-management'

interface ClientServicesDashboardProps {
  clientId: string
  clientName: string
  clientEmail: string
}

export function ClientServicesDashboard({
  clientId,
  clientName,
  clientEmail,
}: ClientServicesDashboardProps) {
  const { user } = useUser()
  const [sheetView, setSheetView] = useState<'send-offer' | 'history' | null>(
    null,
  )

  const { data: subscriptionData } = useCurrentSubscription(clientId, {
    lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  })

  const hasCoachingSubscription =
    subscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_COACHING &&
    (subscriptionData?.status === 'ACTIVE' ||
      subscriptionData?.status === 'CANCELLED_ACTIVE')

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Deliveries & Tasks */}
        <div className="space-y-4">
          <DeliveriesSection clientId={clientId} trainerId={user.id} />
        </div>

        {/* Right: Quick Actions & Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start"
                iconStart={<Send className="size-4" />}
                onClick={() => setSheetView('send-offer')}
              >
                Send New Offer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                iconStart={<History className="size-4" />}
                onClick={() => setSheetView('history')}
              >
                View Offer History
              </Button>
            </CardContent>
          </Card>

          <ClientStats clientId={clientId} trainerId={user.id} />

          <ClientSubscriptionManagement clientId={clientId} />
        </div>
      </div>

      {/* Sheet for Send Offer / History */}
      <Sheet open={sheetView !== null} onOpenChange={() => setSheetView(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetView === 'send-offer' ? 'Send Offer' : 'Offer History'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 px-4">
            {sheetView === 'send-offer' && (
              <SendOfferForm
                trainerId={user.id}
                clientId={clientId}
                clientEmail={clientEmail}
                clientName={clientName}
                hasCoachingSubscription={hasCoachingSubscription}
                onSuccess={() => setSheetView('history')}
              />
            )}
            {sheetView === 'history' && (
              <OfferHistory clientId={clientId} trainerId={user.id} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DeliveriesSection({
  clientId,
  trainerId,
}: {
  clientId: string
  trainerId: string
}) {
  const { data, isLoading } = useGetTrainerServiceDeliveriesQuery(
    { trainerId },
    { enabled: !!trainerId },
  )

  const updateDeliveryMutation = useUpdateServiceDeliveryMutation()
  const updateTaskMutation = useUpdateServiceTaskMutation()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const clientDeliveries = useMemo(() => {
    if (!data?.getTrainerDeliveries) return []
    return data.getTrainerDeliveries.filter((d) => d.client?.id === clientId)
  }, [data, clientId])

  const sortedDeliveries = useMemo(
    () =>
      orderBy(
        clientDeliveries,
        [
          (d) => d.status === GQLDeliveryStatus.Completed,
          (d) => (d.isOverdue ? -1 : d.daysUntilDue),
        ],
        ['asc', 'asc'],
      ),
    [clientDeliveries],
  )

  const pendingCount = clientDeliveries.filter(
    (d) => d.status !== GQLDeliveryStatus.Completed,
  ).length
  const overdueCount = clientDeliveries.filter(
    (d) => d.isOverdue && d.status !== GQLDeliveryStatus.Completed,
  ).length

  const handleStatusChange = async (
    deliveryId: string,
    status: GQLDeliveryStatus,
  ) => {
    setUpdatingId(deliveryId)
    try {
      await updateDeliveryMutation.mutateAsync({ deliveryId, status })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTaskToggle = async (
    taskId: string,
    currentStatus: GQLTaskStatus,
  ) => {
    setUpdatingId(taskId)
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        input: {
          status:
            currentStatus === GQLTaskStatus.Completed
              ? GQLTaskStatus.Pending
              : GQLTaskStatus.Completed,
        },
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader />
            <span className="text-muted-foreground">Loading deliveries...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Deliveries & Tasks</CardTitle>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive">{overdueCount} overdue</Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="outline">{pendingCount} pending</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedDeliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="size-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No deliveries yet</p>
            <p className="text-xs mt-1">Send an offer to create deliverables</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDeliveries.map((delivery) => (
              <CompactDeliveryCard
                key={delivery.id}
                delivery={delivery}
                onStatusChange={handleStatusChange}
                onTaskToggle={handleTaskToggle}
                isUpdating={
                  updatingId === delivery.id ||
                  delivery.tasks?.some((t) => t.id === updatingId)
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type Delivery = NonNullable<
  GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
>[number]

type Task = NonNullable<Delivery['tasks']>[number]

function CompactDeliveryCard({
  delivery,
  onStatusChange,
  onTaskToggle,
  isUpdating,
}: {
  delivery: Delivery
  onStatusChange: (id: string, status: GQLDeliveryStatus) => void
  onTaskToggle: (taskId: string, currentStatus: GQLTaskStatus) => void
  isUpdating?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const isCompleted = delivery.status === GQLDeliveryStatus.Completed
  const hasTasks = delivery.tasks && delivery.tasks.length > 0
  const progress = delivery.taskProgress ?? 0

  return (
    <div
      className={cn(
        'border rounded-lg transition-all',
        isCompleted && 'opacity-60 bg-muted/30',
        delivery.isOverdue &&
          !isCompleted &&
          'border-destructive/50 bg-destructive/5',
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="pt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : delivery.isOverdue ? (
              <AlertCircle className="size-5 text-destructive" />
            ) : (
              <Clock className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className={cn(
                    'font-medium text-sm',
                    isCompleted && 'line-through text-muted-foreground',
                  )}
                >
                  {delivery.deliverableLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {delivery.packageName}
                </p>
              </div>
              <StatusBadge delivery={delivery} />
            </div>

            {/* Progress bar for tasks */}
            {hasTasks && !isCompleted && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {delivery.completedTaskCount}/{delivery.totalTaskCount}
                </span>
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {hasTasks && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setExpanded(!expanded)}
                    iconEnd={
                      <ChevronRight
                        className={cn(
                          'size-3 transition-transform',
                          expanded && 'rotate-90',
                        )}
                      />
                    }
                  >
                    Tasks
                  </Button>
                )}
              </div>

              <Select
                value={delivery.status}
                onValueChange={(v) =>
                  onStatusChange(delivery.id, v as GQLDeliveryStatus)
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="h-7 w-28 text-xs" variant="outline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GQLDeliveryStatus.Pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.InProgress}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.Completed}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded tasks */}
      {expanded && hasTasks && (
        <div className="border-t px-3 py-2 bg-card-on-card">
          <div className="space-y-1">
            {delivery.tasks?.map((task: Task) => {
              const isTaskDone = task.status === GQLTaskStatus.Completed
              return (
                <button
                  key={task.id}
                  className={cn(
                    'flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-muted transition-colors text-sm',
                    isUpdating && 'pointer-events-none opacity-50',
                  )}
                  onClick={() => onTaskToggle(task.id, task.status)}
                >
                  {isTaskDone ? (
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={cn(
                      'flex-1',
                      isTaskDone && 'line-through text-muted-foreground',
                    )}
                  >
                    {task.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ delivery }: { delivery: Delivery }) {
  if (delivery.status === GQLDeliveryStatus.Completed) {
    return (
      <Badge variant="success" className="text-xs">
        Done
      </Badge>
    )
  }
  if (delivery.isOverdue) {
    return (
      <Badge variant="destructive" className="text-xs">
        Overdue
      </Badge>
    )
  }
  if (delivery.daysUntilDue === 0) {
    return (
      <Badge variant="warning" className="text-xs">
        Due today
      </Badge>
    )
  }
  if (delivery.daysUntilDue <= 2) {
    return (
      <Badge variant="warning" className="text-xs">
        {delivery.daysUntilDue}d left
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs">
      {format(new Date(delivery.dueDate), 'MMM d')}
    </Badge>
  )
}

function ClientStats({
  clientId,
  trainerId,
}: {
  clientId: string
  trainerId: string
}) {
  const [stats, setStats] = useState<{
    totalSpent: number
    totalCommission: number
    completedPurchases: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/trainer/client-stats?clientId=${clientId}&trainerId=${trainerId}`,
      )
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId, trainerId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {Number(stats.totalSpent).toLocaleString('no-NO')}
              <span className="text-xs text-muted-foreground">NOK</span>
            </p>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-primary">
              {Number(stats.totalCommission).toLocaleString('no-NO')}
              <span className="text-xs text-muted-foreground">NOK</span>
            </p>
            <p className="text-xs text-muted-foreground">Your earnings</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Purchases</span>
            <span className="font-medium">{stats.completedPurchases}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
