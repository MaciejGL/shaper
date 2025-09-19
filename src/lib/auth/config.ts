import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { invalidateUserCache } from '../getUser'
import { createUserLoaders } from '../loaders/user.loader'

import { handleGoogleSignIn } from './google-signin'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          // Options for prompt:
          // 'none' - Silent auth (only works if user already consented)
          // 'select_account' - Show account picker (best for most cases)
          // 'login' - Force re-authentication
          // 'consent' - Force consent screen (avoid this)
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
          include_granted_scopes: 'true',
          enable_granular_consent: 'true',
        },
      },
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: { email: {}, otp: {} },
      async authorize(credentials) {
        const { email, otp } = credentials ?? {}
        if (!email || !otp) return null

        const loaders = createUserLoaders()
        const user = await loaders.authSession.load(email)

        if (!user || user.sessions.length === 0) return null

        const session = user.sessions[0] // Most recent session (ordered by 'desc')

        if (session.otp !== otp) {
          return null // Invalid OTP
        }

        if (new Date(session.expiresAt) < new Date()) {
          // Clean up expired session
          await prisma.userSession.delete({ where: { id: session.id } })
          return null // Session expired
        }

        await prisma.userSession.delete({ where: { id: session.id } })

        return user as UserWithSession['user']
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
        const { email } = credentials ?? {}
        if (process.env.NODE_ENV !== 'production') {
          if (!email) return null
          const loaders = createUserLoaders()
          const user = await loaders.authSession.load(email)
          return user
        } else {
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async signIn({ account, profile }) {
      console.info('SignIn callback triggered:', {
        provider: account?.provider,
        hasProfile: !!profile,
        profileEmail: profile?.email,
      })

      // Handle Google OAuth sign-in
      if (account?.provider === 'google' && profile) {
        const email = profile?.email
        console.info('Google OAuth sign-in attempt:', {
          email,
          provider: account.provider,
          timestamp: new Date().toISOString(),
        })

        try {
          const result = await handleGoogleSignIn(account, profile)

          if (result) {
            console.info('Google OAuth sign-in successful:', {
              email,
              timestamp: new Date().toISOString(),
            })
          } else {
            console.warn('Google OAuth sign-in failed:', {
              email,
              timestamp: new Date().toISOString(),
            })
          }

          return result
        } catch (error) {
          console.error('Error in handleGoogleSignIn:', error)
          return false
        }
      }

      // For non-Google providers, continue with default behavior
      return true
    },
    async jwt({ token, user }) {
      // Persist user data in the token
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.user) {
        session.user = token.user
      }
      return session
    },
  },

  events: {
    async signOut({ session }) {
      if (session.user?.email) {
        await invalidateUserCache(session.user.email)
      }
    },
  },
} satisfies NextAuthOptions
