'use client'

import { formatDate } from 'date-fns'
import { Package } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { useUser } from '@/context/user-context'
import {
  GQLTrainerOfferStatus,
  useFitGetMyTrainerOffersQuery,
} from '@/generated/graphql-client'

interface PendingOffersBannerProps {
  trainerId: string
}

export function PendingOffersBanner({ trainerId }: PendingOffersBannerProps) {
  const { user } = useUser()
  const { isNativeApp } = useMobileApp()

  const { data, isLoading } = useFitGetMyTrainerOffersQuery(
    {
      clientEmail: user?.email || '',
      trainerId,
      status: [GQLTrainerOfferStatus.Pending, GQLTrainerOfferStatus.Processing],
    },
    {
      enabled: !!user?.email,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
  )

  const pendingOffers = data?.getClientTrainerOffers || []

  const handleOpenOffer = async (offerToken: string) => {
    const offerUrl = `${window.location.origin}/offer/${offerToken}`
    let finalOfferUrl = offerUrl

    if (isNativeApp) {
      try {
        const response = await fetch('/api/auth/generate-session-token', {
          method: 'POST',
        })

        if (response.ok) {
          const { sessionToken } = await response.json()
          const separator = offerUrl.includes('?') ? '&' : '?'
          finalOfferUrl = `${offerUrl}${separator}session_token=${encodeURIComponent(sessionToken)}`
        }
      } catch (error) {
        console.error('Failed to generate session token:', error)
      }

      const opened = window.open(
        finalOfferUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )

      if (!opened) {
        const link = document.createElement('a')
        link.href = finalOfferUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer external'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      window.open(finalOfferUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton count={1} variant="md" />
  }

  if (pendingOffers.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {pendingOffers.map((offer) => {
        const packageName =
          offer.packageSummary.length === 1
            ? offer.packageSummary[0].name
            : 'Training Package'

        return (
          <Card key={offer.id} variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SectionIcon icon={Package} size="xs" variant="orange" />
                New Offer from Your Trainer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {packageName.replaceAll('[TEST]', ' ')}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="primary">Pending Payment</Badge>
                  <span className="text-xs text-muted-foreground">
                    Created{' '}
                    {formatDate(new Date(offer.createdAt), 'd. MMM yyyy')}
                  </span>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  What's included:
                </h4>
                <div className="space-y-2">
                  {offer.packageSummary.map((item) => {
                    const showQuantity = item.quantity > 1
                    return (
                      <div
                        key={item.packageId}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {item.name.replaceAll('[TEST]', ' ')}
                        </span>
                        {showQuantity && (
                          <Badge variant="secondary">x{item.quantity}</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {offer.personalMessage && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Message from your trainer:
                  </p>
                  <p className="text-sm italic">"{offer.personalMessage}"</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleOpenOffer(offer.token)}
                size="lg"
                className="w-full"
              >
                View Offer
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
