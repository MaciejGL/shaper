'use client'

import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { HeaderTab } from '@/components/header-tab'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { Separator } from '@/components/ui/separator'
import {
  GQLFitspaceGetWorkoutDayQuery,
  useGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import { analyticsEvents } from '@/lib/analytics-events'

import { FavouritesSheet } from '../../quick-workout/components/favourites-sheet'

import { AddSingleExercise } from './add-single-exercise'

type Day = NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']

interface EmptyWorkoutOptionsProps {
  day: Day
}

export function EmptyWorkoutOptions({ day }: EmptyWorkoutOptionsProps) {
  const [showFavourites, setShowFavourites] = useState(false)
  const [showExerciseDrawer, setShowExerciseDrawer] = useState(false)

  const { data: favouritesData } = useGetFavouriteWorkoutsQuery()
  const favouriteWorkouts = favouritesData?.getFavouriteWorkouts ?? []
  const hasCustomPlans = favouriteWorkouts.length > 0

  const eventProperties = {
    day_of_week: day.dayOfWeek,
    has_custom_plans: hasCustomPlans,
  }

  const handleStartPlanClick = () => {
    analyticsEvents.todayEmptyStartPlanTap(eventProperties)
  }

  const handleQuickWorkoutClick = () => {
    analyticsEvents.todayEmptyQuickWorkoutTap(eventProperties)
  }

  const handleBuildOwnClick = () => {
    analyticsEvents.todayEmptyBuildOwnTap(eventProperties)
    setShowExerciseDrawer(true)
  }

  const handleMyPlansClick = () => {
    analyticsEvents.todayEmptyMyPlansTap(eventProperties)
    setShowFavourites(true)
  }

  // const cardVariants = {
  //   hidden: { opacity: 0, y: 10 },
  //   visible: { opacity: 1, y: 0 },
  // }

  return (
    <>
      <div className="space-y-4 pt-6">
        <HeaderTab
          title="Today's workout"
          description="Choose how you want to train today."
        />

        <motion.div
          key={`empty-workout-options-${day.id}`}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="grid gap-4"
        >
          <Card
            className="border-dashed border-black/40 dark:border-neutral-700 bg-transparent py-3 shadow-none"
            onClick={handleBuildOwnClick}
          >
            <CardContent>
              <div className="flex items-center">
                <SectionIcon
                  icon={Dumbbell}
                  variant="indigo"
                  size="sm"
                  className="mr-3"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">Add Exercises</CardTitle>
                  <CardDescription>
                    Add exercises to your workout.
                  </CardDescription>
                </div>
                <Button
                  variant="link"
                  size="icon-sm"
                  iconOnly={<ChevronRight className="size-6!" />}
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Build my own workout */}
          {/* <motion.div key="build-my-own-workout">
            <Card
              className="cursor-pointer transition-all hover:scale-[1.01] py-3"
              onClick={handleBuildOwnClick}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={ListTodoIcon}
                    variant="indigo"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Quick Workout Builder
                    </CardTitle>
                    <CardDescription>
                      Choose your own exercises and sets.
                    </CardDescription>
                  </div>
                  <Button
                    variant="link"
                    size="icon-xs"
                    iconOnly={<ChevronRight className="size-6!" />}
                  >
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Card 4: My plans (conditional) */}
          {hasCustomPlans && (
            <motion.div key="my-plans">
              <Card
                className="dark cursor-pointer transition-all hover:scale-[1.01] py-3"
                onClick={handleMyPlansClick}
                variant="default"
              >
                <CardContent>
                  <div className="flex items-center">
                    <SectionIcon
                      icon={BookmarkIcon}
                      variant="amber"
                      size="sm"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">Your Library</CardTitle>
                      <CardDescription>
                        Use one of your saved programs.
                      </CardDescription>
                    </div>
                    <Button
                      variant="link"
                      size="icon-sm"
                      iconOnly={<ChevronRight className="size-6!" />}
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="px-3 my-2">
            <Separator />
          </div>

          {/* Coaches library */}
          <motion.div key="hypertro-library">
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Coaching Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a program from our coaches.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/fitspace/explore?tab=free-workouts"
                  onClick={handleQuickWorkoutClick}
                  aria-label="Browse coach workouts"
                  className="block w-full text-left px-4 py-3 transition-colors hover:bg-accent/30 active:bg-accent/40 rounded-2xl border border-border overflow-hidden"
                >
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <SectionIcon
                      icon={ClipboardCheck}
                      variant="default"
                      size="xs"
                    />
                    <span className="font-medium">Single Sessions</span>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </Link>
                <Link
                  href="/fitspace/explore?tab=premium-plans"
                  onClick={handleStartPlanClick}
                  aria-label="Browse coach programs"
                  className="block w-full text-left px-4 py-3 transition-colors hover:bg-accent/30 active:bg-accent/40 rounded-2xl border border-border overflow-hidden"
                >
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <SectionIcon
                      icon={CalendarDays}
                      variant="default"
                      size="xs"
                    />
                    <span className="font-medium">Full Programs</span>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Favourites Sheet */}
      {showFavourites && (
        <FavouritesSheet
          open={showFavourites}
          onClose={() => setShowFavourites(false)}
          dayId={day.id}
        />
      )}

      {/* Exercise Selection Drawer (Build my own workout) */}
      <AddSingleExercise
        dayId={day.id}
        variant="drawer-only"
        open={showExerciseDrawer}
        onOpenChange={setShowExerciseDrawer}
        scheduledAt={day.scheduledAt}
      />
    </>
  )
}
