import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'

import { NavigateBack } from './navigate-back'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  return (
    <div className="container-hypertro mx-auto">
      <NavigateBack />
      <div className="h-12" />
      {children}
    </div>
  )
}
