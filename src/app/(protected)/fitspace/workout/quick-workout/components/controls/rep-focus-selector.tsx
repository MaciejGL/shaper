'use client'

import { motion } from 'framer-motion'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioOption } from '@/components/ui/radio-option'

import type { RepFocus } from '../../hooks/use-ai-workout-generation'

interface RepFocusSelectorProps {
  value: RepFocus
  onChange: (repFocus: RepFocus) => void
  className?: string
}

const REP_FOCUS_OPTIONS = [
  {
    value: 'strength' as RepFocus,
    label: 'Strength',
    description: '3-8 reps - Maximum strength gains',
  },
  {
    value: 'hypertrophy' as RepFocus,
    label: 'Hyprophy',
    description: '8-12 reps - Muscle growth and size',
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.07, delay: 0.03 }}
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
          <div className="space-y-2">
            {REP_FOCUS_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                value={option.value}
                selectedValue={value}
                onChange={onChange}
                label={option.label}
                description={option.description}
                name="repFocus"
                variant="default"
                className="py-2"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
