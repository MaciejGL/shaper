import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { invalidateUserCache } from './getUser'
import {
  type GoogleAccount,
  type GoogleProfile,
  getHighResGoogleProfilePicture,
  mapGoogleAccountForLinking,
  mapGoogleProfileToUser,
  sanitizeGoogleProfile,
  validateGoogleProfile,
} from './google-profile-mapper'
import { createUserLoaders } from './loaders/user.loader'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
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
  },

  callbacks: {
    async signIn({ account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google' && profile) {
        try {
          const googleProfile = profile as GoogleProfile
          const googleAccount = account as GoogleAccount

          // Validate and sanitize Google profile data
          if (!validateGoogleProfile(googleProfile)) {
            console.error('Invalid Google profile data:', googleProfile)
            return false
          }

          const sanitizedProfile = sanitizeGoogleProfile(googleProfile)

          // Check if user already exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedProfile.email },
          })

          if (existingUser) {
            // Link Google account to existing user WITHOUT overwriting profile data
            await prisma.user.update({
              where: { id: existingUser.id },
              data: mapGoogleAccountForLinking(sanitizedProfile, googleAccount),
            })

            // Invalidate user cache to ensure fresh data
            await invalidateUserCache(existingUser.email)

            console.info(
              `Linked Google account to existing user: ${existingUser.email}`,
            )
            return true
          } else {
            // Create new user with full Google profile data
            const newUserData = mapGoogleProfileToUser(
              sanitizedProfile,
              googleAccount,
            )

            // Enhance profile picture with high resolution version
            if (newUserData.image) {
              newUserData.image = getHighResGoogleProfilePicture(
                newUserData.image,
              )
            }

            const newUser = await prisma.user.create({
              data: {
                ...newUserData,
                role: 'CLIENT', // Default role for new users
              },
            })

            console.info(`Created new user from Google OAuth: ${newUser.email}`)
            return true
          }
        } catch (error) {
          console.error('Google OAuth sign-in error:', error)
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
