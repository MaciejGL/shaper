'use client'

import { useEffect } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'

/**
 * Minimal hook to manage pull-to-refresh when drawer opens/closes
 */
export function useDrawerRefresh(isOpen: boolean) {
  const { setAllowRefresh } = useMobileApp()

  useEffect(() => {
    setAllowRefresh(!isOpen)
  }, [isOpen, setAllowRefresh])
}
