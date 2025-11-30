import { Session } from 'next-auth'

import { User as PrismaUser } from '@/generated/prisma/client'
import { UserSession as PrismaUserSession } from '@/generated/prisma/client'
import { UserProfile as PrismaUserProfile } from '@/generated/prisma/client'

export type UserWithSession = {
  user: User
  session: Session
}

// Minimal user fields needed for context (optimized to skip large OAuth tokens)
export type UserBasicFields = {
  id: string
  email: string
  name: string | null
  role: string
  trainerId: string | null
  profile: {
    id: string
    firstName: string | null
    lastName: string | null
    weekStartsOn: number | null
  } | null
}

type User = UserBasicFields & {
  clients?: PrismaUser[] | null
  sessions?: PrismaUserSession[] | null
}

// Full user type when all fields are needed
export type UserFull = PrismaUser & {
  profile?: PrismaUserProfile | null
  trainerId?: string | null
  clients?: PrismaUser[] | null
  sessions?: PrismaUserSession[] | null
}

export enum UserRole {
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER',
  ADMIN = 'ADMIN',
}
