import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  cancelMeeting,
  confirmMeeting,
  createMeeting,
  getServiceDeliveryMeetings,
  getTraineeMeetings,
  myUpcomingMeetings,
  updateMeeting,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  myUpcomingMeetings: async (_, __, context) => myUpcomingMeetings(context),

  getTraineeMeetings: async (_, args, context) =>
    getTraineeMeetings(args, context),

  getServiceDeliveryMeetings: async (_, args, context) =>
    getServiceDeliveryMeetings(args, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createMeeting: async (_, args, context) => createMeeting(args.input, context),

  updateMeeting: async (_, args, context) =>
    updateMeeting(args.meetingId, args.input, context),

  confirmMeeting: async (_, args, context) =>
    confirmMeeting(args.meetingId, context),

  cancelMeeting: async (_, args, context) =>
    cancelMeeting(args.meetingId, args.reason || null, context),
}
