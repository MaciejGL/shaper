'use client'

import { motion } from 'framer-motion'
import { PlusIcon, SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'

interface EmptyFavouriteOptionsProps {
  onOpenAiWizard: () => void
  onOpenAddExercise: () => void
  hasExercises?: boolean
}

export function EmptyFavouriteOptions({
  onOpenAiWizard,
  onOpenAddExercise,
  hasExercises = false,
}: EmptyFavouriteOptionsProps) {
  const { hasPremium: hasPremiumAccess } = useUser()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Choose how you'd like to build your template
      </p>

      {/* AI Quick Workout Generator - Only show if no exercises yet */}
      {!hasExercises && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="cursor-pointer transition-all"
            onClick={hasPremiumAccess ? onOpenAiWizard : undefined}
          >
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 mr-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                  <SparklesIcon className="size-5 text-purple-500" />
                </div>
                <div className="flex-1 pr-2">
                  <CardTitle className="text-lg">Generate with AI</CardTitle>
                  <CardDescription>
                    Let AI create a workout based on your preferences
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
                  <Button variant="link" iconOnly={<SparklesIcon />}>
                    Generate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Single Exercise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card
          className="cursor-pointer transition-all"
          onClick={onOpenAddExercise}
        >
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-3 bg-card-on-card rounded-lg">
                <PlusIcon className="size-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Add Single Exercise</CardTitle>
                <CardDescription>
                  Build your template one exercise at a time
                </CardDescription>
              </div>
              <Button variant="link" iconOnly={<PlusIcon />}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
