'use client'

import { LayoutDashboard } from 'lucide-react'

import { useFitspaceDashboardGetCurrentWeekQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyProgressSnapshot } from './components/body-progress-snapshot'
import { DashboardStats } from './components/dashbaord-stats'
import { DashboardStatsSkeleton } from './components/dashboard-stats-skeleton'
import { ProfileCompletionBanner } from './components/profile-completion-banner'
import { QuickNutritionOverview } from './components/quick-nutrition-overview'
import { RecentProgressSection } from './components/recent-prs-section'
import {
  TodaysSession,
  TodaysSessionSkeleton,
} from './components/todays-session'

export default function DashboardPage() {
  const { data, isLoading } = useFitspaceDashboardGetCurrentWeekQuery()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container-hypertro mx-auto mb-24 max-w-md">
      <DashboardHeader title="Dashboard" icon={<LayoutDashboard />} />

      {/* Single Column Mobile-First Layout */}
      <div className="space-y-6">
        {/* Profile Completion Banner - Only shows if profile incomplete */}
        <ProfileCompletionBanner />

        {/* Today's Session */}
        <TodaysSession plan={data?.getCurrentWorkoutWeek?.plan ?? undefined} />

        {/* Quick Nutrition Overview */}
        <QuickNutritionOverview />

        {/* Recent Activity & Stats (Enhanced existing component) */}
        <DashboardStats plan={data?.getCurrentWorkoutWeek?.plan ?? undefined} />

        {/* Recent Progress */}
        <RecentProgressSection />

        {/* Body Progress Snapshot */}
        <BodyProgressSnapshot />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container-hypertro mx-auto mb-24 max-w-md">
      <DashboardHeader title="Dashboard" icon={<LayoutDashboard />} />
      <div className="space-y-6">
        <TodaysSessionSkeleton />
        <QuickNutritionOverview />
        <DashboardStatsSkeleton />
        <RecentProgressSection />
        <BodyProgressSnapshot />
      </div>
    </div>
  )
}
