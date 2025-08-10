'use client'

import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Loader2,
  User,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SectionIcon } from '@/components/ui/section-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfileQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { useProfileCompletion } from './use-profile-completion'

interface ProfileCompletionBannerProps {
  className?: string
}

const DISMISS_KEY = 'profile-completion-dismissed-v3' // v3 for new analytics features

export function ProfileCompletionBanner({
  className,
}: ProfileCompletionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileQuery(undefined, {
    // Ensure we always have fresh data for completion calculation
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    // Add error retry logic
    retry: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Use our custom completion hook
  const completion = useProfileCompletion(profileData?.profile)

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true)
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(DISMISS_KEY) === 'true'
      setIsDismissed(dismissed)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, 'true')
    }
  }, [])

  const handleRetry = useCallback(() => {
    refetchProfile()
  }, [refetchProfile])

  // Don't render on server or before hydration
  if (!isHydrated) {
    return null
  }

  // Don't show if profile is complete or banner is dismissed
  if (completion.isComplete || isDismissed) {
    return null
  }

  // Error state
  if (profileError) {
    return (
      <Card variant="secondary" className={className}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium">Failed to load profile</p>
                <p className="text-xs text-muted-foreground">
                  Unable to check completion status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Retry
              </button>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (profileLoading) {
    return (
      <Card variant="secondary" className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-spin" />
              <CardTitle className="text-lg">Checking profile...</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <SectionIcon icon={User} variant="indigo" />
            <div>
              <CardTitle className="text-lg">Complete your profile</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {completion.completedSteps}/{completion.totalSteps} steps
                completed
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Complete your profile to get personalized training recommendations and
          better progress tracking.
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completion.weightedPercentage}% Complete
            </span>
          </div>
          <Progress value={completion.weightedPercentage} className="h-2" />
        </div>

        {/* Steps Checklist */}
        <div className="space-y-2 text-sm">
          {completion.steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-2 py-1',
                step.completed ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <div className="pt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">{step.label}</span>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {completion.nextIncompleteStep && (
          <ButtonLink
            href={completion.nextIncompleteStep.href}
            size="sm"
            className="w-full"
            variant="default"
          >
            Continue Setup
            <ChevronRight className="h-4 w-4 ml-1" />
          </ButtonLink>
        )}
      </CardContent>
    </Card>
  )
}
