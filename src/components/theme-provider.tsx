'use client'

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from 'next-themes'
import * as React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</> // Render children without ThemeProvider during SSR
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
