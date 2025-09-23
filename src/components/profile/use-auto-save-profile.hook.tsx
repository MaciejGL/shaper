import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type GQLUpdateProfileInput,
  useProfileQuery,
  useUpdateProfileMutation,
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

  // Profile update mutation
  const { mutateAsync: updateProfileMutation } = useUpdateProfileMutation({
    onSuccess: () => {
      // Clear pending changes
      latestChangesRef.current = {}
      // Invalidate queries to sync across app
      invalidateQueries({ queryKey: useProfileQuery.getKey({}) })
    },
    onError: (error) => {
      toast.error('Failed to save changes. Please try again.')
      console.error('[ProfileAutoSave]: Save failed', error)
    },
  })

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(async () => {
        if (
          !serverProfile ||
          Object.keys(latestChangesRef.current).length === 0
        )
          return

        const updateInput: GQLUpdateProfileInput = {
          ...latestChangesRef.current,
          // Always include required fields
          firstName:
            latestChangesRef.current.firstName || serverProfile.firstName,
          lastName: latestChangesRef.current.lastName || serverProfile.lastName,
          email: latestChangesRef.current.email || serverProfile.email,
        }

        try {
          await updateProfileMutation({ input: updateInput })
        } catch (error) {
          // Error handling is done in mutation onError
        }
      }, 1000),
    [updateProfileMutation, serverProfile],
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

  return {
    profile: localProfile,
    handleAutoSave: handleChange,
    isProfileLoaded: !!serverProfile,
  }
}
