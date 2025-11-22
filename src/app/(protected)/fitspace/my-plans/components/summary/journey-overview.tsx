import { motion } from 'framer-motion'
import { Calendar, CheckCircle } from 'lucide-react'

import { AnimateNumber } from '@/components/animate-number'
import { StatsItem } from '@/components/stats-item'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'

import { formatDateRange, formatDuration } from '../../utils/summary-helpers'
import { CompletionStats } from '../completion-stats'

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
          <CompletionStats
            completedWorkoutsDays={summary.workoutsCompleted}
            totalWorkouts={summary.totalWorkouts}
            title={false}
          />
        </motion.div>
        <div className="grid grid-cols-2 items-stretch gap-2">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            className="h-full"
          >
            <StatsItem
              icon={<Calendar className="text-blue-500" />}
              label={dateRange}
              value={<div>{duration}</div>}
              variant="secondary"
              border
              className="h-full flex items-center justify-center"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            className="h-full"
          >
            <StatsItem
              className="h-full flex items-center"
              icon={<CheckCircle className="text-violet-500" />}
              label="Workouts"
              value={
                <div>
                  <AnimateNumber value={summary.workoutsCompleted} />/
                  {summary.totalWorkouts}
                </div>
              }
              variant="secondary"
              border
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
