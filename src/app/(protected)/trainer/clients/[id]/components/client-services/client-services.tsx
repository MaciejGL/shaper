'use client'

import {
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  Send,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Loader } from '@/components/loader'
// Badge is imported in offer-card.tsx
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { SimplifiedOfferCard } from './offer-card-simplified'
import { OfferHistory } from './offer-history'
import { SendOfferForm } from './send-offer-form'

interface ClientServicesProps {
  clientId: string
  clientName: string
  clientEmail: string
}

export function ClientServices({
  clientId,
  clientName,
  clientEmail,
}: ClientServicesProps) {
  const { user } = useUser()
  const [activeView, setActiveView] = useState<
    'overview' | 'send-offer' | 'history'
  >('overview')

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center">
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'tertiary'}
            onClick={() => setActiveView('overview')}
            iconStart={<Package />}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'send-offer' ? 'default' : 'tertiary'}
            onClick={() => setActiveView('send-offer')}
            iconStart={<Send />}
          >
            Send Offer
          </Button>
          <Button
            variant={activeView === 'history' ? 'default' : 'tertiary'}
            onClick={() => setActiveView('history')}
            iconStart={<Clock />}
          >
            History
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {activeView === 'overview' && (
        <ClientServicesOverview
          clientId={clientId}
          clientName={clientName}
          trainerId={user.id}
          onSendOffer={() => setActiveView('send-offer')}
        />
      )}

      {activeView === 'send-offer' && (
        <SendOfferForm
          trainerId={user.id}
          clientEmail={clientEmail}
          clientName={clientName}
          onSuccess={() => setActiveView('history')}
        />
      )}

      {activeView === 'history' && (
        <OfferHistory clientId={clientId} trainerId={user.id} />
      )}
    </div>
  )
}

interface ClientServicesOverviewProps {
  clientId: string
  clientName: string
  trainerId: string
  onSendOffer: () => void
}

interface ClientStats {
  totalSpent: number
  totalCommission: number
  activeOffers: number
  completedPurchases: number
}

interface RecentActivity {
  id: string
  type: string
  item: string
  amount: number
  status: string
  date: string
}

// Simplified offer interface to match new API response
interface SimplifiedClientOffer {
  id: string
  token: string
  status: string
  personalMessage?: string
  clientEmail: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  completedAt?: string
  // Package info from simplified packageSummary JSON
  packageSummary?:
    | {
        packageId: string
        quantity: number
        name: string
      }[]
    | null
  // Payment data comes from Stripe if completed
  stripePaymentIntentId?: string | null
  actualPaymentData?: {
    amount: number
    currency: string
    description?: string
  } | null
  paymentDataSource: 'stripe_payment' | 'pending'
}

function ClientServicesOverview({
  clientId,
  clientName,
  trainerId,
  onSendOffer,
}: ClientServicesOverviewProps) {
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [offers, setOffers] = useState<SimplifiedClientOffer[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/trainer/client-stats?clientId=${clientId}&trainerId=${trainerId}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch client statistics')
      }

      const data = await response.json()
      setStats(data.stats)
      setOffers(data.offers || [])
      setRecentActivity(data.recentActivity)
    } catch (err) {
      console.error('Error fetching client stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [clientId, trainerId])

  useEffect(() => {
    fetchClientStats()
  }, [fetchClientStats])

  const formatRelativeDate = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
        <span className="ml-3 text-gray-600">Loading client data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Data
            </h4>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchClientStats} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-full">
            <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {stats?.completedPurchases || 0} purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Commission
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-full">
            <div className="text-2xl font-bold">
              ${stats?.totalCommission || 0}
            </div>
            <p className="text-xs text-muted-foreground">90% revenue share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-full">
            <div className="text-2xl font-bold">{stats?.activeOffers || 0}</div>
            <p className="text-xs text-muted-foreground">Pending response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-full">
            <div className="text-2xl font-bold">
              {stats?.completedPurchases || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Offers & Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Offers</CardTitle>
          <CardDescription>
            Complete offers with pricing details for {clientName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {offers.length === 0 ? (
              <div className="text-center flex-center flex-col gap-4">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Offers Yet</h4>
                <p className="text-gray-600 mb-4">
                  No offers or purchases found for {clientName}.
                </p>
                <Button onClick={onSendOffer} size="sm" iconStart={<Send />}>
                  Send First Offer
                </Button>
              </div>
            ) : (
              offers.map((offer) => (
                <SimplifiedOfferCard
                  key={offer.id}
                  offer={offer}
                  formatRelativeDate={formatRelativeDate}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
