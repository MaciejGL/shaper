'use client'

import { TrainerCard } from '@/components/trainer/trainer-card'
import { createTrainerDataFromUser } from '@/components/trainer/utils'
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'

interface CreatorSectionProps {
  creator: {
    id: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
    email?: string | null
    role?: string | null
    profile?: {
      firstName?: string | null
      lastName?: string | null
      bio?: string | null
      avatarUrl?: string | null
      trainerCardBackgroundUrl?: string | null
      specialization?: string[] | null
      credentials?: string[] | null
      successStories?: string[] | null
      trainerSince?: string | null
    } | null
  } | null
  onClick?: () => void
}

export function CreatorSection({ creator, onClick }: CreatorSectionProps) {
  const { isTrainerServiceEnabled } = useTrainerServiceAccess()

  const trainerData = createTrainerDataFromUser(creator)
  if (!trainerData) return null

  const isClickable = onClick && isTrainerServiceEnabled

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">Created By</h3>
      <TrainerCard
        trainer={trainerData}
        onClick={isClickable ? onClick : undefined}
      />
    </div>
  )
}
