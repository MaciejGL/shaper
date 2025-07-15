'use client'

import { motion } from 'framer-motion'
import { PlusIcon, SparklesIcon } from 'lucide-react'

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
          <Card className="cursor-pointer transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manual Creation</CardTitle>
                  <CardDescription>
                    Build your workout step by step
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose your muscle groups, select equipment, and pick
                  exercises yourself.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">1. Pick muscles</Badge>
                  <Badge variant="secondary">2. Choose equipment</Badge>
                  <Badge variant="secondary">3. Select exercises</Badge>
                  <Badge variant="secondary">4. Review</Badge>
                </div>
                <Button
                  onClick={onSelectManual}
                  className="w-full"
                  variant="secondary"
                >
                  Start Manual Creation
                </Button>
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
          <Card className="cursor-pointer transition-all" variant="gradient">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Quick Workout
                  </CardTitle>
                  <CardDescription>
                    Let us find the best exercises for you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  We'll find the best exercises for you based on your goals and
                  preferences.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">1. Quick setup</Badge>
                  <Badge variant="secondary">2. Smart suggestions</Badge>
                </div>
                <Button
                  onClick={onSelectAI}
                  variant="gradient"
                  iconStart={<SparklesIcon />}
                  className="w-full"
                >
                  Get a quick workout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          You can always switch between manual and AI creation later
        </p>
      </div>
    </div>
  )
}
