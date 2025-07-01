'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Switch } from './ui/switch'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Switch
          id="mode"
          checked={theme === 'dark'}
          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
        {theme !== 'light' ? 'Dark' : 'Light'}
      </label>
    </div>
  )
}
