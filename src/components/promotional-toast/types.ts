import { LucideIcon } from 'lucide-react'

import {
  GQLNotification,
  GQLNotificationType,
} from '@/generated/graphql-client'

export interface NotificationData {
  notificationId: string
  trainerName?: string
  planTitle?: string
  token?: string
  requestId?: string
  message: string
}

export interface PromotionalToastAction {
  label: string
  handler: (data: NotificationData) => void | Promise<void>
  isLoading?: boolean
}

export interface PromotionalToastConfig {
  id: string
  notificationType: GQLNotificationType
  title: string
  getSubtitle: (data: NotificationData) => string
  icon: LucideIcon
  iconVariant: 'orange' | 'blue' | 'green' | 'purple'
  primaryAction: PromotionalToastAction
  extractData: (notification: GQLNotification) => NotificationData
}
