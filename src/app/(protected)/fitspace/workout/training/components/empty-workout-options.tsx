'use client'

import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  ListTodoIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  const router = useRouter()
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
    router.push('/fitspace/explore?tab=premium-plans')
  }

  const handleQuickWorkoutClick = () => {
    analyticsEvents.todayEmptyQuickWorkoutTap(eventProperties)
    router.push('/fitspace/explore?tab=free-workouts')
  }

  const handleBuildOwnClick = () => {
    analyticsEvents.todayEmptyBuildOwnTap(eventProperties)
    setShowExerciseDrawer(true)
  }

  const handleMyPlansClick = () => {
    analyticsEvents.todayEmptyMyPlansTap(eventProperties)
    setShowFavourites(true)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <div className="space-y-4 pt-6">
        <div className="space-y-2 mb-6">
          <p className="text-2xl font-semibold text-left">Today's workout</p>

          <p className="text-sm text-muted-foreground text-left">
            Choose how you want to train today.
          </p>
        </div>

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
          {/* Hero card: Hypertro library */}
          <motion.div variants={cardVariants}>
            <Card variant="glass" className="border-border">
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Hypro Library</CardTitle>
                  <CardDescription>
                    Choose a program or a ready-made workout.
                  </CardDescription>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="justify-start"
                    iconStart={<CalendarDays />}
                    onClick={handleStartPlanClick}
                  >
                    Programs
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="justify-start"
                    iconStart={<Dumbbell />}
                    onClick={handleQuickWorkoutClick}
                  >
                    Workouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="px-4">
            <Separator />
          </div>

          {/* Card 3: Build my own workout */}
          <motion.div variants={cardVariants}>
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
                    <CardTitle className="text-lg">Custom Workout</CardTitle>
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
          </motion.div>

          {/* Card 4: My plans (conditional) */}
          {hasCustomPlans && (
            <motion.div variants={cardVariants}>
              <Card
                className="cursor-pointer transition-all hover:scale-[1.01] py-3"
                onClick={handleMyPlansClick}
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
                      <CardTitle className="text-lg">My plans</CardTitle>
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
