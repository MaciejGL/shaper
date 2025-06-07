import { Main } from '@/components/main'
import {
  FitspaceGetCurrentWorkoutIdDocument,
  GQLFitspaceGetCurrentWorkoutIdQuery,
} from '@/generated/graphql-client'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { MobileNav } from './components/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, { data }] = await Promise.all([
    getCurrentUser(),
    gqlServerFetch<GQLFitspaceGetCurrentWorkoutIdQuery>(
      FitspaceGetCurrentWorkoutIdDocument,
    ),
  ])

  await requireAuth(GQLUserRole.Client)

  return (
    <Main user={user}>
      {children}
      <MobileNav activePlanId={data?.getMyPlansOverview?.activePlan?.id} />
    </Main>
  )
}
