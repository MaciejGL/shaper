'use client'

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
  useTheme,
} from 'next-themes'
import * as React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

import { useUserPreferences } from '@/context/user-preferences-context'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      <ThemeConnector mounted={mounted}>{children}</ThemeConnector>
    </NextThemesProvider>
  )
}

// Component that connects the theme provider with user preferences
function ThemeConnector({
  children,
  mounted,
}: {
  children: React.ReactNode
  mounted: boolean
}) {
  const { setTheme } = useTheme()
  const { registerThemeSetter } = useUserPreferences()

  useEffect(() => {
    // Only register when component is mounted to avoid SSR/hydration issues
    if (mounted) {
      registerThemeSetter(setTheme)
    }
  }, [setTheme, registerThemeSetter, mounted])

  return <>{children}</>
}
