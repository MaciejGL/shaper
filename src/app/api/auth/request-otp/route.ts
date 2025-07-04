import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes

export async function POST(req: Request) {
  const { email } = await req.json()
  const otp = randomInt(1000, 10000).toString()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME)

  let user = await prisma.user.findUnique({
    where: { email },
    include: { profile: { select: { firstName: true, lastName: true } } },
  })
  if (!user) {
    user = await prisma.user.create({
      data: { email, profile: { create: { firstName: '', lastName: '' } } },
      include: { profile: { select: { firstName: true, lastName: true } } },
    })
  }

  await prisma.userSession.create({
    data: { userId: user.id, otp, expiresAt },
  })

  await sendEmail.otp(email, {
    otp,
    userName: user.profile?.firstName || user.profile?.lastName,
  })

  return NextResponse.json({ success: true })
}
