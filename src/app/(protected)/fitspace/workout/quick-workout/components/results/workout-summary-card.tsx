'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Clock, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface WorkoutSummaryCardProps {
  data: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']
  className?: string
}

export function WorkoutSummaryCard({
  data,
  className,
}: WorkoutSummaryCardProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg ">Your Workout</CardTitle>
          </div>
          <CardDescription>{data.aiMeta.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.totalDuration && (
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Estimated duration: {data.totalDuration} minutes
              </span>
            </div>
          )}

          {/* Reasoning Toggle */}
          <Button
            variant="variantless"
            size="sm"
            onClick={() => setShowReasoning(!showReasoning)}
            className="h-auto text-left p-0 text-muted-foreground hover:text-primary"
            iconEnd={
              <ChevronDown
                className={cn(
                  'transition-transform duration-300',
                  showReasoning ? 'rotate-180' : '',
                )}
              />
            }
          >
            {showReasoning ? 'Hide' : 'Show'} reasoning
          </Button>
          <AnimatePresence mode="wait">
            {showReasoning && (
              <motion.div
                key={data.aiMeta.reasoning}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg mt-2">
                  {data.aiMeta.reasoning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
