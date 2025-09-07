'use client'

import { omit } from 'lodash'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { MuscleGroupRadarChart } from '@/components/muscle-group-radar-chart'
import { StatsItem } from '@/components/stats-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useMuscleGroupDistributionQuery } from '@/generated/graphql-client'

import { Section } from './section'

const TIME_PERIODS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

export function MuscleDistribution() {
  const { user } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const { data, isLoading } = useMuscleGroupDistributionQuery(
    {
      userId: user?.id || '',
      days: selectedPeriod,
    },
    { enabled: !!user?.id },
  )

  const distribution = omit(data?.muscleGroupDistribution, ['__typename'])

  // Calculate total sets for summary
  const totalSets = distribution
    ? Object.values(distribution).reduce((sum, sets) => sum + sets, 0)
    : 0

  if ((!distribution || totalSets === 0) && !isLoading) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle>Muscle Group Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No workout data found for the selected period.
            <br />
            Complete some workouts to see your muscle group distribution.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Section title="Muscle Group Distribution">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1">
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod === period.value ? 'default' : 'tertiary'
                }
                size="xs"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <LoadingSkeleton count={2} variant="lg" />
          ) : (
            <>
              {/* Radar Chart */}
              <MuscleGroupRadarChart data={distribution} />
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <StatsItem value={totalSets} label="Total Sets" />
                <StatsItem
                  value={
                    Object.values(distribution).filter((sets) => sets > 0)
                      .length
                  }
                  label="Muscle Groups Trained"
                />
                <StatsItem
                  value={
                    totalSets > 0
                      ? Math.round(
                          totalSets /
                            Object.values(distribution).filter(
                              (sets) => sets > 0,
                            ).length,
                        )
                      : 0
                  }
                  label="Avg Sets per Group"
                />
              </div>

              {/* Detailed Breakdown */}
              <Section
                title={`Sets per Muscle Group (${selectedPeriod} days)`}
                size="sm"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(distribution).map(([muscle, sets]) => (
                    <StatsItem
                      key={muscle}
                      value={sets}
                      label={muscle}
                      variant="secondary"
                    />
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </Section>
    </div>
  )
}
