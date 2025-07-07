import { isArray } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { GQLProfileQuery, useProfileQuery } from '@/generated/graphql-client'
import { useUpdateProfileMutation } from '@/generated/graphql-client'

import { Profile } from './types'

export function useProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const { data, refetch } = useProfileQuery()
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfileMutation({
      onSuccess: () => {
        setIsEditing(false)
        toast.success('Profile updated successfully')
        refetch()
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
    if (sex === 'male') return 'Male'
    if (sex === 'female') return 'Female'
    if (sex === 'other') return 'Other'

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
      value: string | string[],
    ) => {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [setProfile],
  )

  const toggleEdit = () => {
    setIsEditing((prev) => !prev)
  }

  const handleSave = useCallback(async () => {
    const input = {
      ...profile,
      height: profile.height ? parseFloat(profile.height.toString()) : null,
      weight: profile.weight ? parseFloat(profile.weight.toString()) : null,
      birthday: profile.birthday
        ? new Date(profile.birthday).toISOString()
        : null,
    }
    await updateProfile({
      input,
    })

    setIsEditing(false)
  }, [profile, updateProfile])

  return {
    isSaving,
    profile,
    isEditing,
    handleChange,
    handleSave,
    toggleEdit,
  }
}
