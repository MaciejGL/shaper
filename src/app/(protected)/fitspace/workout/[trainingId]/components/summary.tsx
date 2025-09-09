import { differenceInYears, secondsToMinutes } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { uniq } from 'lodash'
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  FlameIcon,
  WeightIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { StatsItem } from '@/components/stats-item'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/context/user-context'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutInfoQuery,
  useFitspaceMarkWorkoutAsCompletedMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { calculateCaloriesBurned } from '@/lib/workout/calculate-calories-burned'
import { generateWeightComparison } from '@/utils/weight-comparisons'

export function Summary({
  open,
  onContinue,
  continueButtonText,
}: {
  open: boolean
  onContinue?: () => void
  continueButtonText?: string
}) {
  const router = useRouter()
  const { age, weightKg, heightCm, sex } = useProfileMetrics()
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const [displayedCalories, setDisplayedCalories] = useState({
    moderate: 0,
    high: 0,
  })
  const [displayedSets, setDisplayedSets] = useState(0)
  const [displayedWeight, setDisplayedWeight] = useState(0)
  const [displayedDuration, setDisplayedDuration] = useState(0)
  const [weightComparison, setWeightComparison] = useState<string>('')
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
      enabled: !!activeDay?.id && open,
    },
  )

  const completedExercises = activeDay?.exercises.filter(
    (exercise) => exercise.completedAt,
  )

  const workoutDuration = secondsToMinutes(data?.getWorkoutInfo?.duration ?? 0)

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

  const muscleGroups = useMemo(() => {
    return uniq(
      completedExercises?.flatMap((exercise) =>
        exercise.muscleGroups.map((group) => group.groupSlug),
      ),
    )
  }, [completedExercises])

  const caloriesBurned = useMemo(
    () =>
      calculateCaloriesBurned({
        durationMinutes: workoutDuration,
        weightKg: weightKg ?? 0,
        heightCm: heightCm ?? 0,
        age,
        gender: sex as 'male' | 'female',
        muscleGroups,
      }),
    [workoutDuration, weightKg, heightCm, age, sex, muscleGroups],
  )

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

        // Generate fun weight comparison if there's weight lifted
        if (totalWeight > 0) {
          const { comparison } = generateWeightComparison(totalWeight)
          setWeightComparison(comparison)
        } else {
          setWeightComparison('')
        }
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Reset to 0 when dialog closes
      setDisplayedCalories({ moderate: 0, high: 0 })
      setDisplayedSets(0)
      setDisplayedWeight(0)
      setDisplayedDuration(0)
      setWeightComparison('')
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
    <div>
      <div className="space-y-6">
        <div className="space-y-8">
          {/* Workout Stats */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Stats</h2>

            <div className="grid grid-cols-2 gap-4 bg-card rounded-lg p-4 shadow-xs">
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
                value={toDisplayWeight(displayedWeight)?.toFixed() || 0}
                label={`Total volume (${weightUnit})`}
                icon={<WeightIcon className="h-4 w-4 text-blue-600" />}
              />
            </div>
          </div>

          {/* Fun Weight Comparison */}
          <AnimatePresence>
            {weightComparison && (
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">
                      You lifted {toDisplayWeight(totalWeight) || 0}{' '}
                      {weightUnit}!
                    </p>
                    <p className="text-md text-purple-600 dark:text-purple-400">
                      {weightComparison}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercises Completed */}
          {completedExercises && completedExercises.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Exercises Completed</h2>
              <div className="space-y-2 bg-card rounded-lg p-4 shadow-xs">
                <div>
                  {completedExercises.map((exercise, index) => (
                    <Fragment key={index}>
                      <div
                        key={index}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div>
                          <p className="text-sm font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.sets?.length || 0} sets
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
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="flex gap-2 pt-4">
          {onContinue && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onContinue}
              iconStart={<ArrowLeftIcon />}
            >
              {continueButtonText || 'Continue'}
            </Button>
          )}
          <Button
            variant="default"
            className="flex-1"
            size="lg"
            onClick={handleCompleteWorkout}
            loading={isMarkingWorkoutAsCompleted}
            iconStart={<CheckIcon />}
          >
            Complete Workout
          </Button>
        </div>
      </div>
    </div>
  )
}

const useProfileMetrics = () => {
  const { user } = useUser()
  const age = user?.profile?.birthday
    ? differenceInYears(new Date(), new Date(user?.profile?.birthday))
    : 0

  const weightKg = user?.profile?.weight
  const heightCm = user?.profile?.height
  const sex = user?.profile?.sex

  return {
    age,
    weightKg,
    heightCm,
    sex,
  }
}
