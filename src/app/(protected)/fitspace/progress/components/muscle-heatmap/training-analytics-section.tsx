'use client'

import { PremiumGate } from '@/components/premium-gate'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { TrainingAnalytics } from './training-analytics'

export function TrainingAnalyticsSection() {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Muscle Recovery & Focus</CardTitle>
        <CardDescription>
          See which muscles are ready and which need more rest this week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PremiumGate
          feature="Weekly Muscle Progress"
          compact
          showPartialContent
        >
          <div>
            {/* AI Training Analytics */}

            <TrainingAnalytics />
          </div>
        </PremiumGate>
      </CardContent>
    </Card>
  )
}
