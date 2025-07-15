'use client'

import { motion } from 'framer-motion'
import { ChevronRight, ListTodoIcon, SparklesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface WorkoutCreationLandingProps {
  onSelectManual: () => void
  onSelectAI: () => void
}

export function WorkoutCreationLanding({
  onSelectManual,
  onSelectAI,
}: WorkoutCreationLandingProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Option Cards */}
      <div className="grid gap-4">
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
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-card-on-card rounded-lg">
                  <ListTodoIcon className="size-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Manual Creation</CardTitle>
                  <CardDescription>
                    Build your workout step by step
                  </CardDescription>
                </div>
                <Button
                  onClick={onSelectManual}
                  variant="link"
                  iconOnly={<ChevronRight />}
                  className="self-start"
                >
                  Start Manual Creation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">1. Select muscles</Badge>
                  <Badge variant="secondary">2. Select equipment</Badge>
                  <Badge variant="secondary">3. Select exercises</Badge>
                  <Badge variant="secondary">4. Review</Badge>
                  <Badge variant="secondary">5. Start workout</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Generation Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card
            className="cursor-pointer transition-all"
            variant="gradient"
            onClick={onSelectAI}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-200 to-amber-400 dark:from-amber-700 dark:to-amber-500 rounded-lg">
                  <SparklesIcon className="size-5 text-amber-600 dark:text-amber-200" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Quick Workout
                  </CardTitle>
                  <CardDescription>
                    Let us find the exercises for you
                  </CardDescription>
                </div>
                <Button
                  onClick={onSelectAI}
                  variant="link"
                  iconOnly={<ChevronRight />}
                  className="self-start"
                >
                  Start Quick Workout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">1. Quick setup</Badge>
                <Badge variant="secondary">2. Review</Badge>
                <Badge variant="secondary">3. Start workout</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
