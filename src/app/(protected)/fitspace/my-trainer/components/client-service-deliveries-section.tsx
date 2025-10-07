'use client'

import { formatDate } from 'date-fns'
import { Package } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { useMobileApp } from '@/components/mobile-app-bridge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { useUser } from '@/context/user-context'
import {
  GQLFitGetMyTrainerOffersQuery,
  GQLServiceType,
  GQLTrainerOfferStatus,
  useFitGetMyTrainerOffersQuery,
} from '@/generated/graphql-client'

interface ClientServiceDeliveriesSectionProps {
  trainerId: string
}

export function ClientServiceDeliveriesSection({
  trainerId,
}: ClientServiceDeliveriesSectionProps) {
  const { user } = useUser()

  // Query for pending AND processing offers (need payment or in checkout)
  const { data: pendingData, isLoading: pendingLoading } =
    useFitGetMyTrainerOffersQuery(
      {
        clientEmail: user?.email || '',
        trainerId,
        status: [
          GQLTrainerOfferStatus.Pending,
          GQLTrainerOfferStatus.Processing,
        ],
      },
      {
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true, // Refetch when window regains focus
        placeholderData: (previousData) => previousData, // Maintain data during session transitions
      },
    )

  // Query for paid offers
  const { data: paidData, isLoading: paidLoading } =
    useFitGetMyTrainerOffersQuery(
      {
        clientEmail: user?.email || '',
        trainerId,
        status: [GQLTrainerOfferStatus.Paid],
      },
      {
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true, // Refetch when window regains focus
        placeholderData: (previousData) => previousData, // Maintain data during session transitions
      },
    )

  console.info('[ClientServiceDeliveriesSection] paidData', paidData)
  console.info('[ClientServiceDeliveriesSection] pendingData', pendingData)

  const pendingOffers = pendingData?.getClientTrainerOffers || []
  const paidOffers = paidData?.getClientTrainerOffers || []

  const isLoading = pendingLoading || paidLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card borderless>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SectionIcon icon={Package} size="xs" variant="green" />
              Loading...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LoadingSkeleton count={3} withBorder />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pending Offers Section */}
      {pendingOffers.length > 0 && <PendingOffersCard offers={pendingOffers} />}

      {/* Paid Offers Section */}
      {paidOffers.length > 0 ? (
        <Card borderless>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SectionIcon icon={Package} size="xs" variant="green" />
              Purchased Training Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              className="w-full flex flex-col gap-2"
            >
              {paidOffers.map((offer) => (
                <TrainerOfferItem key={offer.id} offer={offer} />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        pendingOffers.length === 0 && (
          <Card borderless>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SectionIcon icon={Package} size="xs" variant="green" />
                No services purchased yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No training packages purchased yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

interface PendingOffersCardProps {
  offers: GQLFitGetMyTrainerOffersQuery['getClientTrainerOffers']
}

function PendingOffersCard({ offers }: PendingOffersCardProps) {
  const { isNativeApp } = useMobileApp()

  const handleOpenOffer = async (offerUrl: string) => {
    let finalOfferUrl = offerUrl

    // If in native app, fetch session token and append to URL
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
        // Continue without token - user may need to login
      }

      // Force external browser opening for native app
      const opened = window.open(
        finalOfferUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )

      if (!opened) {
        // Fallback: create link element
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

  return (
    <Card borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon icon={Package} size="xs" variant="orange" />
          New Offers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full flex flex-col gap-2"
        >
          {offers.map((offer) => {
            const packageName =
              offer.packageSummary.length === 1
                ? offer.packageSummary[0].name
                : 'Training Package'

            return (
              <AccordionItem
                key={offer.id}
                value={offer.id}
                className="bg-card-on-card px-4 rounded-md border-none"
              >
                <AccordionTrigger className="hover:no-underline flex justify-between items-center">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <h3 className="font-medium text-base">
                          {packageName.replaceAll('[TEST]', ' ')}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Badge variant="primary" className="mr-2">
                            Pending Payment
                          </Badge>
                          Created{' '}
                          <span className="font-medium">
                            {formatDate(
                              new Date(offer.createdAt),
                              'd. MMM yyyy',
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        What's included in this package:
                      </h4>

                      {offer.packageSummary.map((item) => {
                        const showQuantity = item.quantity > 1
                        return (
                          <div key={item.packageId} className="mb-2">
                            <h5 className="font-medium text-sm">
                              {item.name.replaceAll('[TEST]', ' ')}
                              {showQuantity && (
                                <span className="text-muted-foreground font-normal">
                                  {' '}
                                  (×{item.quantity})
                                </span>
                              )}
                            </h5>
                          </div>
                        )
                      })}
                    </div>

                    {offer.personalMessage && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground font-medium mb-1">
                          Message from your trainer:
                        </p>
                        <p className="text-sm italic">
                          "{offer.personalMessage}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={() => handleOpenOffer(`/offer/${offer.token}`)}
                        className="w-full"
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

interface TrainerOfferItemProps {
  offer: GQLFitGetMyTrainerOffersQuery['getClientTrainerOffers'][number]
}

function TrainerOfferItem({ offer }: TrainerOfferItemProps) {
  // Get the package name from packageSummary or use a default
  const packageName =
    offer.packageSummary.length === 1
      ? offer.packageSummary[0].name
      : 'Training Package'

  // Group service deliveries by type and sum quantities
  type GroupedDelivery = {
    serviceType: GQLServiceType
    packageName: string
    quantity: number
  }

  const groupedDeliveries = offer.serviceDeliveries.reduce(
    (acc, delivery) => {
      const serviceType = delivery.serviceType as GQLServiceType
      if (acc[serviceType]) {
        // If we already have this service type, sum the quantities
        acc[serviceType] = {
          ...acc[serviceType],
          quantity: acc[serviceType].quantity + delivery.quantity,
        }
      } else {
        // First time seeing this service type
        acc[serviceType] = {
          serviceType,
          packageName: delivery.packageName,
          quantity: delivery.quantity,
        }
      }
      return acc
    },
    {} as Record<GQLServiceType, GroupedDelivery>,
  )

  const totalQuantity = Object.values(groupedDeliveries).reduce(
    (acc, delivery) => acc + delivery.quantity,
    0,
  )

  return (
    <AccordionItem
      value={offer.id}
      className="bg-card-on-card px-4 rounded-md border-none"
    >
      <AccordionTrigger className="hover:no-underline flex justify-between items-center">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h3 className="font-medium text-base">
                {packageName.replaceAll('[TEST]', ' ')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                <Badge variant="secondary" className="mr-2">
                  {totalQuantity} item{totalQuantity > 1 ? 's' : ''}
                </Badge>
                Purchased{' '}
                <span className="font-medium">
                  {formatDate(new Date(offer.createdAt), 'd. MMM yyyy')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-4 pb-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">
              What's included in this package:
            </h4>

            {Object.values(groupedDeliveries).map((delivery) => {
              const showQuantity = delivery.quantity > 1
              return (
                <div key={delivery.serviceType} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-sm">
                      {delivery.packageName.replaceAll('[TEST]', ' ')}
                      {showQuantity && (
                        <span className="text-muted-foreground font-normal">
                          {' '}
                          (×{delivery.quantity})
                        </span>
                      )}
                    </h5>
                  </div>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {SERVICE_PLANS_INCLUDE[
                      delivery.serviceType as GQLServiceType
                    ].items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {offer.personalMessage && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground font-medium mb-1">
                Message from your trainer:
              </p>
              <p className="text-sm italic">"{offer.personalMessage}"</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

const SERVICE_PLANS_INCLUDE: Record<
  GQLServiceType,
  {
    title: string
    items: string[]
  }
> = {
  [GQLServiceType.CoachingComplete]: {
    title: 'Complete Coaching Program',
    items: [
      'Training Plan',
      'Nutrition Plan',
      'Bi-weekly Check-ins in-person or digitally',
      'Premium Platform Access',
      '1x Training session together with your trainer',
      '50% off for additional in-person training',
    ],
  },
  [GQLServiceType.InPersonMeeting]: {
    title: 'In-Person Training',
    items: ['Training session together with your trainer'],
  },
  [GQLServiceType.MealPlan]: {
    title: 'Nutrition Plan',
    items: ['Personalised Nutrition Plan with recipes'],
  },
  [GQLServiceType.WorkoutPlan]: {
    title: 'Training Plan',
    items: ['Personalised Training Plan'],
  },
  [GQLServiceType.PremiumAccess]: {
    title: 'Premium Platform Access',
    items: ['Premium Platform Access'],
  },
}
