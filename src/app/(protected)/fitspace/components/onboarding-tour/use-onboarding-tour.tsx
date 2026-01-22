'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useUser } from '@/context/user-context'

export function useOnboardingTour() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)
  const [open, setOpen] = useState(false)

  const forced = searchParams.get('tour') === '1'

  const shouldShow = useMemo(() => {
    if (forced) return true
    if (dismissed) return false
    if (!user?.profile) return false
    return !user.profile.hasCompletedOnboarding
  }, [dismissed, forced, user?.profile])

  useEffect(() => {
    if (shouldShow) {
      setOpen(true)
    }
  }, [shouldShow])

  const close = () => {
    setDismissed(true)
    setOpen(false)
  }

  return {
    open,
    shouldShow,
    close,
  }
}
