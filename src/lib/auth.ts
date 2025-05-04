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
								expiresAt: { gt: new Date() },
							},
							orderBy: { createdAt: 'desc' },
						},
					},
				});

				if (!user || user.sessions.length === 0) return null;

				await prisma.userSession.delete({ where: { id: user.sessions[0].id } });

				return user as UserWithSession['user'];
			},
		}),
		CredentialsProvider({
			id: 'account-swap',
			name: 'Account Swap',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
				},
			},
			async authorize(credentials) {
				const { email } = credentials ?? {};
				if (process.env.NODE_ENV !== 'production') {
					const user = await prisma.user.findUnique({
						where: { email },
						include: {
							sessions: {
								where: {
									expiresAt: { gt: new Date() },
								},
								orderBy: { createdAt: 'desc' },
							},
						},
					});
					return user;
				} else {
					return null;
				}
			},
		}),
	],
	session: { strategy: 'jwt' },
	secret: process.env.NEXTAUTH_SECRET,

	pages: {
		signIn: '/fitspace/dashboard',
		signOut: '/login',
	},
} satisfies NextAuthOptions;
