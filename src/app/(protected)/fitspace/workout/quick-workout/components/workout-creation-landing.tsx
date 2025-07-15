'use client'

import { motion } from 'framer-motion'
import { ChevronRight, ListTodoIcon, SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
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
                  // className="self-start"
                >
                  Start Quick Workout
                </Button>
              </div>
            </CardHeader>
            {/* <CardContent className="pt-0">
              <div className="flex flex-wrap flex-col gap-2 text-xs text-muted-foreground items-center">
                <Badge variant="secondary" size="lg" className="w-full">
                  1. Select muscle groups
                </Badge>
                <ArrowDown className="size-2.5 text-muted-foreground/50" />
                <Badge variant="secondary" size="lg" className="w-full">
                  2. Select available equipment
                </Badge>
                <ArrowDown className="size-2.5 text-muted-foreground/50" />
                <Badge variant="gradient" size="lg" className="w-full">
                  3. Set preferences and generate workout
                </Badge>
                <ArrowDown className="size-2.5 text-muted-foreground/50" />
                <Badge variant="primary" size="lg" className="w-full">
                  4. Review and start
                </Badge>
              </div>
            </CardContent> */}
          </Card>
        </motion.div>
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
                  // className="self-start"
                >
                  Start Manual Creation
                </Button>
              </div>
            </CardHeader>
            {/* <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap flex-col gap-2 text-xs text-muted-foreground items-center">
                  <Badge variant="secondary" size="lg" className="w-full">
                    1. Select muscle groups
                  </Badge>
                  <ArrowDown className="size-2.5 text-muted-foreground/50" />
                  <Badge variant="secondary" size="lg" className="w-full">
                    2. Select available equipment
                  </Badge>
                  <ArrowDown className="size-2.5 text-muted-foreground/50" />
                  <Badge variant="secondary" size="lg" className="w-full">
                    3. Select preferred exercises
                  </Badge>
                  <ArrowDown className="size-2.5 text-muted-foreground/50" />
                  <Badge variant="primary" size="lg" className="w-full">
                    4. Review and start workout
                  </Badge>
                </div>
              </div>
            </CardContent> */}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
