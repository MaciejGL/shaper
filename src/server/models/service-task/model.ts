import {
  GQLServiceTask,
  GQLTaskStatus,
  GQLTaskType,
} from '@/generated/graphql-server'
import {
  ServiceDelivery as PrismaServiceDelivery,
  ServiceTask as PrismaServiceTask,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import { ServiceDelivery } from '../subscription/model'

export class ServiceTask implements GQLServiceTask {
  constructor(
    protected data: PrismaServiceTask & {
      serviceDelivery?: PrismaServiceDelivery & {
        trainer?:
          | (PrismaUser & {
              profile?: PrismaUserProfile | null
            })
          | null
        client?:
          | (PrismaUser & {
              profile?: PrismaUserProfile | null
            })
          | null
      }
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get serviceDeliveryId() {
    return this.data.serviceDeliveryId
  }

  get templateId() {
    return this.data.templateId
  }

  get title() {
    return this.data.title
  }

  get taskType(): GQLTaskType {
    return this.data.taskType as GQLTaskType
  }

  get status(): GQLTaskStatus {
    return this.data.status as GQLTaskStatus
  }

  get order() {
    return this.data.order
  }

  get isRequired() {
    return this.data.isRequired
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get notes() {
    return this.data.notes
  }

  get requiresScheduling() {
    return this.data.requiresScheduling
  }

  get scheduledAt() {
    return this.data.scheduledAt?.toISOString() || null
  }

  get estimatedDuration() {
    return this.data.estimatedDuration
  }

  get location() {
    // Extract location from metadata for backwards compatibility
    const metadata = this.data.metadata as { location?: string } | null
    return metadata?.location || null
  }

  get isRecurring() {
    return this.data.isRecurring
  }

  get intervalDays() {
    return this.data.intervalDays
  }

  get recurrenceCount() {
    return this.data.recurrenceCount
  }

  get serviceDelivery() {
    if (!this.data.serviceDelivery) {
      throw new Error('ServiceDelivery data not loaded')
    }
    return new ServiceDelivery(this.data.serviceDelivery, this.context)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}

export default ServiceTask
