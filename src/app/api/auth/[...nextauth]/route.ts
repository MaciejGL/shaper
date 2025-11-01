import NextAuth from 'next-auth'

import { authOptions } from '@/lib/auth/config'

// Log NextAuth initialization
console.warn('🔐 [NEXTAUTH] Initializing with env check:', {
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
  googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
  nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
  nodeEnv: process.env.NODE_ENV,
})

const handler = NextAuth(authOptions)

export const runtime = 'nodejs'

export { handler as GET, handler as POST }
