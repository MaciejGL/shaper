'use client'

import { motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    label: 'No Pain, No Gain',
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
      <Card borderless variant="tertiary">
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
            <RadioButtons
              value={value}
              onValueChange={onChange}
              options={RPE_OPTIONS}
              columns={1}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
