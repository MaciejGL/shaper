'use client'

import { formatDate } from 'date-fns'
import { Package } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { data, isLoading } = useFitGetMyTrainerOffersQuery(
    {
      clientEmail: user?.email || '',
      trainerId,
      status: GQLTrainerOfferStatus.Paid,
    },
    {
      enabled: !!user?.email,
    },
  )

  const trainerOffers = data?.getClientTrainerOffers || []

  if (isLoading) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchased Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton count={3} withBorder />
        </CardContent>
      </Card>
    )
  }

  if (trainerOffers.length === 0) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            No services purchased yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No training packages purchased yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Purchased Training Packages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {trainerOffers.map((offer) => (
            <TrainerOfferItem key={offer.id} offer={offer} />
          ))}
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
  return (
    <AccordionItem
      value={offer.id}
      className="not-last:border-b bg-card-on-card px-4 rounded-md"
    >
      <AccordionTrigger className="hover:no-underline flex justify-between items-center">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h3 className="font-medium text-base">
                {packageName.replaceAll('[TEST]', ' ')}
              </h3>
              <p className="text-xs text-muted-foreground">
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
