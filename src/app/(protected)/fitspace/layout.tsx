import { Main } from '@/components/main'
import {
  FitspaceGetActivePlanIdDocument,
  GQLFitspaceGetActivePlanIdQuery,
} from '@/generated/graphql-client'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { MobileNav } from './components/mobile-nav'

// import { PrefetchFitspacePages } from './prefetch-pages'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const { data } = await gqlServerFetch<GQLFitspaceGetActivePlanIdQuery>(
    FitspaceGetActivePlanIdDocument,
  )

  requireAuth(GQLUserRole.Client, user)

  return (
    <Main user={user}>
      {children}
      <MobileNav currentWorkoutId={data?.getActivePlanId || undefined} />
      {/* <PrefetchFitspacePages /> */}
    </Main>
  )
}
