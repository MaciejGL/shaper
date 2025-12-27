import { Main } from '@/components/main'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'

import { FitspaceNativeGate } from './components/fitspace-native-gate'
import { MobileNav } from './components/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  return (
    <Main user={user}>
      <FitspaceNativeGate>
        {children}
        <MobileNav />
      </FitspaceNativeGate>
    </Main>
  )
}
