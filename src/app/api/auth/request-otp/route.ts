import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes
const OTP = process.env.NEXT_PUBLIC_OTP

export async function POST(req: Request) {
  const { email } = await req.json()
  const otp = OTP || randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME)

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { email, profile: { create: { firstName: '', lastName: '' } } },
    })
  }

  await prisma.userSession.create({
    data: { userId: user.id, otp, expiresAt },
  })

  await sendEmail.otp(email, otp)

  return NextResponse.json({ success: true })
}
