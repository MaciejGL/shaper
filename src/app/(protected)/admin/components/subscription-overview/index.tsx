'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { SubscriptionFilters } from './subscription-filters'
import { SubscriptionTable } from './subscription-table'

export function SubscriptionOverview() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>
            Manage and monitor all user subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionFilters />
        </CardContent>
      </Card>

      <SubscriptionTable />
    </div>
  )
}
