import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { NextAuthOptions } from 'next-auth';
import { UserWithSession } from '@/types/UserWithSession';

export const authOptions = {
	providers: [
		CredentialsProvider({
			id: 'otp',
			name: 'OTP',
			credentials: { email: {}, otp: {} },
			async authorize(credentials) {
				const { email, otp } = credentials ?? {};
				if (!email || !otp) return null;

				const user = await prisma.user.findUnique({
					where: { email },
					include: {
						sessions: {
							where: {
								otp,
								expiresAt: { gt: new Date() },
							},
							orderBy: { createdAt: 'desc' },
						},
					},
				});

				if (!user || user.sessions.length === 0) return null;

				await prisma.userSession.delete({ where: { id: user.sessions[0].id } });

				return { id: user.id, email: user.email } as UserWithSession['user'];
			},
		}),
	],
	session: { strategy: 'jwt' },
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/dashboard',
		signOut: '/login',
	},
} satisfies NextAuthOptions;
