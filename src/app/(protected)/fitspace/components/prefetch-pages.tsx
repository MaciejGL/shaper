'use client'

import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const prefetchOptions = {
  kind: PrefetchKind.FULL,
}

export function PrefetchFitspacePages() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/fitspace/dashboard', prefetchOptions)
    router.prefetch('/fitspace/marketplace', prefetchOptions)
    router.prefetch('/fitspace/my-plans', prefetchOptions)
    router.prefetch('/fitspace/profile', prefetchOptions)
    router.prefetch('/fitspace/workout', prefetchOptions)
    router.prefetch('/fitspace/progress', prefetchOptions)
  }, [router])

  return null
}
