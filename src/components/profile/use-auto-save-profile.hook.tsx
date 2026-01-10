import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type GQLUpdateProfileInput,
  useProfileQuery,
  useUpdateProfileMutation,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { Profile } from './types'

/**
 * Auto-save profile hook with local state and debounced mutations
 *
 * Features:
 * - Local state for immediate typing feedback
 * - Debounced API calls (700ms) to prevent spam while typing
 * - Optimistic updates only on successful mutation
 * - No loading states visible to user
 */
export function useAutoSaveProfile() {
  const invalidateQueries = useInvalidateQuery()

  const { data } = useProfileQuery()
  const serverProfile = data?.profile

  // Local state for immediate UI updates while typing
  const [localProfile, setLocalProfile] = useState<Profile | null>(null)

  // Sync local state when server data changes
  useEffect(() => {
    if (serverProfile) {
      setLocalProfile(serverProfile)
    }
  }, [serverProfile])

  // Track the latest changes for debounced saving
  const latestChangesRef = useRef<Partial<GQLUpdateProfileInput>>({})
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null)
  const serverProfileRef = useRef(serverProfile)

  // Keep serverProfile ref in sync without recreating debounced function
  useEffect(() => {
    serverProfileRef.current = serverProfile
  }, [serverProfile])

  // Profile update mutation
  const { mutateAsync: updateProfileMutation } = useUpdateProfileMutation({
    onSuccess: () => {
      // Clear pending changes
      latestChangesRef.current = {}
      // Invalidate queries to sync across app
      invalidateQueries({ queryKey: useProfileQuery.getKey({}) })
      invalidateQueries({ queryKey: useUserBasicQuery.getKey({}) })
    },
    onError: (error) => {
      toast.error('Failed to save changes. Please try again.')
      console.error('[ProfileAutoSave]: Save failed', error)
    },
  })

  // Avatar update mutation (separate to avoid interfering with debounced saves)
  const { mutateAsync: updateAvatarMutation } = useUpdateProfileMutation({
    onSuccess: () => {
      invalidateQueries({ queryKey: useProfileQuery.getKey({}) })
      invalidateQueries({ queryKey: useUserBasicQuery.getKey({}) })
    },
    onError: () => {
      // Rollback local state on error
      if (serverProfile) {
        setLocalProfile((prev) =>
          prev ? { ...prev, avatarUrl: serverProfile.avatarUrl } : prev,
        )
      }
      toast.error('Failed to update avatar')
    },
  })

  // Create debounced save function once and keep it stable
  useEffect(() => {
    debouncedSaveRef.current = debounce(async () => {
      const currentServerProfile = serverProfileRef.current
      if (
        !currentServerProfile ||
        Object.keys(latestChangesRef.current).length === 0
      )
        return

      const updateInput: GQLUpdateProfileInput = {
        ...latestChangesRef.current,
        // Always include required fields
        firstName:
          latestChangesRef.current.firstName || currentServerProfile.firstName,
        lastName:
          latestChangesRef.current.lastName || currentServerProfile.lastName,
        email: latestChangesRef.current.email || currentServerProfile.email,
      }

      try {
        await updateProfileMutation({ input: updateInput })
      } catch (_error) {
        // Error handling is done in mutation onError
      }
    }, 1000)

    return () => {
      debouncedSaveRef.current?.cancel()
    }
    // Only recreate if updateProfileMutation changes (stable from React Query)
  }, [updateProfileMutation])

  // Stable callback wrapper
  const debouncedSave = useMemo(
    () => () => {
      debouncedSaveRef.current?.()
    },
    [],
  )

  // Handle field changes
  const handleChange = useCallback(
    (field: keyof Profile, value: string | string[] | number | null) => {
      if (!localProfile) return

      // Email changes are handled by a special verification flow
      if (field === 'email') {
        console.warn('Email changes should use the EmailChangeFlow component')
        return
      }

      // Update local state immediately for UI responsiveness
      setLocalProfile((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          [field]: value,
        }
      })

      // Track changes for debounced saving
      latestChangesRef.current = {
        ...latestChangesRef.current,
        [field]: value,
      }

      // Handle special field formatting
      if (field === 'birthday' && value) {
        latestChangesRef.current.birthday = new Date(
          value as string,
        ).toISOString()
      }

      // Trigger debounced save
      debouncedSave()
    },
    [localProfile, debouncedSave],
  )

  // Handle avatar changes - update local state immediately, then save
  const handleAvatarChange = useCallback(
    async (avatarUrl: string) => {
      // Update local state immediately for instant UI feedback
      setLocalProfile((prev) => (prev ? { ...prev, avatarUrl } : prev))

      // Save to backend
      await updateAvatarMutation({ input: { avatarUrl } })
    },
    [updateAvatarMutation],
  )

  return {
    profile: localProfile,
    handleAutoSave: handleChange,
    handleAvatarChange,
    isProfileLoaded: !!serverProfile,
  }
}
