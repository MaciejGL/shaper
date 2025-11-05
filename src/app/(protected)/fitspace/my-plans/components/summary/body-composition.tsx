import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Scale } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface BodyCompositionProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function BodyComposition({ summary }: BodyCompositionProps) {
  const bodyComp = summary.bodyComposition

  if (!bodyComp) {
    return null
  }

  const hasWeightData =
    bodyComp.startWeight != null && bodyComp.endWeight != null
  const weightChange = bodyComp.weightChange || 0
  const isWeightGain = weightChange > 0
  const isWeightLoss = weightChange < 0

  if (!hasWeightData) {
    return null
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h3 className="text-base font-semibold flex items-center gap-2">
        <Scale className="size-4" />
        Body Composition
      </h3>

      <Card borderless>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Weight change */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Weight</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {bodyComp.startWeight?.toFixed(1)} {bodyComp.unit}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-lg font-semibold">
                    {bodyComp.endWeight?.toFixed(1)} {bodyComp.unit}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                  isWeightLoss &&
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                  isWeightGain &&
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                  !isWeightLoss &&
                    !isWeightGain &&
                    'bg-muted text-muted-foreground',
                )}
              >
                {isWeightLoss && <ArrowDown className="size-4" />}
                {isWeightGain && <ArrowUp className="size-4" />}
                <span className="font-medium">
                  {Math.abs(weightChange).toFixed(1)} {bodyComp.unit}
                </span>
              </div>
            </div>

            {/* Visual indicator */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 rounded-full',
                  isWeightLoss && 'bg-green-500',
                  isWeightGain && 'bg-blue-500',
                )}
                style={{
                  width: `${Math.min(Math.abs(weightChange / (bodyComp.startWeight || 1)) * 100 * 10, 100)}%`,
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {isWeightLoss && 'Weight decreased during plan'}
              {isWeightGain && 'Weight increased during plan'}
              {!isWeightLoss && !isWeightGain && 'Weight maintained'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
