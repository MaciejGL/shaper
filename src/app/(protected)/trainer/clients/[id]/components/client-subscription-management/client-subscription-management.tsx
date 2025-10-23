'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Pause, Play } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  usePauseClientCoachingSubscriptionMutation,
  useResumeClientCoachingSubscriptionMutation,
} from '@/generated/graphql-client'

import { useClientSubscription } from './use-client-subscription'

interface ClientSubscriptionManagementProps {
  clientId: string
}

export function ClientSubscriptionManagement({
  clientId,
}: ClientSubscriptionManagementProps) {
  const queryClient = useQueryClient()
  const { subscription, isLoading, isPaused } = useClientSubscription(clientId)

  const pauseMutation = usePauseClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Coaching subscription paused successfully')
      // Invalidate subscription query to refetch
      queryClient.invalidateQueries({
        queryKey: ['client-subscription', clientId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause subscription')
    },
  })

  const resumeMutation = useResumeClientCoachingSubscriptionMutation({
    onSuccess: () => {
      toast.success('Coaching subscription resumed successfully')
      // Invalidate subscription query to refetch
      queryClient.invalidateQueries({
        queryKey: ['client-subscription', clientId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume subscription')
    },
  })

  const handlePause = () => {
    if (
      !confirm(
        "Are you sure you want to pause this client's coaching? They will not be charged until you resume it.",
      )
    ) {
      return
    }
    pauseMutation.mutate({ clientId })
  }

  const handleResume = () => {
    if (!confirm('Resume coaching subscription? Billing will restart.')) {
      return
    }
    resumeMutation.mutate({ clientId })
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="flex items-center gap-2 mt-1">
            {isPaused ? (
              <>
                <Pause className="size-4 text-orange-500" />
                <p className="font-medium text-orange-500">Paused</p>
              </>
            ) : (
              <>
                <Play className="size-4 text-green-500" />
                <p className="font-medium text-green-500">Active</p>
              </>
            )}
          </div>
        </div>

        {isPaused ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Coaching is currently paused. Client is not being charged.
            </p>
            <Button
              onClick={handleResume}
              loading={resumeMutation.isPending}
              disabled={resumeMutation.isPending}
              iconStart={<Play />}
              className="w-full"
            >
              Resume Coaching
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Pause coaching if client is sick, on vacation, or needs a break.
            </p>
            <Button
              onClick={handlePause}
              variant="secondary"
              loading={pauseMutation.isPending}
              disabled={pauseMutation.isPending}
              iconStart={<Pause />}
              className="w-full"
            >
              Pause Coaching
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
          <p>
            ℹ️ While paused, client won't be charged and their yearly premium
            (if any) remains paused.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
