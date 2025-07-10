import { getCurrentUser } from '@/lib/getUser'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export const createContext = async () => {
  const userSession = await getCurrentUser()
  const context = {
    user: userSession,
    loaders: {
      plan: null as any, // Will be set below
      user: createUserLoaders(),
    },
  }

  // Set plan loaders with context reference
  context.loaders.plan = createPlanLoaders(context)

  return context
}
