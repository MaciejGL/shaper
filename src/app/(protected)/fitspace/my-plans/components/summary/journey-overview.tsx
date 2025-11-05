import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Target } from 'lucide-react'

import { AnimateNumber } from '@/components/animate-number'
import { StatsItem } from '@/components/stats-item'
import { Progress } from '@/components/ui/progress'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'

import {
  formatDateRange,
  formatDuration,
  getAdherenceColor,
} from '../../utils/summary-helpers'

interface JourneyOverviewProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function JourneyOverview({ summary }: JourneyOverviewProps) {
  const duration = formatDuration(
    summary.duration.startDate,
    summary.duration.endDate || null,
  )
  const dateRange = formatDateRange(
    summary.duration.startDate,
    summary.duration.endDate || null,
  )
  const adherencePercent = Math.round(summary.adherence)
  const adherenceColor = getAdherenceColor(adherencePercent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-2"
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
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatsItem
            icon={<Calendar className="text-blue-500" />}
            label={dateRange}
            value={<div>{duration}</div>}
            variant="outline"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatsItem
            icon={<Target className="text-green-600" />}
            label="Adherence"
            value={
              <div className="space-y-2 w-full mb-1">
                <span className={adherenceColor}>
                  <AnimateNumber value={adherencePercent} />%
                </span>
                <Progress value={adherencePercent} className="h-2 w-full" />
              </div>
            }
            variant="outline"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatsItem
            icon={<CheckCircle className="text-violet-500" />}
            label="Completed Workouts"
            value={
              <div>
                <AnimateNumber value={summary.workoutsCompleted} />/
                {summary.totalWorkouts}
              </div>
            }
            variant="outline"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
