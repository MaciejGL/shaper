import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// GET /api/admin/package-templates - Fetch all package templates from database
export async function GET() {
  try {
    // Check admin authorization
    if (!(await isAdminUser())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all package templates with subscription counts
    const packageTemplates = await prisma.packageTemplate.findMany({
      include: {
        services: true,
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            subscriptions: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    })

    const templatesWithStats = packageTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      duration: template.duration,
      isActive: template.isActive,
      stripeProductId: template.stripeProductId,
      stripePriceId: template.stripePriceId,
      trainerId: template.trainerId,
      trainer: template.trainer,
      services: template.services,
      activeSubscriptions: template._count.subscriptions,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }))

    return NextResponse.json({
      packageTemplates: templatesWithStats,
      count: templatesWithStats.length,
      activeCount: templatesWithStats.filter((t) => t.isActive).length,
      stripeLinkedCount: templatesWithStats.filter((t) => t.stripeProductId)
        .length,
    })
  } catch (error) {
    console.error('Error fetching package templates:', error)

    return NextResponse.json(
      { error: 'Failed to fetch package templates' },
      { status: 500 },
    )
  }
}
