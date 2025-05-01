import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';
import { redirect } from 'next/navigation';

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
	| {
			user: User;
			session: Session;
	  }
	| null
	| undefined
> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return null;
	}

	// Get full user data from database
	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: {
			id: true,
			email: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		user,
		session: session as Session,
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
