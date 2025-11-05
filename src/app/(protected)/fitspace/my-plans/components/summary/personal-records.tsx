import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'

import { PRItem } from '../../../progress/components/latest-prs/pr-item'
import { getTopPersonalRecords } from '../../utils/summary-helpers'

interface PersonalRecordsProps {
  summary: GQLGetPlanSummaryQuery['getPlanSummary']
}

export function PersonalRecords({ summary }: PersonalRecordsProps) {
  const [showAll, setShowAll] = useState(false)

  const allRecords = summary.personalRecords
  const topRecords = getTopPersonalRecords(allRecords, 5)
  const displayedRecords = showAll ? allRecords : topRecords
  const hasMore = allRecords.length > 5

  if (allRecords.length === 0) {
    return null
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <SectionIcon icon={Trophy} size="xs" variant="amber" />
          Personal Records
        </h3>
        <Badge variant="secondary">{allRecords.length} PRs Achieved</Badge>
      </div>

      <motion.div
        className="space-y-2"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {displayedRecords.map((pr) => (
          <motion.div
            key={`motion-${pr.exerciseName}-${pr.achievedDate}`}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <PRItem
              pr={{
                id: pr.baseExerciseId,
                exerciseName: pr.exerciseName,
                weight: pr.weight,
                reps: pr.reps,
                estimated1RM: pr.bestEstimated1RM,
                achievedAt: pr.achievedDate,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Show more/less button */}
      {hasMore && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(!showAll)}
          iconEnd={showAll ? <ChevronUp /> : <ChevronDown />}
          className="w-full"
        >
          {showAll ? 'Show Less' : `Show All ${allRecords.length} Exercises`}
        </Button>
      )}
    </motion.div>
  )
}
