import NextAuth from 'next-auth'

import { authOptions } from '@/lib/auth/config'

const handler = NextAuth(authOptions)

// Force dynamic rendering - OAuth must never be cached
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export { handler as GET, handler as POST }
