'use client'

import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { ActivityHeatmap } from './activity-heatmap'

export function ActivityByDaySection() {
  const { user } = useUser()
  const [weekOffset, setWeekOffset] = useState(0)

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Activity</CardTitle>
        <CardDescription>Sets by day across recent weeks.</CardDescription>
      </CardHeader>
      <CardContent>
        <PremiumGate feature="Activity Heatmap" compact showPartialContent>
          <ActivityHeatmap
            weekOffset={weekOffset}
            onWeekOffsetChange={setWeekOffset}
            showTitle={false}
          />
        </PremiumGate>
      </CardContent>
    </Card>
  )
}


