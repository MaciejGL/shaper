'use client'

import { omit } from 'lodash'
import { useState } from 'react'

import { Loader } from '@/components/loader'
import { MuscleGroupRadarChart } from '@/components/muscle-group-radar-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useMuscleGroupDistributionQuery } from '@/generated/graphql-client'

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader />
      </div>
    )
  }

  if (!distribution || totalSets === 0) {
    return (
      <Card>
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Muscle Group Distribution</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-1">
          {TIME_PERIODS.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'tertiary'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Sets completed per muscle group in the last {selectedPeriod} days
        </p>
        {/* Radar Chart */}
        <MuscleGroupRadarChart data={distribution} />

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalSets}</div>
            <div className="text-sm text-muted-foreground">Total Sets</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Object.values(distribution).filter((sets) => sets > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Muscle Groups Trained
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {totalSets > 0
                ? Math.round(
                    totalSets /
                      Object.values(distribution).filter((sets) => sets > 0)
                        .length,
                  )
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Avg Sets per Group
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(distribution).map(([muscle, sets]) => (
            <div
              key={muscle}
              className="flex justify-between p-2 rounded bg-muted/50"
            >
              <span className="capitalize">{muscle}</span>
              <span className="font-medium">{sets} sets</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
