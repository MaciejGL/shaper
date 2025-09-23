import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { invalidateUserCache } from '@/lib/getUser'
import { getCurrentUser } from '@/lib/getUser'

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { newEmail, otp } = await req.json()

    if (!newEmail || !otp) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 },
      )
    }

    // Validate OTP format
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 },
      )
    }

    // Find valid session with matching OTP
    const session = await prisma.userSession.findFirst({
      where: {
        userId: currentUser.user.id,
        otp,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: 'desc', // Get most recent session
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 },
      )
    }

    // Verify email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser && existingUser.id !== currentUser.user.id) {
      return NextResponse.json(
        { error: 'Email address is no longer available' },
        { status: 409 },
      )
    }

    // Update user's email address
    await prisma.user.update({
      where: { id: currentUser.user.id },
      data: { email: newEmail },
    })

    // Clean up used session
    await prisma.userSession.delete({
      where: { id: session.id },
    })

    // Invalidate ALL user sessions for security (forces logout)
    await prisma.userSession.deleteMany({
      where: { userId: currentUser.user.id },
    })

    // Invalidate user cache for both old and new email
    await invalidateUserCache(currentUser.user.email)
    await invalidateUserCache(newEmail)

    console.info('Email change completed successfully:', {
      userId: currentUser.user.id,
      oldEmail: currentUser.user.email,
      newEmail,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully',
      forceLogout: true, // Signal to client to immediately log out
    })
  } catch (error) {
    console.error('Email change verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
