import { getCurrentUser } from '@/lib/getUser'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export type GQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
  loaders: {
    plan: ReturnType<typeof createPlanLoaders>
    user: ReturnType<typeof createUserLoaders>
  }
}
