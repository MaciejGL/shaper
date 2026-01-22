'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { Tour, type TourStep } from '@/components/tour'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import {
  GQLUpdateProfileMutation,
  GQLUpdateProfileMutationVariables,
  GQLUserBasicQuery,
  useUpdateProfileMutation,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { captureEvent } from '@/lib/posthog'

import { useOnboardingFreeTierVariant } from './use-onboarding-free-tier-variant'
import { useOnboardingTour } from './use-onboarding-tour'

// Step content
const TOUR_CONTENT = {
  welcome: {
    title: 'Nice - You’re set up!',
    description: [
      'I’m Mats from the Hypro team.',
      'Let me show you the main places you’ll use. Then you’re straight into your first workout.',
    ],
  },
  workout: {
    title: 'Workout',
    description: [
      'This is your training hub.',
      'Follow your active plan day by day, or start a custom workout anytime.',
      'Log sets here and track your progress over time.',
    ],
  },
  plans: {
    title: 'My Plans',
    description: [
      'This is your personal library.',
      'You’ll find plans from your trainer, plans you picked from our public collection, and you can create your own when you’re ready.',
    ],
  },
  explore: {
    title: 'Discover',
    description: [
      'This is where you grab new training.',
      'Start a free workout anytime, browse coach-built plans, and reach out to a trainer whenever you want guidance.',
    ],
  },
  chat: {
    title: 'Need Help? Chat with Mats',
    description: [
      'That’s me.',
      'I’m a real person on the Hypro team. Message me anytime for help with the app, training questions, or a quick nudge to stay on track.',
    ],
  },
  freeTier: {
    title: 'Train free. Upgrade when you want more',
    description: [
      'No hard paywall - you can train and log workouts for free.',
      'Premium unlocks coach-built plans, recovery insights, and smarter exercise suggestions.',
      'Upgrade anytime when it helps you progress faster.',
    ],
  },
  goodbye: {
    title: "You're All Set!",
    description: [
      'Alright! Time to train.',
      'Pick a free workout, browse plans, or jump straight into a session.',
      'If you get stuck, just message me.',
    ],
  },
}

export function OnboardingTour() {
  const router = useRouter()
  const { user } = useUser()
  const { open, close } = useOnboardingTour()
  const {
    variant: freeTierVariant,
    isLoading: isVariantLoading,
    flagKey,
  } = useOnboardingFreeTierVariant(open)
  const includeFreeTierStep = freeTierVariant === 'A'
  const hasTrackedStartRef = useRef(false)

  // Prefetch likely destinations while the tour is open.
  useEffect(() => {
    if (!open) return
    const hrefs = [
      '/fitspace/workout',
      '/fitspace/my-plans',
      '/fitspace/explore',
      '/fitspace/explore?tab=free-workouts',
      '/fitspace/explore?tab=premium-plans',
    ]

    for (const href of hrefs) {
      router.prefetch(href)
    }
  }, [open, router])

  // Track when the tour actually starts (once per open).
  useEffect(() => {
    if (!open) return
    if (isVariantLoading) return
    if (hasTrackedStartRef.current) return
    hasTrackedStartRef.current = true

    captureEvent('onboarding_tour_started', {
      source: 'fitspace',
      ab_test: flagKey,
      variant: freeTierVariant,
      include_free_tier_slide: includeFreeTierStep,
    })
  }, [flagKey, freeTierVariant, includeFreeTierStep, isVariantLoading, open])

  useEffect(() => {
    if (!open) {
      hasTrackedStartRef.current = false
    }
  }, [open])

  // Ensure we have the userBasic query in cache for optimistic updates
  useUserBasicQuery(
    {},
    {
      enabled: open,
      staleTime: 60_000,
    },
  )

  const updateProfileMutation = useUpdateProfileMutation({
    onError: (error) => {
      console.error('Failed to complete onboarding tour:', error)
      toast.error('Something went wrong while saving your progress')
    },
  })

  const queryKey = useUserBasicQuery.getKey({})

  const { optimisticMutate: markCompletedOptimistic } = useOptimisticMutation<
    GQLUserBasicQuery,
    GQLUpdateProfileMutation,
    GQLUpdateProfileMutationVariables
  >({
    queryKey,
    mutationFn: updateProfileMutation.mutateAsync,
    updateFn: (oldData) => {
      if (!oldData?.userBasic?.profile) return oldData
      return {
        ...oldData,
        userBasic: {
          ...oldData.userBasic,
          profile: {
            ...oldData.userBasic.profile,
            hasCompletedOnboarding: true,
          },
        },
      }
    },
  })

  const handleComplete = useCallback(
    (nextPath?: string, context?: { cta?: string }) => {
      close()
      if (!user?.profile) return
      markCompletedOptimistic({
        input: { hasCompletedOnboarding: true },
      }).catch(() => {
        // error already handled by mutation onError
      })

      captureEvent('onboarding_tour_completed', {
        source: 'fitspace',
        ab_test: flagKey,
        variant: freeTierVariant,
        include_free_tier_slide: includeFreeTierStep,
        cta: context?.cta ?? null,
        next_path: nextPath ?? null,
      })

      if (nextPath) router.push(nextPath)
    },
    [
      close,
      flagKey,
      freeTierVariant,
      includeFreeTierStep,
      markCompletedOptimistic,
      router,
      user?.profile,
    ],
  )

  const steps = useMemo<TourStep[]>(() => {
    const base: TourStep[] = [
      // Step 1: Welcome (centered)
      {
        id: 'welcome',
        title: TOUR_CONTENT.welcome.title,
        description: TOUR_CONTENT.welcome.description,
        placement: 'center',
      },
      // Step 2: Workout tab
      {
        id: 'workout',
        target: '[data-onboarding-id="nav-workout"]',
        title: TOUR_CONTENT.workout.title,
        description: TOUR_CONTENT.workout.description,
        placement: 'top',
      },
      // Step 3: Plans tab
      {
        id: 'plans',
        target: '[data-onboarding-id="nav-my-plans"]',
        title: TOUR_CONTENT.plans.title,
        description: TOUR_CONTENT.plans.description,
        placement: 'top',
      },
      // Step 4: Explore tab
      {
        id: 'explore',
        target: '[data-onboarding-id="nav-explore"]',
        title: TOUR_CONTENT.explore.title,
        description: TOUR_CONTENT.explore.description,
        placement: 'top',
      },
      // Step 5: Chat icon
      {
        id: 'chat',
        target: '[data-onboarding-id="top-chat"]',
        title: TOUR_CONTENT.chat.title,
        description: TOUR_CONTENT.chat.description,
        placement: 'bottom',
      },
    ]

    if (includeFreeTierStep) {
      base.push({
        id: 'free-tier',
        title: TOUR_CONTENT.freeTier.title,
        description: TOUR_CONTENT.freeTier.description,
        placement: 'center',
      })
    }

    base.push({
      id: 'goodbye',
      title: TOUR_CONTENT.goodbye.title,
      description: TOUR_CONTENT.goodbye.description,
      placement: 'center',
      footer: ({ prev }: { prev: () => void }) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                captureEvent('onboarding_tour_cta_clicked', {
                  cta: 'free_workouts',
                  ab_test: flagKey,
                  variant: freeTierVariant,
                })
                handleComplete('/fitspace/explore?tab=free-workouts', {
                  cta: 'free_workouts',
                })
              }}
            >
              Free workouts
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                captureEvent('onboarding_tour_cta_clicked', {
                  cta: 'browse_plans',
                  ab_test: flagKey,
                  variant: freeTierVariant,
                })
                handleComplete('/fitspace/explore?tab=premium-plans', {
                  cta: 'browse_plans',
                })
              }}
            >
              Browse plans
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prev}>
              Back
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                captureEvent('onboarding_tour_cta_clicked', {
                  cta: 'start_training',
                  ab_test: flagKey,
                  variant: freeTierVariant,
                })
                handleComplete('/fitspace/workout', { cta: 'start_training' })
              }}
            >
              Start training
            </Button>
          </div>
        </div>
      ),
    })

    return base
  }, [flagKey, freeTierVariant, handleComplete, includeFreeTierStep])

  return (
    <Tour
      steps={steps}
      open={open && !isVariantLoading}
      onComplete={() => handleComplete(undefined, { cta: 'finish' })}
      onSkip={() => {
        captureEvent('onboarding_tour_dismissed', {
          source: 'fitspace',
          ab_test: flagKey,
          variant: freeTierVariant,
          include_free_tier_slide: includeFreeTierStep,
        })
        handleComplete(undefined, { cta: 'dismiss' })
      }}
      onStepChange={({ stepId, stepIndex, stepsCount }) => {
        captureEvent('onboarding_tour_step_viewed', {
          source: 'fitspace',
          ab_test: flagKey,
          variant: freeTierVariant,
          include_free_tier_slide: includeFreeTierStep,
          step_id: stepId,
          step_index: stepIndex,
          steps_count: stepsCount,
        })
      }}
      showProgress
      allowClose
    />
  )
}
