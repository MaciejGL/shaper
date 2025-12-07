'use client'

import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, Pause, Play, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  useCancelClientCoachingSubscriptionMutation,
  usePauseClientCoachingSubscriptionMutation,
  useResumeClientCoachingSubscriptionMutation,
  useUndoCancelClientCoachingSubscriptionMutation,
} from '@/generated/graphql-client'

import { useClientSubscription } from './use-client-subscription'

type ConfirmAction = 'pause' | 'resume' | 'cancel' | 'undoCancel' | null

interface ClientSubscriptionManagementProps {
  clientId: string
}

export function ClientSubscriptionManagement({
  clientId,
}: ClientSubscriptionManagementProps) {
  const queryClient = useQueryClient()
  const {
    subscription,
    isLoading,
    isPaused,
    cancelAt,
    upcomingBillingDates,
    isScheduledToCancel,
  } = useClientSubscription(clientId)

  const [showCancelOptions, setShowCancelOptions] = useState(false)
  const [selectedCancelDate, setSelectedCancelDate] = useState<string>('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const invalidateSubscription = () => {
    queryClient.invalidateQueries({
      queryKey: ['client-subscription', clientId],
    })
  }

  const closeDialog = () => setConfirmAction(null)

  const pauseMutation = usePauseClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Coaching subscription paused successfully')
      closeDialog()
      invalidateSubscription()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause subscription')
    },
  })

  const resumeMutation = useResumeClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Coaching subscription resumed successfully')
      closeDialog()
      invalidateSubscription()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume subscription')
    },
  })

  const cancelMutation = useCancelClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Coaching subscription scheduled to end')
      closeDialog()
      setShowCancelOptions(false)
      setSelectedCancelDate('')
      invalidateSubscription()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule subscription end')
    },
  })

  const undoCancelMutation = useUndoCancelClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Subscription cancellation has been undone')
      closeDialog()
      invalidateSubscription()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to undo cancellation')
    },
  })

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case 'pause':
        pauseMutation.mutate({ clientId })
        break
      case 'resume':
        resumeMutation.mutate({ clientId })
        break
      case 'cancel':
        if (selectedCancelDate) {
          cancelMutation.mutate({ clientId, cancelAt: selectedCancelDate })
        }
        break
      case 'undoCancel':
        undoCancelMutation.mutate({ clientId })
        break
    }
  }

  const handleScheduleCancelClick = () => {
    if (!selectedCancelDate) {
      toast.error('Please select an end date')
      return
    }
    setConfirmAction('cancel')
  }

  const isPending =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending ||
    undoCancelMutation.isPending

  const formattedCancelDate = selectedCancelDate
    ? format(new Date(selectedCancelDate), 'MMMM d, yyyy')
    : ''

  const dialogConfig = {
    pause: {
      title: 'Pause Coaching',
      description: "Pause this client's coaching subscription?",
      details: [
        'Client will not be charged while paused',
        'You can resume anytime',
        'Client will be notified via email',
      ],
      confirmText: 'Pause Coaching',
      variant: 'secondary' as const,
    },
    resume: {
      title: 'Resume Coaching',
      description: 'Resume this coaching subscription?',
      details: ['Billing will restart', 'Client will regain full access'],
      confirmText: 'Resume Coaching',
      variant: 'default' as const,
    },
    cancel: {
      title: 'End Coaching',
      description: `End coaching on ${formattedCancelDate}?`,
      details: [
        `Client keeps full access until ${formattedCancelDate}`,
        'No charges after this date',
        'Client will be notified via email',
      ],
      confirmText: 'Confirm End Date',
      variant: 'destructive' as const,
    },
    undoCancel: {
      title: 'Undo Cancellation',
      description: 'Undo the scheduled end date?',
      details: [
        'Subscription will continue normally',
        'Billing will continue as usual',
      ],
      confirmText: 'Undo Cancellation',
      variant: 'default' as const,
    },
  }

  const currentDialog = confirmAction ? dialogConfig[confirmAction] : null

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coaching Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return null
  }

  // Format the billing dates for the dropdown
  // Make it clear that the date shown is WHEN the subscription ends
  const billingDateOptions = upcomingBillingDates.map((date, index) => {
    const dateObj = new Date(date)
    const formattedDate = format(dateObj, 'MMMM d, yyyy')
    const periodLabel =
      index === 0
        ? 'after current billing period'
        : `after ${index + 1} billing period${index > 0 ? 's' : ''}`
    return {
      value: date,
      label: `End on ${formattedDate}`,
      sublabel: periodLabel,
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 justify-between w-full">
          <CardTitle>Coaching Subscription</CardTitle>
          <SubscriptionStatusBadge
            isPaused={isPaused}
            isScheduledToCancel={isScheduledToCancel}
            cancelAt={cancelAt}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scheduled to Cancel State */}
        {isScheduledToCancel && cancelAt && (
          <div className="space-y-3">
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20 p-3">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Calendar className="size-4" />
                <span className="text-sm font-medium">
                  Last day: {format(new Date(cancelAt), 'MMMM d, yyyy')}
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                Client has full access until this date. Coaching ends and no
                further charges after.
              </p>
            </div>
            <Button
              onClick={() => setConfirmAction('undoCancel')}
              variant="secondary"
              iconStart={<RotateCcw />}
              className="w-full"
            >
              Undo Cancellation
            </Button>
          </div>
        )}

        {/* Paused State */}
        {isPaused && !isScheduledToCancel && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Coaching is currently paused. Client is not being charged.
            </p>
            <Button
              onClick={() => setConfirmAction('resume')}
              iconStart={<Play />}
              className="w-full"
            >
              Resume Coaching
            </Button>
          </div>
        )}

        {/* Active State */}
        {!isPaused && !isScheduledToCancel && (
          <div className="space-y-3">
            {!showCancelOptions ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Manage this client&apos;s coaching subscription.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConfirmAction('pause')}
                    variant="secondary"
                    iconStart={<Pause />}
                    className="flex-1"
                  >
                    Pause
                  </Button>
                  <Button
                    onClick={() => setShowCancelOptions(true)}
                    variant="outline"
                    iconStart={<XCircle />}
                    className="flex-1"
                  >
                    Schedule End
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select the <strong>last day</strong> of coaching access:
                </p>
                <Select
                  value={selectedCancelDate}
                  onValueChange={setSelectedCancelDate}
                >
                  <SelectTrigger variant="outline" className="w-full">
                    <SelectValue placeholder="Select end date..." />
                  </SelectTrigger>
                  <SelectContent>
                    {billingDateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.sublabel}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowCancelOptions(false)
                      setSelectedCancelDate('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleCancelClick}
                    variant="destructive"
                    disabled={!selectedCancelDate}
                    className="flex-1"
                  >
                    Confirm End
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
          <p>
            Client will be notified via email when their subscription is
            scheduled to end.
          </p>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => closeDialog()}>
        <DialogContent dialogTitle={currentDialog?.title || 'Confirm'}>
          <DialogHeader>
            <DialogTitle>{currentDialog?.title}</DialogTitle>
            <DialogDescription>{currentDialog?.description}</DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {currentDialog?.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={currentDialog?.variant}
              onClick={handleConfirmAction}
              loading={isPending}
              disabled={isPending}
              className="flex-1"
            >
              {currentDialog?.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function SubscriptionStatusBadge({
  isPaused,
  isScheduledToCancel,
  cancelAt,
}: {
  isPaused: boolean
  isScheduledToCancel: boolean
  cancelAt: string | null
}) {
  if (isScheduledToCancel && cancelAt) {
    return (
      <Badge variant="warning">
        <Calendar className="size-4 text-orange-500" />
        <p className="font-medium text-orange-500">Ending</p>
      </Badge>
    )
  }

  if (isPaused) {
    return (
      <Badge variant="warning">
        <Pause className="size-4 text-orange-500" />
        <p className="font-medium text-orange-500">Paused</p>
      </Badge>
    )
  }

  return (
    <Badge variant="success">
      <Play className="size-4 text-green-500" />
      <p className="font-medium text-green-500">Active</p>
    </Badge>
  )
}
