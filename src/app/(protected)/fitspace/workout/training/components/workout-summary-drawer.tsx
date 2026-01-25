'use client'

import { differenceInYears, secondsToMinutes } from 'date-fns'
import { motion } from 'framer-motion'
import { uniq } from 'lodash'
import {
  ArrowRight,
  CheckCheck,
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  FlameIcon,
  LoaderIcon,
  TrendingUp,
  TrophyIcon,
  WeightIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { BiggyIcon } from '@/components/biggy-icon'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutInfoQuery,
  useFitspaceMarkWorkoutAsCompletedMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'
import { calculateCaloriesBurned } from '@/lib/workout/calculate-calories-burned'
import { generateWeightComparison } from '@/utils/weight-comparisons'

import { WorkoutExercise } from './workout-day'
import { WorkoutSetsHeatmap } from './workout-sets-heatmap'

interface WorkoutSummaryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function WorkoutSummaryDrawer({
  open,
  onOpenChange,
  onComplete,
}: WorkoutSummaryDrawerProps) {
  const router = useRouter()
  const { age, weightKg, heightCm, sex } = useProfileMetrics()
  const { weightUnit } = useWeightConversion()
  const [displayedCalories, setDisplayedCalories] = useState({
    moderate: 0,
    high: 0,
  })
  const [displayedSets, setDisplayedSets] = useState(0)
  const [displayedWeight, setDisplayedWeight] = useState(0)
  const [displayedDuration, setDisplayedDuration] = useState(0)
  const [weightComparison, setWeightComparison] = useState<string>('')
  const [dayId] = useQueryState('day')
  const { exercises } = useWorkout()
  const {
    mutateAsync: markWorkoutAsCompleted,
    isPending: isMarkingWorkoutAsCompleted,
  } = useFitspaceMarkWorkoutAsCompletedMutation()

  const { data, isLoading, error } = useFitspaceGetWorkoutInfoQuery(
    {
      dayId: dayId!,
    },
    {
      enabled: !!dayId && open,
    },
  )

  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  )

  const workoutDuration = secondsToMinutes(data?.getWorkoutInfo?.duration ?? 0)
  const shouldShowDurationAndCalories = workoutDuration >= 15

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
        exercise.muscleGroups.map((group) => group.displayGroup),
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

  const completionRate = exercises.length
    ? Math.round(((completedExercises?.length || 0) / exercises.length) * 100)
    : 100

  // Add this effect to update values after 1 second
  useEffect(() => {
    if (open && !isLoading && data) {
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
    isLoading,
    data,
    caloriesBurned.moderate,
    caloriesBurned.high,
    totalSets,
    totalWeight,
    workoutDuration,
    completionRate,
  ])

  const handleCompleteWorkout = async () => {
    try {
      if (!dayId) {
        return
      }
      await markWorkoutAsCompleted({ dayId: dayId! })
      onComplete?.()
      router.push('/fitspace/my-plans')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Workout Summary" className="max-h-[90vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-lg text-center">
            Workout Summary
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? <LoadingContent /> : null}
          {!isLoading && !error && data ? (
            <Content
              displayedDuration={displayedDuration}
              displayedCalories={displayedCalories}
              displayedSets={displayedSets}
              displayedWeight={displayedWeight}
              weightUnit={weightUnit}
              weightComparison={weightComparison}
              totalWeight={totalWeight}
              completedExercises={completedExercises}
              exercises={exercises}
              shouldShowDurationAndCalories={shouldShowDurationAndCalories}
              personalRecords={
                data.getWorkoutInfo?.personalRecords || undefined
              }
            />
          ) : null}
          {!isLoading && error ? <ErrorContent /> : null}
        </div>

        <div className="px-4 pb-safe-area-inset-bottom py-4 border-t">
          <Button
            variant="default"
            className="w-full"
            size="lg"
            onClick={handleCompleteWorkout}
            loading={isMarkingWorkoutAsCompleted}
            iconEnd={<ArrowRight />}
          >
            Go to My Plans
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function LoadingContent() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">Calculating your workout</h3>
        <p className="text-sm text-muted-foreground">
          Crunching the numbers...
        </p>
      </div>
    </div>
  )
}

function ErrorContent() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">
          Unable to load workout summary. Please try again.
        </p>
      </div>
    </div>
  )
}

function Content({
  displayedDuration,
  displayedCalories,
  displayedSets,
  displayedWeight,
  weightUnit,
  weightComparison,
  totalWeight,
  completedExercises,
  exercises,
  shouldShowDurationAndCalories,
  personalRecords,
}: {
  displayedDuration: number
  displayedCalories: { moderate: number; high: number }
  displayedSets: number
  displayedWeight: number
  weightUnit: string
  weightComparison: string
  totalWeight: number
  completedExercises: WorkoutExercise[]
  exercises: WorkoutExercise[]
  shouldShowDurationAndCalories: boolean
  personalRecords?: {
    exerciseName: string
    estimated1RM: number
    weight: number
    reps: number
    improvement: number
  }[]
}) {
  const { toDisplayWeight } = useWeightConversion()

  return (
    <div className="space-y-6 py-4">
      {/* Personal Records */}
      {personalRecords && personalRecords.length > 0 && (
        <div className="pt-4">
          <div className="flex flex-col items-center justify-center gap-2 mb-3 p-4">
            <BiggyIcon icon={TrophyIcon} variant="amber" size="sm" />
            <h3 className="font-medium">
              New Personal Record{personalRecords.length > 1 ? 's' : ''}!
            </h3>
          </div>
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.35, // 100ms delay between children
                  delayChildren: 0.6,
                },
              },
            }}
          >
            {personalRecords.map((pr, index) => (
              <motion.div
                key={index}
                className="overflow-hidden"
                variants={{
                  hidden: {
                    width: 0,
                    opacity: 0,
                  },
                  visible: {
                    width: '100%',
                    opacity: 1,
                    transition: {
                      width: {
                        duration: 0.3,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      },
                      opacity: { duration: 0.6, delay: 0.2 },
                    },
                  },
                }}
              >
                <div className="flex items-start gap-3 text-sm py-2 px-4 bg-linear-to-r from-yellow-200/10 to-yellow-300/80 dark:from-amber-400/0 dark:to-amber-600/60 rounded-r-lg overflow-hidden">
                  <motion.span
                    key="exercise-name"
                    className="font-medium flex-1 min-w-0 whitespace-normal wrap-break-word line-clamp-2"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { delay: 0.2, duration: 0.3 },
                      },
                    }}
                  >
                    {pr.exerciseName}
                  </motion.span>
                  <motion.div
                    key="weight-and-improvement"
                    className="text-right whitespace-nowrap shrink-0"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { delay: 0.2, duration: 0.3 },
                      },
                    }}
                  >
                    <div className="font-semibold">
                      {toDisplayWeight(pr.estimated1RM)?.toFixed(2)}{' '}
                      {weightUnit}
                    </div>
                    {pr.improvement > 0 ? (
                      <div className="text-xs font-medium text-green-600 dark:text-yellow-400 flex items-center justify-end gap-1">
                        +{pr.improvement.toFixed(1)}%{' '}
                        <TrendingUp className="size-3" />
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-green-600 dark:text-yellow-400 flex items-center justify-end gap-1">
                        First PR!
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {totalWeight > 0 ? (
        <motion.div
          key="weight-comparison"
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-linear-to-r from-purple-300 to-blue-300 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">
                You lifted {toDisplayWeight(totalWeight)} {weightUnit}!
              </p>
              <p
                className={cn(
                  'text-md text-purple-600 dark:text-purple-400',
                  !weightComparison && 'animate-pulse',
                )}
              >
                {weightComparison || 'Calculating your weight comparison...'}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {shouldShowDurationAndCalories ? (
            <>
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
            </>
          ) : null}
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

      <div className="pt-2">
        <WorkoutSetsHeatmap completedExercises={completedExercises} />
      </div>

      {/* Exercises Completed */}
      {exercises && exercises.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">Exercises Overview</h2>
            <Badge variant="secondary">
              {completedExercises.length} / {exercises.length}{' '}
              <CheckCheck className=" text-green-600" />
            </Badge>
          </div>
          <div className="space-y-3 border border-border rounded-2xl bg-transparent divide-y">
            {exercises.map((exercise) => {
              const prRecord = personalRecords?.find(
                (pr) =>
                  pr.exerciseName.toLowerCase() === exercise.name.toLowerCase(),
              )

              // Calculate best set (max weight)
              const bestSet = exercise.sets
                .filter((s) => s.completedAt && s.log?.weight && s.log?.reps)
                .reduce(
                  (best, current) => {
                    const weight = current.log?.weight ?? 0
                    const reps = current.log?.reps ?? 0
                    // Let's use max weight for now
                    if (weight > best.weight) {
                      return { weight, reps }
                    }
                    return best
                  },
                  { weight: 0, reps: 0 },
                )

              return (
                <div
                  key={exercise.id}
                  className="relative overflow-hidden flex flex-col p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-base font-medium leading-tight whitespace-normal wrap-break-word">
                        {exercise.name}
                      </p>
                    </div>
                    {exercise.completedAt ? (
                      <div className="flex-center size-6 rounded-full bg-green-500/20 text-green-600 shrink-0">
                        <CheckIcon className="size-3.5" />
                      </div>
                    ) : (
                      <div className="flex-center size-6 rounded-full bg-muted/20 text-muted-foreground/30 shrink-0">
                        <CheckIcon className="size-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between grow gap-4">
                    <div className="flex justify-between items-baseline gap-1 grow">
                      {bestSet.weight > 0 ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-medium text-muted-foreground">
                            Top set
                          </span>
                          <span className="text-sm font-bold tabular-nums tracking-tight">
                            {toDisplayWeight(bestSet.weight)?.toFixed(1)}
                            <span className="text-sm font-medium text-muted-foreground ml-0.5">
                              {weightUnit}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            × {bestSet.reps}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No sets logged
                        </span>
                      )}
                    </div>

                    {prRecord && prRecord.improvement > 0 ? (
                      <Badge
                        variant="premium"
                        className="pl-1.5 pr-2 py-0.5 h-auto"
                      >
                        <span className="font-semibold">
                          PR +{prRecord.improvement.toFixed(1)}%
                        </span>
                      </Badge>
                    ) : prRecord && prRecord.improvement === 0 ? (
                      <Badge
                        variant="premium"
                        className="pl-1.5 pr-2 py-0.5 h-auto"
                      >
                        <span className="font-semibold">First PR!</span>
                      </Badge>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
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
