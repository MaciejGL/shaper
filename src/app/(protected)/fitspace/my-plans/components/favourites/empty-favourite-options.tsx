'use client'

import { motion } from 'framer-motion'
import { ChevronRight, PlusIcon, SparklesIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useOpenUrl } from '@/hooks/use-open-url'

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
  const pathname = usePathname()
  const { hasPremium: hasPremiumAccess, isLoading: isLoadingUser } = useUser()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl()

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
            variant="premium"
            className="cursor-pointer transition-all"
            onClick={hasPremiumAccess ? onOpenAiWizard : undefined}
          >
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 mr-3 bg-gradient-to-br from-amber-500/20 to-amber-500/20 rounded-lg">
                  <SparklesIcon className="size-5 text-amber-500" />
                </div>
                <div className="flex-1 pr-2">
                  <CardTitle className="text-lg">Generate Workout</CardTitle>
                  <CardDescription>
                    Let us create a workout based on your preferences
                  </CardDescription>
                </div>
                {!hasPremiumAccess && !isLoadingUser ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      openUrl(
                        `/account-management/offers?redirectUrl=${encodeURIComponent(pathname)}`,
                      )
                    }}
                    size="xs"
                    variant="gradient"
                    loading={isOpeningUrl}
                    disabled={isOpeningUrl}
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Button variant="link" iconOnly={<ChevronRight />}>
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
          variant="tertiary"
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
              <Button variant="link" iconOnly={<ChevronRight />}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
