import {
  CheckCircle,
  ClipboardCheck,
  Package,
  Salad,
  UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { GQLNotificationType } from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'

import { PromotionalToastConfig } from './types'

export function usePromotionalToastConfigs(): Record<
  GQLNotificationType,
  PromotionalToastConfig | undefined
> {
  const router = useRouter()
  const { openUrl } = useOpenUrl()

  return {
    [GQLNotificationType.TrainerOfferReceived]: {
      id: 'trainer-offer',
      notificationType: GQLNotificationType.TrainerOfferReceived,
      title: 'New Training Offer',
      getSubtitle: (data) => `From ${data.trainerName || 'your trainer'}`,
      icon: Package,
      iconVariant: 'orange',
      primaryAction: {
        label: 'View Offer',
        handler: (data) => {
          if (data.token) {
            openUrl(`/offer/${data.token}`)
          }
        },
      },
      extractData: (notification) => {
        const trainerName =
          notification.message.split(' created a training offer')[0] ||
          'Your Trainer'
        return {
          notificationId: notification.id,
          trainerName,
          token: notification.relatedItemId || undefined,
          message: notification.message,
        }
      },
    },

    [GQLNotificationType.CoachingRequest]: {
      id: 'coaching-request',
      notificationType: GQLNotificationType.CoachingRequest,
      title: 'New Coaching Request',
      getSubtitle: (data) => `From ${data.trainerName || 'User'}`,
      icon: UserPlus,
      iconVariant: 'blue',
      primaryAction: {
        label: 'View Request',
        handler: (data) => {
          // Use the link from notification data (set based on user role)
          router.push(data.link || '/fitspace/my-trainer')
        },
      },
      extractData: (notification) => {
        // Extract trainer name from message "You have a new coaching request from X."
        const match = notification.message.match(/from (.+)\.$/)
        const trainerName = match ? match[1] : 'User'
        return {
          notificationId: notification.id,
          trainerName,
          requestId: notification.relatedItemId || undefined,
          link: notification.link || undefined,
          message: notification.message,
        }
      },
    },

    [GQLNotificationType.CoachingRequestAccepted]: {
      id: 'coaching-accepted',
      notificationType: GQLNotificationType.CoachingRequestAccepted,
      title: 'Coaching Request Accepted',
      getSubtitle: (data) =>
        `${data.trainerName || 'User'} accepted your request`,
      icon: CheckCircle,
      iconVariant: 'green',
      primaryAction: {
        label: 'View Trainer',
        handler: () => {
          router.push('/fitspace/my-trainer')
        },
      },
      extractData: (notification) => {
        // Extract name from message "X accepted your coaching request."
        const match = notification.message.match(
          /^(.+?) accepted your coaching request/,
        )
        const trainerName = match ? match[1] : 'User'
        return {
          notificationId: notification.id,
          trainerName,
          message: notification.message,
        }
      },
    },

    [GQLNotificationType.NewTrainingPlanAssigned]: {
      id: 'training-plan',
      notificationType: GQLNotificationType.NewTrainingPlanAssigned,
      title: 'New Training Plan',
      getSubtitle: (data) =>
        data.planTitle
          ? `"${data.planTitle}" assigned by ${data.trainerName || 'your trainer'}`
          : `Assigned by ${data.trainerName || 'your trainer'}`,
      icon: ClipboardCheck,
      iconVariant: 'purple',
      primaryAction: {
        label: 'View Plan',
        handler: () => {
          router.push('/fitspace/my-plans?tab=available')
        },
      },
      extractData: (notification) => {
        // Extract plan title and trainer name from message:
        // 'New training plan "X" has been assigned to you by Y.'
        const planMatch = notification.message.match(/"(.+?)"/)
        const trainerMatch = notification.message.match(/by (.+)\.$/)

        return {
          notificationId: notification.id,
          planTitle: planMatch ? planMatch[1] : undefined,
          trainerName: trainerMatch ? trainerMatch[1] : undefined,
          message: notification.message,
        }
      },
    },

    [GQLNotificationType.NewMealPlanAssigned]: {
      id: 'meal-plan',
      notificationType: GQLNotificationType.NewMealPlanAssigned,
      title: 'New Meal Plan',
      getSubtitle: (data) =>
        data.planTitle
          ? `"${data.planTitle}" assigned by ${data.trainerName || 'your trainer'}`
          : `Assigned by ${data.trainerName || 'your trainer'}`,
      icon: Salad,
      iconVariant: 'green',
      primaryAction: {
        label: 'View Plan',
        handler: () => {
          router.push('/fitspace/nutrition')
        },
      },
      extractData: (notification) => {
        // Extract plan title and trainer name from message:
        // '"X" nutrition plan has been shared with you by Y'
        const planMatch = notification.message.match(/"(.+?)"/)
        const trainerMatch = notification.message.match(/by (.+)$/)

        return {
          notificationId: notification.id,
          planTitle: planMatch ? planMatch[1] : undefined,
          trainerName: trainerMatch ? trainerMatch[1] : undefined,
          message: notification.message,
        }
      },
    },

    // Placeholder for other notification types
    [GQLNotificationType.CoachingRequestRejected]: undefined,
    [GQLNotificationType.CoachingCancelled]: undefined,
    [GQLNotificationType.WorkoutCompleted]: undefined,
    [GQLNotificationType.PlanCompleted]: undefined,
    [GQLNotificationType.ExerciseNoteAdded]: undefined,
    [GQLNotificationType.ExerciseNoteReply]: undefined,
    [GQLNotificationType.TrainerNoteShared]: undefined,
    [GQLNotificationType.TrainerWorkoutCompleted]: undefined,
    [GQLNotificationType.TeamInvitation]: undefined,
    [GQLNotificationType.BodyProgressShared]: undefined,
    [GQLNotificationType.MeetingReminder]: undefined,
    [GQLNotificationType.Reminder]: undefined,
    [GQLNotificationType.System]: undefined,
    [GQLNotificationType.Message]: undefined,
    [GQLNotificationType.TrainerOfferDeclined]: undefined,
    [GQLNotificationType.PaymentReceived]: undefined,
    [GQLNotificationType.SubscriptionPaymentReceived]: undefined,
  }
}
