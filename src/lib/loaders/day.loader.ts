import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

export const createDayLoaders = () => ({
  isFreeDemo: new DataLoader(async (dayIds: readonly string[]) => {
    const freeWorkoutDays = await prisma.freeWorkoutDay.findMany({
      where: {
        trainingDayId: { in: dayIds as string[] },
        isVisible: true,
      },
      select: {
        trainingDayId: true,
      },
    })

    const map = new Map(
      freeWorkoutDays.map((fwd) => [fwd.trainingDayId, true]),
    )

    return dayIds.map((id) => map.get(id) ?? false)
  }),

  timesStarted: new DataLoader(async (dayIds: readonly string[]) => {
    const counts = await prisma.trainingDay.groupBy({
      by: ['sourceTrainingDayId'],
      where: {
        sourceTrainingDayId: { in: dayIds as string[] },
      },
      _count: {
        sourceTrainingDayId: true,
      },
    })

    const map = new Map(
      counts.map((item) => [
        item.sourceTrainingDayId,
        item._count.sourceTrainingDayId,
      ]),
    )

    return dayIds.map((id) => map.get(id) ?? 0)
  }),
})

