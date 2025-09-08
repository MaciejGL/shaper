import { CheckCircle, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { createDeepLink } from '@/lib/deep-links'

import { OfferPage } from './offer-page'

interface OfferPageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ client?: string }>
}

export default async function TrainerOfferPage({
  params,
  searchParams,
}: OfferPageProps) {
  const { token } = await params
  const awaitedSearchParams = await searchParams

  // Find the offer by token
  const offer = await prisma.trainerOffer.findUnique({
    where: { token },
    include: {
      trainer: {
        include: { profile: true },
      },
    },
  })

  if (!offer) {
    notFound()
  }

  // Check if offer is expired
  if (offer.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-hypertro mx-auto max-w-md">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card variant="secondary" className="w-full text-center">
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-destructive/10">
                    <Clock className="h-12 w-12 text-destructive" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Offer Expired
                  </h1>
                  <p className="text-muted-foreground">
                    This training offer has expired. Please contact your trainer
                    for a new offer.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Offers are valid for 24 hours from creation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Check if already completed
  if (offer.status === 'COMPLETED') {
    // ✅ Use bulletproof deep link utility with query parameters
    const appDeepLink = createDeepLink('offer/success', {
      token,
      trainer: offer.trainerId,
    })

    return (
      <div className="min-h-screen bg-background">
        <div className="container-hypertro mx-auto max-w-lg">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card variant="secondary" className="w-full text-center">
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-green-500/10">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Payment Complete!
                  </h1>
                  <p className="text-muted-foreground">
                    Your training package has been purchased successfully. Your
                    trainer will be in touch soon.
                  </p>
                </div>
                <Button asChild size="lg">
                  <a href={appDeepLink}>Return to App</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <OfferPage
      offer={offer}
      clientEmail={awaitedSearchParams.client || offer.clientEmail}
    />
  )
}
