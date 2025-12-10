'use client'

import { Calendar, Pause, Play } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FREEZE_COPY } from '@/config/product-copy'

import { useFreezeSubscription } from './use-freeze-subscription'

export function FreezeSubscriptionSection() {
  const {
    eligibility,
    isLoading,
    error,
    pauseSubscription,
    resumeSubscription,
    isPausing,
    isResuming,
  } = useFreezeSubscription()

  const [selectedDays, setSelectedDays] = useState<string>('')
  const [actionError, setActionError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !eligibility) {
    return null
  }

  // Don't show section if daysRemaining is 0 and not paused (no quota left)
  if (eligibility.daysRemaining === 0 && !eligibility.isPaused) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Pause className="size-4" />
            Pause Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {FREEZE_COPY.quotaExhausted}
          </p>
        </CardContent>
      </Card>
    )
  }

  const handlePause = async () => {
    if (!selectedDays) return

    setActionError(null)
    try {
      const result = await pauseSubscription(parseInt(selectedDays, 10))
      if (!result.pauseMySubscription.success) {
        setActionError(
          result.pauseMySubscription.message || 'Failed to pause subscription',
        )
      } else {
        setSelectedDays('')
      }
    } catch {
      setActionError('Failed to pause subscription. Please try again.')
    }
  }

  const handleResume = async () => {
    setActionError(null)
    try {
      const result = await resumeSubscription()
      if (!result.resumeMySubscription.success) {
        setActionError(
          result.resumeMySubscription.message ||
            'Failed to resume subscription',
        )
      }
    } catch {
      setActionError('Failed to resume subscription. Please try again.')
    }
  }

  // Generate day options based on min/max
  const dayOptions: number[] = []
  for (let i = eligibility.minDays; i <= eligibility.maxDays; i++) {
    dayOptions.push(i)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Pause className="size-4" />
          Pause Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currently Paused State */}
        {eligibility.isPaused && eligibility.pauseEndsAt && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
              <Calendar className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {FREEZE_COPY.currentlyPaused}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {formatDate(eligibility.pauseEndsAt)}
                </p>
              </div>
            </div>

            <Button
              onClick={handleResume}
              loading={isResuming}
              disabled={isResuming}
              variant="secondary"
              className="w-full"
              iconStart={<Play />}
            >
              Resume Early
            </Button>

            {eligibility.daysRemaining > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {eligibility.daysRemaining} pause days remaining this year
              </p>
            )}
          </div>
        )}

        {/* Not Eligible Yet State */}
        {!eligibility.isPaused &&
          !eligibility.canFreeze &&
          eligibility.availableFrom && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {FREEZE_COPY.notEligibleYet}
              </p>
              <p className="text-xs text-muted-foreground">
                Available from {formatDate(eligibility.availableFrom)}
              </p>
            </div>
          )}

        {/* Not Eligible - Other Reason */}
        {!eligibility.isPaused &&
          !eligibility.canFreeze &&
          !eligibility.availableFrom &&
          eligibility.reason && (
            <p className="text-sm text-muted-foreground">
              {eligibility.reason}
            </p>
          )}

        {/* Eligible to Pause */}
        {!eligibility.isPaused && eligibility.canFreeze && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {FREEZE_COPY.shortBenefit}
            </p>

            <div className="space-y-2">
              <Label htmlFor="pause-days">Pause duration</Label>
              <Select value={selectedDays} onValueChange={setSelectedDays}>
                <SelectTrigger id="pause-days">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {eligibility.daysRemaining} days remaining this year (
                {eligibility.minDays}-{eligibility.maxDays} days per pause)
              </p>
            </div>

            <Button
              onClick={handlePause}
              loading={isPausing}
              disabled={isPausing || !selectedDays}
              variant="secondary"
              className="w-full"
              iconStart={<Pause />}
            >
              Pause Subscription
            </Button>
          </div>
        )}

        {/* Error Display */}
        {actionError && (
          <p className="text-sm text-destructive text-center">{actionError}</p>
        )}
      </CardContent>
    </Card>
  )
}
