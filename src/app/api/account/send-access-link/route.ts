import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/_db'
import { sendEmail } from '@/lib/email/send-mail'
import { getCurrentUser } from '@/lib/getUser'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = currentUser
    const body = await request.json()
    const { type } = body as { type: 'access' | 'premium' }

    const userName = user.profile?.firstName || user.name?.split(' ')[0] || null

    if (type === 'premium') {
      // Send premium access email with upgrade link
      await sendEmail.premiumAccess(user.email, {
        userId: user.id,
        userName,
      })
    } else {
      // Send account access link email
      // Check if user has active subscription for appropriate messaging
      const activeSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: {
            in: ['ACTIVE', 'CANCELLED_ACTIVE'],
          },
        },
      })

      await sendEmail.accessLink(user.email, {
        userId: user.id,
        userName,
        isSubscriber: !!activeSubscription,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send access link email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
