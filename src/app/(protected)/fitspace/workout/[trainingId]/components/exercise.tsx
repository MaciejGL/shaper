import { useWorkout } from '@/context/workout-context/workout-context'

export function Exercise() {
  const { activeDay, activeWeek } = useWorkout()

  console.log({ activeDay })

  return (
    <div>
      Exercise
      <div>{activeWeek?.name}</div>
      <div>{activeDay?.dayOfWeek}</div>
    </div>
  )
}
