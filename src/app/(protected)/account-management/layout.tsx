import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { cn } from '@/lib/utils'

import { WebNavbar } from './components/web-navbar'
import { SafeMobileNav } from './safe-mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  return (
    <div className="w-full h-screen flex flex-col">
      <WebNavbar />
      <div
        className={cn(
          'w-full p-4 md:p-4 lg:p-8 bg-background safe-area-bottom',
        )}
      >
        {children}
        <div className="h-40" />
      </div>

      <SafeMobileNav />
    </div>
  )
}
