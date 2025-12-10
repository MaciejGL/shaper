import {
  calculateDueDate,
  getDaysUntilDue,
  getDeliverableLabel,
  isOverdue,
} from '@/config/deliverable-config'
import { TaskStatus } from '@/config/task-templates'
import {
  GQLDeliveryStatus,
  GQLPackageTemplate,
  GQLServiceDelivery,
  GQLServiceType,
  GQLSubscriptionDuration,
} from '@/generated/graphql-server'
import {
  PackageTemplate as PrismaPackageTemplate,
  ServiceDelivery as PrismaServiceDelivery,
  ServiceTask as PrismaServiceTask,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  ServiceType,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import ServiceTask from '../service-task/model'
import User from '../user/model'

export class PackageTemplate implements GQLPackageTemplate {
  constructor(
    protected data: PrismaPackageTemplate & {
      trainer?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get duration(): GQLSubscriptionDuration {
    return this.data.duration as GQLSubscriptionDuration
  }

  get isActive() {
    return this.data.isActive
  }

  get serviceType() {
    const metadata = this.data.metadata as {
      service_type?: GQLServiceType
    } | null

    switch (metadata?.service_type) {
      case 'workout_plan':
        return GQLServiceType.WorkoutPlan
      case 'meal_plan':
        return GQLServiceType.MealPlan
      case 'coaching_complete':
        return GQLServiceType.CoachingComplete
      case 'in_person_meeting':
        return GQLServiceType.InPersonMeeting
      case 'premium_access':
        return GQLServiceType.PremiumAccess
      default:
        return null
    }
  }

  get stripeLookupKey() {
    return this.data.stripeLookupKey
  }

  get stripeProductId() {
    return this.data.stripeProductId
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get trainer() {
    return this.data.trainer ? new User(this.data.trainer, this.context) : null
  }

  get trainerId() {
    return this.data.trainerId
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}

export class ServiceDelivery implements GQLServiceDelivery {
  constructor(
    protected data: PrismaServiceDelivery & {
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
      tasks?: PrismaServiceTask[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get clientId() {
    return this.data.clientId
  }

  get packageName() {
    return this.data.packageName
  }

  get quantity() {
    return this.data.quantity
  }

  get serviceType(): GQLServiceType {
    switch (this.data.serviceType) {
      case 'WORKOUT_PLAN':
        return GQLServiceType.WorkoutPlan
      case 'MEAL_PLAN':
        return GQLServiceType.MealPlan
      case 'COACHING_COMPLETE':
        return GQLServiceType.CoachingComplete
      case 'IN_PERSON_MEETING':
        return GQLServiceType.InPersonMeeting
      case 'PREMIUM_ACCESS':
        return GQLServiceType.PremiumAccess
      default:
        return GQLServiceType.WorkoutPlan // Default fallback
    }
  }

  get status(): GQLDeliveryStatus {
    return this.data.status as GQLDeliveryStatus
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get deliveredAt() {
    return this.data.deliveredAt?.toISOString() || null
  }

  get deliveryNotes() {
    return this.data.deliveryNotes
  }

  get trainer() {
    if (!this.data.trainer) {
      throw new Error('Trainer data not loaded')
    }
    return new User(this.data.trainer, this.context)
  }

  get trainerId() {
    return this.data.trainerId
  }

  get client() {
    if (!this.data.client) {
      throw new Error('Client data not loaded')
    }
    return new User(this.data.client, this.context)
  }

  private get prismaServiceType(): ServiceType {
    return this.data.serviceType as ServiceType
  }

  get dueDate(): string {
    const due = calculateDueDate(this.data.createdAt, this.prismaServiceType)
    return due.toISOString()
  }

  get isOverdue(): boolean {
    return isOverdue(
      this.data.createdAt,
      this.prismaServiceType,
      this.data.status,
    )
  }

  get daysUntilDue(): number {
    return getDaysUntilDue(this.data.createdAt, this.prismaServiceType)
  }

  get deliverableLabel(): string {
    return getDeliverableLabel(this.prismaServiceType)
  }

  get tasks() {
    if (!this.data.tasks) {
      return []
    }
    return this.data.tasks.map((task) => new ServiceTask(task, this.context))
  }

  get totalTaskCount(): number {
    return this.data.tasks?.length || 0
  }

  get completedTaskCount(): number {
    if (!this.data.tasks) return 0
    return this.data.tasks.filter((t) => t.status === TaskStatus.COMPLETED)
      .length
  }

  get taskProgress(): number {
    if (this.totalTaskCount === 0) return 100
    return Math.round((this.completedTaskCount / this.totalTaskCount) * 100)
  }
}
