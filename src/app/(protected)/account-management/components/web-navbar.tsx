'use client'

import { useMobileApp } from '@/components/mobile-app-bridge'

import { MinimalAccountNavbar } from './minimal-navbar'

/**
 * WebNavbar - Shows minimal navbar for web users only
 *
 * Renders the MinimalAccountNavbar when user is on web (not in native app).
 * This provides web users with account info and logout functionality.
 */
export function WebNavbar() {
  const { platform } = useMobileApp()

  if (platform !== 'web') return null

  return <MinimalAccountNavbar />
}
