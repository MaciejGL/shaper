import { notFound } from 'next/navigation'

import {
  FitspaceDashboardDocument,
  GQLFitspaceDashboardQuery,
} from '@/generated/graphql-client'
import { getCurrentUser } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import {
  DashboardStats,
  DashboardStatsProps,
} from './components/dashbaord-stats'
import { Header } from './components/header'
import { QuickActions } from './components/quick-actions'
import { TodaysSession } from './components/todays-session'
import { Trainer } from './components/trainer'

const dashboardStats: DashboardStatsProps = {
  stats: {
    streak: 12,
    currentWeight: 75,
    weightLastWeek: 74,
    activeWorkout: {
      name: 'Bodybuilding PPL & Arms',
      thisWeekSessions: [
        {
          date: '2025-06-02',
          type: 'Pull',
          completed: true,
          isRestDay: false,
        },
        {
          date: '2025-06-03',
          type: 'Push',
          completed: true,
          isRestDay: false,
        },
        {
          date: '2025-06-04',
          type: 'Push',
          isRestDay: false,
          completed: true,
        },
        {
          date: '2025-06-05',
          type: 'Legs',
          completed: false,
          isRestDay: false,
        },
        {
          date: '2025-06-06',
          type: 'Arms and legs',
          completed: false,
          isRestDay: false,
        },
        {
          date: '2025-06-07',
          type: 'Rest',
          isRestDay: true,
          completed: true,
        },
        {
          date: '2025-06-08',
          type: 'Rest',
          isRestDay: true,
          completed: true,
        },
      ],
      totalCompletedDays: 12,
      totalDays: 14,
      percentageCompleted: 85,
    },
  },
}

export default async function DashboardPage() {
  const { data } = await gqlServerFetch<GQLFitspaceDashboardQuery>(
    FitspaceDashboardDocument,
  )
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  return (
    <div className="container-fitspace mx-auto">
      <div className="mt-8 mb-12">
        <Header user={user.user} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <TodaysSession nextWorkoutDay={undefined} />
        <Trainer trainer={data?.myTrainer} />

        <DashboardStats stats={dashboardStats.stats} />
        <QuickActions />
      </div>
    </div>
  )
}
