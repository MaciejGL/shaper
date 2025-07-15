'use client'

import { motion } from 'framer-motion'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { RepFocus } from '../ai-workout-input'

interface RepFocusSelectorProps {
  value: RepFocus
  onChange: (repFocus: RepFocus) => void
  className?: string
}

const REP_FOCUS_OPTIONS = [
  {
    value: 'strength' as RepFocus,
    label: 'Strength',
    description: '3-6 reps - Maximum strength gains',
  },
  {
    value: 'hypertrophy' as RepFocus,
    label: 'Hypertrophy',
    description: '6-12 reps - Muscle growth and size',
  },
  {
    value: 'endurance' as RepFocus,
    label: 'Endurance',
    description: '12-20 reps - Muscular endurance',
  },
]

export function RepFocusSelector({
  value,
  onChange,
  className,
}: RepFocusSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Training Focus
          </CardTitle>
          <CardDescription>
            What type of training adaptation are you targeting?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REP_FOCUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  value === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="repFocus"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          `w-4 h-4 rounded-full border-2 ${
                            value === option.value
                              ? 'border-primary'
                              : 'border-gray-300'
                          } flex items-center justify-center`,
                        )}
                      >
                        {value === option.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
