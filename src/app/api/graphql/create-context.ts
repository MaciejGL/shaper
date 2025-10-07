import { getCurrentUser } from '@/lib/getUser'
import { createChatLoaders } from '@/lib/loaders/chat.loader'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export const createContext = async () => {
  const userSession = await getCurrentUser()

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
