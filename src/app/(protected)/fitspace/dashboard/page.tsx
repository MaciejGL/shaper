import { notFound } from 'next/navigation'

import {
  FitspaceDashboardDocument,
  GQLFitspaceDashboardQuery,
} from '@/generated/graphql-client'
import { getCurrentWeekAndDay } from '@/lib/get-current-week-and-day'
import { getCurrentUser } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { DashboardStats } from './components/dashbaord-stats'
import { Header } from './components/header'
import { TodaysSession } from './components/todays-session'

export default async function DashboardPage() {
  const { data } = await gqlServerFetch<GQLFitspaceDashboardQuery>(
    FitspaceDashboardDocument,
  )
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  const { currentWeek, currentDay } = getCurrentWeekAndDay(
    data?.getWorkout?.plan?.weeks,
  )

  return (
    <div className="container-fitspace mx-auto">
      <div className="mt-8 mb-12">
        <Header user={user.user} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TodaysSession
          workout={currentDay}
          planId={data?.getWorkout?.plan?.id}
        />
        {/* <Trainer trainer={data?.myTrainer} /> */}

        <DashboardStats
          plan={data?.getWorkout?.plan}
          currentWeek={currentWeek}
        />
      </div>
    </div>
  )
}
