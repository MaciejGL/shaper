'use client'

import { useUser } from '@/context/user-context'

import { BodyProgressContent } from './body-progress-content'

export function BodyProgress() {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return <BodyProgressContent />
}
