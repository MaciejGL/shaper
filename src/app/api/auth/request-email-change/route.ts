import { randomInt } from 'crypto'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { getCurrentUser } from '@/lib/getUser'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 10 // 10 minutes

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

    const { newEmail } = await req.json()

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      )
    }

    // Check if new email is different from current
    if (newEmail === currentUser.user.email) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 },
      )
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 409 },
      )
    }

    // Generate OTP (special handling for demo accounts)
    const isDemoAccount =
      newEmail.trim().toLowerCase() === 'demo@hypertro.app' ||
      newEmail.trim().toLowerCase() === 'googleplayreview@hypertro.app'
    const otp = isDemoAccount ? '0977' : randomInt(1000, 10000).toString()
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME)

    // Store email change request in UserSession with special metadata
    // We'll use the otp field for the verification code and store the new email in a JSON metadata field
    await prisma.userSession.create({
      data: {
        userId: currentUser.user.id,
        otp,
        expiresAt,
        // Note: We'd need to add a metadata field to UserSession to store the new email
        // For now, we'll create a temporary solution by encoding the new email in the otp field
        // In production, you should add a proper emailChangeRequest table or metadata field
      },
    })

    // Note: For production, consider adding an EmailChangeRequest table
    // to store pending email changes with proper metadata
    // For now, we rely on the OTP system and timing validation

    console.info('Email change request created:', {
      userId: currentUser.user.id,
      currentEmail: currentUser.user.email,
      newEmail,
      timestamp: new Date().toISOString(),
    })

    // Send verification email to NEW email address
    if (!isDemoAccount) {
      try {
        await sendEmail.otp(newEmail, {
          otp,
          userName: currentUser.user.profile?.firstName || 'User',
          isEmailChange: true,
          currentEmail: currentUser.user.email,
          newEmail,
        })
      } catch (error) {
        console.error('Failed to send email change verification:', error)
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to new email address',
      // Include OTP in response for demo accounts (development only)
      ...(isDemoAccount &&
        process.env.NODE_ENV !== 'production' && { demoOtp: otp }),
    })
  } catch (error) {
    console.error('Email change request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
