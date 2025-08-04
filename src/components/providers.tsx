'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type * as React from 'react'

import { NavigationProvider } from '@/context/navigation-context'
import { UserProvider } from '@/context/user-context'
import { UserPreferencesProvider } from '@/context/user-preferences-context'
import { getQueryClient } from '@/lib/get-query-client'

import { ConfirmationModalProvider } from './confirmation-modal'
import { PostHogProvider } from './posthog-provider'
import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { Toaster } from './ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <UserProvider>
          <UserPreferencesProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <PostHogProvider>
                <NuqsAdapter>
                  <NavigationProvider>
                    <ConfirmationModalProvider>
                      <SidebarProvider>{children}</SidebarProvider>
                    </ConfirmationModalProvider>
                  </NavigationProvider>
                </NuqsAdapter>
              </PostHogProvider>
            </ThemeProvider>
          </UserPreferencesProvider>
        </UserProvider>
      </SessionProvider>
      {process.env.NEXT_PUBLIC_DEVTOOLS === 'true' && <ReactQueryDevtools />}
      <Toaster />
    </QueryClientProvider>
  )
}
