import { redirect } from 'next/navigation'

import { Main } from '@/components/main'
import { SidebarProvider } from '@/components/ui/sidebar'
import { isAdminUser } from '@/lib/admin-auth'
import { getCurrentUser } from '@/lib/getUser'

import { AppSidebar } from '../trainer/components/app-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  // Check if user has admin access
  const hasAdminAccess = await isAdminUser()

  if (!hasAdminAccess) {
    // Redirect non-admin users to appropriate dashboard
    redirect('/fitspace/dashboard')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Main user={user} withSidebar>
        {children}
      </Main>
    </SidebarProvider>
  )
}
