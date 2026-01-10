'use client'

import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  PencilRuler,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
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
        <p className="text-xl font-medium text-center">Today's workout</p>

        <p className="text-sm text-muted-foreground text-center">
          Choose how you want to train today.
        </p>

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
          {/* Card 1: Start a training plan (Recommended) */}
          <motion.div variants={cardVariants}>
            <Card
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={handleStartPlanClick}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={CalendarDays}
                    variant="primary"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="premium" size="xs">
                        Recommended
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      Start a training plan
                    </CardTitle>
                    <CardDescription>
                      Follow a structured program over weeks.
                    </CardDescription>
                  </div>
                  <Button
                    variant="link"
                    size="icon-sm"
                    iconOnly={<ChevronRight />}
                  >
                    Browse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Quick workout */}
          <motion.div variants={cardVariants}>
            <Card
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={handleQuickWorkoutClick}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={Dumbbell}
                    variant="amber"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">Quick workout</CardTitle>
                    <CardDescription>
                      Use a ready-made workout for today.
                    </CardDescription>
                  </div>
                  <Button
                    variant="link"
                    size="icon-sm"
                    iconOnly={<ChevronRight />}
                  >
                    Browse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Build my own workout */}
          <motion.div variants={cardVariants}>
            <Card
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={handleBuildOwnClick}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={PencilRuler}
                    variant="indigo"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Build my own workout
                    </CardTitle>
                    <CardDescription>
                      Choose exercises and sets manually.
                    </CardDescription>
                  </div>
                  <Button
                    variant="link"
                    size="icon-sm"
                    iconOnly={<ChevronRight />}
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
                className="cursor-pointer transition-all hover:scale-[1.01]"
                onClick={handleMyPlansClick}
              >
                <CardContent>
                  <div className="flex items-center">
                    <SectionIcon
                      icon={BookmarkIcon}
                      variant="purple"
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
                      iconOnly={<ChevronRight />}
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
