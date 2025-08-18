'use client'

import { motion } from 'framer-motion'
import {
  BookmarkIcon,
  ChevronRight,
  Crown,
  ListTodoIcon,
  Lock,
  SparklesIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'

export interface WorkoutCreationLandingProps {
  onSelectManual: () => void
  onSelectAI: () => void
  onSelectFavourites?: () => void
}

export function WorkoutCreationLanding({
  onSelectManual,
  onSelectAI,
  onSelectFavourites,
}: WorkoutCreationLandingProps) {
  const { hasPremium: hasPremiumAccess } = useUser()
  return (
    <div className="space-y-6">
      {/* Option Cards */}
      <div className="grid gap-4">
        {/* AI Generation Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card
            className="cursor-pointer transition-all"
            variant="secondary"
            onClick={onSelectAI}
          >
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-700 dark:to-amber-500 rounded-lg">
                  <SparklesIcon className="size-5 text-amber-600 dark:text-amber-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Quick Workout
                  </CardTitle>
                  <CardDescription>
                    Automatically suggest exercises for you
                  </CardDescription>
                </div>
                {hasPremiumAccess ? (
                  <Button
                    onClick={onSelectAI}
                    variant="link"
                    iconOnly={<ChevronRight />}
                  >
                    Start Quick Workout
                  </Button>
                ) : (
                  <ButtonLink
                    href="/fitspace/settings#subscription-section"
                    variant="outline"
                    size="sm"
                  >
                    Upgrade
                  </ButtonLink>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favourites Option - Only show if onSelectFavourites is provided */}
        {onSelectFavourites && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card
              className="cursor-pointer transition-all"
              onClick={onSelectFavourites}
            >
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-card-on-card rounded-lg">
                    <BookmarkIcon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">From Favourites</CardTitle>
                    <CardDescription>
                      Select from your saved workouts
                    </CardDescription>
                  </div>
                  <Button
                    onClick={onSelectFavourites}
                    variant="link"
                    iconOnly={<ChevronRight />}
                  >
                    Select Favourite
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Manual Creation Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card
            className="cursor-pointer transition-all"
            onClick={onSelectManual}
          >
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-card-on-card rounded-lg">
                  <ListTodoIcon className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Build your own workout
                  </CardTitle>
                  <CardDescription>
                    Build your workout step by step
                  </CardDescription>
                </div>
                <Button
                  onClick={onSelectManual}
                  variant="link"
                  iconOnly={<ChevronRight />}
                >
                  Start Manual Creation
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
