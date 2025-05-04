import { Main } from '@/components/main'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  await requireAuth(GQLUserRole.Client)

  return <Main user={user}>{children}</Main>
}
