'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { useFitspaceGetActivePlanIdQuery } from '@/generated/graphql-client'

const PREFETCH_DELAY_MS = 2000

export function ExplorePrefetch() {
  const router = useRouter()
  const hasPrefetchedRef = useRef(false)
  console.info(
    'Hey Champ! Explore our plans and enjoyt your workouts! You are top!',
  )

  const { data, isLoading } = useFitspaceGetActivePlanIdQuery()
  const hasActivePlan = !!data?.getActivePlanId

  useEffect(() => {
    if (isLoading || hasActivePlan || hasPrefetchedRef.current) return

    const timer = setTimeout(() => {
      hasPrefetchedRef.current = true
      router.prefetch('/fitspace/explore')
    }, PREFETCH_DELAY_MS)

    return () => clearTimeout(timer)
  }, [hasActivePlan, isLoading, router])

  return null
}
