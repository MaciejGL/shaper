import { GQLUserRole } from '@/generated/graphql-server'
import { getCurrentUser, requireAuth } from '@/lib/getUser'
import { cn } from '@/lib/utils'

import { DeepLinkMobileNav } from './components/deep-link-mobile-nav'
import { NavigateBack } from './navigate-back'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  requireAuth(GQLUserRole.Client, user)

  return (
    <div className="w-full h-screen flex flex-col">
      <NavigateBack />
      <div className="flex-1 hide-scrollbar pb-8">
        <div className="h-20" />
        <div
          className={cn(
            'w-full p-2 md:p-4 lg:p-8 bg-background safe-area-bottom',
          )}
        >
          {children}
          {/* <div className="h-40" /> */}
        </div>
        <div className="h-20" />
      </div>

      <DeepLinkMobileNav />
    </div>
  )
}
