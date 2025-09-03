import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes
const SUPPORT_ACCOUNT_ID = '17ea53fe-036c-4b89-997f-a631a92657c0'

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

    // Create support chat with welcome message for new user (skip for support account itself)
    if (user.id !== SUPPORT_ACCOUNT_ID) {
      try {
        const chat = await prisma.chat.upsert({
          where: {
            trainerId_clientId: {
              trainerId: SUPPORT_ACCOUNT_ID,
              clientId: user.id,
            },
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            trainerId: SUPPORT_ACCOUNT_ID, // Support account is trainer
            clientId: user.id, // New user is client
          },
        })

        // Check if this chat needs a welcome message (for newly created chats)
        const existingMessages = await prisma.message.count({
          where: { chatId: chat.id },
        })

        if (existingMessages === 0) {
          await prisma.message.create({
            data: {
              chatId: chat.id,
              senderId: SUPPORT_ACCOUNT_ID,
              content: `Welcome to Hypertro! 👋

I'm here to help you with any questions about your fitness journey. Whether you need help with:

• Setting up your profile and goals
• Understanding workout plans and exercises  
• Tracking your progress
• Connecting with trainers
• Technical support

Just send me a message anytime. I'm here to make sure you get the most out of your Hypertro experience!`,
            },
          })
        }
      } catch (error) {
        // Log error but don't fail user creation if chat creation fails
        console.error('Failed to create support chat for new user:', error)
      }
    }
  }

  await prisma.userSession.create({
    data: { userId: user.id, otp, expiresAt },
  })

  // Only send email for non-demo accounts
  if (!isDemoAccount) {
    await sendEmail.otp(email, {
      otp,
      userName: user.profile?.firstName || user.profile?.lastName,
    })
  }

  return NextResponse.json({
    success: true,
    // Include OTP in response for demo accounts (development only)
    ...(isDemoAccount &&
      process.env.NODE_ENV !== 'production' && { demoOtp: otp }),
  })
}
