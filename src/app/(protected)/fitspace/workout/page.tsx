import { redirect } from 'next/navigation'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

export default async function SessionPage() {
  // Query active training plans directly
  const user = await getCurrentUser()
  if (!user) {
    return redirect('/login')
  }

  const userId = user?.user.id

  const activePlans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: userId,
      active: true,
    },
    select: {
      id: true,
      assignedToId: true,
      createdById: true,
    },
  })

  const quickWorkoutId = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById === userId,
  )
  const trainingFromTrainer = activePlans.find(
    (plan) => plan.assignedToId === userId && plan.createdById !== userId,
  )

  if (trainingFromTrainer) {
    return redirect(`/fitspace/workout/${trainingFromTrainer.id}`)
  } else if (quickWorkoutId) {
    return redirect(`/fitspace/workout/${quickWorkoutId.id}`)
  } else {
    return redirect('/fitspace/my-plans')
  }
}
