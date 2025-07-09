'use client'

import { LayoutDashboard } from 'lucide-react'

import { useFitspaceDashboardGetWorkoutQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { DashboardStats } from './components/dashbaord-stats'
import { DashboardStatsSkeleton } from './components/dashboard-stats-skeleton'
import {
  TodaysSession,
  TodaysSessionSkeleton,
} from './components/todays-session'

export default function DashboardPage() {
  const { data, isLoading } = useFitspaceDashboardGetWorkoutQuery()

  // TO ADD:
  // - Profile completion - with survey

  // - Last PRs from this and last week
  // - emtpy state on my stats(add weight progress)
  // - My favourite exercises progress(?)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container-fitspace mx-auto mb-24">
      <DashboardHeader title="Dashboard" icon={<LayoutDashboard />} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <TodaysSession plan={data?.getWorkout?.plan} />

        <DashboardStats plan={data?.getWorkout?.plan} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container-fitspace mx-auto mb-24">
      <DashboardHeader title="Dashboard" icon={<LayoutDashboard />} />
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <TodaysSessionSkeleton />

        <DashboardStatsSkeleton />
      </div>
    </div>
  )
}
