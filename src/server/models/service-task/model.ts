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
        trainer?: PrismaUser & { profile?: PrismaUserProfile | null }
        client?: PrismaUser & { profile?: PrismaUserProfile | null }
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
    switch (this.data.taskType) {
      case 'PLAN_DELIVERY':
        return GQLTaskType.PlanDelivery
      case 'MEETING_CHECKIN':
        return GQLTaskType.MeetingCheckin
      case 'MEETING_IN_PERSON':
        return GQLTaskType.MeetingInPerson
      default:
        return GQLTaskType.PlanDelivery
    }
  }

  get status(): GQLTaskStatus {
    switch (this.data.status) {
      case 'PENDING':
        return GQLTaskStatus.Pending
      case 'IN_PROGRESS':
        return GQLTaskStatus.InProgress
      case 'COMPLETED':
        return GQLTaskStatus.Completed
      case 'CANCELLED':
        return GQLTaskStatus.Cancelled
      default:
        return GQLTaskStatus.Pending
    }
  }

  get order() {
    return this.data.order
  }

  get isRequired() {
    return this.data.isRequired
  }

  get autoCompleteOn() {
    return (
      (this.data.metadata as { autoCompleteOn?: string })?.autoCompleteOn ||
      null
    )
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get completedBy() {
    return (this.data.metadata as { completedBy?: string })?.completedBy || null
  }

  get notes() {
    return this.data.notes
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
