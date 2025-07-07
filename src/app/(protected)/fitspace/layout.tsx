import { Main } from '@/components/main'
import {
  FitspaceGetCurrentWorkoutIdDocument,
  GQLFitspaceGetCurrentWorkoutIdQuery,
} from '@/generated/graphql-client'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { MobileNav } from './components/mobile-nav'
import { PrefetchFitspacePages } from './components/prefetch-pages'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const { data } = await gqlServerFetch<GQLFitspaceGetCurrentWorkoutIdQuery>(
    FitspaceGetCurrentWorkoutIdDocument,
  )

  requireAuth(GQLUserRole.Client, user)

  return (
    <Main user={user}>
      {children}
      <MobileNav currentWorkoutId={data?.getMyPlansOverview.activePlan?.id} />
      <PrefetchFitspacePages />
    </Main>
  )
}
