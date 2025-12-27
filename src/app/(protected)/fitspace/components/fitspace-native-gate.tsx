'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface FitspaceNativeGateProps {
  children: React.ReactNode
}

export function FitspaceNativeGate({ children }: FitspaceNativeGateProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>(
    'checking',
  )

  useEffect(() => {
    const evaluate = () => {
      const isNative =
        typeof window !== 'undefined' &&
        (window.isNativeApp === true || !!window.nativeApp)
      const platform =
        typeof window !== 'undefined' ? window.mobilePlatform : null
      const isAllowed =
        isNative && (platform === 'ios' || platform === 'android')

      if (isAllowed) {
        setStatus('allowed')
        return true
      }

      return false
    }

    if (evaluate()) return

    const timeout = setTimeout(() => {
      if (!evaluate()) {
        setStatus('blocked')
        router.replace('/account-management')
      }
    }, 50)

    return () => clearTimeout(timeout)
  }, [router])

  if (status !== 'allowed') return null

  return children
}
