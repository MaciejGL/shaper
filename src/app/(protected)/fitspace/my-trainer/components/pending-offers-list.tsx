'use client'

import { useQueryClient } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import { Package } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
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
  useRejectTrainerOfferMutation,
} from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'

import { DeclineOfferModal } from './decline-offer-modal'

interface PendingOffersListProps {
  trainerId: string
}

export function PendingOffersList({ trainerId }: PendingOffersListProps) {
  const { user } = useUser()
  const { openUrl } = useOpenUrl()
  const queryClient = useQueryClient()
  const [declineModalOpen, setDeclineModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<{
    id: string
    name: string
  } | null>(null)

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

  const { mutateAsync: rejectOffer } = useRejectTrainerOfferMutation()

  const pendingOffers = data?.getClientTrainerOffers || []

  const handleOpenOffer = (offerToken: string) => {
    openUrl(`/offer/${offerToken}`)
  }

  const handleDeclineOffer = (offerId: string, packageName: string) => {
    setSelectedOffer({ id: offerId, name: packageName })
    setDeclineModalOpen(true)
  }

  const handleConfirmDecline = async (reason: string) => {
    if (!selectedOffer) return

    await rejectOffer({
      offerId: selectedOffer.id,
      reason: reason || null,
    })

    await queryClient.invalidateQueries({
      queryKey: useFitGetMyTrainerOffersQuery.getKey({
        clientEmail: user?.email || '',
        trainerId,
      }),
    })
  }

  if (isLoading) {
    return <LoadingSkeleton count={1} variant="md" />
  }

  if (pendingOffers.length === 0) {
    return null
  }

  return (
    <>
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
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button
                  variant="tertiary"
                  onClick={() => handleDeclineOffer(offer.id, packageName)}
                >
                  Decline Offer
                </Button>
                <Button onClick={() => handleOpenOffer(offer.token)}>
                  View Offer
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <DeclineOfferModal
        isOpen={declineModalOpen}
        onClose={() => {
          setDeclineModalOpen(false)
          setSelectedOffer(null)
        }}
        onConfirm={handleConfirmDecline}
        packageName={selectedOffer?.name || ''}
      />
    </>
  )
}
