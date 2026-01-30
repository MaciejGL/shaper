'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import { ArrowLeft } from 'lucide-react'

import { Tour, type TourStep } from '@/components/tour'
import { Button } from '@/components/ui/button'
import type { OnboardingGoal } from '@/config/onboarding-workouts'
import { useUser } from '@/context/user-context'
import {
  GQLUpdateProfileMutation,
  GQLUpdateProfileMutationVariables,
  GQLUserBasicQuery,
  useSetVolumeGoalMutation,
  useStartFreeWorkoutDayMutation,
  useUpdateProfileMutation,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { captureEvent } from '@/lib/posthog'
import { queryInvalidation } from '@/lib/query-invalidation'

import { OnboardingGoalStep } from './onboarding-goal-step'
import { OnboardingWorkoutStep } from './onboarding-workout-step'
import { useOnboardingFreeTierVariant } from './use-onboarding-free-tier-variant'
import { useOnboardingTour } from './use-onboarding-tour'

const TOUR_CONTENT = {
  welcome: {
    title: "You're set - quick tour",
    description: [
      "I'm Mats from the Hypro team.",
      'This app is built to remove guesswork: follow a plan, hit the right weekly volume, and track progress as you train.',
      "I'll show you the 4 places you'll actually use - then you'll start your first workout.",
    ],
  },

  workout: {
    title: 'Workout (your daily hub)',
    description: [
      "This is where training happens — open today's session and start.",
      'Follow your active plan day by day, or build a custom workout anytime.',
    ],
  },

  plans: {
    title: 'My Plans',
    description: [
      "Everything you'll train from lives here.",
      'Plans from a trainer, plans you activated from our collection, and your own plans when you\'re ready.',
      "Pick one plan and stay consistent — that's how progress becomes measurable.",
    ],
  },

  progress: {
    title: 'Progress (track what matters)',
    description: [
      'See your weekly volume by muscle group — how many sets you actually hit.',
      'Set a volume goal based on your focus, and the app tracks whether you are on pace.',
      'Over time, you will see trends that show real progress — not just workouts logged.',
    ],
  },

  goalSelection: {
    title: "What's your training focus?",
    description: ['This helps us track the right muscles for you.'],
  },

  explore: {
    title: 'Discover (find what fits you)',
    description: [
      'Free workouts: selected sessions from our full plans — perfect to try right now.',
      'Coach-built plans: choose by goal and schedule (or use the plan finder).',
      'Work with a certified trainer for personal guidance — first meeting and assessment is free and non-binding.',
    ],
  },

  freeTier: {
    title: 'Train free — upgrade when it helps',
    description: [
      'No hard paywall: you can train and log workouts for free.',
      'Premium unlocks coach-built plans, recovery insights, and smarter exercise suggestions.',
      'Upgrade anytime when you want faster progress and more guidance.',
    ],
  },

  workoutPicker: {
    title: 'Ready to train? Pick one.',
    description: ['These match your focus — start now.'],
  },
}

export function OnboardingTour() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { open, close } = useOnboardingTour()
  const {
    variant: freeTierVariant,
    isLoading: isVariantLoading,
    flagKey,
  } = useOnboardingFreeTierVariant(open)
  const includeFreeTierStep = freeTierVariant === 'A'
  const hasTrackedStartRef = useRef(false)

  // State for goal selection flow
  const [selectedGoal, setSelectedGoal] = useState<OnboardingGoal | null>(null)

  // Prefetch likely destinations while the tour is open.
  useEffect(() => {
    if (!open) return
    const hrefs = [
      '/fitspace/workout',
      '/fitspace/my-plans',
      '/fitspace/explore',
      '/fitspace/explore?tab=free-workouts',
      '/fitspace/explore?tab=premium-plans',
      '/fitspace/progress?tab=activity&volumeGoalWizard=1',
    ]

    for (const href of hrefs) {
      router.prefetch(href)
    }
  }, [open, router])

  // Reset selected goal when tour closes
  useEffect(() => {
    if (!open) {
      setSelectedGoal(null)
      hasTrackedStartRef.current = false
    }
  }, [open])

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

  const setVolumeGoalMutation = useSetVolumeGoalMutation({
    onError: (error) => {
      console.error('Failed to set volume goal:', error)
    },
  })

  const { mutateAsync: startWorkoutDay, isPending: isStartingWorkout } =
    useStartFreeWorkoutDayMutation({
      onSuccess: (data) => {
        if (!data.startFreeWorkoutDay) return

        const { weekId, dayId } = data.startFreeWorkoutDay

        startTransition(() => {
          router.refresh()
          router.push(`/fitspace/workout?week=${weekId}&day=${dayId}`)
        })

        queryInvalidation.favouriteWorkoutStart(queryClient)
      },
      onError: (error) => {
        console.error('Failed to start workout:', error)
        toast.error('Failed to start workout')
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
    (nextPath?: string, context?: { cta?: string; selectedGoal?: string }) => {
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
        selected_goal: context?.selectedGoal ?? selectedGoal?.id ?? null,
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
      selectedGoal?.id,
      user?.profile,
    ],
  )

  const handleGoalSelect = useCallback(
    (goal: OnboardingGoal, next: () => void) => {
      setSelectedGoal(goal)

      // Track goal selection
      captureEvent('onboarding_goal_selected', {
        goal_id: goal.id,
        goal_label: goal.label,
        volume_preset: goal.volumePreset,
        ab_test: flagKey,
        variant: freeTierVariant,
      })

      // Save volume goal to profile (with default moderate commitment)
      setVolumeGoalMutation.mutate({
        focusPreset: goal.volumePreset,
        commitment: 'moderate',
      })

      // Advance to next step
      next()
    },
    [flagKey, freeTierVariant, setVolumeGoalMutation],
  )

  const handleStartWorkout = useCallback(
    async (trainingDayId: string) => {
      captureEvent('onboarding_workout_started', {
        training_day_id: trainingDayId,
        selected_goal: selectedGoal?.id ?? null,
        ab_test: flagKey,
        variant: freeTierVariant,
      })

      try {
        await startWorkoutDay({
          input: {
            trainingDayId,
            replaceExisting: true,
          },
        })
        handleComplete('/fitspace/workout', {
          cta: 'start_workout',
          selectedGoal: selectedGoal?.id,
        })
      } catch {
        // Error handled by mutation onError
      }
    },
    [
      flagKey,
      freeTierVariant,
      handleComplete,
      selectedGoal?.id,
      startWorkoutDay,
    ],
  )

  const handleBrowseMore = useCallback(() => {
    captureEvent('onboarding_tour_cta_clicked', {
      cta: 'browse_more',
      selected_goal: selectedGoal?.id ?? null,
      ab_test: flagKey,
      variant: freeTierVariant,
    })
    handleComplete('/fitspace/explore?tab=free-workouts', {
      cta: 'browse_more',
      selectedGoal: selectedGoal?.id,
    })
  }, [flagKey, freeTierVariant, handleComplete, selectedGoal?.id])

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
        image: {
          src: '/onboarding-tour/workout.png',
          alt: 'Workout tab preview',
          widthClassName: 'w-full',
        },
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
      // Step 4: Progress tab (volume goal)
      {
        id: 'progress',
        target: '[data-onboarding-id="nav-progress"]',
        title: TOUR_CONTENT.progress.title,
        description: TOUR_CONTENT.progress.description,
        image: {
          src: '/onboarding-tour/progress.png',
          alt: 'Progress tab preview',
          widthClassName: 'w-full',
        },
        placement: 'top',
      },
      // Step 5: Explore tab
      {
        id: 'explore',
        target: '[data-onboarding-id="nav-more"]',
        title: TOUR_CONTENT.explore.title,
        description: TOUR_CONTENT.explore.description,
        image: {
          src: '/onboarding-tour/discover.png',
          alt: 'Discover tab preview',
          widthClassName: 'w-full',
        },
        placement: 'top',
      },
    ]

    // Step 5: Free tier info (before goal selection)
    if (includeFreeTierStep) {
      base.push({
        id: 'free-tier',
        title: TOUR_CONTENT.freeTier.title,
        description: TOUR_CONTENT.freeTier.description,
        placement: 'center',
      })
    }

    // Step 6: Goal selection (interactive, centered)
    base.push({
      id: 'goal-selection',
      title: TOUR_CONTENT.goalSelection.title,
      description: TOUR_CONTENT.goalSelection.description,
      placement: 'center',
      footer: ({ next, prev }: { next: () => void; prev: () => void }) => (
        <div className="space-y-3">
          <OnboardingGoalStep
            onSelect={(goal) => handleGoalSelect(goal, next)}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={prev}
            iconStart={<ArrowLeft />}
          >
            Back
          </Button>
        </div>
      ),
    })

    // Final step: Workout picker
    base.push({
      id: 'workout-picker',
      title: TOUR_CONTENT.workoutPicker.title,
      description: TOUR_CONTENT.workoutPicker.description,
      placement: 'center',
      footer: ({ prev }: { prev: () => void }) => (
        <div className="space-y-3">
          {selectedGoal ? (
            <>
              <OnboardingWorkoutStep
                selectedGoalId={selectedGoal.id}
                onStartWorkout={handleStartWorkout}
                onBrowseMore={handleBrowseMore}
                isStarting={isStartingWorkout}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={prev}
                iconStart={<ArrowLeft />}
              >
                Back
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Go back and select a training focus first.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={prev}
                iconStart={<ArrowLeft />}
              >
                Back
              </Button>
            </div>
          )}
        </div>
      ),
    })

    return base
  }, [
    handleBrowseMore,
    handleGoalSelect,
    handleStartWorkout,
    includeFreeTierStep,
    isStartingWorkout,
    selectedGoal,
  ])

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
          selected_goal: selectedGoal?.id ?? null,
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
          selected_goal: selectedGoal?.id ?? null,
        })
      }}
      showProgress
      allowClose
    />
  )
}
