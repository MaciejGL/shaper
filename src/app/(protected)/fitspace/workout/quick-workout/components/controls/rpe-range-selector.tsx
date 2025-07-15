'use client'

import { motion } from 'framer-motion'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { RpeRange } from '../ai-workout-input'

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
      transition={{ duration: 0.3, delay: 0.15 }}
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
          <div className="space-y-3">
            {RPE_OPTIONS.map((option) => (
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
                  name="rpeRange"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          value === option.value
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {value === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">
                        {option.label} ({option.value})
                      </span>
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
