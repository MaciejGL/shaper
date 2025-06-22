'use client'

import { useTheme } from 'next-themes'
import * as React from 'react'

import { Switch } from './ui/switch'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="mode"
        checked={theme === 'dark'}
        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <label className="text-sm" htmlFor="mode">
        {theme !== 'light' ? 'Dark' : 'Light'}
      </label>
    </div>
  )
}
