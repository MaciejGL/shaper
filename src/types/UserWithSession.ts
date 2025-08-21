import { Session } from 'next-auth'

import { User as PrismaUser } from '@/generated/prisma/client'
import { UserSession as PrismaUserSession } from '@/generated/prisma/client'
import { UserProfile as PrismaUserProfile } from '@/generated/prisma/client'

export type UserWithSession = {
  user: User
  session: Session
}

type User = PrismaUser & {
  profile?: PrismaUserProfile | null
  trainer?: PrismaUser | null
  clients?: PrismaUser[] | null
  sessions?: PrismaUserSession[] | null
}

export enum UserRole {
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER',
  ADMIN = 'ADMIN',
}
