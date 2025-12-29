import { NextRequest, NextResponse } from 'next/server'

import { ImageHandler } from '@/lib/aws/image-handler'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

interface DeleteCertificateRequest {
  url: string
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const body: DeleteCertificateRequest = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // Get user's profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.user.id },
      select: { id: true, credentials: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify user owns this certificate URL
    if (!profile.credentials.includes(url)) {
      return NextResponse.json(
        { error: 'Certificate not found in your profile' },
        { status: 404 },
      )
    }

    // Store original credentials for rollback
    const originalCredentials = [...profile.credentials]
    const updatedCredentials = profile.credentials.filter((c) => c !== url)

    // First update DB to remove the URL
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { credentials: updatedCredentials },
    })

    // Now delete from S3
    const deleteResult = await ImageHandler.delete({ images: url })

    if (!deleteResult.success) {
      // S3 deletion failed - rollback DB change
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { credentials: originalCredentials },
      })

      console.error('S3 deletion failed, rolled back DB:', deleteResult.error)
      return NextResponse.json(
        { error: 'Failed to delete certificate file. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 },
    )
  }
}
