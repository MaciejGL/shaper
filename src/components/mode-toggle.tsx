'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import * as React from 'react'

import { switchThemeWithTransition } from '@/lib/theme-transition'

import { Switch } from './ui/switch'

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for hydration to avoid mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <Switch id="mode" checked={false} size="lg" className="relative" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-1">
            <Sun className="h-3 w-3 -mt-[3px] ml-[1px] transition-opacity duration-200 opacity-100" />
            <Moon className="h-3 w-3 -mt-[4px] mr-[1px] transition-opacity duration-200 opacity-0" />
          </div>
        </div>
        <label className="text-sm cursor-pointer" htmlFor="mode">
          Light
        </label>
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    switchThemeWithTransition(setTheme, newTheme)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Switch
          id="mode"
          checked={isDark}
          onCheckedChange={handleToggle}
          size="lg"
          className="relative"
        />
        {/* Icons positioned over the switch */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-1">
          <Sun className="h-3 w-3 -mt-[3px] ml-[1px] transition-opacity duration-200 opacity-100 dark:opacity-0" />
          <Moon className="h-3 w-3 -mt-[4px] mr-[1px] transition-opacity duration-200 opacity-0 dark:opacity-100" />
        </div>
      </div>
      <label className="text-sm cursor-pointer" htmlFor="mode">
        {isDark ? 'Dark' : 'Light'}
      </label>
    </div>
  )
}
