import { getCurrentUser } from '@/lib/getUser'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export const createContext = async () => {
  const userSession = await getCurrentUser()
  const context = {
    user: userSession,
    loaders: {
      plan: createPlanLoaders(),
      user: createUserLoaders(),
    },
  }

  return context
}
