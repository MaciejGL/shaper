'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type * as React from 'react'

import { getQueryClient } from '@/lib/get-query-client'

import { ConfirmationModalProvider } from './confirmation-modal'
import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './ui/sidebar'
import { Toaster } from './ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
        <NuqsAdapter>
          <ConfirmationModalProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ConfirmationModalProvider>
        </NuqsAdapter>
      </ThemeProvider>
      <ReactQueryDevtools />
      <Toaster />
    </QueryClientProvider>
  )
}
