import { NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { stripe } from '@/lib/stripe/stripe'
import { PackageSummary } from '@/types/trainer-offer'

// GET /api/trainer-packages - Fetch trainer service packages for trainer offers
// Only includes trainer_service and trainer_coaching packages
// Excludes platform_premium subscriptions (those are for direct platform access)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Fetch active package templates that can be offered by trainers
    // Only include trainer-specific services, exclude platform premium subscriptions
    const packageTemplates = await prisma.packageTemplate.findMany({
      where: {
        isActive: true,
        stripeLookupKey: { not: null }, // Must have Stripe integration
        OR: [
          {
            metadata: {
              path: ['category'],
              equals: 'trainer_service',
            },
          }, // One-time trainer service packages (meal plans, workout plans)
          {
            metadata: {
              path: ['category'],
              equals: 'trainer_coaching',
            },
          }, // Recurring trainer coaching packages
        ],
        // Explicitly exclude platform premium subscriptions
        NOT: {
          metadata: {
            path: ['category'],
            equals: 'platform_premium',
          },
        },
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    })

    // Fetch pricing information from Stripe for each package
    const packagesWithPricing = await Promise.all(
      packageTemplates.map(async (template) => {
        let pricing = null

        if (template.stripeLookupKey) {
          try {
            const prices = await stripe.prices.list({
              lookup_keys: [template.stripeLookupKey],
              limit: 1,
            })
            const price = prices.data[0]

            if (!price) {
              throw new Error(
                `No price found for lookup key: ${template.stripeLookupKey}`,
              )
            }

            // For multi-currency prices, we'll show the primary currency
            pricing = {
              amount: price.unit_amount || 0,
              currency: price.currency.toUpperCase(),
              type: price.type === 'recurring' ? 'subscription' : 'one-time',
              recurring: price.recurring
                ? {
                    interval: price.recurring.interval,
                    interval_count: price.recurring.interval_count,
                  }
                : null,
            }
          } catch (error) {
            console.warn(
              `Failed to fetch pricing for ${template.stripeLookupKey}:`,
              error,
            )
          }
        }

        // Determine service category from metadata
        const metadata = (template.metadata as Record<string, unknown>) || {}
        const serviceCategory = (metadata.category as string) || 'general'
        const serviceType = (metadata.service_type as string) || null
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          stripeLookupKey: template.stripeLookupKey,
          pricing,
          serviceCategory,
          serviceType,
          isActive: template.isActive,
          createdAt: template.createdAt,
          duration: template.duration,
          packageSummary: template.metadata as unknown as PackageSummary,
          trainerId: template.trainerId,
          trainer: template.trainer,
        }
      }),
    )

    // Filter out packages without valid pricing
    const validPackages = packagesWithPricing.filter(
      (pkg) => pkg.pricing !== null,
    )

    // Group packages by category for better organization
    const categorizedPackages = {
      trainer_services: validPackages.filter(
        (pkg) => pkg.serviceCategory === 'trainer_service',
      ),
      trainer_coaching: validPackages.filter(
        (pkg) => pkg.serviceCategory === 'trainer_coaching',
      ),
      general: validPackages.filter(
        (pkg) =>
          !['trainer_service', 'trainer_coaching'].includes(
            pkg.serviceCategory,
          ),
      ),
    }

    return NextResponse.json({
      packages: validPackages,
      categorized: categorizedPackages,
      count: validPackages.length,
      categories: {
        trainer_services: categorizedPackages.trainer_services.length,
        trainer_coaching: categorizedPackages.trainer_coaching.length,
        general: categorizedPackages.general.length,
      },
    })
  } catch (error) {
    console.error('Error fetching trainer packages:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch trainer packages' },
      { status: 500 },
    )
  }
}
