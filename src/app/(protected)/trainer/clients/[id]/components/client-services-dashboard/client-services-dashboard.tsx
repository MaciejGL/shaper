'use client'

import { History, Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { OfferHistory } from '../client-services/offer-history'
import { SendOfferForm } from '../client-services/send-offer-form'
import { ClientSubscriptionManagement } from '../client-subscription-management/client-subscription-management'

import { ClientStats } from './client-stats'
import { DeliveriesSection } from './deliveries-section'

interface ClientServicesDashboardProps {
  clientId: string
  clientName: string
  clientEmail: string
}

export function ClientServicesDashboard({
  clientId,
  clientName,
  clientEmail,
}: ClientServicesDashboardProps) {
  const { user } = useUser()
  const [sheetView, setSheetView] = useState<'send-offer' | 'history' | null>(
    null,
  )

  const { data: subscriptionData } = useCurrentSubscription(clientId, {
    lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  })

  const hasCoachingSubscription =
    subscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_COACHING &&
    (subscriptionData?.status === 'ACTIVE' ||
      subscriptionData?.status === 'CANCELLED_ACTIVE')

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Deliveries & Tasks */}
        <div className="space-y-4">
          <DeliveriesSection clientId={clientId} trainerId={user.id} />
        </div>

        {/* Right: Quick Actions & Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start"
                iconStart={<Send className="size-4" />}
                onClick={() => setSheetView('send-offer')}
              >
                Send New Offer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                iconStart={<History className="size-4" />}
                onClick={() => setSheetView('history')}
              >
                View Offer History
              </Button>
            </CardContent>
          </Card>

          <ClientStats clientId={clientId} trainerId={user.id} />

          <ClientSubscriptionManagement clientId={clientId} />
        </div>
      </div>

      {/* Sheet for Send Offer / History */}
      <Sheet open={sheetView !== null} onOpenChange={() => setSheetView(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetView === 'send-offer' ? 'Send Offer' : 'Offer History'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 px-4">
            {sheetView === 'send-offer' && (
              <SendOfferForm
                trainerId={user.id}
                clientId={clientId}
                clientEmail={clientEmail}
                clientName={clientName}
                hasCoachingSubscription={hasCoachingSubscription}
                onSuccess={() => setSheetView('history')}
              />
            )}
            {sheetView === 'history' && (
              <OfferHistory clientId={clientId} trainerId={user.id} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
