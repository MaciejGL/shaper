import { getCurrentUserOrThrow } from '@/lib/getUser';
import {
	acceptCoachingRequest,
	cancelCoachingRequest,
	getCoachingRequest,
	getCoachingRequests,
	rejectCoachingRequest,
	upsertCoachingRequest,
} from './factory';
import {
	GQLMutationResolvers,
	GQLQueryResolvers,
	GQLUserRole,
} from '@/generated/graphql-server';

export const Query: GQLQueryResolvers = {
	coachingRequest: async (_, { id }) => {
		const user = await getCurrentUserOrThrow();

		return getCoachingRequest({ id, user });
	},
	coachingRequests: async () => {
		const user = await getCurrentUserOrThrow();

		return getCoachingRequests({ user });
	},
};

export const Mutation: GQLMutationResolvers = {
	createCoachingRequest: async (_, args) => {
		const { user } = await getCurrentUserOrThrow();

		return upsertCoachingRequest({
			senderId: user.id,
			recipientEmail: args.recipientEmail,
			message: args.message,
		});
	},
	acceptCoachingRequest: async (_, { id }) => {
		const { user } = await getCurrentUserOrThrow();

		return acceptCoachingRequest({
			id,
			recipientId: user.id,
			recipientRole: user.role as GQLUserRole,
		});
	},
	cancelCoachingRequest: async (_, { id }) => {
		const { user } = await getCurrentUserOrThrow();

		return cancelCoachingRequest({ id, senderId: user.id });
	},
	rejectCoachingRequest: async (_, { id }) => {
		const { user } = await getCurrentUserOrThrow();

		return rejectCoachingRequest({ id, recipientId: user.id });
	},
};
