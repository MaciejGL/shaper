import { Main } from '@/components/main'
import { SidebarProvider } from '@/components/ui/sidebar'
import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'

import { AppSidebar } from './components/app-sidebar'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  requireAuth(GQLUserRole.Trainer, user)

  return (
    <SidebarProvider>
      <AppSidebar />
      <Main user={user} withSidebar>
        {children}
      </Main>
    </SidebarProvider>
  )
}
