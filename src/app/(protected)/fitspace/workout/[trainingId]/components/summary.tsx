import { differenceInYears, secondsToMinutes } from 'date-fns'
import {
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  FlameIcon,
  TrophyIcon,
  WeightIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutInfoQuery,
  useFitspaceMarkWorkoutAsCompletedMutation,
  useProfileQuery,
} from '@/generated/graphql-client'
import { calculateCaloriesBurned } from '@/lib/workout/calculate-calories-burned'

export function Summary({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const router = useRouter()
  const { age, weightKg, heightCm, sex } = useProfileMetrics()
  const [displayedCalories, setDisplayedCalories] = useState({
    moderate: 0,
    high: 0,
  })
  const [displayedSets, setDisplayedSets] = useState(0)
  const [displayedWeight, setDisplayedWeight] = useState(0)
  const [displayedDuration, setDisplayedDuration] = useState(0)
  const [displayedCompletionRate, setDisplayedCompletionRate] = useState(0)
  const { activeDay } = useWorkout()
  const {
    mutateAsync: markWorkoutAsCompleted,
    isPending: isMarkingWorkoutAsCompleted,
  } = useFitspaceMarkWorkoutAsCompletedMutation()
  const { data } = useFitspaceGetWorkoutInfoQuery(
    {
      dayId: activeDay!.id,
    },
    {
      enabled: !!activeDay?.id,
    },
  )

  const completedExercises = activeDay?.exercises.filter(
    (exercise) => exercise.completedAt,
  )

  const workoutDuration = secondsToMinutes(data?.getWorkoutInfo?.duration ?? 0)

  const caloriesBurned = useMemo(
    () =>
      calculateCaloriesBurned({
        durationMinutes: workoutDuration,
        weightKg: weightKg ?? 0,
        heightCm: heightCm ?? 0,
        age,
        gender: sex as 'male' | 'female',
      }),
    [workoutDuration, weightKg, heightCm, age, sex],
  )

  // Calculate total sets and reps
  const totalSets =
    completedExercises?.reduce(
      (acc, exercise) =>
        acc + (exercise.sets.filter((set) => set.completedAt).length || 0),
      0,
    ) || 0

  // Calculate total weight lifted
  const totalWeight =
    completedExercises?.reduce(
      (acc, exercise) =>
        acc +
        (exercise.sets?.reduce(
          (setAcc, set) =>
            setAcc + (set.log?.weight || 0) * (set.log?.reps || 0),
          0,
        ) || 0),
      0,
    ) || 0

  const completionRate = activeDay?.exercises
    ? Math.round(
        ((completedExercises?.length || 0) / activeDay.exercises.length) * 100,
      )
    : 100

  // Add this effect to update values after 1 second
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setDisplayedCalories({
          moderate: caloriesBurned.moderate,
          high: caloriesBurned.high,
        })
        setDisplayedSets(totalSets)
        setDisplayedWeight(totalWeight)
        setDisplayedDuration(workoutDuration)
        setDisplayedCompletionRate(completionRate)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Reset to 0 when dialog closes
      setDisplayedCalories({ moderate: 0, high: 0 })
      setDisplayedSets(0)
      setDisplayedWeight(0)
      setDisplayedDuration(0)
      setDisplayedCompletionRate(0)
    }
  }, [
    open,
    caloriesBurned.moderate,
    caloriesBurned.high,
    totalSets,
    totalWeight,
    workoutDuration,
    completionRate,
  ])

  const handleCompleteWorkout = async () => {
    try {
      if (!activeDay) {
        return
      }
      await markWorkoutAsCompleted({ dayId: activeDay!.id })
      router.push('/fitspace/my-plans?tab=active')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fullScreen
        withCloseButton={false}
        dialogTitle="Workout Summary"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Workout Complete!
          </DialogTitle>
          <DialogDescription>
            Great job! Here's your workout summary for today.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Completion Status */}
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <Badge
                  variant={completionRate === 100 ? 'primary' : 'secondary'}
                >
                  {completionRate}% Complete
                </Badge>
              </div>
              <Progress value={displayedCompletionRate} duration={1000} />
            </div>
          </div>

          {/* Workout Stats */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Workout Stats</h2>

            <div className="grid grid-cols-2 gap-4 bg-muted rounded-lg p-4">
              <StatsItem
                value={displayedDuration}
                label="Duration (min)"
                icon={<ClockIcon className="h-4 w-4 text-yellow-600" />}
              />
              <StatsItem
                value={
                  <div className="flex items-center gap-2">
                    <AnimateNumber value={displayedCalories.moderate} />
                  </div>
                }
                label="Calories burned"
                icon={<FlameIcon className="h-4 w-4 text-amber-600" />}
              />
              <StatsItem
                value={displayedSets}
                label="Sets completed"
                icon={<DumbbellIcon className="h-4 w-4 text-green-600" />}
              />
              <StatsItem
                value={displayedWeight}
                label="Total volume (kg)"
                icon={<WeightIcon className="h-4 w-4 text-blue-600" />}
              />
            </div>
          </div>

          {/* Exercises Completed */}
          {completedExercises && completedExercises.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Exercises Completed</h2>
              <div className="space-y-2 bg-muted rounded-lg p-4">
                <div className="space-y-2">
                  {completedExercises.map((exercise, index) => (
                    <Fragment key={index}>
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.sets?.length || 0} sets completed
                          </p>
                        </div>
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      </div>
                      <Separator className="last:hidden" />
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="bg-primary/5 border-primary/20 rounded-lg p-4">
            <div className="text-center space-y-2">
              <TrophyIcon className="h-8 w-8 mx-auto text-yellow-400" />
              <p className="text-sm font-medium">
                {completionRate === 100
                  ? 'Perfect workout! You completed everything!'
                  : 'Great effort! Keep pushing towards your goals!'}
              </p>
              <p className="text-xs text-muted-foreground">
                Consistency is key to reaching your fitness goals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="secondary" className="flex-1">
              Continue
            </Button>
          </DialogClose>
          <Button
            onClick={handleCompleteWorkout}
            className="flex-1"
            loading={isMarkingWorkoutAsCompleted}
          >
            Complete Workout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const useProfileMetrics = () => {
  const { data } = useProfileQuery()
  const age = data?.profile?.birthday
    ? differenceInYears(new Date(), new Date(data?.profile?.birthday))
    : 0

  const weightKg = data?.profile?.weight
  const heightCm = data?.profile?.height
  const sex = data?.profile?.sex

  return {
    age,
    weightKg,
    heightCm,
    sex,
  }
}
