// export const Query: GQLQueryResolvers = {}

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/getUser';
import User from './model';

export const Query = {
	user: async () => {
		console.log('user query');
		const userSession = await getCurrentUser();
		if (!userSession) {
			throw new Error('User not found');
		}

		const user = await prisma.user.findUnique({
			where: { id: userSession?.user?.id },
			include: {
				profile: true,
				trainer: true,
				clients: true,
				sessions: true,
			},
		});

		if (!user) {
			throw new Error('User not found');
		}

		return new User(user);
	},
};

export const Mutation = {};
