'use client'

import { formatDistanceToNow, isToday } from 'date-fns'
import { Calendar, Check, Clock, MoreVertical } from 'lucide-react'
import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import { formatRelativeTime } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { BodyMeasurementsProvider } from '../body-measurements-context'

import { CheckinDrawer } from './checkin-drawer'
import { ScheduleSetupModal } from './schedule-setup-modal'
import { DAY_OF_WEEK_LABELS, FREQUENCY_LABELS } from './types'
import {
  useCheckinScheduleOperations,
  useCheckinStatus,
} from './use-checkin-schedule'

export function CheckinScheduleSection() {
  const { hasPremium } = useUser()
  const { data, isLoading } = useCheckinStatus()
  const { deleteSchedule, isDeleting } = useCheckinScheduleOperations()

  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showCheckinDrawer, setShowCheckinDrawer] = useState(false)

  if (isLoading) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  const checkinStatus = data?.checkinStatus

  if (!checkinStatus?.hasSchedule) {
    return (
      <>
        <Card borderless>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PremiumGate feature="Schedule Check-ins" compact>
              <CardDescription className="text-muted-foreground">
                Set up regular reminders to track your progress with
                measurements and photos.
              </CardDescription>
              <Button
                onClick={() => setShowSetupModal(true)}
                iconStart={<Calendar />}
                className="w-full"
                size="sm"
                variant="tertiary"
              >
                Schedule Check-ins
              </Button>
            </PremiumGate>
          </CardContent>
        </Card>

        <ScheduleSetupModal
          open={showSetupModal}
          onOpenChange={setShowSetupModal}
        />
      </>
    )
  }

  const { schedule, nextCheckinDate, isCheckinDue } = checkinStatus

  if (!schedule) return null

  const nextDate = nextCheckinDate ? new Date(nextCheckinDate) : null

  // Find the last valid completion (with actual data)
  const lastValidCompletion = schedule.completions.find(
    (completion) => completion.measurement || completion.progressLog,
  )

  // Show check-in button only if there's no valid completion for current period
  const shouldShowCheckinButton = isCheckinDue

  return (
    <>
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Check-ins
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" disabled={!hasPremium}>
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSetupModal(true)}>
                  Update check-in schedule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteSchedule({})}
                  disabled={isDeleting}
                >
                  Cancel check-in
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <p className="text-sm">
            {FREQUENCY_LABELS[schedule.frequency]}
            {schedule.dayOfWeek !== null &&
              schedule.dayOfWeek !== undefined && (
                <span className="text-muted-foreground">
                  {' '}
                  on {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]}
                </span>
              )}
            {schedule.dayOfMonth !== null && (
              <span className="text-muted-foreground">
                {' '}
                on the {schedule.dayOfMonth}
                {schedule.dayOfMonth === 1
                  ? 'st'
                  : schedule.dayOfMonth === 2
                    ? 'nd'
                    : schedule.dayOfMonth === 3
                      ? 'rd'
                      : 'th'}
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Info */}
          <PremiumGate
            feature="Schedule Check-ins"
            description="Schedule check-ins to receive reminders and track your progress with measurements and photos."
            compact
          >
            <div className="flex items-center justify-between">
              <div>
                {nextDate && (
                  <p className="text-base text-muted-foreground flex items-center gap-2">
                    <Clock
                      className={cn(
                        'size-4',
                        isCheckinDue ? 'text-green-600' : 'text-amber-500',
                      )}
                    />
                    {isCheckinDue ? (
                      <span className="font-medium text-foreground">
                        Check-in ready!
                      </span>
                    ) : (
                      <>Next check-in {formatRelativeTime(nextDate)}</>
                    )}
                  </p>
                )}
              </div>
            </div>

            {lastValidCompletion?.completedAt &&
              isToday(lastValidCompletion.completedAt) && (
                <div className="rounded-lg bg-card-on-card p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium flex items-center gap-1 text-primary">
                      Check-in completed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(lastValidCompletion.completedAt),
                        {
                          addSuffix: true,
                        },
                      )}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Check
                        className={cn(
                          'size-3 ',
                          lastValidCompletion.measurement && 'text-green-500',
                        )}
                      />{' '}
                      Body measurements
                    </p>
                    <p className="flex items-center gap-2">
                      <Check
                        className={cn(
                          'size-3 ',
                          lastValidCompletion.progressLog && 'text-green-500',
                        )}
                      />{' '}
                      Photos taken
                    </p>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            {shouldShowCheckinButton && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCheckinDrawer(true)}
                  className="w-full"
                >
                  Start Check-in
                </Button>
              </div>
            )}
          </PremiumGate>
        </CardContent>
      </Card>

      <ScheduleSetupModal
        open={showSetupModal}
        onOpenChange={setShowSetupModal}
        existingSchedule={schedule}
      />
      <BodyMeasurementsProvider>
        <CheckinDrawer
          open={showCheckinDrawer}
          onOpenChange={setShowCheckinDrawer}
        />
      </BodyMeasurementsProvider>
    </>
  )
}
