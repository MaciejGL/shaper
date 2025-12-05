import {
  GQLLocationType,
  GQLMeeting,
  GQLMeetingStatus,
  GQLMeetingType,
  GQLVirtualMethod,
} from '@/generated/graphql-server'
import {
  Meeting as PrismaMeeting,
  ServiceDelivery as PrismaServiceDelivery,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import { ServiceDelivery } from '../subscription/model'
import UserPublic from '../user-public/model'

export class Meeting implements GQLMeeting {
  constructor(
    protected data: PrismaMeeting & {
      coach?: PrismaUser & {
        profile?: PrismaUserProfile | null
      }
      trainee?: PrismaUser & {
        profile?: PrismaUserProfile | null
      }
      serviceDelivery?:
        | (PrismaServiceDelivery & {
            trainer?: PrismaUser & {
              profile?: PrismaUserProfile | null
            }
            client?: PrismaUser & {
              profile?: PrismaUserProfile | null
            }
          })
        | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get coachId() {
    return this.data.coachId
  }

  get traineeId() {
    return this.data.traineeId
  }

  get type(): GQLMeetingType {
    return this.data.type as GQLMeetingType
  }

  get status(): GQLMeetingStatus {
    return this.data.status as GQLMeetingStatus
  }

  get scheduledAt() {
    return this.data.scheduledAt.toISOString()
  }

  get duration() {
    return this.data.duration
  }

  get timezone() {
    return this.data.timezone
  }

  get locationType(): GQLLocationType {
    return this.data.locationType as GQLLocationType
  }

  get virtualMethod(): GQLVirtualMethod | null {
    return this.data.virtualMethod as GQLVirtualMethod | null
  }

  get address() {
    return this.data.address
  }

  get meetingLink() {
    return this.data.meetingLink
  }

  get title() {
    return this.data.title
  }

  get description() {
    return this.data.description
  }

  get notes() {
    return this.data.notes
  }

  get serviceDeliveryId() {
    return this.data.serviceDeliveryId
  }

  get coach() {
    if (!this.data.coach) {
      throw new Error('Coach data not loaded')
    }
    return new UserPublic(this.data.coach, this.context)
  }

  get trainee() {
    if (!this.data.trainee) {
      throw new Error('Trainee data not loaded')
    }
    return new UserPublic(this.data.trainee, this.context)
  }

  get serviceDelivery() {
    if (!this.data.serviceDelivery) {
      return null
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

export default Meeting
