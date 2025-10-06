import { OAuth2Client } from 'google-auth-library'
import { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { createUserLoaders } from '../loaders/user.loader'

import { handleAppleSignIn } from './apple-signin'
import { ensureQuickWorkout } from './ensure-quick-workout'
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
    // Google One Tap Custom Provider
    CredentialsProvider({
      id: 'googleonetap',
      name: 'Google One Tap',
      credentials: {
        credential: {
          label: 'Credential',
          type: 'text',
        },
      },
      async authorize(credentials) {
        const { credential } = credentials ?? {}
        if (!credential) return null

        try {
          // Verify the credential using Google Auth Library
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          })

          const payload = ticket.getPayload()
          if (!payload || !payload.email) {
            console.error('Invalid Google One Tap payload')
            return null
          }

          console.info('Google One Tap verification successful:', {
            email: payload.email,
            name: payload.name,
            timestamp: new Date().toISOString(),
          })

          const loaders = createUserLoaders()

          // Check if user exists
          let user = await loaders.getCurrentUser.load(payload.email)

          if (!user) {
            // Create new user with profile if doesn't exist
            user = await prisma.user.create({
              data: {
                email: payload.email,
                name: payload.name || '',
                image: payload.picture,
                googleId: payload.sub,
                profile: {
                  create: {
                    firstName: '',
                    lastName: '',
                    avatarUrl: payload.picture,
                  },
                },
              },
              include: {
                profile: true,
              },
            })
            console.info(
              'Created new user with profile from Google One Tap:',
              payload.email,
            )

            // Create Quick Workout plan for new user in background
            ensureQuickWorkout(user.id).catch((err) =>
              console.error('Failed to create Quick Workout:', err),
            )
          } else {
            // Update existing user info if needed
            const updateData: Partial<{
              name: string
              image: string | null
              googleId: string
            }> = {}

            if (payload.name && payload.name !== user.name) {
              updateData.name = payload.name
            }
            if (payload.picture && payload.picture !== user.image) {
              updateData.image = payload.picture
            }
            if (payload.sub && payload.sub !== user.googleId) {
              updateData.googleId = payload.sub
            }

            if (Object.keys(updateData).length > 0) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: updateData,
                include: {
                  profile: true,
                },
              })
              console.info('Updated user from Google One Tap:', payload.email)
            }
          }

          return user as UserWithSession['user']
        } catch (error) {
          console.error('Google One Tap verification failed:', error)
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
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 900, // 15 minutes
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true, // Required when sameSite: 'none'
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
          role: (user as UserWithSession['user']).role,
          profile: (user as UserWithSession['user']).profile,
          trainerId: (user as UserWithSession['user']).trainerId,
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
