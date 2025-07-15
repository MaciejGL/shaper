'use client'

import { motion } from 'framer-motion'
import { Clock, Info, Sparkles } from 'lucide-react'
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
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
              Your AI-Generated Workout
            </CardTitle>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            {data.aiMeta.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration */}
          {data.totalDuration && (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Estimated duration: {data.totalDuration} minutes
              </span>
            </div>
          )}

          {/* Reasoning Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReasoning(!showReasoning)}
            className="h-auto p-0 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
          >
            <Info className="h-4 w-4 mr-1" />
            {showReasoning ? 'Hide' : 'Show'} AI reasoning
          </Button>

          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg"
            >
              {data.aiMeta.reasoning}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
