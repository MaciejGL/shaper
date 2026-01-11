import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { notifyAdminNewUser } from '@/lib/notifications/admin-notifications'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes

export async function POST(req: Request) {
  let email: string
  try {
    const body = await req.json()
    email = String(body?.email ?? '')
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Invalid JSON body')
    captureServerException(err, undefined, {
      route: '/api/auth/request-otp',
      reason: 'invalid_json',
    })
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  // Demo account gets fixed OTP, others get random
  const isDemoAccount =
    normalizedEmail === 'demo@hypertro.app' ||
    normalizedEmail === 'googleplayreview@hypertro.app'
  const otp = isDemoAccount ? '0977' : randomInt(1000, 10000).toString()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME)

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { profile: { select: { firstName: true, lastName: true } } },
  })

  let isNewUser = false
  try {
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          profile: {
            create: {
              firstName: isDemoAccount ? 'Demo' : '',
              lastName: isDemoAccount ? 'User' : '',
            },
          },
        },
        include: { profile: { select: { firstName: true, lastName: true } } },
      })
      isNewUser = true

      captureServerEvent({
        distinctId: user.id,
        event: ServerEvent.AUTH_SIGNUP_USER_CREATED,
        properties: { method: 'otp' },
      })
    }

    await prisma.userSession.create({
      data: { userId: user.id, otp, expiresAt },
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Database error')
    captureServerException(err, user?.id, {
      route: '/api/auth/request-otp',
      reason: 'db_error',
    })

    if (user?.id) {
      captureServerEvent({
        distinctId: user.id,
        event: ServerEvent.AUTH_OTP_REQUEST_ERROR,
        properties: {
          email_domain:
            normalizedEmail.split('@')[1]?.trim().toLowerCase() || null,
          reason: 'db_error',
        },
      })
    }

    return NextResponse.json({ success: false }, { status: 500 })
  }

  // Notify admin about new user registration
  if (isNewUser && !isDemoAccount) {
    notifyAdminNewUser({
      email: user.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
    }).catch((error) => {
      console.error('Failed to notify admin about new user:', error)
    })
  }

  // Only send email for non-demo accounts
  if (!isDemoAccount) {
    try {
      await sendEmail.otp(normalizedEmail, {
        otp,
        userName: user.profile?.firstName || user.profile?.lastName,
      })
    } catch (error) {
      console.error('Failed to send email:', error)
      captureServerEvent({
        distinctId: user.id,
        event: ServerEvent.AUTH_OTP_REQUEST_ERROR,
        properties: {
          email_domain:
            normalizedEmail.split('@')[1]?.trim().toLowerCase() || null,
          reason: 'email_send_failed',
        },
      })
    }
  }

  return NextResponse.json({
    success: true,
    // Include OTP in response for demo accounts (development only)
    ...(isDemoAccount &&
      process.env.NODE_ENV !== 'production' && { demoOtp: otp }),
  })
}
