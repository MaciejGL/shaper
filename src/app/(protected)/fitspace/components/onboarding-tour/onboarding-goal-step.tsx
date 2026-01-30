'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Sparkles, Target } from 'lucide-react'

import {
  ONBOARDING_GOALS,
  type OnboardingGoal,
} from '@/config/onboarding-workouts'
import { cn } from '@/lib/utils'

const GOAL_ICONS: Record<string, React.ElementType> = {
  'upper-body': Dumbbell,
  'lower-body': Target,
  balanced: Sparkles,
}

interface OnboardingGoalStepProps {
  onSelect: (goal: OnboardingGoal) => void
}

export function OnboardingGoalStep({ onSelect }: OnboardingGoalStepProps) {
  return (
    <div className="space-y-2">
      {ONBOARDING_GOALS.map((goal, index) => {
        const Icon = GOAL_ICONS[goal.id] ?? Dumbbell
        return (
          <motion.button
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(goal)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg',
              'bg-card/50 border border-border/50',
              'hover:bg-accent hover:border-primary/50',
              'transition-colors text-left',
            )}
          >
            <div className="flex-center size-10 rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{goal.label}</p>
              <p className="text-sm text-muted-foreground">
                {goal.description}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
