'use client'

import { formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, Clock, MoreVertical, X } from 'lucide-react'
import { useState } from 'react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
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
import { useCheckinDismissal } from './use-checkin-dismissal'
import {
  useCheckinScheduleOperations,
  useCheckinStatus,
} from './use-checkin-schedule'

interface CheckinScheduleSectionProps {
  variant?: 'full' | 'minimal'
}

function formatNextCheckinDate(date: Date): string {
  if (isTomorrow(date)) {
    return 'tomorrow'
  }
  return formatRelativeTime(date)
}

export function CheckinScheduleSection({
  variant = 'full',
}: CheckinScheduleSectionProps) {
  const { hasPremium } = useUser()
  const { data, isLoading } = useCheckinStatus()
  const { deleteSchedule, skipCheckin, isDeleting, isSkipping } =
    useCheckinScheduleOperations()
  const { dismiss } = useCheckinDismissal()

  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showCheckinDrawer, setShowCheckinDrawer] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  const handleDismiss = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      dismiss()
    }, 300)
  }

  if (isLoading) {
    return null
  }

  const checkinStatus = data?.checkinStatus

  if (!checkinStatus?.hasSchedule) {
    if (variant === 'minimal') {
      return (
        <>
          <Card className="p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-3">
              Track your progress with regular check-ins
            </p>
            <PremiumButtonWrapper
              hasPremium={hasPremium}
              tooltipText="Upgrade to schedule check-ins"
            >
              <Button
                onClick={() => setShowSetupModal(true)}
                iconStart={<Calendar />}
                size="sm"
                variant="tertiary"
                disabled={!hasPremium}
              >
                Schedule Check-ins
              </Button>
            </PremiumButtonWrapper>
          </Card>

          <ScheduleSetupModal
            open={showSetupModal}
            onOpenChange={setShowSetupModal}
          />
        </>
      )
    }

    return (
      <div className="py-6 dark">
        <AnimatePresence>
          {!isAnimatingOut && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: { duration: 0.3, ease: 'easeInOut' },
              }}
            >
              <Card className="!border ">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-cyan-500" />
                      Check-ins
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      iconOnly={<X />}
                      onClick={handleDismiss}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground">
                    Set up regular reminders to track your progress with
                    measurements and photos.
                  </CardDescription>
                  <div className="flex gap-2">
                    <PremiumButtonWrapper
                      hasPremium={hasPremium}
                      tooltipText="Upgrade to schedule check-ins"
                    >
                      <Button
                        onClick={() => setShowSetupModal(true)}
                        iconStart={<Calendar />}
                        className="flex-1"
                        size="sm"
                        variant="tertiary"
                        disabled={!hasPremium}
                      >
                        Schedule Check-ins
                      </Button>
                    </PremiumButtonWrapper>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <ScheduleSetupModal
          open={showSetupModal}
          onOpenChange={setShowSetupModal}
        />
      </div>
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

  // Check if user skipped today
  const lastCompletion = schedule.completions[0]
  const isSkippedToday =
    lastCompletion &&
    !lastCompletion.measurement &&
    !lastCompletion.progressLog &&
    isToday(lastCompletion.completedAt)

  // Minimal variant for bottom display
  if (variant === 'minimal') {
    return (
      <>
        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Check-in Schedule</p>
              <p className="text-xs text-muted-foreground">
                {FREQUENCY_LABELS[schedule.frequency]}
                {schedule.dayOfWeek !== null &&
                  schedule.dayOfWeek !== undefined && (
                    <> on {DAY_OF_WEEK_LABELS[schedule.dayOfWeek]}</>
                  )}
              </p>
            </div>
            {nextDate && (
              <p className="text-xs text-muted-foreground">
                {formatNextCheckinDate(nextDate)}
              </p>
            )}
          </div>
          {shouldShowCheckinButton && !isSkippedToday && (
            <Button
              onClick={() => setShowCheckinDrawer(true)}
              size="sm"
              disabled={!hasPremium}
            >
              Start Check-in
            </Button>
          )}
        </Card>

        <BodyMeasurementsProvider>
          <CheckinDrawer
            open={showCheckinDrawer}
            onOpenChange={setShowCheckinDrawer}
          />
        </BodyMeasurementsProvider>
      </>
    )
  }

  return (
    <div className="pb-4 px-2 dark">
      <Card className="gap-2 rounded-2xl !border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-cyan-500" />
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Info */}
          <div className="flex items-center justify-between bg-card-on-card p-3 rounded-lg">
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
                    <>
                      Next check-in{' '}
                      <span className="text-foreground">
                        {formatNextCheckinDate(nextDate)}
                      </span>
                    </>
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
          {shouldShowCheckinButton && !isSkippedToday && (
            <div className="flex gap-2">
              <PremiumButtonWrapper
                hasPremium={hasPremium}
                tooltipText="Premium feature - Upgrade to complete check-ins"
              >
                <Button
                  onClick={() => setShowCheckinDrawer(true)}
                  className="flex-1"
                  disabled={!hasPremium}
                >
                  Start Check-in
                </Button>
              </PremiumButtonWrapper>
              <Button
                onClick={() => skipCheckin({})}
                variant="ghost"
                size="sm"
                disabled={isSkipping}
                className="flex-shrink-0"
              >
                Skip
              </Button>
            </div>
          )}

          {isSkippedToday && (
            <div className="rounded-lg bg-card-on-card p-3">
              <p className="text-sm text-muted-foreground">
                Check-in skipped for today
              </p>
            </div>
          )}
          <p className="text-xs">
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
    </div>
  )
}
