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
  const { isNativeApp } = useMobileApp()

  if (isNativeApp) return null

  return <MinimalAccountNavbar />
}
