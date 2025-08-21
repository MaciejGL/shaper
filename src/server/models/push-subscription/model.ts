import { GQLPushSubscription } from '@/generated/graphql-server'
import { PushSubscription as PrismaPushSubscription } from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

export default class PushSubscription implements GQLPushSubscription {
  constructor(
    protected data: PrismaPushSubscription,
    protected context: GQLContext,
  ) {}

  // Scalar fields
  get id() {
    return this.data.id
  }

  get endpoint() {
    return this.data.endpoint
  }

  get userAgent() {
    return this.data.userAgent
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  // Get the subscription data for web-push library
  getWebPushData() {
    return {
      endpoint: this.data.endpoint,
      keys: {
        p256dh: this.data.p256dh,
        auth: this.data.auth,
      },
    }
  }
}
