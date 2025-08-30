import { redirect } from 'next/navigation'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

export default async function SessionPage() {
  const user = await getCurrentUser()
  const activePlans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: user?.user.id,
      active: true,
    },
    select: {
      id: true,
      assignedToId: true,
      createdById: true,
    },
  })

  const quickWorkoutId = activePlans.find(
    (plan) =>
      plan.assignedToId === user?.user.id && plan.createdById === user?.user.id,
  )
  const trainingFromTrainer = activePlans.find(
    (plan) =>
      plan.assignedToId === user?.user.id && plan.createdById !== user?.user.id,
  )

  if (trainingFromTrainer) {
    return redirect(`/fitspace/workout/${trainingFromTrainer.id}`)
  } else if (quickWorkoutId) {
    return redirect(`/fitspace/workout/${quickWorkoutId.id}`)
  } else {
    return redirect('/fitspace/my-plans')
  }
}
