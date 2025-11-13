import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// DELETE /api/admin/users/[id]/sessions - Clear all user sessions
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminUser = await requireAdminUser()
    const { id } = await params

    if (id === adminUser.user.id) {
      return NextResponse.json(
        { error: 'Cannot clear your own sessions' },
        { status: 400 },
      )
    }

    await prisma.userSession.deleteMany({
      where: { userId: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing user sessions:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to clear sessions',
      },
      { status: 500 },
    )
  }
}

// POST /api/admin/users/[id]/sessions - Deactivate user (clear sessions)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminUser = await requireAdminUser()
    const { action } = await request.json()
    const { id } = await params

    if (id === adminUser.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account status' },
        { status: 400 },
      )
    }

    if (action === 'deactivate') {
      // Clear all sessions to effectively "deactivate" the user
      await prisma.userSession.deleteMany({
        where: { userId: id },
      })

      return NextResponse.json({
        success: true,
        message: 'User deactivated successfully',
      })
    } else if (action === 'activate') {
      // For now, activation just means the user can log in normally
      // In the future, we might add an "active" field to the User model
      return NextResponse.json({
        success: true,
        message: 'User activated successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "activate" or "deactivate"' },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('Error managing user sessions:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to manage user sessions',
      },
      { status: 500 },
    )
  }
}
