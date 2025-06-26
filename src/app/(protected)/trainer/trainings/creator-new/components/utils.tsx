import { TrainingDay, TrainingExercise } from '../../creator/components/types'

export type Entry<K, V> = {
  key: K
  value: V
}

export const toEntries = <K extends string, T>(
  record: Partial<Record<K, T>>,
): Entry<K, T>[] =>
  Object.entries(record).map(([key, value]) => ({
    key: key as K,
    value: value as T,
  }))

export const makeRecord = <K extends string>(
  keys: readonly K[],
  getValue: () => TrainingExercise[],
): Record<K, TrainingExercise[]> => {
  const result = {} as Record<K, TrainingExercise[]>
  keys.forEach((key) => {
    result[key] = getValue()
  })
  return result
}

export const groupExercisesByDay = (days: TrainingDay[]) => {
  // Create a record with all days, even if they have no exercises
  const dayRecord: Record<string, TrainingExercise[]> = {}

  days.forEach((day) => {
    dayRecord[day.id] = [...day.exercises].sort((a, b) => a.order - b.order)
  })

  return toEntries(dayRecord)
}

export const sortEntitiesWithOrder = <T extends { order: number }>(
  items: T[],
) => [...items].sort((a, b) => a.order - b.order)

export type EntityWithOrder = {
  order: number
}

const orderIncrementStep = 1024

export const getNewOrder = ({
  orders,
  sourceIndex,
  destinationIndex,
}: {
  orders: number[]
  sourceIndex: number | null
  destinationIndex: number
}) => {
  const sortedOrders = [...orders].sort((a, b) => a - b)

  // Remove the source item if it's from the same list
  if (sourceIndex !== null) {
    sortedOrders.splice(sourceIndex, 1)
  }

  // If inserting at the beginning
  if (destinationIndex === 0) {
    return sortedOrders.length > 0
      ? sortedOrders[0] - orderIncrementStep
      : orderIncrementStep
  }

  // If inserting at the end
  if (destinationIndex >= sortedOrders.length) {
    return sortedOrders.length > 0
      ? sortedOrders[sortedOrders.length - 1] + orderIncrementStep
      : orderIncrementStep
  }

  // If inserting between items
  const prevOrder = sortedOrders[destinationIndex - 1]
  const nextOrder = sortedOrders[destinationIndex]

  return (prevOrder + nextOrder) / 2
}
