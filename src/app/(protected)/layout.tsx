import { redirect } from 'next/navigation'

import { MobileAppAuthSync } from '@/components/mobile-app-auth-sync'
import { MobileAppThemeSync } from '@/components/mobile-app-theme-sync'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { PostHogProvider } from '@/components/posthog-provider'
import { PromotionalToastManager } from '@/components/promotional-toast'
import { SimplePullToRefresh } from '@/components/simple-pull-to-refresh'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/context/user-context'
import { UserPreferencesProvider } from '@/context/user-preferences-context'
import {
  GQLUserBasicQuery,
  UserBasicDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data } = await gqlServerFetch<GQLUserBasicQuery>(
    UserBasicDocument,
    {},
  )

  console.log(data)

  if (!data) {
    return redirect('/login')
  }

  return (
    <UserProvider initialData={data}>
      <PostHogProvider>
        <UserPreferencesProvider initialData={data}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <SimplePullToRefresh />
            <MobileAppAuthSync />
            <MobileAppThemeSync />
            <OnboardingProvider />
            <PromotionalToastManager />
            {children}
          </ThemeProvider>
        </UserPreferencesProvider>
      </PostHogProvider>
    </UserProvider>
  )
}
