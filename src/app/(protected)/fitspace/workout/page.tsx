import { redirect } from 'next/navigation'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

// Force dynamic rendering - never cache this redirect logic
// Critical for accurate workout routing after plan status changes
export const dynamic = 'force-dynamic'

export default async function SessionPage() {
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
        },
      ],
    },
    select: {
      id: true,
      assignedToId: true,
      createdById: true,
    },
  })

  const quickWorkout = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById === userId,
  )
  const trainingFromTrainer = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById !== userId,
  )

  // Priority: Trainer-assigned plan > Quick Workout > My Plans
  if (trainingFromTrainer) {
    return redirect(`/fitspace/workout/${trainingFromTrainer.id}`)
  } else if (quickWorkout) {
    return redirect('/fitspace/workout/quick-workout')
  } else {
    return redirect('/fitspace/my-plans')
  }
}
