import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes

export async function POST(req: Request) {
  const { email } = await req.json()

  // Demo account gets fixed OTP, others get random
  const isDemoAccount =
    email === 'demo@hypertro.app' || email === 'googleplayreview@hypertro.app'
  const otp = isDemoAccount ? '0977' : randomInt(1000, 10000).toString()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME)

  let user = await prisma.user.findUnique({
    where: { email },
    include: { profile: { select: { firstName: true, lastName: true } } },
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        profile: {
          create: {
            firstName: isDemoAccount ? 'Demo' : '',
            lastName: isDemoAccount ? 'User' : '',
          },
        },
      },
      include: { profile: { select: { firstName: true, lastName: true } } },
    })
  }

  await prisma.userSession.create({
    data: { userId: user.id, otp, expiresAt },
  })

  // Only send email for non-demo accounts
  if (!isDemoAccount) {
    try {
      await sendEmail.otp(email, {
        otp,
        userName: user.profile?.firstName || user.profile?.lastName,
      })
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  return NextResponse.json({
    success: true,
    // Include OTP in response for demo accounts (development only)
    ...(isDemoAccount &&
      process.env.NODE_ENV !== 'production' && { demoOtp: otp }),
  })
}
