import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';
import { redirect } from 'next/navigation';
import { UserWithSession } from '@/types/UserWithSession';

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

// Helper function to use in API routes or server components to require authentication
export async function requireAuth() {
	const userSession = await getCurrentUser();

	if (!userSession) {
		redirect('/login');
	}

	return userSession;
}
