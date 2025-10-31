import { GraphQLError } from 'graphql'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-server'
import {
  Notification as PrismaNotification,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export default class Notification implements GQLNotification {
  constructor(
    protected data: PrismaNotification & {
      creator?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  // Scalar fields
  get id() {
    return this.data.id
  }

  get message() {
    return this.data.message
  }

  get type(): GQLNotificationType {
    switch (this.data.type) {
      case 'COACHING_REQUEST':
        return GQLNotificationType.CoachingRequest
      case 'COACHING_REQUEST_ACCEPTED':
        return GQLNotificationType.CoachingRequestAccepted
      case 'COACHING_REQUEST_REJECTED':
        return GQLNotificationType.CoachingRequestRejected
      case 'COACHING_CANCELLED':
        return GQLNotificationType.CoachingCancelled
      case 'NEW_TRAINING_PLAN_ASSIGNED':
        return GQLNotificationType.NewTrainingPlanAssigned
      case 'NEW_MEAL_PLAN_ASSIGNED':
        return GQLNotificationType.NewMealPlanAssigned
      case 'WORKOUT_COMPLETED':
        return GQLNotificationType.WorkoutCompleted
      case 'PLAN_COMPLETED':
        return GQLNotificationType.PlanCompleted
      case 'EXERCISE_NOTE_ADDED':
        return GQLNotificationType.ExerciseNoteAdded
      case 'EXERCISE_NOTE_REPLY':
        return GQLNotificationType.ExerciseNoteReply
      case 'TRAINER_NOTE_SHARED':
        return GQLNotificationType.TrainerNoteShared
      case 'TRAINER_WORKOUT_COMPLETED':
        return GQLNotificationType.TrainerWorkoutCompleted
      case 'TRAINER_OFFER_RECEIVED':
        return GQLNotificationType.TrainerOfferReceived
      case 'TRAINER_OFFER_DECLINED':
        return GQLNotificationType.TrainerOfferDeclined
      case 'TEAM_INVITATION':
        return GQLNotificationType.TeamInvitation
      case 'BODY_PROGRESS_SHARED':
        return GQLNotificationType.BodyProgressShared
      case 'PAYMENT_RECEIVED':
        return GQLNotificationType.PaymentReceived
      case 'SUBSCRIPTION_PAYMENT_RECEIVED':
        return GQLNotificationType.SubscriptionPaymentReceived
      case 'REMINDER':
        return GQLNotificationType.Reminder
      case 'SYSTEM':
        return GQLNotificationType.System
      case 'MESSAGE':
        return GQLNotificationType.Message
      case 'MEETING_REMINDER':
        return GQLNotificationType.MeetingReminder
      default:
        console.log(
          'Unknown notification type:',
          this.data.type,
          this.data.message,
        )
        return GQLNotificationType.System
    }
  }

  get read() {
    return this.data.read
  }

  get link() {
    return this.data.link
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get createdBy() {
    return this.data.createdBy
  }

  get relatedItemId() {
    return this.data.relatedItemId
  }

  async creator() {
    if (this.data.creator) {
      return new User(this.data.creator, this.context)
    } else {
      console.error(
        `[Notification] No creator found for notification ${this.id}. Loading from database.`,
      )
      throw new GraphQLError('No creator found for notification')
    }
  }
}
