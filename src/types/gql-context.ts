import { getCurrentUser } from '@/lib/getUser'
import { createChatLoaders } from '@/lib/loaders/chat.loader'
import { createDayLoaders } from '@/lib/loaders/day.loader'
import { createPlanLoaders } from '@/lib/loaders/plan.loader'
import { createUserLoaders } from '@/lib/loaders/user.loader'

export type GQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
  loaders: {
    chat: ReturnType<typeof createChatLoaders>
    day: ReturnType<typeof createDayLoaders>
    plan: ReturnType<typeof createPlanLoaders>
    user: ReturnType<typeof createUserLoaders>
  }
}
