'use client'

import type { PostHog } from 'posthog-js'
import { useEffect, useState } from 'react'

import { getPostHogInstance, initPostHog } from '@/lib/posthog'

export type FreeTierSlideVariant = 'A' | 'B'

const DEFAULT_VARIANT: FreeTierSlideVariant = 'A'

function parseVariant(raw: unknown): FreeTierSlideVariant | null {
  if (raw === 'A' || raw === 'B') return raw
  return null
}

export function useOnboardingFreeTierVariant(open: boolean) {
  const [variant, setVariant] = useState<FreeTierSlideVariant | null>(null)

  useEffect(() => {
    if (!open) return
    if (variant) return

    let removeListener: (() => void) | undefined
    let cancelled = false

    const flagKey = 'onboarding_free_tier_slide_v1'

    const pickFromInstance = (ph: PostHog) => {
      const raw = ph.getFeatureFlag(flagKey)
      const parsed = parseVariant(raw)
      if (parsed) return parsed
      // If flag exists but isn't multivariate, treat enabled as Variant A.
      if (ph.isFeatureEnabled(flagKey)) return 'A'
      // If explicitly disabled, treat as Variant B.
      if (ph.isFeatureEnabled(flagKey) === false) return 'B'
      return null
    }

    const ensure = async () => {
      const existing = getPostHogInstance()
      const ph = existing ?? (await initPostHog())
      if (!ph || cancelled) return

      const maybe = pickFromInstance(ph)
      if (maybe) {
        setVariant(maybe)
        return
      }

      // Wait for feature flags to load.
      removeListener = ph.onFeatureFlags(() => {
        const next = pickFromInstance(ph)
        if (!next) return
        setVariant(next)
        removeListener?.()
        removeListener = undefined
      })

      // Also attempt immediately (flags might already be ready).
      const immediate = pickFromInstance(ph)
      if (immediate) {
        setVariant(immediate)
        removeListener?.()
        removeListener = undefined
      }
    }

    void ensure().catch(() => {
      if (!cancelled) setVariant(DEFAULT_VARIANT)
    })

    return () => {
      cancelled = true
      removeListener?.()
      removeListener = undefined
    }
  }, [open, variant])

  return {
    variant: variant ?? DEFAULT_VARIANT,
    isLoading: variant === null,
    flagKey: 'onboarding_free_tier_slide_v1',
  }
}

