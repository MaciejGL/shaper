import { Main } from '@/components/main'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'

import { MobileNav } from './components/mobile-nav'

// import { PrefetchFitspacePages } from './prefetch-pages'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  return (
    <Main user={user}>
      {children}
      <MobileNav />
    </Main>
  )
}
