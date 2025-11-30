import { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

import { prisma } from '@/lib/db'
import { UserFull } from '@/types/UserWithSession'

import { createUserLoaders } from '../loaders/user.loader'

import { handleAppleSignIn } from './apple-signin'
import { handleGoogleSignIn } from './google-signin'

export const authOptions = {
  providers: [
    GoogleProvider<GoogleProfile>({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
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

        return user as UserFull
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
    // Server-issued nonce provider for mobile OAuth handoff
    CredentialsProvider({
      id: 'server-nonce',
      name: 'Server Nonce',
      credentials: {
        userId: {
          label: 'User ID',
          type: 'text',
        },
      },
      async authorize(credentials) {
        const { userId } = credentials ?? {}
        if (!userId) return null

        try {
          // This provider is ONLY used by the mobile auth exchange endpoint
          // It receives a userId that was validated via handoff code
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              profile: true,
            },
          })

          if (!user) {
            console.error('🔐 [SERVER-NONCE] User not found:', userId)
            return null
          }

          console.info('🔐 [SERVER-NONCE] User authenticated via handoff:', {
            userId: user.id,
            email: user.email,
          })

          return user as UserFull
        } catch (error) {
          console.error('🔐 [SERVER-NONCE] Authorization error:', error)
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true, // MUST be true when sameSite is 'none'
        maxAge: 900, // 15 minutes
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true, // MUST be true when sameSite is 'none'
        maxAge: 900, // 15 minutes
      },
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Default web behavior - relative URLs become absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // If URL is on same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Otherwise redirect to base URL
      return baseUrl
    },
    async signIn({ account, profile }) {
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

      // Handle Apple OAuth sign-in
      if (account?.provider === 'apple' && profile) {
        try {
          const result = await handleAppleSignIn(account, profile)

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
      if (user && user.email) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: (user as UserFull).role,
          profile: (user as UserFull).profile,
          trainerId: (user as UserFull).trainerId,
        }
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
} satisfies NextAuthOptions
