import { getCurrentUserOrThrow } from '@/lib/getUser';
import {
	acceptCoachingRequest,
	cancelCoachingRequest,
	getCoachingRequest,
	getCoachingRequests,
	rejectCoachingRequest,
	upsertCoachingRequest,
} from './factory';

export const Query = {
	coachingRequest: async ({ id }: { id: string }) => {
		const user = await getCurrentUserOrThrow();

		return getCoachingRequest({ id, user });
	},
	coachingRequests: async () => {
		const user = await getCurrentUserOrThrow();

		return getCoachingRequests({ user });
	},
};

export const Mutation = {
	createCoachingRequest: async ({
		recipientId,
		message,
	}: {
		recipientId: string;
		message: string;
	}) => {
		const { user } = await getCurrentUserOrThrow();

		return upsertCoachingRequest({
			senderId: user.id,
			recipientId,
			message,
		});
	},
	acceptCoachingRequest: async ({ id }: { id: string }) => {
		const { user } = await getCurrentUserOrThrow();

		return acceptCoachingRequest({ id, recipientId: user.id });
	},
	cancelCoachingRequest: async ({ id }: { id: string }) => {
		const { user } = await getCurrentUserOrThrow();

		return cancelCoachingRequest({ id, senderId: user.id });
	},
	rejectCoachingRequest: async ({ id }: { id: string }) => {
		const { user } = await getCurrentUserOrThrow();

		return rejectCoachingRequest({ id, recipientId: user.id });
	},
};
