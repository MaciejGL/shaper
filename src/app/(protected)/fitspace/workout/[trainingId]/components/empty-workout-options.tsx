'use client'

import { motion } from 'framer-motion'
import { BookmarkIcon, ChevronRight, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { FavouritesSheet } from '../../quick-workout/components/favourites-sheet'
import { QuickWorkoutAiWizard } from '../../quick-workout/components/quick-workout-ai-wizard'

import { AddSingleExercise } from './add-single-exercise'

interface EmptyWorkoutOptionsProps {
  dayId: string
}

export function EmptyWorkoutOptions({ dayId }: EmptyWorkoutOptionsProps) {
  const { hasPremium: hasPremiumAccess, isLoading: isLoadingUser } = useUser()
  const [showAiWizard, setShowAiWizard] = useState(false)
  const [showFavourites, setShowFavourites] = useState(false)

  return (
    <>
      <div className="space-y-4 mt-4">
        <p className="text-xl font-medium text-center">Create workout</p>
        <p className="text-sm text-muted-foreground text-center">
          Choose how you'd like to build your workout
        </p>
        {/* AI Quick Workout Generator */}
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
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card
              borderless
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => hasPremiumAccess && setShowAiWizard(true)}
            >
              <CardContent>
                <div className="flex items-center">
                  <div className="p-2 mr-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                    <SparklesIcon className="size-4 text-white" />
                  </div>
                  <div className="flex-1 pr-2">
                    <CardTitle className="text-lg">Quick Workout</CardTitle>
                    <CardDescription>
                      Generate based on your preferences
                    </CardDescription>
                  </div>
                  {!hasPremiumAccess && !isLoadingUser ? (
                    <ButtonLink
                      href="/fitspace/settings/subscription"
                      size="xs"
                      variant="gradient"
                    >
                      Upgrade
                    </ButtonLink>
                  ) : (
                    <Button
                      variant="link"
                      size="icon-sm"
                      iconOnly={<ChevronRight />}
                    >
                      Generate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* From Favourites */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card
              borderless
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => setShowFavourites(true)}
            >
              <CardContent>
                <div className="flex items-center">
                  <div className="p-2 mr-3 bg-card-on-card rounded-lg">
                    <BookmarkIcon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">From Favourites</CardTitle>
                    <CardDescription>
                      Select from your saved workouts
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

      {/* AI Wizard Sheet */}
      {showAiWizard && (
        <QuickWorkoutAiWizard
          mode="quick-workout"
          open={showAiWizard}
          onClose={() => setShowAiWizard(false)}
          dayId={dayId}
        />
      )}

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
