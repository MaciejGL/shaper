import { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { invalidateUserCache } from '../getUser'
import { createUserLoaders } from '../loaders/user.loader'

import { handleAppleSignIn } from './apple-signin'
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
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
      authorization: {
        params: {
          scope: 'name email',
          response_mode: 'form_post',
        },
      },
      checks: ['pkce', 'state'],
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

  // Fix for Apple Sign In PKCE issues
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },

  debug: process.env.NODE_ENV === 'development',

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
      console.warn('BEFORE Apple OAuth sign-in attempt:', {
        email: profile?.email,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      })
      // Handle Apple OAuth sign-in
      if (account?.provider === 'apple' && profile) {
        const email = profile?.email
        console.warn('Apple OAuth sign-in attempt:', {
          email,
          provider: account.provider,
          timestamp: new Date().toISOString(),
        })

        try {
          const result = await handleAppleSignIn(account, profile)
          console.warn('Apple OAuth sign-in result:', result)
          if (!result) {
            console.warn('Apple OAuth sign-in failed:', {
              email,
              timestamp: new Date().toISOString(),
            })
          }

          return result
        } catch (error) {
          console.error('Error in handleAppleSignIn:', error)
          return false
        }
      }

      // For other providers, continue with default behavior
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
