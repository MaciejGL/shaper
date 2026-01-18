import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/getUser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN_TTL_SECONDS = 120 // 2 minutes (gives more buffer for clock skew)
const CLOCK_SKEW_BUFFER_SECONDS = 30 // Backdate iat to handle clock differences

export async function GET() {
  const user = await getCurrentUser()
  const userId = user?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'SUPABASE_JWT_SECRET is not configured' },
      { status: 500 },
    )
  }

  // Backdate iat slightly to handle clock skew between our server and Supabase
  const now = Math.floor(Date.now() / 1000)
  const iat = now - CLOCK_SKEW_BUFFER_SECONDS
  const exp = now + TOKEN_TTL_SECONDS

  const token = jwt.sign(
    {
      sub: userId,
      role: 'authenticated',
      aud: 'authenticated',
      iat,
      exp,
    },
    secret,
    {
      algorithm: 'HS256',
    },
  )

  return NextResponse.json({
    token,
    expiresIn: TOKEN_TTL_SECONDS,
  })
}
