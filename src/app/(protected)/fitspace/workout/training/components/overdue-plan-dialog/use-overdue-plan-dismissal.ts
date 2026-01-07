import { useCallback, useMemo } from 'react'

import { LocalStorageKey, useLocalStorage } from '@/hooks/use-local-storage'

export function useOverduePlanDismissal(planId: string | null | undefined) {
  const [dismissedPlans, setDismissedPlans] = useLocalStorage(
    LocalStorageKey.OVERDUE_PLAN_DISMISSED,
    {},
  )

  const isDismissed = useMemo(() => {
    if (!planId) return true
    return planId in dismissedPlans
  }, [planId, dismissedPlans])

  const dismiss = useCallback(() => {
    if (!planId) return

    setDismissedPlans((prev) => ({
      ...prev,
      [planId]: Date.now(),
    }))
  }, [planId, setDismissedPlans])

  return { isDismissed, dismiss }
}
