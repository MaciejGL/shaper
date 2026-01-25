import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ArrowRight, BicepsFlexed } from 'lucide-react'

import { AnimateNumber } from '@/components/animate-number'
import { OneRmBarChart } from '@/components/exercise-stats/one-rm-bar-chart'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { getTopProgressions } from '../../utils/summary-helpers'

interface StrengthProgressProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function StrengthProgress({ summary }: StrengthProgressProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  const topProgressions = getTopProgressions(summary.strengthProgress, 5)

  if (topProgressions.length === 0) {
    return null
  }

  const getChartSeries = (
    performances: GQLGetPlanSummaryQuery['getPlanSummary']['strengthProgress'][number]['allPerformances'],
  ) => {
    return performances.map((perf) => ({
      label: format(new Date(perf.date), 'MMM d'),
      oneRM: toDisplayWeight(perf.estimated1RM) || 0,
    }))
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <SectionIcon icon={BicepsFlexed} size="xs" variant="green" />
          Strength Progress
        </h3>
      </div>

      <motion.div
        className="space-y-6"
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base">
                  {progression.exerciseName}
                </h4>
                <Badge variant="success">
                  +
                  <AnimateNumber value={progression.improvementPercentage} />%
                </Badge>
              </div>
              {/* Chart */}
              {progression.allPerformances &&
                progression.allPerformances.length > 0 && (
                  <OneRmBarChart
                    id={`plan-summary-1rm-${progression.baseExerciseId || index}`}
                    series={getChartSeries(progression.allPerformances)}
                    weightUnit={weightUnit}
                    className="mt-3"
                  />
                )}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
                <StatsItem
                  label="Before"
                  value={
                    <span className="tabular-nums">
                      {toDisplayWeight(
                        progression.firstPerformance.estimated1RM,
                      )?.toFixed(1)}{' '}
                      {weightUnit} 1RM
                    </span>
                  }
                />
                <ArrowRight className="size-4 text-muted-foreground" />
                <StatsItem
                  label="After"
                  value={
                    <span className="tabular-nums">
                      {toDisplayWeight(
                        progression.lastPerformance.estimated1RM,
                      )?.toFixed(1)}{' '}
                      {weightUnit} 1RM
                    </span>
                  }
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
