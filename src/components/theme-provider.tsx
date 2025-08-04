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

  if (!mounted) {
    return <>{children}</> // Render children without ThemeProvider during SSR
  }

  return (
    <NextThemesProvider {...props}>
      <ThemeConnector>{children}</ThemeConnector>
    </NextThemesProvider>
  )
}

// Component that connects the theme provider with user preferences
function ThemeConnector({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const { registerThemeSetter } = useUserPreferences()

  useEffect(() => {
    // Register the theme setter function with UserPreferencesProvider
    registerThemeSetter(setTheme)
  }, [setTheme, registerThemeSetter])

  return <>{children}</>
}
