'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import {
  type GQLProfileQuery,
  type GQLUpdateProfileMutation,
  type GQLUpdateProfileMutationVariables,
  type GQLUserBasicQuery,
  useBodyMeasuresQuery,
  useProfileQuery,
  useUpdateProfileMutation,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import type { CompleteProfileFormState, SexOption } from './types'

interface UseCompleteProfileDrawerOptions {
  open: boolean
  onClose: () => void
}

interface UseCompleteProfileDrawerReturn {
  form: CompleteProfileFormState
  setFirstName: (value: string) => void
  setLastName: (value: string) => void
  setSex: (value: SexOption) => void
  setBirthday: (value: Date | undefined) => void
  setHeightCm: (value: number | null) => void
  setWeightKg: (value: number | null) => void
  canSave: boolean
  isPending: boolean
  handleSave: () => Promise<void>
}

export function useCompleteProfileDrawer({
  open,
  onClose,
}: UseCompleteProfileDrawerOptions): UseCompleteProfileDrawerReturn {
  const queryClient = useQueryClient()

  const { data } = useProfileQuery(undefined, { enabled: open })
  const profile = data?.profile ?? null

  const shouldFetchMeasures = open && profile?.weight == null
  const { data: bodyMeasuresData } = useBodyMeasuresQuery(undefined, {
    enabled: shouldFetchMeasures,
    staleTime: 5 * 60_000,
  })

  const fallbackWeightKg = useMemo(() => {
    const measures = bodyMeasuresData?.bodyMeasures ?? []
    const firstValid = measures.find(
      (m) => typeof m.weight === 'number' && m.weight > 0,
    )
    return firstValid?.weight ?? null
  }, [bodyMeasuresData?.bodyMeasures])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [sex, setSex] = useState<SexOption>('')
  const [birthday, setBirthday] = useState<Date | undefined>(undefined)
  const [heightCm, setHeightCm] = useState<number | null>(null)
  const [weightKg, setWeightKg] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return

    setFirstName(profile?.firstName ?? '')
    setLastName(profile?.lastName ?? '')
    setSex((profile?.sex as SexOption) ?? '')
    setBirthday(profile?.birthday ? new Date(profile.birthday) : undefined)
    setHeightCm(typeof profile?.height === 'number' ? profile.height : null)
    setWeightKg(
      typeof profile?.weight === 'number' ? profile.weight : fallbackWeightKg,
    )
  }, [fallbackWeightKg, open, profile])

  const updateProfileMutation = useUpdateProfileMutation()
  const isPending = updateProfileMutation.isPending

  const { optimisticMutate: saveOptimisticProfile } = useOptimisticMutation<
    GQLProfileQuery,
    GQLUpdateProfileMutation,
    GQLUpdateProfileMutationVariables
  >({
    queryKey: useProfileQuery.getKey(),
    mutationFn: updateProfileMutation.mutateAsync,
    updateFn: (oldData, variables) => {
      if (!oldData?.profile) return oldData
      const input = variables.input ?? {}

      return {
        ...oldData,
        profile: {
          ...oldData.profile,
          firstName: input.firstName ?? oldData.profile.firstName,
          lastName: input.lastName ?? oldData.profile.lastName,
          sex: input.sex ?? oldData.profile.sex,
          birthday: input.birthday ?? oldData.profile.birthday,
          height:
            typeof input.height === 'number' ? input.height : oldData.profile.height,
          weight:
            typeof input.weight === 'number' ? input.weight : oldData.profile.weight,
        },
      }
    },
    onSuccess: () => {
      onClose()
    },
  })

  const canSave = useMemo(() => {
    if (!firstName.trim()) return false
    if (!sex) return false
    if (!birthday) return false
    if (!heightCm || heightCm <= 0) return false
    if (!weightKg || weightKg <= 0) return false
    return true
  }, [birthday, firstName, heightCm, sex, weightKg])

  const handleSave = async () => {
    const input: GQLUpdateProfileMutationVariables['input'] = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      birthday: birthday?.toISOString(),
      height: heightCm ?? undefined,
      weight: weightKg ?? undefined,
    }

    const userBasicKey = useUserBasicQuery.getKey()
    const previousUserBasic =
      queryClient.getQueryData<GQLUserBasicQuery>(userBasicKey)

    if (previousUserBasic?.userBasic?.profile) {
      const prevProfile = previousUserBasic.userBasic.profile
      const optimisticUserBasic: GQLUserBasicQuery = {
        ...previousUserBasic,
        userBasic: {
          ...previousUserBasic.userBasic,
          profile: {
            ...prevProfile,
            firstName: input.firstName ?? prevProfile.firstName,
            lastName: input.lastName ?? prevProfile.lastName,
            sex: input.sex ?? prevProfile.sex,
            birthday: input.birthday ?? prevProfile.birthday,
            height: typeof input.height === 'number' ? input.height : prevProfile.height,
            weight: typeof input.weight === 'number' ? input.weight : prevProfile.weight,
          },
        },
      }

      queryClient.setQueryData(userBasicKey, optimisticUserBasic)
    }

    try {
      await saveOptimisticProfile({ input })
      queryClient.invalidateQueries({ queryKey: userBasicKey })
      queryClient.invalidateQueries({ queryKey: useProfileQuery.getKey() })
    } catch (error) {
      if (previousUserBasic) {
        queryClient.setQueryData(userBasicKey, previousUserBasic)
      }
      throw error
    }
  }

  return {
    form: {
      firstName,
      lastName,
      sex,
      birthday,
      heightCm,
      weightKg,
    },
    setFirstName,
    setLastName,
    setSex,
    setBirthday,
    setHeightCm,
    setWeightKg,
    canSave,
    isPending,
    handleSave,
  }
}

