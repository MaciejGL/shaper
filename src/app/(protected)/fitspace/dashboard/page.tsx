import { notFound } from 'next/navigation'

import {
  FitspaceDashboardDocument,
  GQLFitspaceDashboardQuery,
} from '@/generated/graphql-client'
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

  const navigation = data?.getWorkout?.navigation

  const currentWeek = navigation
    ? data?.getWorkout?.plan?.weeks[navigation?.currentWeekIndex]
    : undefined

  const currentWorkout = navigation
    ? currentWeek?.days[navigation?.currentDayIndex]
    : undefined

  return (
    <div className="container-fitspace mx-auto">
      <div className="mt-8 mb-12">
        <Header user={user.user} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TodaysSession
          workout={currentWorkout}
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
