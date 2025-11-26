import { GQLGetTrainerServiceDeliveriesQuery } from '@/generated/graphql-client'

export type Delivery = NonNullable<
  GQLGetTrainerServiceDeliveriesQuery['getTrainerDeliveries']
>[number]

export type Task = NonNullable<Delivery['tasks']>[number]

