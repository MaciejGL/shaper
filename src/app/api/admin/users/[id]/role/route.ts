import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// PUT /api/admin/users/[id]/role - Update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminUser = await requireAdminUser()
    const { newRole } = await request.json()
    const { id } = await params

    if (!newRole || !['CLIENT', 'TRAINER', 'ADMIN'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 },
      )
    }

    if (id === adminUser.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 },
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      include: {
        profile: true,
        trainer: {
          include: { profile: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
            clients: true,
          },
        },
      },
    })

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.sessions[0]?.createdAt?.toISOString() || null,
      sessionCount: user._count.sessions,
      profile: user.profile
        ? {
            id: user.profile.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phone: user.profile.phone,
            birthday: user.profile.birthday?.toISOString(),
            sex: user.profile.sex,
          }
        : null,
      trainer: user.trainer
        ? {
            id: user.trainer.id,
            email: user.trainer.email,
            firstName: user.trainer.profile?.firstName,
            lastName: user.trainer.profile?.lastName,
          }
        : null,
      clientCount: user._count.clients,
      isActive:
        user.sessions.length > 0 &&
        user.sessions[0].createdAt >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update user role',
      },
      { status: 500 },
    )
  }
}
