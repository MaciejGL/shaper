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
  const { hasPremium: hasPremiumAccess } = useUser()
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            borderless
            className="cursor-pointer transition-all hover:scale-[1.01]"
            onClick={() => setShowAiWizard(true)}
          >
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 mr-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                  <SparklesIcon className="size-5 text-purple-500" />
                </div>
                <div className="flex-1 pr-2">
                  <CardTitle className="text-lg">Quick Workout</CardTitle>
                  <CardDescription>
                    Generate full workout based on your preferences
                  </CardDescription>
                </div>
                {!hasPremiumAccess ? (
                  <ButtonLink
                    href="/fitspace/settings/subscription"
                    size="xs"
                    variant="gradient"
                  >
                    Upgrade
                  </ButtonLink>
                ) : (
                  <Button variant="link" iconOnly={<ChevronRight />}>
                    Generate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* From Favourites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
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
                <Button variant="link" iconOnly={<ChevronRight />}>
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-sm text-muted-foreground text-center">
          or start from a single exercise
        </p>

        {/* Add Single Exercise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <AddSingleExercise dayId={dayId} variant="card" />
        </motion.div>
      </div>

      {/* AI Wizard Sheet */}
      {showAiWizard && (
        <QuickWorkoutAiWizard
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
