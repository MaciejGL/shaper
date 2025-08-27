import {
  GQLGetMyTrainerQuery,
  useGetMyTrainerQuery,
} from '@/generated/graphql-client'

export interface TrainerStatus {
  hasTrainer: boolean
  trainer: GQLGetMyTrainerQuery['getMyTrainer'] | null
  isLoading: boolean
}

/**
 * Custom hook to check if the current user has a trainer
 * @returns TrainerStatus object with hasTrainer, trainer data, and loading state
 */
export function useTrainerStatus(): TrainerStatus {
  const { data, isLoading } = useGetMyTrainerQuery()

  return {
    hasTrainer: !!data?.getMyTrainer,
    trainer: data?.getMyTrainer || null,
    isLoading,
  }
}
