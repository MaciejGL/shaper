import { GQLGetTrainerServiceDeliveriesQuery } from '@/generated/graphql-client'

export type Delivery = NonNullable<
  GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
>[number]

export type UrgencyGroup =
  | 'overdue'
  | 'due-today'
  | 'due-soon'
  | 'upcoming'
  | 'completed'
