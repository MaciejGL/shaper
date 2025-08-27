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

import type { RpeRange } from '../../hooks/use-ai-workout-generation'

interface RpeRangeSelectorProps {
  value: RpeRange
  onChange: (rpeRange: RpeRange) => void
  className?: string
}

const RPE_OPTIONS = [
  {
    value: '6-7' as RpeRange,
    label: 'Moderate',
    description: 'Sustainable, comfortable pace',
  },
  {
    value: '7-8' as RpeRange,
    label: 'Challenging',
    description: 'Challenging but manageable',
  },
  {
    value: '8-10' as RpeRange,
    label: 'Very Challenging',
    description: 'Near maximum effort',
  },
]

export function RpeRangeSelector({
  value,
  onChange,
  className,
}: RpeRangeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.07, delay: 0.03 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Workout Intensity (RPE)
          </CardTitle>
          <CardDescription>
            Rate of Perceived Exertion - How challenging should your workout
            feel? 1-10 scale. Where 1 is very easy and 10 is at your limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {RPE_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                value={option.value}
                selectedValue={value}
                onChange={onChange}
                label={option.label}
                description={option.description}
                suffix={`(${option.value})`}
                name="rpeRange"
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
