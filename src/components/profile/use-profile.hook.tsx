import { useQueryClient } from '@tanstack/react-query'
import { isArray } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { GQLProfileQuery, useProfileQuery } from '@/generated/graphql-client'
import { useUpdateProfileMutation } from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { Profile } from './types'

type ProfileSection =
  | 'header'
  | 'personalInfo'
  | 'physicalStats'
  | 'goalsAndHealth'
  | 'bio'

export function useProfile() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editingSections, setEditingSections] = useState<Set<ProfileSection>>(
    new Set(),
  )
  const { data } = useProfileQuery()
  const invalidateQueries = useInvalidateQuery()
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfileMutation({
      onSuccess: () => {
        setEditingSections(new Set()) // Clear all editing states
        invalidateQueries({ queryKey: useProfileQuery.getKey({}) })
      },
    })

  // Separate mutation for avatar changes with optimistic updates
  const { mutateAsync: updateAvatarOnly } = useUpdateProfileMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: useProfileQuery.getKey({}) })

      // Snapshot the previous value
      const previousProfile = data?.profile

      // Return a context with the previous data
      return { previousProfile }
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        // Rollback the local state
        setProfile((prev) => ({
          ...prev,
          avatarUrl: context.previousProfile?.avatarUrl || '',
        }))
      }
      toast.error('Failed to update avatar')
    },
    onSuccess: () => {
      // Refresh server components to get fresh data
      // Redis cache is automatically invalidated on backend
      router.refresh()
    },
    onSettled: () => {
      // Always refetch after mutation
      invalidateQueries({ queryKey: useProfileQuery.getKey({}) })
    },
  })

  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthday: '',
    sex: '',
    avatarUrl: '',
    height: null,
    weight: null,
    fitnessLevel: null,
    activityLevel: null,
    goals: [],
    allergies: '',
    bio: '',
  })

  const getGender = (sex?: string | null) => {
    if (sex?.toLowerCase() === 'male') return 'Male'
    if (sex?.toLowerCase() === 'female') return 'Female'
    if (sex?.toLowerCase() === 'other') return 'Other'

    return null
  }

  useEffect(() => {
    const profileData = data?.profile
    if (profileData) {
      setProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        email: profileData.email,
        birthday: profileData.birthday,
        sex: getGender(profileData.sex),
        avatarUrl: profileData.avatarUrl,
        height: profileData.height,
        weight: profileData.weight,
        fitnessLevel: profileData.fitnessLevel,
        activityLevel: profileData.activityLevel,
        goals: isArray(profileData.goals) ? profileData.goals : [],
        allergies: profileData.allergies,
        bio: profileData.bio,
      })
    }
  }, [data])

  const handleChange = useCallback(
    (
      field: keyof NonNullable<GQLProfileQuery['profile']>,
      value: string | string[] | number | null,
    ) => {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [setProfile],
  )

  const toggleSectionEdit = useCallback((section: ProfileSection) => {
    setEditingSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [])

  const isSectionEditing = useCallback(
    (section: ProfileSection) => {
      return editingSections.has(section)
    },
    [editingSections],
  )

  const handleSectionSave = useCallback(
    async (section: ProfileSection) => {
      const input = {
        ...profile,
        height: profile.height,
        weight: profile.weight,
        birthday: profile.birthday
          ? new Date(profile.birthday).toISOString()
          : null,
      }
      await updateProfile({
        input,
      })

      // Remove this section from editing
      setEditingSections((prev) => {
        const newSet = new Set(prev)
        newSet.delete(section)
        return newSet
      })
    },
    [profile, updateProfile],
  )

  const handleAvatarChange = useCallback(
    async (avatarUrl: string) => {
      // Update local state first
      setProfile((prev) => ({
        ...prev,
        avatarUrl,
      }))

      // Auto-save only avatar to backend without refetching
      await updateAvatarOnly({
        input: {
          avatarUrl,
        },
      })
    },
    [updateAvatarOnly],
  )

  return {
    isSaving,
    profile,
    handleChange,
    handleAvatarChange,
    handleSectionSave,
    toggleSectionEdit,
    isSectionEditing,
  }
}
