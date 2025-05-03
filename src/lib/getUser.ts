import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';
import { redirect } from 'next/navigation';
import { UserWithSession } from '@/types/UserWithSession';
import { GQLUserRole } from '@/generated/graphql';

export type User = {
	id: string;
	email: string;
};

export type Session = {
	user: User;
	expires: string;
};

/**
 * Get the current authenticated user and session
 * @returns Promise with the user and session or null if not authenticated
 */
export async function getCurrentUser(): Promise<
	UserWithSession | null | undefined
> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return null;
	}

	// Get full user data from database
	const user = await prisma.user.findUnique({
		where: { email: session.user.email },

		include: {
			profile: true,
			trainer: true,
			clients: true,
			sessions: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		user,
		session,
	};
}
/**
 * Get the current authenticated user and session
 * @returns Promise with the user and session or null if not authenticated
 */
export async function getCurrentUserOrThrow(): Promise<UserWithSession> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		throw new Error('User not authenticated');
	}

	// Get full user data from database
	const user = await prisma.user.findUnique({
		where: { email: session.user.email },

		include: {
			profile: true,
			trainer: true,
			clients: true,
			sessions: true,
		},
	});

	if (!user?.id) {
		throw new Error('User not found');
	}

	return {
		user,
		session,
	};
}

// Helper function to use in API routes or server components to require authentication
export async function requireAuth(authLevel?: GQLUserRole) {
	const userSession = await getCurrentUser();

	if (!userSession) {
		redirect('/login');
	}

	if (authLevel && userSession.user?.role !== authLevel) {
		if (userSession.user?.role === GQLUserRole.Trainer) {
			redirect('/trainer/dashboard');
		} else if (userSession.user?.role === GQLUserRole.Client) {
			redirect('/fitspace/dashboard');
		}
	}

	return userSession;
}
