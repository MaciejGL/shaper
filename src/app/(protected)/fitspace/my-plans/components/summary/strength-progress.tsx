import { motion } from 'framer-motion'
import { ArrowRight, BicepsFlexed } from 'lucide-react'

import { AnimateNumber } from '@/components/animate-number'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { getTopProgressions } from '../../utils/summary-helpers'

import { StrengthProgressChart } from './strength-progress-chart'

interface StrengthProgressProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function StrengthProgress({ summary }: StrengthProgressProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const topProgressions = getTopProgressions(summary.strengthProgress, 5)

  if (topProgressions.length === 0) {
    return null
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <SectionIcon icon={BicepsFlexed} size="xs" variant="green" />
          Strength Progress
        </h3>
      </div>

      <motion.div
        className="space-y-2"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {topProgressions.map((progression, index) => (
          <motion.div
            key={`${progression.exerciseName}-${index}`}
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0 },
            }}
          >
            <Card>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {progression.exerciseName}
                    </h4>
                    <Badge
                      variant="success"
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    >
                      +
                      <AnimateNumber
                        value={progression.improvementPercentage}
                      />
                      %
                    </Badge>
                  </div>

                  {/* Chart */}
                  {progression.allPerformances &&
                    progression.allPerformances.length > 0 && (
                      <StrengthProgressChart
                        performances={progression.allPerformances}
                        exerciseName={progression.exerciseName}
                      />
                    )}

                  {/* Before/After comparison */}
                  <div className="flex items-center justify-between text-sm px-2">
                    <div className="flex flex-col">
                      {/* <span className="text-xs text-muted-foreground">
                        Start
                      </span> */}
                      <span className="text-base font-medium">
                        {toDisplayWeight(
                          progression.firstPerformance.estimated1RM,
                        )?.toFixed(1)}{' '}
                        {weightUnit} 1RM
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {toDisplayWeight(
                          progression.firstPerformance.weight,
                        )?.toFixed(1)}{' '}
                        {weightUnit} × {progression.firstPerformance.reps}
                      </span>
                    </div>

                    <ArrowRight className="size-4 text-muted-foreground" />

                    <div className="flex flex-col text-right">
                      {/* <span className="text-xs text-muted-foreground">End</span> */}
                      <span className="text-base font-medium text-green-600 dark:text-green-400">
                        {toDisplayWeight(
                          progression.lastPerformance.estimated1RM,
                        )?.toFixed(1)}{' '}
                        {weightUnit} 1RM
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {toDisplayWeight(
                          progression.lastPerformance.weight,
                        )?.toFixed(1)}{' '}
                        {weightUnit} × {progression.lastPerformance.reps}
                      </span>
                    </div>
                  </div>

                  {/* Sessions count */}
                  {/* <div className="text-xs text-muted-foreground">
                    {progression.totalSessions} session
                    {progression.totalSessions !== 1 ? 's' : ''} logged
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
