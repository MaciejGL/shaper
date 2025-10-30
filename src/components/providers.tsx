'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type * as React from 'react'
import { Suspense } from 'react'

import { NavigationProvider } from '@/context/navigation-context'
import { getQueryClient } from '@/lib/get-query-client'

import { ActivityHeartbeat } from './activity-heartbeat'
import { ConfirmationModalProvider } from './confirmation-modal'
import { MobileSessionRestore } from './mobile-session-restore'
import { SidebarProvider } from './ui/sidebar'
import { Toaster } from './ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider
        height="1px"
        color="var(--color-amber-500)"
        options={{
          showSpinner: false,
          easing: 'ease-in-out',
        }}
        startOnLoad
        shallowRouting
        delay={500}
      >
        <SessionProvider>
          <ActivityHeartbeat />
          <Suspense fallback={null}>
            <MobileSessionRestore />
          </Suspense>
          <NuqsAdapter>
            <NavigationProvider>
              <ConfirmationModalProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </ConfirmationModalProvider>
            </NavigationProvider>
          </NuqsAdapter>
        </SessionProvider>
      </ProgressProvider>
      {process.env.NEXT_PUBLIC_DEVTOOLS === 'true' && <ReactQueryDevtools />}
      <Toaster />
    </QueryClientProvider>
  )
}
