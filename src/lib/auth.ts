import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'

import { createLoaders } from './loaders/get-user.loader'

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: { email: {}, otp: {} },
      async authorize(credentials) {
        const { email, otp } = credentials ?? {}
        if (!email || !otp) return null
        const loaders = createLoaders()
        const user = await loaders.authSession.load(email)

        if (!user || user.sessions.length === 0) return null

        await prisma.userSession.delete({ where: { id: user.sessions[0].id } })

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
          const loaders = createLoaders()
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
    signIn: '/fitspace/dashboard',
    signOut: '/login',
  },
} satisfies NextAuthOptions
