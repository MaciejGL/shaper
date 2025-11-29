import { redirect } from 'next/navigation'

import {
  FitspaceGetWorkoutDayDocument,
  FitspaceGetWorkoutNavigationDocument,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'
import { ensureQuickWorkout } from '@/lib/auth/ensure-quick-workout'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageServer } from './training/components/workout-page.server'

// Force dynamic rendering - never cache this redirect logic
// Critical for accurate workout routing after plan status changes
export const dynamic = 'force-dynamic'

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; week?: string }>
}) {
  const { day: dayIdParam } = await searchParams
  // Query active training plans directly
  const user = await getCurrentUser()
  if (!user) {
    return redirect('/login')
  }

  const userId = user?.user.id

  const activePlans = await prisma.trainingPlan.findMany({
    where: {
      OR: [
        {
          assignedToId: userId,
          active: true,
        },
        {
          createdById: userId,
          assignedToId: userId,
          title: 'Quick Workout',
        },
      ],
    },
    select: {
      id: true,
      assignedToId: true,
      createdById: true,
    },
  })

  let quickWorkout = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById === userId,
  )
  const trainingFromTrainer = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById !== userId,
  )

  // If no Quick Workout exists, create it now
  if (!quickWorkout && !trainingFromTrainer) {
    await ensureQuickWorkout(userId)
    // Reload to get the newly created Quick Workout
    const plans = await prisma.trainingPlan.findMany({
      where: {
        createdById: userId,
        assignedToId: userId,
        title: 'Quick Workout',
      },
      select: {
        id: true,
        assignedToId: true,
        createdById: true,
      },
    })
    quickWorkout = plans[0]
  }

  // Determine which training to show
  let trainingId: string
  let isQuickWorkout = false
  if (trainingFromTrainer) {
    trainingId = trainingFromTrainer.id
  } else if (quickWorkout) {
    isQuickWorkout = true
    trainingId = quickWorkout.id
  } else {
    return redirect('/fitspace/my-plans')
  }

  // Render the workout page directly instead of redirecting
  const navigationPromise =
    gqlServerFetch<GQLFitspaceGetWorkoutNavigationQuery>(
      FitspaceGetWorkoutNavigationDocument,
      { trainingId },
    )
  const dayPromise = gqlServerFetch<GQLFitspaceGetWorkoutDayQuery>(
    FitspaceGetWorkoutDayDocument,
    { dayId: dayIdParam, planId: trainingId },
  )

  return (
    <WorkoutPageServer
      trainingId={trainingId}
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
      isQuickWorkout={isQuickWorkout}
    />
  )
}
