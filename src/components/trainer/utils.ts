import { TrainerData } from './trainer-card'

interface CreatedByUser {
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
}

export function createTrainerDataFromUser(
  user: CreatedByUser | null | undefined,
): TrainerData | null {
  if (!user) return null

  return {
    id: user.id,
    name: null,
    email: user.email ?? '',
    role: user.role ?? 'TRAINER',
    profile: {
      firstName: user.profile?.firstName ?? user.firstName,
      lastName: user.profile?.lastName ?? user.lastName,
      avatarUrl: user.profile?.avatarUrl ?? user.image,
      trainerCardBackgroundUrl: user.profile?.trainerCardBackgroundUrl ?? null,
      bio: user.profile?.bio ?? null,
      specialization: user.profile?.specialization ?? null,
      credentials: user.profile?.credentials ?? null,
      successStories: user.profile?.successStories ?? null,
      trainerSince: user.profile?.trainerSince ?? null,
    },
  }
}
