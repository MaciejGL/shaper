import { GQLNotification } from '@/generated/graphql-client'

export type NotificationNavbar = Pick<
  GQLNotification,
  'id' | 'read' | 'type' | 'message' | 'link' | 'createdAt' | 'relatedItemId'
>
