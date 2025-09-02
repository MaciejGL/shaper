import { isArray } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  GQLProfileQuery,
  useProfileQuery,
  useUserBasicQuery,
} from '@/generated/graphql-client'
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
  const [editingSections, setEditingSections] = useState<Set<ProfileSection>>(
    new Set(),
  )
  const { data } = useProfileQuery()
  const invalidateQueries = useInvalidateQuery()
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfileMutation({
      onSuccess: () => {
        setEditingSections(new Set()) // Clear all editing states
        toast.success('Profile updated successfully')
        invalidateQueries({ queryKey: useProfileQuery.getKey() })
        invalidateQueries({ queryKey: useUserBasicQuery.getKey() })
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

  return {
    isSaving,
    profile,
    handleChange,
    handleSectionSave,
    toggleSectionEdit,
    isSectionEditing,
  }
}
