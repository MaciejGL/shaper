'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
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

import { useOnboardingTour } from './use-onboarding-tour'

// Step content
const TOUR_CONTENT = {
  welcome: {
    title: 'Nice — You’re set up',
    description: [
      'I’m Mats from the Hypro team.',
      'Let show you the main places you’ll use—then you’re straight into your first workout.',
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
      'I’m a real person on the Hypro team—message me anytime for help with the app, training questions, or a quick nudge to stay on track.',
    ],
  },
  goodbye: {
    title: "You're All Set!",
    description: [
      'Alright—time to train.',
      'Pick a free workout, browse plans, or jump straight into a session.',
      'If you get stuck, just message me.',
    ],
  },
}

export function OnboardingTour() {
  const router = useRouter()
  const { user } = useUser()
  const { open, close } = useOnboardingTour()

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
    (nextPath?: string) => {
      close()
      if (!user?.profile) return
      markCompletedOptimistic({
        input: { hasCompletedOnboarding: true },
      }).catch(() => {
        // error already handled by mutation onError
      })
      if (nextPath) router.push(nextPath)
    },
    [close, markCompletedOptimistic, router, user?.profile],
  )

  const steps = useMemo<TourStep[]>(
    () => [
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
      // Step 6: Goodbye (centered) with custom CTAs
      {
        id: 'goodbye',
        title: TOUR_CONTENT.goodbye.title,
        description: TOUR_CONTENT.goodbye.description,
        placement: 'center',
        footer: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleComplete('/fitspace/explore?tab=free-workouts')
                }
              >
                Free workouts
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleComplete('/fitspace/explore?tab=premium-plans')
                }
              >
                Browse plans
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full"
              onClick={() => handleComplete('/fitspace/workout')}
            >
              Start training
            </Button>
          </div>
        ),
      },
    ],
    [handleComplete],
  )

  return (
    <Tour
      steps={steps}
      open={open}
      onComplete={() => handleComplete()}
      onSkip={() => handleComplete()}
      showProgress
      allowClose
    />
  )
}
