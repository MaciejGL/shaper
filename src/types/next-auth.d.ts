import { DefaultSession } from 'next-auth'

import { User as PrismaUser } from '@/generated/prisma/client'
import { UserProfile as PrismaUserProfile } from '@/generated/prisma/client'

/**
 * Module augmentation for NextAuth types
 * Extends the default Session and JWT types with our custom user fields
 */
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
      profile?: PrismaUserProfile | null
      trainerId?: string | null
    } & DefaultSession['user']
  }

  interface User extends PrismaUser {
    profile?: PrismaUserProfile | null
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user?: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
      profile?: PrismaUserProfile | null
      trainerId?: string | null
    }
  }
}
