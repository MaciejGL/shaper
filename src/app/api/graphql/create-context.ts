import { getCurrentUser } from '@/lib/getUser'
import { createChatLoaders } from '@/lib/loaders/chat.loader'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export const createContext = async () => {
  const userSession = await getCurrentUser()

  console.warn('[GraphQL Context] Creating context', {
    hasUser: !!userSession,
    userId: userSession?.user?.id,
    userEmail: userSession?.user?.email,
    trainerId: userSession?.user?.trainerId,
  })

  const context = {
    user: userSession,
    loaders: {
      chat: createChatLoaders(),
      plan: createPlanLoaders(),
      user: createUserLoaders(),
    },
  }

  return context
}
