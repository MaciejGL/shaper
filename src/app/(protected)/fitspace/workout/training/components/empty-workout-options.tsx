'use client'

import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  CalendarDays,
  ChevronRight,
  Dumbbell,
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

import { FavouritesSheet } from '../../quick-workout/components/favourites-sheet'

// import { QuickWorkoutAiWizard } from '../../quick-workout/components/quick-workout-ai-wizard'

import { AddSingleExercise } from './add-single-exercise'

interface EmptyWorkoutOptionsProps {
  dayId: string
}

export function EmptyWorkoutOptions({ dayId }: EmptyWorkoutOptionsProps) {
  const router = useRouter()
  // const [showAiWizard, setShowAiWizard] = useState(false)
  const [showFavourites, setShowFavourites] = useState(false)

  return (
    <>
      <div className="space-y-4 pt-6">
        <p className="text-xl font-medium text-center">Select a workout</p>
        <p className="text-sm text-muted-foreground text-center">
          Choose how you'd like to build your workout
        </p>
        {/* AI Quick Workout Generator - HIDDEN */}
        <motion.div
          key={`empty-workout-options-${dayId}`}
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
          {/* Free Workouts */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card
              variant="premium"
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => router.push('/fitspace/explore?tab=free-workouts')}
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
                    <CardTitle className="text-lg">Free Workouts</CardTitle>
                    <CardDescription>Ready-made workouts</CardDescription>
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

          {/* Training Plans */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card
              variant="premium"
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => router.push('/fitspace/explore?tab=premium-plans')}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={CalendarDays}
                    variant="amber"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">Training Plans</CardTitle>
                    <CardDescription>
                      Structured multi-week programs
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

          {/* My Custom */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => setShowFavourites(true)}
            >
              <CardContent>
                <div className="flex items-center">
                  <SectionIcon
                    icon={BookmarkIcon}
                    variant="indigo"
                    size="sm"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">My Custom Plans</CardTitle>
                    <CardDescription>
                      Select from your saved plans
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

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-sm text-muted-foreground text-center"
          >
            or start from a single exercise
          </motion.p>

          {/* Add Single Exercise */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <AddSingleExercise dayId={dayId} variant="card" />
          </motion.div>
        </motion.div>
      </div>

      {/* AI Wizard Sheet - HIDDEN */}
      {/* {showAiWizard && (
        <QuickWorkoutAiWizard
          mode="quick-workout"
          open={showAiWizard}
          onClose={() => setShowAiWizard(false)}
          dayId={dayId}
        />
      )} */}

      {/* Favourites Sheet */}
      {showFavourites && (
        <FavouritesSheet
          open={showFavourites}
          onClose={() => setShowFavourites(false)}
          dayId={dayId}
        />
      )}
    </>
  )
}
