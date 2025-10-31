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
  GQLGetMySubscriptionStatusQuery,
  GQLUserBasicQuery,
  GetMySubscriptionStatusDocument,
  UserBasicDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user and subscription data in parallel with explicit cache control
  const [userResult, subscriptionResult] = await Promise.all([
    gqlServerFetch<GQLUserBasicQuery>(
      UserBasicDocument,
      {},
      { cache: 'no-store' },
    ),
    gqlServerFetch<GQLGetMySubscriptionStatusQuery>(
      GetMySubscriptionStatusDocument,
      {},
      { cache: 'no-store' },
    ),
  ])

  if (!userResult.data) {
    return redirect('/login')
  }

  return (
    <UserProvider
      initialData={userResult.data}
      initialSubscriptionData={subscriptionResult.data ?? undefined}
    >
      <PostHogProvider>
        <UserPreferencesProvider initialData={userResult.data}>
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
